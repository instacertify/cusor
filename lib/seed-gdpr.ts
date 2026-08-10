import type { SqliteDatabase } from "./sqlite";
import { CONSENT_POLICY_VERSION } from "./gdpr-constants";

/** Create GDPR tables + default settings. Safe on every boot. */
export function ensureGdprLibrary(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS gdpr_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT 'unspecified',
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
    CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(email);

    CREATE TABLE IF NOT EXISTS gdpr_consent_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL DEFAULT '',
      analytics INTEGER NOT NULL DEFAULT 0,
      marketing INTEGER NOT NULL DEFAULT 0,
      policy_version TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'banner',
      user_agent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_gdpr_consent_created ON gdpr_consent_events(created_at);
  `);

  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO NOTHING`
  );
  const defaults: [string, string][] = [
    ["gdpr_banner_enabled", "1"],
    ["gdpr_require_analytics_consent", "1"],
    ["gdpr_banner_title", "Cookies & privacy choices"],
    [
      "gdpr_banner_text",
      "We use necessary cookies to run Certko. Analytics cookies help us improve the site — only with your consent. You can change this anytime. We process personal data under GDPR (where applicable) and India’s DPDP Act.",
    ],
    ["gdpr_privacy_officer_email", "info@certko.com"],
    ["gdpr_inquiry_retention_days", "365"],
    ["gdpr_policy_version", CONSENT_POLICY_VERSION],
  ];
  for (const [k, v] of defaults) upsert.run(k, v);

  const privacy = db
    .prepare("SELECT content FROM pages WHERE slug = 'privacy'")
    .get() as { content: string } | undefined;
  if (privacy && !/DPDP|Digital Personal Data Protection/i.test(privacy.content || "")) {
    const addition = `

## 15. GDPR and India’s DPDP Act

CERTKO is operated from India by Instacertify Labs Private Limited. Depending on where you are and how we process your data:

- **GDPR (EU / EEA / UK)** — Where the EU General Data Protection Regulation (or UK GDPR) applies, we process personal data under a lawful basis such as consent, contract, legitimate interests or legal obligation. You may have rights of access, rectification, erasure, restriction, portability and objection. You may also lodge a complaint with your local supervisory authority.
- **DPDP Act, 2023 (India)** — Under India’s Digital Personal Data Protection Act, we act as a Data Fiduciary for personal data we determine the purpose and means of processing. You have rights to access, correction, erasure and withdrawal of consent (subject to the Act and rules). Grievances can be raised with our Privacy Officer and, where applicable, the Data Protection Board of India.

Cookie preferences can be managed via the site cookie banner. To exercise rights, use our [data request form](/privacy/data-request) or email the Privacy Officer. Learn more: [What is GDPR and DPDP?](/privacy/gdpr-and-dpdp).
`;
    db.prepare("UPDATE pages SET content = ? WHERE slug = 'privacy'").run(
      `${privacy.content.trim()}\n${addition}`
    );
  }
}
