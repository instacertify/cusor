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
  getLabStates,
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

type Tab = "all" | "products" | "labs";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; type?: string; state?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const tab: Tab = sp.type === "labs" ? "labs" : sp.type === "products" ? "products" : "all";
  const state = (sp.state ?? "").trim();
  const faqs = getFaqs("page:search");

  // products
  const productLimit = tab === "all" ? 8 : PAGE_SIZE;
  const products = q
    ? searchProducts(q, productLimit, tab === "products" ? (page - 1) * PAGE_SIZE : 0)
    : [];
  const productTotal = q ? countSearchProducts(q) : 0;
  const productPages = Math.ceil(productTotal / PAGE_SIZE);

  // labs (labs tab searches even without q, supports state filter + pagination)
  const labLimit = tab === "labs" ? PAGE_SIZE : 6;
  const { labs, total: labTotal } =
    tab === "labs" || q
      ? getLabs({
          q: q || undefined,
          state: tab === "labs" && state ? state : undefined,
          limit: labLimit,
          offset: tab === "labs" ? (page - 1) * PAGE_SIZE : 0,
        })
      : { labs: [], total: 0 };
  const labPages = Math.ceil(labTotal / PAGE_SIZE);
  const states = tab === "labs" ? getLabStates() : [];

  // best match: certification + lab testing details for the top product
  const best = tab !== "labs" && page === 1 && products.length > 0 ? products[0] : null;
  const bestLabs = best ? getLabsForProduct(best.id).slice(0, 5) : [];

  const tabHref = (t: Tab, extra: Record<string, string | undefined> = {}) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (t !== "all") p.set("type", t);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/search?${s}` : "/search";
  };

  const TABS: { key: Tab; label: string; count?: number; icon: string }[] = [
    { key: "all", label: "All Results", icon: "search" },
    { key: "products", label: "Find a Product", count: q ? productTotal : undefined, icon: "box" },
    { key: "labs", label: "Find a Lab", count: tab === "labs" ? labTotal : undefined, icon: "microscope" },
  ];

  const pagination = (current: number, totalPages: number, t: Tab) =>
    totalPages > 1 ? (
      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        {current > 1 && (
          <Link href={tabHref(t, { page: String(current - 1), state })} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
            ← Prev
          </Link>
        )}
        <span className="text-sm text-ink-600 px-3">Page {current} of {formatNumber(totalPages)}</span>
        {current < totalPages && (
          <Link href={tabHref(t, { page: String(current + 1), state })} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
            Next →
          </Link>
        )}
      </nav>
    ) : null;

  const labCard = (l: (typeof labs)[number]) => (
    <Link
      key={l.id}
      href={`/labs/${l.slug}`}
      className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-4 flex flex-col gap-1.5"
    >
      <span className="block font-semibold text-ink-950 text-sm line-clamp-2">{l.name}</span>
      <span className="text-xs text-ink-500 flex items-center gap-1.5">
        <Icon name="pin" size={12} className="shrink-0" />
        {[l.city, l.state].filter(Boolean).join(", ") || "India"}
      </span>
      <span className="mt-auto pt-1.5 border-t border-cream-200 text-xs font-medium text-ink-700 flex items-center justify-between">
        <span>{formatPriceRange(l.min_price, l.max_price)}</span>
        <span>{l.scope_count} scope{l.scope_count === 1 ? "" : "s"}</span>
      </span>
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Search" }]} />
      <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight">
        {q ? `Results for “${q}”` : tab === "labs" ? "Find a Testing Lab" : "Search"}
      </h1>
      <div className="mt-6 max-w-xl">
        <SearchBox large placeholder="Search product, IS standard, HSN code or lab…" />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition ${
              tab === t.key
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white text-ink-700 border-cream-300 hover:border-butter-500"
            }`}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
            {t.count != null && (
              <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${tab === t.key ? "bg-ink-700" : "bg-cream-200 text-ink-600"}`}>
                {formatNumber(t.count)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ---- Labs tab ---- */}
      {tab === "labs" && (
        <>
          <form action="/search" method="GET" className="mt-6 bg-white rounded-2xl border border-cream-300 shadow-card p-4 grid gap-3 sm:grid-cols-[1.3fr_1fr_auto]">
            <input type="hidden" name="type" value="labs" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Lab name or city…"
              className="rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500"
            />
            <select name="state" defaultValue={state} className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none">
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s.state} value={s.state}>{s.state} ({s.n})</option>
              ))}
            </select>
            <button className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-6 py-2.5 transition">
              Search Labs
            </button>
          </form>
          <p className="mt-5 text-sm text-ink-600">
            {formatNumber(labTotal)} lab{labTotal === 1 ? "" : "s"} found{state ? ` in ${state}` : ""}{q ? ` for “${q}”` : ""}
          </p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{labs.map(labCard)}</div>
          {pagination(page, labPages, "labs")}
        </>
      )}

      {/* ---- Products / All tabs ---- */}
      {tab !== "labs" && q && (
        <>
          {best && (
            <section className="mt-8 bg-white rounded-3xl border border-cream-300 shadow-card-hover overflow-hidden">
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
            Products <span className="text-ink-500 font-normal text-base">({formatNumber(productTotal)})</span>
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
          {tab === "all" && productTotal > products.length && (
            <div className="mt-5">
              <Link href={tabHref("products")} className="text-sm font-bold text-butter-700 hover:text-butter-600">
                See all {formatNumber(productTotal)} matching products →
              </Link>
            </div>
          )}
          {tab === "products" && pagination(page, productPages, "products")}

          {tab === "all" && (
            <>
              {labs.length > 0 && (
                <>
                  <h2 className="mt-12 font-display text-xl font-bold text-ink-950">Matching Labs</h2>
                  <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{labs.map(labCard)}</div>
                </>
              )}
              <div className="mt-8 bg-cream-100 border border-cream-300 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink-700 flex items-center gap-2">
                  <Icon name="microscope" size={17} className="text-butter-700 shrink-0" />
                  {labs.length > 0
                    ? "Need more options? Search the full lab directory with state filters."
                    : "No labs matched this name — labs that test this product are listed in the Best Match panel, or search the full directory."}
                </p>
                <Link
                  href={tabHref("labs")}
                  className="text-sm font-bold text-butter-700 hover:text-butter-600 shrink-0"
                >
                  Search all labs with filters →
                </Link>
              </div>
            </>
          )}
        </>
      )}

      {tab === "products" && !q && (
        <p className="mt-8 text-sm text-ink-600">
          Type a product name, IS standard or HSN code above to find matching products.
        </p>
      )}

      <div className="mt-16 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Search Tips" />
      </div>
    </div>
  );
}
