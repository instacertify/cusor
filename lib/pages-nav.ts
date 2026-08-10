import type { SqliteDatabase } from "./sqlite";

/** App routes that cannot be claimed by CMS page slugs */
export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "api",
  "authors",
  "blog",
  "category",
  "certifications",
  "contact",
  "favicon.ico",
  "home",
  "icon.png",
  "apple-icon.png",
  "labs",
  "legal",
  "product",
  "products",
  "qco",
  "robots.txt",
  "search",
  "sitemap",
  "sitemap.xml",
  "llms.txt",
  "testing",
  "uploads",
  "images",
  "brand",
  "_next",
]);

export function pagePublicPath(slug: string): string {
  if (slug === "home") return "/";
  if (slug === "contact") return "/contact";
  return `/${slug}`;
}

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug.toLowerCase());
}

/** Whether a CMS page can be served at /[slug] */
export function isRoutableContentPage(slug: string): boolean {
  if (!slug || isReservedPageSlug(slug)) return false;
  return true;
}

export function ensurePagesNavColumns(db: SqliteDatabase) {
  const cols = db.prepare("PRAGMA table_info(pages)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  const add = (name: string, ddl: string) => {
    if (!names.has(name)) db.exec(`ALTER TABLE pages ADD COLUMN ${ddl}`);
  };
  add("nav_menu", "nav_menu INTEGER NOT NULL DEFAULT 0");
  add("nav_submenu", "nav_submenu INTEGER NOT NULL DEFAULT 0");
  add("nav_footer", "nav_footer INTEGER NOT NULL DEFAULT 0");
  add("nav_label", "nav_label TEXT NOT NULL DEFAULT ''");
  add("nav_detail", "nav_detail TEXT NOT NULL DEFAULT ''");
  add("nav_sort", "nav_sort INTEGER NOT NULL DEFAULT 0");
  add("page_type", "page_type TEXT NOT NULL DEFAULT 'content'");
  add("cta_label", "cta_label TEXT NOT NULL DEFAULT ''");
  add("cta_href", "cta_href TEXT NOT NULL DEFAULT ''");

  // One-time defaults for seeded CMS pages if they still have all-zero placement
  const seeded: Record<string, { menu?: number; submenu?: number; footer?: number; label?: string; detail?: string; sort?: number }> = {
    guide: { submenu: 1, footer: 1, label: "Certification Guide", detail: "Process, documents, costs", sort: 10 },
    about: {
      submenu: 1,
      footer: 1,
      label: "About Certko",
      detail: "Certification & compliance solution partner",
      sort: 50,
    },
    tenders: { submenu: 1, label: "Certification for Tenders", detail: "Pre-qualify before the bid closes", sort: 20 },
    marketplaces: { submenu: 1, label: "Sell on Marketplaces", detail: "Amazon, Flipkart compliance", sort: 30 },
    privacy: { footer: 1, label: "Privacy Policy", sort: 90 },
    terms: { footer: 1, label: "Terms of Service", sort: 91 },
  };

  const upd = db.prepare(
    `UPDATE pages SET nav_menu=?, nav_submenu=?, nav_footer=?, nav_label=?, nav_detail=?, nav_sort=?
     WHERE slug=? AND nav_menu=0 AND nav_submenu=0 AND nav_footer=0`
  );

  for (const [slug, conf] of Object.entries(seeded)) {
    const existing = db
      .prepare("SELECT nav_menu, nav_submenu, nav_footer FROM pages WHERE slug = ?")
      .get(slug) as { nav_menu: number; nav_submenu: number; nav_footer: number } | undefined;
    if (!existing) continue;
    if (existing.nav_menu || existing.nav_submenu || existing.nav_footer) continue;
    upd.run(
      conf.menu ?? 0,
      conf.submenu ?? 0,
      conf.footer ?? 0,
      conf.label ?? "",
      conf.detail ?? "",
      conf.sort ?? 0,
      slug
    );
  }
}
