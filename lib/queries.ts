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
  Post,
  Author,
  CertProduct,
  TestingCategory,
  TestingService,
  HeroSlide,
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

// ---------- authors ----------
const POST_AUTHOR_SELECT = `
  p.*,
  a.slug AS author_slug,
  a.name AS author_name,
  a.title AS author_title,
  a.image AS author_image,
  a.bio AS author_bio
`;

export function getAuthors(): Author[] {
  return getDb()
    .prepare(
      `SELECT a.*,
        (SELECT COUNT(*) FROM posts p WHERE p.author_id = a.id) AS post_count
       FROM authors a
       ORDER BY a.sort, a.name`
    )
    .all() as Author[];
}

export function getAuthorById(id: number): Author | undefined {
  return getDb().prepare("SELECT * FROM authors WHERE id = ?").get(id) as
    | Author
    | undefined;
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return getDb().prepare("SELECT * FROM authors WHERE slug = ?").get(slug) as
    | Author
    | undefined;
}

export function getPublishedPostsByAuthor(authorId: number, limit = 50): Post[] {
  return getDb()
    .prepare(
      `SELECT ${POST_AUTHOR_SELECT}
       FROM posts p
       LEFT JOIN authors a ON a.id = p.author_id
       WHERE p.status = 'published' AND p.author_id = ?
       ORDER BY p.published_at DESC, p.id DESC
       LIMIT ?`
    )
    .all(authorId, limit) as Post[];
}

// ---------- blog posts ----------
export function getPublishedPosts(limit = 50, offset = 0): Post[] {
  return getDb()
    .prepare(
      `SELECT ${POST_AUTHOR_SELECT}
       FROM posts p
       LEFT JOIN authors a ON a.id = p.author_id
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC, p.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as Post[];
}

export function getPostBySlug(slug: string): Post | undefined {
  return getDb()
    .prepare(
      `SELECT ${POST_AUTHOR_SELECT}
       FROM posts p
       LEFT JOIN authors a ON a.id = p.author_id
       WHERE p.slug = ?`
    )
    .get(slug) as Post | undefined;
}

export function getAllPosts(): Post[] {
  return getDb()
    .prepare(
      `SELECT ${POST_AUTHOR_SELECT}
       FROM posts p
       LEFT JOIN authors a ON a.id = p.author_id
       ORDER BY p.id DESC`
    )
    .all() as Post[];
}

export function getPostById(id: number): Post | undefined {
  return getDb()
    .prepare(
      `SELECT ${POST_AUTHOR_SELECT}
       FROM posts p
       LEFT JOIN authors a ON a.id = p.author_id
       WHERE p.id = ?`
    )
    .get(id) as Post | undefined;
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

export function getAllPages(): PageRecord[] {
  return getDb()
    .prepare("SELECT * FROM pages ORDER BY nav_sort, title, slug")
    .all() as PageRecord[];
}

export type PageNavLocation = "menu" | "submenu" | "footer";

export function getPagesForNav(location: PageNavLocation): PageRecord[] {
  const column =
    location === "menu" ? "nav_menu" : location === "submenu" ? "nav_submenu" : "nav_footer";
  return getDb()
    .prepare(
      `SELECT * FROM pages WHERE ${column} = 1 AND slug NOT IN ('home')
       ORDER BY nav_sort, title, slug`
    )
    .all() as PageRecord[];
}

export function getRoutableContentPages(): PageRecord[] {
  return getDb()
    .prepare(
      `SELECT * FROM pages
       WHERE slug NOT IN ('home', 'contact')
       ORDER BY nav_sort, title, slug`
    )
    .all() as PageRecord[];
}

export function getTestimonials(): Testimonial[] {
  return getDb()
    .prepare("SELECT * FROM testimonials ORDER BY sort, id")
    .all() as Testimonial[];
}

// ---------- hero slider ----------
export function getActiveHeroSlides(): HeroSlide[] {
  return getDb()
    .prepare(
      `SELECT * FROM hero_slides WHERE active = 1 AND media != ''
       ORDER BY sort, id`
    )
    .all() as HeroSlide[];
}

export function getAllHeroSlides(): HeroSlide[] {
  return getDb()
    .prepare("SELECT * FROM hero_slides ORDER BY sort, id")
    .all() as HeroSlide[];
}

export function getHeroSlideById(id: number): HeroSlide | undefined {
  return getDb().prepare("SELECT * FROM hero_slides WHERE id = ?").get(id) as
    | HeroSlide
    | undefined;
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

// ---------- cert products (BEE, GMARK, future catalogues) ----------
export function getCertProducts(certificationId: number): CertProduct[] {
  return getDb()
    .prepare(
      `SELECT cp.*, c.slug AS cert_slug, c.name AS cert_name, c.region AS cert_region
       FROM cert_products cp
       JOIN certifications c ON c.id = cp.certification_id
       WHERE cp.certification_id = ?
       ORDER BY cp.sort, cp.name`
    )
    .all(certificationId) as CertProduct[];
}

export function getCertProductBySlug(
  certSlug: string,
  productSlug: string
): CertProduct | undefined {
  return getDb()
    .prepare(
      `SELECT cp.*, c.slug AS cert_slug, c.name AS cert_name, c.region AS cert_region
       FROM cert_products cp
       JOIN certifications c ON c.id = cp.certification_id
       WHERE c.slug = ? AND cp.slug = ?`
    )
    .get(certSlug, productSlug) as CertProduct | undefined;
}

export function searchCertProducts(q: string, limit = 8): CertProduct[] {
  const like = `%${q}%`;
  return getDb()
    .prepare(
      `SELECT cp.*, c.slug AS cert_slug, c.name AS cert_name, c.region AS cert_region
       FROM cert_products cp
       JOIN certifications c ON c.id = cp.certification_id
       WHERE cp.name LIKE ? OR cp.standards LIKE ? OR cp.family LIKE ? OR c.name LIKE ?
       ORDER BY
         CASE WHEN cp.name LIKE ? THEN 0 ELSE 1 END,
         cp.sort, cp.name
       LIMIT ?`
    )
    .all(like, like, like, like, `${q}%`, limit) as CertProduct[];
}

export function countCertProducts(certificationId?: number): number {
  if (certificationId) {
    return (
      getDb()
        .prepare("SELECT COUNT(*) AS n FROM cert_products WHERE certification_id = ?")
        .get(certificationId) as { n: number }
    ).n;
  }
  return (getDb().prepare("SELECT COUNT(*) AS n FROM cert_products").get() as { n: number }).n;
}

// ---------- product testing ----------
export function getTestingCategories(): TestingCategory[] {
  return getDb()
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM testing_services s WHERE s.category_id = c.id) AS service_count
       FROM testing_categories c
       ORDER BY c.sort, c.id`
    )
    .all() as TestingCategory[];
}

export function getTestingCategoryBySlug(slug: string): TestingCategory | undefined {
  return getDb()
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM testing_services s WHERE s.category_id = c.id) AS service_count
       FROM testing_categories c WHERE c.slug = ?`
    )
    .get(slug) as TestingCategory | undefined;
}

export function getTestingServices(categoryId: number): TestingService[] {
  return getDb()
    .prepare(
      `SELECT s.*, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon
       FROM testing_services s
       JOIN testing_categories c ON c.id = s.category_id
       WHERE s.category_id = ?
       ORDER BY s.sort, s.name`
    )
    .all(categoryId) as TestingService[];
}

export function getTestingServiceBySlug(
  categorySlug: string,
  serviceSlug: string
): TestingService | undefined {
  return getDb()
    .prepare(
      `SELECT s.*, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon
       FROM testing_services s
       JOIN testing_categories c ON c.id = s.category_id
       WHERE c.slug = ? AND s.slug = ?`
    )
    .get(categorySlug, serviceSlug) as TestingService | undefined;
}

export function searchTestingServices(q: string, limit = 8): TestingService[] {
  const like = `%${q}%`;
  return getDb()
    .prepare(
      `SELECT s.*, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon
       FROM testing_services s
       JOIN testing_categories c ON c.id = s.category_id
       WHERE s.name LIKE ? OR s.standards LIKE ? OR s.test_type LIKE ?
          OR s.product_category LIKE ? OR s.summary LIKE ? OR c.name LIKE ?
       ORDER BY
         CASE WHEN s.name LIKE ? THEN 0 WHEN c.name LIKE ? THEN 1 ELSE 2 END,
         s.sort, s.name
       LIMIT ?`
    )
    .all(like, like, like, like, like, like, `${q}%`, `${q}%`, limit) as TestingService[];
}

export function getAllTestingServices(limit = 100): TestingService[] {
  return getDb()
    .prepare(
      `SELECT s.*, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon
       FROM testing_services s
       JOIN testing_categories c ON c.id = s.category_id
       ORDER BY c.sort, s.sort, s.name
       LIMIT ?`
    )
    .all(limit) as TestingService[];
}

export function countTestingServices(categoryId?: number): number {
  if (categoryId) {
    return (
      getDb()
        .prepare("SELECT COUNT(*) AS n FROM testing_services WHERE category_id = ?")
        .get(categoryId) as { n: number }
    ).n;
  }
  return (getDb().prepare("SELECT COUNT(*) AS n FROM testing_services").get() as { n: number }).n;
}
