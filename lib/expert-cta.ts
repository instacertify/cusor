/** Defaults for the sitewide certification-expert CTA. */
export const EXPERT_CTA_LABEL = "Talk to a certification expert";
export const EXPERT_CTA_LABEL_SHORT = "Talk to expert";
export const EXPERT_CTA_HREF = "/contact?intent=expert";
export const EXPERT_PHONE_DISPLAY = "+91 9999118039";
export const EXPERT_PHONE_TEL = "+919999118039";

export type ExpertCta = {
  label: string;
  labelShort: string;
  href: string;
  phoneDisplay: string;
  phoneTel: string;
};

/** Digits-only tel: target, preserving a leading +. */
export function toTelHref(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return EXPERT_PHONE_TEL;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return EXPERT_PHONE_TEL;
  return hasPlus || digits.length >= 10 ? `+${digits.replace(/^\+/, "")}` : digits;
}

/** Human-readable phone for UI; falls back to the public expert line. */
export function toPhoneDisplay(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return EXPERT_PHONE_DISPLAY;
  // Normalize common DB form "+91-9999118039" → "+91 9999118039"
  return trimmed.replace(/^(\+?\d{1,3})[-\s]?/, "$1 ").replace(/\s+/g, " ");
}

/** Resolve CTA copy + dial number from settings (Admin → Settings). */
export function resolveExpertCta(
  settings: Record<string, string> | null | undefined
): ExpertCta {
  const s = settings || {};
  const label = (s.expert_cta_label || "").trim() || EXPERT_CTA_LABEL;
  const labelShort =
    (s.expert_cta_label_short || "").trim() || EXPERT_CTA_LABEL_SHORT;
  let href = (s.expert_cta_href || "").trim() || EXPERT_CTA_HREF;
  if (!href.startsWith("/")) href = EXPERT_CTA_HREF;
  const phoneRaw = (s.contact_phone || "").trim() || EXPERT_PHONE_DISPLAY;
  return {
    label,
    labelShort,
    href,
    phoneDisplay: toPhoneDisplay(phoneRaw),
    phoneTel: toTelHref(phoneRaw),
  };
}
