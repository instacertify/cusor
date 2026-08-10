"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type ConsentPrefs,
  type CookieCategoryConfig,
  type GdprPublicSettings,
  defaultConsent,
  writeConsentToDocument,
} from "@/lib/gdpr-client";

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

export default function CookiePreferencesPanel({
  settings,
  initial,
  source = "preferences_page",
  onSaved,
  compact = false,
}: {
  settings: GdprPublicSettings;
  initial?: ConsentPrefs | null;
  source?: string;
  onSaved?: (prefs: ConsentPrefs) => void;
  compact?: boolean;
}) {
  const categories = settings.categories.filter(
    (c) => c.key === "necessary" || c.offered
  );
  const analyticsOffered = categories.some((c) => c.key === "analytics");
  const marketingOffered = categories.some((c) => c.key === "marketing");

  const [analytics, setAnalytics] = useState(Boolean(initial?.analytics));
  const [marketing, setMarketing] = useState(Boolean(initial?.marketing));
  const [savedMsg, setSavedMsg] = useState(false);
  const [pending, setPending] = useState(false);

  async function apply(next: ConsentPrefs, src: string) {
    setPending(true);
    writeConsentToDocument(next);
    await logConsent(next, src);
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setSavedMsg(true);
    setPending(false);
    onSaved?.(next);
  }

  function catToggle(cat: CookieCategoryConfig) {
    if (cat.key === "necessary") {
      return (
        <div
          key={cat.key}
          className="rounded-xl border border-cream-300 bg-cream-50 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1" />
            <div className="min-w-0">
              <p className="font-semibold text-ink-950">{cat.label}</p>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">{cat.description}</p>
              {!compact && cat.examples ? (
                <p className="mt-1 text-xs text-ink-500">Examples: {cat.examples}</p>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    const checked = cat.key === "analytics" ? analytics : marketing;
    const setChecked = cat.key === "analytics" ? setAnalytics : setMarketing;

    return (
      <label
        key={cat.key}
        className="block rounded-xl border border-cream-300 bg-white px-4 py-3 cursor-pointer hover:border-butter-500 transition"
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <div className="min-w-0">
            <p className="font-semibold text-ink-950">{cat.label}</p>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">{cat.description}</p>
            {!compact && cat.examples ? (
              <p className="mt-1 text-xs text-ink-500">Examples: {cat.examples}</p>
            ) : null}
          </div>
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">{categories.map(catToggle)}</div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition disabled:opacity-60"
          onClick={() =>
            apply(
              defaultConsent({
                analytics: analyticsOffered,
                marketing: marketingOffered,
                policyVersion: settings.policyVersion,
              }),
              `${source}_accept_all`
            )
          }
        >
          Accept all
        </button>
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 bg-white px-5 text-sm font-semibold text-ink-800 hover:border-butter-500 transition disabled:opacity-60"
          onClick={() =>
            apply(
              defaultConsent({
                analytics: false,
                marketing: false,
                policyVersion: settings.policyVersion,
              }),
              `${source}_necessary_only`
            )
          }
        >
          Necessary only
        </button>
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-butter-500 px-5 text-sm font-semibold text-ink-950 hover:bg-butter-400 transition disabled:opacity-60"
          onClick={() =>
            apply(
              defaultConsent({
                analytics: analyticsOffered ? analytics : false,
                marketing: marketingOffered ? marketing : false,
                policyVersion: settings.policyVersion,
              }),
              `${source}_save`
            )
          }
        >
          {pending ? "Saving…" : "Save cookie choices"}
        </button>
      </div>

      {savedMsg ? (
        <p className="text-sm text-green-700" role="status">
          ✓ Cookie preferences saved.
        </p>
      ) : null}

      {!compact ? (
        <p className="text-xs text-ink-500 leading-relaxed">
          Read our{" "}
          <Link href="/privacy" className="font-semibold text-butter-700 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy/gdpr-and-dpdp"
            className="font-semibold text-butter-700 hover:underline"
          >
            GDPR &amp; DPDP guide
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
