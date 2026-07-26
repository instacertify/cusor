"use client";

import { useState, type FormEvent } from "react";
import ContactThankYou from "./ContactThankYou";

type Intent = string | undefined;

export default function ContactForm({
  product = "",
  intent,
  errorMessage = null,
  initiallySent = false,
}: {
  product?: string;
  intent?: Intent;
  errorMessage?: string | null;
  initiallySent?: boolean;
}) {
  const [sent, setSent] = useState(initiallySent);
  const [error, setError] = useState<string | null>(errorMessage);
  const [pending, setPending] = useState(false);

  if (sent) {
    return <ContactThankYou />;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const body = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !data?.ok) {
        if (data?.error === "missing_fields") {
          setError("Please fill in your name and email.");
        } else {
          setError(
            "We could not save your request just now. Please try again, or email us directly."
          );
        }
        setPending(false);
        return;
      }

      setSent(true);
      // Keep URL shareable / refreshable as success without re-posting.
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/contact?sent=1");
      }
    } catch {
      setError(
        "We could not save your request just now. Please try again, or email us directly."
      );
      setPending(false);
    }
  }

  const submitLabel =
    intent === "test"
      ? "Request a quote for this test"
      : intent === "certification"
        ? "Request a quote for this certification"
        : "Request a free quote";

  const productLabel =
    intent === "test"
      ? "Test / service"
      : intent === "certification"
        ? "Certification / scheme"
        : "Product / test / certification";

  return (
    <form action="/api/contact" method="post" onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
          Your Name *
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
          />
        </div>
      </div>
      <div>
        <label htmlFor="product" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
          {productLabel}
        </label>
        <input
          id="product"
          name="product"
          defaultValue={product}
          placeholder="e.g. LED lamp safety test, BIS certification, BEE RAC…"
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
          Tell us more
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Manufacturing location, import or domestic, sample availability, timeline…"
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-12 bg-butter-500 hover:bg-butter-400 disabled:opacity-60 text-ink-950 font-semibold rounded-xl px-6 py-3.5 transition"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
      <p className="text-[11px] text-ink-500 text-center">
        No spam. Your details are only used to respond to this request.
      </p>
    </form>
  );
}
