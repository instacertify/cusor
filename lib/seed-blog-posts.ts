import type { SqliteDatabase } from "./sqlite";

export type BlogPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  content: string;
  /**
   * Cover image path for **new** inserts only.
   * Prefer leaving empty (`''`) — editors set covers in `/admin/blog` after login.
   * Never used to overwrite an existing post’s image.
   */
  image?: string;
};

/**
 * Insert published blog posts when their slug is missing.
 *
 * **Image policy (do not break):**
 * - Existing posts are never updated — title, content, and especially `image` stay as-is.
 * - Cover images on older blogs are owned by admins via the backend (`savePost`).
 * - New seeded posts default to `image = ''` so covers can be uploaded later in admin.
 */
export function insertBlogPostsIfMissing(
  db: SqliteDatabase,
  posts: readonly BlogPostSeed[]
): void {
  const author = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (!author) return;

  const exists = db.prepare("SELECT id FROM posts WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO posts
      (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const p of posts) {
      if (exists.get(p.slug)) continue;
      insert.run(
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.image ?? "",
        author.name,
        author.id,
        p.published_at,
        p.meta_title,
        p.meta_description
      );
    }
  });
  tx();
}
