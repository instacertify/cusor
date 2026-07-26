import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Certification } from "@/lib/db";
import { getFaqs, getCertProducts } from "@/lib/queries";
import {
  saveCertification,
  deleteCertification,
  saveFaq,
  deleteFaq,
  saveCertProduct,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import CertProductExpandableList from "@/components/admin/CertProductExpandableList";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
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
  const initialOpenId = sp.edit ? Number(sp.edit) || null : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/certifications"
            className="text-xs font-bold text-ink-500 hover:text-butter-700"
          >
            ← All certifications
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1">
            {cert.name}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {products.length} product{products.length === 1 ? "" : "s"} in the list — click{" "}
            <strong>Edit</strong> on a row to enlarge and update that option.
          </p>
        </div>
        <Link
          href={`/certifications/${cert.slug}`}
          target="_blank"
          className="text-sm font-bold text-butter-700 shrink-0"
        >
          View page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <section className="mb-10 bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-950">
              Product list ({products.length})
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Compact list view · Edit expands the full fields for that product only
            </p>
          </div>
          <a
            href="#add-product"
            className="text-sm font-bold bg-butter-500 hover:bg-butter-400 text-ink-950 rounded-xl px-4 py-2 transition"
          >
            + Add covered product
          </a>
        </div>
        <CertProductExpandableList
          products={products}
          certificationId={cert.id}
          certSlug={cert.slug}
          hideLabs={cert.slug === "bee"}
          initialOpenId={initialOpenId}
        />
      </section>

      <section
        id="add-product"
        className="mb-10 bg-cream-100 rounded-2xl border border-cream-300 p-5 scroll-mt-24"
      >
        <h2 className="font-display font-bold text-ink-950 mb-1">
          Add a product covered under {cert.name}
        </h2>
        <p className="text-xs text-ink-600 mb-4">
          These appear on the public {cert.name} page and in site search.
        </p>
        <form action={saveCertProduct} className="space-y-3">
          <input type="hidden" name="certification_id" value={cert.id} />
          <input type="hidden" name="return_to" value="cert" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Product name" name="name" required placeholder="e.g. Room Air Conditioner" />
            <Field label="Slug (optional)" name="slug" placeholder="auto from name" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Family / group" name="family" placeholder="e.g. Mandatory" />
            <Field label="Regime" name="regime" placeholder="Mandatory / Voluntary" />
            <Field label="Sort" name="sort" type="number" defaultValue={String(products.length + 1)} />
          </div>
          <Field label="Standards" name="standards" placeholder="IS / IEC / GSO / SASO…" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Min testing price (INR)" name="min_price" type="number" />
            <Field label="Max testing price (INR)" name="max_price" type="number" />
          </div>
          <TextArea label="Summary" name="summary" rows={2} />
          {cert.slug !== "bee" && <TextArea label="Labs (indicative)" name="labs" rows={2} />}
          {cert.slug === "bee" && <input type="hidden" name="labs" value="" />}
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
          <SubmitButton label="Create covered product" />
        </form>
      </section>

      <form action={saveCertification} className="space-y-6 mb-10">
        <input type="hidden" name="id" value={cert.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Certification settings</h2>
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
          <h2 className="font-display font-bold text-ink-950">Content writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={cert.content} rows={16} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={cert.meta_title} />
          <TextArea
            label="Meta Description"
            name="meta_description"
            defaultValue={cert.meta_description}
            rows={2}
          />
        </section>
        <SubmitButton label="Save certification" />
      </form>

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
              <ConfirmDeleteForm action={deleteFaq} className="mt-2" itemLabel="this FAQ">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="back" value={back} />
                <button className="text-xs font-semibold text-red-600 hover:text-red-700">
                  Delete FAQ
                </button>
              </ConfirmDeleteForm>
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

      <ConfirmDeleteForm
        action={deleteCertification}
        className="mt-12 pt-6 border-t border-cream-300"
        itemLabel={`“${cert.name}” and all its covered products`}
      >
        <input type="hidden" name="id" value={cert.id} />
        <button className="text-sm font-semibold text-red-600 hover:text-red-700">
          Delete this certification and its covered products
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
