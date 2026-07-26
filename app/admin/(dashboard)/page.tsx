import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const stats = [
    { label: "Products", value: n("SELECT COUNT(*) AS n FROM products"), href: "/admin/products" },
    { label: "Categories", value: n("SELECT COUNT(*) AS n FROM categories"), href: "/admin/categories" },
    { label: "Testing Labs", value: n("SELECT COUNT(*) AS n FROM labs"), href: "/labs" },
    { label: "FAQs", value: n("SELECT COUNT(*) AS n FROM faqs"), href: "/admin/faqs" },
    { label: "Testimonials", value: n("SELECT COUNT(*) AS n FROM testimonials"), href: "/admin/testimonials" },
    { label: "New Inquiries", value: n("SELECT COUNT(*) AS n FROM inquiries WHERE status='new'"), href: "/admin/inquiries" },
  ];
  const recent = db
    .prepare("SELECT * FROM inquiries ORDER BY id DESC LIMIT 5")
    .all() as { id: number; name: string; email: string; product: string; created_at: string; status: string }[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950">Dashboard</h1>
      <p className="text-ink-600 mt-1 text-sm">
        Manage every field, writeup, image and FAQ shown on the public site.
      </p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
          >
            <div className="font-display text-3xl font-semibold text-ink-950">{s.value.toLocaleString("en-IN")}</div>
            <div className="text-sm font-medium text-ink-600 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold text-ink-950 mt-10 mb-4">Recent Inquiries</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-ink-500">No inquiries yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-cream-200">
                <th className="px-5 py-3 font-bold">Name</th>
                <th className="px-5 py-3 font-bold">Product</th>
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
                    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${r.status === "new" ? "bg-butter-300/50 text-butter-700" : "bg-cream-200 text-ink-600"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
