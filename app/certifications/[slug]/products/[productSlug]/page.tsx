import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { getCertificationBySlug, getCertProductBySlug } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const product = getCertProductBySlug(slug, productSlug);
  const cert = getCertificationBySlug(slug);
  if (!product || !cert) return {};
  return buildMetadata(`certprod:${product.id}`, {
    title: `${product.name} | ${cert.name} Certification`,
    description: product.summary || `${product.name} under ${cert.name} — standards, testing and compliance guidance.`,
    path: `/certifications/${slug}/products/${productSlug}`,
    image: product.image || cert.image,
  });
}

export default async function CertProductPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const cert = getCertificationBySlug(slug);
  const product = getCertProductBySlug(slug, productSlug);
  if (!cert || !product) notFound();

  let extras: Record<string, string> = {};
  try {
    extras = JSON.parse(product.extras || "{}") as Record<string, string>;
  } catch {
    extras = {};
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <Breadcrumbs
        crumbs={[
          { label: "Certifications", href: "/certifications" },
          { label: cert.name, href: `/certifications/${cert.slug}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-3xl">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide bg-butter-300/50 text-butter-800 rounded-full px-3 py-1">
            {cert.name}
          </span>
          {product.regime && (
            <span className="text-xs font-semibold uppercase tracking-wide bg-cream-200 text-ink-700 rounded-full px-3 py-1">
              {product.regime}
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
          {product.name}
        </h1>
        {product.summary && (
          <p className="mt-4 text-base sm:text-lg text-ink-600 leading-relaxed">{product.summary}</p>
        )}

        <dl className="mt-8 grid sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-cream-300 p-4">
            <dt className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">Standards</dt>
            <dd className="mt-1 text-sm font-mono text-ink-900">{product.standards || "—"}</dd>
          </div>
          <div className="bg-white rounded-2xl border border-cream-300 p-4">
            <dt className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">Indicative testing</dt>
            <dd className="mt-1 text-sm font-semibold text-ink-900">
              {formatPriceRange(product.min_price, product.max_price)}
            </dd>
          </div>
          {product.family && (
            <div className="bg-white rounded-2xl border border-cream-300 p-4">
              <dt className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">Family</dt>
              <dd className="mt-1 text-sm text-ink-900">{product.family}</dd>
            </div>
          )}
          {extras.star_table && (
            <div className="bg-white rounded-2xl border border-cream-300 p-4">
              <dt className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">Star table</dt>
              <dd className="mt-1 text-sm text-ink-900">{extras.star_table}</dd>
            </div>
          )}
          {extras.emc && (
            <div className="bg-white rounded-2xl border border-cream-300 p-4">
              <dt className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold">EMC / IECEE / GSO NB</dt>
              <dd className="mt-1 text-sm text-ink-900">
                EMC {extras.emc} · IECEE {extras.iecee} · GSO NB {extras.gso_nb}
              </dd>
            </div>
          )}
        </dl>

        {product.labs && (
          <div className="mt-6 bg-cream-100 rounded-2xl border border-cream-200 p-5">
            <h2 className="font-display font-semibold text-ink-950">Indicative labs</h2>
            <p className="mt-2 text-sm text-ink-700 leading-relaxed">{product.labs}</p>
          </div>
        )}
        {product.fee_note && (
          <p className="mt-4 text-sm text-ink-600">
            <span className="font-semibold text-ink-800">Fee note:</span> {product.fee_note}
          </p>
        )}

        {product.content && (
          <article
            className="prose-certko mt-10"
            dangerouslySetInnerHTML={{ __html: marked.parse(product.content) as string }}
          />
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <RequestQuoteButton
            subject={`${product.name} — ${cert.name}`}
            kind="certification"
          />
          <Link
            href={`/certifications/${cert.slug}`}
            className="inline-flex items-center justify-center min-h-11 border border-cream-300 bg-white text-ink-900 font-semibold rounded-xl px-6 py-3 text-sm transition"
          >
            Back to {cert.name}
          </Link>
        </div>
      </div>

      <div className="mt-14">
        <CtaBanner subject={`${product.name} — ${cert.name}`} kind="certification" />
      </div>
    </div>
  );
}
