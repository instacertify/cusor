import type { Metadata } from "next";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";

/** Metadata for public routes that render the in-page 404 UI. */
export const MISSING_PAGE_METADATA: Metadata = {
  title: { absolute: "Page not found | Certko" },
  description: "The page you requested is not available on Certko.",
  robots: NOINDEX_FOLLOW_ROBOTS,
};
