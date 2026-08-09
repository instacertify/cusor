import Link from "next/link";
import { getAllCountryHubRecords } from "@/lib/country-certifications";
import { GMA_REGIONS, gmaRegionLabel } from "@/lib/gma-regions";
import { createCountryHub } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCountriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const hubs = getAllCountryHubRecords();
  const activeCount = hubs.filter((h) => h.active).length;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">
        Countries
      </h1>
      <p className="text-ink-600 text-sm mb-6 max-w-3xl">
        Country-wise certification guides shown on the homepage (“Where are you selling?”),
        under Certifications → By country, and at{" "}
        <span className="font-mono text-xs">/certifications/countries/…</span>.{" "}
        {activeCount} active of {hubs.length} total.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Region</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 font-semibold">Sort</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {hubs.map((h) => (
              <tr key={h.id} className="hover:bg-cream-50/80">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink-950">{h.name}</div>
                  <div className="text-xs text-ink-500">
                    {h.short_name}
                    {h.featured ? " · Featured" : ""}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-ink-600 hidden md:table-cell">
                  {gmaRegionLabel(h.region)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-600 hidden sm:table-cell">
                  {h.slug}
                </td>
                <td className="px-4 py-3 text-ink-700">{h.sort}</td>
                <td className="px-4 py-3">
                  {h.active ? (
                    <span className="text-xs font-semibold text-emerald-700">Active</span>
                  ) : (
                    <span className="text-xs font-semibold text-ink-400">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/countries/${h.id}`}
                    className="text-sm font-bold text-butter-700 hover:text-butter-600"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {hubs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                  No countries yet — add one below.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 max-w-2xl">
        <h2 className="font-display font-bold text-ink-950 mb-1">Add a country</h2>
        <p className="text-xs text-ink-600 mb-4">
          Creates a country hub page. Then open Edit to add certification schemes, first checks,
          overview copy and FAQs.
        </p>
        <form action={createCountryHub} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Country / market name" name="name" required placeholder="e.g. Brazil" />
            <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Short name" name="short_name" placeholder="e.g. Brazil" />
            <Field
              label="Market id (optional)"
              name="market_id"
              placeholder="e.g. brazil — links market grouping"
            />
          </div>
          <label className="block text-sm">
            <span className="font-semibold text-ink-800">Region</span>
            <select
              name="region"
              defaultValue="asia-pacific"
              className="mt-1.5 w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-butter-500"
            >
              {GMA_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="Menu sort" name="sort" type="number" placeholder="auto" />
          <TextArea
            label="Intro (optional)"
            name="intro"
            rows={2}
            hint="One short line for the country guide hero"
          />
          <SubmitButton label="Create country" />
        </form>
      </div>
    </div>
  );
}
