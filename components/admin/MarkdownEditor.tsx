"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";

const InitializedMDXEditor = dynamic(() => import("./InitializedMDXEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-cream-300 bg-cream-50 px-4 py-10 text-sm text-ink-500">
      Loading editor…
    </div>
  ),
});

/**
 * Form-friendly Markdown WYSIWYG (MDXEditor / Lexical, MIT).
 * Syncs markdown into a hidden input so existing server actions keep working.
 */
export default function MarkdownEditor({
  label,
  name,
  defaultValue,
  hint,
  minHeightClass = "min-h-[18rem]",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  /** Tailwind min-height utility for the editable area */
  minHeightClass?: string;
}) {
  const reactId = useId();
  const fieldId = `${name}-${reactId}`;
  const [markdown, setMarkdown] = useState(defaultValue ?? "");

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
      >
        {label}
      </label>
      <input type="hidden" id={fieldId} name={name} value={markdown} />
      <div
        className={`mdxeditor-admin overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm focus-within:border-butter-500 focus-within:ring-4 focus-within:ring-butter-300/30 ${minHeightClass}`}
      >
        <InitializedMDXEditor
          markdown={defaultValue ?? ""}
          onChange={setMarkdown}
          className="mdxeditor-admin-root"
        />
      </div>
      {hint ? <p className="text-[11px] text-ink-500 mt-1">{hint}</p> : null}
      <p className="text-[11px] text-ink-400 mt-1">
        Rich text editor — use the toolbar or switch to Source for raw Markdown. Content stays Markdown
        for the public site.
      </p>
    </div>
  );
}
