/** Pure date helpers for blog scheduling (no DB imports — safe for seeds). */

const DUE_GRACE_MS = 2_000;

/** Parse admin datetime-local / ISO / date-only into a valid Date, or null. */
export function parseScheduleInput(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;
  // date-only → local noon (avoids previous-day UTC surprises in most TZ)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Value for `<input type="datetime-local">` from a stored published_at. */
export function toDatetimeLocalValue(stored: string | null | undefined): string {
  if (!stored) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(stored)) return `${stored}T09:00`;
  const d = new Date(stored);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isBlogPublishDue(
  publishedAt: string | null | undefined,
  now = new Date()
): boolean {
  if (!publishedAt) return false;
  const when = parseScheduleInput(publishedAt);
  if (!when) return false;
  return when.getTime() <= now.getTime() + DUE_GRACE_MS;
}

/**
 * Seed / import helper: future dates must be `scheduled`, never live `published`.
 */
export function seedStatusForPublishAt(
  publishedAt: string,
  now = new Date()
): "published" | "scheduled" {
  return isBlogPublishDue(publishedAt, now) ? "published" : "scheduled";
}
