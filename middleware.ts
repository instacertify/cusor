import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  getAuthSecret,
  verifySessionTokenEdge,
} from "@/lib/session-edge";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const PUBLIC_ADMIN_API = new Set(["/api/admin/captcha"]);

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  // Apex canonical host — edge redirect avoids Next.js config redirects that
  // trigger internal fetch() on Hostinger (→ "failed to get redirect response").
  if (host === "www.certko.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "certko.com";
    return NextResponse.redirect(url, 308);
  }

  // Legacy GMA URL — server redirect() with a hash fragment breaks RSC on some hosts.
  if (pathname === "/certifications/global-market-access") {
    const url = request.nextUrl.clone();
    url.pathname = "/certifications";
    url.hash = "";
    url.searchParams.set("section", "global-market-access");
    return NextResponse.redirect(url, 308);
  }

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!isAdminRoute) {
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      pathname
    );
  }

  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  if (PUBLIC_ADMIN_PATHS.has(pathname) || PUBLIC_ADMIN_API.has(pathname)) {
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      pathname
    );
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionTokenEdge(token, getAuthSecret());

  if (!ok) {
    if (isAdminApi) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        pathname
      );
    }
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/") {
      login.searchParams.set("next", pathname);
    }
    return withSecurityHeaders(NextResponse.redirect(login), pathname);
  }

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
