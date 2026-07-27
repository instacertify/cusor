import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/sitemap.xml"],
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: "https://certko.com/sitemap.xml",
    host: "https://certko.com",
  };
}
