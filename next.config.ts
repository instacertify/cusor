import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep captcha font / wasm on disk (not bundled)
  serverExternalPackages: ["svg-captcha", "bcryptjs", "sql.js"],
};

export default nextConfig;
