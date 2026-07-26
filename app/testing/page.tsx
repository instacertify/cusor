import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import SearchBox from "@/components/SearchBox";
import { getFaqs, getTestingCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Testing Services | Search Tests by Category | Certko",
  description:
    "Search product testing services — chemical, electrical, EMC, physical, microbiology and mechanical. Find standards, scopes and accredited lab pathways with Certko.",
};

export default function TestingIndexPage() {
  const categories = getTestingCategories();
  const faqs = getFaqs("page:testing");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ label: "Product Testing" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Product Testing
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Search testing categories and individual test services for your product. Open a category for
        writeups, FAQs and the full list of tests — then request a mapped lab quote.
      </p>

      <div className="mt-8 max-w-2xl">
        <SearchBox
          large
          placeholder="Search a product test — LED, fabric, heavy metals, EMC…"
        />
        <p className="mt-2 text-xs text-ink-500">
          Tip: search results also appear under the <Link href="/search?type=testing" className="font-semibold text-butter-700 hover:underline">Product Testing</Link> tab.
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/testing/${c.slug}`}
            className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-xl bg-butter-300/40 text-butter-700 flex items-center justify-center">
                <Icon name={c.icon} size={26} />
              </span>
              <span className="text-xs font-bold bg-cream-200 text-ink-700 rounded-full px-3 py-1">
                {c.service_count ?? 0} test{(c.service_count ?? 0) === 1 ? "" : "s"}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-ink-950 group-hover:text-butter-700 transition">
              {c.name}
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{c.summary}</p>
            <span className="mt-auto pt-2 text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
              Browse tests <Icon name="arrow-right" size={15} />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-16" id="faqs">
        <FaqAccordion faqs={faqs} heading="Product Testing FAQs" />
      </section>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
