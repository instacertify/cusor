import type { SqliteDatabase } from "./sqlite";

/** Extra library quotes for existing DBs (idempotent by name). */
const EXTRA_TESTIMONIALS = [
  {
    name: "Priya N.",
    role: "Electronics Brand, Bengaluru",
    quote:
      "We needed BEE star labelling and BIS CRS on the same SKU. Certko sequenced both so lab tests weren’t repeated — saved weeks and a second sample batch.",
    rating: 5,
    featured: 1,
    sort: 10,
  },
  {
    name: "Hassan A.",
    role: "GCC Importer, Dubai",
    quote:
      "GMARK categories were confusing until Certko mapped our catalogue to the right standards matrix. Clear next steps, clear costs — we certified on the first attempt.",
    rating: 5,
    featured: 1,
    sort: 20,
  },
  {
    name: "Sneha P.",
    role: "Marketplace Seller, Pune",
    quote:
      "Our listings were at risk after a QCO update. Certko confirmed the exact IS number, booked the lab and got us the certificate before enforcement — no delisting.",
    rating: 5,
    featured: 1,
    sort: 30,
  },
  {
    name: "Daniel R.",
    role: "EU Exporter, Poland",
    quote:
      "CE plus Indian BIS for the same product line felt impossible until Certko reused test evidence intelligently. One project plan, two markets.",
    rating: 5,
    featured: 1,
    sort: 40,
  },
  {
    name: "Kavita M.",
    role: "Home Appliances OEM, Hyderabad",
    quote:
      "The product testing pages made scope and sample size obvious before we requested a quote. When we did, the proposal matched what we had already budgeted.",
    rating: 5,
    featured: 1,
    sort: 50,
  },
  {
    name: "Omar F.",
    role: "SABER Compliance Lead, Riyadh",
    quote:
      "SABER and GMARK hand-offs used to stall our shipments. Certko’s team kept both tracks moving and we cleared customs without last-minute surprises.",
    rating: 5,
    featured: 1,
    sort: 60,
  },
];

export function ensureTestimonialsLibrary(db: SqliteDatabase) {
  const cols = db.prepare("PRAGMA table_info(testimonials)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "featured")) {
    db.exec(
      "ALTER TABLE testimonials ADD COLUMN featured INTEGER NOT NULL DEFAULT 1"
    );
  }

  const insert = db.prepare(
    `INSERT INTO testimonials (name, role, quote, rating, sort, featured)
     SELECT ?, ?, ?, ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = ?)`
  );
  const tx = db.transaction(() => {
    for (const t of EXTRA_TESTIMONIALS) {
      insert.run(t.name, t.role, t.quote, t.rating, t.sort, t.featured, t.name);
    }
  });
  tx();
}
