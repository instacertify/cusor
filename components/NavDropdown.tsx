"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import IconChip from "./IconChip";

export interface DropItem {
  href: string;
  label: string;
  detail?: string;
  icon?: string;
  /** Optional market / group heading shown once before consecutive items. */
  section?: string;
}

export default function NavDropdown({
  label,
  items,
  footerItem,
}: {
  label: string;
  items: DropItem[];
  footerItem?: DropItem;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-ink-950 hover:bg-cream-200 transition"
      >
        {label}
        <Icon
          name="chevron"
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="w-72 bg-white rounded-2xl border border-cream-300 shadow-card-hover overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {items.map((item, index) => {
                const prevSection = index > 0 ? items[index - 1]?.section : undefined;
                const showSection = Boolean(item.section && item.section !== prevSection);
                return (
                  <div key={item.href}>
                    {showSection ? (
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                        {item.section}
                      </p>
                    ) : null}
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-100 transition"
                    >
                      {item.icon ? (
                        <IconChip name={item.icon} size={17} chip="sm" tone="neutral" />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-950">{item.label}</span>
                        {item.detail && (
                          <span className="block text-[11px] text-ink-500 truncate">{item.detail}</span>
                        )}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
            {footerItem && (
              <Link
                href={footerItem.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 px-4 py-3 bg-cream-100 border-t border-cream-200 text-sm font-bold text-butter-700 hover:text-butter-600 transition"
              >
                {footerItem.label}
                <Icon name="arrow-right" size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
