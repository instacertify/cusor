import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import CountryWiseBrowser from "@/components/CountryWiseBrowser";
import {
  countryHubPath,
  getCountryHubs,
} from "@/lib/country-certifications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certifications by Country | India, EU, USA, GCC, Saudi Arabia | Certko",
  description:
    "Search product certifications country wise — India (BIS, BEE, WPC), European Union (CE), United States (FCC), GCC (GMARK) and Saudi Arabia (SABER).",
  alternates: { canonical: "https://certko.com/certifications/countries" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function CertificationsByCountryPage() {
  const hubs = getCountryHubs();
  const cards = hubs.map((h) => ({
    slug: h.slug,
    name: h.name,
    shortName: h.shortName,
    intro: h.intro,
    schemeNames: h.schemes.map((s) => s.name),
    schemeCount: h.schemes.length,
    href: countryHubPath(h.slug),
  }));

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
          Certifications by country
        </h1>
        <p className="mt-3 text-ink-600 max-w-2xl">
          Find the mark that unlocks each market — then open that country’s guide for who
          needs which scheme, what to check first, and links into Certko’s certification
          pages.
        </p>

        <CountryWiseBrowser countries={cards} />

        <div className="mt-16">
          <CtaBanner />
        </div>
      </div>
    </div>
  );
}
