import Link from "next/link";
import {
  GMA_SCOPING_STEPS,
  GMA_SHORTCUTS,
  HORIZONTAL_REGIMES,
  PILLAR_LABELS,
} from "@/lib/gma-regions";

const GMA_STEPS: [string, string][] = [
  ["Regulatory determination", "Which schemes bite for this product + this market"],
  ["Testing", "To the correct national/international standard, in a recognised lab"],
  ["Local representation", "In-country AR / importer of record / local rep"],
  ["Filing & follow-up", "Application, audit if required, licence grant, mark usage"],
];

/** Global Market Access framework — embedded on /certifications. */
export default function GmaFrameworkSection({
  showBrowseCta = true,
}: {
  showBrowseCta?: boolean;
} = {}) {
  return (
    <section
      id="global-market-access"
      className="scroll-mt-24"
      aria-labelledby="gma-heading"
    >
      <div className="max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          Global Market Access
        </p>
        <h2
          id="gma-heading"
          className="mt-2 font-display text-3xl font-semibold text-ink-950 tracking-tight"
        >
          How GMA works
        </h2>
        <p className="mt-3 text-ink-600 leading-relaxed">
          Global Market Access is determining which regulations apply in each destination
          market and managing product compliance against them. Because standards are not fully
          harmonised worldwide, a product legal in the EU can still be blocked in Saudi Arabia
          or India — so GMA work follows four repeatable steps.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {GMA_STEPS.map(([title, text], i) => (
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

        <div className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-ink-950">
            The four pillars (+ local formalities)
          </h3>
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
        </div>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-ink-950">
            Horizontal regimes
          </h3>
          <p className="mt-2 text-sm text-ink-600">
            These apply irrespective of product-specific approval — and are usually what gets
            missed in a scoping call.
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
                {"evidence" in r && r.evidence ? (
                  <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                    <span className="font-semibold text-ink-900">Typical evidence: </span>
                    {r.evidence}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-ink-950">
            Multi-market shortcuts
          </h3>
          <p className="mt-2 text-sm text-ink-600 leading-relaxed">
            Routes that let one test campaign serve several markets — the difference between
            selling a certificate and selling market access.
          </p>
          <ul className="mt-6 space-y-4">
            {GMA_SHORTCUTS.map((s) => (
              <li key={s.name} className="border-l-2 border-butter-500 pl-4">
                <p className="font-semibold text-ink-950">{s.name}</p>
                {"markets" in s && s.markets ? (
                  <p className="mt-1 text-xs font-semibold text-ink-500">{s.markets}</p>
                ) : null}
                <p className="mt-1 text-sm text-ink-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-ink-950">
            How to use this in a scoping call
          </h3>
          <ol className="mt-6 space-y-3 list-decimal list-inside text-ink-700">
            {GMA_SCOPING_STEPS.map((step) => (
              <li key={step} className="leading-relaxed pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-8 text-sm text-ink-500 leading-relaxed">
          Scheme names and product scopes change frequently — verify against the regulator’s
          current list before quoting. Product classification drives everything: one HS code can
          pull safety + wireless + energy in the same market.
        </p>

        {showBrowseCta ? (
          <div className="mt-6">
            <Link
              href="/certifications/countries"
              className="inline-flex min-h-11 items-center rounded-xl bg-ink-950 px-6 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
            >
              Browse all countries →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
