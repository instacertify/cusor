import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import {
  getCategoryBySlug,
  getProductsByCategory,
  getFaqs,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — BIS Certification Requirements, Costs & Labs`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const products = getProductsByCategory(category.id);
  const faqs = getFaqs(`category:${category.id}`);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs
        crumbs={[{ label: "Products", href: "/products" }, { label: category.name }]}
      />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div>
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-butter-300/40 text-butter-700 flex items-center justify-center shrink-0">
              <Icon name={category.icon} size={34} />
            </span>
            <h1 className="font-display text-4xl font-extrabold text-ink-950 tracking-tight">
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
        <CtaBanner />
      </div>
    </div>
  );
}
