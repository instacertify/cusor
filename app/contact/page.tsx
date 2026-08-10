import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import TestimonialStrip from "@/components/TestimonialStrip";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import ContactForm from "@/components/ContactForm";
import ContactThankYou from "@/components/ContactThankYou";
import { resolveExpertCta } from "@/lib/expert-cta";
import { getPage, getFaqs } from "@/lib/queries";
import { ensureDbReady, getSettings } from "@/lib/db";
import { BASE_URL, buildJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ sent?: string; error?: string; product?: string; intent?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  await ensureDbReady();
  const page = getPage("contact");
  const sp = await searchParams;
  const thankYouOrError = Boolean(sp.sent || sp.error);
  return buildMetadata("page:contact", {
    title: page?.meta_title || "Get Expert Help",
    description:
      page?.meta_description ||
      "Talk to a Certko certification expert — scheme mapping, lab coordination and free quotes within 24 hours.",
    path: "/contact",
    // Thank-you / error query variants stay crawlable for form UX but are not indexed.
    index: !thankYouOrError,
    follow: true,
  });
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
  const expertCta = resolveExpertCta(settings);
  const faqs = getFaqs("page:contact");
  const initiallySent = sp.sent === "1" || sp.sent === "true";
  const errorMessage =
    sp.error === "save"
      ? "We could not save your request just now. Please try again, or email us directly."
      : sp.error
        ? "Please fill in your name and email."
        : null;

  const faqJsonLd = buildJsonLd(["FAQPage", "BreadcrumbList"], {
    name: page?.hero_heading || "Get Expert Help",
    description: page?.meta_description || page?.hero_subheading || "",
    url: `${BASE_URL}/contact`,
    faqs: faqs.map(({ question, answer }) => ({ question, answer })),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Get Expert Help" },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: "Get Expert Help" }]} />
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
            {sp.intent === "consulting"
              ? "Book testing / certification consulting"
              : sp.intent === "book" || sp.intent === "test"
                ? "Book product testing"
                : sp.intent === "expert"
                  ? expertCta.label
                  : page?.hero_heading || expertCta.label}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-600 leading-relaxed">
            {sp.intent === "consulting"
              ? "Tell us what you need help with. We log the request and someone from the team gets back within 24 working hours."
              : sp.intent === "book" || sp.intent === "test"
                ? "Describe the product or lab test. We save it as a lead and update you within 24 working hours."
                : sp.intent === "expert"
                  ? "Stuck on which mark or test to book? Share the product or HSN and we’ll sketch the path — free quote in 24 hours."
                  : page?.hero_subheading ||
                    "Tell us what you make and where you sell. We’ll point to the standard, sketch the full cost, and send a free quote within 24 hours."}
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
            <ContactThankYou intent={sp.intent} />
          ) : (
            <>
              {sp.intent === "expert" || !sp.intent ? (
                <a
                  href={`tel:${expertCta.phoneTel}`}
                  className="mb-5 flex items-center gap-3 rounded-2xl border border-butter-400 bg-butter-300/35 px-4 py-3.5 transition hover:bg-butter-300/60"
                >
                  <IconChip name="phone" size={22} chip="lg" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink-950">
                      Prefer to talk now?
                    </span>
                    <span className="block text-sm font-semibold text-ink-800">
                      Dial {expertCta.phoneDisplay}
                    </span>
                  </span>
                </a>
              ) : null}
              <ContactForm
                product={sp.product ?? ""}
                intent={sp.intent}
                errorMessage={errorMessage}
              />
            </>
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
