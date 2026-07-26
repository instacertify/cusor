import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getFaqs } from "@/lib/queries";
import { saveProduct, saveFaq, deleteFaq, removeProductImage } from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminProductEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const product = getProductById(Number(id));
  if (!product) notFound();
  const faqs = getFaqs(`product:${product.id}`);
  const back = `/admin/products/${product.id}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-950 leading-snug">
          Edit: {product.name}
        </h1>
        <Link href={`/product/${product.slug}`} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
          View page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveProduct} className="space-y-6">
        <input type="hidden" name="id" value={product.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Product Fields</h2>
          <Field label="Product Name" name="name" defaultValue={product.name} required />
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="IS Standard" name="standard" defaultValue={product.standard} />
            <div>
              <label htmlFor="scheme" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Scheme
              </label>
              <select
                id="scheme"
                name="scheme"
                defaultValue={product.scheme}
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                <option value="ISI">ISI Mark</option>
                <option value="CRS">CRS Registration</option>
              </select>
            </div>
            <Field label="Timeline" name="timeline" defaultValue={product.timeline} placeholder="e.g. 10-16 weeks" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <Field label="Min Test Price (₹)" name="min_price" type="number" defaultValue={product.min_price} />
            <Field label="Max Test Price (₹)" name="max_price" type="number" defaultValue={product.max_price} />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-800 pb-3">
              <input type="checkbox" name="featured" defaultChecked={!!product.featured} className="w-4 h-4 accent-butter-500" />
              Featured on homepage
            </label>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="HSN Code (4-digit)" name="hsn4" defaultValue={product.hsn4} placeholder="e.g. 8516" />
            <Field label="HSN Code (8-digit)" name="hsn8" defaultValue={product.hsn8} placeholder="e.g. 85161000" />
            <Field label="QCO Status" name="qco_status" defaultValue={product.qco_status} placeholder="e.g. Mandatory (QCO in force)" />
          </div>
          <Field label="Applicable QCO / Order" name="qco_order" defaultValue={product.qco_order} placeholder="Order name and effective date" />
          <ImageUpload current={product.image} label="Product Image" />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content Writeup</h2>
          <TextArea
            label="Description (Markdown)"
            name="description"
            defaultValue={product.description}
            rows={16}
            hint="Shown on the product page. Supports ## headings, **bold** and lists."
          />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={product.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={product.meta_description} rows={2} />
        </section>

        <SubmitButton />
      </form>

      {product.image && (
        <form action={removeProductImage} className="mt-3">
          <input type="hidden" name="id" value={product.id} />
          <button className="text-xs font-semibold text-red-600 hover:text-red-700">
            Remove product image (falls back to category image)
          </button>
        </form>
      )}

      {/* FAQs */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-4">
          Product FAQs ({faqs.length})
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
              <form action={saveFaq} className="space-y-3">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="scope" value={f.scope} />
                <input type="hidden" name="back" value={back} />
                <input type="hidden" name="sort" value={f.sort} />
                <Field label="Question" name="question" defaultValue={f.question} required />
                <TextArea label="Answer" name="answer" defaultValue={f.answer} rows={3} />
                <div className="flex items-center gap-4">
                  <SubmitButton label="Save FAQ" />
                </div>
              </form>
              <form action={deleteFaq} className="mt-2">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="back" value={back} />
                <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete FAQ</button>
              </form>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add New FAQ</h3>
          <form action={saveFaq} className="space-y-3">
            <input type="hidden" name="scope" value={`product:${product.id}`} />
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="sort" value={faqs.length} />
            <Field label="Question" name="question" required placeholder="e.g. Is a factory inspection required?" />
            <TextArea label="Answer" name="answer" rows={3} />
            <SubmitButton label="Add FAQ" />
          </form>
        </div>
      </section>
    </div>
  );
}
