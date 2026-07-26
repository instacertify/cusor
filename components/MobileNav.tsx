"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBox from "./SearchBox";
import Icon from "./Icon";

interface Group {
  label: string;
  items: { href: string; label: string }[];
}

export default function MobileNav({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden ml-auto">
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-cream-200"
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
        <div className="absolute left-0 right-0 top-16 max-h-[80vh] overflow-y-auto bg-cream-50 border-b border-cream-200 shadow-card-hover p-4 space-y-4">
          <SearchBox />
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-2 py-2 rounded-lg font-medium text-ink-800 hover:bg-cream-200"
                >
                  {item.label}
                  <Icon name="arrow-right" size={14} className="text-ink-400" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
