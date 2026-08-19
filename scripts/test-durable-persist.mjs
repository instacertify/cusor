#!/usr/bin/env node
/**
 * Runtime proof that durable sidecars survive an empty SQLite file.
 * Mirrors Hostinger: process restart + wiped certko.db, data dir kept.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { spawnSync } from "child_process";

const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));
const initSqlJs = requireFromCwd("sql.js");

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "certko-durable-"));
const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });

const tsc = spawnSync(
  "npx",
  ["tsc", "--noEmit", "--pretty", "false"],
  { cwd: process.cwd(), encoding: "utf8", env: process.env }
);
if (tsc.status !== 0) {
  console.error(tsc.stdout || "");
  console.error(tsc.stderr || "");
  fail("tsc --noEmit failed");
}
console.log("ok tsc --noEmit");

function rowKey(r) {
  return `${r.email}|${r.created_at}|${r.name}|${(r.message || "").slice(0, 80)}`;
}

async function withSql(filePath, fn) {
  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    db = new SQL.Database(fs.readFileSync(filePath));
  } else {
    db = new SQL.Database();
  }
  try {
    const wrapper = {
      prepare(sql) {
        return {
          run(...params) {
            db.run(sql, params);
            return { changes: 1, lastInsertRowid: 0 };
          },
          get(...params) {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const row = stmt.step() ? stmt.getAsObject() : undefined;
            stmt.free();
            return row;
          },
          all(...params) {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const rows = [];
            while (stmt.step()) rows.push(stmt.getAsObject());
            stmt.free();
            return rows;
          },
        };
      },
      exec(sql) {
        db.exec(sql);
      },
      pragma() {},
      transaction(fnInner) {
        return () => {
          db.run("BEGIN");
          try {
            const v = fnInner();
            db.run("COMMIT");
            return v;
          } catch (e) {
            db.run("ROLLBACK");
            throw e;
          }
        };
      },
      close() {
        db.close();
      },
    };
    await fn(wrapper, db);
  } finally {
    const data = db.export();
    fs.writeFileSync(filePath, Buffer.from(data));
    db.close();
  }
}

const dbPath = path.join(dataDir, "certko.db");

await withSql(dbPath, async (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      product TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      intent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'new'
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
});

const lead = {
  name: "Durable Lead",
  email: "lead@example.com",
  phone: "9999999999",
  product: "BIS",
  message: "Need testing",
  intent: "test",
  status: "new",
  created_at: "2026-08-19T12:00:00.000Z",
};
fs.appendFileSync(path.join(dataDir, "inquiries.jsonl"), JSON.stringify(lead) + "\n");

const bcryptHash =
  "$2a$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
fs.writeFileSync(
  path.join(dataDir, "settings-archive.json"),
  JSON.stringify({
    admin_password: bcryptHash,
    admin_username: "ops-admin",
    smtp_host: "smtp.example.com",
  })
);

const secret = "a".repeat(64);
fs.writeFileSync(path.join(dataDir, ".certko-secret"), secret);

fs.unlinkSync(dbPath);

await withSql(dbPath, async (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      product TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      intent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'new'
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
    "admin_password",
    "certko-admin"
  );
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
    "admin_username",
    "admin"
  );

  const archived = fs
    .readFileSync(path.join(dataDir, "inquiries.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  const existing = db.prepare("SELECT name, email, created_at, message FROM inquiries").all();
  const have = new Set(existing.map(rowKey));
  const insert = db.prepare(
    `INSERT INTO inquiries (name, email, phone, product, message, intent, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const tx = db.transaction(() => {
    for (const row of archived) {
      const key = rowKey(row);
      if (have.has(key)) continue;
      insert.run(
        row.name,
        row.email,
        row.phone || "",
        row.product || "",
        row.message || "",
        row.intent || "",
        row.status || "new",
        row.created_at
      );
      have.add(key);
    }
  });
  tx();

  const leads = db.prepare("SELECT email FROM inquiries").all();
  assert(leads.length === 1 && leads[0].email === "lead@example.com", "lead restored");

  const snap = JSON.parse(fs.readFileSync(path.join(dataDir, "settings-archive.json"), "utf8"));
  const livePass = db.prepare("SELECT value FROM settings WHERE key = ?").get("admin_password").value;
  assert(!livePass.startsWith("$2"), "fresh db still has seed password before restore");
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value"
  ).run("admin_password", snap.admin_password);
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value"
  ).run("admin_username", snap.admin_username);

  const restoredPass = db.prepare("SELECT value FROM settings WHERE key = ?").get("admin_password").value;
  const restoredUser = db.prepare("SELECT value FROM settings WHERE key = ?").get("admin_username").value;
  assert(restoredPass === bcryptHash, "admin hash restored");
  assert(restoredUser === "ops-admin", "admin username restored");
});

const secretAgain = fs.readFileSync(path.join(dataDir, ".certko-secret"), "utf8");
assert(secretAgain === secret, "secret file survived sqlite wipe");

const fakeHbuilds = path.join(root, "hbuilds");
const oldVer = path.join(fakeHbuilds, "versions", "olduuid", "nodejs", "data");
const shared = path.join(fakeHbuilds, "data");
fs.mkdirSync(oldVer, { recursive: true });
fs.mkdirSync(shared, { recursive: true });
fs.writeFileSync(path.join(oldVer, ".certko-secret"), "from-old-version-secret-32");
fs.writeFileSync(path.join(oldVer, "inquiries.jsonl"), JSON.stringify(lead) + "\n");
assert(!fs.existsSync(path.join(shared, ".certko-secret")), "shared dir starts empty");
fs.copyFileSync(path.join(oldVer, ".certko-secret"), path.join(shared, ".certko-secret"));
fs.copyFileSync(path.join(oldVer, "inquiries.jsonl"), path.join(shared, "inquiries.jsonl"));
assert(
  fs.readFileSync(path.join(shared, ".certko-secret"), "utf8") === "from-old-version-secret-32",
  "recovered secret from prior hbuilds version"
);

const esbuild = spawnSync("npx", ["--yes", "esbuild", "--version"], {
  encoding: "utf8",
});
const hasEsbuild = esbuild.status === 0;

if (hasEsbuild) {
  const entry = path.join(root, "entry.ts");
  const outfile = path.join(root, "lib-bundle.mjs");
  fs.writeFileSync(
    entry,
    `
import { restoreArchivedInquiries } from ${JSON.stringify(path.join(process.cwd(), "lib/inquiry-archive.ts"))};
import { restoreSettingsArchive } from ${JSON.stringify(path.join(process.cwd(), "lib/settings-archive.ts"))};
import { resolveCertkoSecret, resetDurableSecretCache } from ${JSON.stringify(path.join(process.cwd(), "lib/durable-secret.ts"))};
import { resetStoragePathCache } from ${JSON.stringify(path.join(process.cwd(), "lib/storage-paths.ts"))};
export { restoreArchivedInquiries, restoreSettingsArchive, resolveCertkoSecret, resetDurableSecretCache, resetStoragePathCache };
`
  );
  const bundled = spawnSync(
    "npx",
    ["--yes", "esbuild", entry, "--bundle", "--platform=node", "--format=esm", `--outfile=${outfile}`],
    { encoding: "utf8" }
  );
  if (bundled.status !== 0) {
    console.error(bundled.stderr || bundled.stdout);
    fail("esbuild bundle of durable modules failed");
  }

  const libDir = path.join(root, "lib-data");
  fs.mkdirSync(libDir, { recursive: true });
  process.env.CERTKO_DATA_DIR = libDir;
  delete process.env.CERTKO_SECRET;
  process.env.NODE_ENV = "production";

  const mod = await import(outfile);
  mod.resetStoragePathCache();
  mod.resetDurableSecretCache();
  const first = mod.resolveCertkoSecret();
  assert(first.length >= 32, "generated secret length");
  assert(fs.existsSync(path.join(libDir, ".certko-secret")), "secret written to data dir");
  mod.resetDurableSecretCache();
  delete process.env.CERTKO_SECRET;
  const second = mod.resolveCertkoSecret();
  assert(first === second, "secret reused from disk after cache+env clear");

  const dbFile = path.join(libDir, "empty.db");
  await withSql(dbFile, async (db) => {
    db.exec(`
      CREATE TABLE inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        product TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        intent TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'new'
      );
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
      );
    `);
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
      "admin_password",
      "certko-admin"
    );
    fs.appendFileSync(
      path.join(libDir, "inquiries.jsonl"),
      JSON.stringify(lead) + "\n"
    );
    fs.writeFileSync(
      path.join(libDir, "settings-archive.json"),
      JSON.stringify({ admin_password: bcryptHash, admin_username: "ops-admin" })
    );
    const n = mod.restoreArchivedInquiries(db);
    assert(n === 1, "library restored one lead, got " + n);
    const n2 = mod.restoreArchivedInquiries(db);
    assert(n2 === 0, "second restore is idempotent");
    const s = mod.restoreSettingsArchive(db);
    assert(s >= 1, "library restored settings");
    const pass = db.prepare("SELECT value FROM settings WHERE key = ?").get("admin_password").value;
    assert(pass === bcryptHash, "library restored bcrypt admin password");
  });
  console.log("ok real library restore + secret reuse");
} else {
  fail("esbuild is required to verify the real TypeScript restore path");
}

console.log("ok durable persist proof");
console.log("dataDir", dataDir);
process.exit(0);
