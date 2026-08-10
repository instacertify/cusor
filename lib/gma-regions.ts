/** Region grouping for Global Market Access country hubs.
 *  Framework aligned to the Instacertify Global Market Access country matrix
 *  (four pillars + local rep, horizontal regimes, multi-market shortcuts).
 */

export type GmaRegionId =
  | "asia-pacific"
  | "europe-eurasia"
  | "americas"
  | "middle-east-africa";

export interface GmaRegionDef {
  id: GmaRegionId;
  label: string;
  sort: number;
}

export const GMA_REGIONS: GmaRegionDef[] = [
  { id: "asia-pacific", label: "Asia-Pacific", sort: 10 },
  { id: "europe-eurasia", label: "Europe & Eurasia", sort: 20 },
  { id: "americas", label: "Americas", sort: 30 },
  { id: "middle-east-africa", label: "Middle East & Africa", sort: 40 },
];

export function gmaRegionLabel(id: string): string {
  return GMA_REGIONS.find((r) => r.id === id)?.label || id || "Other markets";
}

export interface CountryPillars {
  safety: string;
  emcWireless: string;
  telecom: string;
  energyEnv: string;
  localRep: string;
}

export const PILLAR_LABELS: { key: keyof CountryPillars; label: string }[] = [
  { key: "safety", label: "Electrical / product safety" },
  { key: "emcWireless", label: "EMC & wireless" },
  { key: "telecom", label: "Telecom / network" },
  { key: "energyEnv", label: "Energy / environment" },
  { key: "localRep", label: "Local representation" },
];

/** Sheet 2 — horizontal regimes that cut across markets (usual scoping gaps). */
export const HORIZONTAL_REGIMES = [
  {
    name: "RoHS family",
    where: "EU, UK, China, India, South Korea, Japan (J-Moss), Taiwan, EAEU, UAE",
    demands:
      "Restriction of 10 substances per homogeneous material — often missed when only the safety mark is scoped.",
    evidence: "Test reports per material, BOM, supplier declarations, DoC, technical file",
  },
  {
    name: "REACH family",
    where: "EU, UK, South Korea (K-REACH), Turkey (KKDIK), China (new-substance)",
    demands:
      "SVHC screening; registration above 1 t/y; SCIP notification in the EU.",
    evidence: "SVHC test report, safety data sheets, SCIP dossier number",
  },
  {
    name: "EPR / WEEE / packaging",
    where: "EU, UK, India (E-Waste Rules 2022, Plastic Waste Rules), Canada, US states, Australia",
    demands:
      "Producer registration, collection targets, annual returns and eco-fees.",
    evidence: "EPR registration certificate, take-back plan, annual filing, recycler tie-up",
  },
  {
    name: "Batteries",
    where: "EU Battery Reg 2023/1542, India BWMR 2022, UN 38.3 for transport",
    demands:
      "Carbon footprint / due diligence (EU), labelling, and transport safety evidence.",
    evidence: "UN 38.3 test summary, IEC 62133 report, battery passport data (EU)",
  },
  {
    name: "Chemicals in articles",
    where: "California Prop 65, EU POPs, global PFAS restrictions",
    demands: "Threshold testing and warning labels where required.",
    evidence: "Chemical test report, warning label artwork, exposure assessment",
  },
  {
    name: "Cybersecurity",
    where: "EU RED Art. 3(3)(d,e,f), EU Cyber Resilience Act, UK PSTI, US Cyber Trust Mark",
    demands:
      "Secure-by-design evidence, vulnerability disclosure policy, no default passwords.",
    evidence: "EN 18031 assessment, VDP statement, statement of compliance",
  },
  {
    name: "Legal metrology / labelling",
    where: "India LMPC, Gulf Arabic labelling, EU language requirements",
    demands:
      "On-pack declarations: importer, MRP / net quantity, country of origin and language.",
    evidence: "LMPC importer registration, artwork approval, label proof",
  },
  {
    name: "Food / cosmetics / medical",
    where: "India FSSAI & CDSCO, EU MDR/IVDR & CPNP, US FDA",
    demands: "Product licence or registration before import — separate from electrical GMA.",
    evidence: "Product licence, stability / safety study, technical file",
  },
];

/** Sheet 3 — multi-market shortcuts that reduce duplicate testing cost. */
export const GMA_SHORTCUTS = [
  {
    name: "IECEE CB Scheme",
    text: "One CB Test Certificate + CB Test Report from an NCB converts to national approvals with only national-difference testing — the single biggest cost saver for electrical goods.",
    markets: "50+ member bodies incl. IN, SG, MY, AE, SA, KR, JP, ZA, AU",
  },
  {
    name: "Mutual Recognition Agreements",
    text: "A conformity assessment body in one country issues reports the partner regulator accepts — e.g. India TEC recognised CABs; US–EU and EU–JP telecom MRAs.",
    markets: "MRA partner pairs (varies by sector)",
  },
  {
    name: "CE → UKCA → G-Mark",
    text: "Same LVD / EMC test package reused across all three regimes — still file each mark separately. Natural upsell on every CE job.",
    markets: "EU 27, UK, GCC 7",
  },
  {
    name: "FCC + ISED + ACMA",
    text: "Largely common radio test suites (RSS, ICES, AS/NZS align with FCC Part 15) — one lab visit, three filings.",
    markets: "US, Canada, Australia, New Zealand",
  },
  {
    name: "Regional blocs",
    text: "One certificate covers the whole bloc — EAC for five EAEU states, G-Mark across GSO member states.",
    markets: "EAEU 5 · GCC / G-Mark 7",
  },
  {
    name: "Pre-shipment CoC programmes",
    text: "Per-shipment conformity certificates rather than one-time approval — recurring work on every consignment.",
    markets: "Nigeria SONCAP, Kenya PVoC, Saudi SABER SCoC, Kuwait KUCAS",
  },
];

/** Scoping-call checklist from the Instacertify GMA matrix. */
export const GMA_SCOPING_STEPS = [
  "Fix the product classification first — one HS code can trigger three separate schemes in the same market.",
  "Run the four pillars (safety, EMC/wireless, telecom, energy/environment) against each destination market.",
  "Check horizontal regimes — RoHS, EPR and labelling are the usual gaps.",
  "Look for a bloc or CB Scheme route before quoting per-country testing.",
  "Confirm who will act as local representative — often the real bottleneck for a foreign manufacturer.",
];
