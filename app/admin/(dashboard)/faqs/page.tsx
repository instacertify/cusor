import { getFaqs } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { saveFaq, deleteFaq } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

const PAGE_SCOPES = [
  { value: "global", label: "Homepage (global)" },
  { value: "page:products", label: "Products page" },
  { value: "page:labs", label: "Labs pages" },
  { value: "page:qco", label: "QCO Alerts page" },
  { value: "page:contact", label: "Contact page" },
  { value: "page:guide", label: "Guide page" },
  { value: "page:about", label: "About page" },
  { value: "page:privacy", label: "Privacy Policy" },
  { value: "page:terms", label: "Terms of Service" },
  { value: "page:search", label: "Search page" },
];

interface Props {
  searchParams: Promise<{ saved?: string; error?: string; scope?: string }>;
}

export default async function AdminFaqs({ searchParams }: Props) {
  const sp = await searchParams;
  const scope = sp.scope || "global";
  const faqs = getFaqs(scope);
  const back = `/admin/faqs?scope=${encodeURIComponent(scope)}`;

  const categories = getDb()
    .prepare("SELECT id, name FROM categories ORDER BY name")
    .all() as { id: number; name: string }[];
  const scopeOptions = [
    ...PAGE_SCOPES,
    ...categories.map((c) => ({ value: `category:${c.id}`, label: `Category: ${c.name}` })),
  ];
  const currentLabel = scopeOptions.find((s) => s.value === scope)?.label ?? scope;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink-950 mb-1">FAQs</h1>
      <p className="text-ink-600 text-sm mb-6">
        Every public page has its own FAQ section. Pick a page to edit its FAQs.
        Per-product FAQs are edited inside each product.
      </p>

      <form action="/admin/faqs" method="GET" className="mb-6 flex items-center gap-3">
        <select
          name="scope"
          defaultValue={scope}
          className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500 min-w-[260px]"
        >
          {scopeOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition">
          Load FAQs
        </button>
      </form>

      <SavedBanner saved={sp.saved} error={sp.error} />
      <h2 className="font-display text-lg font-bold text-ink-950 mb-4">
        {currentLabel} — {faqs.length} FAQ{faqs.length === 1 ? "" : "s"}
      </h2>

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
        {faqs.length === 0 && (
          <p className="text-sm text-ink-500 bg-white rounded-2xl border border-cream-300 p-6">
            No FAQs yet for this page — add the first one.
          </p>
        )}
      </div>

      <div className="mt-8 bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add New FAQ to “{currentLabel}”</h2>
        <form action={saveFaq} className="space-y-3">
          <input type="hidden" name="scope" value={scope} />
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
