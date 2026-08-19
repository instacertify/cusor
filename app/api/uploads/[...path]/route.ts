import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { mimeForExt, resolveUploadFsPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * Serve admin uploads from public/uploads or the writable data/uploads fallback.
 * Paired with a next.config rewrite so /uploads/* always hits this route when
 * the static file is missing (Hostinger / read-only app dirs).
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const parts = (await ctx.params).path || [];
  if (!parts.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (parts.some((p) => !p || p.includes("\0") || p === ".." || p.includes("/"))) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const urlPath = `/uploads/${parts.join("/")}`;
  const filePath = resolveUploadFsPath(urlPath);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": mimeForExt(ext),
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[certko] upload serve failed:", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
