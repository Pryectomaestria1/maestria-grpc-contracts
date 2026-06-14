/**
 * scripts/check-proto.ts
 *
 * Reusable contract check: media.proto and the manual index.ts mirror
 * MUST agree on the public surface that media-service and api-gateway
 * consume.
 *
 * Exported entry point: runProtoContractCheck()
 *  - returns { ok: true } when the contract is in sync
 *  - throws an Error with a list of mismatches otherwise
 *
 * Used by:
 *  - test/check-proto.test.ts (under node:test)
 *  - CI workflow (.github/workflows/check-proto.yml) via `npm run check:proto`
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── proto types ───────────────────────────────────────────────────────────

type ProtoMessage = { name: string; fields: { type: string; name: string; number: number }[] };
type ProtoEnum = { name: string; values: { name: string; number: number }[] };
type ProtoRpc = { name: string; input: string; output: string };

function parseProtoRpcs(proto: string): { service: string; rpcs: ProtoRpc[] } {
  const serviceMatch = /service\s+(\w+)\s*\{([\s\S]*?)\}/.exec(proto);
  if (!serviceMatch) {
    throw new Error("No service found in proto");
  }
  const serviceName = serviceMatch[1];
  const body = serviceMatch[2];
  const rpcs: ProtoRpc[] = [];
  const rpcRegex = /rpc\s+(\w+)\s*\(\s*([\w.]+)\s*\)\s*returns\s*\(\s*([\w.]+)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = rpcRegex.exec(body)) !== null) {
    rpcs.push({ name: m[1], input: m[2], output: m[3] });
  }
  return { service: serviceName, rpcs };
}

function parseProtoEnums(proto: string): ProtoEnum[] {
  const enums: ProtoEnum[] = [];
  const enumRegex = /enum\s+(\w+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = enumRegex.exec(proto)) !== null) {
    const values: ProtoEnum["values"] = [];
    const valueRegex = /(\w+)\s*=\s*(\d+)/g;
    let v: RegExpExecArray | null;
    while ((v = valueRegex.exec(m[2])) !== null) {
      values.push({ name: v[1], number: Number(v[2]) });
    }
    enums.push({ name: m[1], values });
  }
  return enums;
}

function parseProtoMessages(proto: string): ProtoMessage[] {
  const messages: ProtoMessage[] = [];
  const messageRegex = /message\s+(\w+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = messageRegex.exec(proto)) !== null) {
    const fields: ProtoMessage["fields"] = [];
    const fieldRegex = /(\w+(?:\.\w+)?)\s+(\w+)\s*=\s*(\d+)/g;
    let f: RegExpExecArray | null;
    while ((f = fieldRegex.exec(m[2])) !== null) {
      fields.push({ type: f[1], name: f[2], number: Number(f[3]) });
    }
    messages.push({ name: m[1], fields });
  }
  return messages;
}

// ─── index.ts types ────────────────────────────────────────────────────────

type TsInterface = { name: string; fields: { name: string; type: string }[] };

function parseTsInterfaces(src: string): { interfaces: TsInterface[]; serviceMethodNames: string[] } {
  const interfaces: TsInterface[] = [];
  const ifaceRegex = /export\s+interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ifaceRegex.exec(src)) !== null) {
    const fields: TsInterface["fields"] = [];
    const body = m[2];
    const fieldRegex = /^\s*(\w+)\s*\??\s*:\s*([^;]+);/gm;
    let f: RegExpExecArray | null;
    while ((f = fieldRegex.exec(body)) !== null) {
      fields.push({ name: f[1], type: f[2].trim() });
    }
    const methodRegex = /^\s*(\w+)\s*\([^)]*\)\s*:/gm;
    let method: RegExpExecArray | null;
    while ((method = methodRegex.exec(body)) !== null) {
      if (!fields.find((x) => x.name === method![1])) {
        fields.push({ name: method[1], type: "method" });
      }
    }
    interfaces.push({ name: m[1], fields });
  }

  const serviceMethodNames: string[] = [];
  const svcIface = interfaces.find((i) => i.name === "MediaService");
  if (svcIface) {
    for (const f of svcIface.fields) {
      serviceMethodNames.push(f.name);
    }
  }
  return { interfaces, serviceMethodNames };
}

// ─── contract check ────────────────────────────────────────────────────────

export function runProtoContractCheck(): { ok: true } {
  const proto = readFileSync(resolve(ROOT, "media.proto"), "utf8");
  const indexTs = readFileSync(resolve(ROOT, "index.ts"), "utf8");

  const errors: string[] = [];
  const fail = (msg: string) => errors.push(msg);

  // 1. MediaService: must have ConfirmUpload, no dead ConfirmVideoUpload
  const { service, rpcs } = parseProtoRpcs(proto);
  if (service !== "MediaService") fail(`service name must be MediaService; got ${service}`);
  const rpcNames = rpcs.map((r) => r.name);
  if (!rpcNames.includes("GeneratePresignedUrl")) fail(`proto: GeneratePresignedUrl RPC missing; got ${rpcNames.join(", ")}`);
  if (!rpcNames.includes("ConfirmUpload")) fail(`proto: ConfirmUpload RPC missing; got ${rpcNames.join(", ")}`);
  if (rpcNames.includes("ConfirmVideoUpload")) fail(`proto: ConfirmVideoUpload is dead and must be removed; got ${rpcNames.join(", ")}`);

  // 2. FileType enum
  const enums = parseProtoEnums(proto);
  const fileType = enums.find((e) => e.name === "FileType");
  if (!fileType) {
    fail("proto: FileType enum must be defined");
  } else {
    const valueNames = fileType.values.map((v) => v.name);
    for (const expected of ["FILE_TYPE_UNSPECIFIED", "FILE_TYPE_COVER", "FILE_TYPE_VIDEO", "FILE_TYPE_RESOURCE"]) {
      if (!valueNames.includes(expected)) fail(`proto: FileType.${expected} missing; got ${valueNames.join(", ")}`);
    }
    const unspecified = fileType.values.find((v) => v.name === "FILE_TYPE_UNSPECIFIED");
    if (unspecified?.number !== 0) fail(`proto: FILE_TYPE_UNSPECIFIED must be 0; got ${unspecified?.number}`);
  }

  // 3. The four D2 messages + field shapes
  const messages = parseProtoMessages(proto);
  const byName = new Map(messages.map((m) => [m.name, m]));
  for (const name of ["PresignedUrlRequest", "PresignedUrlResponse", "ConfirmUploadRequest", "ConfirmUploadResponse"]) {
    if (!byName.has(name)) fail(`proto: ${name} must be defined`);
  }
  const expectFields: Record<string, string[]> = {
    PresignedUrlRequest: ["file_type", "owner_id", "size_bytes", "content_type"],
    PresignedUrlResponse: ["url", "key", "expires_at"],
    ConfirmUploadRequest: ["key", "owner_id", "file_type", "size_bytes"],
    ConfirmUploadResponse: ["canonical_url", "etag", "last_modified"],
  };
  for (const [msgName, expected] of Object.entries(expectFields)) {
    const m = byName.get(msgName);
    if (!m) continue;
    const got = m.fields.map((f) => f.name);
    for (const field of expected) {
      if (!got.includes(field)) fail(`proto: ${msgName}.${field} missing; got ${got.join(", ")}`);
    }
  }

  // 4. ConfirmUpload wiring
  const confirm = rpcs.find((r) => r.name === "ConfirmUpload");
  if (!confirm) fail("proto: ConfirmUpload RPC must be present");
  else {
    if (confirm.input !== "ConfirmUploadRequest") fail(`proto: ConfirmUpload input must be ConfirmUploadRequest; got ${confirm.input}`);
    if (confirm.output !== "ConfirmUploadResponse") fail(`proto: ConfirmUpload output must be ConfirmUploadResponse; got ${confirm.output}`);
  }

  // 5. index.ts: must mirror the new messages with camelCase fields
  const { interfaces, serviceMethodNames } = parseTsInterfaces(indexTs);
  const ifaceByName = new Map(interfaces.map((i) => [i.name, i]));
  for (const name of ["PresignedUrlRequest", "PresignedUrlResponse", "ConfirmUploadRequest", "ConfirmUploadResponse"]) {
    if (!ifaceByName.has(name)) fail(`index.ts: ${name} must be defined`);
  }
  const expectCamel: Record<string, string[]> = {
    PresignedUrlRequest: ["fileType", "ownerId", "sizeBytes", "contentType"],
    PresignedUrlResponse: ["url", "key", "expiresAt"],
    ConfirmUploadRequest: ["key", "ownerId", "fileType", "sizeBytes"],
    ConfirmUploadResponse: ["canonicalUrl", "etag", "lastModified"],
  };
  for (const [msgName, expected] of Object.entries(expectCamel)) {
    const iface = ifaceByName.get(msgName);
    if (!iface) continue;
    const got = iface.fields.map((f) => f.name);
    for (const field of expected) {
      if (!got.includes(field)) fail(`index.ts: ${msgName}.${field} missing; got ${got.join(", ")}`);
    }
  }

  // 6. index.ts MediaService: only generatePresignedUrl + confirmUpload
  if (!ifaceByName.has("MediaService")) fail("index.ts: MediaService interface must be defined");
  if (!serviceMethodNames.includes("generatePresignedUrl")) fail(`index.ts: generatePresignedUrl missing; got ${serviceMethodNames.join(", ")}`);
  if (!serviceMethodNames.includes("confirmUpload")) fail(`index.ts: confirmUpload missing; got ${serviceMethodNames.join(", ")}`);
  if (serviceMethodNames.includes("confirmVideoUpload")) fail(`index.ts: confirmVideoUpload is dead and must be removed; got ${serviceMethodNames.join(", ")}`);

  if (errors.length > 0) {
    throw new Error("Proto contract check failed:\n  - " + errors.join("\n  - "));
  }
  return { ok: true };
}
