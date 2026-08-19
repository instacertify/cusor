import {
  ensureSqliteReady,
  getSqliteDb,
  isSqliteReady,
  type SqliteDatabase,
} from "./sqlite";
import { seedDatabase } from "./seed";
import { ensureCertProductsCatalog } from "./seed-cert-products";
import { ensureTestingCatalog } from "./seed-testing";
import { ensureBisStandardsInTestingCatalog } from "./seed-bis-testing-map";
import { ensureAuthorsCatalog } from "./authors";
import { ensureSeoLocationPosts } from "./seed-seo-posts";
import { ensureMigrationPosts } from "./seed-migration-posts";
import { ensureMsdsPosts } from "./seed-msds-posts";
import { ensureScheduledFaqPosts } from "./seed-scheduled-faq-posts";
import { syncBlogScheduleStatuses } from "./blog-schedule-sync";
import { ensurePagesNavColumns } from "./pages-nav";
import { ensureLandingPages } from "./seed-landing-pages";
import { ensureHeroSlidesCatalog } from "./hero-slides";
import { ensureTestimonialsLibrary } from "./seed-testimonials";
import { ensureTrustedBrandsLibrary } from "./seed-trusted-brands";
import { ensureCountryHubsLibrary } from "./seed-country-hubs";
import { ensureGdprLibrary } from "./seed-gdpr";
import { PRIVACY_CONTENT, TERMS_CONTENT } from "./legal-content";
import { CONTACT_POPUP_DEFAULTS } from "./contact-popup";
import { getCertkoDataDir, getCertkoDbPath } from "./storage-paths";

/**
 * Persistent CMS data directory (SQLite + uploads).
 * Prefer CERTKO_DATA_DIR / /var/lib/certko so deploys never wipe content.
 */
export function getWritableDataDir(): string {
  return getCertkoDataDir();
}

function resolveDbPath(): string {
  return getCertkoDbPath();
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
      nav_sort INTEGER NOT NULL DEFAULT 0,
      page_type TEXT NOT NULL DEFAULT 'content',
      cta_label TEXT NOT NULL DEFAULT '',
      cta_href TEXT NOT NULL DEFAULT ''
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

    CREATE TABLE IF NOT EXISTS trusted_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
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
    CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at);

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
      intent TEXT NOT NULL DEFAULT '',
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
      min_price REAL,
      max_price REAL,
      price_note TEXT NOT NULL DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS product_testing_services (
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      testing_service_id INTEGER NOT NULL REFERENCES testing_services(id) ON DELETE CASCADE,
      sort INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (product_id, testing_service_id)
    );
    CREATE INDEX IF NOT EXISTS idx_product_testing_svc ON product_testing_services(testing_service_id);

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
  ensureBisStandardsInTestingCatalog(db);
  ensureAuthorsCatalog(db);
  ensureSeoLocationPosts(db);
  ensureMigrationPosts(db);
  ensureMsdsPosts(db);
  ensureScheduledFaqPosts(db);
  // FAQ + other seeded posts: never leave future dates live.
  syncBlogScheduleStatuses(db);
  ensurePagesNavColumns(db);
  ensureLandingPages(db);
  ensureHeroSlidesCatalog(db);
  ensureTestimonialsLibrary(db);
  ensureTrustedBrandsLibrary(db);
  ensureCountryHubsLibrary(db);
  clearLegacyHomeAnnouncement(db);
  ensureContactExpertCopy(db);
  ensureCanonicalContactAddress(db);
  ensureContactPageFaqsGlobalCopy(db);
  ensureHomeHeroTestingSolutionCopy(db);
  ensureCanonicalCertMarketRegions(db);
  ensureHomeStatLabels(db);
  ensureExpertCtaSettings(db);
  ensureSolutionPartnerIdentity(db);
  ensureContactPopupSettings(db);
  scrubLabPublicContactDetails(db);
  ensureGdprLibrary(db);
}

function runEnsures(db: SqliteDatabase) {
  ensureCertProductsCatalog(db);
  ensureTestingCatalog(db);
  ensureBisStandardsInTestingCatalog(db);
  ensureAuthorsCatalog(db);
  ensureSeoLocationPosts(db);
  ensureMigrationPosts(db);
  ensureMsdsPosts(db);
  ensureScheduledFaqPosts(db);
  // FAQ + other seeded posts: never leave future dates live.
  syncBlogScheduleStatuses(db);
  ensurePagesNavColumns(db);
  ensureLandingPages(db);
  ensureHeroSlidesCatalog(db);
  ensureTestimonialsLibrary(db);
  ensureTrustedBrandsLibrary(db);
  ensureCountryHubsLibrary(db);
  clearLegacyHomeAnnouncement(db);
  ensureContactExpertCopy(db);
  ensureCanonicalContactAddress(db);
  ensureContactPageFaqsGlobalCopy(db);
  ensureHomeHeroTestingSolutionCopy(db);
  ensureCanonicalCertMarketRegions(db);
  ensureHomeStatLabels(db);
  ensureExpertCtaSettings(db);
  ensureSolutionPartnerIdentity(db);
  ensureContactPopupSettings(db);
  scrubLabPublicContactDetails(db);
  ensureGdprLibrary(db);
}

/** Replace AI-ish default homepage stat labels on existing installs. */
function ensureHomeStatLabels(db: SqliteDatabase) {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'stat_3_label'")
    .get() as { value: string } | undefined;
  const value = (row?.value || "").trim();
  if (!value || value === "Information Library") {
    db.prepare(
      "INSERT INTO settings (key, value) VALUES ('stat_3_label', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run("Free product data");
  }
}

/** Seed editable expert-CTA labels (header / floating button) if missing. */
function ensureExpertCtaSettings(db: SqliteDatabase) {
  const defaults: Record<string, string> = {
    expert_cta_label: "Talk to a certification expert",
    expert_cta_label_short: "Talk to expert",
    expert_cta_href: "/contact?intent=expert",
  };
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING"
  );
  for (const [key, value] of Object.entries(defaults)) {
    upsert.run(key, value);
  }
}

const SOLUTION_PARTNER_TAGLINE =
  "Your solution partner for certification and compliance.";

/**
 * Migrate public brand identity to “solution partner for certification and compliance”
 * on existing installs (seed uses INSERT OR IGNORE).
 */
function ensureSolutionPartnerIdentity(db: SqliteDatabase) {
  const getSetting = (key: string) =>
    (
      db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
        | { value: string }
        | undefined
    )?.value?.trim() ?? "";

  const setSetting = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );

  const settingMigrations: { key: string; from: string[]; to: string }[] = [
    {
      key: "tagline",
      from: [
        "Your trusted global compliance partner.",
        "Your trusted global compliance partner",
      ],
      to: SOLUTION_PARTNER_TAGLINE,
    },
    {
      key: "cta_heading",
      from: ["Need a hand with certification or testing?"],
      to: "Looking for a certification and compliance partner?",
    },
    {
      key: "cta_text",
      from: [
        "Our consultants handle filings, lab coordination and inspections for India and export markets. Ask for a free quote — we reply within 24 hours.",
      ],
      to: "Certko helps with scheme mapping, lab coordination and filings for India and export markets. Ask for a free quote — we reply within 24 hours.",
    },
    {
      key: "footer_text",
      from: [
        "Certko is run by Instacertify Labs Private Limited. We publish product, lab and scheme guidance — we are not a government body. Fees and timelines are indicative; confirm with the regulator and lab before you commit.",
      ],
      to: "Certko — by Instacertify Labs Private Limited — is your solution partner for certification and compliance. We publish product, lab and scheme guidance and are not a government body. Fees and timelines are indicative; confirm with the regulator and lab before you commit.",
    },
  ];

  for (const m of settingMigrations) {
    const current = getSetting(m.key);
    if (!current || m.from.includes(current)) {
      setSetting.run(m.key, m.to);
    }
  }

  const about = db
    .prepare(
      "SELECT meta_title, meta_description, hero_heading, hero_subheading, content, nav_detail FROM pages WHERE slug = 'about'"
    )
    .get() as
    | {
        meta_title: string;
        meta_description: string;
        hero_heading: string;
        hero_subheading: string;
        content: string;
        nav_detail: string;
      }
    | undefined;

  if (about) {
    const nextMetaTitle =
      !about.meta_title ||
      about.meta_title === "About Certko | BIS Certification Intelligence"
        ? "About Certko | Certification & Compliance Solution Partner"
        : about.meta_title;
    const nextMetaDesc =
      !about.meta_description ||
      about.meta_description ===
        "Certko makes Indian product compliance transparent with a free BIS product database, lab directory and expert network."
        ? "Certko is your solution partner for certification and compliance — product and scheme guidance, testing pathways and expert support for India and export markets."
        : about.meta_description;
    const nextHero =
      !about.hero_heading || about.hero_heading === "Compliance, made transparent"
        ? "Your solution partner for certification and compliance"
        : about.hero_heading;
    const nextSub =
      !about.hero_subheading ||
      about.hero_subheading ===
        "Certko turns official BIS laboratory data into a free, searchable intelligence platform for manufacturers and importers."
        ? "From scheme mapping to lab pathways and filings, Certko helps manufacturers and importers get compliance done — with clear data and practical support."
        : about.hero_subheading;
    const nextNav =
      !about.nav_detail || about.nav_detail === "Our data and mission"
        ? "Certification & compliance solution partner"
        : about.nav_detail;
    const nextContent =
      /independent information platform|make Indian product compliance transparent/i.test(
        about.content || ""
      )
        ? `## Our mission

Certko is your **solution partner for certification and compliance**. We help manufacturers and importers map the right schemes, choose testing pathways, and move from research to filings — for India and export markets.

BIS and other marks are mandatory for hundreds of product categories, yet teams still struggle to answer three basics: **which standard applies, what testing really costs, and which lab can do it**.

## What we offer

- **Product & scheme intelligence** — notified products mapped to IS standards, schemes, indicative costs and approved labs.
- **Testing pathways** — searchable directories of recognised laboratories with scopes and ballpark pricing.
- **Hands-on support** — consultants who coordinate applications, lab booking and inspection readiness end-to-end.

## How we work

We combine free compliance data with practical execution support. Start with the product checker, then ask Certko to quote the next step when you are ready. Lab scope and pricing data is compiled from official recognition records; prices are indicative, exclude GST, and should be confirmed with the laboratory. Certko is not affiliated with the Bureau of Indian Standards and is not a government body.`
        : about.content;

    db.prepare(
      `UPDATE pages SET meta_title = ?, meta_description = ?, hero_heading = ?, hero_subheading = ?, content = ?, nav_detail = ?
       WHERE slug = 'about'`
    ).run(nextMetaTitle, nextMetaDesc, nextHero, nextSub, nextContent, nextNav);
  }

  const home = db
    .prepare("SELECT meta_title, meta_description FROM pages WHERE slug = 'home'")
    .get() as { meta_title: string; meta_description: string } | undefined;
  if (home) {
    const nextTitle =
      !home.meta_title ||
      home.meta_title === "BIS Certification Checker | Standards, Costs & Labs | Certko"
        ? "Certko | Certification & Compliance Solution Partner"
        : home.meta_title;
    const nextDesc =
      !home.meta_description ||
      home.meta_description.startsWith("Free BIS certification checker.")
        ? "Your solution partner for certification and compliance. Search products and schemes, compare testing pathways and get expert help for India and export markets."
        : home.meta_description;
    if (nextTitle !== home.meta_title || nextDesc !== home.meta_description) {
      db.prepare(
        "UPDATE pages SET meta_title = ?, meta_description = ? WHERE slug = 'home'"
      ).run(nextTitle, nextDesc);
    }
  }

  // Guide FAQ that framed Certko only as an “intelligence platform”
  const faqs = db
    .prepare(
      "SELECT id, answer FROM faqs WHERE answer LIKE '%compliance-intelligence platform%'"
    )
    .all() as { id: number; answer: string }[];
  for (const faq of faqs) {
    const next = faq.answer.replace(
      /independent compliance-intelligence platform/gi,
      "solution partner for certification and compliance"
    );
    if (next !== faq.answer) {
      db.prepare("UPDATE faqs SET answer = ? WHERE id = ?").run(next, faq.id);
    }
  }

  // Legal intros on existing installs
  for (const [slug, next] of [
    ["privacy", PRIVACY_CONTENT],
    ["terms", TERMS_CONTENT],
  ] as const) {
    const row = db
      .prepare("SELECT content FROM pages WHERE slug = ?")
      .get(slug) as { content: string } | undefined;
    if (!row?.content) continue;
    if (
      /global regulatory intelligence, product compliance and certification information platform/i.test(
        row.content
      ) ||
      /CERTKO is an information platform owned and operated/i.test(row.content)
    ) {
      db.prepare("UPDATE pages SET content = ? WHERE slug = ?").run(next, slug);
    }
  }
}

/** Seed timed GDPR contact popup defaults if missing. */
function ensureContactPopupSettings(db: SqliteDatabase) {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING"
  );
  for (const [key, value] of Object.entries(CONTACT_POPUP_DEFAULTS)) {
    upsert.run(key, value);
  }
}

/** Keep certification region labels aligned with market organisation. */
function ensureCanonicalCertMarketRegions(db: SqliteDatabase) {
  const updates: [string, string][] = [
    ["bis", "India"],
    ["bee", "India"],
    ["wpc-eta", "India"],
    ["ce", "European Union"],
    ["fcc", "United States"],
    ["g-mark", "GCC countries"],
    ["saber", "Saudi Arabia"],
  ];
  const stmt = db.prepare("UPDATE certifications SET region = ? WHERE slug = ? AND IFNULL(region, '') != ?");
  for (const [slug, region] of updates) {
    stmt.run(region, slug, region);
  }
}

/** Contact “Before You Ask” FAQs — global certification & testing framing. */
const CONTACT_PAGE_FAQS_GLOBAL: {
  question: string;
  answer: string;
  legacyAnswers: string[];
}[] = [
  {
    question: "What happens after I submit this form?",
    answer:
      "Someone on our certification desk reads your product notes and target markets, checks which schemes usually apply — BIS, BEE, GMARK, CE, FCC, SABER or WPC — and comes back within 24 hours with a line-by-line estimate for lab work, scheme fees and consulting.",
    legacyAnswers: [
      "A BIS specialist reviews your product details, maps the applicable IS standard and scheme, and replies within 24 hours with an itemised cost estimate covering lab testing, BIS fees and consulting.",
      "A certification and testing specialist reviews your product details and target markets, maps the schemes that typically apply — such as BIS, BEE, GMARK, CE, FCC, SABER or WPC — and replies within 24 hours with an itemised estimate covering laboratory testing, scheme fees and consulting.",
    ],
  },
  {
    question: "Is the quote really free?",
    answer:
      "Yes. Figuring out the scheme and the cost range costs you nothing. You only pay if you ask us to run the certification, testing or consulting work.",
    legacyAnswers: [
      "Yes. The standard mapping and cost estimate are free with no obligation. You only pay if you engage us to manage the certification.",
      "Yes. Scheme mapping and the cost estimate are free with no obligation. You only pay if you engage us to manage certification, testing coordination or consulting.",
    ],
  },
  {
    question: "Do you help foreign manufacturers?",
    answer:
      "Yes. We work with overseas factories and exporters selling into India and other markets — BIS FMCS/CRS (with an Authorised Indian Representative when you need one), plus BEE, GMARK, CE, FCC, SABER and WPC, including lab bookings.",
    legacyAnswers: [
      "Yes. We support overseas factories under the Foreign Manufacturers Certification Scheme (FMCS) and CRS, including acting as or arranging an Authorised Indian Representative (AIR).",
      "Yes. We support overseas manufacturers and exporters for India and global market access — including BIS FMCS/CRS with Authorised Indian Representative (AIR) support where needed, plus pathways such as BEE, GMARK, CE, FCC, SABER and WPC, with lab coordination end to end.",
    ],
  },
];

/** Upgrade legacy BIS-only contact FAQs to global certification & testing copy. */
function ensureContactPageFaqsGlobalCopy(db: SqliteDatabase) {
  const select = db.prepare(
    "SELECT id, answer FROM faqs WHERE scope = 'page:contact' AND question = ?"
  );
  const update = db.prepare("UPDATE faqs SET answer = ? WHERE id = ?");
  const insert = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES ('page:contact', ?, ?, ?)"
  );

  CONTACT_PAGE_FAQS_GLOBAL.forEach((faq, sort) => {
    const row = select.get(faq.question) as { id: number; answer: string } | undefined;
    if (!row) {
      insert.run(faq.question, faq.answer, sort);
      return;
    }
    const current = (row.answer || "").trim();
    if (current === faq.answer) return;
    if (faq.legacyAnswers.some((legacy) => legacy.trim() === current)) {
      update.run(faq.answer, row.id);
    }
  });
}

/** Canonical HQ address shown on Contact Us and in the footer. */
const CANONICAL_CONTACT_ADDRESS =
  "A-34, 4th Floor, Sector 63A, Noida, Gautam Buddha Nagar, Uttar Pradesh – 201301, India";

/**
 * Normalize known Noida HQ address variants (India placement / punctuation)
 * so Contact Us + footer always show the canonical line.
 */
function ensureCanonicalContactAddress(db: SqliteDatabase) {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES ('contact_address', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'contact_address'")
    .get() as { value: string } | undefined;
  const value = (row?.value || "").trim();
  if (!value) {
    upsert.run(CANONICAL_CONTACT_ADDRESS);
    return;
  }
  if (value === CANONICAL_CONTACT_ADDRESS) return;

  const isNoidaHq =
    /A-34/i.test(value) &&
    /Sector\s*63A/i.test(value) &&
    /Noida/i.test(value) &&
    /Uttar Pradesh/i.test(value) &&
    /201301/.test(value);
  if (!isNoidaHq) return;

  upsert.run(CANONICAL_CONTACT_ADDRESS);
}

/** Upgrade legacy contact-page hero to “Talk to a certification expert”. */
function ensureContactExpertCopy(db: SqliteDatabase) {
  const row = db
    .prepare("SELECT hero_heading, hero_subheading FROM pages WHERE slug = 'contact'")
    .get() as { hero_heading: string; hero_subheading: string } | undefined;
  if (!row) return;

  const heading = (row.hero_heading || "").trim();
  const subheading = (row.hero_subheading || "").trim();
  const nextHeading =
    !heading || heading === "Talk to a BIS expert" || heading === "Talk to an expert"
      ? "Talk to a certification expert"
      : heading;
  const nextSubheading =
    !subheading ||
    subheading ===
      "Tell us about your product and we will map the standard, estimate the full cost and send a free quote within 24 hours." ||
    subheading ===
      "Tell us about your product and a certification expert will map the standard, estimate the full cost and send a free quote within 24 hours."
      ? "Tell us what you make and where you sell. We’ll point to the standard, sketch the full cost, and send a free quote within 24 hours."
      : subheading;

  if (nextHeading === heading && nextSubheading === subheading) return;
  db.prepare(
    "UPDATE pages SET hero_heading = ?, hero_subheading = ? WHERE slug = 'contact'"
  ).run(nextHeading, nextSubheading);
}

const HOME_HERO_HEADING = "Find the right certification and testing for your product";
const HOME_HERO_SUBHEADING =
  "Type a product name or HSN. We’ll show the schemes that usually apply — BIS, BEE, GMARK, CE, FCC, SABER, WPC — plus the tests, labs and ballpark costs so you know what to book next.";

/** Upgrade the default homepage hero on existing installs (seed is INSERT OR IGNORE). */
function ensureHomeHeroTestingSolutionCopy(db: SqliteDatabase) {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );

  const heading = (
    db.prepare("SELECT value FROM settings WHERE key = 'hero_heading'").get() as
      | { value: string }
      | undefined
  )?.value?.trim();
  const subheading = (
    db
      .prepare("SELECT value FROM settings WHERE key = 'hero_subheading'")
      .get() as { value: string } | undefined
  )?.value?.trim();

  const legacyHeadings = new Set([
    "",
    "Find the right certification and testing",
    "Find the right certification and testing solution",
  ]);
  const legacySubheadings = new Set([
    "",
    "Search by product name or HSN code. Match BIS, BEE, GMARK, CE, FCC, SABER, WPC and the tests behind them — with labs, costs and expert help in one place.",
    "Search by product name or HSN code to see which schemes apply — BIS, BEE, GMARK, CE, FCC, SABER, WPC — and the tests that unlock them. Compare recognised labs, indicative costs and expert support in one place.",
  ]);

  if (!heading || legacyHeadings.has(heading)) {
    upsert.run("hero_heading", HOME_HERO_HEADING);
  }
  if (!subheading || legacySubheadings.has(subheading)) {
    upsert.run("hero_subheading", HOME_HERO_SUBHEADING);
  }
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

/**
 * Never show lab contact-person name / phone / email on the public site.
 * Clears stored PII and rewrites FAQ copy that used to point visitors at it.
 */
function scrubLabPublicContactDetails(db: SqliteDatabase) {
  db.prepare(
    `UPDATE labs
     SET contact = NULL,
         phone = NULL,
         email = NULL
     WHERE IFNULL(contact, '') != ''
        OR IFNULL(phone, '') != ''
        OR IFNULL(email, '') != ''`
  ).run();

  const faqs = db
    .prepare("SELECT id, answer FROM faqs WHERE answer LIKE '%contact detail%'")
    .all() as { id: number; answer: string }[];
  for (const faq of faqs) {
    const next = faq.answer
      .replace(
        /; the lab page lists contact details\./gi,
        ". Use Contact Instacertify on the lab page to reach our team."
      )
      .replace(/, scopes and contact details/gi, " and scopes")
      .replace(/scopes, contact details and indicative/gi, "scopes and indicative");
    if (next !== faq.answer) {
      db.prepare("UPDATE faqs SET answer = ? WHERE id = ?").run(next, faq.id);
    }
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
      // Warm typeahead index in the background so first search is instant.
      void import("./search-index")
        .then((m) => m.warmSearchIndex())
        .catch(() => {});
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
  page_type: string;
  cta_label: string;
  cta_href: string;
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

export interface TrustedBrand {
  id: number;
  name: string;
  logo: string;
  href: string;
  sort: number;
  active: number;
}

export interface CountryHubRecord {
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
}

export interface CountrySchemeRecord {
  id: number;
  country_id: number;
  cert_slug: string;
  name: string;
  role: string;
  summary: string;
  who_needs_it: string;
  examples: string;
  sort: number;
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
  intent: string;
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
  min_price: number | null;
  max_price: number | null;
  price_note: string;
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
