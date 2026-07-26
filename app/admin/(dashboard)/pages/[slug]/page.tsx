import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/queries";
import { savePage } from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminPageEdit({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Edit: {page.title}</h1>
        <Link
          href={slug === "home" ? "/" : `/${slug}`}
          target="_blank"
          className="text-sm font-bold text-butter-700 hover:text-butter-600 shrink-0"
        >
          View page ↗
        </Link>
      </div>
      <p className="text-ink-600 text-sm mb-6">Content supports Markdown (headings, lists, tables, bold).</p>
      <SavedBanner saved={sp.saved} />
      <form action={savePage} className="space-y-6">
        <input type="hidden" name="slug" value={page.slug} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Heading & Hero</h2>
          <Field label="Page Title" name="title" defaultValue={page.title} required />
          <Field label="Hero Heading" name="hero_heading" defaultValue={page.hero_heading} />
          <TextArea label="Hero Subheading" name="hero_subheading" defaultValue={page.hero_subheading} rows={2} />
          <ImageUpload current={page.image} label="Page Image" />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={page.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={page.meta_description} rows={2} />
        </section>
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Content Writeup</h2>
          <TextArea
            label="Content (Markdown)"
            name="content"
            defaultValue={page.content}
            rows={22}
            hint="Use ## for section headings, **bold**, - lists, and | tables |."
          />
        </section>
        <SubmitButton />
      </form>
    </div>
  );
}
