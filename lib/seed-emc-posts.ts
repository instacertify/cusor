import type { SqliteDatabase } from "./sqlite";
import {
  upsertBlogPostCopyPreservingImage,
  type BlogPostSeed,
} from "./seed-blog-posts";

export type EmcPostSeed = BlogPostSeed;

function emcCta(angle: string): string {
  return `## Work with Certko + Instacertify on ${angle}

**Certko** is operated by **Instacertify Labs Private Limited**. Our EMI / EMC desk is built for manufacturers and brand owners who need chamber time, clean reports and a calendar that also respects MeitY / BIS safety work.

What we do on a typical engagement:

1. **Scope the right standards** — CISPR product family, IEC 61000 immunity set, Class A/B decision, CE / FCC / buyer matrix.
2. **Shortlist accredited labs** — chamber availability, indicative pricing and sample plan via [EMC testing](/testing) and [Find a lab](/labs).
3. **Run the programme** — pre-compliance advice, formal booking, setup review, failure triage and a buyer-ready report pack.
4. **Align with certification** — keep CRS / CE / FCC and EMC samples on one timeline so shipments are not blocked twice.

Send your **product name**, **block diagram or datasheet**, **target markets**, **power architecture** (AC / DC / battery) and any prior CB or EMC reports. You receive a **scoped test plan and quote within 24 hours**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [Product testing](/testing) · [Find a lab](/labs) · [Blog](/blog)`;
}

/**
 * EMI / EMC / CISPR topical posts.
 * Copy may be refreshed on boot; cover images are never overwritten (admin-owned).
 */
export const EMC_POSTS: EmcPostSeed[] = [
  {
    slug: "emi-emc-testing-services-cispr-meity-guide",
    title:
      "EMI & EMC Testing Services: CISPR Standards, MeitY Rules and a Practical Export Plan",
    excerpt:
      "Rewritten field guide to EMI/EMC testing — what CISPR and IEC 61000 actually cover, how MeitY/BIS safety differs from EMC, which lab services to book, and how Certko with Instacertify keeps your programme on schedule.",
    meta_title: "EMI & EMC Testing Services | CISPR & MeitY | Certko",
    meta_description:
      "Practical EMI/EMC testing guide: CISPR emissions, IEC 61000 immunity, MeitY/BIS vs export EMC, lab service menu, and Certko + Instacertify coordination for India and global markets.",
    published_at: "2026-08-15",
    content: `# EMI & EMC Testing Services: CISPR Standards, MeitY Rules and a Practical Export Plan

If your product plugs into mains, switches power at high frequency, drives LEDs, talks over cables or sits near radios, **EMI/EMC testing** is not optional paperwork — it is how you prove the design will not interfere with other equipment and will not collapse when the environment is noisy.

This revised guide is written for compliance managers, hardware leads and export teams who need a clear service map: **CISPR** for emissions, **IEC 61000** for immunity, **MeitY / BIS** for India’s electronics registration path, and a realistic way to use **Certko + Instacertify** without wasting chamber weeks.

## What EMI and EMC mean in a factory, not a textbook

| Term | Shop-floor meaning |
| --- | --- |
| **EMI (electromagnetic interference)** | The unwanted noise your product throws onto cables or into the air — or the noise that hits your product from outside |
| **EMC (electromagnetic compatibility)** | The full promise: limited emissions **and** enough immunity to keep working in a defined environment |
| **Emissions tests** | Lab measurements against CISPR (or FCC) limit lines |
| **Immunity tests** | Lab stresses using IEC 61000-4 methods (ESD, surge, burst, RF, dips) |

A quiet emissions plot with a fragile ESD design is still a failed market launch. Serious CE EMC files and OEM specs ask for **both sides**.

## The CISPR backbone of emissions testing

**CISPR** (International Special Committee on Radio Interference) is the family of product standards most accredited labs open first for emissions. The expensive mistake is booking “EMC” without naming the CISPR book.

| CISPR standard | Typical equipment | What the lab is really checking |
| --- | --- | --- |
| **CISPR 32** | IT, AV, multimedia, many docks / displays / set-top style products | Conducted + radiated emissions for multimedia/IT ports and enclosures |
| **CISPR 15** | Luminaires, LED lighting and similar | Lighting-specific emission limits and setups |
| **CISPR 14-1** | Household appliances, electric tools | Continuous and discontinuous (click) disturbance |
| **CISPR 14-2** | Same appliance/tool world | Immunity performance companion |
| **CISPR 11** | ISM / process / certain scientific & medical gear | Group/class based ISM emission framework |
| **CISPR 25** (and OEM manuals) | Automotive components | Vehicle-component EMC — specialised chambers |

Class **A** (industrial) versus Class **B** (residential / light commercial) changes the limit severity. Consumer-facing SKUs almost always need a **Class B** story unless the buyer explicitly accepts industrial placement.

## MeitY / ministry pathways vs full EMC — do not confuse the two

India’s **Ministry of Electronics and Information Technology (MeitY)** Compulsory Registration Orders push many electronics into **BIS CRS** (safety registration). Platforms are moving large IT/AV families from older IS 13252 / IS 616 thinking toward **IS/IEC 62368-1**.

| Need | What it proves | Typical evidence |
| --- | --- | --- |
| **MeitY → BIS CRS** | Safety registration to make/sell notified goods in India | BIS-recognised lab safety report + CRS grant |
| **CE EMC / UKCA** | Essential EMC requirements for Europe-style markets | CISPR emissions + IEC 61000 immunity pack |
| **FCC** | US emissions rules for digital / ISM devices | FCC methods (related physics, different paperwork) |
| **OEM / retailer gate** | Contractual technical file | Whatever the customer’s EMC annex says |

**CRS does not automatically equal a full CISPR programme.** Many teams still should start **EMI pre-compliance early**, because the same PCB stack-up, cable set and enclosure bonding decisions decide both thermal/safety behaviour and EMC margin.

Certko’s job in the first call is to write a one-page matrix: *India mandatory now* versus *destination EMC mandatory for the PO*.

## EMI/EMC testing services you should actually put on a purchase order

1. **Conducted emissions** — disturbance leaving on power (and sometimes telecom) lines  
2. **Radiated emissions** — chamber / site field-strength measurements  
3. **Harmonics & flicker** — IEC 61000-3-2 / 3-3 (and related) for many mains EU paths  
4. **Immunity battery** — IEC 61000-4-2 (ESD), -4-3 (radiated RF), -4-4 (EFT), -4-5 (surge), -4-6 (conducted RF), -4-8 (magnetic), -4-11 / -4-34 (dips)  
5. **Pre-compliance / debug** — cheaper iteration before “certification mode”  
6. **System testing** — host + adapter + longest cables as shipped, not a naked PCB  

Browse the EMC entry points under [Product testing](/testing).

## Sample and document pack that keeps labs honest

Bring more than a pretty prototype:

- Production-intent hardware and firmware (not a muted demo build)  
- Block diagram, highest internal frequencies, wireless modules list  
- Cable schedule with lengths and shield termination notes  
- Intended markets and any existing CB / prior EMC reports  
- Written pass target: CISPR edition, class, immunity levels, performance criterion A/B/C  

## Project timeline that usually works

| Week | Activity |
| --- | --- |
| 0 | Scope CISPR + immunity + MeitY/export matrix with Certko |
| 1 | Pre-compliance scan on risky ports / clocks |
| 2–3 | Design fixes (filter, bonding, cable, firmware edges) |
| 3–5 | Formal emissions + immunity at accredited lab |
| Parallel | BIS/CRS or other safety samples on their own track |

Chamber queues slip when everyone books in the same export season — lock slots after scoping, not after the commercial invoice is frozen.

## Read the companion articles

- [CISPR conducted & radiated emissions (revised)](/blog/cispr-conducted-radiated-emissions-testing)  
- [IEC 61000 immunity testing services (revised)](/blog/iec-61000-emc-immunity-testing-services)  
- [CISPR product-family map for IT, lighting, appliances & ISM](/blog/cispr-standards-product-family-emi-emc-map)  
- [How Certko and Instacertify run EMI/EMC programmes](/blog/certko-instacertify-emi-emc-testing-help)

${emcCta("full EMI / EMC scoping")}

> **Disclaimer:** Standard editions, limit classes and scheme rules change. Confirm the applicable CISPR / IEC text, MeitY / BIS notification and destination regulation for your exact model before irreversible lab bookings.
`,
  },
  {
    slug: "cispr-conducted-radiated-emissions-testing",
    title:
      "CISPR Conducted and Radiated Emissions Testing — How Labs Measure Noise and Why Cargo Gets Held",
    excerpt:
      "Revised deep dive into CISPR conducted and radiated emissions: LISN setups, chambers, Class A vs B, SMPS/IoT failure patterns, MeitY-aware planning, and how Instacertify via Certko prepares a fix-ready lab plan.",
    meta_title: "CISPR Conducted & Radiated Emissions Testing | Certko",
    meta_description:
      "Rewritten guide to CISPR conducted and radiated emissions testing — measurement intent, Class A/B, common failures, and Certko + Instacertify lab coordination for exporters.",
    published_at: "2026-08-15",
    content: `# CISPR Conducted and Radiated Emissions Testing — How Labs Measure Noise and Why Cargo Gets Held

When a forwarder, notified body or overseas buyer asks for “EMI reports”, they almost always mean **emissions evidence** against a **CISPR** product standard (or an FCC method that follows the same physics). This rewritten article focuses on the two services that decide most first-time failures: **conducted emissions** and **radiated emissions**.

## Conducted emissions — the noise that rides your cables

Conducted testing measures high-frequency disturbance leaving the product on **power lines** (and, in some standards, telecom or other wired ports).

### What the lab physically does
- Places the equipment under test (EUT) on a defined table / setup  
- Inserts a **LISN / AMN** so the mains impedance is repeatable  
- Sweeps the relevant band (commonly starting around 150 kHz up through tens of MHz, per standard)  
- Applies the detectors the edition requires (quasi-peak, average, RMS-average, etc.)

### Why modern products fail conducted limits
- Fast **SMPS / LED driver** edges without enough common-mode filtering  
- Weak CM choke or Y-capacitor strategy  
- Shield drains that are decorative rather than bonded  
- Measuring a quiet firmware mode that customers never use  

**Instacertify tip:** treat the **shipping power adapter + host** as the EUT whenever that is how the product leaves India or your free-zone warehouse.

## Radiated emissions — the noise that leaves through the air

Radiated tests measure field strength in a **semi-anechoic chamber**, fully anechoic room or open-area site at the distance the standard names (often 3 m or 10 m class setups).

### Usual radiators on a failing board
- Uncontrolled clocks, DDR / video lanes and switching nodes  
- Cable bundles acting as antennas  
- Enclosure slots, display openings and poor gasket compression  
- Wireless modules whose harmonics were never budgeted into the limit line  

If conducted is “clean” but radiated fails, look at **cables and enclosure bonding** before rewriting the entire power stage.

## Which CISPR book owns your limit line?

| Product story | Emissions standard to name on the PO |
| --- | --- |
| IT / AV / multimedia hosts and accessories | **CISPR 32** |
| Luminaires / lighting controlgear in scope | **CISPR 15** |
| Household appliances and electric tools | **CISPR 14-1** |
| ISM / process equipment | **CISPR 11** |
| Automotive modules | **CISPR 25** + OEM manuals |

Marketing names do not choose the standard — the **product definition inside CISPR** does. Certko writes that rationale before you pay for chamber days.

## Class A vs Class B — the silent rejection

| Class | Typical environment | Commercial risk |
| --- | --- | --- |
| **A** | Industrial / commercial heavy | Often unacceptable for home / retail shelves |
| **B** | Residential / light commercial | What most consumer POs expect |

Passing Class A and “hoping” a retail buyer accepts it is how containers sit while you redesign.

## MeitY planning without mixing programmes

For **MeitY-notified CRS products**, the mandatory India file is still the **safety / registration** path under BIS. Parallel **CISPR emissions** work unlocks **CE EMC**, many **US** filings and OEM quality gates. Certko sequences both so chamber weeks are not booked after the DG or buyer cut-off.

## What to ask the lab to quote (line items)

1. Formal **conducted emissions** to the named CISPR edition  
2. Formal **radiated emissions** with setup photos and cable map  
3. **Pre-compliance** scans for debug (cheaper iteration)  
4. Engineering support loop when margins are thin  
5. Report pack suitable for NB / buyer / certification consultants  

## Failure → first-fix table used on Instacertify programmes

| Symptom | First checks |
| --- | --- |
| Conducted QP over limit near switching frequency | Input filter, CM choke, PCB return paths |
| Radiated broadband hump | Cable dressing, enclosure bonding, clock edges |
| Passes on bench PSU, fails on production adapter | System EUT definition wrong |
| Passes Class A, buyer wants Class B | Hardware margin — not a certificate rename |
| Fails only with longest HDMI/USB loom | Cable common-mode control and clamp ferrites |

## Related reading

- [EMI/EMC services & MeitY overview (revised)](/blog/emi-emc-testing-services-cispr-meity-guide)  
- [IEC 61000 immunity services (revised)](/blog/iec-61000-emc-immunity-testing-services)  
- [CISPR product-family map](/blog/cispr-standards-product-family-emi-emc-map)  
- [Certko × Instacertify EMC help](/blog/certko-instacertify-emi-emc-testing-help)

${emcCta("conducted & radiated emissions programmes")}

> **Disclaimer:** Distances, detectors and limit lines are edition-specific. Use the CISPR text cited on your test request form; this article is educational guidance.
`,
  },
  {
    slug: "iec-61000-emc-immunity-testing-services",
    title:
      "IEC 61000 EMC Immunity Testing — ESD, Surge, EFT, RF and Dips That Catch Real Field Failures",
    excerpt:
      "Revised immunity guide: how IEC 61000-4 tests pair with CISPR emissions, what ESD/surge/EFT/RF/dips prove, performance criteria A/B/C, and how Certko + Instacertify build a resilient validation pack.",
    meta_title: "IEC 61000 EMC Immunity Testing Services | Certko",
    meta_description:
      "Rewritten IEC 61000 immunity testing guide — ESD, EFT, surge, radiated/conducted RF, voltage dips — plus how Certko and Instacertify help electronics teams clear CE and buyer EMC gates.",
    published_at: "2026-08-16",
    content: `# IEC 61000 EMC Immunity Testing — ESD, Surge, EFT, RF and Dips That Catch Real Field Failures

Emissions answers: *how loud is my product?* Immunity answers: *does it keep working when the world is loud?* This revised article is for teams that already booked CISPR scans — or are about to — and still need a serious **IEC 61000** immunity package for CE EMC, industrial OEMs or retailer technical files.

## Where IEC 61000 sits beside CISPR

| Layer | Standards you will hear | Question |
| --- | --- | --- |
| Emissions | **CISPR** product books | Does the product pollute the spectrum? |
| Basic immunity methods | **IEC 61000-4-x** | How do we apply disturbance X repeatably? |
| Product immunity performance | e.g. **CISPR 35**, **CISPR 14-2**, IEC product/generic norms | Which levels and pass criteria apply to *this* product? |
| Mains quality (often with CE files) | **IEC 61000-3-2 / 3-3** | Harmonics and flicker into the supply |

CISPR is not a substitute for immunity. A Class B emissions pass can still reboot under ESD or brown-out.

## Immunity services worth naming on the quote

### Electrostatic discharge — IEC 61000-4-2
Simulates charged operators touching enclosures, buttons and connector shells. Watch USB, HDMI, metal bezels and floating LEDs.

### Radiated RF immunity — IEC 61000-4-3
Chamber RF fields that mimic phones, Wi-Fi and broadcast energy. Spot-frequency / sweep strategies follow the product standard.

### Electrical fast transient / burst — IEC 61000-4-4
Fast bursts on power and signal lines — classic commercial building noise from switching loads and relays.

### Surge — IEC 61000-4-5
Combination-wave energy that stresses SPDs, bridge rectifiers and earth references. Long outdoor feeds feel this first.

### Conducted RF — IEC 61000-4-6
RF injected onto cables when the coupling path is conductive rather than purely radiated.

### Power-frequency magnetic field — IEC 61000-4-8
Relevant near transformers, busbars and heavy plant.

### Voltage dips & interruptions — IEC 61000-4-11 (and -4-34 for higher current)
Proves behaviour when mains sags. This is where “it works in the office” products fail on site.

## Performance criteria — negotiate before you test

Immunity is not only smoke / no-smoke. Product standards use **performance criteria** (commonly A, B, C):

| Criterion | Plain meaning | Buyer impact |
| --- | --- | --- |
| **A** | Normal performance during the test | Often demanded for critical functions |
| **B** | Temporary degradation, self-recovers | Acceptable for some secondary features |
| **C** | Needs user action / power cycle | Frequently rejected in OEM annexes |

Write the required criterion into the lab PO. Discovering it after a Criterion C result wastes the slot.

## India MeitY note (revised for clarity)

Immunity is rarely the headline document inside a **MeitY CRS** safety file. It becomes critical when you also need:

- **CE marking** under the EMC Directive  
- Industrial / medical-adjacent OEM audits  
- Gulf or European retail technical files  
- Closure of field returns already blamed on ESD or surge  

Certko’s model: run **CISPR emissions + IEC 61000 immunity** against the destination checklist while BIS / MeitY safety uses its own sample set when required.

## Briefing checklist for Instacertify

Send these five items and we can price a real matrix, not a vague “EMC lump sum”:

1. Ports list (power, Ethernet, USB, sensors, displays)  
2. Enclosure material and earthing / bonding scheme  
3. Firmware recovery behaviour you consider acceptable  
4. Target markets + customer EMC annex (if any)  
5. Whether transmitters stay active in the mode under test  

## Related reading

- [EMI/EMC overview & MeitY](/blog/emi-emc-testing-services-cispr-meity-guide)  
- [Conducted & radiated emissions](/blog/cispr-conducted-radiated-emissions-testing)  
- [CISPR product-family map](/blog/cispr-standards-product-family-emi-emc-map)  
- [How Certko + Instacertify help](/blog/certko-instacertify-emi-emc-testing-help)

${emcCta("IEC 61000 immunity campaigns")}

> **Disclaimer:** Exact levels, dwell times and criteria come from the product standard edition on your quotation. Confirm with the accredited laboratory before testing.
`,
  },
  {
    slug: "cispr-standards-product-family-emi-emc-map",
    title:
      "CISPR Standards Map for EMI/EMC Testing — IT, Lighting, Appliances and ISM Compared",
    excerpt:
      "Revised CISPR selector for hardware and compliance teams: when to use CISPR 32, 15, 14-1/14-2 or 11, how MeitY/export rules interact, and how Certko stops wrong-standard chamber spend.",
    meta_title: "CISPR Standards Map for EMI/EMC Testing | Certko",
    meta_description:
      "Rewritten CISPR 32, 15, 14 and 11 product-family map for EMI/EMC testing services — with MeitY/export notes and Certko + Instacertify lab scoping.",
    published_at: "2026-08-16",
    content: `# CISPR Standards Map for EMI/EMC Testing — IT, Lighting, Appliances and ISM Compared

Most EMC budgets do not die in the chamber. They die in **scoping** — when a team buys “EMC testing” without locking the **CISPR product family**, then learns the report cannot support CE, the buyer, or the next SKU in the same housing.

This revised map is the conversation Certko runs before Instacertify places a lab purchase order.

## Sixty-second selector

| If the product is mainly… | Open this book first | Also budget |
| --- | --- | --- |
| Laptops docks, STBs, info displays, IT accessories, multimedia hosts | **CISPR 32** | Immunity via **CISPR 35** / IEC set named by your NB |
| LED luminaires and lighting controlgear | **CISPR 15** | Harmonics/flicker on many EU mains paths; safety separately |
| Mixers, vacuums, tools, many household appliances | **CISPR 14-1** | **CISPR 14-2** immunity where applicable |
| Industrial heaters, process RF, certain ISM apparatus | **CISPR 11** | Group/class rules; sometimes in-situ work |
| Vehicle modules | **CISPR 25** | OEM EMC manuals usually dominate |

Smart lamps with Wi-Fi, appliances with large displays, or tools with USB ports are **borderline**. Demand a written rationale — Certko drafts it with the lab so the quotation is defensible.

## CISPR 32 — multimedia & IT emissions (enriched notes)

**Use when** the primary function is information technology, audio-video or multimedia.

- Host + adapter are often one **system EUT**  
- Telecom ports may need dedicated conducted setups  
- Agree wireless simultaneous-operation strategy with the lab  
- Class B is the default consumer expectation  

## CISPR 15 — lighting equipment

**Use when** luminaires / modules / controlgear sit in lighting EMC scope.

- LED drivers are prolific conducted emitters — design filters early  
- “Lamp + speaker + camera” hybrids may pull you toward multimedia thinking; resolve **before** samples travel  
- Keep photometric and safety samples on a separate track from EMC  

## CISPR 14-1 & 14-2 — appliances and tools

**Use when** household and similar appliances or electric tools apply.

- Motors and mechanical switching create click / discontinuous patterns the standard treats carefully  
- Battery + mains hybrids need an explicit mode matrix  
- **14-2** brings immunity so the product does not misbehave beside kitchen radios and ISM noise  

## CISPR 11 — ISM equipment

**Use when** industrial, scientific or medical equipment falls under the ISM emission framework (including intentional non-communications RF in many cases).

- Group / class language differs from CISPR 32’s Class A/B storytelling  
- Large apparatus may involve installation / in-situ considerations  
- Never force an ISM product into a multimedia template just to reuse a quote  

## MeitY, BIS and export — one matrix, two truths

| Programme | Primary proof | EMC angle |
| --- | --- | --- |
| **MeitY CRS / BIS** | Safety registration for notified electronics | Run samples/timelines in parallel with EMC if you also export |
| **Other Indian QCOs / ISI** | Scheme I safety / factory path | Add EMC only when the standard or buyer demands it |
| **CE EMC / UKCA** | Emissions + immunity for EU essential requirements | Heavy CISPR + IEC 61000 |
| **FCC** | US emissions compliance | Related physics, different methods and filings |

Certko returns a **market × standard one-pager** so purchasing does not issue three conflicting lab POs.

## SKU-family strategy that saves money without cheating

1. Pick a honest **worst-case** configuration (clocks, I/O, cable length).  
2. Document series similarity for engineering judgement the lab/NB can accept.  
3. Re-test after changes to **power architecture, shielding, cable set or wireless module**.  
4. Keep an EMC revision table next to safety and SDS files — reports go stale when hardware drifts.

## Related guides

- [EMI/EMC services overview](/blog/emi-emc-testing-services-cispr-meity-guide)  
- [Conducted & radiated deep dive](/blog/cispr-conducted-radiated-emissions-testing)  
- [IEC 61000 immunity](/blog/iec-61000-emc-immunity-testing-services)  
- [Certko + Instacertify help](/blog/certko-instacertify-emi-emc-testing-help)

${emcCta("CISPR product-family scoping")}

> **Disclaimer:** Product definitions inside CISPR publications govern applicability. When unsure, obtain written confirmation from the accredited laboratory or notified body for your model.
`,
  },
  {
    slug: "certko-instacertify-emi-emc-testing-help",
    title:
      "How Certko and Instacertify Help You Clear EMI/EMC Testing — From CISPR Scope to Report Pack",
    excerpt:
      "Revised playbook: how Certko, backed by Instacertify, runs EMI/EMC programmes — CISPR & IEC 61000 mapping, MeitY-aware calendars, accredited lab booking, debug loops and buyer-ready reports.",
    meta_title: "Certko & Instacertify EMI/EMC Testing Help | Certko",
    meta_description:
      "Rewritten guide to Certko and Instacertify EMI/EMC support — CISPR emissions, IEC 61000 immunity, lab coordination and export-ready report packs for electronics manufacturers.",
    published_at: "2026-08-17",
    content: `# How Certko and Instacertify Help You Clear EMI/EMC Testing — From CISPR Scope to Report Pack

Chamber hours are expensive. A wrong-standard quote is more expensive. **Certko**, operated by **Instacertify Labs Private Limited**, turns EMI/EMC into a managed project — not a scramble after a buyer rejection or a MeitY launch date moves left.

This revised playbook shows exactly what “help” means on an Instacertify EMC engagement.

## Problems we inherit every week

- Functional bring-up finished with **no EMC margin budget**  
- PO demands **CE / FCC / OEM EMC** while **MeitY CRS** safety is still in queue  
- Vendor quote says only “EMC testing” with **no CISPR number**  
- Lab sample uses debug firmware that **hides** the shipping build’s noise  
- PDF reports arrive that nobody can defend in a retailer technical query  

## What great help looks like (step by step)

### 1. Standards and ministry-aware scoping
We map your SKU to the correct **CISPR** emissions book and **IEC 61000** immunity set, then overlay MeitY / BIS, CE, FCC or Gulf buyer requirements so mandatory gates are obvious.

### 2. Lab fit — not logo shopping
Using Certko’s [labs](/labs) and [testing](/testing) workflows, we shortlist accredited facilities with the right chamber, LISN sets and turnaround — including indicative commercial bands.

### 3. Sample and mode matrix
Operating modes, cable sets and worst-case population are written down so the report matches what you ship.

### 4. Pre-compliance before formal burn
New SMPS designs, first IoT enclosures and tight Class B targets get a **debug loop** before certification-mode slots are consumed.

### 5. Failure triage with your design owner
When quasi-peak lines breach, you receive a structured next-step list (filter, ground, cable, firmware clocks) instead of a shrug and a retest invoice.

### 6. One calendar with safety certification
EMI/EMC rarely travels alone. We align EMC samples with [BIS / CRS](/certifications/bis) and other Certko tracks so logistics sees one timeline.

## Engagement snapshot

| Phase | You receive |
| --- | --- |
| Kickoff (24h quote target) | Market × standard matrix, lab options, commercial estimate |
| Prep | Sample instructions, mode list, document checklist |
| Execution | Booking, query handling, setup photo review |
| Close | Report pack + guidance on series-model reuse |

## Who should start a conversation now

- Power adapter, LED driver, IT/AV and appliance exporters  
- Brands facing retailer EMC checklists for the first time  
- Factories migrating platforms while old reports are on life support  
- Teams that already **failed** conducted or radiated emissions once  

## Companion articles (all revised)

1. [EMI/EMC testing services & CISPR + MeitY guide](/blog/emi-emc-testing-services-cispr-meity-guide)  
2. [Conducted & radiated emissions under CISPR](/blog/cispr-conducted-radiated-emissions-testing)  
3. [IEC 61000 immunity testing services](/blog/iec-61000-emc-immunity-testing-services)  
4. [CISPR product-family map](/blog/cispr-standards-product-family-emi-emc-map)

${emcCta("end-to-end EMI / EMC delivery")}

> **Disclaimer:** Certko / Instacertify provide consulting and lab coordination. Accreditation decisions, measurement uncertainty and pass/fail judgements remain with the testing laboratory and, where applicable, the certification body or authority.
`,
  },
];

export function ensureEmcPosts(db: SqliteDatabase) {
  // Refresh article copy when seed text changes; never touch posts.image (admin-owned).
  upsertBlogPostCopyPreservingImage(db, EMC_POSTS);
}
