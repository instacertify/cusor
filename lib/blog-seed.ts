import type { SqliteDatabase } from "./sqlite";
import { seedStatusForPublishAt } from "./blog-schedule-time";

export type SeedBlogPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  /** Prefer '' — covers are owned in admin after upload. Never overwritten later. */
  image?: string;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  status?: string;
};

/**
 * Insert-if-missing by slug only.
 * Never updates title/excerpt/content/meta/image — so manual blogs and
 * admin cover uploads stay intact when new code is deployed / DB ensure runs.
 */
export function insertBlogPostsIfMissing(
  db: SqliteDatabase,
  posts: SeedBlogPostInput[],
  author: { id: number; name: string }
): number {
  if (!posts.length) return 0;
  const exists = db.prepare("SELECT id FROM posts WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO posts
      (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
  const tx = db.transaction(() => {
    for (const p of posts) {
      if (exists.get(p.slug)) continue;
      const publishedAt = p.published_at;
      const status = p.status ?? seedStatusForPublishAt(publishedAt);
      insert.run(
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.image ?? "",
        author.name,
        author.id,
        status,
        publishedAt,
        p.meta_title ?? `${p.title} | Certko Blog`,
        p.meta_description ?? p.excerpt.slice(0, 160)
      );
      inserted += 1;
    }
  });
  tx();
  return inserted;
}

/**
 * Refresh seeded article copy by slug while **never** touching `image`.
 * Use only when intentionally revising seeded content — not for routine deploys.
 */
export function upsertBlogPostCopyPreservingImage(
  db: SqliteDatabase,
  post: SeedBlogPostInput,
  author: { id: number; name: string }
): void {
  const row = db
    .prepare("SELECT id, image FROM posts WHERE slug = ?")
    .get(post.slug) as { id: number; image: string } | undefined;

  if (!row) {
    insertBlogPostsIfMissing(db, [post], author);
    return;
  }

  const publishedAt = post.published_at;
  const status = post.status ?? seedStatusForPublishAt(publishedAt);
  db.prepare(
    `UPDATE posts
     SET title = ?, excerpt = ?, content = ?, author = ?, author_id = ?,
         status = ?, published_at = ?, meta_title = ?, meta_description = ?
     WHERE id = ?`
  ).run(
    post.title,
    post.excerpt,
    post.content,
    author.name,
    author.id,
    status,
    publishedAt,
    post.meta_title ?? `${post.title} | Certko Blog`,
    post.meta_description ?? post.excerpt.slice(0, 160),
    row.id
  );
}
