import ContactForm from "@/components/ContactForm";
import BlogMorePostsList from "@/components/BlogMorePostsList";
import type { Post } from "@/lib/db";
import type { BlogSidebarCtaResolved } from "@/lib/blog-sidebar-cta";

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
    <aside
      className={
        "flex w-full flex-col gap-5 " +
        /* Stick with page scroll only — no scrollbar on the sidebar itself */
        "lg:sticky lg:top-24 lg:z-20 lg:self-start"
      }
    >
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

      {showMore ? (
        <BlogMorePostsList
          title={cta.moreTitle}
          subtitle={cta.moreSubtitle}
          posts={more.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            image: p.image || "",
            published_at: p.published_at,
          }))}
        />
      ) : null}
    </aside>
  );
}
