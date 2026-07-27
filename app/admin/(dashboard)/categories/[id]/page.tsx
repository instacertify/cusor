import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Category } from "@/lib/db";
import { saveCategory } from "../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminCategoryEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const category = getDb()
    .prepare("SELECT * FROM categories WHERE id = ?")
    .get(Number(id)) as Category | undefined;
  if (!category) notFound();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Edit: {category.name}</h1>
        <Link href={`/category/${category.slug}`} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
          View page ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} />
      <form action={saveCategory} className="space-y-6">
        <input type="hidden" name="id" value={category.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <div className="grid sm:grid-cols-[1fr_120px] gap-4">
            <Field label="Category Name" name="name" defaultValue={category.name} required />
            <Field label="Icon name" name="icon" defaultValue={category.icon} placeholder="e.g. cpu, flask, beam" />
          </div>
          <TextArea label="Description" name="description" defaultValue={category.description} rows={3} />
          <Field label="Typical Timeline" name="timeline" defaultValue={category.timeline} placeholder="e.g. 10-16 weeks" />
          <ImageUpload current={category.image} label="Category Image" size="category" />
        </section>
        <SubmitButton />
      </form>
    </div>
  );
}
