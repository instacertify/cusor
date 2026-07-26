export default function PageNavPlacement({
  menu = false,
  submenu = false,
  footer = false,
  label = "",
  detail = "",
  sort = 0,
  showSort = true,
}: {
  menu?: boolean;
  submenu?: boolean;
  footer?: boolean;
  label?: string;
  detail?: string;
  sort?: number;
  showSort?: boolean;
}) {
  return (
    <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
      <div>
        <h2 className="font-display font-bold text-ink-950">Navigation location</h2>
        <p className="text-sm text-ink-600 mt-1">
          Choose where this page appears on the public site. You can select more than one.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex items-start gap-3 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm cursor-pointer hover:border-butter-400">
          <input type="hidden" name="nav_menu" value="0" />
          <input
            type="checkbox"
            name="nav_menu"
            value="1"
            defaultChecked={menu}
            className="mt-0.5 rounded border-cream-300"
          />
          <span>
            <span className="block font-semibold text-ink-950">Top menu</span>
            <span className="block text-xs text-ink-500 mt-0.5">Main header link (desktop + mobile)</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm cursor-pointer hover:border-butter-400">
          <input type="hidden" name="nav_submenu" value="0" />
          <input
            type="checkbox"
            name="nav_submenu"
            value="1"
            defaultChecked={submenu}
            className="mt-0.5 rounded border-cream-300"
          />
          <span>
            <span className="block font-semibold text-ink-950">Resources submenu</span>
            <span className="block text-xs text-ink-500 mt-0.5">Under the Resources dropdown</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm cursor-pointer hover:border-butter-400">
          <input type="hidden" name="nav_footer" value="0" />
          <input
            type="checkbox"
            name="nav_footer"
            value="1"
            defaultChecked={footer}
            className="mt-0.5 rounded border-cream-300"
          />
          <span>
            <span className="block font-semibold text-ink-950">Footer</span>
            <span className="block text-xs text-ink-500 mt-0.5">Explore / pages column in the footer</span>
          </span>
        </label>
      </div>

      <div className={`grid gap-4 ${showSort ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <label className="block text-sm">
          <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Menu label (optional)
          </span>
          <input
            name="nav_label"
            defaultValue={label}
            placeholder="Defaults to page title"
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
          />
        </label>
        <label className="block text-sm">
          <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
            Short detail (submenu)
          </span>
          <input
            name="nav_detail"
            defaultValue={detail}
            placeholder="e.g. Process, documents, costs"
            className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
          />
        </label>
        {showSort ? (
          <label className="block text-sm">
            <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Sort order
            </span>
            <input
              name="nav_sort"
              type="number"
              defaultValue={sort}
              className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
            />
          </label>
        ) : null}
      </div>
    </section>
  );
}
