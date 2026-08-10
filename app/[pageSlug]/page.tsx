import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import LandingPageView from "@/components/LandingPageView";
import { getPage, getFaqs } from "@/lib/queries";
import { isRoutableContentPage } from "@/lib/pages-nav";
import {
  buildMetadata,
  buildJsonLd,
  enabledSchemaTypes,
  analyzeMarkdown,
  BASE_URL,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const LEGAL_PDF: Record<string, { href: string; label: string }> = {
  privacy: {
    href: "/legal/certko-privacy-policy.pdf",
    label: "Download Privacy Policy (PDF)",
  },
  terms: {
    href: "/legal/certko-terms-of-service.pdf",
    label: "Download Terms of Service (PDF)",
  },
};

interface Props {
  params: Promise<{ pageSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageSlug } = await params;
  if (!isRoutableContentPage(pageSlug)) return {};
  const page = getPage(pageSlug);
  if (!page) return {};
  return buildMetadata(`page:${pageSlug}`, {
    title: page.meta_title || page.title,
    description: page.meta_description,
    path: `/${pageSlug}`,
    image: page.image,
  });
}

export default async function ContentPage({ params }: Props) {
  const { pageSlug } = await params;
  if (!isRoutableContentPage(pageSlug)) notFound();
  const page = getPage(pageSlug);
  if (!page) notFound();
  const faqs = getFaqs(`page:${pageSlug}`);

  const schemaTypes = enabledSchemaTypes(`page:${pageSlug}`, "page");
  // Only emit HowTo when explicitly enabled in SEO admin — markdown headings are not steps.
  const howToSteps = schemaTypes.includes("HowTo")
    ? analyzeMarkdown(page.content).headings.slice(0, 8)
    : undefined;
  const jsonLd = buildJsonLd(schemaTypes, {
    name: page.hero_heading || page.title,
    description: page.meta_description,
    url: `${BASE_URL}/${pageSlug}`,
    image: page.image,
    faqs,
    breadcrumbs: [{ name: "Home", url: "/" }, { name: page.title }],
    ...(howToSteps?.length ? { howToSteps } : {}),
  });

  if (page.page_type === "landing") {
    return (
      <>
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
        <LandingPageView page={page} faqs={faqs} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: page.title }]} />
      <div
        className={
          page.image
            ? "grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center"
            : "max-w-3xl"
        }
      >
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
            {page.hero_heading || page.title}
          </h1>
          {page.hero_subheading && (
            <p className="mt-4 text-lg text-ink-600 leading-relaxed">{page.hero_subheading}</p>
          )}
          {LEGAL_PDF[pageSlug] && (
            <p className="mt-5">
              <a
                href={LEGAL_PDF[pageSlug].href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-butter-700 hover:text-butter-800 underline underline-offset-4"
              >
                {LEGAL_PDF[pageSlug].label}
              </a>
            </p>
          )}
        </div>
        {page.image ? (
          <Image
            src={page.image}
            alt={page.title}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      <article
        className="prose-certko mt-10 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: marked.parse(page.content) as string }}
      />

      {faqs.length > 0 && (
        <div className="mt-14 max-w-3xl">
          <FaqAccordion faqs={faqs} />
        </div>
      )}

      {!LEGAL_PDF[pageSlug] && (
        <div className="mt-16">
          <TestimonialStrip />
          <CtaBanner />
        </div>
      )}
    </div>
  );
}
