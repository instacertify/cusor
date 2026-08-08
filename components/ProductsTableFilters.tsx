"use client";

import { useEffect, useState } from "react";

const SORTS = [
  { value: "labs", label: "Most labs" },
  { value: "name", label: "Name A–Z" },
  { value: "price_low", label: "Lowest test cost" },
  { value: "price_high", label: "Highest test cost" },
  { value: "fee", label: "Highest marking fee" },
];

type CategoryOption = { id: number; name: string; product_count?: number | null };
type StatusOption = { qco_status: string; n: number };

/**
 * Product table filters. Desktop and mobile each render selects for layout,
 * but only the active breakpoint’s fields stay enabled so GET submit never
 * sends duplicate category/status/scheme/sort keys (which break filtering).
 */
export default function ProductsTableFilters({
  q,
  category,
  status,
  scheme,
  sort,
  categories,
  statuses,
  filtersOpen,
}: {
  q?: string;
  category?: string;
  status?: string;
  scheme?: string;
  sort?: string;
  categories: CategoryOption[];
  statuses: StatusOption[];
  filtersOpen: boolean;
}) {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const selectClass =
    "w-full rounded-xl border border-cream-300 px-3 py-3 text-base md:text-sm bg-white outline-none min-h-11 appearance-none";

  const categoryOptions = (
    <>
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.product_count})
        </option>
      ))}
    </>
  );
  const statusOptions = (
    <>
      <option value="">All QCO statuses</option>
      {statuses.map((s) => (
        <option key={s.qco_status} value={s.qco_status}>
          {s.qco_status} ({s.n})
        </option>
      ))}
    </>
  );
  const schemeOptions = (
    <>
      <option value="">Scheme</option>
      <option value="ISI">ISI</option>
      <option value="CRS">CRS</option>
    </>
  );
  const sortOptions = SORTS.map((s) => (
    <option key={s.value} value={s.value}>
      {s.label}
    </option>
  ));

  return (
    <form
      action="/products/all"
      method="GET"
      className="mt-5 sm:mt-8 bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4"
    >
      <div className="grid grid-cols-[1fr_auto] gap-2 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr_auto] lg:gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Product, IS or HSN…"
          enterKeyHint="search"
          className="rounded-xl border border-cream-300 px-3 sm:px-4 py-3 text-base md:text-sm outline-none focus:border-butter-500 min-h-11 w-full min-w-0"
        />

        <select
          name="category"
          defaultValue={category ?? ""}
          disabled={!isLg}
          className={`hidden lg:block ${selectClass}`}
        >
          {categoryOptions}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          disabled={!isLg}
          className={`hidden lg:block ${selectClass}`}
        >
          {statusOptions}
        </select>
        <select
          name="scheme"
          defaultValue={scheme ?? ""}
          disabled={!isLg}
          className={`hidden lg:block ${selectClass}`}
        >
          {schemeOptions}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? "labs"}
          disabled={!isLg}
          className={`hidden lg:block ${selectClass}`}
        >
          {sortOptions}
        </select>

        <button
          type="submit"
          className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl px-4 sm:px-6 py-3 min-h-11 transition shrink-0"
        >
          Search
        </button>
      </div>

      <details className="lg:hidden mt-3 group" open={filtersOpen || undefined}>
        <summary className="flex items-center justify-between min-h-11 cursor-pointer list-none rounded-xl border border-cream-200 bg-cream-50 px-3 text-sm font-semibold text-ink-800 [&::-webkit-details-marker]:hidden">
          <span>
            Filters
            {filtersOpen ? (
              <span className="ml-2 text-xs font-medium text-butter-700">· active</span>
            ) : null}
          </span>
          <span className="text-ink-400 group-open:rotate-180 transition-transform" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <select
            name="category"
            defaultValue={category ?? ""}
            disabled={isLg}
            className={`${selectClass} col-span-2`}
          >
            {categoryOptions}
          </select>
          <select
            name="status"
            defaultValue={status ?? ""}
            disabled={isLg}
            className={`${selectClass} col-span-2`}
          >
            {statusOptions}
          </select>
          <select
            name="scheme"
            defaultValue={scheme ?? ""}
            disabled={isLg}
            className={selectClass}
          >
            {schemeOptions}
          </select>
          <select
            name="sort"
            defaultValue={sort ?? "labs"}
            disabled={isLg}
            className={selectClass}
          >
            {sortOptions}
          </select>
        </div>
      </details>
    </form>
  );
}
