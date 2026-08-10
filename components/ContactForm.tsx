"use client";

import { useState, type FormEvent } from "react";
import ContactThankYou from "./ContactThankYou";

type Intent = string | undefined;

function isTestingIntent(intent?: string) {
  return intent === "test" || intent === "book" || intent === "consulting";
}

export default function ContactForm({
  product = "",
  intent,
  errorMessage = null,
  initiallySent = false,
  stayOnPage = false,
  compact = false,
  idPrefix = "",
  submitLabelOverride,
  onSuccess,
}: {
  product?: string;
  intent?: Intent;
  errorMessage?: string | null;
  initiallySent?: boolean;
  /** When true (e.g. embedded on a lab page), do not navigate to /contact?sent=1. */
  stayOnPage?: boolean;
  /** Tighter layout for modals / popups */
  compact?: boolean;
  /** Prefix input ids when multiple forms can mount */
  idPrefix?: string;
  submitLabelOverride?: string;
  onSuccess?: () => void;
}) {
  const [sent, setSent] = useState(initiallySent);
  const [error, setError] = useState<string | null>(errorMessage);
  const [pending, setPending] = useState(false);
  const fid = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  if (sent) {
    return <ContactThankYou intent={intent} compact={compact} />;
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
        } else if (data?.error === "privacy_consent_required") {
          setError("Please accept the privacy notice so we can process your enquiry.");
        } else {
          setError(
            "We could not save your request just now. Please try again, or email us directly."
          );
        }
        setPending(false);
        return;
      }

      setSent(true);
      onSuccess?.();
      if (!stayOnPage && typeof window !== "undefined") {
        const params = new URLSearchParams({ sent: "1" });
        if (intent) params.set("intent", intent);
        window.history.replaceState(null, "", `/contact?${params.toString()}`);
      }
    } catch {
      setError(
        "We could not save your request just now. Please try again, or email us directly."
      );
      setPending(false);
    }
  }

  const submitLabel =
    submitLabelOverride ||
    (intent === "consulting"
      ? "Book consulting"
      : intent === "book" || intent === "test"
        ? "Book testing"
        : intent === "certification"
          ? "Request a quote for this certification"
          : "Talk to a certification expert");

  const productLabel =
    intent === "consulting"
      ? "Testing / certification topic"
      : intent === "book" || intent === "test"
        ? "Lab / product / test"
        : intent === "certification"
          ? "Certification / scheme"
          : "Product / test / certification";

  const messageLabel =
    intent === "consulting"
      ? "Consulting requirements *"
      : intent === "book" || intent === "test"
        ? "Testing requirements *"
        : "Tell us more";

  const messagePlaceholder =
    intent === "consulting"
      ? "Product / HSN, certification or test needed, market (India / export), timeline…"
      : intent === "book" || intent === "test"
        ? "Product name, IS standard / HSN if known, sample availability, city, and required timeline…"
        : "Manufacturing location, import or domestic, sample availability, timeline…";

  const messageRequired = isTestingIntent(intent);

  const fieldCls =
    "w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11";
  const labelCls =
    "block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5";

  return (
    <form
      action="/api/contact"
      method="post"
      onSubmit={onSubmit}
      className={compact ? "space-y-3" : "space-y-4"}
    >
      {intent ? <input type="hidden" name="intent" value={intent} /> : null}
      {error ? (
        <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor={fid("name")} className={labelCls}>
          Your Name *
        </label>
        <input
          id={fid("name")}
          name="name"
          required
          autoComplete="name"
          className={fieldCls}
        />
      </div>
      <div className={`grid sm:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}>
        <div>
          <label htmlFor={fid("email")} className={labelCls}>
            Email *
          </label>
          <input
            id={fid("email")}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor={fid("phone")} className={labelCls}>
            Phone
          </label>
          <input
            id={fid("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={fieldCls}
          />
        </div>
      </div>
      <div>
        <label htmlFor={fid("product")} className={labelCls}>
          {productLabel}
        </label>
        <input
          id={fid("product")}
          name="product"
          defaultValue={product}
          placeholder="e.g. LED lamp safety test, BIS certification, BEE RAC…"
          className={fieldCls}
        />
      </div>
      {!compact ? (
        <div>
          <label htmlFor={fid("message")} className={labelCls}>
            {messageLabel}
          </label>
          <textarea
            id={fid("message")}
            name="message"
            rows={4}
            required={messageRequired}
            placeholder={messagePlaceholder}
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
          />
        </div>
      ) : (
        <input type="hidden" name="message" value="Timed contact popup enquiry" />
      )}
      <label className="flex items-start gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          name="privacy_consent"
          value="1"
          required
          className="mt-1"
        />
        <span>
          I agree that Certko / Instacertify may process my details to respond to this
          enquiry, as described in the{" "}
          <a href="/privacy" className="font-semibold text-butter-700 hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/privacy/gdpr-and-dpdp"
            className="font-semibold text-butter-700 hover:underline"
          >
            GDPR / DPDP notice
          </a>
          .
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-12 bg-butter-500 hover:bg-butter-400 disabled:opacity-60 text-ink-950 font-semibold rounded-xl px-6 py-3.5 transition"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
      <p className="text-[11px] text-ink-500 text-center">
        {isTestingIntent(intent)
          ? "Your request is saved as a lead. Someone from our team will update you within 24 working hours."
          : "No spam. Your request is saved as a lead for our team — we connect within 24 hours."}
      </p>
    </form>
  );
}
