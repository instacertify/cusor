"use client";

import { useEffect, useState } from "react";
import ContactForm from "./ContactForm";
import Icon from "./Icon";

/** Yellow Contact button on lab pages → expands testing-requirements form → saves lead. */
export default function LabContactPanel({ labName }: { labName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#lab-contact") setOpen(true);
    const onHash = () => {
      if (window.location.hash === "#lab-contact") setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div id="lab-contact" className="mt-6 scroll-mt-24">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-12 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
        >
          Contact
          <Icon name="arrow-right" size={16} />
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink-950">
                Contact Instacertify
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Enter your testing requirements for{" "}
                <span className="font-semibold text-ink-900">{labName}</span>. Someone
                from our team will connect within 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-sm font-semibold text-ink-500 hover:text-ink-800 min-h-11 px-2"
              aria-label="Close contact form"
            >
              Close
            </button>
          </div>
          <ContactForm
            product={`${labName} — testing request`}
            intent="book"
            stayOnPage
          />
        </div>
      )}
    </div>
  );
}
