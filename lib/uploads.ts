import fs from "fs";
import path from "path";
import { getCertkoDataDir, getCertkoUploadsDir } from "@/lib/storage-paths";
import {
  DEFAULT_IMAGE_EXTS,
  detectImageType,
  sanitizeUploadBasename,
  type DetectedImage,
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

/** Reject uploads larger than this before processing. */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
/** Target max bytes kept on disk after optimize (storage budget). */
export const MAX_IMAGE_STORED_BYTES = 1_500_000;
/** Longest edge after resize (covers / heroes stay sharp, stay small). */
export const MAX_IMAGE_EDGE_PX = 1920;

const MAX_HERO_BYTES = 40 * 1024 * 1024;

/**
 * Always write uploads under CERTKO_DATA_DIR (outside the replaceable app tree).
 * Optionally mirror to public/. Relational CMS data lives in PostgreSQL.
 */
export function getUploadsRoot(): string {
  return getCertkoUploadsDir();
}

export function getHeroUploadsRoot(): string {
  const root = path.join(getUploadsRoot(), "hero");
  fs.mkdirSync(root, { recursive: true });
  return root;
}

export function mimeForExt(ext: string): string {
  return EXT_TO_MIME[ext.toLowerCase()] || "application/octet-stream";
}

async function optimizeImageForStorage(
  buf: Buffer,
  detected: DetectedImage
): Promise<{ buf: Buffer; ext: string; mime: string }> {
  // Keep SVG / animated GIF as-is (sharp would flatten GIF).
  if (detected.ext === ".svg" || detected.ext === ".gif") {
    if (buf.length > MAX_IMAGE_STORED_BYTES) {
      throw new Error(
        `Image is too large after upload (max stored ${Math.round(MAX_IMAGE_STORED_BYTES / 1024)} KB for GIF/SVG).`
      );
    }
    return { buf, ext: detected.ext, mime: detected.mime };
  }

  try {
    const sharp = (await import("sharp")).default;
    const base = sharp(buf, { failOn: "none" }).rotate();
    const meta = await base.metadata();
    const resized = base.resize({
      width: MAX_IMAGE_EDGE_PX,
      height: MAX_IMAGE_EDGE_PX,
      fit: "inside",
      withoutEnlargement: true,
    });

    // Preserve alpha as PNG; otherwise store WebP (smaller than JPG for most photos).
    if (meta.hasAlpha) {
      let out = await resized.png({ compressionLevel: 9, palette: true }).toBuffer();
      if (out.length > MAX_IMAGE_STORED_BYTES) {
        out = await sharp(buf, { failOn: "none" })
          .rotate()
          .resize({
            width: 1280,
            height: 1280,
            fit: "inside",
            withoutEnlargement: true,
          })
          .png({ compressionLevel: 9, palette: true })
          .toBuffer();
      }
      if (out.length > MAX_IMAGE_STORED_BYTES) {
        throw new Error(
          `Image is still too large after compression (max ${Math.round(MAX_IMAGE_STORED_BYTES / 1024)} KB). Try a smaller file.`
        );
      }
      return { buf: out, ext: ".png", mime: "image/png" };
    }

    let quality = 82;
    let out = await resized.webp({ quality, effort: 4 }).toBuffer();
    while (out.length > MAX_IMAGE_STORED_BYTES && quality > 50) {
      quality -= 10;
      out = await sharp(buf, { failOn: "none" })
        .rotate()
        .resize({
          width: quality < 70 ? 1280 : MAX_IMAGE_EDGE_PX,
          height: quality < 70 ? 1280 : MAX_IMAGE_EDGE_PX,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 })
        .toBuffer();
    }
    if (out.length > MAX_IMAGE_STORED_BYTES) {
      throw new Error(
        `Image is still too large after compression (max ${Math.round(MAX_IMAGE_STORED_BYTES / 1024)} KB). Try a smaller file.`
      );
    }
    return { buf: out, ext: ".webp", mime: "image/webp" };
  } catch (err) {
    if (err instanceof Error && /too large/i.test(err.message)) throw err;
    // sharp unavailable / decode failed — store original if within budget
    if (buf.length > MAX_IMAGE_STORED_BYTES) {
      throw new Error(
        `Could not compress image and file exceeds ${Math.round(MAX_IMAGE_STORED_BYTES / 1024)} KB storage limit.`
      );
    }
    console.warn("[certko] image optimize skipped:", err);
    return { buf, ext: detected.ext, mime: detected.mime };
  }
}

/**
 * Persist an uploaded image and return a public URL path (/uploads/…).
 * Frontend should load via toServableUploadUrl → /api/uploads/….
 * Returns null when no file or unsupported type.
 */
export async function persistUploadedImage(
  file: File | null | undefined,
  allowedExts?: string[]
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Image is too large (max ${Math.round(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024))} MB before compression).`
    );
  }

  const allow = new Set(allowedExts ?? DEFAULT_IMAGE_EXTS);
  if ([...allow].some((e) => [".jpg", ".jpeg", ".jpe", ".jfif", ".jp"].includes(e))) {
    allow.add(".jpg");
    allow.add(".jpeg");
    allow.add(".jpe");
    allow.add(".jfif");
    allow.add(".jp");
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(raw, file.name);
  if (!detected || !allow.has(detected.ext)) return null;

  const optimized = await optimizeImageForStorage(raw, detected);

  const dir = getUploadsRoot();
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${sanitizeUploadBasename(file.name)}${optimized.ext}`;
  const dest = path.join(dir, filename);
  try {
    fs.writeFileSync(dest, optimized.buf);
  } catch (err) {
    console.error("[certko] failed to write upload:", dest, err);
    throw new Error("Could not save image to disk. Check CERTKO_DATA_DIR permissions.");
  }

  // Best-effort mirror into public/ (API route is the reliable serve path).
  const publicDir = path.join(process.cwd(), "public", "uploads");
  if (path.resolve(dir) !== path.resolve(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      fs.copyFileSync(dest, path.join(publicDir, filename));
    } catch {
      /* optional — durable copy already written */
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

  // Still compress image heroes; leave video untouched.
  const imageExts = new Set([
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
  ]);
  if (imageExts.has(ext)) {
    return persistUploadedImage(file, [...imageExts]);
  }

  const dir = getHeroUploadsRoot();
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, Buffer.from(await file.arrayBuffer()));

  const publicHero = path.join(process.cwd(), "public", "uploads", "hero");
  if (path.resolve(dir) !== path.resolve(publicHero)) {
    try {
      fs.mkdirSync(publicHero, { recursive: true });
      fs.copyFileSync(dest, path.join(publicHero, filename));
    } catch {
      /* optional */
    }
  }

  return `/uploads/hero/${filename}`;
}

/** Resolve an /uploads/… or /api/uploads/… path to a file on disk. */
export function resolveUploadFsPath(urlPath: string): string | null {
  let raw = urlPath.split("?")[0].split("#")[0];
  if (raw.startsWith("/api/uploads/")) {
    raw = `/uploads/${raw.slice("/api/uploads/".length)}`;
  }
  if (!raw.startsWith("/uploads/")) return null;
  const rel = raw.slice("/uploads/".length);
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;
  const candidates = [
    path.join(getUploadsRoot(), rel),
    path.join(getCertkoDataDir(), "uploads", rel),
    path.join(process.cwd(), "public", "uploads", rel),
    path.join(process.cwd(), "data", "uploads", rel),
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
