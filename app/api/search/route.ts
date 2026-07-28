import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { quickSearch } from "@/lib/search-index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
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

    // Exact matches first; falls back to closely related terms automatically.
    const results = quickSearch(q, 12);

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[certko] /api/search failed:", err);
    return NextResponse.json(
      { results: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
