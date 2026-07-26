/** Horizontally scrollable table shell with a mobile swipe hint. */
export default function ScrollTable({
  children,
  hint = "Swipe sideways to see more columns",
  className = "",
}: {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="sm:hidden text-xs text-ink-500 mb-2 flex items-center gap-1.5">
        <span aria-hidden>↔</span>
        {hint}
      </p>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 overscroll-x-contain">
        <div className="inline-block min-w-full align-middle">{children}</div>
      </div>
    </div>
  );
}
