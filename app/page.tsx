import Link from "next/link";
import Icon from "@/components/Icon";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBanner from "@/components/CtaBanner";
import HeroSlider from "@/components/HeroSlider";
import TestimonialStrip from "@/components/TestimonialStrip";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getCategories,
  getFeaturedProducts,
  getFaqs,
  getUpcomingQcos,
  getActiveHeroSlides,
} from "@/lib/queries";
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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cream-50"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-14 pb-10 sm:pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-8 sm:gap-10 items-center">
          <div className="animate-rise min-w-0">
            {settings.announcement?.trim() ? (
              <p className="inline-flex max-w-full items-center gap-2 bg-white border border-cream-200 rounded-full px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-ink-700 mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-butter-500 animate-pulse shrink-0" aria-hidden />
                <span className="truncate">{settings.announcement}</span>
              </p>
            ) : null}
            <h1 className="font-display text-[1.7rem] leading-[1.12] sm:text-4xl lg:text-[3.1rem] font-semibold sm:leading-[1.08] tracking-tight text-ink-950">
              {settings.hero_heading}
            </h1>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-ink-700 max-w-xl leading-relaxed">
              {settings.hero_subheading}
            </p>
            <div className="mt-6 sm:mt-8 max-w-xl">
              <SearchBox large placeholder="Search your product or certification…" />
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white border border-cream-300 rounded-2xl px-3 sm:px-4 py-3">
                  <div className="font-display text-xl sm:text-2xl font-semibold text-ink-950">{s.value}</div>
                  <div className="text-[11px] sm:text-xs font-medium text-ink-600 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {heroSlides.length > 0 ? (
            <div className="animate-rise min-w-0 order-first lg:order-none">
              <HeroSlider slides={heroSlides} />
            </div>
          ) : null}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 text-center">How It Works</h2>
        <p className="text-center text-ink-600 mt-2 mb-8 sm:mb-10 text-sm sm:text-base px-2">
          Three steps from “is it mandatory?” to certified.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-7">
              <span className="absolute top-5 right-5 font-display text-4xl sm:text-5xl font-semibold text-cream-200" aria-hidden>
                {i + 1}
              </span>
              <span className="inline-flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-butter-300/40 text-butter-700 items-center justify-center">
                <Icon name={s.icon} size={26} />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-950 mt-4 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
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
              <span className="shrink-0 w-11 h-11 rounded-xl bg-cream-100 text-ink-700 flex items-center justify-center group-hover:bg-butter-300/40 group-hover:text-butter-700 transition">
                <Icon name={c.icon} size={24} />
              </span>
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
                  <span className="inline-flex w-10 h-10 rounded-xl bg-butter-300/40 text-butter-700 items-center justify-center shrink-0">
                    <Icon name="bell" size={22} />
                  </span>
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
