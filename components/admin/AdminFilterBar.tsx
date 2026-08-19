import type { ReactNode } from "react";
import type { AdminFilterOption } from "@/lib/admin-list";

export default function AdminFilterBar({
  action,
  searchName = "q",
  searchValue = "",
  searchPlaceholder = "Search…",
  showSearch = true,
  categoryName = "category",
  categoryValue = "",
  categoryLabel = "Category",
  categories = [],
  allLabel = "All categories",
  extraFields,
  requireCategory = false,
}: {
  action: string;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  categoryName?: string;
  categoryValue?: string;
  categoryLabel?: string;
  categories?: AdminFilterOption[];
  allLabel?: string;
  extraFields?: ReactNode;
  requireCategory?: boolean;
}) {
  return (
    <form
      action={action}
      method="GET"
      className="mb-6 flex flex-wrap items-end gap-3 bg-white border border-cream-300 rounded-2xl p-4"
    >
      {showSearch ? (
        <div className="flex-1 min-w-[180px]">
          <label htmlFor={`admin-filter-${searchName}`} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Search
          </label>
          <input
            id={`admin-filter-${searchName}`}
            type="search"
            name={searchName}
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
          />
        </div>
      ) : null}
      {categories.length > 0 ? (
        <div className="min-w-[200px] flex-1 sm:flex-none">
          <label htmlFor={`admin-filter-${categoryName}`} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            {categoryLabel}
          </label>
          <select
            id={`admin-filter-${categoryName}`}
            name={categoryName}
            defaultValue={categoryValue}
            className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
          >
            {requireCategory ? null : <option value="">{allLabel}</option>}
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {extraFields}
      <button
        type="submit"
        className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition"
      >
        Apply
      </button>
    </form>
  );
}
