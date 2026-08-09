import type { SqliteDatabase } from "./sqlite";
import { seedStatusForPublishAt } from "./blog-schedule-time";

export type MsdsPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  content: string;
};

function leadCta(place: string): string {
  return `## Talk to Instacertify for MSDS / SDS authoring in ${place}

Share your **product name**, **composition / raw-material list**, **HS code** (if known) and **destination markets**. Instacertify (via Certko) prepares a **GHS-aligned Safety Data Sheet** that shipping lines and overseas buyers can accept — with a free scoping quote in 24 hours.

1. We confirm whether your SKU needs a 16-section SDS and which regional variants apply.
2. We author or upgrade the document from your formulation / supplier data.
3. You receive a review-ready pack for freight booking and buyer onboarding.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Product testing](/testing) · [More on the blog](/blog)

Certko is operated by **Instacertify Labs Private Limited**. We help exporters create globally accepted MSDS / SDS documentation so containers move and import clearance stays clean.`;
}

function countryMsdsPost(opts: {
  slug: string;
  place: string;
  placeLabel: string;
  angle: string;
  products: string;
  hubs: string;
  date: string;
  extra?: string;
}): MsdsPostSeed {
  const { slug, place, placeLabel, angle, products, hubs, date, extra } = opts;
  return {
    slug,
    title: `MSDS Certification & Authoring Services in ${placeLabel} | Export SDS Help`,
    excerpt: `Need MSDS / SDS authoring in ${place}? Instacertify helps exporters create GHS-aligned Safety Data Sheets that shipping companies and foreign buyers require for import clearance.`,
    meta_title: `MSDS Authoring Services in ${placeLabel} | Instacertify | Certko`,
    meta_description: `MSDS / SDS certification authoring for ${place} exporters. GHS 16-section Safety Data Sheets accepted by shipping lines and overseas importers. Free quote in 24 hours.`,
    published_at: date,
    content: `# MSDS Certification & Authoring Services in ${placeLabel}

Exporters in **${place}** cannot treat the Material Safety Data Sheet (MSDS) — now commonly the **GHS Safety Data Sheet (SDS)** — as optional paperwork. Freight forwarders, airlines, shipping lines and the **buyer in the foreign market** routinely demand a current SDS before cargo is booked or customs clearance starts.

${angle}

## Why ${place} exporters need a professional MSDS / SDS

- **Shipping companies require it** — hazardous and many chemical-containing goods will not be accepted without a valid SDS and proper classification.
- **Foreign buyers require it on import** — importers use the SDS for warehouse H&S, REACH/CLP or local chemical inventories, and purchase-order compliance packs.
- **Wrong or outdated sheets cause holds** — a generic “PDF from the internet” often fails carrier dangerous-goods desks and buyer quality audits.

Typical export lines we support from ${place} include **${products}**.

## What Instacertify delivers for ${place}

| Deliverable | Why it matters |
| --- | --- |
| GHS 16-section SDS | Matches the structure global carriers and importers expect |
| Hazard classification | Correct pictograms, signal words and H/P statements |
| Transport section (Section 14) | UN number, packing group and mode notes for sea/air/road |
| Language / regional variants | Destination-ready wording for major import markets |
| Revision control | Dated document your buyer can file against a PO |

Industrial and trading clusters we regularly support around ${place} include **${hubs}**.

## How the authoring engagement works

1. **Intake** — product identity, intended use, composition or supplier SDS inputs, packaging and destination countries.
2. **Classification & drafting** — GHS-aligned hazard assessment and full 16-section SDS.
3. **Export readiness check** — Section 14 and handling notes reviewed against your shipping mode.
4. **Handover** — editable + PDF pack for your logistics and buyer portals.

${extra ?? ""}
${leadCta(place)}

Related reading: [Why MSDS is required for export](/blog/msds-required-for-product-export-shipping-buyers) · [How Instacertify authors globally accepted SDS](/blog/instacertify-msds-sds-authoring-globally-accepted) · [Chemical testing](/testing)
`,
  };
}

/**
 * MSDS / SDS export-compliance posts inserted on boot if missing.
 */
export const MSDS_POSTS: MsdsPostSeed[] = [
  {
    slug: "msds-required-for-product-export-shipping-buyers",
    title:
      "MSDS Certification Required for Product Export — Shipping Lines & Foreign Buyers Demand It",
    excerpt:
      "Whenever you export a chemical-containing or hazardous product, shipping companies and overseas buyers require a valid MSDS / SDS declaration. Here is what exporters must prepare — and how Instacertify helps.",
    meta_title:
      "MSDS Required for Export: Shipping & Buyer Declaration | Certko",
    meta_description:
      "MSDS / SDS is required when exporting products — demanded by shipping companies and foreign importers. Learn GHS SDS basics and how Instacertify authors globally accepted sheets.",
    published_at: "2026-08-08",
    content: `# MSDS Certification Required Whenever You Export a Product

If your shipment involves chemicals, mixtures, coatings, adhesives, batteries with electrolytes, industrial cleaners, oils, resins, pigments or many other regulated articles, a **Material Safety Data Sheet (MSDS)** — today issued as a **GHS Safety Data Sheet (SDS)** — is not a nice-to-have. It is a gate document for **export logistics** and for the **buyer in the foreign market**.

## Why shipping companies require an MSDS / SDS

Carriers and freight forwarders must classify cargo for sea, air and road rules (IMDG, IATA/ICAO, ADR and related frameworks). Their dangerous-goods desks will typically ask for:

- A current **16-section SDS**
- Clear **Section 14** transport information (UN number, proper shipping name, class, packing group)
- Consistency between the SDS, packing list and booking declaration

Without an acceptable SDS, bookings get delayed, cargo is rolled, or the shipment is refused. That cost lands on the exporter — not on the carrier.

## Why the foreign buyer also requires an MSDS declaration on import

Importers in the destination country use the SDS to:

- Clear **customs / chemical inventory** expectations in their market
- Meet **workplace health & safety** duties in their warehouse and factory
- Satisfy **retailer, OEM and marketplace onboarding** checklists
- Confirm the product matches what was contracted (composition, hazard class, handling)

Many purchase orders now list “valid SDS / MSDS in English (and local language if required)” as a **pre-shipment deliverable**. Missing it can block LC release, warehouse put-away or first sale.

## MSDS vs SDS — what exporters should put on the document

| Term | Practical meaning |
| --- | --- |
| **MSDS** | Older name still used by many buyers and shipping desks |
| **SDS** | Modern GHS term — typically **16 standardised sections** |
| What to send | A **GHS-aligned SDS**; label it clearly and keep revision dates current |

Calling the file “MSDS” in email is fine if your buyer uses that word — the content still needs to meet today’s GHS structure.

## What a globally useful SDS must cover

A sheet that carriers and overseas buyers will accept usually includes:

1. Identification of the substance / mixture and supplier  
2. Hazard identification (classification, pictograms, signal word)  
3. Composition / information on ingredients  
4. First-aid measures  
5. Fire-fighting measures  
6. Accidental release measures  
7. Handling and storage  
8. Exposure controls / personal protection  
9. Physical and chemical properties  
10. Stability and reactivity  
11. Toxicological information  
12. Ecological information  
13. Disposal considerations  
14. **Transport information** (critical for shipping lines)  
15. Regulatory information for relevant markets  
16. Other information (revision date, SDS version)

## Common export mistakes that cause rejection

- Using a supplier SDS for a **different concentration or trade name**
- Leaving Section 14 blank or copying UN data from a similar product
- Sending a scanned, unreadable or years-old PDF
- No English version when the carrier or buyer operates in English
- Hazard statements that contradict the booking / DG declaration

## How Instacertify helps exporters clear this gate

**Instacertify** (Certko platform) authors and upgrades MSDS / SDS packs so they are ready for:

- Freight booking and DG screening  
- Buyer import compliance files  
- Multi-destination variants when one SKU ships to several markets  

Start with our country authoring guides or go straight to a quote:

- [Instacertify MSDS authoring — globally accepted SDS](/blog/instacertify-msds-sds-authoring-globally-accepted)  
- [MSDS services in India](/blog/msds-authoring-services-india) · [China](/blog/msds-authoring-services-china) · [Vietnam](/blog/msds-authoring-services-vietnam) · [UAE](/blog/msds-authoring-services-uae) · [Worldwide](/blog/msds-authoring-services-major-exporting-countries)

${leadCta("your export lane")}

> **Disclaimer:** This article is general export-compliance guidance. Exact SDS / dangerous-goods duties depend on your product composition, packaging, transport mode and destination law. Always verify against current carrier instructions and the importer’s regulatory requirements.
`,
  },
  {
    slug: "instacertify-msds-sds-authoring-globally-accepted",
    title:
      "How Instacertify Creates Globally Accepted MSDS / SDS for Exporters",
    excerpt:
      "Instacertify authors GHS-aligned Safety Data Sheets that shipping companies and foreign buyers accept. Composition review, classification, Section 14 transport data and multi-market variants — one compliance desk.",
    meta_title:
      "Instacertify MSDS / SDS Authoring for Global Export | Certko",
    meta_description:
      "Create globally accepted MSDS / SDS with Instacertify. GHS 16-section authoring, transport classification support and export-ready packs for shipping lines and overseas importers.",
    published_at: "2026-08-08",
    content: `# How Instacertify Creates Globally Accepted MSDS / SDS

Exporters lose weeks when a shipping line rejects a weak Material Safety Data Sheet or a foreign buyer refuses cargo without a proper import SDS. **Instacertify Labs Private Limited** — through the Certko compliance desk — authors **GHS-aligned MSDS / SDS** documents built for real export workflows, not for a forgotten shared drive.

## What “globally accepted” means in practice

There is no single world stamp called “MSDS certification”. What carriers and importers accept is a **technically sound, current, GHS-structured SDS** that matches the product you ship. Instacertify focuses on that acceptance bar:

- **16-section GHS layout** buyers and DG desks recognise  
- **Classification logic** tied to your formulation or mixture  
- **Section 14** filled for sea / air / road conversations  
- **Clear English** (plus regional variants when the destination demands them)  
- **Revision control** so PO and shipment packs stay consistent  

## Our MSDS / SDS authoring workflow

### 1. Product & market intake
We collect trade name, intended use, composition or supplier inputs, packaging type, and destination countries. If composition is incomplete, we tell you what is still needed before drafting — we do not invent hazard data.

### 2. Hazard classification & drafting
Our team builds or upgrades the SDS so hazard classes, pictograms, signal words and precautionary statements line up with GHS practice for the mixture or substance you export.

### 3. Export & buyer pack readiness
We stress-check the sections shipping companies and foreign importers actually open first — identification, hazards, composition confidentiality balance, and **transport information**.

### 4. Handover & updates
You receive PDF + editable files, version/date stamps, and a path to revise when formulation, packaging or destination rules change.

## Where Instacertify fits beside testing & certification

SDS authoring often sits next to lab work and market access:

| Need | How Certko / Instacertify helps |
| --- | --- |
| Composition / chemical insight | [Chemical & product testing pathways](/testing) |
| India product certification | [BIS and other schemes](/certifications/bis) |
| Lab booking | [Find recognised labs](/labs) |
| Export SDS pack | MSDS / SDS authoring (this service) |

## Who should engage us

- Manufacturers exporting chemicals, mixtures and chemical-containing articles  
- Brand owners whose contract factory cannot produce a buyer-ready SDS  
- Trading companies in free zones consolidating multi-origin cargo  
- Exporters who were **already rejected** by a forwarder or overseas importer  

## Country desks for major exporting hubs

We support authoring engagements tied to major export origins:

[India](/blog/msds-authoring-services-india) · [China](/blog/msds-authoring-services-china) · [Vietnam](/blog/msds-authoring-services-vietnam) · [Thailand](/blog/msds-authoring-services-thailand) · [Indonesia](/blog/msds-authoring-services-indonesia) · [Malaysia & Singapore](/blog/msds-authoring-services-malaysia-singapore) · [Bangladesh](/blog/msds-authoring-services-bangladesh) · [UAE](/blog/msds-authoring-services-uae) · [Saudi Arabia](/blog/msds-authoring-services-saudi-arabia) · [Turkey](/blog/msds-authoring-services-turkey) · [South Korea](/blog/msds-authoring-services-south-korea) · [Taiwan](/blog/msds-authoring-services-taiwan) · [USA & Europe](/blog/msds-authoring-services-usa-europe) · [All major exporting countries](/blog/msds-authoring-services-major-exporting-countries)

Also read: [Why MSDS is required whenever you export](/blog/msds-required-for-product-export-shipping-buyers)

${leadCta("global export programmes")}

> **Disclaimer:** Instacertify provides professional SDS / MSDS authoring support. Final legal responsibility for classification, labelling and transport declarations remains with the manufacturer / shipper under applicable law and carrier rules.
`,
  },
  {
    slug: "msds-authoring-services-major-exporting-countries",
    title:
      "MSDS Authoring Services in Major Exporting Countries — Instacertify Export SDS Desk",
    excerpt:
      "Instacertify provides MSDS / SDS authoring for exporters in India, China, ASEAN, Gulf, Turkey, Korea, Taiwan, USA and Europe — sheets shipping lines and foreign buyers accept.",
    meta_title:
      "MSDS Authoring in Major Exporting Countries | Instacertify",
    meta_description:
      "MSDS / SDS authoring services across major exporting countries. GHS Safety Data Sheets for shipping companies and overseas importers. Instacertify via Certko.",
    published_at: "2026-08-08",
    content: `# MSDS Authoring Services in Major Exporting Countries

Wherever your factory or trading desk sits, **exporting a chemical-containing product** usually triggers the same two asks: the **shipping company** wants an SDS before booking, and the **buyer in the foreign market** wants an MSDS / SDS declaration before import.

Instacertify runs a cross-border **MSDS certification authoring** desk so exporters in major hubs get one coherent, GHS-aligned document pack.

## Export hubs we support

| Region | Typical export lanes we support |
| --- | --- |
| **India** | Chemicals, coatings, specialty mixtures, industrial consumables |
| **China** | Formulations, adhesives, pigments, electronics process chemicals |
| **ASEAN** | Vietnam, Thailand, Indonesia, Malaysia, Singapore manufacturing |
| **Bangladesh** | Process chemicals and export-adjacent industrial products |
| **Gulf** | UAE & Saudi trading / re-export consolidation |
| **Turkey** | Chemicals and industrial goods into EU, MENA and beyond |
| **Korea & Taiwan** | Specialty chemicals and advanced materials |
| **USA & Europe** | Brand-owner SDS packs for multi-origin supply chains |

## Country guides

- [India](/blog/msds-authoring-services-india)  
- [China](/blog/msds-authoring-services-china)  
- [Vietnam](/blog/msds-authoring-services-vietnam)  
- [Thailand](/blog/msds-authoring-services-thailand)  
- [Indonesia](/blog/msds-authoring-services-indonesia)  
- [Malaysia & Singapore](/blog/msds-authoring-services-malaysia-singapore)  
- [Bangladesh](/blog/msds-authoring-services-bangladesh)  
- [UAE](/blog/msds-authoring-services-uae)  
- [Saudi Arabia](/blog/msds-authoring-services-saudi-arabia)  
- [Turkey](/blog/msds-authoring-services-turkey)  
- [South Korea](/blog/msds-authoring-services-south-korea)  
- [Taiwan](/blog/msds-authoring-services-taiwan)  
- [USA & Europe](/blog/msds-authoring-services-usa-europe)  

Pillar guides: [Export MSDS requirements](/blog/msds-required-for-product-export-shipping-buyers) · [How Instacertify authors global SDS](/blog/instacertify-msds-sds-authoring-globally-accepted)

${leadCta("major exporting countries")}
`,
  },
  countryMsdsPost({
    slug: "msds-authoring-services-india",
    place: "India",
    placeLabel: "India",
    angle:
      "Indian manufacturers shipping chemicals, coatings, adhesives, oils, specialty mixtures and many industrial consumables are asked for an English SDS at booking — and again when the overseas buyer files import paperwork.",
    products:
      "specialty chemicals, paints & coatings, adhesives, oils & lubricants, cleaning formulations and process chemicals",
    hubs: "Gujarat chemical belts, Maharashtra industrials, Tamil Nadu / Andhra process clusters and Delhi-NCR trading desks",
    date: "2026-08-08",
    extra: `## Tip for Indian exporters

Align SDS authoring with your **commercial invoice and packing list** freeze date. Updating Section 14 after the container is gated rarely works — finish the sheet before the shipping line’s DG cut-off.
`,
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-china",
    place: "China",
    placeLabel: "China",
    angle:
      "Chinese factories are among the world’s largest chemical and mixture exporters. Delays usually come from English SDS quality or mismatched UN data — not from a lack of local Chinese documentation.",
    products:
      "adhesives, resins, pigments, electronics process chemicals, coatings and industrial mixtures",
    hubs: "Pearl River Delta, Yangtze River Delta, Shandong and other major chemical / manufacturing corridors",
    date: "2026-08-09",
    extra: `## China export note

If you already hold a Chinese SDS, Instacertify can **translate, restructure and upgrade** it to a buyer- and carrier-ready GHS English pack — without inventing composition data you have not provided.
`,
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-vietnam",
    place: "Vietnam",
    placeLabel: "Vietnam",
    angle:
      "Vietnam’s rising export base in coatings, adhesives, footwear chemicals and industrial mixtures means more forwarders and EU/US/ASEAN buyers now block POs until a proper SDS is on file.",
    products:
      "coatings, adhesives, footwear & furniture process chemicals, cleaners and industrial mixtures",
    hubs: "Binh Duong, Dong Nai, Hai Phong, Bac Ninh and Ho Chi Minh City industrial zones",
    date: "2026-08-09",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-thailand",
    place: "Thailand",
    placeLabel: "Thailand",
    angle:
      "Thai chemical and appliance-adjacent exporters often already keep local safety files — overseas carriers still want a clear English GHS SDS before air or sea booking.",
    products:
      "petrochemical derivatives, coatings, adhesives, auto-related chemicals and industrial consumables",
    hubs: "Eastern Economic Corridor, Bangkok industrial rings and Map Ta Phut adjacency supply chains",
    date: "2026-08-10",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-indonesia",
    place: "Indonesia",
    placeLabel: "Indonesia",
    angle:
      "Indonesian exporters selling into modern trade and OEM programmes overseas increasingly face SDS checks at both the forwarder desk and the importer’s EHS gate.",
    products:
      "oleochemicals, coatings, consumer-chemical formulations and industrial process aids",
    hubs: "Jakarta, West Java, East Java and Batam / free-trade manufacturing pockets",
    date: "2026-08-10",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-malaysia-singapore",
    place: "Malaysia and Singapore",
    placeLabel: "Malaysia & Singapore",
    angle:
      "Regional HQs in Singapore and factories in Malaysia often manage multi-country SKUs. One weak SDS can stall an entire regional shipping calendar.",
    products:
      "specialty chemicals, electronics process materials, branded formulations and contract-manufactured mixtures",
    hubs: "Johor, Penang, Klang Valley, Jurong and regional trading desks in Singapore",
    date: "2026-08-11",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-bangladesh",
    place: "Bangladesh",
    placeLabel: "Bangladesh",
    angle:
      "Bangladesh exporters serving overseas industrial and retail buyers are seeing more pre-shipment SDS requests from freight agents and foreign importers.",
    products:
      "process chemicals, textile-adjacent formulations, adhesives and light industrial mixtures",
    hubs: "Dhaka, Chittagong and major EPZ / industrial corridors",
    date: "2026-08-11",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-uae",
    place: "the UAE",
    placeLabel: "the UAE",
    angle:
      "Dubai and Abu Dhabi trading companies consolidate Asian and local production for re-export. Carriers and destination buyers still expect the consolidator to present a coherent SDS pack per SKU.",
    products:
      "re-exported chemicals, industrial consumables, coatings and specialty mixtures",
    hubs: "JAFZA, Dubai industrial free zones, Abu Dhabi and Khalifa industrial corridors",
    date: "2026-08-12",
    extra: `## Gulf re-export tip

Keep the **manufacturer identity and revision date** consistent across SDS, commercial invoice and packing list. Free-zone re-exports fail DG checks when those three documents disagree.
`,
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-saudi-arabia",
    place: "Saudi Arabia",
    placeLabel: "Saudi Arabia",
    angle:
      "Saudi manufacturers and trading groups exporting chemicals and industrial goods need SDS packs that travel with the cargo and satisfy the overseas importer’s filing desk.",
    products:
      "petrochemical derivatives, construction chemicals, industrial fluids and specialty mixtures",
    hubs: "Jubail, Yanbu, Riyadh industrial and major trading groups",
    date: "2026-08-12",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-turkey",
    place: "Turkey",
    placeLabel: "Turkey",
    angle:
      "Turkish exporters shipping into the EU, MENA and beyond are frequently asked for CLP/GHS-style SDS language that European buyers and carriers recognise immediately.",
    products:
      "chemicals, coatings, construction chemicals, industrial mixtures and process materials",
    hubs: "Istanbul, Izmir, Gebze, Kocaeli and Anatolian industrial corridors",
    date: "2026-08-13",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-south-korea",
    place: "South Korea",
    placeLabel: "South Korea",
    angle:
      "Korean specialty chemical and advanced materials exporters need English SDS packs that global OEM and carrier desks can process without local-language bottlenecks.",
    products:
      "specialty chemicals, electronics materials, coatings and high-purity process mixtures",
    hubs: "Ulsan, Yeosu, Incheon and Greater Seoul manufacturing belts",
    date: "2026-08-13",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-taiwan",
    place: "Taiwan",
    placeLabel: "Taiwan",
    angle:
      "Taiwanese chemical and materials exporters serving global electronics and industrial OEMs are routinely asked for SDS evidence before air freight and buyer warehouse intake.",
    products:
      "electronics process chemicals, specialty materials, adhesives and industrial formulations",
    hubs: "Kaohsiung, Taichung, Hsinchu adjacency and Taipei trading desks",
    date: "2026-08-14",
  }),
  countryMsdsPost({
    slug: "msds-authoring-services-usa-europe",
    place: "the USA and Europe",
    placeLabel: "the USA & Europe",
    angle:
      "US and European brand owners often own the customer relationship while production sits in Asia. Overseas buyers and carriers still expect the brand’s SDS pack to be accurate, current and GHS-structured.",
    products:
      "branded formulations, industrial chemicals, adhesives, coatings and multi-origin private-label mixtures",
    hubs: "US chemical distributors, EU brand owners and contract-manufacturing control towers",
    date: "2026-08-14",
    extra: `## For brand owners

If the factory SDS is incomplete, Instacertify helps you **rebuild a buyer-facing pack** from verified composition inputs — so Amazon, OEM and retail onboarding does not stall on document quality.
`,
  }),
];

export function ensureMsdsPosts(db: SqliteDatabase) {
  const author = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (!author) return;

  const exists = db.prepare("SELECT id FROM posts WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO posts
      (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
     VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const p of MSDS_POSTS) {
      if (exists.get(p.slug)) continue;
      insert.run(
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        author.name,
        author.id,
        seedStatusForPublishAt(p.published_at),
        p.published_at,
        p.meta_title,
        p.meta_description
      );
    }
  });
  tx();
}
