import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import { ensureDbReady } from "@/lib/db";
import { getLabs, getLabStates, getCategories, countLabs, getFaqs } from "@/lib/queries";
import { formatPriceRange, formatNumber } from "@/lib/format";
import { INDEX_FOLLOW_ROBOTS } from "@/lib/seo";

export const dynamic = "force-dynamic";

function parseLabCategories(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "BIS Testing Labs Directory | 400+ Recognised Labs Across India",
  description:
    "Searchable directory of BIS-recognised testing laboratories across India. Filter by state and product category, compare scopes and indicative test prices.",
  alternates: { canonical: "https://certko.com/labs" },
  robots: INDEX_FOLLOW_ROBOTS,
};

const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{ state?: string; category?: string; q?: string; page?: string }>;
}

export default async function LabsPage({ searchParams }: Props) {
  await ensureDbReady();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { labs, total } = getLabs({
    state: sp.state,
    category: sp.category,
    q: sp.q,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const states = getLabStates();
  const categories = getCategories();
  const totalLabs = countLabs();
  const faqs = getFaqs("page:labs");
  const pages = Math.ceil(total / PAGE_SIZE);

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { state: sp.state, category: sp.category, q: sp.q, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/labs?${s}` : "/labs";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Testing Labs" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        BIS Testing Labs Directory
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        {formatNumber(totalLabs)} BIS-recognised testing laboratories across India — compare
        locations, scopes and indicative test charges before you book.
      </p>

      {/* Filters */}
      <form action="/labs" method="GET" className="mt-8 bg-white rounded-2xl border border-cream-300 shadow-card p-4 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search lab name or city…"
          className="rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500"
        />
        <select
          name="state"
          defaultValue={sp.state ?? ""}
          className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
        >
          <option value="">All States ({formatNumber(totalLabs)})</option>
          {states.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state} ({s.n})
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-6 py-2.5 transition">
          Filter
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-600">
        Showing {labs.length} of {formatNumber(total)} labs
        {sp.state ? ` in ${sp.state}` : ""}
        {sp.category ? ` for ${sp.category}` : ""}
      </p>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {labs.map((lab) => {
          const cats = parseLabCategories(lab.categories);
          return (
            <Link
              key={lab.id}
              href={`/labs/${lab.slug}`}
              className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-5 flex flex-col gap-2.5"
            >
              <h2 className="font-display font-bold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
                {lab.name}
              </h2>
              <p className="text-xs text-ink-500 flex items-center gap-1.5">
                <Icon name="pin" size={13} className="shrink-0" />
                {[lab.city, lab.state].filter(Boolean).join(", ") || "India"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cats.slice(0, 3).map((c) => (
                  <span key={c} className="text-[10px] font-semibold bg-cream-200 text-ink-700 rounded-full px-2 py-0.5">
                    {c}
                  </span>
                ))}
                {cats.length > 3 && (
                  <span className="text-[10px] font-semibold text-ink-500">+{cats.length - 3} more</span>
                )}
              </div>
              <div className="mt-auto pt-2 border-t border-cream-200 flex items-center justify-between text-xs font-medium text-ink-700">
                <span>{formatPriceRange(lab.min_price, lab.max_price)}</span>
                <span>{lab.scope_count} scope{lab.scope_count === 1 ? "" : "s"}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={qs({ page: String(page - 1) })} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
              ← Prev
            </Link>
          )}
          <span className="text-sm text-ink-600 px-3">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={qs({ page: String(page + 1) })} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">
              Next →
            </Link>
          )}
        </nav>
      )}

      <p className="mt-10 text-xs text-ink-500 max-w-3xl">
        Lab information compiled from official BIS laboratory recognition records. Cost figures are
        indicative reported test charges, exclude GST, and must be verified directly with each
        laboratory before proceeding.
      </p>

      <div className="mt-14 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Testing Labs FAQs" />
      </div>

      <div className="mt-14">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
