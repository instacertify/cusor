#!/usr/bin/env node
/** Parallel getDb() from multiple sync callers while bootstrap is in flight. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { Worker } = require("node:worker_threads");

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "certko-getdb-parallel-"));
  process.env.CERTKO_DATA_DIR = dataDir;
  delete process.env.DATABASE_URL;
  process.env.NODE_ENV = "production";
  for (const key of Object.keys(globalThis)) {
    if (key.startsWith("__certko")) delete globalThis[key];
  }
  require("tsx/cjs/api").register();
  const { getDb, isCmsReady } = require("../lib/db.ts");

  const results = [];
  const errors = [];
  // Sequential re-entry on same thread (SSR often re-enters getDb during one render tree).
  for (let i = 0; i < 5; i++) {
    try {
      const db = getDb();
      results.push(Boolean(db && isCmsReady()));
    } catch (e) {
      errors.push(String(e && e.message));
    }
  }
  console.log(JSON.stringify({ ok: errors.length === 0, results, errors, dataDir }));
  process.exit(errors.length ? 1 : 0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
