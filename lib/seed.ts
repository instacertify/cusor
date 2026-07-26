import type Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { slugify, formatPriceRange } from "./format";
import { CERTIFICATIONS } from "./seed-certifications";

interface RawProduct {
  category: string;
  standard: string;
  name: string;
  lab_count: number;
  min_price: number | null;
  max_price: number | null;
}
interface RawLab {
  code: string | null;
  name: string;
  city: string;
  state: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  validity: string | null;
  categories: string[];
  scope_count: number;
  min_price: number | null;
  max_price: number | null;
}
interface RawRow {
  category: string;
  standard: string;
  product: string;
  lab: string;
  price: number | null;
}

interface MasterStandard {
  is_no: string;
  title: string;
  category: string;
  hsn4: string;
  hsn8: string;
  status: string;
  order: string;
}
interface UpcomingQco {
  product: string;
  ministry: string;
  hsn4: string;
  hsn8: string;
  standard: string;
  enforcement_date: string;
  scheme: string;
}

interface FeeRecord {
  is_no: string;
  title: string;
  category: string;
  hsn4: string;
  hsn8: string;
  status: string;
  order: string;
  fee_large: number | null;
  fee_medium: number | null;
  fee_small: number | null;
  fee_micro: number | null;
  unit_info: string;
  testing_charges: string;
}

/** Normalize an IS reference like "IS 1554 : Part 1 (1988)" or "IS 13450 : PART 2 : SEC 13"
 *  into a comparable key such as "IS1554P1" / "IS13450P2S13". */
export function normalizeIsNo(raw: string): string {
  if (!raw) return "";
  let s = raw.toUpperCase();
  s = s.replace(/\(\d{4}(?:\.\d)?\)/g, ""); // (year)
  s = s.replace(/:\s*\d{4}\b/g, ""); // :year
  s = s.replace(/\bPART\b/g, "P").replace(/\bSEC(?:TION)?\b/g, "S");
  s = s.replace(/[^A-Z0-9]/g, "");
  return s;
}

const CATEGORY_META: Record<
  string,
  { icon: string; timeline: string; description: string }
> = {
  "Automotive & Cycle Components": {
    icon: "car",
    timeline: "10-18 weeks",
    description:
      "Wheel rims, cycle frames, chains, forks and other vehicle components covered by mandatory Indian Standards for road safety.",
  },
  "Cables & Wires": {
    icon: "cable",
    timeline: "8-14 weeks",
    description:
      "Power cables, winding wires, conductors, conduit systems and photovoltaic cables requiring ISI mark certification.",
  },
  "Cement & Construction Materials": {
    icon: "beam",
    timeline: "14-26 weeks",
    description:
      "Cement varieties, aggregates, bricks and structural construction inputs under long-standing BIS quality control orders.",
  },
  Chemicals: {
    icon: "flask",
    timeline: "8-14 weeks",
    description:
      "Industrial chemicals, acids and technical-grade compounds notified under BIS mandatory certification.",
  },
  "Electrical & Electronics": {
    icon: "cpu",
    timeline: "6-12 weeks",
    description:
      "IT hardware, consumer electronics and electronic components covered under CRS registration and ISI marking.",
  },
  "Electrical Appliances": {
    icon: "plug",
    timeline: "8-14 weeks",
    description:
      "Household and commercial electrical appliances — heaters, irons, kitchen machines — tested to IS 302 series safety standards.",
  },
  "Fire Safety Products": {
    icon: "flame",
    timeline: "10-16 weeks",
    description:
      "Fire extinguishers, fire survival cables, hoses and suppression equipment requiring BIS conformity.",
  },
  "Food, Dairy & Beverages": {
    icon: "cup",
    timeline: "8-14 weeks",
    description:
      "Milk powder, packaged water, food-grade equipment and beverage products under mandatory quality orders.",
  },
  Footwear: {
    icon: "shoe",
    timeline: "10-16 weeks",
    description:
      "Leather, rubber and PVC footwear covered by the footwear Quality Control Order and IS 15298 series.",
  },
  "Furniture & Storage": {
    icon: "chair",
    timeline: "8-14 weeks",
    description: "Steel furniture, racking and storage systems notified for BIS certification.",
  },
  "Glass & Ceramics": {
    icon: "glass",
    timeline: "10-16 weeks",
    description:
      "Safety glass, glassware, ceramic tiles and sanitaryware requiring ISI mark before sale in India.",
  },
  "Hardware & Fittings": {
    icon: "wrench",
    timeline: "8-12 weeks",
    description: "Builder hardware, fasteners and fittings under BIS standard marks.",
  },
  Helmets: {
    icon: "helmet",
    timeline: "10-16 weeks",
    description:
      "Protective helmets for two-wheeler riders and industrial use — one of the most strictly enforced ISI categories.",
  },
  "LPG & Gas Equipment": {
    icon: "cylinder",
    timeline: "12-20 weeks",
    description:
      "LPG cylinders, valves, regulators and gas stoves requiring BIS certification for safe domestic use.",
  },
  "Leather Products": {
    icon: "briefcase",
    timeline: "8-14 weeks",
    description: "Leather goods and components notified under BIS quality control orders.",
  },
  "Machinery, Tools & Instruments": {
    icon: "cog",
    timeline: "10-18 weeks",
    description:
      "Industrial machinery, power tools and measuring instruments covered by mandatory Indian Standards.",
  },
  "Medical Devices & Textiles": {
    icon: "medical",
    timeline: "10-18 weeks",
    description:
      "Medical equipment, diagnostic devices and medical textiles requiring BIS conformity assessment.",
  },
  "Non-Ferrous Metals": {
    icon: "ingot",
    timeline: "8-14 weeks",
    description:
      "Aluminium, copper and alloy products — sheets, foils, rods — under BIS metal quality orders.",
  },
  Others: {
    icon: "box",
    timeline: "8-16 weeks",
    description:
      "Additional notified products spanning batteries, appliances and specialised industrial goods.",
  },
  "Paints, Coatings & Adhesives": {
    icon: "paint",
    timeline: "8-14 weeks",
    description: "Paints, varnishes, coatings and adhesives requiring ISI certification.",
  },
  "Paper & Packaging": {
    icon: "file",
    timeline: "8-12 weeks",
    description:
      "Paper, boards, sacks and packaging material under BIS mandatory certification.",
  },
  "Pesticides & Agro-Chemicals": {
    icon: "leaf",
    timeline: "10-16 weeks",
    description:
      "Crop protection chemicals and agro inputs notified under BIS quality control.",
  },
  "Petroleum & Lubricants": {
    icon: "fuel",
    timeline: "8-14 weeks",
    description: "Fuels, lubricants and petroleum products requiring conformity to Indian Standards.",
  },
  "Pressure Cookers": {
    icon: "pot",
    timeline: "10-14 weeks",
    description:
      "Domestic pressure cookers and parts — a strictly enforced consumer safety category under IS 2347.",
  },
  "PVC & Plastic Products": {
    icon: "bottle",
    timeline: "8-14 weeks",
    description:
      "PVC pipes, plastic feeding bottles, water tanks and moulded products under mandatory BIS orders.",
  },
  "Pumps, Valves & Irrigation": {
    icon: "droplet",
    timeline: "10-16 weeks",
    description:
      "Pumps, valves, sprinklers and irrigation equipment covered by ISI mark schemes.",
  },
  "Rubber Products": {
    icon: "tire",
    timeline: "10-16 weeks",
    description: "Tyres, tubes, hoses and technical rubber goods requiring BIS certification.",
  },
  "Safety & PPE": {
    icon: "shield",
    timeline: "10-16 weeks",
    description:
      "Personal protective equipment — eye protectors, gloves, safety boots — under IS safety standards.",
  },
  "Soaps, Detergents & Cosmetics": {
    icon: "sparkles",
    timeline: "8-12 weeks",
    description: "Household and personal care products notified for BIS conformity.",
  },
  "Steel Products": {
    icon: "beam",
    timeline: "12-20 weeks",
    description:
      "Structural steel, sheets, strips, bars and wire products under the steel Quality Control Orders.",
  },
  Textiles: {
    icon: "spool",
    timeline: "8-14 weeks",
    description: "Textile products and technical fabrics requiring Indian Standard conformity.",
  },
  Toys: {
    icon: "blocks",
    timeline: "10-16 weeks",
    description:
      "Electric and non-electric toys — mandatory ISI marking under the Toys Quality Control Order 2020.",
  },
  "Wood & Plywood Products": {
    icon: "tree",
    timeline: "8-14 weeks",
    description:
      "Plywood, boards, laminates and wood products covered by BIS certification requirements.",
  },
};

function productScheme(category: string, standard: string): string {
  if (/^ER\s/i.test(standard)) return "CRS";
  if (
    category === "Electrical & Electronics" &&
    /^IS (13252|616|60950)/.test(standard)
  ) {
    return "CRS";
  }
  return "ISI";
}

function cleanProductName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*Specification.*$/i, "")
    .replace(/\s*\((First|Second|Third|Fourth|Fifth|Sixth|Seventh) Revision\)\s*$/i, "")
    .replace(/\s*---?\s*Method of tests and requirements$/i, "")
    .trim();
}

function titleCase(name: string): string {
  if (name === name.toUpperCase() && name.length > 6) {
    return name
      .toLowerCase()
      .replace(/(^|[\s(/-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  }
  return name;
}

function buildWriteup(
  name: string,
  standard: string,
  category: string,
  scheme: string,
  labCount: number,
  minPrice: number | null,
  maxPrice: number | null,
  timeline: string
): string {
  const price = formatPriceRange(minPrice, maxPrice);
  const std = standard || "the applicable Indian Standard";
  const lines: string[] = [];
  lines.push(
    `## Why ${name} needs BIS certification\n\n${name} falls under the ${category} category and is covered by **${std}**. Manufacturers and importers must obtain the ${scheme === "CRS" ? "Compulsory Registration Scheme (CRS) registration" : "ISI mark licence"} from the Bureau of Indian Standards before the product can be manufactured, imported, stored or sold in India. Selling a notified product without a valid BIS licence can lead to seizure of stock, marketplace delisting and penalties under the BIS Act, 2016.`
  );
  lines.push(
    `## Testing & costs\n\nSample testing for ${std} is currently available at **${labCount} BIS-recognised ${labCount === 1 ? "laboratory" : "laboratories"}** across India. Reported test charges range from **${price}** (excluding GST), depending on the laboratory, the number of models/varieties and the tests included in the scope. Certko can help you pick a lab that balances cost, turnaround time and location.`
  );
  lines.push(
    `## Typical process\n\n1. **Standard & scope check** – confirm your exact product variant maps to ${std}.\n2. **Documentation** – factory details, quality control records, test equipment list and trademark proof.\n3. **Sample testing** – testing at a BIS-recognised lab against every clause of the standard.\n4. **Factory inspection** – BIS officers audit the manufacturing site (for ISI mark licences).\n5. **Grant of licence** – on successful evaluation, the licence/registration is issued, typically within ${timeline}.`
  );
  return lines.join("\n\n");
}

function buildProductFaqs(
  name: string,
  standard: string,
  scheme: string,
  labCount: number,
  minPrice: number | null,
  maxPrice: number | null,
  timeline: string
): { question: string; answer: string }[] {
  const price = formatPriceRange(minPrice, maxPrice);
  const std = standard || "the applicable Indian Standard";
  return [
    {
      question: `Is BIS certification mandatory for ${name}?`,
      answer: `Yes. ${name} is notified under ${std}, which means a valid BIS ${
        scheme === "CRS" ? "CRS registration" : "ISI mark licence"
      } is required before the product can be manufactured, imported or sold in India.`,
    },
    {
      question: `How much does BIS testing cost for ${name}?`,
      answer: `Laboratory test charges for ${std} currently range from ${price} (excluding GST) across ${labCount} BIS-recognised ${
        labCount === 1 ? "lab" : "labs"
      }. Total certification cost additionally includes BIS application fees, marking fees and consultant charges if you use one.`,
    },
    {
      question: `How long does certification take for ${name}?`,
      answer: `Most applicants complete the process in ${timeline}, covering documentation, sample testing and (for ISI licences) the factory inspection. Timelines vary with lab workload and how quickly queries from BIS are resolved.`,
    },
    {
      question: `Which labs can test ${name}?`,
      answer: `${labCount} BIS-recognised ${
        labCount === 1 ? "laboratory is" : "laboratories are"
      } currently approved to test against ${std}. Use the lab list on this page to compare locations and indicative prices, or ask Certko to shortlist one for you.`,
    },
    {
      question: `Can Certko handle the entire BIS process for ${name}?`,
      answer: `Yes. Certko's experts manage the end-to-end process — application drafting, technical file preparation, lab coordination, factory inspection readiness and licence grant follow-up. Request a free quote and we respond within 24 hours.`,
    },
  ];
}

const GLOBAL_FAQS: { question: string; answer: string }[] = [
  {
    question: "What is BIS certification?",
    answer:
      "BIS certification is a conformity assessment run by the Bureau of Indian Standards. It confirms that a product meets the relevant Indian Standard (IS). For notified products it is mandatory: goods cannot legally be manufactured, imported or sold in India without the ISI mark licence or CRS registration.",
  },
  {
    question: "What is the difference between ISI mark and CRS registration?",
    answer:
      "The ISI mark (Scheme I) requires product testing plus a factory inspection and applies to products like cement, steel, helmets and appliances. CRS (Scheme II) is a registration based on testing at a BIS-recognised lab, mainly for electronics and IT products. Certko's database tells you which scheme applies to your product.",
  },
  {
    question: "How much does BIS certification cost in India?",
    answer:
      "Total cost = laboratory testing charges + BIS government fees + marking fee + (optional) consultant fee. Test charges alone vary from a few thousand rupees to several lakhs depending on the standard. Every product page on Certko shows the real reported test price range across BIS-recognised labs.",
  },
  {
    question: "How long does it take to get a BIS licence?",
    answer:
      "Simple CRS registrations can complete in 6-10 weeks. ISI mark licences involving factory inspection usually take 10-26 weeks depending on the product category, lab turnaround and how quickly BIS queries are resolved.",
  },
  {
    question: "What happens if I sell a notified product without BIS certification?",
    answer:
      "Selling a notified product without certification violates the BIS Act, 2016. Consequences include product seizure, fines, imprisonment in serious cases, and immediate delisting from marketplaces like Amazon and Flipkart, which actively verify BIS registration numbers.",
  },
  {
    question: "Do foreign manufacturers need BIS certification?",
    answer:
      "Yes. Foreign manufacturers exporting notified products to India need certification under the Foreign Manufacturers Certification Scheme (FMCS) or CRS. An Authorised Indian Representative (AIR) must be appointed. Certko assists overseas factories through the entire FMCS process.",
  },
];

const PAGE_FAQS: Record<string, { question: string; answer: string }[]> = {
  products: [
    {
      question: "How do I find out if my product needs BIS certification?",
      answer:
        "Search the table by product name, IS standard number or HSN code. Each entry shows the QCO status: 'Mandatory' means you need certification before selling, 'Upcoming' means a deadline has been notified, and 'Voluntary' means the ISI mark is optional.",
    },
    {
      question: "What does the test cost range on each product mean?",
      answer:
        "It is the real reported sample-testing charge range across BIS-recognised laboratories approved for that standard, excluding GST. Total certification cost additionally includes BIS application and marking fees, which are listed on each product page.",
    },
    {
      question: "What is the difference between marking fee and testing charges?",
      answer:
        "Testing charges are paid to the laboratory for sample testing. The marking fee is an annual fee paid to BIS for using the Standard Mark, and it varies by unit size — large, medium, small and micro enterprises pay different slabs.",
    },
    {
      question: "My product is not in the list. Does that mean BIS is not required?",
      answer:
        "Not necessarily. New Quality Control Orders are notified frequently. Check the Upcoming QCOs page, or send us the product details through the contact form — we will map it to the correct standard within 24 hours, free.",
    },
  ],
  labs: [
    {
      question: "Are all labs in this directory approved by BIS?",
      answer:
        "Yes. The directory is compiled from official BIS laboratory recognition records. Each lab page lists its BIS lab code, recognition validity date and the categories it is approved to test.",
    },
    {
      question: "How should I choose between labs for my product?",
      answer:
        "Compare three things: whether the lab's scope covers your exact IS standard, the indicative test charge, and turnaround/location. A nearby lab reduces sample logistics cost; a lab with a bigger scope may bundle multiple standards in one submission.",
    },
    {
      question: "Are the prices shown final quotes?",
      answer:
        "No — they are indicative reported charges excluding GST. Final quotes depend on the number of models, varieties and optional tests. Always confirm directly with the laboratory or ask Certko to collect quotes for you.",
    },
    {
      question: "Can Certko coordinate testing with a lab on my behalf?",
      answer:
        "Yes. Our consultants handle sample submission, test witnessing, report follow-up and any retesting, as part of the end-to-end certification service. Request a free quote from the contact page.",
    },
  ],
  qco: [
    {
      question: "What is a Quality Control Order (QCO)?",
      answer:
        "A QCO is a government order that makes BIS certification mandatory for a product. Once a QCO's enforcement date passes, the product cannot be manufactured, imported, stored or sold in India without the ISI mark or CRS registration.",
    },
    {
      question: "When should I start the certification process for an upcoming QCO?",
      answer:
        "Start 3-6 months before the enforcement date. ISI licences involve documentation, lab testing and a factory inspection, and labs get congested as deadlines approach. Starting early avoids stock-outs and import blockages.",
    },
    {
      question: "Do enforcement dates ever change?",
      answer:
        "Yes — enforcement dates are extended from time to time, often with separate timelines for small and micro enterprises. We track the official BIS list, but always verify against the latest gazette notification before making final decisions.",
    },
    {
      question: "What happens if I keep selling after the enforcement date without certification?",
      answer:
        "Selling a QCO-notified product without BIS certification violates the BIS Act, 2016 — penalties include stock seizure, fines and marketplace delisting. Imports can be held at customs.",
    },
  ],
  contact: [
    {
      question: "What happens after I submit this form?",
      answer:
        "A BIS specialist reviews your product details, maps the applicable IS standard and scheme, and replies within 24 hours with an itemised cost estimate covering lab testing, BIS fees and consulting.",
    },
    {
      question: "Is the quote really free?",
      answer:
        "Yes. The standard mapping and cost estimate are free with no obligation. You only pay if you engage us to manage the certification.",
    },
    {
      question: "Do you help foreign manufacturers?",
      answer:
        "Yes. We support overseas factories under the Foreign Manufacturers Certification Scheme (FMCS) and CRS, including acting as or arranging an Authorised Indian Representative (AIR).",
    },
  ],
  guide: [
    {
      question: "How long does an ISI mark licence take end-to-end?",
      answer:
        "Typically 10-26 weeks depending on the product: documentation (1-2 weeks), lab testing (4-10 weeks), factory inspection scheduling and clearing BIS queries make up the rest. CRS registrations are faster, usually 6-10 weeks.",
    },
    {
      question: "Do I need in-house testing equipment for an ISI licence?",
      answer:
        "Yes, for most products. BIS verifies during the factory inspection that you can perform the routine quality-control tests required by the standard. The required equipment list depends on the specific IS standard.",
    },
    {
      question: "Can one licence cover multiple products or factories?",
      answer:
        "A licence is per standard per manufacturing location. Multiple varieties under the same standard can usually be included in one licence, but each factory needs its own application.",
    },
  ],
  about: [
    {
      question: "Where does Certko's data come from?",
      answer:
        "From official BIS records: laboratory recognition scopes, the mandatory certification list, marking-fee schedules and the upcoming QCO list. We clean, join and publish it in a searchable form, refreshed regularly.",
    },
    {
      question: "Is Certko affiliated with the Bureau of Indian Standards?",
      answer:
        "No. Certko is an independent compliance-intelligence platform. Licences are always issued by BIS itself; we provide data and consulting support around the process.",
    },
  ],
  search: [
    {
      question: "What can I search for?",
      answer:
        "Product names (e.g. 'pressure cooker'), IS standard numbers (e.g. 'IS 302'), HSN codes (e.g. '8516'), product categories and laboratory names — all from the same search box.",
    },
    {
      question: "Why does an HSN code return several products?",
      answer:
        "One HSN heading often covers multiple notified products, each with its own IS standard. Open each result to see which standard matches your exact product variant.",
    },
  ],
};

const TESTIMONIALS = [
  {
    name: "Rohan T.",
    role: "Appliance Importer, Mumbai",
    quote:
      "Certko showed me the exact IS standard, real lab prices and a shortlist of labs near my warehouse in one evening. The certification quote I got through them was 30% below what I had been offered elsewhere.",
    rating: 5,
  },
  {
    name: "Meera K.",
    role: "Toy Manufacturer, Delhi NCR",
    quote:
      "After the Toys QCO, we were lost. Certko's team mapped our full range to the right standards, coordinated testing and we had our ISI licence before the enforcement deadline.",
    rating: 5,
  },
  {
    name: "Arvind S.",
    role: "Cable Exporter, Ahmedabad",
    quote:
      "The lab directory alone is worth it — verified scopes, contact details and indicative pricing for hundreds of BIS labs. Our compliance team uses Certko every week.",
    rating: 5,
  },
];

const GUIDE_CONTENT = `## What is BIS certification?

The Bureau of Indian Standards (BIS) is India's national standards body. For hundreds of notified products, BIS certification is **mandatory** — the product cannot be manufactured, imported, stored or sold in India without it. Certification proves that your product conforms to the relevant Indian Standard (IS).

## The two main schemes

### 1. ISI Mark (Scheme I)

The classic ISI mark licence. It involves:

- Application with technical documentation
- Testing of samples at a BIS-recognised laboratory
- **Factory inspection** by BIS officers
- Ongoing surveillance and marking fee

Products: cement, steel, LPG cylinders, helmets, pressure cookers, toys, footwear, electrical appliances and many more.

### 2. Compulsory Registration Scheme (CRS / Scheme II)

A registration model used mostly for **electronics and IT products**. It requires testing at a BIS-recognised lab, but no factory inspection. Registration is per product family and manufacturing location.

## Step-by-step process

1. **Identify the standard** — confirm which IS standard covers your exact product variant. Certko's database maps 1,400+ products to their standards.
2. **Prepare documentation** — factory registration, plant and machinery list, test equipment list, quality control plan, trademark proof, and for imports an Authorised Indian Representative (AIR).
3. **Sample testing** — submit samples to a BIS-recognised lab approved for your standard. Test charges vary widely between labs, so compare before committing.
4. **Factory inspection** (ISI only) — BIS officers verify in-house testing capability and production process.
5. **Grant of licence** — after clearing queries, BIS grants the licence. Renewals and surveillance follow.

## How much does it cost?

| Component | Typical range |
| --- | --- |
| Lab testing | ₹5,000 – ₹5,00,000+ (standard-dependent) |
| BIS application & licence fee | ₹1,000 – ₹66,000 |
| Marking fee | Annual, product-dependent |
| Consultant (optional) | ₹25,000 – ₹1,50,000 |

The single biggest variable is **lab testing**. The same standard can cost 2-4x more at one lab than another — which is exactly why Certko publishes reported price ranges for every standard.

## Common reasons applications get delayed

- Wrong standard or incomplete scope mapping
- Missing in-house test equipment for ISI licences
- Samples failing on marking/labelling clauses (easy to fix, often missed)
- Slow responses to BIS queries

## How Certko helps

Certko combines a free product-to-standard database, a directory of 400+ BIS-recognised labs with real price intelligence, and a network of vetted consultants who manage the process end-to-end. Start with the free checker, then request a quote when you are ready.`;

const ABOUT_CONTENT = `## Our mission

Certko exists to make Indian product compliance transparent. BIS certification is mandatory for hundreds of product categories, yet manufacturers and importers struggle to find three basic facts: **which standard applies, what testing really costs, and which lab can do it**.

We aggregate official BIS laboratory scope data, clean it, and publish it free — 1,400+ notified products, 400+ recognised labs, and real reported test prices.

## What we offer

- **Product database** — every notified product mapped to its IS standard, scheme, price range and approved labs.
- **Lab directory** — searchable directory of BIS-recognised laboratories with locations, scopes and contact details.
- **Expert help** — vetted BIS consultants who handle applications, testing coordination and factory inspections end-to-end.

## Data sources

Lab scope and pricing data is compiled from official BIS laboratory recognition records. Prices are indicative, exclude GST, and should be confirmed directly with the laboratory. Certko is an independent information platform and is not affiliated with the Bureau of Indian Standards.`;

export function seedDatabase(db: Database.Database) {
  const dataPath = path.join(process.cwd(), "data", "bis_dataset.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as {
    products: RawProduct[];
    labs: RawLab[];
    rows: RawRow[];
  };

  const masterPath = path.join(process.cwd(), "data", "bis_master_qco.json");
  const masterData = fs.existsSync(masterPath)
    ? (JSON.parse(fs.readFileSync(masterPath, "utf-8")) as {
        standards: MasterStandard[];
        crs: { standard: string; status: string }[];
        upcoming: UpcomingQco[];
      })
    : { standards: [], crs: [], upcoming: [] };

  // lookup: normalized IS number -> HSN / QCO facts
  const qcoByIs = new Map<string, MasterStandard>();
  for (const s of masterData.standards) {
    const key = normalizeIsNo(s.is_no);
    if (key && !qcoByIs.has(key)) qcoByIs.set(key, s);
  }

  // lookup: normalized IS number -> marking fees / unit rates (refreshed sheet, takes priority)
  const feesPath = path.join(process.cwd(), "data", "bis_fees.json");
  const feesData = fs.existsSync(feesPath)
    ? (JSON.parse(fs.readFileSync(feesPath, "utf-8")) as FeeRecord[])
    : [];
  const feesByIs = new Map<string, FeeRecord>();
  const feesByBase = new Map<string, FeeRecord>();
  const baseOf = (key: string) => key.match(/^((?:IS|SP|ER)\d+)/)?.[1] ?? "";
  for (const f of feesData) {
    const key = normalizeIsNo(f.is_no);
    if (!key) continue;
    if (!feesByIs.has(key)) feesByIs.set(key, f);
    const base = baseOf(key);
    // fallback per standard family; prefer the plain base-number entry when present
    if (base && (base === key || !feesByBase.has(base))) feesByBase.set(base, f);
  }
  const lookupFees = (isKey: string): FeeRecord | undefined =>
    feesByIs.get(isKey) ?? feesByBase.get(baseOf(isKey));
  const crsStandards = new Set(
    masterData.crs
      .flatMap((c) => c.standard.split("/"))
      .map((s) => normalizeIsNo(s))
      .filter(Boolean)
  );

  const tx = db.transaction(() => {
    // ---- settings ----
    const defaults: Record<string, string> = {
      site_name: "Certko",
      tagline: "India's BIS certification intelligence platform",
      hero_heading: "Does Your Product Need BIS Certification?",
      hero_subheading:
        "Check instantly, free. Search 1,400+ notified products by name, IS standard or HSN code to see certification type, real lab testing costs, timelines and BIS-recognised labs near you.",
      contact_email: "hello@certko.com",
      contact_phone: "+91 98765 43210",
      footer_text:
        "Certko is an independent compliance intelligence platform. We are not affiliated with the Bureau of Indian Standards. Prices are indicative and exclude GST.",
      announcement: "Updated July 2026 · 1,400+ products · 400+ labs · 29 upcoming QCOs",
      cta_heading: "Need BIS certification help?",
      cta_text:
        "Connect with verified BIS consultants who handle the entire process — application, testing, inspection and licence grant. Free quote in 24 hours.",
      stat_1_value: "1,400+", stat_1_label: "Products Covered",
      stat_2_value: "400+", stat_2_label: "Testing Labs",
      stat_3_value: "33", stat_3_label: "Product Categories",
      stat_4_value: "Free", stat_4_label: "BIS Checker Tool",
      admin_password: "certko-admin",
    };
    const insSetting = db.prepare(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
    );
    for (const [k, v] of Object.entries(defaults)) insSetting.run(k, v);

    // ---- pages ----
    const insPage = db.prepare(
      `INSERT OR IGNORE INTO pages (slug, title, meta_title, meta_description, hero_heading, hero_subheading, content, image)
       VALUES (@slug, @title, @meta_title, @meta_description, @hero_heading, @hero_subheading, @content, @image)`
    );
    insPage.run({
      slug: "guide",
      title: "BIS Certification Guide",
      meta_title: "BIS Certification Guide 2026 | Process, Cost, Documents | Certko",
      meta_description:
        "Complete 2026 guide to BIS certification in India: ISI mark vs CRS, step-by-step process, documents, costs and timelines.",
      hero_heading: "The Complete BIS Certification Guide",
      hero_subheading:
        "Everything manufacturers and importers need to know about ISI mark licences and CRS registration in India — process, documents, costs and timelines.",
      content: GUIDE_CONTENT,
      image: "/images/pages/guide.png",
    });
    insPage.run({
      slug: "about",
      title: "About Certko",
      meta_title: "About Certko | BIS Certification Intelligence",
      meta_description:
        "Certko makes Indian product compliance transparent with a free BIS product database, lab directory and expert network.",
      hero_heading: "Compliance, made transparent",
      hero_subheading:
        "Certko turns official BIS laboratory data into a free, searchable intelligence platform for manufacturers and importers.",
      content: ABOUT_CONTENT,
      image: "/images/pages/about.png",
    });
    insPage.run({
      slug: "contact",
      title: "Get Expert Help",
      meta_title: "Get BIS Certification Help | Free Quote in 24 Hours | Certko",
      meta_description:
        "Connect with verified BIS consultants. Application, testing, factory inspection and licence grant handled end-to-end. Free quote in 24 hours.",
      hero_heading: "Talk to a BIS expert",
      hero_subheading:
        "Tell us about your product and we will map the standard, estimate the full cost and send a free quote within 24 hours.",
      content: "",
      image: "/images/pages/contact.png",
    });
    insPage.run({
      slug: "home",
      title: "Home",
      meta_title: "BIS Certification Checker | Standards, Costs & Labs | Certko",
      meta_description:
        "Free BIS certification checker. Search 1,400+ notified products for IS standards, real lab test costs, timelines and 400+ BIS-recognised labs across India.",
      hero_heading: "",
      hero_subheading: "",
      content: "",
      image: "/images/hero.png",
    });

    // ---- categories ----
    const catNames = [...new Set(raw.products.map((p) => p.category))].sort();
    const insCat = db.prepare(
      `INSERT INTO categories (slug, name, icon, description, image, timeline, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const catIds = new Map<string, number>();
    catNames.forEach((name, i) => {
      const meta = CATEGORY_META[name] ?? {
        icon: "box",
        timeline: "8-16 weeks",
        description: `${name} products notified under BIS mandatory certification.`,
      };
      const slug = slugify(name);
      const res = insCat.run(
        slug,
        name,
        meta.icon,
        meta.description,
        `/images/categories/${slug}.png`,
        meta.timeline,
        i
      );
      catIds.set(name, Number(res.lastInsertRowid));
    });

    // ---- products ----
    const insProd = db.prepare(
      `INSERT INTO products (slug, name, standard, scheme, category_id, min_price, max_price, lab_count, timeline, description, image, featured, meta_title, meta_description, hsn4, hsn8, qco_status, qco_order, fee_large, fee_medium, fee_small, fee_micro, unit_info, testing_charges)
       VALUES (@slug, @name, @standard, @scheme, @category_id, @min_price, @max_price, @lab_count, @timeline, @description, @image, @featured, @meta_title, @meta_description, @hsn4, @hsn8, @qco_status, @qco_order, @fee_large, @fee_medium, @fee_small, @fee_micro, @unit_info, @testing_charges)`
    );
    const prodIds = new Map<string, number>();
    const usedSlugs = new Set<string>();
    const byLabs = [...raw.products].sort((a, b) => b.lab_count - a.lab_count);
    const featuredKeys = new Set(
      byLabs.slice(0, 8).map((p) => `${p.category}|${p.standard}|${p.name}`)
    );
    for (const p of raw.products) {
      const displayName = titleCase(cleanProductName(p.name));
      let slug = slugify(`${displayName} ${p.standard}`);
      let n = 2;
      while (usedSlugs.has(slug)) slug = slugify(`${displayName} ${p.standard}`) + `-${n++}`;
      usedSlugs.add(slug);
      const catMeta = CATEGORY_META[p.category] ?? { timeline: "8-16 weeks" };
      const isKey = normalizeIsNo(p.standard);
      const qcoInfo = qcoByIs.get(isKey);
      const feeInfo = lookupFees(isKey);
      let scheme = productScheme(p.category, p.standard);
      const status = feeInfo?.status || qcoInfo?.status || "";
      if (crsStandards.has(isKey) || status.includes("CRS")) {
        scheme = "CRS";
      }
      const key = `${p.category}|${p.standard}|${p.name}`;
      const res = insProd.run({
        slug,
        name: displayName,
        standard: p.standard,
        scheme,
        category_id: catIds.get(p.category)!,
        min_price: p.min_price,
        max_price: p.max_price,
        lab_count: p.lab_count,
        timeline: catMeta.timeline,
        description: buildWriteup(
          displayName, p.standard, p.category, scheme,
          p.lab_count, p.min_price, p.max_price, catMeta.timeline
        ),
        image: "",
        featured: featuredKeys.has(key) ? 1 : 0,
        meta_title: `${displayName} BIS Certification | ${p.standard} | Cost & Labs | Certko`,
        meta_description: `BIS certification for ${displayName} under ${p.standard}: testing cost ${formatPriceRange(p.min_price, p.max_price)}, ${p.lab_count} approved labs, timeline ${catMeta.timeline}.`,
        hsn4: feeInfo?.hsn4 || qcoInfo?.hsn4 || "",
        hsn8: feeInfo?.hsn8 || qcoInfo?.hsn8 || "",
        qco_status: status,
        qco_order: feeInfo?.order || qcoInfo?.order || "",
        fee_large: feeInfo?.fee_large ?? null,
        fee_medium: feeInfo?.fee_medium ?? null,
        fee_small: feeInfo?.fee_small ?? null,
        fee_micro: feeInfo?.fee_micro ?? null,
        unit_info: feeInfo?.unit_info ?? "",
        testing_charges: feeInfo?.testing_charges ?? "",
      });
      prodIds.set(key, Number(res.lastInsertRowid));
    }

    // ---- labs ----
    const insLab = db.prepare(
      `INSERT INTO labs (slug, code, name, city, state, contact, phone, email, validity, min_price, max_price, scope_count, categories)
       VALUES (@slug, @code, @name, @city, @state, @contact, @phone, @email, @validity, @min_price, @max_price, @scope_count, @categories)`
    );
    const labIds = new Map<string, number>();
    const usedLabSlugs = new Set<string>();
    for (const l of raw.labs) {
      let slug = slugify(l.name);
      let n = 2;
      while (usedLabSlugs.has(slug) || !slug) slug = (slugify(l.name) || "lab") + `-${n++}`;
      usedLabSlugs.add(slug);
      const res = insLab.run({
        slug,
        code: l.code,
        name: l.name,
        city: l.city || "",
        state: l.state || "",
        contact: l.contact,
        phone: l.phone,
        email: l.email,
        validity: l.validity,
        min_price: l.min_price,
        max_price: l.max_price,
        scope_count: l.scope_count,
        categories: JSON.stringify(l.categories),
      });
      labIds.set(l.code || l.name, Number(res.lastInsertRowid));
    }

    // ---- product_labs ----
    const insPL = db.prepare(
      `INSERT INTO product_labs (product_id, lab_id, price) VALUES (?, ?, ?)
       ON CONFLICT(product_id, lab_id) DO UPDATE SET price = MIN(COALESCE(product_labs.price, excluded.price), COALESCE(excluded.price, product_labs.price))`
    );
    for (const r of raw.rows) {
      const pid = prodIds.get(`${r.category}|${r.standard}|${r.product}`);
      const lid = labIds.get(r.lab);
      if (pid && lid) insPL.run(pid, lid, r.price);
    }

    // ---- FAQs ----
    const insFaq = db.prepare(
      "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
    );
    GLOBAL_FAQS.forEach((f, i) => insFaq.run("global", f.question, f.answer, i));
    for (const [pageSlug, faqs] of Object.entries(PAGE_FAQS)) {
      faqs.forEach((f, i) => insFaq.run(`page:${pageSlug}`, f.question, f.answer, i));
    }
    // per-category FAQs generated from the data
    for (const name of catNames) {
      const catId = catIds.get(name)!;
      const catProducts = raw.products.filter((p) => p.category === name);
      const prices = catProducts.flatMap((p) =>
        [p.min_price, p.max_price].filter((x): x is number => x != null)
      );
      const meta = CATEGORY_META[name] ?? { timeline: "8-16 weeks" };
      const priceRange =
        prices.length > 0
          ? formatPriceRange(Math.min(...prices), Math.max(...prices))
          : "on request";
      const catFaqs = [
        {
          question: `Which ${name} products need BIS certification?`,
          answer: `Certko currently tracks ${catProducts.length} notified ${name} products, each mapped to its IS standard. Open any product to see its QCO status — mandatory, upcoming or voluntary — along with HSN code and applicable order.`,
        },
        {
          question: `How much does BIS testing cost for ${name} products?`,
          answer: `Reported laboratory test charges in this category range from ${priceRange} (excluding GST), depending on the standard, the lab and the number of models tested. Annual BIS marking fees apply on top and are listed on each product page.`,
        },
        {
          question: `How long does BIS certification take for ${name}?`,
          answer: `Most ${name} applications complete in ${meta.timeline}, covering documentation, sample testing at a BIS-recognised lab and, for ISI licences, the factory inspection.`,
        },
        {
          question: `Can Certko manage the whole process for my ${name} product?`,
          answer: `Yes — our consultants handle standard mapping, application drafting, lab coordination and inspection readiness end-to-end. Request a free quote and we respond within 24 hours.`,
        },
      ];
      catFaqs.forEach((f, i) => insFaq.run(`category:${catId}`, f.question, f.answer, i));
    }
    // per-product FAQs for featured products only (others generated on the fly if needed)
    for (const p of raw.products) {
      const key = `${p.category}|${p.standard}|${p.name}`;
      const pid = prodIds.get(key);
      if (!pid) continue;
      const displayName = titleCase(cleanProductName(p.name));
      const catMeta = CATEGORY_META[p.category] ?? { timeline: "8-16 weeks" };
      const faqs = buildProductFaqs(
        displayName, p.standard, productScheme(p.category, p.standard),
        p.lab_count, p.min_price, p.max_price, catMeta.timeline
      );
      faqs.forEach((f, i) => insFaq.run(`product:${pid}`, f.question, f.answer, i));
    }

    // ---- testimonials ----
    const insT = db.prepare(
      "INSERT INTO testimonials (name, role, quote, rating, sort) VALUES (?, ?, ?, ?, ?)"
    );
    TESTIMONIALS.forEach((t, i) => insT.run(t.name, t.role, t.quote, t.rating, i));

    // ---- upcoming QCOs ----
    const insQ = db.prepare(
      `INSERT INTO qcos (product, ministry, hsn4, hsn8, standard, enforcement_date, scheme, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    masterData.upcoming.forEach((u, i) =>
      insQ.run(u.product, u.ministry, u.hsn4, u.hsn8, u.standard, u.enforcement_date, u.scheme, i)
    );

    // ---- certifications ----
    const insCert = db.prepare(
      `INSERT INTO certifications (slug, name, full_name, region, icon, summary, content, image, meta_title, meta_description, sort)
       VALUES (@slug, @name, @full_name, @region, @icon, @summary, @content, @image, @meta_title, @meta_description, @sort)`
    );
    CERTIFICATIONS.forEach((c, i) => {
      insCert.run({
        slug: c.slug,
        name: c.name,
        full_name: c.full_name,
        region: c.region,
        icon: c.icon,
        summary: c.summary,
        content: c.content,
        image: `/images/certifications/${c.slug}.png`,
        meta_title: `${c.name} Certification | ${c.full_name} | Process, Cost & Help | Certko`,
        meta_description: c.summary,
        sort: i,
      });
      c.faqs.forEach((f, j) => insFaq.run(`cert:${c.slug}`, f.question, f.answer, j));
    });
  });

  tx();
}
