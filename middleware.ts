import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  getAuthSecret,
  verifySessionTokenEdge,
} from "@/lib/session-edge";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const PUBLIC_ADMIN_API = new Set(["/api/admin/captcha"]);

const PUBLIC_CRAWL_HEADER =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function withSecurityHeaders(res: NextResponse, pathname: string) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("x-pathname", pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("Pragma", "no-cache");
    // CMS must never be indexed — public frontend stays crawlable separately.
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  const isApi = pathname === "/api" || pathname.startsWith("/api/");

  // Complete public frontend: crawl allowed YES, no blocking, page fetch YES.
  if (!isAdmin && !isApi) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("X-Robots-Tag", PUBLIC_CRAWL_HEADER);
    return res;
  }

  // Public API routes (contact, etc.) — not for search indexing.
  if (isApi && !isAdminApi) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

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
  // Run on HTML routes + APIs; skip static assets (images, fonts, robots.txt, sitemap.xml).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|uploads/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|txt|xml|map|js|css)$).*)",
  ],
};
