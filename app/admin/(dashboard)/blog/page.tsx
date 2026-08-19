import Link from "next/link";
import { getAuthors, listAdminPosts } from "@/lib/queries";
import { createPost } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminOffset,
  clampAdminPage,
  parseAdminPage,
} from "@/lib/admin-list";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    q?: string;
    page?: string;
    category?: string;
    author?: string;
  }>;
}

const STATUS_FILTERS = [
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
];

export default async function AdminBlog({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = (sp.category ?? "").trim();
  const authorId = Number(sp.author) || 0;
  const requested = parseAdminPage(sp.page);
  const authors = getAuthors();
  const counted = listAdminPosts({
    q,
    status,
    authorId: authorId || undefined,
    limit: 1,
    offset: 0,
  }).total;
  const page = clampAdminPage(requested, counted);
  const { posts, total } = listAdminPosts({
    q,
    status,
    authorId: authorId || undefined,
    limit: ADMIN_PAGE_SIZE,
    offset: adminOffset(page),
  });
  const defaultAuthorId = authors[0]?.id ?? "";
  const filterParams = {
    q,
    category: status,
    author: authorId || undefined,
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Blog</h1>
        <BulkImportLink entity="posts" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Write articles in Markdown, pick an author profile, then publish or schedule a future go-live time.
        Scheduled posts publish automatically when due. Bulk-upload drafts via Excel.{" "}
        {total.toLocaleString("en-IN")} post{total === 1 ? "" : "s"}
        {status ? ` · ${status}` : ""}.{" "}
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

      <AdminFilterBar
        action="/admin/blog"
        searchValue={q}
        searchPlaceholder="Search title, slug or author…"
        categoryName="category"
        categoryValue={status}
        categoryLabel="Status"
        allLabel="All statuses"
        categories={STATUS_FILTERS}
        extraFields={
          <div className="min-w-[180px]">
            <label htmlFor="admin-filter-author" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Author
            </label>
            <select
              id="admin-filter-author"
              name="author"
              defaultValue={authorId ? String(authorId) : ""}
              className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
            >
              <option value="">All authors</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
              <th className="px-5 py-3 font-bold">Post</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Go live</th>
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
                        : p.status === "scheduled"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-butter-300/50 text-butter-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-600 text-xs">
                  {p.published_at
                    ? p.status === "scheduled"
                      ? `Scheduled · ${p.published_at}`
                      : p.published_at
                    : "—"}
                </td>
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
                  No posts match this filter — create a draft above or clear filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={page}
        total={total}
        path="/admin/blog"
        params={filterParams}
        noun="posts"
      />
    </div>
  );
}
