import Image, { type ImageProps } from "next/image";
import { isUploadUrl } from "@/lib/upload-urls";

/**
 * next/image often fails on admin uploads (SVG/GIF/AVIF/BMP, missing optimizer).
 * Use a plain <img> for upload URLs and unusual formats so new images always show.
 */
export default function SmartImage({
  src,
  alt,
  className,
  width,
  height,
  priority,
  fill,
  sizes,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  const raw = src || "";
  const lower = raw.toLowerCase();
  const useNative =
    isUploadUrl(raw) ||
    lower.endsWith(".svg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".bmp") ||
    lower.endsWith(".tif") ||
    lower.endsWith(".tiff") ||
    lower.endsWith(".ico") ||
    lower.endsWith(".heic") ||
    lower.endsWith(".heif") ||
    lower.endsWith(".avif");

  if (useNative) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={raw}
          alt={alt}
          className={className}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={raw}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  const props: ImageProps = fill
    ? { src: raw, alt, className, fill: true, sizes, priority, style }
    : {
        src: raw,
        alt,
        className,
        width: width ?? 800,
        height: height ?? 600,
        sizes,
        priority,
        style,
      };
  return <Image {...props} />;
}
