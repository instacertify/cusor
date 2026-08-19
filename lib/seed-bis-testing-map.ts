import type { SqliteDatabase } from "./sqlite";
import { normalizeIsNo } from "./seed";
import { slugify } from "./format";

/**
 * Every BIS product standard is a testing standard. This ensure maps each unique
 * `products.standard` into the Product Testing catalogue under the right
 * discipline category, and links products via `product_testing_services`.
 */

const BIS_STD_SLUG_PREFIX = "bis-std-";

/** Industry category slug → primary testing discipline. */
const INDUSTRY_TO_TESTING: Record<string, string> = {
  "electrical-and-electronics": "electrical-testing",
  "electrical-appliances": "electrical-testing",
  "cables-and-wires": "electrical-testing",
  "lpg-and-gas-equipment": "electrical-testing",
  "cement-and-construction-materials": "chemical-testing",
  chemicals: "chemical-testing",
  "paints-coatings-and-adhesives": "chemical-testing",
  "pesticides-and-agro-chemicals": "chemical-testing",
  "petroleum-and-lubricants": "chemical-testing",
  "soaps-detergents-and-cosmetics": "chemical-testing",
  "glass-and-ceramics": "chemical-testing",
  "pvc-and-plastic-products": "chemical-testing",
  "food-dairy-and-beverages": "microbiology-testing",
  textiles: "physical-testing",
  "medical-devices-and-textiles": "physical-testing",
  "paper-and-packaging": "physical-testing",
  footwear: "physical-testing",
  "leather-products": "physical-testing",
  "rubber-products": "physical-testing",
  "wood-and-plywood-products": "physical-testing",
  "furniture-and-storage": "physical-testing",
  "steel-products": "mechanical-testing",
  "non-ferrous-metals": "mechanical-testing",
  "automotive-and-cycle-components": "mechanical-testing",
  "machinery-tools-and-instruments": "mechanical-testing",
  "pumps-valves-and-irrigation": "mechanical-testing",
  "hardware-and-fittings": "mechanical-testing",
  "pressure-cookers": "mechanical-testing",
  "fire-safety-products": "mechanical-testing",
  "safety-and-ppe": "mechanical-testing",
  helmets: "mechanical-testing",
  toys: "chemical-testing",
  others: "mechanical-testing",
};

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  standard: string;
  scheme: string;
  category_id: number;
  category_slug: string;
  category_name: string;
  min_price: number | null;
  max_price: number | null;
  timeline: string;
};

function pickTestingCategorySlug(
  industrySlug: string,
  scheme: string,
  productName: string,
  standard: string
): string {
  const hay = `${productName} ${standard}`.toLowerCase();
  if (/\bemc\b|\bcispr\b|\bradiat|\bemission|\bimmunity|\brf\b/i.test(hay)) {
    return "emc-testing";
  }
  // CRS electronics often need both safety + EMC; park under electrical by default.
  if (
    (scheme || "").toUpperCase() === "CRS" &&
    (industrySlug === "electrical-and-electronics" ||
      industrySlug === "electrical-appliances")
  ) {
    return "electrical-testing";
  }
  return INDUSTRY_TO_TESTING[industrySlug] || "mechanical-testing";
}

function testTypeForCategory(testingSlug: string): string {
  switch (testingSlug) {
    case "chemical-testing":
      return "Chemical / composition";
    case "electrical-testing":
      return "Electrical safety";
    case "emc-testing":
      return "EMC / EMI";
    case "physical-testing":
      return "Physical";
    case "microbiology-testing":
      return "Microbiology";
    case "mechanical-testing":
      return "Mechanical";
    default:
      return "BIS product testing";
  }
}

function defaultsForDiscipline(testingSlug: string): {
  timeline: string;
  sample_size: string;
} {
  switch (testingSlug) {
    case "emc-testing":
      return {
        timeline: "12–18 working days",
        sample_size: "2–3 production units + accessories",
      };
    case "electrical-testing":
      return {
        timeline: "10–15 working days",
        sample_size: "5–10 production units (lab-confirmed)",
      };
    case "microbiology-testing":
      return {
        timeline: "5–10 working days",
        sample_size: "As per FSSAI / lab sampling plan",
      };
    case "chemical-testing":
      return {
        timeline: "7–12 working days",
        sample_size: "100–500 g representative sample (or as per IS)",
      };
    default:
      return {
        timeline: "7–14 working days",
        sample_size: "Specimen set as per standard (lab-confirmed)",
      };
  }
}

function displayStandard(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function serviceSlugForKey(key: string): string {
  const body = slugify(key.toLowerCase()) || "standard";
  return `${BIS_STD_SLUG_PREFIX}${body}`.slice(0, 80);
}

function buildContent(opts: {
  standard: string;
  categoryName: string;
  testingName: string;
  products: { name: string; slug: string; scheme: string }[];
}): string {
  const productLines = opts.products
    .slice(0, 24)
    .map((p) => `- [${p.name}](/product/${p.slug}) (${p.scheme || "BIS"})`)
    .join("\n");
  const more =
    opts.products.length > 24
      ? `\n\n_…and ${opts.products.length - 24} more BIS-notified products under this standard._`
      : "";

  return `## ${opts.standard} laboratory testing

${opts.standard} is a **BIS certification testing standard**. Products notified under this IS must be tested in recognised laboratories before ISI Mark / CRS registration can proceed.

### Discipline
Mapped under **${opts.testingName}** based on the typical product family (**${opts.categoryName}**).

### What labs typically evaluate
- Conformance to the clauses in ${opts.standard}
- Safety / performance / material checks required for the notified product
- Report pack suitable for BIS application and surveillance

### BIS products covered by this standard
${productLines}${more}

### Next step
Share your product datasheet / HSN and target scheme (ISI or CRS). Certko maps the lab scope, indicative cost and booking path.
`;
}

/**
 * Upsert testing services for every unique BIS product standard and link products.
 * Safe to re-run: uses deterministic `bis-std-*` slugs and INSERT OR IGNORE on joins.
 */
export function ensureBisStandardsInTestingCatalog(db: SqliteDatabase): void {
  const testingCats = db
    .prepare("SELECT id, slug, name FROM testing_categories")
    .all() as { id: number; slug: string; name: string }[];
  if (testingCats.length === 0) return;

  const existingCount = Number(
    (
      db.prepare("SELECT COUNT(*) AS n FROM testing_services").get() as
        | { n: number | string }
        | undefined
    )?.n ?? 0
  );
  // Warm Hostinger boots: remapping thousands of BIS standards blocks the event
  // loop and the panel SIGTERMs ("Server is not running"). Skip when already seeded.
  if (existingCount >= 200) return;

  const catBySlug = new Map(testingCats.map((c) => [c.slug, c]));

  const products = db
    .prepare(
      `SELECT p.id, p.name, p.slug, p.standard, p.scheme, p.category_id,
              p.min_price, p.max_price, p.timeline,
              c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE TRIM(IFNULL(p.standard, '')) != ''
       ORDER BY p.id`
    )
    .all() as ProductRow[];
  if (products.length === 0) return;

  // Group by normalized IS key
  const groups = new Map<string, ProductRow[]>();
  for (const p of products) {
    const key = normalizeIsNo(p.standard);
    if (!key) continue;
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }

  // Index existing services by normalized standards for reuse / linking
  const existingServices = db
    .prepare(
      `SELECT id, category_id, slug, standards FROM testing_services`
    )
    .all() as {
    id: number;
    category_id: number;
    slug: string;
    standards: string;
  }[];

  const serviceIdByNormKey = new Map<string, number>();
  for (const s of existingServices) {
    const k = normalizeIsNo(s.standards || "");
    if (k && !serviceIdByNormKey.has(k)) serviceIdByNormKey.set(k, s.id);
    // Also index by our deterministic slug
    if (s.slug.startsWith(BIS_STD_SLUG_PREFIX)) {
      const fromSlug = s.slug.slice(BIS_STD_SLUG_PREFIX.length).toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (fromSlug && !serviceIdByNormKey.has(fromSlug)) {
        serviceIdByNormKey.set(fromSlug, s.id);
      }
    }
  }

  const findExistingId = (key: string): number | undefined => {
    if (serviceIdByNormKey.has(key)) return serviceIdByNormKey.get(key);
    // Prefix match: seed "IS 13252" should cover "IS13252P1" (not the reverse).
    for (const [k, id] of serviceIdByNormKey) {
      if (k.length >= 5 && key.startsWith(k)) return id;
    }
    return undefined;
  };

  const insertSvc = db.prepare(
    `INSERT INTO testing_services
      (category_id, slug, name, product_category, standards, test_type, accreditation,
       timeline, sample_size, min_price, max_price, price_note, summary, content, image,
       meta_title, meta_description, sort)
     VALUES
      (@category_id, @slug, @name, @product_category, @standards, @test_type, @accreditation,
       @timeline, @sample_size, @min_price, @max_price, @price_note, @summary, @content, '',
       @meta_title, @meta_description, @sort)`
  );

  const updateBisSvc = db.prepare(
    `UPDATE testing_services SET
       name = @name,
       product_category = @product_category,
       standards = @standards,
       test_type = @test_type,
       timeline = @timeline,
       sample_size = @sample_size,
       min_price = @min_price,
       max_price = @max_price,
       price_note = @price_note,
       summary = @summary,
       content = @content,
       meta_title = @meta_title,
       meta_description = @meta_description
     WHERE id = @id AND slug LIKE 'bis-std-%'`
  );

  const link = db.prepare(
    `INSERT INTO product_testing_services (product_id, testing_service_id, sort)
     VALUES (?, ?, ?)
     ON CONFLICT(product_id, testing_service_id) DO NOTHING`
  );

  const getIdByCatSlug = db.prepare(
    "SELECT id FROM testing_services WHERE category_id = ? AND slug = ?"
  );

  let sortBase = 100;
  const tx = db.transaction(() => {
    for (const [key, rows] of groups) {
      // Vote industry category
      const industryVotes = new Map<string, number>();
      for (const r of rows) {
        industryVotes.set(
          r.category_slug,
          (industryVotes.get(r.category_slug) || 0) + 1
        );
      }
      let topIndustry = rows[0].category_slug;
      let topCount = 0;
      for (const [slug, n] of industryVotes) {
        if (n > topCount) {
          topCount = n;
          topIndustry = slug;
        }
      }
      const representative =
        rows.find((r) => r.category_slug === topIndustry) || rows[0];
      const testingSlug = pickTestingCategorySlug(
        topIndustry,
        representative.scheme,
        representative.name,
        representative.standard
      );
      const testingCat = catBySlug.get(testingSlug) || catBySlug.get("mechanical-testing");
      if (!testingCat) continue;

      const standardLabel = displayStandard(representative.standard);
      const industryName = representative.category_name;
      const mins = rows
        .map((r) => r.min_price)
        .filter((n): n is number => n != null && n > 0);
      const maxs = rows
        .map((r) => r.max_price)
        .filter((n): n is number => n != null && n > 0);
      const minPrice = mins.length ? Math.min(...mins) : null;
      const maxPrice = maxs.length ? Math.max(...maxs) : minPrice;
      const defaults = defaultsForDiscipline(testingCat.slug);
      const testType = testTypeForCategory(testingCat.slug);
      const slug = serviceSlugForKey(key);
      const name =
        rows.length === 1
          ? `${rows[0].name} — ${standardLabel} Testing`
          : `${standardLabel} Testing`;
      const summary = `${standardLabel} is a BIS product testing standard for ${industryName.toLowerCase()} (${rows.length} notified product${
        rows.length === 1 ? "" : "s"
      }). Book laboratory testing required for ISI Mark / CRS certification.`;
      const content = buildContent({
        standard: standardLabel,
        categoryName: industryName,
        testingName: testingCat.name,
        products: rows.map((r) => ({
          name: r.name,
          slug: r.slug,
          scheme: r.scheme,
        })),
      });
      const metaTitle = `${standardLabel} Testing | ${testingCat.name} | Certko`.slice(
        0,
        70
      );
      const metaDescription = summary.slice(0, 158);

      let serviceId = findExistingId(key);

      // Prefer our deterministic slug if present under the chosen category
      const bySlug = getIdByCatSlug.get(testingCat.id, slug) as
        | { id: number }
        | undefined;
      if (bySlug) serviceId = bySlug.id;

      if (serviceId) {
        // Refresh copy only for auto-mapped bis-std rows; still link products for any match
        updateBisSvc.run({
          id: serviceId,
          name: name.slice(0, 200),
          product_category: industryName,
          standards: standardLabel,
          test_type: testType,
          timeline: defaults.timeline,
          sample_size: defaults.sample_size,
          min_price: minPrice,
          max_price: maxPrice,
          price_note:
            "Indicative BIS lab charges from product records — confirm with the laboratory.",
          summary,
          content,
          meta_title: metaTitle,
          meta_description: metaDescription,
        });
      } else {
        insertSvc.run({
          category_id: testingCat.id,
          slug,
          name: name.slice(0, 200),
          product_category: industryName,
          standards: standardLabel,
          test_type: testType,
          accreditation: "ISO/IEC 17025 / NABL (BIS-recognised labs)",
          timeline: defaults.timeline,
          sample_size: defaults.sample_size,
          min_price: minPrice,
          max_price: maxPrice,
          price_note:
            "Indicative BIS lab charges from product records — confirm with the laboratory.",
          summary,
          content,
          meta_title: metaTitle,
          meta_description: metaDescription,
          sort: sortBase++,
        });
        const created = getIdByCatSlug.get(testingCat.id, slug) as
          | { id: number }
          | undefined;
        serviceId = created?.id;
        if (serviceId) serviceIdByNormKey.set(key, serviceId);
      }

      if (!serviceId) continue;

      rows.forEach((r, i) => {
        link.run(r.id, serviceId!, i);
      });
    }
  });

  tx();
}
