import type { Metadata } from "next";
import HardRedirect from "@/components/HardRedirect";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

/** Fallback if Edge middleware does not run on Hostinger Node panel. */
export default function GlobalMarketAccessPage() {
  return <HardRedirect href="/certifications?section=global-market-access" />;
}
