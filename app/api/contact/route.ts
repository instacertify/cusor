import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function wantsJson(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("application/json");
}

function redirectTo(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
}

/** Classic form POST — works even when Next.js server actions / RSC are flaky. */
export async function POST(req: NextRequest) {
  const json = wantsJson(req);

  try {
    const formData = await req.formData();
    const result = await createInquiry({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      product: String(formData.get("product") ?? ""),
      message: String(formData.get("message") ?? ""),
    });

    if (!result.ok) {
      if (json) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: result.error === "missing_fields" ? 400 : 500 }
        );
      }
      if (result.error === "missing_fields") {
        return redirectTo(req, "/contact?error=1");
      }
      return redirectTo(req, "/contact?error=save");
    }

    if (json) {
      return NextResponse.json({ ok: true });
    }
    return redirectTo(req, "/contact?sent=1");
  } catch (err) {
    console.error("[api/contact] unexpected error:", err);
    if (json) {
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }
    return redirectTo(req, "/contact?error=save");
  }
}
