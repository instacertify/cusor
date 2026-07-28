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
      <h1 className="font-display text-3xl font-semibold text-ink-950">Search is temporarily unavailable</h1>
      <p className="mt-3 text-sm text-ink-600">
        Something went wrong loading results. Stay on Certko — try again, or pick a section below.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold px-5 py-2.5"
        >
          Try again
        </button>
        <Link
          href="/products/all"
          className="min-h-11 inline-flex items-center rounded-xl border border-cream-300 bg-white text-sm font-bold text-ink-800 px-5 py-2.5 hover:border-butter-500"
        >
          Browse products
        </Link>
        <Link
          href="/certifications"
          className="min-h-11 inline-flex items-center rounded-xl border border-cream-300 bg-white text-sm font-bold text-ink-800 px-5 py-2.5 hover:border-butter-500"
        >
          Certifications
        </Link>
        <Link
          href="/labs"
          className="min-h-11 inline-flex items-center rounded-xl border border-cream-300 bg-white text-sm font-bold text-ink-800 px-5 py-2.5 hover:border-butter-500"
        >
          Labs
        </Link>
        <Link
          href="/contact"
          className="min-h-11 inline-flex items-center rounded-xl bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-bold px-5 py-2.5"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
