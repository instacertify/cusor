import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import CertificationSolutionRow from "@/components/CertificationSolutionRow";
import Icon from "@/components/Icon";
import IconChip from "@/components/IconChip";
import { getCategories, getFaqs } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certification Solutions — Product Library by Category",
  description:
    "Search product certification solutions — BIS, BEE, Mandatory QCO and more — then browse 1,400+ products by category with IS standards, testing costs and approved labs.",
  alternates: { canonical: "https://certko.com/products" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function ProductsPage() {
  const categories = getCategories();
  const total = categories.reduce((s, c) => s + (c.product_count ?? 0), 0);
  const faqs = getFaqs("page:products");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Products" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Certification Solutions — Product Library
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Check for the right certification against your product, then browse{" "}
        {formatNumber(total)} products across {categories.length} categories — each mapped to
        IS standard, HSN code, QCO status, fees, lab costs and approved laboratories.
      </p>
      <Link
        href="/products/all"
        className="mt-5 inline-flex items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-5 py-3 transition"
      >
        <Icon name="table" size={18} />
        Search product for certification
      </Link>

      <CertificationSolutionRow className="mt-8" />

      <div className="mt-8 mb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-700">
            Product categories
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-950 mt-1">
            Browse by product category
          </h2>
        </div>
        <p className="text-xs text-ink-500 max-w-sm">
          Same library — open a category, then confirm which certification applies.
        </p>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <IconChip name={c.icon} size={26} chip="xl" tone="neutral" />
              <span className="text-xs font-bold bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
                {c.product_count} products
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
              {c.name}
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">
              {c.description}
            </p>
            <span className="mt-auto text-sm font-bold text-butter-700 pt-2">
              View products →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Product Database FAQs" />
      </div>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
