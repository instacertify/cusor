import { getDb } from "./db";

export type QuickSearchResult = {
  type:
    | "product"
    | "category"
    | "lab"
    | "certification"
    | "cert-product"
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

function push(
  rows: IndexRow[],
  item: QuickSearchResult,
  haystackParts: Array<string | null | undefined>,
  boost: number
) {
  const haystack = haystackParts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!haystack) return;
  rows.push({ ...item, haystack, boost });
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
        detail: `${c.region} · ${c.full_name}`,
        href: `/certifications/${c.slug}`,
      },
      [c.name, c.full_name, c.slug, c.region, c.summary],
      0
    );
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

/** Instant typeahead search from an in-memory index (no SQL LIKE scans). */
export function quickSearch(q: string, limit = 12): QuickSearchResult[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];

  const terms = query.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const index = getIndex();
  const scored: Array<{ row: IndexRow; score: number }> = [];

  for (const row of index) {
    let score = 0;
    let ok = true;
    for (const term of terms) {
      const idx = row.haystack.indexOf(term);
      if (idx < 0) {
        ok = false;
        break;
      }
      // Prefer earlier matches and name-prefix hits
      score += idx === 0 || row.haystack.startsWith(term) ? 0 : Math.min(40, idx);
      if (row.name.toLowerCase().includes(term)) score -= 8;
      if (row.name.toLowerCase().startsWith(term)) score -= 16;
    }
    if (!ok) continue;
    score += row.boost * 10;
    scored.push({ row, score });
  }

  scored.sort((a, b) => a.score - b.score || a.row.name.localeCompare(b.row.name));

  return scored.slice(0, limit).map(({ row }) => ({
    type: row.type,
    name: row.name,
    detail: row.detail,
    href: row.href,
  }));
}

/** Warm the index after DB boot (optional). */
export function warmSearchIndex() {
  getIndex();
}
