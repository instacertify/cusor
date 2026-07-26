import Link from "next/link";
import Logo from "./Logo";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getCategories,
  getCertifications,
  getTestingCategories,
  getPagesForNav,
} from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";

export default async function Footer() {
  await ensureDbReady();
  const settings = getSettings();
  const topCategories = getCategories().slice(0, 6);
  const certifications = getCertifications();
  const testingCategories = getTestingCategories().slice(0, 6);
  const footerPages = getPagesForNav("footer").filter(
    (p) => !["privacy", "terms"].includes(p.slug)
  );

  return (
    <footer className="mt-12 sm:mt-20 bg-ink-950 text-ink-300 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 grid gap-8 sm:gap-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Logo width={170} withTagline variant="reverse" />
          <p className="text-sm leading-relaxed max-w-md">{settings.tagline}</p>
          <p className="text-xs leading-relaxed max-w-md text-ink-400">
            {settings.footer_text}
          </p>
          <div className="pt-2">
            <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300">
                  Contact page →
                </Link>
              </li>
              {settings.contact_address ? (
                <li className="text-ink-300 leading-relaxed max-w-xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1">
                    Our address
                  </span>
                  {settings.contact_address}
                </li>
              ) : null}
              {settings.contact_email ? (
                <li>
                  <a href={`mailto:${settings.contact_email}`} className="inline-flex min-h-9 items-center hover:text-butter-400 break-all">
                    {settings.contact_email}
                  </a>
                </li>
              ) : null}
              {settings.contact_phone ? (
                <li>
                  <a href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`} className="inline-flex min-h-9 items-center hover:text-butter-400">
                    {settings.contact_phone}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="inline-flex min-h-9 items-center hover:text-butter-400">All Products</Link></li>
            <li><Link href="/products/all" className="inline-flex min-h-9 items-center hover:text-butter-400">Search Table</Link></li>
            <li><Link href="/certifications" className="inline-flex min-h-9 items-center hover:text-butter-400">Certifications</Link></li>
            <li><Link href="/testing" className="inline-flex min-h-9 items-center hover:text-butter-400">Product Testing</Link></li>
            <li><Link href="/labs" className="inline-flex min-h-9 items-center hover:text-butter-400">Testing Labs</Link></li>
            <li><Link href="/qco" className="inline-flex min-h-9 items-center hover:text-butter-400">Upcoming QCOs</Link></li>
            <li><Link href="/blog" className="inline-flex min-h-9 items-center hover:text-butter-400">Blog</Link></li>
            <li><Link href="/contact" className="inline-flex min-h-9 items-center hover:text-butter-400">Contact</Link></li>
            {footerPages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={pagePublicPath(p.slug)}
                  className="inline-flex min-h-9 items-center hover:text-butter-400"
                >
                  {p.nav_label || p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
            Certifications
          </h3>
          <ul className="space-y-2.5 text-sm">
            {certifications.map((c) => (
              <li key={c.id}>
                <Link href={`/certifications/${c.slug}`} className="inline-flex min-h-9 items-center hover:text-butter-400">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/certifications" className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300">
                All certifications →
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
            Product Testing
          </h3>
          <ul className="space-y-2.5 text-sm">
            {testingCategories.map((c) => (
              <li key={c.id}>
                <Link href={`/testing/${c.slug}`} className="inline-flex min-h-9 items-center hover:text-butter-400">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/testing" className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300">
                All product testing →
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1 space-y-8">
          <div>
            <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
              Use Cases
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tenders" className="inline-flex min-h-9 items-center hover:text-butter-400">Certification for Tenders</Link></li>
              <li><Link href="/marketplaces" className="inline-flex min-h-9 items-center hover:text-butter-400">Sell on Marketplaces</Link></li>
              <li><Link href="/search?type=products" className="inline-flex min-h-9 items-center hover:text-butter-400">Find a Product</Link></li>
              <li><Link href="/search?type=testing" className="inline-flex min-h-9 items-center hover:text-butter-400">Find a Product Test</Link></li>
              <li><Link href="/search?type=labs" className="inline-flex min-h-9 items-center hover:text-butter-400">Find a Testing Lab</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-display font-semibold mb-3 text-sm uppercase tracking-wider">
              Top Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {topCategories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="inline-flex min-h-9 items-center hover:text-butter-400">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400 text-center sm:text-left">
          <span>© {new Date().getFullYear()} {settings.site_name}.com — All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="inline-flex min-h-9 items-center hover:text-butter-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex min-h-9 items-center hover:text-butter-400">
              Terms of Service
            </Link>
            <span className="break-all">
              {settings.contact_email} · {settings.contact_phone}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
