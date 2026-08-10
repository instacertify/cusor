"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterSignup({
  className = "",
}: {
  className?: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (sent) {
    return (
      <div
        className={`rounded-2xl border border-butter-500/40 bg-butter-500/10 px-5 py-5 text-sm text-cream-50 ${className}`}
      >
        <p className="font-display text-lg font-semibold text-cream-50">You’re on the list</p>
        <p className="mt-1 text-cream-100/80 leading-relaxed">
          We’ll send QCO updates, certification notes and testing tips — no spam.
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const body = new FormData(form);
    const email = String(body.get("email") ?? "").trim();
    const name =
      String(body.get("name") ?? "").trim() ||
      (email.includes("@") ? email.split("@")[0] : "Subscriber");
    body.set("name", name);
    body.set("product", "Newsletter");
    body.set(
      "message",
      "Homepage newsletter signup — send QCO, certification and testing updates."
    );

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
        setError(
          data?.error === "missing_fields"
            ? "Please enter a valid email."
            : "Could not subscribe just now. Please try again."
        );
        setPending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Could not subscribe just now. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Work email"
          className="w-full flex-1 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-cream-50 placeholder:text-ink-400 outline-none focus:border-butter-500 focus:ring-2 focus:ring-butter-500/30"
        />
        <input type="hidden" name="name" value="" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-butter-500 px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-butter-400 transition disabled:opacity-60"
        >
          {pending ? "Joining…" : "Sign up for updates"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-xs text-ink-400 leading-relaxed">
        Free updates on mandatory India certifications, QCO deadlines and testing guidance.
        By signing up you agree we may email you under our{" "}
        <a href="/privacy" className="text-butter-400 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
