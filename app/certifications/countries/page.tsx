import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import CountryWiseBrowser from "@/components/CountryWiseBrowser";
import {
  countryHubPath,
  getCountryHubs,
} from "@/lib/country-certifications";
import { GMA_REGIONS, gmaRegionLabel } from "@/lib/gma-regions";
import { INDEX_FOLLOW_ROBOTS, finalizeDocumentTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: finalizeDocumentTitle(
      "Global Market Access — Certifications by Country"
    ),
  },
  description:
    "Country-wise certification and compliance matrix across Asia-Pacific, Europe & Eurasia, the Americas, and Middle East & Africa — search schemes by market.",
  alternates: { canonical: "https://certko.com/certifications/countries" },
  robots: INDEX_FOLLOW_ROBOTS,
};

export default function CertificationsByCountryPage() {
  const hubs = getCountryHubs();
  const cards = hubs.map((h) => ({
    slug: h.slug,
    name: h.name,
    shortName: h.shortName,
    intro: h.intro,
    regionId: h.region || "other",
    regionLabel: gmaRegionLabel(h.region),
    schemeNames: h.schemes.map((s) => s.name),
    schemeCount: h.schemes.length,
    href: countryHubPath(h.slug),
  }));
  const regions = GMA_REGIONS.map((r) => ({ id: r.id, label: r.label }));

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(ellipse_at_top,_rgba(247,196,83,0.18),_transparent_55%),linear-gradient(180deg,_#f3eee3_0%,_transparent_70%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Breadcrumbs
          crumbs={[
            { label: "Certifications", href: "/certifications" },
            { label: "By country" },
          ]}
        />
        <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
          Global Market Access
        </h1>
        <p className="mt-3 text-ink-600 max-w-3xl leading-relaxed">
          Determine which regulations apply in each destination market, then open that
          country’s guide for safety, EMC/wireless, telecom and energy pathways.{" "}
          <Link
            href="/certifications#global-market-access"
            className="font-semibold text-butter-700 hover:underline"
          >
            How GMA works →
          </Link>
        </p>

        <CountryWiseBrowser countries={cards} regions={regions} />
      </div>

      <div className="mt-16">
        <CtaBanner />
      </div>
    </div>
  );
}
