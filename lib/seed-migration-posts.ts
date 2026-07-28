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
  {
    slug: "is-10322-led-luminaires-revised-standards-august-2026",
    title:
      "IS 10322 LED Luminaires Revised Standards — CRS Switchover by 02 August 2026",
    excerpt:
      "BIS has revised the IS 10322 series for fixed, recessed, street, flood, hand-lamp, lighting-chain and emergency LED luminaires. Concurrent running ends 02 August 2026 — what licensees must file, what changed technically, and how Certko can run the migration.",
    meta_title:
      "IS 10322 LED Luminaires Revised Standards | CRS by Aug 2026 | Certko",
    meta_description:
      "Migrate CRS LED luminaires to IS 10322 (Part 5) :2026 revisions. Concurrent running ends 02 August 2026. Lead-model testing, Part 1:2026 changes and Certko consulting help.",
    published_at: "2026-07-28",
    content: `BIS Registration Department has issued **Guidelines for Implementation of Revised Standards for LED Luminaires** (Ref: Reg./ IS 10322 Series /Guidelines/01, **20 March 2026**).

Seven LED luminaire categories under the Compulsory Registration Order (CRO) now point to **2026 editions** of the IS 10322 (Part 5) sections — all tied to the revised general requirements in **IS 10322 (Part 1):2026**.

The last date of **concurrent running is 02 August 2026**. After that date, licences that have not switched to the revised standards do not remain operative. If you manufacture or import LED luminaires for India, this is an immediate CRS project.

## Products and standards covered

| Product category | Current IS | Revised IS | Concurrent running ends |
| --- | --- | --- | --- |
| Fixed General Purpose LED Luminaires (incl. Fancy Lights) | IS 10322 (Part 5/Sec 1):2012 | **IS 10322 (Part 5/Sec 1):2026** | **02 August 2026** |
| Recessed LED Luminaires | IS 10322 (Part 5/Sec 2):2012 | **IS 10322 (Part 5/Sec 2):2026** | **02 August 2026** |
| LED Luminaires for Road and Street Lighting | IS 10322 (Part 5/Sec 3):2012 | **IS 10322 (Part 5/Sec 3):2026** | **02 August 2026** |
| LED Flood Lights | IS 10322 (Part 5/Sec 5):2013 | **IS 10322 (Part 5/Sec 5):2026** | **02 August 2026** |
| LED Hand Lamps | IS 10322 (Part 5/Sec 6):2013 | **IS 10322 (Part 5/Sec 6):2026** | **02 August 2026** |
| LED Lighting Chains | IS 10322 (Part 5/Sec 7):2017 | **IS 10322 (Part 5/Sec 7):2026** | **02 August 2026** |
| LED Luminaires for Emergency Lighting | IS 10322 (Part 5/Sec 8):2013 | **IS 10322 (Part 5/Sec 8):2026** | **02 August 2026** |

All of the above sections **refer to IS 10322 (Part 1)**. The Part 1 edition **IS 10322 (Part 1):2014** has been superseded by **IS 10322 (Part 1):2026** — so general safety changes apply across the family, not only section-specific clauses.

## What existing CRS licensees must do

Per the BIS guidelines (Section A):

1. **Implement the applicable revised standard by 02 August 2026.** Beyond that date, a licence that has not ensured compliance **shall not remain operative**.
2. Submit **complete test report(s)** from a **BIS-recognised laboratory** for **all lead model(s)** in scope that were previously tested to the old edition.
3. Give an **undertaking** that the revised-standard requirements have been implemented on **other existing series models** still in the licence scope.
4. If actions are incomplete by the deadline, BIS may start **cancellation of the licence** and/or **deletion of models** from scope.

There is no “one sample covers the whole R-number” shortcut — plan lead-model testing per series, for every factory location that holds a separate CRS licence.

## Rules for new applicants and scope changes

**New / pending applications (Section B):**

- If the sample is already in the lab (or a test report is already issued), the file **may still be processed under the old edition**.
- Applications recorded after the guidelines may use **old or revised** standards — but old-standard processing is allowed **only until 02 August 2026**, and only with a **declaration** that you will implement the revised standard by that date.
- **After concurrent running ends, no new licence will be granted under the old standard.**

**Change in scope of licence (Section C):**

- Same rules as for applicants apply.
- Old-standard scope-change requests are allowed only until you switch over to the revised standard **or** until 02 August 2026 — **whichever is earlier**.

## Significant technical changes (why retesting is not paperwork-only)

BIS lists the Part 1:2026 and section-level changes in the guidelines annexure. Highlights manufacturers should brief design and lab teams on:

### IS 10322 (Part 1):2026
- Introduction of **IPX9**
- **EMF safety** requirements
- Modified **marking** requirements (including mains socket-outlet marking)
- Protection against **fast rotating parts** (moving fan blades)
- Introduction of **PELV** systems
- Extra rules for luminaires with **controllable control gear providing SELV outputs**
- Updated touch **voltage / touch current** limits for shock assessment
- Informative annexes on PoE / IT-cabling powered Class III luminaires and impulse withstand Category III
- Normative annex on **battery / EDLC-operated** luminaires
- Extended **photobiological** requirements

### Section-specific additions
- **Sec 1 (fixed GP):** scope aligned with Part 1 to include all electric light sources
- **Sec 2 (recessed):** recessed-specific Part 1 requirements moved into Sec 2; **air-handling** luminaires; extra marking
- **Sec 3 (street):** additional marking
- **Sec 5 (flood):** **glass breaking test**; additional marking
- **Sec 7 (lighting chains):** Temporarily Installed Protected Lighting (**TPL**) chains; new terms
- **Sec 8 (emergency):** rest/inhibiting modes; high-temperature tests; **lithium batteries** and **EDLCs**; heat/fire/tracking clarifications; exit-sign contrast method

If your series includes battery-backed emergency luminaires, street lights with new marking, or flood lights with glass optics, expect more than a rubber-stamp retest.

## 30-day action checklist (before 02 August 2026)

1. List every **R-number**, factory and LED category (Sec 1–8) still on old editions.
2. Reconfirm **lead models** vs current series guidelines for each licence.
3. Book **BIS-recognised labs** with scope for the applicable **IS 10322 (Part 5/Sec x):2026** edition — search on [Certko Labs](/labs) or BIS LIMS.
4. Run gap review against **Part 1:2026** (IP, EMF, marking, SELV/PELV, photobiological, battery/EDLC).
5. Compile complete lead-model test reports + **series-model undertaking**.
6. File the standard revision / update in the CRS portal and clear queries before the cut-off.
7. Refresh Standard Mark / packaging artwork for the revised IS reference.

## Scope of Certko consulting — LED luminaire CRS migration

This switchover is short-dated. Certko supports lighting OEMs, importers and brand owners with end-to-end CRS migration help:

### 1. Licence & series gap assessment
- Inventory of R-numbers across fixed, recessed, street, flood, hand-lamp, chain and emergency ranges
- Lead-model / series mapping to the 2026 editions
- Risk flag for licences unlikely to clear lab + portal before **02 August 2026**

### 2. Lab booking & test plan
- Shortlist of BIS-recognised labs for the relevant IS 10322 Part 5 section
- Sample matrix for lead models (and multi-location licences)
- Pre-submission review of reports against revised clauses (IPX9, EMF, glass break, emergency battery/EDLC, etc.)

### 3. Documentation & portal filing
- Undertaking pack for remaining series models
- Standard-revision filing support in the CRS login
- Query handling through operative status under the revised standard

### 4. Design / CCL advisory (light-touch engineering bridge)
- Briefing notes for R&D on Part 1:2026 and section deltas
- Coordination with component suppliers where SELV control gear, batteries or EDLCs affect compliance

### 5. Post-switchover scope changes
- Adding new models only under the **2026** editions
- Marketplace / tender documentation alignment after grant

### Who should call us now
- Brands with active CRS licences still on **2012 / 2013 / 2017** IS 10322 Part 5 sections
- Factories with multiple LED categories or multiple plants
- Importers mid-application who still need a declaration path before the cut-off
- Teams that cannot spare internal bandwidth for parallel lab + portal work in the next weeks

## Talk to a Certko consultant

Share your **LED product type(s)**, **R-number(s)** and **target markets**. We will send a **migration plan, lab options and quote within 24 hours**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Product testing](/testing) · [Find a BIS lab](/labs) · [Search LED / lighting products](/products)

> **Disclaimer:** This article summarises the BIS *Guidelines for Implementation of Revised Standards for LED Luminaires* (20 March 2026) for general guidance. In case of any inconsistency, the Bureau of Indian Standards Act, 2016, the BIS Conformity Assessment Regulations, 2018, applicable Compulsory Registration Orders, and the official BIS guidelines prevail.
`,
  },
  {
    slug: "bis-july-2026-amendments-eight-indian-standards-january-2027",
    title:
      "BIS July 2026 Amendments: 8 Indian Standards Updated — Concurrent Running Ends 19 January 2027",
    excerpt:
      "BIS has established amendments to eight Indian Standards (bicycles, LPG cylinders, beverage cans, infant bottles, automotive RFID and more). Old editions stay valid only until 19 January 2027 — what manufacturers and licence holders should do now.",
    meta_title:
      "BIS July 2026 Amendments to 8 Indian Standards | Jan 2027 Deadline | Certko",
    meta_description:
      "Gazette-notified BIS amendments (20 July 2026) for IS 1281, IS 3196, IS 14407, IS 16722, IS 18427, IS 18800 and more. Concurrent running till 19 Jan 2027. Certko consulting for licence & lab transition.",
    published_at: "2026-07-28",
    content: `On **21 July 2026**, the Bureau of Indian Standards (Department of Consumer Affairs) notified that **amendments to eight Indian Standards** have been established. The English schedule was published in the *Gazette of India* (Extraordinary, Part III — Section 4) on **25 July 2026** (CG-DL-E-27072026-274864; Ref. HQ-PUB015/1/2020-PUB-BIS (1576)).

If you manufacture, import, brand or certify products under any of these standards — especially under **ISI / Scheme-I** or related conformity assessment — the clock is now running. Each amendment was **established on 20 July 2026**, and the **unamended standard remains in force only until 19 January 2027**.

That is roughly a **six-month concurrent-running window**. After 19 January 2027, continuing to design, test or mark against the old edition is a compliance risk.

## What the Gazette actually says

Under **Sub-rule (1) of Rule 15** of the Bureau of Indian Standards Rules, 2018, BIS notifies that the amendments listed in the schedule have been established. For every standard in this batch:

| Column | Meaning for your team |
| --- | --- |
| **Amendment established** | **20 July 2026** |
| **Date till which the standard *without* the amendment remains in force** | **19 January 2027** |

In plain language: you may still work to the previous text for a limited time, but you must plan the switch to the **amended** edition before that cut-off — including lab reports, licence updates, marking artwork and supplier declarations where your scheme requires them.

> This Gazette establishes the amendments and their concurrent-running dates. It does **not** reprint the clause-by-clause amendment text. Always download the official amendment from the BIS standards portal / sales channel for the exact technical changes that apply to your product family.

## The eight standards amended (July 2026)

| # | Indian Standard | Product / scope | Amendment | Concurrent end |
| --- | --- | --- | --- | --- |
| 1 | **IS 1281 : 2025** | Bicycles — Cranks and Chain Wheels — Specification (Fourth Revision) | Amendment No. 1, July 2026 | **19 Jan 2027** |
| 2 | **IS 3196 (Part 1) : 2013** | Welded low-carbon steel LPG cylinders (>5 L water capacity) — Specification (Sixth Revision) | Amendment No. 5, July 2026 | **19 Jan 2027** |
| 3 | **IS 14407 : 2023** | Aluminium cans for beverages — Specification (First Revision) | Amendment No. 1, July 2026 | **19 Jan 2027** |
| 4 | **IS 15841 : 2009** / ISO 11634:1996 | Snowboard-boots — Interface with ski-binding | Amendment No. 1, July 2026 | **19 Jan 2027** |
| 5 | **IS 16722 : 2018** | RFID system for automotive applications — Specification | Amendment No. 2, July 2026 | **19 Jan 2027** |
| 6 | **IS 17891 (Part 3) : 2023** / ISO 3601-3:2005 | Fluid power systems — O-rings — Part 3: Quality acceptance criteria | Amendment No. 1, July 2026 | **19 Jan 2027** |
| 7 | **IS 18427 : 2024** | Three-piece round open-top metal cans for foods and beverages — Specification | Amendment No. 1, July 2026 | **19 Jan 2027** |
| 8 | **IS 18800 : 2023** | Stainless steel feeding bottle for infants — Specification | Amendment No. 1, July 2026 | **19 Jan 2027** |

Several of these lines sit in **high-scrutiny** categories: pressurised LPG cylinders, infant feeding products, food-contact metal packaging, and automotive RFID. Even where a change looks “editorial”, licence holders should confirm whether **re-testing, drawing updates or marking changes** are required under their grant of licence / scheme rules.

## Why concurrent running still needs a project plan

A six-month window sounds comfortable until you map the real work:

1. **Buy / review the amendment** for every IS number in your licence or purchase order.
2. **Gap-assess** drawings, bill of materials, process controls and existing type-test reports.
3. **Book a BIS-recognised lab** (or in-house testing where the scheme allows) against the *amended* standard.
4. **Update licence / scheme paperwork** — standard revision, model addition, or essential-requirement update as applicable.
5. **Refresh marking, packaging and CoC language** so the Standard Mark and documents cite the correct edition.
6. **Align suppliers** (cylinder blanks, can stock, O-rings, RFID modules, bottle components) so incoming parts match the amended acceptance criteria.

Labs and certification queues tighten as January approaches. Teams that wait until December often discover the bottleneck is not the amendment text — it is **lab capacity and licence query cycles**.

## Sector snapshots — who should act first

### LPG cylinder manufacturers & brand owners (IS 3196 Part 1)
Amendment **No. 5** on a long-running Sixth Revision standard is a signal to re-check welding, material and inspection clauses used in your current type approval. For ISI-marked cylinders, treat this as a **licence hygiene** item: confirm with your licence terms whether an updated test report or drawing revision must be filed before **19 January 2027**.

### Beverage & food metal packaging (IS 14407, IS 18427)
Aluminium beverage cans and three-piece open-top food/beverage cans often sit in buyer-driven compliance packs (modern trade, exports, QSR supply chains). Even voluntary adoption of the amended IS becomes a **tender / vendor-audit** requirement. Align QA specs and incoming inspection to the amended editions early so you are not renegotiating contracts in Q1 2027.

### Infant products (IS 18800)
Stainless steel feeding bottles for infants attract heightened consumer and marketplace scrutiny. If you hold (or seek) BIS conformity for this line, plan amendment review + any required re-verification **before** the concurrent period ends — and update listing claims / Standard Mark artwork accordingly.

### Automotive RFID (IS 16722)
Amendment **No. 2** matters to OEMs and Tier suppliers embedding RFID in automotive applications. Cross-check against your PPAP / customer drawings so plant quality systems do not still reference the unamended 2018 text after January 2027.

### Bicycles — cranks & chain wheels (IS 1281 : 2025)
IS 1281 was only recently revised (2025). Amendment No. 1 arriving in July 2026 is a reminder that **new revisions still get quick technical corrections**. Cycle-component makers should not assume last year’s Fourth Revision file is “done”.

### Fluid-power O-rings (IS 17891 Part 3) & snowboard boots (IS 15841)
These are narrower niches, but the same calendar applies. Exporters quoting ISO-aligned IS adoptions should update customer dossiers so invoices and CoCs cite the amended Indian Standard where that is the contract reference.

## Practical checklist before 19 January 2027

1. List every **CM/L, R-number, or purchase spec** that cites any of the eight IS numbers above.
2. Download **Amendment No. x (July 2026)** for each applicable standard from BIS.
3. Run a **clause gap review** with design + QA (and your Certko consultant if you want an external pack).
4. Decide whether you need **fresh type tests**, partial re-tests, or documentation-only updates.
5. Book **[BIS-recognised labs](/labs)** with the amended standard in scope — search by IS number on Certko Labs or BIS LIMS.
6. File any required **standard revision / licence update** and clear queries while concurrent running is still open.
7. Update **marking artwork, packaging, CoC templates and ERP master data** to the amended edition.
8. Brief distributors and e-commerce teams so listings stop claiming the old unamended text after the cut-off.

## Scope of Certko consulting — turning a Gazette notice into a closed file

Most manufacturers do not struggle to *read* a Gazette table. They struggle to **translate it into licence-safe action** across plants, labs and paperwork. Certko’s consulting team helps you close that loop:

### 1. Applicability & risk scan
- Map your SKUs / licences to the eight amended standards
- Flag which lines need lab work vs documentation updates
- Highlight January 2027 exposure for ISI / scheme licences and buyer audits

### 2. Amendment gap pack
- Clause-level reading of the official amendment against your current drawings and reports
- Sample / lead-model matrix where re-testing is indicated
- Supplier questionnaire for critical parts (cylinder steel, can stock, RFID modules, bottle components, O-rings)

### 3. Lab & test coordination
- Shortlist of recognised labs with the right IS scope
- Pre-submission review so reports cite the **amended** edition
- Parallel planning when multiple plants or product families are affected

### 4. Licence / portal support
- Standard-revision and related filings under applicable BIS schemes
- Query handling through grant / operative status under the amended standard
- Marking and documentation alignment for marketplace and tender packs

### 5. Buyer & export documentation
- CoC / specification language updated for modern trade and OEM customers
- Evidence pack for audits that ask “which edition are you shipping to after Jan 2027?”

### Who should talk to us this week
- LPG cylinder plants on **IS 3196 (Part 1)**
- Can makers under **IS 14407** or **IS 18427**
- Infant bottle brands under **IS 18800**
- Automotive RFID suppliers under **IS 16722**
- Bicycle component makers on **IS 1281 : 2025**
- Any importer or brand whose **buyer PO still cites the unamended** edition

## Talk to a Certko consultant

Share your **product type**, **IS number(s)** and whether you already hold a **BIS licence**. We will send a **transition plan, lab options and consulting quote within 24 hours** — with a clear path to be amendment-ready before **19 January 2027**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Browse certifications](/certifications) · [Product testing](/testing) · [Find a lab](/labs)

> **Disclaimer:** This article summarises the BIS Gazette notification Ref. HQ-PUB015/1/2020-PUB-BIS (1576) (notified 21 July 2026; published 25 July 2026) for general guidance. It does not reproduce the full technical text of each amendment. In case of any inconsistency, the Bureau of Indian Standards Act, 2016, the BIS Rules, 2018, the BIS Conformity Assessment Regulations, 2018, the official Indian Standards / amendments, and any applicable Quality Control Orders or scheme guidelines prevail.
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
