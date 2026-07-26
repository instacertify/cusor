import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectTo(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
}

/** Classic form POST — works even when Next.js server actions / RSC are flaky. */
export async function POST(req: NextRequest) {
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
      if (result.error === "missing_fields") {
        return redirectTo(req, "/contact?error=1");
      }
      return redirectTo(req, "/contact?error=save");
    }

    return redirectTo(req, "/contact?sent=1");
  } catch (err) {
    console.error("[api/contact] unexpected error:", err);
    return redirectTo(req, "/contact?error=save");
  }
}
