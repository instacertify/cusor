/** Defaults + resolver for the timed GDPR contact popup. */

export const CONTACT_POPUP_DEFAULTS = {
  contact_popup_enabled: "1",
  contact_popup_delay_seconds: "59",
  contact_popup_image: "/brand/certko-logo-full.png",
  contact_popup_title: "Need help with certification or testing?",
  contact_popup_subtitle:
    "Share a few details and a Certko specialist will reply within 24 working hours. No spam.",
  contact_popup_dismiss_days: "7",
  contact_popup_wait_for_cookie_choice: "1",
  contact_popup_submit_label: "Send my request",
} as const;

export type ContactPopupConfig = {
  enabled: boolean;
  delaySeconds: number;
  image: string;
  title: string;
  subtitle: string;
  dismissDays: number;
  waitForCookieChoice: boolean;
  submitLabel: string;
};

function asFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

function asPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

/** Resolve popup config from site settings (Admin → Settings). */
export function resolveContactPopup(
  settings: Record<string, string> | null | undefined
): ContactPopupConfig {
  const s = settings || {};
  const delay = asPositiveInt(
    s.contact_popup_delay_seconds,
    Number(CONTACT_POPUP_DEFAULTS.contact_popup_delay_seconds)
  );
  return {
    enabled: asFlag(
      s.contact_popup_enabled,
      CONTACT_POPUP_DEFAULTS.contact_popup_enabled === "1"
    ),
    delaySeconds: Math.min(Math.max(delay, 5), 600),
    image:
      (s.contact_popup_image || "").trim() ||
      CONTACT_POPUP_DEFAULTS.contact_popup_image,
    title:
      (s.contact_popup_title || "").trim() ||
      CONTACT_POPUP_DEFAULTS.contact_popup_title,
    subtitle:
      (s.contact_popup_subtitle || "").trim() ||
      CONTACT_POPUP_DEFAULTS.contact_popup_subtitle,
    dismissDays: Math.min(
      Math.max(
        asPositiveInt(
          s.contact_popup_dismiss_days,
          Number(CONTACT_POPUP_DEFAULTS.contact_popup_dismiss_days)
        ),
        1
      ),
      365
    ),
    waitForCookieChoice: asFlag(
      s.contact_popup_wait_for_cookie_choice,
      CONTACT_POPUP_DEFAULTS.contact_popup_wait_for_cookie_choice === "1"
    ),
    submitLabel:
      (s.contact_popup_submit_label || "").trim() ||
      CONTACT_POPUP_DEFAULTS.contact_popup_submit_label,
  };
}
