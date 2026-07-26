"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

export interface DropItem {
  href: string;
  label: string;
  detail?: string;
  icon?: string;
}

export default function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: DropItem[];
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
          <div className="w-72 bg-white rounded-2xl border border-cream-300 shadow-card-hover overflow-hidden py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-100 transition"
              >
                {item.icon && (
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 text-ink-700 flex items-center justify-center">
                    <Icon name={item.icon} size={17} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-950">{item.label}</span>
                  {item.detail && (
                    <span className="block text-[11px] text-ink-500 truncate">{item.detail}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
