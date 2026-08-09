import { ensureDbReady, getDb } from "./db";
import { sendLeadNotification } from "./mail";

export type InquiryInput = {
  name: string;
  email: string;
  phone?: string;
  product?: string;
  message?: string;
};

export type InquiryResult =
  | { ok: true; emailSent: boolean; emailError?: string }
  | { ok: false; error: "missing_fields" | "save_failed"; detail?: string };

/** Persist a contact/lead inquiry and best-effort email the team. */
export async function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  const email = (input.email || "").trim();
  const phone = (input.phone || "").trim();
  const product = (input.product || "").trim();
  const message = (input.message || "").trim();
  // Newsletter signups may send email only — derive a display name.
  let name = (input.name || "").trim();
  if (!name && email && /^newsletter$/i.test(product)) {
    name = email.split("@")[0] || "Subscriber";
  }

  if (!name || !email) {
    return { ok: false, error: "missing_fields" };
  }

  try {
    await ensureDbReady();
    getDb()
      .prepare(
        "INSERT INTO inquiries (name, email, phone, product, message) VALUES (?, ?, ?, ?, ?)"
      )
      .run(name, email, phone, product, message);
  } catch (err) {
    console.error("[inquiry] save failed:", err);
    return {
      ok: false,
      error: "save_failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }

  const mail = await sendLeadNotification({ name, email, phone, product, message });
  if (!mail.ok) {
    console.error("[inquiry] lead saved but email notify failed:", mail.error);
  }

  return { ok: true, emailSent: mail.ok, emailError: mail.error };
}
