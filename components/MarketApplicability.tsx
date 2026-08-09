import {
  STANDARD_FAMILIES,
  certMarketLabel,
  getCertApplicability,
  roleLabel,
  standardApplicabilityChips,
} from "@/lib/market-applicability";

/** Compact market badge for cards / heroes. */
export function MarketBadge({
  slug,
  region,
  className = "",
}: {
  slug: string;
  region?: string | null;
  className?: string;
}) {
  const app = getCertApplicability(slug);
  const market = certMarketLabel(slug, region || undefined);
  const prefix = app ? roleLabel(app.role) : "Market";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-cream-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-800 ${className}`}
    >
      <span className="text-ink-500 normal-case tracking-normal font-semibold mr-1.5">
        {prefix}
      </span>
      {market}
    </span>
  );
}

/** Detail-page insight: where this certification is required / accepted. */
export function CertMarketInsight({
  slug,
  region,
}: {
  slug: string;
  region?: string | null;
}) {
  const app = getCertApplicability(slug);
  const market = certMarketLabel(slug, region || undefined);
  if (!app) {
    return (
      <aside className="mt-6 rounded-2xl border border-cream-300 bg-cream-50 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-butter-700">
          Where it applies
        </p>
        <p className="mt-1 font-display text-base font-semibold text-ink-950">{market}</p>
      </aside>
    );
  }

  return (
    <aside className="mt-6 rounded-2xl border border-cream-300 bg-cream-50 px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-butter-700">
        Where it is required
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-ink-950">{market}</p>
      <p className="mt-2 text-sm text-ink-700 leading-relaxed">{app.insight}</p>
      {app.alsoAcceptedIn && app.alsoAcceptedIn.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {app.alsoAcceptedIn.map((note) => (
            <li key={note} className="text-sm text-ink-600 leading-relaxed flex gap-2">
              <span className="text-butter-600 font-bold shrink-0" aria-hidden>
                ·
              </span>
              <span>
                <span className="font-semibold text-ink-800">Also useful: </span>
                {note}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

/** Chips showing IS · India / IEC · Global from a standards string. */
export function StandardApplicabilityChips({
  standards,
  className = "",
}: {
  standards: string;
  className?: string;
}) {
  const chips = standardApplicabilityChips(standards);
  if (chips.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center rounded-lg border border-cream-300 bg-cream-50 px-2 py-0.5 text-[11px] font-semibold text-ink-800"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

/** Testing index insight: IS for India, IEC for global. */
export function TestingStandardFamiliesPanel() {
  const items = STANDARD_FAMILIES.filter((f) => f.id === "is" || f.id === "iec");

  return (
    <section className="mt-10 rounded-2xl sm:rounded-3xl border border-cream-300 bg-white p-5 sm:p-7 shadow-card">
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-950">
        Where test standards are accepted
      </h2>
      <p className="mt-2 text-sm text-ink-600 max-w-2xl leading-relaxed">
        The standard on a test report decides which market will accept the evidence. Use this as a quick guide before you book a lab.
      </p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {items.map((family) => (
          <div
            key={family.id}
            className="rounded-2xl border border-cream-200 bg-cream-50 px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-butter-700">
              Accepted in · {family.where}
            </p>
            <p className="mt-1 font-display text-base font-semibold text-ink-950">
              {family.label}
            </p>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">{family.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
