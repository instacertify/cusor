"use server";

import { redirect } from "next/navigation";
import { createInquiry } from "@/lib/inquiries";

export async function submitInquiry(formData: FormData) {
  const result = await createInquiry({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    product: String(formData.get("product") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!result.ok) {
    if (result.error === "missing_fields") redirect("/contact?error=1");
    redirect("/contact?error=save");
  }

  redirect("/contact?sent=1");
}
