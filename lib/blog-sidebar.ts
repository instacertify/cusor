import type { SqliteDatabase } from "./sqlite";
import { BLOG_CTA_DEFAULTS } from "./blog-sidebar-cta";

/** Add per-post sidebar CTA / related-posts columns (safe on Postgres + SQLite). */
export function ensureBlogSidebarColumns(db: SqliteDatabase) {
  const cols = db.prepare("PRAGMA table_info(posts)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (name: string, ddl: string) => {
    if (!names.has(name)) db.exec(`ALTER TABLE posts ADD COLUMN ${ddl}`);
  };
  add("cta_mode", "cta_mode TEXT NOT NULL DEFAULT 'default'");
  add("cta_kind", "cta_kind TEXT NOT NULL DEFAULT 'certification'");
  add("cta_heading", "cta_heading TEXT NOT NULL DEFAULT ''");
  add("cta_topic", "cta_topic TEXT NOT NULL DEFAULT ''");
  add("cta_body", "cta_body TEXT NOT NULL DEFAULT ''");
  add("more_posts_mode", "more_posts_mode TEXT NOT NULL DEFAULT 'default'");
}

/** Seed site-wide blog sidebar CTA defaults if missing (never overwrite human edits). */
export function ensureBlogSidebarCtaSettings(db: SqliteDatabase) {
  const insert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING"
  );
  for (const [key, value] of Object.entries(BLOG_CTA_DEFAULTS)) {
    insert.run(key, value);
  }
}
