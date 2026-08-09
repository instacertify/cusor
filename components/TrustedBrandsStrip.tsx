import { ensureDbReady } from "@/lib/db";
import { getActiveTrustedBrands } from "@/lib/queries";
import type { TrustedBrand } from "@/lib/db";

function BrandMark({ brand, tone }: { brand: TrustedBrand; tone: "light" | "dark" }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={brand.name}
      className="h-9 sm:h-11 w-auto max-w-[140px] sm:max-w-[160px] object-contain opacity-80 group-hover:opacity-100 transition"
      loading="lazy"
      decoding="async"
    />
  );

  const shellClass =
    tone === "dark"
      ? "group inline-flex h-16 sm:h-[4.5rem] min-w-[140px] sm:min-w-[160px] items-center justify-center rounded-xl border border-ink-800 bg-ink-900/70 px-5"
      : "group inline-flex h-16 sm:h-[4.5rem] min-w-[140px] sm:min-w-[160px] items-center justify-center rounded-xl border border-cream-300 bg-white px-5 shadow-card";

  if (brand.href) {
    return (
      <a
        href={brand.href}
        className={shellClass}
        target={brand.href.startsWith("http") ? "_blank" : undefined}
        rel={brand.href.startsWith("http") ? "noopener noreferrer" : undefined}
        title={brand.name}
      >
        {img}
        <span className="sr-only">{brand.name}</span>
      </a>
    );
  }

  return (
    <div className={shellClass} title={brand.name}>
      {img}
      <span className="sr-only">{brand.name}</span>
    </div>
  );
}

/**
 * Scrolling “Trusted by Global Brands” strip — logos from Admin → Trusted Brands library.
 * Mounted with TestimonialStrip on every page that showcases trust.
 */
export default async function TrustedBrandsStrip({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
} = {}) {
  await ensureDbReady();
  const brands = getActiveTrustedBrands();
  if (brands.length === 0) return null;

  // Duplicate the set so the CSS marquee can loop seamlessly.
  const loop = [...brands, ...brands];

  return (
    <section
      className={`${
        tone === "dark" ? "bg-ink-950 text-white" : "bg-cream-50"
      } overflow-hidden ${className}`}
      aria-label="Trusted by global brands"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-12 pb-3">
        <p
          className={`text-center text-[11px] font-bold uppercase tracking-[0.16em] ${
            tone === "dark" ? "text-butter-400" : "text-butter-700"
          }`}
        >
          Social proof
        </p>
        <h2
          className={`mt-2 text-center font-display text-xl sm:text-2xl font-semibold ${
            tone === "dark" ? "text-cream-50" : "text-ink-950"
          }`}
        >
          Trusted by Global Brands
        </h2>
      </div>

      <div className="trusted-marquee relative pb-10 sm:pb-12">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 ${
            tone === "dark"
              ? "bg-gradient-to-r from-ink-950 to-transparent"
              : "bg-gradient-to-r from-cream-50 to-transparent"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 ${
            tone === "dark"
              ? "bg-gradient-to-l from-ink-950 to-transparent"
              : "bg-gradient-to-l from-cream-50 to-transparent"
          }`}
          aria-hidden
        />
        <div className="trusted-marquee-track gap-3 sm:gap-4 px-4">
          {loop.map((brand, i) => (
            <BrandMark key={`${brand.id}-${i}`} brand={brand} tone={tone} />
          ))}
        </div>
      </div>
    </section>
  );
}
