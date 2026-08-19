"use client";

import { useState } from "react";
import Link from "next/link";
import CmsImage from "@/components/CmsImage";
import Icon from "@/components/Icon";

export type BlogMoreItem = {
  id: number;
  slug: string;
  title: string;
  image: string;
  published_at: string | null;
};

/** First paint: a short list, no scrollbar. */
const INITIAL_COUNT = 3;
/** Each “Show more” click reveals this many additional posts. */
const STEP = 3;

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogMorePostsList({
  title,
  subtitle,
  posts,
}: {
  title: string;
  subtitle: string;
  posts: BlogMoreItem[];
}) {
  const [visible, setVisible] = useState(Math.min(INITIAL_COUNT, posts.length));
  const shown = posts.slice(0, visible);
  const remaining = posts.length - visible;
  const canShowMore = remaining > 0;
  /* Scroll only inside More blogs — and only after the user expands past the short list */
  const listScrolls = visible > INITIAL_COUNT;

  return (
    <section className="rounded-2xl border border-cream-300 bg-white shadow-card overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-cream-200 bg-cream-50/80 shrink-0">
        <h2 className="font-display text-base sm:text-lg font-semibold text-ink-950 leading-snug">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs text-ink-500 mt-1 leading-relaxed">{subtitle}</p>
        ) : null}
      </div>

      <div
        className={
          "divide-y divide-cream-200 " +
          (listScrolls
            ? "max-h-[20rem] overflow-y-auto overscroll-contain"
            : "")
        }
      >
        {shown.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group flex gap-3 px-4 py-3.5 hover:bg-cream-50 transition"
          >
            {p.image ? (
              <CmsImage
                src={p.image}
                alt=""
                width={64}
                height={64}
                className="w-14 h-14 rounded-lg object-cover border border-cream-200 shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-lg bg-cream-100 border border-cream-200 shrink-0"
                aria-hidden
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-ink-500">
                {formatDate(p.published_at)}
              </p>
              <h3 className="mt-0.5 font-display text-sm font-semibold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
                {p.title}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-butter-700">
                Read <Icon name="arrow-right" size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {canShowMore ? (
        <div className="shrink-0 border-t border-cream-200 bg-cream-50/60 px-4 py-3">
          <button
            type="button"
            onClick={() => setVisible((n) => Math.min(n + STEP, posts.length))}
            className="w-full min-h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm font-bold text-butter-700 hover:border-butter-500 hover:bg-butter-50 transition"
          >
            Show more ({remaining} more)
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
