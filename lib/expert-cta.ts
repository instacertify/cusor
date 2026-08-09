/** Defaults for the sitewide certification-expert CTA. */
export const EXPERT_CTA_LABEL = "Talk to a certification expert";
export const EXPERT_CTA_LABEL_SHORT = "Talk to expert";
export const EXPERT_CTA_HREF = "/contact?intent=expert";

export type ExpertCta = {
  label: string;
  labelShort: string;
  href: string;
};

/** Resolve CTA copy from settings (Admin → Settings), falling back to defaults. */
export function resolveExpertCta(
  settings: Record<string, string> | null | undefined
): ExpertCta {
  const s = settings || {};
  const label = (s.expert_cta_label || "").trim() || EXPERT_CTA_LABEL;
  const labelShort =
    (s.expert_cta_label_short || "").trim() || EXPERT_CTA_LABEL_SHORT;
  let href = (s.expert_cta_href || "").trim() || EXPERT_CTA_HREF;
  if (!href.startsWith("/")) href = EXPERT_CTA_HREF;
  return { label, labelShort, href };
}
