/**
 * Auto-import CMS rows from durable SQLite → PostgreSQL when DATABASE_URL is set.
 *
 * Safety rules (Hostinger redeploy):
 * - NEVER deletes certko.db, uploads/, secrets, or archives
 * - NEVER DROP / TRUNCATE Postgres tables
 * - Idempotent: ON CONFLICT DO NOTHING; skips when Postgres already as rich
 * - Opt-out: CERTKO_SKIP_SQLITE_MIGRATE=1
 *
 * Images stay on disk under CERTKO_DATA_DIR/uploads — only relational rows move.
 */
import fs from "fs";
import path from "path";
import { getCertkoDataDir, getCertkoDbPath, getCertkoUploadsDir } from "./storage-paths";
import { getDatabaseUrl, type SqliteDatabase } from "./sqlite";
import { ensureSqlJsReady } from "./sqljs-database";

/** FK-safe copy order. Unknown tables in SQLite are skipped. */
const MIGRATE_TABLES = [
  "settings",
  "pages",
  "categories",
  "authors",
  "labs",
  "certifications",
  "qcos",
  "products",
  "product_labs",
  "faqs",
  "testimonials",
  "trusted_brands",
  "posts",
  "seo_meta",
  "inquiries",
  "cert_products",
  "testing_categories",
  "testing_services",
  "product_testing_services",
  "hero_slides",
  "admin_audit_log",
  "country_hubs",
  "country_schemes",
  "gdpr_requests",
  "gdpr_consent_events",
] as const;

type Marker = {
  at: string;
  sqlitePath: string;
  sqliteBytes: number;
  sqliteScore: number;
  postgresScoreAfter: number;
  tables: Record<string, { copied: number; skipped: number }>;
  uploadsDir: string;
  note: string;
};

function markerPath(): string {
  return path.join(getCertkoDataDir(), ".certko-pg-import-from-sqlite.json");
}

function readMarker(): Marker | null {
  try {
    const p = markerPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8")) as Marker;
  } catch {
    return null;
  }
}

function writeMarker(marker: Marker) {
  const p = markerPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(marker, null, 2));
  fs.renameSync(tmp, p);
}

function quoteIdent(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`[certko] refuse unsafe SQL ident: ${name}`);
  }
  return `"${name}"`;
}

function tableExists(db: SqliteDatabase, table: string): boolean {
  try {
    db.prepare(`SELECT 1 AS ok FROM ${quoteIdent(table)} LIMIT 1`).get();
    return true;
  } catch {
    return false;
  }
}

function countRows(db: SqliteDatabase, table: string): number {
  if (!tableExists(db, table)) return 0;
  try {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as
      | { n: number | string }
      | undefined;
    return Number(row?.n ?? 0);
  } catch {
    return 0;
  }
}

/** Rough CMS richness — used to decide whether import is needed. */
export function cmsRichnessScore(db: SqliteDatabase): number {
  const weights: Array<[string, number]> = [
    ["posts", 5],
    ["pages", 3],
    ["products", 2],
    ["categories", 2],
    ["inquiries", 2],
    ["settings", 1],
    ["cert_products", 1],
    ["testing_services", 1],
    ["authors", 1],
  ];
  let score = 0;
  for (const [table, w] of weights) {
    score += countRows(db, table) * w;
  }
  return score;
}

function listColumns(db: SqliteDatabase, table: string): string[] {
  // Prefer PRAGMA (sql.js) / pg-database maps PRAGMA table_info → information_schema
  try {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all() as {
      name: string;
    }[];
    if (rows?.length) return rows.map((r) => r.name).filter(Boolean);
  } catch {
    /* fall through */
  }
  try {
    const rows = db
      .prepare(
        "SELECT column_name AS name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? ORDER BY ordinal_position"
      )
      .all(table) as { name: string }[];
    return (rows || []).map((r) => r.name).filter(Boolean);
  } catch {
    return [];
  }
}

/** Extra tables not in bootstrapSchema — create empty shells before copy. */
function ensureExtraPostgresTables(pg: SqliteDatabase) {
  pg.exec(`
    CREATE TABLE IF NOT EXISTS country_hubs (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      market_id TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      short_name TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      intro TEXT NOT NULL DEFAULT '',
      overview TEXT NOT NULL DEFAULT '',
      authority TEXT NOT NULL DEFAULT '',
      filing_tip TEXT NOT NULL DEFAULT '',
      first_checks TEXT NOT NULL DEFAULT '[]',
      pillars TEXT NOT NULL DEFAULT '{}',
      sort INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS country_schemes (
      id SERIAL PRIMARY KEY,
      country_id INTEGER NOT NULL,
      cert_slug TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      who_needs_it TEXT NOT NULL DEFAULT '',
      examples TEXT NOT NULL DEFAULT '[]',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gdpr_requests (
      id SERIAL PRIMARY KEY,
      request_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT 'unspecified',
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT NOW()::text,
      updated_at TEXT NOT NULL DEFAULT NOW()::text
    );

    CREATE TABLE IF NOT EXISTS gdpr_consent_events (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL DEFAULT '',
      analytics INTEGER NOT NULL DEFAULT 0,
      marketing INTEGER NOT NULL DEFAULT 0,
      policy_version TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'banner',
      user_agent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT NOW()::text
    );
  `);
}

function copyTable(
  sqlite: SqliteDatabase,
  pg: SqliteDatabase,
  table: string,
  opts?: { upsertSettings?: boolean }
): { copied: number; skipped: number } {
  if (!tableExists(sqlite, table)) return { copied: 0, skipped: 0 };
  if (!tableExists(pg, table)) return { copied: 0, skipped: 0 };

  const srcCols = listColumns(sqlite, table);
  const dstCols = new Set(listColumns(pg, table));
  const cols = srcCols.filter((c) => dstCols.has(c));
  if (cols.length === 0) return { copied: 0, skipped: 0 };

  const rows = sqlite.prepare(`SELECT * FROM ${quoteIdent(table)}`).all() as Record<
    string,
    unknown
  >[];
  if (!rows.length) return { copied: 0, skipped: 0 };

  const colSql = cols.map(quoteIdent).join(", ");
  const placeholders = cols.map(() => "?").join(", ");
  const upsertSettings =
    opts?.upsertSettings && table === "settings" && cols.includes("key") && cols.includes("value");
  const sql = upsertSettings
    ? `INSERT INTO ${quoteIdent(table)} (${colSql}) VALUES (${placeholders}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
    : `INSERT INTO ${quoteIdent(table)} (${colSql}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
  const insert = pg.prepare(sql);

  let copied = 0;
  let skipped = 0;
  const run = pg.transaction(() => {
    for (const row of rows) {
      const values = cols.map((c) => row[c] ?? null);
      const res = insert.run(...values);
      if (res.changes > 0) copied += 1;
      else skipped += 1;
    }
  });
  run();
  return { copied, skipped };
}

function resetSerialSequences(pg: SqliteDatabase, tables: string[]) {
  for (const table of tables) {
    if (!tableExists(pg, table)) continue;
    const cols = listColumns(pg, table);
    if (!cols.includes("id")) continue;
    try {
      pg.prepare(
        `SELECT setval(
          pg_get_serial_sequence(?, 'id'),
          GREATEST(COALESCE((SELECT MAX(id) FROM ${quoteIdent(table)}), 1), 1)
        )`
      ).get(table);
    } catch {
      try {
        pg.exec(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), 1))`
        );
      } catch {
        /* table may not use serial */
      }
    }
  }
}

/**
 * If Postgres is empty/thin and durable SQLite has CMS data, copy rows in.
 * Leaves SQLite file + uploads untouched. Safe to call on every boot.
 */
export async function migrateSqliteIntoPostgresIfNeeded(
  pg: SqliteDatabase
): Promise<{ ran: boolean; reason: string }> {
  if (!getDatabaseUrl()) {
    return { ran: false, reason: "no DATABASE_URL" };
  }
  if (
    process.env.CERTKO_SKIP_SQLITE_MIGRATE === "1" ||
    process.env.CERTKO_SKIP_SQLITE_MIGRATE === "true"
  ) {
    return { ran: false, reason: "CERTKO_SKIP_SQLITE_MIGRATE set" };
  }

  const sqlitePath = getCertkoDbPath();
  if (!fs.existsSync(sqlitePath)) {
    return { ran: false, reason: "no sqlite file" };
  }
  const sqliteBytes = fs.statSync(sqlitePath).size;
  if (sqliteBytes < 2048) {
    return { ran: false, reason: "sqlite file too small" };
  }

  ensureExtraPostgresTables(pg);

  const pgScoreBefore = cmsRichnessScore(pg);

  // Open SQLite file for read — does not replace live Postgres getDb().
  const sqlite = await ensureSqlJsReady(sqlitePath);
  const sqliteScore = cmsRichnessScore(sqlite);

  if (sqliteScore < 5) {
    return { ran: false, reason: `sqlite too thin (score=${sqliteScore})` };
  }

  const marker = readMarker();
  // Skip if Postgres already looks as rich as the last successful import source.
  if (pgScoreBefore >= sqliteScore && pgScoreBefore > 0) {
    console.info(
      `[certko] SQLite→Postgres import skipped — Postgres already rich (pg=${pgScoreBefore}, sqlite=${sqliteScore}). SQLite file kept at ${sqlitePath}`
    );
    return { ran: false, reason: "postgres already rich" };
  }
  if (marker && pgScoreBefore >= Math.max(10, marker.postgresScoreAfter * 0.8)) {
    console.info(
      `[certko] SQLite→Postgres import skipped — prior import marker present and Postgres populated. SQLite kept at ${sqlitePath}`
    );
    return { ran: false, reason: "marker + postgres ok" };
  }

  const uploadsDir = getCertkoUploadsDir();
  console.info(
    `[certko] Auto-importing CMS from SQLite → PostgreSQL (no deletes). sqlite=${sqlitePath} (${sqliteBytes} bytes, score=${sqliteScore}) pgScore=${pgScoreBefore} uploads=${uploadsDir}`
  );

  const tables: Marker["tables"] = {};
  let totalCopied = 0;

  for (const table of MIGRATE_TABLES) {
    try {
      const result = copyTable(sqlite, pg, table, {
        // First import into a thin Postgres: let durable SQLite win on settings keys.
        upsertSettings: pgScoreBefore < sqliteScore,
      });
      tables[table] = result;
      totalCopied += result.copied;
      if (result.copied || result.skipped) {
        console.info(
          `[certko]   ${table}: copied=${result.copied} already-present=${result.skipped}`
        );
      }
    } catch (err) {
      console.error(`[certko]   ${table}: import failed (continuing):`, err);
      tables[table] = { copied: 0, skipped: 0 };
    }
  }

  resetSerialSequences(pg, [...MIGRATE_TABLES]);

  const pgScoreAfter = cmsRichnessScore(pg);
  writeMarker({
    at: new Date().toISOString(),
    sqlitePath,
    sqliteBytes,
    sqliteScore,
    postgresScoreAfter: pgScoreAfter,
    tables,
    uploadsDir,
    note:
      "SQLite file and uploads were NOT deleted. Redeploys keep both. Set CERTKO_SKIP_SQLITE_MIGRATE=1 to disable.",
  });

  // Prove we did not delete source assets.
  const sqliteStillThere = fs.existsSync(sqlitePath);
  const uploadsStillThere = fs.existsSync(uploadsDir);
  console.info(
    `[certko] SQLite→Postgres import complete: rowsCopied≈${totalCopied} pgScore ${pgScoreBefore}→${pgScoreAfter}. sqliteKept=${sqliteStillThere} uploadsKept=${uploadsStillThere}`
  );

  if (!sqliteStillThere) {
    console.error(
      "[certko] CRITICAL: sqlite file missing after import — this should never happen"
    );
  }

  return { ran: true, reason: `copied≈${totalCopied}` };
}
