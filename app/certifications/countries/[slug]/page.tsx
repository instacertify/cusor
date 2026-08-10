import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { MarketBadge } from "@/components/MarketApplicability";
import {
  countryHubPath,
  getCountryHubBySlug,
  getCountryHubs,
} from "@/lib/country-certifications";
import { PILLAR_LABELS, gmaRegionLabel } from "@/lib/gma-regions";
import { getCertificationBySlug, getFaqs } from "@/lib/queries";
import { ensureDbReady } from "@/lib/db";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCountryHubs().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getCountryHubBySlug(slug);
  if (!hub) return {};
  return buildMetadata(`country:${hub.slug}`, {
    title: hub.metaTitle,
    description: hub.metaDescription,
    path: countryHubPath(hub.slug),
  });
}

export default async function CountryCertificationPage({ params }: Props) {
  const { slug } = await params;
  const hub = getCountryHubBySlug(slug);
  if (!hub) notFound();

  await ensureDbReady();

  const schemeRows = hub.schemes.map((scheme) => {
    const cert = getCertificationBySlug(scheme.certSlug);
    return { scheme, cert };
  });

  const otherCountries = getCountryHubs().filter((h) => h.slug !== hub.slug);
  const faqs = getFaqs(`country:${hub.slug}`);

  const jsonLd = buildJsonLd(enabledSchemaTypes(`country:${hub.slug}`, "page"), {
    name: `${hub.name} product certifications`,
    description: hub.metaDescription,
    url: `${BASE_URL}${countryHubPath(hub.slug)}`,
    faqs: faqs.map(({ question, answer }) => ({ question, answer })),
    areaServed: hub.name,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Certifications", url: "/certifications" },
      { name: "By country", url: "/certifications/countries" },
      { name: hub.name },
    ],
  });

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}

        <Breadcrumbs
          crumbs={[
            { label: "Certifications", href: "/certifications" },
            { label: "By country", href: "/certifications/countries" },
            { label: hub.name },
          ]}
        />

        {/* Narrative column — shared left/right edge through FAQ */}
        <div className="max-w-4xl">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              {gmaRegionLabel(hub.region)} · Country-wise certifications
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink-950 tracking-tight">
              {hub.name}
            </h1>
            <p className="mt-3 text-lg text-ink-600 leading-relaxed">{hub.intro}</p>
          </header>

          {(hub.pillars.safety ||
            hub.pillars.emcWireless ||
            hub.pillars.telecom ||
            hub.pillars.energyEnv ||
            hub.pillars.localRep) && (
            <section className="mt-10" aria-labelledby="pillars">
              <h2 id="pillars" className="font-display text-2xl font-semibold text-ink-950">
                Compliance matrix
              </h2>
              <p className="mt-2 text-sm text-ink-600">
                Four GMA pillars for this market, plus local representation — verify against the
                live regulator list before quoting.
              </p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {PILLAR_LABELS.map((p) => {
                  const value = hub.pillars[p.key];
                  if (!value) return null;
                  const spanFull =
                    p.key === "localRep" &&
                    PILLAR_LABELS.filter((x) => hub.pillars[x.key]).length % 2 === 1;
                  return (
                    <div
                      key={p.key}
                      className={`rounded-2xl border border-cream-300 bg-white px-5 py-4${
                        spanFull ? " sm:col-span-2" : ""
                      }`}
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                        {p.label}
                      </dt>
                      <dd className="mt-2 text-sm text-ink-700 leading-relaxed">{value}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          )}

          <section className="mt-10 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Regulatory landscape
            </h2>
            <p className="text-ink-700 leading-relaxed">{hub.overview}</p>
            <p className="text-ink-700 leading-relaxed">{hub.authority}</p>
            <p className="rounded-2xl border border-cream-300 bg-cream-100/80 px-4 py-3 text-sm text-ink-700 leading-relaxed">
              <span className="font-semibold text-ink-900">Filing tip: </span>
              {hub.filingTip}
            </p>
          </section>

          <section className="mt-12" aria-labelledby="first-checks">
            <h2 id="first-checks" className="font-display text-2xl font-semibold text-ink-950">
              Check these first
            </h2>
            <ol className="mt-4 space-y-3 list-decimal list-inside text-ink-700">
              {hub.firstChecks.map((item) => (
                <li key={item} className="leading-relaxed pl-1">
                  {item}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-14" aria-labelledby="schemes">
          <div className="max-w-4xl">
            <h2 id="schemes" className="font-display text-2xl font-semibold text-ink-950">
              Certifications for {hub.shortName}
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Each scheme below has unique guidance for this market. Open the full Certko
              certification page for catalogues, process detail and quotes.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {schemeRows.map(({ scheme, cert }) => (
              <article
                key={scheme.id ?? `${scheme.certSlug}-${scheme.name}`}
                id={scheme.certSlug || undefined}
                className="rounded-3xl border border-cream-300 bg-white p-6 sm:p-8 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {cert ? <IconChip name={cert.icon} size={26} chip="xl" /> : null}
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl font-semibold text-ink-950">
                        {scheme.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-ink-500">{scheme.role}</p>
                    </div>
                  </div>
                  {cert ? <MarketBadge slug={cert.slug} region={cert.region} /> : null}
                </div>

                <p className="mt-4 text-ink-700 leading-relaxed max-w-3xl">{scheme.summary}</p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                      Who typically needs it
                    </h4>
                    <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                      {scheme.whoNeedsIt}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                      Example products
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                      {scheme.examples.map((ex) => (
                        <li key={ex} className="flex gap-2">
                          <span className="text-butter-700" aria-hidden>
                            ·
                          </span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-cream-200 pt-5">
                  {cert ? (
                    <Link
                      href={`/certifications/${cert.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
                    >
                      Open {cert.name} page
                      <Icon name="arrow-right" size={15} />
                    </Link>
                  ) : null}
                  <RequestQuoteButton
                    subject={`${scheme.name} · ${hub.name}`}
                    kind="certification"
                    variant="compact"
                    short
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {faqs.length > 0 ? (
          <div className="mt-14 max-w-4xl">
            <FaqAccordion faqs={faqs} heading={`${hub.name} certification FAQs`} />
          </div>
        ) : null}

        <section className="mt-14 max-w-4xl">
          <h2 className="font-display text-xl font-semibold text-ink-950">
            Other countries
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {otherCountries.map((c) => (
              <li key={c.slug}>
                <Link
                  href={countryHubPath(c.slug)}
                  className="inline-flex min-h-10 items-center rounded-xl border border-cream-300 bg-cream-50 px-3.5 text-sm font-semibold text-ink-800 hover:border-butter-500 hover:text-butter-800 transition"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/certifications/countries"
                className="inline-flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold text-butter-700 hover:underline"
              >
                All countries →
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </>
  );
}
