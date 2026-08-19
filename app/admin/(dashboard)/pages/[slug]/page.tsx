import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { savePage, deletePage } from "../../../actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { Field, TextArea, MarkdownEditor, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import PageNavPlacement from "@/components/admin/PageNavPlacement";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const PROTECTED = new Set(["home", "contact", "privacy", "terms", "about", "guide"]);

export default async function AdminPageEdit({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = getPage(slug);
  if (!page) notFound();
  const publicPath = pagePublicPath(page.slug);
  const isLanding = page.page_type === "landing";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Edit: {page.title}</h1>
        <Link
          href={publicPath}
          target="_blank"
          className="text-sm font-bold text-butter-700 hover:text-butter-600 shrink-0"
        >
          View page ↗
        </Link>
      </div>
      <p className="text-ink-600 text-sm mb-6">
        {isLanding ? "Advertising landing page · " : "Content page · "}
        Markdown supported. URL: <code className="bg-cream-100 px-1 rounded">{publicPath}</code>
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />
      <form action={savePage} className="space-y-6">
        <input type="hidden" name="slug" value={page.slug} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Page type &amp; CTA</h2>
          <div>
            <label htmlFor="page_type" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Page type
            </label>
            <select
              id="page_type"
              name="page_type"
              defaultValue={isLanding ? "landing" : "content"}
              className="w-full sm:max-w-md rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
            >
              <option value="content">Content page</option>
              <option value="landing">Advertising landing page</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Primary CTA label"
              name="cta_label"
              defaultValue={page.cta_label || (isLanding ? "Get Expert Help" : "")}
              placeholder="Get Expert Help"
            />
            <Field
              label="Primary CTA URL"
              name="cta_href"
              defaultValue={page.cta_href || (isLanding ? "/contact" : "")}
              placeholder="/contact"
            />
          </div>
          <p className="text-[11px] text-ink-500">
            Used on landing heroes and bottom conversion bars. Leave blank on normal content pages if unused.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Heading & Hero</h2>
          <Field label="Page Title" name="title" defaultValue={page.title} required />
          <Field label="Hero Heading" name="hero_heading" defaultValue={page.hero_heading} />
          <TextArea label="Hero Subheading" name="hero_subheading" defaultValue={page.hero_subheading} rows={2} />
          <ImageUpload current={page.image} label="Page Image" />
        </section>

        <PageNavPlacement
          menu={Boolean(page.nav_menu)}
          submenu={Boolean(page.nav_submenu)}
          footer={Boolean(page.nav_footer)}
          label={page.nav_label || ""}
          detail={page.nav_detail || ""}
          sort={page.nav_sort || 0}
        />

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={page.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={page.meta_description} rows={2} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content Writeup</h2>
          <MarkdownEditor
            label="Page content"
            name="content"
            defaultValue={page.content}
            minHeightClass="min-h-[26rem]"
            hint="Headings, bold, lists, links and tables. Add FAQs under Admin → FAQs with scope page:this-slug."
          />
        </section>
        <SubmitButton />
      </form>

      {!PROTECTED.has(page.slug) ? (
        <ConfirmDeleteForm action={deletePage} className="mt-4" itemLabel={`page “${page.title}”`}>
          <input type="hidden" name="slug" value={page.slug} />
          <button type="submit" className="text-xs font-semibold text-red-600 hover:text-red-700">
            Delete this page
          </button>
        </ConfirmDeleteForm>
      ) : null}
    </div>
  );
}
