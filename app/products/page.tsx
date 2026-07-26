import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import { getCategories } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All BIS Mandatory Products by Category",
  description:
    "Browse 1,400+ products requiring BIS certification in India, organised by category with IS standards, testing costs and approved labs.",
};

export default function ProductsPage() {
  const categories = getCategories();
  const total = categories.reduce((s, c) => s + (c.product_count ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Products" }]} />
      <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight">
        BIS Mandatory Products Database
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        {formatNumber(total)} products requiring BIS certification across{" "}
        {categories.length} categories — each mapped to its IS standard, real
        lab testing costs and approved laboratories.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl" aria-hidden>{c.icon}</span>
              <span className="text-xs font-bold bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
                {c.product_count} products
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
              {c.name}
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">
              {c.description}
            </p>
            <span className="mt-auto text-sm font-bold text-butter-700 pt-2">
              View products →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
