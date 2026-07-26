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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

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
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
