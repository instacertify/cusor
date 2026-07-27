import { notFound } from "next/navigation";
import Link from "next/link";
import { getCertifications, getCertProductById } from "@/lib/queries";
import { saveCertProduct, deleteCertProduct } from "../../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCertProductEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const product = getCertProductById(Number(id));
  if (!product) notFound();
  const certifications = getCertifications();
  const publicHref = `/certifications/${product.cert_slug}/products/${product.slug}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link
            href={`/admin/certifications/${product.certification_id}/products`}
            className="text-xs font-bold text-ink-500 hover:text-butter-700"
          >
            ← All {product.cert_name} products
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1 leading-snug">
            Covered product: {product.name}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            Part of the <strong>{product.cert_name}</strong> catalogue (BEE, GMARK, SABER, or other).
          </p>
        </div>
        <Link href={publicHref} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
          View page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveCertProduct} className="space-y-6 mb-10">
        <input type="hidden" name="id" value={product.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Product details</h2>
          <div>
            <label
              htmlFor="certification_id"
              className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
            >
              Certification (move if needed)
            </label>
            <select
              id="certification_id"
              name="certification_id"
              defaultValue={product.certification_id}
              className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
            >
              {certifications.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.region || "—"})
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Product name" name="name" defaultValue={product.name} required />
            <Field label="Slug" name="slug" defaultValue={product.slug} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Family / group" name="family" defaultValue={product.family} />
            <Field label="Regime" name="regime" defaultValue={product.regime} />
            <Field label="Sort" name="sort" type="number" defaultValue={String(product.sort)} />
          </div>
          <Field label="Standards" name="standards" defaultValue={product.standards} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Min testing price (INR)"
              name="min_price"
              type="number"
              defaultValue={product.min_price != null ? String(product.min_price) : ""}
            />
            <Field
              label="Max testing price (INR)"
              name="max_price"
              type="number"
              defaultValue={product.max_price != null ? String(product.max_price) : ""}
            />
          </div>
          <TextArea label="Summary" name="summary" defaultValue={product.summary} rows={2} />
          <ImageUpload current={product.image} label="Product image" size="product" />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Writeup & notes</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={product.content} rows={10} />
          <TextArea label="Labs (indicative)" name="labs" defaultValue={product.labs} rows={2} />
          <TextArea label="Fee note" name="fee_note" defaultValue={product.fee_note} rows={2} />
          <TextArea
            label="Extras JSON"
            name="extras"
            defaultValue={product.extras || "{}"}
            rows={2}
            hint='Optional structured fields, e.g. {"star_table":"…","emc":"Yes"}'
          />
        </section>
        <SubmitButton label="Save covered product" />
      </form>

      <ConfirmDeleteForm
        action={deleteCertProduct}
        className="pt-6 border-t border-cream-300"
        itemLabel={`“${product.name}”`}
      >
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="certification_id" value={product.certification_id} />
        <button className="text-sm font-semibold text-red-600 hover:text-red-700">
          Delete this covered product
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
