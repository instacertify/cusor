"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[certko] search page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink-950">
        Search couldn’t finish
      </h1>
      <p className="mt-3 text-ink-600 text-sm leading-relaxed">
        Something went wrong loading results. Try again, or pick a related option below —
        you won’t get stuck on a blank page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-xl bg-ink-900 px-5 text-sm font-bold text-white hover:bg-ink-800"
        >
          Try again
        </button>
        <Link
          href="/search?q=cable"
          className="min-h-11 inline-flex items-center rounded-xl border border-cream-300 px-5 text-sm font-bold text-ink-900 hover:border-butter-500"
        >
          Search “cable”
        </Link>
        <Link
          href="/products"
          className="min-h-11 inline-flex items-center rounded-xl border border-cream-300 px-5 text-sm font-bold text-ink-900 hover:border-butter-500"
        >
          Browse products
        </Link>
        <Link
          href="/contact"
          className="min-h-11 inline-flex items-center rounded-xl bg-butter-500 px-5 text-sm font-bold text-ink-950 hover:bg-butter-400"
        >
          Ask an expert
        </Link>
      </div>
    </div>
  );
}
