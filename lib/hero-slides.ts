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

/** Default homepage hero scroll: electronic → mechanical → lab. */
export const DEFAULT_TESTING_HERO_SLIDES = [
  {
    title: "Electronic Testing",
    subtitle: "Safety, EMC and performance tests for electrical & electronic products",
    media: "/images/testing/electrical-testing.mp4",
    poster: "/images/testing/electrical-poster.jpg",
    link_href: "/testing/electrical-testing",
    link_label: "Browse electronic tests",
    duration_ms: 7000,
    sort: 0,
  },
  {
    title: "Mechanical Testing",
    subtitle: "Strength, durability and physical performance testing for materials & parts",
    media: "/images/testing/mechanical-testing.mp4",
    poster: "/images/testing/mechanical-poster.jpg",
    link_href: "/testing/mechanical-testing",
    link_label: "Browse mechanical tests",
    duration_ms: 7000,
    sort: 1,
  },
  {
    title: "Lab-backed certification",
    subtitle: "Testing coordination, recognised labs and clear cost ranges",
    media: "/images/hero-lab.mp4",
    poster: "/images/hero-lab-poster.jpg",
    link_href: "/testing",
    link_label: "Explore all testing",
    duration_ms: 7000,
    sort: 2,
  },
] as const;

function insertSlide(
  db: SqliteDatabase,
  slide: (typeof DEFAULT_TESTING_HERO_SLIDES)[number]
) {
  db.prepare(
    `INSERT INTO hero_slides (title, subtitle, media, media_type, poster, link_href, link_label, duration_ms, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(
    slide.title,
    slide.subtitle,
    slide.media,
    mediaTypeFromPath(slide.media),
    slide.poster,
    slide.link_href,
    slide.link_label,
    slide.duration_ms,
    slide.sort
  );
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
    for (const slide of DEFAULT_TESTING_HERO_SLIDES) insertSlide(db, slide);
    return;
  }

  // Soft upgrade path A: original static hero.png only
  const onlyDefault = db
    .prepare(
      `SELECT id, media FROM hero_slides WHERE active = 1 AND media IN ('/images/hero.png', '') LIMIT 2`
    )
    .all() as { id: number; media: string }[];
  const totalActive = (
    db.prepare("SELECT COUNT(*) AS n FROM hero_slides WHERE active = 1").get() as { n: number }
  ).n;
  if (totalActive === 1 && onlyDefault.length === 1 && onlyDefault[0].media === "/images/hero.png") {
    db.prepare("DELETE FROM hero_slides WHERE id = ?").run(onlyDefault[0].id);
    for (const slide of DEFAULT_TESTING_HERO_SLIDES) insertSlide(db, slide);
    return;
  }

  // Soft upgrade path B: single lab video seed → expand with electronic + mechanical
  const active = db
    .prepare(`SELECT id, media FROM hero_slides WHERE active = 1 ORDER BY sort, id`)
    .all() as { id: number; media: string }[];
  if (
    active.length === 1 &&
    (active[0].media === "/images/hero-lab.mp4" || active[0].media === "/images/hero.png")
  ) {
    db.prepare("DELETE FROM hero_slides WHERE id = ?").run(active[0].id);
    for (const slide of DEFAULT_TESTING_HERO_SLIDES) insertSlide(db, slide);
    return;
  }

  // Soft upgrade path C: ensure electronic + mechanical slides exist when missing
  const medias = new Set(
    (
      db.prepare("SELECT media FROM hero_slides").all() as { media: string }[]
    ).map((r) => r.media)
  );
  for (const slide of DEFAULT_TESTING_HERO_SLIDES) {
    if (!medias.has(slide.media)) insertSlide(db, slide);
  }
}
