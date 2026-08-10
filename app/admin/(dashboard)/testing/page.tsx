import Link from "next/link";
import IconChip from "@/components/IconChip";
import { getTestingCategories, getTestingServices } from "@/lib/queries";
import { createTestingCategory, saveTestingService } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTesting({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = getTestingCategories();
  const categoriesWithTests = categories.map((c) => ({
    ...c,
    tests: getTestingServices(c.id),
  }));
  const totalTests = categoriesWithTests.reduce((n, c) => n + c.tests.length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Product Testing</h1>
        <BulkImportLink entities={["testing_categories", "testing_services"]} />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Create a <strong>master testing category</strong> (shown in the header Testing menu), then add
        product/test pages mapped to that category. Use bulk import for many testing solutions with
        tentative prices. {categories.length} categor{categories.length === 1 ? "y" : "ies"} ·{" "}
        {totalTests} testing solution{totalTests === 1 ? "" : "s"}.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h2 className="font-display font-bold text-ink-950 mb-1">Create master testing category</h2>
          <p className="text-xs text-ink-600 mb-4">
            Master categories appear in the site menu under <strong>Testing</strong> and own all
            mapped product test pages. Public URL: <span className="font-mono">/testing/…</span>
          </p>
          <form action={createTestingCategory} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Category name" name="name" required placeholder="e.g. Environmental Testing" />
              <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Icon" name="icon" placeholder="microscope" defaultValue="microscope" />
              <Field label="Menu sort" name="sort" type="number" placeholder="auto" />
            </div>
            <Field label="Summary" name="summary" placeholder="One-line description for cards & search" />
            <TextArea
              label="Category content (Markdown)"
              name="content"
              rows={4}
              hint="Shown on the public category page. You can expand this after create."
            />
            <Field label="Meta title" name="meta_title" placeholder="auto from name" />
            <TextArea label="Meta description" name="meta_description" rows={2} />
            <ImageUpload current="" label="Front image (optional)" allowClear={false} />
            <SubmitButton label="Create category" />
          </form>
        </div>

        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h2 className="font-display font-bold text-ink-950 mb-1">Add a testing product page</h2>
          <p className="text-xs text-ink-600 mb-4">
            Map this page to a master testing category. It appears under that category in the menu,
            listing pages, and search. Add tentative prices for public display.
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-ink-700 bg-white border border-cream-300 rounded-xl px-4 py-3">
              Create a category first, then you can add test pages under it.
            </p>
          ) : (
            <form action={saveTestingService} className="space-y-3">
              <input type="hidden" name="return_to" value="list" />
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  defaultValue={categories[0]?.id}
                  className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Test name" name="name" required placeholder="e.g. LED Lamp — Safety" />
                <Field label="Slug (optional)" name="slug" placeholder="auto from name" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Product category" name="product_category" placeholder="e.g. Electrical" />
                <Field label="Main standard" name="standards" placeholder="e.g. IS 16102" />
                <Field label="Test type" name="test_type" placeholder="e.g. Safety" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="Accreditation"
                  name="accreditation"
                  defaultValue="ISO/IEC 17025 / NABL"
                />
                <Field label="Sort" name="sort" type="number" defaultValue={1} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Testing timeline" name="timeline" placeholder="e.g. 7–12 working days" />
                <Field
                  label="Sample size required"
                  name="sample_size"
                  placeholder="e.g. 5 production units"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Min price (₹)" name="min_price" type="number" placeholder="e.g. 15000" />
                <Field label="Max price (₹)" name="max_price" type="number" placeholder="e.g. 45000" />
                <Field
                  label="Price note"
                  name="price_note"
                  placeholder="Indicative; confirm on quote"
                />
              </div>
              <TextArea label="Summary" name="summary" rows={2} />
              <TextArea label="Content writeup (Markdown)" name="content" rows={4} />
              <Field label="Meta title" name="meta_title" />
              <TextArea label="Meta description" name="meta_description" rows={2} />
              <ImageUpload current="" label="Test image" allowClear={false} />
              <SubmitButton label="Create testing product page" />
            </form>
          )}
        </div>
      </div>

      <h2 className="font-display text-xl font-bold text-ink-950 mb-3">
        Categories & their test pages
      </h2>
      <div className="space-y-4">
        {categoriesWithTests.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-4 p-5 border-b border-cream-200">
              <Link href={`/admin/testing/${c.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover border border-cream-200 shrink-0"
                  />
                ) : (
                  <IconChip name={c.icon} size={24} chip="lg" tone="neutral" />
                )}
                <span className="min-w-0">
                  <span className="block font-display font-bold text-ink-950 truncate">{c.name}</span>
                  <span className="block text-xs text-ink-500">
                    /testing/{c.slug} · {c.tests.length} test page{c.tests.length === 1 ? "" : "s"}
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-3 text-sm font-bold shrink-0">
                <Link href={`/testing/${c.slug}`} target="_blank" className="text-ink-600 hover:text-ink-900">
                  View ↗
                </Link>
                <Link href={`/admin/testing/${c.id}`} className="text-butter-700 hover:text-butter-600">
                  Manage category →
                </Link>
              </div>
            </div>

            {c.tests.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-500">
                No test pages yet. Use “Add a test page” above (select this category), or open Manage
                category.
              </p>
            ) : (
              <ul className="divide-y divide-cream-100">
                {c.tests.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-cream-50">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-950 truncate">{t.name}</span>
                      <span className="block text-xs text-ink-500 truncate">
                        /testing/{c.slug}/{t.slug}
                        {t.standards ? ` · ${t.standards}` : ""}
                        {t.test_type ? ` · ${t.test_type}` : ""}
                      </span>
                    </span>
                    <Link
                      href={`/testing/${c.slug}/${t.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-ink-600 hover:text-ink-900"
                    >
                      View ↗
                    </Link>
                    <Link
                      href={`/admin/testing/service/${t.id}#faqs`}
                      className="text-xs font-bold text-ink-800 border border-cream-300 rounded-lg px-2.5 py-1 hover:border-butter-400"
                    >
                      Edit FAQs
                    </Link>
                    <Link
                      href={`/admin/testing/service/${t.id}`}
                      className="text-xs font-bold text-butter-700 hover:text-butter-600"
                    >
                      Edit test →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
