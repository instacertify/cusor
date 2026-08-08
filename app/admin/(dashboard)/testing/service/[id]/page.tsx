import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFaqs,
  getTestingCategories,
  getTestingServiceById,
} from "@/lib/queries";
import {
  saveTestingService,
  deleteTestingService,
  saveFaq,
  deleteFaq,
} from "../../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTestingServiceEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const service = getTestingServiceById(Number(id));
  if (!service) notFound();

  const categories = getTestingCategories();
  const faqs = getFaqs(`test:${service.id}`);
  const back = `/admin/testing/service/${service.id}`;
  const categoryHref = `/admin/testing/${service.category_id}`;
  const publicHref = `/testing/${service.category_slug}/${service.slug}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link href={categoryHref} className="text-xs font-bold text-ink-500 hover:text-butter-700">
            ← {service.category_name}
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1 leading-snug">
            Edit test: {service.name}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            This test has its <strong>own FAQ set</strong> (editable below) — separate from the
            category FAQs.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-sm font-bold">
          <Link href={`/admin/seo/edit?entity=test:${service.id}`} className="text-ink-700">
            SEO →
          </Link>
          <Link href={publicHref} target="_blank" className="text-butter-700">
            View page ↗
          </Link>
        </div>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <section
        id="faqs"
        className="mb-10 bg-butter-300/25 rounded-2xl border border-butter-400/50 p-5 scroll-mt-24"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-950">
              FAQs for this test ({faqs.length})
            </h2>
            <p className="text-sm text-ink-700 mt-1 max-w-2xl">
              These questions appear only on{" "}
              <span className="font-mono text-xs">/testing/{service.category_slug}/{service.slug}</span>.
              Edit, add or delete freely — they do not affect other tests.
            </p>
          </div>
          <a
            href="#add-faq"
            className="text-sm font-bold bg-ink-900 hover:bg-ink-800 text-white rounded-xl px-4 py-2 transition"
          >
            + Add FAQ
          </a>
        </div>

        {faqs.length === 0 ? (
          <p className="text-sm text-ink-700 bg-white/70 border border-cream-300 rounded-xl px-4 py-3 mb-4">
            No FAQs yet for this test. Add the first one below — starter FAQs are also created
            automatically when you add a new test.
          </p>
        ) : (
          <div className="space-y-3 mb-4">
            {faqs.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-cream-300 p-4 shadow-card">
                <form action={saveFaq} className="space-y-2">
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="scope" value={`test:${service.id}`} />
                  <input type="hidden" name="back" value={`${back}#faqs`} />
                  <div className="grid sm:grid-cols-[1fr_90px] gap-3">
                    <Field label="Question" name="question" defaultValue={f.question} required />
                    <Field label="Order" name="sort" type="number" defaultValue={f.sort} />
                  </div>
                  <TextArea label="Answer" name="answer" defaultValue={f.answer} rows={3} />
                  <SubmitButton label="Save FAQ" />
                </form>
                <ConfirmDeleteForm action={deleteFaq} className="mt-2" itemLabel="this FAQ">
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="back" value={`${back}#faqs`} />
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700">
                    Delete FAQ
                  </button>
                </ConfirmDeleteForm>
              </div>
            ))}
          </div>
        )}

        <div id="add-faq" className="bg-white rounded-xl border border-cream-300 p-4 scroll-mt-24">
          <h3 className="font-display font-bold text-ink-950 mb-3">Add FAQ for this test</h3>
          <form action={saveFaq} className="space-y-3">
            <input type="hidden" name="scope" value={`test:${service.id}`} />
            <input type="hidden" name="back" value={`${back}#faqs`} />
            <input type="hidden" name="sort" value={faqs.length} />
            <Field label="Question" name="question" required placeholder="e.g. How many samples do I need?" />
            <TextArea label="Answer" name="answer" rows={3} />
            <SubmitButton label="Add FAQ to this test" />
          </form>
        </div>
      </section>

      <form action={saveTestingService} className="space-y-6 mb-10">
        <input type="hidden" name="id" value={service.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Test details</h2>
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
              defaultValue={service.category_id}
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
            <Field label="Test name" name="name" defaultValue={service.name} required />
            <Field label="Slug" name="slug" defaultValue={service.slug} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field
              label="Product category"
              name="product_category"
              defaultValue={service.product_category}
            />
            <Field label="Main standard" name="standards" defaultValue={service.standards} />
            <Field label="Test type" name="test_type" defaultValue={service.test_type} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Accreditation" name="accreditation" defaultValue={service.accreditation} />
            <Field label="Sort" name="sort" type="number" defaultValue={String(service.sort)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Testing timeline" name="timeline" defaultValue={service.timeline} />
            <Field label="Sample size required" name="sample_size" defaultValue={service.sample_size} />
          </div>
          <TextArea label="Summary" name="summary" defaultValue={service.summary} rows={2} />
          <ImageUpload current={service.image} label="Test image" size="testing" />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content writeup</h2>
          <TextArea label="Content (Markdown)" name="content" defaultValue={service.content} rows={12} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={service.meta_title} />
          <TextArea
            label="Meta Description"
            name="meta_description"
            defaultValue={service.meta_description}
            rows={2}
          />
        </section>
        <SubmitButton label="Save test details" />
      </form>

      <ConfirmDeleteForm
        action={deleteTestingService}
        className="pt-6 border-t border-cream-300"
        itemLabel={`“${service.name}” and its FAQs`}
      >
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="category_id" value={service.category_id} />
        <button className="text-sm font-semibold text-red-600 hover:text-red-700">
          Delete this test and its FAQs
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
