import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth";
import { ensureDbReady, getDb } from "@/lib/db";
import { seeOther } from "@/lib/http-redirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Classic form POST + 303. Do not use next/navigation redirect() —
 * Hostinger RSC follows redirects with an internal fetch that fails
 * ("failed to get redirect response").
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return seeOther("/admin/login?error=session");
  }
  await ensureDbReady();

  const form = await req.formData();
  const id = Number(form.get("id"));
  const confirm = String(form.get("confirm") ?? "").trim();
  if (!id || confirm !== "DELETE") {
    return seeOther("/admin/inquiries?error=confirm");
  }

  const row = getDb()
    .prepare("SELECT name, email, created_at FROM inquiries WHERE id = ?")
    .get(id) as { name: string; email: string; created_at: string } | undefined;

  if (row) {
    const { archiveInquiryDeleted } = await import("@/lib/inquiry-archive");
    archiveInquiryDeleted({
      name: row.name,
      email: row.email,
      created_at: String(row.created_at ?? ""),
    });
  }

  getDb().prepare("DELETE FROM inquiries WHERE id = ?").run(id);
  const { flushSqlJsToDisk, isSqlJsReady } = await import("@/lib/sqlite");
  if (isSqlJsReady()) flushSqlJsToDisk();

  return seeOther("/admin/inquiries?deleted=1");
}
