import type { SqliteDatabase } from "./sqlite";
import path from "path";
import type { HeroSlide } from "./db";

export const HERO_IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp"];
export const HERO_VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
export const HERO_MEDIA_EXTS = [...HERO_IMAGE_EXTS, ...HERO_VIDEO_EXTS];

export type HeroBackgroundSlide = {
  id: string;
  label: string;
  href: string;
  ctaLabel: string;
  videoSrc: string;
  gifSrc?: string;
  posterSrc: string;
};

export function mediaTypeFromPath(filePath: string): "image" | "gif" | "video" {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".gif") return "gif";
  if (HERO_VIDEO_EXTS.includes(ext)) return "video";
  return "image";
}

/** Default homepage hero scroll: electronic → mechanical → EMC → chemical → certification. */
export const DEFAULT_TESTING_HERO_SLIDES = [
  {
    title: "Electronic Testing",
    subtitle: "Safety, performance and quality tests for electrical & electronic products",
    media: "/images/testing/electrical-testing.mp4",
    poster: "/images/testing/electrical-poster.jpg",
    link_href: "/testing/electrical-testing",
    link_label: "Explore more",
    duration_ms: 7000,
    sort: 0,
  },
  {
    title: "Mechanical Testing",
    subtitle: "Strength, durability and physical performance testing for materials & parts",
    media: "/images/testing/mechanical-testing.mp4",
    poster: "/images/testing/mechanical-poster.jpg",
    link_href: "/testing/mechanical-testing",
    link_label: "Explore more",
    duration_ms: 7000,
    sort: 1,
  },
  {
    title: "EMC Testing",
    subtitle: "EMI/EMC emissions and immunity testing for product quality and market access",
    media: "/images/testing/emc-testing.mp4",
    poster: "/images/testing/emc-poster.jpg",
    link_href: "/testing/emc-testing",
    link_label: "Explore more",
    duration_ms: 7000,
    sort: 2,
  },
  {
    title: "Chemical & Quality Testing",
    subtitle: "Composition, restricted substances and quality screens for safer products",
    media: "/images/testing/chemical-testing.mp4",
    poster: "/images/testing/chemical-poster.jpg",
    link_href: "/testing/chemical-testing",
    link_label: "Explore more",
    duration_ms: 7000,
    sort: 3,
  },
  {
    title: "Certification Quality",
    subtitle: "Lab-backed certification pathways across product categories — BIS, CE, SABER & more",
    media: "/images/testing/certification-quality.mp4",
    poster: "/images/testing/certification-poster.jpg",
    link_href: "/certifications",
    link_label: "Explore more",
    duration_ms: 7000,
    sort: 4,
  },
] as const;

/** Map DB hero slides into the full-bleed background video carousel. */
export function heroSlidesToBackground(slides: HeroSlide[]): HeroBackgroundSlide[] {
  return slides
    .filter((s) => s.media)
    .map((s) => {
      const ext = path.extname(s.media).toLowerCase();
      const base = s.media.replace(/\.[^.]+$/, "");
      const isVideo = HERO_VIDEO_EXTS.includes(ext);
      const isGif = ext === ".gif";
      const guessedPoster = `${base
        .replace(/-testing$/, "")
        .replace(/-quality$/, "")}-poster.jpg`;
      return {
        id: String(s.id),
        label: s.title || "Testing",
        href: s.link_href || "/testing",
        ctaLabel: (s.link_label || "Explore more").trim() || "Explore more",
        videoSrc: isVideo ? s.media : `${base}.mp4`,
        gifSrc: isGif ? s.media : `${base}.gif`,
        posterSrc: s.poster || guessedPoster,
      };
    });
}

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

  // Soft upgrade path B: single lab video seed → expand with full category set
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

  // Soft upgrade path C: ensure all category slides exist when missing by media path
  const medias = new Set(
    (
      db.prepare("SELECT media FROM hero_slides").all() as { media: string }[]
    ).map((r) => r.media)
  );
  for (const slide of DEFAULT_TESTING_HERO_SLIDES) {
    if (!medias.has(slide.media)) insertSlide(db, slide);
  }

  // Soft upgrade path D: normalize Explore more labels on known default media rows.
  db.prepare(
    `UPDATE hero_slides SET link_label = 'Explore more'
     WHERE media IN (?, ?, ?, ?, ?)
       AND (link_label = '' OR link_label IN (
         'Browse electronic tests', 'Browse mechanical tests', 'Explore all testing', 'Learn more'
       ))`
  ).run(
    "/images/testing/electrical-testing.mp4",
    "/images/testing/mechanical-testing.mp4",
    "/images/testing/emc-testing.mp4",
    "/images/testing/chemical-testing.mp4",
    "/images/testing/certification-quality.mp4"
  );

  // Soft upgrade path E: hide retired single lab clip once the 5-category set exists.
  const hasCategorySet = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM hero_slides
         WHERE media IN (
           '/images/testing/electrical-testing.mp4',
           '/images/testing/mechanical-testing.mp4',
           '/images/testing/emc-testing.mp4',
           '/images/testing/chemical-testing.mp4',
           '/images/testing/certification-quality.mp4'
         )`
      )
      .get() as { n: number }
  ).n;
  if (hasCategorySet >= 5) {
    db.prepare(
      `UPDATE hero_slides SET active = 0
       WHERE media = '/images/hero-lab.mp4' AND active = 1`
    ).run();
  }
}
