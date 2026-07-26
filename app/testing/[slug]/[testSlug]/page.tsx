import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { getFaqs, getTestingServiceBySlug, getTestingServices } from "@/lib/queries";
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
  const testFaqs = getFaqs(`test:${svc.id}`);
  const categoryFaqs = getFaqs(`testcat:${svc.category_slug}`);
  // Prefer test-specific FAQs; fall back to category FAQs so every test page can show Q&A
  const faqs = testFaqs.length > 0 ? testFaqs : categoryFaqs;
  const siblings = getTestingServices(svc.category_id).filter((s) => s.id !== svc.id).slice(0, 6);
  const html = marked.parse(svc.content || "") as string;

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
              <div className="rounded-xl border border-butter-300 bg-butter-300/20 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-butter-700">Testing timeline</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.timeline}</dd>
              </div>
            )}
            {svc.sample_size && (
              <div className="rounded-xl border border-butter-300 bg-butter-300/20 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-butter-700">Sample size required</dt>
                <dd className="mt-1 font-semibold text-ink-900">{svc.sample_size}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <RequestQuoteButton subject={svc.name} kind="test" />
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
          <div className="rounded-3xl border border-cream-300 bg-cream-100 p-10 flex items-center justify-center text-butter-700">
            <Icon name={svc.category_icon || "microscope"} size={64} />
          </div>
        )}
      </div>

      {html ? (
        <article
          className="prose prose-ink mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      <section className="mt-14" id="faqs">
        <FaqAccordion
          faqs={faqs}
          heading={testFaqs.length > 0 ? `FAQs about ${svc.name}` : `${svc.category_name} FAQs`}
        />
      </section>

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
        <CtaBanner subject={svc.name} kind="test" />
      </div>
    </div>
  );
}