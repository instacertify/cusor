import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "./Logo";
import FooterSocialLinks from "./FooterSocialLinks";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getCategories,
  getCertifications,
  getTestingCategories,
  getPagesForNav,
} from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { getSocialLinks } from "@/lib/social-links";

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-white font-display font-semibold mb-4 text-sm uppercase tracking-[0.12em]">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center text-ink-300 hover:text-butter-400 transition"
    >
      {children}
    </Link>
  );
}

export default async function Footer() {
  await ensureDbReady();
  const settings = getSettings();
  const topCategories = getCategories().slice(0, 5);
  const certifications = getCertifications().slice(0, 6);
  const testingCategories = getTestingCategories().slice(0, 5);
  const footerPages = getPagesForNav("footer").filter(
    (p) => !["privacy", "terms", "about", "guide", "contact"].includes(p.slug)
  );
  const socialLinks = getSocialLinks(settings);
  const year = new Date().getFullYear();
  const siteName = settings.site_name || "Certko";

  return (
    <footer className="mt-12 sm:mt-20 bg-ink-950 text-ink-300 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
        <div className="grid gap-10 lg:gap-12 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4 space-y-5">
            <Logo width={156} withTagline variant="reverse" />
            {settings.tagline ? (
              <p className="text-sm leading-relaxed text-ink-300 max-w-sm">
                {settings.tagline}
              </p>
            ) : null}

            <FooterSocialLinks links={socialLinks} />

            <div className="pt-1 space-y-3 text-sm">
              <FooterHeading>Contact</FooterHeading>
              <ul className="space-y-2.5">
                {settings.contact_address ? (
                  <li className="leading-relaxed max-w-sm text-ink-400">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1">
                      Office
                    </span>
                    {settings.contact_address}
                  </li>
                ) : null}
                {settings.contact_email ? (
                  <li>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="inline-flex min-h-9 items-center hover:text-butter-400 break-all transition"
                    >
                      {settings.contact_email}
                    </a>
                  </li>
                ) : null}
                {settings.contact_phone ? (
                  <li>
                    <a
                      href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                      className="inline-flex min-h-9 items-center hover:text-butter-400 transition"
                    >
                      {settings.contact_phone}
                    </a>
                  </li>
                ) : null}
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300"
                  >
                    Contact page →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            <div>
              <FooterHeading>Company</FooterHeading>
              <ul className="space-y-1 text-sm">
                <li><FooterLink href="/about">About {siteName}</FooterLink></li>
                <li><FooterLink href="/guide">Certification Guide</FooterLink></li>
                <li><FooterLink href="/blog">Insights & Blog</FooterLink></li>
                <li><FooterLink href="/contact">Contact</FooterLink></li>
                <li><FooterLink href="/sitemap">Sitemap</FooterLink></li>
                {footerPages.map((p) => (
                  <li key={p.slug}>
                    <FooterLink href={pagePublicPath(p.slug)}>
                      {p.nav_label || p.title}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterHeading>Certifications</FooterHeading>
              <ul className="space-y-1 text-sm">
                {certifications.map((c) => (
                  <li key={c.id}>
                    <FooterLink href={`/certifications/${c.slug}`}>{c.name}</FooterLink>
                  </li>
                ))}
                <li>
                  <Link
                    href="/certifications"
                    className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300"
                  >
                    All certifications →
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <FooterHeading>Testing</FooterHeading>
              <ul className="space-y-1 text-sm">
                <li><FooterLink href="/testing">Product Testing</FooterLink></li>
                <li><FooterLink href="/labs">Testing Labs</FooterLink></li>
                {testingCategories.map((c) => (
                  <li key={c.id}>
                    <FooterLink href={`/testing/${c.slug}`}>{c.name}</FooterLink>
                  </li>
                ))}
                <li>
                  <Link
                    href="/testing"
                    className="inline-flex min-h-9 items-center font-semibold text-butter-400 hover:text-butter-300"
                  >
                    All testing →
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <FooterHeading>Resources</FooterHeading>
              <ul className="space-y-1 text-sm">
                <li><FooterLink href="/products">All Products</FooterLink></li>
                <li><FooterLink href="/products/all">Search Table</FooterLink></li>
                <li><FooterLink href="/qco">Upcoming QCOs</FooterLink></li>
                <li><FooterLink href="/tenders">Certification for Tenders</FooterLink></li>
                <li><FooterLink href="/marketplaces">Sell on Marketplaces</FooterLink></li>
                {topCategories.map((c) => (
                  <li key={c.id}>
                    <FooterLink href={`/category/${c.slug}`}>{c.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {settings.footer_text ? (
          <p className="mt-10 pt-8 border-t border-ink-800 text-xs leading-relaxed text-ink-500 max-w-4xl">
            {settings.footer_text}
          </p>
        ) : null}
      </div>

      <div className="border-t border-ink-800 bg-ink-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-ink-500">
          <p className="text-center md:text-left">
            © {year} {siteName}. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2"
          >
            <Link href="/privacy" className="inline-flex min-h-9 items-center hover:text-butter-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex min-h-9 items-center hover:text-butter-400">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="inline-flex min-h-9 items-center hover:text-butter-400">
              Sitemap
            </Link>
            <Link href="/sitemap.xml" className="inline-flex min-h-9 items-center hover:text-butter-400">
              XML Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
