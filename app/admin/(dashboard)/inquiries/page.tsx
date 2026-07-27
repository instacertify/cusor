import { getDb } from "@/lib/db";
import type { Inquiry } from "@/lib/db";
import { setInquiryStatus } from "../../actions";
import { SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string }>;
}

export default async function AdminInquiries({ searchParams }: Props) {
  const sp = await searchParams;
  const inquiries = getDb()
    .prepare("SELECT * FROM inquiries ORDER BY id DESC LIMIT 200")
    .all() as Inquiry[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Inquiries</h1>
      <p className="text-ink-600 text-sm mb-6">
        Leads from the Contact / Get Expert Help forms and lab testing requests.
      </p>

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
    </div>
  );
}
