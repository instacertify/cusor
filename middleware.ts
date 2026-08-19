import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware is limited to env vars (no disk). Admin auth runs in Node
 * (layout + API) using a secret persisted in CERTKO_DATA_DIR so Hostinger
 * restarts do not desync Edge vs Node secrets.
 */
function withSecurityHeaders(res: NextResponse, pathname: string) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("x-pathname", pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("Pragma", "no-cache");
  }
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  if (host === "www.certko.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "certko.com";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/certifications/global-market-access") {
    const url = request.nextUrl.clone();
    url.pathname = "/certifications";
    url.hash = "";
    url.searchParams.set("section", "global-market-access");
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return withSecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    pathname
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|api/uploads|brand).*)",
  ],
};
