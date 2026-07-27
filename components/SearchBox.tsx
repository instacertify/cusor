"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  type:
    | "product"
    | "category"
    | "lab"
    | "certification"
    | "cert-product"
    | "testing-category"
    | "testing-service"
    | "testing"
    | "browse";
  name: string;
  detail: string;
  href: string;
}

/** Short-lived client cache so repeated / backspaced queries feel instant. */
const clientCache = new Map<string, Suggestion[]>();
const CLIENT_CACHE_MAX = 40;

const FALLBACK_BROWSE: Suggestion[] = [
  {
    type: "browse",
    name: "Browse BIS products",
    detail: "Search the full notified product table",
    href: "/products/all",
  },
  {
    type: "browse",
    name: "Certifications",
    detail: "BIS, BEE, GMARK and more",
    href: "/certifications",
  },
  {
    type: "browse",
    name: "Product testing",
    detail: "Lab test categories and services",
    href: "/testing",
  },
  {
    type: "browse",
    name: "Testing labs",
    detail: "400+ BIS-recognised labs",
    href: "/labs",
  },
  {
    type: "browse",
    name: "Contact Instacertify",
    detail: "Tell us what you need — we reply within 24 hours",
    href: "/contact",
  },
];

export default function SearchBox({
  large = false,
  placeholder = "Search product or certification — BIS, BEE, GMARK, CE…",
  initialQuery = "",
}: {
  large?: boolean;
  placeholder?: string;
  /** Prefill from /search?q=… so the box matches the results page */
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<Suggestion[]>([]);
  /** Query string that produced the current `results` (avoids empty “See all for ”). */
  const [resultsQuery, setResultsQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const query = q.trim();

    // Close immediately when under 2 chars — prevents stale “See all for ””
    if (query.length < 2) {
      setResults([]);
      setResultsQuery("");
      setOpen(false);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const cached = clientCache.get(query.toLowerCase());
      if (cached) {
        setResults(cached);
        setResultsQuery(query);
        setOpen(true);
        setActive(-1);
        setLoading(false);
        return;
      }

      const id = ++reqId.current;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        if (id !== reqId.current) return;
        let next = (data.results ?? []) as Suggestion[];
        // Always offer choices — never a dead dropdown
        if (next.length === 0) {
          next = [
            {
              type: "browse",
              name: `No exact match for “${query}”`,
              detail: "Pick a popular section below, or open full search",
              href: `/search?q=${encodeURIComponent(query)}`,
            },
            ...FALLBACK_BROWSE,
          ];
        }
        if (clientCache.size >= CLIENT_CACHE_MAX) {
          const first = clientCache.keys().next().value;
          if (first) clientCache.delete(first);
        }
        // Don't cache the no-match browse list under the typed key forever empty —
        // cache real hits only
        if ((data.results ?? []).length > 0) {
          clientCache.set(query.toLowerCase(), next);
        }
        setResults(next);
        setResultsQuery(query);
        setOpen(true);
        setActive(-1);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        if (id !== reqId.current) return;
        // Network/API failure — still keep the user on-site with options
        setResults([
          {
            type: "browse",
            name: `Search for “${query}”`,
            detail: "Open the full results page",
            href: `/search?q=${encodeURIComponent(query)}`,
          },
          ...FALLBACK_BROWSE,
        ]);
        setResultsQuery(query);
        setOpen(true);
        setActive(-1);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 120);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goToSearch(term: string) {
    const t = term.trim();
    if (t.length < 2) {
      // Keep user on site — show browse suggestions instead of navigating empty
      setResults(FALLBACK_BROWSE);
      setResultsQuery("");
      setOpen(true);
      setActive(-1);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(t)}`);
    setOpen(false);
  }

  function submit() {
    if (active >= 0 && results[active]) {
      router.push(results[active].href);
      setOpen(false);
      return;
    }
    goToSearch(q);
  }

  const showDropdown = open && results.length > 0;
  const seeAllTerm = resultsQuery.trim() || q.trim();

  return (
    <div ref={boxRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 bg-white rounded-2xl border border-cream-300 focus-within:border-butter-500 focus-within:ring-4 focus-within:ring-butter-300/30 transition ${
          large
            ? "flex-col sm:flex-row px-3 py-3 sm:px-5 sm:py-4 shadow-butter"
            : "px-3 py-2.5 sm:px-4 shadow-card"
        }`}
      >
        <div className={`flex items-center gap-2 w-full ${large ? "px-1 sm:px-0" : ""}`}>
          <svg
            width={large ? 22 : 18}
            height={large ? 22 : 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-ink-400 shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (results.length) setOpen(true);
              else if (q.trim().length < 2) {
                setResults(FALLBACK_BROWSE);
                setResultsQuery("");
                setOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, -1));
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            aria-label="Search products, standards and labs"
            autoComplete="off"
            className={`w-full min-w-0 bg-transparent outline-none placeholder:text-ink-400 text-ink-950 ${
              large ? "text-base sm:text-lg py-1.5" : "text-sm"
            }`}
          />
          {loading ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 shrink-0">
              …
            </span>
          ) : null}
        </div>
        {large && (
          <button
            type="button"
            onClick={submit}
            className="w-full sm:w-auto shrink-0 min-h-11 bg-ink-900 hover:bg-ink-800 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition"
          >
            Check Now
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-40 mt-2 w-full max-h-[min(70vh,28rem)] overflow-y-auto bg-white rounded-2xl border border-cream-300 shadow-card-hover">
          {results.map((r, i) => (
            <Link
              key={`${r.href}-${i}`}
              href={r.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm border-b border-cream-200 last:border-0 hover:bg-cream-100 ${
                i === active ? "bg-cream-100" : ""
              }`}
            >
              <span className="truncate">
                <span className="font-medium text-ink-950">{r.name}</span>
                <span className="block text-xs text-ink-500 truncate">{r.detail}</span>
              </span>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                  r.type === "product"
                    ? "bg-butter-300/50 text-butter-700"
                    : r.type === "cert-product"
                    ? "bg-butter-300/40 text-butter-800"
                    : r.type === "lab"
                    ? "bg-ink-300/30 text-ink-700"
                    : r.type === "certification"
                    ? "bg-green-100 text-green-700"
                    : r.type === "browse"
                    ? "bg-cream-200 text-ink-700"
                    : "bg-cream-200 text-ink-600"
                }`}
              >
                {r.type === "certification"
                  ? "cert"
                  : r.type === "cert-product"
                  ? "scheme"
                  : r.type === "testing-category"
                  ? "testing"
                  : r.type === "testing-service" || r.type === "testing"
                  ? "test"
                  : r.type === "browse"
                  ? "go"
                  : r.type}
              </span>
            </Link>
          ))}
          {seeAllTerm.length >= 2 ? (
            <Link
              href={`/search?q=${encodeURIComponent(seeAllTerm)}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-butter-700 hover:bg-cream-100"
            >
              See all results for “{seeAllTerm}” →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
