"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getDb, setSetting } from "@/lib/db";
import {
  requireAdmin,
  clearAdminSession,
  changeAdminCredentials,
} from "@/lib/auth";
import { logAdminEvent } from "@/lib/admin-audit";

/** Revalidate after the redirect response so Save/Update feels snappy. */
function revalidateSoon(path: string, type?: "layout" | "page") {
  // Keep typeahead search + sitemap fresh when CMS content changes.
  void import("@/lib/search-index").then((m) => m.invalidateSearchIndex());
  void import("@/lib/sitemap-xml").then((m) => m.invalidateSitemapCache());
  after(() => {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  });
}

const PUBLIC_CACHE_PATHS = [
  "/",
  "/products",
  "/products/all",
  "/certifications",
  "/testing",
  "/labs",
  "/blog",
  "/contact",
  "/qco",
  "/search",
  "/sitemap",
  "/sitemap.xml",
  "/guide",
  "/about",
] as const;

/** Manual “Clear cache” from admin — force public pages to rebuild. */
export async function clearSiteCache(formData?: FormData) {
  await requireAdmin();
  const { clearGmarkCache } = await import("@/lib/gmark");
  clearGmarkCache();
  const { invalidateSearchIndex } = await import("@/lib/search-index");
  invalidateSearchIndex();
  const { invalidateSitemapCache } = await import("@/lib/sitemap-xml");
  invalidateSitemapCache();

  // Run synchronously so the Done confirmation means cache is already cleared.
  revalidatePath("/", "layout");
  for (const p of PUBLIC_CACHE_PATHS) {
    revalidatePath(p);
  }

  logAdminEvent("cache_cleared", "", "manual_clear_cache");
  const nextRaw = String(formData?.get("next") ?? "/admin/settings").trim();
  const next = nextRaw.startsWith("/admin") ? nextRaw.split("?")[0] : "/admin/settings";
  redirect(`${next}?cache=1`);
}

async function saveUploadedImage(
  file: File | null,
  allowedExts?: string[]
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const { DEFAULT_IMAGE_EXTS, detectImageType, sanitizeUploadBasename } = await import(
    "@/lib/image-upload"
  );
  const allow = new Set(allowedExts ?? DEFAULT_IMAGE_EXTS);
  // JPEG aliases map to canonical .jpg after detection
  if ([...allow].some((e) => [".jpg", ".jpeg", ".jpe", ".jfif", ".jp"].includes(e))) {
    allow.add(".jpg");
    allow.add(".jpeg");
    allow.add(".jpe");
    allow.add(".jfif");
    allow.add(".jp");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buf, file.name);
  if (!detected || !allow.has(detected.ext)) return null;

  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  // Always persist with the canonical lowercase extension from magic bytes
  // so /uploads/...jpg|.png|.webp|.gif|.avif serve with the right type.
  const name = `${Date.now()}-${sanitizeUploadBasename(file.name)}${detected.ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

async function saveUploadedMedia(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = path.extname(file.name).toLowerCase();
  const { HERO_MEDIA_EXTS } = await import("@/lib/hero-slides");
  if (!HERO_MEDIA_EXTS.includes(ext)) return null;
  const dir = path.join(process.cwd(), "public", "uploads", "hero");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/hero/${name}`;
}

export async function logout() {
  logAdminEvent("logout", "", "session_cleared");
  await clearAdminSession();
  redirect("/admin/login");
}

const LOGO_DEFAULTS = {
  logo_primary: "/brand/certko-logo.png",
  logo_on_dark: "/brand/certko-logo-light.png",
} as const;

const SECRET_SETTINGS = new Set(["smtp_pass", "admin_password", "admin_username"]);

// ---------- admin credentials ----------
export async function changeAdminLoginCredentials(formData: FormData) {
  await requireAdmin();
  const currentPassword = String(formData.get("current_password") ?? "");
  const newUsername = String(formData.get("new_username") ?? "").trim();
  const confirmUsername = String(formData.get("confirm_username") ?? "").trim();
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newUsername && newUsername !== confirmUsername) {
    redirect("/admin/account?error=user_match");
  }

  try {
    const result = await changeAdminCredentials({
      currentPassword,
      newUsername,
      newPassword,
      confirmPassword,
    });
    const detail = [
      result.usernameChanged ? "username" : "",
      result.passwordChanged ? "password" : "",
    ]
      .filter(Boolean)
      .join("+");
    logAdminEvent("credentials_changed", "", detail || "updated");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Current password")) redirect("/admin/account?error=current");
    if (msg.includes("do not match")) redirect("/admin/account?error=match");
    if (msg.includes("at least 8")) redirect("/admin/account?error=short");
    if (msg.includes("Login ID")) redirect("/admin/account?error=username");
    if (msg.includes("Enter a new")) redirect("/admin/account?error=empty");
    if (msg.includes("Nothing to update")) redirect("/admin/account?error=unchanged");
    redirect("/admin/account?error=1");
  }

  redirect("/admin/account?saved=1");
}

// ---------- settings ----------
export async function saveSettings(formData: FormData) {
  await requireAdmin();
  // Checkbox: hidden 0 + optional checked 1 — prefer enabled when present
  setSetting(
    "smtp_enabled",
    formData.getAll("smtp_enabled").map(String).includes("1") ? "1" : "0"
  );

  for (const [key, value] of formData.entries()) {
    if (
      typeof value === "string" &&
      !key.startsWith("$") &&
      !key.startsWith("clear_") &&
      !key.endsWith("_file") &&
      key !== "smtp_enabled" &&
      key !== "admin_password" &&
      key !== "admin_username" &&
      key !== "current_password" &&
      key !== "new_username" &&
      key !== "confirm_username" &&
      key !== "new_password" &&
      key !== "confirm_password"
    ) {
      // Keep existing secret if the password field is left blank
      if (SECRET_SETTINGS.has(key) && value.trim() === "") continue;
      setSetting(key, value);
    }
  }

  for (const key of Object.keys(LOGO_DEFAULTS) as Array<keyof typeof LOGO_DEFAULTS>) {
    const uploaded = await saveUploadedImage(formData.get(`${key}_file`) as File | null);
    if (uploaded) {
      setSetting(key, uploaded);
    } else if (formData.get(`clear_${key}`) === "1") {
      setSetting(key, LOGO_DEFAULTS[key]);
    }
  }

  // Keep invalid scheme values from breaking the public theme
  const scheme = String(formData.get("color_scheme") ?? "").trim();
  if (scheme) {
    const { isColorSchemeId, DEFAULT_COLOR_SCHEME } = await import("@/lib/color-schemes");
    setSetting("color_scheme", isColorSchemeId(scheme) ? scheme : DEFAULT_COLOR_SCHEME);
  }

  const iconStyle = String(formData.get("icon_style") ?? "").trim();
  if (iconStyle) {
    const { resolveIconStyle } = await import("@/lib/icon-style");
    setSetting("icon_style", resolveIconStyle(iconStyle));
  }

  const iconScale = String(formData.get("icon_scale") ?? "").trim();
  if (iconScale) {
    const { resolveIconScale } = await import("@/lib/icon-style");
    setSetting("icon_scale", resolveIconScale(iconScale));
  }

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

const SMTP_SETTING_KEYS = [
  "lead_notify_email",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from",
] as const;

export async function saveSmtpSettings(formData: FormData) {
  await requireAdmin();
  setSetting(
    "smtp_enabled",
    formData.getAll("smtp_enabled").map(String).includes("1") ? "1" : "0"
  );
  setSetting(
    "smtp_secure",
    formData.getAll("smtp_secure").map(String).includes("1") ? "1" : "0"
  );
  for (const key of SMTP_SETTING_KEYS) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    if (SECRET_SETTINGS.has(key) && value.trim() === "") continue;
    setSetting(key, value.trim());
  }
  revalidatePath("/admin/email");
  revalidatePath("/admin/settings");
  redirect("/admin/email?saved=1");
}

export async function sendTestLeadEmailAction() {
  await requireAdmin();
  const { sendTestLeadEmail } = await import("@/lib/mail");
  const result = await sendTestLeadEmail();
  revalidatePath("/admin/email");
  redirect(
    result.ok
      ? "/admin/email?mail=sent"
      : `/admin/email?mail=error&mail_error=${encodeURIComponent(result.error || "send failed")}`
  );
}

// ---------- pages ----------
function pageNavFlags(formData: FormData) {
  return {
    nav_menu: formData.getAll("nav_menu").map(String).includes("1") ? 1 : 0,
    nav_submenu: formData.getAll("nav_submenu").map(String).includes("1") ? 1 : 0,
    nav_footer: formData.getAll("nav_footer").map(String).includes("1") ? 1 : 0,
    nav_label: String(formData.get("nav_label") ?? "").trim(),
    nav_detail: String(formData.get("nav_detail") ?? "").trim(),
    nav_sort: Number(formData.get("nav_sort") ?? 0) || 0,
  };
}

export async function createPage(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const { isReservedPageSlug } = await import("@/lib/pages-nav");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/pages?error=1");

  const db = getDb();
  let slug = slugify(String(formData.get("slug") ?? "")) || slugify(title);
  if (!slug || isReservedPageSlug(slug)) redirect("/admin/pages?error=1");
  let candidate = slug;
  let n = 2;
  while (db.prepare("SELECT 1 FROM pages WHERE slug = ?").get(candidate) || isReservedPageSlug(candidate)) {
    candidate = `${slug}-${n++}`;
  }
  slug = candidate;
  const pageType =
    String(formData.get("page_type") ?? "content") === "landing" ? "landing" : "content";
  const nav = pageNavFlags(formData);
  // Advertising landings default to not in site nav (campaign URLs only).
  const navMenu = pageType === "landing" ? 0 : nav.nav_menu;
  const navSubmenu = pageType === "landing" ? 0 : nav.nav_submenu;
  const navFooter = pageType === "landing" ? 0 : nav.nav_footer;
  const ctaLabel =
    String(formData.get("cta_label") ?? "").trim() ||
    (pageType === "landing" ? "Get Expert Help" : "");
  const ctaHref =
    String(formData.get("cta_href") ?? "").trim() ||
    (pageType === "landing" ? "/contact" : "");
  const stub =
    pageType === "landing"
      ? `## Why this offer matters\n\nWrite the advertising pitch here using **Markdown**.\n\n## What clients receive\n\n- Benefit one\n- Benefit two\n\n## How it works\n\n1. Step one\n2. Step two\n\n[Get Expert Help](/contact)`
      : "Write your page content here using **Markdown**.";

  db.prepare(
    `INSERT INTO pages (
      slug, title, meta_title, meta_description, hero_heading, hero_subheading, content, image,
      nav_menu, nav_submenu, nav_footer, nav_label, nav_detail, nav_sort,
      page_type, cta_label, cta_href
    ) VALUES (?, ?, ?, '', ?, '', ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    slug,
    title,
    `${title} | Certko`,
    title,
    stub,
    navMenu,
    navSubmenu,
    navFooter,
    nav.nav_label || title,
    nav.nav_detail,
    nav.nav_sort,
    pageType,
    ctaLabel,
    ctaHref
  );

  revalidatePath("/", "layout");
  redirect(`/admin/pages/${slug}?saved=1`);
}

export async function savePage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const image = await saveUploadedImage(formData.get("image_file") as File | null);
  const db = getDb();
  const nav = pageNavFlags(formData);
  const pageType =
    String(formData.get("page_type") ?? "content") === "landing" ? "landing" : "content";
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  const ctaHref = String(formData.get("cta_href") ?? "").trim();
  db.prepare(
    `UPDATE pages SET title=?, meta_title=?, meta_description=?, hero_heading=?, hero_subheading=?, content=?,
     nav_menu=?, nav_submenu=?, nav_footer=?, nav_label=?, nav_detail=?, nav_sort=?,
     page_type=?, cta_label=?, cta_href=?
     ${image ? ", image=?" : ""} WHERE slug=?`
  ).run(
    ...[
      String(formData.get("title") ?? ""),
      String(formData.get("meta_title") ?? ""),
      String(formData.get("meta_description") ?? ""),
      String(formData.get("hero_heading") ?? ""),
      String(formData.get("hero_subheading") ?? ""),
      String(formData.get("content") ?? ""),
      nav.nav_menu,
      nav.nav_submenu,
      nav.nav_footer,
      nav.nav_label,
      nav.nav_detail,
      nav.nav_sort,
      pageType,
      ctaLabel,
      ctaHref,
      ...(image ? [image] : []),
      slug,
    ]
  );
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${slug}?saved=1`);
}

export async function deletePage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const protectedSlugs = new Set(["home", "contact", "privacy", "terms", "about", "guide"]);
  if (!slug || protectedSlugs.has(slug)) redirect("/admin/pages?error=1");
  getDb().prepare("DELETE FROM pages WHERE slug = ?").run(slug);
  revalidatePath("/", "layout");
  redirect("/admin/pages?saved=1");
}

// ---------- categories ----------
export async function createCategory(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/categories?error=1");
  const db = getDb();
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  let n = 2;
  while (db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(slug)) {
    slug = `${slugify(name)}-${n++}`;
  }
  const maxSort = (
    db.prepare("SELECT COALESCE(MAX(sort), 0) AS m FROM categories").get() as { m: number }
  ).m;
  const image = (await saveUploadedImage(formData.get("image_file") as File | null)) ?? "";
  const res = db
    .prepare(
      `INSERT INTO categories (slug, name, icon, description, image, timeline, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      name,
      String(formData.get("icon") ?? "box").trim() || "box",
      String(formData.get("description") ?? "").trim(),
      image,
      String(formData.get("timeline") ?? "8-16 weeks").trim() || "8-16 weeks",
      maxSort + 1
    );
  revalidatePath("/", "layout");
  redirect(`/admin/categories/${Number(res.lastInsertRowid)}?saved=1`);
}

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
export async function createProduct(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  if (!name || !categoryId) redirect("/admin/products?error=1");
  const db = getDb();
  const cat = db.prepare("SELECT id FROM categories WHERE id = ?").get(categoryId) as
    | { id: number }
    | undefined;
  if (!cat) redirect("/admin/products?error=1");
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  let n = 2;
  while (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    slug = `${slugify(name)}-${n++}`;
  }
  const minPrice = formData.get("min_price") ? Number(formData.get("min_price")) : null;
  const maxPrice = formData.get("max_price") ? Number(formData.get("max_price")) : null;
  const description = String(formData.get("description") ?? "").trim();
  const res = db
    .prepare(
      `INSERT INTO products (
        slug, name, standard, scheme, category_id, min_price, max_price, lab_count, timeline,
        description, image, featured, meta_title, meta_description, hsn4, hsn8, qco_status, qco_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, '', 0, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      name,
      String(formData.get("standard") ?? "").trim(),
      String(formData.get("scheme") ?? "ISI") || "ISI",
      categoryId,
      minPrice,
      maxPrice,
      String(formData.get("timeline") ?? "").trim(),
      description || `## About ${name}\n\nWrite the BIS compliance overview here.`,
      `${name} | BIS Certification | Certko`,
      description || `BIS certification details for ${name}.`,
      String(formData.get("hsn4") ?? "").trim(),
      String(formData.get("hsn8") ?? "").trim(),
      String(formData.get("qco_status") ?? "").trim(),
      String(formData.get("qco_order") ?? "").trim()
    );
  revalidatePath("/", "layout");
  redirect(`/admin/products/${Number(res.lastInsertRowid)}?saved=1`);
}

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

function syncProductLabCount(db: ReturnType<typeof getDb>, productId: number) {
  db.prepare(
    `UPDATE products
     SET lab_count = (SELECT COUNT(*) FROM product_labs WHERE product_id = ?)
     WHERE id = ?`
  ).run(productId, productId);
}

/** Attach a BIS-recognised lab to a product (dropdown). */
export async function addProductLab(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const labId = Number(formData.get("lab_id"));
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw) : null;
  if (!productId || !labId) redirect(`/admin/products/${productId || ""}?error=1`);
  const db = getDb();
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  const lab = db.prepare("SELECT id FROM labs WHERE id = ?").get(labId);
  if (!product || !lab) redirect(`/admin/products/${productId}?error=1`);
  db.prepare(
    `INSERT INTO product_labs (product_id, lab_id, price) VALUES (?, ?, ?)
     ON CONFLICT(product_id, lab_id) DO UPDATE SET price = excluded.price`
  ).run(productId, labId, Number.isFinite(price as number) ? price : null);
  syncProductLabCount(db, productId);
  revalidateSoon("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#product-labs`);
}

export async function removeProductLab(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const labId = Number(formData.get("lab_id"));
  if (!productId || !labId) redirect(`/admin/products/${productId || ""}?error=1`);
  const db = getDb();
  db.prepare("DELETE FROM product_labs WHERE product_id = ? AND lab_id = ?").run(
    productId,
    labId
  );
  syncProductLabCount(db, productId);
  revalidateSoon("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#product-labs`);
}

/** Attach a testing service to a product (dropdown). */
export async function addProductTesting(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const testingServiceId = Number(formData.get("testing_service_id"));
  if (!productId || !testingServiceId) {
    redirect(`/admin/products/${productId || ""}?error=1`);
  }
  const db = getDb();
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  const svc = db
    .prepare("SELECT id FROM testing_services WHERE id = ?")
    .get(testingServiceId);
  if (!product || !svc) redirect(`/admin/products/${productId}?error=1`);
  const sort = (
    db
      .prepare(
        "SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM product_testing_services WHERE product_id = ?"
      )
      .get(productId) as { n: number }
  ).n;
  db.prepare(
    `INSERT INTO product_testing_services (product_id, testing_service_id, sort)
     VALUES (?, ?, ?)
     ON CONFLICT(product_id, testing_service_id) DO NOTHING`
  ).run(productId, testingServiceId, sort);
  revalidateSoon("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#product-testing`);
}

export async function removeProductTesting(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const testingServiceId = Number(formData.get("testing_service_id"));
  if (!productId || !testingServiceId) {
    redirect(`/admin/products/${productId || ""}?error=1`);
  }
  getDb()
    .prepare(
      "DELETE FROM product_testing_services WHERE product_id = ? AND testing_service_id = ?"
    )
    .run(productId, testingServiceId);
  revalidateSoon("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#product-testing`);
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
  const featured = formData.getAll("featured").map(String).includes("1") ? 1 : 0;
  if (!name || !quote) redirect("/admin/testimonials?error=1");
  const db = getDb();
  if (id) {
    db.prepare(
      "UPDATE testimonials SET name=?, role=?, quote=?, rating=?, featured=? WHERE id=?"
    ).run(name, role, quote, rating, featured, id);
  } else {
    db.prepare(
      "INSERT INTO testimonials (name, role, quote, rating, featured) VALUES (?, ?, ?, ?, ?)"
    ).run(name, role, quote, rating, featured);
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

// ---------- certifications ----------
export async function createCertification(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/certifications?error=1");
  const db = getDb();
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  let n = 2;
  while (db.prepare("SELECT 1 FROM certifications WHERE slug = ?").get(slug)) {
    slug = `${slugify(name)}-${n++}`;
  }
  const maxSort = (
    db.prepare("SELECT COALESCE(MAX(sort), 0) AS m FROM certifications").get() as { m: number }
  ).m;
  const sortRaw = String(formData.get("sort") ?? "").trim();
  const sort = sortRaw ? Number(sortRaw) || maxSort + 1 : maxSort + 1;
  const image = (await saveUploadedImage(formData.get("image_file") as File | null)) ?? "";
  const summary = String(formData.get("summary") ?? "").trim();
  const content =
    String(formData.get("content") ?? "").trim() ||
    `## About ${name}\n\nWrite the certification overview here — what it covers, when it is mandatory, the process, and how Certko helps.`;
  const metaTitle =
    String(formData.get("meta_title") ?? "").trim() ||
    `${name} Certification | Process, Cost & Help | Certko`;
  const metaDescription = String(formData.get("meta_description") ?? "").trim() || summary;
  const res = db
    .prepare(
      `INSERT INTO certifications (slug, name, full_name, region, icon, summary, content, image, meta_title, meta_description, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      name,
      String(formData.get("full_name") ?? "").trim(),
      String(formData.get("region") ?? "").trim(),
      String(formData.get("icon") ?? "award").trim() || "award",
      summary,
      content,
      image,
      metaTitle,
      metaDescription,
      sort
    );
  const newId = Number(res.lastInsertRowid);
  // Starter FAQs so every new certification page has editable Q&A
  const insFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );
  [
    [
      `What products need ${name}?`,
      `Use the product catalogue on this page to see categories covered under ${name}. Add or edit products in Admin → Certifications.`,
    ],
    [
      "How can Certko help?",
      "Share your product, destination market and HS code via Contact / Get Expert Help — we map the right route, labs and timeline.",
    ],
  ].forEach(([q, a], i) => insFaq.run(`cert:${slug}`, q, a, i));

  revalidatePath("/", "layout");
  redirect(`/admin/certifications/${newId}?saved=1`);
}

/** One-click create for BEE, GMARK, SABER and other common programmes from seed presets. */
export async function createCertificationPreset(formData: FormData) {
  await requireAdmin();
  const { getCertificationPreset } = await import("@/lib/certification-presets");
  const presetSlug = String(formData.get("preset_slug") ?? "").trim();
  const preset = getCertificationPreset(presetSlug);
  if (!preset) redirect("/admin/certifications?error=1");
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM certifications WHERE slug = ?")
    .get(preset.slug) as { id: number } | undefined;
  if (existing) {
    redirect(`/admin/certifications/${existing.id}?saved=1`);
  }
  const maxSort = (
    db.prepare("SELECT COALESCE(MAX(sort), 0) AS m FROM certifications").get() as { m: number }
  ).m;
  const res = db
    .prepare(
      `INSERT INTO certifications (slug, name, full_name, region, icon, summary, content, image, meta_title, meta_description, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`
    )
    .run(
      preset.slug,
      preset.name,
      preset.full_name,
      preset.region,
      preset.icon,
      preset.summary,
      preset.content,
      `${preset.name} Certification | Process, Cost & Help | Certko`,
      preset.summary.slice(0, 155),
      maxSort + 1
    );
  const newId = Number(res.lastInsertRowid);
  const insFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );
  (preset.faqs || []).forEach((f, i) =>
    insFaq.run(`cert:${preset.slug}`, f.question, f.answer, i)
  );
  revalidatePath("/", "layout");
  redirect(`/admin/certifications/${newId}?saved=1`);
}

export async function deleteCertification(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const db = getDb();
  const cert = db.prepare("SELECT slug FROM certifications WHERE id = ?").get(id) as
    | { slug: string }
    | undefined;
  if (cert) {
    db.prepare("DELETE FROM faqs WHERE scope = ?").run(`cert:${cert.slug}`);
    db.prepare("DELETE FROM cert_products WHERE certification_id = ?").run(id);
    db.prepare("DELETE FROM certifications WHERE id = ?").run(id);
  }
  revalidatePath("/", "layout");
  redirect("/admin/certifications?saved=1");
}

export async function saveCertification(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const id = Number(formData.get("id"));
  const db = getDb();
  const current = db.prepare("SELECT slug, image FROM certifications WHERE id = ?").get(id) as
    | { slug: string; image: string }
    | undefined;
  if (!current) redirect("/admin/certifications?error=1");

  let slug = slugify(String(formData.get("slug") ?? "").trim() || current.slug);
  const clash = db
    .prepare("SELECT id FROM certifications WHERE slug = ? AND id != ?")
    .get(slug, id) as { id: number } | undefined;
  if (clash) slug = `${slug}-${id}`;

  const uploaded = await saveUploadedImage(formData.get("image_file") as File | null);
  const clearImage = formData.get("clear_image") === "1";
  const image = uploaded ?? (clearImage ? "" : current.image);
  const sort = Number(formData.get("sort") ?? 0) || 0;

  db.prepare(
    `UPDATE certifications SET slug=?, name=?, full_name=?, region=?, icon=?, summary=?, content=?, image=?, meta_title=?, meta_description=?, sort=?
     WHERE id=?`
  ).run(
    slug,
    String(formData.get("name") ?? ""),
    String(formData.get("full_name") ?? ""),
    String(formData.get("region") ?? ""),
    String(formData.get("icon") ?? "award"),
    String(formData.get("summary") ?? ""),
    String(formData.get("content") ?? ""),
    image,
    String(formData.get("meta_title") ?? ""),
    String(formData.get("meta_description") ?? ""),
    sort,
    id
  );

  if (current.slug !== slug) {
    db.prepare("UPDATE faqs SET scope = ? WHERE scope = ?").run(
      `cert:${slug}`,
      `cert:${current.slug}`
    );
  }

  revalidatePath("/", "layout");
  redirect(`/admin/certifications/${id}?saved=1`);
}

export async function saveCertProduct(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const certificationId = Number(formData.get("certification_id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !certificationId) {
    redirect(`/admin/certifications/${certificationId || ""}?error=1`);
  }
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const uploaded = await saveUploadedImage(formData.get("image_file") as File | null);
  const clearImage = formData.get("clear_image") === "1";
  const minPrice = formData.get("min_price") ? Number(formData.get("min_price")) : null;
  const maxPrice = formData.get("max_price") ? Number(formData.get("max_price")) : null;
  const values = {
    certification_id: certificationId,
    slug,
    name,
    family: String(formData.get("family") ?? "").trim(),
    regime: String(formData.get("regime") ?? "").trim(),
    standards: String(formData.get("standards") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    labs: String(formData.get("labs") ?? "").trim(),
    fee_note: String(formData.get("fee_note") ?? "").trim(),
    extras: String(formData.get("extras") ?? "{}").trim() || "{}",
    min_price: Number.isFinite(minPrice as number) ? minPrice : null,
    max_price: Number.isFinite(maxPrice as number) ? maxPrice : null,
    sort: Number(formData.get("sort") ?? 0) || 0,
  };

  let savedId = id;
  if (id) {
    const current = db.prepare("SELECT image, slug FROM cert_products WHERE id = ?").get(id) as
      | { image: string; slug: string }
      | undefined;
    const image = uploaded ?? (clearImage ? "" : current?.image ?? "");
    const clash = db
      .prepare(
        "SELECT id FROM cert_products WHERE certification_id = ? AND slug = ? AND id != ?"
      )
      .get(certificationId, slug, id);
    if (clash) slug = `${slug}-${id}`;
    db.prepare(
      `UPDATE cert_products SET certification_id=?, slug=?, name=?, family=?, regime=?, standards=?, summary=?, content=?, image=?,
        min_price=?, max_price=?, labs=?, fee_note=?, extras=?, sort=? WHERE id=?`
    ).run(
      certificationId,
      slug,
      values.name,
      values.family,
      values.regime,
      values.standards,
      values.summary,
      values.content,
      image,
      values.min_price,
      values.max_price,
      values.labs,
      values.fee_note,
      values.extras,
      values.sort,
      id
    );
  } else {
    let n = 2;
    while (
      db
        .prepare("SELECT 1 FROM cert_products WHERE certification_id = ? AND slug = ?")
        .get(certificationId, slug)
    ) {
      slug = `${slugify(name)}-${n++}`;
    }
    const content =
      values.content ||
      `## ${name}\n\nProducts covered under this certification. Edit this writeup with scope, standards and process notes.`;
    const res = db
      .prepare(
        `INSERT INTO cert_products
        (certification_id, slug, name, family, regime, standards, summary, content, image, min_price, max_price, labs, fee_note, extras, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        certificationId,
        slug,
        values.name,
        values.family,
        values.regime,
        values.standards,
        values.summary,
        content,
        uploaded ?? "",
        values.min_price,
        values.max_price,
        values.labs,
        values.fee_note,
        values.extras,
        values.sort
      );
    savedId = Number(res.lastInsertRowid);
  }
  revalidatePath("/", "layout");
  const returnTo = String(formData.get("return_to") ?? "").trim();
  if (returnTo === "list") {
    redirect("/admin/certifications?saved=1");
  }
  // Full product list page for this certification (keep edited row expanded)
  const editQs = savedId ? `&edit=${savedId}` : "";
  const hash = savedId ? `#product-${savedId}` : "";
  if (
    returnTo === "products" ||
    returnTo === "cert" ||
    returnTo === "expand" ||
    returnTo === ""
  ) {
    redirect(
      `/admin/certifications/${certificationId}/products?saved=1${editQs}${hash}`
    );
  }
  redirect(`/admin/certifications/${certificationId}/products?saved=1${editQs}${hash}`);
}

export async function deleteCertProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const certificationId = Number(formData.get("certification_id"));
  getDb().prepare("DELETE FROM cert_products WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect(`/admin/certifications/${certificationId}/products?saved=1`);
}

export async function saveEntityImage(formData: FormData) {
  await requireAdmin();
  const entity = String(formData.get("entity") ?? "");
  const id = String(formData.get("id") ?? "");
  const uploaded = await saveUploadedImage(formData.get("image_file") as File | null);
  const clearImage = formData.get("clear_image") === "1";
  const db = getDb();

  if (entity === "page") {
    const current = db.prepare("SELECT image FROM pages WHERE slug = ?").get(id) as
      | { image: string }
      | undefined;
    const image = uploaded ?? (clearImage ? "" : current?.image ?? "");
    db.prepare("UPDATE pages SET image = ? WHERE slug = ?").run(image, id);
  } else if (entity === "category") {
    const current = db.prepare("SELECT image FROM categories WHERE id = ?").get(Number(id)) as
      | { image: string }
      | undefined;
    const image = uploaded ?? (clearImage ? "" : current?.image ?? "");
    db.prepare("UPDATE categories SET image = ? WHERE id = ?").run(image, Number(id));
  } else if (entity === "cert") {
    const current = db.prepare("SELECT image FROM certifications WHERE id = ?").get(Number(id)) as
      | { image: string }
      | undefined;
    const image = uploaded ?? (clearImage ? "" : current?.image ?? "");
    db.prepare("UPDATE certifications SET image = ? WHERE id = ?").run(image, Number(id));
  } else if (entity === "product") {
    const current = db.prepare("SELECT image FROM products WHERE id = ?").get(Number(id)) as
      | { image: string }
      | undefined;
    const image = uploaded ?? (clearImage ? "" : current?.image ?? "");
    db.prepare("UPDATE products SET image = ? WHERE id = ?").run(image, Number(id));
  }

  revalidatePath("/", "layout");
  redirect("/admin/media?saved=1");
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

// ---------- authors ----------
function resolveAuthorFromForm(formData: FormData): { id: number; name: string } {
  const db = getDb();
  const authorId = Number(formData.get("author_id"));
  if (authorId) {
    const row = db.prepare("SELECT id, name FROM authors WHERE id = ?").get(authorId) as
      | { id: number; name: string }
      | undefined;
    if (row) return row;
  }
  const fallback = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (fallback) return fallback;
  const res = db
    .prepare(
      `INSERT INTO authors (slug, name, title, bio) VALUES ('certko-team', 'Certko Team', 'Compliance consultants', '')`
    )
    .run();
  return { id: Number(res.lastInsertRowid), name: "Certko Team" };
}

export async function saveAuthor(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/authors?error=1");

  const db = getDb();
  let slug = slugify(String(formData.get("slug") ?? "")) || slugify(name);
  let candidate = slug;
  let n = 2;
  while (
    db
      .prepare(
        id
          ? "SELECT 1 FROM authors WHERE slug = ? AND id != ?"
          : "SELECT 1 FROM authors WHERE slug = ?"
      )
      .get(...(id ? [candidate, id] : [candidate]))
  ) {
    candidate = `${slug}-${n++}`;
  }
  slug = candidate;

  const image = await saveUploadedImage(formData.get("image_file") as File | null);
  const values = {
    slug,
    name,
    title: String(formData.get("title") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };

  if (id) {
    const existing = db.prepare("SELECT image FROM authors WHERE id = ?").get(id) as
      | { image: string }
      | undefined;
    if (!existing) redirect("/admin/authors");
    let nextImage = existing.image;
    if (image) nextImage = image;
    else if (formData.get("clear_image") === "1") nextImage = "";
    db.prepare(
      `UPDATE authors SET slug=@slug, name=@name, title=@title, bio=@bio, email=@email, image=@image WHERE id=@id`
    ).run({ ...values, image: nextImage, id });
    db.prepare("UPDATE posts SET author = ? WHERE author_id = ?").run(name, id);
    revalidatePath("/", "layout");
    redirect(`/admin/authors/${id}?saved=1`);
  }

  const res = db
    .prepare(
      `INSERT INTO authors (slug, name, title, bio, email, image)
       VALUES (@slug, @name, @title, @bio, @email, @image)`
    )
    .run({ ...values, image: image || "" });
  revalidatePath("/", "layout");
  redirect(`/admin/authors/${Number(res.lastInsertRowid)}?saved=1`);
}

export async function deleteAuthor(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS n FROM authors").get() as { n: number }).n;
  if (total <= 1) redirect("/admin/authors?error=1");

  const fallback = db
    .prepare("SELECT id, name FROM authors WHERE id != ? ORDER BY sort, id LIMIT 1")
    .get(id) as { id: number; name: string } | undefined;
  if (fallback) {
    db.prepare("UPDATE posts SET author_id = ?, author = ? WHERE author_id = ?").run(
      fallback.id,
      fallback.name,
      id
    );
  }
  db.prepare("DELETE FROM authors WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/admin/authors?saved=1");
}

// ---------- blog posts ----------
export async function createPost(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/blog?error=1");
  const db = getDb();
  let slug = slugify(title);
  let n = 2;
  while (db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug)) {
    slug = `${slugify(title)}-${n++}`;
  }
  const author = resolveAuthorFromForm(formData);
  const res = db
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, author, author_id, status, meta_title, meta_description)
       VALUES (?, ?, '', 'Write your post here using **Markdown** — ## headings, lists, links and tables are supported.', ?, ?, 'draft', ?, '')`
    )
    .run(slug, title, author.name, author.id, `${title} | Certko Blog`);
  redirect(`/admin/blog/${Number(res.lastInsertRowid)}?saved=1`);
}

export async function savePost(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const id = Number(formData.get("id"));
  const { BLOG_COVER_EXTS } = await import("@/lib/image-upload");
  const uploaded = await saveUploadedImage(
    formData.get("image_file") as File | null,
    BLOG_COVER_EXTS
  );
  const clearImage = formData.get("clear_image") === "1";
  const db = getDb();
  const existing = db
    .prepare("SELECT slug, status, published_at, image FROM posts WHERE id = ?")
    .get(id) as
    | { slug: string; status: string; published_at: string | null; image: string | null }
    | undefined;
  if (!existing) redirect("/admin/blog");

  let slug = slugify(String(formData.get("slug") ?? "")) || existing.slug;
  if (slug !== existing.slug) {
    let candidate = slug;
    let n = 2;
    while (db.prepare("SELECT 1 FROM posts WHERE slug = ? AND id != ?").get(candidate, id)) {
      candidate = `${slug}-${n++}`;
    }
    slug = candidate;
  }
  const { resolveBlogScheduleState } = await import("@/lib/blog-scheduler");
  const schedule = resolveBlogScheduleState({
    requestedStatus: String(formData.get("status") ?? "draft"),
    publishAtRaw: String(formData.get("publish_at") ?? ""),
    existingPublishedAt: existing.published_at,
  });
  if (schedule.error === "schedule_required") {
    redirect(`/admin/blog/${id}?error=schedule_required`);
  }
  const status = schedule.status;
  const publishedAt = schedule.publishedAt;
  const author = resolveAuthorFromForm(formData);

  let nextImage = existing.image ?? "";
  if (uploaded) nextImage = uploaded;
  else if (clearImage) nextImage = "";

  db.prepare(
    `UPDATE posts SET slug=?, title=?, excerpt=?, content=?, author=?, author_id=?, status=?, published_at=?,
     meta_title=?, meta_description=?, image=? WHERE id=?`
  ).run(
    slug,
    String(formData.get("title") ?? "").trim(),
    String(formData.get("excerpt") ?? "").trim(),
    String(formData.get("content") ?? ""),
    author.name,
    author.id,
    status,
    publishedAt,
    String(formData.get("meta_title") ?? "").trim(),
    String(formData.get("meta_description") ?? "").trim(),
    nextImage,
    id
  );
  revalidatePath("/", "layout");
  redirect(`/admin/blog/${id}?saved=1`);
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(Number(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/blog?saved=1");
}

// ---------- SEO tools ----------
export async function saveSeo(formData: FormData) {
  await requireAdmin();
  const { saveSeoMeta } = await import("@/lib/seo");
  const { slugify } = await import("@/lib/format");
  const entity = String(formData.get("entity") ?? "");
  const [kind, id] = entity.split(":");
  if (!kind || !id) redirect("/admin/seo");

  saveSeoMeta(entity, {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    focus_keyword: String(formData.get("focus_keyword") ?? "").trim(),
    secondary_keywords: String(formData.get("secondary_keywords") ?? "").trim(),
    og_title: String(formData.get("og_title") ?? "").trim(),
    og_description: String(formData.get("og_description") ?? "").trim(),
    og_image: String(formData.get("og_image") ?? "").trim(),
    canonical: String(formData.get("canonical") ?? "").trim(),
    robots_index: formData.get("robots_index") ? 1 : 0,
    robots_follow: formData.get("robots_follow") ? 1 : 0,
    robots_noarchive: formData.get("robots_noarchive") ? 1 : 0,
    robots_nosnippet: formData.get("robots_nosnippet") ? 1 : 0,
    sitemap_include: formData.get("sitemap_include") ? 1 : 0,
    schema_types: JSON.stringify(formData.getAll("schema_types").map(String)),
  });

  // slug update for slug-editable entities
  const newSlug = slugify(String(formData.get("slug") ?? ""));
  const db = getDb();
  const tables: Record<string, string> = {
    product: "products",
    category: "categories",
    cert: "certifications",
    testcat: "testing_categories",
    test: "testing_services",
  };
  const table = tables[kind];
  if (table && newSlug) {
    const current = db
      .prepare(`SELECT slug FROM ${table} WHERE id = ?`)
      .get(Number(id)) as { slug: string } | undefined;
    if (current && current.slug !== newSlug) {
      const taken = db
        .prepare(`SELECT 1 FROM ${table} WHERE slug = ? AND id != ?`)
        .get(newSlug, Number(id));
      if (!taken) {
        db.prepare(`UPDATE ${table} SET slug = ? WHERE id = ?`).run(newSlug, Number(id));
      }
    }
  }

  revalidatePath("/", "layout");
  redirect(`/admin/seo/edit?entity=${encodeURIComponent(entity)}&saved=1`);
}

// ---------- inquiries ----------
export async function setInquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "new");
  getDb().prepare("UPDATE inquiries SET status=? WHERE id=?").run(status, id);
  redirect("/admin/inquiries?saved=1");
}

// ---------- product testing ----------
export async function createTestingCategory(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/testing?error=1");
  const db = getDb();
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  let n = 2;
  while (db.prepare("SELECT 1 FROM testing_categories WHERE slug = ?").get(slug)) {
    slug = `${slugify(name)}-${n++}`;
  }
  const maxSort = (
    db.prepare("SELECT COALESCE(MAX(sort), 0) AS m FROM testing_categories").get() as { m: number }
  ).m;
  const sortRaw = String(formData.get("sort") ?? "").trim();
  const sort = sortRaw ? Number(sortRaw) || maxSort + 1 : maxSort + 1;
  const image = (await saveUploadedImage(formData.get("image_file") as File | null)) ?? "";
  const summary = String(formData.get("summary") ?? "").trim();
  const content =
    String(formData.get("content") ?? "").trim() ||
    `## About ${name}\n\nDescribe the testing category, typical products, standards and how Certko helps arrange accredited labs.`;
  const metaTitle =
    String(formData.get("meta_title") ?? "").trim() ||
    `${name} | Product Testing Services | Certko`;
  const metaDescription = String(formData.get("meta_description") ?? "").trim() || summary;
  const res = db
    .prepare(
      `INSERT INTO testing_categories (slug, name, icon, summary, content, image, meta_title, meta_description, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      name,
      String(formData.get("icon") ?? "microscope").trim() || "microscope",
      summary,
      content,
      image,
      metaTitle,
      metaDescription,
      sort
    );
  revalidatePath("/", "layout");
  redirect(`/admin/testing/${Number(res.lastInsertRowid)}?saved=1`);
}

export async function deleteTestingCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const db = getDb();
  const cat = db.prepare("SELECT slug FROM testing_categories WHERE id = ?").get(id) as
    | { slug: string }
    | undefined;
  if (cat) {
    const services = db
      .prepare("SELECT id FROM testing_services WHERE category_id = ?")
      .all(id) as { id: number }[];
    for (const s of services) {
      db.prepare("DELETE FROM faqs WHERE scope = ?").run(`test:${s.id}`);
      db.prepare("DELETE FROM seo_meta WHERE entity = ?").run(`test:${s.id}`);
    }
    db.prepare("DELETE FROM faqs WHERE scope = ?").run(`testcat:${cat.slug}`);
    db.prepare("DELETE FROM seo_meta WHERE entity = ?").run(`testcat:${id}`);
    db.prepare("DELETE FROM testing_services WHERE category_id = ?").run(id);
    db.prepare("DELETE FROM testing_categories WHERE id = ?").run(id);
  }
  revalidatePath("/", "layout");
  redirect("/admin/testing?saved=1");
}

export async function saveTestingCategory(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const id = Number(formData.get("id"));
  const db = getDb();
  const current = db.prepare("SELECT slug, image FROM testing_categories WHERE id = ?").get(id) as
    | { slug: string; image: string }
    | undefined;
  if (!current) redirect("/admin/testing?error=1");

  let slug = slugify(String(formData.get("slug") ?? "").trim() || current.slug);
  const clash = db
    .prepare("SELECT id FROM testing_categories WHERE slug = ? AND id != ?")
    .get(slug, id) as { id: number } | undefined;
  if (clash) slug = `${slug}-${id}`;

  const uploaded = await saveUploadedImage(formData.get("image_file") as File | null);
  const clearImage = formData.get("clear_image") === "1";
  const image = uploaded ?? (clearImage ? "" : current.image);
  const sort = Number(formData.get("sort") ?? 0) || 0;

  db.prepare(
    `UPDATE testing_categories SET slug=?, name=?, icon=?, summary=?, content=?, image=?, meta_title=?, meta_description=?, sort=?
     WHERE id=?`
  ).run(
    slug,
    String(formData.get("name") ?? ""),
    String(formData.get("icon") ?? "microscope"),
    String(formData.get("summary") ?? ""),
    String(formData.get("content") ?? ""),
    image,
    String(formData.get("meta_title") ?? ""),
    String(formData.get("meta_description") ?? ""),
    sort,
    id
  );

  if (current.slug !== slug) {
    db.prepare("UPDATE faqs SET scope = ? WHERE scope = ?").run(
      `testcat:${slug}`,
      `testcat:${current.slug}`
    );
  }

  revalidatePath("/", "layout");
  redirect(`/admin/testing/${id}?saved=1`);
}

export async function saveTestingService(formData: FormData) {
  await requireAdmin();
  const { slugify } = await import("@/lib/format");
  const db = getDb();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const categoryId = Number(formData.get("category_id"));
  const name = String(formData.get("name") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "").trim();
  if (!name || !categoryId) {
    redirect(categoryId ? `/admin/testing/${categoryId}?error=1` : "/admin/testing?error=1");
  }
  const catExists = db.prepare("SELECT id FROM testing_categories WHERE id = ?").get(categoryId);
  if (!catExists) redirect("/admin/testing?error=1");

  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const uploaded = await saveUploadedImage(formData.get("image_file") as File | null);
  const clearImage = formData.get("clear_image") === "1";
  const values = {
    category_id: categoryId,
    name,
    product_category: String(formData.get("product_category") ?? "").trim(),
    standards: String(formData.get("standards") ?? "").trim(),
    test_type: String(formData.get("test_type") ?? "").trim(),
    accreditation:
      String(formData.get("accreditation") ?? "").trim() || "ISO/IEC 17025 / NABL",
    timeline: String(formData.get("timeline") ?? "").trim(),
    sample_size: String(formData.get("sample_size") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    meta_title: String(formData.get("meta_title") ?? "").trim(),
    meta_description: String(formData.get("meta_description") ?? "").trim(),
    sort: Number(formData.get("sort") ?? 0) || 0,
  };

  let savedId = id;
  if (id) {
    const current = db
      .prepare("SELECT image, slug, category_id FROM testing_services WHERE id = ?")
      .get(id) as { image: string; slug: string; category_id: number } | undefined;
    if (!current) redirect(`/admin/testing/${categoryId}?error=1`);
    const image = uploaded ?? (clearImage ? "" : current.image ?? "");
    const clash = db
      .prepare("SELECT id FROM testing_services WHERE category_id = ? AND slug = ? AND id != ?")
      .get(categoryId, slug, id);
    if (clash) slug = `${slug}-${id}`;
    db.prepare(
      `UPDATE testing_services SET category_id=?, slug=?, name=?, product_category=?, standards=?, test_type=?, accreditation=?,
        timeline=?, sample_size=?, summary=?, content=?, image=?, meta_title=?, meta_description=?, sort=? WHERE id=?`
    ).run(
      categoryId,
      slug,
      values.name,
      values.product_category,
      values.standards,
      values.test_type,
      values.accreditation,
      values.timeline,
      values.sample_size,
      values.summary,
      values.content,
      image,
      values.meta_title,
      values.meta_description,
      values.sort,
      id
    );
  } else {
    const clash = db
      .prepare("SELECT id FROM testing_services WHERE category_id = ? AND slug = ?")
      .get(categoryId, slug);
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    const image = uploaded ?? "";
    const res = db
      .prepare(
        `INSERT INTO testing_services
        (category_id, slug, name, product_category, standards, test_type, accreditation, timeline, sample_size, summary, content, image, meta_title, meta_description, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        categoryId,
        slug,
        values.name,
        values.product_category,
        values.standards,
        values.test_type,
        values.accreditation,
        values.timeline || "7–15 working days",
        values.sample_size || "As advised by the testing laboratory",
        values.summary,
        values.content ||
          `## ${values.name}\n\nDescribe the test method, sample requirements, turnaround and how Certko helps.`,
        image,
        values.meta_title || `${values.name} Testing | Certko`,
        values.meta_description || values.summary,
        values.sort
      );
    savedId = Number(res.lastInsertRowid);
    const starterFaqs = [
      [
        `What does “${values.name}” cover?`,
        `${values.name} covers the key parameters for this test${
          values.standards ? ` under ${values.standards}` : ""
        }. Edit this FAQ in admin with your exact scope notes.`,
      ],
      [
        "Which accreditation applies?",
        `This scope is typically run in ${values.accreditation} accredited laboratories. Confirm the exact lab and NABL scope on your quotation.`,
      ],
      [
        "How do I get a quote?",
        "Use Contact / Get Expert Help with your product details for a mapped lab quote.",
      ],
    ];
    const insFaq = db.prepare(
      "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
    );
    starterFaqs.forEach(([q, a], i) => insFaq.run(`test:${savedId}`, q, a, i));
  }

  revalidatePath("/", "layout");
  if (returnTo === "list" || returnTo === "/admin/testing") {
    redirect("/admin/testing?saved=1");
  }
  if (savedId) {
    redirect(`/admin/testing/service/${savedId}?saved=1`);
  }
  redirect(`/admin/testing/${categoryId}?saved=1`);
}

export async function deleteTestingService(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("category_id"));
  const db = getDb();
  db.prepare("DELETE FROM faqs WHERE scope = ?").run(`test:${id}`);
  db.prepare("DELETE FROM seo_meta WHERE entity = ?").run(`test:${id}`);
  db.prepare("DELETE FROM testing_services WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect(`/admin/testing/${categoryId}?saved=1`);
}

// ---------- hero slider ----------
export async function saveHeroSlide(formData: FormData) {
  await requireAdmin();
  const { mediaTypeFromPath } = await import("@/lib/hero-slides");
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const mediaUpload = await saveUploadedMedia(formData.get("media_file") as File | null);
  const posterUpload = await saveUploadedImage(formData.get("poster_file") as File | null);
  const db = getDb();

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const link_href = String(formData.get("link_href") ?? "").trim();
  const link_label = String(formData.get("link_label") ?? "").trim();
  const duration_ms = Math.max(2000, Number(formData.get("duration_ms") ?? 6000) || 6000);
  const sort = Number(formData.get("sort") ?? 0) || 0;
  const active = formData.getAll("active").map(String).includes("1") ? 1 : 0;

  if (id) {
    const existing = db.prepare("SELECT media, poster, media_type FROM hero_slides WHERE id = ?").get(id) as
      | { media: string; poster: string; media_type: string }
      | undefined;
    if (!existing) redirect("/admin/hero");
    let media = existing.media;
    let poster = existing.poster;
    if (mediaUpload) media = mediaUpload;
    else if (formData.get("clear_media") === "1") media = "";
    if (posterUpload) poster = posterUpload;
    else if (formData.get("clear_poster") === "1") poster = "";
    const media_type = media ? mediaTypeFromPath(media) : existing.media_type;
    db.prepare(
      `UPDATE hero_slides SET title=?, subtitle=?, media=?, media_type=?, poster=?, link_href=?, link_label=?,
       duration_ms=?, active=?, sort=? WHERE id=?`
    ).run(title, subtitle, media, media_type, poster, link_href, link_label, duration_ms, active, sort, id);
    revalidatePath("/", "layout");
    redirect(`/admin/hero?saved=1`);
  }

  if (!mediaUpload) redirect("/admin/hero?error=1");
  db.prepare(
    `INSERT INTO hero_slides (title, subtitle, media, media_type, poster, link_href, link_label, duration_ms, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    title,
    subtitle,
    mediaUpload,
    mediaTypeFromPath(mediaUpload),
    posterUpload || "",
    link_href,
    link_label,
    duration_ms,
    active,
    sort
  );
  revalidatePath("/", "layout");
  redirect("/admin/hero?saved=1");
}

export async function deleteHeroSlide(formData: FormData) {
  await requireAdmin();
  getDb().prepare("DELETE FROM hero_slides WHERE id = ?").run(Number(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/hero?saved=1");
}

// ---------- bulk excel import ----------
export async function bulkImportEntity(formData: FormData) {
  await requireAdmin();
  const { getBulkEntity, parseWorkbook, importBulkRows } = await import("@/lib/bulk-import");
  const entity = String(formData.get("entity") ?? "") as import("@/lib/bulk-import").BulkEntity;
  const def = getBulkEntity(entity);
  if (!def) {
    return { ok: false as const, created: 0, updated: 0, skipped: 0, errors: ["Unknown entity"] };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false as const,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: ["Please choose an .xlsx file"],
    };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
    return {
      ok: false as const,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: ["File must be .xlsx, .xls or .csv"],
    };
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = parseWorkbook(buffer);
    if (!rows.length) {
      return {
        ok: false as const,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: ["No data rows found — keep the header row and add your rows below the example"],
      };
    }
    const result = importBulkRows(entity, rows);
    revalidatePath("/", "layout");
    return { ok: true as const, ...result };
  } catch (err) {
    return {
      ok: false as const,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [err instanceof Error ? err.message : "Could not read spreadsheet"],
    };
  }
}
