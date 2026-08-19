/** Admin list pages: 15 rows per page, with category filters preserved in the URL. */

export const ADMIN_PAGE_SIZE = 15;

export type AdminFilterOption = { value: string; label: string };

export function parseAdminPage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return Math.max(1, Number(v) || 1);
}

export function adminOffset(page: number, pageSize = ADMIN_PAGE_SIZE): number {
  return (Math.max(1, page) - 1) * pageSize;
}

export function adminTotalPages(total: number, pageSize = ADMIN_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function clampAdminPage(page: number, total: number, pageSize = ADMIN_PAGE_SIZE): number {
  return Math.min(Math.max(1, page), adminTotalPages(total, pageSize));
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize = ADMIN_PAGE_SIZE
): { items: T[]; total: number; page: number; pages: number } {
  const total = items.length;
  const pages = adminTotalPages(total, pageSize);
  const safe = Math.min(Math.max(1, page), pages);
  const start = (safe - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page: safe, pages };
}

/** Build a list URL, dropping empty params and page=1. */
export function adminListHref(
  path: string,
  params: Record<string, string | number | undefined | null>,
  page?: number
): string {
  const u = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || key === "saved" || key === "error" || key === "cache") continue;
    if (value === undefined || value === null) continue;
    const s = String(value).trim();
    if (!s) continue;
    u.set(key, s);
  }
  const p = page ?? (Number(params.page) || 1);
  if (p > 1) u.set("page", String(p));
  const qs = u.toString();
  return qs ? `${path}?${qs}` : path;
}
