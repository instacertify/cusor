import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep captcha font / sql.js on disk (not bundled into server chunks)
  serverExternalPackages: ["svg-captcha", "bcryptjs", "sql.js"],
  // If a host uses file tracing / standalone, keep sql.js assets available
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/sql.js/dist/sql-asm.js",
      "./node_modules/sql.js/dist/sql-wasm.js",
      "./node_modules/sql.js/dist/sql-wasm.wasm",
    ],
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
          { key: "X-Robots-Tag", value: "index, follow" },
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
