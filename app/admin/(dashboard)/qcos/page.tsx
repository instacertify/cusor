import { getUpcomingQcos } from "@/lib/queries";
import { saveQco, deleteQco } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import { paginateItems, parseAdminPage } from "@/lib/admin-list";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string; q?: string; page?: string; category?: string }>;
}

export default async function AdminQcos({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const scheme = (sp.category ?? "").trim();
  const all = getUpcomingQcos();
  const filtered = all.filter((item) => {
    if (scheme && item.scheme !== scheme) return false;
    if (!q) return true;
    return (
      item.product.toLowerCase().includes(q) ||
      (item.standard || "").toLowerCase().includes(q) ||
      (item.ministry || "").toLowerCase().includes(q)
    );
  });
  const { items: qcos, total, page } = paginateItems(filtered, parseAdminPage(sp.page));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">QCO Alerts</h1>
        <BulkImportLink entity="qcos" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Upcoming Quality Control Orders shown on the public /qco page and the homepage teaser. Add one below or bulk-upload via Excel.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <AdminFilterBar
        action="/admin/qcos"
        searchValue={q}
        searchPlaceholder="Search product or standard…"
        categoryName="category"
        categoryValue={scheme}
        categoryLabel="Scheme"
        allLabel="All schemes"
        categories={[
          { value: "ISI", label: "ISI" },
          { value: "CRS", label: "CRS" },
        ]}
      />

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
            <ConfirmDeleteForm action={deleteQco} className="mt-2" itemLabel={`QCO “${q.product}”`}>
              <input type="hidden" name="id" value={q.id} />
              <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
            </ConfirmDeleteForm>
          </div>
        ))}
      </div>
      <AdminPagination
        page={page}
        total={total}
        path="/admin/qcos"
        params={{ q, category: scheme }}
        noun="alerts"
      />

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
