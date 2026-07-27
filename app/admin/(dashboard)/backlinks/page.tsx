import Link from "next/link";
import {
  getBacklinkStats,
  getInternalLinkOpportunities,
  listBacklinks,
} from "@/lib/backlinks";
import {
  saveBacklink,
  deleteBacklinkAction,
  addSuggestedInternalBacklink,
} from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    saved?: string;
    direction?: string;
    status?: string;
    q?: string;
  }>;
}

const inputCls =
  "w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500";

export default async function AdminBacklinksPage({ searchParams }: Props) {
  const sp = await searchParams;
  const direction = (sp.direction ?? "").trim();
  const status = (sp.status ?? "").trim();
  const q = (sp.q ?? "").trim();
  const links = listBacklinks({ direction, status, q });
  const stats = getBacklinkStats();
  const opportunities = getInternalLinkOpportunities(10);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Backlinks</h1>
        <Link
          href="/admin/content-writer"
          className="text-sm font-bold text-butter-700 hover:underline"
        >
          Content Writer →
        </Link>
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Track inbound, outbound and internal links. Use opportunities below to strengthen
        internal linking for SEO.
      </p>
      <SavedBanner saved={sp.saved} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          ["Total", stats.total],
          ["Inbound", stats.inbound],
          ["Outreach", stats.outreach],
          ["Active", stats.active],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-cream-300 bg-white px-4 py-3 shadow-card"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
              {label}
            </p>
            <p className="font-display text-2xl font-semibold text-ink-950">{value}</p>
          </div>
        ))}
      </div>

      <section className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add / update a link</h2>
        <form action={saveBacklink} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Direction
              </label>
              <select name="direction" defaultValue="inbound" className={inputCls}>
                <option value="inbound">Inbound (to Certko)</option>
                <option value="outbound">Outbound (from Certko)</option>
                <option value="internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                Status
              </label>
              <select name="status" defaultValue="pending" className={inputCls}>
                <option value="pending">Pending</option>
                <option value="outreach">Outreach</option>
                <option value="active">Active</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <Field label="Domain rating (optional)" name="domain_rating" type="number" />
            <Field label="Contact email" name="contact_email" type="email" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Source URL"
              name="source_url"
              required
              placeholder="https://partner-site.com/article"
            />
            <Field
              label="Target URL"
              name="target_url"
              required
              placeholder="https://certko.com/product/…"
            />
          </div>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <Field label="Anchor text" name="anchor_text" placeholder="BIS certification for…" />
            <label className="flex items-center gap-2 text-sm text-ink-700 pb-2.5">
              <input type="checkbox" name="rel_nofollow" value="1" className="rounded border-cream-300" />
              nofollow
            </label>
          </div>
          <TextArea label="Notes" name="notes" rows={2} hint="Pitch status, follow-up date, or placement details." />
          <SubmitButton label="Save backlink" />
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-1">Internal link opportunities</h2>
        <p className="text-sm text-ink-600 mb-4">
          High-value pages that published posts rarely link to. Add them to your tracker, then weave
          anchors into new Content Writer drafts.
        </p>
        {opportunities.length === 0 ? (
          <p className="text-sm text-ink-500">No weak internal targets found yet.</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map((o) => (
              <div
                key={`${o.target.kind}:${o.target.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950 truncate">{o.target.title}</p>
                  <p className="text-xs text-ink-500">
                    {o.target.path} · {o.reason} · suggested “{o.target.suggested_anchors[0]}”
                  </p>
                </div>
                <form action={addSuggestedInternalBacklink}>
                  <input type="hidden" name="target_url" value={o.target.path} />
                  <input
                    type="hidden"
                    name="anchor_text"
                    value={o.target.suggested_anchors[0] || o.target.title}
                  />
                  <button
                    type="submit"
                    className="text-xs font-bold rounded-lg bg-ink-900 text-white px-3 py-2 hover:bg-ink-800"
                  >
                    Track link
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200 flex flex-wrap gap-3 items-end justify-between">
          <h2 className="font-display font-bold text-ink-950">Link tracker</h2>
          <form action="/admin/backlinks" method="GET" className="flex flex-wrap gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search URLs / anchors…"
              className="rounded-xl border border-cream-300 px-3 py-2 text-sm outline-none focus:border-butter-500"
            />
            <select name="direction" defaultValue={direction} className={`${inputCls} w-auto`}>
              <option value="">All directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="internal">Internal</option>
            </select>
            <select name="status" defaultValue={status} className={`${inputCls} w-auto`}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="outreach">Outreach</option>
              <option value="active">Active</option>
              <option value="lost">Lost</option>
            </select>
            <button className="bg-ink-900 text-white text-sm font-bold rounded-xl px-4 py-2">
              Filter
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
                <th className="px-5 py-3 font-bold">Link</th>
                <th className="px-5 py-3 font-bold">Direction</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">DR</th>
                <th className="px-5 py-3 font-bold" />
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-ink-500 text-center">
                    No backlinks tracked yet. Add your first link above.
                  </td>
                </tr>
              )}
              {links.map((l) => (
                <tr key={l.id} className="border-b border-cream-100 last:border-0 align-top">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink-950">
                      {l.anchor_text || "(no anchor)"}
                      {l.rel_nofollow ? (
                        <span className="ml-2 text-[10px] font-bold uppercase text-ink-500">
                          nofollow
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-500 break-all">
                      {l.source_url} → {l.target_url}
                    </p>
                    {l.notes ? <p className="text-xs text-ink-600 mt-1">{l.notes}</p> : null}
                  </td>
                  <td className="px-5 py-3 capitalize">{l.direction}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                        l.status === "active"
                          ? "bg-green-100 text-green-700"
                          : l.status === "lost"
                            ? "bg-red-100 text-red-700"
                            : l.status === "outreach"
                              ? "bg-butter-300/60 text-butter-800"
                              : "bg-cream-200 text-ink-600"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">{l.domain_rating ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <ConfirmDeleteForm action={deleteBacklinkAction} itemLabel="this backlink">
                      <input type="hidden" name="id" value={l.id} />
                      <button type="submit" className="text-xs font-bold text-red-700 hover:underline">
                        Delete
                      </button>
                    </ConfirmDeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
