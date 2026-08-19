import { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { logAdminEvent } from "@/lib/admin-audit";
import { seeOther } from "@/lib/http-redirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  logAdminEvent("logout", "", "session_cleared");
  const res = seeOther("/admin/login");
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
