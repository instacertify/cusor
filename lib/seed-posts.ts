export interface PostSeed {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  published_at: string;
}

export const POSTS: PostSeed[] = [
  {
    slug: "bis-certification-cost-breakdown",
    title: "What Does BIS Certification Really Cost? A Complete Breakdown",
    excerpt:
      "Lab testing, government fees, marking fees, consultants — here is where every rupee goes in a typical ISI or CRS application, and where you can save.",
    author: "Certko Team",
    published_at: "2026-07-10",
    image: "/images/blog/cost-breakdown.png",
    content: `Manufacturers usually ask us one question first: **"what will this cost?"** The honest answer is "it depends on the standard" — but the structure of the cost is the same for almost every product. Here is the full picture.

## 1. Laboratory testing — the biggest variable

Sample testing at a BIS-recognised lab is usually the largest single line item. Across the 1,400+ products in our database, reported charges range from a few thousand rupees for simple chemical tests to several lakhs for large electrical equipment. Two things drive the number:

- **The standard's test plan.** A cement standard needs weeks of physical curing tests; a small appliance needs a full IS 302-series safety sequence.
- **The lab you choose.** The same standard can cost 2–4x more at one lab than another. Always compare — every product page on Certko lists the approved labs with reported prices.

## 2. BIS government fees

Application fees and licence fees are fixed and published, and they are modest compared to testing — typically a few thousand rupees at each stage.

## 3. Marking fees

Once your licence is granted, an **annual marking fee** applies for the use of the Standard Mark. It is slabbed by unit size: large units pay the full rate, small units roughly half, and micro units about a fifth. Our product pages show the indicative fee for each slab.

## 4. Consultants (optional)

A consultant typically charges a fixed professional fee to manage documentation, lab coordination and the factory inspection. Whether it is worth it depends on your team's bandwidth — mistakes in the technical file are the most common cause of delays, and delays usually cost more than the fee.

## Where to save

1. Compare lab prices before committing — this is the single biggest lever.
2. Bundle varieties into one application where the standard allows it.
3. Prepare in-house test equipment early so the factory inspection passes first time.

Search your product on Certko to see its real cost range, or ask us for an itemised quote — it is free and takes a day.`,
  },
  {
    slug: "qco-deadlines-how-to-prepare",
    title: "A QCO Deadline Is Coming for Your Product. Here's Your 90-Day Plan",
    excerpt:
      "Quality Control Orders keep adding products to India's mandatory certification list. A practical countdown plan for manufacturers and importers.",
    author: "Certko Team",
    published_at: "2026-07-18",
    image: "/images/blog/qco-plan.png",
    content: `When a Quality Control Order is notified, the clock starts. After the enforcement date, your product cannot be manufactured, imported, stored or sold in India without BIS certification. Here is the plan we run with clients who have about 90 days.

## Days 1–10: Confirm scope

Match your exact product variants to the IS standard named in the order. This step is where most mistakes happen — a standard often has parts and sections, and your licence must cover the right one. Check the QCO status of your product on Certko first.

## Days 10–30: Documentation and samples

Prepare the application: factory details, plant and machinery list, in-house test equipment, quality control plan, and trademark proof. In parallel, book a testing slot — labs get congested as deadlines approach, and slots are the bottleneck you cannot compress later.

## Days 30–70: Testing and inspection readiness

While samples are in the lab, set up the in-house testing station the standard requires. BIS officers verify it during the factory inspection; a missing instrument is the most common reason for a second visit — and a second visit usually costs you 3–4 weeks.

## Days 70–90: Queries and grant

Respond to BIS queries the day they arrive. Most applications that miss deadlines lose the time here, not in testing.

## If you have less than 90 days

Prioritise the lab slot above everything else, and consider a consultant to run the file in parallel. Check the current enforcement dates on our QCO Alerts page — several orders have separate, later timelines for small and micro units, which may buy you room.`,
  },
  {
    slug: "amazon-bis-number-guide",
    title: "Amazon Wants a BIS Number on Your Listing. Here's What That Means",
    excerpt:
      "Marketplaces now verify BIS and CRS numbers for notified products. What the compliance field expects, who the certification must belong to, and how to fix a delisting.",
    author: "Certko Team",
    published_at: "2026-07-24",
    image: "/images/blog/amazon-bis.png",
    content: `If you sell toys, appliances, electronics, helmets, pressure cookers or any other notified product on Amazon, Flipkart or Meesho, you have probably seen the compliance prompt: **add a valid BIS number or the listing goes down.**

## What number are they asking for?

It depends on your product's scheme:

- **CRS products** (electronics and IT) — the registration number, usually formatted like "R-XXXXXXXX", issued per brand and per manufacturing site.
- **ISI products** (most other notified goods) — the licence number (CM/L-XXXXXXX) covering the specific IS standard and variety.

Search your product on Certko to see which scheme applies and under which IS standard.

## Whose name must be on it?

The certification belongs to the **manufacturer**, not the seller. If you resell a brand, the brand's certification covers you — provided the product, brand and factory on the certificate match what you sell. If you import, the overseas factory itself must hold BIS certification; a trader cannot substitute their own.

## Delisted? The fastest route back

1. Confirm the exact product and standard (not just the category).
2. If a valid certification exists for the product, add the number in the listing's compliance field and appeal — reinstatement is usually quick.
3. If not, testing at the most economical approved lab is the critical path. CRS registrations complete in roughly 6–10 weeks; ISI licences take longer because of the factory inspection.

## Before you list anything new

Check the QCO status first. Products that are voluntary today can be notified with an enforcement date — certifying before the deadline is dramatically cheaper than recovering from a delisting after it. Our marketplace guide covers the full seller checklist.`,
  },
];
