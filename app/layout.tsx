import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ClearAutoReloadFlag from "@/components/ClearAutoReloadFlag";
import { isDbFreePath } from "@/lib/request-path";

export const dynamic = "force-dynamic";

const LOGIN_VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16263D",
  viewportFit: "cover",
};

export async function generateViewport(): Promise<Viewport> {
  const pathname = (await headers()).get("x-pathname") || "";
  if (isDbFreePath(pathname)) return LOGIN_VIEWPORT;

  const { ensureDbReady, getSettings } = await import("@/lib/db");
  const { resolveColorScheme } = await import("@/lib/color-schemes");
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
  const pathname = (await headers()).get("x-pathname") || "";
  if (isDbFreePath(pathname)) {
    return {
      title: "Admin Login | Certko",
      robots: { index: false, follow: false, nocache: true },
    };
  }
  const { ensureDbReady, getSettings } = await import("@/lib/db");
  const { getPage } = await import("@/lib/queries");
  const {
    DEFAULT_OG_IMAGE,
    DEFAULT_OG_IMAGE_HEIGHT,
    DEFAULT_OG_IMAGE_WIDTH,
  } = await import("@/lib/seo");
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

const fontClass = `${body.variable} ${display.variable} min-h-screen flex flex-col`;

async function CmsShell({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const isAdminShell = pathname.startsWith("/admin");
  const { ensureDbReady, getSettings, isCmsReady } = await import("@/lib/db");
  const { getGdprPublicSettings } = await import("@/lib/gdpr");
  const { resolveExpertCta } = await import("@/lib/expert-cta");
  const { resolveContactPopup } = await import("@/lib/contact-popup");
  const { resolveColorScheme } = await import("@/lib/color-schemes");
  const { resolveIconStyle } = await import("@/lib/icon-style");
  const { BASE_URL, buildJsonLd } = await import("@/lib/seo");
  const Header = (await import("@/components/Header")).default;
  const Footer = (await import("@/components/Footer")).default;
  const TalkToCertificationExpertBar = (await import("@/components/TalkToCertificationExpert"))
    .default;
  const TimedContactPopup = (await import("@/components/TimedContactPopup")).default;
  const AnalyticsGate = (await import("@/components/AnalyticsGate")).default;
  const CookieConsent = (await import("@/components/CookieConsent")).default;

  await ensureDbReady();
  const settings = !isCmsReady() ? {} : getSettings();
  const gdprSettings = !isCmsReady()
    ? {
        bannerEnabled: false,
        requireAnalyticsConsent: true,
        bannerTitle: "",
        bannerText: "",
        privacyOfficerEmail: "",
        inquiryRetentionDays: 365,
        policyVersion: "",
        showFloatingCookieButton: false,
        bannerShowCategoriesDefault: false,
        categories: [],
      }
    : getGdprPublicSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  const iconStyle = resolveIconStyle(settings.icon_style);
  const expertCta = resolveExpertCta(settings);
  const contactPopup = resolveContactPopup(settings);
  const orgJsonLd = isAdminShell
    ? null
    : buildJsonLd(["Organization", "WebSite"], {
        name: settings.site_name || "Certko",
        description: settings.tagline || "",
        url: BASE_URL,
      });

  return (
    <html lang="en-IN" data-color-scheme={scheme.id} data-icon-style={iconStyle}>
      <body className={fontClass}>
        <ClearAutoReloadFlag />
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = (await headers()).get("x-pathname") || "";

  // Login must not import SQLite / seed / Header. Those modules made
  // GET /admin/login hang on Hostinger until the error boundary showed "Loading…".
  if (isDbFreePath(pathname)) {
    return (
      <html lang="en-IN" data-color-scheme="certko" data-icon-style="original">
        <body className={fontClass}>
          <main className="flex-1">{children}</main>
        </body>
      </html>
    );
  }

  return <CmsShell pathname={pathname}>{children}</CmsShell>;
}
