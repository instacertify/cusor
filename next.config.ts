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
};

export default nextConfig;
