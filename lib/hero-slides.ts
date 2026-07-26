import type Database from "better-sqlite3";
import path from "path";

export const HERO_IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp"];
export const HERO_VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
export const HERO_MEDIA_EXTS = [...HERO_IMAGE_EXTS, ...HERO_VIDEO_EXTS];

export function mediaTypeFromPath(filePath: string): "image" | "gif" | "video" {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".gif") return "gif";
  if (HERO_VIDEO_EXTS.includes(ext)) return "video";
  return "image";
}

export function ensureHeroSlidesCatalog(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      media TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL DEFAULT 'image',
      poster TEXT NOT NULL DEFAULT '',
      link_href TEXT NOT NULL DEFAULT '',
      link_label TEXT NOT NULL DEFAULT '',
      duration_ms INTEGER NOT NULL DEFAULT 6000,
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = (db.prepare("SELECT COUNT(*) AS n FROM hero_slides").get() as { n: number }).n;
  if (count === 0) {
    // Seed from existing homepage image when present
    const home = db.prepare("SELECT image FROM pages WHERE slug = 'home'").get() as
      | { image: string }
      | undefined;
    const media = home?.image || "/images/hero.png";
    db.prepare(
      `INSERT INTO hero_slides (title, subtitle, media, media_type, link_href, link_label, duration_ms, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, 6000, 1, 0)`
    ).run(
      "BIS certification intelligence",
      "Search products, labs and costs in one place",
      media,
      mediaTypeFromPath(media),
      "/products",
      "Browse products"
    );
  }
}
