import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db";
import { CONSENT_POLICY_VERSION, logConsentEvent } from "@/lib/gdpr";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureDbReady();
  let body: {
    analytics?: boolean;
    marketing?: boolean;
    policyVersion?: string;
    source?: string;
    visitorId?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") || "";
  logConsentEvent({
    visitorId: body.visitorId,
    analytics: Boolean(body.analytics),
    marketing: Boolean(body.marketing),
    policyVersion: body.policyVersion || CONSENT_POLICY_VERSION,
    source: body.source || "banner",
    userAgent: ua,
  });

  return NextResponse.json({ ok: true });
}
