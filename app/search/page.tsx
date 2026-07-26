import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import SearchBox from "@/components/SearchBox";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import {
  searchProducts,
  countSearchProducts,
  getLabs,
  getFaqs,
  getLabsForProduct,
} from "@/lib/queries";
import { formatNumber, formatPriceRange, formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search BIS Products, Standards & Labs",
  description:
    "Search Certko's database of 1,400+ BIS notified products, IS standards and 400+ recognised testing labs.",
};

const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const products = q ? searchProducts(q, PAGE_SIZE, (page - 1) * PAGE_SIZE) : [];
  const total = q ? countSearchProducts(q) : 0;
  const { labs } = q ? getLabs({ q, limit: 6 }) : { labs: [] };
  const faqs = getFaqs("page:search");
  const pages = Math.ceil(total / PAGE_SIZE);

  // best match: certification + lab testing details for the top result
  const best = page === 1 && products.length > 0 ? products[0] : null;
  const bestLabs = best ? getLabsForProduct(best.id).slice(0, 5) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Search" }]} />
      <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      <div className="mt-6 max-w-xl">
        <SearchBox large placeholder="Search product, IS standard, HSN code or lab…" />
      </div>

      {q && (
        <>
          {best && (
            <section className="mt-10 bg-white rounded-3xl border border-cream-300 shadow-card-hover overflow-hidden">
              <div className="px-6 py-4 bg-cream-100 border-b border-cream-200 flex items-center gap-2">
                <Icon name="award" size={18} className="text-butter-700" />
                <h2 className="font-display font-bold text-ink-950">Best Match — Certification & Lab Testing</h2>
              </div>
              <div className="p-6 grid lg:grid-cols-2 gap-8">
                <div>
                  <Link href={`/product/${best.slug}`} className="font-display text-xl font-bold text-ink-950 hover:text-butter-700 transition leading-snug">
                    {best.name}
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1 ${best.scheme === "CRS" ? "bg-ink-300/30 text-ink-700" : "bg-butter-300/50 text-butter-700"}`}>
                      {best.scheme === "CRS" ? "CRS Registration" : "ISI Mark Licence"}
                    </span>
                    {best.qco_status && (
                      <span className={`text-xs font-bold rounded-full px-3 py-1 ${best.qco_status.startsWith("Mandatory") ? "bg-red-100 text-red-700" : best.qco_status.startsWith("Upcoming") || best.qco_status.startsWith("Notified") ? "bg-butter-300/60 text-butter-700" : "bg-green-100 text-green-700"}`}>
                        {best.qco_status}
                      </span>
                    )}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-cream-50 rounded-xl px-4 py-2.5">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-500">IS Standard</dt>
                      <dd className="font-semibold text-ink-950">{best.standard || "—"}</dd>
                    </div>
                    <div className="bg-cream-50 rounded-xl px-4 py-2.5">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-500">HSN Code</dt>
                      <dd className="font-semibold text-ink-950">{best.hsn8 || best.hsn4 || "—"}</dd>
                    </div>
                    <div className="bg-cream-50 rounded-xl px-4 py-2.5">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-500">Test Cost Range</dt>
                      <dd className="font-semibold text-ink-950">{formatPriceRange(best.min_price, best.max_price)}</dd>
                    </div>
                    <div className="bg-cream-50 rounded-xl px-4 py-2.5">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-500">Timeline</dt>
                      <dd className="font-semibold text-ink-950">{best.timeline}</dd>
                    </div>
                  </dl>
                  <Link href={`/product/${best.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-butter-700 hover:text-butter-600">
                    Full certification details <Icon name="arrow-right" size={15} />
                  </Link>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-950 mb-3 flex items-center gap-2">
                    <Icon name="microscope" size={17} className="text-ink-500" />
                    Lab Testing ({best.lab_count} approved lab{best.lab_count === 1 ? "" : "s"})
                  </h3>
                  <ul className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden">
                    {bestLabs.map((lab) => (
                      <li key={lab.id} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white hover:bg-cream-50 text-sm">
                        <Link href={`/labs/${lab.slug}`} className="font-medium text-ink-950 hover:text-butter-700 truncate">
                          {lab.name}
                        </Link>
                        <span className="shrink-0 font-semibold text-ink-700">
                          {lab.price != null ? formatINR(lab.price) : "On request"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {best.lab_count > bestLabs.length && (
                    <Link href={`/product/${best.slug}`} className="mt-2 inline-block text-xs font-bold text-butter-700">
                      View all {best.lab_count} labs with prices →
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )}

          <h2 className="mt-10 font-display text-xl font-bold text-ink-950">
            Products <span className="text-ink-500 font-normal text-base">({formatNumber(total)})</span>
          </h2>
          {products.length > 0 ? (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-ink-600 text-sm">
              No products matched. Try a shorter keyword (e.g. “cable” instead of the full product name), or{" "}
              <Link href="/contact" className="font-bold text-butter-700">ask an expert</Link> — we answer within 24 hours.
            </p>
          )}

          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
                  ← Prev
                </Link>
              )}
              <span className="text-sm text-ink-600 px-3">Page {page} of {pages}</span>
              {page < pages && (
                <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
                  Next →
                </Link>
              )}
            </nav>
          )}

          {labs.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-xl font-bold text-ink-950">Matching Labs</h2>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.map((l) => (
                  <Link
                    key={l.id}
                    href={`/labs/${l.slug}`}
                    className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-4"
                  >
                    <span className="block font-semibold text-ink-950 text-sm line-clamp-1">{l.name}</span>
                    <span className="mt-1 text-xs text-ink-500 flex items-center gap-1.5">
                      <Icon name="pin" size={12} className="shrink-0" />
                      {[l.city, l.state].filter(Boolean).join(", ") || "India"} · {l.scope_count} scopes
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-16 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Search Tips" />
      </div>
    </div>
  );
}
