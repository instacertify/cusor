import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteIntegrations, { SiteIntegrationsBody } from "@/components/SiteIntegrations";
import { getSettings } from "@/lib/db";
import { getPage } from "@/lib/queries";
import { buildJsonLd } from "@/lib/seo";
import { resolveColorScheme } from "@/lib/color-schemes";

export const dynamic = "force-dynamic";

export async function generateViewport(): Promise<Viewport> {
  const settings = getSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: scheme.themeColor,
    viewportFit: "cover",
  };
}

// CERTKO brand typography: Poppins (500/600) display, Inter (400/500/600) body
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const display = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const home = getPage("home");
  const settings = getSettings();
  const google = (settings.google_site_verification || "").trim();
  const bing = (settings.bing_site_verification || "").trim();
  const facebook = (settings.facebook_domain_verification || "").trim();
  const other: Record<string, string | string[]> = {};
  if (bing) other["msvalidate.01"] = bing;
  if (facebook) other["facebook-domain-verification"] = facebook;

  return {
    title: {
      default: home?.meta_title || "Certko | BIS Certification Intelligence",
      template: `%s | ${settings.site_name || "Certko"}`,
    },
    description: home?.meta_description || settings.tagline,
    metadataBase: new URL("https://certko.com"),
    icons: {
      icon: [
        { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/brand/certko-favicon.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon.ico",
    },
    verification: {
      ...(google ? { google } : {}),
      ...(Object.keys(other).length ? { other } : {}),
    },
    openGraph: {
      siteName: settings.site_name || "Certko",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = getSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdminShell = pathname.startsWith("/admin");
  const orgJsonLd = isAdminShell
    ? null
    : buildJsonLd(["Organization"], {
        name: "Certko",
        description: "",
        url: "https://certko.com",
      });
  return (
    <html lang="en" data-color-scheme={scheme.id}>
      <body className={`${body.variable} ${display.variable} min-h-screen flex flex-col`}>
        {!isAdminShell && (
          <>
            <SiteIntegrationsBody />
            <SiteIntegrations />
          </>
        )}
        {orgJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
        )}
        {!isAdminShell && <Header />}
        <main className="flex-1">{children}</main>
        {!isAdminShell && <Footer />}
      </body>
    </html>
  );
}
