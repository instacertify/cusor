"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CertProduct } from "@/lib/db";
import { formatPriceRange } from "@/lib/format";
import RequestQuoteButton from "./RequestQuoteButton";

const REGIME_ORDER = ["mandatory", "voluntary"];

function regimeSortKey(regime: string) {
  const key = regime.trim().toLowerCase();
  const idx = REGIME_ORDER.indexOf(key);
  return idx === -1 ? 100 + key.charCodeAt(0) : idx;
}

function regimeAccent(regime: string) {
  const key = regime.toLowerCase();
  if (key.includes("mandatory")) {
    return {
      badge: "bg-red-100 text-red-800",
      bar: "border-red-200",
      heading: "text-red-900",
    };
  }
  if (key.includes("voluntary")) {
    return {
      badge: "bg-emerald-100 text-emerald-800",
      bar: "border-emerald-200",
      heading: "text-emerald-900",
    };
  }
  return {
    badge: "bg-cream-200 text-ink-700",
    bar: "border-cream-300",
    heading: "text-ink-900",
  };
}

export default function CertProductCatalog({
  items,
  certSlug,
  certName,
  title,
  subtitle,
}: {
  items: CertProduct[];
  certSlug: string;
  certName?: string;
  title: string;
  subtitle?: string;
}) {
  const [q, setQ] = useState("");
  const [regime, setRegime] = useState("all");

  const regimes = useMemo(() => {
    const unique = [...new Set(items.map((i) => i.regime).filter(Boolean))];
    return unique.sort((a, b) => {
      const diff = regimeSortKey(a) - regimeSortKey(b);
      return diff !== 0 ? diff : a.localeCompare(b);
    });
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (regime !== "all" && i.regime !== regime) return false;
      if (!needle) return true;
      return (
        i.name.toLowerCase().includes(needle) ||
        i.standards.toLowerCase().includes(needle) ||
        i.family.toLowerCase().includes(needle) ||
        i.regime.toLowerCase().includes(needle)
      );
    });
  }, [items, q, regime]);

  const grouped = useMemo(() => {
    const map = new Map<string, CertProduct[]>();
    for (const item of filtered) {
      const key = item.regime?.trim() || "Other";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const diff = regimeSortKey(a) - regimeSortKey(b);
      return diff !== 0 ? diff : a.localeCompare(b);
    });
  }, [filtered]);

  const hasRegimes = regimes.length > 0;

  return (
    <section id="products-covered" className="mt-14 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-ink-600 max-w-3xl">{subtitle}</p>
          )}
        </div>
        <p className="text-sm text-ink-500 shrink-0">
          {filtered.length} of {items.length} products
        </p>
      </div>

      {hasRegimes && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRegime("all")}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold border transition min-h-10 ${
              regime === "all"
                ? "bg-ink-950 text-white border-ink-950"
                : "bg-white text-ink-700 border-cream-300 hover:border-butter-500"
            }`}
          >
            All ({items.length})
          </button>
          {regimes.map((r) => {
            const count = items.filter((i) => i.regime === r).length;
            const active = regime === r;
            const accent = regimeAccent(r);
            return (
              <button
                type="button"
                key={r}
                onClick={() => setRegime(r)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold border transition min-h-10 ${
                  active
                    ? "bg-ink-950 text-white border-ink-950"
                    : `bg-white border-cream-300 hover:border-butter-500 ${accent.heading}`
                }`}
              >
                {r} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product, standard, or family…"
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 min-h-11"
        />
      </div>

      <div className="mt-8 space-y-10">
        {grouped.map(([groupName, groupItems]) => {
          const accent = regimeAccent(groupName);
          return (
            <div key={groupName}>
              <div className={`flex flex-wrap items-baseline justify-between gap-2 border-b ${accent.bar} pb-3 mb-4`}>
                <h3 className={`font-display text-xl sm:text-2xl font-semibold ${accent.heading}`}>
                  {groupName} products covered
                </h3>
                <span className={`text-xs font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${accent.badge}`}>
                  {groupItems.length} option{groupItems.length === 1 ? "" : "s"}
                </span>
              </div>

              <ol className="grid gap-3 sm:grid-cols-2">
                {groupItems.map((item, index) => (
                  <li
                    key={item.id}
                    className="bg-white rounded-2xl border border-cream-300 p-4 sm:p-5 hover:border-butter-500 transition flex flex-col gap-3"
                  >
                    <Link
                      href={`/certifications/${certSlug}/products/${item.slug}`}
                      className="block min-w-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-7 h-7 rounded-lg bg-cream-100 text-ink-600 text-xs font-bold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-ink-950 leading-snug">{item.name}</h4>
                            {item.regime && (
                              <span
                                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${accent.badge}`}
                              >
                                {item.regime}
                              </span>
                            )}
                          </div>
                          {item.standards ? (
                            <p className="mt-2 text-xs text-ink-500 font-mono line-clamp-2">
                              {item.standards}
                            </p>
                          ) : null}
                          <div className="mt-3 flex items-center justify-between text-xs text-ink-600">
                            <span>
                              {formatPriceRange(item.min_price, item.max_price)} testing
                            </span>
                            <span className="font-semibold text-butter-700">View details →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="pt-2 border-t border-cream-200">
                      <RequestQuoteButton
                        subject={certName ? `${item.name} — ${certName}` : item.name}
                        kind="certification"
                        variant="compact"
                        short
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-ink-500 text-center py-8">
            No products match that filter.
          </p>
        )}
      </div>
    </section>
  );
}
