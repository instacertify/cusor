import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { StandardApplicabilityChips } from "@/components/MarketApplicability";
import {
  getFaqs,
  getTestingCategories,
  getTestingCategoryBySlug,
  getTestingServicesFiltered,
  countTestingServices,
} from "@/lib/queries";
import { formatPriceRange, formatNumber } from "@/lib/format";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 36;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getTestingCategoryBySlug(slug);
  if (!cat) return {};
  return buildMetadata(`testcat:${cat.id}`, {
    title: cat.meta_title || `${cat.name} | Product Testing`,
    description: cat.meta_description || cat.summary,
    path: `/testing/${cat.slug}`,
    image: cat.image,
  });
}

export default async function TestingCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = getTestingCategoryBySlug(slug);
  if (!cat) notFound();
  const q = (sp.q || "").trim();
  const totalInCategory = countTestingServices(cat.id);
  const filtered = getTestingServicesFiltered(cat.id, q);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number(sp.page) || 1));
  const services = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const faqs = getFaqs(`testcat:${cat.slug}`);
  const others = getTestingCategories().filter((c) => c.slug !== cat.slug);
  const html = marked.parse(cat.content || "") as string;
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/testing/${cat.slug}?${qs}` : `/testing/${cat.slug}`;
  };

  const jsonLd = buildJsonLd(enabledSchemaTypes(`testcat:${cat.id}`, "testcat"), {
    name: `${cat.name} Services`,
    description: cat.summary,
    url: `${BASE_URL}/testing/${cat.slug}`,
    image: cat.image,
    faqs,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Product Testing", url: "/testing" },
      { name: cat.name },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs
        crumbs={[
          { label: "Product Testing", href: "/testing" },
          { label: cat.name },
        ]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <div className="flex items-center gap-4">
            <IconChip name={cat.icon} size={34} chip="hero" />
            <div>
              <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
                {cat.name}
              </h1>
              <p className="text-sm font-semibold text-ink-500 mt-1">
                {formatNumber(totalInCategory)} testing standard
                {totalInCategory === 1 ? "" : "s"}
                {q
                  ? ` · ${formatNumber(filtered.length)} match${filtered.length === 1 ? "" : "es"}`
                  : ""}
              </p>
            </div>
          </div>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">{cat.summary}</p>
          <p className="mt-3 text-sm text-ink-600 max-w-2xl">
            Includes BIS certification testing standards mapped from notified products — every IS
            standard is a laboratory testing standard under this discipline.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
            <RequestQuoteButton subject={cat.name} kind="test" />
            <RequestQuoteButton subject={`${cat.name} consulting`} kind="consulting" variant="secondary" />
          </div>
        </div>
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      {html ? (
        <article
          className="prose prose-ink mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink-950 mb-2">
          Tests & standards in this category
        </h2>
        <p className="text-sm text-ink-600 mb-4 max-w-2xl">
          Open a testing standard for BIS product coverage, market acceptance (IS · India / IEC ·
          Global), tentative prices and booking.
        </p>
        <form
          action={`/testing/${cat.slug}`}
          method="GET"
          className="mb-6 flex flex-col sm:flex-row gap-3 max-w-xl"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Filter by IS standard, product family or test name…"
            className="flex-1 rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-butter-500 px-5 text-sm font-semibold text-ink-950 transition hover:bg-butter-400"
          >
            Filter
          </button>
          {q ? (
            <Link
              href={`/testing/${cat.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 px-4 text-sm font-semibold text-ink-800"
            >
              Clear
            </Link>
          ) : null}
        </form>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 flex flex-col gap-2"
            >
              <Link href={`/testing/${cat.slug}/${s.slug}`} className="flex flex-col gap-2 min-w-0">
                <h3 className="font-display font-bold text-ink-950">{s.name}</h3>
                {(s.test_type || s.standards) && (
                  <p className="text-xs font-semibold text-ink-500">
                    {[s.test_type, s.standards].filter(Boolean).join(" · ")}
                  </p>
                )}
                <StandardApplicabilityChips standards={s.standards || ""} />
                <p className="text-sm text-ink-600 line-clamp-3">{s.summary}</p>
                <p className="text-sm font-semibold text-ink-900">
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-500">Tentative price: </span>
                  {formatPriceRange(s.min_price, s.max_price)}
                </p>
                {(s.timeline || s.sample_size) && (
                  <div className="mt-1 space-y-1 text-xs text-ink-700">
                    {s.timeline ? (
                      <p>
                        <span className="font-bold text-ink-500">Timeline:</span> {s.timeline}
                      </p>
                    ) : null}
                    {s.sample_size ? (
                      <p>
                        <span className="font-bold text-ink-500">Sample:</span> {s.sample_size}
                      </p>
                    ) : null}
                  </div>
                )}
                <span className="text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
                  View details <Icon name="arrow-right" size={14} />
                </span>
              </Link>
              <div className="mt-auto pt-2 border-t border-cream-200 flex flex-wrap gap-x-3 gap-y-1">
                <RequestQuoteButton subject={s.name} kind="test" variant="compact" short />
                <RequestQuoteButton
                  subject={`${s.name} consulting`}
                  kind="consulting"
                  variant="compact"
                  short
                />
              </div>
            </div>
          ))}
        </div>
        {services.length === 0 && (
          <p className="text-sm text-ink-500">
            {q ? "No testing standards match that filter." : "No tests published in this category yet."}
          </p>
        )}
        {totalPages > 1 && (
          <nav className="mt-8 flex flex-wrap items-center gap-3 text-sm" aria-label="Pagination">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="inline-flex min-h-10 items-center rounded-xl border border-cream-300 px-4 font-semibold text-ink-800"
              >
                Previous
              </Link>
            ) : null}
            <span className="text-ink-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex min-h-10 items-center rounded-xl border border-cream-300 px-4 font-semibold text-ink-800"
              >
                Next
              </Link>
            ) : null}
          </nav>
        )}
      </section>

      <section className="mt-14" id="faqs">
        <FaqAccordion faqs={faqs} heading={`FAQs about ${cat.name}`} />
      </section>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">
            Other testing categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.id}
                href={`/testing/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:border-butter-500"
              >
                <IconChip name={c.icon} size={16} chip="sm" tone="neutral" className="w-7 h-7" />
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner subject={cat.name} kind="test" />
      </div>
    </div>
  );
}
