import type { SqliteDatabase } from "./sqlite";
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

export function ensureHeroSlidesCatalog(db: SqliteDatabase) {
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
    // Prefer looping lab footage for the homepage media panel
    const media = "/images/hero-lab.mp4";
    db.prepare(
      `INSERT INTO hero_slides (title, subtitle, media, media_type, poster, link_href, link_label, duration_ms, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, 8000, 1, 0)`
    ).run(
      "Lab-backed certification",
      "Testing coordination, recognised labs and clear cost ranges",
      media,
      mediaTypeFromPath(media),
      "/images/hero-lab-poster.jpg",
      "/labs",
      "Browse testing labs"
    );
  } else {
    // Soft upgrade: replace the original static hero.png seed with lab video once
    const onlyDefault = db
      .prepare(
        `SELECT id, media FROM hero_slides WHERE active = 1 AND media IN ('/images/hero.png', '') LIMIT 2`
      )
      .all() as { id: number; media: string }[];
    const totalActive = (
      db.prepare("SELECT COUNT(*) AS n FROM hero_slides WHERE active = 1").get() as { n: number }
    ).n;
    if (totalActive === 1 && onlyDefault.length === 1 && onlyDefault[0].media === "/images/hero.png") {
      db.prepare(
        `UPDATE hero_slides
         SET media = ?, media_type = ?, poster = ?, title = ?, subtitle = ?, link_href = ?, link_label = ?, duration_ms = 8000
         WHERE id = ?`
      ).run(
        "/images/hero-lab.mp4",
        "video",
        "/images/hero-lab-poster.jpg",
        "Lab-backed certification",
        "Testing coordination, recognised labs and clear cost ranges",
        "/labs",
        "Browse testing labs",
        onlyDefault[0].id
      );
    }
  }
}
