import Link from "next/link";
import { queryProductsTable, getCategories } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { createProduct } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminOffset,
  clampAdminPage,
  parseAdminPage,
} from "@/lib/admin-list";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; category?: string; saved?: string; error?: string }>;
}

export default async function AdminProducts({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const requested = parseAdminPage(sp.page);
  const categoryId = Number(sp.category) || 0;
  const counted = queryProductsTable({
    q,
    categoryId: categoryId || undefined,
    limit: 1,
    offset: 0,
  }).total;
  const page = clampAdminPage(requested, counted);
  const { products, total } = queryProductsTable({
    q,
    categoryId: categoryId || undefined,
    limit: ADMIN_PAGE_SIZE,
    offset: adminOffset(page),
  });
  const categories = getCategories();
  const filterParams = { q, category: categoryId || undefined };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Products</h1>
        <BulkImportLink entity="products" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        {total.toLocaleString("en-IN")} products. Add one below, bulk-upload via Excel, or edit fields,
        writeups, images and per-product FAQs. {ADMIN_PAGE_SIZE} per page.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add a BIS product</h2>
        <form action={createProduct} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Product Name" name="name" required placeholder="e.g. Electric Iron" />
            <div>
              <label htmlFor="category_id" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                defaultValue={categoryId || categories[0]?.id || ""}
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="IS Standard" name="standard" placeholder="e.g. IS 302-2-3" />
            <div>
              <label htmlFor="scheme-new" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Scheme
              </label>
              <select
                id="scheme-new"
                name="scheme"
                defaultValue="ISI"
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                <option value="ISI">ISI Mark</option>
                <option value="CRS">CRS Registration</option>
              </select>
            </div>
            <Field label="Timeline" name="timeline" placeholder="e.g. 10-14 weeks" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Min Test Price (₹)" name="min_price" type="number" />
            <Field label="Max Test Price (₹)" name="max_price" type="number" />
          </div>
          <TextArea label="Short description (optional)" name="description" rows={2} />
          <SubmitButton label="Create product" />
        </form>
      </div>

      <AdminFilterBar
        action="/admin/products"
        searchValue={q}
        searchPlaceholder="Search name or IS standard…"
        categoryName="category"
        categoryValue={categoryId ? String(categoryId) : ""}
        categoryLabel="BIS category"
        categories={categories.map((c) => ({ value: String(c.id), label: c.name }))}
      />

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

      <AdminPagination
        page={page}
        total={total}
        path="/admin/products"
        params={filterParams}
        noun="products"
      />
    </div>
  );
}
