import Link from "next/link";
import Logo from "./Logo";
import { getSettings } from "@/lib/db";
import { getCategories } from "@/lib/queries";

export default function Footer() {
  const settings = getSettings();
  const topCategories = getCategories().slice(0, 6);

  return (
    <footer className="mt-20 bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-cream-50 inline-flex rounded-xl px-3 py-2">
            <Logo size={28} />
          </div>
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
            <li><Link href="/labs" className="hover:text-butter-400">Testing Labs</Link></li>
            <li><Link href="/guide" className="hover:text-butter-400">Certification Guide</Link></li>
            <li><Link href="/about" className="hover:text-butter-400">About Certko</Link></li>
            <li><Link href="/contact" className="hover:text-butter-400">Get Expert Help</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-display font-bold mb-3 text-sm uppercase tracking-wider">
            Top Categories
          </h3>
          <ul className="space-y-2 text-sm">
            {topCategories.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-butter-400">
                  {c.icon} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-400">
          <span>© {new Date().getFullYear()} {settings.site_name}.com — All rights reserved.</span>
          <span>
            {settings.contact_email} · {settings.contact_phone}
          </span>
        </div>
      </div>
    </footer>
  );
}
