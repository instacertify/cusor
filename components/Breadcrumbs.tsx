import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-ink-500 mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-butter-700">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden>›</span>
            {c.href ? (
              <Link href={c.href} className="hover:text-butter-700">{c.label}</Link>
            ) : (
              <span className="text-ink-800 font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
