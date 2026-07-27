import Link from "next/link";
import { notFound } from "next/navigation";
import { getContentDraftById } from "@/lib/content-writer";
import { getAuthors } from "@/lib/queries";
import {
  saveContentDraftAction,
  regenerateContentDraft,
  publishContentDraftToBlog,
  deleteContentDraftAction,
} from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

const inputCls =
  "w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500";

export default async function AdminContentDraftEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const draft = getContentDraftById(Number(id));
  if (!draft) notFound();
  const authors = getAuthors();
  let links: { label: string; path: string }[] = [];
  try {
    links = JSON.parse(draft.internal_links_json || "[]") as {
      label: string;
      path: string;
    }[];
  } catch {
    links = [];
  }
  const wordCount = draft.content
    .replace(/[#>*`_\-|[\]]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <Link
            href="/admin/content-writer"
            className="text-xs font-bold text-butter-700 hover:underline"
          >
            ← All drafts
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ink-950 mt-1 leading-snug">
            {draft.title}
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            ~{wordCount} words · {draft.content_type} · {draft.tone}
            {draft.post_id ? (
              <>
                {" "}
                ·{" "}
                <Link
                  href={`/admin/blog/${draft.post_id}`}
                  className="font-semibold text-butter-700 hover:underline"
                >
                  Open blog draft #{draft.post_id}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
      <SavedBanner saved={sp.saved} />

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <form action={saveContentDraftAction} className="space-y-6">
          <input type="hidden" name="id" value={draft.id} />
          <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
            <h2 className="font-display font-bold text-ink-950">Draft details</h2>
            <Field label="Title" name="title" defaultValue={draft.title} required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Focus keyword"
                name="focus_keyword"
                defaultValue={draft.focus_keyword}
              />
              <Field
                label="Secondary keywords"
                name="secondary_keywords"
                defaultValue={draft.secondary_keywords}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                  Content type
                </label>
                <select name="content_type" defaultValue={draft.content_type} className={inputCls}>
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
                <select name="tone" defaultValue={draft.tone} className={inputCls}>
                  <option value="professional">Professional</option>
                  <option value="plain">Plain language</option>
                  <option value="sales">Sales / conversion</option>
                </select>
              </div>
            </div>
            <TextArea label="Excerpt" name="excerpt" defaultValue={draft.excerpt} rows={2} />
          </section>

          <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
            <h2 className="font-display font-bold text-ink-950">Article content</h2>
            <TextArea
              label="Markdown"
              name="content"
              defaultValue={draft.content}
              rows={28}
              hint="Edit freely — keep ## headings, lists and [internal links](/path)."
            />
          </section>

          <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
            <h2 className="font-display font-bold text-ink-950">SEO</h2>
            <Field label="Meta title" name="meta_title" defaultValue={draft.meta_title} />
            <TextArea
              label="Meta description"
              name="meta_description"
              defaultValue={draft.meta_description}
              rows={2}
            />
            <SubmitButton label="Save draft" />
          </section>
        </form>

        <aside className="space-y-4">
          <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 space-y-3">
            <h2 className="font-display font-bold text-ink-950">Publish to blog</h2>
            <p className="text-xs text-ink-600">
              Creates or updates a blog draft you can polish and publish from Posts.
            </p>
            <form action={publishContentDraftToBlog} className="space-y-3">
              <input type="hidden" name="id" value={draft.id} />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                  Author
                </label>
                <select
                  name="author_id"
                  defaultValue={authors[0]?.id ?? ""}
                  className={inputCls}
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <SubmitButton
                label={draft.post_id ? "Update blog draft" : "Save as blog draft"}
              />
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 space-y-3">
            <h2 className="font-display font-bold text-ink-950">Regenerate</h2>
            <p className="text-xs text-ink-600">
              Rebuilds Markdown from the title, keyword, type and tone currently saved on this draft.
            </p>
            <form action={regenerateContentDraft}>
              <input type="hidden" name="id" value={draft.id} />
              <input type="hidden" name="title" value={draft.title} />
              <input type="hidden" name="focus_keyword" value={draft.focus_keyword} />
              <input type="hidden" name="content_type" value={draft.content_type} />
              <input type="hidden" name="tone" value={draft.tone} />
              <input
                type="hidden"
                name="secondary_keywords"
                value={draft.secondary_keywords}
              />
              <SubmitButton label="Regenerate content" />
            </form>
          </section>

          {links.length > 0 && (
            <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
              <h2 className="font-display font-bold text-ink-950 mb-3">Internal links used</h2>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.path} className="text-sm">
                    <span className="font-semibold text-ink-950">{l.label}</span>
                    <span className="block text-xs text-ink-500">{l.path}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/backlinks"
                className="inline-block mt-3 text-xs font-bold text-butter-700 hover:underline"
              >
                Open backlink tracker →
              </Link>
            </section>
          )}

          <ConfirmDeleteForm action={deleteContentDraftAction} itemLabel="this draft">
            <input type="hidden" name="id" value={draft.id} />
            <button
              type="submit"
              className="w-full text-sm font-bold text-red-700 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50"
            >
              Delete draft
            </button>
          </ConfirmDeleteForm>
        </aside>
      </div>
    </div>
  );
}
