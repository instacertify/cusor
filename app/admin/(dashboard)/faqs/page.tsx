import { getFaqs } from "@/lib/queries";
import { saveFaq, deleteFaq } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminFaqs({ searchParams }: Props) {
  const sp = await searchParams;
  const faqs = getFaqs("global");
  const back = "/admin/faqs";

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink-950 mb-1">Global FAQs</h1>
      <p className="text-ink-600 text-sm mb-6">
        Shown on the homepage. Per-product FAQs are edited inside each product.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
            <form action={saveFaq} className="space-y-3">
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="scope" value={f.scope} />
              <input type="hidden" name="back" value={back} />
              <div className="grid sm:grid-cols-[1fr_90px] gap-3">
                <Field label="Question" name="question" defaultValue={f.question} required />
                <Field label="Order" name="sort" type="number" defaultValue={f.sort} />
              </div>
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

      <div className="mt-8 bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add New FAQ</h2>
        <form action={saveFaq} className="space-y-3">
          <input type="hidden" name="scope" value="global" />
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="sort" value={faqs.length} />
          <Field label="Question" name="question" required />
          <TextArea label="Answer" name="answer" rows={3} />
          <SubmitButton label="Add FAQ" />
        </form>
      </div>
    </div>
  );
}
