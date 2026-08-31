#!/usr/bin/env node
/**
 * QC: auto SQLite → Postgres import keeps sqlite file + uploads; Postgres gets rows.
 *
 *   DATABASE_URL=postgres://certko:certko_dev@127.0.0.1:5432/certko \
 *     node scripts/smoke-sqlite-to-pg-migrate.cjs
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { Client } = require("pg");

async function wipePostgres(url) {
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
  await client.end();
}

async function main() {
  const url =
    process.env.DATABASE_URL ||
    "postgres://certko:certko_dev@127.0.0.1:5432/certko";

  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "certko-migrate-"));
  const uploadsDir = path.join(dataDir, "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const imagePath = path.join(uploadsDir, "keep-me.png");
  fs.writeFileSync(imagePath, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // Build a rich SQLite without DATABASE_URL
  delete process.env.DATABASE_URL;
  process.env.CERTKO_DATA_DIR = dataDir;
  process.env.NODE_ENV = "production";
  for (const key of Object.keys(globalThis)) {
    if (key.startsWith("__certko")) delete globalThis[key];
  }

  require("tsx/cjs/api").register();
  const dbMod = require("../lib/db.ts");
  await dbMod.ensureDbReady();
  // Wait catalog ensure
  await new Promise((r) => setTimeout(r, 10000));
  const sqliteDb = dbMod.getDb();
  sqliteDb
    .prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    )
    .run("migrate_probe", "from-sqlite-unique");
  sqliteDb
    .prepare(
      "INSERT INTO inquiries (name, email, phone, product, message, intent, created_at, status) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)"
    )
    .run(
      "Migrate QC",
      "migrate-qc@example.com",
      "999",
      "BIS",
      "keep this lead",
      "qc",
      "new"
    );

  const { flushSqlJsToDisk } = require("../lib/sqljs-database.ts");
  flushSqlJsToDisk();

  const sqlitePath = path.join(dataDir, "certko.db");
  const sqliteBytesBefore = fs.statSync(sqlitePath).size;
  const postsBefore = Number(
    sqliteDb.prepare("SELECT COUNT(*) AS n FROM posts").get().n
  );
  const inquiryCountSqlite = Number(
    sqliteDb.prepare("SELECT COUNT(*) AS n FROM inquiries").get().n
  );
  const probeSqlite = sqliteDb
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("migrate_probe");

  console.log(
    JSON.stringify({
      phase: "sqlite-ready",
      sqliteBytesBefore,
      postsBefore,
      inquiryCountSqlite,
      probeSqlite: probeSqlite && probeSqlite.value,
      imageExists: fs.existsSync(imagePath),
    })
  );

  // Switch to Postgres — wipe PG first so import must run
  await wipePostgres(url);
  for (const key of Object.keys(globalThis)) {
    if (key.startsWith("__certko")) delete globalThis[key];
  }
  process.env.DATABASE_URL = url;
  process.env.CERTKO_DATA_DIR = dataDir;

  const dbMod2 = require("../lib/db.ts");
  await dbMod2.ensureDbReady();
  await new Promise((r) => setTimeout(r, 3000));

  const pg = dbMod2.getDb();
  const probe = pg
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("migrate_probe");
  const inquiries = Number(
    pg.prepare("SELECT COUNT(*) AS n FROM inquiries").get().n
  );
  const postsAfter = Number(pg.prepare("SELECT COUNT(*) AS n FROM posts").get().n);
  const sqliteBytesAfter = fs.statSync(sqlitePath).size;
  const imageAfter = fs.existsSync(imagePath);
  const marker = path.join(dataDir, ".certko-pg-import-from-sqlite.json");
  const markerOk = fs.existsSync(marker);

  const ok =
    probe &&
    probe.value === "from-sqlite-unique" &&
    inquiries >= 1 &&
    postsAfter >= postsBefore &&
    sqliteBytesAfter === sqliteBytesBefore &&
    imageAfter &&
    markerOk;

  console.log(
    JSON.stringify({
      ok,
      probe: probe && probe.value,
      inquiries,
      postsBefore,
      postsAfter,
      sqliteBytesBefore,
      sqliteBytesAfter,
      sqliteUnchanged: sqliteBytesAfter === sqliteBytesBefore,
      imageKept: imageAfter,
      markerOk,
    })
  );
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
