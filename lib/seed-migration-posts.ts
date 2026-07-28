import type { SqliteDatabase } from "./sqlite";

type MigrationPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  content: string;
};

/**
 * Topical compliance posts (QCO / standard migrations) inserted on boot if missing.
 */
export const MIGRATION_POSTS: MigrationPostSeed[] = [
  {
    slug: "is-13252-to-is-iec-62368-1-migration-guide",
    title:
      "IS 13252 (Part 1) to IS/IEC 62368-1:2023 Migration — What Electronics Makers Must Do Now",
    excerpt:
      "BIS has clarified how CRS licences migrate from IS 13252 (Part 1):2010 and IS 616:2017 to IS/IEC 62368-1:2023. Deadlines, lead models, CCL rules, lab testing — and how Certko can run the migration file for you.",
    meta_title:
      "IS 13252 to IS/IEC 62368-1:2023 Migration Guide | CRS Help | Certko",
    meta_description:
      "Migrate CRS licences from IS 13252 (Part 1) / IS 616 to IS/IEC 62368-1:2023. Key dates to Nov 2028, lead-model testing, marking, CCL rules and Certko consulting support.",
    published_at: "2026-07-28",
    content: `India’s Compulsory Registration Scheme (CRS) for IT and AV electronics is moving from the older safety standards **IS 13252 (Part 1):2010** and **IS 616:2017** to the hazard-based **IS/IEC 62368-1:2023**.

If you hold an R-number under the old standards — or you are filing a new CRS application for power adapters, IT equipment, displays, audio-video products and similar apparatus — this migration is now a live compliance project, not a future nice-to-have.

BIS published implementation guidelines (09 March 2026) and a detailed FAQ set (22 July 2026). Below is a practical reading of what matters for manufacturers, importers and brand owners — plus where Certko’s consulting team can take the load off your plate.

## Why this migration matters

IS/IEC 62368-1 is not a simple renumbering of IS 13252. It uses a **safeguard / energy-source** model instead of the older IEC 60950 / IEC 60065 style construction rules. That change affects:

- How lead models and series are defined
- What goes into the **Critical Component List (CCL)**
- Which lab reports are acceptable for migration
- How you mark products after grant

Miss the concurrent-running window and BIS may cancel the licence or delete models from scope. Starting early protects production and marketplace listings.

## Key timeline (do not miss this)

| Milestone | What it means |
| --- | --- |
| **Concurrent running** of old + new standards | Continues **until 01 November 2028** (as notified with MeitY’s implementation timeline) |
| Renewal under **IS 13252 (Part 1)** / **IS 616** | Allowed **up to 01 November 2028** |
| New licences under old standards | Allowed only during concurrent running (with a declaration to migrate); **after the last date, all new applications must be under IS/IEC 62368-1:2023** |
| Existing licensees who do not migrate in time | Risk of **licence cancellation** and/or **model deletion** |

Practical advice: treat **November 2028** as a hard wall for old-standard CRS — and plan lab slots 6–12 months earlier. Recognised labs get busy as deadlines approach.

## What stays the same after a successful migration

Good news from the BIS FAQs:

1. **Your Licence No. (R-number) stays the same** after successful migration.
2. If you hold **separate R-numbers** for different categories (for example, IT power adaptors vs AV power adaptors), those licences **remain separate** — you migrate **each licence independently**.
3. **No migration fee** for already-registered models when you use the **Standard Revision** path in the CRS licensee login.

## Marking and labelling under IS/IEC 62368-1:2023

Products complying with the new standard must carry the BIS Standard Mark as per **Scheme II** labelling rules (Regulation 6 and Annexures I–III of Schedule II of the BIS Conformity Assessment Regulations, 2018).

Typical mark layout (for guidance):

\`\`\`
IS/IEC 62368-1
R-xxxxxxxx
\`\`\`

Already-registered models may already bear the Standard Mark. When you send those samples for **migration testing**, declare that they are registered models so the lab records it in the test report.

## Testing and labs

- Use only **BIS-recognised laboratories** for IS/IEC 62368-1:2023. Search labs on the BIS LIMS portal ([lims.bis.gov.in](https://lims.bis.gov.in)) by standard number **IS/IEC 62368-1:2023**.
- You **may start testing before** filing the migration application — useful for locking lab capacity early.
- **One sample per R-number is not enough.** You must submit **complete test report(s) for all lead model(s)** in scope that were previously covered under IS 13252 / IS 616, following the **revised series guidelines**.
- **Different manufacturing locations** need **separate test reports** (CRS issues separate licences per location).
- **Components and end products** notified under CRO may be tested **in parallel** under BIS parallel-testing guidelines — important when CCL parts also need fresh compliance.

## Critical Component List (CCL) — a common trap

Under **Clause 4.1.2 of IS/IEC 62368-1:2023**, safeguards and safeguard-related components must meet this standard (or the safety aspects of the referenced IEC component standards).

**Components that only comply with IS 13252 (Part 1):2010 or IS 616:2017 will not be accepted in the CCL after migration.**

Plan component registration / re-testing in parallel with the end-product file so the migration package is not stuck waiting on a single capacitor, adaptor or power board.

## Lead models, EOL products and series rules

- Migration is based on **lead models** as redefined in MeitY’s revised series guidelines for IS/IEC 62368-1:2023 — not on a single representative sample for the whole licence.
- If a lead model is **End-of-Life**, withdraw it and nominate the **next appropriate lead model** in the same series for testing.
- **New models** already tested to IS/IEC 62368-1:2023 can often be **added to an existing R-number** that was originally granted under IS 13252 / IS 616 — see Clause 4(C) of the 09 March 2026 guidelines — but the **whole licence still needs to complete migration** before concurrent running ends.

## How existing licensees apply

In the BIS CRS licensee portal, use the **Standard Revision / Amendment / Essential Requirement** provision and upload complete lead-model test reports for IS/IEC 62368-1:2023, following the 09 March 2026 implementation guidelines.

New applicants are **encouraged to file directly under IS/IEC 62368-1:2023**. Filing under the old standards remains possible only until the concurrent-running cut-off, and only with a declaration that you will migrate by that date.

## Migration checklist for your team

1. List every **R-number**, factory location and model currently in scope.
2. Re-map series / **lead models** to the revised IS/IEC 62368-1 guidelines.
3. Flag **EOL lead models** and pick replacements.
4. Audit the **CCL** against 62368-1 — schedule parallel component tests where needed.
5. Book **BIS-recognised lab** slots for every lead model (and every factory location).
6. Prepare declarations for marked samples and any impacted essential requirements.
7. File via **Standard Revision** and track queries until grant under IS/IEC 62368-1:2023.
8. Update labelling artwork to the new standard reference on the Standard Mark.

## Scope of Certko consulting — if you need hands-on help

Many brands underestimate the coordination load: multi-location licences, EOL lead models, CCL rebuilds and lab congestion. Certko’s consulting scope for this migration typically covers:

### 1. Gap assessment & licence mapping
- Inventory of R-numbers, models and factories
- Old-standard vs IS/IEC 62368-1:2023 applicability check
- Series / lead-model recommendation against MeitY guidelines

### 2. Lab strategy & test coordination
- Shortlist of BIS-recognised labs with IS/IEC 62368-1:2023 scope ([search labs on Certko](/labs))
- Sample plan for lead models and parallel component testing
- Review of draft / final test reports before portal upload

### 3. CCL & critical component support
- Component list rebuild for 62368-1 safeguards
- Parallel registration path for components and end products
- Coordination with suppliers on acceptable IEC / Indian Standard evidence

### 4. CRS portal filing & query management
- Standard Revision application pack
- Declarations, series tables and supporting documents
- Day-to-day response to BIS queries through grant

### 5. Marking, marketplace & go-live
- Standard Mark artwork guidance (IS/IEC 62368-1 + R-number)
- Alignment for Amazon / Flipkart / retail compliance teams
- Post-migration model addition roadmap

### Who this is for
- Indian manufacturers with active CRS licences under **IS 13252 (Part 1)** or **IS 616**
- Importers / foreign factories selling into India under CRS
- Brands adding new power adapters, IT or AV models during the transition
- Teams that want a single owner for lab + CCL + portal work before **November 2028**

## Talk to a Certko consultant

Share your **product category**, **R-number(s)** and **factory locations**. We will return a **migration plan + indicative timeline and quote within 24 hours**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Browse product testing](/testing) · [Find a BIS lab](/labs)

> **Disclaimer:** This article summarises publicly available BIS guidance for manufacturers. In case of any inconsistency, the Bureau of Indian Standards Act, 2016, the BIS Conformity Assessment Regulations, 2018, applicable Quality Control Orders, and the official *Guidelines for Implementation of Migration to IS/IEC 62368-1:2023* prevail.
`,
  },
];

export function ensureMigrationPosts(db: SqliteDatabase) {
  const author = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (!author) return;

  const exists = db.prepare("SELECT id FROM posts WHERE slug = ?");
  const insert = db.prepare(
    `INSERT INTO posts
      (slug, title, excerpt, content, image, author, author_id, status, published_at, meta_title, meta_description)
     VALUES (?, ?, ?, ?, '', ?, ?, 'published', ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    for (const p of MIGRATION_POSTS) {
      if (exists.get(p.slug)) continue;
      insert.run(
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        author.name,
        author.id,
        p.published_at,
        p.meta_title,
        p.meta_description
      );
    }
  });
  tx();
}
