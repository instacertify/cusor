import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Certification, CertProduct } from "@/lib/db";
import { getFaqs, getCertProducts } from "@/lib/queries";
import {
  saveCertification,
  saveFaq,
  deleteFaq,
  saveCertProduct,
  deleteCertProduct,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCertificationEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const cert = getDb()
    .prepare("SELECT * FROM certifications WHERE id = ?")
    .get(Number(id)) as Certification | undefined;
  if (!cert) notFound();
  const faqs = getFaqs(`cert:${cert.slug}`);
  const products = getCertProducts(cert.id);
  const back = `/admin/certifications/${cert.id}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Edit: {cert.name}</h1>
        <Link href={`/certifications/${cert.slug}`} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
          View page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveCertification} className="space-y-6">
        <input type="hidden" name="id" value={cert.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Fields</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Name" name="name" defaultValue={cert.name} required />
            <Field label="URL slug" name="slug" defaultValue={cert.slug} required />
            <Field label="Region" name="region" defaultValue={cert.region} />
            <Field label="Menu sort" name="sort" type="number" defaultValue={String(cert.sort)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="full_name" defaultValue={cert.full_name} />
            <Field label="Icon name" name="icon" defaultValue={cert.icon} placeholder="e.g. shield, globe, zap" />
          </div>
          <TextArea label="Summary" name="summary" defaultValue={cert.summary} rows={2} />
          <ImageUpload current={cert.image} label="Front / hero image" />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content Writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={cert.content} rows={16} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={cert.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={cert.meta_description} rows={2} />
        </section>
        <SubmitButton />
      </form>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-2">
          Product catalogue ({products.length})
        </h2>
        <p className="text-sm text-ink-600 mb-4">
          Add BEE schemes, GMARK categories or any products under this certification. They appear on the public
          certification page and in site search.
        </p>
        <div className="space-y-4">
          {products.map((p) => (
            <CertProductEditor key={p.id} product={p} certificationId={cert.id} />
          ))}
        </div>
        <div className="mt-6 bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add catalogue product</h3>
          <form action={saveCertProduct} className="space-y-3">
            <input type="hidden" name="certification_id" value={cert.id} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Product name" name="name" required placeholder="e.g. Room Air Conditioner" />
              <Field label="Slug (optional)" name="slug" placeholder="auto from name" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Family / group" name="family" placeholder="e.g. Mandatory" />
              <Field label="Regime" name="regime" placeholder="Mandatory / Voluntary" />
              <Field label="Sort" name="sort" type="number" defaultValue={String(products.length + 1)} />
            </div>
            <Field label="Standards" name="standards" placeholder="IS / IEC standards" />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Min testing price (INR)" name="min_price" type="number" />
              <Field label="Max testing price (INR)" name="max_price" type="number" />
            </div>
            <TextArea label="Summary" name="summary" rows={2} />
            <TextArea label="Labs (indicative)" name="labs" rows={2} />
            <TextArea label="Fee note" name="fee_note" rows={2} />
            <TextArea label="Content (Markdown)" name="content" rows={4} />
            <TextArea
              label="Extras JSON"
              name="extras"
              rows={2}
              defaultValue="{}"
              hint='Optional structured fields, e.g. {"star_table":"…","emc":"Yes"}'
            />
            <ImageUpload current="" label="Product image" allowClear={false} />
            <SubmitButton label="Add product" />
          </form>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-4">
          {cert.name} FAQs ({faqs.length})
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
                <SubmitButton label="Save FAQ" />
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
            <input type="hidden" name="scope" value={`cert:${cert.slug}`} />
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="sort" value={faqs.length} />
            <Field label="Question" name="question" required />
            <TextArea label="Answer" name="answer" rows={3} />
            <SubmitButton label="Add FAQ" />
          </form>
        </div>
      </section>
    </div>
  );
}

function CertProductEditor({
  product,
  certificationId,
}: {
  product: CertProduct;
  certificationId: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
      <form action={saveCertProduct} className="space-y-3">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="certification_id" value={certificationId} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Product name" name="name" defaultValue={product.name} required />
          <Field label="Slug" name="slug" defaultValue={product.slug} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Family" name="family" defaultValue={product.family} />
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
        <TextArea label="Labs" name="labs" defaultValue={product.labs} rows={2} />
        <TextArea label="Fee note" name="fee_note" defaultValue={product.fee_note} rows={2} />
        <TextArea label="Content (Markdown)" name="content" defaultValue={product.content} rows={4} />
        <TextArea label="Extras JSON" name="extras" defaultValue={product.extras || "{}"} rows={2} />
        <ImageUpload current={product.image} label="Product image" />
        <SubmitButton label="Save product" />
      </form>
      <form action={deleteCertProduct} className="mt-3 pt-3 border-t border-cream-200">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="certification_id" value={certificationId} />
        <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete product</button>
      </form>
    </div>
  );
}
