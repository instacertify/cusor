"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import SearchBox from "./SearchBox";
import Icon from "./Icon";

interface NavItem {
  href: string;
  label: string;
}

interface Group {
  label: string;
  items: NavItem[];
}

/** Always-available links if CMS/DB groups fail to serialize on the client. */
const FALLBACK_GROUPS: Group[] = [
  {
    label: "Products",
    items: [
      { href: "/products", label: "Browse by Category" },
      { href: "/products/all", label: "Product Search Table" },
      { href: "/qco", label: "Upcoming QCOs" },
    ],
  },
  {
    label: "Certifications",
    items: [
      { href: "/certifications", label: "All certifications" },
      { href: "/certifications/bis", label: "BIS / ISI Mark" },
      { href: "/certifications/bee", label: "BEE" },
      { href: "/certifications/g-mark", label: "GMARK" },
      { href: "/certifications/ce", label: "CE" },
      { href: "/certifications/fcc", label: "FCC" },
      { href: "/certifications/saber", label: "SABER" },
      { href: "/certifications/wpc", label: "WPC" },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/testing", label: "Product Testing" },
      { href: "/labs", label: "Testing Labs" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Get Expert Help" },
    ],
  },
];

function normalizeGroups(groups: Group[] | undefined | null): Group[] {
  const cleaned = (groups ?? [])
    .map((g) => ({
      label: g?.label ?? "",
      items: (g?.items ?? []).filter((i) => i?.href && i?.label),
    }))
    .filter((g) => g.items.length > 0);
  return cleaned.length > 0 ? cleaned : FALLBACK_GROUPS;
}

export default function MobileNav({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const titleId = useId();
  const navGroups = normalizeGroups(groups);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <div className="lg:hidden fixed inset-0 z-[100]" role="presentation">
            <button
              type="button"
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-ink-950/45"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-0 flex flex-col bg-cream-50 pt-[env(safe-area-inset-top)]"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-cream-200 bg-cream-50">
                <p id={titleId} className="font-display text-base font-semibold text-ink-950">
                  Menu
                </p>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl bg-cream-100 text-ink-950"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <SearchBox placeholder="Search product, IS or HSN…" />

                {navGroups.map((group, gi) => {
                  const isCta =
                    !group.label && group.items.some((i) => i.href === "/contact");
                  if (isCta) {
                    return (
                      <div key={`cta-${gi}`} className="pt-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center min-h-12 rounded-xl bg-butter-500 text-ink-950 font-semibold text-sm"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    );
                  }

                  const long = group.items.length > 8;
                  const isOpen = expanded[gi] ?? !long;
                  const visible = isOpen ? group.items : group.items.slice(0, 6);

                  return (
                    <div key={`group-${gi}-${group.label || "links"}`}>
                      {group.label ? (
                        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                          {group.label}
                        </p>
                      ) : null}
                      <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden divide-y divide-cream-200">
                        {visible.map((item, ii) => (
                          <Link
                            key={`${item.href}-${ii}`}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 min-h-12 px-4 py-3 font-medium text-ink-900 active:bg-cream-100"
                          >
                            <span className="truncate">{item.label}</span>
                            <Icon name="arrow-right" size={14} className="text-ink-400 shrink-0" />
                          </Link>
                        ))}
                      </div>
                      {long ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => ({ ...prev, [gi]: !isOpen }))
                          }
                          className="mt-2 w-full min-h-11 rounded-xl border border-cream-300 bg-white text-sm font-semibold text-ink-800"
                        >
                          {isOpen
                            ? `Show fewer ${group.label || "links"}`
                            : `Show all ${group.items.length} ${group.label || "links"}`}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="lg:hidden ml-auto relative z-[60]">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
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
      {panel}
    </div>
  );
}
