"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBox from "./SearchBox";
import Icon from "./Icon";

interface Group {
  label: string;
  items: { href: string; label: string }[];
}

export default function MobileNav({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden ml-auto">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl hover:bg-cream-200 text-ink-950 transition"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[2px]"
            style={{ top: "calc(var(--header-height) + env(safe-area-inset-top))" }}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-cream-50 border-t border-cream-200 shadow-card-hover"
            style={{ top: "calc(var(--header-height) + env(safe-area-inset-top))" }}
          >
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <SearchBox placeholder="Search product, IS or HSN…" />
              {groups.map((group, gi) => {
                const isCta = !group.label && group.items.some((i) => i.href === "/contact");
                if (isCta) {
                  return (
                    <div key={gi} className="pt-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center min-h-12 rounded-xl bg-butter-500 hover:bg-butter-400 text-ink-950 font-semibold text-sm transition"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={gi}>
                    {group.label && (
                      <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                        {group.label}
                      </p>
                    )}
                    <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden divide-y divide-cream-200">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between gap-3 min-h-12 px-4 py-3 font-medium text-ink-900 active:bg-cream-100"
                        >
                          <span className="truncate">{item.label}</span>
                          <Icon name="arrow-right" size={14} className="text-ink-400 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
