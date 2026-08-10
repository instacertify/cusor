import Link from "next/link";

/** Shared 404 UI for `app/not-found.tsx` and segment not-found boundaries. */
export default function NotFoundView() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-butter-700">404</p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-ink-950 tracking-tight">
        Page not found
      </h1>
      <p className="mt-4 text-ink-600 leading-relaxed">
        That URL is not on Certko. Try search, or jump back to certifications, testing or the home
        page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-butter-500 px-5 text-sm font-semibold text-ink-950 transition hover:bg-butter-400"
        >
          Search Certko
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 px-5 text-sm font-semibold text-ink-800 transition hover:border-butter-400"
        >
          Back to home
        </Link>
        <Link
          href="/testing"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 px-5 text-sm font-semibold text-ink-800 transition hover:border-butter-400"
        >
          Product testing
        </Link>
      </div>
    </div>
  );
}
