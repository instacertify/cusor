import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import { getPage, getFaqs } from "@/lib/queries";
import { ensureDbReady, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await ensureDbReady();
  const page = getPage("contact");
  return {
    title: page?.meta_title || "Get Expert Help",
    description: page?.meta_description,
  };
}

interface Props {
  searchParams: Promise<{ sent?: string; error?: string; product?: string; intent?: string }>;
}

const PROMISES = [
  { icon: "zap", title: "24-hour response", text: "A compliance specialist replies with a mapped standard and full cost estimate within one working day." },
  { icon: "clipboard", title: "Transparent quotes", text: "Lab charges, government fees and consultant fees itemised separately — no bundled surprises." },
  { icon: "cog", title: "End-to-end handling", text: "Application, technical file, lab coordination, factory inspection readiness and licence grant." },
];

export default async function ContactPage({ searchParams }: Props) {
  await ensureDbReady();
  const sp = await searchParams;
  const page = getPage("contact");
  const settings = getSettings();
  const faqs = getFaqs("page:contact");
  const errorMessage =
    sp.error === "save"
      ? "We could not save your request just now. Please try again, or email us directly."
      : sp.error
        ? "Please fill in your name and email."
        : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <Breadcrumbs crumbs={[{ label: "Get Expert Help" }]} />
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
            {page?.hero_heading || "Talk to a BIS expert"}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-600 leading-relaxed">
            {page?.hero_subheading ||
              "Tell us about your product and we will map the standard, estimate the full cost and send a free quote within 24 hours."}
          </p>
          <div className="mt-8 space-y-5">
            {PROMISES.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="shrink-0 w-11 h-11 rounded-xl bg-butter-300/40 text-butter-700 flex items-center justify-center">
                  <Icon name={p.icon} size={22} />
                </span>
                <div>
                  <h3 className="font-display font-bold text-ink-950">{p.title}</h3>
                  <p className="text-sm text-ink-600">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3 text-sm text-ink-600">
            {settings.contact_address ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">Our address</p>
                <p className="text-ink-800 font-medium leading-relaxed">{settings.contact_address}</p>
              </div>
            ) : null}
            <p>
              Prefer email? Write to{" "}
              <a href={`mailto:${settings.contact_email}`} className="font-bold text-butter-700">
                {settings.contact_email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${(settings.contact_phone || "").replace(/\s+/g, "")}`} className="font-bold text-butter-700">
                {settings.contact_phone}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-cream-300 shadow-card-hover p-5 sm:p-8">
          {sp.sent ? (
            <div className="text-center py-14">
              <span className="inline-flex w-16 h-16 rounded-full bg-green-100 text-green-700 items-center justify-center">
                <Icon name="check" size={32} strokeWidth={2.5} />
              </span>
              <h2 className="font-display text-2xl font-bold text-ink-950 mt-4">Request received!</h2>
              <p className="text-ink-600 mt-2 text-sm">
                Our team will reply within 24 hours with a mapped standard and a free quote.
              </p>
            </div>
          ) : (
            <form action="/api/contact" method="post" className="space-y-4">
              {errorMessage ? (
                <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {errorMessage}
                </p>
              ) : null}
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Your Name *</label>
                <input id="name" name="name" required autoComplete="name" className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Email *</label>
                  <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Phone</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11" />
                </div>
              </div>
              <div>
                <label htmlFor="product" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                  {sp.intent === "test"
                    ? "Test / service"
                    : sp.intent === "certification"
                    ? "Certification / scheme"
                    : "Product / test / certification"}
                </label>
                <input
                  id="product"
                  name="product"
                  defaultValue={sp.product ?? ""}
                  placeholder="e.g. LED lamp safety test, BIS certification, BEE RAC…"
                  className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 min-h-11"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">Tell us more</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Manufacturing location, import or domestic, sample availability, timeline…"
                  className="w-full rounded-xl border border-cream-300 px-4 py-3 text-base sm:text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30"
                />
              </div>
              <button className="w-full min-h-12 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3.5 transition">
                {sp.intent === "test"
                  ? "Request a quote for this test"
                  : sp.intent === "certification"
                  ? "Request a quote for this certification"
                  : "Request a free quote"}
              </button>
              <p className="text-[11px] text-ink-500 text-center">
                No spam. Your details are only used to respond to this request.
              </p>
            </form>
          )}
        </div>
      </div>

      <div className="mt-10 -mx-4 sm:-mx-6">
        <TestimonialStrip />
      </div>

      <div className="mt-10 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Before You Ask" />
      </div>
    </div>
  );
}
