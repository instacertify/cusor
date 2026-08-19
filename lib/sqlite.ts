/**
 * Database facade — PostgreSQL (primary).
 * Keeps historical export names (SqliteDatabase, ensureSqliteReady) so call sites
 * keep working; statement methods stay sync (deasync over pg).
 */
export type {
  SqliteRunResult,
  SqliteStatement,
  SqliteDatabase,
} from "./pg-database";

export {
  ensurePostgresReady as ensureSqliteReady,
  getPostgresDb as getSqliteDb,
  isPostgresReady as isSqliteReady,
  getDatabaseUrl,
  sqliteToPg,
} from "./pg-database";
