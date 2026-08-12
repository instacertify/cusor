import CmsImage from "@/components/CmsImage";

/**
 * Blog cover — always serves admin uploads via /api/uploads so JPG/WebP/PNG
 * show on Hostinger even when files live outside public/.
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
  return (
    <CmsImage
      src={src}
      alt={alt}
      width={1200}
      height={630}
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
