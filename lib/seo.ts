import type { Metadata } from "next";
import { getDb, getSettings } from "./db";
import { getSocialLinks } from "./social-links";

export const BASE_URL = "https://certko.com";

/** Fallback share image when a page has no dedicated OG asset (logo lockup). */
export const DEFAULT_OG_IMAGE = "/brand/certko-logo-full.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1416;
export const DEFAULT_OG_IMAGE_HEIGHT = 391;

export const ORGANIZATION_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

export interface SeoMeta {
  entity: string;
  title: string;
  description: string;
  focus_keyword: string;
  secondary_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical: string;
  robots_index: number;
  robots_follow: number;
  robots_noarchive: number;
  robots_nosnippet: number;
  sitemap_include: number;
  schema_types: string;
}

export const SCHEMA_TYPE_OPTIONS = [
  "Article",
  "FAQPage",
  "Product",
  "Service",
  "BreadcrumbList",
  "HowTo",
  "Organization",
  "WebSite",
] as const;

export const DEFAULT_SCHEMA_TYPES: Record<string, string[]> = {
  product: ["Service", "Product", "FAQPage", "BreadcrumbList"],
  category: ["BreadcrumbList", "FAQPage"],
  cert: ["Service", "FAQPage", "BreadcrumbList"],
  page: ["Article", "FAQPage", "BreadcrumbList"],
  testcat: ["Service", "FAQPage", "BreadcrumbList"],
  test: ["Service", "FAQPage", "BreadcrumbList"],
};

export function getSeoMeta(entity: string): SeoMeta | undefined {
  return getDb()
    .prepare("SELECT * FROM seo_meta WHERE entity = ?")
    .get(entity) as SeoMeta | undefined;
}

export function getSeoExclusions(prefix: string): Set<string> {
  const rows = getDb()
    .prepare(
      "SELECT entity FROM seo_meta WHERE sitemap_include = 0 AND entity LIKE ?"
    )
    .all(`${prefix}:%`) as { entity: string }[];
  return new Set(rows.map((r) => r.entity.slice(prefix.length + 1)));
}

export function saveSeoMeta(entity: string, values: Partial<SeoMeta>) {
  const existing = getSeoMeta(entity);
  const merged: SeoMeta = {
    entity,
    title: "", description: "", focus_keyword: "", secondary_keywords: "",
    og_title: "", og_description: "", og_image: "", canonical: "",
    robots_index: 1, robots_follow: 1, robots_noarchive: 0, robots_nosnippet: 0,
    sitemap_include: 1, schema_types: "",
    ...existing,
    ...values,
  };
  getDb()
    .prepare(
      `INSERT INTO seo_meta (entity, title, description, focus_keyword, secondary_keywords, og_title, og_description, og_image, canonical, robots_index, robots_follow, robots_noarchive, robots_nosnippet, sitemap_include, schema_types)
       VALUES (@entity, @title, @description, @focus_keyword, @secondary_keywords, @og_title, @og_description, @og_image, @canonical, @robots_index, @robots_follow, @robots_noarchive, @robots_nosnippet, @sitemap_include, @schema_types)
       ON CONFLICT(entity) DO UPDATE SET
         title=excluded.title, description=excluded.description,
         focus_keyword=excluded.focus_keyword, secondary_keywords=excluded.secondary_keywords,
         og_title=excluded.og_title, og_description=excluded.og_description, og_image=excluded.og_image,
         canonical=excluded.canonical,
         robots_index=excluded.robots_index, robots_follow=excluded.robots_follow,
         robots_noarchive=excluded.robots_noarchive, robots_nosnippet=excluded.robots_nosnippet,
         sitemap_include=excluded.sitemap_include, schema_types=excluded.schema_types`
    )
    .run(merged);
}

/** Resolve a site-relative or absolute asset URL for metadata / schema. */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  const value = pathOrUrl.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

/** ISO-8601 date (or datetime) for byline / Article structured data. */
export function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Already a bare date like 2026-07-10
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    return undefined;
  }
  // Prefer date-only when the source had no time component
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  return d.toISOString();
}

function organizationLogo() {
  return {
    "@type": "ImageObject",
    "@id": `${BASE_URL}/#logo`,
    url: `${BASE_URL}/brand/certko-logo.png`,
    contentUrl: `${BASE_URL}/brand/certko-logo.png`,
    width: 1416,
    height: 391,
    caption: "Certko",
  };
}

function organizationNode(settings: Record<string, string>) {
  const orgName = settings.site_name || "Certko";
  const address = (settings.contact_address || "").trim();
  const sameAs = getSocialLinks(settings).map((l) => l.href);
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: orgName,
    url: BASE_URL,
    logo: organizationLogo(),
    image: organizationLogo(),
    email: settings.contact_email || undefined,
    telephone: settings.contact_phone || undefined,
    description: settings.tagline || undefined,
    ...(sameAs.length ? { sameAs } : {}),
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressLocality: "Noida",
            addressRegion: "Uttar Pradesh",
            postalCode: "201301",
            addressCountry: "IN",
          },
        }
      : {}),
  };
}

function websiteNode(settings: Record<string, string>) {
  const orgName = settings.site_name || "Certko";
  const alternateNames = ["Instacertify", "Certko.com"].filter(
    (n) => n.toLowerCase() !== orgName.toLowerCase()
  );
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: BASE_URL,
    name: orgName,
    ...(alternateNames.length ? { alternateName: alternateNames } : {}),
    description: settings.tagline || undefined,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function ogImageEntry(url: string) {
  const absolute = absoluteUrl(url)!;
  const isDefault = absolute === absoluteUrl(DEFAULT_OG_IMAGE);
  return {
    url: absolute,
    ...(isDefault
      ? {
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: "Certko",
        }
      : {}),
  };
}

/** Merge stored SEO meta with per-page fallbacks into a Next.js Metadata object. */
export function buildMetadata(
  entity: string,
  fallback: {
    title: string;
    description: string;
    path: string;
    image?: string;
  }
): Metadata {
  const seo = getSeoMeta(entity);
  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const canonical = seo?.canonical || `${BASE_URL}${fallback.path}`;
  const ogImage = seo?.og_image || fallback.image || DEFAULT_OG_IMAGE;
  const imageMeta = ogImageEntry(ogImage);

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: seo ? seo.robots_index === 1 : true,
      follow: seo ? seo.robots_follow === 1 : true,
      noarchive: seo ? seo.robots_noarchive === 1 : false,
      nosnippet: seo ? seo.robots_nosnippet === 1 : false,
      googleBot: {
        index: seo ? seo.robots_index === 1 : true,
        follow: seo ? seo.robots_follow === 1 : true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: canonical,
      type: "website",
      siteName: "Certko",
      images: [imageMeta],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      images: [imageMeta.url],
    },
  };
}

export function enabledSchemaTypes(entity: string, kind: string): string[] {
  const seo = getSeoMeta(entity);
  if (seo?.schema_types) {
    try {
      const parsed = JSON.parse(seo.schema_types);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through to defaults */
    }
  }
  return DEFAULT_SCHEMA_TYPES[kind] ?? [];
}

/* ---------- JSON-LD builders (Schema Markup Generator) ---------- */

interface SchemaContext {
  name: string;
  description: string;
  url: string;
  image?: string;
  breadcrumbs?: { name: string; url?: string }[];
  faqs?: { question: string; answer: string }[];
  offers?: { low: number; high: number } | null;
  areaServed?: string;
  howToSteps?: string[];
  /** Article / byline dates (ISO-8601 preferred). */
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
}

export function buildJsonLd(types: string[], ctx: SchemaContext): object | null {
  const graph: object[] = [];
  const settings = getSettings();
  const orgName = settings.site_name || "Certko";

  for (const type of types) {
    switch (type) {
      case "Organization": {
        graph.push(organizationNode(settings));
        break;
      }
      case "WebSite": {
        // Ensure publisher Organization is available for @id references.
        if (!types.includes("Organization")) {
          graph.push(organizationNode(settings));
        }
        graph.push(websiteNode(settings));
        break;
      }
      case "Service":
        graph.push({
          "@type": "Service",
          name: ctx.name,
          description: ctx.description,
          url: ctx.url,
          provider: {
            "@type": "Organization",
            "@id": ORGANIZATION_ID,
            name: orgName,
            url: BASE_URL,
          },
          areaServed: ctx.areaServed ?? "IN",
          ...(ctx.offers
            ? {
                offers: {
                  "@type": "AggregateOffer",
                  priceCurrency: "INR",
                  lowPrice: ctx.offers.low,
                  highPrice: ctx.offers.high,
                },
              }
            : {}),
        });
        break;
      case "Product":
        graph.push({
          "@type": "Product",
          name: ctx.name,
          description: ctx.description,
          url: ctx.url,
          ...(ctx.image ? { image: absoluteUrl(ctx.image) } : {}),
          ...(ctx.offers
            ? {
                offers: {
                  "@type": "AggregateOffer",
                  priceCurrency: "INR",
                  lowPrice: ctx.offers.low,
                  highPrice: ctx.offers.high,
                  offerCount: 1,
                },
              }
            : {}),
        });
        break;
      case "FAQPage":
        if (ctx.faqs?.length) {
          graph.push({
            "@type": "FAQPage",
            mainEntity: ctx.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          });
        }
        break;
      case "BreadcrumbList":
        if (ctx.breadcrumbs?.length) {
          graph.push({
            "@type": "BreadcrumbList",
            itemListElement: ctx.breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: b.name,
              ...(b.url ? { item: `${BASE_URL}${b.url}` } : {}),
            })),
          });
        }
        break;
      case "Article": {
        const published = toIsoDate(ctx.datePublished);
        const modified = toIsoDate(ctx.dateModified) || published;
        const authorName = (ctx.authorName || "").trim() || orgName;
        const authorUrl = ctx.authorUrl
          ? absoluteUrl(ctx.authorUrl)
          : undefined;
        const imageUrl = absoluteUrl(ctx.image);
        graph.push({
          "@type": "Article",
          headline: ctx.name,
          description: ctx.description,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": ctx.url,
          },
          url: ctx.url,
          ...(imageUrl ? { image: [imageUrl] } : {}),
          ...(published ? { datePublished: published } : {}),
          ...(modified ? { dateModified: modified } : {}),
          author: authorUrl
            ? {
                "@type": "Person",
                name: authorName,
                url: authorUrl,
              }
            : authorName.toLowerCase().includes("certko")
              ? { "@id": ORGANIZATION_ID }
              : { "@type": "Person", name: authorName },
          publisher: {
            "@id": ORGANIZATION_ID,
          },
          isPartOf: { "@id": WEBSITE_ID },
        });
        // Publisher logo required for Article rich results — include Organization when missing.
        if (!types.includes("Organization")) {
          graph.push(organizationNode(settings));
        }
        break;
      }
      case "HowTo":
        if (ctx.howToSteps?.length) {
          graph.push({
            "@type": "HowTo",
            name: ctx.name,
            description: ctx.description,
            step: ctx.howToSteps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s,
            })),
          });
        }
        break;
    }
  }
  if (graph.length === 0) return null;
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Extract plain text and headings from markdown for keyword analysis. */
export function analyzeMarkdown(md: string): {
  text: string;
  headings: string[];
  internalLinks: number;
  words: number;
} {
  const headings = [...md.matchAll(/^#{1,4}\s+(.+)$/gm)].map((m) => m[1].trim());
  const internalLinks = [...md.matchAll(/\]\((\/[^)]*)\)/g)].length;
  const text = md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|-]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return { text, headings, internalLinks, words: text ? text.split(" ").length : 0 };
}
