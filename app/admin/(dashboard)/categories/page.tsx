import Link from "next/link";
import Icon from "@/components/Icon";
import { getCategories } from "@/lib/queries";
import { SavedBanner } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminCategories({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = getCategories();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Categories</h1>
      <p className="text-ink-600 text-sm mb-6">
        Edit category names, icons, descriptions, timelines and images.
      </p>
      <SavedBanner saved={sp.saved} />
      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/categories/${c.id}`}
            className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 flex items-center gap-4"
          >
            <span className="shrink-0 w-11 h-11 rounded-xl bg-cream-100 text-ink-700 flex items-center justify-center">
              <Icon name={c.icon} size={24} />
            </span>
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
