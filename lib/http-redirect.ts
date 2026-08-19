import { NextResponse } from "next/server";

/**
 * HTTP 303 with a relative Location.
 * Never use `new URL(path, req.url)` on Hostinger — Next's req.url is
 * https://0.0.0.0:$PORT/... and Chrome reports ERR_ADDRESS_INVALID.
 */
export function seeOther(path: string): NextResponse {
  const location = sanitizeRelativePath(path);
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}

export function sanitizeRelativePath(path: string): string {
  const raw = (path || "").trim() || "/";
  if (raw.startsWith("//") || raw.includes("://")) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}
