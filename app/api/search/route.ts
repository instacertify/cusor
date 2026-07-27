import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { quickSearch } from "@/lib/search-index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  await ensureDbReady();
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  }

  const results = quickSearch(q, 12);

  return NextResponse.json(
    { results },
    {
      headers: {
        // Autocomplete is safe to cache briefly — cuts repeat keystroke latency.
        "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
      },
    }
  );
}
