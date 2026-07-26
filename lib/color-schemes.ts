export type ColorSchemeId =
  | "certko"
  | "ocean"
  | "forest"
  | "slate"
  | "copper"
  | "ink";

export interface ColorScheme {
  id: ColorSchemeId;
  name: string;
  description: string;
  /** Preview swatches: ink, accent, surface */
  swatches: [string, string, string];
  themeColor: string;
}

export const DEFAULT_COLOR_SCHEME: ColorSchemeId = "certko";

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "certko",
    name: "Certko Classic",
    description: "Navy, golden amber and cream — the brand default.",
    swatches: ["#16263D", "#F7C453", "#FAF6EE"],
    themeColor: "#16263D",
  },
  {
    id: "ocean",
    name: "Ocean Teal",
    description: "Deep teal ink with a bright aqua accent.",
    swatches: ["#0F3D4C", "#2EC4B6", "#F2F7F6"],
    themeColor: "#0F3D4C",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Evergreen ink with a soft leaf-green accent.",
    swatches: ["#1F3D2A", "#7CB342", "#F4F7F1"],
    themeColor: "#1F3D2A",
  },
  {
    id: "slate",
    name: "Slate Blue",
    description: "Cool slate surfaces with a clear sky accent.",
    swatches: ["#1E293B", "#38BDF8", "#F5F7FA"],
    themeColor: "#1E293B",
  },
  {
    id: "copper",
    name: "Copper",
    description: "Warm charcoal with a copper accent on parchment.",
    swatches: ["#2C241C", "#D97745", "#F7F1E8"],
    themeColor: "#2C241C",
  },
  {
    id: "ink",
    name: "Midnight Ink",
    description: "Near-black ink with a crisp electric blue accent.",
    swatches: ["#111827", "#60A5FA", "#F3F4F6"],
    themeColor: "#111827",
  },
];

const SCHEME_MAP = Object.fromEntries(COLOR_SCHEMES.map((s) => [s.id, s])) as Record<
  ColorSchemeId,
  ColorScheme
>;

export function isColorSchemeId(value: string | undefined | null): value is ColorSchemeId {
  return Boolean(value && value in SCHEME_MAP);
}

export function resolveColorScheme(value?: string | null): ColorScheme {
  if (isColorSchemeId(value)) return SCHEME_MAP[value];
  return SCHEME_MAP[DEFAULT_COLOR_SCHEME];
}
