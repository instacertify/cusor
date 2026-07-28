import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import ContactForm from "@/components/ContactForm";
import ContactThankYou from "@/components/ContactThankYou";
import { getPage, getFaqs } from "@/lib/queries";
import { ensureDbReady, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  await ensureDbReady();
  const page = getPage("contact");
  return {
    title: page?.meta_title || "Get Expert Help",
    description: page?.meta_description,
    alternates: { canonical: "https://certko.com/contact" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

interface Props {
  searchParams: Promise<{ sent?: string; error?: string; product?: string; intent?: string }>;
}

const PROMISES = [
  { icon: "zap", title: "24-hour response", text: "A compliance specialist replies with a mapped standard and full cost estimate within one working day." },
  { icon: "clipboard", title: "Transparent quotes", text: "Lab charges, government fees and consultant fees itemised separately — no bundled surprises." },
  { icon: "cog", title: "End-to-end handling", text: "Application, lab coordination and grant follow-up — plus factory inspection readiness for ISI. CRS products need no onsite audit." },
];

export default async function ContactPage({ searchParams }: Props) {
  await ensureDbReady();
  const sp = await searchParams;
  const page = getPage("contact");
  const settings = getSettings();
  const faqs = getFaqs("page:contact");
  const initiallySent = sp.sent === "1" || sp.sent === "true";
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
            {sp.intent === "book"
              ? "Contact Instacertify"
              : page?.hero_heading || "Talk to a BIS expert"}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-600 leading-relaxed">
            {sp.intent === "book"
              ? "Tell us about the lab or product you need help with. Someone from our team will connect with you within 24 hours."
              : page?.hero_subheading ||
                "Tell us about your product and we will map the standard, estimate the full cost and send a free quote within 24 hours."}
          </p>
          <div className="mt-8 space-y-5">
            {PROMISES.map((p) => (
              <div key={p.title} className="flex gap-4">
                <IconChip name={p.icon} size={22} chip="lg" />
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
          {initiallySent ? (
            <ContactThankYou />
          ) : (
            <ContactForm
              product={sp.product ?? ""}
              intent={sp.intent}
              errorMessage={errorMessage}
            />
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
