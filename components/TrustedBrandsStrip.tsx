import { ensureDbReady } from "@/lib/db";
import { getActiveTrustedBrands } from "@/lib/queries";
import type { TrustedBrand } from "@/lib/db";

/** Fixed display slot — every uploaded logo is scaled into the same box. */
function BrandMark({ brand, tone }: { brand: TrustedBrand; tone: "light" | "dark" }) {
  const slotClass =
    tone === "dark"
      ? "trusted-brand-slot trusted-brand-slot--dark group"
      : "trusted-brand-slot trusted-brand-slot--light group";

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={brand.name}
      className="trusted-brand-logo"
      loading="lazy"
      decoding="async"
    />
  );

  if (brand.href) {
    return (
      <a
        href={brand.href}
        className={slotClass}
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
    <div className={slotClass} title={brand.name}>
      {img}
      <span className="sr-only">{brand.name}</span>
    </div>
  );
}

/**
 * Scrolling “Trusted by Global Brands” strip — logos from Admin → Trusted Brands.
 * Shown on the homepage and on every page that uses TestimonialStrip.
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
      aria-label="Trusted by Global Brands"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-12 pb-3">
        <h2
          className={`text-center font-display text-xl sm:text-2xl font-semibold ${
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
