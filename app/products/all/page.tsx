import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import ScrollTable from "@/components/ScrollTable";
import ProductsTableFilters from "@/components/ProductsTableFilters";
import CertificationSolutionRow from "@/components/CertificationSolutionRow";
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

type Param = string | string[] | undefined;

/** Prefer the first non-empty value when duplicate query keys are present. */
function param(v: Param): string | undefined {
  if (Array.isArray(v)) {
    const hit = v.find((x) => typeof x === "string" && x.trim() !== "");
    return hit ?? v[0];
  }
  return v;
}

interface Props {
  searchParams: Promise<{
    q?: Param;
    category?: Param;
    status?: Param;
    scheme?: Param;
    sort?: Param;
    page?: Param;
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
  const raw = await searchParams;
  const q = param(raw.q);
  const category = param(raw.category);
  const status = param(raw.status);
  const scheme = param(raw.scheme);
  const sort = param(raw.sort);
  const page = Math.max(1, Number(param(raw.page)) || 1);
  const categories = getCategories();
  const statuses = getQcoStatuses();
  const faqs = getFaqs("page:products");

  const { products, total } = queryProductsTable({
    q,
    categoryId: Number(category) || undefined,
    qcoStatus: status || undefined,
    scheme: scheme || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const pages = Math.ceil(total / PAGE_SIZE);

  const filtersOpen = Boolean(category || status || scheme || (sort && sort !== "labs"));

  const qs = (over: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      q,
      category,
      status,
      scheme,
      sort,
      ...over,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/products/all?${s}` : "/products/all";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs
        crumbs={[{ label: "Products", href: "/products" }, { label: "Search Table" }]}
      />
      <h1 className="font-display text-[1.65rem] leading-tight sm:text-4xl font-semibold text-ink-950 tracking-tight">
        Search product for certification
      </h1>
      <p className="mt-2 sm:mt-3 text-ink-600 max-w-3xl text-sm sm:text-base">
        <span className="sm:hidden">
          Check the right certification — search by product, IS, HSN or QCO.
        </span>
        <span className="hidden sm:inline">
          Check for the right certification against your product. Search IS standard, HSN code,
          QCO status, marking fees, lab test cost range and approved laboratories in one place.
        </span>
      </p>

      <CertificationSolutionRow className="mt-5 sm:mt-6" showSearchCta={false} />

      <ProductsTableFilters
        q={q}
        category={category}
        status={status}
        scheme={scheme}
        sort={sort}
        categories={categories}
        statuses={statuses}
        filtersOpen={filtersOpen}
      />

      <p className="mt-4 sm:mt-5 text-sm text-ink-600">
        {formatNumber(total)} product{total === 1 ? "" : "s"} found
        {q ? ` for “${q}”` : ""}
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
            <Link href="/contact?intent=expert" className="font-semibold text-butter-700">
              talk to a certification expert
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
                      <Link href="/contact?intent=expert" className="font-semibold text-butter-700">
                        talk to a certification expert
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
