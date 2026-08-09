import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import {
  GMA_SHORTCUTS,
  HORIZONTAL_REGIMES,
  PILLAR_LABELS,
} from "@/lib/gma-regions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global Market Access Framework | Certko",
  description:
    "GMA in four steps — regulatory determination, testing, local representation and filing — plus the compliance pillars and horizontal regimes that cut across markets.",
  alternates: { canonical: "https://certko.com/certifications/global-market-access" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function GlobalMarketAccessPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Breadcrumbs
          crumbs={[
            { label: "Certifications", href: "/certifications" },
            { label: "By country", href: "/certifications/countries" },
            { label: "GMA framework" },
          ]}
        />

        {/* Single reading column so title, steps, pillars and CTAs share one right edge */}
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
            Global Market Access
          </h1>
          <p className="mt-4 text-lg text-ink-600 leading-relaxed">
            Global Market Access is determining which regulations apply in each destination
            market and managing product compliance against them. Because standards are not
            fully harmonised worldwide, a product legal in the EU can still be blocked in
            Saudi Arabia or India — so GMA work follows four repeatable steps.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["Regulatory determination", "Which schemes bite for this product + this market"],
              ["Testing", "To the correct national/international standard, in a recognised lab"],
              ["Local representation", "In-country AR / importer of record / local rep"],
              ["Filing & follow-up", "Application, audit if required, licence grant, mark usage"],
            ].map(([title, text], i) => (
              <li
                key={title}
                className="rounded-2xl border border-cream-300 bg-white px-5 py-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Step {i + 1}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-950">{title}</p>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              The four pillars (+ local formalities)
            </h2>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              Apply this grid to any market. A fifth practical pillar — import/labelling
              formalities — is what often stops shipments in Africa, the GCC and India.
            </p>
            <dl className="mt-6 space-y-4">
              {PILLAR_LABELS.map((p) => (
                <div
                  key={p.key}
                  className="rounded-2xl border border-cream-300 bg-cream-50 px-5 py-4"
                >
                  <dt className="font-semibold text-ink-950">{p.label}</dt>
                  <dd className="mt-1 text-sm text-ink-600 leading-relaxed">
                    {p.key === "safety" &&
                      "LVD-type safety, mechanical safety, toys, PPE — mains-powered or hazard-bearing products."}
                    {p.key === "emcWireless" &&
                      "Emissions, immunity, RF spectrum, SAR — electronics and anything with Wi-Fi / BT / cellular / NFC."}
                    {p.key === "telecom" &&
                      "Public network interfaces, IMEI/TAC — modems, routers, handsets, IoT with SIM."}
                    {p.key === "energyEnv" &&
                      "MEPS, energy labels, RoHS, WEEE/EPR, chemicals — appliances, lighting, electronics, packaging."}
                    {p.key === "localRep" &&
                      "Near-universal requirement; legal form differs (AR, importer of record, licence holder)."}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Horizontal regimes
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              These cut across markets and often travel with the same product file.
            </p>
            <ul className="mt-6 space-y-4">
              {HORIZONTAL_REGIMES.map((r) => (
                <li
                  key={r.name}
                  className="rounded-2xl border border-cream-300 bg-white px-5 py-4"
                >
                  <p className="font-display text-lg font-semibold text-ink-950">{r.name}</p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">{r.where}</p>
                  <p className="mt-2 text-sm text-ink-600 leading-relaxed">{r.demands}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Shortcuts that reduce cost
            </h2>
            <ul className="mt-6 space-y-4">
              {GMA_SHORTCUTS.map((s) => (
                <li key={s.name} className="border-l-2 border-butter-500 pl-4">
                  <p className="font-semibold text-ink-950">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-10 text-sm text-ink-500 leading-relaxed">
            Scheme names and product scopes change frequently — verify against the regulator’s
            current list before quoting. Product classification drives everything: one HS code
            can pull safety + wireless + energy in the same market.
          </p>

          <div className="mt-8">
            <Link
              href="/certifications/countries"
              className="inline-flex min-h-11 items-center rounded-xl bg-ink-950 px-6 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
            >
              Browse countries →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </>
  );
}
