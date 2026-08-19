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
  const showMore = cta.morePostsMode !== "hide" && more.length > 0;

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start w-full">
      {/* Quote box */}
      <section className="rounded-2xl border border-cream-300 bg-ink-950 text-white overflow-hidden shadow-card">
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <h2 className="font-display text-lg sm:text-xl font-semibold leading-snug tracking-tight">
            {cta.heading}
          </h2>
          <p className="mt-2 text-sm text-ink-300 leading-relaxed">{cta.body}</p>
        </div>
        <div className="bg-cream-50 px-4 py-4 text-ink-950">
          <ContactForm
            product={productHint || cta.topic}
            intent={cta.intent}
            stayOnPage
            idPrefix="blog-sidebar"
            submitLabelOverride={cta.submitLabel}
          />
        </div>
      </section>

      {/* Related blogs box */}
      {showMore ? (
        <section className="rounded-2xl border border-cream-300 bg-white shadow-card overflow-hidden flex flex-col min-h-0">
          <div className="px-5 py-4 border-b border-cream-200 bg-cream-50/80">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink-950 leading-snug">
              {cta.moreTitle}
            </h2>
            {cta.moreSubtitle ? (
              <p className="text-xs text-ink-500 mt-1 leading-relaxed">{cta.moreSubtitle}</p>
            ) : null}
          </div>
          <div className="max-h-[26rem] overflow-y-auto overscroll-contain divide-y divide-cream-200">
            {more.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex gap-3 px-4 py-3.5 hover:bg-cream-50 transition"
              >
                {p.image ? (
                  <CmsImage
                    src={p.image}
                    alt=""
                    width={64}
                    height={64}
                    className="w-14 h-14 rounded-lg object-cover border border-cream-200 shrink-0"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-lg bg-cream-100 border border-cream-200 shrink-0"
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-ink-500">
                    {formatDate(p.published_at)}
                  </p>
                  <h3 className="mt-0.5 font-display text-sm font-semibold text-ink-950 leading-snug line-clamp-2 group-hover:text-butter-700 transition">
                    {p.title}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-butter-700">
                    Read <Icon name="arrow-right" size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
