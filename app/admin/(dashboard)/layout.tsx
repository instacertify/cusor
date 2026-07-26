import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { logout } from "../actions";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid lg:grid-cols-[240px_1fr] gap-8">
      <AdminNav logoutAction={logout} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
