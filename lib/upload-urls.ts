/** Client-safe helpers for upload URLs (no Node fs). */

export function isUploadUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/uploads/") || src.startsWith("/api/uploads/");
}
