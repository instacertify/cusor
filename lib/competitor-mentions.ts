/**
 * Neutralize competitor brand name-drops (TÜV / Intertek) used as examples in
 * copy. Does not touch the BIS labs directory — those are real lab names.
 */

const COMPETITOR_EXAMPLE_RE =
  /\b(?:Intertek|T[ÜU]V(?:\s*S[ÜU]D|\s*Rheinland)?)\b/i;

/** True when narrative copy cites Intertek / TÜV as an example brand. */
export function hasCompetitorExampleMention(text: string | null | undefined): boolean {
  return COMPETITOR_EXAMPLE_RE.test(text || "");
}

/**
 * Rewrite competitor example mentions into neutral wording.
 * Keeps surrounding guidance; strips brand name-drops from lists.
 */
export function neutralizeCompetitorExamples(text: string): string {
  if (!text || !hasCompetitorExampleMention(text)) return text;

  let t = text;

  // Known GMA pillar phrasing
  t = t.replace(
    /NRTL listing\s*\([^)]*(?:Intertek|T[ÜU]V)[^)]*\)/gi,
    "NRTL listing from an OSHA-recognised laboratory"
  );

  // "Intertek (Sohna), " / "TUV Rheinland (Bengaluru), "
  t = t.replace(
    /\bIntertek(?:\s*\([^)]*\))?\s*,?\s*/gi,
    ""
  );
  t = t.replace(
    /\bT[ÜU]V(?:\s*S[ÜU]D|\s*Rheinland)?(?:\s*\([^)]*\))?\s*,?\s*/gi,
    ""
  );

  // Cleanup list punctuation left behind
  t = t
    .replace(/\(\s*,/g, "(")
    .replace(/,\s*\)/g, ")")
    .replace(/;\s*;/g, ";")
    .replace(/,\s*,+/g, ", ")
    .replace(/,\s*([.;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,;.])/g, "$1")
    .trim();

  return t;
}
