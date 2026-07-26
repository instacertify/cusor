import type { MetadataRoute } from "next";
import { getCategories, getAllProductSlugs, getLabs } from "@/lib/queries";

export const dynamic = "force-dynamic";

const BASE = "https://certko.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/labs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/qco`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guide`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const categories = getCategories().map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const products = getAllProductSlugs().map((p) => ({
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

  return [...staticPages, ...categories, ...products, ...labPages];
}
