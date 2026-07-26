/**
 * CERTKO primary logo — Brand Guidelines v1.0
 * Wordmark: CERT (Dark Navy #16263D) + KO (Golden Amber #F7C453)
 * Three arrows: Knowledge → Compliance → Global Market Access
 *
 * Minimum website width: 180px. Never stretch, rotate, recolor, or add shadows.
 */
export default function Logo({
  size = 40,
  variant = "primary",
  width,
}: {
  /** Approximate wordmark height; width defaults to brand minimum 180px */
  size?: number;
  variant?: "primary" | "reverse";
  /** Override rendered width (brand minimum is 180 on website) */
  width?: number;
}) {
  const navy = variant === "reverse" ? "#FAF6EE" : "#16263D";
  const amber = "#F7C453";
  const w = width ?? Math.max(180, Math.round(size * 4.5));
  const h = Math.round(w * 0.22);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 180 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CERTKO"
    >
      <text
        x="0"
        y="28"
        fontFamily="var(--font-display), Poppins, Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize="26"
        letterSpacing="-0.5"
      >
        <tspan fill={navy}>CERT</tspan>
        <tspan fill={amber}>KO</tspan>
      </text>
      {/* Three forward arrows — progress / knowledge → compliance → markets */}
      <g
        stroke={amber}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform="translate(118, 8)"
      >
        <path d="M2 2l8 10-8 10" opacity="0.4" />
        <path d="M14 2l8 10-8 10" opacity="0.7" />
        <path d="M26 2l8 10-8 10" />
      </g>
    </svg>
  );
}

/** CK monogram mark for favicon / compact UI (Dark Navy + Golden Amber). */
export function LogoMark({
  size = 32,
  variant = "primary",
}: {
  size?: number;
  variant?: "primary" | "reverse";
}) {
  const bg = variant === "reverse" ? "#FAF6EE" : "#16263D";
  const letter = variant === "reverse" ? "#16263D" : "#FAF6EE";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CERTKO"
    >
      <rect width="48" height="48" rx="10" fill={bg} />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        fontFamily="var(--font-display), Poppins, Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize="18"
        fill={letter}
      >
        C<tspan fill="#F7C453">K</tspan>
      </text>
      <g
        stroke="#F7C453"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M14 33l3.5 3.5L14 40" opacity="0.4" />
        <path d="M22 33l3.5 3.5L22 40" opacity="0.7" />
        <path d="M30 33l3.5 3.5L30 40" />
      </g>
    </svg>
  );
}
