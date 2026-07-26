import type Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { slugify } from "./format";

interface BeeRow {
  name: string;
  slug: string;
  family: string;
  regime: string;
  regime_detail: string;
  standards: string;
  star_table: string;
  min_price: number | null;
  max_price: number | null;
  labs: string;
  fee_note: string;
  sort: number;
}

interface GmarkRow {
  category: string;
  family: string;
  standards: string;
  emc: string;
  iecee: string;
  gso_nb: string;
}

export function ensureCertProductsCatalog(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cert_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certification_id INTEGER NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      family TEXT NOT NULL DEFAULT '',
      regime TEXT NOT NULL DEFAULT '',
      standards TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      min_price INTEGER,
      max_price INTEGER,
      labs TEXT NOT NULL DEFAULT '',
      fee_note TEXT NOT NULL DEFAULT '',
      extras TEXT NOT NULL DEFAULT '{}',
      sort INTEGER NOT NULL DEFAULT 0,
      UNIQUE(certification_id, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_cert_products_cert ON cert_products(certification_id);
    CREATE INDEX IF NOT EXISTS idx_cert_products_name ON cert_products(name);
  `);

  seedBeeIfEmpty(db);
  seedGmarkIfEmpty(db);
  stripBeeIndicativeLabs(db);
}

/** BEE catalogue should not surface indicative lab text. */
function stripBeeIndicativeLabs(db: Database.Database) {
  const bee = db.prepare("SELECT id FROM certifications WHERE slug = 'bee'").get() as
    | { id: number }
    | undefined;
  if (!bee) return;
  const rows = db
    .prepare("SELECT id, content, labs FROM cert_products WHERE certification_id = ?")
    .all(bee.id) as { id: number; content: string; labs: string }[];
  const upd = db.prepare("UPDATE cert_products SET labs = '', content = ? WHERE id = ?");
  const tx = db.transaction(() => {
    for (const row of rows) {
      const cleaned = row.content
        .replace(/\n*\*\*Indicative labs:\*\*[^\n]*/gi, "")
        .replace(/\n*Indicative labs:[^\n]*/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      if (row.labs || cleaned !== row.content) {
        upd.run(cleaned, row.id);
      }
    }
  });
  tx();
}

function seedBeeIfEmpty(db: Database.Database) {
  const bee = db.prepare("SELECT id FROM certifications WHERE slug = 'bee'").get() as
    | { id: number }
    | undefined;
  if (!bee) return;
  const n = (
    db.prepare("SELECT COUNT(*) AS n FROM cert_products WHERE certification_id = ?").get(bee.id) as {
      n: number;
    }
  ).n;
  if (n > 0) return;

  const file = path.join(process.cwd(), "data", "bee_products.json");
  if (!fs.existsSync(file)) return;
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as BeeRow[];
  const ins = db.prepare(
    `INSERT OR IGNORE INTO cert_products
      (certification_id, slug, name, family, regime, standards, summary, content, image, min_price, max_price, labs, fee_note, extras, sort)
     VALUES (@certification_id, @slug, @name, @family, @regime, @standards, @summary, @content, '', @min_price, @max_price, @labs, @fee_note, @extras, @sort)`
  );
  const tx = db.transaction(() => {
    for (const r of rows) {
      const extras = JSON.stringify({
        regime_detail: r.regime_detail,
        star_table: r.star_table,
      });
      ins.run({
        certification_id: bee.id,
        slug: r.slug || slugify(r.name),
        name: r.name,
        family: r.family || r.regime,
        regime: r.regime,
        standards: r.standards,
        summary: `${r.regime} BEE star labelling · ${r.regime_detail}`,
        content: `## ${r.name}\n\n**Regime:** ${r.regime_detail}\n\n**Test standard:** ${r.standards}\n\n**Star rating table:** ${r.star_table}\n\n**Label fee note:** ${r.fee_note}`,
        min_price: r.min_price,
        max_price: r.max_price,
        labs: "",
        fee_note: r.fee_note,
        extras,
        sort: r.sort,
      });
    }
  });
  tx();
}

function seedGmarkIfEmpty(db: Database.Database) {
  const gmark = db.prepare("SELECT id FROM certifications WHERE slug = 'g-mark'").get() as
    | { id: number }
    | undefined;
  if (!gmark) return;
  const n = (
    db
      .prepare("SELECT COUNT(*) AS n FROM cert_products WHERE certification_id = ?")
      .get(gmark.id) as { n: number }
  ).n;
  if (n > 0) return;

  const file = path.join(process.cwd(), "data", "gmark_categories.json");
  if (!fs.existsSync(file)) return;
  const rows = JSON.parse(fs.readFileSync(file, "utf8")) as GmarkRow[];
  const ins = db.prepare(
    `INSERT OR IGNORE INTO cert_products
      (certification_id, slug, name, family, regime, standards, summary, content, image, min_price, max_price, labs, fee_note, extras, sort)
     VALUES (@certification_id, @slug, @name, @family, @regime, @standards, @summary, @content, '', NULL, NULL, '', '', @extras, @sort)`
  );
  const tx = db.transaction(() => {
    rows.forEach((r, i) => {
      const extras = JSON.stringify({ emc: r.emc, iecee: r.iecee, gso_nb: r.gso_nb });
      ins.run({
        certification_id: gmark.id,
        slug: slugify(r.category),
        name: r.category,
        family: r.family,
        regime: "Regulated",
        standards: r.standards,
        summary: `${r.family} · GSO Notified Body: ${r.gso_nb}`,
        content: `## ${r.category}\n\n**Product family:** ${r.family}\n\n**Main standard(s):** ${r.standards}\n\n**EMC:** ${r.emc} · **IECEE:** ${r.iecee} · **GSO NB:** ${r.gso_nb}`,
        extras,
        sort: i + 1,
      });
    });
  });
  tx();
}
