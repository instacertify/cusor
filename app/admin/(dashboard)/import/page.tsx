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
  const groups = Array.from(new Set(BULK_ENTITIES.map((e) => e.group)));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Bulk Import</h1>
      <p className="text-ink-600 text-sm mb-6 max-w-3xl">
        Every content type supports Excel bulk upload. Download the example format for that option,
        fill your rows, then upload below. Matching slugs update existing records when possible.
      </p>

      <section className="mb-10 space-y-6">
        {groups.map((group) => {
          const items = BULK_ENTITIES.filter((e) => e.group === group);
          return (
            <div key={group}>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 mb-3">
                {group}
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((e) => {
                  const active = (initial || BULK_ENTITIES[0].id) === e.id;
                  return (
                    <div
                      key={e.id}
                      className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                        active
                          ? "bg-ink-950 text-cream-50 border-ink-950"
                          : "bg-white border-cream-300 shadow-card"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-display font-bold ${active ? "text-cream-50" : "text-ink-950"}`}>
                          {e.label}
                        </p>
                        <p className={`text-xs mt-1 ${active ? "text-cream-200" : "text-ink-600"}`}>
                          {e.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <a
                          href={`/api/admin/bulk-template/${e.id}`}
                          className={`text-xs font-bold rounded-lg px-3 py-1.5 transition ${
                            active
                              ? "bg-butter-500 text-ink-950 hover:bg-butter-400"
                              : "bg-ink-900 text-white hover:bg-ink-800"
                          }`}
                        >
                          Download Excel
                        </a>
                        <Link
                          href={`/admin/import?entity=${e.id}`}
                          className={`text-xs font-bold rounded-lg px-3 py-1.5 border transition ${
                            active
                              ? "border-cream-100/40 text-cream-50 hover:bg-ink-800"
                              : "border-cream-300 text-ink-800 hover:border-butter-400"
                          }`}
                        >
                          {active ? "Selected ↑" : "Upload here"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <h2 className="font-display text-xl font-bold text-ink-950 mb-3">Upload spreadsheet</h2>
      <BulkImportPanel
        key={initial || BULK_ENTITIES[0].id}
        entities={BULK_ENTITIES}
        initialEntity={initial}
      />
    </div>
  );
}
