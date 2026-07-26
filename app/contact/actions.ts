"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

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

  redirect("/contact?sent=1");
}
