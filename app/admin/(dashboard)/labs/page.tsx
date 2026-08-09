import Link from "next/link";
import { getLabs, getCategories, countLabs } from "@/lib/queries";
import { formatPriceRange } from "@/lib/format";
import { createLab } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

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
  searchParams: Promise<{
    q?: string;
    state?: string;
    page?: string;
    saved?: string;
    error?: string;
  }>;
}

export default async function AdminLabs({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const state = (sp.state ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const totalAll = countLabs();
  const { labs, total } = getLabs({
    q: q || undefined,
    state: state || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categories = getCategories();

  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (state) u.set("state", state);
    u.set("page", String(p));
    return `/admin/labs?${u.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Labs</h1>
      </div>
      <p className="text-ink-600 text-sm mb-6">
        {totalAll.toLocaleString("en-IN")} labs in the directory. Add or edit location,
        accreditation (NABL / BIS recognition), testing scopes, price range and categories.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-1">Add a lab</h2>
        <p className="text-xs text-ink-600 mb-4">
          Public page: <span className="font-mono">/labs/…</span>. Contact person details are not
          collected — visitors use Contact Instacertify.
        </p>
        <form action={createLab} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Lab name" name="name" required placeholder="e.g. Spectro Analytical Labs" />
            <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="BIS lab code" name="code" placeholder="e.g. TL/…" />
            <Field label="City / Location" name="city" placeholder="e.g. Noida" />
            <Field label="State" name="state" placeholder="e.g. Uttar Pradesh" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Accreditation"
              name="accreditation"
              placeholder="e.g. NABL / BIS Recognised / TEC"
            />
            <Field
              label="Recognition valid till"
              name="validity"
              placeholder="e.g. 31 Dec 2027"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Testing scopes" name="scope_count" type="number" placeholder="e.g. 30" />
            <Field
              label="Min price (₹)"
              name="min_price"
              type="number"
              placeholder="e.g. 5000"
            />
            <Field
              label="Max price (₹)"
              name="max_price"
              type="number"
              placeholder="e.g. 1350000"
            />
          </div>
          <div>
            <p className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Categories
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-white rounded-xl border border-cream-300 p-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-start gap-2 text-sm text-ink-800">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.name}
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
                placeholder="Optional tags not in the list above"
              />
            </div>
          </div>
          <SubmitButton label="Create lab" />
        </form>
      </div>

      <form method="get" className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or city…"
          className="flex-1 min-w-[200px] rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
        />
        <input
          type="text"
          name="state"
          defaultValue={state}
          placeholder="Filter by state"
          className="w-48 rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
        />
        <button
          type="submit"
          className="rounded-xl bg-ink-950 text-cream-50 px-4 py-2.5 text-sm font-bold hover:bg-ink-800"
        >
          Search
        </button>
      </form>

      <p className="text-xs text-ink-500 mb-3">
        Showing {labs.length} of {total.toLocaleString("en-IN")}
        {q || state ? " (filtered)" : ""}
      </p>

      <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <ul className="divide-y divide-cream-100">
          {labs.length === 0 ? (
            <li className="px-5 py-8 text-sm text-ink-600">No labs match this search.</li>
          ) : (
            labs.map((lab) => {
              const cats = parseLabCategories(lab.categories);
              const location = [lab.city, lab.state].filter(Boolean).join(", ") || "—";
              return (
                <li key={lab.id}>
                  <Link
                    href={`/admin/labs/${lab.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-cream-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink-950 truncate">
                        {lab.name}
                      </span>
                      <span className="block text-xs text-ink-500 truncate">
                        {location}
                        {lab.code ? ` · ${lab.code}` : ""}
                        {lab.accreditation ? ` · ${lab.accreditation}` : ""}
                        {" · "}
                        {lab.scope_count} scopes · {formatPriceRange(lab.min_price, lab.max_price)}
                        {cats.length ? ` · ${cats.length} categor${cats.length === 1 ? "y" : "ies"}` : ""}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-butter-700 shrink-0">Edit →</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="contents">
                {idx > 0 && arr[idx - 1] !== p - 1 ? (
                  <span className="text-ink-400 px-1">…</span>
                ) : null}
                <Link
                  href={qs(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                    p === page
                      ? "bg-ink-950 text-cream-50"
                      : "bg-cream-100 text-ink-700 hover:bg-cream-200"
                  }`}
                >
                  {p}
                </Link>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
