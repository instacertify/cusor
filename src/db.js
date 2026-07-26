const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.CERTKO_DB || path.join(DATA_DIR, 'certko.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS admins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      icon        TEXT DEFAULT '',
      description TEXT DEFAULT '',
      content     TEXT DEFAULT '',
      image       TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT UNIQUE NOT NULL,
      name         TEXT NOT NULL,
      category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      scheme       TEXT DEFAULT 'ISI',
      hsn          TEXT DEFAULT '',
      cost_min     INTEGER DEFAULT 0,
      cost_max     INTEGER DEFAULT 0,
      timeline     TEXT DEFAULT '',
      is_mandatory INTEGER DEFAULT 1,
      summary      TEXT DEFAULT '',
      content      TEXT DEFAULT '',
      image        TEXT DEFAULT '',
      is_popular   INTEGER DEFAULT 0,
      sort_order   INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      role       TEXT DEFAULT '',
      location   TEXT DEFAULT '',
      rating     INTEGER DEFAULT 5,
      quote      TEXT DEFAULT '',
      initial    TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      question   TEXT NOT NULL,
      answer     TEXT DEFAULT '',
      category   TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pages (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      slug             TEXT UNIQUE NOT NULL,
      title            TEXT NOT NULL,
      subtitle         TEXT DEFAULT '',
      body_html        TEXT DEFAULT '',
      image            TEXT DEFAULT '',
      meta_description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS steps (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      icon        TEXT DEFAULT '',
      title       TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT DEFAULT '',
      email      TEXT DEFAULT '',
      phone      TEXT DEFAULT '',
      product    TEXT DEFAULT '',
      message    TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Settings helpers -----------------------------------------------------------
function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value == null ? '' : String(value));
}

function allSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

module.exports = { db, init, getSetting, setSetting, allSettings, DB_PATH };
