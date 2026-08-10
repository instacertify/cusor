import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import SearchBox from "@/components/SearchBox";
import RequestQuoteButton from "@/components/RequestQuoteButton";
import { TestingStandardFamiliesPanel } from "@/components/MarketApplicability";
import { getFaqs, getTestingCategories } from "@/lib/queries";
import { BASE_URL, buildJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page:testing", {
    title: "Product Testing & Quality Assurance Solutions",
    description:
      "Explore the right quality assurance solutions — chemical, electrical, EMC, physical, microbiology and mechanical product testing. Find standards, scopes and accredited lab pathways with Certko.",
    path: "/testing",
  });
}

export default function TestingIndexPage() {
  const categories = getTestingCategories();
  const faqs = getFaqs("page:testing");
  const faqJsonLd = buildJsonLd(["FAQPage", "BreadcrumbList"], {
    name: "Explore the Right Quality Assurance Solutions",
    description:
      "Chemical, electrical, EMC, physical, microbiology and mechanical product testing pathways with Certko.",
    url: `${BASE_URL}/testing`,
    faqs: faqs.map(({ question, answer }) => ({ question, answer })),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Product Testing" },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: "Product Testing" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Explore the Right Quality Assurance Solutions
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Browse testing by discipline, then check whether the method is an Indian Standard (IS) for
        India or an IEC / international method for global market access. Book testing or consulting
        — we reply within 24 working hours.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
        <RequestQuoteButton subject="Product Testing" kind="test" />
        <RequestQuoteButton
          subject="Testing / certification consulting"
          kind="consulting"
          variant="secondary"
        />
      </div>

      <div className="mt-8 max-w-2xl">
        <SearchBox
          large
          placeholder="Search a product test — LED, fabric, heavy metals, EMC…"
        />
        <p className="mt-2 text-xs text-ink-500">
          Tip: search results also appear under the <Link href="/search?type=testing" className="font-semibold text-butter-700 hover:underline">Product Testing</Link> tab.
        </p>
      </div>

      <TestingStandardFamiliesPanel />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
          >
            <Link href={`/testing/${c.slug}`} className="flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between">
                <IconChip name={c.icon} size={26} chip="xl" />
                <span className="text-xs font-bold bg-cream-200 text-ink-700 rounded-full px-3 py-1">
                  {c.service_count ?? 0} test{(c.service_count ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
                {c.name}
              </h2>
              <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{c.summary}</p>
              <span className="text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
                Browse tests <Icon name="arrow-right" size={15} />
              </span>
            </Link>
            <div className="mt-auto pt-2 border-t border-cream-200 flex flex-wrap gap-x-3 gap-y-1">
              <RequestQuoteButton subject={c.name} kind="test" variant="compact" short />
              <RequestQuoteButton
                subject={`${c.name} consulting`}
                kind="consulting"
                variant="compact"
                short
              />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16" id="faqs">
        <FaqAccordion faqs={faqs} heading="Product Testing FAQs" />
      </section>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner subject="Product Testing" kind="test" />
      </div>
    </div>
  );
}
