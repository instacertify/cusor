import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { getEmptySearchHelp, quickSearch } from "@/lib/search-index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  await ensureDbReady();
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1 || (q.length < 2 && !/^\d+$/.test(q))) {
    return NextResponse.json(
      { results: [], notFound: false },
      {
        headers: {
          "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  }

  const results = quickSearch(q, 16);
  if (results.length === 0) {
    const help = getEmptySearchHelp(q);
    return NextResponse.json(
      {
        results: [],
        notFound: true,
        message: help.message,
        tryQueries: help.tryQueries,
        browse: help.browse,
        related: help.related,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
        },
      }
    );
  }

  return NextResponse.json(
    { results, notFound: false },
    {
      headers: {
        "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
      },
    }
  );
}
