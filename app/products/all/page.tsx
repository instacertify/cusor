import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import ScrollTable from "@/components/ScrollTable";
import {
  queryProductsTable,
  getCategories,
  getQcoStatuses,
  getFaqs,
} from "@/lib/queries";
import { formatPriceRange, formatINR, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BIS Product Search Table | Standards, HSN, QCO Status, Fees & Labs",
  description:
    "Search all BIS notified products in one table: IS standard, HSN code, QCO status, marking fees, lab testing cost range and approved labs. Filter by category, status and scheme.",
  alternates: { canonical: "https://certko.com/products/all" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const PAGE_SIZE = 25;

const SORTS = [
  { value: "labs", label: "Most labs" },
  { value: "name", label: "Name A–Z" },
  { value: "price_low", label: "Lowest test cost" },
  { value: "price_high", label: "Highest test cost" },
  { value: "fee", label: "Highest marking fee" },
];

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    scheme?: string;
    sort?: string;
    page?: string;
  }>;
}

function qcoBadgeClass(status: string) {
  if (status.startsWith("Mandatory")) return "bg-red-100 text-red-700";
  if (status.startsWith("Upcoming") || status.startsWith("Notified")) {
    return "bg-butter-300/60 text-butter-700";
  }
  return "bg-green-100 text-green-700";
}

function shortQco(status: string) {
  return status.replace(" as per available records", "").split(" ").slice(0, 2).join(" ");
}

export default async function ProductsTablePage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const categories = getCategories();
  const statuses = getQcoStatuses();
  const faqs = getFaqs("page:products");

  const { products, total } = queryProductsTable({
    q: sp.q,
    categoryId: Number(sp.category) || undefined,
    qcoStatus: sp.status || undefined,
    scheme: sp.scheme || undefined,
    sort: sp.sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const pages = Math.ceil(total / PAGE_SIZE);

  const filtersOpen = Boolean(sp.category || sp.status || sp.scheme || (sp.sort && sp.sort !== "labs"));

  const qs = (over: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      q: sp.q,
      category: sp.category,
      status: sp.status,
      scheme: sp.scheme,
      sort: sp.sort,
      ...over,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/products/all?${s}` : "/products/all";
  };

  const selectClass =
    "w-full rounded-xl border border-cream-300 px-3 py-3 text-base md:text-sm bg-white outline-none min-h-11 appearance-none";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs
        crumbs={[{ label: "Products", href: "/products" }, { label: "Search Table" }]}
      />
      <h1 className="font-display text-[1.65rem] leading-tight sm:text-4xl font-semibold text-ink-950 tracking-tight">
        BIS Product Search
      </h1>
      <p className="mt-2 sm:mt-3 text-ink-600 max-w-3xl text-sm sm:text-base">
        <span className="sm:hidden">
          Find any notified product — IS, HSN, QCO, fees and labs.
        </span>
        <span className="hidden sm:inline">
          Every notified product with all its aspects in one place — IS standard, HSN code,
          QCO status, annual marking fees, real lab test cost range and approved laboratories.
          Search by any of them.
        </span>
      </p>

      {/* Filters — compact on phone, full grid on desktop */}
      <form
        action="/products/all"
        method="GET"
        className="mt-5 sm:mt-8 bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4"
      >
        <div className="grid grid-cols-[1fr_auto] gap-2 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr_auto] lg:gap-3">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Product, IS or HSN…"
            enterKeyHint="search"
            className="rounded-xl border border-cream-300 px-3 sm:px-4 py-3 text-base md:text-sm outline-none focus:border-butter-500 min-h-11 w-full min-w-0"
          />

          {/* Desktop: all filters inline */}
          <select
            name="category"
            defaultValue={sp.category ?? ""}
            className={`hidden lg:block ${selectClass}`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.product_count})
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className={`hidden lg:block ${selectClass}`}
          >
            <option value="">All QCO statuses</option>
            {statuses.map((s) => (
              <option key={s.qco_status} value={s.qco_status}>
                {s.qco_status} ({s.n})
              </option>
            ))}
          </select>
          <select
            name="scheme"
            defaultValue={sp.scheme ?? ""}
            className={`hidden lg:block ${selectClass}`}
          >
            <option value="">Scheme</option>
            <option value="ISI">ISI</option>
            <option value="CRS">CRS</option>
          </select>
          <select
            name="sort"
            defaultValue={sp.sort ?? "labs"}
            className={`hidden lg:block ${selectClass}`}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl px-4 sm:px-6 py-3 min-h-11 transition shrink-0"
          >
            Search
          </button>
        </div>

        {/* Phone / tablet: collapsible extra filters */}
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
              defaultValue={sp.category ?? ""}
              className={`${selectClass} col-span-2`}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.product_count})
                </option>
              ))}
            </select>
            <select name="status" defaultValue={sp.status ?? ""} className={`${selectClass} col-span-2`}>
              <option value="">All QCO statuses</option>
              {statuses.map((s) => (
                <option key={s.qco_status} value={s.qco_status}>
                  {s.qco_status} ({s.n})
                </option>
              ))}
            </select>
            <select name="scheme" defaultValue={sp.scheme ?? ""} className={selectClass}>
              <option value="">Scheme</option>
              <option value="ISI">ISI</option>
              <option value="CRS">CRS</option>
            </select>
            <select name="sort" defaultValue={sp.sort ?? "labs"} className={selectClass}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </details>
      </form>

      <p className="mt-4 sm:mt-5 text-sm text-ink-600">
        {formatNumber(total)} product{total === 1 ? "" : "s"} found
        {sp.q ? ` for “${sp.q}”` : ""}
      </p>

      {/* Mobile cards — phone-first layout */}
      <div className="mt-3 space-y-3 md:hidden">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="block bg-white rounded-2xl border border-cream-300 p-3.5 active:bg-cream-50"
          >
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {p.scheme ? (
                <span className="text-[10px] font-bold uppercase tracking-wide rounded-md bg-ink-900 text-white px-1.5 py-0.5">
                  {p.scheme}
                </span>
              ) : null}
              {p.qco_status ? (
                <span
                  className={`text-[10px] font-semibold rounded-md px-1.5 py-0.5 ${qcoBadgeClass(p.qco_status)}`}
                >
                  {shortQco(p.qco_status)}
                </span>
              ) : null}
              {p.category_name ? (
                <span className="text-[11px] text-ink-500 truncate">{p.category_name}</span>
              ) : null}
            </div>

            <h2 className="font-semibold text-[15px] leading-snug text-ink-950 line-clamp-2">
              {p.name}
            </h2>
            <p className="text-[12px] text-ink-500 mt-1 font-mono truncate">
              {p.standard || "—"}
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide text-ink-400">HSN</dt>
                <dd className="mt-0.5 font-mono text-ink-800 truncate">
                  {p.hsn8 || p.hsn4 || "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide text-ink-400">Labs</dt>
                <dd className="mt-0.5 font-semibold text-ink-950">{p.lab_count}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide text-ink-400">Test cost</dt>
                <dd className="mt-0.5 font-medium text-ink-800 break-words">
                  {formatPriceRange(p.min_price, p.max_price)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide text-ink-400">Marking fee</dt>
                <dd className="mt-0.5 font-medium text-ink-800">
                  {p.fee_large != null ? `${formatINR(p.fee_large)}/yr` : "—"}
                </dd>
              </div>
            </dl>
          </Link>
        ))}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl border border-cream-300 px-4 py-10 text-center text-ink-500 text-sm">
            No products matched. Try a shorter keyword, or{" "}
            <Link href="/contact" className="font-semibold text-butter-700">
              ask an expert
            </Link>
            .
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden md:block">
        <ScrollTable>
          <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200 bg-cream-50">
                  <th className="px-4 py-3.5 font-semibold">Product (IS Title)</th>
                  <th className="px-4 py-3.5 font-semibold">IS Standard</th>
                  <th className="px-4 py-3.5 font-semibold">HSN</th>
                  <th className="px-4 py-3.5 font-semibold">QCO Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Marking Fee (Lg)</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Test Cost</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Labs</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-cream-100 last:border-0 hover:bg-cream-50"
                  >
                    <td className="px-4 py-3 max-w-[300px]">
                      <Link
                        href={`/product/${p.slug}`}
                        className="font-semibold text-ink-950 hover:text-butter-700 line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <span className="block text-[11px] text-ink-500 mt-0.5">
                        {p.category_name} · {p.scheme}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">
                      {p.standard || "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-700 font-mono text-xs">
                      {p.hsn8 || p.hsn4 || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.qco_status ? (
                        <span
                          className={`inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${qcoBadgeClass(p.qco_status)}`}
                        >
                          {p.qco_status.replace(" as per available records", "")}
                        </span>
                      ) : (
                        <span className="text-ink-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-700 whitespace-nowrap">
                      {p.fee_large != null ? `${formatINR(p.fee_large)}/yr` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-700 whitespace-nowrap">
                      {formatPriceRange(p.min_price, p.max_price)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-950">
                      {p.lab_count}
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-500 text-sm">
                      No products matched. Try a shorter keyword, or{" "}
                      <Link href="/contact" className="font-semibold text-butter-700">
                        ask an expert
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollTable>
      </div>

      {pages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2 flex-wrap"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link
              href={qs({ page: String(page - 1) })}
              className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm text-ink-600 px-3">
            Page {page} of {formatNumber(pages)}
          </span>
          {page < pages && (
            <Link
              href={qs({ page: String(page + 1) })}
              className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500"
            >
              Next →
            </Link>
          )}
        </nav>
      )}

      <p className="mt-6 text-xs text-ink-500 max-w-3xl">
        Marking fees are indicative annual BIS Standard Mark fees for large units (small and micro
        units pay reduced slabs — see each product page). Test costs are reported lab charges
        excluding GST. Verify current fee schedules with BIS before budgeting.
      </p>

      <div className="mt-14 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Product Database FAQs" />
      </div>

      <div className="mt-14">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
