import Link from "next/link";

export default function AuthorByline({
  name,
  slug,
  date,
  dateTime,
  className = "",
}: {
  name: string;
  slug?: string | null;
  /** Visible byline date */
  date?: string;
  /** Machine-readable publish/update date for Google byline dates */
  dateTime?: string;
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
      {date ? (
        <>
          {dateTime ? <time dateTime={dateTime}>{date}</time> : date}
          {" · "}
        </>
      ) : null}
      {authorLabel}
    </p>
  );
}
