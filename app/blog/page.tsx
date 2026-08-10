import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import AuthorByline from "@/components/AuthorByline";
import BlogPagination, { BLOG_PAGE_SIZE } from "@/components/BlogPagination";
import BlogCoverImage from "@/components/BlogCoverImage";
import { countPublishedPosts, getPublishedPosts } from "@/lib/queries";
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
  searchParams: Promise<{ page?: Param }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, Number(param(sp.page)) || 1);
  const total = countPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const isFirst = safePage <= 1;

  return buildMetadata("page:blog", {
    title: isFirst
      ? "Compliance Blog — BIS, QCO & Export Insights"
      : `Compliance Blog — Page ${safePage}`,
    description:
      "Practical articles on BIS certification costs, QCO deadlines, marketplace compliance and export certifications — written by the Certko team.",
    // Paginated listings stay crawlable for discovery but avoid competing with page 1.
    path: isFirst ? "/blog" : `/blog?page=${safePage}`,
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
  const requested = Math.max(1, Number(param(sp.page)) || 1);
  const total = countPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const posts = getPublishedPosts(BLOG_PAGE_SIZE, (page - 1) * BLOG_PAGE_SIZE);

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
          <p className="text-sm text-ink-500">No articles published yet — check back soon.</p>
        )}
      </div>

      <BlogPagination page={page} totalPages={totalPages} totalPosts={total} />

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
