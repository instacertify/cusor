/**
 * Users often type the whole sum (6+4 or 7-3) instead of the number 10 / 4.
 * Accept both. Keep this file free of Next/DB imports so tests can load it.
 */
export function normalizeCaptchaAnswer(raw: string): string {
  const compact = (raw || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!compact) return "";

  const expr = compact
    .replace(/[−–—]/g, "-")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-");

  const sum = expr.match(/^(-?\d+)([+-])(-?\d+)(?:=-?\d+)?$/);
  if (sum) {
    const left = Number(sum[1]);
    const right = Number(sum[3]);
    const n = sum[2] === "+" ? left + right : left - right;
    if (Number.isFinite(n)) return String(n);
  }

  if (/^-?\d+$/.test(expr)) return String(Number(expr));
  return expr;
}
