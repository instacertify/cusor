import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙️" },
  { href: "/admin/pages", label: "Pages", icon: "📄" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/faqs", label: "FAQs", icon: "❓" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "⭐" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "📥" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside className="lg:sticky lg:top-24 self-start bg-white rounded-2xl border border-cream-300 shadow-card p-3">
        <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-500">
          Content Admin
        </p>
        <nav className="space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-ink-800 hover:bg-cream-100"
            >
              <span aria-hidden>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-3 border-t border-cream-200 pt-3">
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
            <span aria-hidden>🚪</span> Sign Out
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
