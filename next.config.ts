import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MDXEditor ships as ESM; ensure Next transpiles it for the App Router admin bundle.
  transpilePackages: ["@mdxeditor/editor"],
  // Blog cover uploads (multipart) often exceed the 1MB Server Action default.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  // Blog/admin uploads may include SVG covers; raster formats use the default optimizer.
  // CMS uploads are rendered via /api/uploads (plain <img>), not the optimizer.
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
  // Keep captcha font / pg / sql.js / sharp on disk (not bundled into server chunks)
  serverExternalPackages: ["svg-captcha", "bcryptjs", "pg", "deasync", "sql.js", "sharp"],
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/pg/**",
      "./node_modules/deasync/**",
      "./node_modules/sql.js/dist/sql-asm.js",
      "./node_modules/sql.js/dist/sql-wasm.js",
      "./node_modules/sql.js/dist/sql-wasm.wasm",
    ],
  },
  // When public/uploads is not writable, files live under CERTKO_DATA_DIR and are served here.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.certko.com" }],
        destination: "https://certko.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
