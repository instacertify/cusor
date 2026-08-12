import { isUploadUrl, toServableUploadUrl } from "@/lib/upload-urls";
import { shouldSkipImageOptimization } from "@/lib/image-upload";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/**
 * Renders CMS / admin-uploaded images so they always show on the public site.
 * Upload paths use a plain <img> pointed at /api/uploads/… (never next/image
 * optimizer — Hostinger often stores files outside public/).
 */
export default function CmsImage({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  className = "",
  sizes,
}: Props) {
  if (!src) return null;
  const url = toServableUploadUrl(src);

  if (isUploadUrl(src) || shouldSkipImageOptimization(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 630}
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
