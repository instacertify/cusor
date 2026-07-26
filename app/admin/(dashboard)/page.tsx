import Link from "next/link";
import Icon from "@/components/Icon";
import { getDb, getSettings } from "@/lib/db";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { isMailConfigured } from "@/lib/mail";
import { resolveColorScheme } from "@/lib/color-schemes";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const db = getDb();
  const settings = getSettings();
  const scheme = resolveColorScheme(settings.color_scheme);
  const mailReady = isMailConfigured();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;

  const stats = [
    {
      label: "New inquiries",
      value: n("SELECT COUNT(*) AS n FROM inquiries WHERE status='new'"),
      href: "/admin/inquiries",
      tone: "accent" as const,
    },
    {
      label: "Published posts",
      value: n("SELECT COUNT(*) AS n FROM posts WHERE status='published'"),
      href: "/admin/blog",
      tone: "default" as const,
    },
    {
      label: "BIS products",
      value: n("SELECT COUNT(*) AS n FROM products"),
      href: "/admin/products",
      tone: "default" as const,
    },
    {
      label: "Testing services",
      value: n("SELECT COUNT(*) AS n FROM testing_services"),
      href: "/admin/testing",
      tone: "default" as const,
    },
    {
      label: "Certifications",
      value: n("SELECT COUNT(*) AS n FROM certifications"),
      href: "/admin/certifications",
      tone: "default" as const,
    },
    {
      label: "Authors",
      value: n("SELECT COUNT(*) AS n FROM authors"),
      href: "/admin/authors",
      tone: "default" as const,
    },
  ];

  const recent = db
    .prepare("SELECT * FROM inquiries ORDER BY id DESC LIMIT 6")
    .all() as {
    id: number;
    name: string;
    email: string;
    product: string;
    created_at: string;
    status: string;
  }[];

  const hubGroups = ADMIN_NAV_GROUPS.filter((g) => g.id !== "overview");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-950">Dashboard</h1>
          <p className="text-ink-600 mt-1 text-sm">
            Jump into organised admin areas — content, catalogue, blog, SEO and email.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-cream-100 border border-cream-300 px-3 py-1 font-semibold text-ink-700">
            Theme: {scheme.name}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${
              mailReady
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            SMTP: {mailReady ? "Ready" : "Needs setup"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-2xl border shadow-card hover:shadow-card-hover transition p-5 ${
              s.tone === "accent"
                ? "bg-butter-300/30 border-butter-400"
                : "bg-white border-cream-300"
            }`}
          >
            <div className="font-display text-3xl font-semibold text-ink-950">
              {s.value.toLocaleString("en-IN")}
            </div>
            <div className="text-sm font-medium text-ink-600 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-950 mb-1">Admin areas</h2>
        <p className="text-sm text-ink-600 mb-5">
          Same groups as the sidebar — open the tool you need without scanning a long list.
        </p>
        <div className="space-y-6">
          {hubGroups.map((group) => (
            <div key={group.id}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-400 mb-2">
                {group.label}
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-card hover:border-butter-500 hover:shadow-card-hover transition"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink-700 group-hover:bg-butter-300/40 transition">
                      <Icon name={item.icon} size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink-950 group-hover:text-butter-700 transition">
                        {item.label}
                      </span>
                      {item.description ? (
                        <span className="block text-xs text-ink-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl font-bold text-ink-950">Recent inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-bold text-butter-700 hover:text-butter-600">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-500">No inquiries yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
                  <th className="px-5 py-3 font-bold">Name</th>
                  <th className="px-5 py-3 font-bold">Request</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-cream-100 last:border-0">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-ink-950">{r.name}</span>
                      <span className="block text-xs text-ink-500">{r.email}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{r.product || "—"}</td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{r.created_at}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                          r.status === "new"
                            ? "bg-butter-300/50 text-butter-700"
                            : "bg-cream-200 text-ink-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
