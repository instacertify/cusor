import { getRandomFeaturedTestimonials, getTestimonials } from "@/lib/queries";
import type { Testimonial } from "@/lib/db";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-butter-400 tracking-wider text-sm" aria-label={`${rating} star rating`}>
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
    </div>
  );
}

function Card({ t, tone }: { t: Testimonial; tone: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <figure
      className={
        dark
          ? "bg-ink-900 rounded-2xl sm:rounded-3xl border border-ink-800 p-5 sm:p-7 flex flex-col gap-4 h-full"
          : "bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-7 flex flex-col gap-4 h-full"
      }
    >
      <Stars rating={t.rating} />
      <blockquote
        className={
          dark
            ? "text-sm leading-relaxed text-ink-300"
            : "text-sm leading-relaxed text-ink-700"
        }
      >
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-butter-500 text-ink-950 font-display font-bold flex items-center justify-center shrink-0">
          {t.name.charAt(0)}
        </span>
        <span>
          <span className={`block text-sm font-semibold ${dark ? "text-cream-50" : "text-ink-950"}`}>
            {t.name}
          </span>
          <span className={`block text-xs ${dark ? "text-ink-400" : "text-ink-500"}`}>{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Sitewide trust strip — pulls random featured testimonials from the CMS library.
 * Homepage uses variant="full"; inner pages use the compact strip (default).
 */
export default async function TestimonialStrip({
  count = 2,
  variant = "strip",
  heading,
  className = "",
}: {
  count?: number;
  variant?: "strip" | "full";
  heading?: string;
  className?: string;
} = {}) {
  const items =
    variant === "full"
      ? (() => {
          const featured = getRandomFeaturedTestimonials(Math.max(count, 3));
          if (featured.length >= 3) return featured.slice(0, Math.max(count, 3));
          // Fall back to full library order if not enough featured rows
          return getTestimonials().slice(0, Math.max(count, 3));
        })()
      : getRandomFeaturedTestimonials(count);

  if (items.length === 0) return null;

  if (variant === "full") {
    return (
      <section className={`bg-ink-950 text-white ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center px-2 leading-snug">
            {heading || "Trusted by Importers & Manufacturers Across India"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
            {items.slice(0, 3).map((t) => (
              <Card key={t.id} t={t} tone="dark" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-700">
            Client stories
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-950 mt-1">
            {heading || "What teams say about Certko"}
          </h2>
        </div>
        <p className="text-xs text-ink-500 max-w-sm">
          Featured from our testimonial library — a fresh selection each visit.
        </p>
      </div>
      <div
        className={`grid gap-4 ${
          items.length === 1 ? "max-w-2xl" : "sm:grid-cols-2"
        }`}
      >
        {items.map((t) => (
          <Card key={t.id} t={t} tone="light" />
        ))}
      </div>
    </section>
  );
}
