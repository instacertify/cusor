import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { TestingCategory, TestingService } from "@/lib/db";
import { getFaqs, getTestingServices } from "@/lib/queries";
import {
  saveTestingCategory,
  saveFaq,
  deleteFaq,
  saveTestingService,
  deleteTestingService,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTestingEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const cat = getDb()
    .prepare("SELECT * FROM testing_categories WHERE id = ?")
    .get(Number(id)) as TestingCategory | undefined;
  if (!cat) notFound();
  const faqs = getFaqs(`testcat:${cat.slug}`);
  const services = getTestingServices(cat.id);
  const back = `/admin/testing/${cat.id}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Edit: {cat.name}</h1>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/admin/seo/edit?entity=testcat:${cat.id}`} className="text-sm font-bold text-ink-700">
            SEO tools →
          </Link>
          <Link href={`/testing/${cat.slug}`} target="_blank" className="text-sm font-bold text-butter-700">
            View page ↗
          </Link>
        </div>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveTestingCategory} className="space-y-6">
        <input type="hidden" name="id" value={cat.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Fields</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Name" name="name" defaultValue={cat.name} required />
            <Field label="URL slug" name="slug" defaultValue={cat.slug} required />
            <Field label="Icon name" name="icon" defaultValue={cat.icon} />
            <Field label="Menu sort" name="sort" type="number" defaultValue={String(cat.sort)} />
          </div>
          <TextArea label="Summary" name="summary" defaultValue={cat.summary} rows={2} />
          <ImageUpload current={cat.image} label="Front / hero image" />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={cat.content} rows={14} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={cat.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={cat.meta_description} rows={2} />
        </section>
        <SubmitButton />
      </form>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-2">
          Tests & services ({services.length})
        </h2>
        <p className="text-sm text-ink-600 mb-4">
          Each test has its own public page with image, writeup, FAQs and SEO. They appear in search
          under Product Testing.
        </p>
        <div className="space-y-4">
          {services.map((s) => (
            <TestingServiceEditor key={s.id} service={s} categoryId={cat.id} categorySlug={cat.slug} />
          ))}
        </div>
        <div className="mt-6 bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add a test / service</h3>
          <form action={saveTestingService} className="space-y-3">
            <input type="hidden" name="category_id" value={cat.id} />
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
              <Field label="Sort" name="sort" type="number" defaultValue={String(services.length + 1)} />
            </div>
            <TextArea label="Summary" name="summary" rows={2} />
            <TextArea label="Content writeup (Markdown)" name="content" rows={5} />
            <Field label="Meta Title" name="meta_title" />
            <TextArea label="Meta Description" name="meta_description" rows={2} />
            <ImageUpload current="" label="Test image" allowClear={false} />
            <SubmitButton label="Add test" />
          </form>
        </div>
      </section>

      <section className="mt-10" id="faqs">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-1">
          {cat.name} FAQs ({faqs.length})
        </h2>
        <p className="text-sm text-ink-600 mb-4">
          These FAQs appear on the public category page. Each test below also has its own FAQ
          editor. You can manage all testing FAQs from Admin → FAQs as well.
        </p>
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
          <h3 className="font-display font-bold text-ink-950 mb-3">Add category FAQ</h3>
          <form action={saveFaq} className="space-y-3">
            <input type="hidden" name="scope" value={`testcat:${cat.slug}`} />
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

function TestingServiceEditor({
  service,
  categoryId,
  categorySlug,
}: {
  service: TestingService;
  categoryId: number;
  categorySlug: string;
}) {
  const faqs = getFaqs(`test:${service.id}`);
  const back = `/admin/testing/${categoryId}`;

  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-bold text-ink-950">{service.name}</h3>
        <div className="flex items-center gap-3 text-sm font-bold shrink-0">
          <Link href={`/admin/seo/edit?entity=test:${service.id}`} className="text-ink-700">
            SEO →
          </Link>
          <Link
            href={`/testing/${categorySlug}/${service.slug}`}
            target="_blank"
            className="text-butter-700"
          >
            View ↗
          </Link>
        </div>
      </div>

      <form action={saveTestingService} className="space-y-3">
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="category_id" value={categoryId} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Test name" name="name" defaultValue={service.name} required />
          <Field label="Slug" name="slug" defaultValue={service.slug} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Product category" name="product_category" defaultValue={service.product_category} />
          <Field label="Main standard" name="standards" defaultValue={service.standards} />
          <Field label="Test type" name="test_type" defaultValue={service.test_type} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Accreditation" name="accreditation" defaultValue={service.accreditation} />
          <Field label="Sort" name="sort" type="number" defaultValue={String(service.sort)} />
        </div>
        <TextArea label="Summary" name="summary" defaultValue={service.summary} rows={2} />
        <TextArea label="Content writeup (Markdown)" name="content" defaultValue={service.content} rows={6} />
        <Field label="Meta Title" name="meta_title" defaultValue={service.meta_title} />
        <TextArea label="Meta Description" name="meta_description" defaultValue={service.meta_description} rows={2} />
        <ImageUpload current={service.image} label="Test image" />
        <SubmitButton label="Save test" />
      </form>

      <div className="border-t border-cream-200 pt-4">
        <h4 className="font-display font-bold text-ink-950 mb-3">
          FAQs for this test ({faqs.length})
        </h4>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.id} className="bg-cream-50 rounded-xl border border-cream-200 p-4">
              <form action={saveFaq} className="space-y-2">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="scope" value={f.scope} />
                <input type="hidden" name="back" value={back} />
                <input type="hidden" name="sort" value={f.sort} />
                <Field label="Question" name="question" defaultValue={f.question} required />
                <TextArea label="Answer" name="answer" defaultValue={f.answer} rows={2} />
                <SubmitButton label="Save FAQ" />
              </form>
              <form action={deleteFaq} className="mt-2">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="back" value={back} />
                <button className="text-xs font-semibold text-red-600">Delete FAQ</button>
              </form>
            </div>
          ))}
        </div>
        <form action={saveFaq} className="mt-3 space-y-2 bg-cream-100 rounded-xl p-4">
          <input type="hidden" name="scope" value={`test:${service.id}`} />
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="sort" value={faqs.length} />
          <Field label="New question" name="question" required />
          <TextArea label="Answer" name="answer" rows={2} />
          <SubmitButton label="Add FAQ" />
        </form>
      </div>

      <form action={deleteTestingService} className="pt-3 border-t border-cream-200">
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="category_id" value={categoryId} />
        <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete test</button>
      </form>
    </div>
  );
}
