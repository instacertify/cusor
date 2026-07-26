import Link from "next/link";
import { getAuthors } from "@/lib/queries";
import { saveAuthor } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminAuthorsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const authors = getAuthors();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Authors</h1>
        <BulkImportLink entity="authors" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Create author profiles, then assign them to blog posts. Public profiles live at{" "}
        <code className="bg-cream-100 px-1 rounded">/authors/[slug]</code>. Or bulk-upload via Excel.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
              <th className="px-5 py-3 font-bold">Author</th>
              <th className="px-5 py-3 font-bold">Posts</th>
              <th className="px-5 py-3 font-bold">Profile</th>
              <th className="px-5 py-3 font-bold" />
            </tr>
          </thead>
          <tbody>
            {authors.map((a) => (
              <tr key={a.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                <td className="px-5 py-3">
                  <span className="font-semibold text-ink-950">{a.name}</span>
                  {a.title ? (
                    <span className="block text-xs text-ink-500">{a.title}</span>
                  ) : null}
                </td>
                <td className="px-5 py-3 text-ink-600">{a.post_count ?? 0}</td>
                <td className="px-5 py-3 text-xs text-ink-500">/authors/{a.slug}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/authors/${a.id}`}
                    className="text-butter-700 font-bold text-sm hover:text-butter-600"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-500">
                  No authors yet — create one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-3">Create author</h2>
        <form action={saveAuthor} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Full name" name="name" required placeholder="e.g. Priya Sharma" />
            <Field label="Title / role" name="title" placeholder="e.g. BIS consultant" />
          </div>
          <TextArea
            label="Short bio"
            name="bio"
            rows={3}
            hint="Shown on the public author profile page."
          />
          <SubmitButton label="Create author" />
        </form>
      </div>
    </div>
  );
}
