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
      loading="eager"
      decoding="async"
      draggable={false}
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
        tabIndex={-1}
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

/** Repeat logos so one marquee group is always wider than typical viewports. */
function expandBrands(brands: TrustedBrand[], minItems = 10): TrustedBrand[] {
  if (brands.length === 0) return [];
  const out: TrustedBrand[] = [];
  while (out.length < minItems) {
    out.push(...brands);
  }
  return out;
}

function BrandGroup({
  brands,
  tone,
  groupKey,
  ariaHidden,
}: {
  brands: TrustedBrand[];
  tone: "light" | "dark";
  groupKey: string;
  ariaHidden?: boolean;
}) {
  return (
    <div className="trusted-marquee-group" aria-hidden={ariaHidden || undefined}>
      {brands.map((brand, i) => (
        <BrandMark key={`${groupKey}-${brand.id}-${i}`} brand={brand} tone={tone} />
      ))}
    </div>
  );
}

/**
 * Continuous scrolling “Trusted by Global Brands” strip.
 * Logos from Admin → Trusted Brands. Seamless loop on homepage and every trust page.
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

  // Enough logos per group for a seamless -50% loop on wide screens.
  const group = expandBrands(brands, Math.max(10, brands.length * 2));
  // Duration scales with group size so speed stays roughly constant.
  const durationSec = Math.max(28, Math.round(group.length * 3.2));

  return (
    <section
      className={`${
        tone === "dark" ? "bg-ink-950 text-white" : "bg-cream-50"
      } overflow-hidden ${className}`}
      aria-label="Trusted by Global Brands"
      style={{ ["--trusted-marquee-duration" as string]: `${durationSec}s` }}
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
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 ${
            tone === "dark"
              ? "bg-gradient-to-r from-ink-950 to-transparent"
              : "bg-gradient-to-r from-cream-50 to-transparent"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 ${
            tone === "dark"
              ? "bg-gradient-to-l from-ink-950 to-transparent"
              : "bg-gradient-to-l from-cream-50 to-transparent"
          }`}
          aria-hidden
        />
        {/* Two identical groups → animate -50% for a gapless continuous loop */}
        <div className="trusted-marquee-track">
          <BrandGroup brands={group} tone={tone} groupKey="a" />
          <BrandGroup brands={group} tone={tone} groupKey="b" ariaHidden />
        </div>
      </div>
    </section>
  );
}
