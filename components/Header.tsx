import Link from "next/link";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import MobileNav from "./MobileNav";
import NavDropdown from "./NavDropdown";
import { getCertifications } from "@/lib/queries";

export default function Header() {
  const certs = getCertifications();

  const certItems = certs.map((c) => ({
    href: `/certifications/${c.slug}`,
    label: c.name,
    detail: c.region,
    icon: c.icon,
  }));

  const productItems = [
    { href: "/products", label: "Browse by Category", detail: "33 notified product categories", icon: "folder" },
    { href: "/products/all", label: "Product Search Table", detail: "All aspects: HSN, QCO, fees, labs", icon: "table" },
    { href: "/qco", label: "Upcoming QCOs", detail: "Deadlines for new mandatory products", icon: "bell" },
  ];

  const resourceItems = [
    { href: "/guide", label: "Certification Guide", detail: "Process, documents, costs", icon: "file" },
    { href: "/blog", label: "Blog", detail: "Compliance insights & how-tos", icon: "file" },
    { href: "/tenders", label: "Certification for Tenders", detail: "Pre-qualify before the bid closes", icon: "clipboard" },
    { href: "/marketplaces", label: "Sell on Marketplaces", detail: "Amazon, Flipkart compliance", icon: "box" },
    { href: "/about", label: "About Certko", detail: "Our data and mission", icon: "users" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur border-b border-cream-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-3 h-16">
        <Link href="/" aria-label="Certko home" className="shrink-0">
          <Logo size={34} />
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
          <Link
            href="/labs"
            className="px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-ink-950 hover:bg-cream-200 transition"
          >
            Labs
          </Link>
          <NavDropdown label="Resources" items={resourceItems} />
          <Link
            href="/contact"
            className="ml-2 bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-bold rounded-xl px-4 py-2.5 shadow-butter transition"
          >
            Get Expert Help
          </Link>
        </nav>
        <MobileNav
          groups={[
            { label: "Products", items: productItems },
            { label: "Certifications", items: certItems },
            { label: "Labs & Resources", items: [{ href: "/labs", label: "Testing Labs" }, ...resourceItems] },
            { label: "", items: [{ href: "/contact", label: "Get Expert Help" }] },
          ]}
        />
      </div>
    </header>
  );
}
