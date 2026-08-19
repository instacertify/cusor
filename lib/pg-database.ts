/**
 * PostgreSQL database layer for Certko CMS.
 * Sync better-sqlite3-shaped API over `pg` + `deasync` (callback form — Promise+deasync
 * deadlocks on Node 22 / Next.js). Images stay on disk under CERTKO_DATA_DIR/uploads.
 *
 * Required env:
 *   DATABASE_URL=postgres://user:pass@host:5432/certko
 */
import { Client, types, type QueryResultRow } from "pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const deasync = require("deasync") as {
  loopWhile: (pred: () => boolean) => void;
};

// node-pg returns INT8 (COUNT(*), SERIAL) as strings by default.
types.setTypeParser(types.builtins.INT8, (v) => {
  const n = Number(v);
  return Number.isSafeInteger(n) ? n : v;
});
types.setTypeParser(types.builtins.NUMERIC, (v) => parseFloat(v));

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

type Eng = {
  client: Client;
  wrapper: SqliteDatabase;
  inTx: boolean;
};

type PgGlobal = typeof globalThis & {
  __certkoPgEngine?: Eng;
  __certkoPgInit?: Promise<void>;
};

const g = globalThis as PgGlobal;

function isNamedParams(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !Buffer.isBuffer(value)
  );
}

/**
 * Rewrite multi-arg scalar MIN/MAX(a, b, …) → LEAST/GREATEST.
 * Leave single-arg aggregates MIN(expr) / MAX(expr) alone.
 */
function rewriteMultiArgMinMax(
  sql: string,
  from: "MIN" | "MAX",
  to: "LEAST" | "GREATEST"
): string {
  const re = new RegExp(`\\b${from}\\s*\\(`, "gi");
  let out = "";
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(sql)) !== null) {
    const start = match.index;
    const argsStart = start + match[0].length;
    let i = argsStart;
    let depth = 1;
    let topLevelCommas = 0;
    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (ch === "(") depth += 1;
      else if (ch === ")") depth -= 1;
      else if (ch === "," && depth === 1) topLevelCommas += 1;
      i += 1;
    }
    const args = sql.slice(argsStart, i - 1);
    const replacement =
      topLevelCommas > 0 ? `${to}(${args})` : `${from}(${args})`;
    out += sql.slice(last, start) + replacement;
    last = i;
    re.lastIndex = i;
  }
  return out + sql.slice(last);
}

/** Translate common SQLite DDL/DML idioms to PostgreSQL. */
export function sqliteToPg(sql: string): string {
  let out = sql;
  out = out.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY");
  out = out.replace(/datetime\('now'\)/gi, "NOW()");
  out = out.replace(/\bIFNULL\s*\(/gi, "COALESCE(");
  out = rewriteMultiArgMinMax(out, "MIN", "LEAST");
  out = rewriteMultiArgMinMax(out, "MAX", "GREATEST");
  out = out.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, "INSERT INTO");
  out = out.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, "INSERT INTO");
  out = out.replace(/ON CONFLICT\s*\(\s*/gi, "ON CONFLICT (");
  out = out.replace(/\bexcluded\./gi, "EXCLUDED.");
  return out;
}

function pragmaTableInfoSql(table: string): string {
  const safe = table.replace(/[^a-zA-Z0-9_]/g, "");
  return `
    SELECT
      ordinal_position AS cid,
      column_name AS name,
      data_type AS type,
      CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS notnull,
      column_default AS dflt_value,
      CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = '${safe}'
          AND tc.constraint_type = 'PRIMARY KEY'
          AND kcu.column_name = c.column_name
      ) THEN 1 ELSE 0 END AS pk
    FROM information_schema.columns c
    WHERE table_schema = 'public' AND table_name = '${safe}'
    ORDER BY ordinal_position
  `;
}

function matchPragmaTableInfo(sql: string): string | null {
  const m = sql.match(
    /^\s*PRAGMA\s+table_info\s*\(\s*['"]?([a-zA-Z0-9_]+)['"]?\s*\)\s*;?\s*$/i
  );
  return m ? m[1] : null;
}

function bindParams(
  sql: string,
  params: unknown[]
): { text: string; values: unknown[] } {
  const text0 = sqliteToPg(sql);

  if (params.length === 1 && isNamedParams(params[0])) {
    const named = params[0];
    const values: unknown[] = [];
    const text = text0.replace(/[@:$]([a-zA-Z_][a-zA-Z0-9_]*)/g, (_m, name: string) => {
      values.push(
        named[name] ?? named[`@${name}`] ?? named[`:${name}`] ?? named[`$${name}`]
      );
      return `$${values.length}`;
    });
    return { text, values };
  }

  let i = 0;
  const values = params as unknown[];
  const text = text0.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
  return { text, values };
}

function addConflictDoNothing(sql: string, originalSqlite: string): string {
  if (!/INSERT\s+OR\s+IGNORE/i.test(originalSqlite)) return sql;
  if (/\bON CONFLICT\b/i.test(sql)) return sql;
  if (/\bRETURNING\b/i.test(sql)) {
    return sql.replace(/\bRETURNING\b/i, "ON CONFLICT DO NOTHING RETURNING");
  }
  return `${sql.replace(/;?\s*$/, "")} ON CONFLICT DO NOTHING`;
}

function querySync(
  eng: Eng,
  sql: string,
  params: unknown[] = []
): { rows: QueryResultRow[]; rowCount: number } {
  const original = sql;
  let { text, values } = bindParams(sql, params);
  text = addConflictDoNothing(text, original);

  let done = false;
  let rows: QueryResultRow[] = [];
  let rowCount = 0;
  let error: unknown;

  eng.client.query(text, values, (err, res) => {
    if (err) error = err;
    else if (res) {
      rows = res.rows;
      rowCount = res.rowCount ?? 0;
    }
    done = true;
  });
  deasync.loopWhile(() => !done);
  if (error) throw error;
  return { rows, rowCount };
}

function wrapClient(client: Client): Eng {
  const eng: Eng = {
    client,
    wrapper: null as unknown as SqliteDatabase,
    inTx: false,
  };

  eng.wrapper = {
    prepare(sql: string): SqliteStatement {
      const pragmaTable = matchPragmaTableInfo(sql);
      const effectiveSql = pragmaTable ? pragmaTableInfoSql(pragmaTable) : sql;

      return {
        run(...params: unknown[]) {
          if (pragmaTable) throw new Error("PRAGMA table_info is read-only");
          const original = sql;
          // RETURNING * works for tables with or without an `id` column.
          const withReturning =
            /^\s*INSERT\b/i.test(sql) && !/\bRETURNING\b/i.test(sql)
              ? `${sql.replace(/;?\s*$/, "")} RETURNING *`
              : sql;
          const { rows, rowCount } = querySync(eng, withReturning, params);
          const id = rows[0]?.id;
          return {
            changes: rowCount,
            lastInsertRowid:
              typeof id === "number" || typeof id === "bigint" ? id : 0,
          };
        },
        get(...params: unknown[]) {
          const { rows } = querySync(eng, effectiveSql, params);
          return rows[0];
        },
        all(...params: unknown[]) {
          const { rows } = querySync(eng, effectiveSql, params);
          return rows;
        },
      };
    },

    exec(sql: string) {
      if (
        /^\s*PRAGMA\b/i.test(sql.trim()) &&
        !/;/.test(sql.trim().replace(/;\s*$/, ""))
      ) {
        return;
      }
      const parts = sqliteToPg(sql)
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !/^\s*PRAGMA\b/i.test(s));
      for (const part of parts) {
        querySync(eng, part, []);
      }
    },

    pragma(_source: string) {
      /* no-op on Postgres */
    },

    transaction<T>(fn: () => T) {
      return () => {
        if (eng.inTx) return fn();
        querySync(eng, "BEGIN", []);
        eng.inTx = true;
        try {
          const value = fn();
          querySync(eng, "COMMIT", []);
          return value;
        } catch (err) {
          try {
            querySync(eng, "ROLLBACK", []);
          } catch {
            /* ignore */
          }
          throw err;
        } finally {
          eng.inTx = false;
        }
      };
    },

    close() {
      let done = false;
      let error: unknown;
      eng.client.end((err) => {
        error = err;
        done = true;
      });
      deasync.loopWhile(() => !done);
      if (error) throw error;
      g.__certkoPgEngine = undefined;
    },
  };

  return eng;
}

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.CERTKO_DATABASE_URL?.trim() ||
    ""
  );
}

export async function ensurePostgresReady(
  databaseUrl?: string
): Promise<SqliteDatabase> {
  const url = databaseUrl || getDatabaseUrl();
  if (!url) {
    throw new Error(
      "[certko] DATABASE_URL is required for PostgreSQL. Example: postgres://certko:password@127.0.0.1:5432/certko"
    );
  }

  if (g.__certkoPgEngine) return g.__certkoPgEngine.wrapper;

  if (!g.__certkoPgInit) {
    g.__certkoPgInit = (async () => {
      const client = new Client({
        connectionString: url,
        connectionTimeoutMillis: 15_000,
      });
      await client.connect();
      await client.query("SELECT 1 AS ok");
      g.__certkoPgEngine = wrapClient(client);
      console.info("[certko] PostgreSQL connected");
    })();
  }

  await g.__certkoPgInit;
  return getPostgresDb();
}

export function getPostgresDb(): SqliteDatabase {
  if (!g.__certkoPgEngine) {
    throw new Error("[certko] PostgreSQL not ready — await ensureDbReady() first");
  }
  return g.__certkoPgEngine.wrapper;
}

export function isPostgresReady(): boolean {
  return Boolean(g.__certkoPgEngine);
}
