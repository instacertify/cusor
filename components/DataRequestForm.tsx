"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { GDPR_REQUEST_TYPES } from "@/lib/gdpr-request-types";

export default function DataRequestForm({
  privacyOfficerEmail,
}: {
  privacyOfficerEmail: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-cream-100/80 px-5 py-6">
        <p className="font-display text-xl font-semibold text-ink-950">Request received</p>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed">
          We logged your privacy request. Our Privacy Officer will respond after verifying
          your identity — usually within the timelines required by applicable law.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/privacy" className="font-semibold text-butter-700 hover:underline">
            Back to Privacy Policy
          </Link>
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const body = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/gdpr-request", {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(
          data?.error === "missing_fields"
            ? "Please enter your name and a valid email."
            : "We could not save your request. Please try again or email us."
        );
        setPending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("We could not save your request. Please try again or email us.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="request_type" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Request type
          </label>
          <select
            id="request_type"
            name="request_type"
            required
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm bg-white outline-none focus:border-butter-500 min-h-11"
            defaultValue="access"
          >
            {GDPR_REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="region" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Framework
          </label>
          <select
            id="region"
            name="region"
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm bg-white outline-none focus:border-butter-500 min-h-11"
            defaultValue="both"
          >
            <option value="both">GDPR and DPDP</option>
            <option value="gdpr">GDPR (EU / UK)</option>
            <option value="dpdp">DPDP (India)</option>
            <option value="unspecified">Not sure</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="details" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
          Details
        </label>
        <textarea
          id="details"
          name="details"
          rows={5}
          placeholder="Describe your request (e.g. delete my contact form enquiry dated …)."
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
        />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto min-h-12 bg-butter-500 hover:bg-butter-400 disabled:opacity-60 text-ink-950 font-semibold rounded-xl px-6 py-3.5 transition"
      >
        {pending ? "Submitting…" : "Submit privacy request"}
      </button>
      <p className="text-[11px] text-ink-500">
        Or email{" "}
        <a href={`mailto:${privacyOfficerEmail}`} className="font-semibold text-butter-700 hover:underline">
          {privacyOfficerEmail}
        </a>
        . We may ask for identity verification before fulfilling your request.
      </p>
    </form>
  );
}
