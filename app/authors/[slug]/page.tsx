import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import BlogCoverImage from "@/components/BlogCoverImage";
import { getAuthorBySlug, getPublishedPostsByAuthor } from "@/lib/queries";
import { BASE_URL, absoluteUrl, buildJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  const description =
    author.bio ||
    `Articles by ${author.name}${author.title ? `, ${author.title}` : ""} on Certko.`;
  return buildMetadata(`author:${author.id}`, {
    title: `${author.name} — Certko Authors`,
    description: description.slice(0, 160),
    path: `/authors/${author.slug}`,
    image: author.image || undefined,
  });
}

export default async function AuthorProfilePage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();
  const posts = getPublishedPostsByAuthor(author.id);

  const jsonLd = buildJsonLd(["BreadcrumbList"], {
    name: author.name,
    description: author.bio || "",
    url: `${BASE_URL}/authors/${author.slug}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: author.name },
    ],
  });
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${BASE_URL}/authors/${author.slug}`,
    ...(author.title ? { jobTitle: author.title } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.image ? { image: absoluteUrl(author.image) } : {}),
    worksFor: { "@type": "Organization", name: "Certko", url: BASE_URL },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Breadcrumbs
        crumbs={[
          { label: "Blog", href: "/blog" },
          { label: author.name },
        ]}
      />

      <section className="max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
          {author.image ? (
            <Image
              src={author.image}
              alt={author.name}
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-cream-300 shrink-0"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-butter-300/50 text-butter-800 flex items-center justify-center font-display text-3xl font-bold shrink-0"
              aria-hidden
            >
              {author.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Author</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-ink-950 tracking-tight">
              {author.name}
            </h1>
            {author.title ? (
              <p className="mt-1 text-sm font-semibold text-butter-700">{author.title}</p>
            ) : null}
            {author.bio ? (
              <p className="mt-4 text-ink-600 leading-relaxed whitespace-pre-wrap">{author.bio}</p>
            ) : (
              <p className="mt-4 text-ink-500 text-sm">
                Compliance articles and practical guides from {author.name}.
              </p>
            )}
            <p className="mt-3 text-xs font-semibold text-ink-500">
              {posts.length} published {posts.length === 1 ? "article" : "articles"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink-950 mb-6">
          Articles by {author.name}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group bg-white rounded-3xl border border-cream-300 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition overflow-hidden flex flex-col"
            >
              {p.image ? (
                <BlogCoverImage
                  src={p.image}
                  alt={p.title}
                  className="w-full aspect-[16/9] object-cover"
                />
              ) : (
                <div className="w-full aspect-[16/9] bg-cream-200" aria-hidden />
              )}
              <div className="p-6 flex flex-col gap-2 flex-1">
                <p className="text-xs font-semibold text-ink-500">{formatDate(p.published_at)}</p>
                <h3 className="font-display text-lg font-bold text-ink-950 leading-snug group-hover:text-butter-700 transition">
                  {p.title}
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed line-clamp-3">{p.excerpt}</p>
                <span className="mt-auto pt-2 text-sm font-bold text-butter-700">Read article →</span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="text-sm text-ink-500">No published articles from this author yet.</p>
        )}
      </section>

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
