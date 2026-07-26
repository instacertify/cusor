"use client";

import { useEffect, useRef, useState } from "react";

/**
 * After any admin Save / Update redirect with ?saved=1, show a green banner
 * and an immediate in-page confirmation that the change is done.
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
  const [showPrompt, setShowPrompt] = useState(Boolean(saved));
  const cleaned = useRef(false);

  useEffect(() => {
    if (!saved) return;
    setShowSaved(true);
    setShowPrompt(true);

    // Avoid re-prompting if the user refreshes the page.
    if (cleaned.current) return;
    cleaned.current = true;
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
  }, [saved]);

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

  return (
    <>
      {showSaved ? (
        <p
          className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5"
          role="status"
          aria-live="polite"
        >
          ✓ {message}
        </p>
      ) : null}

      {showPrompt ? (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-ink-950/45 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-save-done-title"
          aria-describedby="admin-save-done-desc"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-cream-300 shadow-xl p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 text-xl font-bold">
              ✓
            </div>
            <h2
              id="admin-save-done-title"
              className="font-display text-xl font-bold text-ink-950"
            >
              Done
            </h2>
            <p id="admin-save-done-desc" className="mt-2 text-sm text-ink-700 leading-relaxed">
              {message}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setShowPrompt(false)}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-bold text-white hover:bg-ink-800 transition"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
