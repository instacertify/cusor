"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  EXPERT_CTA_HREF,
  EXPERT_CTA_LABEL,
  EXPERT_CTA_LABEL_SHORT,
  type ExpertCta,
} from "@/lib/expert-cta";

type Variant = "button" | "header" | "header-mobile" | "footer" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  button:
    "inline-flex min-h-11 items-center justify-center rounded-xl bg-butter-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-butter-400",
  header:
    "shrink-0 bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-semibold rounded-xl px-4 py-2.5 transition whitespace-nowrap",
  "header-mobile":
    "inline-flex items-center justify-center min-h-11 rounded-xl bg-butter-500 hover:bg-butter-400 px-3 text-xs font-bold text-ink-950 transition shrink-0 whitespace-nowrap",
  footer:
    "inline-flex min-h-10 items-center justify-center rounded-full bg-butter-400 px-5 text-sm font-semibold text-ink-950 transition hover:bg-butter-300 text-center",
  link: "font-semibold text-butter-700 hover:text-butter-600",
};

/**
 * Primary CTA used across header, footer, home, and page sections.
 * Labels/href can be overridden from Admin → Settings.
 */
export function TalkToCertificationExpertLink({
  variant = "button",
  short = false,
  className = "",
  children,
  cta,
}: {
  variant?: Variant;
  short?: boolean;
  className?: string;
  children?: ReactNode;
  cta?: ExpertCta;
}) {
  const labelFull = cta?.label || EXPERT_CTA_LABEL;
  const labelShort = cta?.labelShort || EXPERT_CTA_LABEL_SHORT;
  const href = cta?.href || EXPERT_CTA_HREF;
  const label = children ?? (short ? labelShort : labelFull);
  return (
    <a
      href={href}
      className={`${VARIANT_CLASS[variant]} ${className}`}
      aria-label={labelFull}
    >
      {label}
    </a>
  );
}

/**
 * Persistent floating CTA on every public page except contact itself.
 */
export default function TalkToCertificationExpertBar({
  cta,
}: {
  cta?: ExpertCta;
} = {}) {
  const pathname = usePathname() || "";
  const [visible, setVisible] = useState(false);
  const label = cta?.label || EXPERT_CTA_LABEL;
  const href = cta?.href || EXPERT_CTA_HREF;

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;
  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6">
      <a
        href={href}
        className="pointer-events-auto inline-flex min-h-12 max-w-full items-center justify-center rounded-full bg-butter-500 px-5 py-3 text-sm font-semibold text-ink-950 shadow-card-hover transition hover:bg-butter-400 sm:min-h-11"
        aria-label={label}
      >
        <span className="truncate">{label}</span>
      </a>
    </div>
  );
}
