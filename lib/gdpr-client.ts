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

export type CookieCategoryKey = "necessary" | "analytics" | "marketing";

export type CookieCategoryConfig = {
  key: CookieCategoryKey;
  label: string;
  description: string;
  /** If false, category is hidden from the public chooser (except necessary). */
  offered: boolean;
  /** Examples / cookie names shown on the cookies page */
  examples: string;
};

export type GdprPublicSettings = {
  bannerEnabled: boolean;
  requireAnalyticsConsent: boolean;
  bannerTitle: string;
  bannerText: string;
  privacyOfficerEmail: string;
  inquiryRetentionDays: number;
  policyVersion: string;
  /** Show floating Cookie options button on every public page */
  showFloatingCookieButton: boolean;
  /** Open category toggles by default on the banner */
  bannerShowCategoriesDefault: boolean;
  categories: CookieCategoryConfig[];
};

export const DEFAULT_COOKIE_CATEGORIES: CookieCategoryConfig[] = [
  {
    key: "necessary",
    label: "Necessary",
    description:
      "Required for security, session, load balancing and basic site operation. Always on.",
    offered: true,
    examples: "certko_consent, certko_admin (CMS only), certko_captcha",
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Helps us understand traffic and improve Certko (Google Analytics / Tag Manager).",
    offered: true,
    examples: "_ga, _gid, _gat, GTM containers",
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Optional remarketing or advertising tags if configured in site settings.",
    offered: true,
    examples: "Advertising / remarketing pixels (when enabled)",
  },
];

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

export function writeConsentToDocument(prefs: ConsentPrefs) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(prefs)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("certko:consent", { detail: prefs }));
}
