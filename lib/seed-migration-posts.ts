import type { SqliteDatabase } from "./sqlite";
import { insertBlogPostsIfMissing, type BlogPostSeed } from "./seed-blog-posts";

type MigrationPostSeed = BlogPostSeed;

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
    slug: "why-hire-bis-certification-consultant",
    title:
      "Why Hire a BIS Certification Consultant? It Looks Simple — Until Delays and Extra Lab Costs Hit",
    excerpt:
      "You can apply for BIS yourself, but a consultant helps negotiate lab pricing, file faster, avoid scope mistakes, stop unnecessary testing spend, and catch minor issues before they become expensive later.",
    meta_title:
      "Why Hire a BIS Certification Consultant? | Cost, Speed & Scope | Certko",
    meta_description:
      "Why hire a BIS consultant even if self-application looks simple: better lab rates, faster filing, fewer mistakes, smarter scope, less unwanted testing cost and long-term risk control. Get Certko help.",
    published_at: "2026-07-28",
    content: `Applying for **BIS certification** can look straightforward on paper: open a portal account, send a sample to a lab, upload a report, pay fees, get a licence or R-number. Many manufacturers and importers therefore ask — *why should I hire a consultant at all?*

The honest answer: **self-application is possible**, but a good consultant does not exist to “make paperwork mysterious”. They exist to protect **time, money and scope** — especially when one wrong model decision, one incomplete filing or one unnecessary test suite can add weeks and lakhs.

If you are mapping whether your product needs **ISI Mark** or **CRS**, start with Certko’s product database and scheme notes on [Products](/products), the [BIS certification overview](/certifications/bis) and the practical [BIS guide](/guide).

## “I can apply myself” — what that usually misses

Portal screens are simple. Compliance outcomes are not. Teams that self-file often underestimate:

- Which **IS standard / scheme** actually applies to their exact SKU ([search products](/products/all))
- Whether the path is **CRS (no onsite audit)** or **ISI (includes factory inspection)** — see scheme differences on [BIS / ISI Mark](/certifications/bis)
- How to pick a **BIS-recognised lab** that is fast *and* commercially fair ([Labs directory](/labs))
- How to avoid testing variants you do not need — and missing the lead model you do need
- How minor drawing, marking or CCL gaps become **surveillance / renewal problems** later

A consultant’s job is to compress that learning curve into a controlled project.

## 1. Better lab testing prices (negotiation & lab fit)

Laboratory testing is often the largest variable cost in a BIS project. Rates for the same standard can differ sharply between labs, and so can queues.

A consultant who regularly books [BIS-recognised laboratories](/labs) can usually help you:

- Shortlist labs with the right **scope** for your standard (not just the cheapest PDF quote)
- Compare **turnaround vs price** so “cheap” does not become “stuck for 8 weeks”
- Structure the sample matrix so you are not paying for duplicate or out-of-scope tests
- Negotiate from real market benchmarks rather than a single cold enquiry

Self-applicants often accept the first quote. That alone can erase any “savings” from skipping professional help.

Explore testing options on [Product testing](/testing) and compare facilities on [Labs](/labs).

## 2. A faster, cleaner way to apply

Speed rarely comes from clicking Submit earlier. It comes from **submitting complete, correct files the first time**.

Consultants accelerate BIS work by:

- Preparing portal-ready documentation in the order BIS reviewers expect
- Aligning CRS account registration → lab booking → application upload so idle gaps shrink (especially for electronics under [CRS](/certifications/bis))
- Running ISI inspection readiness in parallel with lab testing when Scheme I applies
- Answering BIS queries with precise technical replies instead of back-and-forth guesswork

If your goal is marketplace go-live or a tender deadline, use [Get Expert Help](/contact) early — not after the first rejection.

## 3. Avoid filing mistakes and unnecessary delays

Most BIS delays are not “BIS is slow”. They are **preventable file defects**:

- Wrong scheme selected (ISI vs CRS)
- Incomplete manufacturer / brand / factory details
- Test report that does not match the model / series claimed in the application
- Missing undertakings, labelling proofs or AIR documents for foreign manufacturers
- Uploading an old-standard report during a revision window

Each query cycle costs calendar time. A consultant’s filing discipline exists to keep you off that loop. Practical process context sits in our [BIS guide](/guide) and product-level pages under [Products](/products).

## 4. Stop leakage from unwanted testing and cost

“Test everything, just in case” feels safe. Commercially it is a leak.

Without scope control, companies often:

- Test colourways or accessories that are **not required** as separate lead models
- Repeat full suites after a small design change that only needed limited re-testing
- Send samples to a lab whose scope forces extra clauses you could have avoided with a better lab match
- Discover mid-project that the chosen standard family was wrong — and restart testing

A consultant designs the **minimum sufficient** test plan for grant — then expands only when the licence strategy needs it. That is how you protect cash without gambling on non-compliance.

Cross-check categories and standards via [Product search](/products/all) before you lock a lab PO.

## 5. Better scope decisions = fewer chances taken

Scope is strategy, not paperwork:

- Which models are **lead models** vs series variants?
- One licence / registration or split by factory / brand?
- Is [BEE labelling](/certifications/bee) also required for the same appliance?
- Do wireless SKUs also need [WPC / ETA](/certifications/wpc-eta)?
- For imports, is the overseas factory on **FMCS**, **CRS**, or a brand-authorised route?

Wrong scope creates two failure modes: **under-certifying** (customs / marketplace risk) or **over-certifying** (money and time burned). Consultant-led scope workshops exist to choose deliberately — not by chance.

Browse the full scheme landscape on [Certifications](/certifications).

## 6. Minor issues today become expensive issues later

BIS is not only “get the certificate”. After grant you still face:

- Marking and labelling consistency
- Surveillance / renewal readiness (especially ISI)
- Standard revisions and migration windows (electronics teams know this well — see our [blog](/blog) on CRS migrations)
- Adding new models without breaking the existing licence story
- Buyer, tender and marketplace audits that re-open old gaps

A consultant helps you treat small non-conformities — unclear CCL notes, weak in-house test evidence, ambiguous model coding — as **cheap fixes now**, not licence threats later. That long-term view is one of the highest-ROI parts of hiring help.

## 7. So is a consultant always important?

If your team already runs BIS files every month, has a dedicated compliance owner, and knows your standard cold, selective self-filing can work — with a consultant on call for sticky queries.

For everyone else — first-time applicants, importers, multi-SKU brands, factories facing a QCO deadline, or teams that cannot afford a failed inspection / rejected CRS file — **having a consultant while you apply for BIS certification is a commercial control, not a luxury**.

You are not paying for someone to “click the portal for you”. You are paying for:

| Outcome | What you protect |
| --- | --- |
| Better lab price & fit | Testing budget |
| Faster clean filing | Launch / tender calendar |
| Fewer mistakes | Query loops and idle weeks |
| No unwanted testing | Cash leakage |
| Smarter scope | Risk vs over-spend |
| Early fix of minor issues | Renewals, surveillance, migrations |

## How Certko helps as your BIS consultant

Certko is built as a practical BIS workbench plus consulting desk:

1. **Product & scheme mapping** — confirm ISI vs CRS and the IS standard on [Products](/products)  
2. **Lab plan** — shortlist and compare [BIS-recognised labs](/labs) and [testing services](/testing)  
3. **Filing & coordination** — documentation, portal application, query handling  
4. **Inspection readiness (ISI only)** — CRS stays lab + portal focused with **no onsite audit**  
5. **After-grant hygiene** — marking, model addition and revision awareness  

## Talk to a Certko BIS consultant

Share your **product name**, **HS code** (if known), **factory location** and target timeline. We will send a **compliance plan, lab options and quote within 24 hours**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [BIS certification](/certifications/bis) · [Browse products](/products) · [Find a lab](/labs) · [Read the BIS guide](/guide) · [More on the blog](/blog)

> **Disclaimer:** This article is general guidance on when professional BIS consulting adds value. Exact scheme rules, fees and timelines depend on the applicable Quality Control Order, Compulsory Registration Order, Indian Standard and current BIS portal practice. Always verify against official BIS notifications for your product.
`,
  },
];

export function ensureMigrationPosts(db: SqliteDatabase) {
  // Insert-only: never updates existing posts or their admin-managed cover images.
  insertBlogPostsIfMissing(db, MIGRATION_POSTS);
}
