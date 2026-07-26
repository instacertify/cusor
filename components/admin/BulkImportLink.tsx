import Link from "next/link";
import type { BulkEntity } from "@/lib/bulk-import";

/** Compact link to Bulk Import for a specific entity, shown on admin list pages. */
export default function BulkImportLink({ entity, label }: { entity: BulkEntity; label?: string }) {
  return (
    <Link
      href={`/admin/import?entity=${entity}`}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 hover:text-butter-700 border border-cream-300 bg-white hover:border-butter-400 rounded-xl px-3.5 py-2 transition"
    >
      {label || "Bulk upload (Excel)"}
    </Link>
  );
}
