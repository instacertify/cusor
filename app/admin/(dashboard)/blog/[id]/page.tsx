import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById } from "@/lib/queries";
import { savePost, deletePost } from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminPostEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const post = getPostById(Number(id));
  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-950 leading-snug">
          Edit Post: {post.title}
        </h1>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
            View post ↗
          </Link>
        )}
      </div>
      <SavedBanner saved={sp.saved} />

      <form action={savePost} className="space-y-6">
        <input type="hidden" name="id" value={post.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Post Details</h2>
          <Field label="Title" name="title" defaultValue={post.title} required />
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="URL Slug (/blog/…)" name="slug" defaultValue={post.slug} />
            <Field label="Author" name="author" defaultValue={post.author} />
            <div>
              <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={post.status}
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </div>
          </div>
          <TextArea label="Excerpt (shown on the blog index and in search results)" name="excerpt" defaultValue={post.excerpt} rows={2} />
          <ImageUpload current={post.image} label="Cover Image" />
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

        <SubmitButton label={post.status === "published" ? "Save & Update Live Post" : "Save Draft"} />
      </form>

      <form action={deletePost} className="mt-4">
        <input type="hidden" name="id" value={post.id} />
        <button className="text-xs font-semibold text-red-600 hover:text-red-700">
          Delete this post permanently
        </button>
      </form>
    </div>
  );
}
