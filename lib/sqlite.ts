/**
 * Database facade.
 * PostgreSQL when DATABASE_URL is set; otherwise SQLite via sql.js so Hostinger
 * Node hosting can serve public pages without Postgres.
 */
import { getCertkoDbPath } from "./storage-paths";
import {
  ensurePostgresReady,
  getDatabaseUrl,
  getPostgresDb,
  isPostgresReady,
} from "./pg-database";
import {
  ensureSqlJsReady,
  getSqlJsDb,
  isSqlJsReady,
  withDeferredSqlJsPersist,
} from "./sqljs-database";

export type {
  SqliteRunResult,
  SqliteStatement,
  SqliteDatabase,
} from "./sqljs-database";

export { withDeferredSqlJsPersist } from "./sqljs-database";
export { getDatabaseUrl, sqliteToPg } from "./pg-database";

function looksLikePostgresUrl(value: string): boolean {
  return /^postgres(ql)?:\/\//i.test(value.trim());
}

export async function ensureSqliteReady(target?: string) {
  const url = getDatabaseUrl();
  if (url) {
    return ensurePostgresReady(url);
  }
  const filePath =
    target && !looksLikePostgresUrl(target) ? target : getCertkoDbPath();
  return ensureSqlJsReady(filePath);
}

export function getSqliteDb() {
  if (isPostgresReady()) return getPostgresDb();
  if (isSqlJsReady()) return getSqlJsDb();
  throw new Error(
    "Database not ready. ensureSqliteReady() must run before handling requests."
  );
}

export function isSqliteReady(): boolean {
  return isPostgresReady() || isSqlJsReady();
}

export function isUsingPostgres(): boolean {
  return Boolean(getDatabaseUrl());
}
