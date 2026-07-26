import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBanner from "@/components/CtaBanner";
import {
  getProductBySlug,
  getLabsForProduct,
  getFaqs,
  getRelatedProducts,
} from "@/lib/queries";
import { formatPriceRange, formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.meta_title || `${product.name} BIS Certification`,
    description: product.meta_description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const labs = getLabsForProduct(product.id);
  const faqs = getFaqs(`product:${product.id}`);
  const related = getRelatedProducts(product, 4);
  const heroImage = product.image || product.category_image || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `BIS Certification for ${product.name}`,
        description: product.meta_description,
        provider: { "@type": "Organization", name: "Certko", url: "https://certko.com" },
        areaServed: "IN",
        ...(product.min_price
          ? {
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "INR",
                lowPrice: product.min_price,
                highPrice: product.max_price ?? product.min_price,
              },
            }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://certko.com" },
          { "@type": "ListItem", position: 2, name: product.category_name, item: `https://certko.com/category/${product.category_slug}` },
          { "@type": "ListItem", position: 3, name: product.name },
        ],
      },
    ],
  };

  const facts = [
    { label: "IS Standard", value: product.standard || "—" },
    { label: "Scheme", value: product.scheme === "CRS" ? "CRS Registration" : "ISI Mark Licence" },
    { label: "HSN Code", value: product.hsn8 || product.hsn4 || "—" },
    { label: "Test Cost Range", value: formatPriceRange(product.min_price, product.max_price) },
    { label: "Approved Labs", value: String(product.lab_count) },
    { label: "Typical Timeline", value: product.timeline },
  ];

  const qcoBadge = product.qco_status
    ? product.qco_status.startsWith("Mandatory")
      ? "bg-red-100 text-red-700"
      : product.qco_status.startsWith("Upcoming") || product.qco_status.startsWith("Notified")
      ? "bg-butter-300/60 text-butter-700"
      : "bg-green-100 text-green-700"
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        crumbs={[
          { label: "Products", href: "/products" },
          { label: product.category_name ?? "", href: `/category/${product.category_slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1 ${
                product.scheme === "CRS"
                  ? "bg-ink-300/30 text-ink-700"
                  : "bg-butter-300/50 text-butter-700"
              }`}
            >
              {product.scheme}
            </span>
            {product.qco_status && (
              <span className={`text-xs font-bold rounded-full px-3 py-1 ${qcoBadge}`}>
                {product.qco_status}
              </span>
            )}
            <span className="text-xs font-semibold text-ink-500">{product.standard}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-950 tracking-tight leading-tight">
            {product.name} — BIS Certification
          </h1>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-white rounded-2xl border border-cream-300 shadow-card px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{f.label}</div>
                <div className="text-sm font-semibold text-ink-950 mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>

          {product.qco_order && (
            <p className="mt-4 bg-cream-100 border border-cream-300 rounded-2xl px-5 py-3.5 text-sm text-ink-700">
              <span className="font-bold text-ink-950">Applicable order:</span> {product.qco_order}
            </p>
          )}

          {product.fee_large != null && (
            <div className="mt-4 bg-white border border-cream-300 rounded-2xl shadow-card p-5">
              <h2 className="text-sm font-bold text-ink-950 mb-3">
                Annual BIS Marking Fee (by unit size)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Large", value: product.fee_large },
                  { label: "Medium", value: product.fee_medium },
                  { label: "Small", value: product.fee_small },
                  { label: "Micro", value: product.fee_micro },
                ].map((f) => (
                  <div key={f.label} className="bg-cream-50 rounded-xl px-3 py-2.5 text-center">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{f.label}</div>
                    <div className="text-sm font-semibold text-ink-950">
                      {f.value != null ? formatINR(f.value) : "—"}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-ink-500">
                {product.unit_info ? `Unit rate basis: ${product.unit_info}. ` : ""}
                Marking fees are indicative, revised by BIS periodically, and exclude GST.
              </p>
            </div>
          )}

          <article
            className="prose-certko mt-8"
            dangerouslySetInnerHTML={{ __html: marked.parse(product.description) as string }}
          />
        </div>

        <aside className="space-y-6">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={`${product.name} — BIS certified product`}
              width={520}
              height={380}
              className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
            />
          ) : null}
          <div className="bg-gradient-to-br from-ink-900 to-ink-800 text-white rounded-3xl p-7 shadow-card-hover">
            <h2 className="font-display text-xl font-bold">Get certified faster</h2>
            <p className="mt-2 text-sm text-ink-300 leading-relaxed">
              Our experts handle the application, coordinate testing for {product.standard || "your standard"} and manage the inspection. Free quote in 24 hours.
            </p>
            <Link
              href={`/contact?product=${encodeURIComponent(product.name)}`}
              className="mt-5 inline-flex bg-butter-500 hover:bg-butter-400 text-ink-950 font-bold rounded-xl px-5 py-2.5 text-sm transition"
            >
              Get a Free Quote
            </Link>
          </div>
        </aside>
      </div>

      {/* Labs */}
      <section className="mt-14">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 mb-2">
          BIS-Recognised Labs for {product.standard || product.name}
        </h2>
        <p className="text-ink-600 text-sm mb-6">
          Indicative test charges reported per laboratory, excluding GST. Confirm final quotes directly with the lab.
        </p>
        <div className="overflow-x-auto bg-white rounded-2xl border border-cream-300 shadow-card">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
                <th className="px-5 py-3.5 font-bold">Laboratory</th>
                <th className="px-5 py-3.5 font-bold">Location</th>
                <th className="px-5 py-3.5 font-bold text-right">Test Price</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/labs/${lab.slug}`} className="font-semibold text-ink-950 hover:text-butter-700">
                      {lab.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink-600">
                    {[lab.city, lab.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-ink-950">
                    {lab.price != null ? formatINR(lab.price) : "On request"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <FaqAccordion faqs={faqs} heading={`${product.name} — FAQs`} />
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-950 mb-6">
            Related Products in {product.category_name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
