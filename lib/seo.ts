import type { Metadata } from "next";
import { getDb, getSettings } from "./db";

export const BASE_URL = "https://certko.com";

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
  const ogImage = seo?.og_image || fallback.image;

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
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      ...(ogImage ? { images: [ogImage] } : {}),
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
}

export function buildJsonLd(types: string[], ctx: SchemaContext): object | null {
  const graph: object[] = [];
  const settings = getSettings();
  const orgName = settings.site_name || "Certko";

  for (const type of types) {
    switch (type) {
      case "Organization": {
        const address = (settings.contact_address || "").trim();
        graph.push({
          "@type": "Organization",
          name: orgName,
          url: BASE_URL,
          email: settings.contact_email,
          telephone: settings.contact_phone,
          description: settings.tagline,
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
        });
        break;
      }
      case "Service":
        graph.push({
          "@type": "Service",
          name: ctx.name,
          description: ctx.description,
          url: ctx.url,
          provider: { "@type": "Organization", name: orgName, url: BASE_URL },
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
          ...(ctx.image ? { image: `${BASE_URL}${ctx.image}` } : {}),
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
      case "Article":
        graph.push({
          "@type": "Article",
          headline: ctx.name,
          description: ctx.description,
          url: ctx.url,
          ...(ctx.image ? { image: `${BASE_URL}${ctx.image}` } : {}),
          author: { "@type": "Organization", name: orgName },
          publisher: { "@type": "Organization", name: orgName },
        });
        break;
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
