/**
 * Smoke-test PostgreSQL bootstrap (schema + a few seeds).
 * Usage:
 *   DATABASE_URL=postgres://certko:certko_dev@127.0.0.1:5432/certko npx --yes tsx scripts/smoke-pg.ts
 */
import { ensureDbReady, getDb, getSetting, setSetting } from "../lib/db";

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error("Set DATABASE_URL first");
    process.exit(1);
  }
  console.log("Connecting…");
  await ensureDbReady();
  const db = getDb();
  const tables = db
    .prepare(
      `SELECT table_name AS name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    )
    .all() as { name: string }[];
  console.log("tables:", tables.map((t) => t.name).join(", "));

  const pageCols = db.prepare("PRAGMA table_info(pages)").all() as { name: string }[];
  console.log(
    "pages columns:",
    pageCols.map((c) => c.name).join(", ")
  );

  setSetting("smoke_pg_test", `ok-${Date.now()}`);
  console.log("settings.smoke_pg_test =", getSetting("smoke_pg_test"));

  const posts = db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number };
  const cats = db.prepare("SELECT COUNT(*) AS n FROM categories").get() as { n: number };
  console.log("posts:", posts.n, "categories:", cats.n);
  console.log("SMOKE OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
