import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { createGdprRequest } from "@/lib/gdpr";
import { GDPR_REQUEST_TYPES } from "@/lib/gdpr-request-types";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(GDPR_REQUEST_TYPES.map((t) => t.value));
const ALLOWED_REGIONS = new Set(["gdpr", "dpdp", "both", "unspecified"]);

export async function POST(req: Request) {
  await ensureDbReady();
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const requestType = String(form.get("request_type") || "").trim();
  const details = String(form.get("details") || "").trim();
  const region = String(form.get("region") || "unspecified").trim();
  const honeypot = String(form.get("company_website") || "").trim();

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(requestType as never)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }
  if (!ALLOWED_REGIONS.has(region)) {
    return NextResponse.json({ ok: false, error: "invalid_region" }, { status: 400 });
  }

  const id = createGdprRequest({
    requestType,
    name,
    email,
    details,
    region,
  });

  return NextResponse.json({ ok: true, id });
}
