import Link from "next/link";
import Logo from "./Logo";
import { getSettings } from "@/lib/db";
import { getCategories, getCertifications } from "@/lib/queries";

export default function Footer() {
  const settings = getSettings();
  const topCategories = getCategories().slice(0, 6);
  const certifications = getCertifications();

  return (
    <footer className="mt-20 bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-1 space-y-4">
          <Logo width={160} variant="reverse" />
          <p className="text-sm leading-relaxed max-w-md">{settings.tagline}</p>
          <p className="text-xs leading-relaxed max-w-md text-ink-400">
            {settings.footer_text}
          </p>
        </div>
        <div>
          <h3 className="text-white font-display font-bold mb-3 text-sm uppercase tracking-wider">
            Explore
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-butter-400">All Products</Link></li>
            <li><Link href="/products/all" className="hover:text-butter-400">Product Search Table</Link></li>
            <li><Link href="/certifications" className="hover:text-butter-400">Certifications</Link></li>
            <li><Link href="/labs" className="hover:text-butter-400">Testing Labs</Link></li>
            <li><Link href="/qco" className="hover:text-butter-400">Upcoming QCOs</Link></li>
            <li><Link href="/guide" className="hover:text-butter-400">Certification Guide</Link></li>
            <li><Link href="/blog" className="hover:text-butter-400">Blog</Link></li>
            <li><Link href="/about" className="hover:text-butter-400">About Certko</Link></li>
            <li><Link href="/contact" className="hover:text-butter-400">Get Expert Help</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-display font-bold mb-3 text-sm uppercase tracking-wider">
            Certifications
          </h3>
          <ul className="space-y-2 text-sm">
            {certifications.map((c) => (
              <li key={c.id}>
                <Link href={`/certifications/${c.slug}`} className="hover:text-butter-400">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/certifications" className="font-semibold text-butter-400 hover:text-butter-300">
                All certifications →
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-white font-display font-bold mb-3 text-sm uppercase tracking-wider">
              Use Cases
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tenders" className="hover:text-butter-400">Certification for Tenders</Link></li>
              <li><Link href="/marketplaces" className="hover:text-butter-400">Sell on Amazon & Marketplaces</Link></li>
              <li><Link href="/search?type=products" className="hover:text-butter-400">Find a Product&apos;s Certification</Link></li>
              <li><Link href="/search?type=labs" className="hover:text-butter-400">Find a Testing Lab</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-display font-bold mb-3 text-sm uppercase tracking-wider">
              Top Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {topCategories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-butter-400">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400">
          <span>© {new Date().getFullYear()} {settings.site_name}.com — All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-butter-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-butter-400">
              Terms of Service
            </Link>
            <span>
              {settings.contact_email} · {settings.contact_phone}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
