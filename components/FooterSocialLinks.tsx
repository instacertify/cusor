import SocialIconGlyph from "./SocialIconGlyph";
import type { SocialLink } from "@/lib/social-links";

export default function FooterSocialLinks({
  links,
  className = "",
}: {
  links: SocialLink[];
  className?: string;
}) {
  if (!links.length) return null;

  return (
    <div className={className}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500 mb-3">
        Follow us
      </p>
      <ul className="flex flex-wrap items-center gap-2.5">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-cream-100 transition hover:border-butter-400 hover:bg-ink-800 hover:text-butter-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-400"
            >
              {link.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link.iconSrc}
                  alt=""
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <SocialIconGlyph id={link.id} className="h-4 w-4" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
