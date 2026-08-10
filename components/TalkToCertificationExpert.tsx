"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import {
  EXPERT_CTA_HREF,
  EXPERT_CTA_LABEL,
  EXPERT_CTA_LABEL_SHORT,
  EXPERT_PHONE_DISPLAY,
  EXPERT_PHONE_TEL,
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

function useExpertContact(
  cta?: ExpertCta
): {
  labelFull: string;
  labelShort: string;
  href: string;
  phoneDisplay: string;
  phoneTel: string;
} {
  return {
    labelFull: cta?.label || EXPERT_CTA_LABEL,
    labelShort: cta?.labelShort || EXPERT_CTA_LABEL_SHORT,
    href: cta?.href || EXPERT_CTA_HREF,
    phoneDisplay: cta?.phoneDisplay || EXPERT_PHONE_DISPLAY,
    phoneTel: cta?.phoneTel || EXPERT_PHONE_TEL,
  };
}

/** Chooser: contact form or dial the expert line. */
function ExpertContactChooser({
  open,
  onClose,
  title,
  href,
  phoneDisplay,
  phoneTel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  href: string;
  phoneDisplay: string;
  phoneTel: string;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]"
        aria-label="Close contact options"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md animate-rise rounded-t-3xl sm:rounded-3xl border border-cream-300 bg-cream-50 shadow-card-hover"
      >
        <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-700">
                Get help now
              </p>
              <h2
                id={titleId}
                className="mt-1 font-display text-xl font-semibold text-ink-950 tracking-tight"
              >
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
                Call our certification desk, or send details and we reply within
                24 working hours.
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full border border-cream-300 bg-white text-ink-700 hover:bg-cream-100 transition flex items-center justify-center"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 space-y-3">
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-3 rounded-2xl border border-butter-400 bg-butter-300/40 px-4 py-3.5 transition hover:bg-butter-300/70"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-butter-500 text-ink-950">
              <Icon name="phone" size={22} />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-bold text-ink-950">Call now</span>
              <span className="block text-sm font-semibold text-ink-800 tracking-wide">
                {phoneDisplay}
              </span>
            </span>
          </a>

          <a
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-white px-4 py-3.5 transition hover:border-butter-400 hover:bg-cream-100"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-ink-900">
              <Icon name="mail" size={22} />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-bold text-ink-950">
                Contact form
              </span>
              <span className="block text-sm text-ink-600">
                Share your product or HSN — free quote in 24 hours
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Primary CTA used across header, footer, home, and page sections.
 * Opens a chooser: dial the expert line or open the contact form.
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
  const { labelFull, labelShort, href, phoneDisplay, phoneTel } =
    useExpertContact(cta);
  const [open, setOpen] = useState(false);
  const label = children ?? (short ? labelShort : labelFull);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={`${VARIANT_CLASS[variant]} ${className}`}
        aria-label={labelFull}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <ExpertContactChooser
        open={open}
        onClose={close}
        title={labelFull}
        href={href}
        phoneDisplay={phoneDisplay}
        phoneTel={phoneTel}
      />
    </>
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
  const [open, setOpen] = useState(false);
  const { labelFull, href, phoneDisplay, phoneTel } = useExpertContact(cta);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;
  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto inline-flex min-h-12 max-w-full items-center justify-center rounded-full bg-butter-500 px-5 py-3 text-sm font-semibold text-ink-950 shadow-card-hover transition hover:bg-butter-400 sm:min-h-11"
          aria-label={labelFull}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="truncate">{labelFull}</span>
        </button>
      </div>
      <ExpertContactChooser
        open={open}
        onClose={close}
        title={labelFull}
        href={href}
        phoneDisplay={phoneDisplay}
        phoneTel={phoneTel}
      />
    </>
  );
}
