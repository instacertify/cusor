"use client";

import { useEffect, useState } from "react";
import CookiePreferencesPanel from "@/components/CookiePreferencesPanel";
import {
  type ConsentPrefs,
  type GdprPublicSettings,
  readConsentFromDocument,
} from "@/lib/gdpr-client";

/** Full cookie preference UI for /privacy/cookies (reads current cookie after mount). */
export default function CookieOptionsClient({
  settings,
}: {
  settings: GdprPublicSettings;
}) {
  const [initial, setInitial] = useState<ConsentPrefs | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInitial(readConsentFromDocument());
    setReady(true);
  }, []);

  if (!ready) {
    return <p className="text-sm text-ink-500">Loading your cookie preferences…</p>;
  }

  return (
    <CookiePreferencesPanel
      settings={settings}
      initial={initial}
      source="cookies_page"
    />
  );
}
