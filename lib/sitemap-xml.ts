import fs from "fs";
import path from "path";
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
import { countryHubPath, getCountryHubs } from "@/lib/country-certifications";
import { ensureDbReady, getDb, getWritableDataDir } from "@/lib/db";
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
  /** W3C datetime / ISO date for <lastmod> */
  lastModified?: string;
};

type CacheGlobal = typeof globalThis & {
  __certkoSitemapXml?: { body: string; at: number } | null;
  __certkoSitemapRefresh?: Promise<void> | null;
};

const g = globalThis as CacheGlobal;
const TTL_MS = 60 * 60 * 1000; // 1 hour
const DISK_NAME = "sitemap-cache.xml";

/** Static file Google/LiteSpeed can fetch with Content-Length (fixes GSC HTTP error). */
export function publicSitemapPath(): string {
  return path.join(process.cwd(), "public", "sitemap.xml");
}

function diskPath(): string {
  return path.join(getWritableDataDir(), DISK_NAME);
}

function isValidSitemap(body: string): boolean {
  return body.includes("<urlset") && body.includes("</urlset>") && body.includes("<loc>");
}

function readFileCache(file: string): { body: string; at: number } | null {
  try {
    const stat = fs.statSync(file);
    const body = fs.readFileSync(file, "utf8");
    if (!isValidSitemap(body)) return null;
    return { body, at: stat.mtimeMs };
  } catch {
    return null;
  }
}

function writeSitemapFiles(body: string) {
  try {
    fs.writeFileSync(diskPath(), body, "utf8");
  } catch (err) {
    console.warn("[sitemap] could not write data cache:", err);
  }
  try {
    const pub = publicSitemapPath();
    fs.mkdirSync(path.dirname(pub), { recursive: true });
    fs.writeFileSync(pub, body, "utf8");
  } catch (err) {
    console.warn("[sitemap] could not write public/sitemap.xml:", err);
  }
}

export function invalidateSitemapCache() {
  g.__certkoSitemapXml = null;
  // Rebuild immediately so Google always hits a fresh static file.
  void refreshSitemapFiles();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toLastmod(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function toXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`<loc>${escapeXml(e.url)}</loc>`];
      const lastmod = toLastmod(e.lastModified);
      if (lastmod) parts.push(`<lastmod>${escapeXml(lastmod)}</lastmod>`);
      if (e.changeFrequency) parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      if (typeof e.priority === "number") {
        parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `<url>\n${parts.join("\n")}\n</url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
}

function minimalXml(): string {
  return toXml([
    { url: SITEMAP_BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITEMAP_BASE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITEMAP_BASE}/certifications`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITEMAP_BASE}/certifications/countries`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
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
    {
      url: `${SITEMAP_BASE}/certifications/countries`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    { url: `${SITEMAP_BASE}/testing`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITEMAP_BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITEMAP_BASE}/labs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/qco`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITEMAP_BASE}/sitemap`, changeFrequency: "weekly", priority: 0.4 },
    ...(excludedPages.has("contact")
      ? []
      : [{ url: `${SITEMAP_BASE}/contact`, changeFrequency: "monthly" as const, priority: 0.6 }]),
    {
      url: `${SITEMAP_BASE}/privacy/cookies`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${SITEMAP_BASE}/privacy/gdpr-and-dpdp`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${SITEMAP_BASE}/privacy/data-request`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
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

  const countryHubs = getCountryHubs().map((h) => ({
    url: `${SITEMAP_BASE}${countryHubPath(h.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
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
      lastModified: p.published_at || p.created_at || undefined,
    }));

  const authors = getAuthors().map((a) => ({
    url: `${SITEMAP_BASE}/authors/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];
  for (const entry of [
    ...staticPages,
    ...categories,
    ...certifications,
    ...countryHubs,
    ...testingCategories,
    ...testingServices,
    ...posts,
    ...authors,
    ...products,
    ...labPages,
  ]) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    entries.push(entry);
  }
  return entries;
}

/** Rebuild sitemap XML onto disk + public/sitemap.xml. Safe to call often. */
export async function refreshSitemapFiles(): Promise<void> {
  if (g.__certkoSitemapRefresh) return g.__certkoSitemapRefresh;

  g.__certkoSitemapRefresh = (async () => {
    try {
      const entries = await buildSitemapEntries();
      const body = toXml(entries);
      g.__certkoSitemapXml = { body, at: Date.now() };
      writeSitemapFiles(body);
    } catch (err) {
      console.error("[sitemap] refresh failed:", err);
      const existing =
        readFileCache(publicSitemapPath()) ||
        readFileCache(diskPath()) ||
        g.__certkoSitemapXml;
      if (!existing) {
        const body = minimalXml();
        g.__certkoSitemapXml = { body, at: Date.now() };
        writeSitemapFiles(body);
      }
    } finally {
      g.__certkoSitemapRefresh = null;
    }
  })();

  return g.__certkoSitemapRefresh;
}

/** Build (or return cached) sitemap XML. Never throws. */
export async function getSitemapXml(): Promise<{ body: string; fromCache: boolean }> {
  const mem = g.__certkoSitemapXml;
  if (mem && Date.now() - mem.at < TTL_MS) {
    return { body: mem.body, fromCache: true };
  }

  const pub = readFileCache(publicSitemapPath());
  if (pub && Date.now() - pub.at < TTL_MS) {
    g.__certkoSitemapXml = pub;
    return { body: pub.body, fromCache: true };
  }

  const disk = readFileCache(diskPath());
  if (disk && Date.now() - disk.at < TTL_MS) {
    g.__certkoSitemapXml = disk;
    // Keep public/ in sync for LiteSpeed static serving.
    try {
      fs.writeFileSync(publicSitemapPath(), disk.body, "utf8");
    } catch {
      /* ignore */
    }
    return { body: disk.body, fromCache: true };
  }

  try {
    const entries = await buildSitemapEntries();
    const body = toXml(entries);
    g.__certkoSitemapXml = { body, at: Date.now() };
    writeSitemapFiles(body);
    return { body, fromCache: false };
  } catch (err) {
    console.error("[sitemap] build failed, serving fallback:", err);
    if (mem?.body) return { body: mem.body, fromCache: true };
    if (pub?.body) return { body: pub.body, fromCache: true };
    if (disk?.body) return { body: disk.body, fromCache: true };
    const body = minimalXml();
    g.__certkoSitemapXml = { body, at: Date.now() };
    writeSitemapFiles(body);
    return { body, fromCache: false };
  }
}
