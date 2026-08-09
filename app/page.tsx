import Link from "next/link";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBanner from "@/components/CtaBanner";
import HeroSlider from "@/components/HeroSlider";
import HeroLabBackground from "@/components/HeroLabBackground";
import TestimonialStrip from "@/components/TestimonialStrip";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getCategories,
  getFeaturedProducts,
  getFaqs,
  getUpcomingQcos,
  getActiveHeroSlides,
} from "@/lib/queries";
import { heroSlidesToBackground } from "@/lib/hero-slides";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const HOW_IT_WORKS = [
  {
    icon: "search",
    title: "Check Your Product",
    text: "Search by product name, standard or HSN. See whether you need BIS, BEE, GMARK, CE, FCC, SABER, WPC or another route — and what testing typically costs.",
  },
  {
    icon: "microscope",
    title: "Compare Testing Options",
    text: "Review indicative lab charges, recognised laboratories and scheme notes before you commit budget or a production timeline.",
  },
  {
    icon: "handshake",
    title: "Get Expert Help",
    text: "Hand certification and testing coordination to a vetted consultant — application, lab booking, inspection readiness and grant. Free quote in 24 hours.",
  },
];

export default async function HomePage() {
  await ensureDbReady();
  const settings = getSettings();
  const heroSlides = getActiveHeroSlides();
  const categories = getCategories();
  const featured = getFeaturedProducts(8);
  const faqs = getFaqs("global");
  const totalProducts = categories.reduce((s, c) => s + (c.product_count ?? 0), 0);
  const upcomingQcos = getUpcomingQcos().slice(0, 3);

  const stats = [1, 2, 3, 4].map((i) => ({
    value: settings[`stat_${i}_value`],
    label: settings[`stat_${i}_label`],
  }));

  return (
    <div>
      {/* Hero — one clear job: find what your product needs */}
      <section className="relative overflow-hidden min-h-[min(72vh,640px)] flex flex-col justify-center">
        <HeroLabBackground
          slides={
            heroSlides.length > 0 ? heroSlidesToBackground(heroSlides) : undefined
          }
        />
        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          <div className="animate-rise min-w-0">
            <p className="font-display text-sm font-semibold tracking-wide text-ink-800 mb-3 sm:mb-4">
              Certko
            </p>
            <h1 className="font-display text-[1.85rem] leading-[1.12] sm:text-4xl lg:text-[2.85rem] font-semibold sm:leading-[1.1] tracking-tight text-ink-950 max-w-xl">
              {settings.hero_heading}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-[15px] text-ink-700 max-w-lg leading-relaxed">
              {settings.hero_subheading}
            </p>
            <div className="mt-6 sm:mt-7 max-w-xl">
              <SearchBox
                large
                placeholder="Search a product, IS standard, or certification…"
              />
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-600">
              <Link href="/products" className="font-semibold text-ink-800 hover:text-butter-700">
                Browse products
              </Link>
              <Link href="/certifications" className="font-semibold text-ink-800 hover:text-butter-700">
                View certifications
              </Link>
              <Link href="/contact" className="font-semibold text-butter-700 hover:text-butter-600">
                Talk to an expert
              </Link>
            </p>
          </div>
          {heroSlides.length > 0 ? (
            <div className="animate-rise min-w-0 order-first lg:order-none">
              <HeroSlider slides={heroSlides} />
            </div>
          ) : null}
        </div>
      </section>

      {/* Quiet proof strip — kept out of the hero */}
      <section className="border-b border-cream-200 bg-cream-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <div key={i} className="min-w-0">
              <div className="font-display text-xl sm:text-2xl font-semibold text-ink-950">{s.value}</div>
              <div className="text-xs sm:text-sm text-ink-600 leading-snug mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 text-center">How It Works</h2>
        <p className="text-center text-ink-600 mt-2 mb-8 sm:mb-10 text-sm sm:text-base px-2">
          Three steps from “is it mandatory?” to certified.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {HOW_IT_WORKS.map((s, i) => {
            const isHelp = s.title === "Get Expert Help";
            const Card = (
              <>
                <span className="absolute top-5 right-5 font-display text-4xl sm:text-5xl font-semibold text-cream-200" aria-hidden>
                  {i + 1}
                </span>
                <IconChip name={s.icon} size={26} chip="xl" className="sm:w-14 sm:h-14 sm:rounded-2xl" />
                <h3 className="font-display text-lg font-semibold text-ink-950 mt-4 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
                {isHelp ? (
                  <span className="mt-4 inline-flex text-sm font-bold text-butter-700">
                    Contact us →
                  </span>
                ) : null}
              </>
            );
            return isHelp ? (
              <a
                key={i}
                href="/contact"
                className="relative bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-7 hover:border-butter-500 transition block"
              >
                {Card}
              </a>
            ) : (
              <div
                key={i}
                className="relative bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-7"
              >
                {Card}
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular products */}
      <section className="bg-cream-100 border-y border-cream-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">Popular BIS Products</h2>
              <p className="text-ink-600 mt-2 text-sm sm:text-base">
                Frequently searched Indian BIS requirements — also explore BEE, GMARK and export certifications.
              </p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex text-sm font-semibold text-butter-700 hover:text-butter-600 shrink-0">
              Browse all {formatNumber(totalProducts)} products →
            </Link>
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link href="/products" className="inline-flex min-h-11 items-center text-sm font-semibold text-butter-700">
              Browse all {formatNumber(totalProducts)} products →
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/products/all"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-cream-300 hover:border-butter-500 text-ink-950 text-sm font-semibold rounded-xl px-5 py-3.5 min-h-11 shadow-card transition text-left sm:text-center"
            >
              <Icon name="table" size={18} className="text-butter-700 shrink-0" />
              <span className="sm:hidden">Open full product search table</span>
              <span className="hidden sm:inline">
                Open the full search table — standards, HSN, QCO status, fees & labs
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">Browse BIS Categories</h2>
        <p className="text-ink-600 mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
          Indian BIS notified categories — or{" "}
          <Link href="/certifications" className="font-semibold text-butter-700">
            browse all certifications
          </Link>{" "}
          for BEE, GMARK, CE, FCC and more.
        </p>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover sm:hover:-translate-y-0.5 transition p-4 sm:p-5 flex items-center gap-3 min-h-[4.5rem]"
            >
              <IconChip name={c.icon} size={24} chip="lg" tone="neutral" />
              <span className="min-w-0">
                <span className="block font-semibold text-ink-950 text-sm leading-snug group-hover:text-butter-700 transition line-clamp-2">{c.name}</span>
                <span className="block text-xs text-ink-500 mt-0.5">{c.product_count} products</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/products" className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl px-6 py-3 transition">
            View all categories
          </Link>
        </div>
      </section>

      {/* Upcoming QCOs teaser */}
      {upcomingQcos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h2 className="font-display text-xl sm:text-3xl font-semibold text-ink-950 flex items-start sm:items-center gap-3">
                  <IconChip name="bell" size={22} chip="md" />
                  <span className="leading-snug">Never Miss a New Mandatory Product</span>
                </h2>
                <p className="text-ink-600 mt-2 max-w-2xl text-sm sm:text-base">
                  New Quality Control Orders keep adding products to the mandatory BIS list.
                  These deadlines are coming up next:
                </p>
              </div>
              <Link href="/qco" className="text-sm font-bold text-butter-700 hover:text-butter-600 shrink-0">
                View all upcoming QCOs →
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {upcomingQcos.map((q) => (
                <Link
                  key={q.id}
                  href="/qco"
                  className="group bg-cream-50 rounded-2xl border border-cream-300 p-5 hover:border-butter-500 transition"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wide text-butter-700">
                    Mandatory from {q.enforcement_date}
                  </div>
                  <div className="mt-1.5 font-display font-bold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
                    {q.product}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">{q.standard} · {q.scheme}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialStrip variant="full" count={3} />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <FaqAccordion faqs={faqs} />
      </section>

      <CtaBanner />
    </div>
  );
}
