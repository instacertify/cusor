import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { quickSearch, type QuickSearchScope } from "@/lib/search-index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SCOPES = new Set<QuickSearchScope>([
  "all",
  "standard",
  "lab",
  "certification",
  "testing",
]);

function parseScope(raw: string | null): QuickSearchScope {
  const v = (raw || "all").trim().toLowerCase();
  // Accept search-page tab aliases too
  if (v === "products" || v === "standard" || v === "standards") return "standard";
  if (v === "labs" || v === "lab") return "lab";
  if (v === "certs" || v === "cert" || v === "certification" || v === "certifications") {
    return "certification";
  }
  if (v === "testing" || v === "test") return "testing";
  if (SCOPES.has(v as QuickSearchScope)) return v as QuickSearchScope;
  return "all";
}

export async function GET(req: NextRequest) {
  try {
    await ensureDbReady();
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    const scope = parseScope(req.nextUrl.searchParams.get("type"));
    if (q.length < 2) {
      return NextResponse.json(
        { results: [], scope },
        {
          headers: {
            "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
          },
        }
      );
    }

    const results = quickSearch(q, 12, scope);

    return NextResponse.json(
      { results, scope },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[certko] /api/search failed:", err);
    return NextResponse.json(
      { results: [], scope: "all" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
