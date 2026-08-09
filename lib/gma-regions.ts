/** Region grouping for Global Market Access country hubs. */

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

/** Horizontal regimes that cut across markets (shown on GMA overview). */
export const HORIZONTAL_REGIMES = [
  {
    name: "RoHS-family",
    where: "EU, UK, China, India, Korea, Japan (J-Moss), Taiwan, EAEU, UAE",
    demands:
      "Substance restriction, test reports per homogeneous material, Declaration of Conformity and technical file.",
  },
  {
    name: "REACH-family",
    where: "EU, UK, Korea, Turkey (KKDIK), China (new-substance)",
    demands:
      "SVHC declaration, registration for substances above threshold, SCIP notification where required.",
  },
  {
    name: "EPR / WEEE / packaging",
    where: "EU, UK, India (E-Waste Rules), Canada, US states, Australia",
    demands: "Producer registration, take-back targets and annual returns.",
  },
  {
    name: "Batteries",
    where: "EU Battery Regulation, India BWMR, UN38.3 for transport",
    demands: "Labelling, due diligence, transport test summary and market-specific filings.",
  },
  {
    name: "Cybersecurity",
    where: "EU RED 3(3)(d/e/f), EU CRA, UK PSTI, US Cyber Trust Mark",
    demands: "Secure-by-design evidence and vulnerability disclosure expectations.",
  },
];

export const GMA_SHORTCUTS = [
  {
    name: "IECEE CB Scheme",
    text: "One CB Test Certificate + report converts into national safety approvals across many member bodies with national-difference testing only — the main cost saver for electrical goods.",
  },
  {
    name: "Mutual Recognition Agreements",
    text: "A recognised CAB in one country can issue reports accepted by a partner regulator, cutting duplicate lab campaigns.",
  },
  {
    name: "CE → UKCA → GCC / G-Mark reuse",
    text: "Heavy reuse of the same LVD / EMC test package when standards align — still file each mark separately.",
  },
  {
    name: "FCC + ISED + ACMA",
    text: "Radio suites overlap heavily; one lab campaign often supports three North America / Australia filings.",
  },
  {
    name: "Regional blocs",
    text: "EAEU (one EAC for five states) and GCC (one G-Mark covering member states) reduce parallel national safety tracks.",
  },
];
