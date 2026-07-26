import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import {
  getFaqs,
  getTestingCategories,
  getTestingCategoryBySlug,
  getTestingServices,
} from "@/lib/queries";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getTestingCategoryBySlug(slug);
  if (!cat) return {};
  return buildMetadata(`testcat:${cat.id}`, {
    title: cat.meta_title || `${cat.name} | Product Testing`,
    description: cat.meta_description || cat.summary,
    path: `/testing/${cat.slug}`,
    image: cat.image,
  });
}

export default async function TestingCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getTestingCategoryBySlug(slug);
  if (!cat) notFound();
  const services = getTestingServices(cat.id);
  const faqs = getFaqs(`testcat:${cat.slug}`);
  const others = getTestingCategories().filter((c) => c.slug !== cat.slug);
  const html = marked.parse(cat.content || "") as string;

  const jsonLd = buildJsonLd(enabledSchemaTypes(`testcat:${cat.id}`, "testcat"), {
    name: `${cat.name} Services`,
    description: cat.summary,
    url: `${BASE_URL}/testing/${cat.slug}`,
    image: cat.image,
    faqs,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Product Testing", url: "/testing" },
      { name: cat.name },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs
        crumbs={[
          { label: "Product Testing", href: "/testing" },
          { label: cat.name },
        ]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div>
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-butter-300/40 text-butter-700 flex items-center justify-center shrink-0">
              <Icon name={cat.icon} size={34} />
            </span>
            <div>
              <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
                {cat.name}
              </h1>
              <p className="text-sm font-semibold text-ink-500 mt-1">
                {services.length} test service{services.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed">{cat.summary}</p>
          <Link
            href={`/contact?product=${encodeURIComponent(cat.name + " testing")}`}
            className="mt-6 inline-flex items-center gap-2 bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold rounded-xl px-6 py-3 text-sm transition"
          >
            Get a Testing Quote <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      {html ? (
        <article
          className="prose prose-ink mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink-950 mb-2">
          Tests & services in this category
        </h2>
        <p className="text-sm text-ink-600 mb-6 max-w-2xl">
          Open a test for standards, accreditation notes, writeup and FAQs. Editors can update each
          page from the Product Testing admin.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/testing/${cat.slug}/${s.slug}`}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 flex flex-col gap-2"
            >
              <h3 className="font-display font-bold text-ink-950">{s.name}</h3>
              {(s.test_type || s.standards) && (
                <p className="text-xs font-semibold text-ink-500">
                  {[s.test_type, s.standards].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="text-sm text-ink-600 line-clamp-3">{s.summary}</p>
              {(s.timeline || s.sample_size) && (
                <div className="mt-1 space-y-1 text-xs text-ink-700">
                  {s.timeline ? (
                    <p>
                      <span className="font-bold text-ink-500">Timeline:</span> {s.timeline}
                    </p>
                  ) : null}
                  {s.sample_size ? (
                    <p>
                      <span className="font-bold text-ink-500">Sample:</span> {s.sample_size}
                    </p>
                  ) : null}
                </div>
              )}
              <span className="mt-auto pt-2 text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
                View test <Icon name="arrow-right" size={14} />
              </span>
            </Link>
          ))}
        </div>
        {services.length === 0 && (
          <p className="text-sm text-ink-500">No tests published in this category yet.</p>
        )}
      </section>

      <section className="mt-14" id="faqs">
        <FaqAccordion faqs={faqs} heading={`FAQs about ${cat.name}`} />
      </section>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">
            Other testing categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.id}
                href={`/testing/${c.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:border-butter-500"
              >
                <Icon name={c.icon} size={16} />
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
