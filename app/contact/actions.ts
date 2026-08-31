"use server";

import { createInquiry } from "@/lib/inquiries";

/**
 * Prefer POST /api/contact (ContactForm). Kept for compatibility.
 * Do NOT call next/navigation redirect() — Hostinger RSC follows redirects
 * with an internal fetch that fails ("failed to get redirect response").
 */
export async function submitInquiry(formData: FormData) {
  return createInquiry({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    product: String(formData.get("product") ?? ""),
    message: String(formData.get("message") ?? ""),
    intent: String(formData.get("intent") ?? "").trim() || undefined,
  });
}
