/**
 * Certification solution chips shown above product categories.
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
    description: "Required in India — map your product to the right ISI / CRS path and IS standard.",
    icon: "award",
  },
  {
    id: "bee",
    label: "BEE Certification",
    href: "/certifications/bee",
    description: "Required in India for energy-related appliances under star labelling.",
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
    id: "global-markets",
    label: "Global markets",
    href: "/certifications",
    description: "CE, FCC, GMARK, SABER and more — schemes for the EU, US, GCC and Saudi Arabia.",
    icon: "globe",
  },
  {
    id: "product-categories",
    label: "Product categories",
    href: "/products#product-categories",
    description: "Browse products by category, then match the certification that applies.",
    icon: "box",
  },
];
