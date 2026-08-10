/** Browser-safe consent helpers (no DB / Node imports). */

import { CONSENT_COOKIE, CONSENT_POLICY_VERSION } from "./gdpr-constants";

export { CONSENT_COOKIE, CONSENT_POLICY_VERSION };

export type ConsentPrefs = {
  v: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: string;
  policyVersion: string;
};

export type GdprPublicSettings = {
  bannerEnabled: boolean;
  requireAnalyticsConsent: boolean;
  bannerTitle: string;
  bannerText: string;
  privacyOfficerEmail: string;
  inquiryRetentionDays: number;
  policyVersion: string;
};

export function defaultConsent(partial?: Partial<ConsentPrefs>): ConsentPrefs {
  return {
    v: 1,
    necessary: true,
    analytics: Boolean(partial?.analytics),
    marketing: Boolean(partial?.marketing),
    ts: partial?.ts || new Date().toISOString(),
    policyVersion: partial?.policyVersion || CONSENT_POLICY_VERSION,
  };
}

export function parseConsentCookie(raw: string | undefined | null): ConsentPrefs | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentPrefs>;
    if (!data || data.v !== 1) return null;
    return defaultConsent({
      analytics: Boolean(data.analytics),
      marketing: Boolean(data.marketing),
      ts: typeof data.ts === "string" ? data.ts : new Date().toISOString(),
      policyVersion:
        typeof data.policyVersion === "string"
          ? data.policyVersion
          : CONSENT_POLICY_VERSION,
    });
  } catch {
    return null;
  }
}

export function serializeConsent(prefs: ConsentPrefs): string {
  return encodeURIComponent(JSON.stringify(prefs));
}

export function readConsentFromDocument(): ConsentPrefs | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseConsentCookie(match.slice(CONSENT_COOKIE.length + 1));
}
