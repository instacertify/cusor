export type IconStyleId = "outline" | "original" | "soft" | "lifelike" | "3d";

export interface IconStyleOption {
  id: IconStyleId;
  name: string;
  description: string;
}

export type IconScaleId = "100" | "115" | "125" | "135";

export interface IconScaleOption {
  id: IconScaleId;
  name: string;
  description: string;
  factor: number;
}

export const DEFAULT_ICON_STYLE: IconStyleId = "original";
export const DEFAULT_ICON_SCALE: IconScaleId = "115";

export const ICON_STYLES: IconStyleOption[] = [
  {
    id: "outline",
    name: "No-color outline",
    description: "Simple ink outline icons — no colored fill or chip background.",
  },
  {
    id: "original",
    name: "Original color",
    description: "Icons keep their soft original colors in flat chips.",
  },
  {
    id: "soft",
    name: "Soft real",
    description: "Rounded soft UI icons with gentle depth — closer to real product apps.",
  },
  {
    id: "lifelike",
    name: "Lifelike example",
    description: "Photo-like material icons with richer color, gloss, and real-world presence.",
  },
  {
    id: "3d",
    name: "Original color 3D",
    description: "Same original colors with embossed 3D depth, gloss and tilt.",
  },
];

export const ICON_SCALES: IconScaleOption[] = [
  {
    id: "100",
    name: "100% — default",
    description: "Original design size across the site.",
    factor: 1,
  },
  {
    id: "115",
    name: "115% — bigger",
    description: "15% larger icons — easier to spot in real layouts.",
    factor: 1.15,
  },
  {
    id: "125",
    name: "125% — large",
    description: "25% larger for stronger visual weight.",
    factor: 1.25,
  },
  {
    id: "135",
    name: "135% — XL",
    description: "35% larger — maximum emphasis sitewide.",
    factor: 1.35,
  },
];

/** Map legacy saved values to the current styles. */
function normalizeIconStyle(value: string): string {
  const v = value.trim().toLowerCase();
  if (v === "plain" || v === "no-color" || v === "monochrome") return "outline";
  if (v === "colorful" || v === "color" || v === "coloured") return "original";
  if (v === "soft-real" || v === "soft_real" || v === "real") return "soft";
  if (v === "life-like" || v === "realistic" || v === "photo") return "lifelike";
  return v;
}

export function isIconStyleId(value: string): value is IconStyleId {
  const v = normalizeIconStyle(value);
  return (
    v === "outline" ||
    v === "original" ||
    v === "soft" ||
    v === "lifelike" ||
    v === "3d"
  );
}

export function resolveIconStyle(value?: string | null): IconStyleId {
  const v = normalizeIconStyle(value || "");
  if (isIconStyleId(v)) return v;
  return DEFAULT_ICON_STYLE;
}

export function isIconScaleId(value: string): value is IconScaleId {
  return value === "100" || value === "115" || value === "125" || value === "135";
}

export function resolveIconScale(value?: string | null): IconScaleId {
  const v = String(value ?? "").trim();
  if (isIconScaleId(v)) return v;
  return DEFAULT_ICON_SCALE;
}

export function iconScaleFactor(scale: IconScaleId): number {
  return ICON_SCALES.find((s) => s.id === scale)?.factor ?? 1.15;
}

/** Stable 0–11 hue bucket from an icon name (for colored modes). */
export function iconHue(name: string): number {
  const s = (name || "box").trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 12;
}

export function iconStyleLabel(id: IconStyleId): string {
  return ICON_STYLES.find((s) => s.id === id)?.name || "Icons";
}

export function iconScaleLabel(id: IconScaleId): string {
  return ICON_SCALES.find((s) => s.id === id)?.name || "115%";
}
