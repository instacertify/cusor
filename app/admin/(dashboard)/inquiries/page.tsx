import { getDb } from "@/lib/db";
import type { Inquiry } from "@/lib/db";
import { setInquiryStatus } from "../../actions";
import { SavedBanner, SubmitButton } from "@/components/admin/Field";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPagination from "@/components/admin/AdminPagination";
import { paginateItems, parseAdminPage } from "@/lib/admin-list";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; q?: string; page?: string; category?: string }>;
}

export default async function AdminInquiries({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = (sp.category ?? "").trim();
  const all = getDb()
    .prepare("SELECT * FROM inquiries ORDER BY id DESC")
    .all() as Inquiry[];
  const filtered = all.filter((i) => {
    if (status && i.status !== status) return false;
    if (!q) return true;
    const blob = [i.name, i.email, i.phone, i.product, i.message, i.intent].join(" ").toLowerCase();
    return blob.includes(q);
  });
  const { items: inquiries, total, page } = paginateItems(filtered, parseAdminPage(sp.page));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Inquiries</h1>
      <p className="text-ink-600 text-sm mb-6">
        Leads from the Contact / Get Expert Help forms and lab testing requests.{" "}
        {total.toLocaleString("en-IN")} shown with filters · 15 per page.
      </p>

      <AdminFilterBar
        action="/admin/inquiries"
        searchValue={q}
        searchPlaceholder="Search name, email, product…"
        categoryName="category"
        categoryValue={status}
        categoryLabel="Status"
        allLabel="All statuses"
        categories={[
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "closed", label: "Closed" },
        ]}
      />

      <SavedBanner
        saved={sp.saved}
        message="Done — inquiry status updated."
      />

      {inquiries.length === 0 ? (
        <p className="text-sm text-ink-500 bg-white rounded-2xl border border-cream-300 p-6">
          No inquiries yet.
        </p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((i) => (
            <div key={i.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-ink-950">{i.name}</h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {i.email}{i.phone ? ` · ${i.phone}` : ""} · {i.created_at} UTC
                    {i.intent ? (
                      <>
                        {" · "}
                        <span className="inline-flex items-center rounded-full bg-butter-300/40 text-butter-800 px-2 py-0.5 font-bold uppercase tracking-wide">
                          {i.intent}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <form action={setInquiryStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={i.id} />
                  <select
                    name="status"
                    defaultValue={i.status}
                    className="rounded-lg border border-cream-300 px-2 py-1.5 text-xs bg-white outline-none"
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="closed">closed</option>
                  </select>
                  <SubmitButton
                    label="Update"
                    className="text-xs font-bold bg-ink-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-60 disabled:cursor-wait"
                  />
                </form>
              </div>
              {i.product && (
                <p className="mt-3 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-500 mr-2">Product</span>
                  {i.product}
                </p>
              )}
              {i.message && (
                <p className="mt-2 text-sm text-ink-700 bg-cream-50 rounded-xl p-3">{i.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <AdminPagination
        page={page}
        total={total}
        path="/admin/inquiries"
        params={{ q, category: status }}
        noun="inquiries"
      />
    </div>
  );
}
