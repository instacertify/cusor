import Link from "next/link";
import { getSettings } from "@/lib/db";

export default function CtaBanner() {
  const settings = getSettings();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-800 text-white px-8 py-12 sm:px-14 shadow-card-hover">
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-butter-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl font-bold">{settings.cta_heading}</h2>
          <p className="mt-3 text-ink-300 leading-relaxed">{settings.cta_text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="bg-butter-500 hover:bg-butter-400 text-ink-950 font-bold rounded-xl px-6 py-3 text-sm transition shadow-butter"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/guide"
              className="border border-ink-600 hover:border-ink-400 text-white font-semibold rounded-xl px-6 py-3 text-sm transition"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
