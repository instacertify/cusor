import Link from "next/link";
import { listContentDrafts } from "@/lib/content-writer";
import { getDb } from "@/lib/db";
import { generateContentDraft, deleteContentDraftAction } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const inputCls =
  "w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500";

export default async function AdminContentWriterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const drafts = listContentDrafts();
  const products = getDb()
    .prepare(
      `SELECT slug, name, standard FROM products ORDER BY featured DESC, name LIMIT 200`
    )
    .all() as { slug: string; name: string; standard: string }[];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Content Writer</h1>
        <Link href="/admin/backlinks" className="text-sm font-bold text-butter-700 hover:underline">
          Backlinks →
        </Link>
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Generate SEO-ready Markdown drafts for Certko — guides, product pages, FAQs and pillar hubs —
        with automatic internal links into your catalogue.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <section className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Generate a new draft</h2>
        <form action={generateContentDraft} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Title"
              name="title"
              required
              placeholder="e.g. How to get BIS certification for LED lamps"
            />
            <Field
              label="Focus keyword"
              name="focus_keyword"
              required
              placeholder="e.g. BIS certification for LED lamps"
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Content type
              </label>
              <select name="content_type" defaultValue="guide" className={inputCls}>
                <option value="guide">How-to guide</option>
                <option value="product">Product explainer</option>
                <option value="faq">FAQ article</option>
                <option value="comparison">Comparison</option>
                <option value="news">Regulatory update</option>
                <option value="pillar">Pillar / hub page</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Tone
              </label>
              <select name="tone" defaultValue="professional" className={inputCls}>
                <option value="professional">Professional</option>
                <option value="plain">Plain language</option>
                <option value="sales">Sales / conversion</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Tie to product (optional)
              </label>
              <select name="product_slug" defaultValue="" className={inputCls}>
                <option value="">No specific product</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                    {p.standard ? ` (${p.standard})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field
            label="Secondary keywords (comma-separated)"
            name="secondary_keywords"
            placeholder="ISI mark, NABL lab, QCO"
          />
          <Field
            label="Audience"
            name="audience"
            placeholder="e.g. Electronics OEMs launching in India"
          />
          <TextArea
            label="Brief / notes"
            name="notes"
            rows={3}
            hint="Paste talking points, regulatory changes, or angles to include."
          />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="auto_link"
              value="1"
              defaultChecked
              className="rounded border-cream-300"
            />
            Auto-insert internal links from products, certifications and posts
          </label>
          <SubmitButton label="Generate draft" />
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200">
          <h2 className="font-display font-bold text-ink-950">Saved drafts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
                <th className="px-5 py-3 font-bold">Draft</th>
                <th className="px-5 py-3 font-bold">Type</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold" />
              </tr>
            </thead>
            <tbody>
              {drafts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-500">
                    No drafts yet. Generate your first article above.
                  </td>
                </tr>
              )}
              {drafts.map((d) => (
                <tr key={d.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/content-writer/${d.id}`}
                      className="font-semibold text-ink-950 hover:text-butter-700"
                    >
                      {d.title}
                    </Link>
                    <span className="block text-xs text-ink-500">
                      {d.focus_keyword || "No focus keyword"} · updated {d.updated_at}
                    </span>
                  </td>
                  <td className="px-5 py-3 capitalize">{d.content_type}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                        d.status === "saved_to_post"
                          ? "bg-green-100 text-green-700"
                          : "bg-cream-200 text-ink-600"
                      }`}
                    >
                      {d.status === "saved_to_post" ? "In blog" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/content-writer/${d.id}`}
                      className="text-xs font-bold text-butter-700 hover:underline mr-3"
                    >
                      Edit
                    </Link>
                    <ConfirmDeleteForm action={deleteContentDraftAction} itemLabel="this draft">
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" className="text-xs font-bold text-red-700 hover:underline">
                        Delete
                      </button>
                    </ConfirmDeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
