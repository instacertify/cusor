"use client";

import { useEffect, useRef, useState } from "react";

/**
 * After any admin Save / Update redirect with ?saved=1, show a green banner
 * and a one-time browser confirmation that the change is done.
 */
export default function SavedBanner({
  saved,
  error,
  message = "Done — your changes have been saved and are live on the site.",
}: {
  saved?: string;
  error?: string;
  message?: string;
}) {
  const [showSaved, setShowSaved] = useState(Boolean(saved));
  const prompted = useRef(false);

  useEffect(() => {
    if (!saved || prompted.current) return;
    prompted.current = true;
    setShowSaved(true);
    window.alert(message);

    // Avoid re-prompting if the user refreshes the page.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("saved")) {
        url.searchParams.delete("saved");
        const qs = url.searchParams.toString();
        window.history.replaceState(
          null,
          "",
          url.pathname + (qs ? `?${qs}` : "") + url.hash
        );
      }
    } catch {
      // ignore
    }
  }, [saved, message]);

  if (error) {
    return (
      <p
        className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"
        role="alert"
      >
        Something went wrong — please check required fields.
      </p>
    );
  }

  if (!showSaved) return null;

  return (
    <p
      className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5"
      role="status"
      aria-live="polite"
    >
      ✓ {message}
    </p>
  );
}
