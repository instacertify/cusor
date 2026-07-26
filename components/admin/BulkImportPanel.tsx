"use client";

import { useState, useTransition } from "react";
import { bulkImportEntity } from "@/app/admin/actions";
import type { BulkEntity, BulkEntityDef } from "@/lib/bulk-import";

type ImportState = {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
} | null;

export default function BulkImportPanel({
  entities,
  initialEntity,
}: {
  entities: BulkEntityDef[];
  initialEntity?: BulkEntity;
}) {
  const [entity, setEntity] = useState<BulkEntity>(initialEntity || entities[0]?.id || "testimonials");
  const [result, setResult] = useState<ImportState>(null);
  const [pending, startTransition] = useTransition();
  const selected = entities.find((e) => e.id === entity) || entities[0];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("entity", entity);
    setResult(null);
    startTransition(async () => {
      const res = await bulkImportEntity(fd);
      setResult(res);
      if (res.ok && res.created + res.updated > 0) {
        form.reset();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
        <div>
          <label htmlFor="bulk-entity" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Content type
          </label>
          <select
            id="bulk-entity"
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value as BulkEntity);
              setResult(null);
            }}
            className="w-full max-w-md rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
          {selected && <p className="text-sm text-ink-600 mt-2">{selected.description}</p>}
        </div>

        {selected && (
          <div className="rounded-xl bg-cream-50 border border-cream-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600 mb-2">
              Excel columns ({selected.label})
            </p>
            <ul className="flex flex-wrap gap-2">
              {selected.columns.map((c) => (
                <li
                  key={c.key}
                  className={`text-xs font-mono rounded-lg px-2.5 py-1 border ${
                    c.required
                      ? "bg-butter-300/40 border-butter-400 text-ink-900"
                      : "bg-white border-cream-300 text-ink-700"
                  }`}
                >
                  {c.header}
                  {c.required ? " *" : ""}
                </li>
              ))}
            </ul>
            <a
              href={`/api/admin/bulk-template/${selected.id}`}
              className="inline-flex mt-4 items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition"
            >
              Download example Excel (.xlsx)
            </a>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="bulk-file" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Upload filled spreadsheet
            </label>
            <input
              id="bulk-file"
              name="file"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              required
              className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-xl file:border-0 file:bg-cream-200 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-ink-900 hover:file:bg-cream-300"
            />
            <p className="text-[11px] text-ink-500 mt-1.5">
              Keep the header row. Replace the example row with your data. Matching slugs update existing
              records.
            </p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-butter-500 hover:bg-butter-400 disabled:opacity-60 text-ink-950 text-sm font-bold rounded-xl px-6 py-2.5 transition"
          >
            {pending ? "Importing…" : "Import from Excel"}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-5 ${
            result.ok && result.errors.length === 0
              ? "bg-green-50 border-green-200 text-green-800"
              : result.ok
                ? "bg-butter-100/60 border-butter-300 text-ink-900"
                : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p className="font-display font-bold mb-1">
            {result.ok ? "Import finished" : "Import could not run"}
          </p>
          <p className="text-sm">
            Created {result.created} · Updated {result.updated} · Skipped {result.skipped}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-3 text-sm space-y-1 list-disc pl-5 max-h-48 overflow-y-auto">
              {result.errors.slice(0, 40).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 40 && <li>…and {result.errors.length - 40} more</li>}
            </ul>
          )}
          {selected && result.ok && result.created + result.updated > 0 && (
            <a
              href={selected.adminHref}
              className="inline-block mt-3 text-sm font-bold text-butter-800 hover:underline"
            >
              Review in {selected.label} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
