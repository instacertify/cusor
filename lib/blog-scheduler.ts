import { getDb, type Post } from "./db";
import {
  isBlogPublishDue,
  parseScheduleInput,
  seedStatusForPublishAt,
  toDatetimeLocalValue,
} from "./blog-schedule-time";

export type BlogPostStatus = "draft" | "scheduled" | "published";

export {
  isBlogPublishDue,
  parseScheduleInput,
  seedStatusForPublishAt,
  toDatetimeLocalValue,
};

const SCHEDULER_INTERVAL_MS = 30_000;

declare global {
  // eslint-disable-next-line no-var
  var __certkoBlogSchedulerStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __certkoBlogSchedulerTimer: ReturnType<typeof setInterval> | undefined;
}

export function isBlogPubliclyVisible(
  post: Pick<Post, "status" | "published_at">,
  now = new Date()
): boolean {
  if (post.status !== "published") return false;
  // No stamp → treat as live (legacy rows). Future stamp → stay hidden.
  if (!post.published_at) return true;
  return isBlogPublishDue(post.published_at, now);
}

export type PublishDueResult = {
  publishedIds: number[];
  publishedSlugs: string[];
  demotedIds: number[];
  demotedSlugs: string[];
};

/**
 * Demote mistakenly live posts whose publish stamp is still in the future.
 * Idempotent. Fixes seed/import rows that were inserted as status=published too early.
 */
export function demoteFuturePublishedPosts(now = new Date()): {
  demotedIds: number[];
  demotedSlugs: string[];
} {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, slug, published_at FROM posts
       WHERE status = 'published'
         AND published_at IS NOT NULL
         AND published_at != ''`
    )
    .all() as Array<{ id: number; slug: string; published_at: string }>;

  const demotedIds: number[] = [];
  const demotedSlugs: string[] = [];
  const update = db.prepare(
    `UPDATE posts SET status = 'scheduled' WHERE id = ? AND status = 'published'`
  );

  const tx = db.transaction(() => {
    for (const row of rows) {
      if (isBlogPublishDue(row.published_at, now)) continue;
      const res = update.run(row.id);
      if (res.changes > 0) {
        demotedIds.push(row.id);
        demotedSlugs.push(row.slug);
      }
    }
  });
  tx();

  if (demotedIds.length > 0) {
    console.info(
      `[certko] blog scheduler demoted ${demotedIds.length} future-dated post(s):`,
      demotedSlugs.join(", ")
    );
  }

  return { demotedIds, demotedSlugs };
}

/**
 * Flip due `scheduled` posts to `published`, and demote future-dated `published` posts.
 * Safe to call often (idempotent). Never touches cover images.
 */
export function publishDueBlogPosts(now = new Date()): PublishDueResult {
  const demoted = demoteFuturePublishedPosts(now);

  const db = getDb();
  const nowIso = now.toISOString();
  const due = db
    .prepare(
      `SELECT id, slug, published_at FROM posts
       WHERE status = 'scheduled'
         AND published_at IS NOT NULL
         AND published_at != ''`
    )
    .all() as Array<{ id: number; slug: string; published_at: string }>;

  const publishedIds: number[] = [];
  const publishedSlugs: string[] = [];
  const update = db.prepare(
    `UPDATE posts SET status = 'published' WHERE id = ? AND status = 'scheduled'`
  );

  const tx = db.transaction(() => {
    for (const row of due) {
      if (!isBlogPublishDue(row.published_at, now)) continue;
      const res = update.run(row.id);
      if (res.changes > 0) {
        publishedIds.push(row.id);
        publishedSlugs.push(row.slug);
      }
    }
  });
  tx();

  if (publishedIds.length > 0 || demoted.demotedIds.length > 0) {
    if (publishedIds.length > 0) {
      console.info(
        `[certko] blog scheduler published ${publishedIds.length} post(s) at ${nowIso}:`,
        publishedSlugs.join(", ")
      );
    }
    void import("./sitemap-xml")
      .then((m) => m.refreshSitemapFiles())
      .catch(() => {
        /* non-fatal */
      });
  }

  return {
    publishedIds,
    publishedSlugs,
    demotedIds: demoted.demotedIds,
    demotedSlugs: demoted.demotedSlugs,
  };
}

/** Resolve form status + publish_at into a safe DB status / timestamp pair. */
export function resolveBlogScheduleState(opts: {
  requestedStatus: string;
  publishAtRaw: string;
  existingPublishedAt: string | null;
  now?: Date;
}): {
  status: BlogPostStatus;
  publishedAt: string | null;
  error?: string;
} {
  const now = opts.now ?? new Date();
  const requested = opts.requestedStatus.trim().toLowerCase();

  if (requested === "scheduled") {
    const when = parseScheduleInput(opts.publishAtRaw);
    if (!when) {
      return {
        status: "draft",
        publishedAt: opts.existingPublishedAt,
        error: "schedule_required",
      };
    }
    const iso = when.toISOString();
    if (isBlogPublishDue(iso, now)) {
      return { status: "published", publishedAt: iso };
    }
    return { status: "scheduled", publishedAt: iso };
  }

  if (requested === "published") {
    const when = parseScheduleInput(opts.publishAtRaw);
    if (when) {
      const iso = when.toISOString();
      // Future "Publish at" while choosing Published → treat as scheduled (bug-free).
      if (!isBlogPublishDue(iso, now)) {
        return { status: "scheduled", publishedAt: iso };
      }
      return { status: "published", publishedAt: iso };
    }
    return {
      status: "published",
      publishedAt: opts.existingPublishedAt ?? now.toISOString(),
    };
  }

  // draft
  const when = parseScheduleInput(opts.publishAtRaw);
  return {
    status: "draft",
    publishedAt: when ? when.toISOString() : opts.existingPublishedAt,
  };
}

/**
 * Start a process-local interval that publishes due posts.
 * Idempotent across hot reloads / repeated register() calls.
 */
export function startBlogScheduler(): void {
  if (globalThis.__certkoBlogSchedulerStarted) return;
  globalThis.__certkoBlogSchedulerStarted = true;

  const tick = () => {
    try {
      publishDueBlogPosts();
    } catch (err) {
      console.error("[certko] blog scheduler tick failed:", err);
    }
  };

  // Run once on boot, then every 30s.
  tick();
  globalThis.__certkoBlogSchedulerTimer = setInterval(tick, SCHEDULER_INTERVAL_MS);
  // Do not keep the Node process alive solely for the timer in edge cases.
  globalThis.__certkoBlogSchedulerTimer.unref?.();
}
