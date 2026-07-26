import type { MetadataRoute } from "next";
import { getCategories, getLabs, getCertifications, getPublishedPosts } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { getSeoExclusions } from "@/lib/seo";

export const dynamic = "force-dynamic";

const BASE = "https://certko.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // entities excluded via the admin SEO tools (sitemap_include = 0)
  const excludedPages = getSeoExclusions("page");
  const excludedProducts = getSeoExclusions("product");
  const excludedCategories = getSeoExclusions("category");
  const excludedCerts = getSeoExclusions("cert");

  const staticPages: MetadataRoute.Sitemap = [
    ...(excludedPages.has("home") ? [] : [{ url: BASE, changeFrequency: "weekly" as const, priority: 1 }]),
    { url: `${BASE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/products/all`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/certifications`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/labs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/qco`, changeFrequency: "weekly", priority: 0.8 },
    ...["guide", "about", "contact", "tenders", "marketplaces"]
      .filter((slug) => !excludedPages.has(slug))
      .map((slug) => ({
        url: `${BASE}/${slug}`,
        changeFrequency: "monthly" as const,
        priority: slug === "guide" ? 0.8 : 0.6,
      })),
  ];

  const categories = getCategories()
    .filter((c) => !excludedCategories.has(String(c.id)))
    .map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const certifications = getCertifications()
    .filter((c) => !excludedCerts.has(String(c.id)))
    .map((c) => ({
      url: `${BASE}/certifications/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const products = (
    getDb().prepare("SELECT id, slug FROM products").all() as { id: number; slug: string }[]
  )
    .filter((p) => !excludedProducts.has(String(p.id)))
    .map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const { labs } = getLabs({ limit: 10000 });
  const labPages = labs.map((l) => ({
    url: `${BASE}/labs/${l.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const excludedPosts = getSeoExclusions("post");
  const posts = getPublishedPosts(500)
    .filter((p) => !excludedPosts.has(String(p.id)))
    .map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categories, ...certifications, ...posts, ...products, ...labPages];
}
