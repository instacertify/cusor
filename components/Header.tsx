import Logo from "./Logo";
import SearchBox from "./SearchBox";
import MobileNav from "./MobileNav";
import NavDropdown from "./NavDropdown";
import { ensureDbReady } from "@/lib/db";
import { getCertifications, getTestingCategories, getPagesForNav } from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";

/** Top-level CMS pages already covered elsewhere in the header. */
const MENU_SKIP = new Set(["contact", "blog", "sitemap", "home"]);

export default async function Header() {
  await ensureDbReady();
  const certs = getCertifications();
  const testingCats = getTestingCategories();
  const menuPages = getPagesForNav("menu").filter((p) => !MENU_SKIP.has(p.slug));
  const submenuPages = getPagesForNav("submenu");

  const certItems = certs.map((c) => ({
    href: `/certifications/${c.slug}`,
    label: c.name,
    detail: c.region,
    icon: c.icon,
  }));

  const testingItems = [
    {
      href: "/labs",
      label: "Testing Labs",
      detail: "Find recognised laboratories",
      icon: "microscope",
    },
    ...testingCats.map((c) => ({
      href: `/testing/${c.slug}`,
      label: c.name,
      detail: `${c.service_count ?? 0} test${(c.service_count ?? 0) === 1 ? "" : "s"}`,
      icon: c.icon,
    })),
  ];

  const resourceItems = [
    { href: "/products", label: "Browse products", detail: "By notified category", icon: "folder" },
    { href: "/products/all", label: "Search by HSN", detail: "HSN, QCO, fees & labs", icon: "table" },
    { href: "/qco", label: "Upcoming QCOs", detail: "New mandatory deadlines", icon: "bell" },
    ...menuPages.map((p) => ({
      href: pagePublicPath(p.slug),
      label: p.nav_label || p.title,
      detail: p.nav_detail || "",
      icon: "file" as const,
    })),
    ...submenuPages.map((p) => ({
      href: pagePublicPath(p.slug),
      label: p.nav_label || p.title,
      detail: p.nav_detail || "",
      icon: "file" as const,
    })),
    { href: "/blog", label: "Blog", detail: "Guides and compliance notes", icon: "file" },
  ];

  const seen = new Set<string>();
  const uniqueResources = resourceItems.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });

  return (
    <header className="sticky top-0 z-50 isolate bg-cream-50/95 backdrop-blur border-b border-cream-200 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-3 sm:gap-4 min-h-[4rem] sm:min-h-[4.5rem] py-2">
        <a href="/" aria-label="certko home" className="shrink-0 min-w-0">
          <span className="hidden sm:block">
            <Logo width={148} withTagline priority />
          </span>
          <span className="sm:hidden">
            <Logo width={112} withTagline priority />
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-0.5 min-w-0">
          <NavDropdown
            label="Certifications"
            items={certItems}
            footerItem={{ href: "/certifications", label: "All certifications" }}
          />
          <NavDropdown
            label="Testing"
            items={testingItems}
            footerItem={{ href: "/testing", label: "All product testing" }}
          />
          <NavDropdown label="Resources" items={uniqueResources} />
        </nav>

        <div className="hidden lg:flex items-center gap-2.5 ml-auto shrink-0 w-full max-w-xs xl:max-w-sm">
          <div className="flex-1 min-w-0">
            <SearchBox compact placeholder="Product, HSN, or standard…" />
          </div>
          <a
            href="/contact"
            className="shrink-0 bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-semibold rounded-xl px-4 py-2.5 transition"
          >
            Get help
          </a>
        </div>

        <div className="lg:hidden ml-auto flex items-center gap-2 min-w-0 flex-1 justify-end max-w-[14rem] sm:max-w-xs">
          <div className="flex-1 min-w-0 hidden min-[420px]:block">
            <SearchBox compact placeholder="Search…" />
          </div>
          <a
            href="/contact"
            className="inline-flex items-center justify-center min-h-11 rounded-xl bg-butter-500 hover:bg-butter-400 px-3 text-xs font-bold text-ink-950 transition shrink-0"
          >
            Help
          </a>
          <MobileNav
            groups={[
              {
                label: "Certifications",
                items: [
                  { href: "/certifications", label: "All certifications" },
                  ...certItems.map(({ href, label }) => ({ href, label })),
                ],
              },
              {
                label: "Testing",
                items: [
                  { href: "/testing", label: "All product testing" },
                  ...testingItems.map(({ href, label }) => ({ href, label })),
                ],
              },
              {
                label: "Resources",
                items: [
                  ...uniqueResources.map(({ href, label }) => ({ href, label })),
                  { href: "/contact", label: "Contact" },
                ].filter(
                  (item, index, arr) =>
                    arr.findIndex((other) => other.href === item.href) === index
                ),
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
