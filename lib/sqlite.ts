/**
 * SQLite via sql.js (pure WASM/JS) — no native compile, no Python, no node-gyp.
 * Works on Hostinger Node hosting and similar constrained environments.
 */
import fs from "fs";
import path from "path";
import initSqlJs, { type Database as SqlJsDatabase, type Statement } from "sql.js";

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
  dirty: boolean;
  wrapper: SqliteDatabase;
};

type SqlGlobal = typeof globalThis & {
  __certkoSqlEngine?: Engine;
  __certkoSqlInit?: Promise<void>;
};

const g = globalThis as SqlGlobal;

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

function persist(eng: Engine) {
  if (!eng.dirty || eng.txDepth > 0) return;
  const data = eng.raw.export();
  fs.mkdirSync(path.dirname(eng.filePath), { recursive: true });
  fs.writeFileSync(eng.filePath, Buffer.from(data));
  eng.dirty = false;
}

function markDirty(eng: Engine) {
  eng.dirty = true;
  if (eng.txDepth === 0) persist(eng);
}

function wrapDatabase(raw: SqlJsDatabase, filePath: string): Engine {
  const eng: Engine = {
    raw,
    filePath,
    txDepth: 0,
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
            markDirty(eng);
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
      markDirty(eng);
    },

    pragma(source: string) {
      eng.raw.run(`PRAGMA ${source}`);
    },

    transaction<T>(fn: () => T) {
      return () => {
        eng.raw.run("BEGIN");
        eng.txDepth += 1;
        try {
          const value = fn();
          eng.raw.run("COMMIT");
          eng.txDepth -= 1;
          markDirty(eng);
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
      persist(eng);
      eng.raw.close();
      g.__certkoSqlEngine = undefined;
    },
  };

  return eng;
}

export async function ensureSqliteReady(filePath: string): Promise<SqliteDatabase> {
  if (g.__certkoSqlEngine && g.__certkoSqlEngine.filePath === filePath) {
    return g.__certkoSqlEngine.wrapper;
  }
  if (!g.__certkoSqlInit) {
    g.__certkoSqlInit = (async () => {
      const wasmPath = path.join(
        process.cwd(),
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      );
      if (!fs.existsSync(wasmPath)) {
        throw new Error(`sql.js wasm missing at ${wasmPath}`);
      }
      const wasmBinary = fs.readFileSync(wasmPath).buffer;
      const SQL = await initSqlJs({ wasmBinary });

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      let raw: SqlJsDatabase;
      if (fs.existsSync(filePath)) {
        const buf = new Uint8Array(fs.readFileSync(filePath));
        raw = new SQL.Database(buf);
      } else {
        raw = new SQL.Database();
      }
      g.__certkoSqlEngine = wrapDatabase(raw, filePath);
    })();
  }

  try {
    await g.__certkoSqlInit;
  } catch (err) {
    g.__certkoSqlInit = undefined;
    throw err;
  }

  if (!g.__certkoSqlEngine) throw new Error("SQLite failed to initialize");
  return g.__certkoSqlEngine.wrapper;
}

export function getSqliteDb(): SqliteDatabase {
  if (!g.__certkoSqlEngine) {
    throw new Error(
      "Database not ready. ensureSqliteReady() must run before handling requests."
    );
  }
  return g.__certkoSqlEngine.wrapper;
}

export function isSqliteReady(): boolean {
  return Boolean(g.__certkoSqlEngine);
}
