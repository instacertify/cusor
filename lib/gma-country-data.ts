/**
 * Global Market Access country matrix — seed content for country hubs.
 * Structured on the TÜV SÜD GMA pillar grid; verify live regulator lists before quoting.
 */

import type { CountryPillars, GmaRegionId } from "@/lib/gma-regions";

export type GmaSchemeSeed = {
  certSlug: string;
  name: string;
  role: string;
  summary: string;
  whoNeedsIt: string;
  examples: string[];
};

export type GmaCountrySeed = {
  slug: string;
  marketId: string;
  region: GmaRegionId;
  featured?: boolean;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  overview: string;
  authority: string;
  filingTip: string;
  firstChecks: string[];
  pillars: CountryPillars;
  schemes: GmaSchemeSeed[];
  faqs: { question: string; answer: string }[];
};

function scheme(
  name: string,
  role: string,
  summary: string,
  whoNeedsIt: string,
  examples: string[],
  certSlug = ""
): GmaSchemeSeed {
  return { certSlug, name, role, summary, whoNeedsIt, examples };
}

function hub(input: GmaCountrySeed): GmaCountrySeed {
  return input;
}

/** Full GMA matrix used to seed / top-up country_hubs. */
export const GMA_COUNTRY_SEEDS: GmaCountrySeed[] = [
  hub({
    slug: "india",
    marketId: "india",
    region: "asia-pacific",
    featured: true,
    name: "India",
    shortName: "India",
    metaTitle: "India Certifications — BIS, BEE, WPC, TEC | Certko",
    metaDescription:
      "India GMA guide: BIS CRS/ISI, WPC ETA, TEC MTCTE, BEE star labelling, EPR and local importer duties.",
    intro:
      "India’s access path is scheme-stacked — Quality Control Orders, wireless ETA, telecom MTCTE and energy labels sit under different authorities.",
    overview:
      "Selling into India usually means mapping your product to BIS (ISI or CRS), checking wireless and telecom overlays, then energy labelling or EPR where notified. Customs, marketplaces and buyer audits all enforce these tracks.",
    authority:
      "BIS, MeitY/DeitY notifications, WPC (DoT), TEC, BEE, CPCB (E-Waste / EPR) and Legal Metrology for packaged goods.",
    filingTip:
      "Classify the product first (HSN + function). One SKU can need BIS + WPC + BEE together — quote all three before locking a ship date.",
    firstChecks: [
      "BIS QCO — Scheme I (ISI) or Scheme II (CRS)?",
      "Wireless licence-exempt bands → WPC ETA?",
      "Public network / IMEI gear → TEC MTCTE?",
      "BEE star labelling or E-Waste EPR registration?",
      "Who is the Indian applicant / authorised Indian representative?",
    ],
    pillars: {
      safety: "BIS CRS (IT/electronics) and ISI licence (factory inspection + sample testing)",
      emcWireless: "WPC ETA for licence-exempt bands; security testing for some Wi-Fi CPE / routers",
      telecom: "TEC MTCTE (GCS or SCS), TEC mark, typically 5-year certificate",
      energyEnv: "BEE Star Label; E-Waste Rules / EPR; LMPC packaged-commodity labelling",
      localRep: "Yes — AIR / importer of record",
    },
    schemes: [
      scheme(
        "BIS (ISI Mark & CRS)",
        "Mandatory product certification for notified categories",
        "BIS is the primary India safety/quality gate under Quality Control Orders — Scheme I (ISI) and Scheme II (CRS) use different lab and licence mechanics.",
        "Manufacturers and importers of QCO-notified goods for the Indian market.",
        ["IT / A/V under CRS", "Appliances under ISI", "Cables and industrial components under QCOs"],
        "bis"
      ),
      scheme(
        "BEE star labelling",
        "Energy-efficiency labelling for notified appliances",
        "BEE star labels are mandatory for many appliances sold in India — models register against product-family tables.",
        "Appliance brands and importers placing notified products on Indian retail or online channels.",
        ["Room ACs", "Refrigerators", "Ceiling fans and water heaters"],
        "bee"
      ),
      scheme(
        "WPC ETA",
        "Equipment Type Approval for licence-exempt wireless",
        "WPC ETA clears licence-exempt radio (Bluetooth, Wi-Fi and similar) before import or sale — separate from BIS.",
        "Brands shipping short-range radio or IoT products into India.",
        ["Earbuds and speakers", "Wi-Fi routers", "Smart appliances with radio modules"],
        "wpc-eta"
      ),
      scheme(
        "TEC MTCTE",
        "Telecom Essential Requirements certification",
        "TEC MTCTE applies to many telecom and networking products connecting to public networks — GCS or SCS routes with a TEC mark.",
        "OEMs of routers, modems, handsets and IoT with cellular / network interfaces for India.",
        ["CPE routers", "Cellular IoT modules", "IP phones and network gear"],
        ""
      ),
    ],
    faqs: [
      {
        question: "Can one product need BIS and WPC together?",
        answer:
          "Yes. Smart appliances often need BIS under a QCO and WPC ETA for Wi-Fi or Bluetooth. Plan both timelines.",
      },
      {
        question: "Is TEC the same as WPC?",
        answer:
          "No. WPC covers licence-exempt radio spectrum approval; TEC MTCTE covers telecom essential requirements for network-connected equipment.",
      },
    ],
  }),

  hub({
    slug: "china",
    marketId: "china",
    region: "asia-pacific",
    name: "China",
    shortName: "China",
    metaTitle: "China Certifications — CCC, SRRC, MIIT | Certko",
    metaDescription:
      "China market access: CCC mark, SRRC radio type approval, MIIT/NAL network access, China Energy Label and China RoHS.",
    intro:
      "China market access usually combines CCC safety marking with SRRC radio approval and, for network gear, MIIT / NAL access licensing.",
    overview:
      "CCC is the core compulsory mark for many product categories, typically with factory inspection and surveillance. Radio products need SRRC; devices connecting to public networks may need MIIT/NAL. Energy labels and China RoHS add substance and labelling duties.",
    authority: "CNCA / CQC (CCC), SRRC, MIIT / NAL, SAMR energy labelling and China RoHS rules.",
    filingTip:
      "Confirm whether your category is CCC-compulsory before quoting only ‘voluntary CQC’. Factory audit lead time often dominates the schedule.",
    firstChecks: [
      "Is the HS / product category on the CCC compulsory list?",
      "Does the product transmit → SRRC?",
      "Public network access → MIIT / NAL?",
      "China Energy Label or China RoHS documentation?",
    ],
    pillars: {
      safety: "CCC mark (CNCA/CQC), factory inspection + annual surveillance; voluntary CQC where applicable",
      emcWireless: "SRRC radio type approval",
      telecom: "MIIT / NAL network access licence",
      energyEnv: "China Energy Label (CEL); China RoHS (SJ/T 11364)",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "CCC",
        "China Compulsory Certification",
        "CCC is the primary safety/conformity mark for many regulated categories sold in China, usually requiring type testing, factory inspection and ongoing surveillance.",
        "Exporters placing compulsory-list electrical, electronic and related goods on the Chinese market.",
        ["Power supplies", "IT equipment", "Household appliances"]
      ),
      scheme(
        "SRRC",
        "Radio type approval",
        "SRRC approval is required for radio transmitters before China market placement — distinct from CCC.",
        "Wi-Fi, Bluetooth, cellular and other radio-enabled product brands.",
        ["Wireless modules", "IoT sensors", "Consumer radio devices"]
      ),
      scheme(
        "MIIT / NAL",
        "Network access licence",
        "Network access licensing applies to equipment that connects to China’s public telecom networks.",
        "Telecom terminal and network equipment manufacturers.",
        ["Modems", "Handsets", "Network access devices"]
      ),
    ],
    faqs: [
      {
        question: "Is voluntary CQC enough instead of CCC?",
        answer:
          "Only when the product is not on the compulsory CCC catalogue. Compulsory categories need CCC — voluntary marks do not replace it.",
      },
    ],
  }),

  hub({
    slug: "japan",
    marketId: "japan",
    region: "asia-pacific",
    name: "Japan",
    shortName: "Japan",
    metaTitle: "Japan Certifications — PSE, TELEC, JATE | Certko",
    metaDescription:
      "Japan GMA: PSE (DENAN) safety mark, TELEC/MIC radio, JATE terminal approval and Top Runner energy expectations.",
    intro:
      "Japan separates electrical safety (PSE under DENAN) from radio (TELEC/MIC) and telecom terminal (JATE) approvals.",
    overview:
      "Specified electrical products need the diamond PSE mark; non-specified use the round PSE mark. Radio equipment follows MIC/TELEC rules; terminal equipment may need JATE. VCCI EMC registration is often market-expected even when voluntary.",
    authority: "METI (DENAN/PSE), MIC / TELEC, JATE, VCCI Council, Top Runner / J-Moss programmes.",
    filingTip:
      "Decide diamond vs round PSE early — it changes whether a Registered Conformity Assessment Body is mandatory.",
    firstChecks: [
      "Specified or non-specified electrical product under DENAN?",
      "Radio functionality → TELEC / MIC?",
      "Telecom terminal → JATE?",
      "Local importer / responsible party in Japan?",
    ],
    pillars: {
      safety: "PSE mark — DENAN Law (diamond = specified, round = non-specified)",
      emcWireless: "TELEC / MIC radio; VCCI EMC (voluntary but market-expected)",
      telecom: "JATE terminal approval",
      energyEnv: "Top Runner programme; J-Moss",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "PSE",
        "DENAN electrical safety mark",
        "PSE indicates conformity with Japan’s Electrical Appliances and Materials Safety Act — diamond for specified products, round for non-specified.",
        "Brands placing electrical appliances and materials on the Japanese market.",
        ["Power adapters", "Lighting", "Household electrical goods"]
      ),
      scheme(
        "TELEC / MIC",
        "Radio equipment approval",
        "Radio equipment must meet MIC technical standards; TELEC certification is the common path for wireless products.",
        "Wi-Fi, Bluetooth and other radio device exporters to Japan.",
        ["Wireless modules", "IoT gateways", "Consumer radio gadgets"]
      ),
    ],
    faqs: [
      {
        question: "Is VCCI mandatory?",
        answer:
          "VCCI is voluntary, but many Japanese buyers and channels expect EMC registration evidence alongside PSE/radio approvals.",
      },
    ],
  }),

  hub({
    slug: "south-korea",
    marketId: "south-korea",
    region: "asia-pacific",
    name: "South Korea",
    shortName: "South Korea",
    metaTitle: "South Korea Certifications — KC Mark | Certko",
    metaDescription:
      "Korea KC mark pathways via KATS and RRA for safety, radio and EMC, plus energy labelling and K-RoHS/K-REACH.",
    intro:
      "South Korea’s KC mark covers safety and, through RRA, radio/EMC — often the single badge buyers look for.",
    overview:
      "Electrical appliances and consumer products fall under the KC framework administered with KATS. Radio and EMC registration runs via RRA. Energy efficiency labels and K-RoHS/K-REACH add environmental obligations.",
    authority: "KATS, RRA, energy efficiency label administrators, K-REACH / K-RoHS authorities.",
    filingTip:
      "Confirm whether your product needs KC safety only, KC radio/EMC, or both before booking labs.",
    firstChecks: [
      "KC safety scope under Electrical Appliances & Consumer Products Safety Control Act?",
      "Radio / EMC via RRA?",
      "Korea Energy Efficiency Label?",
      "Local Korean applicant?",
    ],
    pillars: {
      safety: "KC mark (KATS) under Electrical Appliances & Consumer Products Safety Control Act",
      emcWireless: "KC via RRA (radio + EMC)",
      telecom: "RRA registration",
      energyEnv: "Korea Energy Efficiency Label; K-RoHS / K-REACH",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "KC mark",
        "Korea Conformity mark for safety and radio/EMC",
        "KC is the market-facing conformity mark for many electrical and radio products in South Korea, with safety and RRA radio/EMC tracks.",
        "Exporters of electrical appliances, IT and wireless devices to Korea.",
        ["Power supplies", "Wireless consumer electronics", "Household appliances"]
      ),
    ],
    faqs: [
      {
        question: "Does KC cover radio and safety together?",
        answer:
          "KC branding is shared, but safety (KATS pathway) and radio/EMC (RRA) are separate assessments — budget both when the product has a transmitter.",
      },
    ],
  }),

  hub({
    slug: "taiwan",
    marketId: "taiwan",
    region: "asia-pacific",
    name: "Taiwan",
    shortName: "Taiwan",
    metaTitle: "Taiwan Certifications — BSMI, NCC | Certko",
    metaDescription:
      "Taiwan market access: BSMI commodity inspection mark, NCC type approval, RoHS inspection and energy labelling.",
    intro:
      "Taiwan pairs BSMI commodity inspection with NCC type approval for radio and telecom equipment.",
    overview:
      "BSMI governs commodity inspection and marking for many electrical and electronic goods. Wireless and telecom products need NCC approval. RoHS inspection and energy labels apply by category.",
    authority: "BSMI, NCC, energy labelling programme administrators.",
    filingTip:
      "Check whether your product is batch inspection, registration or declaration under BSMI — the path changes lead time.",
    firstChecks: [
      "BSMI inspection category and mark type?",
      "NCC type approval for radio/telecom?",
      "Energy label / RoHS inspection?",
    ],
    pillars: {
      safety: "BSMI commodity inspection mark",
      emcWireless: "NCC type approval",
      telecom: "NCC",
      energyEnv: "BSMI RoHS inspection; energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "BSMI",
        "Commodity inspection mark",
        "BSMI conformity is required for many commodities before Taiwan customs clearance and sale.",
        "Importers and brands of regulated electrical/electronic goods.",
        ["IT equipment", "Household appliances", "Power products"]
      ),
      scheme(
        "NCC",
        "Radio / telecom type approval",
        "NCC type approval covers wireless and telecom equipment for Taiwan spectrum and network rules.",
        "Radio-enabled and telecom terminal product exporters.",
        ["Wi-Fi devices", "Mobile terminals", "IoT radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Can BSMI and NCC be filed in parallel?",
        answer:
          "Often yes when product samples and documentation are ready — parallel tracks shorten calendar time for wireless electronics.",
      },
    ],
  }),

  hub({
    slug: "singapore",
    marketId: "singapore",
    region: "asia-pacific",
    name: "Singapore",
    shortName: "Singapore",
    metaTitle: "Singapore Certifications — Safety Mark, IMDA | Certko",
    metaDescription:
      "Singapore CPS Safety Mark for controlled goods, IMDA equipment registration, NEA energy label and MEPS.",
    intro:
      "Singapore’s Consumer Protection (Safety) scheme controls listed goods with the SAFETY Mark; radio gear needs IMDA registration.",
    overview:
      "About three dozen controlled goods need Enterprise Singapore CPS registration and the SAFETY Mark. IMDA registers telecommunications equipment. NEA runs energy labels and MEPS for appliances.",
    authority: "Enterprise Singapore (CPS), IMDA, NEA.",
    filingTip:
      "Only controlled goods need the SAFETY Mark — confirm the controlled list before assuming a full CPS project.",
    firstChecks: [
      "Is the product on the CPS controlled goods list?",
      "IMDA equipment registration needed?",
      "NEA energy label / MEPS?",
      "Registered Supplier in Singapore?",
    ],
    pillars: {
      safety: "SAFETY Mark (CPS scheme, Enterprise Singapore) — controlled goods",
      emcWireless: "IMDA equipment registration",
      telecom: "IMDA",
      energyEnv: "NEA energy label; mandatory MEPS",
      localRep: "Yes — Registered Supplier",
    },
    schemes: [
      scheme(
        "SAFETY Mark (CPS)",
        "Controlled goods product safety",
        "CPS registration and the SAFETY Mark apply to Singapore’s controlled electrical goods list before supply.",
        "Suppliers of controlled electrical products into Singapore.",
        ["Adapters", "Selected appliances", "Controlled consumer electricals"]
      ),
      scheme(
        "IMDA",
        "Telecom / radio equipment registration",
        "IMDA registration is required for many telecommunications and radio equipment models.",
        "Telecom and wireless device brands selling in Singapore.",
        ["Wi-Fi routers", "Mobile devices", "IoT radio products"]
      ),
    ],
    faqs: [
      {
        question: "Do all electronics need the SAFETY Mark?",
        answer:
          "No — only goods on the CPS controlled list. Radio products may still need IMDA even when CPS does not apply.",
      },
    ],
  }),

  hub({
    slug: "malaysia",
    marketId: "malaysia",
    region: "asia-pacific",
    name: "Malaysia",
    shortName: "Malaysia",
    metaTitle: "Malaysia Certifications — ST, SIRIM, MCMC | Certko",
    metaDescription:
      "Malaysia: Suruhanjaya Tenaga Certificate of Approval, SIRIM testing, MCMC type approval and ST energy labelling.",
    intro:
      "Malaysia electrical approval runs through Suruhanjaya Tenaga with SIRIM testing; communications gear needs MCMC type approval.",
    overview:
      "ST Certificate of Approval is the safety gate for many electrical products. SIRIM laboratories support testing. MCMC handles communications equipment type approval. Energy labels sit with ST for covered appliances.",
    authority: "Suruhanjaya Tenaga (ST), SIRIM, MCMC.",
    filingTip:
      "Align ST approval and MCMC type approval early for wireless electrical products — they are separate regulators.",
    firstChecks: [
      "ST Certificate of Approval required?",
      "SIRIM test plan confirmed?",
      "MCMC type approval for radio/telecom?",
    ],
    pillars: {
      safety: "ST (Suruhanjaya Tenaga) Certificate of Approval; SIRIM testing",
      emcWireless: "SIRIM / MCMC type approval",
      telecom: "MCMC",
      energyEnv: "ST energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "ST Certificate of Approval",
        "Electrical product approval",
        "ST CoA is required for many electrical products before Malaysian market supply, typically supported by SIRIM testing.",
        "Electrical product importers and manufacturers.",
        ["Household appliances", "Wiring devices", "Power products"]
      ),
      scheme(
        "MCMC type approval",
        "Communications equipment approval",
        "MCMC type approval covers radiocommunications and related communications equipment.",
        "Wireless and telecom equipment brands.",
        ["Wi-Fi devices", "Cellular terminals", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Is SIRIM the same as ST approval?",
        answer:
          "SIRIM is commonly the test/lab partner; ST issues the Certificate of Approval. Treat testing and approval as linked but distinct steps.",
      },
    ],
  }),

  hub({
    slug: "indonesia",
    marketId: "indonesia",
    region: "asia-pacific",
    name: "Indonesia",
    shortName: "Indonesia",
    metaTitle: "Indonesia Certifications — SNI, SDPPI | Certko",
    metaDescription:
      "Indonesia SNI mark via LSPro, SDPPI type approval (and TKDN where required), energy labelling and related duties.",
    intro:
      "Indonesia combines SNI product certification with SDPPI type approval for telecommunications equipment — and may add local-content (TKDN) expectations.",
    overview:
      "SNI marking via accredited LSPro bodies is mandatory for many regulated products. SDPPI type approval covers telecom/radio devices. Energy labels, chemical (K3L) and halal (BPJPH) rules can apply by category.",
    authority: "Ministry of Industry / LSPro (SNI), SDPPI, ESDM (energy), BPJPH (halal) where applicable.",
    filingTip:
      "Ask early whether TKDN local-content evidence is expected for your SDPPI category — it changes sourcing strategy.",
    firstChecks: [
      "Mandatory SNI product category?",
      "SDPPI type approval + TKDN?",
      "Energy label or halal scope?",
    ],
    pillars: {
      safety: "SNI mark via LSPro (Ministry of Industry)",
      emcWireless: "SDPPI type approval + local content (TKDN) for some devices",
      telecom: "SDPPI",
      energyEnv: "Energy label (ESDM); K3L chemicals; halal (BPJPH) where applicable",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "SNI",
        "Indonesian National Standard mark",
        "SNI certification through LSPro is required for many regulated product categories before sale in Indonesia.",
        "Manufacturers and importers of SNI-mandatory goods.",
        ["Electrical products", "Consumer goods under SNI lists"]
      ),
      scheme(
        "SDPPI",
        "Telecom / radio type approval",
        "SDPPI type approval is mandatory for many telecommunications devices, sometimes with TKDN local-content requirements.",
        "Telecom and wireless equipment exporters to Indonesia.",
        ["Mobile devices", "Wi-Fi CPE", "IoT radio products"]
      ),
    ],
    faqs: [
      {
        question: "Does every wireless product need TKDN?",
        answer:
          "Not always — TKDN obligations depend on the current SDPPI / industry rules for that device class. Confirm before production planning.",
      },
    ],
  }),

  hub({
    slug: "thailand",
    marketId: "thailand",
    region: "asia-pacific",
    name: "Thailand",
    shortName: "Thailand",
    metaTitle: "Thailand Certifications — TISI, NBTC | Certko",
    metaDescription:
      "Thailand TISI industrial product mark, NBTC type approval for radio/telecom and EGAT Energy Label No. 5.",
    intro:
      "Thailand uses TISI for industrial product certification and NBTC for radiocommunications type approval.",
    overview:
      "TISI marks apply to many mandatory industrial product standards. Radio and telecom equipment need NBTC approval. EGAT Energy Label No. 5 is the common energy-efficiency scheme for appliances.",
    authority: "TISI, NBTC, EGAT.",
    filingTip:
      "Confirm whether your TISI standard is mandatory certification or voluntary — only mandatory standards block import.",
    firstChecks: [
      "Mandatory TISI standard?",
      "NBTC type approval?",
      "Energy Label No. 5?",
    ],
    pillars: {
      safety: "TISI mark",
      emcWireless: "NBTC type approval",
      telecom: "NBTC",
      energyEnv: "Energy Label No. 5 (EGAT)",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "TISI",
        "Thai Industrial Standards mark",
        "TISI certification is required for products under mandatory Thai industrial standards before market placement.",
        "Importers of TISI-mandatory electrical and industrial goods.",
        ["Electrical appliances", "Selected industrial products"]
      ),
      scheme(
        "NBTC",
        "Radio / telecom type approval",
        "NBTC type approval authorises radiocommunications equipment for use in Thailand.",
        "Wireless and telecom device brands.",
        ["Wi-Fi devices", "Mobile terminals", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Is Energy Label No. 5 mandatory for all appliances?",
        answer:
          "Scope depends on the appliance category under EGAT rules. Check the current labelled product list for your model family.",
      },
    ],
  }),

  hub({
    slug: "vietnam",
    marketId: "vietnam",
    region: "asia-pacific",
    name: "Vietnam",
    shortName: "Vietnam",
    metaTitle: "Vietnam Certifications — QCVN, MIC | Certko",
    metaDescription:
      "Vietnam QCVN certification and Declaration of Conformity, MIC approvals for ICT/radio, and MOIT energy labelling.",
    intro:
      "Vietnam market access centres on QCVN technical regulations plus MIC conformity for ICT and radio equipment.",
    overview:
      "Products under QCVN require certification and/or Declaration of Conformity via MIC/STAMEQ pathways. ICT and radio equipment need MIC certification. MOIT energy labelling applies to covered appliances.",
    authority: "MIC, STAMEQ, MOIT.",
    filingTip:
      "Separate QCVN safety/EMC regulation codes from MIC ICT circulars — they are easy to conflate in quotes.",
    firstChecks: [
      "Applicable QCVN regulation code?",
      "MIC ICT / radio certification?",
      "MOIT energy labelling?",
    ],
    pillars: {
      safety: "QCVN certification + Declaration of Conformity (MIC/STAMEQ)",
      emcWireless: "MIC certification",
      telecom: "MIC",
      energyEnv: "MOIT energy labelling",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "QCVN conformity",
        "National technical regulation compliance",
        "QCVN rules define mandatory technical requirements; conformity may be certification and/or DoC depending on the regulation.",
        "Exporters of regulated electrical/ICT goods to Vietnam.",
        ["IT equipment", "Electrical products under QCVN lists"]
      ),
      scheme(
        "MIC approval",
        "ICT / radio certification",
        "MIC certification covers many ICT and radiocommunications products before Vietnamese market use.",
        "Telecom, ICT and wireless brands.",
        ["Wi-Fi devices", "Mobile phones", "Network equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is a Declaration of Conformity enough?",
        answer:
          "Only when the specific QCVN regulation allows DoC. Higher-risk codes still require certification by a designated body.",
      },
    ],
  }),

  hub({
    slug: "philippines",
    marketId: "philippines",
    region: "asia-pacific",
    name: "Philippines",
    shortName: "Philippines",
    metaTitle: "Philippines Certifications — PS Mark, ICC, NTC | Certko",
    metaDescription:
      "Philippines BPS PS Mark / ICC sticker, NTC type approval and DOE energy labelling.",
    intro:
      "The Philippines uses PS Mark for manufacturers and ICC stickers for importers under BPS, with NTC approvals for telecom/radio.",
    overview:
      "BPS (DTI) product certification issues PS Marks (local manufacture) or ICC stickers (imports) for covered products. NTC type approval covers radio/telecom. DOE energy labelling applies to listed appliances.",
    authority: "BPS / DTI, NTC, DOE.",
    filingTip:
      "Importer ICC pathways differ from manufacturer PS Mark — choose the correct BPS track before sampling.",
    firstChecks: [
      "PS Mark or ICC sticker route?",
      "NTC type approval?",
      "DOE energy labelling?",
    ],
    pillars: {
      safety: "PS mark (manufacturer) / ICC sticker (importer) — BPS, DTI",
      emcWireless: "NTC type approval",
      telecom: "NTC",
      energyEnv: "DOE energy labelling",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "PS Mark / ICC",
        "BPS product certification",
        "BPS certification is required for many consumer and electrical products — PS Mark for manufacturers, ICC for importers.",
        "Local manufacturers and importers of BPS-covered goods.",
        ["Electrical products", "Selected consumer goods"]
      ),
      scheme(
        "NTC",
        "Telecom / radio type approval",
        "NTC type approval authorises radio and telecommunications equipment in the Philippines.",
        "Wireless and telecom equipment suppliers.",
        ["Mobile devices", "Wi-Fi CPE", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Can a foreign factory get a PS Mark?",
        answer:
          "Foreign manufacture typically uses the ICC import certification path rather than a domestic PS Mark — confirm with BPS for your setup.",
      },
    ],
  }),

  hub({
    slug: "hong-kong",
    marketId: "hong-kong",
    region: "asia-pacific",
    name: "Hong Kong",
    shortName: "Hong Kong",
    metaTitle: "Hong Kong Compliance — Electrical Safety, OFCA | Certko",
    metaDescription:
      "Hong Kong electrical product safety certificates, OFCA telecom/radio approvals and mandatory energy efficiency labelling.",
    intro:
      "Hong Kong focuses on electrical product safety certificates, OFCA approvals for telecom/radio, and mandatory energy labels for listed appliances.",
    overview:
      "Electrical Products (Safety) Regulation requires Certificates of Safety Compliance for prescribed products. OFCA regulates telecommunications equipment. The Mandatory Energy Efficiency Labelling Scheme covers specified appliances.",
    authority: "Electrical and Mechanical Services Department, OFCA, energy labelling scheme administrators.",
    filingTip:
      "Keep safety certificate, OFCA and energy-label evidence as separate packs — retailers ask for each.",
    firstChecks: [
      "Certificate of Safety Compliance needed?",
      "OFCA approval?",
      "Mandatory energy label category?",
    ],
    pillars: {
      safety: "Electrical Products (Safety) Regulation — Certificate of Safety Compliance",
      emcWireless: "OFCA",
      telecom: "OFCA",
      energyEnv: "Mandatory Energy Efficiency Labelling Scheme",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "Electrical safety certificate",
        "Prescribed electrical product safety",
        "Certificates of Safety Compliance demonstrate conformity for prescribed electrical products supplied in Hong Kong.",
        "Suppliers of prescribed electrical goods.",
        ["Household electrical products", "Adapters and similar prescribed items"]
      ),
      scheme(
        "OFCA",
        "Telecom / radio equipment approval",
        "OFCA approval is required for many telecommunications and radiocommunications devices.",
        "Telecom and wireless equipment brands.",
        ["Wi-Fi devices", "Mobile terminals"]
      ),
    ],
    faqs: [
      {
        question: "Does CCC or CE replace Hong Kong safety certificates?",
        answer:
          "Not automatically. Hong Kong has its own prescribed-product safety evidence rules even when overseas marks exist.",
      },
    ],
  }),

  hub({
    slug: "brunei",
    marketId: "brunei",
    region: "asia-pacific",
    name: "Brunei",
    shortName: "Brunei",
    metaTitle: "Brunei Certifications — AITI | Certko",
    metaDescription:
      "Brunei market access notes: limited electrical safety scheme and AITI approvals for communications equipment.",
    intro:
      "Brunei’s densest compliance track for electronics is AITI approval for communications equipment, with a limited standalone safety scheme.",
    overview:
      "Communications equipment typically needs AITI type approval. Electrical safety obligations are narrower than in larger ASEAN markets — confirm product class before assuming a full ASEAN-style SNI/TISI project.",
    authority: "AITI and applicable safety authorities.",
    filingTip:
      "For multi-ASEAN launches, reuse radio test packs carefully but file AITI as its own approval.",
    firstChecks: ["AITI approval needed?", "Any electrical safety certificate for this category?"],
    pillars: {
      safety: "Limited safety scheme — confirm category",
      emcWireless: "AITI",
      telecom: "AITI",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "AITI",
        "Communications equipment approval",
        "AITI type approval covers radiocommunications / telecom equipment for Brunei.",
        "Wireless and telecom equipment suppliers.",
        ["Wi-Fi devices", "Mobile terminals", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Can Singapore IMDA replace AITI?",
        answer:
          "No. ASEAN radio approvals are national — IMDA evidence may help testing reuse but does not replace AITI filing.",
      },
    ],
  }),

  hub({
    slug: "cambodia",
    marketId: "cambodia",
    region: "asia-pacific",
    name: "Cambodia",
    shortName: "Cambodia",
    metaTitle: "Cambodia Certifications — ISC, TRC | Certko",
    metaDescription:
      "Cambodia conformity via ISC and TRC type approval for telecommunications equipment.",
    intro:
      "Cambodia market access for electronics usually means ISC conformity plus TRC approval for telecom/radio gear.",
    overview:
      "ISC handles conformity assessment for applicable products. TRC regulates telecommunications and radiocommunications equipment type approval.",
    authority: "ISC, TRC.",
    filingTip:
      "For regional ASEAN rollouts, schedule TRC alongside other national radio filings rather than assuming mutual recognition.",
    firstChecks: ["ISC conformity path?", "TRC type approval?"],
    pillars: {
      safety: "ISC conformity",
      emcWireless: "TRC",
      telecom: "TRC",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "TRC",
        "Telecom / radio type approval",
        "TRC type approval is the primary communications equipment gate for Cambodia.",
        "Telecom and wireless product exporters.",
        ["Mobile devices", "Wi-Fi equipment", "Radio modules"]
      ),
      scheme(
        "ISC conformity",
        "Product conformity assessment",
        "ISC conformity applies where Cambodian product regulations require assessment before import or sale.",
        "Importers of regulated goods into Cambodia.",
        ["Regulated electrical / consumer categories"]
      ),
    ],
    faqs: [
      {
        question: "Is local testing always required?",
        answer:
          "It depends on TRC/ISC acceptance of foreign reports for that product class. Confirm the current acceptance list before sampling.",
      },
    ],
  }),

  hub({
    slug: "mongolia",
    marketId: "mongolia",
    region: "asia-pacific",
    name: "Mongolia",
    shortName: "Mongolia",
    metaTitle: "Mongolia Certifications — MASM, CRC | Certko",
    metaDescription:
      "Mongolia MASM conformity certificates and CRC approvals for communications equipment.",
    intro:
      "Mongolia requires MASM conformity certificates for many goods and CRC approval for communications equipment.",
    overview:
      "MASM issues conformity certificates against applicable standards. CRC regulates communications equipment. Plan local representation for filings and customs.",
    authority: "MASM, CRC.",
    filingTip:
      "Bundle Mongolia with other land-bridge / Eurasian shipments only after confirming whether EAC evidence helps — it does not automatically replace MASM/CRC.",
    firstChecks: ["MASM certificate required?", "CRC type approval?"],
    pillars: {
      safety: "MASM conformity certificate",
      emcWireless: "CRC",
      telecom: "CRC",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "MASM",
        "Conformity certificate",
        "MASM conformity certificates demonstrate compliance for regulated products entering Mongolia.",
        "Importers of regulated goods.",
        ["Electrical products", "Consumer goods under MASM scope"]
      ),
      scheme(
        "CRC",
        "Communications approval",
        "CRC approval covers telecommunications and radiocommunications equipment.",
        "Wireless / telecom equipment suppliers.",
        ["Radio devices", "Network terminals"]
      ),
    ],
    faqs: [
      {
        question: "Does EAC replace MASM?",
        answer:
          "No. EAEU EAC marks do not automatically satisfy Mongolian MASM or CRC obligations.",
      },
    ],
  }),

  hub({
    slug: "australia",
    marketId: "australia",
    region: "asia-pacific",
    featured: true,
    name: "Australia",
    shortName: "Australia",
    metaTitle: "Australia Certifications — RCM, ACMA, GEMS | Certko",
    metaDescription:
      "Australia RCM under EESS and ACMA, Responsible Supplier obligations and GEMS energy efficiency.",
    intro:
      "Australia’s RCM mark covers electrical safety (EESS) and ACMA EMC/radiocomms — anchored by a Responsible Supplier.",
    overview:
      "Electrical equipment is classified into EESS risk levels that drive registration and evidence depth. ACMA rules cover EMC and radiocommunications. GEMS sets MEPS and energy rating labels for appliances.",
    authority: "EESS regulators, ACMA, GEMS / energy regulators.",
    filingTip:
      "Register the Responsible Supplier and determine EESS risk level before quoting ‘just RCM labelling’.",
    firstChecks: [
      "EESS risk level 1–3?",
      "ACMA EMC and/or radiocomms?",
      "GEMS MEPS / energy rating label?",
      "Responsible Supplier in Australia?",
    ],
    pillars: {
      safety: "RCM — EESS (Equipment Safety Rules), risk level 1–3",
      emcWireless: "RCM via ACMA (EMC + radiocomms)",
      telecom: "ACMA",
      energyEnv: "GEMS (MEPS + energy rating label)",
      localRep: "Yes — Responsible Supplier",
    },
    schemes: [
      scheme(
        "RCM (EESS + ACMA)",
        "Regulatory Compliance Mark",
        "RCM signals electrical safety and ACMA EMC/radiocomms conformity when used under the Responsible Supplier framework.",
        "Suppliers of in-scope electrical and radio equipment to Australia.",
        ["Mains appliances", "IT equipment", "Wireless devices"]
      ),
      scheme(
        "GEMS",
        "Energy efficiency (MEPS + labels)",
        "GEMS imposes MEPS and energy rating labelling for regulated appliance types.",
        "Appliance brands selling GEMS-covered products in Australia.",
        ["Air conditioners", "Refrigerators", "Other GEMS-listed appliances"]
      ),
    ],
    faqs: [
      {
        question: "Does CE mean I can use RCM?",
        answer:
          "CE evidence can support a technical file but does not replace EESS registration, ACMA obligations or Responsible Supplier duties.",
      },
    ],
  }),

  hub({
    slug: "new-zealand",
    marketId: "new-zealand",
    region: "asia-pacific",
    name: "New Zealand",
    shortName: "New Zealand",
    metaTitle: "New Zealand Certifications — RCM, RSM, MEPS | Certko",
    metaDescription:
      "New Zealand electrical safety under RCM / Electricity (Safety) Regulations, RSM radiocomms and MEPS/E3 energy rules.",
    intro:
      "New Zealand closely mirrors Australia’s RCM model for electrical safety and radiocomms, with RSM as the spectrum regulator.",
    overview:
      "Electrical safety follows Electricity (Safety) Regulations with SDoC or approval paths under the RCM framework. RSM manages radiocommunications. MEPS / E3 programmes cover energy efficiency for listed products.",
    authority: "WorkSafe / electrical safety framework, RSM, energy efficiency administrators.",
    filingTip:
      "Trans-Tasman launches often reuse test packs — still confirm NZ Responsible Supplier / supplier declaration details separately.",
    firstChecks: [
      "SDoC or approval path under Electricity (Safety) Regs?",
      "RSM radiocomms compliance?",
      "MEPS / E3 scope?",
    ],
    pillars: {
      safety: "RCM — Electricity (Safety) Regs, SDoC/Approval",
      emcWireless: "RCM via RSM",
      telecom: "RSM",
      energyEnv: "MEPS / E3 programme",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "RCM (NZ)",
        "Electrical + radiocomms compliance mark",
        "RCM is used to show electrical safety and radiocomms conformity for New Zealand supply when supplier obligations are met.",
        "Suppliers of electrical and radio equipment to New Zealand.",
        ["Mains appliances", "IT equipment", "Wireless devices"]
      ),
    ],
    faqs: [
      {
        question: "Is Australian RCM registration enough for NZ?",
        answer:
          "Test evidence often overlaps, but New Zealand supplier and radiocomms obligations still need a NZ-specific compliance check.",
      },
    ],
  }),

  // Europe & Eurasia
  hub({
    slug: "european-union",
    marketId: "european-union",
    region: "europe-eurasia",
    featured: true,
    name: "European Union",
    shortName: "EU / EEA",
    metaTitle: "European Union Certifications — CE Marking | Certko",
    metaDescription:
      "EU/EEA CE marking under LVD, EMC, RED and related law, plus Ecodesign, RoHS, REACH and EU Authorised Representative duties.",
    intro:
      "EU access for most goods in scope rests on CE conformity — directives, harmonised standards, technical files and, where required, an Authorised Representative.",
    overview:
      "CE marking is the manufacturer’s declaration against applicable EU product legislation (LVD, EMC, RED, Machinery, toys, PPE, GPSR and more). Importers and distributors carry duties; market surveillance can demand the technical file.",
    authority: "EU product legislation, notified bodies where required, national market surveillance authorities.",
    filingTip:
      "Write the intended use-case first (radio vs non-radio, machinery vs appliance). Directive scope mistakes are the usual rewrite cost.",
    firstChecks: [
      "Which directives apply to the finished product?",
      "RED in scope (radio) or EMC/LVD only?",
      "EU Authorised Representative required?",
      "RoHS / REACH / energy labelling overlays?",
    ],
    pillars: {
      safety: "CE — LVD, Machinery, Toy Safety, PPE, GPSR and related acts",
      emcWireless: "CE — EMC Directive; RED (incl. cybersecurity articles as applicable)",
      telecom: "RED",
      energyEnv: "Ecodesign + Energy Labelling; RoHS; REACH; WEEE; Battery Regulation; PPWR",
      localRep: "Yes — EU Authorised Representative (GPSR / MSR duties)",
    },
    schemes: [
      scheme(
        "CE marking",
        "Mandatory conformity mark for many EU/EEA products",
        "CE work is a defensible Declaration of Conformity: correct directives, test evidence, risk assessment and traceable technical files.",
        "Manufacturers and brands placing goods on the EU/EEA market.",
        ["Mains appliances", "Radio-enabled electronics", "Industrial / ITE equipment"],
        "ce"
      ),
    ],
    faqs: [
      {
        question: "Does CE unlock the UK automatically?",
        answer:
          "CE remains widely accepted for many UK goods for now, but UK Responsible Person and UK REACH/EPR duties can still apply — check the product family.",
      },
    ],
  }),

  hub({
    slug: "united-kingdom",
    marketId: "united-kingdom",
    region: "europe-eurasia",
    name: "United Kingdom",
    shortName: "United Kingdom",
    metaTitle: "United Kingdom Certifications — UKCA, Ofcom, UK EPR | Certko",
    metaDescription:
      "UK market access: UKCA (with ongoing CE acceptance for many goods), Ofcom radio rules, UK REACH/RoHS and EPR.",
    intro:
      "UK goods in scope may use UKCA marking while CE remains accepted for most categories — still plan UK Responsible Person and UK environmental regimes.",
    overview:
      "UKCA is the UK conformity mark; for many products CE continues to be accepted. Radio equipment follows UK Radio Equipment Regulations / Ofcom spectrum rules. UK REACH, UK RoHS and UK EPR (packaging, WEEE, batteries) add producer duties.",
    authority: "OPSS and sector regulators, Ofcom, UK environmental / EPR administrators.",
    filingTip:
      "If you already hold CE evidence, map the UK Responsible Person and EPR registrations before assuming ‘no extra UK work’.",
    firstChecks: [
      "UKCA required or CE still accepted for this category?",
      "UK Responsible Person appointed?",
      "Ofcom / radio obligations?",
      "UK EPR packaging / WEEE / batteries?",
    ],
    pillars: {
      safety: "UKCA (CE still accepted for most goods indefinitely as currently framed)",
      emcWireless: "Radio Equipment Regulations; Ofcom spectrum",
      telecom: "Ofcom",
      energyEnv: "UK REACH; UK RoHS; UK EPR (packaging, WEEE, batteries)",
      localRep: "Yes — UK Responsible Person",
    },
    schemes: [
      scheme(
        "UKCA / UK conformity",
        "UK product conformity marking pathway",
        "UKCA is the UK mark of conformity; many manufacturers continue to rely on CE where still accepted while maintaining UK responsible-person documentation.",
        "Brands placing goods on the Great Britain market.",
        ["Electrical appliances", "Electronics", "Radio equipment"]
      ),
      scheme(
        "UK EPR",
        "Packaging, WEEE and battery producer responsibility",
        "UK EPR regimes require producer registration and reporting for packaging, WEEE and batteries when thresholds are met.",
        "Producers and importers supplying into the UK at scale.",
        ["Packaged consumer goods", "EEE", "Battery-powered products"]
      ),
    ],
    faqs: [
      {
        question: "Do I need both CE and UKCA labels?",
        answer:
          "Follow the current acceptance rules for your product category. Documentation for a UK Responsible Person is often required even when CE marking is still accepted on the product.",
      },
    ],
  }),

  hub({
    slug: "eaeu",
    marketId: "eaeu",
    region: "europe-eurasia",
    name: "Eurasian Economic Union",
    shortName: "EAEU",
    metaTitle: "EAEU Certifications — EAC Mark | Certko",
    metaDescription:
      "EAEU EAC mark under TR CU safety and EMC technical regulations for Russia, Belarus, Kazakhstan, Armenia and Kyrgyzstan.",
    intro:
      "One EAC conformity mark can cover EAEU member states when the applicable TR CU / TR EAEU technical regulations are met.",
    overview:
      "EAC marking under technical regulations such as TR CU 004 (LVD), 010 (machinery), 008 (toys) and 020 (EMC) is the regional safety/EMC framework. Telecom still runs nationally. TR EAEU 037 addresses RoHS-like substance restrictions.",
    authority: "EAEU technical regulation framework; national telecom regulators (e.g. Rossvyaz).",
    filingTip:
      "Confirm the exact TR CU codes for the finished product — certificate vs declaration paths differ by regulation and risk.",
    firstChecks: [
      "Which TR CU / TR EAEU regulations apply?",
      "Certificate or declaration route?",
      "National telecom approval still needed?",
      "EAEU applicant / local representative?",
    ],
    pillars: {
      safety: "EAC — TR CU 004/2011 (LVD), TR CU 010 (machinery), TR CU 008 (toys), others as applicable",
      emcWireless: "TR CU 020/2011 (EMC); FSB notification for crypto where relevant",
      telecom: "National telecom regulators (e.g. Rossvyaz)",
      energyEnv: "TR EAEU 037/2016 (RoHS-equivalent)",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "EAC mark",
        "EAEU conformity mark",
        "EAC demonstrates conformity with applicable EAEU technical regulations for placement across member states covered by the certificate/declaration.",
        "Exporters of regulated electrical, machinery and consumer goods into EAEU markets.",
        ["Low-voltage equipment", "Machinery", "Toys and consumer electronics"]
      ),
    ],
    faqs: [
      {
        question: "Does one EAC cover all five EAEU states?",
        answer:
          "For regulations in scope of the EAC document, yes for those member states — but national telecom and import formalities can still apply.",
      },
    ],
  }),

  hub({
    slug: "serbia",
    marketId: "serbia",
    region: "europe-eurasia",
    name: "Serbia",
    shortName: "Serbia",
    metaTitle: "Serbia Certifications — National Conformity | Certko",
    metaDescription:
      "Serbia national conformity assessment (IZS pathways), telecom type approval and emerging energy-label duties.",
    intro:
      "Serbia runs national conformity certificates alongside telecom type approval — CE evidence helps but does not always replace local filings.",
    overview:
      "National conformity assessment bodies (including IZS pathways) handle product conformity. Telecom regulators issue type approvals. Energy-label schemes continue to expand by product family.",
    authority: "National conformity bodies (e.g. IZS), national telecom regulator.",
    filingTip:
      "Reuse CE/EMC reports where accepted, but confirm whether a Serbian declaration or certificate is still mandatory for your HS code.",
    firstChecks: [
      "National conformity certificate required?",
      "Telecom type approval?",
      "Energy-label scope?",
    ],
    pillars: {
      safety: "National conformity certificates (e.g. via IZS pathways)",
      emcWireless: "National telecom regulator type approval",
      telecom: "National telecom regulator",
      energyEnv: "Emerging energy-label schemes",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "National conformity",
        "Serbian product conformity assessment",
        "Serbia requires national conformity evidence for many regulated products even when CE test reports exist.",
        "Importers of regulated electrical and consumer goods.",
        ["Electrical products", "Selected consumer goods"]
      ),
    ],
    faqs: [
      {
        question: "Is CE marking accepted alone?",
        answer:
          "Sometimes as supporting evidence, not always as the final local conformity document. Confirm the current rule for your product group.",
      },
    ],
  }),

  hub({
    slug: "kazakhstan",
    marketId: "kazakhstan",
    region: "europe-eurasia",
    name: "Kazakhstan",
    shortName: "Kazakhstan",
    metaTitle: "Kazakhstan Certifications — EAC & National Rules | Certko",
    metaDescription:
      "Kazakhstan market access via EAEU EAC technical regulations plus national telecom type approval.",
    intro:
      "Kazakhstan largely follows EAEU EAC rules for product safety/EMC, with national telecom approvals still required for radio gear.",
    overview:
      "Most electrical and related goods use EAC conformity under EAEU technical regulations. Telecom/radio equipment needs national type approval. Local representation supports filings and customs.",
    authority: "EAEU TR framework applied in Kazakhstan; national telecom regulator.",
    filingTip:
      "If you already hold EAC for the same TR CU codes, check whether Kazakhstan telecom approval is the only extra track.",
    firstChecks: ["EAC TR CU codes?", "National telecom approval?", "Local representative?"],
    pillars: {
      safety: "EAC / national conformity as applicable",
      emcWireless: "National telecom regulator type approval",
      telecom: "National telecom regulator",
      energyEnv: "Emerging energy-label schemes",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "EAC (Kazakhstan)",
        "EAEU conformity for KZ market",
        "EAC under the relevant TR CU regulations is the usual conformity path for regulated goods into Kazakhstan.",
        "Exporters of regulated electrical and consumer products.",
        ["Low-voltage equipment", "Consumer electronics"]
      ),
    ],
    faqs: [
      {
        question: "Do I need a Kazakhstan-only certificate if I have EAC?",
        answer:
          "For TR CU-covered safety/EMC, EAC is typically the regional document — telecom and labelling can still be national.",
      },
    ],
  }),

  hub({
    slug: "uzbekistan",
    marketId: "uzbekistan",
    region: "europe-eurasia",
    name: "Uzbekistan",
    shortName: "Uzbekistan",
    metaTitle: "Uzbekistan Certifications — UzStandard | Certko",
    metaDescription:
      "Uzbekistan conformity via UzStandard pathways and national telecom type approval.",
    intro:
      "Uzbekistan requires national conformity certificates (UzStandard pathways) and telecom type approval for communications equipment.",
    overview:
      "UzStandard conformity assessment covers many regulated imports. Telecom regulators handle type approval. Energy-label schemes are expanding.",
    authority: "UzStandard and national telecom regulator.",
    filingTip:
      "Do not assume EAC automatically clears Uzbekistan — confirm whether a national certificate is still required for your HS code.",
    firstChecks: ["UzStandard certificate?", "Telecom type approval?", "Local importer?"],
    pillars: {
      safety: "National conformity certificates via UzStandard",
      emcWireless: "National telecom regulator type approval",
      telecom: "National telecom regulator",
      energyEnv: "Emerging energy-label schemes",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "UzStandard conformity",
        "National product conformity",
        "Uzbekistan conformity certificates are commonly required before customs clearance for regulated goods.",
        "Importers of regulated electrical and consumer products.",
        ["Electrical goods", "Consumer products under mandatory lists"]
      ),
    ],
    faqs: [
      {
        question: "Can CB reports help?",
        answer:
          "CB and IECEE reports often shorten testing, but the national certificate/declaration step still needs a local pathway.",
      },
    ],
  }),

  hub({
    slug: "azerbaijan",
    marketId: "azerbaijan",
    region: "europe-eurasia",
    name: "Azerbaijan",
    shortName: "Azerbaijan",
    metaTitle: "Azerbaijan Certifications — National Conformity | Certko",
    metaDescription:
      "Azerbaijan national conformity certificates and telecom type approval for market access.",
    intro:
      "Azerbaijan uses national conformity certificates and telecom type approval — plan a local applicant for filings.",
    overview:
      "Regulated products typically need national conformity evidence at import. Radio/telecom equipment requires type approval from the national regulator.",
    authority: "National conformity and telecom authorities.",
    filingTip:
      "Align Azerbaijan filings with other Caspian / Caucasus destinations only after checking whether certificates are mutually reusable — usually they are not.",
    firstChecks: ["National conformity certificate?", "Telecom type approval?"],
    pillars: {
      safety: "National conformity certificates",
      emcWireless: "National telecom regulator type approval",
      telecom: "National telecom regulator",
      energyEnv: "Emerging energy-label schemes",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "National conformity",
        "Import conformity assessment",
        "National conformity certificates are commonly required for regulated goods entering Azerbaijan.",
        "Importers of regulated products.",
        ["Electrical products", "Consumer goods"]
      ),
    ],
    faqs: [
      {
        question: "Is GOST or EAC enough?",
        answer:
          "Foreign certificates may support the file but Azerbaijan often still requires its own conformity document for clearance.",
      },
    ],
  }),

  hub({
    slug: "moldova",
    marketId: "moldova",
    region: "europe-eurasia",
    name: "Moldova",
    shortName: "Moldova",
    metaTitle: "Moldova Certifications — National Conformity | Certko",
    metaDescription:
      "Moldova national conformity and telecom type approval pathways for product market access.",
    intro:
      "Moldova requires national conformity evidence for many goods and telecom type approval for communications equipment.",
    overview:
      "Conformity assessment follows national rules that increasingly reference European approaches, but local documents and telecom approvals still matter for import.",
    authority: "National conformity and telecom authorities.",
    filingTip:
      "If you hold CE technical files, ask which elements Moldova will accept versus what must be re-issued locally.",
    firstChecks: ["National conformity path?", "Telecom type approval?"],
    pillars: {
      safety: "National conformity certificates",
      emcWireless: "National telecom regulator type approval",
      telecom: "National telecom regulator",
      energyEnv: "Emerging energy-label schemes",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "National conformity",
        "Moldovan product conformity",
        "National conformity documents are used to clear regulated products for the Moldovan market.",
        "Importers of regulated electrical and consumer goods.",
        ["Electrical products", "Consumer electronics"]
      ),
    ],
    faqs: [
      {
        question: "Does CE marking ship freely into Moldova?",
        answer:
          "Not always. Confirm whether a national conformity step or telecom approval is still required for your product.",
      },
    ],
  }),

  // Americas
  hub({
    slug: "united-states",
    marketId: "united-states",
    region: "americas",
    featured: true,
    name: "United States",
    shortName: "United States",
    metaTitle: "United States Certifications — FCC, NRTL, EnergyGuide | Certko",
    metaDescription:
      "US market access: FCC Part 15, NRTL safety listings, CPSC/CPSIA, DOE/FTC energy rules and state EPR overlays.",
    intro:
      "US access for electronics usually means FCC authorisation plus practical NRTL safety listing demanded by retailers, AHJs and insurers.",
    overview:
      "FCC rules cover radio and many digital devices (SDoC or TCB certification). Product safety is often an NRTL listing rather than a single federal mark. Children’s products add CPSC/CPSIA. DOE and FTC EnergyGuide, Prop 65 and state EPR create extra layers.",
    authority: "FCC, OSHA NRTLs, CPSC, DOE/FTC, state agencies (e.g. California Prop 65).",
    filingTip:
      "Separate intentional radiators from unintentional digital devices before quoting FCC — paths and lead times differ.",
    firstChecks: [
      "FCC SDoC or Certification (TCB)?",
      "NRTL listing expected by retail/AHJ?",
      "CPSC/CPSIA for children’s products?",
      "EnergyGuide / Prop 65 / state EPR?",
    ],
    pillars: {
      safety: "NRTL listing (UL, Intertek, TÜV, etc.); CPSC/CPSIA for children’s products",
      emcWireless: "FCC Part 15 — SDoC or Certification via TCB",
      telecom: "FCC Part 68 where applicable",
      energyEnv: "DOE standards + FTC EnergyGuide; California Prop 65; state EPR",
      localRep: "Yes — US agent for FCC",
    },
    schemes: [
      scheme(
        "FCC authorisation",
        "US RF / EMC market access",
        "FCC authorisation is required for devices that emit RF energy — deliverable is the correct SDoC or FCC ID path with labelling.",
        "Exporters and US importers of wireless and electronic devices.",
        ["Wi-Fi / Bluetooth gadgets", "IoT gateways", "Computing hardware"],
        "fcc"
      ),
      scheme(
        "NRTL safety listing",
        "Workplace / retail safety certification",
        "NRTL marks are not one federal law for all products, but AHJs, retailers and insurers commonly require them before US placement.",
        "Brands selling mains-powered or hazard-bearing products through US channels.",
        ["Appliances", "Power supplies", "Industrial electrical equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is FCC the same as UL?",
        answer:
          "No. FCC is RF/EMC. UL (or another NRTL) is product safety listing — many US-bound products need both conversations.",
      },
    ],
  }),

  hub({
    slug: "canada",
    marketId: "canada",
    region: "americas",
    name: "Canada",
    shortName: "Canada",
    metaTitle: "Canada Certifications — ISED, cUL/cCSA, NRCan | Certko",
    metaDescription:
      "Canada ISED radio/EMC (RSS/ICES), SCC-accredited safety certification and NRCan energy efficiency regulations.",
    intro:
      "Canada pairs ISED radio/EMC rules with SCC-accredited safety certification (cUL, cCSA) accepted provincially.",
    overview:
      "ISED regulates radio (RSS) and EMC (ICES). Safety certification from SCC-accredited bodies is expected for many electrical products. NRCan energy efficiency regulations cover listed appliances.",
    authority: "ISED, SCC-accredited certification bodies, NRCan, provinces.",
    filingTip:
      "FCC packs help but Canada needs ISED IDs / filings — plan Canadian representatives and French labelling where required.",
    firstChecks: [
      "ISED RSS / ICES path?",
      "cUL / cCSA or equivalent safety certification?",
      "NRCan energy efficiency scope?",
    ],
    pillars: {
      safety: "SCC-accredited certification (cUL, cCSA) + provincial acceptance",
      emcWireless: "ISED — RSS (radio), ICES (EMC)",
      telecom: "ISED",
      energyEnv: "NRCan Energy Efficiency Regulations",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "ISED",
        "Radio and EMC compliance",
        "ISED certification or SDoC-style paths apply to radio and interference-causing equipment in Canada.",
        "Wireless and electronic product exporters to Canada.",
        ["Wi-Fi devices", "IoT radio products", "IT equipment"]
      ),
      scheme(
        "cUL / cCSA safety",
        "Electrical safety certification",
        "SCC-accredited marks such as cUL or cCSA are widely required for electrical products sold in Canada.",
        "Mains-powered product brands.",
        ["Appliances", "Power supplies", "Industrial electrical goods"]
      ),
    ],
    faqs: [
      {
        question: "Can I use FCC reports for ISED?",
        answer:
          "Often as a starting test pack, but ISED still requires Canadian filing/labelling rules and may need national differences.",
      },
    ],
  }),

  hub({
    slug: "mexico",
    marketId: "mexico",
    region: "americas",
    name: "Mexico",
    shortName: "Mexico",
    metaTitle: "Mexico Certifications — NOM, IFT | Certko",
    metaDescription:
      "Mexico NOM certification and labelling, IFT homologation for telecom/radio and CONUEE energy standards.",
    intro:
      "Mexico’s NOM standards drive product certification and labelling; telecom/radio gear needs IFT homologation.",
    overview:
      "NOM certification (via bodies such as NYCE or ANCE) plus NOM-050 commercial labelling are common for electrical goods. IFT homologation covers telecom. CONUEE / NOM energy standards apply to listed products.",
    authority: "Economy ministry / NOM framework, NYCE/ANCE and other OCPs, IFT, CONUEE.",
    filingTip:
      "Budget Spanish labelling (NOM-050) alongside NOM safety — shipments fail on labelling as often as on tests.",
    firstChecks: [
      "Applicable NOM safety standard?",
      "NOM-050 labelling?",
      "IFT homologation?",
      "Energy NOM / CONUEE?",
    ],
    pillars: {
      safety: "NOM certification (NYCE, ANCE, etc.) + NOM-050 labelling",
      emcWireless: "IFT homologation",
      telecom: "IFT",
      energyEnv: "CONUEE / NOM energy standards",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "NOM",
        "Official Mexican Standards certification",
        "NOM certification is required for many electrical and electronic products before Mexican market sale.",
        "Importers and brands of NOM-covered goods.",
        ["Electrical appliances", "Electronics", "Power products"]
      ),
      scheme(
        "IFT homologation",
        "Telecom / radio approval",
        "IFT homologation authorises telecommunications and radiocommunications equipment in Mexico.",
        "Wireless and telecom equipment suppliers.",
        ["Mobile devices", "Wi-Fi equipment", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Is FCC enough for Mexico radio?",
        answer:
          "No. IFT homologation is a separate Mexican telecom approval even when FCC reports exist.",
      },
    ],
  }),

  hub({
    slug: "brazil",
    marketId: "brazil",
    region: "americas",
    name: "Brazil",
    shortName: "Brazil",
    metaTitle: "Brazil Certifications — INMETRO, ANATEL | Certko",
    metaDescription:
      "Brazil INMETRO certification with factory audit, ANATEL homologation and PBE / Selo Procel energy labelling.",
    intro:
      "Brazil combines INMETRO product certification (often with factory audit) and ANATEL homologation for telecom/radio devices.",
    overview:
      "INMETRO compulsory certification via OCPs is mandatory for many product categories and frequently includes factory assessment. ANATEL homologation is required for telecommunications products. PBE energy labelling and Selo Procel apply to appliances.",
    authority: "INMETRO / OCPs, ANATEL, energy labelling programmes.",
    filingTip:
      "Factory audit scheduling usually sets the critical path for INMETRO — start OCP engagement before tooling freezes.",
    firstChecks: [
      "INMETRO compulsory catalogue category?",
      "ANATEL homologation?",
      "PBE / Selo Procel energy label?",
      "Brazilian applicant / local maintainer?",
    ],
    pillars: {
      safety: "INMETRO certification (OCP) + factory audit",
      emcWireless: "ANATEL homologation",
      telecom: "ANATEL",
      energyEnv: "PBE energy labelling (INMETRO); Selo Procel",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "INMETRO",
        "Compulsory product certification",
        "INMETRO certification through an OCP is required for many regulated products, commonly with factory audit and maintenance.",
        "Manufacturers and importers of INMETRO-compulsory goods.",
        ["Electrical appliances", "Selected electronics", "Regulated consumer products"]
      ),
      scheme(
        "ANATEL",
        "Telecom homologation",
        "ANATEL homologation is mandatory for telecommunications and radiocommunications products used in Brazil.",
        "Wireless and telecom equipment brands.",
        ["Mobile phones", "Wi-Fi routers", "IoT radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Can I ship with FCC/CE only?",
        answer:
          "No. Brazil requires INMETRO and/or ANATEL on their own tracks. Foreign marks are supporting evidence at best.",
      },
    ],
  }),

  hub({
    slug: "argentina",
    marketId: "argentina",
    region: "americas",
    name: "Argentina",
    shortName: "Argentina",
    metaTitle: "Argentina Certifications — S Mark, ENACOM | Certko",
    metaDescription:
      "Argentina electrical safety (Res. 169/2018 S mark), ENACOM type approval and INTI energy labelling.",
    intro:
      "Argentina requires electrical safety certification (S mark pathways) and ENACOM approval for communications equipment.",
    overview:
      "Resolution 169/2018 and related rules drive electrical safety certification via OCPs. ENACOM handles telecom/radio. Energy efficiency labelling is administered with INTI involvement for covered products.",
    authority: "Product safety authorities / OCPs, ENACOM, INTI energy labelling.",
    filingTip:
      "Confirm whether your product is in the mandatory electrical safety list before quoting only ENACOM.",
    firstChecks: ["S mark / Res. 169 path?", "ENACOM approval?", "Energy label?"],
    pillars: {
      safety: "Res. 169/2018 electrical safety — S mark via OCP",
      emcWireless: "ENACOM",
      telecom: "ENACOM",
      energyEnv: "Energy efficiency labelling (INTI)",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "S mark (electrical safety)",
        "Mandatory electrical safety certification",
        "Argentina’s electrical safety regime requires OCP certification and S marking for covered products.",
        "Importers of regulated electrical goods.",
        ["Household appliances", "Electrical products under mandatory lists"]
      ),
      scheme(
        "ENACOM",
        "Telecom / radio approval",
        "ENACOM type approval covers radiocommunications and telecommunications equipment.",
        "Wireless and telecom suppliers.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Are Mercosur marks interchangeable with Argentina?",
        answer:
          "Not automatically. File Argentina’s safety and ENACOM paths even when other Mercosur evidence exists.",
      },
    ],
  }),

  hub({
    slug: "chile",
    marketId: "chile",
    region: "americas",
    name: "Chile",
    shortName: "Chile",
    metaTitle: "Chile Certifications — SEC, SUBTEL | Certko",
    metaDescription:
      "Chile SEC electrical certification and energy labels, plus SUBTEL type approval for telecom/radio.",
    intro:
      "Chile’s SEC certification covers electrical safety and energy labels; SUBTEL approves telecom/radio equipment.",
    overview:
      "SEC certification is required for many electrical products, often paired with energy efficiency labels. SUBTEL type approval covers radiocommunications equipment.",
    authority: "SEC, SUBTEL.",
    filingTip:
      "Treat SEC safety and SEC energy label as related but separate deliverables in the quote.",
    firstChecks: ["SEC certification?", "SEC energy label?", "SUBTEL approval?"],
    pillars: {
      safety: "SEC certification + energy label",
      emcWireless: "SUBTEL",
      telecom: "SUBTEL",
      energyEnv: "SEC energy efficiency label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "SEC",
        "Electrical certification and energy labelling",
        "SEC conformity is required for many electrical products sold in Chile, with energy labels for covered appliances.",
        "Electrical product importers and brands.",
        ["Appliances", "Electrical accessories"]
      ),
      scheme(
        "SUBTEL",
        "Telecom / radio type approval",
        "SUBTEL type approval authorises radiocommunications equipment in Chile.",
        "Wireless equipment suppliers.",
        ["Wi-Fi devices", "Mobile terminals"]
      ),
    ],
    faqs: [
      {
        question: "Does SEC cover radio?",
        answer:
          "No. Radio/telecom equipment needs SUBTEL even when SEC electrical certification applies to the product.",
      },
    ],
  }),

  hub({
    slug: "colombia",
    marketId: "colombia",
    region: "americas",
    name: "Colombia",
    shortName: "Colombia",
    metaTitle: "Colombia Certifications — RETIE, RETILAP, MinTIC | Certko",
    metaDescription:
      "Colombia RETIE/RETILAP conformity, CRC/MinTIC telecom approvals and RETIQ energy labelling.",
    intro:
      "Colombia’s RETIE and RETILAP rules drive electrical/lighting conformity; telecom gear needs MinTIC/CRC pathways.",
    overview:
      "RETIE (electrical installations/products) and RETILAP (lighting) require conformity certificates. CRC/MinTIC handle communications approvals. RETIQ covers energy labelling for listed products.",
    authority: "RETIE/RETILAP administrators, CRC / MinTIC, RETIQ.",
    filingTip:
      "Lighting products often pull RETILAP even when teams only budgeted RETIE — classify carefully.",
    firstChecks: ["RETIE or RETILAP?", "MinTIC / CRC telecom approval?", "RETIQ energy label?"],
    pillars: {
      safety: "RETIE / RETILAP conformity certificate",
      emcWireless: "CRC / MinTIC",
      telecom: "MinTIC",
      energyEnv: "RETIQ energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "RETIE / RETILAP",
        "Electrical and lighting conformity",
        "RETIE and RETILAP conformity certificates are required for many electrical and lighting products in Colombia.",
        "Importers of electrical and lighting goods.",
        ["Electrical equipment", "Luminaires", "Related products"]
      ),
      scheme(
        "MinTIC / CRC",
        "Telecom approval",
        "Communications equipment requires Colombian telecom approval before use/sale.",
        "Wireless and telecom equipment brands.",
        ["Mobile devices", "Radio equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is RETIE the same as a product safety mark like CE?",
        answer:
          "RETIE is Colombia’s electrical regulatory conformity framework — CE reports may support testing but do not replace the local certificate.",
      },
    ],
  }),

  hub({
    slug: "ecuador",
    marketId: "ecuador",
    region: "americas",
    name: "Ecuador",
    shortName: "Ecuador",
    metaTitle: "Ecuador Certifications — INEN, ARCOTEL | Certko",
    metaDescription:
      "Ecuador INEN RTE conformity and INEN-1 recognition, ARCOTEL telecom approval and energy labelling.",
    intro:
      "Ecuador uses INEN technical regulations with Certificates of Recognition, plus ARCOTEL for telecom/radio.",
    overview:
      "INEN RTEs define mandatory requirements; Certificates of Recognition (INEN-1) are commonly used at import. ARCOTEL approves telecommunications equipment. Energy labels apply to listed products.",
    authority: "INEN, ARCOTEL.",
    filingTip:
      "Confirm whether your RTE needs full certification or recognition of foreign evidence before booking labs.",
    firstChecks: ["Applicable INEN RTE?", "INEN-1 certificate?", "ARCOTEL approval?"],
    pillars: {
      safety: "INEN RTE + Certificate of Recognition (INEN-1)",
      emcWireless: "ARCOTEL",
      telecom: "ARCOTEL",
      energyEnv: "INEN energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "INEN conformity",
        "Technical regulation compliance",
        "INEN RTE conformity and recognition certificates are required for many regulated imports into Ecuador.",
        "Importers of regulated goods.",
        ["Electrical products", "Consumer goods under RTE lists"]
      ),
      scheme(
        "ARCOTEL",
        "Telecom / radio approval",
        "ARCOTEL type approval covers telecommunications and radiocommunications equipment.",
        "Wireless and telecom suppliers.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Can Andean community certificates replace INEN?",
        answer:
          "Not reliably. File Ecuador’s INEN/ARCOTEL path for the specific RTE and telecom rules that apply.",
      },
    ],
  }),

  // Middle East & Africa
  hub({
    slug: "saudi-arabia",
    marketId: "saudi-arabia",
    region: "middle-east-africa",
    featured: true,
    name: "Saudi Arabia",
    shortName: "Saudi Arabia",
    metaTitle: "Saudi Arabia Certifications — SABER, CST, SASO | Certko",
    metaDescription:
      "Saudi SABER Product & Shipment CoCs, CST type approval, SASO energy labels and importer-on-SABER duties.",
    intro:
      "Saudi clearance for regulated goods runs through SABER — Product and Shipment Certificates of Conformity — often alongside CST radio approval.",
    overview:
      "SABER issues Product CoCs and shipment-level CoCs before customs release. CST (ex-CITC) handles type approval for telecom/radio. SASO energy efficiency labels apply to covered products. GMARK may still be needed in parallel for some categories.",
    authority: "SASO / SABER, CST, energy labelling programmes.",
    filingTip:
      "Open SABER product registration before the container sails — shipment CoCs are consignment-bound.",
    firstChecks: [
      "SABER regulation / HS mapping?",
      "Product CoC active for this model?",
      "Shipment CoC via Saudi importer?",
      "CST type approval and/or GMARK?",
    ],
    pillars: {
      safety: "SASO SABER — Product CoC + Shipment CoC; Saudi Quality Mark where required",
      emcWireless: "CST (ex-CITC) type approval",
      telecom: "CST",
      energyEnv: "SASO energy efficiency label (EELS); IECEE-based routes where accepted",
      localRep: "Yes — importer on SABER",
    },
    schemes: [
      scheme(
        "SABER",
        "Product & Shipment Certificates of Conformity",
        "SABER is the operational Saudi conformity platform — Product CoC status plus shipment certificates that match customs and importer expectations.",
        "Foreign manufacturers and Saudi importers of regulated goods.",
        ["Electrical imports", "Consumer products under SASO lists", "Shipments also carrying GMARK"],
        "saber"
      ),
      scheme(
        "CST type approval",
        "Telecom / radio approval",
        "CST type approval is required for many radiocommunications and telecom devices used in Saudi Arabia.",
        "Wireless and telecom equipment brands.",
        ["Mobile devices", "Wi-Fi equipment", "IoT radio products"]
      ),
    ],
    faqs: [
      {
        question: "Does GMARK replace SABER?",
        answer:
          "No. Some products need both. SABER shipment certificates remain a Saudi import step.",
      },
    ],
  }),

  hub({
    slug: "united-arab-emirates",
    marketId: "united-arab-emirates",
    region: "middle-east-africa",
    name: "United Arab Emirates",
    shortName: "UAE",
    metaTitle: "UAE Certifications — ECAS, EQM, TDRA | Certko",
    metaDescription:
      "UAE ECAS/EQM conformity with MoIAT, TDRA type approval and ESMA/MoIAT energy efficiency labels.",
    intro:
      "UAE market access centres on ECAS/EQM conformity and TDRA approval for telecommunications equipment.",
    overview:
      "ECAS and EQM schemes under MoIAT cover many regulated products. TDRA type approval is required for radio/telecom devices. Energy efficiency labels apply to listed appliances.",
    authority: "MoIAT (ECAS/EQM), TDRA, energy label administrators.",
    filingTip:
      "For GCC multi-country launches, separate UAE ECAS/TDRA from Saudi SABER and regional GMARK — they are not one filing.",
    firstChecks: ["ECAS or EQM scheme?", "TDRA type approval?", "Energy efficiency label?"],
    pillars: {
      safety: "ECAS / EQM (MoIAT)",
      emcWireless: "TDRA type approval",
      telecom: "TDRA",
      energyEnv: "ESMA/MoIAT energy efficiency label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "ECAS / EQM",
        "UAE conformity assessment schemes",
        "ECAS/EQM conformity is required for many regulated products before UAE market placement.",
        "Importers and brands of regulated electrical and consumer goods.",
        ["Electrical appliances", "Regulated consumer products"]
      ),
      scheme(
        "TDRA",
        "Telecom / radio type approval",
        "TDRA type approval authorises telecommunications and radiocommunications equipment in the UAE.",
        "Wireless and telecom equipment suppliers.",
        ["Mobile devices", "Wi-Fi equipment", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Is GMARK enough for the UAE?",
        answer:
          "GMARK helps for GSO-covered categories but UAE ECAS/EQM and TDRA obligations can still apply — confirm per product.",
      },
    ],
  }),

  hub({
    slug: "gcc",
    marketId: "gcc",
    region: "middle-east-africa",
    featured: true,
    name: "GCC countries",
    shortName: "GCC",
    metaTitle: "GCC Certifications — GMARK | Certko",
    metaDescription:
      "Gulf Conformity Mark (GMARK) under GSO technical regulations for low-voltage equipment, toys and related categories.",
    intro:
      "GMARK is the Gulf-level conformity mark for regulated categories under GSO technical regulations — national import steps still apply.",
    overview:
      "GMARK covers regulated product groups such as low-voltage equipment and toys via Notified Bodies. Member states still run customs and national telecom approvals. Saudi shipments often need SABER in parallel.",
    authority: "GSO / GMARK Notified Bodies; national authorities in member states.",
    filingTip:
      "Price GMARK and destination-country telecom/SABER tracks together when KSA or UAE is in the launch plan.",
    firstChecks: [
      "GSO technical regulation for this category?",
      "Notified Body track?",
      "Also shipping to Saudi (SABER) or UAE (ECAS/TDRA)?",
    ],
    pillars: {
      safety: "G-Mark — GCC Conformity Tracking Scheme (low-voltage, toys, etc.), GSO standards",
      emcWireless: "National regulators in each GCC state",
      telecom: "National regulators",
      energyEnv: "GSO energy label where applicable",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "GMARK (Gulf Conformity Mark)",
        "Regional conformity mark for regulated GCC categories",
        "GMARK is assessed through recognised Notified Bodies against Gulf technical regulations for listed product families.",
        "Exporters placing GSO-regulated products into GCC member states.",
        ["Low-voltage electrical equipment", "Toys", "Other GSO-notified categories"],
        "g-mark"
      ),
    ],
    faqs: [
      {
        question: "Does one GMARK clear every GCC customs authority?",
        answer:
          "GMARK is the Gulf conformity mark for covered regulations, but each country still applies its own import and telecom procedures.",
      },
    ],
  }),

  hub({
    slug: "kuwait",
    marketId: "kuwait",
    region: "middle-east-africa",
    name: "Kuwait",
    shortName: "Kuwait",
    metaTitle: "Kuwait Certifications — KUCAS, CITRA | Certko",
    metaDescription:
      "Kuwait KUCAS conformity (TER + CoC) and CITRA type approval for telecommunications equipment.",
    intro:
      "Kuwait import conformity runs through KUCAS; communications equipment needs CITRA type approval.",
    overview:
      "KUCAS issues Technical Evaluation Reports and Certificates of Conformity for regulated imports. CITRA handles telecom/radio type approval. Energy labels apply to covered products.",
    authority: "KUCAS programme, CITRA.",
    filingTip:
      "KUCAS is often shipment-linked — align CoC timing with the sailing schedule like other Gulf CoC schemes.",
    firstChecks: ["KUCAS scope for HS code?", "CITRA type approval?", "Energy label?"],
    pillars: {
      safety: "KUCAS — TER + Certificate of Conformity",
      emcWireless: "CITRA",
      telecom: "CITRA",
      energyEnv: "Energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "KUCAS",
        "Kuwait conformity assessment",
        "KUCAS conformity (TER + CoC) is required for many regulated products before Kuwait customs clearance.",
        "Importers of regulated goods into Kuwait.",
        ["Electrical products", "Consumer goods under KUCAS lists"]
      ),
      scheme(
        "CITRA",
        "Telecom / radio type approval",
        "CITRA type approval covers telecommunications equipment for Kuwait.",
        "Wireless and telecom brands.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Does GMARK replace KUCAS?",
        answer:
          "Not for import clearance. GMARK may support the file for GSO categories, but KUCAS CoC steps can still apply.",
      },
    ],
  }),

  hub({
    slug: "oman",
    marketId: "oman",
    region: "middle-east-africa",
    name: "Oman",
    shortName: "Oman",
    metaTitle: "Oman Certifications — MoCIIP, TRA | Certko",
    metaDescription:
      "Oman MoCIIP conformity with GCC alignment and TRA type approval for telecom/radio equipment.",
    intro:
      "Oman combines MoCIIP conformity (often GCC-aligned) with TRA approvals for communications equipment.",
    overview:
      "Ministry of Commerce, Industry and Investment Promotion conformity processes cover many imports, with GCC alignment where applicable. TRA regulates telecom/radio equipment. Energy labels apply to listed products.",
    authority: "MoCIIP, TRA.",
    filingTip:
      "Ask whether GMARK evidence is accepted as part of the MoCIIP file for your category before repeating full safety testing.",
    firstChecks: ["MoCIIP conformity path?", "TRA type approval?", "Energy label?"],
    pillars: {
      safety: "MoCIIP conformity + GCC alignment",
      emcWireless: "TRA",
      telecom: "TRA",
      energyEnv: "Energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "MoCIIP conformity",
        "Oman import conformity",
        "MoCIIP conformity assessment is required for many regulated products entering Oman.",
        "Importers of regulated goods.",
        ["Electrical products", "Consumer goods"]
      ),
      scheme(
        "TRA",
        "Telecom / radio type approval",
        "TRA type approval authorises telecommunications equipment in Oman.",
        "Wireless and telecom suppliers.",
        ["Mobile devices", "Radio equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is GMARK automatically valid in Oman?",
        answer:
          "GMARK supports GSO-regulated categories, but Oman may still require national conformity and TRA steps.",
      },
    ],
  }),

  hub({
    slug: "israel",
    marketId: "israel",
    region: "middle-east-africa",
    name: "Israel",
    shortName: "Israel",
    metaTitle: "Israel Certifications — SII, MoC | Certko",
    metaDescription:
      "Israel SII approvals, Ministry of Communications type approval and energy labelling.",
    intro:
      "Israel requires SII (or recognised) approvals for many products and MoC type approval for telecom/radio equipment.",
    overview:
      "The Standards Institution of Israel and Ministry of Economy framework govern product approvals. MoC handles communications equipment type approval. Energy labels apply to covered appliances.",
    authority: "SII / Ministry of Economy, MoC.",
    filingTip:
      "Confirm whether your product needs full SII testing or can use recognised foreign evidence under current orders.",
    firstChecks: ["SII approval path?", "MoC type approval?", "Energy label?"],
    pillars: {
      safety: "SII approval (Standards Institution of Israel), Ministry of Economy",
      emcWireless: "MoC type approval",
      telecom: "MoC",
      energyEnv: "Energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "SII approval",
        "Israeli standards conformity",
        "SII approval is required for many regulated products before Israeli market placement.",
        "Importers of regulated electrical and consumer goods.",
        ["Electrical appliances", "Selected consumer products"]
      ),
      scheme(
        "MoC type approval",
        "Telecom / radio approval",
        "Ministry of Communications type approval covers radiocommunications equipment in Israel.",
        "Wireless and telecom equipment brands.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Does CE replace SII?",
        answer:
          "CE may reduce testing via recognition mechanisms for some categories, but Israeli approval formalities still apply.",
      },
    ],
  }),

  hub({
    slug: "egypt",
    marketId: "egypt",
    region: "middle-east-africa",
    name: "Egypt",
    shortName: "Egypt",
    metaTitle: "Egypt Certifications — GOEIC, NTRA | Certko",
    metaDescription:
      "Egypt GOEIC factory registration and EOS standards, NTRA type approval and energy labelling.",
    intro:
      "Egypt often requires GOEIC registration of the foreign factory plus NTRA approval for telecom/radio devices.",
    overview:
      "GOEIC registration and EOS standards drive import conformity for many goods. NTRA type approval covers telecommunications equipment. Energy labels apply to listed products.",
    authority: "GOEIC, EOS, NTRA.",
    filingTip:
      "Factory registration with GOEIC is frequently the long pole — start it before production for Egypt-bound SKUs.",
    firstChecks: [
      "GOEIC factory registration status?",
      "EOS standard / CoC path?",
      "NTRA type approval?",
    ],
    pillars: {
      safety: "GOEIC registration of the factory + EOS standards",
      emcWireless: "NTRA",
      telecom: "NTRA",
      energyEnv: "Energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "GOEIC / EOS",
        "Import conformity and standards",
        "GOEIC processes and EOS standards govern conformity for many products imported into Egypt.",
        "Exporters and importers of regulated goods.",
        ["Electrical products", "Consumer goods under mandatory lists"]
      ),
      scheme(
        "NTRA",
        "Telecom / radio type approval",
        "NTRA type approval is required for telecommunications and radiocommunications equipment.",
        "Wireless and telecom brands.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is shipment inspection enough without factory registration?",
        answer:
          "For many categories GOEIC expects the foreign factory to be registered — shipment paperwork alone is not enough.",
      },
    ],
  }),

  hub({
    slug: "algeria",
    marketId: "algeria",
    region: "middle-east-africa",
    name: "Algeria",
    shortName: "Algeria",
    metaTitle: "Algeria Certifications — IANOR, ARPCE | Certko",
    metaDescription:
      "Algeria IANOR standards and import conformity certificates plus ARPCE telecom type approval.",
    intro:
      "Algeria requires conformity certificates at import against IANOR-related standards and ARPCE approval for communications equipment.",
    overview:
      "Import conformity certificates reference Algerian / IANOR standards. ARPCE regulates telecom/radio equipment. Local representation is expected for filings.",
    authority: "IANOR-related conformity framework, ARPCE.",
    filingTip:
      "Confirm French-language documentation expectations early — incomplete dossiers stall Algerian clearance.",
    firstChecks: ["Import conformity certificate path?", "ARPCE type approval?"],
    pillars: {
      safety: "IANOR standards; conformity certificate at import",
      emcWireless: "ARPCE",
      telecom: "ARPCE",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "Import conformity",
        "IANOR-related conformity certificate",
        "Conformity certificates are commonly required for regulated goods at Algerian import.",
        "Importers of regulated products.",
        ["Electrical products", "Consumer goods"]
      ),
      scheme(
        "ARPCE",
        "Telecom / radio type approval",
        "ARPCE type approval covers telecommunications equipment in Algeria.",
        "Wireless and telecom suppliers.",
        ["Mobile devices", "Radio equipment"]
      ),
    ],
    faqs: [
      {
        question: "Does CE clear Algeria automatically?",
        answer:
          "No. Expect national import conformity and ARPCE filings even when CE reports exist.",
      },
    ],
  }),

  hub({
    slug: "nigeria",
    marketId: "nigeria",
    region: "middle-east-africa",
    name: "Nigeria",
    shortName: "Nigeria",
    metaTitle: "Nigeria Certifications — SONCAP, NCC | Certko",
    metaDescription:
      "Nigeria SONCAP Product Certificate + SONCAP Certificate (pre-shipment) and NCC type approval.",
    intro:
      "Nigeria’s high-volume path for many goods is SONCAP pre-shipment conformity, with NCC type approval for telecom/radio.",
    overview:
      "SONCAP typically needs a Product Certificate and a shipment-related SONCAP Certificate before loading. NCC type approval covers telecommunications equipment. These are recurring, shipment-linked processes.",
    authority: "SON / SONCAP programme, NCC.",
    filingTip:
      "Treat SONCAP as a per-shipment operating rhythm — product certificates expire and each consignment needs its CoC.",
    firstChecks: [
      "SONCAP Product Certificate for this model?",
      "Shipment SONCAP Certificate timed to loading?",
      "NCC type approval for radio/telecom?",
    ],
    pillars: {
      safety: "SONCAP — Product Cert + SONCAP Cert (pre-shipment)",
      emcWireless: "NCC type approval",
      telecom: "NCC",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "SONCAP",
        "Pre-shipment conformity programme",
        "SONCAP Product Certificates and shipment certificates are required for many regulated goods before export to Nigeria.",
        "Exporters shipping regulated goods into Nigeria on a recurring basis.",
        ["Electrical products", "Consumer goods under SONCAP lists"]
      ),
      scheme(
        "NCC",
        "Telecom / radio type approval",
        "NCC type approval authorises telecommunications equipment for Nigeria.",
        "Wireless and telecom equipment brands.",
        ["Mobile devices", "Wi-Fi equipment"]
      ),
    ],
    faqs: [
      {
        question: "Is SONCAP a one-time factory licence?",
        answer:
          "No. Product certificates have validity windows and shipment certificates are raised per consignment.",
      },
    ],
  }),

  hub({
    slug: "kenya",
    marketId: "kenya",
    region: "middle-east-africa",
    name: "Kenya",
    shortName: "Kenya",
    metaTitle: "Kenya Certifications — KEBS PVoC, CA | Certko",
    metaDescription:
      "Kenya KEBS PVoC Certificate of Conformity (pre-shipment) and Communications Authority type approval.",
    intro:
      "Kenya uses KEBS PVoC pre-shipment Certificates of Conformity, with CA type approval for communications equipment.",
    overview:
      "PVoC requires inspection/conformity assessment before shipment for regulated goods. CA type approval covers telecom/radio devices. Like other pre-shipment CoC programmes, this is operational and recurring.",
    authority: "KEBS (PVoC), Communications Authority (CA).",
    filingTip:
      "Book PVoC inspection early in the logistics timeline — last-minute CoCs are a common cause of rolled sailings.",
    firstChecks: ["PVoC scope for HS code?", "CoC scheduled before shipment?", "CA type approval?"],
    pillars: {
      safety: "KEBS PVoC — Certificate of Conformity pre-shipment",
      emcWireless: "CA type approval",
      telecom: "CA",
      energyEnv: "—",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "KEBS PVoC",
        "Pre-shipment Certificate of Conformity",
        "PVoC Certificates of Conformity are required for many regulated consignments before they ship to Kenya.",
        "Exporters of regulated goods into Kenya.",
        ["Electrical products", "Consumer goods under PVoC lists"]
      ),
      scheme(
        "CA type approval",
        "Telecom / radio approval",
        "Communications Authority type approval covers radiocommunications equipment in Kenya.",
        "Wireless and telecom suppliers.",
        ["Mobile devices", "Radio equipment"]
      ),
    ],
    faqs: [
      {
        question: "Can I obtain PVoC after the goods arrive?",
        answer:
          "PVoC is designed as a pre-shipment programme. Arriving without a CoC risks detention and costly rework.",
      },
    ],
  }),

  hub({
    slug: "south-africa",
    marketId: "south-africa",
    region: "middle-east-africa",
    name: "South Africa",
    shortName: "South Africa",
    metaTitle: "South Africa Certifications — NRCS LOA, ICASA | Certko",
    metaDescription:
      "South Africa NRCS Letter of Authority to SANS, ICASA type approval and NRCS energy labelling.",
    intro:
      "South Africa requires an NRCS Letter of Authority against SANS for many electrical goods, plus ICASA approval for radio/telecom.",
    overview:
      "NRCS LOAs demonstrate conformity to applicable SANS standards for regulated products. ICASA type approval covers electronic communications equipment. Energy labels fall under NRCS for listed appliances.",
    authority: "NRCS, ICASA.",
    filingTip:
      "LOA validity and model binding are strict — don’t assume a similar SKU is covered without checking the LOA schedule.",
    firstChecks: ["NRCS LOA / SANS standard?", "ICASA type approval?", "NRCS energy label?"],
    pillars: {
      safety: "NRCS Letter of Authority (LOA) to SANS",
      emcWireless: "ICASA type approval",
      telecom: "ICASA",
      energyEnv: "NRCS energy label",
      localRep: "Yes",
    },
    schemes: [
      scheme(
        "NRCS LOA",
        "Letter of Authority to SANS",
        "An NRCS LOA is required for many electrical and related products before South African sale.",
        "Importers of NRCS-regulated goods.",
        ["Electrical appliances", "Components under LOA schedules"]
      ),
      scheme(
        "ICASA",
        "Telecom / radio type approval",
        "ICASA type approval is mandatory for many electronic communications and radio products.",
        "Wireless and telecom equipment brands.",
        ["Mobile devices", "Wi-Fi equipment", "Radio modules"]
      ),
    ],
    faqs: [
      {
        question: "Does CB certification replace an LOA?",
        answer:
          "CB reports can support the technical file, but an NRCS LOA is still the local authorisation document for covered products.",
      },
    ],
  }),
];

export function gmaSeedsBySlug(): Map<string, GmaCountrySeed> {
  return new Map(GMA_COUNTRY_SEEDS.map((h) => [h.slug, h]));
}
