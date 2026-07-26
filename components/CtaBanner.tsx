import Link from "next/link";
import { getSettings } from "@/lib/db";
import RequestQuoteButton, { type QuoteKind, quoteLabel } from "./RequestQuoteButton";

export default function CtaBanner({
  subject,
  kind = "general",
}: {
  subject?: string;
  kind?: QuoteKind;
} = {}) {
  const settings = getSettings();
  const heading =
    kind === "test" && subject
      ? `Need a quote for ${subject}?`
      : kind === "certification" && subject
      ? `Need a quote for ${subject} certification?`
      : kind === "product" && subject
      ? `Need a quote for ${subject}?`
      : settings.cta_heading;
  const text =
    kind === "test"
      ? "Share your product details and we’ll map the lab scope, sample size, timeline and indicative cost — free quote in 24 hours."
      : kind === "certification"
      ? "Our consultants handle application, testing coordination, inspection readiness and grant follow-up. Free quote in 24 hours."
      : settings.cta_text;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-ink-950 text-cream-50 px-5 py-8 sm:px-14 sm:py-12">
        <div className="relative max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
            {heading}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-300 leading-relaxed">{text}</p>
          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
            {subject ? (
              <RequestQuoteButton subject={subject} kind={kind} />
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-11 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
              >
                {quoteLabel("general")}
              </Link>
            )}
            <Link
              href="/guide"
              className="inline-flex items-center justify-center min-h-11 border border-ink-600 hover:border-butter-500 text-cream-50 font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
