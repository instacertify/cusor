/**
 * SQLite access via Node.js built-in `node:sqlite` (Node 22+).
 * No native compile / Python / node-gyp — works on Hostinger Node hosting.
 *
 * Thin wrapper keeps the better-sqlite3-style API used across this codebase.
 */
import { DatabaseSync } from "node:sqlite";

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

function isNamedParams(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !Buffer.isBuffer(value)
  );
}

export function openDatabase(filePath: string): SqliteDatabase {
  const db = new DatabaseSync(filePath);

  return {
    prepare(sql: string): SqliteStatement {
      const st = db.prepare(sql);
      return {
        run(...params: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = isNamedParams(params[0])
            ? st.run(params[0] as any)
            : st.run(...(params as any[]));
          return {
            lastInsertRowid: result.lastInsertRowid,
            changes: Number(result.changes),
          };
        },
        get(...params: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return isNamedParams(params[0])
            ? st.get(params[0] as any)
            : st.get(...(params as any[]));
        },
        all(...params: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows = isNamedParams(params[0])
            ? st.all(params[0] as any)
            : st.all(...(params as any[]));
          return rows as unknown[];
        },
      };
    },

    exec(sql: string) {
      db.exec(sql);
    },

    pragma(source: string) {
      db.exec(`PRAGMA ${source}`);
    },

    transaction<T>(fn: () => T) {
      return () => {
        db.exec("BEGIN");
        try {
          const value = fn();
          db.exec("COMMIT");
          return value;
        } catch (err) {
          try {
            db.exec("ROLLBACK");
          } catch {
            /* ignore rollback errors */
          }
          throw err;
        }
      };
    },

    close() {
      db.close();
    },
  };
}
