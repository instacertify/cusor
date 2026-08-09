import type { SqliteDatabase } from "./sqlite";

/** Placeholder library entries (fictional names + SVG wordmarks). Replace logos in Admin anytime. */
const SEED_BRANDS = [
  { name: "Northpeak Appliances", logo: "/images/trusted/northpeak.svg", sort: 10 },
  { name: "Harbor Electronics", logo: "/images/trusted/harbor.svg", sort: 20 },
  { name: "Summit Materials", logo: "/images/trusted/summit.svg", sort: 30 },
  { name: "Aether Devices", logo: "/images/trusted/aether.svg", sort: 40 },
  { name: "Lumen Home", logo: "/images/trusted/lumen.svg", sort: 50 },
  { name: "Vertex Components", logo: "/images/trusted/vertex.svg", sort: 60 },
  { name: "Cascade Labs", logo: "/images/trusted/cascade.svg", sort: 70 },
  { name: "Brightline Goods", logo: "/images/trusted/brightline.svg", sort: 80 },
];

export function ensureTrustedBrandsLibrary(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trusted_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM trusted_brands").get() as { n: number }
  ).n;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO trusted_brands (name, logo, href, sort, active) VALUES (?, ?, '', ?, 1)`
  );
  const tx = db.transaction(() => {
    for (const b of SEED_BRANDS) {
      insert.run(b.name, b.logo, b.sort);
    }
  });
  tx();
}
