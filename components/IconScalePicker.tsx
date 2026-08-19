import { ICON_SCALES, type IconScaleId } from "@/lib/icon-style";
import IconChip from "./IconChip";

export default function IconScalePicker({ value }: { value: IconScaleId }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {ICON_SCALES.map((scale) => {
        const selected = scale.id === value;
        return (
          <label
            key={scale.id}
            className={`cursor-pointer rounded-2xl border p-4 transition ${
              selected
                ? "border-butter-500 bg-butter-300/20 shadow-card"
                : "border-cream-300 bg-white hover:border-butter-400"
            }`}
          >
            <input
              type="radio"
              name="icon_scale"
              value={scale.id}
              defaultChecked={selected}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-ink-950">{scale.name}</p>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">{scale.description}</p>
              </div>
              {selected ? (
                <span className="text-[11px] font-bold uppercase tracking-wide text-butter-700 shrink-0">
                  Active
                </span>
              ) : null}
            </div>
            <div
              className="mt-3 flex items-end gap-2 pt-1 min-h-[3.5rem]"
              data-icon-scale-preview={scale.id}
            >
              <IconChip name="shield" size={18} chip="sm" tone="accent" />
              <IconChip name="flask" size={20} chip="md" tone="accent" />
              <IconChip name="award" size={22} chip="lg" tone="accent" />
            </div>
          </label>
        );
      })}
    </div>
  );
}
