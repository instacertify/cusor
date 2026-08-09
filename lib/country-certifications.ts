/**
 * Country-wise certification hubs — browse schemes by market / country.
 * Public pages read from SQLite (Admin → Countries). DEFAULT_COUNTRY_HUBS seeds empty DBs.
 */

import { getDb } from "@/lib/db";
import type { MarketId } from "@/lib/market-applicability";
import { CERT_MARKETS } from "@/lib/market-applicability";

export interface CountrySchemeCopy {
  id?: number;
  /** Matches certifications.slug in the database */
  certSlug: string;
  /** Scheme name as shown on the country hub */
  name: string;
  /** One-line role in this market */
  role: string;
  /** Unique paragraph for this scheme × country */
  summary: string;
  /** Who typically needs it when selling into this market */
  whoNeedsIt: string;
  /** Example product types (plain language) */
  examples: string[];
}

export interface CountryHub {
  id?: number;
  slug: string;
  /** Optional link to market-applicability id (india, european-union, …) */
  marketId: string;
  name: string;
  /** Short label for nav / chips */
  shortName: string;
  /** SEO / page title fragment */
  metaTitle: string;
  metaDescription: string;
  /** Hero supporting line */
  intro: string;
  /** Regulatory landscape overview */
  overview: string;
  /** Authority / platform note */
  authority: string;
  /** Practical filing tip unique to this market */
  filingTip: string;
  /** What importers / brands should check first */
  firstChecks: string[];
  schemes: CountrySchemeCopy[];
  faqs: { question: string; answer: string }[];
  sort?: number;
  active?: number;
}

/** Seed content for first boot / empty country_hubs table. */
export const DEFAULT_COUNTRY_HUBS: CountryHub[] = [
  {
    slug: "india",
    marketId: "india",
    name: "India",
    shortName: "India",
    metaTitle: "India Certifications — BIS, BEE, WPC ETA | Certko",
    metaDescription:
      "Country-wise guide to India product certifications: BIS ISI/CRS, BEE star labelling and WPC ETA for wireless gear — who needs what before import or sale.",
    intro:
      "India’s compliance map is scheme-driven: Quality Control Orders, energy labels and wireless approvals sit under different authorities. Start with your product category, then pick the right mark.",
    overview:
      "Selling or importing regulated goods into India usually means proving conformity to Indian Standards or sector rules before customs clearance and marketplace listing. BIS covers product safety and quality for notified categories; BEE governs energy performance labels on specified appliances; WPC (DoT) handles equipment type approval for many licence-exempt radio devices. These are separate filings — one product can need more than one.",
    authority:
      "Typical touchpoints: Bureau of Indian Standards (BIS) for ISI Mark and CRS; Bureau of Energy Efficiency (BEE) for star labelling; Wireless Planning & Coordination (WPC) under DoT for ETA. Enforcement often shows up at customs, e-commerce category checks and buyer audits.",
    filingTip:
      "Map HSN / product description to the live QCO or labelling notification first. Factory location, brand ownership and whether you are manufacturer or importer change the application path more than the brochure name of the mark.",
    firstChecks: [
      "Is the product under a current Quality Control Order (BIS Scheme I or CRS)?",
      "Does it fall under BEE mandatory or voluntary star labelling?",
      "Does it transmit (Wi-Fi, Bluetooth, etc.) and need WPC ETA before import?",
      "Who holds the local applicant role — Indian manufacturer, authorised Indian representative, or importer?",
    ],
    schemes: [
      {
        certSlug: "bis",
        name: "BIS (ISI Mark & CRS)",
        role: "Mandatory product certification for many notified categories",
        summary:
          "For India, BIS is the gate for products listed under Quality Control Orders. Scheme I (ISI Mark) and Scheme II (CRS) use different lab and licence mechanics, but both answer the same buyer question: can this SKU legally enter the Indian market under the notified Indian Standard?",
        whoNeedsIt:
          "Indian manufacturers, foreign brands exporting to India, and importers clearing regulated electronics, appliances, steel, chemicals and similar notified lines.",
        examples: [
          "IT and A/V equipment under CRS",
          "Domestic appliances under ISI",
          "Cables, switches and many industrial components under QCOs",
        ],
      },
      {
        certSlug: "bee",
        name: "BEE star labelling",
        role: "Energy-efficiency labelling for notified appliances",
        summary:
          "BEE star labels tell Indian buyers how efficient an appliance is — and for mandatory categories, sale without a valid label is a compliance failure. Models are registered against BEE tables; star levels and test methods change by product family, so catalogue data matters as much as the physical sample.",
        whoNeedsIt:
          "Appliance brands and importers placing ACs, refrigerators, fans, water heaters and other notified products on the Indian retail or online market.",
        examples: [
          "Room air conditioners",
          "Frost-free refrigerators",
          "Ceiling fans and storage water heaters",
        ],
      },
      {
        certSlug: "wpc-eta",
        name: "WPC ETA",
        role: "Equipment Type Approval for licence-exempt wireless",
        summary:
          "If the product radiates in bands that need Equipment Type Approval, WPC ETA is the India wireless clearance — separate from BIS. Modules already approved can sometimes simplify the path, but the finished product still needs a clear RF story for import and sale.",
        whoNeedsIt:
          "Brands shipping Bluetooth, Wi-Fi, IoT or other short-range radio products into India, including devices that look “wired” but embed a radio module.",
        examples: [
          "Wireless earbuds and speakers",
          "Wi-Fi routers and IoT gateways",
          "Smart appliances with Bluetooth / Wi-Fi",
        ],
      },
    ],
    faqs: [
      {
        question: "Can one product need BIS and WPC together?",
        answer:
          "Yes. A smart appliance can sit under a BIS QCO for safety/quality and still need WPC ETA because it includes Wi-Fi or Bluetooth. Plan both timelines before booking production for India.",
      },
      {
        question: "Is BEE the same as BIS?",
        answer:
          "No. BIS is product certification against Indian Standards for notified goods. BEE is energy labelling. Some appliances need both; the applications, portals and test evidence are different.",
      },
    ],
  },
  {
    slug: "european-union",
    marketId: "european-union",
    name: "European Union",
    shortName: "EU / EEA",
    metaTitle: "European Union Certifications — CE Marking | Certko",
    metaDescription:
      "Country-wise guide to EU / EEA market access: CE marking duties, who must affix the mark, and how Certko supports testing and technical documentation.",
    intro:
      "Access to the EU and EEA for many product families rests on CE conformity — the manufacturer’s declaration backed by the right directives, standards and, where required, a notified body.",
    overview:
      "CE marking is not a quality badge; it is a legal signal that applicable EU product legislation has been met. Depending on the product, that can mean EMC, LVD, Radio Equipment Directive, Machinery, RoHS-related obligations and more. Importers and distributors in the EU also carry duties — so documentation has to travel with the product, not sit only with the overseas factory.",
    authority:
      "Framework sits in EU product legislation and harmonised standards. Notified bodies are involved for higher-risk modules; many electronics follow manufacturer self-declaration after accredited testing. National market surveillance authorities enforce after placement on the market.",
    filingTip:
      "Write the intended EU use-case first (fixed installation vs portable, radio vs non-radio). That choice drives which directives apply and whether RED testing is in scope — before you quote a single lab invoice.",
    firstChecks: [
      "Which EU directives apply to the finished product (not only the power supply)?",
      "Is radio functionality present (RED) or only EMC / LVD?",
      "Do you need a European authorised representative?",
      "Is technical documentation ready for market surveillance requests?",
    ],
    schemes: [
      {
        certSlug: "ce",
        name: "CE marking",
        role: "Required conformity mark for many products on the EU / EEA market",
        summary:
          "For the European Union, CE is the primary country-wise pathway Certko supports today. The work is less about “getting a logo” and more about building a defensible Declaration of Conformity: correct directives, test evidence, risk assessment and traceable technical files.",
        whoNeedsIt:
          "Manufacturers placing goods on the EU/EEA market, and brands whose EU importer will not accept shipments without CE evidence and labelling.",
        examples: [
          "Mains-powered appliances and power supplies",
          "Radio-enabled consumer electronics",
          "Industrial and ITE equipment sold into Europe",
        ],
      },
    ],
    faqs: [
      {
        question: "Does CE alone unlock every European country?",
        answer:
          "CE covers the EU/EEA conformity framework for products in scope. Individual countries may still have language, packaging or sector rules. Northern Ireland and UK arrangements need a separate check if you also ship to Great Britain.",
      },
      {
        question: "Can CE test reports help outside Europe?",
        answer:
          "Often yes as supporting evidence for buyers or parallel filings, but Gulf, Saudi and US schemes have their own rules. Treat CE as EU market access first, reuse second.",
      },
    ],
  },
  {
    slug: "united-states",
    marketId: "united-states",
    name: "United States",
    shortName: "United States",
    metaTitle: "United States Certifications — FCC | Certko",
    metaDescription:
      "Country-wise guide to US market access for radio and EMC: FCC authorisation paths, when testing is required, and how Certko supports exporters.",
    intro:
      "For radio and many electronic products, US market access starts with FCC rules — authorisation before you list, import or sell devices that can emit RF energy.",
    overview:
      "The Federal Communications Commission regulates devices that can interfere with radio communications. Depending on the product, you may follow Supplier’s Declaration of Conformity, certification with an FCC-recognised TCB, or related labelling and user-information duties. Retailers and marketplaces commonly ask for the FCC ID or SDoC package before approving a listing.",
    authority:
      "FCC rules (notably Part 15 and related parts for intentional radiators) plus accredited lab testing and, where required, Telecommunication Certification Body (TCB) grants. Customs and major platforms often mirror these expectations.",
    filingTip:
      "Separate intentional radiators (Wi-Fi, Bluetooth, cellular) from digital devices that only have unintentional emissions. The authorisation path and lead time differ — quoting “FCC” without that split usually underestimates the work.",
    firstChecks: [
      "Is the product an intentional radiator, unintentional radiator, or both?",
      "Will US retail / Amazon-style listing require an FCC ID on the device?",
      "Are modular approvals available for the radio inside?",
      "Do user manuals and labelling meet Part 15 statements?",
    ],
    schemes: [
      {
        certSlug: "fcc",
        name: "FCC authorisation",
        role: "US RF / EMC market access for covered electronic devices",
        summary:
          "On the United States hub, FCC is the scheme Certko maps for RF and related EMC compliance. The practical deliverable is an authorisation path your importer and retailer recognise — test reports, FCC ID where applicable, and labelling that matches the grant or SDoC.",
        whoNeedsIt:
          "Exporters and US importers of wireless gadgets, IT equipment and electronics that must clear FCC expectations before sale.",
        examples: [
          "Wi-Fi and Bluetooth consumer devices",
          "IoT sensors and gateways",
          "Computing and networking hardware",
        ],
      },
    ],
    faqs: [
      {
        question: "Is FCC the same as UL?",
        answer:
          "No. FCC addresses radio / EMC rules. UL (or other NRTL marks) relates to product safety listing and is a different buyer or code requirement. Many US-bound products need both conversations.",
      },
      {
        question: "Do I need FCC if I already have CE?",
        answer:
          "CE does not replace FCC. Limits, procedures and labelling differ. Plan US testing or gap analysis even when EU reports look similar.",
      },
    ],
  },
  {
    slug: "gcc",
    marketId: "gcc",
    name: "GCC countries",
    shortName: "GCC",
    metaTitle: "GCC Certifications — GMARK | Certko",
    metaDescription:
      "Country-wise guide to Gulf Conformity Mark (GMARK) across GSO member states — regulated categories, evidence and how it differs from Saudi SABER.",
    intro:
      "Across Gulf Cooperation Council markets, regulated product categories often need the Gulf Conformity Mark (GMARK) under GSO technical regulations — one regional mark, several national clearance nuances.",
    overview:
      "GMARK shows conformity with applicable Gulf technical regulations for listed product groups. Manufacturers work through Notified Bodies recognised under the Gulf scheme. Member states still run their own import controls; Saudi Arabia in particular may also require SABER certificates for the same shipment — GMARK alone is not always the full Saudi story.",
    authority:
      "GSO / Gulf technical regulations and GMARK Notified Bodies. National authorities and customs in UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman and Yemen apply the mark at the border and in market checks.",
    filingTip:
      "Confirm the exact GSO regulation and product family before sampling. Low-voltage electrical equipment, toys and other regulated sets do not share one generic test plan — and Saudi dual-track (GMARK + SABER) should be priced up front when KSA is in scope.",
    firstChecks: [
      "Is the category listed under a Gulf technical regulation requiring GMARK?",
      "Which Notified Body track fits the product?",
      "Are you shipping only to UAE/GCC generally, or also into Saudi Arabia (SABER)?",
      "Do Arabic labelling or local importer duties apply?",
    ],
    schemes: [
      {
        certSlug: "g-mark",
        name: "GMARK (Gulf Conformity Mark)",
        role: "Regional conformity mark for regulated GCC categories",
        summary:
          "On the GCC country hub, GMARK is the scheme to open first. It is built for cross-Gulf acceptance on regulated lines, with factory and product assessment through a recognised Notified Body rather than a single national ISI-style licence.",
        whoNeedsIt:
          "Exporters placing regulated electrical, toy or similar GSO-covered products into GCC member states.",
        examples: [
          "Low-voltage electrical equipment in scope of GSO regs",
          "Toys and children’s products under Gulf rules",
          "Other GSO-notified consumer categories",
        ],
      },
    ],
    faqs: [
      {
        question: "Does GMARK replace SABER for Saudi Arabia?",
        answer:
          "No. SABER is Saudi Arabia’s platform for Product and Shipment Certificates of Conformity. Some products need GMARK evidence and SABER registration together. Treat them as parallel tracks when KSA is a destination.",
      },
      {
        question: "Is one GMARK valid in every GCC state?",
        answer:
          "GMARK is the Gulf-level conformity mark for covered regulations, but each country still clears imports under its own procedures. Always confirm destination-country documents with your importer.",
      },
    ],
  },
  {
    slug: "saudi-arabia",
    marketId: "saudi-arabia",
    name: "Saudi Arabia",
    shortName: "Saudi Arabia",
    metaTitle: "Saudi Arabia Certifications — SABER | Certko",
    metaDescription:
      "Country-wise guide to Saudi conformity: SABER Product and Shipment Certificates of Conformity, how they relate to GMARK, and what importers need before clearance.",
    intro:
      "Saudi Arabia clears many regulated imports through SABER — Product Certificates of Conformity and Shipment Certificates tied to the live consignment, not only a one-time factory mark.",
    overview:
      "SABER is the Saudi platform used to register products and issue shipment-level CoCs before customs release for regulated categories. Evidence may draw on test reports, GMARK, or other accepted schemes depending on the technical regulation. Brands that only prepared “GCC marking” often discover Saudi still needs SABER accounts, Saudi importer involvement and per-shipment steps.",
    authority:
      "Saudi Standards, Metrology and Quality Organization (SASO) frameworks delivered through the SABER platform, with conformity assessment bodies and Saudi importers in the workflow.",
    filingTip:
      "Open the SABER product registration path as soon as the Saudi HS code and regulation are known — do not wait until the container is at Jeddah or Dammam. Shipment CoCs are time-bound to the consignment.",
    firstChecks: [
      "What Saudi technical regulation applies to the HS code?",
      "Is a Product Certificate of Conformity already active for this model?",
      "Who is the Saudi importer on SABER for the shipment CoC?",
      "Is GMARK also required for this category?",
    ],
    schemes: [
      {
        certSlug: "saber",
        name: "SABER",
        role: "Saudi Product & Shipment Certificates of Conformity",
        summary:
          "For Saudi Arabia as a destination country, SABER is the operational certification path Certko highlights first. Success looks like clean Product CoC status plus shipment certificates that match what customs and the importer expect — not a generic “Gulf certificate” PDF alone.",
        whoNeedsIt:
          "Foreign manufacturers and Saudi importers bringing regulated consumer, electrical and similar goods into the Kingdom.",
        examples: [
          "Regulated electrical and electronic imports",
          "Consumer products under SASO/SABER lists",
          "Shipments that also carry GMARK evidence",
        ],
      },
    ],
    faqs: [
      {
        question: "Is SABER a one-time certificate?",
        answer:
          "Product registration / Product CoC can cover a model for a validity period, but shipment certificates are raised per consignment. Budget both in your lead time.",
      },
      {
        question: "Can I use CE reports for SABER?",
        answer:
          "Sometimes as supporting evidence when regulations accept equivalent standards — never assume automatic acceptance. The SABER track and accepted CAB still decide what counts.",
      },
    ],
  },
];

type CountryHubRow = {
  id: number;
  slug: string;
  market_id: string;
  name: string;
  short_name: string;
  meta_title: string;
  meta_description: string;
  intro: string;
  overview: string;
  authority: string;
  filing_tip: string;
  first_checks: string;
  sort: number;
  active: number;
};

type CountrySchemeRow = {
  id: number;
  country_id: number;
  cert_slug: string;
  name: string;
  role: string;
  summary: string;
  who_needs_it: string;
  examples: string;
  sort: number;
};

function parseJsonStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v) => String(v)).filter(Boolean);
  } catch {
    return [];
  }
}

function assembleHub(row: CountryHubRow, schemes: CountrySchemeRow[], faqs: CountryHub["faqs"]): CountryHub {
  return {
    id: row.id,
    slug: row.slug,
    marketId: row.market_id || row.slug,
    name: row.name,
    shortName: row.short_name || row.name,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    intro: row.intro,
    overview: row.overview,
    authority: row.authority,
    filingTip: row.filing_tip,
    firstChecks: parseJsonStringArray(row.first_checks),
    schemes: schemes.map((s) => ({
      id: s.id,
      certSlug: s.cert_slug,
      name: s.name,
      role: s.role,
      summary: s.summary,
      whoNeedsIt: s.who_needs_it,
      examples: parseJsonStringArray(s.examples),
    })),
    faqs,
    sort: row.sort,
    active: row.active,
  };
}

function loadFaqsForSlug(slug: string): CountryHub["faqs"] {
  return (
    getDb()
      .prepare(
        "SELECT question, answer FROM faqs WHERE scope = ? ORDER BY sort, id"
      )
      .all(`country:${slug}`) as { question: string; answer: string }[]
  ).map((f) => ({ question: f.question, answer: f.answer }));
}

function loadSchemesForCountry(countryId: number): CountrySchemeRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM country_schemes WHERE country_id = ? ORDER BY sort, id"
    )
    .all(countryId) as CountrySchemeRow[];
}

/** Active country hubs for public pages (homepage, browse, sitemap). */
export function getCountryHubs(): CountryHub[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM country_hubs WHERE active = 1 ORDER BY sort, id"
    )
    .all() as CountryHubRow[];
  return rows.map((row) =>
    assembleHub(row, loadSchemesForCountry(row.id), loadFaqsForSlug(row.slug))
  );
}

/** All hubs including inactive — for Admin list. */
export function getAllCountryHubRecords(): CountryHubRow[] {
  return getDb()
    .prepare("SELECT * FROM country_hubs ORDER BY sort, id")
    .all() as CountryHubRow[];
}

export function getCountryHubRecordById(id: number): CountryHubRow | undefined {
  return getDb()
    .prepare("SELECT * FROM country_hubs WHERE id = ?")
    .get(id) as CountryHubRow | undefined;
}

export function getCountrySchemesByCountryId(countryId: number): CountrySchemeRow[] {
  return loadSchemesForCountry(countryId);
}

export function getCountryHubBySlug(slug: string): CountryHub | undefined {
  const row = getDb()
    .prepare(
      "SELECT * FROM country_hubs WHERE slug = ? AND active = 1"
    )
    .get(slug) as CountryHubRow | undefined;
  if (!row) return undefined;
  return assembleHub(row, loadSchemesForCountry(row.id), loadFaqsForSlug(row.slug));
}

/** Map market-applicability id → country hub slug. */
export function countryHubSlugForMarket(marketId: MarketId | string): string | null {
  if (marketId === "global") return null;
  const row = getDb()
    .prepare(
      `SELECT slug FROM country_hubs
       WHERE active = 1 AND (market_id = ? OR slug = ?)
       ORDER BY sort, id LIMIT 1`
    )
    .get(marketId, marketId) as { slug: string } | undefined;
  return row?.slug ?? null;
}

export function countryHubPath(slug: string): string {
  return `/certifications/countries/${slug}`;
}

/** Flat search index for country-wise filter UI and menu helpers. */
export function buildCountrySearchIndex(): {
  countrySlug: string;
  countryName: string;
  certSlug: string;
  certName: string;
  haystack: string;
}[] {
  const rows: {
    countrySlug: string;
    countryName: string;
    certSlug: string;
    certName: string;
    haystack: string;
  }[] = [];
  for (const hub of getCountryHubs()) {
    for (const scheme of hub.schemes) {
      const haystack = [
        hub.name,
        hub.shortName,
        scheme.name,
        scheme.certSlug,
        scheme.role,
        scheme.summary,
        ...scheme.examples,
      ]
        .join(" ")
        .toLowerCase();
      rows.push({
        countrySlug: hub.slug,
        countryName: hub.name,
        certSlug: scheme.certSlug,
        certName: scheme.name,
        haystack,
      });
    }
  }
  return rows;
}

export function marketsWithCountryHubs() {
  return CERT_MARKETS.filter((m) => countryHubSlugForMarket(m.id));
}

export function encodeChecksOrExamples(lines: string[]): string {
  return JSON.stringify(lines.map((l) => l.trim()).filter(Boolean));
}

export function linesFromTextarea(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
