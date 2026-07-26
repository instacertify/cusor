export type IconStyleId = "colorful" | "plain" | "3d";

export interface IconStyleOption {
  id: IconStyleId;
  name: string;
  description: string;
}

export const DEFAULT_ICON_STYLE: IconStyleId = "3d";

export const ICON_STYLES: IconStyleOption[] = [
  {
    id: "3d",
    name: "3D icons",
    description: "Embossed chips with depth, gloss and a slight tilt.",
  },
  {
    id: "colorful",
    name: "Colorful icons",
    description: "Each icon gets a soft distinct color chip across the site.",
  },
  {
    id: "plain",
    name: "Plain icons",
    description: "Monochrome brand chips — cream / amber only.",
  },
];

export function isIconStyleId(value: string): value is IconStyleId {
  return value === "colorful" || value === "plain" || value === "3d";
}

export function resolveIconStyle(value?: string | null): IconStyleId {
  const v = (value || "").trim().toLowerCase();
  return isIconStyleId(v) ? v : DEFAULT_ICON_STYLE;
}

/** Stable 0–11 hue bucket from an icon name (for colorful / 3d mode CSS). */
export function iconHue(name: string): number {
  const s = (name || "box").trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 12;
}

export function iconStyleLabel(id: IconStyleId): string {
  return ICON_STYLES.find((s) => s.id === id)?.name || "Icons";
}
