import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "./Logo";
import FooterSocialLinks from "./FooterSocialLinks";
import { TalkToCertificationExpertLink } from "./TalkToCertificationExpert";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getCertifications,
  getTestingCategories,
  getPagesForNav,
} from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { getSocialLinks } from "@/lib/social-links";

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-cream-50 font-display font-semibold mb-4 text-[11px] uppercase tracking-[0.16em]">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-8 items-center text-[13px] text-ink-300 hover:text-butter-400 transition"
    >
      {children}
    </Link>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

export default async function Footer() {
  await ensureDbReady();
  const settings = getSettings();
  const certifications = getCertifications().slice(0, 5);
  const testingCategories = getTestingCategories().slice(0, 4);
  const footerPages = getPagesForNav("footer").filter(
    (p) => !["privacy", "terms", "about", "guide", "contact"].includes(p.slug)
  );
  const socialLinks = getSocialLinks(settings);
  const year = new Date().getFullYear();
  const siteName = settings.site_name || "Certko";

  return (
    <footer className="mt-12 sm:mt-20 bg-ink-950 text-ink-300 pb-[max(5.5rem,env(safe-area-inset-bottom))] sm:pb-[max(4.5rem,env(safe-area-inset-bottom))]">
      {/* Brand band */}
      <div className="border-b border-ink-800/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-3">
            <Logo width={148} withTagline variant="reverse" />
            {settings.tagline ? (
              <p className="text-sm leading-relaxed text-ink-400">
                {settings.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <FooterSocialLinks links={socialLinks} className="sm:text-right" />
            <TalkToCertificationExpertLink variant="footer" />
          </div>
        </div>
      </div>

      {/* Link directory */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
          <FooterColumn title="Company">
            <li><FooterLink href="/about">About {siteName}</FooterLink></li>
            <li><FooterLink href="/guide">Certification Guide</FooterLink></li>
            <li><FooterLink href="/blog">Insights & Blog</FooterLink></li>
            <li><FooterLink href="/contact">Contact Us</FooterLink></li>
            {footerPages.map((p) => (
              <li key={p.slug}>
                <FooterLink href={pagePublicPath(p.slug)}>
                  {p.nav_label || p.title}
                </FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Solutions">
            <li><FooterLink href="/products">Product Finder</FooterLink></li>
            <li><FooterLink href="/products/all">Standards Search</FooterLink></li>
            <li><FooterLink href="/qco">Upcoming QCOs</FooterLink></li>
            <li><FooterLink href="/tenders">Tender Compliance</FooterLink></li>
            <li><FooterLink href="/marketplaces">Marketplace Selling</FooterLink></li>
          </FooterColumn>

          <FooterColumn title="Certifications">
            <li>
              <FooterLink href="/certifications/countries">By country</FooterLink>
            </li>
            {certifications.map((c) => (
              <li key={c.id}>
                <FooterLink href={`/certifications/${c.slug}`}>{c.name}</FooterLink>
              </li>
            ))}
            <li>
              <Link
                href="/certifications"
                className="inline-flex min-h-8 items-center text-[13px] font-semibold text-butter-400 hover:text-butter-300"
              >
                View all →
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Testing & Labs">
            <li><FooterLink href="/testing">Product Testing</FooterLink></li>
            <li><FooterLink href="/labs">Accredited Labs</FooterLink></li>
            {testingCategories.map((c) => (
              <li key={c.id}>
                <FooterLink href={`/testing/${c.slug}`}>{c.name}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <div className="col-span-2 md:col-span-1">
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-3 text-[13px]">
              {settings.contact_address ? (
                <li className="leading-relaxed text-ink-400">{settings.contact_address}</li>
              ) : null}
              {settings.contact_email ? (
                <li>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500 mb-1">
                    Email
                  </span>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="break-all text-ink-200 hover:text-butter-400 transition"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              ) : null}
              {settings.contact_phone ? (
                <li>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500 mb-1">
                    Phone
                  </span>
                  <a
                    href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                    className="text-ink-200 hover:text-butter-400 transition"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              ) : null}
              <li className="pt-1">
                <Link
                  href="/contact"
                  className="inline-flex min-h-8 items-center text-[13px] font-semibold text-butter-400 hover:text-butter-300"
                >
                  Get in touch →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {settings.footer_text ? (
          <div className="mt-10 pt-8 border-t border-ink-800/90">
            <p className="text-[11px] leading-relaxed text-ink-500 max-w-5xl">
              {settings.footer_text}
            </p>
          </div>
        ) : null}
      </div>

      {/* Legal bar */}
      <div className="border-t border-ink-800 bg-black/25">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-ink-500">
          <p className="text-center sm:text-left order-2 sm:order-1">
            © {year} {siteName}. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-1 order-1 sm:order-2"
          >
            <Link href="/privacy" className="inline-flex min-h-8 items-center hover:text-butter-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="inline-flex min-h-8 items-center hover:text-butter-400">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="inline-flex min-h-8 items-center hover:text-butter-400">
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
