import { getUpcomingQcos } from "@/lib/queries";
import { saveQco, deleteQco } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminQcos({ searchParams }: Props) {
  const sp = await searchParams;
  const qcos = getUpcomingQcos();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink-950 mb-1">QCO Alerts</h1>
      <p className="text-ink-600 text-sm mb-6">
        Upcoming Quality Control Orders shown on the public /qco page and the homepage teaser.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="space-y-4">
        {qcos.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
            <form action={saveQco} className="space-y-3">
              <input type="hidden" name="id" value={q.id} />
              <Field label="Product" name="product" defaultValue={q.product} required />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Ministry / Department" name="ministry" defaultValue={q.ministry} />
                <Field label="IS Standard" name="standard" defaultValue={q.standard} />
              </div>
              <div className="grid sm:grid-cols-4 gap-3">
                <Field label="HSN (4-digit)" name="hsn4" defaultValue={q.hsn4} />
                <Field label="HSN (8-digit)" name="hsn8" defaultValue={q.hsn8} />
                <Field label="Enforcement Date" name="enforcement_date" defaultValue={q.enforcement_date} placeholder="DD-MM-YYYY" />
                <div>
                  <label htmlFor={`scheme-${q.id}`} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                    Scheme
                  </label>
                  <select
                    id={`scheme-${q.id}`}
                    name="scheme"
                    defaultValue={q.scheme}
                    className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
                  >
                    <option value="ISI">ISI</option>
                    <option value="CRS">CRS</option>
                  </select>
                </div>
              </div>
              <SubmitButton label="Save" />
            </form>
            <form action={deleteQco} className="mt-2">
              <input type="hidden" name="id" value={q.id} />
              <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add QCO Alert</h2>
        <form action={saveQco} className="space-y-3">
          <Field label="Product" name="product" required />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Ministry / Department" name="ministry" />
            <Field label="IS Standard" name="standard" />
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <Field label="HSN (4-digit)" name="hsn4" />
            <Field label="HSN (8-digit)" name="hsn8" />
            <Field label="Enforcement Date" name="enforcement_date" placeholder="DD-MM-YYYY" />
            <div>
              <label htmlFor="scheme-new" className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Scheme
              </label>
              <select
                id="scheme-new"
                name="scheme"
                defaultValue="ISI"
                className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
              >
                <option value="ISI">ISI</option>
                <option value="CRS">CRS</option>
              </select>
            </div>
          </div>
          <SubmitButton label="Add" />
        </form>
      </div>
    </div>
  );
}
