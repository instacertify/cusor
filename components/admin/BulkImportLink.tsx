import Link from "next/link";
import type { BulkEntity } from "@/lib/bulk-import";

/** Compact link(s) to Bulk Import for one or more entities. */
export default function BulkImportLink({
  entity,
  entities,
  label,
}: {
  entity?: BulkEntity;
  entities?: BulkEntity[];
  label?: string;
}) {
  const list = entities?.length ? entities : entity ? [entity] : [];
  if (!list.length) return null;

  if (list.length === 1) {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/admin/bulk-template/${list[0]}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 hover:text-butter-700 border border-cream-300 bg-white hover:border-butter-400 rounded-xl px-3.5 py-2 transition"
        >
          Excel template
        </a>
        <Link
          href={`/admin/import?entity=${list[0]}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 hover:text-butter-700 border border-cream-300 bg-white hover:border-butter-400 rounded-xl px-3.5 py-2 transition"
        >
          {label || "Bulk upload (Excel)"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((id) => (
        <Link
          key={id}
          href={`/admin/import?entity=${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 hover:text-butter-700 border border-cream-300 bg-white hover:border-butter-400 rounded-xl px-3.5 py-2 transition"
        >
          Bulk: {id.replace(/_/g, " ")}
        </Link>
      ))}
    </div>
  );
}
