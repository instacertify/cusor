export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatINR(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 100000) {
    const l = value / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  if (value >= 1000) return `₹${Math.round(value / 1000)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null && max == null) return "On request";
  if (min != null && max != null && min !== max)
    return `${formatINR(min)} – ${formatINR(max)}`;
  return formatINR(min ?? max);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}
