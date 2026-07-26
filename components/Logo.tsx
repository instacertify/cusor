/**
 * Official CERTKO PNG logo — always served as the raw PNG file
 * (no SVG wordmark, no Next image optimizer).
 */
export default function Logo({
  width = 200,
  withTagline = true,
  variant = "primary",
  priority = false,
}: {
  width?: number;
  /** API compat — PNG already includes COMPLIANCE. ASSURED. */
  withTagline?: boolean;
  /** reverse/onDark: light pill so navy/amber PNG reads on dark footers */
  variant?: "primary" | "onDark" | "reverse";
  priority?: boolean;
}) {
  void withTagline;
  const height = Math.round(width * 0.276);
  const onDark = variant === "reverse" || variant === "onDark";

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/certko-logo.png"
      alt="certko — Compliance. Assured."
      width={width}
      height={height}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
      className="block h-auto max-w-full object-contain object-left"
      style={{ width, height: "auto" }}
    />
  );

  if (onDark) {
    return (
      <span className="inline-flex rounded-xl bg-cream-50 px-2.5 py-2">
        {img}
      </span>
    );
  }

  return img;
}

/** Square CK favicon mark */
export function LogoMark({ size = 32 }: { size?: number; variant?: "primary" | "reverse" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/certko-favicon.png"
      alt="certko"
      width={size}
      height={size}
      className="block rounded-[22%]"
      loading="lazy"
      decoding="async"
    />
  );
}
