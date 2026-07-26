import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { getCertifications, getCertProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Certifications We Cover | BIS, BEE, GMARK, FCC, CE, SABER, WPC",
  description:
    "Explore the product certifications Certko supports: BIS/ISI, BEE star labelling, Gulf GMARK, US FCC, EU CE marking, Saudi SABER and India's WPC ETA — process, costs and expert help.",
};

export default function CertificationsPage() {
  const certs = getCertifications().map((c) => {
    const products = getCertProducts(c.id);
    const regimes = [...new Set(products.map((p) => p.regime).filter(Boolean))];
    return { ...c, productCount: products.length, regimes };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Certifications" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Certifications We Cover
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Selling in India or exporting abroad usually means more than one approval.
        Our experts handle these certification programmes end-to-end — often
        reusing the same test data across schemes to save you time and money.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs.map((c) => (
          <div
            key={c.id}
            className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
          >
            <Link href={`/certifications/${c.slug}`} className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-xl bg-butter-300/40 text-butter-700 flex items-center justify-center">
                  <Icon name={c.icon} size={26} />
                </span>
                <span className="text-xs font-bold bg-cream-200 text-ink-700 rounded-full px-3 py-1">
                  {c.region}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
                {c.name}
              </h2>
              <p className="text-xs font-semibold text-ink-500">{c.full_name}</p>
              <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{c.summary}</p>
              {c.productCount > 0 && (
                <p className="text-xs font-semibold text-ink-700">
                  {c.productCount} products covered
                  {c.regimes.length > 0 ? ` · ${c.regimes.join(" & ")}` : ""}
                </p>
              )}
              <span className="text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
                {c.productCount > 0 ? "See products covered" : "Learn more"}{" "}
                <Icon name="arrow-right" size={15} />
              </span>
            </Link>
            <div className="mt-auto pt-2 border-t border-cream-200">
              <RequestQuoteButton subject={c.name} kind="certification" variant="compact" short />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
