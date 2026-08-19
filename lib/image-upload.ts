/**
 * Shared image upload helpers — accept common web formats and normalize
 * the saved file extension from magic bytes so JPG/JPEG/WebP/PNG/GIF/AVIF
 * always serve with a correct Content-Type on the public site.
 */

import { isUploadUrl } from "@/lib/upload-urls";

export const BLOG_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif,image/bmp,image/svg+xml,.png,.jpg,.jpeg,.jpe,.jfif,.webp,.gif,.avif,.bmp,.svg";

export const BLOG_IMAGE_HINT =
  "Recommended 1200×630 (16:9). Max upload 8 MB — stored compressed (≤1.5 MB, max 1920px). Accepted: PNG, JPG/JPEG, WebP, GIF, AVIF, BMP, SVG.";

export const CMS_IMAGE_HINT =
  "Max upload 8 MB. Images are compressed for storage (≤1.5 MB, longest edge 1920px; photos saved as WebP). Accepted: PNG, JPG/JPEG, WebP, GIF, AVIF, BMP, SVG.";

/** Extensions we accept for blog covers (aliases included). */
export const BLOG_COVER_EXTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".jpe",
  ".jfif",
  ".webp",
  ".gif",
  ".avif",
  ".bmp",
  ".svg",
];

export const DEFAULT_IMAGE_EXTS = [
  ...BLOG_COVER_EXTS,
  ".tif",
  ".tiff",
  ".ico",
];

/** Formats Next/Image optimizer handles reliably. GIF uses raw <img> to keep animation. */
const OPTIMIZABLE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".jpe",
  ".jfif",
  ".webp",
  ".avif",
]);

export function extFromPath(src: string): string {
  try {
    const pathname = src.startsWith("http")
      ? new URL(src).pathname
      : src.split("?")[0] || src;
    const i = pathname.lastIndexOf(".");
    return i >= 0 ? pathname.slice(i).toLowerCase() : "";
  } catch {
    return "";
  }
}

/** True when we should render a plain <img> instead of the optimizer. */
export function shouldSkipImageOptimization(src: string): boolean {
  if (!src) return true;
  // Admin uploads may live outside public/ (data/uploads fallback). next/image
  // only reads public/, so always use a native <img> for /uploads URLs — the
  // /uploads → /api/uploads rewrite serves the correct Content-Type.
  if (isUploadUrl(src)) return true;
  const ext = extFromPath(src);
  if (!ext) return true;
  return !OPTIMIZABLE_EXTS.has(ext);
}

export type DetectedImage = {
  ext: string;
  mime: string;
};

/**
 * Detect image type from file bytes. Prefer this over the upload filename so a
 * `.jp` / mislabeled file still saves as the correct `.jpg` / `.png` / etc.
 */
export function detectImageType(buf: Buffer, filename = ""): DetectedImage | null {
  if (!buf.length) return null;

  // JPEG
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }
  // PNG
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { ext: ".png", mime: "image/png" };
  }
  // GIF
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return { ext: ".gif", mime: "image/gif" };
  }
  // WEBP (RIFF....WEBP)
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }
  // BMP
  if (buf.length >= 2 && buf[0] === 0x42 && buf[1] === 0x4d) {
    return { ext: ".bmp", mime: "image/bmp" };
  }
  // AVIF / HEIC-family via ftyp box
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand.startsWith("avif") || brand === "avis" || brand === "mif1") {
      return { ext: ".avif", mime: "image/avif" };
    }
  }
  // SVG (text)
  const head = buf.subarray(0, Math.min(buf.length, 256)).toString("utf8").trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && /<svg[\s>]/i.test(head))) {
    return { ext: ".svg", mime: "image/svg+xml" };
  }

  // Fall back to filename extension aliases (e.g. .jp → treat as jpeg attempt only if allowed)
  const rawExt = filename.includes(".")
    ? `.${filename.split(".").pop()!.toLowerCase()}`
    : "";
  const alias: Record<string, DetectedImage> = {
    ".jpg": { ext: ".jpg", mime: "image/jpeg" },
    ".jpeg": { ext: ".jpg", mime: "image/jpeg" },
    ".jpe": { ext: ".jpg", mime: "image/jpeg" },
    ".jfif": { ext: ".jpg", mime: "image/jpeg" },
    ".jp": { ext: ".jpg", mime: "image/jpeg" }, // common typo / truncated extension
    ".png": { ext: ".png", mime: "image/png" },
    ".webp": { ext: ".webp", mime: "image/webp" },
    ".gif": { ext: ".gif", mime: "image/gif" },
    ".avif": { ext: ".avif", mime: "image/avif" },
    ".bmp": { ext: ".bmp", mime: "image/bmp" },
    ".svg": { ext: ".svg", mime: "image/svg+xml" },
  };
  return alias[rawExt] ?? null;
}

export function sanitizeUploadBasename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "image";
}
