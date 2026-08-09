import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { MarketBadge } from "@/components/MarketApplicability";
import { getCertifications, getCertificationCoveredProducts } from "@/lib/queries";
import { groupCertificationsByMarket } from "@/lib/market-applicability";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Certifications by Market | BIS, CE, FCC, GMARK, SABER, BEE, WPC",
  description:
    "Explore Certko certifications organised by where they are required — India (BIS, BEE, WPC), European Union (CE), United States (FCC), GCC (GMARK) and Saudi Arabia (SABER).",
  alternates: { canonical: "https://certko.com/certifications" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function CertificationsPage() {
  const certs = getCertifications().map((c) => {
    const products = getCertificationCoveredProducts(c);
    const regimes = [...new Set(products.map((p) => p.regime).filter(Boolean))];
    return { ...c, productCount: products.length, regimes };
  });
  const marketGroups = groupCertificationsByMarket(certs);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Certifications" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Certifications by market
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Organised by where each scheme is required or accepted — India, the European Union,
        the United States, GCC countries and Saudi Arabia — so you can see which mark unlocks
        which market before you test or file.
      </p>

      <div className="mt-10 space-y-12">
        {marketGroups.map(({ market, certs: groupCerts }) => (
          <section key={market.id} id={market.id} aria-labelledby={`market-${market.id}`}>
            <div className="mb-5 max-w-2xl">
              <h2
                id={`market-${market.id}`}
                className="font-display text-2xl font-semibold text-ink-950"
              >
                {market.heading}
              </h2>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{market.blurb}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupCerts.map((c) => (
                <div
                  key={c.id}
                  className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
                >
                  <Link href={`/certifications/${c.slug}`} className="flex flex-col gap-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <IconChip name={c.icon} size={26} chip="xl" />
                      <MarketBadge slug={c.slug} region={c.region} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
                      {c.name}
                    </h3>
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
          </section>
        ))}
      </div>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
