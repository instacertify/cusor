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

/** Short-lived client cache so repeated / backspaced queries feel instant. */
const clientCache = new Map<string, Suggestion[]>();
const CLIENT_CACHE_MAX = 40;

export default function SearchBox({
  large = false,
  placeholder = "Search product or certification — BIS, BEE, GMARK, CE…",
}: {
  large?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
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
        setOpen(false);
        return;
      }

      const cached = clientCache.get(query.toLowerCase());
      if (cached) {
        setResults(cached);
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
        const next = (data.results ?? []) as Suggestion[];
        if (clientCache.size >= CLIENT_CACHE_MAX) {
          const first = clientCache.keys().next().value;
          if (first) clientCache.delete(first);
        }
        clientCache.set(query.toLowerCase(), next);
        setResults(next);
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
            onFocus={() => results.length && setOpen(true)}
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

      {open && results.length > 0 && (
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
                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                  r.type === "product"
                    ? "bg-butter-300/50 text-butter-700"
                    : r.type === "cert-product"
                    ? "bg-butter-300/40 text-butter-800"
                    : r.type === "lab"
                    ? "bg-ink-300/30 text-ink-700"
                    : r.type === "certification"
                    ? "bg-green-100 text-green-700"
                    : "bg-cream-200 text-ink-600"
                }`}
              >
                {r.type === "certification"
                  ? "cert"
                  : r.type === "cert-product"
                  ? "scheme"
                  : r.type === "testing-category"
                  ? "testing"
                  : r.type === "testing-service"
                  ? "test"
                  : r.type}
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
    </div>
  );
}
