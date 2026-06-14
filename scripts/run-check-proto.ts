/**
 * scripts/run-check-proto.ts
 *
 * CLI entry point for the proto contract check. Used by:
 *  - `npm run check:proto`
 *  - CI workflow (.github/workflows/check-proto.yml)
 *
 * Exits 0 on success, 1 on any mismatch.
 */

import { runProtoContractCheck } from "./check-proto.js";

try {
  runProtoContractCheck();
  console.log("PASS: media.proto and index.ts are in sync");
  process.exit(0);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
