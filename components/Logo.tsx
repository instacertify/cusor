import Image from "next/image";

/**
 * Official CERTKO PNG logo
 * cert (navy) + ko (amber) + three chevrons + COMPLIANCE. ASSURED.
 */
export default function Logo({
  width = 200,
  withTagline = true,
  variant = "primary",
  priority = false,
}: {
  width?: number;
  /** Kept for API compatibility; PNG includes the tagline */
  withTagline?: boolean;
  /**
   * primary — official PNG on light surfaces
   * reverse / onDark — same artwork on a light pill when placed on navy/black
   */
  variant?: "primary" | "onDark" | "reverse";
  priority?: boolean;
}) {
  // Official asset aspect ≈ 1416×391 (~3.62:1)
  const height = Math.round(width * 0.276);
  const needsPill = variant === "reverse" || variant === "onDark";

  const img = (
    <Image
      src="/brand/certko-logo.png"
      alt="certko — Compliance. Assured."
      width={width}
      height={height}
      priority={priority}
      className="h-auto w-auto max-w-full object-contain object-left"
      style={{ width, height: "auto" }}
    />
  );

  if (needsPill) {
    return (
      <span className="inline-flex rounded-xl bg-cream-50 px-2.5 py-2">
        {img}
      </span>
    );
  }

  return img;
}

/** Compact CK mark for places that need a square icon */
export function LogoMark({
  size = 32,
}: {
  size?: number;
  variant?: "primary" | "reverse";
}) {
  return (
    <Image
      src="/brand/certko-favicon.png"
      alt="certko"
      width={size}
      height={size}
      className="rounded-[22%]"
    />
  );
}
