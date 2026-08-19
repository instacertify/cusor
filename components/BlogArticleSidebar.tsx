import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import CmsImage from "@/components/CmsImage";
import Icon from "@/components/Icon";
import type { Post } from "@/lib/db";
import type { BlogSidebarCtaResolved } from "@/lib/blog-sidebar-cta";

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogArticleSidebar({
  cta,
  more,
  productHint,
}: {
  cta: BlogSidebarCtaResolved;
  more: Post[];
  productHint: string;
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
      <div className="rounded-3xl border border-cream-300 bg-gradient-to-br from-ink-900 to-ink-800 text-white p-6 sm:p-7 shadow-card-hover">
        <h2 className="font-display text-xl font-bold leading-snug">{cta.heading}</h2>
        <p className="mt-2 text-sm text-ink-300 leading-relaxed">{cta.body}</p>
        <div className="mt-5 rounded-2xl bg-white p-4 text-ink-950">
          <ContactForm
            product={productHint || cta.topic}
            intent={cta.intent}
            stayOnPage
            idPrefix="blog-sidebar"
            submitLabelOverride={cta.submitLabel}
          />
        </div>
      </div>

      {cta.morePostsMode === "default" && more.length > 0 ? (
        <div className="rounded-3xl border border-cream-300 bg-white shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-cream-200">
            <h2 className="font-display text-lg font-bold text-ink-950">More from the blog</h2>
            <p className="text-xs text-ink-500 mt-0.5">Scroll for more articles</p>
          </div>
          <div className="max-h-[28rem] overflow-y-auto overscroll-contain divide-y divide-cream-200">
            {more.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex gap-3 p-4 hover:bg-cream-50 transition"
              >
                {p.image ? (
                  <CmsImage
                    src={p.image}
                    alt=""
                    width={72}
                    height={72}
                    className="w-16 h-16 rounded-xl object-cover border border-cream-200 shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl bg-cream-100 border border-cream-200 shrink-0"
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-ink-500">
                    {formatDate(p.published_at)}
                  </p>
                  <h3 className="mt-0.5 font-display text-sm font-bold text-ink-950 leading-snug line-clamp-3 group-hover:text-butter-700 transition">
                    {p.title}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-butter-700">
                    Read <Icon name="arrow-right" size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
