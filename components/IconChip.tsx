import Icon from "./Icon";
import { iconHue } from "@/lib/icon-style";

const SIZE_CLASS: Record<string, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-11 h-11 rounded-xl",
  xl: "w-12 h-12 rounded-xl",
  "2xl": "w-14 h-14 rounded-2xl",
  hero: "w-16 h-16 rounded-2xl",
};

/**
 * Sitewide icon chip — respects admin Icon style (3d / colorful / plain)
 * via html[data-icon-style] CSS in globals.css.
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
  chip?: keyof typeof SIZE_CLASS;
  /** accent = butter-tinted plain mode; neutral = cream plain mode */
  tone?: "accent" | "neutral";
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}) {
  const hue = iconHue(name);
  return (
    <span
      className={`icon-chip icon-chip--${tone} shrink-0 inline-flex items-center justify-center transition ${SIZE_CLASS[chip]} ${className}`}
      data-hue={hue}
      aria-hidden={true}
    >
      <Icon name={name} size={size} className={iconClassName} strokeWidth={strokeWidth} />
    </span>
  );
}
