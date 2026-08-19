import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { logAdminEvent } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  logAdminEvent("logout", "", "session_cleared");
  const res = NextResponse.redirect(new URL("/admin/login", req.url), 303);
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
