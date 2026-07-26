"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import Icon from "@/components/Icon";
import { ADMIN_NAV_GROUPS, isAdminNavActive } from "@/lib/admin-nav";

function ClearCacheButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-butter-500 hover:bg-butter-400 disabled:opacity-60 disabled:cursor-wait px-3 py-2.5 text-sm font-bold text-ink-950 transition"
    >
      <Icon name="zap" size={16} />
      {pending ? "Clearing…" : "Clear cache"}
    </button>
  );
}

export default function AdminNav({
  logoutAction,
  clearCacheAction,
}: {
  logoutAction: () => Promise<void>;
  clearCacheAction: (formData: FormData) => Promise<void>;
}) {
  const pathname = usePathname() || "/admin";

  return (
    <aside className="lg:sticky lg:top-24 self-start bg-white rounded-2xl border border-cream-300 shadow-card p-3">
      <div className="px-3 py-2 mb-1">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Certko Admin</p>
        <p className="text-[11px] text-ink-500 mt-0.5">Organised by work area</p>
      </div>

      <form action={clearCacheAction} className="px-1 mb-3">
        <input type="hidden" name="next" value={pathname} />
        <ClearCacheButton />
      </form>

      <nav className="space-y-4" aria-label="Admin sections">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                        active
                          ? "bg-ink-950 text-cream-50"
                          : "text-ink-800 hover:bg-cream-100"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        size={17}
                        className={active ? "text-butter-400" : "text-ink-500"}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <form action={logoutAction} className="mt-4 border-t border-cream-200 pt-3">
        <button
          type="submit"
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Icon name="logout" size={17} /> Sign Out
        </button>
      </form>
    </aside>
  );
}
