import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Product, Category, Certification, PageRecord } from "@/lib/db";
import {
  getSeoMeta,
  analyzeMarkdown,
  DEFAULT_SCHEMA_TYPES,
} from "@/lib/seo";
import { saveSeo } from "../../../actions";
import SeoEditor, { type SeoEditorData } from "@/components/admin/SeoEditor";
import { SavedBanner } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ entity?: string; saved?: string }>;
}

function loadEntity(entity: string): SeoEditorData | null {
  const [kind, id] = entity.split(":");
  const db = getDb();
  const seoRow = getSeoMeta(entity);
  let schemaTypes: string[] = DEFAULT_SCHEMA_TYPES[kind] ?? [];
  if (seoRow?.schema_types) {
    try {
      const parsed = JSON.parse(seoRow.schema_types);
      if (Array.isArray(parsed)) schemaTypes = parsed;
    } catch {
      /* keep defaults */
    }
  }
  const seo = {
    title: seoRow?.title ?? "",
    description: seoRow?.description ?? "",
    focus_keyword: seoRow?.focus_keyword ?? "",
    secondary_keywords: seoRow?.secondary_keywords ?? "",
    og_title: seoRow?.og_title ?? "",
    og_description: seoRow?.og_description ?? "",
    og_image: seoRow?.og_image ?? "",
    canonical: seoRow?.canonical ?? "",
    robots_index: seoRow?.robots_index ?? 1,
    robots_follow: seoRow?.robots_follow ?? 1,
    robots_noarchive: seoRow?.robots_noarchive ?? 0,
    robots_nosnippet: seoRow?.robots_nosnippet ?? 0,
    sitemap_include: seoRow?.sitemap_include ?? 1,
    schema_types: schemaTypes,
  };

  if (kind === "product") {
    const p = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(id)) as Product | undefined;
    if (!p) return null;
    const a = analyzeMarkdown(p.description);
    return {
      entity, kind, name: p.name, pathPrefix: "/product/", currentSlug: p.slug,
      slugEditable: true, fallbackTitle: p.meta_title || p.name,
      fallbackDescription: p.meta_description,
      contentText: a.text, headings: [p.name, ...a.headings], internalLinks: a.internalLinks,
      words: a.words, image: p.image || "", defaultSchemaTypes: DEFAULT_SCHEMA_TYPES.product, seo,
    };
  }
  if (kind === "category") {
    const c = db.prepare("SELECT * FROM categories WHERE id = ?").get(Number(id)) as Category | undefined;
    if (!c) return null;
    const a = analyzeMarkdown(c.description);
    return {
      entity, kind, name: c.name, pathPrefix: "/category/", currentSlug: c.slug,
      slugEditable: true, fallbackTitle: `${c.name} — BIS Certification Requirements, Costs & Labs`,
      fallbackDescription: c.description,
      contentText: a.text, headings: [c.name], internalLinks: a.internalLinks,
      words: a.words, image: c.image, defaultSchemaTypes: DEFAULT_SCHEMA_TYPES.category, seo,
    };
  }
  if (kind === "cert") {
    const c = db.prepare("SELECT * FROM certifications WHERE id = ?").get(Number(id)) as Certification | undefined;
    if (!c) return null;
    const a = analyzeMarkdown(c.content);
    return {
      entity, kind, name: c.name, pathPrefix: "/certifications/", currentSlug: c.slug,
      slugEditable: true, fallbackTitle: c.meta_title || c.name,
      fallbackDescription: c.meta_description || c.summary,
      contentText: a.text, headings: [c.name, ...a.headings], internalLinks: a.internalLinks,
      words: a.words, image: c.image, defaultSchemaTypes: DEFAULT_SCHEMA_TYPES.cert, seo,
    };
  }
  if (kind === "page") {
    const p = db.prepare("SELECT * FROM pages WHERE slug = ?").get(id) as PageRecord | undefined;
    if (!p) return null;
    const a = analyzeMarkdown(p.content);
    return {
      entity, kind, name: p.title,
      pathPrefix: p.slug === "home" ? "/" : `/`,
      currentSlug: p.slug === "home" ? "" : p.slug,
      slugEditable: false, fallbackTitle: p.meta_title || p.title,
      fallbackDescription: p.meta_description,
      contentText: a.text, headings: [p.hero_heading || p.title, ...a.headings],
      internalLinks: a.internalLinks, words: a.words, image: p.image,
      defaultSchemaTypes: DEFAULT_SCHEMA_TYPES.page, seo,
    };
  }
  return null;
}

export default async function AdminSeoEdit({ searchParams }: Props) {
  const sp = await searchParams;
  const entity = sp.entity ?? "";
  const data = loadEntity(entity);
  if (!data) notFound();

  const viewUrl =
    data.kind === "page"
      ? data.currentSlug === "" ? "/" : `/${data.currentSlug}`
      : `${data.pathPrefix}${data.currentSlug}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-extrabold text-ink-950 leading-snug">
          SEO: {data.name}
        </h1>
        <Link href={viewUrl} target="_blank" className="text-sm font-bold text-butter-700 shrink-0">
          View page ↗
        </Link>
      </div>
      <p className="text-ink-600 text-sm mb-5">
        <Link href="/admin/seo" className="font-bold text-butter-700">← All SEO tools</Link>
      </p>
      <SavedBanner saved={sp.saved} />
      <SeoEditor data={data} action={saveSeo} />
    </div>
  );
}
