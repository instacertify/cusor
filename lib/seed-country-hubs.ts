import type { SqliteDatabase } from "./sqlite";
import { GMA_COUNTRY_SEEDS } from "./gma-country-data";
import { GMA_REGIONS } from "./gma-regions";
import { invalidateSearchIndex } from "./search-index";
import {
  hasCompetitorExampleMention,
  neutralizeCompetitorExamples,
} from "./competitor-mentions";

function ensureColumn(
  db: SqliteDatabase,
  table: string,
  column: string,
  ddl: string
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

function regionSortBase(region: string): number {
  return GMA_REGIONS.find((r) => r.id === region)?.sort ?? 90;
}

/** Create country hub tables and seed / top-up GMA markets. */
export function ensureCountryHubsLibrary(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS country_hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      market_id TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      short_name TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      intro TEXT NOT NULL DEFAULT '',
      overview TEXT NOT NULL DEFAULT '',
      authority TEXT NOT NULL DEFAULT '',
      filing_tip TEXT NOT NULL DEFAULT '',
      first_checks TEXT NOT NULL DEFAULT '[]',
      pillars TEXT NOT NULL DEFAULT '{}',
      sort INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS country_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_id INTEGER NOT NULL,
      cert_slug TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      who_needs_it TEXT NOT NULL DEFAULT '',
      examples TEXT NOT NULL DEFAULT '[]',
      sort INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (country_id) REFERENCES country_hubs(id) ON DELETE CASCADE
    );
  `);

  ensureColumn(db, "country_hubs", "region", "region TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "country_hubs", "pillars", "pillars TEXT NOT NULL DEFAULT '{}'");
  ensureColumn(db, "country_hubs", "featured", "featured INTEGER NOT NULL DEFAULT 0");

  const insertHub = db.prepare(
    `INSERT INTO country_hubs (
      slug, market_id, region, name, short_name, meta_title, meta_description,
      intro, overview, authority, filing_tip, first_checks, pillars, sort, active, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  );
  const insertScheme = db.prepare(
    `INSERT INTO country_schemes (
      country_id, cert_slug, name, role, summary, who_needs_it, examples, sort
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );
  const updateMeta = db.prepare(
    `UPDATE country_hubs SET
      region = CASE WHEN region = '' OR region IS NULL THEN ? ELSE region END,
      pillars = CASE WHEN pillars = '' OR pillars = '{}' OR pillars IS NULL THEN ? ELSE pillars END,
      featured = CASE WHEN featured = 0 AND ? = 1 THEN 1 ELSE featured END,
      market_id = CASE WHEN market_id = '' OR market_id IS NULL THEN ? ELSE market_id END
     WHERE slug = ?`
  );

  const existing = new Set(
    (
      db.prepare("SELECT slug FROM country_hubs").all() as { slug: string }[]
    ).map((r) => r.slug)
  );

  let changed = false;
  const tx = db.transaction(() => {
    GMA_COUNTRY_SEEDS.forEach((hub, hubIndex) => {
      const sort = regionSortBase(hub.region) * 100 + hubIndex;
      const featured = hub.featured ? 1 : 0;
      const pillarsJson = JSON.stringify(hub.pillars || {});
      if (!existing.has(hub.slug)) {
        const res = insertHub.run(
          hub.slug,
          hub.marketId || hub.slug,
          hub.region,
          hub.name,
          hub.shortName || hub.name,
          hub.metaTitle,
          hub.metaDescription,
          hub.intro,
          hub.overview,
          hub.authority,
          hub.filingTip,
          JSON.stringify(hub.firstChecks || []),
          pillarsJson,
          sort,
          featured
        );
        const countryId = Number(res.lastInsertRowid);
        hub.schemes.forEach((scheme, schemeIndex) => {
          insertScheme.run(
            countryId,
            scheme.certSlug,
            scheme.name,
            scheme.role,
            scheme.summary,
            scheme.whoNeedsIt,
            JSON.stringify(scheme.examples || []),
            schemeIndex * 10 + 10
          );
        });
        hub.faqs.forEach((faq, faqIndex) => {
          insertFaq.run(
            `country:${hub.slug}`,
            faq.question,
            faq.answer,
            faqIndex * 10 + 10
          );
        });
        existing.add(hub.slug);
        changed = true;
      } else {
        updateMeta.run(
          hub.region,
          pillarsJson,
          featured,
          hub.marketId || hub.slug,
          hub.slug
        );
      }
    });
  });
  tx();

  // Scrub competitor brand name-drops from existing hub narrative fields.
  const hubRows = db
    .prepare(
      "SELECT id, intro, overview, authority, filing_tip, pillars, first_checks FROM country_hubs"
    )
    .all() as {
    id: number;
    intro: string;
    overview: string;
    authority: string;
    filing_tip: string;
    pillars: string;
    first_checks: string;
  }[];
  const updateHubCopy = db.prepare(
    `UPDATE country_hubs SET
      intro = ?, overview = ?, authority = ?, filing_tip = ?, pillars = ?, first_checks = ?
     WHERE id = ?`
  );
  for (const row of hubRows) {
    const next = {
      intro: neutralizeCompetitorExamples(row.intro || ""),
      overview: neutralizeCompetitorExamples(row.overview || ""),
      authority: neutralizeCompetitorExamples(row.authority || ""),
      filing_tip: neutralizeCompetitorExamples(row.filing_tip || ""),
      pillars: neutralizeCompetitorExamples(row.pillars || ""),
      first_checks: neutralizeCompetitorExamples(row.first_checks || ""),
    };
    const dirty =
      next.intro !== row.intro ||
      next.overview !== row.overview ||
      next.authority !== row.authority ||
      next.filing_tip !== row.filing_tip ||
      next.pillars !== row.pillars ||
      next.first_checks !== row.first_checks;
    if (!dirty) continue;
    updateHubCopy.run(
      next.intro,
      next.overview,
      next.authority,
      next.filing_tip,
      next.pillars,
      next.first_checks,
      row.id
    );
    changed = true;
  }

  const schemeRows = db
    .prepare("SELECT id, summary, who_needs_it, examples, role, name FROM country_schemes")
    .all() as {
    id: number;
    summary: string;
    who_needs_it: string;
    examples: string;
    role: string;
    name: string;
  }[];
  const updateScheme = db.prepare(
    `UPDATE country_schemes SET summary = ?, who_needs_it = ?, examples = ?, role = ?, name = ? WHERE id = ?`
  );
  for (const row of schemeRows) {
    if (
      !hasCompetitorExampleMention(
        `${row.summary}\n${row.who_needs_it}\n${row.examples}\n${row.role}\n${row.name}`
      )
    ) {
      continue;
    }
    updateScheme.run(
      neutralizeCompetitorExamples(row.summary || ""),
      neutralizeCompetitorExamples(row.who_needs_it || ""),
      neutralizeCompetitorExamples(row.examples || ""),
      neutralizeCompetitorExamples(row.role || ""),
      neutralizeCompetitorExamples(row.name || ""),
      row.id
    );
    changed = true;
  }

  if (changed) invalidateSearchIndex();
}
