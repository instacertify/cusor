import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep captcha font files on disk (not bundled) so svg-captcha can load them
  serverExternalPackages: ["svg-captcha", "bcryptjs"],
};

export default nextConfig;
