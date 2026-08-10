"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CookiePreferencesPanel from "@/components/CookiePreferencesPanel";
import {
  type ConsentPrefs,
  type GdprPublicSettings,
  readConsentFromDocument,
} from "@/lib/gdpr-client";

export default function CookieConsent({
  settings,
}: {
  settings: GdprPublicSettings;
}) {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [initial, setInitial] = useState<ConsentPrefs | null>(null);

  useEffect(() => {
    if (!settings.bannerEnabled) return;
    const existing = readConsentFromDocument();
    setInitial(existing);
    if (!existing) setBannerOpen(true);
  }, [settings.bannerEnabled]);

  useEffect(() => {
    function onOpenPrefs() {
      setInitial(readConsentFromDocument());
      setBannerOpen(true);
    }
    window.addEventListener("certko:open-cookie-prefs", onOpenPrefs);
    return () => window.removeEventListener("certko:open-cookie-prefs", onOpenPrefs);
  }, []);

  if (!settings.bannerEnabled || !bannerOpen) {
    return settings.showFloatingCookieButton ? (
      <FloatingCookieButton />
    ) : null;
  }

  return (
    <>
      {settings.showFloatingCookieButton ? <FloatingCookieButton /> : null}
      <div
        className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4 pointer-events-none"
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-cream-300 bg-cream-50 shadow-card-hover px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-ink-950">
                {settings.bannerTitle}
              </p>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                {settings.bannerText}{" "}
                <Link
                  href="/privacy/cookies"
                  className="font-semibold text-butter-700 hover:underline"
                >
                  Cookie options
                </Link>
                {" · "}
                <Link
                  href="/privacy"
                  className="font-semibold text-butter-700 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-sm font-semibold text-ink-500 hover:text-ink-800"
              aria-label="Close cookie banner"
              onClick={() => setBannerOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mt-4">
            <CookiePreferencesPanel
              settings={settings}
              initial={initial}
              source="banner"
              compact
              onSaved={() => setBannerOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function FloatingCookieButton() {
  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-[70] inline-flex min-h-11 items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-card hover:border-butter-500 hover:bg-white transition"
      onClick={() => window.dispatchEvent(new Event("certko:open-cookie-prefs"))}
      aria-label="Open cookie options"
    >
      <span aria-hidden className="text-base leading-none">
        ◉
      </span>
      Cookie options
    </button>
  );
}

/** Footer / settings link helper — open preferences from anywhere. */
export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("certko:open-cookie-prefs"));
  }
}
