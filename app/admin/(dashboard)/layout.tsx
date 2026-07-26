import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { ensureDbReady } from "@/lib/db";
import { logout } from "../actions";
import AdminNav from "@/components/admin/AdminNav";
import AdminBusyBar from "@/components/admin/AdminBusyBar";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDbReady();
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid lg:grid-cols-[240px_1fr] gap-8">
      <Suspense fallback={null}>
        <AdminBusyBar />
      </Suspense>
      <AdminNav logoutAction={logout} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
