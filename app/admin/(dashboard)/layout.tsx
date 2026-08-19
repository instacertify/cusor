import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { ensureDbReady } from "@/lib/db";
import { logout, clearSiteCache } from "../actions";
import AdminNav from "@/components/admin/AdminNav";
import AdminBusyBar from "@/components/admin/AdminBusyBar";
import AdminCacheClearedBanner from "@/components/admin/AdminCacheClearedBanner";
import HardRedirect from "@/components/HardRedirect";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDbReady();
  if (!(await isAdmin())) {
    return <HardRedirect href="/admin/login?error=session" />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <AdminBusyBar />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-8 grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start gap-6 lg:gap-8">
        <AdminNav logoutAction={logout} clearCacheAction={clearSiteCache} />
        <div className="min-w-0">
          <Suspense fallback={null}>
            <AdminCacheClearedBanner />
          </Suspense>
          {children}
        </div>
      </div>
    </>
  );
}
