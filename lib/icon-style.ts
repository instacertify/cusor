export type IconStyleId = "colorful" | "plain";

export interface IconStyleOption {
  id: IconStyleId;
  name: string;
  description: string;
}

export const DEFAULT_ICON_STYLE: IconStyleId = "colorful";

export const ICON_STYLES: IconStyleOption[] = [
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
  return value === "colorful" || value === "plain";
}

export function resolveIconStyle(value?: string | null): IconStyleId {
  const v = (value || "").trim().toLowerCase();
  return isIconStyleId(v) ? v : DEFAULT_ICON_STYLE;
}

/** Stable 0–11 hue bucket from an icon name (for colorful mode CSS). */
export function iconHue(name: string): number {
  const s = (name || "box").trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 12;
}
