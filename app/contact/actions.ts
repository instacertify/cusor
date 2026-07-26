"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { sendLeadNotification } from "@/lib/mail";

export async function submitInquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email) {
    redirect("/contact?error=1");
  }

  getDb()
    .prepare(
      "INSERT INTO inquiries (name, email, phone, product, message) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, email, phone, product, message);

  // Notify Google Workspace inbox — do not fail the lead if SMTP is misconfigured
  const result = await sendLeadNotification({ name, email, phone, product, message });
  if (!result.ok) {
    console.error("[contact] lead saved but email notify failed:", result.error);
  }

  redirect("/contact?sent=1");
}
