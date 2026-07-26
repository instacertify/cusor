import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBanner from "@/components/CtaBanner";
import { getSettings } from "@/lib/db";
import {
  getCategories,
  getFeaturedProducts,
  getFaqs,
  getTestimonials,
  getPage,
  getUpcomingQcos,
} from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const HOW_IT_WORKS = [
  {
    icon: "search",
    title: "Check Your Product",
    text: "Search by product name, IS standard or HSN code. Instantly see which certification is required, under which scheme, and what it costs.",
  },
  {
    icon: "microscope",
    title: "Compare Testing Labs",
    text: "Browse 400+ BIS-recognised laboratories. Compare locations, scopes and real reported test prices before you commit.",
  },
  {
    icon: "handshake",
    title: "Get Expert Help",
    text: "Hand the paperwork to a vetted compliance consultant who manages testing, inspection and licence grant. Free quote in 24 hours.",
  },
];

export default function HomePage() {
  const settings = getSettings();
  const home = getPage("home");
  const categories = getCategories();
  const featured = getFeaturedProducts(8);
  const faqs = getFaqs("global");
  const testimonials = getTestimonials();
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
          className="absolute inset-0 -z-10 bg-gradient-to-b from-butter-300/25 via-cream-100 to-cream-50"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 bg-white/70 border border-cream-300 rounded-full px-4 py-1.5 text-xs font-semibold text-ink-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-butter-500 animate-pulse" aria-hidden />
              {settings.announcement}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-ink-950">
              {settings.hero_heading}
            </h1>
            <p className="mt-5 text-lg text-ink-700 max-w-xl leading-relaxed">
              {settings.hero_subheading}
            </p>
            <div className="mt-8 max-w-xl">
              <SearchBox large />
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/70 border border-cream-300 rounded-2xl px-4 py-3">
                  <div className="font-display text-2xl font-extrabold text-ink-950">{s.value}</div>
                  <div className="text-xs font-medium text-ink-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block animate-rise">
            {home?.image ? (
              <Image
                src={home.image}
                alt="BIS product certification in India"
                width={620}
                height={480}
                priority
                className="rounded-3xl shadow-card-hover border border-cream-300 object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-950 text-center">How It Works</h2>
        <p className="text-center text-ink-600 mt-2 mb-10">Three steps from “is it mandatory?” to certified.</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="relative bg-white rounded-3xl border border-cream-300 shadow-card p-7">
              <span className="absolute top-6 right-6 font-display text-5xl font-extrabold text-cream-200" aria-hidden>
                {i + 1}
              </span>
              <span className="inline-flex w-14 h-14 rounded-2xl bg-butter-300/40 text-butter-700 items-center justify-center">
                <Icon name={s.icon} size={28} />
              </span>
              <h3 className="font-display text-lg font-bold text-ink-950 mt-4 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular products */}
      <section className="bg-cream-100 border-y border-cream-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink-950">Popular Products</h2>
              <p className="text-ink-600 mt-2">The most searched BIS certification requirements.</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex text-sm font-bold text-butter-700 hover:text-butter-600">
              Browse all {formatNumber(totalProducts)} products →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link href="/products" className="text-sm font-bold text-butter-700">
              Browse all {formatNumber(totalProducts)} products →
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products/all"
              className="inline-flex items-center gap-2 bg-white border border-cream-300 hover:border-butter-500 text-ink-950 text-sm font-bold rounded-xl px-5 py-3 shadow-card transition"
            >
              <Icon name="table" size={18} className="text-butter-700" />
              Open the full search table — standards, HSN, QCO status, fees & labs
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-ink-950">Browse by Category</h2>
        <p className="text-ink-600 mt-2 mb-8">Find BIS requirements across {categories.length} notified product categories.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-5 flex items-center gap-3"
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-cream-100 text-ink-700 flex items-center justify-center group-hover:bg-butter-300/40 group-hover:text-butter-700 transition">
                <Icon name={c.icon} size={24} />
              </span>
              <span>
                <span className="block font-semibold text-ink-950 text-sm group-hover:text-butter-700 transition">{c.name}</span>
                <span className="block text-xs text-ink-500">{c.product_count} products</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/products" className="inline-flex bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-6 py-3 transition">
            View all categories
          </Link>
        </div>
      </section>

      {/* Upcoming QCOs teaser */}
      {upcomingQcos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-card p-8 sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 flex items-center gap-3">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-butter-300/40 text-butter-700 items-center justify-center">
                    <Icon name="bell" size={22} />
                  </span>
                  Never Miss a New Mandatory Product
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

      {/* Testimonials */}
      <section className="bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-3xl font-bold text-center">
            Trusted by Importers & Manufacturers Across India
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {testimonials.map((t) => (
              <figure key={t.id} className="bg-ink-900 rounded-3xl border border-ink-800 p-7 flex flex-col gap-4">
                <div className="text-butter-400 tracking-wider" aria-label={`${t.rating} star rating`}>
                  {"★".repeat(t.rating)}
                </div>
                <blockquote className="text-sm leading-relaxed text-ink-300">“{t.quote}”</blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-butter-500 text-ink-950 font-display font-bold flex items-center justify-center">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-ink-400">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <FaqAccordion faqs={faqs} />
      </section>

      <CtaBanner />
    </div>
  );
}
