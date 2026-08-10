import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

/** GMA framework now lives on /certifications#global-market-access */
export const metadata: Metadata = {
  title: "Global Market Access Framework | Certko",
  description:
    "Global Market Access framework — pillars, horizontal regimes and multi-market shortcuts — on the Certifications page.",
  alternates: { canonical: "https://certko.com/certifications#global-market-access" },
  robots: { index: false, follow: true },
};

export default function GlobalMarketAccessPage() {
  redirect("/certifications#global-market-access");
}
