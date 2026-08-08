import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { publishDueBlogPosts } from "@/lib/blog-scheduler";
import { refreshSitemapFiles } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Optional external cron/webhook target.
 * If CRON_SECRET is set, require `Authorization: Bearer <CRON_SECRET>`.
 * The in-process scheduler in instrumentation.ts already publishes due posts;
 * this route is for hosts that prefer an HTTP cron ping.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (token !== secret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  await ensureDbReady();
  const result = publishDueBlogPosts();
  if (result.publishedIds.length > 0) {
    void refreshSitemapFiles();
  }

  return NextResponse.json({
    ok: true,
    published: result.publishedIds.length,
    slugs: result.publishedSlugs,
    at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
