import Link from "next/link";
import { getSettings } from "@/lib/db";

export default function CtaBanner() {
  const settings = getSettings();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 text-cream-50 px-8 py-12 sm:px-14">
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl font-semibold">{settings.cta_heading}</h2>
          <p className="mt-3 text-ink-300 leading-relaxed">{settings.cta_text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/guide"
              className="border border-ink-600 hover:border-butter-500 text-cream-50 font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
