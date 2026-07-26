"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getDb, setSetting } from "@/lib/db";
import { requireAdmin, clearAdminSession } from "@/lib/auth";

async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = path.extname(file.name).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) return null;
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

// ---------- settings ----------
export async function saveSettings(formData: FormData) {
  await requireAdmin();
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) {
      setSetting(key, value);
    }
  }
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

// ---------- pages ----------
export async function savePage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const image = await saveUploadedImage(formData.get("image_file") as File | null);
  const db = getDb();
  db.prepare(
    `UPDATE pages SET title=?, meta_title=?, meta_description=?, hero_heading=?, hero_subheading=?, content=?
     ${image ? ", image=?" : ""} WHERE slug=?`
  ).run(
    ...[
      String(formData.get("title") ?? ""),
      String(formData.get("meta_title") ?? ""),
      String(formData.get("meta_description") ?? ""),
      String(formData.get("hero_heading") ?? ""),
      String(formData.get("hero_subheading") ?? ""),
      String(formData.get("content") ?? ""),
      ...(image ? [image] : []),
      slug,
    ]
  );
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${slug}?saved=1`);
}

// ---------- categories ----------
export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const image = await saveUploadedImage(formData.get("image_file") as File | null);
  getDb()
    .prepare(
      `UPDATE categories SET name=?, icon=?, description=?, timeline=? ${image ? ", image=?" : ""} WHERE id=?`
    )
    .run(
      ...[
        String(formData.get("name") ?? ""),
        String(formData.get("icon") ?? ""),
        String(formData.get("description") ?? ""),
        String(formData.get("timeline") ?? ""),
        ...(image ? [image] : []),
        id,
      ]
    );
  revalidatePath("/", "layout");
  redirect(`/admin/categories?saved=1`);
}

// ---------- products ----------
export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const image = await saveUploadedImage(formData.get("image_file") as File | null);
  const minPrice = formData.get("min_price") ? Number(formData.get("min_price")) : null;
  const maxPrice = formData.get("max_price") ? Number(formData.get("max_price")) : null;
  getDb()
    .prepare(
      `UPDATE products SET name=?, standard=?, scheme=?, min_price=?, max_price=?, timeline=?,
       description=?, featured=?, meta_title=?, meta_description=?, hsn4=?, hsn8=?, qco_status=?, qco_order=?
       ${image ? ", image=?" : ""} WHERE id=?`
    )
    .run(
      ...[
        String(formData.get("name") ?? ""),
        String(formData.get("standard") ?? ""),
        String(formData.get("scheme") ?? "ISI"),
        minPrice,
        maxPrice,
        String(formData.get("timeline") ?? ""),
        String(formData.get("description") ?? ""),
        formData.get("featured") ? 1 : 0,
        String(formData.get("meta_title") ?? ""),
        String(formData.get("meta_description") ?? ""),
        String(formData.get("hsn4") ?? "").trim(),
        String(formData.get("hsn8") ?? "").trim(),
        String(formData.get("qco_status") ?? "").trim(),
        String(formData.get("qco_order") ?? "").trim(),
        ...(image ? [image] : []),
        id,
      ]
    );
  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}

export async function removeProductImage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  getDb().prepare("UPDATE products SET image='' WHERE id=?").run(id);
  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}

// ---------- faqs ----------
function withParam(url: string, param: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${param}`;
}

export async function saveFaq(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const scope = String(formData.get("scope") ?? "global");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sort = Number(formData.get("sort") ?? 0);
  const back = String(formData.get("back") ?? "/admin/faqs");
  if (!question || !answer) redirect(withParam(back, "error=1"));
  const db = getDb();
  if (id) {
    db.prepare("UPDATE faqs SET question=?, answer=?, sort=? WHERE id=?").run(
      question, answer, sort, id
    );
  } else {
    db.prepare("INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)").run(
      scope, question, answer, sort
    );
  }
  revalidatePath("/", "layout");
  redirect(withParam(back, "saved=1"));
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const back = String(formData.get("back") ?? "/admin/faqs");
  getDb().prepare("DELETE FROM faqs WHERE id=?").run(id);
  revalidatePath("/", "layout");
  redirect(withParam(back, "saved=1"));
}

// ---------- testimonials ----------
export async function saveTestimonial(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  if (!name || !quote) redirect("/admin/testimonials?error=1");
  const db = getDb();
  if (id) {
    db.prepare("UPDATE testimonials SET name=?, role=?, quote=?, rating=? WHERE id=?").run(
      name, role, quote, rating, id
    );
  } else {
    db.prepare("INSERT INTO testimonials (name, role, quote, rating) VALUES (?, ?, ?, ?)").run(
      name, role, quote, rating
    );
  }
  revalidatePath("/", "layout");
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  getDb().prepare("DELETE FROM testimonials WHERE id=?").run(Number(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/testimonials?saved=1");
}

// ---------- upcoming QCOs ----------
export async function saveQco(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const values = {
    product: String(formData.get("product") ?? "").trim(),
    ministry: String(formData.get("ministry") ?? "").trim(),
    hsn4: String(formData.get("hsn4") ?? "").trim(),
    hsn8: String(formData.get("hsn8") ?? "").trim(),
    standard: String(formData.get("standard") ?? "").trim(),
    enforcement_date: String(formData.get("enforcement_date") ?? "").trim(),
    scheme: String(formData.get("scheme") ?? "ISI").trim(),
  };
  if (!values.product) redirect("/admin/qcos?error=1");
  const db = getDb();
  if (id) {
    db.prepare(
      `UPDATE qcos SET product=@product, ministry=@ministry, hsn4=@hsn4, hsn8=@hsn8,
       standard=@standard, enforcement_date=@enforcement_date, scheme=@scheme WHERE id=@id`
    ).run({ ...values, id });
  } else {
    db.prepare(
      `INSERT INTO qcos (product, ministry, hsn4, hsn8, standard, enforcement_date, scheme)
       VALUES (@product, @ministry, @hsn4, @hsn8, @standard, @enforcement_date, @scheme)`
    ).run(values);
  }
  revalidatePath("/", "layout");
  redirect("/admin/qcos?saved=1");
}

export async function deleteQco(formData: FormData) {
  await requireAdmin();
  getDb().prepare("DELETE FROM qcos WHERE id=?").run(Number(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/qcos?saved=1");
}

// ---------- inquiries ----------
export async function setInquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "new");
  getDb().prepare("UPDATE inquiries SET status=? WHERE id=?").run(status, id);
  redirect("/admin/inquiries");
}
