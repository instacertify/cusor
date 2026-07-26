import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import SearchBox from "@/components/SearchBox";
import FaqAccordion from "@/components/FaqAccordion";
import { searchProducts, countSearchProducts, getLabs, getFaqs } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

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
                    <span className="block text-xs text-ink-500 mt-1">
                      📍 {[l.city, l.state].filter(Boolean).join(", ") || "India"} · {l.scope_count} scopes
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
