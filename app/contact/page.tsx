import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { getPage, getFaqs } from "@/lib/queries";
import { getSettings } from "@/lib/db";
import { submitInquiry } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage("contact");
  return {
    title: page?.meta_title || "Get Expert Help",
    description: page?.meta_description,
  };
}

interface Props {
  searchParams: Promise<{ sent?: string; error?: string; product?: string }>;
}

const PROMISES = [
  { icon: "⚡", title: "24-hour response", text: "A BIS specialist replies with a mapped standard and full cost estimate within one working day." },
  { icon: "🧾", title: "Transparent quotes", text: "Lab charges, government fees and consultant fees itemised separately — no bundled surprises." },
  { icon: "🛠️", title: "End-to-end handling", text: "Application, technical file, lab coordination, factory inspection readiness and licence grant." },
];

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = getPage("contact");
  const settings = getSettings();
  const faqs = getFaqs("page:contact");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Get Expert Help" }]} />
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight leading-tight">
            {page?.hero_heading || "Talk to a BIS expert"}
          </h1>
          <p className="mt-4 text-lg text-ink-600 leading-relaxed">{page?.hero_subheading}</p>
          <div className="mt-8 space-y-5">
            {PROMISES.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="text-2xl shrink-0" aria-hidden>{p.icon}</span>
                <div>
                  <h3 className="font-display font-bold text-ink-950">{p.title}</h3>
                  <p className="text-sm text-ink-600">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-600">
            Prefer email? Write to{" "}
            <a href={`mailto:${settings.contact_email}`} className="font-bold text-butter-700">
              {settings.contact_email}
            </a>{" "}
            or call {settings.contact_phone}.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-cream-300 shadow-card-hover p-8">
          {sp.sent ? (
            <div className="text-center py-14">
              <span className="text-5xl" aria-hidden>✅</span>
              <h2 className="font-display text-2xl font-bold text-ink-950 mt-4">Request received!</h2>
              <p className="text-ink-600 mt-2 text-sm">
                Our team will reply within 24 hours with a mapped standard and a free quote.
              </p>
            </div>
          ) : (
            <form action={submitInquiry} className="space-y-4">
              {sp.error && (
                <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  Please fill in your name and email.
                </p>
              )}
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Your Name *</label>
                <input id="name" name="name" required className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Email *</label>
                  <input id="email" name="email" type="email" required className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Phone</label>
                  <input id="phone" name="phone" className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30" />
                </div>
              </div>
              <div>
                <label htmlFor="product" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Product</label>
                <input
                  id="product"
                  name="product"
                  defaultValue={sp.product ?? ""}
                  placeholder="e.g. LED luminaires, plywood, PVC pipes…"
                  className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Tell us more</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Manufacturing location, import or domestic, timeline…"
                  className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
                />
              </div>
              <button className="w-full bg-butter-500 hover:bg-butter-400 text-ink-950 font-bold rounded-xl px-6 py-3.5 transition shadow-butter">
                Get My Free Quote
              </button>
              <p className="text-[11px] text-ink-500 text-center">
                No spam. Your details are only used to respond to this request.
              </p>
            </form>
          )}
        </div>
      </div>

      <div className="mt-16 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Before You Ask" />
      </div>
    </div>
  );
}
