import Link from "next/link";
import Icon from "@/components/Icon";

/** Shared destination-market tile used on home, countries browse, and search. */
export default function MarketCard({
  href,
  title,
  eyebrow,
  schemesLine,
  cta = "Open guide",
  compact = false,
}: {
  href: string;
  title: string;
  eyebrow?: string;
  schemesLine?: string;
  cta?: string;
  /** Homepage horizontal/featured row */
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full min-h-[9.5rem] flex-col rounded-2xl border border-cream-300 bg-white p-5 transition hover:border-butter-500 hover:bg-cream-50 ${
        compact ? "sm:min-h-[8.75rem]" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            {eyebrow}
          </p>
        ) : null}
        <h3
          className={`font-display font-semibold text-ink-950 group-hover:text-butter-700 transition leading-snug ${
            eyebrow ? "mt-2 text-lg" : "text-lg"
          }`}
        >
          {title}
        </h3>
        {schemesLine ? (
          <p className="mt-2 text-xs font-medium text-ink-500 leading-relaxed line-clamp-2">
            {schemesLine}
          </p>
        ) : null}
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-butter-700">
        {cta}
        <Icon name="arrow-right" size={15} />
      </span>
    </Link>
  );
}
