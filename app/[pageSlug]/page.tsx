import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import { getPage, getFaqs } from "@/lib/queries";
import {
  buildMetadata,
  buildJsonLd,
  enabledSchemaTypes,
  analyzeMarkdown,
  BASE_URL,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const CONTENT_PAGES = new Set(["guide", "about"]);

interface Props {
  params: Promise<{ pageSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageSlug } = await params;
  if (!CONTENT_PAGES.has(pageSlug)) return {};
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
  if (!CONTENT_PAGES.has(pageSlug)) notFound();
  const page = getPage(pageSlug);
  if (!page) notFound();
  const faqs = getFaqs(`page:${pageSlug}`);

  const analysis = analyzeMarkdown(page.content);
  const jsonLd = buildJsonLd(enabledSchemaTypes(`page:${pageSlug}`, "page"), {
    name: page.hero_heading || page.title,
    description: page.meta_description,
    url: `${BASE_URL}/${pageSlug}`,
    image: page.image,
    faqs,
    breadcrumbs: [{ name: "Home", url: "/" }, { name: page.title }],
    howToSteps: analysis.headings.slice(0, 8),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: page.title }]} />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight leading-tight">
            {page.hero_heading || page.title}
          </h1>
          {page.hero_subheading && (
            <p className="mt-4 text-lg text-ink-600 leading-relaxed">{page.hero_subheading}</p>
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

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
