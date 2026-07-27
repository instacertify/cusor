import { NextResponse } from "next/server";
import { getSitemapXml } from "@/lib/sitemap-xml";

export const runtime = "nodejs";
/**
 * Cache sitemap for 1 hour. Google was seeing intermittent 500s when the old
 * force-dynamic metadata sitemap cold-started on Hostinger every request.
 */
export const revalidate = 3600;

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET() {
  const { body } = await getSitemapXml();
  return new NextResponse(body, { status: 200, headers: HEADERS });
}

/** Googlebot sometimes probes with HEAD before fetching the body. */
export async function HEAD() {
  try {
    await getSitemapXml();
    return new NextResponse(null, { status: 200, headers: HEADERS });
  } catch {
    return new NextResponse(null, { status: 200, headers: HEADERS });
  }
}
