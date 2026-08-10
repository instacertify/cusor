import Icon from "./Icon";

/** Shared success state for every contact / quote / book-a-test form submission. */
export default function ContactThankYou({
  intent,
  compact = false,
}: {
  intent?: string;
  compact?: boolean;
} = {}) {
  const isTestingLead =
    intent === "test" || intent === "book" || intent === "consulting";

  return (
    <div
      className={`text-center px-2 ${compact ? "py-6" : "py-12 sm:py-14"}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`inline-flex rounded-full bg-green-100 text-green-700 items-center justify-center ${
          compact ? "w-12 h-12" : "w-16 h-16"
        }`}
      >
        <Icon name="check" size={compact ? 24 : 32} strokeWidth={2.5} />
      </span>
      <h2
        className={`font-display font-bold text-ink-950 mt-4 ${
          compact ? "text-xl" : "text-2xl sm:text-3xl"
        }`}
      >
        {isTestingLead ? "We have received your request" : "Thank you!"}
      </h2>
      <p className="text-ink-800 mt-3 text-base sm:text-lg font-medium leading-relaxed max-w-lg mx-auto">
        {isTestingLead
          ? "Someone from our team will update you within 24 working hours."
          : "Someone from our team will connect with you within 24 hours."}
      </p>
      <p className="text-ink-500 mt-3 text-sm max-w-md mx-auto">
        {isTestingLead
          ? "Your testing / consulting lead is saved. We’ll review the scope and share next steps — no spam, only a real reply."
          : "We’ll review your request and get back with next steps — no spam, only a real reply."}
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="/testing"
          className="inline-flex items-center justify-center min-h-11 rounded-xl bg-butter-500 hover:bg-butter-400 px-5 text-sm font-semibold text-ink-950 transition"
        >
          Browse testing solutions
        </a>
        <a
          href="/"
          className="inline-flex items-center justify-center min-h-11 rounded-xl border border-cream-300 px-5 text-sm font-semibold text-ink-800 hover:border-butter-500 transition"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
