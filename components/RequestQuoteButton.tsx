import Icon from "./Icon";

export type QuoteKind = "test" | "certification" | "product" | "general" | "book";

export function quoteContactHref(subject: string, kind: QuoteKind = "general"): string {
  const label =
    kind === "book"
      ? `${subject} — book a test`
      : kind === "test"
        ? `${subject} — request quote for this test`
        : kind === "certification"
          ? `${subject} — request quote for this certification`
          : kind === "product"
            ? `${subject} — request quote`
            : subject;
  const params = new URLSearchParams();
  if (label.trim()) params.set("product", label.trim());
  if (kind !== "general") params.set("intent", kind);
  const qs = params.toString();
  return qs ? `/contact?${qs}` : "/contact";
}

export function quoteLabel(kind: QuoteKind, short = false): string {
  if (kind === "book") return short ? "Book a test" : "Book a test";
  if (kind === "test") return short ? "Request quote" : "Request a quote for this test";
  if (kind === "certification") {
    return short ? "Request quote" : "Request a quote for this certification";
  }
  if (kind === "product") return short ? "Request quote" : "Request a quote for this product";
  return short ? "Request quote" : "Request a free quote";
}

/**
 * Plain <a> (not next/link) so Get Expert Help / quote CTAs do a full navigation.
 * Avoids broken soft RSC navigations on flaky hosts.
 */
export default function RequestQuoteButton({
  subject,
  kind = "general",
  variant = "primary",
  short = false,
  className = "",
}: {
  subject: string;
  kind?: QuoteKind;
  variant?: "primary" | "secondary" | "link" | "compact";
  short?: boolean;
  className?: string;
}) {
  const href = quoteContactHref(subject, kind);
  const label = quoteLabel(kind, short);

  if (variant === "link" || variant === "compact") {
    return (
      <a
        href={href}
        className={`inline-flex items-center gap-1 font-bold text-butter-700 hover:text-butter-600 transition ${
          variant === "compact" ? "text-xs" : "text-sm"
        } ${className}`}
      >
        {label}
        <Icon name="arrow-right" size={variant === "compact" ? 12 : 14} />
      </a>
    );
  }

  if (variant === "secondary") {
    return (
      <a
        href={href}
        className={`inline-flex items-center justify-center gap-2 min-h-11 border border-cream-300 bg-white hover:border-butter-500 text-ink-900 font-semibold rounded-xl px-5 py-3 text-sm transition ${className}`}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 min-h-11 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition ${className}`}
    >
      {label} <Icon name="arrow-right" size={16} />
    </a>
  );
}
