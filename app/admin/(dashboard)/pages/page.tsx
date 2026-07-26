import Link from "next/link";
import { getAllPages } from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { createPage } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";
import PageNavPlacement from "@/components/admin/PageNavPlacement";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

function locationBadges(p: {
  nav_menu: number;
  nav_submenu: number;
  nav_footer: number;
}) {
  const badges: string[] = [];
  if (p.nav_menu) badges.push("Menu");
  if (p.nav_submenu) badges.push("Submenu");
  if (p.nav_footer) badges.push("Footer");
  return badges;
}

export default async function AdminPagesList({ searchParams }: Props) {
  const sp = await searchParams;
  const pages = getAllPages();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Pages</h1>
      <p className="text-ink-600 text-sm mb-6">
        Create CMS pages and choose where they appear: top menu, Resources submenu, and/or footer.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8 space-y-4">
        <h2 className="font-display font-bold text-ink-950">Add a new page</h2>
        <form action={createPage} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Page title" name="title" required placeholder="e.g. Export Checklist" />
            <Field label="URL slug (optional)" name="slug" placeholder="export-checklist" />
          </div>
          <PageNavPlacement submenu footer />
          <SubmitButton label="Create page" />
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {pages.map((p) => {
          const badges = locationBadges(p);
          return (
            <Link
              key={p.slug}
              href={`/admin/pages/${p.slug}`}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display font-bold text-ink-950">{p.title}</h2>
                <span className="text-xs font-mono text-ink-500 shrink-0">{pagePublicPath(p.slug)}</span>
              </div>
              <p className="text-xs text-ink-500 mt-2 line-clamp-2">{p.meta_description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {badges.length ? (
                  badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-butter-300/40 text-butter-800 px-2 py-0.5"
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-cream-200 text-ink-500 px-2 py-0.5">
                    Not in nav
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
