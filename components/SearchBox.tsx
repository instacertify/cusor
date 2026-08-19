"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type SearchScope = "all" | "standard" | "lab" | "certification";

interface Suggestion {
  type:
    | "product"
    | "category"
    | "lab"
    | "certification"
    | "cert-product"
    | "country"
    | "testing-category"
    | "testing-service"
    | "testing"
    | "blog"
    | "browse";
  name: string;
  detail: string;
  href: string;
}

/** Short-lived client cache so repeated / backspaced queries feel instant. */
const clientCache = new Map<string, Suggestion[]>();
const CLIENT_CACHE_MAX = 40;

const SCOPE_META: Record<
  SearchScope,
  { label: string; placeholder: string; pageType: string; browse: Suggestion[] }
> = {
  all: {
    label: "Search",
    placeholder: "Search product, IS standard, certification, lab or blog…",
    pageType: "",
    browse: [
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
        name: "Certifications by country",
        detail: "India, EU, USA, GCC, Saudi Arabia",
        href: "/certifications/countries",
      },
      {
        type: "browse",
        name: "Compliance blog",
        detail: "Search articles on BIS, QCO, testing & export",
        href: "/blog",
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
    ],
  },
  standard: {
    label: "Search standard",
    placeholder: "Search by IS / IEC standard or product name…",
    pageType: "products",
    browse: [
      {
        type: "browse",
        name: "Open product search table",
        detail: "Filter by IS standard, HSN, QCO status",
        href: "/products/all",
      },
      {
        type: "browse",
        name: "Browse BIS categories",
        detail: "33 notified product categories",
        href: "/products",
      },
      {
        type: "browse",
        name: "Upcoming QCOs",
        detail: "Standards becoming mandatory soon",
        href: "/qco",
      },
    ],
  },
  lab: {
    label: "Search lab",
    placeholder: "Search lab name or city…",
    pageType: "labs",
    browse: [
      {
        type: "browse",
        name: "All testing labs",
        detail: "400+ BIS-recognised laboratories",
        href: "/labs",
      },
      {
        type: "browse",
        name: "Find labs by search",
        detail: "Filter by state and keyword",
        href: "/search?type=labs",
      },
      {
        type: "browse",
        name: "Product testing",
        detail: "Compare test categories first",
        href: "/testing",
      },
    ],
  },
  certification: {
    label: "Search certification",
    placeholder: "Search BIS, BEE, GMARK, CE, FCC, SABER…",
    pageType: "certs",
    browse: [
      {
        type: "browse",
        name: "By country",
        detail: "Search certifications country wise",
        href: "/certifications/countries",
      },
      {
        type: "browse",
        name: "All certifications",
        detail: "BIS, BEE, GMARK, CE, FCC, SABER, WPC",
        href: "/certifications",
      },
      {
        type: "browse",
        name: "BIS / ISI Mark",
        detail: "Indian mandatory product certification",
        href: "/certifications/bis",
      },
      {
        type: "browse",
        name: "BEE Star Rating",
        detail: "Energy efficiency labelling",
        href: "/certifications/bee",
      },
    ],
  },
};

function searchPageHref(term: string, scope: SearchScope): string {
  const params = new URLSearchParams();
  if (term.trim()) params.set("q", term.trim());
  const pageType = SCOPE_META[scope].pageType;
  if (pageType) params.set("type", pageType);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function SearchBox({
  large = false,
  compact = false,
  placeholder,
  initialQuery = "",
  showScopes = false,
  initialScope = "all",
}: {
  large?: boolean;
  /** Compact header/toolbar search — quieter chrome, shorter control */
  compact?: boolean;
  placeholder?: string;
  /** Prefill from /search?q=… so the box matches the results page */
  initialQuery?: string;
  /** Show Search standard / Search / Search lab / Search certification chips */
  showScopes?: boolean;
  initialScope?: SearchScope;
}) {
  const [q, setQ] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [results, setResults] = useState<Suggestion[]>([]);
  /** Query string that produced the current `results` (avoids empty “See all for ”). */
  const [resultsQuery, setResultsQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const meta = SCOPE_META[scope];
  const effectivePlaceholder = placeholder ?? meta.placeholder;
  const browseFallback = meta.browse;

  useEffect(() => {
    const query = q.trim();

    // Close immediately when under 2 chars — prevents stale “See all for ”
    if (query.length < 2) {
      setResults([]);
      setResultsQuery("");
      setOpen(false);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const cacheKey = `${scope}:${query.toLowerCase()}`;
      const cached = clientCache.get(cacheKey);
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
        const apiType =
          scope === "all"
            ? ""
            : scope === "standard"
              ? "standard"
              : scope === "lab"
                ? "lab"
                : "certification";
        const url = `/api/search?q=${encodeURIComponent(query)}${
          apiType ? `&type=${apiType}` : ""
        }`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        if (id !== reqId.current) return;
        let next = (data.results ?? []) as Suggestion[];
        // Always offer choices — never a dead dropdown
        if (next.length === 0) {
          next = [
            {
              type: "browse",
              name: `See closely related results for “${query}”`,
              detail: "Open full search with related matches and other options",
              href: searchPageHref(query, scope),
            },
            ...browseFallback,
          ];
        }
        if (clientCache.size >= CLIENT_CACHE_MAX) {
          const first = clientCache.keys().next().value;
          if (first) clientCache.delete(first);
        }
        if ((data.results ?? []).length > 0) {
          clientCache.set(cacheKey, next);
        }
        setResults(next);
        setResultsQuery(query);
        setOpen(true);
        setActive(-1);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        if (id !== reqId.current) return;
        setResults([
          {
            type: "browse",
            name: `Search for “${query}”`,
            detail: "Open the full results page",
            href: searchPageHref(query, scope),
          },
          ...browseFallback,
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
  }, [q, scope]);

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
      setResults(browseFallback);
      setResultsQuery("");
      setOpen(true);
      setActive(-1);
      return;
    }
    router.push(searchPageHref(t, scope));
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

  function selectScope(next: SearchScope) {
    setScope(next);
    setActive(-1);
    clientCache.clear();
    if (q.trim().length < 2) {
      setResults(SCOPE_META[next].browse);
      setResultsQuery("");
      setOpen(true);
    }
    inputRef.current?.focus();
  }

  const showDropdown = open && results.length > 0;
  const seeAllTerm = resultsQuery.trim() || q.trim();
  const scopes: SearchScope[] = ["standard", "all", "lab", "certification"];

  return (
    <div ref={boxRef} className="relative w-full">
      {showScopes ? (
        <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Search type">
          {scopes.map((key) => {
            const activeScope = key === scope;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeScope}
                onClick={() => selectScope(key)}
                className={`inline-flex min-h-10 items-center rounded-xl px-3.5 py-2 text-sm font-semibold border transition ${
                  activeScope
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-white/90 text-ink-800 border-cream-300 hover:border-butter-500 backdrop-blur"
                }`}
              >
                {SCOPE_META[key].label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={`flex items-center gap-2 bg-white border border-cream-300 focus-within:border-butter-500 focus-within:ring-4 focus-within:ring-butter-300/30 transition ${
          large
            ? "flex-col sm:flex-row rounded-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-butter"
            : compact
              ? "rounded-xl px-2.5 py-2 shadow-none"
              : "rounded-2xl px-3 py-2.5 sm:px-4 shadow-card"
        }`}
      >
        <div className={`flex items-center gap-2 w-full ${large ? "px-1 sm:px-0" : ""}`}>
          <svg
            width={large ? 22 : compact ? 16 : 18}
            height={large ? 22 : compact ? 16 : 18}
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
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (results.length) setOpen(true);
              else if (q.trim().length < 2) {
                setResults(browseFallback);
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
            placeholder={effectivePlaceholder}
            aria-label={meta.label}
            autoComplete="off"
            className={`w-full min-w-0 bg-transparent outline-none placeholder:text-ink-400 text-ink-950 ${
              large ? "text-base sm:text-lg py-1.5" : compact ? "text-[13px]" : "text-sm"
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
            Search
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
                    : r.type === "country"
                    ? "bg-sky-100 text-sky-800"
                    : r.type === "blog"
                    ? "bg-amber-100 text-amber-800"
                    : r.type === "browse"
                    ? "bg-cream-200 text-ink-700"
                    : "bg-cream-200 text-ink-600"
                }`}
              >
                {r.type === "certification"
                  ? "cert"
                  : r.type === "cert-product"
                  ? "scheme"
                  : r.type === "country"
                  ? "market"
                  : r.type === "testing-category"
                  ? "testing"
                  : r.type === "testing-service" || r.type === "testing"
                  ? "test"
                  : r.type === "blog"
                  ? "blog"
                  : r.type === "browse"
                  ? "go"
                  : r.type === "product"
                  ? "standard"
                  : r.type}
              </span>
            </Link>
          ))}
          {seeAllTerm.length >= 2 ? (
            <Link
              href={searchPageHref(seeAllTerm, scope)}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-butter-700 hover:bg-cream-100"
            >
              See all {meta.label.toLowerCase()} results for “{seeAllTerm}” →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
