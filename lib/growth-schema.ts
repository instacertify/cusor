import type { SqliteDatabase } from "./sqlite";

/** Schema bootstrap for growth tools (backlinks + content drafts). No getDb import — safe from db.ts. */
export function ensureBacklinksCatalog(db: SqliteDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS backlinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction TEXT NOT NULL DEFAULT 'inbound',
      source_url TEXT NOT NULL DEFAULT '',
      target_url TEXT NOT NULL DEFAULT '',
      anchor_text TEXT NOT NULL DEFAULT '',
      rel_nofollow INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      domain_rating INTEGER,
      contact_email TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      checked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_backlinks_direction ON backlinks(direction);
    CREATE INDEX IF NOT EXISTS idx_backlinks_status ON backlinks(status);
  `);
}

export function ensureContentDraftsCatalog(db: SqliteDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      focus_keyword TEXT NOT NULL DEFAULT '',
      content_type TEXT NOT NULL DEFAULT 'guide',
      tone TEXT NOT NULL DEFAULT 'professional',
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      secondary_keywords TEXT NOT NULL DEFAULT '',
      internal_links_json TEXT NOT NULL DEFAULT '[]',
      post_id INTEGER REFERENCES posts(id),
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status);
  `);
}
