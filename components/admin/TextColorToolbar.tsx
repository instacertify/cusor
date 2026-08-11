"use client";

import { useMemo, useState } from "react";
import {
  activeEditor$,
  currentSelection$,
  useCellValues,
} from "@mdxeditor/editor";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";

const TEXT_COLORS: { label: string; value: string; swatch: string }[] = [
  { label: "Default", value: "", swatch: "#141820" },
  { label: "Ink", value: "#141820", swatch: "#141820" },
  { label: "Slate", value: "#4b5563", swatch: "#4b5563" },
  { label: "Butter", value: "#b8860b", swatch: "#e8b03a" },
  { label: "Navy", value: "#16263d", swatch: "#16263d" },
  { label: "Sky", value: "#0369a1", swatch: "#0ea5e9" },
  { label: "Green", value: "#15803d", swatch: "#22c55e" },
  { label: "Red", value: "#b91c1c", swatch: "#ef4444" },
  { label: "Purple", value: "#7e22ce", swatch: "#a855f7" },
  { label: "White", value: "#ffffff", swatch: "#ffffff" },
];

/**
 * Toolbar control: apply / clear text color on the current selection.
 * Colors are stored as Markdown/HTML: <span style="color: …">…</span>
 */
export default function TextColorToolbar() {
  const [currentSelection, activeEditor] = useCellValues(currentSelection$, activeEditor$);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("#b8860b");

  const currentColor = useMemo(() => {
    if (!activeEditor || !currentSelection) return "";
    return (
      activeEditor.getEditorState().read(() => {
        const nodes = currentSelection.getNodes();
        for (const node of nodes) {
          if ($isTextNode(node)) {
            const style = node.getStyle() || "";
            const match = /(?:^|;)\s*color:\s*([^;]+)/i.exec(style);
            if (match?.[1]) return match[1].trim();
          }
        }
        return "";
      }) ?? ""
    );
  }, [activeEditor, currentSelection]);

  const applyColor = (color: string) => {
    if (!activeEditor) return;
    activeEditor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
      $patchStyleText(selection, { color: color || null });
    });
    setOpen(false);
  };

  const disabled = !activeEditor || !currentSelection || currentSelection.isCollapsed();

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        title="Text color — select text first"
        aria-label="Text color"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-ink-800 hover:bg-cream-200 disabled:opacity-40"
      >
        <span className="inline-flex flex-col items-center leading-none">
          <span className="text-[13px] font-bold" style={{ color: currentColor || "#141820" }}>
            A
          </span>
          <span
            className="mt-0.5 h-1 w-4 rounded-sm border border-cream-300"
            style={{ background: currentColor || "#141820" }}
          />
        </span>
        <span className="hidden sm:inline">Color</span>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-cream-300 bg-white p-3 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-500">
            Text color
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                aria-label={c.label}
                onClick={() => applyColor(c.value)}
                className={`h-7 w-7 rounded-md border ${
                  (currentColor || "").toLowerCase() === c.value.toLowerCase() ||
                  (!currentColor && !c.value)
                    ? "border-butter-500 ring-2 ring-butter-300/50"
                    : "border-cream-300"
                }`}
                style={{
                  background: c.swatch,
                  boxShadow: c.value === "#ffffff" ? "inset 0 0 0 1px #e8e0d4" : undefined,
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-cream-300 bg-white p-0.5"
              title="Custom color"
            />
            <button
              type="button"
              onClick={() => applyColor(custom)}
              className="flex-1 rounded-lg bg-ink-950 px-2 py-1.5 text-xs font-semibold text-cream-50 hover:bg-ink-800"
            >
              Apply custom
            </button>
          </div>
          <button
            type="button"
            onClick={() => applyColor("")}
            className="mt-2 w-full rounded-lg border border-cream-300 px-2 py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-50"
          >
            Clear color
          </button>
          <p className="mt-2 text-[10px] leading-snug text-ink-500">
            Select text first, then pick a color. Colors appear on the public page.
          </p>
        </div>
      ) : null}
    </div>
  );
}
