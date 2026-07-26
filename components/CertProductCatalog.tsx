"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CertProduct } from "@/lib/db";
import { formatPriceRange } from "@/lib/format";
import RequestQuoteButton from "./RequestQuoteButton";

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
  const regimes = useMemo(
    () => [...new Set(items.map((i) => i.regime).filter(Boolean))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (regime !== "all" && i.regime !== regime) return false;
      if (!needle) return true;
      return (
        i.name.toLowerCase().includes(needle) ||
        i.standards.toLowerCase().includes(needle) ||
        i.family.toLowerCase().includes(needle)
      );
    });
  }, [items, q, regime]);

  return (
    <section className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-ink-600 max-w-3xl">{subtitle}</p>
          )}
        </div>
        <p className="text-sm text-ink-500 shrink-0">
          {filtered.length} of {items.length}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product or standard…"
          className="rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 min-h-11"
        />
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
          className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11"
        >
          <option value="all">All regimes</option>
          {regimes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-cream-300 p-4 sm:p-5 hover:border-butter-500 transition flex flex-col gap-3"
          >
            <Link href={`/certifications/${certSlug}/products/${item.slug}`} className="block min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink-950 leading-snug">{item.name}</h3>
                {item.regime && (
                  <span
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                      item.regime.toLowerCase().includes("mandatory")
                        ? "bg-red-100 text-red-700"
                        : "bg-cream-200 text-ink-700"
                    }`}
                  >
                    {item.regime}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-500 font-mono line-clamp-2">{item.standards}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-600">
                <span>{formatPriceRange(item.min_price, item.max_price)} testing</span>
                <span className="font-semibold text-butter-700">View details →</span>
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
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="sm:col-span-2 text-sm text-ink-500 text-center py-8">
            No products match that filter.
          </p>
        )}
      </div>
    </section>
  );
}
