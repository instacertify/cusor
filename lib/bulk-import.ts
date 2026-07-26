import * as XLSX from "xlsx";
import { getDb } from "./db";
import { slugify } from "./format";

export type BulkEntity =
  | "testimonials"
  | "certifications"
  | "cert_products"
  | "testing_categories"
  | "testing_services"
  | "categories"
  | "products"
  | "qcos"
  | "authors"
  | "posts"
  | "faqs"
  | "pages";

export type BulkColumn = {
  key: string;
  header: string;
  required?: boolean;
  example: string | number;
};

export type BulkEntityDef = {
  id: BulkEntity;
  label: string;
  description: string;
  adminHref: string;
  group: string;
  columns: BulkColumn[];
};

export const BULK_ENTITIES: BulkEntityDef[] = [
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Trust quotes — featured ones rotate randomly across the site",
    adminHref: "/admin/testimonials",
    group: "Site & brand",
    columns: [
      { key: "name", header: "name", required: true, example: "Anita Sharma" },
      { key: "role", header: "role", example: "Export Manager, Noida" },
      { key: "quote", header: "quote", required: true, example: "Certko helped us map BIS CRS in days." },
      { key: "rating", header: "rating", example: 5 },
      { key: "featured", header: "featured", example: 1 },
    ],
  },
  {
    id: "pages",
    label: "CMS Pages",
    description: "Custom pages (menu / submenu / footer placement)",
    adminHref: "/admin/pages",
    group: "Site & brand",
    columns: [
      { key: "title", header: "title", required: true, example: "BIS Marking Fee Guide" },
      { key: "slug", header: "slug", example: "bis-marking-fee-guide" },
      { key: "hero_heading", header: "hero_heading", example: "BIS Marking Fee Guide" },
      { key: "hero_subheading", header: "hero_subheading", example: "What to budget before you apply." },
      { key: "content", header: "content", example: "## Overview\n\nWrite the page in Markdown." },
      { key: "meta_title", header: "meta_title", example: "BIS Marking Fee Guide | Certko" },
      { key: "meta_description", header: "meta_description", example: "Practical marking fee notes for ISI applications." },
      { key: "nav_menu", header: "nav_menu", example: 0 },
      { key: "nav_submenu", header: "nav_submenu", example: 1 },
      { key: "nav_footer", header: "nav_footer", example: 0 },
      { key: "nav_label", header: "nav_label", example: "Marking fees" },
      { key: "nav_sort", header: "nav_sort", example: 10 },
    ],
  },
  {
    id: "faqs",
    label: "FAQs",
    description: "FAQ rows by scope (global, page:*, testcat:slug, test:ID, etc.)",
    adminHref: "/admin/faqs",
    group: "Site & brand",
    columns: [
      { key: "scope", header: "scope", required: true, example: "global" },
      { key: "question", header: "question", required: true, example: "How long does BIS take?" },
      { key: "answer", header: "answer", required: true, example: "Typically 8–16 weeks depending on the scheme and lab queue." },
      { key: "sort", header: "sort", example: 1 },
    ],
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "BIS, BEE, GMARK and other schemes",
    adminHref: "/admin/certifications",
    group: "Catalogue",
    columns: [
      { key: "name", header: "name", required: true, example: "BIS CRS" },
      { key: "slug", header: "slug", example: "bis-crs" },
      { key: "full_name", header: "full_name", example: "Compulsory Registration Scheme" },
      { key: "region", header: "region", example: "India" },
      { key: "icon", header: "icon", example: "award" },
      { key: "summary", header: "summary", example: "Mandatory registration for notified electronics." },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "cert_products",
    label: "Certification products",
    description: "Catalogue products under a certification (certification_slug required)",
    adminHref: "/admin/certifications",
    group: "Catalogue",
    columns: [
      { key: "certification_slug", header: "certification_slug", required: true, example: "bis-crs" },
      { key: "name", header: "name", required: true, example: "Mobile Phones" },
      { key: "slug", header: "slug", example: "mobile-phones" },
      { key: "family", header: "family", example: "Electronics" },
      { key: "regime", header: "regime", example: "CRS" },
      { key: "standards", header: "standards", example: "IS 13252" },
      { key: "summary", header: "summary", example: "CRS registration for mobile handsets." },
      { key: "content", header: "content", example: "## Scope\n\nDescribe the product family." },
      { key: "min_price", header: "min_price", example: 25000 },
      { key: "max_price", header: "max_price", example: 60000 },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "testing_categories",
    label: "Testing categories",
    description: "Product Testing parent categories",
    adminHref: "/admin/testing",
    group: "Catalogue",
    columns: [
      { key: "name", header: "name", required: true, example: "Electrical Safety" },
      { key: "slug", header: "slug", example: "electrical-safety" },
      { key: "icon", header: "icon", example: "plug" },
      { key: "summary", header: "summary", example: "IS/IEC safety tests for powered products." },
      { key: "content", header: "content", example: "## About Electrical Safety\n\nOverview writeup." },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "testing_services",
    label: "Testing pages (tests)",
    description: "Individual test pages under a testing category (category_slug required)",
    adminHref: "/admin/testing",
    group: "Catalogue",
    columns: [
      { key: "category_slug", header: "category_slug", required: true, example: "electrical-safety" },
      { key: "name", header: "name", required: true, example: "LED Lamp — Safety" },
      { key: "slug", header: "slug", example: "led-lamp-safety" },
      { key: "product_category", header: "product_category", example: "Electrical" },
      { key: "standards", header: "standards", example: "IS 16102" },
      { key: "test_type", header: "test_type", example: "Safety" },
      { key: "accreditation", header: "accreditation", example: "ISO/IEC 17025 / NABL" },
      { key: "timeline", header: "timeline", example: "7-12 working days" },
      { key: "sample_size", header: "sample_size", example: "5 production units" },
      { key: "summary", header: "summary", example: "Safety testing for LED lamps." },
      { key: "content", header: "content", example: "## Method\n\nDescribe the test." },
      { key: "meta_title", header: "meta_title", example: "LED Lamp Safety Testing | Certko" },
      { key: "meta_description", header: "meta_description", example: "NABL-mapped LED lamp safety testing." },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "categories",
    label: "BIS Categories",
    description: "Product category folders for BIS catalogue",
    adminHref: "/admin/categories",
    group: "Catalogue",
    columns: [
      { key: "name", header: "name", required: true, example: "Kitchen Appliances" },
      { key: "slug", header: "slug", example: "kitchen-appliances" },
      { key: "icon", header: "icon", example: "cup" },
      { key: "description", header: "description", example: "Mixers, ovens and related appliances." },
      { key: "timeline", header: "timeline", example: "8-16 weeks" },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "products",
    label: "BIS Products",
    description: "Individual BIS product pages (category_slug required)",
    adminHref: "/admin/products",
    group: "Catalogue",
    columns: [
      { key: "name", header: "name", required: true, example: "Electric Iron" },
      { key: "slug", header: "slug", example: "electric-iron" },
      { key: "category_slug", header: "category_slug", required: true, example: "kitchen-appliances" },
      { key: "standard", header: "standard", example: "IS 302-2-3" },
      { key: "scheme", header: "scheme", example: "ISI" },
      { key: "min_price", header: "min_price", example: 15000 },
      { key: "max_price", header: "max_price", example: 45000 },
      { key: "timeline", header: "timeline", example: "10-14 weeks" },
      { key: "hsn4", header: "hsn4", example: "8516" },
      { key: "hsn8", header: "hsn8", example: "85164000" },
      { key: "qco_status", header: "qco_status", example: "Mandatory (QCO in force)" },
      { key: "qco_order", header: "qco_order", example: "MeitY QCO — example" },
      { key: "description", header: "description", example: "Short product compliance writeup." },
      { key: "featured", header: "featured", example: 0 },
    ],
  },
  {
    id: "qcos",
    label: "QCO Alerts",
    description: "Upcoming / notified QCO deadlines",
    adminHref: "/admin/qcos",
    group: "Catalogue",
    columns: [
      { key: "product", header: "product", required: true, example: "USB Type-C Cables" },
      { key: "ministry", header: "ministry", example: "MeitY" },
      { key: "hsn4", header: "hsn4", example: "8544" },
      { key: "hsn8", header: "hsn8", example: "85444299" },
      { key: "standard", header: "standard", example: "IS 17017" },
      { key: "enforcement_date", header: "enforcement_date", example: "26-07-2026" },
      { key: "scheme", header: "scheme", example: "CRS" },
    ],
  },
  {
    id: "authors",
    label: "Authors",
    description: "Blog author profiles",
    adminHref: "/admin/authors",
    group: "Blog",
    columns: [
      { key: "name", header: "name", required: true, example: "Priya Nair" },
      { key: "slug", header: "slug", example: "priya-nair" },
      { key: "title", header: "title", example: "Compliance Lead" },
      { key: "bio", header: "bio", example: "Works with manufacturers on BIS and QCO readiness." },
      { key: "email", header: "email", example: "priya@example.com" },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "posts",
    label: "Blog posts",
    description: "Articles (author_slug optional — defaults to first author)",
    adminHref: "/admin/blog",
    group: "Blog",
    columns: [
      { key: "title", header: "title", required: true, example: "How to prepare for a QCO deadline" },
      { key: "slug", header: "slug", example: "prepare-qco-deadline" },
      { key: "author_slug", header: "author_slug", example: "certko-team" },
      { key: "excerpt", header: "excerpt", example: "A practical checklist for manufacturers." },
      { key: "content", header: "content", example: "## Steps\n\n1. Map the product\n2. Book a lab" },
      { key: "status", header: "status", example: "draft" },
      { key: "published_at", header: "published_at", example: "2026-07-26" },
    ],
  },
];

export function getBulkEntity(id: string): BulkEntityDef | undefined {
  return BULK_ENTITIES.find((e) => e.id === id);
}

function cell(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null) return "";
  return String(v).trim();
}

function num(row: Record<string, unknown>, key: string): number | null {
  const v = cell(row, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function uniqueSlug(table: string, base: string): string {
  const db = getDb();
  let slug = slugify(base) || `item-${Date.now()}`;
  let n = 2;
  while (db.prepare(`SELECT 1 FROM ${table} WHERE slug = ?`).get(slug)) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}

export function buildTemplateWorkbook(entityId: BulkEntity): Buffer {
  const def = getBulkEntity(entityId);
  if (!def) throw new Error("Unknown entity");

  const headers = def.columns.map((c) => c.header);
  const example = def.columns.map((c) => c.example);
  const notes = def.columns.map((c) => (c.required ? "REQUIRED" : "optional"));

  const sheet = XLSX.utils.aoa_to_sheet([headers, example, notes]);
  sheet["!cols"] = headers.map((h) => ({ wch: Math.max(14, h.length + 4) }));

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Certko bulk upload template"],
    ["Entity", def.label],
    ["How to use"],
    ["1. Keep the header row (row 1) exactly as provided."],
    ["2. Row 2 is an example — replace it with your data. Add more rows below."],
    ["3. Row 3 marks REQUIRED vs optional columns — you can delete the notes row before upload."],
    ["4. Save as .xlsx and upload on Admin → Bulk Import."],
    ["5. Existing rows with the same slug (or product name for QCOs) are updated when possible."],
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Data");
  XLSX.utils.book_append_sheet(wb, instructions, "Instructions");
  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return Buffer.from(out);
}

export function parseWorkbook(buffer: Buffer): Record<string, unknown>[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames.includes("Data") ? "Data" : wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.filter((row) => {
    const values = Object.values(row).map((v) => String(v ?? "").trim().toLowerCase());
    if (values.every((v) => !v)) return false;
    // skip notes row
    if (values.includes("required") || values.includes("optional")) return false;
    return true;
  });
}

export type BulkImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export function importBulkRows(entityId: BulkEntity, rows: Record<string, unknown>[]): BulkImportResult {
  const def = getBulkEntity(entityId);
  if (!def) return { created: 0, updated: 0, skipped: 0, errors: ["Unknown entity"] };

  const result: BulkImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const db = getDb();

  rows.forEach((row, idx) => {
    const line = idx + 2; // header is row 1
    try {
      for (const col of def.columns.filter((c) => c.required)) {
        if (!cell(row, col.key)) {
          throw new Error(`Missing required column "${col.header}"`);
        }
      }

      switch (entityId) {
        case "testimonials": {
          const name = cell(row, "name");
          const quote = cell(row, "quote");
          const role = cell(row, "role");
          const rating = Math.min(5, Math.max(1, num(row, "rating") ?? 5));
          const featuredRaw = cell(row, "featured").toLowerCase();
          const featured =
            featuredRaw === "" || featuredRaw === "1" || featuredRaw === "true" || featuredRaw === "yes"
              ? 1
              : 0;
          const existing = db
            .prepare("SELECT id FROM testimonials WHERE name = ? AND quote = ?")
            .get(name, quote) as { id: number } | undefined;
          if (existing) {
            db.prepare("UPDATE testimonials SET role=?, rating=?, featured=? WHERE id=?").run(
              role,
              rating,
              featured,
              existing.id
            );
            result.updated++;
          } else {
            db.prepare(
              "INSERT INTO testimonials (name, role, quote, rating, featured) VALUES (?, ?, ?, ?, ?)"
            ).run(name, role, quote, rating, featured);
            result.created++;
          }
          break;
        }
        case "certifications": {
          const name = cell(row, "name");
          let slug = cell(row, "slug") || slugify(name);
          const existing = db.prepare("SELECT id FROM certifications WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          const full_name = cell(row, "full_name");
          const region = cell(row, "region");
          const icon = cell(row, "icon") || "award";
          const summary = cell(row, "summary");
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE certifications SET name=?, full_name=?, region=?, icon=?, summary=?, sort=? WHERE id=?`
            ).run(name, full_name, region, icon, summary, sort, existing.id);
            result.updated++;
          } else {
            slug = uniqueSlug("certifications", slug);
            db.prepare(
              `INSERT INTO certifications (slug, name, full_name, region, icon, summary, content, image, meta_title, meta_description, sort)
               VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`
            ).run(
              slug,
              name,
              full_name,
              region,
              icon,
              summary,
              `## About ${name}\n\n${summary}`,
              `${name} Certification | Certko`,
              summary,
              sort
            );
            result.created++;
          }
          break;
        }
        case "testing_categories": {
          const name = cell(row, "name");
          let slug = cell(row, "slug") || slugify(name);
          const existing = db.prepare("SELECT id FROM testing_categories WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          const icon = cell(row, "icon") || "microscope";
          const summary = cell(row, "summary");
          const content = cell(row, "content") || `## About ${name}\n\n${summary}`;
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE testing_categories SET name=?, icon=?, summary=?, content=?, sort=? WHERE id=?`
            ).run(name, icon, summary, content, sort, existing.id);
            result.updated++;
          } else {
            slug = uniqueSlug("testing_categories", slug);
            db.prepare(
              `INSERT INTO testing_categories (slug, name, icon, summary, content, image, meta_title, meta_description, sort)
               VALUES (?, ?, ?, ?, ?, '', ?, ?, ?)`
            ).run(
              slug,
              name,
              icon,
              summary,
              content,
              `${name} | Product Testing | Certko`,
              summary,
              sort
            );
            result.created++;
          }
          break;
        }
        case "testing_services": {
          const name = cell(row, "name");
          const categorySlug = cell(row, "category_slug");
          const cat = db.prepare("SELECT id FROM testing_categories WHERE slug = ?").get(categorySlug) as
            | { id: number }
            | undefined;
          if (!cat) throw new Error(`Unknown category_slug "${categorySlug}" — create the testing category first`);
          let slug = cell(row, "slug") || slugify(name);
          const existing = db
            .prepare("SELECT id FROM testing_services WHERE category_id = ? AND slug = ?")
            .get(cat.id, slug) as { id: number } | undefined;
          const product_category = cell(row, "product_category");
          const standards = cell(row, "standards");
          const test_type = cell(row, "test_type");
          const accreditation = cell(row, "accreditation") || "ISO/IEC 17025 / NABL";
          const timeline = cell(row, "timeline") || "7–15 working days";
          const sample_size = cell(row, "sample_size") || "As advised by the testing laboratory";
          const summary = cell(row, "summary");
          const content = cell(row, "content") || `## ${name}\n\n${summary}`;
          const meta_title = cell(row, "meta_title") || `${name} Testing | Certko`;
          const meta_description = cell(row, "meta_description") || summary;
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE testing_services SET name=?, product_category=?, standards=?, test_type=?, accreditation=?,
               timeline=?, sample_size=?, summary=?, content=?, meta_title=?, meta_description=?, sort=? WHERE id=?`
            ).run(
              name,
              product_category,
              standards,
              test_type,
              accreditation,
              timeline,
              sample_size,
              summary,
              content,
              meta_title,
              meta_description,
              sort,
              existing.id
            );
            result.updated++;
          } else {
            let candidate = slug;
            let n = 2;
            while (
              db
                .prepare("SELECT 1 FROM testing_services WHERE category_id = ? AND slug = ?")
                .get(cat.id, candidate)
            ) {
              candidate = `${slugify(name)}-${n++}`;
            }
            const res = db
              .prepare(
                `INSERT INTO testing_services
                (category_id, slug, name, product_category, standards, test_type, accreditation, timeline, sample_size, summary, content, image, meta_title, meta_description, sort)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`
              )
              .run(
                cat.id,
                candidate,
                name,
                product_category,
                standards,
                test_type,
                accreditation,
                timeline,
                sample_size,
                summary,
                content,
                meta_title,
                meta_description,
                sort
              );
            const newId = Number(res.lastInsertRowid);
            const insFaq = db.prepare(
              "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
            );
            [
              [`What does “${name}” cover?`, `${name} covers the key parameters for this test${standards ? ` under ${standards}` : ""}.`],
              ["How do I get a quote?", "Use Contact / Get Expert Help with your product details for a mapped lab quote."],
            ].forEach(([q, a], i) => insFaq.run(`test:${newId}`, q, a, i));
            result.created++;
          }
          break;
        }
        case "cert_products": {
          const name = cell(row, "name");
          const certSlug = cell(row, "certification_slug");
          const cert = db.prepare("SELECT id FROM certifications WHERE slug = ?").get(certSlug) as
            | { id: number }
            | undefined;
          if (!cert) throw new Error(`Unknown certification_slug "${certSlug}"`);
          let slug = cell(row, "slug") || slugify(name);
          const existing = db
            .prepare("SELECT id FROM cert_products WHERE certification_id = ? AND slug = ?")
            .get(cert.id, slug) as { id: number } | undefined;
          const family = cell(row, "family");
          const regime = cell(row, "regime");
          const standards = cell(row, "standards");
          const summary = cell(row, "summary");
          const content = cell(row, "content") || `## ${name}\n\n${summary}`;
          const min_price = num(row, "min_price");
          const max_price = num(row, "max_price");
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE cert_products SET name=?, family=?, regime=?, standards=?, summary=?, content=?, min_price=?, max_price=?, sort=? WHERE id=?`
            ).run(
              name,
              family,
              regime,
              standards,
              summary,
              content,
              min_price,
              max_price,
              sort,
              existing.id
            );
            result.updated++;
          } else {
            let candidate = slug;
            let n = 2;
            while (
              db
                .prepare("SELECT 1 FROM cert_products WHERE certification_id = ? AND slug = ?")
                .get(cert.id, candidate)
            ) {
              candidate = `${slugify(name)}-${n++}`;
            }
            db.prepare(
              `INSERT INTO cert_products
              (certification_id, slug, name, family, regime, standards, summary, content, image, min_price, max_price, labs, fee_note, extras, sort)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, '', '', '{}', ?)`
            ).run(
              cert.id,
              candidate,
              name,
              family,
              regime,
              standards,
              summary,
              content,
              min_price,
              max_price,
              sort
            );
            result.created++;
          }
          break;
        }
        case "authors": {
          const name = cell(row, "name");
          let slug = cell(row, "slug") || slugify(name);
          const existing = db.prepare("SELECT id FROM authors WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          const title = cell(row, "title");
          const bio = cell(row, "bio");
          const email = cell(row, "email");
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare("UPDATE authors SET name=?, title=?, bio=?, email=?, sort=? WHERE id=?").run(
              name,
              title,
              bio,
              email,
              sort,
              existing.id
            );
            result.updated++;
          } else {
            slug = uniqueSlug("authors", slug);
            db.prepare(
              "INSERT INTO authors (slug, name, title, bio, image, email, sort) VALUES (?, ?, ?, ?, '', ?, ?)"
            ).run(slug, name, title, bio, email, sort);
            result.created++;
          }
          break;
        }
        case "faqs": {
          const scope = cell(row, "scope");
          const question = cell(row, "question");
          const answer = cell(row, "answer");
          const sort = num(row, "sort") ?? 0;
          const existing = db
            .prepare("SELECT id FROM faqs WHERE scope = ? AND question = ?")
            .get(scope, question) as { id: number } | undefined;
          if (existing) {
            db.prepare("UPDATE faqs SET answer=?, sort=? WHERE id=?").run(answer, sort, existing.id);
            result.updated++;
          } else {
            db.prepare("INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)").run(
              scope,
              question,
              answer,
              sort
            );
            result.created++;
          }
          break;
        }
        case "pages": {
          const title = cell(row, "title");
          let slug = cell(row, "slug") || slugify(title);
          if (!slug) throw new Error("Page slug is required");
          const existing = db.prepare("SELECT slug FROM pages WHERE slug = ?").get(slug) as
            | { slug: string }
            | undefined;
          const hero_heading = cell(row, "hero_heading") || title;
          const hero_subheading = cell(row, "hero_subheading");
          const content = cell(row, "content") || `## ${title}\n\nWrite the page content here.`;
          const meta_title = cell(row, "meta_title") || `${title} | Certko`;
          const meta_description = cell(row, "meta_description");
          const flag = (k: string) => {
            const v = cell(row, k).toLowerCase();
            return v === "1" || v === "true" || v === "yes" || v === "y" ? 1 : 0;
          };
          const nav_menu = flag("nav_menu");
          const nav_submenu = flag("nav_submenu");
          const nav_footer = flag("nav_footer");
          const nav_label = cell(row, "nav_label") || title;
          const nav_sort = num(row, "nav_sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE pages SET title=?, meta_title=?, meta_description=?, hero_heading=?, hero_subheading=?, content=?,
               nav_menu=?, nav_submenu=?, nav_footer=?, nav_label=?, nav_sort=? WHERE slug=?`
            ).run(
              title,
              meta_title,
              meta_description,
              hero_heading,
              hero_subheading,
              content,
              nav_menu,
              nav_submenu,
              nav_footer,
              nav_label,
              nav_sort,
              slug
            );
            result.updated++;
          } else {
            db.prepare(
              `INSERT INTO pages
              (slug, title, meta_title, meta_description, hero_heading, hero_subheading, content, image,
               nav_menu, nav_submenu, nav_footer, nav_label, nav_detail, nav_sort)
             VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, '', ?)`
            ).run(
              slug,
              title,
              meta_title,
              meta_description,
              hero_heading,
              hero_subheading,
              content,
              nav_menu,
              nav_submenu,
              nav_footer,
              nav_label,
              nav_sort
            );
            result.created++;
          }
          break;
        }
        case "categories": {
          const name = cell(row, "name");
          let slug = cell(row, "slug") || slugify(name);
          const existing = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          const icon = cell(row, "icon") || "box";
          const description = cell(row, "description");
          const timeline = cell(row, "timeline") || "8-16 weeks";
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE categories SET name=?, icon=?, description=?, timeline=?, sort=? WHERE id=?`
            ).run(name, icon, description, timeline, sort, existing.id);
            result.updated++;
          } else {
            slug = uniqueSlug("categories", slug);
            db.prepare(
              `INSERT INTO categories (slug, name, icon, description, image, timeline, sort)
               VALUES (?, ?, ?, ?, '', ?, ?)`
            ).run(slug, name, icon, description, timeline, sort);
            result.created++;
          }
          break;
        }
        case "products": {
          const name = cell(row, "name");
          const categorySlug = cell(row, "category_slug");
          const cat = db.prepare("SELECT id FROM categories WHERE slug = ?").get(categorySlug) as
            | { id: number }
            | undefined;
          if (!cat) throw new Error(`Unknown category_slug "${categorySlug}"`);
          let slug = cell(row, "slug") || slugify(name);
          const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          const standard = cell(row, "standard");
          const scheme = cell(row, "scheme") || "ISI";
          const min_price = num(row, "min_price");
          const max_price = num(row, "max_price");
          const timeline = cell(row, "timeline");
          const hsn4 = cell(row, "hsn4");
          const hsn8 = cell(row, "hsn8");
          const qco_status = cell(row, "qco_status");
          const qco_order = cell(row, "qco_order");
          const description = cell(row, "description");
          const featured = cell(row, "featured") === "1" || cell(row, "featured").toLowerCase() === "true" ? 1 : 0;
          if (existing) {
            db.prepare(
              `UPDATE products SET name=?, category_id=?, standard=?, scheme=?, min_price=?, max_price=?, timeline=?,
               description=?, featured=?, hsn4=?, hsn8=?, qco_status=?, qco_order=? WHERE id=?`
            ).run(
              name,
              cat.id,
              standard,
              scheme,
              min_price,
              max_price,
              timeline,
              description,
              featured,
              hsn4,
              hsn8,
              qco_status,
              qco_order,
              existing.id
            );
            result.updated++;
          } else {
            slug = uniqueSlug("products", slug);
            db.prepare(
              `INSERT INTO products (
                slug, name, standard, scheme, category_id, min_price, max_price, lab_count, timeline,
                description, image, featured, meta_title, meta_description, hsn4, hsn8, qco_status, qco_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)`
            ).run(
              slug,
              name,
              standard,
              scheme,
              cat.id,
              min_price,
              max_price,
              timeline,
              description,
              featured,
              `${name} | BIS Certification | Certko`,
              description || `BIS certification details for ${name}.`,
              hsn4,
              hsn8,
              qco_status,
              qco_order
            );
            result.created++;
          }
          break;
        }
        case "qcos": {
          const product = cell(row, "product");
          const ministry = cell(row, "ministry");
          const hsn4 = cell(row, "hsn4");
          const hsn8 = cell(row, "hsn8");
          const standard = cell(row, "standard");
          const enforcement_date = cell(row, "enforcement_date");
          const scheme = cell(row, "scheme") || "ISI";
          const existing = db
            .prepare(
              "SELECT id FROM qcos WHERE product = ? AND IFNULL(standard,'') = ? AND IFNULL(enforcement_date,'') = ?"
            )
            .get(product, standard, enforcement_date) as { id: number } | undefined;
          if (existing) {
            db.prepare(
              `UPDATE qcos SET ministry=?, hsn4=?, hsn8=?, scheme=? WHERE id=?`
            ).run(ministry, hsn4, hsn8, scheme, existing.id);
            result.updated++;
          } else {
            db.prepare(
              `INSERT INTO qcos (product, ministry, hsn4, hsn8, standard, enforcement_date, scheme)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).run(product, ministry, hsn4, hsn8, standard, enforcement_date, scheme);
            result.created++;
          }
          break;
        }
        case "posts": {
          const title = cell(row, "title");
          let slug = cell(row, "slug") || slugify(title);
          const authorSlug = cell(row, "author_slug") || "certko-team";
          let author = db.prepare("SELECT id, name FROM authors WHERE slug = ?").get(authorSlug) as
            | { id: number; name: string }
            | undefined;
          if (!author) {
            author = db
              .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
              .get() as { id: number; name: string };
          }
          if (!author) throw new Error("No authors exist — create an author first");
          const excerpt = cell(row, "excerpt");
          const content =
            cell(row, "content") ||
            "Write your post here using **Markdown**.";
          const status = cell(row, "status") === "published" ? "published" : "draft";
          const published_at =
            status === "published" ? cell(row, "published_at") || new Date().toISOString().slice(0, 10) : null;
          const existing = db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug) as
            | { id: number }
            | undefined;
          if (existing) {
            db.prepare(
              `UPDATE posts SET title=?, excerpt=?, content=?, author=?, author_id=?, status=?, published_at=?,
               meta_title=?, meta_description=? WHERE id=?`
            ).run(
              title,
              excerpt,
              content,
              author.name,
              author.id,
              status,
              published_at,
              `${title} | Certko Blog`,
              excerpt,
              existing.id
            );
            result.updated++;
          } else {
            slug = uniqueSlug("posts", slug);
            db.prepare(
              `INSERT INTO posts (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
               VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?)`
            ).run(
              slug,
              title,
              excerpt,
              content,
              author.name,
              author.id,
              status,
              published_at,
              `${title} | Certko Blog`,
              excerpt
            );
            result.created++;
          }
          break;
        }
      }
    } catch (err) {
      result.skipped++;
      result.errors.push(`Row ${line}: ${err instanceof Error ? err.message : "import failed"}`);
    }
  });

  return result;
}
