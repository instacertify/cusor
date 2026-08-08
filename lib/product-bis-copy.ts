import type { SqliteDatabase } from "./sqlite";
import { formatPriceRange } from "./format";

/** CRS (Scheme II) — lab + portal registration; no BIS onsite factory audit. */
export function crsProcessMarkdown(standard: string, timeline: string): string {
  const std = standard || "the applicable Indian Standard";
  return `## Typical process (CRS — no onsite factory audit)

Products under the **Compulsory Registration Scheme (CRS / Scheme II)** do **not** require a BIS onsite factory audit. Certification is completed through portal registration and testing at a BIS-empaneled laboratory:

1. **Register your BIS CRS account** – create / complete the manufacturer (or brand) registration on the BIS CRS portal and get approved as an applicant.
2. **Send the product to a BIS-empaneled lab** – submit samples for testing against **${std}** at a BIS-recognised laboratory.
3. **Get the test results** – collect the complete test report(s) for your model / series.
4. **Apply for CRS certification** – upload the report and required documents in the CRS portal.
5. **Pay the fees** – clear the applicable government / registration fees on the portal.
6. **Get approved & sell** – after grant you receive the registration (R-number), apply the Standard Mark as required, and you are ready to sell in India.

Typical timeline once samples and paperwork are ready: **${timeline}** (lab queue and portal queries can extend this).`;
}

/** ISI Mark (Scheme I) — includes factory inspection. */
export function isiProcessMarkdown(standard: string, timeline: string): string {
  const std = standard || "the applicable Indian Standard";
  return `## Typical process (ISI Mark — includes factory inspection)

1. **Standard & scope check** – confirm your exact product variant maps to **${std}**.
2. **Documentation** – factory details, quality control records, test equipment list and trademark proof.
3. **Sample testing** – testing at a BIS-recognised lab against every clause of the standard.
4. **Factory inspection (onsite audit)** – BIS officers audit the manufacturing site and verify in-house testing capability.
5. **Grant of licence** – on successful evaluation, the ISI mark licence is issued, typically within **${timeline}**.`;
}

export function buildProductWriteup(opts: {
  name: string;
  standard: string;
  category: string;
  scheme: string;
  labCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  timeline: string;
}): string {
  const {
    name,
    standard,
    category,
    scheme,
    labCount,
    minPrice,
    maxPrice,
    timeline,
  } = opts;
  const price = formatPriceRange(minPrice, maxPrice);
  const std = standard || "the applicable Indian Standard";
  const isCrs = scheme === "CRS";
  const lines: string[] = [];
  lines.push(
    `## Why ${name} needs BIS certification\n\n${name} falls under the ${category} category and is covered by **${std}**. Manufacturers and importers must obtain the ${
      isCrs
        ? "Compulsory Registration Scheme (CRS) registration"
        : "ISI mark licence"
    } from the Bureau of Indian Standards before the product can be manufactured, imported, stored or sold in India. Selling a notified product without a valid BIS licence can lead to seizure of stock, marketplace delisting and penalties under the BIS Act, 2016.`
  );
  if (isCrs) {
    lines.push(
      `## Important: CRS has no onsite audit\n\n**${name}** is covered under **CRS (Scheme II)**. Unlike ISI Mark licences, CRS does **not** involve a BIS factory / onsite audit. You register on the BIS CRS portal, test at a BIS-empaneled lab, apply with the report, pay fees and get approved — then you are ready to sell.`
    );
  }
  lines.push(
    `## Testing & costs\n\nSample testing for ${std} is currently available at **${labCount} BIS-recognised ${
      labCount === 1 ? "laboratory" : "laboratories"
    }** across India. Reported test charges range from **${price}** (excluding GST), depending on the laboratory, the number of models/varieties and the tests included in the scope. Certko can help you pick a lab that balances cost, turnaround time and location.`
  );
  lines.push(
    isCrs
      ? crsProcessMarkdown(standard, timeline)
      : isiProcessMarkdown(standard, timeline)
  );
  return lines.join("\n\n");
}

export function buildProductFaqs(opts: {
  name: string;
  standard: string;
  scheme: string;
  labCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  timeline: string;
}): { question: string; answer: string }[] {
  const { name, standard, scheme, labCount, minPrice, maxPrice, timeline } = opts;
  const price = formatPriceRange(minPrice, maxPrice);
  const std = standard || "the applicable Indian Standard";
  const isCrs = scheme === "CRS";
  return [
    {
      question: `Is BIS certification mandatory for ${name}?`,
      answer: `Yes. ${name} is notified under ${std}, which means a valid BIS ${
        isCrs ? "CRS registration" : "ISI mark licence"
      } is required before the product can be manufactured, imported or sold in India.`,
    },
    {
      question: `Does ${name} need a BIS factory / onsite audit?`,
      answer: isCrs
        ? `No. ${name} falls under **CRS (Scheme II)**, which does **not** require an onsite factory audit. The path is: register on the BIS CRS portal → test at a BIS-empaneled lab → get results → apply for certification → pay fees → get approved and sell.`
        : `Yes. ${name} follows the **ISI Mark (Scheme I)** route, which includes sample testing at a BIS-recognised lab plus a **factory inspection (onsite audit)** by BIS officers before the licence is granted.`,
    },
    {
      question: `How much does BIS testing cost for ${name}?`,
      answer: `Laboratory test charges for ${std} currently range from ${price} (excluding GST) across ${labCount} BIS-recognised ${
        labCount === 1 ? "lab" : "labs"
      }. Total certification cost additionally includes BIS application / registration fees, marking fees where applicable and consultant charges if you use one.`,
    },
    {
      question: `How long does certification take for ${name}?`,
      answer: isCrs
        ? `Most CRS applicants complete the process in ${timeline}: portal registration, lab testing at a BIS-empaneled laboratory, application filing and fee payment. There is no factory audit step. Timelines vary with lab workload and portal queries.`
        : `Most applicants complete the process in ${timeline}, covering documentation, sample testing and the factory inspection. Timelines vary with lab workload and how quickly queries from BIS are resolved.`,
    },
    {
      question: `Which labs can test ${name}?`,
      answer: `${labCount} BIS-recognised ${
        labCount === 1 ? "laboratory is" : "laboratories are"
      } currently approved to test against ${std}. Use the lab list on this page to compare locations and indicative prices, or ask Certko to shortlist a BIS-empaneled lab for you.`,
    },
    {
      question: `Can Certko handle the entire BIS process for ${name}?`,
      answer: isCrs
        ? `Yes. Certko helps with CRS account registration, lab coordination at BIS-empaneled labs, application filing, fee payment follow-up and grant tracking — without any factory-audit step. Request a free quote and we respond within 24 hours.`
        : `Yes. Certko's experts manage the end-to-end process — application drafting, technical file preparation, lab coordination, factory inspection readiness and licence grant follow-up. Request a free quote and we respond within 24 hours.`,
    },
  ];
}

/**
 * Refresh copy on existing CRS product pages so they no longer imply an onsite audit.
 * Also clarifies CRS vs ISI on the BIS certification page and /guide when stale.
 * Safe to run on every boot.
 */
export function ensureCrsProductCopy(db: SqliteDatabase) {
  const products = db
    .prepare(
      `SELECT p.id, p.name, p.standard, p.scheme, p.lab_count, p.min_price, p.max_price, p.timeline,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE UPPER(p.scheme) = 'CRS'`
    )
    .all() as {
    id: number;
    name: string;
    standard: string;
    scheme: string;
    lab_count: number;
    min_price: number | null;
    max_price: number | null;
    timeline: string;
    category_name: string | null;
  }[];

  const updateDesc = db.prepare("UPDATE products SET description = ? WHERE id = ?");
  const delFaqs = db.prepare("DELETE FROM faqs WHERE scope = ?");
  const insFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (const p of products) {
      const timeline = p.timeline || "6-10 weeks";
      const writeup = buildProductWriteup({
        name: p.name,
        standard: p.standard || "",
        category: p.category_name || "Electronics",
        scheme: "CRS",
        labCount: p.lab_count || 0,
        minPrice: p.min_price,
        maxPrice: p.max_price,
        timeline,
      });
      updateDesc.run(writeup, p.id);

      const scope = `product:${p.id}`;
      delFaqs.run(scope);
      const faqs = buildProductFaqs({
        name: p.name,
        standard: p.standard || "",
        scheme: "CRS",
        labCount: p.lab_count || 0,
        minPrice: p.min_price,
        maxPrice: p.max_price,
        timeline,
      });
      faqs.forEach((f, i) => insFaq.run(scope, f.question, f.answer, i));
    }

    // Keep the public BIS certification page accurate for CRS (no onsite audit).
    const bis = db
      .prepare("SELECT id, content FROM certifications WHERE slug = 'bis'")
      .get() as { id: number; content: string } | undefined;
    if (bis && !/no onsite factory audit/i.test(bis.content)) {
      db.prepare("UPDATE certifications SET content = ? WHERE id = ?").run(
        `## What it covers

BIS certification is administered by the Bureau of Indian Standards and applies to hundreds of notified products — from cement, steel and cables to appliances, toys and footwear. It comes in three main flavours:

- **ISI Mark (Scheme I)** — testing plus factory / onsite inspection; required for most industrial and consumer products under QCOs.
- **CRS (Scheme II)** — lab-test-based registration for electronics and IT products. **No onsite factory audit** — register on the BIS CRS portal, test at a BIS-empaneled lab, apply with the report, pay fees and get approved.
- **FMCS** — the Foreign Manufacturers Certification Scheme, the ISI route for factories outside India.

## When it is mandatory

Whenever a Quality Control Order covering your product is in force. Use our product database to check your product's QCO status instantly — every product page shows whether certification is mandatory, upcoming or voluntary.

## Typical process

### CRS products (no onsite audit)
1. Register your account on the BIS CRS portal and get approved as manufacturer / brand applicant.
2. Send samples to a BIS-empaneled (recognised) laboratory.
3. Get the test results.
4. Apply for CRS certification on the portal.
5. Pay the fees and get the R-number — then you are ready to sell.

### ISI / FMCS products
1. Map the product to its Indian Standard (IS).
2. Prepare the application and technical file.
3. Sample testing at a BIS-recognised laboratory.
4. Factory inspection (onsite audit).
5. Grant of licence, followed by annual marking fees and surveillance.

## Cost drivers

Laboratory testing charges (the largest variable — compare labs in our directory), BIS application and licence / registration fees, annual marking fees by unit size (where applicable), and consultant fees if you outsource the paperwork.`,
        bis.id
      );
    }

    // Refresh /guide body when it still omits the explicit CRS no-audit path.
    const guide = db
      .prepare("SELECT slug, content FROM pages WHERE slug = 'guide'")
      .get() as { slug: string; content: string } | undefined;
    if (guide && !/CRS products skip this onsite audit step/i.test(guide.content || "")) {
      const updated = (guide.content || "").replace(
        /### 2\. Compulsory Registration Scheme \(CRS \/ Scheme II\)[\s\S]*?## Step-by-step process[\s\S]*?5\. \*\*Grant of licence\*\*[^\n]*/,
        `### 2. Compulsory Registration Scheme (CRS / Scheme II)

A registration model used mostly for **electronics and IT products**. CRS does **not** require a BIS onsite factory audit. The practical path is:

1. Register your account on the **BIS CRS portal** and get approved as a manufacturer / brand applicant  
2. Send samples to a **BIS-empaneled (recognised) laboratory**  
3. Get the test results  
4. Apply for CRS certification on the portal  
5. Pay the fees  
6. Get approved (R-number) — then you are ready to sell  

Registration is typically per brand / product family and manufacturing location.

## Step-by-step process

1. **Identify the standard** — confirm which IS standard covers your exact product variant. Certko's database maps 1,400+ products to their standards and whether the scheme is **ISI** or **CRS**.
2. **Prepare documentation / portal registration** — for CRS, complete BIS CRS account registration first; for ISI, prepare factory and quality-control documentation (and AIR details for foreign manufacturers where required).
3. **Sample testing** — submit samples to a BIS-recognised / empaneled lab approved for your standard. Test charges vary widely between labs, so compare before committing.
4. **Factory inspection (ISI only)** — BIS officers verify in-house testing capability and production process. **CRS products skip this onsite audit step.**
5. **Apply, pay fees & grant** — file on the relevant portal, pay fees, clear queries, and receive the licence / R-number. Renewals and surveillance follow as applicable.`
      );
      if (updated !== guide.content) {
        db.prepare("UPDATE pages SET content = ? WHERE slug = 'guide'").run(updated);
      }
    }
  });
  tx();
}
