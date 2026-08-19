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

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-6">
          <div>
            <h2 className="font-display font-bold text-ink-950 text-lg">Article sidebar</h2>
            <p className="text-sm text-ink-600 mt-1 leading-relaxed">
              Two boxes beside the article: <strong>Quote</strong> and <strong>Other blogs</strong>.
              Pick default or edit for each — box names are editable.
            </p>
          </div>

          {/* —— Quote box —— */}
          <div className="rounded-2xl border-2 border-cream-300 overflow-hidden">
            <div className="bg-ink-950 text-white px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-300">Box 1</p>
              <p className="font-display font-semibold text-lg">Quote box</p>
            </div>
            <div className="p-5 space-y-5 bg-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
                  How to fill this box
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="flex gap-3 rounded-xl border-2 border-cream-300 p-4 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50 transition">
                    <input
                      type="radio"
                      name="cta_mode"
                      value="default"
                      defaultChecked={(post.cta_mode || "default") !== "custom"}
                      className="mt-1 accent-butter-600"
                    />
                    <span>
                      <span className="block font-bold text-ink-950">Use site defaults</span>
                      <span className="block text-xs text-ink-500 mt-1 leading-relaxed">
                        Settings → Blog article sidebar. Auto certified / tested.
                      </span>
                    </span>
                  </label>
                  <label className="flex gap-3 rounded-xl border-2 border-cream-300 p-4 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50 transition">
                    <input
                      type="radio"
                      name="cta_mode"
                      value="custom"
                      defaultChecked={(post.cta_mode || "") === "custom"}
                      className="mt-1 accent-butter-600"
                    />
                    <span>
                      <span className="block font-bold text-ink-950">Edit this post</span>
                      <span className="block text-xs text-ink-500 mt-1 leading-relaxed">
                        Custom box title, topic, body and button for this article only.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50 p-4 space-y-4">
                <p className="text-sm font-bold text-ink-900">Editable fields (for Edit this post)</p>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
                    Box type
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex gap-3 rounded-xl border-2 border-cream-300 bg-white p-3.5 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50">
                      <input
                        type="radio"
                        name="cta_kind"
                        value="certification"
                        defaultChecked={(post.cta_kind || "certification") !== "testing"}
                        className="mt-0.5 accent-butter-600"
                      />
                      <span className="text-sm font-semibold text-ink-950">Get certified faster</span>
                    </label>
                    <label className="flex gap-3 rounded-xl border-2 border-cream-300 bg-white p-3.5 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50">
                      <input
                        type="radio"
                        name="cta_kind"
                        value="testing"
                        defaultChecked={(post.cta_kind || "") === "testing"}
                        className="mt-0.5 accent-butter-600"
                      />
                      <span className="text-sm font-semibold text-ink-950">Get tested faster</span>
                    </label>
                  </div>
                </div>
                <Field
                  label="Box title (heading)"
                  name="cta_heading"
                  defaultValue={post.cta_heading || ""}
                  placeholder="e.g. Get certified faster"
                />
                <Field
                  label="Topic fill-in (_____ in the write-up)"
                  name="cta_topic"
                  defaultValue={post.cta_topic || ""}
                  placeholder="e.g. BIS CRS / EMI-EMC / your product"
                />
                <TextArea
                  label="Write-up under the title (use {topic})"
                  name="cta_body"
                  defaultValue={post.cta_body || ""}
                  rows={3}
                  hint="Example: Our experts handle the application, coordinate testing for {topic} and manage the inspection. Free quote in 24 hours."
                />
                <Field
                  label="Button name"
                  name="cta_submit_label"
                  defaultValue={post.cta_submit_label || ""}
                  placeholder="Request quote"
                />
              </div>
            </div>
          </div>

          {/* —— Other blogs box —— */}
          <div className="rounded-2xl border-2 border-cream-300 overflow-hidden">
            <div className="bg-cream-100 px-5 py-3 border-b border-cream-300">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Box 2</p>
              <p className="font-display font-semibold text-lg text-ink-950">Other blogs box</p>
            </div>
            <div className="p-5 space-y-5 bg-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
                  Visibility
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex gap-3 rounded-xl border-2 border-cream-300 p-4 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50 transition">
                    <input
                      type="radio"
                      name="more_posts_mode"
                      value="default"
                      defaultChecked={
                        (post.more_posts_mode || "default") !== "hide" &&
                        (post.more_posts_mode || "") !== "custom"
                      }
                      className="mt-1 accent-butter-600"
                    />
                    <span>
                      <span className="block font-bold text-ink-950">Show defaults</span>
                      <span className="block text-xs text-ink-500 mt-1">Site title + list</span>
                    </span>
                  </label>
                  <label className="flex gap-3 rounded-xl border-2 border-cream-300 p-4 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50 transition">
                    <input
                      type="radio"
                      name="more_posts_mode"
                      value="custom"
                      defaultChecked={(post.more_posts_mode || "") === "custom"}
                      className="mt-1 accent-butter-600"
                    />
                    <span>
                      <span className="block font-bold text-ink-950">Edit box name</span>
                      <span className="block text-xs text-ink-500 mt-1">Custom title / subtitle</span>
                    </span>
                  </label>
                  <label className="flex gap-3 rounded-xl border-2 border-cream-300 p-4 cursor-pointer has-[:checked]:border-butter-500 has-[:checked]:bg-butter-50 transition">
                    <input
                      type="radio"
                      name="more_posts_mode"
                      value="hide"
                      defaultChecked={(post.more_posts_mode || "") === "hide"}
                      className="mt-1 accent-butter-600"
                    />
                    <span>
                      <span className="block font-bold text-ink-950">Hide box</span>
                      <span className="block text-xs text-ink-500 mt-1">Not shown on this post</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50 p-4 space-y-4">
                <p className="text-sm font-bold text-ink-900">
                  Editable box name (for Edit box name)
                </p>
                <Field
                  label="Box title"
                  name="more_posts_title"
                  defaultValue={post.more_posts_title || ""}
                  placeholder="More from the blog"
                />
                <Field
                  label="Box subtitle"
                  name="more_posts_subtitle"
                  defaultValue={post.more_posts_subtitle || ""}
                  placeholder="Scroll for more articles"
                />
              </div>
            </div>
          </div>
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
