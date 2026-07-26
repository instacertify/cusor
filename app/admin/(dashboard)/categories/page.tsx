import Link from "next/link";
import IconChip from "@/components/IconChip";
import { getCategories } from "@/lib/queries";
import { createCategory } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCategories({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = getCategories();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Categories</h1>
        <BulkImportLink entity="categories" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Create BIS product categories, or edit names, icons, descriptions, timelines and images.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add a BIS category</h2>
        <form action={createCategory} className="space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Name" name="name" required placeholder="e.g. Kitchen Appliances" />
            <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
            <Field label="Icon" name="icon" placeholder="box" defaultValue="box" />
          </div>
          <Field label="Typical Timeline" name="timeline" placeholder="e.g. 8-16 weeks" defaultValue="8-16 weeks" />
          <TextArea label="Description" name="description" rows={2} />
          <ImageUpload current="" label="Category image (optional)" allowClear={false} />
          <SubmitButton label="Create category" />
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/categories/${c.id}`}
            className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 flex items-center gap-4"
          >
            <IconChip name={c.icon} size={24} chip="lg" tone="neutral" />
            <span className="min-w-0">
              <span className="block font-display font-bold text-ink-950 truncate">{c.name}</span>
              <span className="block text-xs text-ink-500">{c.product_count} products · {c.timeline}</span>
            </span>
            <span className="ml-auto text-butter-700 font-bold text-sm shrink-0">Edit →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
