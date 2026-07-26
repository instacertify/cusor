import Link from "next/link";
import { getDb } from "@/lib/db";
import type { PageRecord } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminPagesList() {
  const pages = getDb().prepare("SELECT * FROM pages ORDER BY slug").all() as PageRecord[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Pages</h1>
      <p className="text-ink-600 text-sm mb-6">
        Edit page headings, SEO metadata, content writeups and images.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/pages/${p.slug}`}
            className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-ink-950">{p.title}</h2>
              <span className="text-xs font-mono text-ink-500">/{p.slug === "home" ? "" : p.slug}</span>
            </div>
            <p className="text-xs text-ink-500 mt-2 line-clamp-2">{p.meta_description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
