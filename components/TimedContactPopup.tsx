"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import { readConsentFromDocument } from "@/lib/gdpr-client";
import type { ContactPopupConfig } from "@/lib/contact-popup";
import { toServableUploadUrl } from "@/lib/upload-urls";

const STORAGE_KEY = "certko_contact_popup_dismissed";

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (!Number.isFinite(until)) return false;
    return Date.now() < until;
  } catch {
    return false;
  }
}

function persistDismiss(days: number) {
  try {
    const until = Date.now() + Math.max(1, days) * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(STORAGE_KEY, String(until));
  } catch {
    /* private mode */
  }
}

function pathBlocksPopup(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return true;
  if (pathname.startsWith("/privacy")) return true;
  return false;
}

/**
 * Google-Form-style contact popup: side image + lead form after a delay.
 * GDPR/DPDP: explicit privacy consent on the form; optional wait until the
 * visitor has made a cookie-banner choice (does not require marketing cookies).
 */
export default function TimedContactPopup({
  config,
  cookieBannerEnabled = true,
}: {
  config: ContactPopupConfig;
  /** When the cookie banner is off, do not block the popup on consent. */
  cookieBannerEnabled?: boolean;
}) {
  const pathname = usePathname() || "";
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cookieReady, setCookieReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!config.enabled) {
      setCookieReady(false);
      return;
    }
    if (!config.waitForCookieChoice || !cookieBannerEnabled) {
      setCookieReady(true);
      return;
    }
    const sync = () => setCookieReady(Boolean(readConsentFromDocument()));
    sync();
    window.addEventListener("certko:consent", sync);
    return () => window.removeEventListener("certko:consent", sync);
  }, [config.enabled, config.waitForCookieChoice, cookieBannerEnabled]);

  useEffect(() => {
    if (!mounted || !config.enabled) return;
    if (pathBlocksPopup(pathname)) return;
    if (isDismissed()) return;
    if (!cookieReady) return;

    const delayMs = config.delaySeconds * 1000;
    const timer = window.setTimeout(() => {
      if (pathBlocksPopup(window.location.pathname)) return;
      if (isDismissed()) return;
      setOpen(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    mounted,
    config.enabled,
    config.delaySeconds,
    cookieReady,
    pathname,
  ]);

  const dismiss = useCallback(() => {
    setOpen(false);
    persistDismiss(config.dismissDays);
  }, [config.dismissDays]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!mounted || !open || !config.enabled) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
        aria-label="Close contact form"
        onClick={dismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex w-full max-w-3xl max-h-[min(92vh,720px)] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-cream-300 bg-cream-50 shadow-card-hover sm:flex-row animate-rise"
      >
        <div className="relative hidden sm:block sm:w-[42%] shrink-0 bg-ink-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toServableUploadUrl(config.image)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-display text-lg font-semibold text-cream-50 leading-snug">
            Certko compliance desk
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-700">
                Free quote
              </p>
              <h2
                id={titleId}
                className="mt-1 font-display text-xl sm:text-2xl font-semibold text-ink-950 tracking-tight"
              >
                {config.title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
                {config.subtitle}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              className="shrink-0 w-9 h-9 rounded-full border border-cream-300 bg-white text-ink-700 hover:bg-cream-100 transition flex items-center justify-center"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="sm:hidden px-5 pt-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-cream-300 bg-ink-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={toServableUploadUrl(config.image)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6">
            <ContactForm
              intent="popup"
              stayOnPage
              compact
              idPrefix="contact-popup"
              submitLabelOverride={config.submitLabel}
              onSuccess={() => persistDismiss(config.dismissDays)}
            />
            <p className="mt-3 text-[11px] text-ink-500 text-center">
              You can close this anytime. We only use your details to reply — see our{" "}
              <a href="/privacy" className="font-semibold text-butter-700 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
