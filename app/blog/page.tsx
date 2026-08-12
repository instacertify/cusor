import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import AuthorByline from "@/components/AuthorByline";
import BlogPagination, { BLOG_PAGE_SIZE } from "@/components/BlogPagination";
import BlogCoverImage from "@/components/BlogCoverImage";
import {
  countPublishedPosts,
  countSearchPublishedPosts,
  getPublishedPosts,
  searchPublishedPosts,
} from "@/lib/queries";
import {
  BASE_URL,
  buildMetadata,
  toIsoDate,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Param = string | string[] | undefined;

function param(v: Param): string | undefined {
  if (Array.isArray(v)) {
    const hit = v.find((x) => typeof x === "string" && x.trim() !== "");
    return hit ?? v[0];
  }
  return v;
}

interface Props {
  searchParams: Promise<{ page?: Param; q?: Param }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = (param(sp.q) ?? "").trim();
  const page = Math.max(1, Number(param(sp.page)) || 1);
  const total = q.length >= 2 ? countSearchPublishedPosts(q) : countPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const isFirst = safePage <= 1 && !q;

  return buildMetadata("page:blog", {
    title: q
      ? `Blog search: ${q}`
      : isFirst
        ? "Compliance Blog — BIS, QCO & Export Insights"
        : `Compliance Blog — Page ${safePage}`,
    description:
      "Practical articles on BIS certification costs, QCO deadlines, marketplace compliance and export certifications — written by the Certko team.",
    path: q
      ? `/blog?q=${encodeURIComponent(q)}${safePage > 1 ? `&page=${safePage}` : ""}`
      : isFirst
        ? "/blog"
        : `/blog?page=${safePage}`,
    index: isFirst,
    follow: true,
  });
}

function formatDate(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (param(sp.q) ?? "").trim();
  const searching = q.length >= 2;
  const requested = Math.max(1, Number(param(sp.page)) || 1);
  const total = searching ? countSearchPublishedPosts(q) : countPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const posts = searching
    ? searchPublishedPosts(q, BLOG_PAGE_SIZE, (page - 1) * BLOG_PAGE_SIZE)
    : getPublishedPosts(BLOG_PAGE_SIZE, (page - 1) * BLOG_PAGE_SIZE);

  const itemListJsonLd =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: posts.map((p, i) => ({
            "@type": "ListItem",
            position: (page - 1) * BLOG_PAGE_SIZE + i + 1,
            url: `${BASE_URL}/blog/${p.slug}`,
            name: p.title,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: "Blog" }]} />
      <h1 className="font-display text-4xl font-semibold text-ink-950 tracking-tight">
        Compliance Blog
      </h1>
      <p className="mt-3 text-ink-600 max-w-2xl">
        Practical, data-backed articles on BIS certification, QCO deadlines, testing
        costs and selling compliant products in India and abroad.
      </p>

      <form action="/blog" method="GET" className="mt-8 max-w-xl flex gap-2" role="search">
        <label htmlFor="blog-search" className="sr-only">
          Search blog articles
        </label>
        <input
          id="blog-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search articles (BIS, EMI, MSDS, export…)"
          className="flex-1 min-w-0 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-butter-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold px-5 py-2.5 transition"
        >
          Search
        </button>
        {q ? (
          <Link
            href="/blog"
            className="shrink-0 inline-flex items-center rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:border-butter-500"
          >
            Clear
          </Link>
        ) : null}
      </form>
      {searching ? (
        <p className="mt-3 text-sm text-ink-600">
          {total} article{total === 1 ? "" : "s"} matching “{q}”
        </p>
      ) : null}

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => {
          const authorName = p.author_name || p.author;
          return (
            <article
              key={p.id}
              className="bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition overflow-hidden flex flex-col"
            >
              <Link href={`/blog/${p.slug}`} className="block">
                {p.image ? (
                  <BlogCoverImage
                    src={p.image}
                    alt={p.title}
                    className="w-full aspect-[16/9] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[16/9] bg-cream-200" aria-hidden />
                )}
              </Link>
              <div className="p-6 flex flex-col gap-2 flex-1">
                <AuthorByline
                  name={authorName}
                  slug={p.author_slug}
                  date={formatDate(p.published_at)}
                  dateTime={toIsoDate(p.published_at) || undefined}
                />
                <Link href={`/blog/${p.slug}`} className="group flex flex-col gap-2 flex-1">
                  <h2 className="font-display text-lg font-bold text-ink-950 leading-snug group-hover:text-butter-700 transition">
                    {p.title}
                  </h2>
                  <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{p.excerpt}</p>
                  <span className="mt-auto pt-2 text-sm font-bold text-butter-700">Read article →</span>
                </Link>
              </div>
            </article>
          );
        })}
        {posts.length === 0 && (
          <p className="text-sm text-ink-500">
            {searching
              ? `No articles matched “${q}”. Try a shorter keyword, or browse all posts.`
              : "No articles published yet — check back soon."}
            {searching ? (
              <>
                {" "}
                <Link href="/blog" className="font-semibold text-butter-700 hover:underline">
                  Clear search
                </Link>
              </>
            ) : null}
          </p>
        )}
      </div>

      <BlogPagination page={page} totalPages={totalPages} totalPosts={total} q={q} />

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
