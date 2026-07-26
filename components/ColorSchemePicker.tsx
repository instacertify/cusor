"use client";

import { useEffect, useState } from "react";
import { COLOR_SCHEMES, type ColorSchemeId } from "@/lib/color-schemes";

export default function ColorSchemePicker({
  value,
}: {
  value: ColorSchemeId;
}) {
  const [selected, setSelected] = useState<ColorSchemeId>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Site color scheme</legend>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {COLOR_SCHEMES.map((scheme) => {
          const active = scheme.id === selected;
          return (
            <label
              key={scheme.id}
              className={`relative cursor-pointer rounded-2xl border p-4 transition select-none ${
                active
                  ? "border-butter-500 bg-butter-300/20 ring-2 ring-butter-500/40"
                  : "border-cream-300 bg-cream-50 hover:border-butter-400"
              }`}
            >
              <input
                type="radio"
                name="color_scheme"
                value={scheme.id}
                checked={active}
                onChange={() => setSelected(scheme.id)}
                className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="relative z-0 pointer-events-none">
                <div className="flex items-center gap-2 mb-3">
                  {scheme.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="font-display font-bold text-ink-950 text-sm">{scheme.name}</p>
                <p className="mt-1 text-xs text-ink-600 leading-relaxed">{scheme.description}</p>
                {active ? (
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-butter-700">
                    Selected
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Tap to select
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
