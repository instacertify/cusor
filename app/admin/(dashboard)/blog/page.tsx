import Link from "next/link";
import { getAllPosts, getAuthors } from "@/lib/queries";
import { createPost } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminBlog({ searchParams }: Props) {
  const sp = await searchParams;
  const posts = getAllPosts();
  const authors = getAuthors();
  const defaultAuthorId = authors[0]?.id ?? "";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Blog</h1>
      <p className="text-ink-600 text-sm mb-6">
        Write articles in Markdown, pick an author profile, then publish to /blog.{" "}
        <Link href="/admin/authors" className="font-semibold text-butter-700 hover:underline">
          Manage authors →
        </Link>
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Start a New Post</h2>
        <form action={createPost} className="grid sm:grid-cols-[2fr_1fr_auto] gap-3 items-end">
          <Field label="Post Title" name="title" required placeholder="e.g. How to pick a BIS testing lab" />
          <div>
            <label htmlFor="author_id" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Author
            </label>
            <select
              id="author_id"
              name="author_id"
              defaultValue={defaultAuthorId}
              required
              className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton label="Create Draft" />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
              <th className="px-5 py-3 font-bold">Post</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Published</th>
              <th className="px-5 py-3 font-bold" />
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                <td className="px-5 py-3">
                  <span className="font-semibold text-ink-950 line-clamp-1">{p.title}</span>
                  <span className="block text-xs text-ink-500">
                    /blog/{p.slug} · {p.author_name || p.author}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                      p.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-butter-300/50 text-butter-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-600 text-xs">{p.published_at ?? "—"}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/blog/${p.id}`} className="text-butter-700 font-bold text-sm hover:text-butter-600">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-500">
                  No posts yet — create your first draft above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
