import type Database from "better-sqlite3";
import { slugify } from "./format";

interface SeedService {
  name: string;
  product_category?: string;
  standards?: string;
  test_type?: string;
  accreditation?: string;
  summary?: string;
  content?: string;
  sort?: number;
}

interface SeedCategory {
  name: string;
  icon: string;
  summary: string;
  content: string;
  services: SeedService[];
}

const CATEGORIES: SeedCategory[] = [
  {
    name: "Chemical Testing",
    icon: "flask",
    summary:
      "Composition, heavy metals, leachables and chemical compliance testing for building materials, toys, cement, fertilizers, metals and more.",
    content: `## What chemical testing covers

Chemical testing confirms the composition and restricted-substance profile of materials and finished products against Indian and international standards.

### Typical scope
- Building materials and glazed ceramic tiles (IS 13630)
- Consumer products and toys (IS 9873 heavy metals)
- Cement, concrete and fly ash (IS 269, IS 3812)
- Fertilizers and agro inputs (IS 16702)
- Metals and alloys composition (ASTM E415 and equivalents)

### Accreditation
Tests are typically performed in **ISO/IEC 17025 / NABL** accredited laboratories.`,
    services: [
      {
        name: "Glazed Ceramic Tiles — Chemical",
        product_category: "Building Materials",
        standards: "IS 13630",
        test_type: "Chemical",
        summary: "Chemical analysis of glazed ceramic tiles for composition and compliance.",
        content:
          "Chemical testing of glazed ceramic tiles per IS 13630 to verify composition and quality parameters required for market access and project specifications.",
      },
      {
        name: "Plastic Toys — Heavy Metals",
        product_category: "Consumer Products",
        standards: "IS 9873",
        test_type: "Heavy Metals",
        summary: "Heavy-metal screening for plastic toys under IS 9873 toy safety requirements.",
        content:
          "Evaluate lead, cadmium and other restricted metals in plastic toys against IS 9873 to support safe consumer products and retail compliance.",
      },
      {
        name: "OPC 43 Grade Cement — Chemical",
        product_category: "Cement & Concrete",
        standards: "IS 269",
        test_type: "Chemical",
        summary: "Chemical analysis of ordinary Portland cement (43 grade) per IS 269.",
      },
      {
        name: "Fly Ash — Chemical",
        product_category: "Construction Materials",
        standards: "IS 3812",
        test_type: "Chemical",
        summary: "Chemical characterisation of fly ash for use in construction applications.",
      },
      {
        name: "Organic Fertilizer — Chemical",
        product_category: "Fertilizers",
        standards: "IS 16702",
        test_type: "Chemical",
        summary: "Chemical testing of organic fertilizers against IS 16702 parameters.",
      },
      {
        name: "Carbon Steel — Composition",
        product_category: "Metals & Alloys",
        standards: "ASTM E415",
        test_type: "Composition",
        summary: "Spectrometric composition analysis of carbon steel per ASTM E415.",
      },
    ],
  },
  {
    name: "Electrical Testing",
    icon: "zap",
    summary:
      "Safety, performance and compliance testing for lamps, appliances and electrical products against BIS and IEC-aligned standards.",
    content: `## Electrical product testing

Electrical testing validates safety and performance for luminaires, appliances and related equipment before certification or market launch.

### Sample scope
- LED lamps and luminaires (IS 16102)
- Insulation, leakage current, dielectric strength and abnormal operation
- Alignment with BIS / IEC safety regimes

Labs typically operate under **ISO/IEC 17025 / NABL** accreditation.`,
    services: [
      {
        name: "LED Lamp — Safety",
        product_category: "Electrical",
        standards: "IS 16102",
        test_type: "Safety",
        summary: "Safety testing of LED lamps against IS 16102 for BIS and retail readiness.",
        content:
          "Comprehensive LED lamp safety evaluation covering electrical, thermal and construction requirements under IS 16102.",
      },
    ],
  },
  {
    name: "EMC Testing",
    icon: "cpu",
    summary:
      "Electromagnetic compatibility and combined EMC/safety testing for adapters, electronics and IT equipment.",
    content: `## EMC & electronics testing

EMC testing ensures products neither emit excessive interference nor are unduly susceptible to it — often paired with safety checks for power electronics.

### Sample scope
- Power adapters and IT equipment (IS 13252)
- Emissions, immunity and combined EMC/safety packages`,
    services: [
      {
        name: "Power Adapter — EMC/Safety",
        product_category: "Electronics",
        standards: "IS 13252",
        test_type: "EMC/Safety",
        summary: "Combined EMC and safety testing for power adapters under IS 13252.",
        content:
          "EMC and electrical safety evaluation of power adapters to support BIS and export compliance pathways.",
      },
    ],
  },
  {
    name: "Physical Testing",
    icon: "cog",
    summary:
      "Mechanical and physical property testing for textiles, fabrics and engineered materials.",
    content: `## Physical & mechanical testing

Physical testing measures strength, dimensional and performance properties that define product quality and fitness for use.

### Sample scope
- Textile and fabric testing (IS 1969)
- Tensile, tear, abrasion and related physical parameters`,
    services: [
      {
        name: "Fabric — Physical",
        product_category: "Textiles",
        standards: "IS 1969",
        test_type: "Physical",
        summary: "Physical property testing of fabrics per IS 1969.",
        content:
          "Assess fabric physical properties under IS 1969 to support quality control, tenders and buyer specifications.",
      },
    ],
  },
  {
    name: "Microbiology Testing",
    icon: "microscope",
    summary:
      "Microbiological analysis for packaged foods and related products under FSSAI and lab accreditation frameworks.",
    content: `## Microbiology testing

Microbiology labs detect pathogens, hygiene indicators and spoilage organisms to protect consumers and meet food regulations.

### Sample scope
- Packaged food microbiology (FSSAI)
- Pathogen and hygiene indicator panels`,
    services: [
      {
        name: "Packaged Food — Microbiology",
        product_category: "Food",
        standards: "FSSAI",
        test_type: "Microbiology",
        summary: "Microbiological testing of packaged foods aligned with FSSAI expectations.",
        content:
          "Pathogen and hygiene testing for packaged foods to support FSSAI compliance and retail release.",
      },
    ],
  },
  {
    name: "Mechanical Testing",
    icon: "wrench",
    summary:
      "Strength, durability and mechanical performance testing for components, assemblies and industrial products.",
    content: `## Mechanical testing services

Mechanical testing evaluates load-bearing behaviour, durability and failure modes for metals, plastics and assemblies used in industrial and consumer products.`,
    services: [
      {
        name: "Tensile & Strength Testing",
        product_category: "Metals & Alloys",
        standards: "IS / ASTM (as applicable)",
        test_type: "Mechanical",
        summary: "Tensile, yield and elongation testing for metals and engineered materials.",
      },
      {
        name: "Durability & Fatigue Testing",
        product_category: "Industrial Components",
        standards: "Application-specific",
        test_type: "Mechanical",
        summary: "Cyclic loading and durability evaluation for components and assemblies.",
      },
    ],
  },
];

function defaultFaqs(categoryName: string): { question: string; answer: string }[] {
  return [
    {
      question: `What is covered under ${categoryName}?`,
      answer: `${categoryName} on Certko lists common product variants, standards and test types so you can identify the right lab scope before requesting a quote.`,
    },
    {
      question: "Are these tests NABL accredited?",
      answer:
        "Most scopes in this catalogue are performed in ISO/IEC 17025 / NABL accredited laboratories. Confirm the exact lab and scope on your quotation.",
    },
    {
      question: "How do I get a testing quote?",
      answer:
        "Open the specific test page, review the writeup and standards, then use Get Expert Help / Contact with your product details for a mapped quote.",
    },
  ];
}

function seedServiceFaqsIfEmpty(db: Database.Database) {
  const services = db
    .prepare("SELECT id, name, standards, test_type, accreditation FROM testing_services")
    .all() as {
    id: number;
    name: string;
    standards: string;
    test_type: string;
    accreditation: string;
  }[];
  const countFaq = db.prepare("SELECT COUNT(*) AS n FROM faqs WHERE scope = ?");
  const insFaq = db.prepare(
    "INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)"
  );

  for (const s of services) {
    const n = (countFaq.get(`test:${s.id}`) as { n: number }).n;
    if (n > 0) continue;
    const faqs = [
      {
        q: `What does “${s.name}” cover?`,
        a: `${s.name} covers the key parameters for this product/test type${
          s.standards ? ` under ${s.standards}` : ""
        }. Review the writeup on this page for scope details, then request a quote for your exact sample.`,
      },
      {
        q: "Which accreditation applies?",
        a: s.accreditation
          ? `This scope is typically run in ${s.accreditation} accredited laboratories. Confirm the exact lab and NABL scope on your quotation.`
          : "Most Certko-mapped scopes use ISO/IEC 17025 / NABL accredited laboratories. Confirm on your quotation.",
      },
      {
        q: "How do I get a quote for this test?",
        a: "Use Get Expert Help / Contact with your product name, target market and any buyer specification. We map the lab, sample size and indicative turnaround.",
      },
    ];
    faqs.forEach((f, i) => insFaq.run(`test:${s.id}`, f.q, f.a, i));
  }
}

export function ensureTestingCatalog(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS testing_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'microscope',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS testing_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES testing_categories(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      product_category TEXT NOT NULL DEFAULT '',
      standards TEXT NOT NULL DEFAULT '',
      test_type TEXT NOT NULL DEFAULT '',
      accreditation TEXT NOT NULL DEFAULT 'ISO/IEC 17025 / NABL',
      summary TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      UNIQUE(category_id, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_testing_services_cat ON testing_services(category_id);
    CREATE INDEX IF NOT EXISTS idx_testing_services_name ON testing_services(name);
  `);

  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM testing_categories").get() as { n: number }
  ).n;
  if (count > 0) {
    seedServiceFaqsIfEmpty(db);
    return;
  }

  const insCat = db.prepare(
    `INSERT INTO testing_categories (slug, name, icon, summary, content, image, meta_title, meta_description, sort)
     VALUES (@slug, @name, @icon, @summary, @content, '', @meta_title, @meta_description, @sort)`
  );
  const insSvc = db.prepare(
    `INSERT INTO testing_services
      (category_id, slug, name, product_category, standards, test_type, accreditation, summary, content, image, meta_title, meta_description, sort)
     VALUES
      (@category_id, @slug, @name, @product_category, @standards, @test_type, @accreditation, @summary, @content, '', @meta_title, @meta_description, @sort)`
  );
  const insFaq = db.prepare(
    `INSERT INTO faqs (scope, question, answer, sort) VALUES (?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    CATEGORIES.forEach((cat, i) => {
      const slug = slugify(cat.name);
      const info = insCat.run({
        slug,
        name: cat.name,
        icon: cat.icon,
        summary: cat.summary,
        content: cat.content,
        meta_title: `${cat.name} | Product Testing Services | Certko`,
        meta_description: cat.summary.slice(0, 155),
        sort: i + 1,
      });
      const categoryId = Number(info.lastInsertRowid);

      cat.services.forEach((svc, j) => {
        const svcSlug = slugify(svc.name);
        const summary =
          svc.summary ||
          `${svc.name} testing${svc.standards ? ` under ${svc.standards}` : ""}.`;
        insSvc.run({
          category_id: categoryId,
          slug: svcSlug,
          name: svc.name,
          product_category: svc.product_category || "",
          standards: svc.standards || "",
          test_type: svc.test_type || "",
          accreditation: svc.accreditation || "ISO/IEC 17025 / NABL",
          summary,
          content:
            svc.content ||
            `${summary}\n\nContact Certko for lab mapping, sample requirements and a formal quotation.`,
          meta_title: `${svc.name} Testing | Certko`,
          meta_description: summary.slice(0, 155),
          sort: svc.sort ?? j + 1,
        });
      });

      defaultFaqs(cat.name).forEach((f, fi) => {
        insFaq.run(`testcat:${slug}`, f.question, f.answer, fi);
      });
    });

    // Index page FAQs
    [
      {
        q: "What is Product Testing on Certko?",
        a: "Product Testing helps you search testing categories and individual test services — chemical, electrical, EMC, physical, microbiology and more — with writeups, standards and FAQs.",
      },
      {
        q: "How do I find the right test for my product?",
        a: "Use the search box on the Product Testing page or site search. Filter by category, then open the specific test for standards, accreditation notes and next steps.",
      },
      {
        q: "Can Certko arrange the laboratory testing?",
        a: "Yes. Share your product and target market via Contact / Get Expert Help and our team maps accredited labs and indicative costs.",
      },
    ].forEach((f, i) => insFaq.run("page:testing", f.q, f.a, i));
  });
  tx();
  seedServiceFaqsIfEmpty(db);
}
