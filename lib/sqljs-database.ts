/**
 * SQLite via sql.js (pure JS) — no native compile, no Python, no node-gyp.
 * Uses sql-asm.js by default so Hostinger / constrained hosts never need a .wasm file.
 *
 * Used when DATABASE_URL is not set so public pages can still boot.
 *
 * CRITICAL (Hostinger 504 root cause):
 * sql.js keeps the DB in memory. Naively calling export()+writeFileSync after every
 * INSERT rewrites the *entire* file thousands of times during first-boot seed, blocks
 * the Node event loop, spikes memory, and Hostinger's supervisor SIGTERMs the process.
 * Nginx then returns 504 Gateway Timeout. We defer/debounce disk persists instead.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import type { Database as SqlJsDatabase, Statement, SqlJsStatic } from "sql.js";

export type SqliteRunResult = {
  lastInsertRowid: number | bigint;
  changes: number;
};

export type SqliteStatement = {
  run: (...params: unknown[]) => SqliteRunResult;
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
};

export type SqliteDatabase = {
  prepare: (sql: string) => SqliteStatement;
  exec: (sql: string) => void;
  pragma: (source: string) => void;
  transaction: <T>(fn: () => T) => () => T;
  close: () => void;
};

type Engine = {
  raw: SqlJsDatabase;
  filePath: string;
  txDepth: number;
  /** >0 means keep dirty bits in memory; flush once when it returns to 0. */
  deferPersist: number;
  dirty: boolean;
  persistTimer?: ReturnType<typeof setTimeout>;
  wrapper: SqliteDatabase;
};

type SqlGlobal = typeof globalThis & {
  __certkoSqlEngine?: Engine;
  __certkoSqlInit?: Promise<void>;
  __certkoSqlFlushHooks?: boolean;
};

const g = globalThis as SqlGlobal;
const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));

/** Debounce normal writes so page traffic does not rewrite the full DB each INSERT. */
const PERSIST_DEBOUNCE_MS = 400;

function isNamedParams(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !Buffer.isBuffer(value)
  );
}

/** Convert better-sqlite3-style { name: "x" } into sql.js { @name: "x" } when needed. */
function toSqlJsNamed(sql: string, named: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(named)) {
    if (key.startsWith("@") || key.startsWith(":") || key.startsWith("$")) {
      out[key] = value;
      continue;
    }
    if (sql.includes(`@${key}`)) out[`@${key}`] = value;
    else if (sql.includes(`:${key}`)) out[`:${key}`] = value;
    else if (sql.includes(`$${key}`)) out[`$${key}`] = value;
    else out[`@${key}`] = value;
  }
  return out;
}

function bindStatement(stmt: Statement, sql: string, params: unknown[]) {
  if (params.length === 0) return;
  if (isNamedParams(params[0]) && params.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stmt.bind(toSqlJsNamed(sql, params[0]) as any);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stmt.bind(params as any);
}

function clearPersistTimer(eng: Engine) {
  if (!eng.persistTimer) return;
  clearTimeout(eng.persistTimer);
  eng.persistTimer = undefined;
}

function persist(eng: Engine, force = false) {
  if (!eng.dirty) return;
  if (!force && (eng.txDepth > 0 || eng.deferPersist > 0)) return;
  clearPersistTimer(eng);
  const data = eng.raw.export();
  fs.mkdirSync(path.dirname(eng.filePath), { recursive: true });
  // Atomic-ish replace so a crash mid-write does not truncate certko.db.
  const tmp = `${eng.filePath}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(data));
  fs.renameSync(tmp, eng.filePath);
  eng.dirty = false;
}

function schedulePersist(eng: Engine) {
  if (eng.txDepth > 0 || eng.deferPersist > 0) return;
  if (eng.persistTimer) return;
  eng.persistTimer = setTimeout(() => {
    eng.persistTimer = undefined;
    try {
      persist(eng, true);
    } catch (err) {
      console.error("[certko] SQLite persist failed:", err);
    }
  }, PERSIST_DEBOUNCE_MS);
  // Do not keep the process alive solely for a pending flush.
  eng.persistTimer.unref?.();
}

function markDirty(eng: Engine) {
  eng.dirty = true;
  if (eng.txDepth > 0 || eng.deferPersist > 0) return;
  schedulePersist(eng);
}

function installFlushHooks() {
  if (g.__certkoSqlFlushHooks) return;
  g.__certkoSqlFlushHooks = true;
  const flush = () => {
    const eng = g.__certkoSqlEngine;
    if (!eng) return;
    try {
      persist(eng, true);
    } catch (err) {
      console.error("[certko] SQLite flush on exit failed:", err);
    }
  };
  process.once("beforeExit", flush);
  process.once("exit", flush);
}

/**
 * Run a bulk write (schema seed / catalog ensure) without exporting the DB on
 * every statement. One export+write happens when the callback finishes.
 */
export function withDeferredSqlJsPersist<T>(fn: () => T): T {
  const eng = g.__certkoSqlEngine;
  if (!eng) return fn();
  eng.deferPersist += 1;
  clearPersistTimer(eng);
  try {
    return fn();
  } finally {
    eng.deferPersist = Math.max(0, eng.deferPersist - 1);
    if (eng.deferPersist === 0 && eng.txDepth === 0) {
      try {
        persist(eng, true);
      } catch (err) {
        console.error("[certko] SQLite deferred persist failed:", err);
        throw err;
      }
    }
  }
}

/** Force a disk flush if the in-memory DB is dirty. */
export function flushSqlJsToDisk(): void {
  const eng = g.__certkoSqlEngine;
  if (!eng) return;
  persist(eng, true);
}

function wrapDatabase(raw: SqlJsDatabase, filePath: string): Engine {
  const eng: Engine = {
    raw,
    filePath,
    txDepth: 0,
    deferPersist: 0,
    dirty: false,
    wrapper: null as unknown as SqliteDatabase,
  };

  eng.wrapper = {
    prepare(sql: string): SqliteStatement {
      return {
        run(...params: unknown[]) {
          const stmt = eng.raw.prepare(sql);
          try {
            bindStatement(stmt, sql, params);
            stmt.step();
            const changes = eng.raw.getRowsModified();
            const idRes = eng.raw.exec("SELECT last_insert_rowid() AS id");
            const lastInsertRowid = (idRes[0]?.values?.[0]?.[0] as number | bigint) ?? 0;
            if (changes > 0) markDirty(eng);
            return { changes, lastInsertRowid };
          } finally {
            stmt.free();
          }
        },
        get(...params: unknown[]) {
          const stmt = eng.raw.prepare(sql);
          try {
            bindStatement(stmt, sql, params);
            if (!stmt.step()) return undefined;
            return stmt.getAsObject();
          } finally {
            stmt.free();
          }
        },
        all(...params: unknown[]) {
          const stmt = eng.raw.prepare(sql);
          try {
            bindStatement(stmt, sql, params);
            const rows: Record<string, unknown>[] = [];
            while (stmt.step()) rows.push(stmt.getAsObject());
            return rows;
          } finally {
            stmt.free();
          }
        },
      };
    },

    exec(sql: string) {
      eng.raw.exec(sql);
      // CREATE IF NOT EXISTS / no-op schema must not rewrite the 13MB Hostinger file.
      if (/\b(INSERT|UPDATE|DELETE|REPLACE|DROP|ALTER)\b/i.test(sql)) {
        markDirty(eng);
      }
    },

    pragma(source: string) {
      try {
        eng.raw.run(`PRAGMA ${source}`);
      } catch (err) {
        // sql.js may reject some file-oriented pragmas (e.g. WAL) — non-fatal
        console.warn("[certko] pragma ignored:", source, err);
      }
    },

    transaction<T>(fn: () => T) {
      return () => {
        eng.raw.run("BEGIN");
        eng.txDepth += 1;
        try {
          const value = fn();
          eng.raw.run("COMMIT");
          eng.txDepth -= 1;
          return value;
        } catch (err) {
          try {
            eng.raw.run("ROLLBACK");
          } catch {
            /* ignore */
          }
          eng.txDepth = Math.max(0, eng.txDepth - 1);
          throw err;
        }
      };
    },

    close() {
      persist(eng, true);
      eng.raw.close();
      g.__certkoSqlEngine = undefined;
    },
  };

  return eng;
}

/** Load sql.js without depending on a separate .wasm file (Hostinger-safe). */
async function loadSqlEngine(): Promise<SqlJsStatic> {
  // 1) Prefer asm.js — single JS file, no WebAssembly binary required
  try {
    const initAsm = requireFromCwd("sql.js/dist/sql-asm.js") as (
      config?: Record<string, unknown>
    ) => Promise<SqlJsStatic>;
    return await initAsm();
  } catch (asmErr) {
    console.warn("[certko] sql-asm.js failed, falling back to wasm:", asmErr);
  }

  // 2) Fallback: wasm binary from package or locateFile
  const initWasm = requireFromCwd("sql.js") as (
    config?: Record<string, unknown>
  ) => Promise<SqlJsStatic>;

  const candidates = [
    (() => {
      try {
        return path.join(
          path.dirname(requireFromCwd.resolve("sql.js/package.json")),
          "dist",
          "sql-wasm.wasm"
        );
      } catch {
        return null;
      }
    })(),
    path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
    path.join(process.cwd(), "vendor", "sql-wasm.wasm"),
  ].filter((p): p is string => Boolean(p));

  for (const wasmPath of candidates) {
    if (!fs.existsSync(wasmPath)) continue;
    const wasmBinary = fs.readFileSync(wasmPath).buffer;
    return await initWasm({ wasmBinary });
  }

  throw new Error(
    `sql.js failed to load (asm + wasm). Checked: ${candidates.join(", ") || "(none)"}`
  );
}

export async function ensureSqlJsReady(filePath: string): Promise<SqliteDatabase> {
  if (g.__certkoSqlEngine && g.__certkoSqlEngine.filePath === filePath) {
    return g.__certkoSqlEngine.wrapper;
  }
  if (!g.__certkoSqlInit) {
    g.__certkoSqlInit = (async () => {
      const SQL = await loadSqlEngine();

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      let raw: SqlJsDatabase;
      if (fs.existsSync(filePath)) {
        const buf = new Uint8Array(fs.readFileSync(filePath));
        raw = new SQL.Database(buf);
      } else {
        raw = new SQL.Database();
      }
      g.__certkoSqlEngine = wrapDatabase(raw, filePath);
      installFlushHooks();
      console.info("[certko] SQLite ready via sql.js at", filePath);
    })();
  }

  try {
    await g.__certkoSqlInit;
  } catch (err) {
    g.__certkoSqlInit = undefined;
    console.error("[certko] SQLite init failed:", err);
    throw err;
  }

  if (!g.__certkoSqlEngine) throw new Error("SQLite failed to initialize");
  return g.__certkoSqlEngine.wrapper;
}

export function getSqlJsDb(): SqliteDatabase {
  if (!g.__certkoSqlEngine) {
    throw new Error(
      "Database not ready. ensureSqliteReady() must run before handling requests."
    );
  }
  return g.__certkoSqlEngine.wrapper;
}

export function isSqlJsReady(): boolean {
  return Boolean(g.__certkoSqlEngine);
}
