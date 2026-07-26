export interface CertSeed {
  slug: string;
  name: string;
  full_name: string;
  region: string;
  icon: string;
  summary: string;
  content: string;
  faqs: { question: string; answer: string }[];
}

export const CERTIFICATIONS: CertSeed[] = [
  {
    slug: "bis",
    name: "BIS / ISI Mark",
    full_name: "Bureau of Indian Standards Certification",
    region: "India",
    icon: "shield",
    summary:
      "India's core product certification — the ISI mark licence (Scheme I) and CRS registration (Scheme II) for products notified under Quality Control Orders.",
    content: `## What it covers

BIS certification is administered by the Bureau of Indian Standards and applies to hundreds of notified products — from cement, steel and cables to appliances, toys and footwear. It comes in three main flavours:

- **ISI Mark (Scheme I)** — testing plus factory inspection; required for most industrial and consumer products under QCOs.
- **CRS (Scheme II)** — lab-test-based registration for electronics and IT products.
- **FMCS** — the Foreign Manufacturers Certification Scheme, the ISI route for factories outside India.

## When it is mandatory

Whenever a Quality Control Order covering your product is in force. Use our product database to check your product's QCO status instantly — every product page shows whether certification is mandatory, upcoming or voluntary.

## Typical process

1. Map the product to its Indian Standard (IS).
2. Prepare the application and technical file.
3. Sample testing at a BIS-recognised laboratory.
4. Factory inspection (ISI/FMCS routes).
5. Grant of licence, followed by annual marking fees and surveillance.

## Cost drivers

Laboratory testing charges (the largest variable — compare labs in our directory), BIS application and licence fees, annual marking fees by unit size, and consultant fees if you outsource the paperwork.`,
    faqs: [
      {
        question: "How do I know if my product needs ISI or CRS?",
        answer:
          "It depends on the notifying order. Electronics and IT products under MeitY orders follow CRS; most other products follow the ISI mark route. Every product page on Certko shows the applicable scheme.",
      },
      {
        question: "How long is a BIS licence valid?",
        answer:
          "Licences are typically granted for one to two years and renewed thereafter, subject to surveillance, marking-fee payment and continued conformity of production.",
      },
      {
        question: "Can a foreign factory get the ISI mark?",
        answer:
          "Yes, through the Foreign Manufacturers Certification Scheme (FMCS). The factory is inspected abroad, and an Authorised Indian Representative (AIR) must be appointed in India.",
      },
    ],
  },
  {
    slug: "bee",
    name: "BEE Star Rating",
    full_name: "Bureau of Energy Efficiency Star Labelling",
    region: "India",
    icon: "zap",
    summary:
      "Mandatory energy-efficiency star labels for appliances such as air conditioners, refrigerators, fans and water heaters sold in India.",
    content: `## What it covers

The Bureau of Energy Efficiency runs India's Standards & Labelling programme. Appliances in the mandatory list — room air conditioners, frost-free refrigerators, ceiling fans, water heaters, TVs and more — must carry a star label (1 to 5 stars) indicating energy efficiency before they can be sold.

## How it works

1. Register your brand with BEE.
2. Test each model at a NABL-accredited laboratory against the relevant IS/IEC test method.
3. Submit test reports and label artwork through the BEE portal.
4. Pay model registration fees and apply the label to every unit.

## Key things to plan for

- **Star levels are re-based periodically** — a model's star rating can drop when tables are revised, requiring re-registration.
- **Model-level registration** — every model and significant variant needs its own registration.
- **Works alongside BIS** — many appliances need both BIS certification (safety) and a BEE label (efficiency).`,
    faqs: [
      {
        question: "Is the BEE star label mandatory for my appliance?",
        answer:
          "It is mandatory for categories in BEE's compulsory list, such as room ACs, frost-free refrigerators, TVs and ceiling fans. Other categories are voluntary but the label is often expected by retailers.",
      },
      {
        question: "Do I need BIS certification and a BEE label?",
        answer:
          "Frequently yes — BIS covers product safety and the BEE label covers energy efficiency. They are separate registrations with separate testing.",
      },
      {
        question: "How long does BEE registration take?",
        answer:
          "Typically 4-8 weeks per model once test reports are ready: lab testing is the main variable, followed by portal approval.",
      },
    ],
  },
  {
    slug: "g-mark",
    name: "GMARK",
    full_name: "Gulf Conformity Mark (GSO G Mark)",
    region: "GCC / Middle East",
    icon: "globe",
    summary:
      "Gulf Conformity Mark (GMARK) for regulated products across GCC states — low-voltage appliances, electrical accessories, children's toys and water-conservation products under GSO technical regulations.",
    content: `## What is GMARK?

**GMARK** (also written G Mark) is the Gulf Conformity Mark operated under the Gulf Standardization Organization (GSO). It shows that a regulated product meets the applicable Gulf technical regulations and can circulate in GSO member states — Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman and Yemen.

## Product categories covered

GMARK currently focuses on:

- **Low-voltage electrical equipment & appliances** — refrigerators, washers, cookers, personal care, HVAC, fans, heaters, chargers and more (mainly IEC 60335 series)
- **Electrical accessories** — plugs, sockets, extension cords and travel adaptors (IEC 60884 series)
- **Children's toys** — ISO 8124 / EN 71 / IEC 62115
- **Water-conservation products** — taps, shower heads, flow regulators and flush valves under applicable GSO water standards

Browse the full category matrix on this page for main standards plus typical EMC, IECEE CB and GSO Notified Body requirements.

## How certification works

1. Map your product to the correct GSO technical regulation and main standard(s).
2. Complete safety (and EMC where required) testing at a recognised laboratory — IECEE CB reports are often reusable.
3. Obtain a **Gulf Type Examination Certificate** from a **GSO Notified Body**.
4. Affix the GMARK, issue the declaration of conformity, and keep technical documentation ready for market surveillance.

## Why Indian exporters care

If you ship appliances, toys or electrical accessories to the Gulf, GMARK is often the single mark that unlocks customs clearance across GCC markets. Manufacturers already testing to IEC/CB for BIS or export programmes can usually shorten the GMARK path by reusing recent reports — cutting duplicate lab cost and timeline.`,
    faqs: [
      {
        question: "Which products need GMARK?",
        answer:
          "GMARK applies to regulated Gulf categories such as low-voltage household and personal-care appliances, selected electrical accessories, children's toys, and certain water-conservation products. Use the category matrix on this page to check the typical standard and Notified Body route for your product family.",
      },
      {
        question: "Can I reuse IECEE CB or existing IEC test reports?",
        answer:
          "Often yes. Many GMARK appliance categories accept IECEE CB / IEC evidence for the main standard (and EMC where applicable), which can reduce retesting. Accessories, toys and water products may follow different evidence rules — a GSO Notified Body confirms the exact file.",
      },
      {
        question: "Is one GMARK certificate valid across all GCC countries?",
        answer:
          "Yes. A Gulf Type Examination Certificate issued by a GSO Notified Body supports circulation of the marked product across GSO member states, subject to national customs and labelling rules.",
      },
      {
        question: "Is GMARK the same as SABER?",
        answer:
          "No. GMARK is the Gulf-wide conformity mark under GSO regulations. SABER is Saudi Arabia's product-registration and shipment-approval platform and can apply to a wider Saudi product list. Some shipments need both.",
      },
    ],
  },
  {
    slug: "fcc",
    name: "FCC",
    full_name: "Federal Communications Commission Authorization",
    region: "United States",
    icon: "cpu",
    summary:
      "US radio-frequency compliance for electronics — mandatory for any device that emits RF energy, from Bluetooth gadgets to Wi-Fi routers, sold in the USA.",
    content: `## What it covers

The FCC regulates electromagnetic emissions of electronic products sold in the United States. Any device that can emit radio-frequency energy falls in scope:

- **Intentional radiators** — Wi-Fi, Bluetooth, cellular, RFID devices → **FCC Certification** through a Telecommunication Certification Body (TCB).
- **Unintentional radiators** — ordinary digital electronics → **Supplier's Declaration of Conformity (SDoC)**.

## How it works

1. Determine the rule part (e.g. Part 15) and the authorization route (Certification vs SDoC).
2. Test at an FCC-recognised accredited laboratory.
3. For certification: file through a TCB and obtain an FCC ID; for SDoC: keep the test report and compliance statement on file.
4. Label the product with the FCC marking/ID.

## Why Indian exporters care

Electronics exporters to the US must handle FCC before shipment — marketplaces and importers routinely ask for FCC IDs or SDoC documentation.`,
    faqs: [
      {
        question: "Does my product need FCC certification or just SDoC?",
        answer:
          "If it transmits deliberately (Wi-Fi, Bluetooth, cellular), it needs full certification with an FCC ID through a TCB. If it only emits incidental RF (like most digital electronics), SDoC is usually sufficient.",
      },
      {
        question: "Is FCC related to BIS?",
        answer:
          "No — they are independent. FCC covers the US market's RF rules, while BIS covers India. Export-oriented manufacturers often run both programmes in parallel on the same product.",
      },
      {
        question: "How long does FCC certification take?",
        answer:
          "Typically 3-6 weeks: RF testing takes one to three weeks depending on radios, and TCB review usually completes within another one to two weeks.",
      },
    ],
  },
  {
    slug: "ce",
    name: "CE Marking",
    full_name: "European Conformity Marking",
    region: "European Union",
    icon: "flag",
    summary:
      "The EU's mandatory conformity mark covering safety, health and environmental requirements for products sold in the European Economic Area.",
    content: `## What it covers

CE marking declares that a product meets all applicable EU directives and regulations — such as the Low Voltage Directive, EMC Directive, Toy Safety Directive, Machinery Regulation or Medical Device Regulation. It is mandatory for in-scope products sold anywhere in the European Economic Area.

## How it works

1. Identify every directive/regulation that applies to the product.
2. Test against the harmonised EN standards.
3. Compile the technical file and risk assessment.
4. For higher-risk products, involve an EU Notified Body.
5. Sign the EU Declaration of Conformity and affix the CE mark.

## Why Indian exporters care

CE is the gateway to the EU's single market. An EU Authorised Representative and correct labelling are required, and customs authorities actively check documentation.`,
    faqs: [
      {
        question: "Is CE marking self-declared?",
        answer:
          "For many product families, yes — the manufacturer tests, compiles the technical file and self-declares. Higher-risk categories (certain machinery, medical devices, some PPE) require a Notified Body assessment.",
      },
      {
        question: "Do I need an EU representative?",
        answer:
          "Manufacturers outside the EU need an EU-based Authorised Representative or responsible person whose details appear on the product or packaging.",
      },
    ],
  },
  {
    slug: "saber",
    name: "SABER",
    full_name: "Saudi Product Safety Programme (SALEEM/SABER)",
    region: "Saudi Arabia",
    icon: "clipboard",
    summary:
      "Saudi Arabia's mandatory conformity platform — every regulated product needs SABER Product and Shipment Certificates of Conformity before customs clearance.",
    content: `## What it covers

SABER is the online platform of the Saudi Standards, Metrology and Quality Organization (SASO) under the SALEEM product-safety programme. Almost every regulated consumer product imported into Saudi Arabia — electronics, appliances, toys, auto parts, building materials, textiles, cosmetics containers and more — must be registered on SABER before shipment.

## The two certificates

- **Product Certificate of Conformity (PCoC)** — issued once per product (valid one year) after assessment against the applicable Saudi technical regulation by a SASO-approved certification body.
- **Shipment Certificate of Conformity (SCoC)** — issued per consignment against the active PCoC; customs will not clear the shipment without it.

## How it works

1. Classify the product by HS code on SABER to identify the applicable technical regulation.
2. Appoint a SASO-approved certification body through the platform.
3. Submit test reports (IEC/ISO-based reports are commonly accepted) and product documentation.
4. Receive the PCoC, then request an SCoC for each shipment.

## Why Indian exporters care

Saudi Arabia is a major destination for Indian appliances, cables, auto components and building products. SABER registration is transactional and deadline-driven — a missing SCoC strands containers at Dammam or Jeddah. Certko coordinates the certification body, testing and platform filings so your PCoC is ready before production ships.`,
    faqs: [
      {
        question: "Is SABER the same as the G Mark?",
        answer:
          "No. The G Mark is a Gulf-wide conformity mark for toys and low-voltage electricals under GSO regulations, while SABER is Saudi Arabia's own platform covering a much wider product range. Some products need both: the G Mark for the GCC regulation and SABER registration for Saudi customs.",
      },
      {
        question: "How long is a SABER certificate valid?",
        answer:
          "The Product CoC is typically valid for one year and must be renewed. The Shipment CoC is per consignment — you request a new one for every shipment against the active Product CoC.",
      },
      {
        question: "Can I use my existing test reports for SABER?",
        answer:
          "Usually yes. SASO technical regulations reference IEC/ISO standards, so recent accredited test reports (for example from CB-scheme testing) are commonly accepted by the certification bodies, which cuts both cost and lead time.",
      },
    ],
  },
  {
    slug: "wpc-eta",
    name: "WPC / ETA",
    full_name: "Wireless Planning & Coordination — Equipment Type Approval",
    region: "India",
    icon: "bell",
    summary:
      "Mandatory Indian approval for wireless devices — Bluetooth, Wi-Fi and other licence-exempt radio equipment need an ETA before import or sale.",
    content: `## What it covers

The WPC wing of India's Department of Telecommunications approves radio-frequency devices. Any product with a wireless module — Bluetooth earphones, Wi-Fi routers, drones, IoT sensors — needs an **Equipment Type Approval (ETA)** if it operates in licence-exempt (de-licensed) bands.

## How it works

1. Confirm the operating frequencies are in India's de-licensed bands (e.g. 2.4 GHz, 5 GHz).
2. Obtain an RF test report (accredited lab; overseas reports accepted).
3. Apply for ETA on the Saral Sanchar portal with the test report and technical details.
4. Receive the ETA certificate — required at customs for import.

## Works alongside BIS

Wireless consumer electronics typically need **both** BIS/CRS registration (product safety) and WPC ETA (radio approval), plus sometimes EPR registration for e-waste. Certko handles all three together.`,
    faqs: [
      {
        question: "My device uses plain Bluetooth — do I still need ETA?",
        answer:
          "Yes. Bluetooth operates in the 2.4 GHz de-licensed band, which requires an ETA (now largely self-declaration based for common modules) before import or sale.",
      },
      {
        question: "Can I use the module maker's ETA?",
        answer:
          "If the approved module is used unmodified, its ETA can often be referenced; end-product level requirements still apply in some cases. We review this case by case.",
      },
    ],
  },
];
