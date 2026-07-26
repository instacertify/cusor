import Link from "next/link";

export default function AuthorByline({
  name,
  slug,
  date,
  className = "",
}: {
  name: string;
  slug?: string | null;
  date?: string;
  className?: string;
}) {
  const authorLabel = slug ? (
    <Link
      href={`/authors/${slug}`}
      className="font-semibold text-butter-700 hover:text-butter-600 transition"
    >
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  );

  return (
    <p className={`text-xs font-semibold text-ink-500 ${className}`}>
      {date ? <>{date} · </> : null}
      {authorLabel}
    </p>
  );
}
