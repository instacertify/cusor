"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBox from "./SearchBox";

export default function MobileNav({
  nav,
}: {
  nav: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden ml-auto">
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
        <div className="absolute left-0 right-0 top-16 bg-cream-50 border-b border-cream-200 shadow-card-hover p-4 space-y-3">
          <SearchBox />
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-2 py-2 rounded-lg font-medium text-ink-800 hover:bg-cream-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
