/**
 * CERTKO official logo
 * - lowercase "certko": cert = Dark Navy #16263D, ko = Golden Amber #F7C453
 * - three chevrons: 1st navy, 2nd + 3rd amber
 * - tagline: COMPLIANCE. (navy) ASSURED. (amber)
 */

const NAVY = "#16263D";
const AMBER = "#F7C453";

export default function Logo({
  width = 200,
  withTagline = true,
  variant = "primary",
}: {
  width?: number;
  /** Show COMPLIANCE. ASSURED. under the wordmark */
  withTagline?: boolean;
  /**
   * primary — navy/amber on light surfaces
   * onDark — same brand colors (as provided on black); use on black/near-black only
   * reverse — cream + amber for navy footer strips
   */
  variant?: "primary" | "onDark" | "reverse";
}) {
  const cert =
    variant === "reverse" ? "#FAF6EE" : NAVY;
  const ko = AMBER;
  const arrow1 = variant === "reverse" ? "#FAF6EE" : NAVY;
  const arrow2 = AMBER;
  const arrow3 = AMBER;
  const compliance = variant === "reverse" ? "#FAF6EE" : NAVY;
  const assured = AMBER;

  const viewW = 280;
  const viewH = withTagline ? 78 : 48;
  const height = Math.round((width * viewH) / viewW);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="certko — Compliance. Assured."
    >
      {/* lowercase wordmark */}
      <text
        x="0"
        y="36"
        fontFamily="var(--font-display), Poppins, Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize="34"
        letterSpacing="-0.8"
      >
        <tspan fill={cert}>cert</tspan>
        <tspan fill={ko}>ko</tspan>
      </text>

      {/* three chevrons — first navy, next two amber */}
      <g
        fill="none"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(148, 12)"
      >
        <path d="M2 2l12 12-12 12" stroke={arrow1} />
        <path d="M20 2l12 12-12 12" stroke={arrow2} />
        <path d="M38 2l12 12-12 12" stroke={arrow3} />
      </g>

      {withTagline && (
        <text
          x="0"
          y="68"
          fontFamily="var(--font-display), Poppins, Arial, Helvetica, sans-serif"
          fontWeight="600"
          fontSize="11"
          letterSpacing="3.2"
        >
          <tspan fill={compliance}>COMPLIANCE. </tspan>
          <tspan fill={assured}>ASSURED.</tspan>
        </text>
      )}
    </svg>
  );
}

/** CK monogram + three arrows for favicon / compact UI */
export function LogoMark({
  size = 32,
  variant = "primary",
}: {
  size?: number;
  variant?: "primary" | "reverse";
}) {
  const bg = variant === "reverse" ? "#FAF6EE" : NAVY;
  const c = variant === "reverse" ? NAVY : "#FAF6EE";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="certko"
    >
      <rect width="48" height="48" rx="10" fill={bg} />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        fontFamily="var(--font-display), Poppins, Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize="16"
        fill={c}
      >
        c<tspan fill={AMBER}>k</tspan>
      </text>
      <g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 33l3.5 3.5L14 40" stroke={variant === "reverse" ? NAVY : "#FAF6EE"} />
        <path d="M22 33l3.5 3.5L22 40" stroke={AMBER} />
        <path d="M30 33l3.5 3.5L30 40" stroke={AMBER} />
      </g>
    </svg>
  );
}
