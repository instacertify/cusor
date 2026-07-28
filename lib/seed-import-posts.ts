import type { SqliteDatabase } from "./sqlite";

type ImportPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  content: string;
};

const CTA = `## Talk to a Certko import-compliance consultant

Share your **product name**, **HS code**, **country of origin** and whether you already have overseas CE / FCC / UL / CCC evidence. We will send a **India compliance map + lab/licence plan + quote within 24 hours**.

[Get Expert Help](/contact) · [Contact Instacertify](/contact) · [BIS & certifications](/certifications) · [Product testing](/testing) · [Find a lab](/labs) · [Search products](/products)`;

const DISCLAIMER = `> **Disclaimer:** This guide is for general awareness of common India import compliance routes. Exact obligations depend on the current Quality Control Orders (QCOs), Compulsory Registration Orders, FSSAI regulations, Legal Metrology rules, and CPCB EPR guidelines applicable to your SKU and date of import. Always verify the live notification text and seek scheme-specific advice before shipping.`;

/**
 * Import-into-India compliance guides for major product families.
 * Inserted on boot if the slug is missing.
 */
export const IMPORT_POSTS: ImportPostSeed[] = [
  {
    slug: "import-electronics-india-bis-crs-wpc-epr-ewaste-guide",
    title:
      "Importing Electronics into India: BIS CRS, WPC, EPR E-Waste & Packaging Checklist",
    excerpt:
      "Bringing phones, laptops, adapters, audio gear or IoT from China, EU, US, Korea or Taiwan? Map BIS CRS, WPC/ETA, EPR e-waste, battery EPR and plastic packaging before your first commercial shipment.",
    meta_title:
      "Import Electronics to India — BIS CRS, WPC, EPR E-Waste Guide | Certko",
    meta_description:
      "Compliance checklist for importing consumer electronics into India: BIS CRS, WPC/ETA, EPR e-waste, battery EPR, plastic packaging EPR and labelling. Certko consulting for importers.",
    published_at: "2026-07-28",
    content: `India is one of the world’s fastest-growing destinations for smartphones, IT equipment, audio-video products, power adapters, wearables and smart-home devices. Brands shipping from **China, Taiwan, South Korea, Vietnam, the EU, the UK and the United States** often assume CE, FCC or CCC evidence is “enough”. In India it is not — you need a **local compliance stack** before customs clearance and marketplace listing stay reliable.

This guide is a practical driving checklist for electronics importers and Indian brand owners sourcing finished goods or CKD/SKD kits.

## Typical origin markets & what they already have

| Origin | Common overseas marks | What still fails in India |
| --- | --- | --- |
| **China / Taiwan / Vietnam** | CCC, SRRC (wireless), factory ISO | No BIS R-number; no India EPR registrations |
| **EU / UK** | CE, UKCA, RED, RoHS, WEEE | CE ≠ BIS; WEEE ≠ India EPR e-waste |
| **USA** | FCC, UL, Energy Star | FCC helps RF design, not BIS CRS grant |
| **Korea / Japan** | KC, PSE, MIC | Still need India CRS + WPC where applicable |

Use overseas reports as **engineering evidence**, not as a substitute for Indian licences.

## 1. BIS Compulsory Registration (CRS) — safety first

Many electronics categories are notified under MeitY / BIS **Compulsory Registration Scheme (Scheme II)**. Typical examples importers hit first:

- IT equipment, laptops, tablets, monitors
- Power adapters / power supplies
- LED lights and luminaires (where notified)
- Audio, video and similar apparatus
- Phones and related accessories (check current CRO schedule for your exact category)

**What you need**
- Correct **IS / IS/IEC** standard for the product family (for many IT/AV lines this is migrating toward **IS/IEC 62368-1**)
- Testing at a **BIS-recognised laboratory**
- Grant of **R-number** (or authorised use under a brand/OEM model arrangement that the scheme allows)
- Standard Mark on the product / packaging as required

**Importer tip:** If the overseas factory already holds CRS for your models, confirm whether **you** can import under that licence or need a separate Indian applicant / authorised Indian representative structure. Do not invent a marking without a valid grant.

See also: [BIS certification overview](/certifications/bis) · [Electronics migration notes on Certko Blog](/blog) · [Find labs](/labs)

## 2. WPC / ETA — wireless and RF products

Anything with Wi-Fi, Bluetooth, cellular, NFC or other radio needs a parallel path under **Wireless Planning & Coordination (WPC)** — typically **Equipment Type Approval (ETA)** or related permissions depending on the product and frequency.

CE RED or FCC ID **does not auto-grant** India ETA. Plan RF documentation and sample evidence early; customs and marketplaces increasingly ask for WPC references on wireless SKUs.

See: [WPC / ETA](/certifications/wpc-eta)

## 3. EPR e-waste — if your product is notified e-waste

Under India’s **E-Waste (Management) Rules**, producers (including importers and brand owners who place notified electrical & electronic equipment on the Indian market) must register on the CPCB EPR portal and meet collection / recycling targets.

**Who usually needs this**
- Importers of notified IT, telecom, consumer electronics and electrical equipment
- Indian brands putting their name on overseas-made electronics

**Common mistake:** Treating EPR as “after sales CSR”. For many businesses it is a **pre-condition to keep placing product in the market**, and portals / marketplaces may ask for EPR registration details.

## 4. EPR battery — when the product contains cells

Power banks, notebooks, phones, earbuds, UPS and many IoT devices contain batteries. Separately from e-waste, India’s **Battery Waste Management** framework requires producer responsibility for notified battery chemistries / applications.

If you import:

- Devices with embedded rechargeable packs, **and/or**
- Loose / aftermarket batteries and power banks

…map **battery EPR** in parallel with product BIS and e-waste EPR. One registration does not replace the other.

## 5. EPR plastic packaging — almost every boxed SKU

Retail electronics almost always arrive in plastic trays, films, cushioning or laminated cartons. Under **Plastic Waste Management** EPR rules, producers/importers of plastic packaging generally need EPR registration and target compliance for the packaging they introduce.

Even “small” accessory importers get caught when annual plastic quantities cross thresholds or when large marketplaces demand EPR proof.

## 6. Labelling, Legal Metrology & claims

Finished packaged electronics sold retail typically need **Legal Metrology (Packaged Commodities)** compliant declarations: name/address of importer or manufacturer, net quantity where applicable, MRP (where required), customer care, country of origin, and related declarations.

Do not copy EU energy labels or US FCC statements as a substitute for India LMPC layout. Get artwork reviewed before the first container lands.

## 7. Energy labels (when BEE applies)

Selected appliances and electronics fall under **BEE Star Labelling**. If your category is notified, plan BEE registration and label artwork alongside BIS — not after inventory arrives.

See: [BEE Star Rating](/certifications/bee)

## End-to-end import stack (electronics)

| Layer | Typical need | Owner |
| --- | --- | --- |
| Product safety | BIS CRS (R-number) + Standard Mark | Brand / importer / OEM as per scheme |
| Radio | WPC / ETA | Importer or manufacturer applicant |
| End-of-life EEE | EPR e-waste (CPCB) | Producer / importer |
| Cells & packs | EPR battery | Producer / importer |
| Shipper carton & retail pack | EPR plastic packaging | Producer / importer |
| On-pack declarations | LMPC + BIS mark + care info | Brand / importer |
| Energy (if notified) | BEE | Brand / importer |

## 30-day action plan for a new electronics SKU

1. Confirm **HS code + exact product description** against current CRO / QCO schedules.
2. Identify the **IS standard** and whether lead-model / series rules apply.
3. Book a **BIS-recognised lab** and freeze the sample matrix.
4. Decide applicant structure (Indian manufacturer, importer, or authorised model under an existing R-number).
5. Start **WPC** file if the SKU is wireless.
6. Open / update **EPR e-waste**, **battery** and **plastic** registrations for the Indian producer entity.
7. Redesign **packaging artwork** for LMPC + Standard Mark + importer address.
8. Only then confirm the commercial shipping date.

${CTA}

${DISCLAIMER}
`,
  },
  {
    slug: "import-packaged-food-india-fssai-lmpc-epr-plastic-guide",
    title:
      "Importing Packaged Food & Beverages into India: FSSAI, LMPC & Plastic EPR Guide",
    excerpt:
      "Shipping snacks, sauces, beverages, supplements or specialty foods from the EU, USA, SEA or Middle East? Build the FSSAI import path, Legal Metrology labels and plastic packaging EPR before the first consignment.",
    meta_title:
      "Import Packaged Food to India — FSSAI, LMPC, EPR Plastic | Certko",
    meta_description:
      "Importer checklist for packaged foods and beverages entering India: FSSAI licensing, labelling, LMPC declarations, plastic EPR and related BIS/food-contact notes. Certko consulting support.",
    published_at: "2026-07-28",
    content: `India’s packaged food market pulls specialty oils, confectionery, sauces, beverages, dairy analogues, health foods and gourmet lines from the **European Union, United Kingdom, United States, Southeast Asia, Japan, Korea and the Middle East**. Food compliance is not a single stamp — it is a **chain of licences, labels and packaging duties**.

This guide is written for importers, distributors and foreign brands appointing an Indian importer of record.

## Start with the product story, not the brand story

Customs and FSSAI look at:

- Exact **product category** (standardised food vs proprietary food vs nutraceutical / FSDU pathways where applicable)
- **Ingredients**, additives and novel ingredients
- **Claims** (organic, fortified, sugar-free, protein, infant-related — each has higher scrutiny)
- **Packaging type** (primary food-contact pack + secondary retail pack)

CE food-contact Declarations of Compliance or FDA facility registration help your technical file, but they **do not replace** FSSAI authorisation to import and sell in India.

## 1. FSSAI — the non-negotiable food layer

Most commercial food imports need an appropriate **FSSAI licence / registration** for the Indian Food Business Operator (FBO) who is importing and/or distributing.

**Practical importer checklist**
- Correct FBO licence category for **import** activity
- Product approval / examination route as applicable for the category and port
- Label compliance with FSSAI packaging & labelling regulations (English declarations, veg/non-veg symbol, nutritional information where required, allergen declarations, importer name & address, FSSAI licence number, batch/lot, date marking, etc.)
- Ingredient and additive permissibility under Indian standards / regulations

**High-friction categories:** infant foods, foods for special dietary uses, novel ingredients, alcoholic beverages (additional excise / state rules), and products with medicinal-sounding claims that blur into drugs.

## 2. Legal Metrology (LMPC) — packaged commodity declarations

Retail packaged foods are **pre-packaged commodities**. Under Legal Metrology (Packaged Commodities) Rules, labels generally must show:

- Name and address of manufacturer / packer / **importer**
- Generic name of the commodity
- Net quantity
- Date of manufacture / packing / import as applicable
- MRP (where required) and customer care details
- Country of origin / other mandated declarations

FSSAI label rules and LMPC rules **overlap on the same artwork**. Design one master label that satisfies both — do not run two conflicting layouts.

## 3. EPR plastic packaging — food packs are plastic-heavy

Trays, films, pouches, PET bottles, shrink sleeves and multilayer laminates bring **Plastic Waste Management EPR** obligations for producers/importers introducing plastic packaging into India.

Food brands that only budget for FSSAI often discover EPR plastic registration is demanded by:

- Large modern-trade retailers
- E-commerce onboarding teams
- Internal ESG / vendor-compliance questionnaires

Map plastic categories and quantities early; EPR is usually entity-level, not SKU-level paperwork you can ignore until year-end.

## 4. When BIS still appears in a “food” shipment

Food itself is FSSAI-led, but related hardware and packaging materials can pull in **BIS / QCO** duties, for example:

- Certain food-contact metal cans, appliances or kitchen articles if notified under a QCO
- Packaged drinking water equipment / dispensers in some supply chains
- Weighing instruments used in packing lines (separate Legal Metrology approvals)

If you import **food + branded appliance** (e.g. a beverage machine with sachets), split the compliance matrix: FSSAI for the consumable, BIS/other schemes for the device.

## 5. Origin-market playbook

| Origin focus | Frequent gap in India |
| --- | --- |
| **EU gourmet / organic** | EU organic logo ≠ India organic claims without proper India pathway; label language and veg symbol missing |
| **USA specialty / supplements** | Structure/function claims rewritten for India; proprietary food vs nutraceutical classification |
| **ASEAN snacks & sauces** | Additive permissions; non-English only labels rejected |
| **Middle East beverages** | Halal marks helpful commercially but not a substitute for FSSAI + LMPC |

## Import timeline that actually works

1. Classify the product under FSSAI category rules and freeze the **ingredient list**.
2. Confirm the Indian **importer FBO licence** covers the activity and ports you will use.
3. Build **dual-compliant artwork** (FSSAI + LMPC) and get it reviewed before print.
4. Register / update **EPR plastic** for the importing producer entity.
5. Align shelf-life, storage and logistics with date-marking rules.
6. Prepare product examination / NOC workflow for the first few consignments until the process is routine.
7. Only then book sea/air freight for commercial quantities.

## How Certko helps food & beverage importers

While Certko is best known for BIS/QCO engineering compliance, our consulting desk regularly **coordinates multi-scheme import packs** for brands that sell food alongside appliances, packaging or retail kits:

- Compliance map: FSSAI + LMPC + EPR plastic (+ BIS if a related article is notified)
- Label gap review against common rejection points
- Lab / testing introductions where product examination or BIS testing is needed
- Vendor onboarding document set for modern trade and marketplaces

${CTA}

${DISCLAIMER}
`,
  },
  {
    slug: "import-cosmetics-personal-care-india-lmpc-epr-cdsco-guide",
    title:
      "Importing Cosmetics & Personal Care into India: CDSCO, LMPC & EPR Packaging Guide",
    excerpt:
      "Beauty, skincare and personal-care brands shipping from Korea, EU, USA or Japan need more than pretty labels — map CDSCO cosmetics import rules, Legal Metrology declarations and plastic EPR before launch.",
    meta_title:
      "Import Cosmetics to India — CDSCO, LMPC, EPR Plastic Guide | Certko",
    meta_description:
      "Importer guide for cosmetics and personal care entering India: CDSCO pathways, LMPC labelling, EPR plastic packaging, claims hygiene and related BIS notes. Certko multi-scheme consulting.",
    published_at: "2026-07-28",
    content: `K-beauty, European dermocosmetics, US indie skincare and Japanese personal care are among the most active import categories into India. The commercial opportunity is real — and so is the rejection risk when **product registration, labelling and packaging EPR** are treated as afterthoughts.

This driving guide is for importers, brand licensees and foreign cosmetics companies appointing an Indian importer.

## What “cosmetics” usually means in practice

Typical SKUs in this lane:

- Skincare (creams, serums, cleansers, masks)
- Haircare and colour cosmetics
- Oral care and deodorants
- Bath & body, wet wipes, hand sanitisers (classification must be checked carefully)
- Gift sets and kits with multiple primary packs

If a product makes **drug-like therapeutic claims**, it may leave the cosmetics pathway. Classification mistakes are expensive — fix them on paper before you ship.

## 1. CDSCO / cosmetics regulatory pathway

India regulates cosmetics under the cosmetics framework administered with **CDSCO** oversight (registration / import permissions as applicable to the product and applicant). Foreign brands typically need:

- An eligible **Indian importer / authorised agent** structure
- Product registration / import permission coverage for the SKUs
- Compliant labelling and manufacturing documentation from the overseas site
- Attention to restricted / prohibited ingredients and colourants under Indian rules

**Origin evidence** (EU CPNP notification, US MoCRA facility listing, Korean MFDS history) strengthens your technical file but does **not** by itself authorise India sale.

## 2. Legal Metrology (LMPC) on every retail pack

Cosmetics are packaged commodities. LMPC declarations generally include importer/manufacturer identity, net quantity, MRP where required, customer care, and related declarations. Combined with cosmetics labelling rules, artwork must show:

- Product name and identity
- Ingredient listing in the required format
- Manufacturing / expiry or use-before information as applicable
- Importer name and address in India
- Batch/lot coding
- Country of origin

Luxury brands often underestimate **net quantity and MRP placement** rules. Marketplace takedowns frequently start here — not at the formula stage.

## 3. EPR plastic packaging — beauty is a packaging category

Pumps, bottles, jars, sachets, shrink bands, window cartons and plastic inserts create material EPR exposure. Producers/importers placing plastic packaging on the Indian market generally need **Plastic Waste Management EPR** registration and ongoing returns/targets.

Retailers and quick-commerce platforms increasingly ask for EPR acknowledgements during vendor onboarding.

## 4. Related schemes importers forget

| Extra trigger | Why it appears |
| --- | --- |
| **Devices with electronics** (LED masks, sonic brushes) | May pull **BIS CRS**, **WPC** and **EPR e-waste / battery** |
| **Aerosol / pressurised packs** | Transport and sometimes additional safety documentation |
| **Ayurvedic / therapeutic positioning** | Different regulatory lane — do not force-fit as cosmetics |
| **Food-contact claims** (e.g. lip products marketed oddly) | Scrutinise claims language |

If you import a **beauty device + serum kit**, build a combined matrix: cosmetics pathway for the formula, electronics stack for the device, LMPC + plastic EPR for both packs.

## 5. Market-of-origin tips

| Origin | Frequent India gap |
| --- | --- |
| **South Korea** | Fast SKU refresh cycles outpace India registration updates |
| **EU** | EU claims / INCI decks not aligned to India label fields |
| **USA** | “Drug” OTC positioning vs India cosmetics classification |
| **Japan** | Quasi-drug concepts that do not map 1:1 to India |

## Launch sequence that protects the first shipment

1. Freeze formula, claims and pack sizes for the India SKU list.
2. Confirm **cosmetics import / registration** coverage with your Indian responsible entity.
3. Run ingredient screening against India restrictions.
4. Design **one artwork system** for cosmetics + LMPC rules.
5. Complete **EPR plastic** registration for the producer/importer entity.
6. If the assortment includes devices, open BIS / WPC / e-waste / battery workstreams in parallel.
7. Train warehouse and marketplace teams on batch coding and date marks.

## Certko consulting angle

Certko helps beauty and personal-care importers who need a **single project plan across schemes** — especially when kits mix cosmetics with electronic devices or when plastic EPR and LMPC block marketplace go-live even after product registration is underway.

${CTA}

${DISCLAIMER}
`,
  },
  {
    slug: "import-batteries-power-banks-india-bis-epr-battery-guide",
    title:
      "Importing Batteries & Power Banks into India: BIS, Battery EPR & Packaging Compliance",
    excerpt:
      "Cells, packs, power banks and battery-powered accessories from China, Korea or the EU need a clear India plan: BIS where notified, Battery EPR, plastic packaging EPR and safe transport documentation.",
    meta_title:
      "Import Batteries & Power Banks to India — BIS & EPR Guide | Certko",
    meta_description:
      "Compliance checklist for importing batteries, power banks and battery packs into India: BIS notifications, Battery Waste EPR, plastic EPR, labelling and related electronics duties. Certko help.",
    published_at: "2026-07-28",
    content: `Batteries are no longer a back-of-warehouse spare — they are a primary import category. Power banks, replaceable packs, e-mobility cells, UPS batteries and device-embedded packs arrive daily from **China, South Korea, Japan, Vietnam and Europe**. India’s compliance expectation is stricter than “UN38.3 plus a commercial invoice”.

This guide is for importers of **portable batteries, power banks, battery packs and battery-containing accessories**.

## Separate the product types early

| You are importing… | Primary India questions |
| --- | --- |
| **Power banks / portable chargers** | BIS CRS (if notified category), Battery EPR, plastic EPR, LMPC |
| **Loose cells / packs for manufacturing** | Battery EPR; BIS/QCO if the cell/pack type is notified; factory storage & transport rules |
| **Batteries inside finished electronics** | Product BIS + e-waste EPR + battery EPR + plastic EPR |
| **Automotive / industrial batteries** | Category-specific BIS/QCO and Battery EPR duties — confirm schedule before PO |

Mis-classification (calling a power bank a “mobile accessory” only) is how shipments stall.

## 1. BIS / QCO — when the cell or power bank is notified

India has expanded **Quality Control Orders** and compulsory registration coverage across many electrical products. Power banks and certain battery / adapter combinations frequently sit inside **CRS or related BIS pathways** depending on the exact notification in force on your import date.

**Importer actions**
- Match the exact product description to the current MeitY / DPIIT / BIS notification schedule
- Identify the applicable **Indian Standard**
- Complete recognised-lab testing and licence / registration grant before large retail placement
- Apply Standard Mark rules correctly on product and packaging

Overseas IEC/UL battery reports are useful inputs for the lab — they are not an India waiver.

Explore: [BIS](/certifications/bis) · [Testing](/testing) · [Labs](/labs)

## 2. EPR under Battery Waste Management Rules

Producers — including **importers** who first place batteries on the Indian market — generally must register on the CPCB EPR framework for batteries and meet collection/recycling responsibilities for the chemistries and categories they introduce.

**Why this sits beside BIS**
- BIS answers *is the product allowed / marked correctly?*
- Battery EPR answers *who funds and organises end-of-life responsibility?*

Marketplaces, tenders and enterprise buyers increasingly ask for **both**.

## 3. EPR e-waste — when the “battery product” is also electronics

A power bank is often treated as electrical/electronic equipment as well as a battery product. Many importers need:

- **Battery EPR** for the cells/pack responsibility, and
- **E-waste EPR** for the finished EEE category (where notified)

Do not assume one portal registration covers both frameworks. Map both, then keep evidence packs ready for audits.

## 4. EPR plastic packaging

Retail battery and power-bank packs use blister plastics, trays, films and sleeves. Plastic packaging EPR usually applies to the Indian producer/importer introducing that packaging.

## 5. Legal Metrology & safety communication

Packaged batteries and power banks sold to consumers need LMPC-compliant declarations. Also plan:

- Mandatory safety / handling information
- Customer care and importer identity
- Consistency between website claims and on-pack marks (capacity claims are a frequent dispute area)

## 6. Transport & storage (still part of compliance)

Even when BIS and EPR are ready, carriers will ask for:

- UN38.3 test summaries
- Dangerous goods declarations where applicable
- State-of-charge and packaging instructions for air freight

Build the DG file in parallel so compliance wins are not undone at the airline desk.

## Origin-market notes

| Origin | Typical strength | Typical India gap |
| --- | --- | --- |
| **China** | Scale, UN38.3 available | No BIS R-number; no India EPR IDs |
| **Korea / Japan** | Strong cell QA data | India marking & EPR entity setup |
| **EU** | Battery Regulation documentation culture | Assumes EU battery passport logic equals India EPR — it does not |

## 45-day importer plan

1. Freeze SKU list: chemistry, Wh rating, replaceable vs embedded, retail vs OEM.
2. Check **BIS / QCO / CRS** applicability for each SKU.
3. Open **Battery EPR** registration for the Indian producer entity.
4. Add **e-waste EPR** if finished EEE categories apply.
5. Add **plastic EPR** for retail packaging.
6. Book labs / licence filings for notified products.
7. Approve LMPC artwork and capacity claim language.
8. Assemble UN38.3 + DG pack for the freight forwarder.

## How Certko supports battery & power-bank importers

Certko runs multi-scheme projects that combine **BIS testing/licence coordination** with **EPR readiness checklists** and packaging/label reviews — so your commercial team is not juggling three consultants for one power-bank launch.

${CTA}

${DISCLAIMER}
`,
  },
  {
    slug: "import-toys-appliances-india-bis-qco-lmpc-epr-guide",
    title:
      "Importing Toys & Home Appliances into India: BIS QCO, LMPC & EPR Checklist",
    excerpt:
      "Toys, small appliances and household goods from China, EU or SE Asia often need BIS under QCOs, Legal Metrology labels, plastic EPR — and sometimes BEE or e-waste duties. Use this importer checklist before you book containers.",
    meta_title:
      "Import Toys & Appliances to India — BIS QCO, LMPC, EPR | Certko",
    meta_description:
      "Driving guide for importing toys and home appliances into India: BIS/ISI under QCOs, LMPC labelling, EPR plastic, BEE and e-waste where applicable. Certko consulting for importers.",
    published_at: "2026-07-28",
    content: `Toys, kitchen appliances, fans, heaters, irons, and small household electrical goods remain high-volume import lanes from **China, Vietnam, Turkey, the EU and the Middle East re-export hubs**. Margins look attractive on an FOB sheet — until a QCO holds the shipment or a marketplace freezes listings for missing ISI / LMPC / EPR evidence.

This guide is a compliance driving map for importers and private-label brands.

## Two product families, one discipline

### A) Toys & children’s products
Focus areas usually include:

- Applicable **BIS / QCO** toy safety standards (where notified)
- Age grading, warnings and physical/mechanical safety evidence
- Chemical restrictions relevant to the Indian / referenced standards
- LMPC declarations on retail packs
- Plastic packaging EPR for blister and poly packs

### B) Home appliances & household electricals
Focus areas usually include:

- **BIS ISI (Scheme I)** or **CRS (Scheme II)** depending on the product notification
- **BEE Star Labelling** for notified appliances
- Corded/electrical safety testing at recognised labs
- EPR e-waste (if the appliance is notified EEE)
- EPR battery (if cordless / battery variants exist)
- EPR plastic + LMPC for retail packaging

Treat “small appliance” and “toy” as separate matrices even when they ship in the same container.

## 1. BIS under Quality Control Orders — the gatekeeper

India has notified a wide set of products under **Quality Control Orders**, making BIS certification compulsory before manufacture, import and sale. For importers this typically means:

1. Confirm the product is listed in a current QCO / CRO schedule.
2. Identify the **Indian Standard** and scheme (ISI Mark Scheme I vs CRS Scheme II).
3. Test at a **BIS-recognised lab**.
4. Obtain licence / registration grant covering factory location and models.
5. Mark product and packaging correctly.

**Foreign factory + Indian importer** structures need careful applicant planning (including FMCS / foreign manufacturer routes where applicable for Scheme I products). Do not assume an overseas CB report alone clears a QCO product.

Learn more: [BIS / ISI](/certifications/bis) · [Search products](/products)

## 2. Legal Metrology (LMPC) — every carton that sells retail

Toys and appliances sold pre-packaged need LMPC-compliant labels: importer identity, commodity name, net quantity where applicable, MRP where required, customer care, and related declarations.

For toys, warning statements and age grading must not conflict with LMPC field placement. For appliances, model numbers on the rating label and retail box should match the BIS licence scope.

## 3. EPR plastic packaging

Almost every toy blister and appliance polystyrene / film pack creates **plastic EPR** exposure for the Indian producer/importer. Complete registration before large marketplace onboarding pushes for proof.

## 4. EPR e-waste & battery (appliances lane)

Electrical appliances that fall under notified e-waste categories need **EPR e-waste** registration. Cordless vacuum variants, powered toys with rechargeable packs, and battery accessories may additionally need **Battery EPR**.

| SKU pattern | Often needed |
| --- | --- |
| Corded iron / kettle / toaster (if notified) | BIS + LMPC + plastic EPR (+ e-waste if notified EEE) |
| Cordless handheld appliance | Above + battery EPR |
| Electronic / electric toy (if notified) | BIS + LMPC + plastic EPR (+ e-waste/battery if triggered) |
| Non-electric plush / wooden toy (check QCO list) | Possible BIS chemical/safety QCO + LMPC + plastic EPR |

## 5. BEE Star Labelling for notified appliances

Fans, ACs, refrigerators, LEDs and other notified appliances may require **BEE** registration and star labels in addition to BIS. Plan label real-estate on the product and box early.

See: [BEE](/certifications/bee)

## Origin-market reality check

| Origin | What buyers already have | What India still asks |
| --- | --- | --- |
| **China OEM** | CCC, ISO, sometimes CB | BIS licence on the right scheme; India EPR IDs |
| **EU branded** | CE, Toy Safety Directive docs | CE dossier ≠ ISI grant; redraw labels for LMPC |
| **Turkey / Middle East re-export** | Mixed certificates | Traceability to actual manufacturer for BIS factory scope |

## Container-booking checklist (use before freight)

1. QCO/CRO applicability confirmed for **every** HS line in the shipment.
2. BIS licence / application status green for the models being shipped.
3. Artwork approved for **BIS mark + LMPC** (and BEE if needed).
4. EPR plastic (and e-waste/battery if applicable) registration numbers on file.
5. Model list on commercial invoice matches licence scope (no “surprise” colourways that are actually new models).
6. Spare samples retained for surveillance / marketplace queries.

## How Certko helps toy & appliance importers

Certko specialises in turning a messy multi-SKU import list into a **scheme-by-scheme project plan**:

- BIS / QCO applicability matrix by SKU
- Lab booking and licence filing coordination
- Parallel checklist for LMPC artwork and EPR registrations
- BEE pathway where appliances are energy-labelled
- A single consulting owner so purchasing, QA and logistics stay aligned

${CTA}

${DISCLAIMER}
`,
  },
];

export function ensureImportPosts(db: SqliteDatabase) {
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
    for (const p of IMPORT_POSTS) {
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
