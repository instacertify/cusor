import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";
import { MISSING_PAGE_METADATA } from "@/lib/missing-page";

export const metadata: Metadata = MISSING_PAGE_METADATA;

export default function NotFound() {
  return <NotFoundView />;
}
