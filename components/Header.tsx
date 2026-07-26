import Link from "next/link";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import MobileNav from "./MobileNav";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/labs", label: "Labs" },
  { href: "/guide", label: "Guide" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur border-b border-cream-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-4 h-16">
        <Link href="/" aria-label="Certko home" className="shrink-0">
          <Logo size={34} />
        </Link>
        <div className="hidden md:block flex-1 max-w-md mx-auto">
          <SearchBox />
        </div>
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-ink-950 hover:bg-cream-200 transition"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="ml-2 bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-bold rounded-xl px-4 py-2.5 shadow-butter transition"
          >
            Get Expert Help
          </Link>
        </nav>
        <MobileNav nav={[...NAV, { href: "/contact", label: "Get Expert Help" }]} />
      </div>
    </header>
  );
}
