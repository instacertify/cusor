import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Certification } from "@/lib/db";
import { getFaqs } from "@/lib/queries";
import { saveCertification, saveFaq, deleteFaq } from "../../../actions";
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
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name" name="name" defaultValue={cert.name} required />
            <Field label="Region" name="region" defaultValue={cert.region} />
            <Field label="Icon name" name="icon" defaultValue={cert.icon} placeholder="e.g. shield, globe, zap" />
          </div>
          <Field label="Full Name" name="full_name" defaultValue={cert.full_name} />
          <TextArea label="Summary" name="summary" defaultValue={cert.summary} rows={2} />
          <ImageUpload current={cert.image} label="Certification Image" />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content Writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={cert.content} rows={18} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={cert.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={cert.meta_description} rows={2} />
        </section>
        <SubmitButton />
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
