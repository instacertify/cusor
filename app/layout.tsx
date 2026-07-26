import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/db";
import { getPage } from "@/lib/queries";

export const dynamic = "force-dynamic";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
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
    openGraph: {
      siteName: settings.site_name || "Certko",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
