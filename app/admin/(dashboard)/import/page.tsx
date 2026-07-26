import Link from "next/link";
import { BULK_ENTITIES, getBulkEntity, type BulkEntity } from "@/lib/bulk-import";
import BulkImportPanel from "@/components/admin/BulkImportPanel";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ entity?: string }>;
}

export default async function AdminBulkImport({ searchParams }: Props) {
  const sp = await searchParams;
  const initial = getBulkEntity(sp.entity || "")?.id as BulkEntity | undefined;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Bulk Import</h1>
      <p className="text-ink-600 text-sm mb-6 max-w-2xl">
        Add testimonials, certifications, testing categories, BIS categories, BIS products, QCO alerts
        and blog posts from an Excel sheet. Download the example format, fill your rows, then upload.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {BULK_ENTITIES.map((e) => (
          <Link
            key={e.id}
            href={`/admin/import?entity=${e.id}`}
            className={`text-xs font-bold rounded-lg px-3 py-1.5 border transition ${
              initial === e.id || (!initial && e.id === BULK_ENTITIES[0].id)
                ? "bg-ink-950 text-cream-50 border-ink-950"
                : "bg-white text-ink-700 border-cream-300 hover:border-butter-400"
            }`}
          >
            {e.label}
          </Link>
        ))}
      </div>

      <BulkImportPanel
        key={initial || BULK_ENTITIES[0].id}
        entities={BULK_ENTITIES}
        initialEntity={initial}
      />
    </div>
  );
}
