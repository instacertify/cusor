"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export type CountryBrowseCard = {
  slug: string;
  name: string;
  shortName: string;
  intro: string;
  schemeNames: string[];
  schemeCount: number;
  href: string;
};

export default function CountryWiseBrowser({
  countries,
}: {
  countries: CountryBrowseCard[];
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!deferred) return countries;
    return countries.filter((c) => {
      const blob = [c.name, c.shortName, c.intro, ...c.schemeNames]
        .join(" ")
        .toLowerCase();
      return deferred.split(/\s+/).every((token) => blob.includes(token));
    });
  }, [countries, deferred]);

  return (
    <div className="mt-8">
      <label className="block max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          Search certifications country wise
        </span>
        <span className="mt-2 flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-3 shadow-sm focus-within:border-butter-500 focus-within:ring-2 focus-within:ring-butter-300/60">
          <Icon name="search" size={18} className="shrink-0 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try India, CE, SABER, FCC, GCC…"
            className="w-full min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
            autoComplete="off"
          />
        </span>
      </label>

      <p className="mt-3 text-sm text-ink-500" aria-live="polite">
        {filtered.length === countries.length
          ? `${countries.length} markets`
          : `${filtered.length} of ${countries.length} markets match`}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-ink-600">
          No market matches that search. Try a country name (India, Saudi Arabia) or a
          scheme (BIS, CE, FCC, GMARK, SABER).
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-3xl border border-cream-300 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  {c.schemeCount} scheme{c.schemeCount === 1 ? "" : "s"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink-950 group-hover:text-butter-700 transition">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 line-clamp-3">
                  {c.intro}
                </p>
                <p className="mt-4 text-xs font-semibold text-ink-700">
                  {c.schemeNames.join(" · ")}
                </p>
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-bold text-butter-700">
                  View country guide
                  <Icon name="arrow-right" size={15} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
