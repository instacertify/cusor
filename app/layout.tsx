import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/db";
import { getPage } from "@/lib/queries";
import { buildJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16263D",
  viewportFit: "cover",
};

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
    openGraph: {
      siteName: settings.site_name || "Certko",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = buildJsonLd(["Organization"], {
    name: "Certko",
    description: "",
    url: "https://certko.com",
  });
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} min-h-screen flex flex-col`}>
        {orgJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
