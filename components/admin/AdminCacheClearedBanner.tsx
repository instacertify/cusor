"use client";

import { useSearchParams } from "next/navigation";
import SavedBanner from "./SavedBanner";

/** Shows Done confirmation on any admin page after one-click Clear cache. */
export default function AdminCacheClearedBanner() {
  const sp = useSearchParams();
  const cleared = sp.get("cache") === "1";
  if (!cleared) return null;

  return (
    <div className="mb-6">
      <SavedBanner
        saved="1"
        message="Done — site cache cleared. Public pages will rebuild with the latest content."
      />
    </div>
  );
}
