import type { SqliteDatabase } from "./sqlite";
import { insertBlogPostsIfMissing, type SeedBlogPostInput } from "./blog-seed";

type Section = { heading: string; body: string };
type Faq = { q: string; a: string };

type ComplianceBlogDef = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  bodyLead: string;
  sections: Section[];
  checklist?: string[];
  faqs?: Faq[];
  related: string;
};

function buildContent(def: ComplianceBlogDef): string {
  const checklist = def.checklist?.length
    ? `\n## Practical checklist\n\n${def.checklist.map((b) => `- ${b}`).join("\n")}\n`
    : "";
  const faqs = def.faqs?.length
    ? `\n## FAQ\n\n${def.faqs
        .map(
          (f, i) => `### ${i + 1}. ${f.q}\n\n${f.a}`
        )
        .join("\n\n")}\n`
    : "";
  const sections = def.sections
    .map((s) => `## ${s.heading}\n\n${s.body}`)
    .join("\n\n");

  return `# ${def.title}

${def.bodyLead}

${sections}
${checklist}
## How Certko + Instacertify help

1. Map your SKU on [Products](/products) and the right scheme on [Certifications](/certifications).
2. Shortlist labs and scopes via [Testing](/testing) and [Find a lab](/labs).
3. We coordinate documentation, queries and buyer-ready packs — free scoping quote in 24 hours.

[Get Expert Help](/contact) · [Browse products](/products) · [More on the blog](/blog)
${faqs}
${def.related}

> **Disclaimer:** Regulations, QCO notifications, WPC frequency plans and destination-market rules change. Confirm the current requirement for your exact model, composition and export country before booking irreversible tests or filing applications.
`;
}

function relatedLinks(items: string): string {
  return `\n---\n\n**Related reading:** ${items}`;
}

const FOOTER_MSDS = relatedLinks(
  "[MSDS required for export](/blog/msds-required-for-product-export-shipping-buyers) · [Instacertify SDS authoring](/blog/instacertify-msds-sds-authoring-globally-accepted) · [Chemical testing](/testing) · [India hub](/blog/top-bis-certification-consultant-india)"
);
const FOOTER_BIS = relatedLinks(
  "[Top BIS consultant India](/blog/top-bis-certification-consultant-india) · [Why hire a BIS consultant](/blog/why-hire-bis-certification-consultant) · [BIS certification](/certifications/bis) · [QCO deadlines](/blog/qco-deadlines-how-to-prepare)"
);
const FOOTER_WPC = relatedLinks(
  "[WPC / ETA FAQ](/blog/wpc-eta-wireless-products-india-import-faq) · [WPC certification](/certifications/wpc-eta) · [Importing electronics into India](/blog/importing-electronics-into-india-bis-crs-guidelines)"
);
const FOOTER_ROHS = relatedLinks(
  "[RoHS is testing, not certification](/blog/rohs-testing-not-certification-compliance-guide) · [EU CE export FAQ](/blog/export-to-eu-ce-marking-certification-requirements-faq) · [Heavy metals testing](/blog/chemical-testing-heavy-metals-product-compliance-faq) · [Chemical testing](/testing)"
);
const FOOTER_TOYS = relatedLinks(
  "[BIS toys FAQ](/blog/bis-toys-certification-import-india-faq) · [EN71 global testing](/blog/en71-toy-safety-testing-global-export-markets) · [Import toys + electronics](/blog/importing-toys-electronics-india-combined-compliance-faq)"
);
const FOOTER_TILES = relatedLinks(
  "[Ceramic tiles BIS](/blog/bis-certification-ceramic-tiles-is-15622-india) · [Tiles testing IS 15622](/blog/ceramic-tiles-testing-is-15622-dimensions-strength-export) · [Export tiles testing](/blog/export-tiles-testing-bis-iso-ce-compliance-checklist) · [Testing](/testing)"
);
const FOOTER_FOOD = relatedLinks(
  "[Nutrition label testing](/blog/food-nutrition-testing-label-claims-fssai-export) · [Nutritional value lab analysis](/blog/nutritional-value-testing-packaged-foods-lab-verification) · [Export documentation pack](/blog/export-documentation-pack-certificates-test-reports-faq)"
);

/** 30 compliance / testing blogs — inserted as drafts if missing. */
const COMPLIANCE_BLOG_DEFS: ComplianceBlogDef[] = [
  // ── MSDS / SDS (5) ──────────────────────────────────────────────
  {
    slug: "msds-authoring-agarbatti-incense-export-sds",
    title: "MSDS Authoring for Agarbatti & Incense Export — GHS SDS Buyers and Carriers Expect",
    excerpt:
      "Agarbatti and incense exporters need GHS-aligned SDS for fragrance oils, dhoop, charcoal blends and bulk sticks. Learn when shipping lines and overseas buyers demand MSDS — and how to author it correctly.",
    meta_title: "MSDS for Agarbatti Export | Incense SDS Authoring | Certko",
    meta_description:
      "MSDS / SDS authoring for agarbatti, incense sticks and fragrance oils exported from India. GHS 16-section sheets for carriers and foreign buyers. Free quote in 24 hours.",
    bodyLead:
      "**Agarbatti (incense sticks)**, dhoop cones and aromatic blends look like simple consumer goods — until your freight forwarder or EU/US buyer asks for a **Safety Data Sheet (SDS)** on the fragrance fraction, solvent carrier or bulk shipment. Instacertify authors GHS-aligned MSDS packs so export bookings and import clearance do not stall on paperwork.",
    sections: [
      {
        heading: "When agarbatti exports need an MSDS / SDS",
        body:
          "Not every retail carton needs a 16-section SDS, but these triggers are common:\n\n- **Bulk incense or raw fragrance oil** shipped as a chemical mixture (dipropylene glycol, DEP, essential oils, synthetic musks).\n- **Charcoal-based masala sticks** where carriers treat the shipment as combustible / self-heating cargo.\n- **Overseas distributor onboarding** — EU and US importers file SDS in their chemical inventory (REACH/CLP, OSHA HazCom).\n- **Marketplace or retailer compliance** — large buyers request SDS even for low-hazard SKUs to standardise warehouse H&S.",
      },
      {
        heading: "What goes into an incense SDS",
        body:
          "| Section | Agarbatti relevance |\n| --- | --- |\n| 2 — Hazards | Signal word, pictograms for fragrance/solvent fraction |\n| 3 — Composition | Essential oils, fixatives, binders (trade-secret ranges allowed) |\n| 9 — Physical properties | Flash point of liquid fragrance; dust hazard for powders |\n| 14 — Transport | UN proper shipping name if classified; IMDG notes for sea |\n\nInstacertify builds SDS from your **formulation inputs** or supplier SDS — not from generic internet PDFs that fail buyer audits.",
      },
    ],
    checklist: [
      "List fragrance oil CAS numbers and % ranges (or supplier SDS inputs)",
      "Confirm export form: retail cartons vs bulk drums / master cartons",
      "Align SDS product name with invoice and packing list",
      "Check destination: EU CLP wording vs US OSHA HazCom format",
    ],
    faqs: [
      {
        q: "Do plain bamboo agarbatti sticks without liquid fragrance need SDS?",
        a: "Usually **no** for finished retail sticks with negligible free liquid — but **fragrance oils, DEP carriers and bulk masala powder** almost always do. Confirm with your forwarder before booking.",
      },
    ],
    related: FOOTER_MSDS,
  },
  {
    slug: "msds-export-ceramic-tiles-adhesives-coatings-sds",
    title: "MSDS for Export of Ceramic Tiles, Adhesives & Grouts — SDS Shipping Requirements",
    excerpt:
      "Exporting ceramic tiles with adhesives, epoxy grouts or surface coatings? Shipping lines and buyers often require MSDS for the chemical fraction — not just the tile carton.",
    meta_title: "MSDS for Ceramic Tile Export | Adhesive SDS | Certko",
    meta_description:
      "MSDS / SDS for ceramic tile export shipments with adhesives, grouts and coatings. GHS sheets for freight and import clearance. Instacertify authoring help.",
    bodyLead:
      "Ceramic **tiles themselves** are usually non-hazardous articles, but **tile adhesive (IS 15477)**, epoxy grout, primer and anti-slip coatings shipped in the same container are chemical products. Forwarders and overseas warehouses request **MSDS / SDS** for those lines — especially when mixed loads are declared to dangerous-goods desks.",
    sections: [
      {
        heading: "Tiles vs adhesives — who needs the SDS",
        body:
          "- **Glazed/vitrified tiles (IS 15622)** — typically no SDS for the tile SKU alone.\n- **Cementitious / polymer-modified adhesives** — SDS required; alkalinity and cement dust hazards must be stated.\n- **Epoxy grouts & sealants** — full GHS SDS; Part B hardeners are often the classified component.\n- **Anti-fouling or nano-coatings** — may trigger restricted substance checks alongside [RoHS-style testing](/blog/rohs-substance-restriction-testing-conformity-declaration).",
      },
      {
        heading: "Export documentation alignment",
        body:
          "Keep **SDS product identity**, **HS code** and **commercial invoice description** aligned. Middle East and EU project buyers reject packs where the adhesive SDS name does not match the PO line item. Pair SDS with [BIS / ISO tile test reports](/blog/export-tiles-testing-bis-iso-ce-compliance-checklist) in one buyer folder.",
      },
    ],
    related: relatedLinks(
      "[MSDS for export](/blog/msds-required-for-product-export-shipping-buyers) · [Tile export testing](/blog/export-tiles-testing-bis-iso-ce-compliance-checklist) · [Ceramic tiles BIS](/blog/bis-certification-ceramic-tiles-is-15622-india) · [Chemical testing](/testing)"
    ),
  },
  {
    slug: "msds-authoring-fragrance-oils-aromatic-chemicals-export",
    title: "MSDS Authoring for Fragrance Oils & Aromatic Chemicals — Export SDS from India",
    excerpt:
      "Fragrance houses and incense manufacturers exporting aromatic chemicals need current GHS SDS in English (and sometimes local language) for CLP, HazCom and carrier acceptance.",
    meta_title: "Fragrance Oil MSDS Authoring | Aromatic Export SDS | Certko",
    meta_description:
      "Professional MSDS / SDS authoring for fragrance oils, aromatic chemicals and essential oils exported from India. GHS Section 14 for sea and air freight.",
    bodyLead:
      "Whether you export **essential oils**, **synthetic fragrance blends** or **aromatic intermediates**, overseas importers treat the SDS as a legal document — not marketing. Outdated or generic sheets are the #1 reason fragrance shipments get held at buyer QA gates.",
    sections: [
      {
        heading: "Regulatory angles by destination",
        body:
          "| Market | Typical expectation |\n| --- | --- |\n| European Union | CLP classification; REACH registration may sit with EU importer |\n| United States | OSHA HazCom 2012 GHS format; consistent CAS listing |\n| GCC | SDS + local language summary for some retailers |\n| ASEAN | GHS-aligned English SDS usually accepted at port |\n\nInstacertify authors from your **GC-MS / composition data** and revises when formulations change.",
      },
    ],
    checklist: [
      "Update SDS within 90 days of material formulation change",
      "Include flash point and density for liquid fragrances",
      "Provide Section 14 even for non-DG goods (many carriers still ask)",
    ],
    related: FOOTER_MSDS,
  },
  {
    slug: "msds-safety-data-sheet-tile-adhesive-grout-export",
    title: "MSDS / SDS for Tile Adhesive & Grout Export — Section 14 for Sea Freight",
    excerpt:
      "Tile adhesive and grout exporters: prepare GHS SDS with correct transport language before the shipping line asks at the last hour.",
    meta_title: "Tile Adhesive MSDS Export | Grout SDS | Certko",
    meta_description:
      "GHS MSDS for tile adhesive and grout export from India. Section 14 transport data for IMDG sea shipments and overseas buyer files.",
    bodyLead:
      "Construction-chemical exporters shipping **cementitious adhesive**, **C1/C2 tile glue** or **epoxy grout** should treat SDS as part of the export pack — alongside [tile quality tests](/blog/glazed-ceramic-tiles-testing-chemical-resistance-export-labs).",
    sections: [
      {
        heading: "Pair SDS with product compliance",
        body:
          "Project buyers in the Gulf and Southeast Asia often request **SDS + BIS/ISO test reports + adhesive IS 15477 compliance** in one submission. Plan both tracks early to avoid split shipments.",
      },
    ],
    related: FOOTER_MSDS,
  },

  // ── WPC (3) ─────────────────────────────────────────────────────
  {
    slug: "wpc-certification-bluetooth-wifi-products-india-guide",
    title: "WPC Certification in India for Bluetooth & Wi-Fi Products — ETA Explained",
    excerpt:
      "Bluetooth speakers, Wi-Fi routers, smart plugs and wireless modules sold or imported in India need WPC Equipment Type Approval (ETA). Here is how the process works.",
    meta_title: "WPC Certification Bluetooth Wi-Fi India | ETA Guide | Certko",
    meta_description:
      "WPC ETA certification for Bluetooth, Wi-Fi and wireless products in India. Import clearance, frequency bands and documentation checklist.",
    bodyLead:
      "India's **Wireless Planning & Coordination (WPC)** wing grants **Equipment Type Approval (ETA)** for radio transmitters operating in delicensed or licensed bands. If your product has **Bluetooth, Wi-Fi, Zigbee, LoRa or cellular**, assume WPC applies until scoped out.",
    sections: [
      {
        heading: "Who needs WPC ETA",
        body:
          "- **Importers** of wireless finished goods (TWS earbuds, routers, smart TVs with Wi-Fi).\n- **Manufacturers** branding wireless SKUs for India marketplaces.\n- **Module integrators** using pre-certified radio modules — still verify ETA coverage for the **final product configuration**.\n\nWPC is separate from [BIS CRS](/blog/importing-electronics-into-india-bis-crs-guidelines) — many SKUs need **both**.",
      },
      {
        heading: "Typical ETA file ingredients",
        body:
          "| Item | Notes |\n| --- | --- |\n| RF test report | From WPC-recognised lab; band-wise power limits |\n| Frequency chart | 2.4 GHz, 5 GHz UNII, BT LE channels |\n| Product photos & label | FCC ID / CE RED report sometimes referenced |\n| Authorisation letter | For foreign OEM imports |\n\nSee also our [WPC / ETA FAQ](/blog/wpc-eta-wireless-products-india-import-faq).",
      },
    ],
    related: FOOTER_WPC,
  },
  {
    slug: "wpc-eta-import-wireless-modules-routers-india",
    title: "WPC ETA for Import of Wireless Modules & Routers into India",
    excerpt:
      "Importing Wi-Fi routers, BLE modules or IoT gateways? WPC ETA is mandatory before customs and marketplace listing — plan RF testing early.",
    meta_title: "WPC ETA Import Wireless Modules Routers | Certko",
    meta_description:
      "WPC Equipment Type Approval for importing wireless modules, routers and IoT devices into India. RF testing and customs clearance guide.",
    bodyLead:
      "Customs and marketplace compliance teams increasingly flag **missing WPC ETA** before goods leave the port or go live on Amazon / Flipkart. Module-level FCC certification **does not replace** India ETA for the imported SKU.",
    sections: [
      {
        heading: "Module vs finished product",
        body:
          "Using a **pre-certified radio module** reduces RF re-engineering but WPC still expects an ETA on the **host product** (antenna gain, power, firmware band limits). Keep module certificate, block diagram and SAR data (where applicable) in the technical file.",
      },
    ],
    checklist: [
      "Confirm operating bands for India (2.4 / 5 GHz DFS rules)",
      "Book WPC-recognised RF lab before production shipment",
      "Align model number on ETA, BIS CRS and packaging",
    ],
    related: FOOTER_WPC,
  },
  {
    slug: "wpc-certification-smart-home-iot-devices-india",
    title: "WPC Certification for Smart Home & IoT Devices in India",
    excerpt:
      "Smart plugs, doorbells, hubs and wearables combine multiple radios — WPC ETA must cover each transmitter in the device.",
    meta_title: "WPC Certification Smart Home IoT India | Certko",
    meta_description:
      "WPC ETA for smart home and IoT devices sold in India. Multi-radio products, testing strategy and import tips.",
    bodyLead:
      "A single **smart home hub** may include Wi-Fi, Bluetooth, Zigbee and sometimes Sub-GHz RF. WPC scope must list **every radio** — partial ETA is a common cause of import holds.",
    sections: [
      {
        heading: "Multi-radio testing strategy",
        body:
          "Test worst-case **simultaneous transmission** scenarios where labs require it. Pair WPC with [BIS CRS for electronics](/blog/bis-certification-notified-products-isi-crs-fmcs-overview) and buyer documentation in one programme.",
      },
    ],
    related: FOOTER_WPC,
  },

  // ── BIS products (4) ────────────────────────────────────────────
  {
    slug: "bis-certification-notified-products-isi-crs-fmcs-overview",
    title: "BIS Certification of Products in India — ISI Mark, CRS & FMCS Overview",
    excerpt:
      "Which BIS scheme applies to your product? ISI Mark (Scheme I), CRS (Scheme II) and FMCS for foreign factories — a practical map for manufacturers and importers.",
    meta_title: "BIS Certification Products India | ISI CRS FMCS | Certko",
    meta_description:
      "BIS certification paths for Indian products: ISI Mark, CRS registration and FMCS for foreign manufacturers. QCO readiness and lab booking.",
    bodyLead:
      "The Bureau of Indian Standards (BIS) runs multiple conformity schemes. Picking the wrong one delays grants by months. This guide maps **ISI Mark**, **Compulsory Registration Scheme (CRS)** and **Foreign Manufacturers Certification Scheme (FMCS)** to typical product families.",
    sections: [
      {
        heading: "Scheme comparison",
        body:
          "| Scheme | Typical products | Surveillance |\n| --- | --- | --- |\n| ISI Mark (Scheme I) | Cables, steel, tiles, appliances, toys, PPE | Factory inspection + testing |\n| CRS (Scheme II) | Electronics / IT under MeitY orders | Lab testing; no factory audit |\n| FMCS | Overseas factory supplying India | ISI path for foreign sites |\n\nSearch your SKU on [Certko Products](/products) or talk to a [BIS consultant](/blog/top-bis-certification-consultant-india).",
      },
    ],
    related: FOOTER_BIS,
  },
  {
    slug: "bis-certification-ceramic-tiles-is-15622-india",
    title: "BIS Certification for Ceramic Tiles (IS 15622) — ISI Mark & Export Readiness",
    excerpt:
      "Pressed ceramic and vitrified tiles under QCO need BIS ISI Mark under IS 15622. Factory testing, marking and what exporters should know.",
    meta_title: "BIS Certification Ceramic Tiles IS 15622 | Certko",
    meta_description:
      "BIS ISI Mark for ceramic tiles IS 15622. Testing, factory inspection, marking rules and export documentation for tile manufacturers.",
    bodyLead:
      "Ceramic tile manufacturers in Morbi, Gujarat and across India face **Quality Control Orders** aligning with **IS 15622**. BIS ISI Mark compliance is mandatory for notified varieties before legal sale — and increasingly requested in export tenders.",
    sections: [
      {
        heading: "Core IS 15622 test themes",
        body:
          "Dimensional accuracy, surface quality, water absorption, breaking strength, modulus of rupture and crazing resistance. Align in-house equipment with clauses BIS auditors expect before the factory visit. Pair with [lab testing guidance](/blog/ceramic-tiles-testing-is-15622-dimensions-strength-export).",
      },
    ],
    related: relatedLinks(
      "[Top BIS consultant India](/blog/top-bis-certification-consultant-india) · [Tiles testing IS 15622](/blog/ceramic-tiles-testing-is-15622-dimensions-strength-export) · [Export tiles checklist](/blog/export-tiles-testing-bis-iso-ce-compliance-checklist) · [BIS certification](/certifications/bis)"
    ),
  },
  {
    slug: "bis-certification-steel-products-isi-mark-qco-guide",
    title: "BIS Certification for Steel Products — ISI Mark & QCO Compliance",
    excerpt:
      "Rebar, structural steel and notified steel products fall under BIS ISI Mark schemes. Map IS standards, mill testing and QCO deadlines early.",
    meta_title: "BIS Certification Steel Products ISI Mark | Certko",
    meta_description:
      "BIS ISI Mark for steel products in India. QCO compliance, mill testing, marking and consultant support for manufacturers.",
    bodyLead:
      "Steel mills and rerollers operate under some of India's oldest and most enforced BIS schemes. Missing ISI Mark on notified grades blocks domestic sale and can disqualify you from infrastructure tenders.",
    sections: [
      {
        heading: "Mill readiness",
        body:
          "BIS expects consistent **heat chemistry**, **mechanical tests** and **marking traceability**. Build QCO calendars using our [deadline prep guide](/blog/qco-deadlines-how-to-prepare) — not just gazette dates.",
      },
    ],
    related: FOOTER_BIS,
  },
  {
    slug: "bis-certification-kitchen-appliances-india-standards",
    title: "BIS Certification for Kitchen Appliances in India — ISI Paths & Lab Booking",
    excerpt:
      "Mixer grinders, induction cooktops, gas stoves and small kitchen appliances: which IS standards and BIS schemes apply under current QCOs?",
    meta_title: "BIS Certification Kitchen Appliances India | Certko",
    meta_description:
      "BIS certification for kitchen appliances in India. ISI Mark testing, factory inspection and marketplace compliance for domestic appliances.",
    bodyLead:
      "Kitchen appliance brands face **ISI Mark** requirements on notified varieties — plus CRS on electronic sub-assemblies in some cases. Map the **complete SKU** (motor, cord set, electronic control) before booking labs.",
    sections: [
      {
        heading: "Common pitfalls",
        body:
          "Wrong **voltage rating** on test report, cord set not covered under IS 694, and incomplete **BIS marking artwork** delay grants. A [Delhi NCR or Mumbai consultant](/blog/bis-certification-consultant-mumbai) can shortlist labs with open slots.",
      },
    ],
    related: FOOTER_BIS,
  },

  // ── EN71 toys (2) ───────────────────────────────────────────────
  {
    slug: "en71-toy-safety-testing-global-export-markets",
    title: "EN 71 Toy Safety Testing for Global Markets — EU, UK & Beyond",
    excerpt:
      "Exporting toys to Europe and the UK? EN 71 Parts 1–3 (and beyond) are the baseline — separate from BIS IS 9873 for India domestic compliance.",
    meta_title: "EN71 Toy Safety Testing Global Export | Certko",
    meta_description:
      "EN 71 toy safety testing for export to EU, UK and global markets. Mechanical, flammability and migration testing explained.",
    bodyLead:
      "**EN 71** is the European harmonised toy safety standard family referenced under the EU Toy Safety Directive. Exporters often need **EN 71 test reports + Declaration of Conformity** even when they already hold [BIS toy certification for India](/blog/bis-toys-certification-import-india-faq).",
    sections: [
      {
        heading: "Key EN 71 parts",
        body:
          "| Part | Focus |\n| --- | --- |\n| EN 71-1 | Mechanical & physical (small parts, sharp edges, cords) |\n| EN 71-2 | Flammability |\n| EN 71-3 | Migration of 19 elements (paint, coatings, polymers) |\n| EN 71-4+ | Chemical toys, activity sets, trampolines (as applicable) |\n\nUKCA / CE marking routes still expect EN 71 evidence for Great Britain and EU destinations respectively (confirm current UK/EU transitional rules for your SKU).",
      },
    ],
    related: FOOTER_TOYS,
  },
  {
    slug: "en71-mechanical-physical-chemical-toy-testing-labs",
    title: "EN 71 Mechanical, Flammability & Chemical Testing — Lab Scope for Toy Exporters",
    excerpt:
      "Book the right EN 71 lab scope: mechanical torture tests, flame spread and heavy-metal migration are different chambers — plan sample quantities accordingly.",
    meta_title: "EN71 Mechanical Flammability Chemical Testing | Certko",
    meta_description:
      "EN 71-1, EN 71-2 and EN 71-3 toy testing scopes for exporters. Sample sizes, lab selection and report acceptance tips.",
    bodyLead:
      "Toy factories often underestimate **sample count** and **decoration variants** (each paint colour may need EN 71-3). Scope labs via [Testing](/testing) and bundle with [RoHS on electronic toys](/blog/rohs-testing-not-certification-compliance-guide) where applicable.",
    sections: [
      {
        heading: "Sample planning",
        body:
          "Provide **BOM**, **material declarations** and **target age grade** upfront. Labs cannot guess whether your plush toy is 0+ or 3+ — the mechanical test programme changes.",
      },
    ],
    related: FOOTER_TOYS,
  },

  // ── RoHS (3) ────────────────────────────────────────────────────
  {
    slug: "rohs-testing-not-certification-compliance-guide",
    title: "RoHS Testing Is Not Certification — Product Testing & Conformity Explained",
    excerpt:
      "RoHS is not a certificate you buy — it is restricted-substance testing plus a Declaration of Conformity. Learn what EU buyers actually accept.",
    meta_title: "RoHS Testing Not Certification | Compliance Guide | Certko",
    meta_description:
      "RoHS is testing and conformity of compliance — not a RoHS certificate. IEC 62321 testing, DoC and what EU importers expect from exporters.",
    bodyLead:
      "Search agencies advertise **RoHS certification** — but legally there is **no RoHS certificate** issued by a government body. RoHS (EU Directive 2011/65/EU) is met through **substance testing** (often IEC 62321 series), **technical documentation** and the manufacturer's **EU Declaration of Conformity (DoC)** — usually signed by the EU importer or authorised representative.",
    sections: [
      {
        heading: "What RoHS actually requires",
        body:
          "Restrict **10 substances** (lead, mercury, cadmium, hexavalent chromium, PBB, PBDE, plus four phthalates under RoHS 3). Demonstrate compliance via **test reports** at homogeneous material level or robust **supplier declarations** backed by spot testing.",
      },
      {
        heading: "RoHS vs a 'certificate'",
        body:
          "| Myth | Reality |\n| --- | --- |\n| 'We need RoHS certification' | You need **valid test evidence + DoC** for CE-marked EEE |\n| 'Lab logo PDF = RoHS approved' | Labs issue **test reports**, not legal RoHS grants |\n| 'One test covers all SKUs' | Each material / colour / supplier change can invalidate scope |\n\nPair RoHS testing with [EU CE export requirements](/blog/export-to-eu-ce-marking-certification-requirements-faq).",
      },
    ],
    faqs: [
      {
        q: "Can Certko issue RoHS certification?",
        a: "**No** — and neither can a lab in the legal sense. We coordinate **RoHS substance testing** and help you assemble **conformity documentation**; the **DoC** remains the manufacturer's/importer's legal statement.",
      },
    ],
    related: FOOTER_ROHS,
  },
  {
    slug: "rohs-substance-restriction-testing-conformity-declaration",
    title: "RoHS Substance Testing & Declaration of Conformity — Exporter Checklist",
    excerpt:
      "Practical RoHS testing workflow: homogenisation, XRF screening, confirmatory chemistry, and how to support your EU buyer's Declaration of Conformity.",
    meta_title: "RoHS Substance Testing & DoC | Exporter Checklist | Certko",
    meta_description:
      "RoHS substance testing workflow and Declaration of Conformity support for exporters. XRF, ICP-OES and documentation checklist.",
    bodyLead:
      "EU importers ask for **RoHS test reports** that match the **exact BOM** shipping today — not a report from an old supplier lot. Build a conformity folder your buyer can attach to their **CE technical file**.",
    sections: [
      {
        heading: "Testing workflow",
        body:
          "1. **XRF screening** on homogeneous materials.\n2. **Confirmatory chemistry** (ICP-OES / GC-MS for phthalates) where screening fails.\n3. **Supplier material declarations** with CAS-level detail.\n4. **Change-control**: re-test when plating, solder or PVC supplier switches.\n\nSee [heavy metals / chemical testing](/blog/chemical-testing-heavy-metals-product-compliance-faq) for overlap with REACH SVHC.",
      },
    ],
    related: FOOTER_ROHS,
  },
  {
    slug: "rohs-vs-reach-product-chemical-testing-export",
    title: "RoHS vs REACH for Export Products — Chemical Testing & Compliance Boundaries",
    excerpt:
      "RoHS restricts specific substances in EEE; REACH governs SVHC in articles. Exporters to Europe often need clarity on both — neither is a single certificate.",
    meta_title: "RoHS vs REACH Product Testing Export | Certko",
    meta_description:
      "RoHS vs REACH explained for exporters. Chemical testing, SVHC, substance restrictions and conformity documentation — not certification.",
    bodyLead:
      "**RoHS** applies to electrical and electronic equipment categories. **REACH** governs registration, evaluation and restriction of chemicals — including **SVHC** obligations in articles. Large retailers may ask for both evidence sets.",
    sections: [
      {
        heading: "Quick boundary guide",
        body:
          "- **RoHS** — 10 restricted substances in EEE; test to IEC 62321.\n- **REACH SVHC** — candidate list substances in articles >0.1% w/w; SCIP database duties sit with EU actors.\n- **Neither replaces CE LVD/EMC** — see [CE EMC LVD FAQ](/blog/ce-emc-lvd-export-europe-product-faq).",
      },
    ],
    related: FOOTER_ROHS,
  },

  // ── BIS consultants — cities (8) ──────────────────────────────
  {
    slug: "bis-certification-consultant-vadodara-gujarat",
    title: "Top BIS Certification Consultant in Vadodara, Gujarat | ISI, CRS & FMCS",
    excerpt:
      "Vadodara manufacturers in chemicals, engineering, pharma equipment and plastics trust Certko for BIS ISI Mark, CRS and FMCS coordination — free quote in 24 hours.",
    meta_title: "BIS Consultant Vadodara Gujarat | Certko",
    meta_description:
      "Top BIS certification consultant in Vadodara for ISI Mark, CRS, FMCS, lab booking and QCO readiness. Serving Gujarat industrial belts.",
    bodyLead:
      "**Vadodara (Baroda)** anchors eastern Gujarat's industrial corridor — chemicals, engineering goods, electrical equipment and pharma machinery. When a QCO hits, factories need a **BIS consultant who knows local lab slots** and BIS documentation quirks.",
    sections: [
      {
        heading: "Vadodara clusters we support",
        body:
          "Makarpura GIDC, Waghodia, Halol-adjacent supply chains and OEM vendors feeding Ahmedabad / Morbi exports. Pair BIS with [MSDS for chemical exports](/blog/msds-authoring-fragrance-oils-aromatic-chemicals-export) where formulations apply.",
      },
    ],
    related: FOOTER_BIS + " · [Ahmedabad consultant](/blog/bis-certification-consultant-ahmedabad)",
  },
  {
    slug: "bis-certification-consultant-kalyan-mmr-maharashtra",
    title: "Top BIS Certification Consultant in Kalyan & Mumbai MMR | ISI & CRS Help",
    excerpt:
      "Kalyan and Mumbai Metropolitan Region manufacturers: Certko runs BIS files for cables, appliances, electronics and notified engineering products.",
    meta_title: "BIS Consultant Kalyan Mumbai MMR | Certko",
    meta_description:
      "BIS certification consultant for Kalyan, Dombivli and Mumbai MMR. ISI Mark, CRS registration, lab coordination and marketplace compliance.",
    bodyLead:
      "**Kalyan–Dombivli** and the wider **Mumbai MMR** host thousands of SME factories supplying India and export markets. BIS delays here usually trace to **wrong standard mapping** or **late lab booking** — not factory quality.",
    sections: [
      {
        heading: "Local tip",
        body:
          "Electronics importers in Bhiwandi warehouses often need **CRS + WPC ETA** together. Coordinate both before goods hit customs. See [Mumbai BIS consultant hub](/blog/bis-certification-consultant-mumbai) for the regional overview.",
      },
    ],
    related: FOOTER_BIS,
  },
  {
    slug: "bis-certification-consultant-tamil-nadu-manufacturers",
    title: "Top BIS Certification Consultant for Tamil Nadu Manufacturers | Chennai & Coimbatore",
    excerpt:
      "Tamil Nadu pumps, motors, textiles machinery and components exporters: statewide BIS ISI Mark and CRS support from Certko.",
    meta_title: "BIS Consultant Tamil Nadu | Certko",
    meta_description:
      "BIS certification consultant for Tamil Nadu manufacturers. Chennai, Coimbatore, Salem industrial belts — ISI Mark, CRS and QCO readiness.",
    bodyLead:
      "Beyond [Chennai](/blog/bis-certification-consultant-chennai) and [Coimbatore](/blog/bis-certification-consultant-coimbatore), Tamil Nadu's component suppliers often miss BIS scope on **sub-assemblies** (motors, cord sets, control panels). We map the full BOM.",
    sections: [
      {
        heading: "Tamil Nadu industries",
        body:
          "Pumps & wet grinders, textile machinery, automotive tier-2, renewable components. Align **BIS + EN 71 / RoHS** when exporting toys or electronics from the same campus.",
      },
    ],
    related: FOOTER_BIS,
  },
  {
    slug: "bis-certification-consultant-kerala-exporters",
    title: "Top BIS Certification Consultant in Kerala | Cochin, Kozhikode & Trivandrum Exporters",
    excerpt:
      "Kerala seafood equipment, rubber, coir and electronics exporters: BIS ISI Mark and CRS coordination with realistic lab timelines.",
    meta_title: "BIS Consultant Kerala | Certko",
    meta_description:
      "BIS certification consultant in Kerala for exporters and manufacturers. Cochin, Kozhikode, Thiruvananthapuram — ISI Mark and CRS help.",
    bodyLead:
      "Kerala's export economy mixes **marine processing equipment**, **coir / rubber products**, **spices machinery** and growing **electronics assembly**. BIS applies when QCOs cover your HS description — not when you assume 'agricultural exemption'.",
    sections: [
      {
        heading: "Export + domestic dual track",
        body:
          "Factories supplying **Gulf retail** and **domestic India** need one BIS grant that satisfies marketplace audits. Plan [nutrition label testing](/blog/food-nutrition-testing-label-claims-fssai-export) separately for food SKUs.",
      },
    ],
    related: FOOTER_BIS,
  },
  {
    slug: "bis-consultant-mumbai-electronics-crs-qco-help",
    title: "BIS Consultant in Mumbai for Electronics & CRS Registration — QCO Readiness",
    excerpt:
      "Mumbai importers and brand owners: specialised CRS registration support for MeitY-notified electronics — beyond generic consultancy slides.",
    meta_title: "BIS CRS Consultant Mumbai Electronics | Certko",
    meta_description:
      "Mumbai BIS CRS consultant for electronics importers. MeitY orders, lab reports, BIS registration numbers for marketplaces.",
    bodyLead:
      "Mumbai is India's largest **electronics import hub**. CRS registration under MeitY orders is lab-driven — but applications fail on **label artwork**, **series definition** and **test report mismatches**. We fix the file, not just forward PDFs.",
    sections: [
      {
        heading: "CRS + WPC combo",
        body:
          "Wireless SKUs need [WPC ETA](/blog/wpc-certification-bluetooth-wifi-products-india-guide) **and** CRS where applicable. Run both tracks in parallel to protect launch dates.",
      },
    ],
    related: FOOTER_BIS + " · [Mumbai hub](/blog/bis-certification-consultant-mumbai)",
  },
  {
    slug: "bis-consultant-delhi-ncr-marketplace-cables-appliances",
    title: "BIS Consultant in Delhi NCR for Cables, Appliances & Marketplace Compliance",
    excerpt:
      "Delhi NCR manufacturers and Amazon / Flipkart sellers: ISI Mark for cables and appliances, CRS for electronics — avoid delisting with correct BIS numbers.",
    meta_title: "BIS Consultant Delhi NCR Cables Appliances | Certko",
    meta_description:
      "Delhi NCR BIS consultant for cables IS 694, appliances and marketplace compliance. ISI Mark, CRS and QCO deadline support.",
    bodyLead:
      "NCR factories and traders face aggressive **marketplace BIS enforcement**. Listing a **BIS registration number** that does not match the live model is an automatic delist risk.",
    sections: [
      {
        heading: "High-enforcement categories in NCR",
        body:
          "PVC cables ([IS 694 FAQ](/blog/bis-certification-pvc-cables-is-694-faq)), room heaters, immersion rods, LED luminaires ([IS 10322 FAQ](/blog/bis-led-luminaires-is-10322-certification-faq)). Book labs before QCO panic sets in.",
      },
    ],
    related: FOOTER_BIS + " · [Delhi NCR hub](/blog/bis-certification-consultant-delhi-ncr)",
  },
  {
    slug: "bis-consultant-ahmedabad-ceramics-chemicals-bis",
    title: "BIS Consultant in Ahmedabad for Ceramics, Chemicals & Engineering Products",
    excerpt:
      "Ahmedabad and Gujarat SME exporters: BIS for tiles, chemicals, plastics and engineering goods — plus MSDS for export lines.",
    meta_title: "BIS Consultant Ahmedabad Ceramics Chemicals | Certko",
    meta_description:
      "Ahmedabad BIS certification consultant for ceramics, chemicals and engineering products. ISI Mark, FMCS and export readiness.",
    bodyLead:
      "Ahmedabad traders feed **Morbi tile** exports, **chemical formulations** and **plastic moulding** clusters. Compliance is rarely single-scheme: expect **BIS + MSDS + RoHS** questions in the same buyer email.",
    sections: [
      {
        heading: "Integrated compliance",
        body:
          "Link [BIS tiles IS 15622](/blog/bis-certification-ceramic-tiles-is-15622-india) with [tile export testing](/blog/export-tiles-testing-bis-iso-ce-compliance-checklist) and [adhesive MSDS](/blog/msds-safety-data-sheet-tile-adhesive-grout-export) in one project plan.",
      },
    ],
    related: FOOTER_BIS + " · [Ahmedabad hub](/blog/bis-certification-consultant-ahmedabad)",
  },
  {
    slug: "bis-consultant-chennai-automotive-pumps-bis",
    title: "BIS Consultant in Chennai for Automotive Components & Pumps | ISI Mark Help",
    excerpt:
      "Chennai automotive tier-2 and pump manufacturers: map BIS ISI requirements on components before OEM audits or export tenders ask.",
    meta_title: "BIS Consultant Chennai Automotive Pumps | Certko",
    meta_description:
      "Chennai BIS consultant for automotive components, pumps and industrial equipment. ISI Mark testing and documentation.",
    bodyLead:
      "Chennai's industrial belt supplies **OEM automotive**, **pressure pumps** and **fabricated assemblies**. Component makers often discover BIS scope late — when the OEM sends a QCO compliance matrix.",
    sections: [
      {
        heading: "Component-level scoping",
        body:
          "Motors, capacitors, cord sets and control boxes each carry their own IS references. We map **parent machine vs child component** obligations before you commit to a lab quote.",
      },
    ],
    related: FOOTER_BIS + " · [Chennai hub](/blog/bis-certification-consultant-chennai) · [Tamil Nadu](/blog/bis-certification-consultant-tamil-nadu-manufacturers)",
  },

  // ── Tiles testing (3) ───────────────────────────────────────────
  {
    slug: "ceramic-tiles-testing-is-15622-dimensions-strength-export",
    title: "Ceramic Tiles Testing to IS 15622 — Dimensions, Strength & Export Quality Labs",
    excerpt:
      "IS 15622 type testing for pressed ceramic tiles: dimensions, water absorption, breaking strength and surface quality — for BIS and export buyer acceptance.",
    meta_title: "Ceramic Tiles Testing IS 15622 | Export Labs | Certko",
    meta_description:
      "Ceramic tile testing IS 15622 for dimensions, strength and water absorption. BIS labs and export buyer report packages.",
    bodyLead:
      "Whether you pursue **BIS ISI Mark** or an overseas distributor audit, **IS 15622** is the anchor standard for pressed ceramic tiles in India. Export buyers in the Gulf and Africa often accept BIS-recognised reports plus ISO 13006 alignment.",
    sections: [
      {
        heading: "Critical tests",
        body:
          "| Parameter | Why buyers care |\n| --- | --- |\n| Dimensional / surface flatness | Installability on large façades |\n| Water absorption | Porcelain vs ceramic classification |\n| Breaking strength / MOR | Logistics breakage & durability claims |\n| Crazing / glaze quality | Warranty returns |\n\nCoordinate with [BIS certification](/blog/bis-certification-ceramic-tiles-is-15622-india) early.",
      },
    ],
    related: FOOTER_TILES,
  },
  {
    slug: "glazed-ceramic-tiles-testing-chemical-resistance-export-labs",
    title: "Glazed Ceramic Tiles Testing — Chemical Resistance & Export Lab Packages",
    excerpt:
      "Glazed tile exporters: chemical resistance, stain resistance and ISO 10545-aligned tests beyond basic dimension checks.",
    meta_title: "Glazed Ceramic Tiles Testing Chemical Resistance | Certko",
    meta_description:
      "Glazed ceramic tile testing for chemical resistance and export quality. ISO 10545, IS 13630 angles and lab booking.",
    bodyLead:
      "Project buyers specify **chemical resistance** (acids, alkalis, household stains) — not just **size grade**. IS 13630 and ISO 10545 families cover glazed tile performance; scope the right parts before cutting production samples.",
    sections: [
      {
        heading: "Sample selection",
        body:
          "Send **production-line tiles**, not hand-picked showroom pieces. Include **batch code** and **glaze ID** on the test request form — importers match reports to containers.",
      },
    ],
    related: FOOTER_TILES,
  },
  {
    slug: "export-tiles-testing-bis-iso-ce-compliance-checklist",
    title: "Export Tiles Testing Checklist — BIS, ISO & CE Marketing Claims",
    excerpt:
      "Exporting tiles to EU, GCC and Africa? Combine BIS/ISO test evidence, correct marketing claims and adhesive MSDS in one compliance folder.",
    meta_title: "Export Tiles Testing Checklist BIS ISO CE | Certko",
    meta_description:
      "Export tile testing checklist: BIS IS 15622, ISO 13006, CE documentation and buyer audit preparation for tile exporters.",
    bodyLead:
      "Tile exporters lose POs when **test reports**, **packaging claims** and **SDS for adhesives** disagree. Use this checklist before the buyer's third-party audit.",
    sections: [
      {
        heading: "Export folder contents",
        body:
          "1. IS 15622 / ISO 10545 test reports.\n2. **BIS licence copy** (if selling into India or cited in tender).\n3. [MSDS for grout/adhesive](/blog/msds-export-ceramic-tiles-adhesives-coatings-sds).\n4. **Radiation / lead** declarations where destination requires.\n5. **Packing list ↔ batch traceability** matrix.",
      },
    ],
    related: FOOTER_TILES,
  },

  // ── Nutrition / food testing (2) ────────────────────────────────
  {
    slug: "food-nutrition-testing-label-claims-fssai-export",
    title: "Food Nutrition Testing & Label Claims — FSSAI Rules for Export from India",
    excerpt:
      "Packaged food exporters must match nutrition panel values to lab results — FSSAI labelling rules and destination-market overlays for EU/US/GCC.",
    meta_title: "Food Nutrition Testing Label Claims FSSAI | Certko",
    meta_description:
      "Nutrition testing and label claim verification for packaged foods. FSSAI compliance and export market labelling overlays.",
    bodyLead:
      "Your **nutrition facts panel** is a legal claim. FSSAI (Food Safety and Standards Authority of India) expects **Energy, Protein, Carbohydrate, Total Sugars, Added Sugars, Fat, Saturated Fat, Trans Fat and Sodium** to reflect validated values — not spreadsheet guesses.",
    sections: [
      {
        heading: "Testing vs label",
        body:
          "Proximate analysis (protein, fat, moisture, ash), ** carbohydrate by difference**, fatty acid profile for saturated/trans claims, and **ICP** for sodium. Mismatch between label and lab report triggers recall risk in regulated markets.",
      },
      {
        heading: "Export overlays",
        body:
          "EU **FIC Regulation** and US **FDA Nutrition Facts** use different rounding rules — one FSSAI-compliant panel may need **market-specific recalculation** even when the underlying lab data is the same.",
      },
    ],
    related: FOOTER_FOOD,
  },
  {
    slug: "nutritional-value-testing-packaged-foods-lab-verification",
    title: "Nutritional Value Testing of Packaged Foods — Lab Methods & Sample Planning",
    excerpt:
      "How NABL labs verify protein, fat, carbs, sugars and micronutrients — sample size, method references and using results on-pack.",
    meta_title: "Nutritional Value Testing Packaged Foods | Certko",
    meta_description:
      "Nutritional value testing for packaged foods in India. Lab methods, sample planning and on-pack label verification.",
    bodyLead:
      "Brands launching **snacks**, **health mixes**, ** beverages** or **supplements** need repeatable nutrition data for **FSSAI licensing**, **export health certificates** and retailer QA.",
    sections: [
      {
        heading: "Common methods",
        body:
          "| Nutrient | Typical method |\n| --- | --- |\n| Protein | Kjeldahl / Dumas |\n| Fat | Soxhlet / extraction |\n| Moisture | Oven drying |\n| Sodium | ICP-OES / AAS |\n| Sugars | HPLC |\n| Vitamins | HPLC / microbiological (SKU-specific) |\n\nRetest when **recipe, supplier or process** changes — old reports do not grandfather new batches.",
      },
    ],
    related: FOOTER_FOOD,
  },

  // ── Additives / polymers testing (2) ────────────────────────────
  {
    slug: "plastic-additives-phthalates-heavy-metals-testing-export",
    title: "Testing of Plastic Additives & Polymers — Phthalates, Heavy Metals & Export Compliance",
    excerpt:
      "Plastic additives (plasticisers, stabilisers, flame retardants) need chemical testing for RoHS, REACH and buyer restricted-substance lists — not a standalone certificate.",
    meta_title: "Plastic Additives Testing Export | Phthalates Heavy Metals | Certko",
    meta_description:
      "Testing plastic additives and polymers for phthalates, heavy metals and restricted substances. RoHS, REACH and buyer compliance support.",
    bodyLead:
      "Buyers ask for **additive testing** on PVC, soft plastics, inks and polymer parts — especially **phthalates (DEHP, DBP, BBP, DIBP)**, **heavy metals** and **brominated flame retardants**. This is **laboratory testing and conformity documentation**, overlapping [RoHS](/blog/rohs-testing-not-certification-compliance-guide) and [REACH SVHC](/blog/rohs-vs-reach-product-chemical-testing-export) — not a generic 'ADDPM certificate'.",
    sections: [
      {
        heading: "When additive testing is triggered",
        body:
          "- **Toy and childcare articles** — EN 71-3 + phthalates.\n- **Food-contact plastics** — migration and specific migration limits (separate from RoHS).\n- **EEE housings and cables** — RoHS substance restrictions.\n- **Retail RSL audits** — ZDHC, brand-specific banned substance lists.",
      },
      {
        heading: "Homogeneous material rule",
        body:
          "Labs need **disassembled materials** — a green PVC jacket and black HDPE inner insulation are separate tests. Provide **CAS-level BOM** to avoid repeated destructive sampling.",
      },
    ],
    related: FOOTER_ROHS + " · [Chemical testing FAQ](/blog/chemical-testing-heavy-metals-product-compliance-faq)",
  },
];

export function ensureComplianceBlogPosts(db: SqliteDatabase) {
  const author = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (!author) return;

  const posts: SeedBlogPostInput[] = COMPLIANCE_BLOG_DEFS.map((def, index) => ({
    slug: def.slug,
    title: def.title,
    excerpt: def.excerpt,
    content: buildContent(def),
    image: "",
    published_at: `2026-08-${String(20 + Math.floor(index / 3)).padStart(2, "0")}`,
    meta_title: def.meta_title,
    meta_description: def.meta_description,
    status: "draft",
  }));

  insertBlogPostsIfMissing(db, posts, author);
}
