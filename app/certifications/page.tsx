import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import MarketCard from "@/components/MarketCard";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { MarketBadge } from "@/components/MarketApplicability";
import {
  countryHubPath,
  countryHubSlugForMarket,
  getCountryHubsGroupedByRegion,
} from "@/lib/country-certifications";
import { getCertifications, getCertificationCoveredProducts } from "@/lib/queries";
import { CERT_MARKETS, groupCertificationsByMarket } from "@/lib/market-applicability";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Certifications by Market | BIS, CE, FCC, GMARK, SABER & Country Guides",
  description:
    "Explore Certko certification programmes for India, the EU, the US, GCC and Saudi Arabia — plus country-wise guides for China, Japan, Brazil, Nigeria and 40+ other destination markets.",
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

  /** Hubs already covered by the programme sections above (India, EU, US, GCC, Saudi). */
  const programmeHubSlugs = new Set(
    CERT_MARKETS.map((m) => countryHubSlugForMarket(m.id)).filter(
      (s): s is string => Boolean(s)
    )
  );

  const otherRegions = getCountryHubsGroupedByRegion()
    .map((group) => ({
      ...group,
      hubs: group.hubs.filter((h) => !programmeHubSlugs.has(h.slug)),
    }))
    .filter((group) => group.hubs.length > 0);

  const otherCount = otherRegions.reduce((n, g) => n + g.hubs.length, 0);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Breadcrumbs crumbs={[{ label: "Certifications" }]} />
        <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
          Certifications by market
        </h1>
        <p className="mt-3 text-ink-600 max-w-3xl">
          Full Certko programmes for India, the European Union, the United States, GCC and
          Saudi Arabia — plus country guides for {otherCount} other destination markets
          (China, Japan, Brazil, Nigeria, and more).
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href="#more-markets"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-butter-700 hover:text-butter-600"
          >
            More countries on this page
            <Icon name="arrow-right" size={15} />
          </a>
          <Link
            href="/certifications/countries"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-butter-700"
          >
            Search by country
            <Icon name="arrow-right" size={15} />
          </Link>
          <Link
            href="/certifications/global-market-access"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-butter-700"
          >
            GMA framework
            <Icon name="arrow-right" size={15} />
          </Link>
        </p>

        <div className="mt-10 space-y-12">
          {marketGroups.map(({ market, certs: groupCerts }) => {
            const countrySlug = countryHubSlugForMarket(market.id);
            return (
              <section key={market.id} id={market.id} aria-labelledby={`market-${market.id}`}>
                <div className="mb-5 max-w-2xl">
                  <h2
                    id={`market-${market.id}`}
                    className="font-display text-2xl font-semibold text-ink-950"
                  >
                    {countrySlug ? (
                      <Link
                        href={countryHubPath(countrySlug)}
                        className="hover:text-butter-700 transition"
                      >
                        {market.heading}
                      </Link>
                    ) : (
                      market.heading
                    )}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{market.blurb}</p>
                  {countrySlug ? (
                    <Link
                      href={countryHubPath(countrySlug)}
                      className="mt-2 inline-flex text-xs font-semibold text-butter-700 hover:underline"
                    >
                      {market.heading} country guide →
                    </Link>
                  ) : null}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupCerts.map((c) => (
                    <div
                      key={c.id}
                      className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
                    >
                      <Link
                        href={`/certifications/${c.slug}`}
                        className="flex flex-col gap-3 min-w-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <IconChip name={c.icon} size={26} chip="xl" />
                          <MarketBadge slug={c.slug} region={c.region} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
                          {c.name}
                        </h3>
                        <p className="text-xs font-semibold text-ink-500">{c.full_name}</p>
                        <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">
                          {c.summary}
                        </p>
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
                        <RequestQuoteButton
                          subject={c.name}
                          kind="certification"
                          variant="compact"
                          short
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {otherRegions.length > 0 ? (
          <section id="more-markets" className="mt-16 scroll-mt-24" aria-labelledby="more-markets-heading">
            <div className="max-w-3xl">
              <h2
                id="more-markets-heading"
                className="font-display text-3xl font-semibold text-ink-950 tracking-tight"
              >
                More destination markets
              </h2>
              <p className="mt-3 text-ink-600 leading-relaxed">
                Country-wise certification guides for markets beyond the programmes above —
                open a guide for that market’s schemes (CCC, PSE, ANATEL, SONCAP, and more).
              </p>
            </div>

            <div className="mt-10 space-y-12">
              {otherRegions.map((group) => (
                <div key={group.regionId} aria-labelledby={`region-${group.regionId}`}>
                  <h3
                    id={`region-${group.regionId}`}
                    className="font-display text-xl font-semibold text-ink-950"
                  >
                    {group.regionLabel}
                  </h3>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.hubs.map((hub) => (
                      <li key={hub.slug} className="h-full">
                        <MarketCard
                          href={countryHubPath(hub.slug)}
                          title={hub.shortName}
                          eyebrow={`${hub.schemes.length} scheme${
                            hub.schemes.length === 1 ? "" : "s"
                          }`}
                          schemesLine={hub.schemes.map((s) => s.name).join(" · ")}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm">
              <Link
                href="/certifications/countries"
                className="font-semibold text-butter-700 hover:underline"
              >
                Search and filter all countries →
              </Link>
            </p>
          </section>
        ) : null}
      </div>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </>
  );
}
