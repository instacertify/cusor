import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import IconChip from "@/components/IconChip";
import NotFoundView from "@/components/NotFoundView";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getFaqs,
} from "@/lib/queries";
import { MISSING_PAGE_METADATA } from "@/lib/missing-page";
import { buildMetadata, buildJsonLd, enabledSchemaTypes, BASE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return MISSING_PAGE_METADATA;
  return buildMetadata(`category:${category.id}`, {
    title: `${category.name} — BIS Certification Requirements, Costs & Labs`,
    description: category.description,
    path: `/category/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return <NotFoundView />;
  const products = getProductsByCategory(category.id);
  const faqs = getFaqs(`category:${category.id}`);

  const jsonLd = buildJsonLd(
    enabledSchemaTypes(`category:${category.id}`, "category"),
    {
      name: `${category.name} — BIS Certification`,
      description: category.description,
      url: `${BASE_URL}/category/${category.slug}`,
      image: category.image,
      faqs,
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: category.name },
      ],
    }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs
        crumbs={[{ label: "Products", href: "/products" }, { label: category.name }]}
      />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div>
          <div className="flex items-center gap-4">
            <IconChip name={category.icon} size={34} chip="hero" />
            <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
              {category.name}
            </h1>
          </div>
          <p className="mt-4 text-ink-600 leading-relaxed max-w-2xl">{category.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="bg-white border border-cream-300 rounded-full px-4 py-1.5 font-semibold text-ink-800">
              {products.length} notified products
            </span>
            <span className="bg-white border border-cream-300 rounded-full px-4 py-1.5 font-semibold text-ink-800">
              Typical timeline: {category.timeline}
            </span>
          </div>
        </div>
        {category.image ? (
          <Image
            src={category.image}
            alt={`${category.name} BIS certification`}
            width={520}
            height={340}
            className="rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        ) : null}
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {faqs.length > 0 && (
        <div className="mt-16 max-w-3xl">
          <FaqAccordion faqs={faqs} heading={`${category.name} FAQs`} />
        </div>
      )}

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner subject={category.name} kind="product" />
      </div>
    </div>
  );
}
