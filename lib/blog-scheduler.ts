import { getDb, type Post } from "./db";

export type BlogPostStatus = "draft" | "scheduled" | "published";

const SCHEDULER_INTERVAL_MS = 30_000;
const DUE_GRACE_MS = 2_000;

declare global {
  // eslint-disable-next-line no-var
  var __certkoBlogSchedulerStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __certkoBlogSchedulerTimer: ReturnType<typeof setInterval> | undefined;
}

/** Parse admin datetime-local / ISO / date-only into a valid Date, or null. */
export function parseScheduleInput(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;
  // date-only → local noon (avoids previous-day UTC surprises in most TZ)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Value for `<input type="datetime-local">` from a stored published_at. */
export function toDatetimeLocalValue(stored: string | null | undefined): string {
  if (!stored) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(stored)) return `${stored}T09:00`;
  const d = new Date(stored);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isBlogPublishDue(
  publishedAt: string | null | undefined,
  now = new Date()
): boolean {
  if (!publishedAt) return false;
  const when = parseScheduleInput(publishedAt);
  if (!when) return false;
  return when.getTime() <= now.getTime() + DUE_GRACE_MS;
}

export function isBlogPubliclyVisible(
  post: Pick<Post, "status" | "published_at">,
  _now = new Date()
): boolean {
  // Scheduled / draft stay hidden. Once status flips to published, the post is live.
  // (published_at may be an editorial date and must not hide already-published posts.)
  void _now;
  return post.status === "published";
}

export type PublishDueResult = {
  publishedIds: number[];
  publishedSlugs: string[];
};

/**
 * Flip due `scheduled` posts to `published`.
 * Safe to call often (idempotent). Never touches cover images.
 */
export function publishDueBlogPosts(now = new Date()): PublishDueResult {
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

  // Also catch status=published with a future stamp that somehow got set — leave those
  // hidden via isBlogPubliclyVisible until due; do not auto-change them here.

  if (publishedIds.length > 0) {
    console.info(
      `[certko] blog scheduler published ${publishedIds.length} post(s) at ${nowIso}:`,
      publishedSlugs.join(", ")
    );
    void import("./sitemap-xml")
      .then((m) => m.refreshSitemapFiles())
      .catch(() => {
        /* non-fatal */
      });
  }

  return { publishedIds, publishedSlugs };
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
