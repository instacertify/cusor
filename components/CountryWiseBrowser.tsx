"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import MarketCard from "@/components/MarketCard";

export type CountryBrowseCard = {
  slug: string;
  name: string;
  shortName: string;
  intro: string;
  regionId: string;
  regionLabel: string;
  schemeNames: string[];
  schemeCount: number;
  href: string;
};

export default function CountryWiseBrowser({
  countries,
  regions,
}: {
  countries: CountryBrowseCard[];
  regions: { id: string; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      if (region !== "all" && c.regionId !== region) return false;
      if (!deferred) return true;
      const blob = [
        c.name,
        c.shortName,
        c.intro,
        c.regionLabel,
        ...c.schemeNames,
      ]
        .join(" ")
        .toLowerCase();
      return deferred.split(/\s+/).every((token) => blob.includes(token));
    });
  }, [countries, deferred, region]);

  const grouped = useMemo(() => {
    const map = new Map<string, CountryBrowseCard[]>();
    for (const c of filtered) {
      const list = map.get(c.regionId) || [];
      list.push(c);
      map.set(c.regionId, list);
    }
    return regions
      .filter((r) => map.has(r.id))
      .map((r) => ({ ...r, hubs: map.get(r.id)! }));
  }, [filtered, regions]);

  return (
    <div className="mt-8">
      <label className="block max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
          Search certifications by market
        </span>
        <span className="mt-2 flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-3 shadow-sm focus-within:border-butter-500 focus-within:ring-2 focus-within:ring-butter-300/60">
          <Icon name="search" size={18} className="shrink-0 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try China, ANATEL, SONCAP, PSE, KC…"
            className="w-full min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
            autoComplete="off"
          />
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRegion("all")}
          className={`min-h-9 rounded-xl px-3 text-xs font-semibold transition ${
            region === "all"
              ? "bg-ink-950 text-cream-50"
              : "border border-cream-300 bg-white text-ink-700 hover:border-butter-500"
          }`}
        >
          All regions
        </button>
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={`min-h-9 rounded-xl px-3 text-xs font-semibold transition ${
              region === r.id
                ? "bg-ink-950 text-cream-50"
                : "border border-cream-300 bg-white text-ink-700 hover:border-butter-500"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink-500" aria-live="polite">
        {filtered.length === countries.length
          ? `${countries.length} markets`
          : `${filtered.length} of ${countries.length} markets match`}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-ink-600">
          No market matches that search. Try a country (China, Brazil, Nigeria) or a
          scheme (CCC, ANATEL, SONCAP, PSE).
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {grouped.map((group) => (
            <section key={group.id} aria-labelledby={`region-${group.id}`}>
              <h2
                id={`region-${group.id}`}
                className="font-display text-xl font-semibold text-ink-950"
              >
                {group.label}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.hubs.map((c) => (
                  <li key={c.slug} className="h-full">
                    <MarketCard
                      href={c.href}
                      title={c.shortName}
                      eyebrow={`${c.schemeCount} scheme${c.schemeCount === 1 ? "" : "s"}`}
                      schemesLine={c.schemeNames.join(" · ")}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
