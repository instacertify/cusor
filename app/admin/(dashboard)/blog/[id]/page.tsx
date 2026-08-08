import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById, getAuthors } from "@/lib/queries";
import { savePost, deletePost } from "../../../actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import BlogScheduleFields from "@/components/admin/BlogScheduleFields";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
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
          <TextArea
            label="Content (Markdown)"
            name="content"
            defaultValue={post.content}
            rows={24}
            hint="Use ## for section headings, **bold**, - lists, [links](/products) and | tables |."
          />
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
