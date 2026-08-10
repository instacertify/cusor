/**
 * GDPR (EU) + DPDP (India) privacy helpers — settings + DSAR storage (server).
 */

import { getDb, getSetting, setSetting } from "./db";
import {
  CONSENT_COOKIE,
  CONSENT_POLICY_VERSION,
  type ConsentPrefs,
  type GdprPublicSettings,
  defaultConsent,
  parseConsentCookie,
  serializeConsent,
} from "./gdpr-client";
import {
  GDPR_REQUEST_TYPES,
  type GdprRequestType,
} from "./gdpr-request-types";

export {
  CONSENT_COOKIE,
  CONSENT_POLICY_VERSION,
  GDPR_REQUEST_TYPES,
  defaultConsent,
  parseConsentCookie,
  serializeConsent,
};
export type { ConsentPrefs, GdprPublicSettings, GdprRequestType };

export type GdprRequestStatus = "new" | "in_progress" | "completed" | "rejected";

export type GdprRequest = {
  id: number;
  request_type: string;
  name: string;
  email: string;
  details: string;
  region: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

export type GdprConsentEvent = {
  id: number;
  visitor_id: string;
  analytics: number;
  marketing: number;
  policy_version: string;
  source: string;
  user_agent: string;
  created_at: string;
};

export function getGdprPublicSettings(): GdprPublicSettings {
  const retention = Number(getSetting("gdpr_inquiry_retention_days", "365"));
  return {
    bannerEnabled: getSetting("gdpr_banner_enabled", "1") !== "0",
    requireAnalyticsConsent: getSetting("gdpr_require_analytics_consent", "1") !== "0",
    bannerTitle: getSetting("gdpr_banner_title", "Cookies & privacy choices"),
    bannerText: getSetting(
      "gdpr_banner_text",
      "We use necessary cookies to run Certko. Analytics cookies help us improve the site — only with your consent. You can change this anytime. We process personal data under GDPR (where applicable) and India’s DPDP Act."
    ),
    privacyOfficerEmail: getSetting("gdpr_privacy_officer_email", "info@certko.com"),
    inquiryRetentionDays: Number.isFinite(retention) && retention > 0 ? retention : 365,
    policyVersion: getSetting("gdpr_policy_version", CONSENT_POLICY_VERSION),
  };
}

export function logConsentEvent(input: {
  visitorId?: string;
  analytics: boolean;
  marketing: boolean;
  policyVersion?: string;
  source?: string;
  userAgent?: string;
}) {
  getDb()
    .prepare(
      `INSERT INTO gdpr_consent_events
       (visitor_id, analytics, marketing, policy_version, source, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      (input.visitorId || "").slice(0, 80),
      input.analytics ? 1 : 0,
      input.marketing ? 1 : 0,
      input.policyVersion || CONSENT_POLICY_VERSION,
      input.source || "banner",
      (input.userAgent || "").slice(0, 240)
    );
}

export function createGdprRequest(input: {
  requestType: string;
  name: string;
  email: string;
  details?: string;
  region?: string;
}): number {
  const res = getDb()
    .prepare(
      `INSERT INTO gdpr_requests (request_type, name, email, details, region)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.requestType,
      input.name.slice(0, 120),
      input.email.slice(0, 200).toLowerCase(),
      (input.details || "").slice(0, 4000),
      input.region || "unspecified"
    );
  return Number(res.lastInsertRowid);
}

export function listGdprRequests(limit = 100): GdprRequest[] {
  return getDb()
    .prepare("SELECT * FROM gdpr_requests ORDER BY id DESC LIMIT ?")
    .all(limit) as GdprRequest[];
}

export function listConsentEvents(limit = 100): GdprConsentEvent[] {
  return getDb()
    .prepare("SELECT * FROM gdpr_consent_events ORDER BY id DESC LIMIT ?")
    .all(limit) as GdprConsentEvent[];
}

export function updateGdprRequestStatus(
  id: number,
  status: GdprRequestStatus,
  adminNotes?: string
) {
  getDb()
    .prepare(
      `UPDATE gdpr_requests
       SET status = ?,
           admin_notes = CASE WHEN ? != '' THEN ? ELSE admin_notes END,
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(status, adminNotes || "", adminNotes || "", id);
}

export function anonymizeExpiredInquiries(retentionDays?: number): number {
  const days = retentionDays ?? getGdprPublicSettings().inquiryRetentionDays;
  const res = getDb()
    .prepare(
      `UPDATE inquiries
       SET name = 'Redacted',
           email = 'redacted+' || id || '@privacy.local',
           phone = '',
           message = '[Redacted under retention policy]',
           status = CASE WHEN status = 'new' THEN 'closed' ELSE status END
       WHERE created_at < datetime('now', ?)
         AND email NOT LIKE 'redacted+%@privacy.local'`
    )
    .run(`-${Math.max(1, days)} days`);
  return Number(res.changes || 0);
}

export function saveGdprAdminSettings(values: Record<string, string>) {
  const allowed = [
    "gdpr_banner_enabled",
    "gdpr_require_analytics_consent",
    "gdpr_banner_title",
    "gdpr_banner_text",
    "gdpr_privacy_officer_email",
    "gdpr_inquiry_retention_days",
    "gdpr_policy_version",
  ] as const;
  for (const key of allowed) {
    if (key in values) setSetting(key, values[key] ?? "");
  }
}

export function countOpenGdprRequests(): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM gdpr_requests WHERE status IN ('new', 'in_progress')`
    )
    .get() as { n: number };
  return row?.n || 0;
}
