import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ensureDbReady, getDb } from "@/lib/db";
import { seeOther } from "@/lib/http-redirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Form POST + 303 — avoids Hostinger RSC redirect() fetch failures. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return seeOther("/admin/login?error=session");
  }
  await ensureDbReady();

  const form = await req.formData();
  const id = Number(form.get("id"));
  const status = String(form.get("status") ?? "new");
  if (!id) {
    return seeOther("/admin/inquiries?error=1");
  }
  const allowed = new Set(["new", "contacted", "closed"]);
  const next = allowed.has(status) ? status : "new";
  getDb().prepare("UPDATE inquiries SET status=? WHERE id=?").run(next, id);

  return seeOther("/admin/inquiries?saved=1");
}
