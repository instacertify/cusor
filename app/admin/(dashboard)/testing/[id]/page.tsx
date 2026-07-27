import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { TestingCategory } from "@/lib/db";
import { getFaqs, getTestingServices } from "@/lib/queries";
import {
  saveTestingCategory,
  deleteTestingCategory,
  saveFaq,
  deleteFaq,
  saveTestingService,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/testing" className="text-xs font-bold text-ink-500 hover:text-butter-700">
            ← All testing categories
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1">
            Category: {cat.name}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {services.length} test page{services.length === 1 ? "" : "s"} under this category — each
            has its own editable FAQ set.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/admin/seo/edit?entity=testcat:${cat.id}`} className="text-sm font-bold text-ink-700">
            SEO tools →
          </Link>
          <Link href={`/testing/${cat.slug}`} target="_blank" className="text-sm font-bold text-butter-700">
            View category ↗
          </Link>
        </div>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <section className="mb-10 bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-ink-950">
            Test pages in this category ({services.length})
          </h2>
          <a
            href="#add-test"
            className="text-sm font-bold bg-butter-500 hover:bg-butter-400 text-ink-950 rounded-xl px-4 py-2 transition"
          >
            + Add test page
          </a>
        </div>
        {services.length === 0 ? (
          <p className="px-5 py-5 text-sm text-ink-600">
            No tests yet. Use the form below to create the first test page under{" "}
            <strong>{cat.name}</strong>. Each new test gets its own FAQ list you can edit.
          </p>
        ) : (
          <ul className="divide-y divide-cream-100">
            {services.map((s) => {
              const faqCount = getFaqs(`test:${s.id}`).length;
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-cream-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-950 truncate">{s.name}</span>
                    <span className="block text-xs text-ink-500 truncate">
                      /testing/{cat.slug}/{s.slug}
                      {s.standards ? ` · ${s.standards}` : ""}
                      {" · "}
                      {faqCount} FAQ{faqCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <Link
                    href={`/testing/${cat.slug}/${s.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-ink-600"
                  >
                    View ↗
                  </Link>
                  <Link
                    href={`/admin/testing/service/${s.id}#faqs`}
                    className="text-xs font-bold text-ink-800 border border-cream-300 rounded-lg px-2.5 py-1 hover:border-butter-400"
                  >
                    Edit FAQs
                  </Link>
                  <Link
                    href={`/admin/testing/service/${s.id}`}
                    className="text-xs font-bold text-butter-700"
                  >
                    Edit test →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="add-test" className="mb-10 bg-cream-100 rounded-2xl border border-cream-300 p-5 scroll-mt-24">
        <h2 className="font-display font-bold text-ink-950 mb-1">Add a test page under {cat.name}</h2>
        <p className="text-xs text-ink-600 mb-4">
          Complete options below. Starter FAQs are created automatically — then edit them on the
          test’s page.
        </p>
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
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Testing timeline" name="timeline" placeholder="e.g. 7–12 working days" />
            <Field
              label="Sample size required"
              name="sample_size"
              placeholder="e.g. 5 production units / 250 g"
            />
          </div>
          <TextArea label="Summary" name="summary" rows={2} />
          <TextArea label="Content writeup (Markdown)" name="content" rows={5} />
          <Field label="Meta Title" name="meta_title" />
          <TextArea label="Meta Description" name="meta_description" rows={2} />
          <ImageUpload current="" label="Test image" allowClear={false} size="testing" />
          <SubmitButton label="Create test page" />
        </form>
      </section>

      <form action={saveTestingCategory} className="space-y-6 mb-10">
        <input type="hidden" name="id" value={cat.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Category settings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Name" name="name" defaultValue={cat.name} required />
            <Field label="URL slug" name="slug" defaultValue={cat.slug} required />
            <Field label="Icon name" name="icon" defaultValue={cat.icon} />
            <Field label="Menu sort" name="sort" type="number" defaultValue={String(cat.sort)} />
          </div>
          <TextArea label="Summary" name="summary" defaultValue={cat.summary} rows={2} />
          <ImageUpload current={cat.image} label="Front / hero image" size="testing" />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Category content writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={cat.content} rows={14} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Category SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={cat.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={cat.meta_description} rows={2} />
        </section>
        <SubmitButton label="Save category" />
      </form>

      <section className="mt-10" id="faqs">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-1">
          Category FAQs ({faqs.length})
        </h2>
        <p className="text-sm text-ink-600 mb-4">
          Shown on the public <strong>category</strong> page only. Individual tests have separate
          FAQs — open <strong>Edit FAQs</strong> on a test above.
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
              <ConfirmDeleteForm action={deleteFaq} className="mt-2" itemLabel="this FAQ">
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="back" value={back} />
                <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete FAQ</button>
              </ConfirmDeleteForm>
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

      <ConfirmDeleteForm
        action={deleteTestingCategory}
        className="mt-12 pt-6 border-t border-cream-300"
        itemLabel={`“${cat.name}” and all its test pages`}
      >
        <input type="hidden" name="id" value={cat.id} />
        <button className="text-sm font-semibold text-red-600 hover:text-red-700">
          Delete this category and all its test pages
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
