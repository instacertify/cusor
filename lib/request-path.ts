/** Paths that must render without opening SQLite (Hostinger login spinner). */
export function isDbFreePath(pathname: string): boolean {
  const path = (pathname || "").split("?")[0];
  return path === "/admin/login" || path.startsWith("/api/admin/captcha");
}
