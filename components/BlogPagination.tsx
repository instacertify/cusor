import Link from "next/link";

const PAGE_SIZE = 12;

export { PAGE_SIZE as BLOG_PAGE_SIZE };

function pageHref(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q?.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

/** Build a short window of page numbers around the current page (e.g. 1,2,3). */
export function blogPageWindow(current: number, totalPages: number, windowSize = 3): number[] {
  if (totalPages <= 0) return [];
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > totalPages) {
    end = totalPages;
    start = end - windowSize + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const baseBtn =
  "inline-flex items-center justify-center min-h-11 min-w-11 px-3 rounded-xl border text-sm font-semibold transition";
const idleBtn = `${baseBtn} bg-white border-cream-300 text-ink-800 hover:border-butter-500`;
const activeBtn = `${baseBtn} bg-ink-900 border-ink-900 text-white`;
const disabledBtn = `${baseBtn} bg-cream-100 border-cream-200 text-ink-400 cursor-not-allowed`;

export default function BlogPagination({
  page,
  totalPages,
  totalPosts,
  q = "",
}: {
  page: number;
  totalPages: number;
  totalPosts: number;
  /** Preserve blog search query across pages */
  q?: string;
}) {
  if (totalPages <= 1) return null;

  const window = blogPageWindow(page, totalPages, 3);
  const showLeadingEllipsis = window[0] > 1;
  const showTrailingEllipsis = window[window.length - 1] < totalPages;

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Blog pagination">
      <p className="text-sm text-ink-600">
        Page {page} of {totalPages}
        <span className="text-ink-400"> · {totalPosts} articles</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <Link href={pageHref(1, q)} className={idleBtn} aria-label="First page">
            First
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            First
          </span>
        )}

        {page > 1 ? (
          <Link href={pageHref(page - 1, q)} className={idleBtn} aria-label="Previous page">
            ←
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            ←
          </span>
        )}

        {showLeadingEllipsis ? (
          <span className="px-1 text-ink-400" aria-hidden>
            …
          </span>
        ) : null}

        {window.map((n) =>
          n === page ? (
            <span key={n} className={activeBtn} aria-current="page">
              {n}
            </span>
          ) : (
            <Link key={n} href={pageHref(n, q)} className={idleBtn} aria-label={`Page ${n}`}>
              {n}
            </Link>
          )
        )}

        {showTrailingEllipsis ? (
          <span className="px-1 text-ink-400" aria-hidden>
            …
          </span>
        ) : null}

        {page < totalPages ? (
          <Link href={pageHref(page + 1, q)} className={idleBtn} aria-label="Next page">
            →
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            →
          </span>
        )}

        {page < totalPages ? (
          <Link href={pageHref(totalPages, q)} className={idleBtn} aria-label="Last page">
            Last
          </Link>
        ) : (
          <span className={disabledBtn} aria-disabled="true">
            Last
          </span>
        )}
      </div>
    </nav>
  );
}
