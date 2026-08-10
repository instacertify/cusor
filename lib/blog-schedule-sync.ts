import type { SqliteDatabase } from "./sqlite";
import { isBlogPublishDue } from "./blog-schedule-time";

export type BlogScheduleSyncResult = {
  publishedIds: number[];
  publishedSlugs: string[];
  demotedIds: number[];
  demotedSlugs: string[];
};

/**
 * Keep every post's status aligned with its publish stamp:
 * - future `published` → `scheduled` (never live early)
 * - due `scheduled` → `published`
 *
 * Safe for FAQ seeds, MSDS seeds, imports, and admin schedules.
 */
export function syncBlogScheduleStatuses(
  db: SqliteDatabase,
  now = new Date()
): BlogScheduleSyncResult {
  const demotedIds: number[] = [];
  const demotedSlugs: string[] = [];
  const publishedIds: number[] = [];
  const publishedSlugs: string[] = [];

  const publishedRows = db
    .prepare(
      `SELECT id, slug, published_at FROM posts
       WHERE status = 'published'
         AND published_at IS NOT NULL
         AND published_at != ''`
    )
    .all() as Array<{ id: number; slug: string; published_at: string }>;

  const demote = db.prepare(
    `UPDATE posts SET status = 'scheduled' WHERE id = ? AND status = 'published'`
  );

  const scheduledRows = db
    .prepare(
      `SELECT id, slug, published_at FROM posts
       WHERE status = 'scheduled'
         AND published_at IS NOT NULL
         AND published_at != ''`
    )
    .all() as Array<{ id: number; slug: string; published_at: string }>;

  const publish = db.prepare(
    `UPDATE posts SET status = 'published' WHERE id = ? AND status = 'scheduled'`
  );

  const tx = db.transaction(() => {
    for (const row of publishedRows) {
      if (isBlogPublishDue(row.published_at, now)) continue;
      if (demote.run(row.id).changes > 0) {
        demotedIds.push(row.id);
        demotedSlugs.push(row.slug);
      }
    }
    for (const row of scheduledRows) {
      if (!isBlogPublishDue(row.published_at, now)) continue;
      if (publish.run(row.id).changes > 0) {
        publishedIds.push(row.id);
        publishedSlugs.push(row.slug);
      }
    }
  });
  tx();

  if (demotedIds.length > 0) {
    console.info(
      `[certko] blog schedule sync demoted ${demotedIds.length} future-dated post(s):`,
      demotedSlugs.join(", ")
    );
  }
  if (publishedIds.length > 0) {
    console.info(
      `[certko] blog schedule sync published ${publishedIds.length} due post(s):`,
      publishedSlugs.join(", ")
    );
  }

  return { publishedIds, publishedSlugs, demotedIds, demotedSlugs };
}
