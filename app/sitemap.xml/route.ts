import { NextResponse } from "next/server";
import { getSitemapXml } from "@/lib/sitemap-xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve /sitemap.xml from a memory+disk cache so Googlebot never waits on a
 * cold sql.js boot (that used to return intermittent 500s on Hostinger).
 */
const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex",
} as const;

export async function GET() {
  try {
    const { body } = await getSitemapXml();
    return new NextResponse(body, { status: 200, headers: HEADERS });
  } catch {
    // Absolute last resort — still return valid sitemap XML, never 5xx.
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `<url><loc>https://certko.com</loc></url>\n` +
      `</urlset>\n`;
    return new NextResponse(body, { status: 200, headers: HEADERS });
  }
}

/** Googlebot sometimes probes with HEAD before fetching the body. */
export async function HEAD() {
  try {
    await getSitemapXml();
  } catch {
    // ignore — still return 200
  }
  return new NextResponse(null, { status: 200, headers: HEADERS });
}
