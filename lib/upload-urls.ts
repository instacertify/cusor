/** Client-safe helpers for upload URLs / accept attributes (no Node fs). */

export const IMAGE_ACCEPT =
  "image/*,.png,.jpg,.jpeg,.jfif,.webp,.gif,.svg,.avif,.bmp,.ico,.tif,.tiff,.heic,.heif";

export function isUploadUrl(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/uploads/") || src.startsWith("/api/uploads/");
}
