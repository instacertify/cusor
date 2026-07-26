import type { Faq } from "@/lib/db";

export default function FaqAccordion({
  faqs,
  heading = "Frequently Asked Questions",
}: {
  faqs: Faq[];
  heading?: string;
}) {
  if (!faqs.length) return null;
  return (
    <section>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 mb-6">
        {heading}
      </h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details
            key={f.id}
            className="group bg-white rounded-2xl border border-cream-300 shadow-card open:shadow-card-hover transition"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-semibold text-ink-950">
              {f.question}
              <span className="shrink-0 w-7 h-7 rounded-full bg-cream-200 group-open:bg-butter-400 flex items-center justify-center text-ink-800 transition group-open:rotate-45">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-ink-700">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
