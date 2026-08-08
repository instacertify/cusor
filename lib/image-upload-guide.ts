/**
 * Recommended upload sizes for Certko admin image fields.
 * Aimed at sharp Retina display without oversized files.
 */
export type ImageUploadKind =
  | "hero"
  | "heroPoster"
  | "logo"
  | "logoDark"
  | "page"
  | "product"
  | "category"
  | "certification"
  | "testing"
  | "blog"
  | "author"
  | "og"
  | "generic";

export type ImageUploadGuide = {
  /** Pixel dimensions, e.g. "1920 × 1080 px" */
  dimensions: string;
  /** Aspect ratio label */
  ratio: string;
  /** Suggested web resolution / DPI note */
  resolution: string;
  /** Preferred file formats */
  formats: string;
  /** Soft file-size target */
  maxSize: string;
  /** Short usage note */
  note: string;
};

export const IMAGE_UPLOAD_GUIDE: Record<ImageUploadKind, ImageUploadGuide> = {
  hero: {
    dimensions: "1920 × 1080 px",
    ratio: "16:9",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP (GIF/MP4 for motion)",
    maxSize: "under 800 KB (video under 8 MB)",
    note: "Full-width homepage banner — landscape, edge-to-edge.",
  },
  heroPoster: {
    dimensions: "1920 × 1080 px",
    ratio: "16:9",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 400 KB",
    note: "Fallback/poster frame shown before the hero video plays.",
  },
  logo: {
    dimensions: "800 × 200 px (or similar wide)",
    ratio: "~4:1",
    resolution: "150–300 DPI / 2× for Retina",
    formats: "Transparent PNG (SVG also OK)",
    maxSize: "under 200 KB",
    note: "Header wordmark on light backgrounds — keep padding tight.",
  },
  logoDark: {
    dimensions: "800 × 200 px (or similar wide)",
    ratio: "~4:1",
    resolution: "150–300 DPI / 2× for Retina",
    formats: "Transparent PNG (light/cream mark)",
    maxSize: "under 200 KB",
    note: "Footer wordmark on dark backgrounds.",
  },
  page: {
    dimensions: "1600 × 900 px",
    ratio: "16:9",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 500 KB",
    note: "Page cover / content hero image.",
  },
  product: {
    dimensions: "1200 × 1200 px",
    ratio: "1:1 (square preferred)",
    resolution: "72–150 DPI (web)",
    formats: "PNG, JPG or WebP",
    maxSize: "under 400 KB",
    note: "Product photo — square crops cleanly on cards and detail pages.",
  },
  category: {
    dimensions: "1200 × 800 px",
    ratio: "3:2",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 400 KB",
    note: "Category card / listing image.",
  },
  certification: {
    dimensions: "1600 × 900 px",
    ratio: "16:9",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 500 KB",
    note: "Certification front / hero image.",
  },
  testing: {
    dimensions: "1200 × 800 px",
    ratio: "3:2",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 400 KB",
    note: "Testing category or test service image.",
  },
  blog: {
    dimensions: "1600 × 900 px",
    ratio: "16:9",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 500 KB",
    note: "Blog cover — also works well as the social preview image.",
  },
  author: {
    dimensions: "800 × 800 px",
    ratio: "1:1",
    resolution: "72–150 DPI (web)",
    formats: "JPG or WebP",
    maxSize: "under 200 KB",
    note: "Square profile photo, face centered.",
  },
  og: {
    dimensions: "1200 × 630 px",
    ratio: "1.91:1",
    resolution: "72 DPI (web)",
    formats: "JPG or PNG",
    maxSize: "under 300 KB",
    note: "Open Graph / social share image (Facebook, LinkedIn, WhatsApp).",
  },
  generic: {
    dimensions: "1200 × 800 px",
    ratio: "3:2",
    resolution: "72–150 DPI (web)",
    formats: "PNG, JPG or WebP",
    maxSize: "under 500 KB",
    note: "Clear, well-lit image; avoid tiny or blurry uploads.",
  },
};

/** One-line hint shown under every admin image upload. */
export function formatImageUploadHint(kind: ImageUploadKind = "generic"): string {
  const g = IMAGE_UPLOAD_GUIDE[kind];
  return `Recommended: ${g.dimensions} (${g.ratio}) · ${g.resolution} · ${g.formats} · ${g.maxSize}. ${g.note}`;
}

/** Map Front Images entity keys → size guide. */
export function imageKindForEntity(entity: string): ImageUploadKind {
  switch (entity) {
    case "page":
      return "page";
    case "cert":
      return "certification";
    case "category":
      return "category";
    case "product":
      return "product";
    default:
      return "generic";
  }
}
