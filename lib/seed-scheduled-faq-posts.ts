import type { SqliteDatabase } from "./sqlite";

type Faq = { q: string; a: string };

type FaqPostDef = {
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  productHint: string;
  standardHint: string;
  bodyLead: string;
  bullets: string[];
  faqs: Faq[];
};

function faqMarkdown(faqs: Faq[]): string {
  return faqs
    .map(
      (f, i) => `### ${i + 1}. ${f.q}

${f.a}`
    )
    .join("\n\n");
}

function buildContent(def: FaqPostDef): string {
  return `# ${def.title}

${def.bodyLead}

## Why this matters for your SKU

**Focus:** ${def.productHint}  
**Typical standard / scheme angle:** ${def.standardHint}  
**Topic cluster:** ${def.topic}

Teams that skip early scoping usually pay twice — once in failed lab weeks, and again in missed purchase-order windows.

## Practical checklist

${def.bullets.map((b) => `- ${b}`).join("\n")}

## How Certko + Instacertify help

1. Map the product to the right scheme and standard on [Products](/products) and [Certifications](/certifications).  
2. Shortlist labs and test scopes via [Testing](/testing) and [Find a lab](/labs).  
3. Coordinate documentation, queries and grant follow-up so production is not guessing.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Browse products](/products) · [More on the blog](/blog)

## FAQ — ${def.productHint}

${faqMarkdown(def.faqs)}

> **Disclaimer:** Scheme rules, Quality Control Orders, SABER lists and destination regulations change. Confirm the current notification and lab scope for your exact model before booking irreversible tests.
`;
}

/** 48 topical FAQ posts — scheduled 3 per day starting 2026-08-09. */
const FAQ_POST_DEFS: FaqPostDef[] = [
  {
    slug: "bis-certification-pvc-cables-is-694-faq",
    title: "BIS Certification for PVC Cables (IS 694) — Requirements & FAQ",
    excerpt:
      "ISI Mark path for PVC insulated cables under IS 694: testing, factory readiness, marking and common importer questions answered.",
    topic: "BIS Certification",
    productHint: "PVC insulated cables / cords (IS 694)",
    standardHint: "IS 694 · ISI Mark (Scheme I)",
    bodyLead:
      "If you manufacture or import **PVC insulated cables** covered by IS 694, BIS ISI Mark compliance is usually the gate to legal sale in India once a related QCO applies. This guide covers the practical file — not just the standard number.",
    bullets: [
      "Confirm exact variety / size range before lab booking",
      "Align in-house tests with IS 694 clauses the auditor will expect",
      "Plan marking artwork early (ISI monogram + CM/L number)",
      "Importers: verify the foreign factory holds a valid licence or use FMCS where applicable",
    ],
    faqs: [
      { q: "Is IS 694 always ISI Mark (not CRS)?", a: "Cable products under IS 694 typically follow the **ISI Mark / Scheme I** path (testing + factory surveillance), not MeitY CRS. Always confirm against the current QCO for your HSN / product description." },
      { q: "Can one licence cover many sizes?", a: "Often yes within a defined variety range, but samples and plant capability must support the sizes you list. Over-declaring sizes is a common inspection finding." },
      { q: "Do imported cables need BIS?", a: "If the QCO covers the product, imported lots generally need a valid BIS licence route (including FMCS for overseas factories) before clearance and sale." },
      { q: "How long does testing take?", a: "Depends on lab queue and size matrix. Book early; Certko can shortlist BIS-recognised labs with indicative timelines." },
    ],
  },
  {
    slug: "bis-led-luminaires-is-10322-certification-faq",
    title: "BIS for LED Luminaires (IS 10322) — Certification Guide & FAQ",
    excerpt:
      "LED luminaire BIS requirements under IS 10322 series: scheme mapping, samples, marking and FAQ for manufacturers and importers.",
    topic: "BIS Certification",
    productHint: "LED luminaires / lighting (IS 10322)",
    standardHint: "IS 10322 series · check ISI vs applicable order",
    bodyLead:
      "**LED luminaires** sit at the intersection of safety standards, photometric expectations and fast retail cycles. Getting the IS 10322 part/section right is step one.",
    bullets: [
      "Identify the correct IS 10322 part/section for your luminaire type",
      "Freeze LED driver + optical BOM before type tests",
      "Decide India sale vs export EMC needs in parallel",
      "Keep series models honest — worst-case configuration first",
    ],
    faqs: [
      { q: "Which IS 10322 section applies to my fixed LED luminaire?", a: "It depends on the product definition (fixed, recessed, etc.). Share the datasheet with Certko for a section mapping before you pay for the wrong sample plan." },
      { q: "Do I also need EMC (CISPR 15)?", a: "For many export / CE paths, yes. India BIS safety registration and CISPR EMC are related but not identical workstreams." },
      { q: "Can I change the LED brand after grant?", a: "Material changes can trigger retesting or licence amendments. Treat optical/electrical critical parts as controlled." },
      { q: "Are smart lamps different?", a: "Wi-Fi/BLE lamps may add WPC/ETA and EMC complexity on top of BIS safety — plan both calendars." },
    ],
  },
  {
    slug: "bis-ceiling-fans-is-374-certification-faq",
    title: "BIS Certification for Ceiling Fans (IS 374) — FAQ for Makers & Importers",
    excerpt:
      "Ceiling fan BIS / IS 374 compliance explained: samples, performance checks, factory readiness and frequent buyer questions.",
    topic: "BIS Certification",
    productHint: "Electric ceiling fans (IS 374)",
    standardHint: "IS 374 · ISI pathway when notified",
    bodyLead:
      "Ceiling fans are high-volume domestic products. When IS 374 is under compulsory compliance, weak sample planning delays entire festive seasons.",
    bullets: [
      "Lock motor + blade + regulator variants for series coverage",
      "Prepare endurance / performance evidence the lab expects",
      "Align packaging claims with tested ratings",
      "Marketplace listings should match licence model codes",
    ],
    faqs: [
      { q: "Does every fan SKU need a separate licence?", a: "Not always — series guidelines may allow grouping, but electrical ratings and construction differences matter. Map SKUs before booking." },
      { q: "Is BEE star rating the same as BIS?", a: "No. **BEE** is energy labelling; **BIS** is safety/product conformity. Many appliances eventually need both conversations." },
      { q: "Can traders apply without a factory?", a: "ISI licences are factory-centric. Traders usually rely on a licensed manufacturer or the correct import/FMCS structure." },
      { q: "What fails most often?", a: "Incomplete variety lists, inconsistent nameplates, and plants not ready for in-house checks during inspection." },
    ],
  },
  {
    slug: "saber-certification-saudi-arabia-exporters-faq",
    title: "SABER Certification for Saudi Arabia — Exporter Guide & FAQ",
    excerpt:
      "How SABER works for exporters selling into KSA: product classification, PCoC/SCoC basics, common rejects and how Certko helps.",
    topic: "SABER",
    productHint: "Products exported to Saudi Arabia (SABER)",
    standardHint: "SABER / SASO technical regulations",
    bodyLead:
      "**SABER** is Saudi Arabia’s conformity platform. If your shipment is bound for KSA retail or projects, SABER status is often checked before the goods can move smoothly through the import chain.",
    bullets: [
      "Classify the product under the correct Saudi technical regulation",
      "Collect test reports that match the regulated standard editions",
      "Align model names across invoice, SABER file and labels",
      "Do not confuse SABER with India BIS — different systems",
    ],
    faqs: [
      { q: "What is the difference between PCoC and SCoC?", a: "They are different stages/documents in the Saudi conformity flow. Your product category and regulation determine which certificates/shipments steps apply — Certko maps this per SKU." },
      { q: "Can I reuse a CE report for SABER?", a: "Sometimes evidence helps, but Saudi regulations may demand specific standards or accepted lab pathways. Never assume CE alone is enough." },
      { q: "Who creates the SABER account — brand or factory?", a: "Usually the entity responsible for placing goods on the Saudi market / exporter setup. We help you pick a structure that matches your Incoterms and buyer." },
      { q: "How long does SABER take?", a: "Depends on regulation, lab evidence completeness and query loops. Incomplete model data is the #1 delay." },
    ],
  },
  {
    slug: "msds-sds-compulsory-for-chemical-exports-faq",
    title: "MSDS / SDS for Chemical Product Exports — When It Is Required (FAQ)",
    excerpt:
      "Why shipping lines and foreign buyers demand MSDS/SDS for chemical exports, what a GHS 16-section sheet must include, and FAQ for exporters.",
    topic: "MSDS",
    productHint: "Chemical mixtures & hazardous preparations",
    standardHint: "GHS SDS (16 sections) · transport Section 14",
    bodyLead:
      "Whenever you export chemicals or many chemical-containing articles, carriers and overseas buyers ask for a current **MSDS / SDS**. This FAQ-focused guide explains what “good enough” means in practice.",
    bullets: [
      "Use GHS 16-section structure even if the buyer still says “MSDS”",
      "Fill Section 14 for sea/air booking desks",
      "Keep composition confidentiality balanced with classification honesty",
      "Revise the sheet when formulation or packaging changes",
    ],
    faqs: [
      { q: "Is MSDS legally the same as SDS?", a: "SDS is the modern GHS term. Buyers may still say MSDS — send a current GHS SDS." },
      { q: "Do shipping companies always ask for it?", a: "For regulated/hazardous and many chemical cargoes, yes — bookings stall without an acceptable sheet." },
      { q: "Can I reuse a supplier SDS under my brand?", a: "Only if composition and hazards truly match. Relabelling someone else’s mixture without review is a common reject." },
      { q: "Can Instacertify author the SDS?", a: "Yes — share composition inputs and destinations; we author/upgrade export-ready packs via Certko." },
    ],
  },
  {
    slug: "product-testing-electrical-safety-india-export-faq",
    title: "Electrical Safety Product Testing for India & Export — FAQ",
    excerpt:
      "Electrical safety testing services for appliances and electronics: IS/IEC standards, sample planning, lab choice and FAQ for compliance teams.",
    topic: "Product Testing",
    productHint: "Electrical / electronic equipment safety tests",
    standardHint: "IS/IEC 60335, 62368-1, IS 302 series, etc.",
    bodyLead:
      "Electrical safety testing is the backbone of BIS, CE and many buyer audits. Choosing the wrong standard family wastes both samples and calendar time.",
    bullets: [
      "Name the product standard before requesting a “safety test” quote",
      "Define ratings, insulation class and critical components",
      "Keep production-intent samples — not demo boards",
      "Parallel-path EMC if the destination market needs it",
    ],
    faqs: [
      { q: "Is IS 302 the same as IEC 60335?", a: "They are related household-appliance safety families; the exact IS adoption/edition for your product must be confirmed against the Indian Standard / QCO text." },
      { q: "How many samples does the lab need?", a: "Depends on destructive tests and series strategy. Ask for a written sample plan in the quotation." },
      { q: "Can CB reports reduce India testing?", a: "Sometimes for aligned schemes, but QCO/CRS rules decide — never skip verification." },
      { q: "Where do I start on Certko?", a: "Use [Testing](/testing) and [Products](/products), then request a mapped quote via Contact." },
    ],
  },
  {
    slug: "bis-power-adapters-crs-is-iec-62368-faq",
    title: "BIS CRS for Power Adapters — IS/IEC 62368-1 Migration FAQ",
    excerpt:
      "Power adapter CRS registration, 62368-1 migration points, CCL traps and FAQ for electronics brands selling in India.",
    topic: "BIS Certification",
    productHint: "IT / AV power adapters (CRS)",
    standardHint: "IS/IEC 62368-1 · MeitY CRS",
    bodyLead:
      "Power adapters are among the busiest **MeitY CRS** categories. With the move toward **IS/IEC 62368-1**, brands need a clean lead-model and CCL plan.",
    bullets: [
      "List every R-number and factory location",
      "Rebuild CCL against 62368-1 expectations",
      "Book BIS-recognised labs early for lead models",
      "Align Amazon/Flipkart model names with the registration",
    ],
    faqs: [
      { q: "Does CRS need a factory inspection like ISI?", a: "CRS is lab-test + portal registration focused; it is not the same onsite model as classic ISI Scheme I." },
      { q: "Can one R-number cover many adapter watts?", a: "Series/lead-model rules decide. Incorrect grouping causes queries." },
      { q: "Do I need EMC for CRS grant?", a: "CRS grant follows the notified safety standard path; EMC may still be needed for export or buyer specs." },
      { q: "What is a CCL?", a: "Critical Component List — safeguards and related parts that must meet accepted standards under 62368-1 thinking." },
    ],
  },
  {
    slug: "importing-electronics-into-india-bis-crs-guidelines",
    title: "Guidelines for Importing Electronics into India — BIS / CRS FAQ",
    excerpt:
      "Importer checklist for electronics entering India: MeitY CRS, labelling, authorised Indian representative themes and FAQ.",
    topic: "Importing into India",
    productHint: "Imported IT / electronics products",
    standardHint: "MeitY CRO / BIS CRS",
    bodyLead:
      "Importing notified electronics without a clear **BIS CRS** path is how containers and marketplace accounts get stuck. Use this guideline before the PO ships.",
    bullets: [
      "Confirm whether the HSN/product is under a Compulsory Registration Order",
      "Ensure the manufacturing location on the grant matches reality",
      "Prepare marking (R-number) before retail put-away",
      "Keep test reports accessible for marketplace audits",
    ],
    faqs: [
      { q: "Can I import first and certify later?", a: "Risky and often non-compliant after enforcement dates. Certify before scale imports." },
      { q: "Whose name is on the CRS registration?", a: "Follow current MeitY/BIS rules for manufacturer / brand structures. Certko helps you pick a workable model." },
      { q: "Do accessories need separate registration?", a: "If separately notified or sold as distinct models, they may. Scope each SKU." },
      { q: "What documents do customs/buyers ask?", a: "Typically registration proof, test report references, invoices matching models, and compliant marking photos." },
    ],
  },
  {
    slug: "export-to-eu-ce-marking-certification-requirements-faq",
    title: "Certification Requirements for Export to the EU — CE Marking FAQ",
    excerpt:
      "CE marking essentials for exporters: LVD/EMC/RoHS themes, technical file habits, and FAQ for India-based manufacturers.",
    topic: "Export Certification",
    productHint: "Electrical/electronic goods exported to the EU",
    standardHint: "CE · LVD · EMC · RoHS (as applicable)",
    bodyLead:
      "Exporting to the **European Union** usually means a defensible **CE** conformity story — not a sticker alone. Here is what importers and Amazon EU reviewers actually probe.",
    bullets: [
      "Identify applicable directives (LVD, EMC, Radio, Toys, etc.)",
      "Build a technical file with standards, risk assessment and test evidence",
      "Complete DoC and keep it controlled",
      "Align labelling (CE, traceability, warnings) with the file",
    ],
    faqs: [
      { q: "Is CE self-declaration always allowed?", a: "For many electronics under LVD/EMC, module A self-declaration with proper evidence is common; some categories need notified bodies. Product-specific rules decide." },
      { q: "Does BIS replace CE for Europe?", a: "No. BIS is India. CE is EU. Plan both if you sell in both markets." },
      { q: "Do I need EMC testing for CE?", a: "Usually yes for electronic products under the EMC Directive — CISPR/IEC based evidence is typical." },
      { q: "Can Certko coordinate CE testing?", a: "Yes — we map standards, labs and a document checklist via Instacertify’s desk." },
    ],
  },
  {
    slug: "saber-electronics-saudi-technical-regulation-faq",
    title: "SABER for Electronics Exporters — Saudi Technical Regulation FAQ",
    excerpt:
      "Electronics under SABER: evidence packs, model consistency, lab reports and FAQ for brands shipping to Saudi Arabia.",
    topic: "SABER",
    productHint: "Consumer & IT electronics for KSA",
    standardHint: "SABER electronics technical regulations",
    bodyLead:
      "Electronics shipments to Saudi Arabia fail SABER reviews when model codes, ratings and test reports disagree. This FAQ is written for compliance and logistics owners.",
    bullets: [
      "Freeze commercial model names before opening the SABER file",
      "Match rated voltage/frequency to Saudi market reality",
      "Attach complete, readable test reports — not partial scans",
      "Track certificate validity against shipment dates",
    ],
    faqs: [
      { q: "Are power adapters treated separately from hosts?", a: "Often yes when sold/ shipped as distinct regulated products. Scope each line item." },
      { q: "Can one SABER certificate cover all colours?", a: "Cosmetic variants may group; electrical changes usually do not. Ask before assuming." },
      { q: "What if my buyer asks for SABER after cargo sailed?", a: "Expect storage and amendment costs. Start SABER in parallel with production." },
      { q: "SABER vs GMARK — which one?", a: "SABER is Saudi’s platform. GMARK is a broader Gulf scheme. Destination country decides." },
    ],
  },
  {
    slug: "bis-toys-certification-import-india-faq",
    title: "BIS Certification for Toys — Import & Manufacture FAQ (India)",
    excerpt:
      "Toy safety compliance in India: BIS requirements, testing themes, labelling and FAQ for importers and brand owners.",
    topic: "BIS Certification",
    productHint: "Toys for the Indian market",
    standardHint: "Applicable IS toy safety standards / QCO",
    bodyLead:
      "Toys face intense safety scrutiny. If you import or manufacture toys for India, treat **BIS** as a product development constraint — not a packing-stage surprise.",
    bullets: [
      "Identify age grading and toy type before standard selection",
      "Control coatings and small-part geometry early",
      "Keep batch traceability for surveillance",
      "Align artwork warnings with test conclusions",
    ],
    faqs: [
      { q: "Do soft toys and electronic toys follow the same file?", a: "Not always — hazards differ (flammability, batteries, EMC). Scope each construction." },
      { q: "Can I use overseas EN71 reports?", a: "They may inform design, but India BIS acceptance follows Indian Standards and scheme rules." },
      { q: "Are marketplaces strict on toys?", a: "Yes — missing BIS details commonly trigger delistings." },
      { q: "How can Certko help?", a: "Standard mapping, lab booking and documentation coordination for manufacture or import models." },
    ],
  },
  {
    slug: "msds-paints-coatings-export-shipping-faq",
    title: "MSDS for Paints & Coatings Exports — Shipping Desk FAQ",
    excerpt:
      "Paints and coatings exporters: VOC/hazard classification, Section 14 transport data, buyer import SDS needs and FAQ.",
    topic: "MSDS",
    productHint: "Paints, primers and industrial coatings",
    standardHint: "GHS SDS · IMDG/IATA transport data",
    bodyLead:
      "Coatings are frequent DG booking failures. A weak **MSDS/SDS** — especially Section 14 — is enough for the line to roll your cargo.",
    bullets: [
      "Classify flammable liquids accurately by flashpoint/packing group",
      "State UN number and proper shipping name clearly",
      "Provide English SDS for international desks",
      "Update sheets when thinner ratios or resins change",
    ],
    faqs: [
      { q: "Why did my forwarder reject a ‘valid’ MSDS?", a: "Often missing transport data, wrong UN class, or outdated revision dates." },
      { q: "Do water-based coatings need SDS?", a: "Often yes — “water-based” is not automatically non-hazardous for all destinations/buyers." },
      { q: "One SDS for a colour range?", a: "Only when hazards truly match. Pigment systems can change classification." },
      { q: "Can Instacertify rewrite our SDS pack?", a: "Yes — provide formulations or supplier inputs and destination list." },
    ],
  },
  {
    slug: "emi-emc-testing-cispr-product-compliance-faq",
    title: "EMI/EMC Testing for Products — CISPR Standards FAQ",
    excerpt:
      "Product EMI/EMC testing FAQ: CISPR 32/15/14/11 selection, immunity basics, and how Certko coordinates chamber programmes.",
    topic: "Product Testing",
    productHint: "Electronics needing EMC evidence",
    standardHint: "CISPR + IEC 61000 families",
    bodyLead:
      "Wrong CISPR book selection is the most expensive EMC mistake. This FAQ helps you brief labs correctly before chamber week.",
    bullets: [
      "Pick CISPR 32 / 15 / 14 / 11 from product function — not marketing name",
      "Budget immunity (IEC 61000-4) for CE-style markets",
      "Test host + adapter as a system when shipped together",
      "Do pre-compliance on risky clocks and cables",
    ],
    faqs: [
      { q: "Is EMC part of MeitY CRS?", a: "CRS is primarily safety registration. EMC is often export/buyer-driven — plan both calendars." },
      { q: "Class A vs Class B?", a: "Class B is typically expected for residential/consumer use. Class A-only reports get rejected by many buyers." },
      { q: "How long is an EMC report reusable?", a: "Until you change shielding, power architecture, cables or wireless modules in a meaningful way." },
      { q: "Where do I start?", a: "Read our EMI/EMC guides on the blog or contact Certko for a scoped quote." },
    ],
  },
  {
    slug: "gmark-certification-gcc-export-requirements-faq",
    title: "GMARK Certification for GCC Exports — Requirements & FAQ",
    excerpt:
      "GMARK overview for Gulf exports: notified body themes, evidence reuse, and FAQ for appliances and regulated categories.",
    topic: "Export Certification",
    productHint: "Products for GCC / GMARK scope",
    standardHint: "GMARK · GSO requirements",
    bodyLead:
      "**GMARK** appears whenever Gulf buyers or regulators require Gulf-wide conformity evidence. Treat it as its own project alongside India BIS.",
    bullets: [
      "Confirm whether your category is in GMARK scope",
      "Assemble IEC/EN evidence that a GSO NB can evaluate",
      "Align model lists with Gulf catalogue data",
      "Track certificate validity vs shipment waves",
    ],
    faqs: [
      { q: "Is GMARK the same as SABER?", a: "No. SABER is Saudi Arabia’s platform; GMARK is the Gulf Mark scheme. Some products need careful destination-specific planning." },
      { q: "Do I need a Gulf importer?", a: "Market placement rules often involve regional responsibility. We help clarify roles with your distributor." },
      { q: "Can CB reports help?", a: "Frequently yes as supporting evidence, subject to NB acceptance." },
      { q: "How does Certko help?", a: "Scope mapping, lab/NB pathway advice and document coordination." },
    ],
  },
  {
    slug: "bis-helmets-two-wheeler-certification-faq",
    title: "BIS Certification for Two-Wheeler Helmets — Safety FAQ",
    excerpt:
      "Helmet BIS compliance essentials: impact testing themes, marking, size ranges and FAQ for manufacturers supplying India.",
    topic: "BIS Certification",
    productHint: "Two-wheeler protective helmets",
    standardHint: "Applicable IS helmet standard / QCO",
    bodyLead:
      "Helmets are life-critical PPE. BIS expectations around construction, impact performance and labelling are unforgiving — plan samples early.",
    bullets: [
      "Freeze shell/liner materials before type tests",
      "Cover size range honestly in the licence scope",
      "Validate retention system and visor variants",
      "Train factory QC for surveillance sampling",
    ],
    faqs: [
      { q: "Can I import uncertified helmets for ‘testing’ sales?", a: "Commercial sale of notified PPE without required BIS conformity is a compliance red flag. Keep pilots inside lawful channels." },
      { q: "Do graphics changes need retesting?", a: "Pure artwork may be OK; mass/balance or material changes are not. Document the difference." },
      { q: "How are sizes handled?", a: "Labs/schemes often require representative sizes. Ask for a size matrix in the quote." },
      { q: "Marketplace delisting risk?", a: "High if BIS details are missing or mismatched on listing pages." },
    ],
  },
  {
    slug: "importing-products-india-qco-compliance-guidelines",
    title: "Guidelines for Importing Products into India under QCOs — FAQ",
    excerpt:
      "Quality Control Order import guidelines: BIS licence checks, FMCS themes, documentation and FAQ for trading companies.",
    topic: "Importing into India",
    productHint: "QCO-notified goods imported into India",
    standardHint: "BIS QCO + ISI/FMCS/CRS as applicable",
    bodyLead:
      "India’s **Quality Control Orders** turn many formerly optional standards into import gates. This guideline is for traders, Amazon sellers and brand importers.",
    bullets: [
      "Search your product on Certko before confirming the overseas PO",
      "Verify the overseas factory’s licence/FMCS status",
      "Match invoice description to licensed models",
      "Budget lead time for testing — not only ocean transit",
    ],
    faqs: [
      { q: "What is FMCS?", a: "Foreign Manufacturers Certification Scheme — ISI route for factories outside India selling into India." },
      { q: "Can an Indian importer hold ISI instead of the factory?", a: "ISI is manufacturing-location based. Structure carefully; do not assume a trading GSTIN replaces a factory licence." },
      { q: "How do I know if a QCO applies?", a: "Check the product/standard notification and use Certko product pages as a practical starting map, then verify gazette text." },
      { q: "What if goods arrive without BIS?", a: "Expect clearance and sales risk. Fix compliance before the next sailing." },
    ],
  },
  {
    slug: "fcc-certification-export-usa-electronics-faq",
    title: "FCC Certification Requirements for Export to the USA — FAQ",
    excerpt:
      "US FCC path for electronics exporters: Part 15 themes, SDoC vs certification, labelling and FAQ for India factories.",
    topic: "Export Certification",
    productHint: "Electronics exported to the United States",
    standardHint: "FCC Part 15 / device authorisation",
    bodyLead:
      "Selling electronics into the **United States** without an FCC strategy is a recall and retailer rejection risk. Here is the FAQ version for export teams.",
    bullets: [
      "Determine if SDoC or Certification (TCB) applies",
      "Identify intentional radiators (Wi-Fi/BT) early",
      "Keep EMC test evidence controlled",
      "Align user manual statements with FCC rules",
    ],
    faqs: [
      { q: "Is FCC the same as CE EMC?", a: "Related physics, different limits/methods/filings. Do not paste a CISPR report and assume FCC is done." },
      { q: "Do passive cables need FCC?", a: "Usually the digital device is in focus; accessories can still matter in system tests. Scope the EUT carefully." },
      { q: "Can Certko coordinate FCC testing?", a: "Yes — we map labs and evidence expectations with your destination SKUs." },
      { q: "What about UL safety?", a: "UL/NRTL safety is separate from FCC emissions. Retailers may ask for both." },
    ],
  },
  {
    slug: "bis-cement-isi-mark-certification-faq",
    title: "BIS ISI Mark for Cement Products — Manufacturer FAQ",
    excerpt:
      "Cement BIS certification practicalities: plant readiness, sample testing cadence, marking and FAQ for producers.",
    topic: "BIS Certification",
    productHint: "Portland / blended cement products",
    standardHint: "Relevant IS cement standards · ISI",
    bodyLead:
      "Cement licences live or die on **plant consistency** and laboratory discipline. This FAQ targets production and QA managers preparing for BIS.",
    bullets: [
      "Ensure in-house lab capability matches scheme expectations",
      "Control raw material sources with traceability",
      "Prepare for surveillance sampling frequencies",
      "Keep bag printing aligned with licence particulars",
    ],
    faqs: [
      { q: "Is every cement type a separate licence?", a: "Different standards/varieties can mean separate scopes. Map each product line." },
      { q: "How important is the plant lab?", a: "Critical — Scheme I surveillance expects credible in-house testing discipline." },
      { q: "Can grinding units and packing units differ?", a: "Licence addresses and process steps must match reality. Declare structure honestly." },
      { q: "Importer angle?", a: "Cement imports face strict controls when QCOs apply — factory certification first." },
    ],
  },
  {
    slug: "chemical-testing-heavy-metals-product-compliance-faq",
    title: "Chemical & Heavy Metals Testing for Product Compliance — FAQ",
    excerpt:
      "When products need chemical/heavy metals tests for India or export buyers: RoHS-style screens, toy coatings, packaging and FAQ.",
    topic: "Product Testing",
    productHint: "Products with coatings, plastics, electronics alloys",
    standardHint: "Chemical restriction / buyer protocols",
    bodyLead:
      "Chemical testing sits behind many ‘simple’ product certifications — toys, packaging, electronics and retail private-label programmes.",
    bullets: [
      "Identify restricted substances lists from the buyer/market",
      "Sample homogeneous materials thoughtfully",
      "Separate design materials from process contaminants",
      "Keep COA/SDS packs with shipment files",
    ],
    faqs: [
      { q: "Is RoHS required for India BIS?", a: "BIS schemes are standard-specific. RoHS is often EU/buyer-driven. Do not mix the two blindly." },
      { q: "Do I test the finished good or each part?", a: "Labs often need homogeneous material samples. Plan BOM teardown." },
      { q: "How fast are chemical labs?", a: "Varies by analyte panel. Book ahead of PO freeze dates." },
      { q: "Can Certko arrange testing?", a: "Yes — via [Testing](/testing) pathways and accredited lab coordination." },
    ],
  },
  {
    slug: "export-to-uae-gmark-saber-buyer-requirements-faq",
    title: "Exporting to the UAE — GMARK, Buyer Specs & Compliance FAQ",
    excerpt:
      "UAE export compliance FAQ: GMARK relevance, retailer technical files, labelling and how Indian exporters should prepare.",
    topic: "Export Certification",
    productHint: "Goods exported to the UAE",
    standardHint: "GMARK / buyer/ESMA-related requirements as applicable",
    bodyLead:
      "UAE buyers increasingly ask for structured conformity packs before issuing LCs. This FAQ covers what Indian exporters should prepare beyond a commercial invoice.",
    bullets: [
      "Ask the buyer which regulation/scheme is on the PO",
      "Prepare English technical files and test reports",
      "Align voltage/plug/labelling for UAE market",
      "Keep SDS available for chemical-containing SKUs",
    ],
    faqs: [
      { q: "Does every UAE shipment need GMARK?", a: "No — category and buyer requirements decide. Confirm per SKU." },
      { q: "Is SABER needed for UAE?", a: "SABER is Saudi. UAE has its own frameworks; do not apply the wrong portal." },
      { q: "Can free-zone traders hold certificates?", a: "Structure depends on scheme rules and manufacturing location. Get advice before assuming." },
      { q: "How Certko helps UAE lanes?", a: "We coordinate India-side testing/cert evidence and Gulf pathway scoping." },
    ],
  },
  {
    slug: "bis-pressure-cookers-isi-certification-faq",
    title: "BIS Certification for Pressure Cookers — ISI Mark FAQ",
    excerpt:
      "Pressure cooker BIS/ISI essentials: safety testing themes, capacity variants, marking and FAQ for kitchenware brands.",
    topic: "BIS Certification",
    productHint: "Domestic pressure cookers",
    standardHint: "Applicable IS pressure cooker standard · ISI",
    bodyLead:
      "Pressure cookers are classic ISI products. Capacity creep and gasket/body changes without amendment are common compliance failures.",
    bullets: [
      "Freeze body material and safety-valve designs before type tests",
      "Define capacity series carefully",
      "Validate induction-base variants if claimed",
      "Train assembly QC on safety device fitment",
    ],
    faqs: [
      { q: "Do aluminium and stainless lines share one licence?", a: "Often separate scopes when construction differs materially. Confirm before combining." },
      { q: "Are spare lids in scope?", a: "If sold as part of the certified product system, control them under the same quality system." },
      { q: "Importer model?", a: "Overseas factories typically need FMCS/ISI pathways when QCOs apply." },
      { q: "Label claims?", a: "Whistle/induction claims must match tested construction." },
    ],
  },
  {
    slug: "msds-adhesives-sealants-export-faq",
    title: "MSDS Authoring for Adhesives & Sealants Exports — FAQ",
    excerpt:
      "Adhesive/sealant exporters: GHS classification issues, curing chemistries, transport sections and FAQ for SDS packs.",
    topic: "MSDS",
    productHint: "Industrial & consumer adhesives/sealants",
    standardHint: "GHS SDS · mixture classification",
    bodyLead:
      "Adhesives combine solvents, isocyanates, resins and fillers — classification mistakes show up first at the airline DG desk.",
    bullets: [
      "Account for reactive components and residual monomers",
      "State curing hazards honestly in Sections 2 and 8",
      "Provide PPE guidance that matches real use",
      "Localise language only after the master English SDS is solid",
    ],
    faqs: [
      { q: "Two-part kits — one or two SDS?", a: "Usually one SDS per part, plus clear kit labelling. Do not hide Part B hazards." },
      { q: "Does curing make transport non-DG?", a: "Transport classification follows the form offered for carriage, not the cured film." },
      { q: "Buyer asks for REACH SDS format?", a: "Provide a GHS-aligned SDS meeting their market expectations; Certko can help structure variants." },
      { q: "Turnaround for authoring?", a: "Depends on composition completeness. Incomplete % ranges delay classification." },
    ],
  },
  {
    slug: "bee-star-rating-vs-bis-certification-faq",
    title: "BEE Star Rating vs BIS Certification — What Product Teams Mix Up (FAQ)",
    excerpt:
      "Clear FAQ on BEE energy labelling versus BIS safety/product certification — when you need one, the other, or both.",
    topic: "Applicable Standards",
    productHint: "Appliances under BEE and/or BIS",
    standardHint: "BEE schedules · BIS ISI/CRS",
    bodyLead:
      "**BEE** and **BIS** are both Indian compliance regimes — and they are not interchangeable. This FAQ stops expensive mis-briefings to labs.",
    bullets: [
      "BIS answers conformity/safety registration questions",
      "BEE answers energy performance labelling questions",
      "Many appliances eventually need coordinated calendars for both",
      "Label artwork must reflect granted stars / licence marks accurately",
    ],
    faqs: [
      { q: "If I have BEE, do I still need BIS?", a: "Often yes when a QCO/CRS applies. BEE does not waive BIS." },
      { q: "If I have BIS, can I skip BEE?", a: "Not if your product is under a BEE schedule requiring labels for sale." },
      { q: "Do test labs overlap?", a: "Sometimes the same lab campus can do both — but quotations and standards differ." },
      { q: "Can Certko manage both tracks?", a: "Yes — we build a combined calendar so samples are not pulled twice blindly." },
    ],
  },
  {
    slug: "export-to-uk-ukca-ce-transition-faq",
    title: "Exporting to the UK — UKCA / CE Requirements FAQ for Manufacturers",
    excerpt:
      "UK market access FAQ for exporters: UKCA themes, CE recognition practicalities, labelling and documentation habits.",
    topic: "Export Certification",
    productHint: "Products placed on the UK market",
    standardHint: "UKCA / UK compliance pathways",
    bodyLead:
      "The UK market still rewards exporters who keep a clean technical file. This FAQ focuses on practical UK placement questions from Indian factories.",
    bullets: [
      "Confirm current marking acceptance for your category",
      "Keep a UK-responsible person / importer story clear",
      "Maintain English instructions and traceability labels",
      "Do not assume India BIS evidence substitutes UK conformity",
    ],
    faqs: [
      { q: "Is CE still useful for the UK?", a: "Rules have evolved by category and date. Verify current UK guidance for your product family before printing labels." },
      { q: "Do I need UK-specific EMC tests?", a: "Often evidence aligned to designated standards is reused thoughtfully — confirm with your conformity assessment approach." },
      { q: "Amazon UK document checks?", a: "Expect requests for test summaries, DoC-like documents and labelling photos." },
      { q: "How Certko helps?", a: "We coordinate test evidence and a document pack your UK importer can defend." },
    ],
  },
  {
    slug: "bis-switches-sockets-isi-certification-faq",
    title: "BIS for Switches & Socket-Outlets — ISI Certification FAQ",
    excerpt:
      "Wiring accessories BIS FAQ: IS mapping, modular ranges, glow-wire/temperature themes and importer questions.",
    topic: "BIS Certification",
    productHint: "Switches and socket-outlets",
    standardHint: "Applicable IS wiring accessory standards · ISI",
    bodyLead:
      "Switches and sockets are high-scrutiny electrical accessories. Series modularity tempts over-grouping — labs and inspectors notice.",
    bullets: [
      "Separate current ratings and shutter designs in scope maps",
      "Control polymer grades for heat/flammability performance",
      "Validate earthing continuity designs",
      "Keep packing end-use claims modest and accurate",
    ],
    faqs: [
      { q: "Can one licence cover an entire modular plate family?", a: "Only within rules that recognise similarity. Mechanisms with different ratings usually need careful scoping." },
      { q: "USB socket outlets — extra standards?", a: "USB power circuitry can pull in additional safety expectations. Flag USB ports at kickoff." },
      { q: "Import from China common issues?", a: "Wrong standard claimed on carton, missing FMCS, and model codes that do not match reports." },
      { q: "Inspection readiness tip?", a: "Calibrated instruments and in-house routine tests must be real — not paperwork props." },
    ],
  },
  {
    slug: "mechanical-testing-product-durability-compliance-faq",
    title: "Mechanical Testing for Product Durability & Compliance — FAQ",
    excerpt:
      "Mechanical/physical testing FAQ: tensile, impact, endurance and when buyer programmes require durability evidence.",
    topic: "Product Testing",
    productHint: "Hardware, plastics, furniture fittings, PPE parts",
    standardHint: "IS/ISO mechanical methods as specified",
    bodyLead:
      "Mechanical testing proves the product survives real use — not only electrical safety. OEMs and tenders ask for it constantly.",
    bullets: [
      "Translate buyer specs into standard test methods",
      "Define pass/fail numerically before lab kickoff",
      "Sample conditioning (temperature/humidity) matters",
      "Record fixture photos for disputed failures",
    ],
    faqs: [
      { q: "Is mechanical testing part of BIS?", a: "When the Indian Standard includes mechanical clauses, yes. Separately, buyers may demand extra endurance tests." },
      { q: "How many specimens?", a: "Method-dependent. Ask the lab for n= counts in the quote." },
      { q: "Can design simulations replace tests?", a: "Not for certification/buyer release in most programmes." },
      { q: "Certko role?", a: "We map methods, labs and acceptance criteria into one statement of work." },
    ],
  },
  {
    slug: "fmcs-bis-foreign-manufacturers-exporting-to-india-faq",
    title: "FMCS BIS for Foreign Manufacturers Exporting to India — FAQ",
    excerpt:
      "FMCS explained for overseas factories: application flow, inspection expectations, Indian authorised representative themes and FAQ.",
    topic: "Importing into India",
    productHint: "Overseas factories selling ISI products into India",
    standardHint: "BIS FMCS · Scheme I",
    bodyLead:
      "**FMCS** is how many foreign manufacturers legally enter India for ISI-mark products. Delays usually come from incomplete plant documentation, not from the idea of FMCS itself.",
    bullets: [
      "Appoint/engage the correct India-facing roles as required",
      "Prepare process flow, machinery lists and QC plans in English",
      "Plan inspection travel windows realistically",
      "Align export models with licensed varieties",
    ],
    faqs: [
      { q: "Is FMCS available for CRS electronics?", a: "CRS and FMCS are different schemes. Electronics under MeitY CRO follow CRS rules; FMCS is the foreign factory path for ISI-style products." },
      { q: "Can a trading company in Dubai hold FMCS?", a: "Licences attach to manufacturing locations. Trading entities need the factory enrolled correctly." },
      { q: "How long does FMCS take?", a: "Often months when inspection slots and query loops are included. Start before peak season." },
      { q: "Does Certko handle FMCS remotely?", a: "Yes — documentation, lab coordination and inspection readiness support for overseas plants." },
    ],
  },
  {
    slug: "saber-building-materials-saudi-export-faq",
    title: "SABER for Building Materials Exports to Saudi Arabia — FAQ",
    excerpt:
      "Building materials under SABER: standards evidence, shipment certificates, common documentation gaps and FAQ.",
    topic: "SABER",
    productHint: "Building & construction materials for KSA",
    standardHint: "SABER / SASO building regulations",
    bodyLead:
      "Construction consignments into Saudi Arabia collapse when mill certificates, test reports and SABER model data tell three different stories.",
    bullets: [
      "Match product names to the Saudi regulated list carefully",
      "Keep batch/lot traceability with test evidence",
      "Coordinate factory COA with third-party reports",
      "Brief freight forwarders on certificate numbers before sailing",
    ],
    faqs: [
      { q: "Do steel and cement follow the same SABER path?", a: "Both may be regulated, but technical regulations and evidence differ. Scope separately." },
      { q: "Are project shipments treated differently?", a: "Project buyers sometimes impose extra specs on top of SABER. Read the PO annex." },
      { q: "Can I transfer certificates between traders?", a: "Portal/ownership rules are strict. Plan the account structure first." },
      { q: "Help from Certko?", a: "We assemble evidence checklists and coordinate labs for Saudi-bound materials." },
    ],
  },
  {
    slug: "wpc-eta-wireless-products-india-import-faq",
    title: "WPC / ETA for Wireless Products in India — Import FAQ",
    excerpt:
      "WPC-ETA essentials for Wi-Fi/BT/RF products: when ETA is needed, interplay with BIS CRS, and FAQ for importers.",
    topic: "Importing into India",
    productHint: "Wireless / RF-bearing electronics",
    standardHint: "WPC ETA · plus BIS where notified",
    bodyLead:
      "If your product transmits, **WPC/ETA** may sit beside BIS on the critical path. Importers who discover ETA after customs filing lose weeks.",
    bullets: [
      "Identify all radios (Wi-Fi, BT, cellular, proprietary)",
      "Collect modular approvals / RF test evidence where usable",
      "Align model names with ETA and CRS filings",
      "Check packaging RF statements",
    ],
    faqs: [
      { q: "Does ETA replace BIS CRS?", a: "No. ETA is spectrum/equipment type approval territory; BIS CRS is product safety registration when notified." },
      { q: "Do pure Bluetooth accessories need ETA?", a: "Many RF products do — confirm current WPC rules for your device class." },
      { q: "Can I use FCC ID as ETA?", a: "FCC grant is not an Indian ETA. Evidence may help engineering, not replace the Indian approval." },
      { q: "Certko support?", a: "We help sequence BIS + WPC + testing so imports clear once." },
    ],
  },
  {
    slug: "export-certification-roadmap-multi-country-faq",
    title: "Multi-Country Export Certification Roadmap — BIS, CE, FCC, SABER FAQ",
    excerpt:
      "One FAQ roadmap for brands selling the same SKU into India, EU, US and Saudi/GCC — sequencing tests to avoid repeat spend.",
    topic: "Export Certification",
    productHint: "Multi-market electrical/electronic SKUs",
    standardHint: "BIS · CE · FCC · SABER/GMARK",
    bodyLead:
      "Global SKUs fail when each market’s compliance is run as a surprise. This roadmap FAQ shows a sane sequence.",
    bullets: [
      "Freeze hardware once for a ‘compliance golden sample’",
      "Run safety + EMC once with reuse in mind",
      "Layer India BIS/CRS and destination filings on shared evidence",
      "Keep a master matrix of model = report = certificate",
    ],
    faqs: [
      { q: "Should I finish BIS before CE?", a: "Depends on revenue priority. Technically, shared safety/EMC planning should start together even if filings stagger." },
      { q: "One adapter, many host brands?", a: "Registrations and reports must reflect actual applicant/manufacturer relationships." },
      { q: "How do we stop duplicate testing?", a: "A Certko gap assessment before any lab PO is the cheapest insurance." },
      { q: "Who owns the technical file?", a: "Usually the manufacturer/brand placing the product — clarify contractually with ODMs." },
    ],
  },
  {
    slug: "bis-steel-products-qco-isi-certification-faq",
    title: "BIS / QCO for Steel Products — ISI Certification FAQ",
    excerpt:
      "Steel product QCOs and ISI Mark FAQ: mill readiness, grade coverage, import controls and documentation tips.",
    topic: "BIS Certification",
    productHint: "Steel products under QCO",
    standardHint: "Relevant IS steel standards · ISI",
    bodyLead:
      "Steel QCOs reshaped import and domestic supply. Mills and traders need licence scopes that match grades actually shipped.",
    bullets: [
      "Map each grade/size to IS standards carefully",
      "Keep heat/lot traceability audit-ready",
      "Coordinate mill tests with BIS surveillance",
      "Importers: verify licence validity before booking vessels",
    ],
    faqs: [
      { q: "Can traders import without mill BIS?", a: "When QCO applies, uncertified supply is high risk. Source from licensed mills/FMCS holders." },
      { q: "Do fabrication shops need ISI?", a: "Depends on whether the notified product standard applies to their output. Scope the exact product." },
      { q: "Common query from BIS?", a: "Mismatched grades on test certificates vs licence variety." },
      { q: "Certko help?", a: "Standard mapping, lab/mill readiness and FMCS support for overseas mills." },
    ],
  },
  {
    slug: "applicable-standards-how-to-read-is-qco-faq",
    title: "How to Read Applicable IS Standards & QCO Notifications — FAQ",
    excerpt:
      "Practical FAQ on reading Indian Standards and Quality Control Orders so teams stop guessing scheme and test scope.",
    topic: "Applicable Standards",
    productHint: "Any product under Indian Standards / QCO",
    standardHint: "IS texts · QCO gazette reading",
    bodyLead:
      "Most compliance failures begin with misreading the **applicable standard**. This FAQ teaches a simple reading method for product teams.",
    bullets: [
      "Start from product definition and exclusions",
      "Note normative references that pull extra tests",
      "Separate factory production control from type tests",
      "Cross-check QCO enforcement dates vs your PO",
    ],
    faqs: [
      { q: "Where do I find if my product is under QCO?", a: "Official gazette/QCO lists and practical maps on Certko product pages — then verify the legal text." },
      { q: "What is a normative reference?", a: "Another standard your IS points to as mandatory for some materials/tests." },
      { q: "Edition year confusion?", a: "Always record the edition used in the lab report; migrations matter." },
      { q: "Can Certko interpret the standard for us?", a: "Yes — we translate clauses into a test and documentation checklist." },
    ],
  },
  {
    slug: "led-product-testing-photometric-safety-faq",
    title: "LED Product Testing — Safety, Photometric & Compliance FAQ",
    excerpt:
      "LED testing FAQ covering safety, performance, EMC adjacency and BIS/export evidence for luminaires and lamps.",
    topic: "Product Testing",
    productHint: "LED lamps and luminaires",
    standardHint: "IS 10322 / IS 16102 families · EMC as needed",
    bodyLead:
      "LED programmes combine **safety**, sometimes **performance**, and export **EMC**. Labs should be briefed with one integrated sample plan.",
    bullets: [
      "Separate safety samples from photometric samples when methods conflict",
      "Lock driver firmware/current set-points",
      "Measure the configuration you will ship",
      "Plan CISPR 15 if exporting to EMC-regulated markets",
    ],
    faqs: [
      { q: "Is LM-79 required for BIS?", a: "BIS follows the applicable IS. LM-79-like photometric data is often buyer/performance driven." },
      { q: "Do smart LEDs need WPC?", a: "If they include radios, ETA/WPC analysis is required alongside safety." },
      { q: "Why did EMC fail after safety passed?", a: "Different discipline — filters and cable design drive EMC margins." },
      { q: "Certko LED help?", a: "We coordinate safety + EMC + certification calendars for lamp/luminaire lines." },
    ],
  },
  {
    slug: "export-to-saudi-vs-uae-compliance-differences-faq",
    title: "Saudi vs UAE Product Compliance — SABER, GMARK & Buyer FAQ",
    excerpt:
      "Side-by-side FAQ for exporters comparing Saudi SABER expectations with UAE/Gulf pathways and retailer demands.",
    topic: "Export Certification",
    productHint: "GCC-bound consumer & electrical goods",
    standardHint: "SABER vs GMARK / UAE requirements",
    bodyLead:
      "Gulf is not one paperwork island. Saudi **SABER** and UAE/Gulf **GMARK**/local rules punish copy-paste compliance.",
    bullets: [
      "Build a destination column in your SKU matrix",
      "Never reuse Saudi certificates as UAE proof",
      "Localise plugs, manuals and warning language",
      "Confirm who is consignee/importer of record",
    ],
    faqs: [
      { q: "One test report for both countries?", a: "Often reusable as evidence, but filings/portals differ." },
      { q: "Which market is stricter?", a: "Wrong question — they are differently strict. Scope each." },
      { q: "Can Dubai free-zone stock serve both?", a: "Inventory can, certificates must still match each import lane." },
      { q: "Help?", a: "Certko builds a dual-lane checklist for Saudi + UAE launches." },
    ],
  },
  {
    slug: "bis-crs-vs-isi-mark-which-scheme-faq",
    title: "BIS CRS vs ISI Mark — Which Scheme Applies to Your Product? (FAQ)",
    excerpt:
      "Decision FAQ for manufacturers: MeitY CRS versus ISI Mark Scheme I — electronics vs many QCO hard goods.",
    topic: "Applicable Standards",
    productHint: "Electronics vs general QCO products",
    standardHint: "CRS (Scheme II) vs ISI (Scheme I)",
    bodyLead:
      "Picking **CRS** when you needed **ISI** (or the reverse) burns months. Use this FAQ before you brief any lab.",
    bullets: [
      "Electronics under MeitY orders → usually CRS",
      "Many cables, cement, PPE, appliances under QCO → often ISI",
      "Factory inspection is a hallmark of classic ISI — not CRS",
      "Search your product on Certko, then verify the order text",
    ],
    faqs: [
      { q: "Can a product need both?", a: "Rare as dual schemes for the same obligation, but a factory can hold many licences across products." },
      { q: "Is FMCS only for ISI?", a: "FMCS is the foreign manufacturer route in the ISI world. CRS has its own foreign/brand structures." },
      { q: "Which is faster?", a: "CRS can be faster when lab slots exist; ISI adds inspection scheduling. Product rules — not preference — decide." },
      { q: "Still unsure?", a: "Send datasheet + HSN to Certko for a 24-hour scoping note." },
    ],
  },
  {
    slug: "msds-section-14-transport-shipping-companies-faq",
    title: "SDS Section 14 Transport Info — What Shipping Companies Check (FAQ)",
    excerpt:
      "FAQ on SDS Section 14: UN numbers, packing groups, air vs sea differences, and why forwarders reject incomplete sheets.",
    topic: "MSDS",
    productHint: "Any DG or chemical cargo",
    standardHint: "GHS SDS Section 14 · IMDG/IATA",
    bodyLead:
      "Freight forwarders open **Section 14** first. If UN data is blank or contradictory, your booking will not stick.",
    bullets: [
      "State UN number, proper shipping name, class, packing group",
      "Note differences for air vs sea when relevant",
      "Keep SDS revision date visible on page 1/16",
      "Ensure DG declaration matches the SDS",
    ],
    faqs: [
      { q: "What if my product is non-DG?", a: "Say so clearly with rationale; do not leave Section 14 empty without explanation." },
      { q: "Who is responsible — shipper or author?", a: "The shipper remains responsible for transport classification; authoring support must be fed accurate data." },
      { q: "Can Section 14 differ by pack size?", a: "Limited quantity / excepted quantity treatments can change — document the offered pack." },
      { q: "Instacertify help?", a: "We author/upgrade SDS packs so Section 14 is usable at the DG desk." },
    ],
  },
  {
    slug: "importing-toys-electronics-india-combined-compliance-faq",
    title: "Importing Toys & Kids Electronics into India — Combined Compliance FAQ",
    excerpt:
      "When toys meet electronics: BIS toy rules, CRS/EMC/WPC overlays, labelling and FAQ for importers.",
    topic: "Importing into India",
    productHint: "Electronic toys & kids devices",
    standardHint: "Toy IS standards · CRS/WPC if radios/power",
    bodyLead:
      "Kids’ electronics trigger **multiple regimes**. This FAQ prevents single-track thinking (“we only did toy tests”).",
    bullets: [
      "Separate toy safety hazards from electrical/RF obligations",
      "Check battery standards and charging accessories",
      "Plan age grading and warning labels early",
      "Marketplace readiness needs every applicable number visible",
    ],
    faqs: [
      { q: "Does a toy with USB charging need CRS?", a: "If the electronics fall under notified electronics orders, evaluate CRS separately from toy IS requirements." },
      { q: "Are character-licensed toys special?", a: "IP licensing does not replace BIS. Still certify the physical product." },
      { q: "Can I consolidate labs?", a: "Sometimes one campus can cover chemical + electrical — we shortlist." },
      { q: "Biggest delay?", a: "Waiting for OEM BOM details from China after the container is already produced." },
    ],
  },
  {
    slug: "ce-emc-lvd-export-europe-product-faq",
    title: "CE LVD + EMC for Product Export to Europe — Combined FAQ",
    excerpt:
      "Combined LVD and EMC FAQ for exporters: harmonised standards picking, DoC content, and common NB/buyer questions.",
    topic: "Export Certification",
    productHint: "Mains-powered electronics for EU",
    standardHint: "CE LVD + EMC Directive",
    bodyLead:
      "Most mains electronics need both **LVD** and **EMC** stories for CE. Running them as disconnected projects doubles sample waste.",
    bullets: [
      "Pick harmonised standards per function and voltage",
      "Run EMC emissions/immunity on production-intent units",
      "Keep risk assessment with the technical file",
      "Sync nameplate data with DoC models",
    ],
    faqs: [
      { q: "Do battery-only products need LVD?", a: "LVD has voltage thresholds; other directives/standards may still apply. Scope carefully." },
      { q: "Is a red CE mark stamp enough?", a: "No — without a technical file and correct standards, CE marking is empty." },
      { q: "Retailer asks for ‘CE certificate’?", a: "Often they mean test reports + DoC. Clarify deliverables." },
      { q: "Certko coordination?", a: "We sequence safety + EMC labs and assemble the exporter’s evidence pack." },
    ],
  },
  {
    slug: "bis-tyres-certification-india-faq",
    title: "BIS Certification for Tyres in India — Manufacturer & Import FAQ",
    excerpt:
      "Tyre BIS/QCO FAQ: plant controls, size ranges, marking and what importers must verify before landing cargo.",
    topic: "BIS Certification",
    productHint: "Automotive tyres",
    standardHint: "Applicable IS tyre standards · ISI/QCO",
    bodyLead:
      "Tyres are tightly policed when QCOs apply. Size proliferation without licence coverage is a classic non-compliance pattern.",
    bullets: [
      "Map every size/load/speed variant to licence scope",
      "Control compounding and cord materials",
      "Ensure sidewall marking matches grant",
      "Importers: audit overseas licence authenticity",
    ],
    faqs: [
      { q: "Can I import a size not on the mill licence?", a: "No — that is a direct scope breach risk." },
      { q: "Do EV tyres differ?", a: "Performance claims may add tests; start from the notified IS scope first." },
      { q: "Surveillance frequency?", a: "Expect ongoing factory/market surveillance discipline under Scheme I norms." },
      { q: "Certko role?", a: "Scope mapping and FMCS/ISI coordination for domestic or overseas plants." },
    ],
  },
  {
    slug: "saber-pcoc-scoc-documents-explained-faq",
    title: "SABER PCoC & SCoC Documents Explained — Exporter FAQ",
    excerpt:
      "Plain-language FAQ on SABER product and shipment conformity documents, validity, and how they relate to test reports.",
    topic: "SABER",
    productHint: "KSA-bound regulated products",
    standardHint: "SABER PCoC / SCoC flow",
    bodyLead:
      "Exporters lose sailings when they confuse **product** conformity with **shipment** conformity inside SABER. This FAQ separates the two.",
    bullets: [
      "Complete product listing/models before shipment certificates",
      "Keep test reports current relative to certificate rules",
      "Ensure invoice models match SABER models character-for-character",
      "Brief the importer on portal steps they must complete",
    ],
    faqs: [
      { q: "Which document does the shipping line need?", a: "It varies by cargo and buyer instructions — many ask for SABER-related shipment proofs before delivery order release." },
      { q: "Can certificates be amended after sailing?", a: "Amendments are painful and sometimes impossible without delays. Freeze data early." },
      { q: "Do I need a Saudi office?", a: "Importer/consignee roles matter. Structure with your distributor." },
      { q: "Certko help?", a: "We prep evidence and coordinate the conformity pathway end-to-end." },
    ],
  },
  {
    slug: "product-testing-accreditation-nabl-bis-labs-faq",
    title: "Choosing NABL / BIS-Recognised Labs for Product Testing — FAQ",
    excerpt:
      "Lab selection FAQ: BIS recognition vs NABL accreditation, scope codes, quoting tips and red flags for manufacturers.",
    topic: "Product Testing",
    productHint: "Any product needing accredited tests",
    standardHint: "BIS-recognised / NABL-accredited scopes",
    bodyLead:
      "A cheap lab without the right **scope** is the most expensive lab. Use this FAQ when comparing quotations.",
    bullets: [
      "Match recognition/accreditation to the scheme (BIS vs export)",
      "Read the scope annex for your exact standard/method",
      "Ask about subcontracting — know who really tests",
      "Compare sample return and failure decision rules",
    ],
    faqs: [
      { q: "Is NABL enough for BIS CRS?", a: "CRS needs **BIS-recognised** labs for the standard. NABL alone may not be sufficient." },
      { q: "Can export CE tests be done in India?", a: "Often yes at competent labs — confirm ILAC/methods acceptance for your NB/buyer." },
      { q: "Why do quotes differ 3×?", a: "Scope depth, chamber time, sample destruction, and whether debug support is included." },
      { q: "Certko lab desk?", a: "Use [Find a lab](/labs) and ask us for a shortlist with indicative bands." },
    ],
  },
  {
    slug: "export-to-usa-ul-nrtl-safety-beside-fcc-faq",
    title: "Export to USA — UL/NRTL Safety Beside FCC (FAQ)",
    excerpt:
      "US retailer FAQ: when UL/NRTL safety is asked on top of FCC, how it differs from BIS, and how to plan samples.",
    topic: "Export Certification",
    productHint: "Consumer electronics/appliances for US retail",
    standardHint: "NRTL/UL safety · FCC",
    bodyLead:
      "US big-box and marketplaces often want **safety listing** evidence in addition to **FCC**. Indian factories that only budgeted FCC get surprised.",
    bullets: [
      "Ask the retailer which NRTL marks they accept",
      "Separate FCC emissions samples from destructive safety samples",
      "Align ratings labels with UL file details",
      "Plan factory inspection/follow-up services if listing requires them",
    ],
    faqs: [
      { q: "Is BIS accepted instead of UL?", a: "No. Different markets and schemes." },
      { q: "Is UL always mandatory by federal law?", a: "Federal FCC ≠ UL. UL/NRTL is often retailer/AHJ driven — still commercially mandatory." },
      { q: "Can CB reports help UL?", a: "Sometimes as supporting data inside a NRTL programme — not automatic." },
      { q: "Certko help?", a: "We sequence FCC + safety lab work with your US buyer checklist." },
    ],
  },
  {
    slug: "bis-domestic-water-heaters-isi-faq",
    title: "BIS Certification for Domestic Water Heaters — ISI FAQ",
    excerpt:
      "Storage/instant water heater BIS FAQ: safety tests, thermostat variants, marking and importer checks.",
    topic: "BIS Certification",
    productHint: "Domestic electric water heaters",
    standardHint: "Applicable IS water heater standards · ISI",
    bodyLead:
      "Water heaters combine electrical and thermal hazards. Variant proliferation (capacity, wattage, fitting style) must be scoped deliberately.",
    bullets: [
      "Group variants using honest construction similarity",
      "Validate earthing and thermal-cutout strategies",
      "Prepare installation instruction accuracy",
      "Marketplace images must show correct marks",
    ],
    faqs: [
      { q: "Instant vs storage — same licence?", a: "Usually different constructions/standards scopes. Do not merge casually." },
      { q: "Do magnesium anode changes matter?", a: "Material/component changes can affect compliance — control them." },
      { q: "Import inspections?", a: "Expect checks against licence and marking; uncertified heaters are high risk under QCO regimes." },
      { q: "BEE too?", a: "Some water heaters may also intersect energy programmes — verify schedules." },
    ],
  },
  {
    slug: "guidelines-labelling-marking-certified-products-india-faq",
    title: "Labelling & Marking Guidelines for Certified Products in India — FAQ",
    excerpt:
      "ISI/CRS marking FAQ: what goes on the product vs pack, common artwork mistakes, and marketplace photo tips.",
    topic: "Applicable Standards",
    productHint: "BIS-certified goods (ISI or CRS)",
    standardHint: "Scheme I / Scheme II marking rules",
    bodyLead:
      "Many grants stall at **marking**. Others get cancelled later when market samples show creative artwork. Use this FAQ as an artwork gate.",
    bullets: [
      "Follow the scheme’s mark layout — do not invent stylised logos",
      "Keep licence/R-numbers legible after packaging abrasion tests",
      "Sync e-commerce main image with physical mark",
      "Control contract manufacturers’ print plates",
    ],
    faqs: [
      { q: "Can I put the ISI mark before grant?", a: "No — marking before grant is a serious non-compliance." },
      { q: "Is a QR code required?", a: "Follow current BIS guidelines for your scheme/product; requirements evolve." },
      { q: "Pack only vs product mark?", a: "Scheme rules specify where the mark must appear. Read them; do not assume pack-only is enough." },
      { q: "Certko artwork review?", a: "Yes — we review mark blocks against grant particulars before mass printing." },
    ],
  },
  {
    slug: "export-china-manufactured-goods-india-bis-readiness-faq",
    title: "China-Manufactured Goods Entering India — BIS Readiness FAQ",
    excerpt:
      "FAQ for brands sourcing in China for India: FMCS/CRS choices, sample logistics, IP/model control and timeline pitfalls.",
    topic: "Importing into India",
    productHint: "China-origin products bound for India",
    standardHint: "FMCS or CRS depending on product",
    bodyLead:
      "China ODMs can move fast — Indian regulators do not. This FAQ is the readiness list brand owners should send factories in Shenzhen, Dongguan or Ningbo.",
    bullets: [
      "Decide CRS vs FMCS/ISI from product type first",
      "Put English documentation obligations in the PO",
      "Air-ship compliance samples separately from bulk",
      "Freeze firmware/BOM with change control",
    ],
    faqs: [
      { q: "Can the China factory use its CCC as BIS?", a: "No. CCC does not replace BIS." },
      { q: "Who applies — brand or factory?", a: "Scheme-dependent. Get the applicant structure right before paying labs." },
      { q: "Typical total timeline?", a: "Often 8–16+ weeks depending on scheme, inspection and queries. Start before tooling sign-off when possible." },
      { q: "Certko remote model?", a: "We run India-side filings/labs while coordinating factory data rooms remotely." },
    ],
  },
  {
    slug: "food-contact-packaging-testing-compliance-faq",
    title: "Food-Contact & Packaging Testing for Compliance — FAQ",
    excerpt:
      "Packaging and food-contact testing FAQ: migration themes, plastics, labelling claims and buyer acceptance.",
    topic: "Product Testing",
    productHint: "Food-contact plastics, containers, packaging",
    standardHint: "IS/FSSAI/buyer food-contact protocols",
    bodyLead:
      "Packaging compliance is invisible until a retailer rejects a shipment. Migration and overall composition tests protect both safety and brand claims.",
    bullets: [
      "Identify food type (fatty/acidic/aqueous) for migration conditions",
      "Test the final article, not only resin COAs",
      "Control printing inks and adhesives as part of the system",
      "Keep batch retention samples",
    ],
    faqs: [
      { q: "Does BIS apply to packaging?", a: "Some packaging/products are under IS/QCO; others are FSSAI/buyer driven. Scope the article." },
      { q: "Is ‘food grade’ certificate enough?", a: "Vague vendor letters are weak. Prefer recognised test methods and traceable reports." },
      { q: "Export to EU food contact?", a: "EU frameworks differ — plan separate evidence if exporting." },
      { q: "Certko help?", a: "We map test panels and labs for packaging programmes." },
    ],
  },
  {
    slug: "bis-batteries-energy-storage-compliance-faq",
    title: "BIS & Safety Testing for Batteries / Energy Storage — FAQ",
    excerpt:
      "Battery and energy storage compliance FAQ: safety standards, transport of samples, and India/export overlays.",
    topic: "BIS Certification",
    productHint: "Batteries and electrical energy storage products",
    standardHint: "Applicable IS/IEC battery safety standards",
    bodyLead:
      "Batteries combine safety, transport and sometimes BIS/notification overlays. Sample shipping alone can stall projects if DG rules are ignored.",
    bullets: [
      "Identify cell vs pack vs system responsibilities",
      "Plan UN38.3 / transport docs for sample logistics",
      "Control BMS firmware versions under test",
      "Align charger accessories in the system definition",
    ],
    faqs: [
      { q: "Is every power bank under CRS?", a: "Many portable power products have been pulled into compulsory regimes over time — verify current notifications for your exact category." },
      { q: "Do I need SDS for lithium batteries?", a: "Transport and airline rules often require specific battery Docs/SDS-like information. Prepare both compliance and logistics packs." },
      { q: "Can I test with engineering firmware?", a: "Dangerous — certify the firmware you ship." },
      { q: "Certko support?", a: "Safety lab mapping + certification sequencing for packs/systems." },
    ],
  },
  {
    slug: "guidelines-authorised-indian-representative-compliance-faq",
    title: "Authorised Indian Representative & Importer Roles — Compliance FAQ",
    excerpt:
      "FAQ on India-facing compliance roles for foreign brands: who holds what, document custody, and marketplace accountability.",
    topic: "Importing into India",
    productHint: "Foreign brands selling into India",
    standardHint: "Scheme-specific applicant / AIR structures",
    bodyLead:
      "Foreign brands stumble when **nobody in India owns** the compliance mailbox. This FAQ clarifies role design at a practical level.",
    bullets: [
      "Decide applicant vs local representative early",
      "Put evidence custody in the contract with ODMs",
      "Give marketplaces a single compliance contact",
      "Keep recall/traceability contacts real",
    ],
    faqs: [
      { q: "Can my Amazon seller account be the BIS applicant?", a: "Not as a shortcut. Scheme rules care about manufacturer/registration structures — not seller central alone." },
      { q: "Do I need a local office?", a: "Some pathways require India-facing roles; others allow remote manufacturers with proper appointments. Scope by scheme." },
      { q: "Who answers BIS queries?", a: "Whoever is structured as the responsible applicant/representative — Certko can operate the workbench for them." },
      { q: "Risk of using a ‘rent licence’?", a: "High. Fake or borrowed licences destroy brands when surveillance hits." },
    ],
  },
  {
    slug: "export-documentation-pack-certificates-test-reports-faq",
    title: "Export Documentation Pack — Certificates, Test Reports & SDS FAQ",
    excerpt:
      "What a complete export compliance pack contains: certificates, reports, SDS, labelling photos and FAQ for logistics teams.",
    topic: "Export Certification",
    productHint: "Any regulated export SKU",
    standardHint: "Destination-dependent evidence pack",
    bodyLead:
      "Logistics teams should not discover missing **test reports** at CFS cut-off. Use this FAQ as the export documentation gate.",
    bullets: [
      "Master list: certificate + report + SDS + label photos + DoC/DoC-like docs",
      "Version-control model names across all PDFs",
      "Keep English plus destination language if required",
      "Store packs where CS/logistics can download 24/7",
    ],
    faqs: [
      { q: "Is a certificate enough without the report?", a: "Buyers and NBs often want both. Keep the report." },
      { q: "How long to retain files?", a: "Many regimes expect 10 years-style retention for technical files — follow the strictest market you sell into." },
      { q: "Who assembles the pack?", a: "Compliance owns it; Certko can operate assembly for multi-market SKUs." },
      { q: "Does Instacertify provide SDS + cert together?", a: "Yes — certification, testing coordination and SDS authoring can run as one export-readiness engagement." },
    ],
  },
  {
    slug: "bis-air-conditioners-refrigerators-appliance-certification-faq",
    title: "BIS & BEE for Air Conditioners and Refrigerators — Appliance FAQ",
    excerpt:
      "Large appliance FAQ: BIS safety/product obligations, BEE labelling interplay, series models and importer checks.",
    topic: "BIS Certification",
    productHint: "Room air conditioners & refrigerators",
    standardHint: "Applicable IS + BEE schedules",
    bodyLead:
      "ACs and refrigerators combine **safety**, **performance/energy**, and sometimes refrigerant-related obligations. Brief labs with the full matrix.",
    bullets: [
      "Separate indoor/outdoor unit strategies when required",
      "Freeze compressor and control PCB versions",
      "Align BEE label claims to tested SKUs",
      "Plan seasonal lab capacity early",
    ],
    faqs: [
      { q: "Is BEE enough to sell ACs?", a: "No when BIS/QCO obligations also apply. Coordinate both." },
      { q: "Do inverter and fixed-speed share certificates?", a: "Construction differences usually mean careful scoping — do not assume." },
      { q: "Import of second-hand appliances?", a: "High regulatory risk; do not assume consumer schemes allow it." },
      { q: "Certko appliance desk?", a: "We build combined BIS + BEE + export calendars." },
    ],
  },
  {
    slug: "testing-failure-triage-retest-strategy-faq",
    title: "When Product Testing Fails — Retest Strategy & FAQ",
    excerpt:
      "FAQ for failed safety/EMC/chemical tests: containment, root cause, partial retest vs full redo, and communication with buyers.",
    topic: "Product Testing",
    productHint: "Any product under lab testing",
    standardHint: "Scheme-specific retest rules",
    bodyLead:
      "A failed report is not the end — improvising without a strategy is. This FAQ is the triage script Certko uses with factories.",
    bullets: [
      "Quarantine firmware/BOM immediately",
      "Ask the lab which clauses failed with data, not just ‘FAIL’",
      "Decide engineering fix vs sampling error",
      "Only then book partial/full retest",
    ],
    faqs: [
      { q: "Can I edit the failed report?", a: "Never. Fix the product and retest under controlled conditions." },
      { q: "Will buyers accept ‘engineering opinion’ instead?", a: "Rarely for regulated clauses. Use formal reports." },
      { q: "How to avoid repeat EMC fails?", a: "Pre-compliance after each hardware spin; do not jump straight to certification mode." },
      { q: "Can Certko manage retests?", a: "Yes — failure triage, lab rebooking and buyer communication packs." },
    ],
  },
  {
    slug: "guidelines-hs-code-product-compliance-mapping-india-faq",
    title: "HS Code to Compliance Mapping for India Imports — FAQ",
    excerpt:
      "FAQ on using HS/HTS codes with BIS/QCO mapping, limits of HS-only logic, and how to brief customs brokers correctly.",
    topic: "Importing into India",
    productHint: "Imported goods with ambiguous HS codes",
    standardHint: "HS classification + BIS product definition",
    bodyLead:
      "HS codes guide customs — **product standards** guide BIS. This FAQ explains why HS-only compliance decisions fail.",
    bullets: [
      "Use HS as a hint, not the final BIS scope",
      "Read the product definition in the IS/QCO",
      "Align broker descriptions with certified model names",
      "Escalate ambiguous articles for a formal scope opinion",
    ],
    faqs: [
      { q: "If HS is not listed in a QCO table, am I free?", a: "Not automatically — product descriptions and standards can still catch you. Verify carefully." },
      { q: "Can Certko map HS to BIS?", a: "We provide a practical mapping starting from datasheet + HS, then validate against notifications." },
      { q: "What if two standards seem to apply?", a: "That is common. We document the rationale and confirm with lab/scheme practice." },
      { q: "Does Amazon care about HS?", a: "They care about BIS numbers and product authenticity more — but customs still cares about HS." },
    ],
  },
  {
    slug: "export-southeast-asia-product-certification-overview-faq",
    title: "Exporting to Southeast Asia — Product Certification Overview FAQ",
    excerpt:
      "High-level FAQ for exporters targeting Vietnam, Thailand, Indonesia, Malaysia and Singapore buyer requirements.",
    topic: "Export Certification",
    productHint: "Electronics/appliances into ASEAN markets",
    standardHint: "Country schemes + buyer specs (IECEE CB useful)",
    bodyLead:
      "ASEAN buyers increasingly ask for CB/IECEE evidence, local marks or registration. This overview FAQ helps you ask the right first questions.",
    bullets: [
      "Collect each distributor’s mandatory mark list",
      "Keep CB reports current for safety reuse",
      "Budget local agent services where required",
      "Do not assume CE alone opens every ASEAN shelf",
    ],
    faqs: [
      { q: "Is there one ASEAN certificate?", a: "No single certificate replaces all national rules." },
      { q: "Does BIS help in ASEAN?", a: "Not as a substitute mark — but strong lab discipline transfers." },
      { q: "Where to start?", a: "Buyer checklist → standards map → lab plan with Certko." },
      { q: "Language of reports?", a: "English usually; some authorities ask local translations for labels/manuals." },
    ],
  },
  {
    slug: "bis-safety-glass-automotive-building-faq",
    title: "BIS for Safety Glass (Automotive/Building) — Certification FAQ",
    excerpt:
      "Safety glass BIS FAQ: laminate/tempered scopes, marking, automotive vs architectural use and importer checks.",
    topic: "BIS Certification",
    productHint: "Safety glass products",
    standardHint: "Applicable IS safety glass standards · ISI",
    bodyLead:
      "Safety glass failures are literal safety failures. BIS scopes must mirror thickness, processing and intended use.",
    bullets: [
      "Separate automotive and building glass scopes when standards differ",
      "Control interlayer and tempering process parameters",
      "Mark each pane as required — not only the crate",
      "Retain process capability data for surveillance",
    ],
    faqs: [
      { q: "Can architectural glass use automotive reports?", a: "No — use cases and standards differ." },
      { q: "Do stickers replace etching marks?", a: "Follow the marking method required by the applicable IS/scheme. Do not invent pack-only shortcuts." },
      { q: "Importer checks?", a: "Verify mill/processor BIS licence scope against thickness and processing type on the invoice." },
      { q: "Certko help?", a: "Scope mapping, lab coordination and FMCS/ISI support for glass processors." },
    ],
  },
  {
    slug: "msds-batteries-dangerous-goods-shipping-faq",
    title: "MSDS & DG Docs for Battery Shipments — Exporter FAQ",
    excerpt:
      "Battery export FAQ covering SDS-like documents, UN38.3, airline/sea DG checks and how Instacertify supports the pack.",
    topic: "MSDS",
    productHint: "Lithium and other battery shipments",
    standardHint: "Transport regs · SDS/DG documentation",
    bodyLead:
      "Battery cargo is refused quickly when transport documents and safety data disagree. This FAQ sits beside product safety certification — for the shipping lane.",
    bullets: [
      "Prepare UN38.3 summaries for sample and bulk logistics",
      "Keep SDS/handling docs aligned with cell chemistry",
      "Train packers on state-of-charge and package marks",
      "Do not mix damaged cells into export cartons",
    ],
    faqs: [
      { q: "Is a normal chemical SDS enough for lithium cells?", a: "Airlines and carriers often want battery-specific test summaries and packing declarations in addition to SDS-style handling info." },
      { q: "Who signs the DG declaration?", a: "A trained shipper/declarant — not an informal warehouse stamp." },
      { q: "Can Certko help only with SDS?", a: "We can author/upgrade SDS packs and coordinate related product testing/certification tracks." },
      { q: "Does BIS remove DG obligations?", a: "No. Product certification and transport dangerous-goods rules are separate." },
    ],
  },
  {
    slug: "import-export-compliance-calendar-planning-faq",
    title: "Building a Product Compliance Calendar for Import & Export — FAQ",
    excerpt:
      "Planning FAQ: how to schedule BIS, SABER, CE/FCC, testing and SDS work so three workstreams do not collide with sailings.",
    topic: "Applicable Standards",
    productHint: "Multi-SKU compliance programmes",
    standardHint: "Cross-scheme planning",
    bodyLead:
      "Compliance is a calendar problem as much as a technical one. This FAQ shows how Certko sequences work so import and export lanes stay predictable.",
    bullets: [
      "List every SKU × market obligation in one matrix",
      "Book long-lead EMC/safety slots before artwork freeze",
      "Put SDS authoring on the same critical path as DG booking",
      "Leave buffer for lab queries — they always appear",
    ],
    faqs: [
      { q: "How many weeks before shipment should we start?", a: "For new electronics into regulated markets, think in months, not days. Simple SDS-only updates can be faster; ISI/FMCS is not." },
      { q: "Can we run BIS and CE in parallel?", a: "Yes — and you usually should, with a shared sample strategy." },
      { q: "What belongs in a weekly standup?", a: "Open lab queries, certificate expiries, model changes, and next three sailings." },
      { q: "Will Certko run the calendar?", a: "Yes — Instacertify’s desk can own the compliance workstream while your team owns production." },
    ],
  },
];

const PUBLISH_TIMES_UTC = ["09:00:00.000Z", "12:00:00.000Z", "15:00:00.000Z"];

/** Start scheduling from this UTC calendar day (3 posts/day). */
const SCHEDULE_START = "2026-08-09";

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function scheduledAtForIndex(index: number): string {
  const dayOffset = Math.floor(index / PUBLISH_TIMES_UTC.length);
  const slot = index % PUBLISH_TIMES_UTC.length;
  const day = addDays(SCHEDULE_START, dayOffset);
  return `${day}T${PUBLISH_TIMES_UTC[slot]}`;
}

export function ensureScheduledFaqPosts(db: SqliteDatabase) {
  const author = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (!author) return;

  const exists = db.prepare("SELECT id FROM posts WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO posts
      (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
     VALUES (?, ?, ?, ?, '', ?, ?, 'scheduled', ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    FAQ_POST_DEFS.forEach((def, index) => {
      if (exists.get(def.slug)) return;
      const publishedAt = scheduledAtForIndex(index);
      const content = buildContent(def);
      insert.run(
        def.slug,
        def.title,
        def.excerpt,
        content,
        author.name,
        author.id,
        publishedAt,
        `${def.title.replace(/\s+/g, " ").slice(0, 45)} | Certko`,
        def.excerpt.slice(0, 160)
      );
    });
  });
  tx();
}