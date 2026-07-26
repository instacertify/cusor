import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import CertProductCatalog from "@/components/CertProductCatalog";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { getCertificationBySlug, getCertifications, getFaqs, getCertProducts } from "@/lib/queries";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);
  if (!cert) return {};
  return buildMetadata(`cert:${cert.id}`, {
    title: cert.meta_title || `${cert.name} Certification`,
    description: cert.meta_description || cert.summary,
    path: `/certifications/${cert.slug}`,
    image: cert.image,
  });
}

export default async function CertificationPage({ params }: Props) {
  const { slug } = await params;
  const cert = getCertificationBySlug(slug);
  if (!cert) notFound();
  const faqs = getFaqs(`cert:${cert.slug}`);
  const others = getCertifications().filter((c) => c.slug !== cert.slug);
  const catalog = getCertProducts(cert.id);

  const jsonLd = buildJsonLd(enabledSchemaTypes(`cert:${cert.id}`, "cert"), {
    name: `${cert.name} Certification Support`,
    description: cert.summary,
    url: `${BASE_URL}/certifications/${cert.slug}`,
    image: cert.image,
    faqs,
    areaServed: cert.region,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Certifications", url: "/certifications" },
      { name: cert.name },
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
        crumbs={[{ label: "Certifications", href: "/certifications" }, { label: cert.name }]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
              {cert.region}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-butter-300/40 text-butter-700 flex items-center justify-center shrink-0">
              <Icon name={cert.icon} size={34} />
            </span>
            <div>
              <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
                {cert.name}
              </h1>
              <p className="text-sm font-semibold text-ink-500 mt-1">{cert.full_name}</p>
            </div>
          </div>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">{cert.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <RequestQuoteButton subject={cert.name} kind="certification" />
            {catalog.length > 0 && (
              <a
                href="#products-covered"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-bold text-ink-800 hover:border-butter-500 hover:text-butter-700 transition"
              >
                Products covered ({catalog.length}) ↓
              </a>
            )}
          </div>
        </div>
        {cert.image ? (
          <Image
            src={cert.image}
            alt={`${cert.full_name}`}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      <article
        className="prose-certko mt-10 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: marked.parse(cert.content) as string }}
      />

      {catalog.length > 0 && (
        <>
          <CertProductCatalog
            items={catalog}
            certSlug={cert.slug}
            certName={cert.name}
            title={`Products covered under ${cert.name}`}
            subtitle={
              cert.slug === "bee"
                ? `Full list of BEE star labelling product options — Mandatory and Voluntary. Filter by regime or search by product / standard, then open any row for star tables and guidance.`
                : `Full list of product options covered under ${cert.full_name || cert.name}. Grouped by regime where available; open any row for standards, testing costs and guidance.`
            }
          />
          {cert.slug === "g-mark" && (
            <p className="mt-4 text-sm text-ink-600">
              <a
                href="/legal/gmark-product-categories.pdf"
                className="font-semibold text-butter-700 hover:text-butter-800 underline underline-offset-4"
              >
                Download GMARK categories &amp; standards matrix (PDF)
              </a>
            </p>
          )}
          {cert.slug === "bee" && (
            <p className="mt-4 text-sm text-ink-600">
              <a
                href="/legal/bee-star-label-master-data-2026.pdf"
                className="font-semibold text-butter-700 hover:text-butter-800 underline underline-offset-4"
              >
                Download BEE Star Label master data 2026 (PDF)
              </a>
            </p>
          )}
        </>
      )}

      {faqs.length > 0 && (
        <div className="mt-14 max-w-3xl">
          <FaqAccordion faqs={faqs} heading={`${cert.name} FAQs`} />
        </div>
      )}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-6">Other Certifications</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {others.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-4 flex flex-col gap-2"
            >
              <Link href={`/certifications/${c.slug}`} className="group flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-cream-100 text-ink-700 flex items-center justify-center shrink-0 group-hover:bg-butter-300/40 group-hover:text-butter-700 transition">
                  <Icon name={c.icon} size={19} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink-950 group-hover:text-butter-700 transition">{c.name}</span>
                  <span className="block text-[11px] text-ink-500">{c.region}</span>
                </span>
              </Link>
              <RequestQuoteButton subject={c.name} kind="certification" variant="compact" short />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <CtaBanner subject={cert.name} kind="certification" />
      </div>
    </div>
  );
}
