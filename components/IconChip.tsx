import Icon from "./Icon";
import { iconHue } from "@/lib/icon-style";

const CHIP_PX: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 44,
  xl: 48,
  "2xl": 56,
  hero: 64,
};

const ROUND_CLASS: Record<string, string> = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-xl",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  hero: "rounded-2xl",
};

/**
 * Sitewide icon chip — respects admin Icon style + scale
 * via html[data-icon-style] / html[data-icon-scale] CSS in globals.css.
 */
export default function IconChip({
  name,
  size = 22,
  chip = "md",
  tone = "accent",
  className = "",
  iconClassName = "",
  strokeWidth,
}: {
  name: string;
  size?: number;
  /** Chip box size */
  chip?: keyof typeof CHIP_PX;
  /** accent = butter-tinted plain mode; neutral = cream plain mode */
  tone?: "accent" | "neutral";
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}) {
  const hue = iconHue(name);
  const base = CHIP_PX[chip] ?? CHIP_PX.md;
  return (
    <span
      className={`icon-chip icon-chip--${tone} shrink-0 inline-flex items-center justify-center transition ${ROUND_CLASS[chip] ?? ROUND_CLASS.md} ${className}`}
      data-hue={hue}
      aria-hidden={true}
      style={{
        width: `calc(${base}px * var(--icon-scale, 1.15))`,
        height: `calc(${base}px * var(--icon-scale, 1.15))`,
      }}
    >
      <Icon name={name} size={size} className={iconClassName} strokeWidth={strokeWidth} />
    </span>
  );
}
