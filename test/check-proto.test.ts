/**
 * check-proto.test.ts
 *
 * Contract test runner. The actual check logic lives in
 * scripts/check-proto.ts and is reused by the CI workflow.
 *
 * Runs via `npm run check:proto`. Exits non-zero on any mismatch.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { runProtoContractCheck } from "../scripts/check-proto.js";

test("media.proto and index.ts are in sync (D2 contract)", () => {
  assert.doesNotThrow(() => runProtoContractCheck(), "proto contract check must pass");
});
