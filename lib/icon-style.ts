export type IconStyleId = "outline" | "original" | "3d";

export interface IconStyleOption {
  id: IconStyleId;
  name: string;
  description: string;
}

export const DEFAULT_ICON_STYLE: IconStyleId = "original";

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
    id: "3d",
    name: "Original color 3D",
    description: "Same original colors with embossed 3D depth, gloss and tilt.",
  },
];

/** Map legacy saved values to the current three styles. */
function normalizeIconStyle(value: string): string {
  const v = value.trim().toLowerCase();
  if (v === "plain" || v === "no-color" || v === "monochrome") return "outline";
  if (v === "colorful" || v === "color" || v === "coloured") return "original";
  return v;
}

export function isIconStyleId(value: string): value is IconStyleId {
  const v = normalizeIconStyle(value);
  return v === "outline" || v === "original" || v === "3d";
}

export function resolveIconStyle(value?: string | null): IconStyleId {
  const v = normalizeIconStyle(value || "");
  if (v === "outline" || v === "original" || v === "3d") return v;
  return DEFAULT_ICON_STYLE;
}

/** Stable 0–11 hue bucket from an icon name (for original / 3d mode CSS). */
export function iconHue(name: string): number {
  const s = (name || "box").trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 12;
}

export function iconStyleLabel(id: IconStyleId): string {
  return ICON_STYLES.find((s) => s.id === id)?.name || "Icons";
}
