"use client";

import { useMemo, useState } from "react";
import type { GmarkCategory } from "@/lib/gmark";

function Flag({ value }: { value: string }) {
  const v = value.toLowerCase();
  const tone =
    v === "yes"
      ? "bg-green-100 text-green-800"
      : v === "no"
      ? "bg-cream-200 text-ink-600"
      : "bg-butter-300/50 text-butter-800";
  return (
    <span className={`inline-flex text-[11px] font-semibold rounded-full px-2 py-0.5 ${tone}`}>
      {value}
    </span>
  );
}

export default function GmarkCategories({ items }: { items: GmarkCategory[] }) {
  const [q, setQ] = useState("");
  const [family, setFamily] = useState("all");
  const families = useMemo(
    () => [...new Set(items.map((i) => i.family))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (family !== "all" && i.family !== family) return false;
      if (!needle) return true;
      return (
        i.category.toLowerCase().includes(needle) ||
        i.family.toLowerCase().includes(needle) ||
        i.standards.toLowerCase().includes(needle)
      );
    });
  }, [items, q, family]);

  return (
    <section className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">
            GMARK Product Categories
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-600 max-w-3xl">
            Regulated product families under the Gulf Conformity Mark, with main standards and
            whether EMC, IECEE CB and a GSO Notified Body route typically apply.
          </p>
        </div>
        <p className="text-sm text-ink-500 shrink-0">
          {filtered.length} of {items.length} categories
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search category, family or standard…"
          className="rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 min-h-11"
        />
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11"
        >
          <option value="all">All product families</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {filtered.map((item) => (
          <article
            key={item.category}
            className="bg-white rounded-2xl border border-cream-300 p-4"
          >
            <h3 className="font-semibold text-ink-950 leading-snug">{item.category}</h3>
            <p className="text-xs text-ink-500 mt-1">{item.family}</p>
            <p className="mt-2 text-sm text-ink-700 font-mono">{item.standards}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[11px] text-ink-500">EMC <Flag value={item.emc} /></span>
              <span className="text-[11px] text-ink-500">IECEE <Flag value={item.iecee} /></span>
              <span className="text-[11px] text-ink-500">GSO NB <Flag value={item.gso_nb} /></span>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-ink-500 text-center py-8">No categories match that filter.</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden md:block overflow-x-auto bg-white rounded-2xl border border-cream-300 shadow-card">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200 bg-cream-50">
              <th className="px-4 py-3.5 font-semibold">Product Category</th>
              <th className="px-4 py-3.5 font-semibold">Product Family</th>
              <th className="px-4 py-3.5 font-semibold">Main Standard(s)</th>
              <th className="px-4 py-3.5 font-semibold">EMC</th>
              <th className="px-4 py-3.5 font-semibold">IECEE</th>
              <th className="px-4 py-3.5 font-semibold">GSO NB</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.category} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                <td className="px-4 py-3 font-semibold text-ink-950">{item.category}</td>
                <td className="px-4 py-3 text-ink-600">{item.family}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-700">{item.standards}</td>
                <td className="px-4 py-3"><Flag value={item.emc} /></td>
                <td className="px-4 py-3"><Flag value={item.iecee} /></td>
                <td className="px-4 py-3"><Flag value={item.gso_nb} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-500">
                  No categories match that filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
