/**
 * Certification solution chips for the product library.
 * All hrefs use existing public routes — no new URLs.
 */
export type CertificationSolutionChip = {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: string;
};

export const CERTIFICATION_SOLUTIONS: CertificationSolutionChip[] = [
  {
    id: "bis",
    label: "BIS Certification",
    href: "/certifications/bis",
    description: "ISI / CRS marks for India — map your product to the right IS standard.",
    icon: "award",
  },
  {
    id: "bee",
    label: "BEE Certification",
    href: "/certifications/bee",
    description: "Star labelling for energy-related appliances and equipment.",
    icon: "zap",
  },
  {
    id: "mandatory-qco",
    label: "Mandatory QCO",
    href: `/products/all?status=${encodeURIComponent("Mandatory (QCO in force)")}`,
    description: "Products already under a Quality Control Order — search the notified list.",
    icon: "bell",
  },
  {
    id: "general",
    label: "General",
    href: "/certifications",
    description: "Browse every certification programme — India and export markets.",
    icon: "globe",
  },
  {
    id: "others",
    label: "Others",
    href: "/category/others",
    description: "Other products in this library — still check which certification applies.",
    icon: "box",
  },
];
