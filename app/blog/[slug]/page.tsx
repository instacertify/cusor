import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import AuthorByline from "@/components/AuthorByline";
import BlogCoverImage from "@/components/BlogCoverImage";
import Icon from "@/components/Icon";
import NotFoundView from "@/components/NotFoundView";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";
import { isBlogPubliclyVisible } from "@/lib/blog-scheduler";
import { MISSING_PAGE_METADATA } from "@/lib/missing-page";
import { buildMetadata, buildJsonLd, BASE_URL, toIsoDate } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !isBlogPubliclyVisible(post)) return MISSING_PAGE_METADATA;
  return buildMetadata(`post:${post.id}`, {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    openGraphType: "article",
    publishedTime: post.published_at || post.created_at,
    modifiedTime: post.published_at || post.created_at,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !isBlogPubliclyVisible(post)) return <NotFoundView />;
  const more = getPublishedPosts(4).filter((p) => p.id !== post.id).slice(0, 3);
  const authorName = post.author_name || post.author;
  const publishedIso = toIsoDate(post.published_at || post.created_at);

  const jsonLd = buildJsonLd(["Article", "BreadcrumbList"], {
    name: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    image: post.image,
    datePublished: post.published_at || post.created_at,
    dateModified: post.published_at || post.created_at,
    authorName,
    authorUrl: post.author_slug ? `/authors/${post.author_slug}` : undefined,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title },
    ],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      <article className="max-w-3xl mx-auto">
        <AuthorByline
          name={authorName}
          slug={post.author_slug}
          date={formatDate(post.published_at)}
          dateTime={publishedIso}
        />
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">{post.excerpt}</p>
        {post.image && (
          <BlogCoverImage
            src={post.image}
            alt={post.title}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="mt-8 rounded-3xl border border-cream-300 shadow-card object-cover w-full aspect-[16/9]"
          />
        )}
        <div
          className="prose-certko mt-8"
          dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
        />

        {(post.author_slug || authorName) && (
          <aside className="mt-12 rounded-2xl border border-cream-300 bg-cream-50 p-5 sm:p-6">
            <div className="flex gap-4 items-start">
              {post.author_image ? (
                <Image
                  src={post.author_image}
                  alt={authorName}
                  width={72}
                  height={72}
                  className="w-16 h-16 rounded-xl object-cover border border-cream-300 shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl bg-butter-300/50 text-butter-800 flex items-center justify-center font-display text-2xl font-bold shrink-0"
                  aria-hidden
                >
                  {authorName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">About the author</p>
                {post.author_slug ? (
                  <Link
                    href={`/authors/${post.author_slug}`}
                    className="mt-1 inline-block font-display text-xl font-bold text-ink-950 hover:text-butter-700 transition"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <p className="mt-1 font-display text-xl font-bold text-ink-950">{authorName}</p>
                )}
                {post.author_title ? (
                  <p className="text-sm font-semibold text-butter-700">{post.author_title}</p>
                ) : null}
                {post.author_bio ? (
                  <p className="mt-2 text-sm text-ink-600 leading-relaxed line-clamp-4">{post.author_bio}</p>
                ) : null}
                {post.author_slug ? (
                  <Link
                    href={`/authors/${post.author_slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-butter-700 hover:text-butter-600"
                  >
                    View all articles by {authorName} <Icon name="arrow-right" size={14} />
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>
        )}
      </article>

      {more.length > 0 && (
        <section className="mt-16 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-ink-950 mb-6">More from the blog</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {more.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5 flex flex-col gap-2"
              >
                <p className="text-[11px] font-semibold text-ink-500">{formatDate(p.published_at)}</p>
                <h3 className="font-display font-bold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
                  {p.title}
                </h3>
                <span className="mt-auto pt-1 text-sm font-bold text-butter-700 inline-flex items-center gap-1.5">
                  Read <Icon name="arrow-right" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner subject="BIS certification consulting" kind="certification" />
      </div>
    </div>
  );
}
