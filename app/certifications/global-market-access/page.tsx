import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** GMA framework now lives on /certifications?section=global-market-access (middleware redirect). */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("page:gma-redirect", {
    title: "Global Market Access Framework",
    description:
      "Global Market Access framework — pillars, horizontal regimes and multi-market shortcuts — on the Certifications page.",
    path: "/certifications/global-market-access",
    index: false,
    follow: true,
  });
}

/** Body never renders — middleware redirects to /certifications?section=global-market-access */
export default function GlobalMarketAccessPage() {
  return null;
}
