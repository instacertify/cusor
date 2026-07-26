import { getSetting } from "@/lib/db";

const DEFAULT_PRIMARY = "/brand/certko-logo.png";
const DEFAULT_ON_DARK = "/brand/certko-logo-light.png";

/**
 * Official CERTKO PNG logo — transparent, no extra background/pill.
 * Paths come from admin Site Settings when customized.
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
  /**
   * primary — navy/amber on light page backgrounds
   * reverse / onDark — cream/amber PNG for dark footers (still transparent, no box)
   */
  variant?: "primary" | "onDark" | "reverse";
  priority?: boolean;
}) {
  void withTagline;
  const height = Math.round(width * 0.28);
  const onDark = variant === "reverse" || variant === "onDark";
  const src = onDark
    ? getSetting("logo_on_dark", DEFAULT_ON_DARK) || DEFAULT_ON_DARK
    : getSetting("logo_primary", DEFAULT_PRIMARY) || DEFAULT_PRIMARY;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="certko — Compliance. Assured."
      width={width}
      height={height}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
      className="block h-auto max-w-full bg-transparent object-contain object-left"
      style={{ width, height: "auto", background: "transparent" }}
    />
  );
}

/** Square CK favicon mark — transparent PNG, no wrapper */
export function LogoMark({ size = 32 }: { size?: number; variant?: "primary" | "reverse" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/certko-favicon.png"
      alt="certko"
      width={size}
      height={size}
      className="block bg-transparent"
      style={{ background: "transparent" }}
      loading="lazy"
      decoding="async"
    />
  );
}
