import type Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { slugify, formatPriceRange } from "./format";

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
    icon: "🚲",
    timeline: "10-18 weeks",
    description:
      "Wheel rims, cycle frames, chains, forks and other vehicle components covered by mandatory Indian Standards for road safety.",
  },
  "Cables & Wires": {
    icon: "🔌",
    timeline: "8-14 weeks",
    description:
      "Power cables, winding wires, conductors, conduit systems and photovoltaic cables requiring ISI mark certification.",
  },
  "Cement & Construction Materials": {
    icon: "🧱",
    timeline: "14-26 weeks",
    description:
      "Cement varieties, aggregates, bricks and structural construction inputs under long-standing BIS quality control orders.",
  },
  Chemicals: {
    icon: "🧪",
    timeline: "8-14 weeks",
    description:
      "Industrial chemicals, acids and technical-grade compounds notified under BIS mandatory certification.",
  },
  "Electrical & Electronics": {
    icon: "💻",
    timeline: "6-12 weeks",
    description:
      "IT hardware, consumer electronics and electronic components covered under CRS registration and ISI marking.",
  },
  "Electrical Appliances": {
    icon: "⚡",
    timeline: "8-14 weeks",
    description:
      "Household and commercial electrical appliances — heaters, irons, kitchen machines — tested to IS 302 series safety standards.",
  },
  "Fire Safety Products": {
    icon: "🧯",
    timeline: "10-16 weeks",
    description:
      "Fire extinguishers, fire survival cables, hoses and suppression equipment requiring BIS conformity.",
  },
  "Food, Dairy & Beverages": {
    icon: "🥛",
    timeline: "8-14 weeks",
    description:
      "Milk powder, packaged water, food-grade equipment and beverage products under mandatory quality orders.",
  },
  Footwear: {
    icon: "👟",
    timeline: "10-16 weeks",
    description:
      "Leather, rubber and PVC footwear covered by the footwear Quality Control Order and IS 15298 series.",
  },
  "Furniture & Storage": {
    icon: "🪑",
    timeline: "8-14 weeks",
    description: "Steel furniture, racking and storage systems notified for BIS certification.",
  },
  "Glass & Ceramics": {
    icon: "🏺",
    timeline: "10-16 weeks",
    description:
      "Safety glass, glassware, ceramic tiles and sanitaryware requiring ISI mark before sale in India.",
  },
  "Hardware & Fittings": {
    icon: "🔩",
    timeline: "8-12 weeks",
    description: "Builder hardware, fasteners and fittings under BIS standard marks.",
  },
  Helmets: {
    icon: "🪖",
    timeline: "10-16 weeks",
    description:
      "Protective helmets for two-wheeler riders and industrial use — one of the most strictly enforced ISI categories.",
  },
  "LPG & Gas Equipment": {
    icon: "🔥",
    timeline: "12-20 weeks",
    description:
      "LPG cylinders, valves, regulators and gas stoves requiring BIS certification for safe domestic use.",
  },
  "Leather Products": {
    icon: "🧳",
    timeline: "8-14 weeks",
    description: "Leather goods and components notified under BIS quality control orders.",
  },
  "Machinery, Tools & Instruments": {
    icon: "⚙️",
    timeline: "10-18 weeks",
    description:
      "Industrial machinery, power tools and measuring instruments covered by mandatory Indian Standards.",
  },
  "Medical Devices & Textiles": {
    icon: "🩺",
    timeline: "10-18 weeks",
    description:
      "Medical equipment, diagnostic devices and medical textiles requiring BIS conformity assessment.",
  },
  "Non-Ferrous Metals": {
    icon: "🥇",
    timeline: "8-14 weeks",
    description:
      "Aluminium, copper and alloy products — sheets, foils, rods — under BIS metal quality orders.",
  },
  Others: {
    icon: "📦",
    timeline: "8-16 weeks",
    description:
      "Additional notified products spanning batteries, appliances and specialised industrial goods.",
  },
  "Paints, Coatings & Adhesives": {
    icon: "🎨",
    timeline: "8-14 weeks",
    description: "Paints, varnishes, coatings and adhesives requiring ISI certification.",
  },
  "Paper & Packaging": {
    icon: "📄",
    timeline: "8-12 weeks",
    description:
      "Paper, boards, sacks and packaging material under BIS mandatory certification.",
  },
  "Pesticides & Agro-Chemicals": {
    icon: "🌾",
    timeline: "10-16 weeks",
    description:
      "Crop protection chemicals and agro inputs notified under BIS quality control.",
  },
  "Petroleum & Lubricants": {
    icon: "🛢️",
    timeline: "8-14 weeks",
    description: "Fuels, lubricants and petroleum products requiring conformity to Indian Standards.",
  },
  "Pressure Cookers": {
    icon: "🍲",
    timeline: "10-14 weeks",
    description:
      "Domestic pressure cookers and parts — a strictly enforced consumer safety category under IS 2347.",
  },
  "PVC & Plastic Products": {
    icon: "🧴",
    timeline: "8-14 weeks",
    description:
      "PVC pipes, plastic feeding bottles, water tanks and moulded products under mandatory BIS orders.",
  },
  "Pumps, Valves & Irrigation": {
    icon: "🚰",
    timeline: "10-16 weeks",
    description:
      "Pumps, valves, sprinklers and irrigation equipment covered by ISI mark schemes.",
  },
  "Rubber Products": {
    icon: "🛞",
    timeline: "10-16 weeks",
    description: "Tyres, tubes, hoses and technical rubber goods requiring BIS certification.",
  },
  "Safety & PPE": {
    icon: "🦺",
    timeline: "10-16 weeks",
    description:
      "Personal protective equipment — eye protectors, gloves, safety boots — under IS safety standards.",
  },
  "Soaps, Detergents & Cosmetics": {
    icon: "🧼",
    timeline: "8-12 weeks",
    description: "Household and personal care products notified for BIS conformity.",
  },
  "Steel Products": {
    icon: "🏗️",
    timeline: "12-20 weeks",
    description:
      "Structural steel, sheets, strips, bars and wire products under the steel Quality Control Orders.",
  },
  Textiles: {
    icon: "🧵",
    timeline: "8-14 weeks",
    description: "Textile products and technical fabrics requiring Indian Standard conformity.",
  },
  Toys: {
    icon: "🧸",
    timeline: "10-16 weeks",
    description:
      "Electric and non-electric toys — mandatory ISI marking under the Toys Quality Control Order 2020.",
  },
  "Wood & Plywood Products": {
    icon: "🪵",
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
        icon: "📦",
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
      `INSERT INTO products (slug, name, standard, scheme, category_id, min_price, max_price, lab_count, timeline, description, image, featured, meta_title, meta_description, hsn4, hsn8, qco_status, qco_order)
       VALUES (@slug, @name, @standard, @scheme, @category_id, @min_price, @max_price, @lab_count, @timeline, @description, @image, @featured, @meta_title, @meta_description, @hsn4, @hsn8, @qco_status, @qco_order)`
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
      let scheme = productScheme(p.category, p.standard);
      if (crsStandards.has(isKey) || (qcoInfo?.status ?? "").includes("CRS")) {
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
        hsn4: qcoInfo?.hsn4 ?? "",
        hsn8: qcoInfo?.hsn8 ?? "",
        qco_status: qcoInfo?.status ?? "",
        qco_order: qcoInfo?.order ?? "",
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
  });

  tx();
}
