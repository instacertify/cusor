import fs from "fs";
import path from "path";
import { getWritableDataDir } from "@/lib/db";
import {
  DEFAULT_IMAGE_EXTS,
  detectImageType,
  sanitizeUploadBasename,
} from "@/lib/image-upload";

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jpe": "image/jpeg",
  ".jfif": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_HERO_BYTES = 40 * 1024 * 1024;

/**
 * Prefer public/uploads when writable; otherwise persist next to the SQLite DB
 * (same Hostinger / read-only app-dir fallback pattern as getWritableDataDir).
 */
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

/**
 * Persist an uploaded image and return a public URL path (/uploads/…).
 * Returns null when no file or unsupported type.
 */
export async function persistUploadedImage(
  file: File | null | undefined,
  allowedExts?: string[]
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large (max 12 MB).");
  }

  const allow = new Set(allowedExts ?? DEFAULT_IMAGE_EXTS);
  if ([...allow].some((e) => [".jpg", ".jpeg", ".jpe", ".jfif", ".jp"].includes(e))) {
    allow.add(".jpg");
    allow.add(".jpeg");
    allow.add(".jpe");
    allow.add(".jfif");
    allow.add(".jp");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buf, file.name);
  if (!detected || !allow.has(detected.ext)) return null;

  const dir = getUploadsRoot();
  fs.mkdirSync(dir, { recursive: true });
  // Canonical lowercase extension from magic bytes → correct Content-Type when served.
  const filename = `${Date.now()}-${sanitizeUploadBasename(file.name)}${detected.ext}`;
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, buf);

  // Best-effort mirror into public/ so next/image can still read local files when possible.
  const publicDir = path.join(process.cwd(), "public", "uploads");
  if (path.resolve(dir) !== path.resolve(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      fs.copyFileSync(dest, path.join(publicDir, filename));
    } catch {
      /* public mirror optional — /api/uploads serves the writable copy */
    }
  }

  return `/uploads/${filename}`;
}

export async function persistUploadedHeroMedia(
  file: File | null | undefined,
  allowedExts: string[]
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_HERO_BYTES) {
    throw new Error("Media file is too large (max 40 MB).");
  }
  const ext = path.extname(file.name || "").toLowerCase();
  if (!allowedExts.includes(ext)) return null;

  const dir = getHeroUploadsRoot();
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
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
