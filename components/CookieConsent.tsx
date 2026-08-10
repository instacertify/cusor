"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_COOKIE,
  type ConsentPrefs,
  type GdprPublicSettings,
  defaultConsent,
  readConsentFromDocument,
  serializeConsent,
} from "@/lib/gdpr-client";

const CONSENT_EVENT = "certko:consent";

function readConsent(): ConsentPrefs | null {
  return readConsentFromDocument();
}

function writeConsent(prefs: ConsentPrefs) {
  const maxAge = 60 * 60 * 24 * 365;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(prefs)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: prefs }));
}

async function logConsent(prefs: ConsentPrefs, source: string) {
  try {
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        policyVersion: prefs.policyVersion,
        source,
      }),
    });
  } catch {
    /* non-blocking */
  }
}

export default function CookieConsent({
  settings,
}: {
  settings: GdprPublicSettings;
}) {
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!settings.bannerEnabled) return;
    const existing = readConsent();
    if (!existing) {
      setOpen(true);
      return;
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, [settings.bannerEnabled]);

  useEffect(() => {
    function onOpenPrefs() {
      const existing = readConsent();
      setAnalytics(Boolean(existing?.analytics));
      setMarketing(Boolean(existing?.marketing));
      setPrefsOpen(true);
      setOpen(true);
    }
    window.addEventListener("certko:open-cookie-prefs", onOpenPrefs);
    return () => window.removeEventListener("certko:open-cookie-prefs", onOpenPrefs);
  }, []);

  if (!settings.bannerEnabled || !open) return null;

  async function save(next: ConsentPrefs, source: string) {
    writeConsent(next);
    await logConsent(next, source);
    setOpen(false);
    setPrefsOpen(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4 pointer-events-none"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-cream-300 bg-cream-50 shadow-card-hover px-4 py-4 sm:px-6 sm:py-5">
        <p className="font-display text-lg font-semibold text-ink-950">
          {settings.bannerTitle}
        </p>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed">
          {settings.bannerText}{" "}
          <Link href="/privacy" className="font-semibold text-butter-700 hover:underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link
            href="/privacy/gdpr-and-dpdp"
            className="font-semibold text-butter-700 hover:underline"
          >
            GDPR &amp; DPDP
          </Link>
        </p>

        {prefsOpen ? (
          <div className="mt-4 space-y-3 rounded-xl border border-cream-300 bg-white p-4">
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="font-semibold text-ink-950">Necessary</span> — always on
                (security, session, load balancing).
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-semibold text-ink-950">Analytics</span> — understand
                traffic and improve Certko (GA / GTM).
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-semibold text-ink-950">Marketing</span> — optional
                remarketing tags if configured.
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
            onClick={() =>
              save(
                defaultConsent({
                  analytics: true,
                  marketing: true,
                  policyVersion: settings.policyVersion,
                }),
                "accept_all"
              )
            }
          >
            Accept all
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 bg-white px-5 text-sm font-semibold text-ink-800 hover:border-butter-500 transition"
            onClick={() =>
              save(
                defaultConsent({
                  analytics: false,
                  marketing: false,
                  policyVersion: settings.policyVersion,
                }),
                "reject_optional"
              )
            }
          >
            Necessary only
          </button>
          {prefsOpen ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-butter-500 px-5 text-sm font-semibold text-ink-950 hover:bg-butter-400 transition"
              onClick={() =>
                save(
                  defaultConsent({
                    analytics,
                    marketing,
                    policyVersion: settings.policyVersion,
                  }),
                  "save_prefs"
                )
              }
            >
              Save choices
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-butter-700 hover:underline"
              onClick={() => setPrefsOpen(true)}
            >
              Manage preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Footer / settings link helper — open preferences from anywhere. */
export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("certko:open-cookie-prefs"));
  }
}
