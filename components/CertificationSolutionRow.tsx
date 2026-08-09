import Link from "next/link";
import IconChip from "@/components/IconChip";
import {
  CERTIFICATION_SOLUTIONS,
  type CertificationSolutionChip,
} from "@/lib/certification-solutions";

/**
 * Certification solution paths so users can open the right mark for their product.
 * Uses existing URLs only.
 */
export default function CertificationSolutionRow({
  heading = "Certification solutions",
  prompt = "Match your product to the right mark — start below, then search by product name or HSN.",
  chips = CERTIFICATION_SOLUTIONS,
  className = "",
  showSearchCta = true,
}: {
  heading?: string;
  prompt?: string;
  chips?: CertificationSolutionChip[];
  className?: string;
  showSearchCta?: boolean;
} = {}) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-cream-300 bg-white shadow-card p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-700">
            Choose a path
          </p>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-950 mt-1">
            {heading}
          </h2>
          <p className="mt-1.5 text-sm text-ink-600 leading-relaxed max-w-2xl">{prompt}</p>
        </div>
        {showSearchCta ? (
          <Link
            href="/products/all"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
          >
            Search by product / HSN
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 sm:mt-5 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {chips.map((chip) => (
          <li key={chip.id}>
            <Link
              href={chip.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-3.5 hover:border-butter-500 hover:bg-white transition"
            >
              <span className="flex items-center gap-2.5">
                <IconChip name={chip.icon} size={18} chip="sm" tone="neutral" />
                <span className="font-semibold text-sm text-ink-950 group-hover:text-butter-700 transition leading-snug">
                  {chip.label}
                </span>
              </span>
              <span className="text-xs text-ink-600 leading-relaxed line-clamp-3">
                {chip.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
