import fs from "fs";
import path from "path";
import { getWritableDataDir } from "@/lib/db";

/** Common web + camera formats admins actually upload. */
export const IMAGE_EXTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".bmp",
  ".ico",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
] as const;

export { IMAGE_ACCEPT, isUploadUrl } from "./upload-urls";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/bmp": ".bmp",
  "image/x-ms-bmp": ".bmp",
  "image/x-windows-bmp": ".bmp",
  "image/vnd.microsoft.icon": ".ico",
  "image/x-icon": ".ico",
  "image/tiff": ".tiff",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".pjpeg": "image/jpeg",
  ".pjp": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

/** Prefer public/uploads when writable; otherwise persist next to the SQLite DB. */
export function getUploadsRoot(): string {
  const preferred = path.join(process.cwd(), "public", "uploads");
  try {
    fs.mkdirSync(preferred, { recursive: true });
    fs.accessSync(preferred, fs.constants.W_OK);
    return preferred;
  } catch {
    const fallback = path.join(getWritableDataDir(), "uploads");
    fs.mkdirSync(fallback, { recursive: true });
    console.warn("[certko] public/uploads not writable; using", fallback);
    return fallback;
  }
}

export function getHeroUploadsRoot(): string {
  const root = path.join(getUploadsRoot(), "hero");
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function mimeForExt(ext: string): string {
  return EXT_TO_MIME[ext.toLowerCase()] || "application/octet-stream";
}

export function resolveImageExt(file: File): string | null {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && (IMAGE_EXTS as readonly string[]).includes(fromName)) return fromName;
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  if (mime && MIME_TO_EXT[mime]) return MIME_TO_EXT[mime];
  if (fromName === ".jfif" || fromName === ".pjpeg" || fromName === ".pjp") return ".jpg";
  return null;
}

/** Detect image type from file header when filename/MIME are missing or wrong. */
export function sniffImageExt(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return ".png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return ".gif";
  if (buf[0] === 0x42 && buf[1] === 0x4d) return ".bmp";
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return ".ico";
  if (
    buf[0] === 0x49 &&
    buf[1] === 0x49 &&
    buf[2] === 0x2a &&
    buf[3] === 0x00
  )
    return ".tiff";
  if (
    buf[0] === 0x4d &&
    buf[1] === 0x4d &&
    buf[2] === 0x00 &&
    buf[3] === 0x2a
  )
    return ".tiff";
  // RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return ".webp";
  // ftyp....avif / heic / heif
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12).toLowerCase();
    if (brand.startsWith("avif") || brand === "avis") return ".avif";
    if (brand.startsWith("heic") || brand.startsWith("heif") || brand === "mif1")
      return brand.startsWith("heic") ? ".heic" : ".heif";
  }
  const head = buf.subarray(0, Math.min(256, buf.length)).toString("utf8").trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return ".svg";
  return null;
}

function safeBaseName(name: string): string {
  return (
    (name || "image")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80) || "image"
  );
}

/**
 * Persist an uploaded image and return a public URL path (/uploads/…).
 * Returns null when no file; throws when a file is present but unsupported.
 */
export async function persistUploadedImage(
  file: File | null | undefined
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Image is too large (max 12 MB).");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  let ext = resolveImageExt(file);
  if (!ext) ext = sniffImageExt(buf);
  if (!ext) {
    throw new Error(
      "Unsupported image format. Use PNG, JPG, WebP, GIF, SVG, AVIF, BMP, TIFF, HEIC or ICO."
    );
  }
  const dir = getUploadsRoot();
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${safeBaseName(file.name)}${ext}`;
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, buf);
  const publicDir = path.join(process.cwd(), "public", "uploads");
  if (path.resolve(dir) !== path.resolve(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      fs.copyFileSync(dest, path.join(publicDir, filename));
    } catch {
      /* public mirror optional */
    }
  }
  return `/uploads/${filename}`;
}

export async function persistUploadedHeroMedia(
  file: File | null | undefined,
  allowedExts: string[]
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > 40 * 1024 * 1024) {
    throw new Error("Media file is too large (max 40 MB).");
  }
  let ext = path.extname(file.name || "").toLowerCase();
  if (!ext) {
    const mime = (file.type || "").toLowerCase();
    if (mime.startsWith("video/")) ext = ".mp4";
    else if (mime === "image/gif") ext = ".gif";
    else ext = resolveImageExt(file) || "";
  }
  if (!allowedExts.includes(ext)) {
    throw new Error("Unsupported media format for hero slide.");
  }
  const dir = getHeroUploadsRoot();
  const filename = `${Date.now()}-${safeBaseName(file.name)}${ext}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/hero/${filename}`;
}

/** Resolve an /uploads/… path to a file on disk (writable root or public). */
export function resolveUploadFsPath(urlPath: string): string | null {
  const raw = urlPath.split("?")[0].split("#")[0];
  if (!raw.startsWith("/uploads/")) return null;
  const rel = raw.slice("/uploads/".length);
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;
  const candidates = [
    path.join(getUploadsRoot(), rel),
    path.join(process.cwd(), "public", "uploads", rel),
    path.join(getWritableDataDir(), "uploads", rel),
  ];
  for (const full of candidates) {
    try {
      if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
    } catch {
      /* try next */
    }
  }
  return null;
}
