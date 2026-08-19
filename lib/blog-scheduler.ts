import { getDb, type Post } from "./db";
import {
  isBlogPublishDue,
  parseScheduleInput,
  seedStatusForPublishAt,
  toDatetimeLocalValue,
} from "./blog-schedule-time";
import { syncBlogScheduleStatuses } from "./blog-schedule-sync";

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

/** @deprecated Prefer sync via publishDueBlogPosts — kept for direct repair calls. */
export function demoteFuturePublishedPosts(now = new Date()): {
  demotedIds: number[];
  demotedSlugs: string[];
} {
  const result = syncBlogScheduleStatuses(getDb(), now);
  return { demotedIds: result.demotedIds, demotedSlugs: result.demotedSlugs };
}

/**
 * Align all posts with the scheduler:
 * demote future-dated published posts, publish due scheduled posts (including FAQ).
 * Safe to call often (idempotent). Never touches cover images.
 */
export function publishDueBlogPosts(now = new Date()): PublishDueResult {
  const result = syncBlogScheduleStatuses(getDb(), now);
  const nowIso = now.toISOString();

  if (result.publishedIds.length > 0 || result.demotedIds.length > 0) {
    if (result.publishedIds.length > 0) {
      console.info(
        `[certko] blog scheduler published ${result.publishedIds.length} post(s) at ${nowIso}:`,
        result.publishedSlugs.join(", ")
      );
    }
    void import("./sitemap-xml")
      .then((m) => m.refreshSitemapFiles())
      .catch(() => {
        /* non-fatal */
      });
  }

  return result;
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

  // Bootstrap already syncs schedules in ensureDbReady(); defer the first tick
  // so Hostinger boot is not competing with sitemap rebuild on the event loop.
  const BOOT_TICK_DELAY_MS = 30_000;
  const bootTimer = setTimeout(() => {
    tick();
    globalThis.__certkoBlogSchedulerTimer = setInterval(tick, SCHEDULER_INTERVAL_MS);
    globalThis.__certkoBlogSchedulerTimer.unref?.();
  }, BOOT_TICK_DELAY_MS);
  bootTimer.unref?.();
}
