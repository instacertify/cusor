import { ICON_STYLES, type IconStyleId } from "@/lib/icon-style";
import IconChip from "./IconChip";

const PREVIEW = ["cpu", "flask", "shield", "leaf", "award", "bell"] as const;

export default function IconStylePicker({ value }: { value: IconStyleId }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ICON_STYLES.map((style) => {
        const selected = style.id === value;
        return (
          <label
            key={style.id}
            className={`cursor-pointer rounded-2xl border p-4 transition ${
              selected
                ? "border-butter-500 bg-butter-300/20 shadow-card"
                : "border-cream-300 bg-white hover:border-butter-400"
            }`}
          >
            <input
              type="radio"
              name="icon_style"
              value={style.id}
              defaultChecked={selected}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold text-ink-950">{style.name}</p>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">{style.description}</p>
              </div>
              {selected ? (
                <span className="text-[11px] font-bold uppercase tracking-wide text-butter-700">
                  Active
                </span>
              ) : null}
            </div>
            <div
              className="mt-3 flex flex-wrap gap-2"
              data-icon-style-preview={style.id}
            >
              {PREVIEW.map((name) => (
                <IconChip key={name} name={name} size={18} chip="sm" tone="accent" />
              ))}
            </div>
          </label>
        );
      })}
    </div>
  );
}
