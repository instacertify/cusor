import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import Icon from "@/components/Icon";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";
import { buildMetadata, buildJsonLd, BASE_URL } from "@/lib/seo";

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
  if (!post || post.status !== "published") return {};
  return buildMetadata(`post:${post.id}`, {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();
  const more = getPublishedPosts(4).filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = buildJsonLd(["Article", "BreadcrumbList"], {
    name: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    image: post.image,
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
        <p className="text-xs font-semibold text-ink-500">
          {formatDate(post.published_at)} · {post.author}
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-ink-950 tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">{post.excerpt}</p>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={900}
            height={480}
            priority
            className="mt-8 rounded-3xl border border-cream-300 shadow-card object-cover w-full"
          />
        )}
        <div
          className="prose-certko mt-8"
          dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
        />
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
        <CtaBanner />
      </div>
    </div>
  );
}
