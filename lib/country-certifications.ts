/**
 * Country-wise certification hubs — browse schemes by market / country.
 * Public pages read from SQLite (Admin → Countries). DEFAULT_COUNTRY_HUBS seeds empty DBs.
 */

import { getDb } from "@/lib/db";
import type { MarketId } from "@/lib/market-applicability";
import { CERT_MARKETS } from "@/lib/market-applicability";
import { GMA_COUNTRY_SEEDS } from "@/lib/gma-country-data";
import type { CountryPillars, GmaRegionId } from "@/lib/gma-regions";
import { GMA_REGIONS } from "@/lib/gma-regions";

export interface CountrySchemeCopy {
  id?: number;
  /** Matches certifications.slug in the database */
  certSlug: string;
  /** Scheme name as shown on the country hub */
  name: string;
  /** One-line role in this market */
  role: string;
  /** Unique paragraph for this scheme × country */
  summary: string;
  /** Who typically needs it when selling into this market */
  whoNeedsIt: string;
  /** Example product types (plain language) */
  examples: string[];
}

export interface CountryHub {
  id?: number;
  slug: string;
  /** Optional link to market-applicability id (india, european-union, …) */
  marketId: string;
  /** GMA region grouping */
  region: GmaRegionId | string;
  name: string;
  /** Short label for nav / chips */
  shortName: string;
  /** SEO / page title fragment */
  metaTitle: string;
  metaDescription: string;
  /** Hero supporting line */
  intro: string;
  /** Regulatory landscape overview */
  overview: string;
  /** Authority / platform note */
  authority: string;
  /** Practical filing tip unique to this market */
  filingTip: string;
  /** What importers / brands should check first */
  firstChecks: string[];
  /** Four GMA pillars + local rep */
  pillars: CountryPillars;
  schemes: CountrySchemeCopy[];
  faqs: { question: string; answer: string }[];
  sort?: number;
  active?: number;
  featured?: number;
}

/** Seed content for country_hubs (GMA matrix). */
export const DEFAULT_COUNTRY_HUBS = GMA_COUNTRY_SEEDS;

const EMPTY_PILLARS: CountryPillars = {
  safety: "",
  emcWireless: "",
  telecom: "",
  energyEnv: "",
  localRep: "",
};

type CountryHubRow = {
  id: number;
  slug: string;
  market_id: string;
  region: string;
  name: string;
  short_name: string;
  meta_title: string;
  meta_description: string;
  intro: string;
  overview: string;
  authority: string;
  filing_tip: string;
  first_checks: string;
  pillars: string;
  sort: number;
  active: number;
  featured: number;
};

type CountrySchemeRow = {
  id: number;
  country_id: number;
  cert_slug: string;
  name: string;
  role: string;
  summary: string;
  who_needs_it: string;
  examples: string;
  sort: number;
};

function parseJsonStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v) => String(v)).filter(Boolean);
  } catch {
    return [];
  }
}

function parsePillars(raw: string): CountryPillars {
  try {
    const parsed = JSON.parse(raw || "{}") as Partial<CountryPillars>;
    return {
      safety: String(parsed.safety || ""),
      emcWireless: String(parsed.emcWireless || ""),
      telecom: String(parsed.telecom || ""),
      energyEnv: String(parsed.energyEnv || ""),
      localRep: String(parsed.localRep || ""),
    };
  } catch {
    return { ...EMPTY_PILLARS };
  }
}

function assembleHub(row: CountryHubRow, schemes: CountrySchemeRow[], faqs: CountryHub["faqs"]): CountryHub {
  return {
    id: row.id,
    slug: row.slug,
    marketId: row.market_id || row.slug,
    region: row.region || "",
    name: row.name,
    shortName: row.short_name || row.name,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    intro: row.intro,
    overview: row.overview,
    authority: row.authority,
    filingTip: row.filing_tip,
    firstChecks: parseJsonStringArray(row.first_checks),
    pillars: parsePillars(row.pillars),
    schemes: schemes.map((s) => ({
      id: s.id,
      certSlug: s.cert_slug,
      name: s.name,
      role: s.role,
      summary: s.summary,
      whoNeedsIt: s.who_needs_it,
      examples: parseJsonStringArray(s.examples),
    })),
    faqs,
    sort: row.sort,
    active: row.active,
    featured: row.featured,
  };
}

function loadFaqsForSlug(slug: string): CountryHub["faqs"] {
  return (
    getDb()
      .prepare(
        "SELECT question, answer FROM faqs WHERE scope = ? ORDER BY sort, id"
      )
      .all(`country:${slug}`) as { question: string; answer: string }[]
  ).map((f) => ({ question: f.question, answer: f.answer }));
}

function loadSchemesForCountry(countryId: number): CountrySchemeRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM country_schemes WHERE country_id = ? ORDER BY sort, id"
    )
    .all(countryId) as CountrySchemeRow[];
}

/** Active country hubs for public pages (homepage, browse, sitemap). */
export function getCountryHubs(): CountryHub[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM country_hubs WHERE active = 1 ORDER BY sort, id"
    )
    .all() as CountryHubRow[];
  return rows.map((row) =>
    assembleHub(row, loadSchemesForCountry(row.id), loadFaqsForSlug(row.slug))
  );
}

/** Featured markets for homepage horizontal picker. */
export function getFeaturedCountryHubs(): CountryHub[] {
  const featured = getDb()
    .prepare(
      `SELECT * FROM country_hubs
       WHERE active = 1 AND featured = 1
       ORDER BY sort, id`
    )
    .all() as CountryHubRow[];
  const rows =
    featured.length > 0
      ? featured
      : (getDb()
          .prepare(
            "SELECT * FROM country_hubs WHERE active = 1 ORDER BY sort, id LIMIT 5"
          )
          .all() as CountryHubRow[]);
  return rows.map((row) =>
    assembleHub(row, loadSchemesForCountry(row.id), loadFaqsForSlug(row.slug))
  );
}

/** Group active hubs by GMA region for browse UI. */
export function getCountryHubsGroupedByRegion(): {
  regionId: string;
  regionLabel: string;
  hubs: CountryHub[];
}[] {
  const hubs = getCountryHubs();
  const byRegion = new Map<string, CountryHub[]>();
  for (const hub of hubs) {
    const key = hub.region || "other";
    const list = byRegion.get(key) || [];
    list.push(hub);
    byRegion.set(key, list);
  }
  const groups: { regionId: string; regionLabel: string; hubs: CountryHub[] }[] =
    GMA_REGIONS.map((r) => ({
      regionId: r.id as string,
      regionLabel: r.label,
      hubs: byRegion.get(r.id) || [],
    })).filter((g) => g.hubs.length > 0);
  const other = byRegion.get("other");
  if (other?.length) {
    groups.push({ regionId: "other", regionLabel: "Other markets", hubs: other });
  }
  return groups;
}

/** All hubs including inactive — for Admin list. */
export function getAllCountryHubRecords(): CountryHubRow[] {
  return getDb()
    .prepare("SELECT * FROM country_hubs ORDER BY sort, id")
    .all() as CountryHubRow[];
}

export function getCountryHubRecordById(id: number): CountryHubRow | undefined {
  return getDb()
    .prepare("SELECT * FROM country_hubs WHERE id = ?")
    .get(id) as CountryHubRow | undefined;
}

export function getCountrySchemesByCountryId(countryId: number): CountrySchemeRow[] {
  return loadSchemesForCountry(countryId);
}

export function getCountryHubBySlug(slug: string): CountryHub | undefined {
  const row = getDb()
    .prepare(
      "SELECT * FROM country_hubs WHERE slug = ? AND active = 1"
    )
    .get(slug) as CountryHubRow | undefined;
  if (!row) return undefined;
  return assembleHub(row, loadSchemesForCountry(row.id), loadFaqsForSlug(row.slug));
}

/** Map market-applicability id → country hub slug. */
export function countryHubSlugForMarket(marketId: MarketId | string): string | null {
  if (marketId === "global") return null;
  const row = getDb()
    .prepare(
      `SELECT slug FROM country_hubs
       WHERE active = 1 AND (market_id = ? OR slug = ?)
       ORDER BY sort, id LIMIT 1`
    )
    .get(marketId, marketId) as { slug: string } | undefined;
  return row?.slug ?? null;
}

export function countryHubPath(slug: string): string {
  return `/certifications/countries/${slug}`;
}

/** Flat search index for country-wise filter UI and menu helpers. */
export function buildCountrySearchIndex(): {
  countrySlug: string;
  countryName: string;
  certSlug: string;
  certName: string;
  haystack: string;
}[] {
  const rows: {
    countrySlug: string;
    countryName: string;
    certSlug: string;
    certName: string;
    haystack: string;
  }[] = [];
  for (const hub of getCountryHubs()) {
    for (const scheme of hub.schemes) {
      const haystack = [
        hub.name,
        hub.shortName,
        scheme.name,
        scheme.certSlug,
        scheme.role,
        scheme.summary,
        ...scheme.examples,
      ]
        .join(" ")
        .toLowerCase();
      rows.push({
        countrySlug: hub.slug,
        countryName: hub.name,
        certSlug: scheme.certSlug,
        certName: scheme.name,
        haystack,
      });
    }
  }
  return rows;
}

export function marketsWithCountryHubs() {
  return CERT_MARKETS.filter((m) => countryHubSlugForMarket(m.id));
}

export function encodeChecksOrExamples(lines: string[]): string {
  return JSON.stringify(lines.map((l) => l.trim()).filter(Boolean));
}

export function linesFromTextarea(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
