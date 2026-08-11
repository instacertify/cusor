import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";

export type ArticleExpert = {
  name: string;
  slug?: string | null;
  title?: string | null;
  bio?: string | null;
  image?: string | null;
};

function bioSnippet(bio: string | null | undefined, max = 160): string {
  const text = (bio || "").trim().replace(/\s+/g, " ");
  if (!text) {
    return "Certification and compliance specialist at Certko — here to map the right scheme, testing path and next step for your product.";
  }
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const soft = cut.replace(/\s+\S*$/, "").replace(/[.,;:]\s*$/, "");
  return `${soft || cut}…`;
}

/**
 * Vertical expert bar beside blog articles: author snippet + connect CTA.
 * Clicking the profile opens the full expert page at /authors/[slug].
 */
export default function ArticleExpertSidebar({
  expert,
  articleTitle,
}: {
  expert: ArticleExpert;
  articleTitle?: string;
}) {
  const name = expert.name.trim() || "Certko Expert";
  const profileHref = expert.slug ? `/authors/${expert.slug}` : null;
  const connectHref = `/contact?intent=expert${
    articleTitle
      ? `&product=${encodeURIComponent(`Article: ${articleTitle}`)}`
      : ""
  }`;
  const snippet = bioSnippet(expert.bio);

  const Avatar = (
    <div className="relative mx-auto">
      {expert.image ? (
        <Image
          src={expert.image}
          alt={name}
          width={96}
          height={96}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-cream-300 shadow-card"
        />
      ) : (
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-butter-300/50 text-butter-800 flex items-center justify-center font-display text-3xl font-bold border border-cream-300"
          aria-hidden
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <aside
      className="lg:sticky lg:top-24 rounded-3xl border border-cream-300 bg-white shadow-card overflow-hidden"
      aria-label="Article expert"
    >
      <div className="bg-ink-950 px-5 py-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-butter-400">
          Connect with the right expert
        </p>
      </div>

      <div className="px-5 py-6 text-center">
        {profileHref ? (
          <Link
            href={profileHref}
            className="group inline-flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-butter-500 rounded-2xl"
          >
            {Avatar}
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold text-ink-950 group-hover:text-butter-700 transition">
                {name}
              </span>
              {expert.title ? (
                <span className="mt-0.5 block text-sm font-semibold text-butter-700">
                  {expert.title}
                </span>
              ) : (
                <span className="mt-0.5 block text-sm font-semibold text-ink-500">
                  Certification expert
                </span>
              )}
            </span>
          </Link>
        ) : (
          <div className="inline-flex flex-col items-center gap-3">
            {Avatar}
            <div>
              <p className="font-display text-lg font-semibold text-ink-950">{name}</p>
              {expert.title ? (
                <p className="mt-0.5 text-sm font-semibold text-butter-700">{expert.title}</p>
              ) : (
                <p className="mt-0.5 text-sm font-semibold text-ink-500">
                  Certification expert
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-ink-600 leading-relaxed text-left">
          {snippet}
        </p>

        <div className="mt-5 space-y-2.5">
          {profileHref ? (
            <Link
              href={profileHref}
              className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 text-sm font-semibold text-ink-900 transition hover:border-butter-400 hover:bg-butter-300/30"
            >
              View full expert profile
              <Icon name="arrow-right" size={14} />
            </Link>
          ) : null}
          <Link
            href={connectHref}
            className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-butter-500 px-4 text-sm font-semibold text-ink-950 transition hover:bg-butter-400"
          >
            Need more information
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <p className="mt-3 text-[11px] text-ink-500 leading-relaxed">
          Free quote in 24 working hours — share your product or HSN and we’ll map the path.
        </p>
      </div>
    </aside>
  );
}
