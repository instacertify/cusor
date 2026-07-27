import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getCategories,
  getCertifications,
  getTestingCategories,
  getPublishedPosts,
  getRoutableContentPages,
  getAuthors,
} from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { ensureDbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Browse every main Certko page — products, certifications, testing, labs, blog and resources — in one sitemap.",
  alternates: { canonical: "https://certko.com/sitemap" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function LinkList({
  items,
}: {
  items: { href: string; label: string; detail?: string }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-500">No pages in this section yet.</p>;
  }
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group inline-flex flex-col min-h-10 py-1.5 text-sm text-ink-800 hover:text-butter-700"
          >
            <span className="font-medium underline-offset-4 group-hover:underline">
              {item.label}
            </span>
            {item.detail ? (
              <span className="text-xs text-ink-500">{item.detail}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function HtmlSitemapPage() {
  await ensureDbReady();
  const certifications = getCertifications();
  const categories = getCategories();
  const testingCategories = getTestingCategories();
  const posts = getPublishedPosts(40);
  const pages = getRoutableContentPages().filter(
    (p) => !["privacy", "terms"].includes(p.slug)
  );
  const authors = getAuthors();

  const mainLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "BIS products by category" },
    { href: "/products/all", label: "Product search table" },
    { href: "/certifications", label: "All certifications" },
    { href: "/testing", label: "Product testing" },
    { href: "/labs", label: "Testing labs directory" },
    { href: "/qco", label: "Upcoming QCOs" },
    { href: "/blog", label: "Blog" },
    { href: "/search", label: "Search" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Sitemap" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Sitemap
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Quick links to the main areas of Certko. For search engines, the machine-readable
        map is also available at{" "}
        <Link href="/sitemap.xml" className="font-semibold text-butter-700 hover:underline">
          https://certko.com/sitemap.xml
        </Link>
        .
      </p>

      <div className="mt-10 space-y-6">
        <Section title="Main pages">
          <LinkList items={mainLinks} />
        </Section>

        <Section title="Certifications">
          <LinkList
            items={certifications.map((c) => ({
              href: `/certifications/${c.slug}`,
              label: c.name,
              detail: c.region,
            }))}
          />
        </Section>

        <Section title="Product categories">
          <LinkList
            items={categories.map((c) => ({
              href: `/category/${c.slug}`,
              label: c.name,
              detail: `${c.product_count ?? 0} products`,
            }))}
          />
        </Section>

        <Section title="Product testing">
          <LinkList
            items={testingCategories.map((c) => ({
              href: `/testing/${c.slug}`,
              label: c.name,
              detail: `${c.service_count ?? 0} tests`,
            }))}
          />
        </Section>

        <Section title="Guides & resources">
          <LinkList
            items={[
              ...pages.map((p) => ({
                href: pagePublicPath(p.slug),
                label: p.nav_label || p.title,
              })),
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
            ]}
          />
        </Section>

        {posts.length > 0 ? (
          <Section title="Recent blog posts">
            <LinkList
              items={posts.map((p) => ({
                href: `/blog/${p.slug}`,
                label: p.title,
              }))}
            />
            <p className="mt-4 text-sm">
              <Link href="/blog" className="font-semibold text-butter-700 hover:underline">
                View all blog posts →
              </Link>
            </p>
          </Section>
        ) : null}

        {authors.length > 0 ? (
          <Section title="Authors">
            <LinkList
              items={authors.map((a) => ({
                href: `/authors/${a.slug}`,
                label: a.name,
                detail: a.title,
              }))}
            />
          </Section>
        ) : null}
      </div>
    </div>
  );
}
