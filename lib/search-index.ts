import { getDb } from "./db";

export type QuickSearchResult = {
  type:
    | "product"
    | "category"
    | "lab"
    | "certification"
    | "cert-product"
    | "country"
    | "testing-category"
    | "testing-service";
  name: string;
  detail: string;
  href: string;
};

type IndexRow = QuickSearchResult & {
  haystack: string;
  /** Lower is better */
  boost: number;
};

type SearchIndexGlobal = typeof globalThis & {
  __certkoSearchIndex?: IndexRow[] | null;
};

const g = globalThis as SearchIndexGlobal;

export function invalidateSearchIndex() {
  g.__certkoSearchIndex = null;
}

/** Normalize IS / IEC style standards so "IS16102", "IS 16102", "is-16102" match. */
function expandStandardTokens(text: string): string[] {
  const out: string[] = [];
  const src = text.toLowerCase();
  // Capture patterns like IS 16102 (Part 1), IEC 62368-1, IS/IEC 62368
  const re =
    /\b(?:is\/?iec|is|iec|en|iso|gso|saso|cispr)\s*[-/]?\s*\d+(?:\s*[-:]\s*\d+)*(?:\s*\([^)]*\))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const raw = m[0].toLowerCase();
    const compact = raw.replace(/[^a-z0-9]/g, "");
    const spaced = raw.replace(/\s+/g, " ").trim();
    out.push(spaced, compact);
    // Also index bare number for "16102" style queries
    const num = raw.match(/\d+(?:\s*[-:]\s*\d+)*/);
    if (num) out.push(num[0].replace(/\s+/g, ""), num[0].replace(/\s+/g, " "));
  }
  return out;
}

function push(
  rows: IndexRow[],
  item: QuickSearchResult,
  haystackParts: Array<string | null | undefined>,
  boost: number
) {
  const parts = haystackParts.filter(Boolean).map(String);
  const extras: string[] = [];
  for (const p of parts) extras.push(...expandStandardTokens(p));
  const haystack = [...parts, ...extras]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!haystack) return;
  rows.push({ ...item, haystack, boost });
}

export type QuickSearchScope = "all" | "standard" | "lab" | "certification" | "testing";

const SCOPE_TYPES: Record<QuickSearchScope, QuickSearchResult["type"][] | null> = {
  all: null,
  standard: ["product", "cert-product", "testing-service", "category"],
  lab: ["lab"],
  certification: ["certification", "cert-product", "country"],
  testing: ["testing-category", "testing-service"],
};

function normalizeQueryTerms(q: string): string[] {
  const query = q.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  // Also search compact form for standard-like queries: "is 16102" → "is16102"
  const compact = query.replace(/[^a-z0-9]/g, "");
  if (compact.length >= 3 && compact !== query.replace(/\s+/g, "")) {
    terms.push(compact);
  }
  return [...new Set(terms)];
}

function filterByScope(rows: QuickSearchResult[], scope: QuickSearchScope): QuickSearchResult[] {
  const allowed = SCOPE_TYPES[scope];
  if (!allowed) return rows;
  return rows.filter((r) => allowed.includes(r.type));
}

function buildIndex(): IndexRow[] {
  const db = getDb();
  const rows: IndexRow[] = [];

  const certs = db
    .prepare(
      `SELECT slug, name, full_name, region, summary FROM certifications ORDER BY sort, id`
    )
    .all() as Array<{
    slug: string;
    name: string;
    full_name: string;
    region: string;
    summary: string;
  }>;
  for (const c of certs) {
    push(
      rows,
      {
        type: "certification",
        name: `${c.name} Certification`,
        detail: `Required in ${c.region} · ${c.full_name}`,
        href: `/certifications/${c.slug}`,
      },
      [c.name, c.full_name, c.slug, c.region, c.summary],
      0
    );
  }

  // Country-wise GMA hubs + scheme names (SONCAP, ANATEL, CCC, …)
  try {
    const hubs = db
      .prepare(
        `SELECT id, slug, name, short_name, region, intro, overview, market_id
         FROM country_hubs WHERE active = 1 ORDER BY sort, id`
      )
      .all() as Array<{
      id: number;
      slug: string;
      name: string;
      short_name: string;
      region: string;
      intro: string;
      overview: string;
      market_id: string;
    }>;
    const schemeStmt = db.prepare(
      `SELECT name, cert_slug, role, summary FROM country_schemes
       WHERE country_id = ? ORDER BY sort, id`
    );
    for (const h of hubs) {
      const schemes = schemeStmt.all(h.id) as Array<{
        name: string;
        cert_slug: string;
        role: string;
        summary: string;
      }>;
      const schemeNames = schemes.map((s) => s.name).filter(Boolean);
      const schemeText = schemes
        .flatMap((s) => [s.name, s.cert_slug, s.role, s.summary])
        .filter(Boolean);
      push(
        rows,
        {
          type: "country",
          name: `${h.short_name || h.name} certifications`,
          detail:
            schemeNames.length > 0
              ? `By market · ${schemeNames.slice(0, 4).join(" · ")}`
              : "Country-wise certification guide",
          href: `/certifications/countries/${h.slug}`,
        },
        [
          h.name,
          h.short_name,
          h.slug,
          h.market_id,
          h.region,
          h.intro,
          h.overview,
          ...schemeText,
          "country",
          "market",
          "gma",
        ],
        0
      );
    }
    push(
      rows,
      {
        type: "country",
        name: "Global Market Access",
        detail: "GMA framework · pillars, horizontal regimes, browse by country",
        href: "/certifications/global-market-access",
      },
      [
        "global market access",
        "gma",
        "country wise",
        "by market",
        "horizontal regimes",
        "rohs",
        "reach",
        "cb scheme",
      ],
      1
    );
    push(
      rows,
      {
        type: "country",
        name: "Certifications by country",
        detail: "Search all destination markets",
        href: "/certifications/countries",
      },
      ["countries", "by country", "by market", "country wise", "markets"],
      2
    );
  } catch {
    /* country_hubs may be missing on very old DBs before ensure runs */
  }

  const certProducts = db
    .prepare(
      `SELECT cp.name, cp.slug, cp.standards, cp.family, cp.regime,
              c.slug AS cert_slug, c.name AS cert_name
       FROM cert_products cp
       JOIN certifications c ON c.id = cp.certification_id`
    )
    .all() as Array<{
    name: string;
    slug: string;
    standards: string;
    family: string;
    regime: string;
    cert_slug: string;
    cert_name: string;
  }>;
  for (const p of certProducts) {
    push(
      rows,
      {
        type: "cert-product",
        name: p.name,
        detail: `${p.cert_name} · ${p.regime || p.family}${p.standards ? ` · ${p.standards}` : ""}`,
        href: `/certifications/${p.cert_slug}/products/${p.slug}`,
      },
      [p.name, p.standards, p.family, p.regime, p.cert_name],
      1
    );
  }

  const testingCats = db
    .prepare(
      `SELECT c.slug, c.name, c.summary,
        (SELECT COUNT(*) FROM testing_services s WHERE s.category_id = c.id) AS service_count
       FROM testing_categories c`
    )
    .all() as Array<{
    slug: string;
    name: string;
    summary: string;
    service_count: number;
  }>;
  for (const c of testingCats) {
    push(
      rows,
      {
        type: "testing-category",
        name: c.name,
        detail: `Product testing · ${c.service_count ?? 0} tests`,
        href: `/testing/${c.slug}`,
      },
      [c.name, c.slug, c.summary],
      2
    );
  }

  const testingServices = db
    .prepare(
      `SELECT s.name, s.slug, s.standards, s.test_type, s.product_category, s.summary,
              s.timeline, s.sample_size,
              c.slug AS category_slug, c.name AS category_name
       FROM testing_services s
       JOIN testing_categories c ON c.id = s.category_id`
    )
    .all() as Array<{
    name: string;
    slug: string;
    standards: string;
    test_type: string;
    product_category: string;
    summary: string;
    timeline: string;
    sample_size: string;
    category_slug: string;
    category_name: string;
  }>;
  for (const s of testingServices) {
    push(
      rows,
      {
        type: "testing-service",
        name: s.name,
        detail: [s.category_name, s.standards, s.test_type, s.timeline ? `Timeline ${s.timeline}` : ""]
          .filter(Boolean)
          .join(" · "),
        href: `/testing/${s.category_slug}/${s.slug}`,
      },
      [s.name, s.standards, s.test_type, s.product_category, s.summary, s.category_name],
      2
    );
  }

  const products = db
    .prepare(
      `SELECT p.name, p.slug, p.standard, p.scheme, p.qco_status, p.hsn4, p.hsn8, p.lab_count,
              c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id`
    )
    .all() as Array<{
    name: string;
    slug: string;
    standard: string;
    scheme: string;
    qco_status: string;
    hsn4: string;
    hsn8: string;
    lab_count: number;
    category_name: string;
  }>;
  for (const p of products) {
    push(
      rows,
      {
        type: "product",
        name: p.name,
        detail: `BIS · ${p.standard} · ${p.scheme}${p.qco_status ? ` · ${p.qco_status}` : ""}`,
        href: `/product/${p.slug}`,
      },
      [p.name, p.standard, p.scheme, p.qco_status, p.hsn4, p.hsn8, p.category_name],
      // Prefer products with more labs when scores tie
      3 + Math.max(0, 20 - Math.min(20, p.lab_count || 0)) * 0.01
    );
  }

  const categories = db
    .prepare(
      `SELECT c.slug, c.name,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM categories c`
    )
    .all() as Array<{ slug: string; name: string; product_count: number }>;
  for (const c of categories) {
    push(
      rows,
      {
        type: "category",
        name: c.name,
        detail: `BIS category · ${c.product_count} products`,
        href: `/category/${c.slug}`,
      },
      [c.name, c.slug],
      4
    );
  }

  const labs = db
    .prepare(`SELECT slug, name, city, state FROM labs`)
    .all() as Array<{ slug: string; name: string; city: string; state: string }>;
  for (const l of labs) {
    push(
      rows,
      {
        type: "lab",
        name: l.name,
        detail: [l.city, l.state].filter(Boolean).join(", ") || "Testing lab",
        href: `/labs/${l.slug}`,
      },
      [l.name, l.city, l.state, l.slug],
      5
    );
  }

  return rows;
}

function getIndex(): IndexRow[] {
  if (!g.__certkoSearchIndex) {
    g.__certkoSearchIndex = buildIndex();
  }
  return g.__certkoSearchIndex;
}

function toResult(row: IndexRow): QuickSearchResult {
  return {
    type: row.type,
    name: row.name,
    detail: row.detail,
    href: row.href,
  };
}

/** Tiny Levenshtein for short fuzzy matches (caps length for speed). */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const aa = a.slice(0, 24);
  const bb = b.slice(0, 24);
  const prev = new Array(bb.length + 1);
  const cur = new Array(bb.length + 1);
  for (let j = 0; j <= bb.length; j++) prev[j] = j;
  for (let i = 1; i <= aa.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= bb.length; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= bb.length; j++) prev[j] = cur[j];
  }
  return prev[bb.length];
}

function scoreExact(row: IndexRow, terms: string[]): number | null {
  let score = 0;
  for (const term of terms) {
    const idx = row.haystack.indexOf(term);
    if (idx < 0) return null;
    score += idx === 0 || row.haystack.startsWith(term) ? 0 : Math.min(40, idx);
    const name = row.name.toLowerCase();
    if (name.includes(term)) score -= 8;
    if (name.startsWith(term)) score -= 16;
  }
  return score + row.boost * 10;
}

/** Instant typeahead search from an in-memory index (no SQL LIKE scans). */
export function quickSearch(
  q: string,
  limit = 12,
  scope: QuickSearchScope = "all"
): QuickSearchResult[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];

  const terms = normalizeQueryTerms(query);
  if (terms.length === 0) return [];

  const allowed = SCOPE_TYPES[scope];
  const index = getIndex().filter((row) => !allowed || allowed.includes(row.type));
  const scored: Array<{ row: IndexRow; score: number }> = [];

  for (const row of index) {
    let score = scoreExact(row, terms);
    if (score == null) continue;
    // Prefer exact standard hits when searching standards
    if (scope === "standard") {
      const compact = query.replace(/[^a-z0-9]/g, "");
      if (compact && row.haystack.includes(compact)) score -= 25;
      if (/\bis\b|\biec\b|\biso\b/i.test(row.detail) || /\bis\b|\biec\b/i.test(row.name)) {
        score -= 6;
      }
    }
    if (scope === "lab" && row.type === "lab") score -= 10;
    if (scope === "certification" && row.type === "certification") score -= 12;
    if (scope === "certification" && row.type === "country") score -= 10;
    if (scope === "all" && row.type === "country") score -= 4;
    scored.push({ row, score });
  }

  scored.sort((a, b) => a.score - b.score || a.row.name.localeCompare(b.row.name));
  if (scored.length > 0) {
    return scored.slice(0, limit).map(({ row }) => toResult(row));
  }

  // No exact hit — return closely related options instead of empty.
  return filterByScope(relatedSearch(query, limit * 2), scope).slice(0, limit);
}

/**
 * Closely related suggestions when the typed term has no exact match.
 * Uses prefixes, partial tokens, and light fuzzy name distance.
 */
export function relatedSearch(q: string, limit = 12): QuickSearchResult[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];

  const index = getIndex();
  const tokens = query.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  const prefixes = new Set<string>();
  prefixes.add(query.slice(0, Math.min(query.length, 6)));
  if (query.length >= 4) prefixes.add(query.slice(0, 4));
  if (query.length >= 3) prefixes.add(query.slice(0, 3));
  for (const t of tokens) {
    prefixes.add(t);
    if (t.length >= 3) prefixes.add(t.slice(0, 3));
    if (t.length >= 4) prefixes.add(t.slice(0, 4));
  }

  const scored: Array<{ row: IndexRow; score: number }> = [];
  const seen = new Set<string>();

  for (const row of index) {
    const key = row.href;
    if (seen.has(key)) continue;
    const name = row.name.toLowerCase();
    let score = 999;

    for (const p of prefixes) {
      if (!p) continue;
      if (name.startsWith(p) || row.haystack.startsWith(p)) {
        score = Math.min(score, 10 + (p.length < 3 ? 20 : 0) + row.boost);
      } else if (name.includes(p) || row.haystack.includes(p)) {
        score = Math.min(score, 30 + Math.max(0, 8 - p.length) + row.boost * 2);
      }
    }

    // Fuzzy: short queries vs first word of name
    const firstWord = name.split(/[^a-z0-9]+/).find((w) => w.length >= 2) || name.slice(0, 16);
    if (query.length <= 12 && firstWord.length >= 2) {
      const d = editDistance(query, firstWord.slice(0, query.length + 2));
      const maxD = query.length <= 4 ? 1 : query.length <= 7 ? 2 : 3;
      if (d <= maxD) score = Math.min(score, 15 + d * 8 + row.boost);
    }

    if (score < 900) {
      seen.add(key);
      scored.push({ row, score });
    }
  }

  scored.sort((a, b) => a.score - b.score || a.row.name.localeCompare(b.row.name));
  return scored.slice(0, limit).map(({ row }) => toResult(row));
}

/** Warm the index after DB boot (optional). */
export function warmSearchIndex() {
  getIndex();
}
