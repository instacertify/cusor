import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import IconChip from "@/components/IconChip";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { StandardApplicabilityChips } from "@/components/MarketApplicability";
import { getFaqs, getTestingServiceBySlug, getTestingServices } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { standardFamiliesFromText } from "@/lib/market-applicability";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; testSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, testSlug } = await params;
  const svc = getTestingServiceBySlug(slug, testSlug);
  if (!svc) return {};
  return buildMetadata(`test:${svc.id}`, {
    title: svc.meta_title || `${svc.name} Testing | Certko`,
    description: svc.meta_description || svc.summary,
    path: `/testing/${svc.category_slug}/${svc.slug}`,
    image: svc.image,
  });
}

export default async function TestingServicePage({ params }: Props) {
  const { slug, testSlug } = await params;
  const svc = getTestingServiceBySlug(slug, testSlug);
  if (!svc || !svc.category_slug) notFound();
  // Each test page uses only its own FAQ set (editable in admin per test)
  const faqs = getFaqs(`test:${svc.id}`);
  const siblings = getTestingServices(svc.category_id).filter((s) => s.id !== svc.id).slice(0, 6);
  const html = marked.parse(svc.content || "") as string;
  const standardFamilies = standardFamiliesFromText(svc.standards || "");

  const jsonLd = buildJsonLd(enabledSchemaTypes(`test:${svc.id}`, "test"), {
    name: `${svc.name} Testing`,
    description: svc.summary,
    url: `${BASE_URL}/testing/${svc.category_slug}/${svc.slug}`,
    image: svc.image,
    faqs,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Product Testing", url: "/testing" },
      { name: svc.category_name || "Category", url: `/testing/${svc.category_slug}` },
      { name: svc.name },
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
          { label: svc.category_name || "Category", href: `/testing/${svc.category_slug}` },
          { label: svc.name },
        ]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-butter-700 mb-3">
            {svc.category_name}
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
            {svc.name}
          </h1>
          <p className="mt-4 text-lg text-ink-600 leading-relaxed">{svc.summary}</p>
          {svc.standards ? (
            <div className="mt-4">
              <StandardApplicabilityChips standards={svc.standards} />
              {standardFamilies.length > 0 ? (
                <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-xl">
                  {standardFamilies
                    .map((f) => `${f.label} — typically accepted in ${f.where}. ${f.blurb}`)
                    .join(" ")}
                </p>
              ) : null}
            </div>
          ) : null}

          <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            {svc.product_category && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Product category</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.product_category}</dd>
              </div>
            )}
            {svc.standards && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Main standard</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.standards}</dd>
              </div>
            )}
            {svc.test_type && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Test type</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.test_type}</dd>
              </div>
            )}
            {svc.accreditation && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Accreditation</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.accreditation}</dd>
              </div>
            )}
            {svc.timeline && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Testing timeline</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.timeline}</dd>
              </div>
            )}
            {svc.sample_size && (
              <div className="rounded-xl border border-cream-300 bg-white px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Sample size required</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.sample_size}</dd>
              </div>
            )}
            <div className="rounded-xl border border-butter-400/50 bg-butter-500/10 px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">
                Tentative testing price
              </dt>
              <dd className="mt-1 font-display text-xl font-semibold text-ink-950">
                {formatPriceRange(svc.min_price, svc.max_price)}
              </dd>
              <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                {svc.price_note ||
                  "Indicative lab charges only — final quote depends on sample, scope and lab slot."}
              </p>
            </div>
          </dl>

          <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
            <RequestQuoteButton subject={svc.name} kind="test" />
            <RequestQuoteButton
              subject={`${svc.name} consulting`}
              kind="consulting"
              variant="secondary"
            />
          </div>
        </div>
        {svc.image ? (
          <Image
            src={svc.image}
            alt={svc.name}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : (
          <div className="rounded-3xl border border-cream-300 bg-cream-50 p-10 flex items-center justify-center">
            <IconChip
              name={svc.category_icon || "microscope"}
              size={48}
              chip="hero"
              className="w-24 h-24 rounded-3xl"
            />
          </div>
        )}
      </div>

      {html ? (
        <article
          className="prose prose-ink mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      {faqs.length > 0 && (
        <section className="mt-14" id="faqs">
          <FaqAccordion faqs={faqs} heading={`FAQs about ${svc.name}`} />
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">
            Related tests in {svc.category_name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {siblings.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-cream-300 p-4 hover:border-butter-500 transition flex flex-col gap-2"
              >
                <Link href={`/testing/${svc.category_slug}/${s.slug}`}>
                  <span className="block font-semibold text-ink-950 text-sm">{s.name}</span>
                  <span className="text-xs text-ink-500">{s.standards || s.test_type}</span>
                </Link>
                <RequestQuoteButton subject={s.name} kind="test" variant="compact" short />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner subject={svc.name} kind="test" />
      </div>
    </div>
  );
}