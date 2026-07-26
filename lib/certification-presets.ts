import { CERTIFICATIONS, type CertSeed } from "./seed-certifications";

/** Common certification programmes admins can one-click create (if not already present). */
export const CERTIFICATION_PRESETS: CertSeed[] = CERTIFICATIONS.filter((c) =>
  ["bee", "g-mark", "saber", "ce", "fcc", "wpc-eta", "bis"].includes(c.slug)
);

export function getCertificationPreset(slug: string): CertSeed | undefined {
  return CERTIFICATION_PRESETS.find((c) => c.slug === slug);
}
