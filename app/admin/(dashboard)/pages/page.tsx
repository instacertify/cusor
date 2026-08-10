import Link from "next/link";
import { getAllPages } from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { createPage } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";
import PageNavPlacement from "@/components/admin/PageNavPlacement";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

function locationBadges(p: {
  nav_menu: number;
  nav_submenu: number;
  nav_footer: number;
  page_type?: string;
}) {
  const badges: string[] = [];
  if (p.page_type === "landing") badges.push("Landing");
  if (p.nav_menu) badges.push("Menu");
  if (p.nav_submenu) badges.push("Submenu");
  if (p.nav_footer) badges.push("Footer");
  return badges;
}

export default async function AdminPagesList({ searchParams }: Props) {
  const sp = await searchParams;
  const pages = getAllPages();
  const landings = pages.filter((p) => p.page_type === "landing");
  const contentPages = pages.filter((p) => p.page_type !== "landing");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Pages</h1>
        <BulkImportLink entity="pages" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Create CMS content pages or <strong>advertising landing pages</strong>. Landings use a conversion layout and
        stay out of the main nav by default so you can share campaign URLs only.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8 space-y-4">
        <h2 className="font-display font-bold text-ink-950">Add a new page</h2>
        <form action={createPage} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Page title" name="title" required placeholder="e.g. MSDS Authoring Service" />
            <Field label="URL slug (optional)" name="slug" placeholder="msds-authoring-service" />
          </div>
          <div>
            <label htmlFor="page_type" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Page type
            </label>
            <select
              id="page_type"
              name="page_type"
              defaultValue="content"
              className="w-full sm:max-w-md rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
            >
              <option value="content">Content page (site nav OK)</option>
              <option value="landing">Advertising landing page</option>
            </select>
            <p className="mt-1 text-[11px] text-ink-500">
              Landings get a campaign hero + CTA buttons. Default URL pattern: <code>/your-slug</code>
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Landing CTA label (optional)" name="cta_label" placeholder="Get Expert Help" />
            <Field label="Landing CTA URL (optional)" name="cta_href" placeholder="/contact" />
          </div>
          <PageNavPlacement submenu footer />
          <SubmitButton label="Create page" />
        </form>
      </div>

      {landings.length > 0 ? (
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-ink-950 mb-3">Advertising landing pages</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {landings.map((p) => (
              <Link
                key={p.slug}
                href={`/admin/pages/${p.slug}`}
                className="bg-white rounded-2xl border border-butter-300/60 shadow-card hover:shadow-card-hover transition p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-bold text-ink-950">{p.title}</h3>
                  <span className="text-xs font-mono text-ink-500 shrink-0">{pagePublicPath(p.slug)}</span>
                </div>
                <p className="text-xs text-ink-500 mt-2 line-clamp-2">{p.meta_description || p.hero_subheading}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-sky-100 text-sky-800 px-2 py-0.5">
                    Landing
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-cream-200 text-ink-600 px-2 py-0.5">
                    CTA: {p.cta_label || "Get Expert Help"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <h2 className="font-display text-xl font-semibold text-ink-950 mb-3">Site pages</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {contentPages.map((p) => {
          const badges = locationBadges(p);
          return (
            <Link
              key={p.slug}
              href={`/admin/pages/${p.slug}`}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-bold text-ink-950">{p.title}</h3>
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
