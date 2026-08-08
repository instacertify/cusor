import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthorById } from "@/lib/queries";
import { saveAuthor, deleteAuthor } from "../../../actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminAuthorEditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const author = getAuthorById(Number(id));
  if (!author) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Edit Author: {author.name}</h1>
        <Link
          href={`/authors/${author.slug}`}
          target="_blank"
          className="text-sm font-bold text-butter-700 shrink-0"
        >
          View profile ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveAuthor} className="space-y-6">
        <input type="hidden" name="id" value={author.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" name="name" defaultValue={author.name} required />
            <Field label="URL slug (/authors/…)" name="slug" defaultValue={author.slug} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title / role" name="title" defaultValue={author.title} />
            <Field label="Email (optional)" name="email" defaultValue={author.email} />
          </div>
          <TextArea
            label="About the author"
            name="bio"
            defaultValue={author.bio}
            rows={5}
            hint="A short intro shown above their published articles."
          />
          <ImageUpload
            current={author.image}
            label="Profile photo"
            size="author"
            previewFit="cover"
          />
        </section>
        <SubmitButton label="Save author profile" />
      </form>

      <ConfirmDeleteForm
        action={deleteAuthor}
        className="mt-4"
        itemLabel={`author “${author.name}”`}
      >
        <input type="hidden" name="id" value={author.id} />
        <button className="text-xs font-semibold text-red-600 hover:text-red-700">
          Delete author (posts reassign to another author)
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
