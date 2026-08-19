/** Paths that must render without opening SQLite (Hostinger login spinner). */
export function isDbFreePath(pathname: string): boolean {
  const path = (pathname || "").split("?")[0];
  return path === "/admin/login" || path.startsWith("/api/admin/captcha");
}

/** Safe in-app next path after admin login. */
export function safeAdminNextPath(raw: string | undefined | null): string {
  const value = (raw || "").trim();
  if (!value || !value.startsWith("/admin") || value.startsWith("//") || value.includes("://")) {
    return "/admin";
  }
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}
