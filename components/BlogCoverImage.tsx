import Image from "next/image";
import { shouldSkipImageOptimization } from "@/lib/image-upload";

/**
 * Renders a blog cover so every backend-uploaded format (JPG/JPEG/PNG/WebP/GIF/
 * AVIF/BMP/SVG) displays on /blog and article pages.
 *
 * - /uploads/* always use a plain <img> (optimizer only reads public/; Hostinger
 *   may store uploads next to SQLite and serve via /api/uploads).
 * - Other non-optimizable formats (GIF/BMP/SVG…) also use <img>.
 */
export default function BlogCoverImage({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  if (!src) return null;

  if (shouldSkipImageOptimization(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={630}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
