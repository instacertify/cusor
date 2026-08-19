import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById, getAuthors } from "@/lib/queries";
import { savePost, deletePost } from "../../../actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import BlogScheduleFields from "@/components/admin/BlogScheduleFields";
import { Field, TextArea, MarkdownEditor, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import { BLOG_IMAGE_ACCEPT, BLOG_IMAGE_HINT } from "@/lib/image-upload";
import { toDatetimeLocalValue } from "@/lib/blog-scheduler";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminPostEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const post = getPostById(Number(id));
  if (!post) notFound();
  const authors = getAuthors();
  const selectedAuthorId = post.author_id ?? authors[0]?.id ?? "";
  const publishAtLocal = toDatetimeLocalValue(post.published_at);

  const saveLabel =
    post.status === "published"
      ? "Save & Update Live Post"
      : post.status === "scheduled"
        ? "Save Schedule"
        : "Save Draft";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-950 leading-snug">
          Edit Post: {post.title}
        </h1>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
            View post ↗
          </Link>
        )}
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />
      {sp.error === "schedule_required" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Choose a <strong>Publish at</strong> date/time before saving a scheduled post.
        </div>
      )}

      <form action={savePost} className="space-y-6">
        <input type="hidden" name="id" value={post.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Post Details</h2>
          <Field label="Title" name="title" defaultValue={post.title} required />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="URL Slug (/blog/…)" name="slug" defaultValue={post.slug} />
            <div>
              <label htmlFor="author_id" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Author
              </label>
              <select
                id="author_id"
                name="author_id"
                defaultValue={selectedAuthorId}
                required
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-ink-500">
                <Link href="/admin/authors" className="font-semibold text-butter-700 hover:underline">
                  Create / edit author profiles
                </Link>
              </p>
            </div>
          </div>

          <BlogScheduleFields initialStatus={post.status} initialPublishAt={publishAtLocal} />

          <TextArea label="Excerpt (shown on the blog index and in search results)" name="excerpt" defaultValue={post.excerpt} rows={2} />
          <ImageUpload
            current={post.image}
            label="Cover Image"
            accept={BLOG_IMAGE_ACCEPT}
            previewFit="cover"
            previewAspect="aspect-[16/9]"
            hint={BLOG_IMAGE_HINT}
          />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Article Content</h2>
          <MarkdownEditor
            label="Article body"
            name="content"
            defaultValue={post.content}
            minHeightClass="min-h-[28rem]"
            hint="Headings, bold, lists, links and tables. Switch to Source for raw Markdown."
          />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-5">
          <div>
            <h2 className="font-display font-bold text-ink-950">Article sidebar</h2>
            <p className="text-sm text-ink-600 mt-1">
              Quote box (“Get certified faster” / “Get tested faster”) plus a vertical scroll of other
              blogs. Choose site defaults or edit this post only.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Quote CTA
            </legend>
            <label className="flex items-start gap-2 text-sm text-ink-800">
              <input
                type="radio"
                name="cta_mode"
                value="default"
                defaultChecked={(post.cta_mode || "default") !== "custom"}
                className="mt-1"
              />
              <span>
                <strong className="text-ink-950">Use defaults</strong>
                <span className="block text-ink-500 text-xs mt-0.5">
                  From Admin → Settings → Blog article sidebar (auto certified vs tested).
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-ink-800">
              <input
                type="radio"
                name="cta_mode"
                value="custom"
                defaultChecked={(post.cta_mode || "") === "custom"}
                className="mt-1"
              />
              <span>
                <strong className="text-ink-950">Edit for this post</strong>
                <span className="block text-ink-500 text-xs mt-0.5">
                  Override heading, topic blank, and certified vs tested copy below.
                </span>
              </span>
            </label>
          </fieldset>

          <div className="rounded-xl border border-cream-200 bg-cream-50 p-4 space-y-4">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              Custom CTA fields (used when “Edit for this post” is selected)
            </p>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Type
              </span>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="cta_kind"
                    value="certification"
                    defaultChecked={(post.cta_kind || "certification") !== "testing"}
                  />
                  Get certified faster
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="cta_kind"
                    value="testing"
                    defaultChecked={(post.cta_kind || "") === "testing"}
                  />
                  Get tested faster
                </label>
              </div>
            </div>
            <Field
              label="Heading (optional override)"
              name="cta_heading"
              defaultValue={post.cta_heading || ""}
              placeholder="Leave blank to use Get certified / tested faster"
            />
            <Field
              label="Topic fill-in (for “coordinate testing for _____”)"
              name="cta_topic"
              defaultValue={post.cta_topic || ""}
              placeholder="e.g. BIS CRS / EMI-EMC / your product"
            />
            <TextArea
              label="Body (optional full override — use {topic})"
              name="cta_body"
              defaultValue={post.cta_body || ""}
              rows={3}
              hint="Example: Our experts handle the application, coordinate testing for {topic} and manage the inspection. Free quote in 24 hours."
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Other blogs (vertical scroll)
            </legend>
            <label className="flex items-start gap-2 text-sm text-ink-800">
              <input
                type="radio"
                name="more_posts_mode"
                value="default"
                defaultChecked={(post.more_posts_mode || "default") !== "hide"}
                className="mt-1"
              />
              <span>
                <strong className="text-ink-950">Show defaults</strong>
                <span className="block text-ink-500 text-xs mt-0.5">
                  Vertical scroll of other published articles beside the post.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-ink-800">
              <input
                type="radio"
                name="more_posts_mode"
                value="hide"
                defaultChecked={(post.more_posts_mode || "") === "hide"}
                className="mt-1"
              />
              <span>
                <strong className="text-ink-950">Hide on this post</strong>
              </span>
            </label>
          </fieldset>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SEO</h2>
          <Field label="Meta Title" name="meta_title" defaultValue={post.meta_title} />
          <TextArea label="Meta Description" name="meta_description" defaultValue={post.meta_description} rows={2} />
        </section>

        <SubmitButton label={saveLabel} />
      </form>

      <ConfirmDeleteForm action={deletePost} className="mt-4" itemLabel={`post “${post.title}”`}>
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className="text-xs font-semibold text-red-600 hover:text-red-700">
          Delete this post permanently
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
