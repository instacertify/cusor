import {
  getCategories,
  getLabs,
  getCertifications,
  getPublishedPosts,
  getAuthors,
  getTestingCategories,
  getAllTestingServices,
  getRoutableContentPages,
} from "@/lib/queries";
import { pagePublicPath } from "@/lib/pages-nav";
import { ensureDbReady, getDb } from "@/lib/db";
import { getSeoExclusions } from "@/lib/seo";

export const SITEMAP_BASE = "https://certko.com";

type SitemapEntry = {
  url: string;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

type CacheGlobal = typeof globalThis & {
  __certkoSitemapXml?: { body: string; at: number } | null;
};

const g = globalThis as CacheGlobal;
const TTL_MS = 60 * 60 * 1000; // 1 hour in-process cache

export function invalidateSitemapCache() {
  g.__certkoSitemapXml = null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`<loc>${escapeXml(e.url)}</loc>`];
      if (e.changeFrequency) parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      if (typeof e.priority === "number") {
        parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `<url>\n${parts.join("\n")}\n</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`;
}

function minimalXml(): string {
  return toXml([
    { url: SITEMAP_BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITEMAP_BASE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITEMAP_BASE}/certifications`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/testing`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITEMAP_BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITEMAP_BASE}/sitemap`, changeFrequency: "weekly", priority: 0.4 },
  ]);
}

export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  await ensureDbReady();

  const excludedPages = getSeoExclusions("page");
  const excludedProducts = getSeoExclusions("product");
  const excludedCategories = getSeoExclusions("category");
  const excludedCerts = getSeoExclusions("cert");
  const excludedTestCats = getSeoExclusions("testcat");
  const excludedTests = getSeoExclusions("test");
  const excludedPosts = getSeoExclusions("post");

  const staticPages: SitemapEntry[] = [
    ...(excludedPages.has("home")
      ? []
      : [{ url: SITEMAP_BASE, changeFrequency: "weekly" as const, priority: 1 }]),
    { url: `${SITEMAP_BASE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITEMAP_BASE}/products/all`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITEMAP_BASE}/certifications`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/testing`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITEMAP_BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITEMAP_BASE}/labs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/qco`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/sitemap`, changeFrequency: "weekly", priority: 0.4 },
    ...(excludedPages.has("contact")
      ? []
      : [{ url: `${SITEMAP_BASE}/contact`, changeFrequency: "monthly" as const, priority: 0.6 }]),
    ...getRoutableContentPages()
      .filter((p) => !excludedPages.has(p.slug))
      .map((p) => ({
        url: `${SITEMAP_BASE}${pagePublicPath(p.slug)}`,
        changeFrequency: "monthly" as const,
        priority:
          p.slug === "guide" ? 0.8 : p.slug === "privacy" || p.slug === "terms" ? 0.4 : 0.6,
      })),
  ];

  const categories = getCategories()
    .filter((c) => !excludedCategories.has(String(c.id)))
    .map((c) => ({
      url: `${SITEMAP_BASE}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const certifications = getCertifications()
    .filter((c) => !excludedCerts.has(String(c.id)))
    .map((c) => ({
      url: `${SITEMAP_BASE}/certifications/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const testingCategories = getTestingCategories()
    .filter((c) => !excludedTestCats.has(String(c.id)))
    .map((c) => ({
      url: `${SITEMAP_BASE}/testing/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const testingServices = getAllTestingServices(5000)
    .filter((s) => !excludedTests.has(String(s.id)))
    .map((s) => ({
      url: `${SITEMAP_BASE}/testing/${s.category_slug}/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const products = (
    getDb().prepare("SELECT id, slug FROM products").all() as { id: number; slug: string }[]
  )
    .filter((p) => !excludedProducts.has(String(p.id)))
    .map((p) => ({
      url: `${SITEMAP_BASE}/product/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const { labs } = getLabs({ limit: 10000 });
  const labPages = labs.map((l) => ({
    url: `${SITEMAP_BASE}/labs/${l.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const posts = getPublishedPosts(500)
    .filter((p) => !excludedPosts.has(String(p.id)))
    .map((p) => ({
      url: `${SITEMAP_BASE}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const authors = getAuthors().map((a) => ({
    url: `${SITEMAP_BASE}/authors/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categories,
    ...certifications,
    ...testingCategories,
    ...testingServices,
    ...posts,
    ...authors,
    ...products,
    ...labPages,
  ];
}

/** Build (or return cached) sitemap XML. Never throws — falls back to a tiny valid map. */
export async function getSitemapXml(): Promise<{ body: string; fromCache: boolean }> {
  const hit = g.__certkoSitemapXml;
  if (hit && Date.now() - hit.at < TTL_MS) {
    return { body: hit.body, fromCache: true };
  }

  try {
    const entries = await buildSitemapEntries();
    const body = toXml(entries);
    g.__certkoSitemapXml = { body, at: Date.now() };
    return { body, fromCache: false };
  } catch (err) {
    console.error("[sitemap] build failed, serving minimal sitemap:", err);
    if (hit?.body) return { body: hit.body, fromCache: true };
    return { body: minimalXml(), fromCache: false };
  }
}
