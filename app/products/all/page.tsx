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

  const qs = (over: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      q: sp.q, category: sp.category, status: sp.status,
      scheme: sp.scheme, sort: sp.sort, ...over,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/products/all?${s}` : "/products/all";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <Breadcrumbs
        crumbs={[{ label: "Products", href: "/products" }, { label: "Search Table" }]}
      />
      <h1 className="font-display text-2xl sm:text-4xl font-semibold text-ink-950 tracking-tight">
        BIS Product Search Table
      </h1>
      <p className="mt-3 text-ink-600 max-w-3xl text-sm sm:text-base">
        Every notified product with all its aspects in one place — IS standard, HSN code,
        QCO status, annual marking fees, real lab test cost range and approved laboratories.
        Search by any of them.
      </p>

      {/* Filters */}
      <form
        action="/products/all"
        method="GET"
        className="mt-6 sm:mt-8 bg-white rounded-2xl border border-cream-300 shadow-card p-3 sm:p-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr_auto]"
      >
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Product, IS or HSN…"
          className="rounded-xl border border-cream-300 px-4 py-3 text-sm outline-none focus:border-butter-500 min-h-11"
        />
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.product_count})</option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11">
          <option value="">All QCO statuses</option>
          {statuses.map((s) => (
            <option key={s.qco_status} value={s.qco_status}>{s.qco_status} ({s.n})</option>
          ))}
        </select>
        <select name="scheme" defaultValue={sp.scheme ?? ""} className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11">
          <option value="">Scheme</option>
          <option value="ISI">ISI</option>
          <option value="CRS">CRS</option>
        </select>
        <select name="sort" defaultValue={sp.sort ?? "labs"} className="rounded-xl border border-cream-300 px-3 py-3 text-sm bg-white outline-none min-h-11">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl px-6 py-3 min-h-11 transition">
          Search
        </button>
      </form>

      <p className="mt-5 text-sm text-ink-600">
        {formatNumber(total)} product{total === 1 ? "" : "s"} found
        {sp.q ? ` for “${sp.q}”` : ""}
      </p>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="block bg-white rounded-2xl border border-cream-300 p-4 active:bg-cream-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-ink-950 leading-snug">{p.name}</h2>
                <p className="text-[11px] text-ink-500 mt-1">
                  {p.standard || "—"} · {p.category_name} · {p.scheme}
                </p>
              </div>
              {p.qco_status ? (
                <span
                  className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                    p.qco_status.startsWith("Mandatory")
                      ? "bg-red-100 text-red-700"
                      : p.qco_status.startsWith("Upcoming") || p.qco_status.startsWith("Notified")
                      ? "bg-butter-300/60 text-butter-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {p.qco_status.replace(" as per available records", "").split(" ").slice(0, 2).join(" ")}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-ink-600">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ink-400">HSN</div>
                <div className="font-mono">{p.hsn8 || p.hsn4 || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ink-400">Test cost</div>
                <div className="font-medium text-ink-800">{formatPriceRange(p.min_price, p.max_price)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">Labs</div>
                <div className="font-semibold text-ink-950">{p.lab_count}</div>
              </div>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl border border-cream-300 px-4 py-10 text-center text-ink-500 text-sm">
            No products matched. Try a shorter keyword, or{" "}
            <Link href="/contact" className="font-semibold text-butter-700">ask an expert</Link>.
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
                  <tr key={p.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                    <td className="px-4 py-3 max-w-[300px]">
                      <Link href={`/product/${p.slug}`} className="font-semibold text-ink-950 hover:text-butter-700 line-clamp-2">
                        {p.name}
                      </Link>
                      <span className="block text-[11px] text-ink-500 mt-0.5">
                        {p.category_name} · {p.scheme}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{p.standard || "—"}</td>
                    <td className="px-4 py-3 text-ink-700 font-mono text-xs">{p.hsn8 || p.hsn4 || "—"}</td>
                    <td className="px-4 py-3">
                      {p.qco_status ? (
                        <span
                          className={`inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${
                            p.qco_status.startsWith("Mandatory")
                              ? "bg-red-100 text-red-700"
                              : p.qco_status.startsWith("Upcoming") || p.qco_status.startsWith("Notified")
                              ? "bg-butter-300/60 text-butter-700"
                              : "bg-green-100 text-green-700"
                          }`}
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
                    <td className="px-4 py-3 text-right font-semibold text-ink-950">{p.lab_count}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-500 text-sm">
                      No products matched. Try a shorter keyword, or{" "}
                      <Link href="/contact" className="font-semibold text-butter-700">ask an expert</Link>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollTable>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2 flex-wrap" aria-label="Pagination">
          {page > 1 && (
            <Link href={qs({ page: String(page - 1) })} className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
              ← Prev
            </Link>
          )}
          <span className="text-sm text-ink-600 px-3">Page {page} of {formatNumber(pages)}</span>
          {page < pages && (
            <Link href={qs({ page: String(page + 1) })} className="inline-flex items-center min-h-11 px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
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
