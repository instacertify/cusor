import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import type { PageRecord, Faq } from "@/lib/db";
import FaqAccordion from "@/components/FaqAccordion";
import TestimonialStrip from "@/components/TestimonialStrip";

export default function LandingPageView({
  page,
  faqs,
}: {
  page: PageRecord;
  faqs: Faq[];
}) {
  const ctaLabel = page.cta_label?.trim() || "Get Expert Help";
  const ctaHref = page.cta_href?.trim() || "/contact";
  const brand = "Certko";

  return (
    <div>
      {/* Advertising hero — brand first, one CTA group */}
      <section className="relative overflow-hidden border-b border-cream-200">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 85% 20%, rgb(232 196 90 / 0.28), transparent 55%), linear-gradient(135deg, rgb(250 246 238) 0%, rgb(244 236 220) 45%, rgb(236 226 204) 100%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16">
          <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-950">
            {brand}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-butter-800">
            Advertising landing · Instacertify Labs
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[1.85rem] sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.1] tracking-tight text-ink-950">
            {page.hero_heading || page.title}
          </h1>
          {page.hero_subheading ? (
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-ink-700 leading-relaxed">
              {page.hero_subheading}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center rounded-xl bg-ink-950 hover:bg-ink-800 text-cream-50 text-sm font-semibold px-5 py-3 transition"
            >
              {ctaLabel}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-xl border border-ink-950/15 bg-white/70 hover:bg-white text-ink-900 text-sm font-semibold px-5 py-3 transition"
            >
              Search products
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <article
          className="prose-certko max-w-3xl"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
        />

        {faqs.length > 0 ? (
          <div className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-ink-950 mb-4">
              Frequently asked questions
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>
        ) : null}

        <div className="mt-14 rounded-3xl border border-cream-300 bg-cream-100 px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="min-w-0">
            <p className="font-display text-xl sm:text-2xl font-semibold text-ink-950">
              Ready to start?
            </p>
            <p className="mt-1 text-sm text-ink-600 max-w-xl">
              Share your product details — Certko / Instacertify replies with a scoped plan and quote within 24 hours.
            </p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-butter-500 hover:bg-butter-400 text-ink-950 text-sm font-bold px-5 py-3 transition"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="mt-14">
          <TestimonialStrip />
        </div>
      </section>
    </div>
  );
}
