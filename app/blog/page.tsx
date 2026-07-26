import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBanner from "@/components/CtaBanner";
import TestimonialStrip from "@/components/TestimonialStrip";
import AuthorByline from "@/components/AuthorByline";
import { getPublishedPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compliance Blog | BIS, QCO & Export Certification Insights",
  description:
    "Practical articles on BIS certification costs, QCO deadlines, marketplace compliance and export certifications — written by the Certko team.",
};

function formatDate(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogIndexPage() {
  const posts = getPublishedPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
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
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={520}
                    height={300}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-cream-200" aria-hidden />
                )}
              </Link>
              <div className="p-6 flex flex-col gap-2 flex-1">
                <AuthorByline
                  name={authorName}
                  slug={p.author_slug}
                  date={formatDate(p.published_at)}
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

      <div className="mt-16">
        <TestimonialStrip />
        <CtaBanner />
      </div>
    </div>
  );
}
