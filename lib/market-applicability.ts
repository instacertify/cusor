/**
 * Market applicability — where a certification or test standard is required / accepted.
 * Used to organise certifications and testing by country / bloc for users.
 */

export type MarketId =
  | "india"
  | "european-union"
  | "united-states"
  | "gcc"
  | "saudi-arabia"
  | "global";

export type ApplicabilityRole = "required" | "accepted" | "gateway";

export interface MarketDef {
  id: MarketId;
  /** Short label for badges / nav */
  label: string;
  /** Longer label for section headings */
  heading: string;
  /** One-line insight for users */
  blurb: string;
  sort: number;
}

export interface CertApplicability {
  slug: string;
  /** Primary market where the scheme is required */
  primaryMarketId: MarketId;
  role: ApplicabilityRole;
  /** Plain-language insight shown on detail pages */
  insight: string;
  /** Extra markets / notes (optional) */
  alsoAcceptedIn?: string[];
}

export interface StandardFamilyInsight {
  id: "is" | "iec" | "astm" | "other";
  label: string;
  where: string;
  blurb: string;
}

/** Ordered markets for certification grouping (excludes generic “global”). */
export const CERT_MARKETS: MarketDef[] = [
  {
    id: "india",
    label: "India",
    heading: "India",
    blurb: "Mandatory and regulated schemes for selling or importing into India.",
    sort: 0,
  },
  {
    id: "european-union",
    label: "European Union",
    heading: "European Union",
    blurb: "Conformity marking required to place many products on the EU / EEA market.",
    sort: 1,
  },
  {
    id: "united-states",
    label: "United States",
    heading: "United States",
    blurb: "US market access for radio, EMC and related product authorisations.",
    sort: 2,
  },
  {
    id: "gcc",
    label: "GCC countries",
    heading: "GCC countries",
    blurb: "Gulf Conformity Mark pathways across GSO member states.",
    sort: 3,
  },
  {
    id: "saudi-arabia",
    label: "Saudi Arabia",
    heading: "Saudi Arabia",
    blurb: "Saudi conformity and shipment clearances on the SABER platform.",
    sort: 4,
  },
];

export const CERT_APPLICABILITY: Record<string, CertApplicability> = {
  bis: {
    slug: "bis",
    primaryMarketId: "india",
    role: "required",
    insight:
      "If your product sits under an Indian Quality Control Order, you need BIS before you sell or import — ISI Mark (Scheme I) or CRS (Scheme II).",
    alsoAcceptedIn: ["Indian buyers and marketplaces often ask for the licence number as proof"],
  },
  bee: {
    slug: "bee",
    primaryMarketId: "india",
    role: "required",
    insight:
      "Appliances sold in India under BEE star-labelling rules need the right star label — think ACs, refrigerators, fans and water heaters.",
  },
  "wpc-eta": {
    slug: "wpc-eta",
    primaryMarketId: "india",
    role: "required",
    insight:
      "Wireless gear for India (Bluetooth, Wi-Fi and similar licence-exempt radios) needs Equipment Type Approval before import or sale.",
  },
  ce: {
    slug: "ce",
    primaryMarketId: "european-union",
    role: "required",
    insight:
      "Many products need CE before they can sit on EU / EEA shelves. Buyers outside Europe also ask for CE files as a common safety pack.",
    alsoAcceptedIn: [
      "Useful baseline evidence for safety / EMC conversations worldwide",
      "Can shorten Gulf or Saudi work when the standards line up",
    ],
  },
  fcc: {
    slug: "fcc",
    primaryMarketId: "united-states",
    role: "required",
    insight:
      "Devices that put out radio energy generally need FCC before US sale. Retailers and platforms check for it before listings go live.",
    alsoAcceptedIn: ["Buyers elsewhere often treat FCC as a solid RF / EMC signal"],
  },
  "g-mark": {
    slug: "g-mark",
    primaryMarketId: "gcc",
    role: "required",
    insight:
      "Regulated Gulf categories need GMARK across GSO member countries — Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman and Yemen.",
    alsoAcceptedIn: ["Saudi cargo may still need SABER on top of GMARK"],
  },
  saber: {
    slug: "saber",
    primaryMarketId: "saudi-arabia",
    role: "required",
    insight:
      "Regulated goods into Saudi Arabia clear through SABER — product and shipment certificates before customs will release the cargo.",
    alsoAcceptedIn: ["Not the same as GMARK; some SKUs need both"],
  },
};

/** Testing standard families — where the evidence is typically accepted. */
export const STANDARD_FAMILIES: StandardFamilyInsight[] = [
  {
    id: "is",
    label: "IS (Indian Standards)",
    where: "India",
    blurb:
      "Bureau of Indian Standards test methods — primary evidence for BIS / India market compliance and many domestic buyer specs.",
  },
  {
    id: "iec",
    label: "IEC (International)",
    where: "Global",
    blurb:
      "IEC methods are recognised worldwide and often underpin CE, CB Scheme and multi-market electrical / EMC filings.",
  },
  {
    id: "astm",
    label: "ASTM / other",
    where: "Global / buyer-driven",
    blurb:
      "ASTM and similar methods are widely used in export contracts and specialised product categories.",
  },
];

export function marketById(id: MarketId): MarketDef | undefined {
  return CERT_MARKETS.find((m) => m.id === id);
}

export function getCertApplicability(slug: string): CertApplicability | null {
  return CERT_APPLICABILITY[slug] || null;
}

/** Display label for a cert’s primary market (falls back to DB region). */
export function certMarketLabel(slug: string, fallbackRegion?: string): string {
  const app = getCertApplicability(slug);
  if (app) {
    const market = marketById(app.primaryMarketId);
    if (market) return market.label;
  }
  return (fallbackRegion || "Global").trim() || "Global";
}

export function roleLabel(role: ApplicabilityRole): string {
  if (role === "required") return "Required in";
  if (role === "accepted") return "Accepted in";
  return "Gateway for";
}

/** Infer standard-family badges from a free-text standards field. */
export function standardFamiliesFromText(standards: string): StandardFamilyInsight[] {
  const text = standards || "";
  const found: StandardFamilyInsight[] = [];
  const hasIs = /\bIS[\s.:/-]?\d/i.test(text) || /\bIS\s+[A-Z]/i.test(text);
  const hasIec = /\bIEC\b/i.test(text);
  const hasAstm = /\bASTM\b/i.test(text);
  for (const family of STANDARD_FAMILIES) {
    if (family.id === "is" && hasIs) found.push(family);
    if (family.id === "iec" && hasIec) found.push(family);
    if (family.id === "astm" && hasAstm) found.push(family);
  }
  return found;
}

/** Short chip text for testing cards, e.g. “IS · India”. */
export function standardApplicabilityChips(standards: string): string[] {
  return standardFamiliesFromText(standards).map((f) => `${f.label.split(" ")[0]} · ${f.where}`);
}

export function groupCertificationsByMarket<T extends { slug: string; region?: string | null }>(
  certs: T[]
): { market: MarketDef; certs: T[] }[] {
  const buckets = new Map<MarketId, T[]>();
  const other: T[] = [];

  for (const cert of certs) {
    const app = getCertApplicability(cert.slug);
    if (app) {
      const list = buckets.get(app.primaryMarketId) || [];
      list.push(cert);
      buckets.set(app.primaryMarketId, list);
    } else {
      other.push(cert);
    }
  }

  const groups = CERT_MARKETS.map((market) => ({
    market,
    certs: buckets.get(market.id) || [],
  })).filter((g) => g.certs.length > 0);

  if (other.length > 0) {
    groups.push({
      market: {
        id: "global",
        label: "Other markets",
        heading: "Other markets",
        blurb: "Additional certification programmes we support.",
        sort: 99,
      },
      certs: other,
    });
  }

  return groups;
}
