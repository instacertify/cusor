import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBanner from "@/components/CtaBanner";
import GlobeWatermark from "@/components/GlobeWatermark";
import HeroLabBackground from "@/components/HeroLabBackground";
import NewsletterSignup from "@/components/NewsletterSignup";
import TestimonialStrip from "@/components/TestimonialStrip";
import TrustedBrandsStrip from "@/components/TrustedBrandsStrip";
import CertificationSolutionRow from "@/components/CertificationSolutionRow";
import MarketCard from "@/components/MarketCard";
import { TalkToCertificationExpertLink } from "@/components/TalkToCertificationExpert";
import { ensureDbReady, getSettings } from "@/lib/db";
import {
  getActiveHeroSlides,
  getCategories,
  getCertifications,
  getFeaturedProducts,
  getFaqs,
  getPage,
  getTestingCategories,
  getUpcomingQcos,
} from "@/lib/queries";
import { heroSlidesToBackground } from "@/lib/hero-slides";
import { formatNumber } from "@/lib/format";
import { countryHubPath, getFeaturedCountryHubs } from "@/lib/country-certifications";
import { BASE_URL, buildJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await ensureDbReady();
  const home = getPage("home");
  const settings = getSettings();
  return buildMetadata("page:home", {
    title: home?.meta_title || "Certko | BIS Certification Intelligence",
    description:
      home?.meta_description ||
      settings.tagline ||
      "Find the right certification and testing for your product.",
    path: "/",
  });
}

const HOW_IT_WORKS = [
  {
    icon: "search",
    title: "Search your product or HSN",
    text: "Start with a product name, IS standard or HSN code. Certko maps the certification and testing routes that usually apply.",
  },
  {
    icon: "award",
    title: "Pick the right certification",
    text: "Compare BIS, BEE, GMARK, CE, FCC, SABER, WPC and more — with scheme notes so you know what is mandatory vs buyer-driven.",
  },
  {
    icon: "microscope",
    title: "Lock the testing path",
    text: "See indicative lab charges, recognised laboratories and what to book next. Hand the rest to an expert when you are ready.",
  },
];

export default async function HomePage() {
  await ensureDbReady();
  const settings = getSettings();
  const heroSlides = getActiveHeroSlides();
  // Admin toggle (Site Settings): keep the Y-axis revolving globe even when banner slides are on.
  // Always fall back to the globe when there are no active slides so the hero is never empty.
  const showHeroGlobe =
    (settings.hero_show_globe ?? "1") === "1" || heroSlides.length === 0;
  const categories = getCategories();
  const certifications = getCertifications().slice(0, 7);
  const countryHubs = getFeaturedCountryHubs();
  const testingCategories = getTestingCategories().slice(0, 6);
  const featured = getFeaturedProducts(8);
  const faqs = getFaqs("global");
  const totalProducts = categories.reduce((s, c) => s + (c.product_count ?? 0), 0);
  const upcomingQcos = getUpcomingQcos().slice(0, 3);

  const stats = [1, 2, 3, 4, 5]
    .map((i) => ({
      value: (settings[`stat_${i}_value`] || "").trim(),
      label: (settings[`stat_${i}_label`] || "").trim(),
      icon: (settings[`stat_${i}_icon`] || "").trim(),
    }))
    .filter((s) => s.value && s.label);

  // FAQ rich results for homepage accordion (Organization/WebSite are sitewide in layout).
  const faqJsonLd = buildJsonLd(["FAQPage"], {
    name: settings.site_name || "Certko",
    description: settings.tagline || "",
    url: BASE_URL,
    faqs: faqs.map(({ question, answer }) => ({ question, answer })),
  });

  return (
    <div className="relative">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Hero — optional sliding banners + optional revolving globe (admin-controlled) */}
      <section className="relative overflow-hidden min-h-[min(74vh,680px)] flex flex-col justify-center">
        {heroSlides.length > 0 ? (
          <HeroLabBackground watermark slides={heroSlidesToBackground(heroSlides)} />
        ) : null}
        {showHeroGlobe ? <GlobeWatermark /> : null}
        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 pt-10 sm:pt-14 pb-12 sm:pb-16">
          <div className="animate-rise min-w-0 max-w-xl sm:max-w-lg lg:max-w-xl">
            <p className="font-display text-sm font-semibold tracking-wide text-ink-800 mb-3 sm:mb-4">
              Certko
            </p>
            <h1 className="font-display text-[1.85rem] leading-[1.12] sm:text-4xl lg:text-[2.85rem] font-semibold sm:leading-[1.1] tracking-tight text-ink-950">
              {settings.hero_heading}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-[15px] text-ink-700 max-w-lg leading-relaxed">
              {settings.hero_subheading}
            </p>
            <div className="mt-6 sm:mt-7 max-w-xl">
              <SearchBox
                large
                placeholder="Search product name, HSN code, or standard…"
              />
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-600">
              <Link href="/certifications" className="font-semibold text-ink-800 hover:text-butter-700">
                Find certification
              </Link>
              <Link href="/testing" className="font-semibold text-ink-800 hover:text-butter-700">
                Find testing
              </Link>
              <Link href="/products/all" className="font-semibold text-ink-800 hover:text-butter-700">
                Search by HSN
              </Link>
              <TalkToCertificationExpertLink variant="link" />
            </p>
          </div>
        </div>
      </section>

      {/* Highlighted proof strip — kept out of the hero */}
      <section className="relative overflow-hidden border-y border-ink-950 bg-ink-950 text-cream-50">
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-butter-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-36 w-36 rounded-full bg-butter-500/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((s, i) => (
            <div key={i} className="min-w-0">
              {s.icon ? (
                <span className="mb-2.5 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-cream-50/95 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.icon}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : null}
              <div className="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-cream-50">
                {s.value}
              </div>
              <div className="mt-1.5 h-0.5 w-8 bg-butter-500" aria-hidden />
              <div className="mt-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-cream-100/80 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted by — homepage placement (also sitewide via TestimonialStrip) */}
      <TrustedBrandsStrip tone="light" />

      {/* Dual path — certification vs testing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 text-center px-2 leading-snug">
          Certification and Testing Solution to Make You Ready for the Global Market
        </h2>
        <p className="text-center text-ink-600 mt-2 mb-8 sm:mb-10 text-sm sm:text-base px-2 max-w-2xl mx-auto">
          Start with the mark you need to sell, or the lab work that unlocks it — for India and export markets.
        </p>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cream-300 bg-white p-5 sm:p-8 shadow-card">
            <IconChip name="award" size={26} chip="xl" className="sm:w-14 sm:h-14 sm:rounded-2xl" />
            <h3 className="font-display text-xl font-semibold text-ink-950 mt-4">Right certification</h3>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              Map BIS, BEE, GMARK, CE, FCC, SABER, WPC and more for India and export markets.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/certifications/${c.slug}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-cream-300 bg-cream-50 px-3 text-xs font-semibold text-ink-800 hover:border-butter-500 hover:text-butter-700 transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/certifications"
              className="mt-6 inline-flex text-sm font-bold text-butter-700 hover:text-butter-600"
            >
              Browse all certifications →
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cream-300 bg-white p-5 sm:p-8 shadow-card">
            <IconChip name="microscope" size={26} chip="xl" className="sm:w-14 sm:h-14 sm:rounded-2xl" />
            <h3 className="font-display text-xl font-semibold text-ink-950 mt-4">Right testing</h3>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              Find the lab path — electrical, EMC, chemical, mechanical and more — with indicative costs.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {testingCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/testing/${c.slug}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-cream-300 bg-cream-50 px-3 text-xs font-semibold text-ink-800 hover:border-butter-500 hover:text-butter-700 transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/labs"
                  className="inline-flex min-h-9 items-center rounded-lg border border-cream-300 bg-cream-50 px-3 text-xs font-semibold text-ink-800 hover:border-butter-500 hover:text-butter-700 transition"
                >
                  Labs
                </Link>
              </li>
            </ul>
            <Link
              href="/testing"
              className="mt-6 inline-flex text-sm font-bold text-butter-700 hover:text-butter-600"
            >
              Browse all testing →
            </Link>
          </div>
        </div>
      </section>

      {/* Markets — destination picker only; scheme detail lives on country / cert pages */}
      <section className="bg-cream-100 border-y border-cream-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 text-center leading-snug">
            Where are you selling?
          </h2>
          <p className="text-center text-ink-600 mt-2 mb-8 sm:mb-10 text-sm sm:text-base max-w-xl mx-auto">
            Pick a market to open its certification path — then confirm against your product or HSN.
          </p>

          <div className="-mx-4 sm:mx-0">
            <ul className="flex gap-4 overflow-x-auto px-4 sm:px-0 pb-2 sm:pb-0 sm:grid sm:grid-cols-5 sm:gap-4 snap-x snap-mandatory sm:overflow-visible">
              {countryHubs.slice(0, 5).map((hub) => (
                <li
                  key={hub.slug}
                  className="min-w-[11.5rem] max-w-[14rem] shrink-0 snap-start sm:min-w-0 sm:max-w-none h-auto sm:h-full"
                >
                  <MarketCard
                    href={countryHubPath(hub.slug)}
                    title={hub.shortName}
                    schemesLine={hub.schemes.map((s) => s.name).join(" · ")}
                    cta="Open"
                    compact
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <Link
              href="/products/all"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink-950 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
            >
              Check your product / HSN
            </Link>
            <Link
              href="/certifications/countries"
              className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-butter-700 hover:text-butter-600"
            >
              Search all countries →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 text-center">How it works</h2>
          <p className="text-center text-ink-600 mt-2 mb-8 sm:mb-10 text-sm sm:text-base px-2">
            From HSN or product name to the right mark and the right lab plan.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card p-5 sm:p-7"
              >
                <span className="absolute top-5 right-5 font-display text-4xl sm:text-5xl font-semibold text-cream-200" aria-hidden>
                  {i + 1}
                </span>
                <IconChip name={s.icon} size={26} chip="xl" className="sm:w-14 sm:h-14 sm:rounded-2xl" />
                <h3 className="font-display text-lg font-semibold text-ink-950 mt-4 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">Popular products to check</h2>
            <p className="text-ink-600 mt-2 text-sm sm:text-base">
              Start here, then open the HSN search table for standards, fees and labs.
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
            <span className="sm:hidden">Search by HSN code</span>
            <span className="hidden sm:inline">
              Search by HSN — standards, QCO status, fees and labs
            </span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream-100 border-y border-cream-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950">
          Certification solutions &amp; product categories
        </h2>
        <p className="text-ink-600 mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
          Check for the right certification against your product, then browse by category — or{" "}
          <Link href="/certifications" className="font-semibold text-butter-700">
            open all certification programmes
          </Link>
          .
        </p>
        <CertificationSolutionRow className="mb-8" />
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

      {/* Newsletter + expert help */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-ink-950 text-cream-50 px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-butter-500">
              Newsletter
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-2 leading-tight">
              Stay ahead of mandatory changes
            </h2>
            <p className="mt-3 text-sm text-ink-300 leading-relaxed max-w-md">
              Sign up for free updates on India QCO deadlines, certification routes and testing guidance.
            </p>
            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cream-300 bg-white px-5 py-8 sm:px-8 sm:py-10 shadow-card">
            <IconChip name="handshake" size={26} chip="xl" className="sm:w-14 sm:h-14 sm:rounded-2xl" />
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 mt-4 leading-tight">
              Can’t find the right solution?
            </h2>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed max-w-md">
              If your product, HSN or market path isn’t clear, talk to a certification expert. We’ll map the certification and testing route — free quote in 24 hours.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <TalkToCertificationExpertLink />
              <Link
                href="/products/all"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 px-6 py-3 text-sm font-semibold text-ink-800 hover:border-butter-500 transition"
              >
                Search by HSN again
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TestimonialStrip variant="full" count={3} includeBrands={false} />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <FaqAccordion faqs={faqs} />
      </section>

      <CtaBanner />
    </div>
  );
}
