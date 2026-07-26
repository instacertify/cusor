import Link from "next/link";
import { searchProducts, countSearchProducts, getCategories } from "@/lib/queries";
import { getDb } from "@/lib/db";
import type { Product } from "@/lib/db";
import { formatPriceRange } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

interface Props {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export default async function AdminProducts({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const categoryId = Number(sp.category) || 0;

  let products: Product[];
  let total: number;
  if (q) {
    products = searchProducts(q, PAGE_SIZE, (page - 1) * PAGE_SIZE);
    total = countSearchProducts(q);
  } else if (categoryId) {
    const db = getDb();
    total = (db.prepare("SELECT COUNT(*) AS n FROM products WHERE category_id=?").get(categoryId) as { n: number }).n;
    products = db
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
         FROM products p JOIN categories c ON c.id=p.category_id WHERE p.category_id=? ORDER BY p.name LIMIT ? OFFSET ?`
      )
      .all(categoryId, PAGE_SIZE, (page - 1) * PAGE_SIZE) as Product[];
  } else {
    const db = getDb();
    total = (db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }).n;
    products = db
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
         FROM products p JOIN categories c ON c.id=p.category_id ORDER BY p.lab_count DESC LIMIT ? OFFSET ?`
      )
      .all(PAGE_SIZE, (page - 1) * PAGE_SIZE) as Product[];
  }
  const pages = Math.ceil(total / PAGE_SIZE);
  const categories = getCategories();

  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (categoryId) u.set("category", String(categoryId));
    u.set("page", String(p));
    return `/admin/products?${u.toString()}`;
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Products</h1>
      <p className="text-ink-600 text-sm mb-6">
        {total.toLocaleString("en-IN")} products. Edit fields, writeups, images and per-product FAQs.
      </p>

      <form action="/admin/products" method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or IS standard…"
          className="flex-1 min-w-[200px] rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
        />
        <select
          name="category"
          defaultValue={String(categoryId || "")}
          className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-6 py-2.5 transition">
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
              <th className="px-5 py-3 font-bold">Product</th>
              <th className="px-5 py-3 font-bold">Category</th>
              <th className="px-5 py-3 font-bold">Price Range</th>
              <th className="px-5 py-3 font-bold">Labs</th>
              <th className="px-5 py-3 font-bold" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                <td className="px-5 py-3">
                  <span className="font-semibold text-ink-950 line-clamp-1">{p.name}</span>
                  <span className="block text-xs text-ink-500">{p.standard} · {p.scheme}{p.featured ? " · featured" : ""}</span>
                </td>
                <td className="px-5 py-3 text-ink-600 text-xs">{p.category_name}</td>
                <td className="px-5 py-3 text-ink-700">{formatPriceRange(p.min_price, p.max_price)}</td>
                <td className="px-5 py-3 text-ink-700">{p.lab_count}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-butter-700 font-bold text-sm hover:text-butter-600">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={qs(page - 1)} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">← Prev</Link>
          )}
          <span className="text-sm text-ink-600 px-3">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={qs(page + 1)} className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-sm font-semibold hover:border-butter-500">Next →</Link>
          )}
        </nav>
      )}
    </div>
  );
}
