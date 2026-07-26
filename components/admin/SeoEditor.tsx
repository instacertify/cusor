"use client";

import { useMemo, useState } from "react";

export interface SeoEditorData {
  entity: string;
  kind: "product" | "category" | "cert" | "page";
  name: string;
  pathPrefix: string;
  currentSlug: string;
  slugEditable: boolean;
  fallbackTitle: string;
  fallbackDescription: string;
  contentText: string;
  headings: string[];
  internalLinks: number;
  words: number;
  image: string;
  defaultSchemaTypes: string[];
  seo: {
    title: string;
    description: string;
    focus_keyword: string;
    secondary_keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    canonical: string;
    robots_index: number;
    robots_follow: number;
    robots_noarchive: number;
    robots_nosnippet: number;
    sitemap_include: number;
    schema_types: string[];
  };
}

const SCHEMA_OPTIONS = [
  "Article",
  "FAQPage",
  "Product",
  "Service",
  "BreadcrumbList",
  "HowTo",
  "Organization",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function CharCounter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.length;
  const ok = n >= min && n <= max;
  const over = n > max;
  return (
    <span
      className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${
        n === 0 ? "bg-cream-200 text-ink-500" : ok ? "bg-green-100 text-green-700" : over ? "bg-red-100 text-red-700" : "bg-butter-300/60 text-butter-700"
      }`}
    >
      {n}/{min}–{max}
    </span>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
          ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "text-ink-700" : "text-ink-950 font-medium"}>{label}</span>
    </li>
  );
}

export default function SeoEditor({
  data,
  action,
}: {
  data: SeoEditorData;
  action: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState(data.seo.title || data.fallbackTitle);
  const [description, setDescription] = useState(
    data.seo.description || data.fallbackDescription
  );
  const [slug, setSlug] = useState(data.currentSlug);
  const [focus, setFocus] = useState(data.seo.focus_keyword);
  const [secondary, setSecondary] = useState(data.seo.secondary_keywords);
  const [ogTitle, setOgTitle] = useState(data.seo.og_title);
  const [ogDescription, setOgDescription] = useState(data.seo.og_description);
  const [ogImage, setOgImage] = useState(data.seo.og_image);
  const [canonical, setCanonical] = useState(data.seo.canonical);
  const [robots, setRobots] = useState({
    index: data.seo.robots_index === 1,
    follow: data.seo.robots_follow === 1,
    noarchive: data.seo.robots_noarchive === 1,
    nosnippet: data.seo.robots_nosnippet === 1,
  });
  const [sitemap, setSitemap] = useState(data.seo.sitemap_include === 1);
  const [schemaTypes, setSchemaTypes] = useState<string[]>(data.seo.schema_types);

  const url = `https://certko.com${data.pathPrefix}${data.slugEditable ? slug : data.currentSlug}`;

  const analysis = useMemo(() => {
    const kw = focus.trim().toLowerCase();
    const text = data.contentText.toLowerCase();
    const wordCount = data.words;
    let density = 0;
    let occurrences = 0;
    if (kw && wordCount > 0) {
      occurrences = text.split(kw).length - 1;
      const kwWords = kw.split(/\s+/).length;
      density = ((occurrences * kwWords) / wordCount) * 100;
    }
    const checks = [
      { key: "titleLen", ok: title.length >= 50 && title.length <= 60, pts: 10, label: `SEO title is 50–60 characters (now ${title.length})` },
      { key: "descLen", ok: description.length >= 140 && description.length <= 160, pts: 10, label: `Meta description is 140–160 characters (now ${description.length})` },
      { key: "kwSet", ok: kw.length > 0, pts: 5, label: "Focus keyword is set" },
      { key: "kwTitle", ok: !!kw && title.toLowerCase().includes(kw), pts: 10, label: "Focus keyword appears in the SEO title" },
      { key: "kwDesc", ok: !!kw && description.toLowerCase().includes(kw), pts: 8, label: "Focus keyword appears in the meta description" },
      { key: "kwUrl", ok: !!kw && (data.slugEditable ? slug : data.currentSlug).includes(slugify(kw)), pts: 7, label: "Focus keyword appears in the URL slug" },
      { key: "kwHeading", ok: !!kw && data.headings.some((h) => h.toLowerCase().includes(kw)), pts: 8, label: "Focus keyword appears in a heading" },
      { key: "density", ok: !!kw && density >= 0.3 && density <= 3, pts: 7, label: kw ? `Keyword density 0.3–3% (now ${density.toFixed(1)}%, ${occurrences}×)` : "Keyword density 0.3–3%" },
      { key: "words", ok: wordCount >= 250, pts: 10, label: `Content has 250+ words (now ${wordCount})` },
      { key: "headings", ok: data.headings.length >= 2, pts: 5, label: `Content has 2+ headings (now ${data.headings.length})` },
      { key: "links", ok: data.internalLinks >= 1, pts: 5, label: `Content has internal links (now ${data.internalLinks}) — add links to related pages` },
      { key: "image", ok: !!(ogImage || data.image), pts: 5, label: "Page has an image / social preview image" },
      { key: "ogTitle", ok: !!(ogTitle || title), pts: 3, label: "Open Graph title available" },
      { key: "ogDesc", ok: !!(ogDescription || description), pts: 2, label: "Open Graph description available" },
      { key: "indexable", ok: robots.index, pts: 5, label: "Page is indexable (no noindex)" },
    ];
    const score = checks.reduce((s, c) => s + (c.ok ? c.pts : 0), 0);
    return { checks, score, density, occurrences };
  }, [title, description, slug, focus, ogTitle, ogDescription, ogImage, robots.index, data]);

  const scoreColor =
    analysis.score >= 80 ? "text-green-600" : analysis.score >= 55 ? "text-butter-600" : "text-red-600";

  const inputCls =
    "w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white";
  const labelCls = "flex items-center justify-between text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5";

  return (
    <form action={action} className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <input type="hidden" name="entity" value={data.entity} />
      <div className="space-y-6 min-w-0">
        {/* 1+2: Title & description with SERP preview */}
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Search Appearance</h2>
          <div>
            <label htmlFor="seo-title" className={labelCls}>
              <span>SEO Title</span>
              <CharCounter value={title} min={50} max={60} />
            </label>
            <input id="seo-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="seo-desc" className={labelCls}>
              <span>Meta Description</span>
              <CharCounter value={description} min={140} max={160} />
            </label>
            <textarea id="seo-desc" name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
          </div>
          {/* 3: slug */}
          <div>
            <label htmlFor="seo-slug" className={labelCls}>
              <span>URL Slug {data.slugEditable ? "" : "(fixed for this page)"}</span>
              {data.slugEditable && (
                <button
                  type="button"
                  onClick={() => setSlug(slugify(title || data.name))}
                  className="text-[11px] font-bold text-butter-700 hover:text-butter-600 normal-case"
                >
                  Auto-generate from title
                </button>
              )}
            </label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-ink-500 bg-cream-100 border border-r-0 border-cream-300 rounded-l-xl px-3 py-3">
                {data.pathPrefix}
              </span>
              <input
                id="seo-slug"
                name="slug"
                value={data.slugEditable ? slug : data.currentSlug}
                onChange={(e) => setSlug(slugify(e.target.value) || e.target.value)}
                disabled={!data.slugEditable}
                className={`${inputCls} rounded-l-none disabled:bg-cream-100 disabled:text-ink-500`}
              />
            </div>
            {data.slugEditable && slug !== data.currentSlug && (
              <p className="text-[11px] text-red-600 mt-1">
                Changing the slug changes the public URL — old links will stop working.
              </p>
            )}
          </div>
          {/* SERP preview */}
          <div>
            <p className={labelCls}>Google Preview</p>
            <div className="border border-cream-300 rounded-2xl p-5 bg-cream-50">
              <p className="text-[13px] text-[#202124] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-[10px] font-bold flex items-center justify-center">C</span>
                <span>
                  <span className="block leading-tight">certko.com</span>
                  <span className="block text-[11px] text-[#4d5156] leading-tight">{url}</span>
                </span>
              </p>
              <p className="mt-1.5 text-[19px] leading-snug text-[#1a0dab] hover:underline cursor-pointer truncate">
                {title || "Page title preview"}
              </p>
              <p className="text-[13px] text-[#4d5156] leading-snug line-clamp-2">
                {description || "Meta description preview appears here…"}
              </p>
            </div>
          </div>
        </section>

        {/* 4: keywords */}
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Focus Keywords</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="seo-focus" className={labelCls}><span>Primary Keyword</span></label>
              <input id="seo-focus" name="focus_keyword" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. bis certification led light" className={inputCls} />
            </div>
            <div>
              <label htmlFor="seo-secondary" className={labelCls}><span>Secondary Keywords (comma-separated)</span></label>
              <input id="seo-secondary" name="secondary_keywords" value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder="isi mark, crs registration" className={inputCls} />
            </div>
          </div>
          {focus.trim() && (
            <ul className="grid sm:grid-cols-2 gap-2 bg-cream-50 rounded-xl p-4">
              {analysis.checks
                .filter((c) => ["kwTitle", "kwDesc", "kwUrl", "kwHeading", "density"].includes(c.key))
                .map((c) => (
                  <CheckRow key={c.key} ok={c.ok} label={c.label} />
                ))}
            </ul>
          )}
        </section>

        {/* 5: social */}
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Open Graph & Social Preview</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="og-title" className={labelCls}><span>Social Title</span></label>
              <input id="og-title" name="og_title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder={title} className={inputCls} />
            </div>
            <div>
              <label htmlFor="og-image" className={labelCls}><span>Social Image URL</span></label>
              <input id="og-image" name="og_image" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder={data.image || "/images/hero.png"} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="og-desc" className={labelCls}><span>Social Description</span></label>
            <textarea id="og-desc" name="og_description" rows={2} value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder={description} className={inputCls} />
          </div>
          {/* social preview card */}
          <div className="max-w-md border border-cream-300 rounded-2xl overflow-hidden bg-cream-50">
            {(ogImage || data.image) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogImage || data.image} alt="Social preview" className="w-full h-40 object-cover" />
            )}
            <div className="p-3">
              <p className="text-[11px] uppercase text-ink-500">certko.com</p>
              <p className="text-sm font-bold text-ink-950 line-clamp-1">{ogTitle || title}</p>
              <p className="text-xs text-ink-600 line-clamp-2">{ogDescription || description}</p>
            </div>
          </div>
        </section>

        {/* 6+8+9: canonical, robots, sitemap */}
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Indexing Controls</h2>
          <div>
            <label htmlFor="seo-canonical" className={labelCls}><span>Canonical URL</span></label>
            <input id="seo-canonical" name="canonical" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder={url} className={inputCls} />
            <p className="text-[11px] text-ink-500 mt-1">Leave empty to use the page&apos;s own URL. Set only when this content exists at another primary URL.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { key: "index", on: "Index", off: "NoIndex", checked: robots.index },
                { key: "follow", on: "Follow", off: "NoFollow", checked: robots.follow },
                { key: "noarchive", on: "NoArchive", off: "Archive OK", checked: robots.noarchive },
                { key: "nosnippet", on: "NoSnippet", off: "Snippet OK", checked: robots.nosnippet },
              ] as const
            ).map((r) => (
              <label key={r.key} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold text-center transition ${r.checked ? "border-butter-500 bg-butter-300/30 text-ink-950" : "border-cream-300 bg-cream-50 text-ink-500"}`}>
                <input
                  type="checkbox"
                  name={`robots_${r.key}`}
                  checked={r.checked}
                  onChange={(e) => setRobots({ ...robots, [r.key]: e.target.checked })}
                  className="sr-only"
                />
                {r.key === "index" || r.key === "follow" ? (r.checked ? r.on : r.off) : r.checked ? r.on : r.off}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-800">
            <input type="checkbox" name="sitemap_include" checked={sitemap} onChange={(e) => setSitemap(e.target.checked)} className="w-4 h-4 accent-butter-500" />
            Include this page in the XML sitemap
          </label>
        </section>

        {/* 7: schema */}
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-3">
          <h2 className="font-display font-bold text-ink-950">Schema Markup (JSON-LD)</h2>
          <p className="text-xs text-ink-500">
            Structured data is generated automatically from page content for the selected types.
            Defaults for this page type: {data.defaultSchemaTypes.join(", ") || "none"}.
          </p>
          <div className="flex flex-wrap gap-2">
            {SCHEMA_OPTIONS.map((t) => {
              const checked = schemaTypes.includes(t);
              return (
                <label key={t} className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition ${checked ? "border-butter-500 bg-butter-300/40 text-ink-950" : "border-cream-300 bg-cream-50 text-ink-500"}`}>
                  <input
                    type="checkbox"
                    name="schema_types"
                    value={t}
                    checked={checked}
                    onChange={(e) =>
                      setSchemaTypes(
                        e.target.checked ? [...schemaTypes, t] : schemaTypes.filter((x) => x !== t)
                      )
                    }
                    className="sr-only"
                  />
                  {t}
                </label>
              );
            })}
          </div>
        </section>

        <button className="bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl px-6 py-3 text-sm transition">
          Save SEO Settings
        </button>
      </div>

      {/* 10: score panel */}
      <aside className="lg:sticky lg:top-24 bg-white rounded-2xl border border-cream-300 shadow-card p-6">
        <h2 className="font-display font-bold text-ink-950 mb-3">SEO Analysis</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className={`font-display text-5xl font-extrabold ${scoreColor}`}>{analysis.score}</div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-500">Score / 100</div>
            <div className={`text-sm font-bold ${scoreColor}`}>
              {analysis.score >= 80 ? "Great" : analysis.score >= 55 ? "Needs work" : "Poor"}
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all ${analysis.score >= 80 ? "bg-green-500" : analysis.score >= 55 ? "bg-butter-500" : "bg-red-500"}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
        <ul className="space-y-2.5">
          {analysis.checks.map((c) => (
            <CheckRow key={c.key} ok={c.ok} label={c.label} />
          ))}
        </ul>
      </aside>
    </form>
  );
}
