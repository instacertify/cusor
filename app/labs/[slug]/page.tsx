import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import FaqAccordion from "@/components/FaqAccordion";
import LabContactPanel from "@/components/LabContactPanel";
import NotFoundView from "@/components/NotFoundView";
import { ensureDbReady } from "@/lib/db";
import { getLabBySlug, getProductsForLab, getFaqs } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { MISSING_PAGE_METADATA } from "@/lib/missing-page";
import {
  BASE_URL,
  buildJsonLd,
  buildMetadata,
  enabledSchemaTypes,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

function parseLabCategories(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDbReady();
  const { slug } = await params;
  const lab = getLabBySlug(slug);
  if (!lab) return MISSING_PAGE_METADATA;
  const place = [lab.city, lab.state].filter(Boolean).join(", ") || "India";
  return buildMetadata(`lab:${lab.id}`, {
    title: `${lab.name} — BIS Recognised Testing Lab`,
    description: `${lab.name} in ${place} is BIS-recognised for ${lab.scope_count} testing scopes. See categories, indicative prices and book testing support with Certko.`,
    path: `/labs/${lab.slug}`,
  });
}

export default async function LabDetailPage({ params }: Props) {
  await ensureDbReady();
  const { slug } = await params;
  const lab = getLabBySlug(slug);
  if (!lab) return <NotFoundView />;
  const products = getProductsForLab(lab.id, 24);
  const cats = parseLabCategories(lab.categories);
  const faqs = getFaqs("page:labs");
  const place = [lab.city, lab.state].filter(Boolean).join(", ") || "India";
  const priceRange = formatPriceRange(lab.min_price, lab.max_price);

  // FAQ accordion stays visible for UX; FAQPage JSON-LD is reserved for /labs
  // so identical directory FAQs are not repeated on ~400 lab URLs.
  const jsonLd = buildJsonLd(enabledSchemaTypes(`lab:${lab.id}`, "lab"), {
    name: `${lab.name} — BIS recognised testing laboratory`,
    description: `${lab.name} is a BIS-recognised testing laboratory in ${place} covering ${lab.scope_count} scopes${
      cats.length ? ` across ${cats.slice(0, 4).join(", ")}` : ""
    }.`,
    url: `${BASE_URL}/labs/${lab.slug}`,
    areaServed: place,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Testing Labs", url: "/labs" },
      { name: lab.name },
    ],
    offers:
      lab.min_price != null
        ? { low: lab.min_price, high: lab.max_price ?? lab.min_price }
        : null,
  });

  const facts = [
    { label: "Location", value: place },
    { label: "BIS Lab Code", value: lab.code ?? "—" },
    { label: "Recognition Valid Till", value: lab.validity ?? "—" },
    { label: "Testing Scopes", value: String(lab.scope_count) },
    { label: "Reported Price Range", value: priceRange },
    { label: "Categories", value: String(cats.length) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: "Testing Labs", href: "/labs" }, { label: lab.name }]} />
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide bg-butter-300/50 text-butter-700 rounded-full px-3 py-1">
            BIS Recognised
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
            {lab.name}
          </h1>
          <p className="mt-4 text-base text-ink-700 leading-relaxed">
            {lab.name} is a BIS-recognised testing laboratory in {place}
            {lab.code ? ` (lab code ${lab.code})` : ""}, covering{" "}
            {lab.scope_count} approved testing scope{lab.scope_count === 1 ? "" : "s"}
            {cats.length
              ? ` across ${cats.slice(0, 6).join(", ")}${cats.length > 6 ? " and more" : ""}`
              : ""}
            . Use the scopes below to match your product, then contact Certko to book testing
            {priceRange !== "—" ? ` (indicative lab charges ${priceRange})` : ""}.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <span key={c} className="text-xs font-semibold bg-cream-200 text-ink-700 rounded-full px-3 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {facts.map((f) => (
          <div key={f.label} className="bg-white rounded-2xl border border-cream-300 shadow-card px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{f.label}</div>
            <div className="text-sm font-semibold text-ink-950 mt-0.5">{f.value}</div>
          </div>
        ))}
      </div>

      {/* Lab person name / phone / email are never shown — Contact opens lead form. */}
      <LabContactPanel labName={lab.name} />

      {products.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ink-950 mb-2">
            Products Tested at This Lab
          </h2>
          <p className="text-sm text-ink-600 mb-6">
            Showing up to 24 of {lab.scope_count} approved testing scopes.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link href="/labs" className="text-sm font-bold text-butter-700 hover:text-butter-600">
          ← Back to all labs
        </Link>
      </div>

      <div className="mt-14 max-w-3xl">
        <FaqAccordion faqs={faqs} heading="Testing Labs FAQs" />
      </div>

      <div className="mt-14">
        <TestimonialStrip />
        <CtaBanner subject={lab.name} kind="book" />
      </div>
    </div>
  );
}
