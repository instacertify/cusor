import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Lab } from "@/lib/db";
import { getCategories } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { saveLab, deleteLab } from "../../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

function parseLabCategories(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminLabEdit({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const lab = getDb()
    .prepare("SELECT * FROM labs WHERE id = ?")
    .get(Number(id)) as Lab | undefined;
  if (!lab) notFound();

  const categories = getCategories();
  const selected = parseLabCategories(lab.categories);
  const selectedLower = new Set(selected.map((c) => c.toLowerCase()));
  const knownNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const extra = selected.filter((c) => !knownNames.has(c.toLowerCase()));
  const location = [lab.city, lab.state].filter(Boolean).join(", ") || "—";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/labs" className="text-xs font-bold text-ink-500 hover:text-butter-700">
            ← All labs
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1">{lab.name}</h1>
          <p className="text-sm text-ink-600 mt-1">
            {location} · {lab.scope_count} scopes ·{" "}
            {formatPriceRange(lab.min_price, lab.max_price)}
          </p>
        </div>
        <Link
          href={`/labs/${lab.slug}`}
          target="_blank"
          className="text-sm font-bold text-butter-700 shrink-0"
        >
          View lab ↗
        </Link>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form action={saveLab} className="space-y-6 mb-10">
        <input type="hidden" name="id" value={lab.id} />
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Lab details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Lab name" name="name" required defaultValue={lab.name} />
            <Field label="URL slug" name="slug" defaultValue={lab.slug} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="BIS lab code" name="code" defaultValue={lab.code} />
            <Field label="City / Location" name="city" defaultValue={lab.city} />
            <Field label="State" name="state" defaultValue={lab.state} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Accreditation"
              name="accreditation"
              defaultValue={lab.accreditation}
              placeholder="e.g. NABL / BIS Recognised / TEC"
            />
            <Field
              label="Recognition valid till"
              name="validity"
              defaultValue={lab.validity}
              placeholder="e.g. 31 Dec 2027"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Testing scopes"
              name="scope_count"
              type="number"
              defaultValue={lab.scope_count}
            />
            <Field
              label="Min price (₹)"
              name="min_price"
              type="number"
              defaultValue={lab.min_price}
            />
            <Field
              label="Max price (₹)"
              name="max_price"
              type="number"
              defaultValue={lab.max_price}
            />
          </div>
          <div>
            <p className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Categories
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto bg-cream-50 rounded-xl border border-cream-300 p-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-start gap-2 text-sm text-ink-800">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.name}
                    defaultChecked={selectedLower.has(c.name.toLowerCase())}
                    className="mt-0.5 rounded border-cream-300 text-butter-600 focus:ring-butter-400"
                  />
                  <span className="leading-snug">{c.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <Field
                label="Extra categories (comma-separated)"
                name="categories_extra"
                defaultValue={extra.join(", ")}
                placeholder="Optional tags not in the list above"
              />
            </div>
          </div>
          <SubmitButton label="Save lab" />
        </section>
      </form>

      <ConfirmDeleteForm action={deleteLab} itemLabel={`lab “${lab.name}”`}>
        <input type="hidden" name="id" value={lab.id} />
        <button
          type="submit"
          className="text-sm font-bold text-red-700 hover:text-red-800 underline underline-offset-2"
        >
          Delete this lab
        </button>
      </ConfirmDeleteForm>
    </div>
  );
}
