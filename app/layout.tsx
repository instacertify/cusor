import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TalkToCertificationExpertBar from "@/components/TalkToCertificationExpert";
import TimedContactPopup from "@/components/TimedContactPopup";
import AnalyticsGate from "@/components/AnalyticsGate";
import CookieConsent from "@/components/CookieConsent";
import { ensureDbReady, getSettings } from "@/lib/db";
import { getGdprPublicSettings } from "@/lib/gdpr";
import { resolveExpertCta } from "@/lib/expert-cta";
import { resolveContactPopup } from "@/lib/contact-popup";
import { getPage } from "@/lib/queries";
import {
  BASE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  buildJsonLd,
} from "@/lib/seo";
import { resolveColorScheme } from "@/lib/color-schemes";
import { resolveIconStyle } from "@/lib/icon-style";

export const dynamic = "force-dynamic";

export async function generateViewport(): Promise<Viewport> {
  await ensureDbReady();
  const settings = getSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
  await ensureDbReady();
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
      default:
        home?.meta_title || "Certko | Certification & Compliance Solution Partner",
      template: `%s | ${settings.site_name || "Certko"}`,
    },
    description: home?.meta_description || settings.tagline,
    metadataBase: new URL("https://certko.com"),
    // Public pages are indexable by default. Admin layouts override to noindex.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
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
      locale: "en_IN",
      url: BASE_URL,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: settings.site_name || "Certko",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title:
        home?.meta_title || "Certko | Certification & Compliance Solution Partner",
      description: home?.meta_description || settings.tagline,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureDbReady();
  const settings = getSettings();
  const gdprSettings = getGdprPublicSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  const iconStyle = resolveIconStyle(settings.icon_style);
  const expertCta = resolveExpertCta(settings);
  const contactPopup = resolveContactPopup(settings);
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdminShell = pathname.startsWith("/admin");
  // Sitewide Organization + WebSite (site name, favicon attribution, sitelinks search box).
  const orgJsonLd = isAdminShell
    ? null
    : buildJsonLd(["Organization", "WebSite"], {
        name: settings.site_name || "Certko",
        description: settings.tagline || "",
        url: BASE_URL,
      });
  return (
    <html lang="en" data-color-scheme={scheme.id} data-icon-style={iconStyle}>
      <body className={`${body.variable} ${display.variable} min-h-screen flex flex-col`}>
        {!isAdminShell && (
          <AnalyticsGate
            ga4MeasurementId={settings.ga4_measurement_id || ""}
            gtmContainerId={settings.gtm_container_id || ""}
            customHeadHtml={settings.custom_head_html || ""}
            customBodyHtml={settings.custom_body_html || ""}
            settings={gdprSettings}
          />
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
        {!isAdminShell && <TalkToCertificationExpertBar cta={expertCta} />}
        {!isAdminShell && contactPopup.enabled && (
          <TimedContactPopup
            config={contactPopup}
            cookieBannerEnabled={gdprSettings.bannerEnabled}
          />
        )}
        {!isAdminShell && <CookieConsent settings={gdprSettings} />}
      </body>
    </html>
  );
}
