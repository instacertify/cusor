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

/** Apex host for www → non-www. Never build from request.nextUrl (0.0.0.0 bind). */
const PUBLIC_APEX = "https://certko.com";

function absoluteApexLocation(request: NextRequest): string {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_APEX}${safePath}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  if (host === "www.certko.com") {
    // Relative Location cannot change host. Use an explicit public apex URL —
    // never NextResponse.redirect(request.nextUrl.clone()) on Hostinger
    // (bind host 0.0.0.0 → TypeError: Invalid URL / bad Location).
    return withSecurityHeaders(
      new NextResponse(null, {
        status: 308,
        headers: { Location: absoluteApexLocation(request) },
      }),
      pathname
    );
  }

  if (pathname === "/certifications/global-market-access") {
    return withSecurityHeaders(
      new NextResponse(null, {
        status: 308,
        headers: { Location: "/certifications?section=global-market-access" },
      }),
      pathname
    );
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
