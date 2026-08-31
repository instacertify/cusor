#!/usr/bin/env node
/**
 * Smoke: getDb() must wait for bootstrap (no throw) when called before ensureDbReady.
 * Simulates Hostinger bare `next start` race.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "certko-getdb-wait-"));
  process.env.CERTKO_DATA_DIR = dataDir;
  delete process.env.DATABASE_URL;
  process.env.NODE_ENV = "production";
  // Clear any prior global CMS state from a previous import in the same process.
  for (const key of Object.keys(globalThis)) {
    if (key.startsWith("__certko")) delete globalThis[key];
  }

  require("tsx/cjs/api").register();
  const { getDb, isCmsReady, ensureDbReady } = require("../lib/db.ts");

  if (isCmsReady()) {
    console.error("FAIL: CMS already ready before test");
    process.exit(1);
  }

  const t0 = Date.now();
  let db;
  try {
    db = getDb();
  } catch (err) {
    console.error("FAIL: getDb threw before ready:", err && err.message);
    process.exit(1);
  }
  const ms = Date.now() - t0;

  if (!db || typeof db.prepare !== "function") {
    console.error("FAIL: getDb returned invalid db");
    process.exit(1);
  }
  if (!isCmsReady()) {
    console.error("FAIL: isCmsReady false after getDb wait");
    process.exit(1);
  }

  const row = db.prepare("SELECT COUNT(*) AS c FROM settings").get();
  console.log(
    JSON.stringify({
      ok: true,
      waitedMs: ms,
      settingsRows: row?.c ?? row?.["COUNT(*)"],
      dataDir,
    })
  );

  // Second call must be instant.
  const t1 = Date.now();
  getDb();
  console.log(JSON.stringify({ secondCallMs: Date.now() - t1 }));

  await ensureDbReady();
  process.exit(0);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
