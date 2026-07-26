import fs from "fs";
import path from "path";
import {
  ensureSqliteReady,
  getSqliteDb,
  isSqliteReady,
  type SqliteDatabase,
} from "./sqlite";
import { seedDatabase } from "./seed";
import { ensureCertProductsCatalog } from "./seed-cert-products";
import { ensureTestingCatalog } from "./seed-testing";
import { ensureAuthorsCatalog } from "./authors";
import { ensureSeoLocationPosts } from "./seed-seo-posts";
import { ensurePagesNavColumns } from "./pages-nav";
import { ensureHeroSlidesCatalog } from "./hero-slides";
import { ensureTestimonialsLibrary } from "./seed-testimonials";

/** Prefer ./data; fall back to /tmp when the app dir is not writable (some Node hosts). */
function resolveDbPath(): string {
  const preferredDir = path.join(process.cwd(), "data");
  const preferred = path.join(preferredDir, "certko.db");
  try {
    fs.mkdirSync(preferredDir, { recursive: true });
    fs.accessSync(preferredDir, fs.constants.W_OK);
    return preferred;
  } catch {
    const fallbackDir = path.join("/tmp", "certko-data");
    fs.mkdirSync(fallbackDir, { recursive: true });
    console.warn(
      "[certko] data/ is not writable; using",
      path.join(fallbackDir, "certko.db")
    );
    return path.join(fallbackDir, "certko.db");
  }
}

type DbGlobal = typeof globalThis & {
  __certkoDb?: SqliteDatabase;
  __certkoDbBootstrapped?: boolean;
};

const g = globalThis as DbGlobal;

function bootstrapSchema(db: SqliteDatabase): void {
  // DELETE is safest for sql.js file-export persistence (WAL needs OS sidecar files)
  db.pragma("journal_mode = DELETE");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subheading TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      nav_menu INTEGER NOT NULL DEFAULT 0,
      nav_submenu INTEGER NOT NULL DEFAULT 0,
      nav_footer INTEGER NOT NULL DEFAULT 0,
      nav_label TEXT NOT NULL DEFAULT '',
      nav_detail TEXT NOT NULL DEFAULT '',
      nav_sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'box',
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      timeline TEXT NOT NULL DEFAULT '8-16 weeks',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      standard TEXT NOT NULL DEFAULT '',
      scheme TEXT NOT NULL DEFAULT 'ISI',
      category_id INTEGER NOT NULL REFERENCES categories(id),
      min_price INTEGER,
      max_price INTEGER,
      lab_count INTEGER NOT NULL DEFAULT 0,
      timeline TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      hsn4 TEXT NOT NULL DEFAULT '',
      hsn8 TEXT NOT NULL DEFAULT '',
      qco_status TEXT NOT NULL DEFAULT '',
      qco_order TEXT NOT NULL DEFAULT '',
      fee_large INTEGER,
      fee_medium INTEGER,
      fee_small INTEGER,
      fee_micro INTEGER,
      unit_info TEXT NOT NULL DEFAULT '',
      testing_charges TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

    CREATE TABLE IF NOT EXISTS labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      contact TEXT,
      phone TEXT,
      email TEXT,
      validity TEXT,
      min_price INTEGER,
      max_price INTEGER,
      scope_count INTEGER NOT NULL DEFAULT 0,
      categories TEXT NOT NULL DEFAULT '[]'
    );
    CREATE INDEX IF NOT EXISTS idx_labs_state ON labs(state);

    CREATE TABLE IF NOT EXISTS product_labs (
      product_id INTEGER NOT NULL REFERENCES products(id),
      lab_id INTEGER NOT NULL REFERENCES labs(id),
      price INTEGER,
      PRIMARY KEY (product_id, lab_id)
    );
    CREATE INDEX IF NOT EXISTS idx_product_labs_lab ON product_labs(lab_id);

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scope TEXT NOT NULL DEFAULT 'global',
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_faqs_scope ON faqs(scope);

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      sort INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'award',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS qcos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      ministry TEXT NOT NULL DEFAULT '',
      hsn4 TEXT NOT NULL DEFAULT '',
      hsn8 TEXT NOT NULL DEFAULT '',
      standard TEXT NOT NULL DEFAULT '',
      enforcement_date TEXT NOT NULL DEFAULT '',
      scheme TEXT NOT NULL DEFAULT 'ISI',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT 'Certko Team',
      author_id INTEGER REFERENCES authors(id),
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

    CREATE TABLE IF NOT EXISTS seo_meta (
      entity TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      focus_keyword TEXT NOT NULL DEFAULT '',
      secondary_keywords TEXT NOT NULL DEFAULT '',
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      canonical TEXT NOT NULL DEFAULT '',
      robots_index INTEGER NOT NULL DEFAULT 1,
      robots_follow INTEGER NOT NULL DEFAULT 1,
      robots_noarchive INTEGER NOT NULL DEFAULT 0,
      robots_nosnippet INTEGER NOT NULL DEFAULT 0,
      sitemap_include INTEGER NOT NULL DEFAULT 1,
      schema_types TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      product TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'new'
    );

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

    CREATE TABLE IF NOT EXISTS testing_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'microscope',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testing_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES testing_categories(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      product_category TEXT NOT NULL DEFAULT '',
      standards TEXT NOT NULL DEFAULT '',
      test_type TEXT NOT NULL DEFAULT '',
      accreditation TEXT NOT NULL DEFAULT 'ISO/IEC 17025 / NABL',
      timeline TEXT NOT NULL DEFAULT '',
      sample_size TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      UNIQUE(category_id, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_testing_services_cat ON testing_services(category_id);
    CREATE INDEX IF NOT EXISTS idx_testing_services_name ON testing_services(name);

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      media TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL DEFAULT 'image',
      poster TEXT NOT NULL DEFAULT '',
      link_href TEXT NOT NULL DEFAULT '',
      link_label TEXT NOT NULL DEFAULT '',
      duration_ms INTEGER NOT NULL DEFAULT 6000,
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      ip TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at);
  `);

  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM categories").get() as { n: number }
  ).n;
  if (count === 0) {
    seedDatabase(db);
  }
  ensureCertProductsCatalog(db);
  ensureTestingCatalog(db);
  ensureAuthorsCatalog(db);
  ensureSeoLocationPosts(db);
  ensurePagesNavColumns(db);
  ensureHeroSlidesCatalog(db);
  ensureTestimonialsLibrary(db);
  clearLegacyHomeAnnouncement(db);
}

function runEnsures(db: SqliteDatabase) {
  ensureCertProductsCatalog(db);
  ensureTestingCatalog(db);
  ensureAuthorsCatalog(db);
  ensureSeoLocationPosts(db);
  ensurePagesNavColumns(db);
  ensureHeroSlidesCatalog(db);
  ensureTestimonialsLibrary(db);
  clearLegacyHomeAnnouncement(db);
}

/** Remove the old default homepage announcement chip from existing installs. */
function clearLegacyHomeAnnouncement(db: SqliteDatabase) {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'announcement'")
    .get() as { value: string } | undefined;
  const value = (row?.value || "").trim();
  if (!value) return;
  if (
    value.includes("Updated July 2026") ||
    (value.includes("400+ labs") && value.includes("BIS") && value.includes("BEE"))
  ) {
    db.prepare(
      "INSERT INTO settings (key, value) VALUES ('announcement', '') ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run();
  }
}

/** Call once on server start (instrumentation / root layout). Idempotent. */
export async function ensureDbReady(): Promise<void> {
  try {
    const dbPath = resolveDbPath();
    await ensureSqliteReady(dbPath);
    if (!g.__certkoDbBootstrapped || !g.__certkoDb) {
      const db = getSqliteDb();
      bootstrapSchema(db);
      g.__certkoDb = db;
      g.__certkoDbBootstrapped = true;
    }
  } catch (err) {
    console.error("[certko] ensureDbReady failed:", err);
    throw err;
  }
}

/**
 * Eager init: any server import of this module waits until SQLite is ready.
 * Fixes Next.js parallel RSC (pages/Header can run before layout's await finishes),
 * which previously threw "Database not ready" → intermittent 500/503 on Hostinger.
 */
await ensureDbReady();

export function getDb(): SqliteDatabase {
  if (!isSqliteReady() || !g.__certkoDb) {
    throw new Error(
      "Database not ready yet. ensureDbReady() must complete before handling requests."
    );
  }
  return g.__certkoDb;
}

export function getSetting(key: string, fallback = ""): string {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function getSettings(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
  description: string;
  image: string;
  timeline: string;
  sort: number;
  product_count?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  standard: string;
  scheme: string;
  category_id: number;
  min_price: number | null;
  max_price: number | null;
  lab_count: number;
  timeline: string;
  description: string;
  image: string;
  featured: number;
  meta_title: string;
  meta_description: string;
  hsn4: string;
  hsn8: string;
  qco_status: string;
  qco_order: string;
  fee_large: number | null;
  fee_medium: number | null;
  fee_small: number | null;
  fee_micro: number | null;
  unit_info: string;
  testing_charges: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  category_image?: string;
}

export interface Certification {
  id: number;
  slug: string;
  name: string;
  full_name: string;
  region: string;
  icon: string;
  summary: string;
  content: string;
  image: string;
  meta_title: string;
  meta_description: string;
  sort: number;
}

export interface Qco {
  id: number;
  product: string;
  ministry: string;
  hsn4: string;
  hsn8: string;
  standard: string;
  enforcement_date: string;
  scheme: string;
  sort: number;
}

export interface Lab {
  id: number;
  slug: string;
  code: string | null;
  name: string;
  city: string;
  state: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  validity: string | null;
  min_price: number | null;
  max_price: number | null;
  scope_count: number;
  categories: string;
}

export interface Faq {
  id: number;
  scope: string;
  question: string;
  answer: string;
  sort: number;
}

export interface PageRecord {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  hero_heading: string;
  hero_subheading: string;
  content: string;
  image: string;
  nav_menu: number;
  nav_submenu: number;
  nav_footer: number;
  nav_label: string;
  nav_detail: string;
  nav_sort: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  sort: number;
  featured: number;
}

export interface Author {
  id: number;
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  sort: number;
  created_at: string;
  post_count?: number;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  author_id: number | null;
  status: string;
  published_at: string | null;
  created_at: string;
  meta_title: string;
  meta_description: string;
  author_slug?: string | null;
  author_name?: string | null;
  author_title?: string | null;
  author_image?: string | null;
  author_bio?: string | null;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  product: string;
  message: string;
  created_at: string;
  status: string;
}

export interface CertProduct {
  id: number;
  certification_id: number;
  slug: string;
  name: string;
  family: string;
  regime: string;
  standards: string;
  summary: string;
  content: string;
  image: string;
  min_price: number | null;
  max_price: number | null;
  labs: string;
  fee_note: string;
  extras: string;
  sort: number;
  cert_slug?: string;
  cert_name?: string;
  cert_region?: string;
}

export interface TestingCategory {
  id: number;
  slug: string;
  name: string;
  icon: string;
  summary: string;
  content: string;
  image: string;
  meta_title: string;
  meta_description: string;
  sort: number;
  service_count?: number;
}

export interface TestingService {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  product_category: string;
  standards: string;
  test_type: string;
  accreditation: string;
  timeline: string;
  sample_size: string;
  summary: string;
  content: string;
  image: string;
  meta_title: string;
  meta_description: string;
  sort: number;
  category_slug?: string;
  category_name?: string;
  category_icon?: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  media: string;
  media_type: "image" | "gif" | "video" | string;
  poster: string;
  link_href: string;
  link_label: string;
  duration_ms: number;
  active: number;
  sort: number;
  created_at: string;
}
