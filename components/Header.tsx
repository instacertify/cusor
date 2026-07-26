import Link from "next/link";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import MobileNav from "./MobileNav";
import NavDropdown from "./NavDropdown";
import { ensureDbReady } from "@/lib/db";
import { getCertifications, getTestingCategories, getPagesForNav } from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";

export default async function Header() {
  await ensureDbReady();
  const certs = getCertifications();
  const testingCats = getTestingCategories();
  const menuPages = getPagesForNav("menu");
  const submenuPages = getPagesForNav("submenu");

  const certItems = certs.map((c) => ({
    href: `/certifications/${c.slug}`,
    label: c.name,
    detail: c.region,
    icon: c.icon,
  }));

  const testingItems = testingCats.map((c) => ({
    href: `/testing/${c.slug}`,
    label: c.name,
    detail: `${c.service_count ?? 0} test${(c.service_count ?? 0) === 1 ? "" : "s"}`,
    icon: c.icon,
  }));

  const productItems = [
    { href: "/products", label: "Browse by Category", detail: "33 notified product categories", icon: "folder" },
    { href: "/products/all", label: "Product Search Table", detail: "All aspects: HSN, QCO, fees, labs", icon: "table" },
    { href: "/qco", label: "Upcoming QCOs", detail: "Deadlines for new mandatory products", icon: "bell" },
  ];

  const cmsSubmenuItems = submenuPages.map((p) => ({
    href: pagePublicPath(p.slug),
    label: p.nav_label || p.title,
    detail: p.nav_detail || p.meta_description || "",
    icon: "file",
  }));

  const resourceItems = [
    ...cmsSubmenuItems,
    { href: "/blog", label: "Blog", detail: "Compliance insights & how-tos", icon: "file" },
    { href: "/sitemap", label: "Sitemap", detail: "All main pages in one list", icon: "table" },
  ];

  // Keep unique hrefs (prefer earlier CMS entries)
  const seen = new Set<string>();
  const uniqueResources = resourceItems.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });

  return (
    <header className="sticky top-0 z-50 isolate bg-cream-50/95 backdrop-blur border-b border-cream-200 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-2 sm:gap-3 min-h-[4.25rem] sm:min-h-[5rem] py-2">
        <Link href="/" aria-label="certko home" className="shrink-0 min-w-0">
          <span className="hidden sm:block">
            <Logo width={176} withTagline priority />
          </span>
          <span className="sm:hidden">
            <Logo width={128} withTagline priority />
          </span>
        </Link>
        <div className="hidden lg:block flex-1 max-w-sm mx-auto">
          <SearchBox />
        </div>
        <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
          <NavDropdown label="Products" items={productItems} />
          <NavDropdown
            label="Certifications"
            items={certItems}
            footerItem={{ href: "/certifications", label: "All certifications & more" }}
          />
          <NavDropdown
            label="Product Testing"
            items={testingItems}
            footerItem={{ href: "/testing", label: "Search all product tests" }}
          />
          <Link
            href="/labs"
            className="px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-ink-950 hover:bg-cream-200 transition"
          >
            Labs
          </Link>
          {menuPages.map((p) => (
            <Link
              key={p.slug}
              href={pagePublicPath(p.slug)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-ink-950 hover:bg-cream-200 transition"
            >
              {p.nav_label || p.title}
            </Link>
          ))}
          <NavDropdown label="Resources" items={uniqueResources} />
          <Link
            href="/contact"
            className="ml-2 bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-semibold rounded-xl px-4 py-2.5 transition"
          >
            Get Expert Help
          </Link>
        </nav>
        <MobileNav
          groups={[
            {
              label: "Products",
              items: productItems.map(({ href, label }) => ({ href, label })),
            },
            {
              label: "Certifications",
              items: [
                { href: "/certifications", label: "All certifications" },
                ...certItems.map(({ href, label }) => ({ href, label })),
              ],
            },
            {
              label: "Product Testing",
              items: [
                { href: "/testing", label: "Search all tests" },
                ...testingItems.map(({ href, label }) => ({ href, label })),
              ],
            },
            {
              label: "Labs & Resources",
              items: [
                { href: "/labs", label: "Testing Labs" },
                ...menuPages.map((p) => ({
                  href: pagePublicPath(p.slug),
                  label: p.nav_label || p.title,
                })),
                ...uniqueResources.map(({ href, label }) => ({ href, label })),
              ].filter(
                (item, index, arr) =>
                  arr.findIndex((other) => other.href === item.href) === index
              ),
            },
            { label: "", items: [{ href: "/contact", label: "Get Expert Help" }] },
          ]}
        />
      </div>
    </header>
  );
}
