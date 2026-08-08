import type { SqliteDatabase } from "./sqlite";

type LandingSeed = {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  hero_heading: string;
  hero_subheading: string;
  cta_label: string;
  cta_href: string;
  content: string;
  faqs: { q: string; a: string }[];
};

const LANDINGS: LandingSeed[] = [
  {
    slug: "msds-authoring-service",
    title: "MSDS Authoring Service",
    meta_title: "MSDS / SDS Authoring Service for Exporters | Certko",
    meta_description:
      "Professional GHS-aligned MSDS / SDS authoring for exporters. Sheets shipping lines and foreign buyers accept. Free scoping quote in 24 hours from Instacertify via Certko.",
    hero_heading: "MSDS Authoring that clears shipping desks and import buyers",
    hero_subheading:
      "Instacertify builds GHS-aligned Safety Data Sheets for chemical and mixture exporters — so carriers book cargo and overseas buyers accept your declaration without last-minute holds.",
    cta_label: "Get MSDS quote",
    cta_href: "/contact",
    content: `## Why exporters need professional MSDS / SDS authoring

Shipping companies and foreign-market buyers routinely demand a current **Material Safety Data Sheet (MSDS)** — today issued as a **GHS Safety Data Sheet (SDS)** — before cargo moves or import clearance starts.

A weak PDF from a supplier portal is the #1 reason DG bookings roll and purchase orders stall.

## What you receive

| Deliverable | Why it matters |
| --- | --- |
| GHS 16-section SDS | Structure carriers and importers recognise |
| Hazard classification | Pictograms, signal words, H/P statements |
| Section 14 transport data | UN number, class, packing group for sea/air |
| English master + variants | Destination-ready wording when required |
| Revision control | Dated pack your buyer can file against a PO |

## Who this service is for

- Chemical and specialty mixture manufacturers
- Paints, coatings, adhesives and sealant exporters
- Brand owners whose factory SDS is incomplete
- Free-zone traders consolidating multi-origin cargo
- Teams already rejected by a forwarder or overseas EHS desk

## How the engagement works

1. **Intake** — product identity, composition / supplier inputs, packaging, destinations  
2. **Classification & drafting** — GHS-aligned hazard assessment and full SDS  
3. **Export readiness check** — Section 14 and handling notes vs shipping mode  
4. **Handover** — PDF + editable files ready for logistics and buyer portals  

## Pair with testing & market access

Need composition insight or destination certification in parallel? Browse [Product testing](/testing) and [Certifications](/certifications), or start with a combined plan via Contact.

## Talk to Instacertify

Share your **product name**, **composition list** (or supplier SDS), **HS code** and **destination markets**. You get a scoped authoring plan and quote within **24 hours**.

[Get MSDS quote](/contact) · [Read MSDS export guide](/blog/msds-required-for-product-export-shipping-buyers) · [More services](/testing)
`,
    faqs: [
      {
        q: "Is MSDS the same as SDS?",
        a: "SDS is the modern GHS term (typically 16 sections). Buyers may still say MSDS — we deliver a current GHS SDS either way.",
      },
      {
        q: "Will shipping companies accept your sheet?",
        a: "We author for DG-desk usability — especially Section 14. Final transport classification responsibility remains with the shipper under carrier rules.",
      },
      {
        q: "Can you rewrite a Chinese or local-language SDS into English?",
        a: "Yes, when you provide composition/supplier inputs. We restructure to GHS English without inventing missing hazard data.",
      },
      {
        q: "How fast can we get a first draft?",
        a: "Depends on composition completeness. Incomplete % ranges delay classification — send what you have and we flag gaps immediately.",
      },
    ],
  },
  {
    slug: "bis-certification-consulting",
    title: "BIS Certification Consulting",
    meta_title: "BIS Certification Consulting — ISI, CRS & FMCS | Certko",
    meta_description:
      "BIS certification consultants for ISI Mark, CRS and FMCS. Product mapping, lab coordination, inspection readiness and grant follow-up. Free compliance plan in 24 hours.",
    hero_heading: "BIS certification consulting that clears QCO and CRS gates",
    hero_subheading:
      "Certko — operated by Instacertify — maps your product to the right IS standard, books recognised labs, prepares the file and keeps factory or CRS registration on schedule.",
    cta_label: "Get BIS compliance plan",
    cta_href: "/contact",
    content: `## Why hire a BIS certification consultant

Quality Control Orders and MeitY Compulsory Registration turn “we will certify later” into blocked shipments and marketplace delistings. A consultant prevents the expensive mistakes: wrong standard, late lab slots, and incomplete variety lists.

## What Certko handles

| Stage | How we help |
| --- | --- |
| Scope check | Confirm IS standard, ISI vs CRS vs FMCS |
| Lab plan | Shortlist BIS-recognised labs with indicative costs |
| Documentation | Application pack, QC plan, model / series mapping |
| Inspection readiness | In-house test checklist before BIS visits (ISI) |
| Grant follow-up | Query responses, marking hygiene, model additions |

## Schemes we run every week

- **ISI Mark (Scheme I)** — cables, cement, PPE, many appliances and QCO hard goods  
- **CRS (Scheme II)** — notified electronics / IT under MeitY orders  
- **FMCS** — overseas factories selling ISI products into India  

Not sure which applies? [Search your product](/products) or send the datasheet for a 24-hour map.

## Built for manufacturers, importers and exporters

- Indian factories facing a new QCO deadline  
- Importers who need licence / CRS proof before the next container  
- China / ASEAN / Gulf factories entering India via FMCS or CRS  
- Brands fixing Amazon / Flipkart BIS gaps  

## How the consulting engagement works

1. Share **product name**, **HS code** (if known), **factory location** and target market  
2. Receive a **compliance plan + lab options + quote within 24 hours**  
3. We coordinate testing, filing and queries through grant  

## Start now

[Get BIS compliance plan](/contact) · [Browse products](/products) · [Find a lab](/labs) · [BIS overview](/certifications/bis) · [Certification guide](/guide)
`,
    faqs: [
      {
        q: "Do you file ISI and CRS?",
        a: "Yes. We map the correct scheme first — ISI for many QCO products, CRS for notified electronics — then run documentation and lab coordination.",
      },
      {
        q: "Can you help foreign factories?",
        a: "Yes. FMCS for ISI-style products and CRS pathways for notified electronics, with remote documentation support.",
      },
      {
        q: "Is a consultant mandatory?",
        a: "Not legally mandatory, but for first-time or multi-SKU programmes a consultant usually saves failed inspections, rejected files and idle production weeks.",
      },
      {
        q: "How fast is a scoping reply?",
        a: "We target a free compliance plan and indicative quote within 24 hours of receiving product and factory basics.",
      },
    ],
  },
];

export function ensureLandingPages(db: SqliteDatabase) {
  const cols = db.prepare("PRAGMA table_info(pages)").all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("page_type")) return; // migration not applied yet

  const exists = db.prepare("SELECT slug FROM pages WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO pages (
      slug, title, meta_title, meta_description, hero_heading, hero_subheading, content, image,
      nav_menu, nav_submenu, nav_footer, nav_label, nav_detail, nav_sort,
      page_type, cta_label, cta_href
    ) VALUES (?, ?, ?, ?, ?, ?, ?, '', 0, 0, 0, ?, '', 0, 'landing', ?, ?)`
  );

  const faqExists = db.prepare(
    "SELECT id FROM faqs WHERE scope = ? AND question = ? LIMIT 1"
  );
  const insertFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (const p of LANDINGS) {
      if (!exists.get(p.slug)) {
        insert.run(
          p.slug,
          p.title,
          p.meta_title,
          p.meta_description,
          p.hero_heading,
          p.hero_subheading,
          p.content,
          p.title,
          p.cta_label,
          p.cta_href
        );
      } else {
        // Keep admin edits: only backfill type/cta if still default content page with empty CTA
        db.prepare(
          `UPDATE pages SET page_type = 'landing',
            cta_label = CASE WHEN cta_label = '' THEN ? ELSE cta_label END,
            cta_href = CASE WHEN cta_href = '' THEN ? ELSE cta_href END
           WHERE slug = ? AND page_type = 'content'`
        ).run(p.cta_label, p.cta_href, p.slug);
      }

      const scope = `page:${p.slug}`;
      p.faqs.forEach((f, i) => {
        if (faqExists.get(scope, f.q)) return;
        insertFaq.run(scope, f.q, f.a, i);
      });
    }
  });
  tx();
}
