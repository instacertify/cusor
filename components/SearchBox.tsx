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
    | "testing-service";
  name: string;
  detail: string;
  href: string;
  matchedTerms?: string[];
}

type BrowseLink = { label: string; href: string; detail?: string };

type EmptyHelp = {
  notFound: true;
  message: string;
  tryQueries: string[];
  browse: BrowseLink[];
  related: Suggestion[];
};

type CacheEntry =
  | { kind: "results"; results: Suggestion[] }
  | { kind: "empty"; help: EmptyHelp };

/** Short-lived client cache so repeated / backspaced queries feel instant. */
const clientCache = new Map<string, CacheEntry>();
const CLIENT_CACHE_MAX = 40;

function typeLabel(type: Suggestion["type"]): string {
  if (type === "certification") return "cert";
  if (type === "cert-product") return "scheme";
  if (type === "testing-category") return "testing";
  if (type === "testing-service") return "test";
  return type;
}

function typeClass(type: Suggestion["type"]): string {
  if (type === "product") return "bg-butter-300/50 text-butter-700";
  if (type === "cert-product") return "bg-butter-300/40 text-butter-800";
  if (type === "lab") return "bg-ink-300/30 text-ink-700";
  if (type === "certification") return "bg-green-100 text-green-700";
  return "bg-cream-200 text-ink-600";
}

export default function SearchBox({
  large = false,
  placeholder = "Search product or certification — BIS, BEE, GMARK, CE…",
}: {
  large?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [emptyHelp, setEmptyHelp] = useState<EmptyHelp | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const query = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (query.length < 2 && !/^\d+$/.test(query)) {
        setResults([]);
        setEmptyHelp(null);
        setOpen(false);
        return;
      }

      const cached = clientCache.get(query.toLowerCase());
      if (cached) {
        if (cached.kind === "results") {
          setResults(cached.results);
          setEmptyHelp(null);
        } else {
          setResults([]);
          setEmptyHelp(cached.help);
        }
        setOpen(true);
        setActive(-1);
        return;
      }

      const id = ++reqId.current;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (id !== reqId.current) return;

        if (clientCache.size >= CLIENT_CACHE_MAX) {
          const first = clientCache.keys().next().value;
          if (first) clientCache.delete(first);
        }

        if (data.notFound) {
          const help: EmptyHelp = {
            notFound: true,
            message: data.message || `No results found for “${query}”`,
            tryQueries: data.tryQueries || [],
            browse: data.browse || [],
            related: data.related || [],
          };
          clientCache.set(query.toLowerCase(), { kind: "empty", help });
          setResults([]);
          setEmptyHelp(help);
        } else {
          const next = (data.results ?? []) as Suggestion[];
          clientCache.set(query.toLowerCase(), { kind: "results", results: next });
          setResults(next);
          setEmptyHelp(null);
        }
        setOpen(true);
        setActive(-1);
      } catch {
        /* aborted */
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

  function submit() {
    if (active >= 0 && results[active]) {
      router.push(results[active].href);
    } else if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
    setOpen(false);
  }

  function applySuggestedQuery(next: string) {
    setQ(next);
    setOpen(true);
  }

  const showDropdown = open && (results.length > 0 || emptyHelp != null);

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
              if (results.length > 0 || emptyHelp) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
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
            className={`w-full min-w-0 bg-transparent outline-none placeholder:text-ink-400 text-ink-950 ${
              large ? "text-base sm:text-lg py-1.5" : "text-sm"
            }`}
          />
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

      {showDropdown && results.length > 0 && (
        <div className="absolute z-40 mt-2 w-full max-h-[min(70vh,28rem)] overflow-y-auto bg-white rounded-2xl border border-cream-300 shadow-card-hover">
          {results.map((r, i) => (
            <Link
              key={r.href}
              href={r.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm border-b border-cream-200 last:border-0 hover:bg-cream-100 ${
                i === active ? "bg-cream-100" : ""
              }`}
            >
              <span className="truncate min-w-0">
                <span className="font-medium text-ink-950">{r.name}</span>
                <span className="block text-xs text-ink-500 truncate">{r.detail}</span>
                {r.matchedTerms && r.matchedTerms.length > 0 ? (
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {r.matchedTerms.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold rounded-md bg-cream-200 text-ink-600 px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${typeClass(r.type)}`}
              >
                {typeLabel(r.type)}
              </span>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(q.trim())}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-butter-700 hover:bg-cream-100"
          >
            See all results for “{q.trim()}” →
          </Link>
        </div>
      )}

      {showDropdown && emptyHelp && (
        <div className="absolute z-40 mt-2 w-full max-h-[min(70vh,32rem)] overflow-y-auto bg-white rounded-2xl border border-cream-300 shadow-card-hover">
          <div className="px-4 py-3 border-b border-cream-200 bg-cream-50">
            <p className="text-sm font-semibold text-ink-950">{emptyHelp.message}</p>
            <p className="text-xs text-ink-600 mt-1">
              Try a shorter keyword, a product name, IS number, or one of the options below.
            </p>
          </div>

          {emptyHelp.tryQueries.length > 0 && (
            <div className="px-4 py-3 border-b border-cream-200">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-2">
                Try searching
              </p>
              <div className="flex flex-wrap gap-2">
                {emptyHelp.tryQueries.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => applySuggestedQuery(term)}
                    className="text-xs font-semibold rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-ink-800 hover:border-butter-500 hover:bg-cream-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {emptyHelp.related.length > 0 && (
            <div className="border-b border-cream-200">
              <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-ink-500">
                Suggested options
              </p>
              {emptyHelp.related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-cream-100 border-b border-cream-100 last:border-0"
                >
                  <span className="truncate min-w-0">
                    <span className="font-medium text-ink-950">{r.name}</span>
                    <span className="block text-xs text-ink-500 truncate">{r.detail}</span>
                  </span>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${typeClass(r.type)}`}
                  >
                    {typeLabel(r.type)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="px-4 py-3 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-1">
              Browse instead
            </p>
            {emptyHelp.browse.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm hover:bg-cream-100"
              >
                <span>
                  <span className="font-semibold text-ink-950">{b.label}</span>
                  {b.detail ? (
                    <span className="block text-xs text-ink-500">{b.detail}</span>
                  ) : null}
                </span>
                <span className="text-butter-700 font-bold">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
