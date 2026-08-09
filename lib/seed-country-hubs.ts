import type { SqliteDatabase } from "./sqlite";
import { DEFAULT_COUNTRY_HUBS } from "./country-certifications";

/** Create country hub tables and seed default markets when empty. */
export function ensureCountryHubsLibrary(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS country_hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      market_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      short_name TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      intro TEXT NOT NULL DEFAULT '',
      overview TEXT NOT NULL DEFAULT '',
      authority TEXT NOT NULL DEFAULT '',
      filing_tip TEXT NOT NULL DEFAULT '',
      first_checks TEXT NOT NULL DEFAULT '[]',
      sort INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
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

  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM country_hubs").get() as { n: number }
  ).n;
  if (count > 0) return;

  const insertHub = db.prepare(
    `INSERT INTO country_hubs (
      slug, market_id, name, short_name, meta_title, meta_description,
      intro, overview, authority, filing_tip, first_checks, sort, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  );
  const insertScheme = db.prepare(
    `INSERT INTO country_schemes (
      country_id, cert_slug, name, role, summary, who_needs_it, examples, sort
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    DEFAULT_COUNTRY_HUBS.forEach((hub, hubIndex) => {
      const marketSort = hubIndex * 10 + 10;
      const res = insertHub.run(
        hub.slug,
        hub.marketId || hub.slug,
        hub.name,
        hub.shortName || hub.name,
        hub.metaTitle,
        hub.metaDescription,
        hub.intro,
        hub.overview,
        hub.authority,
        hub.filingTip,
        JSON.stringify(hub.firstChecks || []),
        marketSort
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
    });
  });
  tx();
}
