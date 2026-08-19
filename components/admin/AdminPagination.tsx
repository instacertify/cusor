import Link from "next/link";
import { ADMIN_PAGE_SIZE, adminListHref } from "@/lib/admin-list";

const btn =
  "inline-flex items-center justify-center min-h-10 min-w-10 px-3 rounded-xl border text-sm font-semibold transition";
const idle = `${btn} bg-white border-cream-300 text-ink-800 hover:border-butter-500`;
const active = `${btn} bg-ink-900 border-ink-900 text-white`;
const disabled = `${btn} bg-cream-100 border-cream-200 text-ink-400 cursor-not-allowed`;

export default function AdminPagination({
  page,
  total,
  path,
  params = {},
  pageSize = ADMIN_PAGE_SIZE,
  noun = "items",
}: {
  page: number;
  total: number;
  path: string;
  params?: Record<string, string | number | undefined | null>;
  pageSize?: number;
  noun?: string;
}) {
  const pages = Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
  if (pages <= 1) return null;

  const href = (n: number) => adminListHref(path, params, n);
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  const windowStart = end - start < 4 ? Math.max(1, end - 4) : start;
  const nums: number[] = [];
  for (let n = windowStart; n <= end; n++) nums.push(n);

  return (
    <nav className="mt-6 flex flex-col items-center gap-2" aria-label="Pagination">
      <p className="text-sm text-ink-600">
        Page {page} of {pages}
        <span className="text-ink-400">
          {" "}
          · {total.toLocaleString("en-IN")} {noun} · {pageSize} per page
        </span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={idle} aria-label="Previous page">
            ← Prev
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            ← Prev
          </span>
        )}
        {nums.map((n) =>
          n === page ? (
            <span key={n} className={active} aria-current="page">
              {n}
            </span>
          ) : (
            <Link key={n} href={href(n)} className={idle} aria-label={`Page ${n}`}>
              {n}
            </Link>
          )
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className={idle} aria-label="Next page">
            Next →
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
