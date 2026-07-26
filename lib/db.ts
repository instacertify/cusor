import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./seed";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "certko.db");

declare global {
  var __certkoDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
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
      image TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📦',
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
      meta_description TEXT NOT NULL DEFAULT ''
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
      sort INTEGER NOT NULL DEFAULT 0
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
  `);

  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM categories").get() as { n: number }
  ).n;
  if (count === 0) {
    seedDatabase(db);
  }
  return db;
}

export function getDb(): Database.Database {
  if (!global.__certkoDb) {
    global.__certkoDb = createDb();
  }
  return global.__certkoDb;
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
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  category_image?: string;
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
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  sort: number;
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
