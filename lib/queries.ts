import { getDb } from "./db";
import type {
  Category,
  Product,
  Lab,
  Faq,
  PageRecord,
  Testimonial,
  Qco,
  Certification,
} from "./db";

// ---------- categories ----------
export function getCategories(): Category[] {
  return getDb()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM categories c ORDER BY product_count DESC`
    )
    .all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getDb()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM categories c WHERE c.slug = ?`
    )
    .get(slug) as Category | undefined;
}

// ---------- products ----------
const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon, c.image AS category_image
  FROM products p JOIN categories c ON c.id = p.category_id`;

export function getProductBySlug(slug: string): Product | undefined {
  return getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.slug = ?`)
    .get(slug) as Product | undefined;
}

export function getProductById(id: number): Product | undefined {
  return getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.id = ?`)
    .get(id) as Product | undefined;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.featured = 1 ORDER BY p.lab_count DESC LIMIT ?`)
    .all(limit) as Product[];
}

export function getProductsByCategory(categoryId: number): Product[] {
  return getDb()
    .prepare(`${PRODUCT_SELECT} WHERE p.category_id = ? ORDER BY p.lab_count DESC, p.name`)
    .all(categoryId) as Product[];
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return getDb()
    .prepare(
      `${PRODUCT_SELECT} WHERE p.category_id = ? AND p.id != ? ORDER BY p.lab_count DESC LIMIT ?`
    )
    .all(product.category_id, product.id, limit) as Product[];
}

const SEARCH_WHERE = `p.name LIKE @like OR p.standard LIKE @like OR c.name LIKE @like
  OR (@hsn != '' AND (p.hsn4 LIKE @hsn OR p.hsn8 LIKE @hsn))`;

function searchParamsFor(q: string) {
  const trimmed = q.trim();
  return {
    like: `%${trimmed.replace(/\s+/g, "%")}%`,
    // numeric queries also match HSN codes (prefix match)
    hsn: /^\d{2,8}$/.test(trimmed) ? `${trimmed}%` : "",
  };
}

export function searchProducts(q: string, limit = 30, offset = 0): Product[] {
  return getDb()
    .prepare(
      `${PRODUCT_SELECT}
       WHERE ${SEARCH_WHERE}
       ORDER BY p.lab_count DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...searchParamsFor(q), limit, offset }) as Product[];
}

export function countSearchProducts(q: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id = p.category_id
       WHERE ${SEARCH_WHERE}`
    )
    .get(searchParamsFor(q)) as { n: number };
  return row.n;
}

export interface ProductTableFilter {
  q?: string;
  categoryId?: number;
  qcoStatus?: string;
  scheme?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

const TABLE_SORTS: Record<string, string> = {
  labs: "p.lab_count DESC, p.name",
  name: "p.name",
  price_low: "p.min_price IS NULL, p.min_price ASC",
  price_high: "p.max_price IS NULL, p.max_price DESC",
  fee: "p.fee_large IS NULL, p.fee_large DESC",
};

export function queryProductsTable(
  filter: ProductTableFilter
): { products: Product[]; total: number } {
  const clauses: string[] = [];
  const params: Record<string, string | number> = {};
  if (filter.q?.trim()) {
    const sp = searchParamsFor(filter.q);
    clauses.push(`(${SEARCH_WHERE})`);
    params.like = sp.like;
    params.hsn = sp.hsn;
  }
  if (filter.categoryId) {
    clauses.push("p.category_id = @categoryId");
    params.categoryId = filter.categoryId;
  }
  if (filter.qcoStatus) {
    clauses.push("p.qco_status = @qcoStatus");
    params.qcoStatus = filter.qcoStatus;
  }
  if (filter.scheme) {
    clauses.push("p.scheme = @scheme");
    params.scheme = filter.scheme;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderBy = TABLE_SORTS[filter.sort ?? ""] ?? TABLE_SORTS.labs;
  const total = (
    getDb()
      .prepare(
        `SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id = p.category_id ${where}`
      )
      .get(params) as { n: number }
  ).n;
  const products = getDb()
    .prepare(
      `${PRODUCT_SELECT} ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: filter.limit ?? 25, offset: filter.offset ?? 0 }) as Product[];
  return { products, total };
}

export function getQcoStatuses(): { qco_status: string; n: number }[] {
  return getDb()
    .prepare(
      "SELECT qco_status, COUNT(*) AS n FROM products WHERE qco_status != '' GROUP BY qco_status ORDER BY n DESC"
    )
    .all() as { qco_status: string; n: number }[];
}

export function countProducts(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }).n;
}

export function getAllProductSlugs(): { slug: string }[] {
  return getDb().prepare("SELECT slug FROM products").all() as { slug: string }[];
}

// ---------- labs ----------
export function countLabs(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM labs").get() as { n: number }).n;
}

export interface LabFilter {
  state?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export function getLabs(filter: LabFilter = {}): { labs: Lab[]; total: number } {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (filter.state) {
    clauses.push("state = ?");
    params.push(filter.state);
  }
  if (filter.category) {
    clauses.push("categories LIKE ?");
    params.push(`%${filter.category}%`);
  }
  if (filter.q) {
    clauses.push("(name LIKE ? OR city LIKE ?)");
    const like = `%${filter.q.trim()}%`;
    params.push(like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    getDb().prepare(`SELECT COUNT(*) AS n FROM labs ${where}`).get(...params) as { n: number }
  ).n;
  const labs = getDb()
    .prepare(`SELECT * FROM labs ${where} ORDER BY name LIMIT ? OFFSET ?`)
    .all(...params, filter.limit ?? 24, filter.offset ?? 0) as Lab[];
  return { labs, total };
}

export function getLabBySlug(slug: string): Lab | undefined {
  return getDb().prepare("SELECT * FROM labs WHERE slug = ?").get(slug) as Lab | undefined;
}

export function getLabStates(): { state: string; n: number }[] {
  return getDb()
    .prepare(
      "SELECT state, COUNT(*) AS n FROM labs WHERE state != '' GROUP BY state ORDER BY n DESC"
    )
    .all() as { state: string; n: number }[];
}

export function getLabsForProduct(productId: number): (Lab & { price: number | null })[] {
  return getDb()
    .prepare(
      `SELECT l.*, pl.price FROM product_labs pl JOIN labs l ON l.id = pl.lab_id
       WHERE pl.product_id = ? ORDER BY pl.price IS NULL, pl.price`
    )
    .all(productId) as (Lab & { price: number | null })[];
}

export function getProductsForLab(labId: number, limit = 50): Product[] {
  return getDb()
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon, c.image AS category_image
       FROM product_labs pl
       JOIN products p ON p.id = pl.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE pl.lab_id = ? ORDER BY p.name LIMIT ?`
    )
    .all(labId, limit) as Product[];
}

// ---------- faqs ----------
export function getFaqs(scope: string): Faq[] {
  return getDb()
    .prepare("SELECT * FROM faqs WHERE scope = ? ORDER BY sort, id")
    .all(scope) as Faq[];
}

// ---------- pages ----------
export function getPage(slug: string): PageRecord | undefined {
  return getDb().prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as
    | PageRecord
    | undefined;
}

export function getTestimonials(): Testimonial[] {
  return getDb()
    .prepare("SELECT * FROM testimonials ORDER BY sort, id")
    .all() as Testimonial[];
}

// ---------- upcoming QCOs ----------
export function getUpcomingQcos(): Qco[] {
  return getDb()
    .prepare(
      `SELECT * FROM qcos
       ORDER BY substr(enforcement_date, 7, 4) || substr(enforcement_date, 4, 2) || substr(enforcement_date, 1, 2), sort`
    )
    .all() as Qco[];
}

export function getQcoById(id: number): Qco | undefined {
  return getDb().prepare("SELECT * FROM qcos WHERE id = ?").get(id) as Qco | undefined;
}

// ---------- certifications ----------
export function getCertifications(): Certification[] {
  return getDb()
    .prepare("SELECT * FROM certifications ORDER BY sort, id")
    .all() as Certification[];
}

export function getCertificationBySlug(slug: string): Certification | undefined {
  return getDb()
    .prepare("SELECT * FROM certifications WHERE slug = ?")
    .get(slug) as Certification | undefined;
}
