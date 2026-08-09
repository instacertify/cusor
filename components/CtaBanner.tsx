import Link from "next/link";
import { ensureDbReady, getSettings } from "@/lib/db";
import RequestQuoteButton, { type QuoteKind } from "./RequestQuoteButton";
import { TalkToCertificationExpertLink } from "./TalkToCertificationExpert";
import { resolveExpertCta } from "@/lib/expert-cta";

export default async function CtaBanner({
  subject,
  kind = "general",
}: {
  subject?: string;
  kind?: QuoteKind;
} = {}) {
  await ensureDbReady();
  const settings = getSettings();
  const expertCta = resolveExpertCta(settings);
  const heading =
    kind === "book" && subject
      ? `Need testing help with ${subject}?`
      : kind === "consulting" && subject
        ? `Need consulting on ${subject}?`
        : kind === "test" && subject
          ? `Need a quote for ${subject}?`
          : kind === "certification" && subject
            ? `Need a quote for ${subject} certification?`
            : kind === "product" && subject
              ? `Need a quote for ${subject}?`
              : settings.cta_heading;
  const text =
    kind === "book"
      ? "Submit your testing requirements — we save a lead and update you within 24 working hours."
      : kind === "consulting"
        ? "Book testing or certification consulting. Your request is logged as a lead — our team replies within 24 working hours."
        : kind === "test"
          ? "Book this testing or share your product details. We’ll map lab scope, sample size, timeline and tentative price — update within 24 working hours."
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
            {kind === "book" ? (
              <a
                href="#lab-contact"
                className="inline-flex items-center justify-center min-h-11 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
              >
                Contact
              </a>
            ) : subject ? (
              <>
                <RequestQuoteButton subject={subject} kind={kind} />
                {kind === "test" ? (
                  <RequestQuoteButton
                    subject={`${subject} consulting`}
                    kind="consulting"
                    variant="secondary"
                  />
                ) : null}
              </>
            ) : (
              <TalkToCertificationExpertLink cta={expertCta} />
            )}
            <Link
              href="/blog"
              className="inline-flex items-center justify-center min-h-11 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Latest Blog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
