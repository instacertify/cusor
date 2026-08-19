/** Client-safe helpers for upload URLs (no Node fs). */

export function isUploadUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/uploads/") || src.startsWith("/api/uploads/");
}

/**
 * Always load CMS uploads through the Node API route.
 * Hostinger / Nginx often 404s bare /uploads/* from the disk before
 * proxying to Next — /api/uploads/* reliably hits the app.
 */
export function toServableUploadUrl(src: string | null | undefined): string {
  if (!src) return "";
  const raw = src.trim();
  if (raw.startsWith("/uploads/")) {
    return `/api/uploads/${raw.slice("/uploads/".length)}`;
  }
  return raw;
}

/** Rewrite /uploads/… src attributes inside rendered HTML (markdown images). */
export function rewriteUploadUrlsInHtml(html: string): string {
  if (!html || !html.includes("/uploads/")) return html;
  return html
    .replace(/(src|href)=(["'])\/uploads\//gi, "$1=$2/api/uploads/")
    .replace(/url\(\s*(['"]?)\/uploads\//gi, "url($1/api/uploads/");
}
