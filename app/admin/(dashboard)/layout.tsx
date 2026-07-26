import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { isAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "chart" },
  { href: "/admin/settings", label: "Site Settings", icon: "settings" },
  { href: "/admin/pages", label: "Pages", icon: "file" },
  { href: "/admin/media", label: "Front Images", icon: "image" },
  { href: "/admin/certifications", label: "Certifications", icon: "award" },
  { href: "/admin/categories", label: "Categories", icon: "folder" },
  { href: "/admin/products", label: "BIS Products", icon: "box" },
  { href: "/admin/qcos", label: "QCO Alerts", icon: "bell" },
  { href: "/admin/blog", label: "Blog", icon: "file" },
  { href: "/admin/seo", label: "SEO Tools", icon: "chart" },
  { href: "/admin/faqs", label: "FAQs", icon: "help" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "star" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inbox" },
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
              <Icon name={item.icon} size={17} className="text-ink-500" /> {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-3 border-t border-cream-200 pt-3">
          <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
            <Icon name="logout" size={17} /> Sign Out
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
