"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Shows an immediate top “Working…” bar when any admin form is submitted,
 * so clicks never feel dead while the server action runs.
 */
export default function AdminBusyBar() {
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("Working…");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Soft navigations keep this layout mounted — clear busy when the URL changes.
  useEffect(() => {
    setBusy(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      // Ignore GET search/filter forms
      const method = (form.getAttribute("method") || "get").toLowerCase();
      if (method === "get") return;

      const submitter = (event as SubmitEvent).submitter;
      const raw =
        (submitter instanceof HTMLButtonElement && submitter.textContent?.trim()) ||
        "Saving…";
      const next =
        /update/i.test(raw)
          ? "Updating…"
          : /delete/i.test(raw)
            ? "Deleting…"
            : /add|create/i.test(raw)
              ? "Creating…"
              : /import/i.test(raw)
                ? "Importing…"
                : "Saving…";

      setLabel(next);
      setBusy(true);
    };

    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);

  // Safety valve if a request hangs
  useEffect(() => {
    if (!busy) return;
    const t = window.setTimeout(() => setBusy(false), 45000);
    return () => window.clearTimeout(t);
  }, [busy]);

  if (!busy) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[200] pointer-events-none"
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="bg-ink-950 text-white text-sm font-semibold px-4 py-2.5 shadow-lg flex items-center justify-center gap-2">
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
          aria-hidden
        />
        {label} Please wait…
      </div>
    </div>
  );
}
