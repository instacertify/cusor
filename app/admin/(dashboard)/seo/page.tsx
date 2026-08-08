import Link from "next/link";
import Icon from "@/components/Icon";
import { getDb } from "@/lib/db";
import {
  getCategories,
  getCertifications,
  getTestingCategories,
  getAllTestingServices,
  searchProducts,
} from "@/lib/queries";
import type { PageRecord } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSeoIndex({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const pages = getDb().prepare("SELECT * FROM pages ORDER BY slug").all() as PageRecord[];
  const categories = getCategories();
  const certifications = getCertifications();
  const testingCategories = getTestingCategories();
  const testingServices = getAllTestingServices(200);
  const products = q ? searchProducts(q, 12) : [];
  const seoCount = (
    getDb().prepare("SELECT COUNT(*) AS n FROM seo_meta").get() as { n: number }
  ).n;

  const linkCls =
    "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 hover:border-butter-500 transition text-sm font-semibold text-ink-950";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">SEO Tools</h1>
      <p className="text-ink-600 text-sm mb-6">
        Titles, descriptions, slugs, keywords, social previews, canonical URLs, robots,
        schema markup, sitemap control and an SEO score — per page. {seoCount} page{seoCount === 1 ? " has" : "s have"} custom SEO settings so far.
      </p>

      <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 mb-6">
        <h2 className="font-display font-bold text-ink-950 mb-3">Products</h2>
        <form action="/admin/seo" method="GET" className="flex gap-3 mb-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search a product to optimise…"
            className="flex-1 rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500"
          />
          <button type="submit" className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-6 py-2.5 transition">
            Search
          </button>
        </form>
        {products.length > 0 && (
          <div className="space-y-2">
            {products.map((p) => (
              <Link key={p.id} href={`/admin/seo/edit?entity=product:${p.id}`} className={linkCls}>
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-xs text-ink-500">{p.standard}</span>
              </Link>
            ))}
          </div>
        )}
        {q && products.length === 0 && (
          <p className="text-sm text-ink-500">No products matched “{q}”.</p>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-display font-bold text-ink-950 mb-3">Site Pages</h2>
          <div className="space-y-2">
            {pages.map((p) => (
              <Link key={p.slug} href={`/admin/seo/edit?entity=page:${p.slug}`} className={linkCls}>
                <span>{p.title}</span>
                <Icon name="arrow-right" size={14} className="text-ink-400" />
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6">
          <h2 className="font-display font-bold text-ink-950 mb-3">Certifications</h2>
          <div className="space-y-2">
            {certifications.map((c) => (
              <Link key={c.id} href={`/admin/seo/edit?entity=cert:${c.id}`} className={linkCls}>
                <span>{c.name}</span>
                <Icon name="arrow-right" size={14} className="text-ink-400" />
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 md:col-span-2">
          <h2 className="font-display font-bold text-ink-950 mb-3">Product Testing</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Categories</h3>
              <div className="space-y-2">
                {testingCategories.map((c) => (
                  <Link key={c.id} href={`/admin/seo/edit?entity=testcat:${c.id}`} className={linkCls}>
                    <span className="truncate">{c.name}</span>
                    <Icon name="arrow-right" size={14} className="text-ink-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Tests & services</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {testingServices.map((s) => (
                  <Link key={s.id} href={`/admin/seo/edit?entity=test:${s.id}`} className={linkCls}>
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 text-xs text-ink-500">{s.category_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 md:col-span-2">
          <h2 className="font-display font-bold text-ink-950 mb-3">Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/admin/seo/edit?entity=category:${c.id}`} className={linkCls}>
                <span className="truncate">{c.name}</span>
                <Icon name="arrow-right" size={14} className="text-ink-400 shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
