import * as XLSX from "xlsx";
import { getDb } from "./db";
import { slugify } from "./format";

export type BulkEntity =
  | "testimonials"
  | "certifications"
  | "testing_categories"
  | "categories"
  | "products"
  | "qcos"
  | "posts";

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
  columns: BulkColumn[];
};

export const BULK_ENTITIES: BulkEntityDef[] = [
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Homepage trust quotes",
    adminHref: "/admin/testimonials",
    columns: [
      { key: "name", header: "name", required: true, example: "Anita Sharma" },
      { key: "role", header: "role", example: "Export Manager, Noida" },
      { key: "quote", header: "quote", required: true, example: "Certko helped us map BIS CRS in days." },
      { key: "rating", header: "rating", example: 5 },
    ],
  },
  {
    id: "certifications",
    label: "Certifications",
    description: "BIS, BEE, GMARK and other schemes",
    adminHref: "/admin/certifications",
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
    id: "testing_categories",
    label: "Product Testing categories",
    description: "Testing catalogue parent categories",
    adminHref: "/admin/testing",
    columns: [
      { key: "name", header: "name", required: true, example: "Electrical Safety" },
      { key: "slug", header: "slug", example: "electrical-safety" },
      { key: "icon", header: "icon", example: "plug" },
      { key: "summary", header: "summary", example: "IS/IEC safety tests for powered products." },
      { key: "sort", header: "sort", example: 10 },
    ],
  },
  {
    id: "categories",
    label: "BIS Categories",
    description: "Product category folders for BIS catalogue",
    adminHref: "/admin/categories",
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
    id: "posts",
    label: "Blog posts",
    description: "Articles (author_slug optional — defaults to Certko Team)",
    adminHref: "/admin/blog",
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
          const existing = db
            .prepare("SELECT id FROM testimonials WHERE name = ? AND quote = ?")
            .get(name, quote) as { id: number } | undefined;
          if (existing) {
            db.prepare("UPDATE testimonials SET role=?, rating=? WHERE id=?").run(role, rating, existing.id);
            result.updated++;
          } else {
            db.prepare("INSERT INTO testimonials (name, role, quote, rating) VALUES (?, ?, ?, ?)").run(
              name,
              role,
              quote,
              rating
            );
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
          const sort = num(row, "sort") ?? 0;
          if (existing) {
            db.prepare(
              `UPDATE testing_categories SET name=?, icon=?, summary=?, sort=? WHERE id=?`
            ).run(name, icon, summary, sort, existing.id);
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
              `## About ${name}\n\n${summary}`,
              `${name} | Product Testing | Certko`,
              summary,
              sort
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
