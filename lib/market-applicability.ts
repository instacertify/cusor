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
      "Required in India for products notified under Quality Control Orders — ISI Mark (Scheme I) or CRS (Scheme II) before sale or import.",
    alsoAcceptedIn: ["Often requested by Indian buyers and marketplaces as proof of compliance"],
  },
  bee: {
    slug: "bee",
    primaryMarketId: "india",
    role: "required",
    insight:
      "Required in India for appliances under BEE star-labelling regulations (for example ACs, refrigerators, fans and water heaters).",
  },
  "wpc-eta": {
    slug: "wpc-eta",
    primaryMarketId: "india",
    role: "required",
    insight:
      "Required in India for wireless / licence-exempt radio equipment (Bluetooth, Wi-Fi and similar) before import or sale — Equipment Type Approval (ETA).",
  },
  ce: {
    slug: "ce",
    primaryMarketId: "european-union",
    role: "required",
    insight:
      "Required to place many products on the European Union / EEA market. CE evidence is also widely reused as a buyer or importer reference in other regions.",
    alsoAcceptedIn: [
      "Commonly accepted by global buyers as baseline safety / EMC evidence",
      "May support parallel filings (for example Gulf or Saudi) when standards align",
    ],
  },
  fcc: {
    slug: "fcc",
    primaryMarketId: "united-states",
    role: "required",
    insight:
      "Required in the United States for devices that emit radio frequency energy. Often expected by US retailers and platforms before listing.",
    alsoAcceptedIn: ["Referenced by many global buyers for RF / EMC confidence"],
  },
  "g-mark": {
    slug: "g-mark",
    primaryMarketId: "gcc",
    role: "required",
    insight:
      "Required for regulated categories across GCC / GSO member countries (for example Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman and Yemen) under Gulf technical regulations.",
    alsoAcceptedIn: ["Saudi shipments may still need SABER registration in parallel"],
  },
  saber: {
    slug: "saber",
    primaryMarketId: "saudi-arabia",
    role: "required",
    insight:
      "Required for regulated products imported into Saudi Arabia — Product and Shipment Certificates of Conformity on the SABER platform before customs clearance.",
    alsoAcceptedIn: ["Distinct from GMARK; some products need both"],
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
