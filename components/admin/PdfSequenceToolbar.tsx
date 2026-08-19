"use client";

import { useState } from "react";
import { insertMarkdown$, usePublisher } from "@mdxeditor/editor";
import { PDF_ACCEPT, buildPdfSequenceMarkdown, type PdfSequenceItem } from "@/lib/pdf-upload";

type DraftPdf = PdfSequenceItem & { id: string; uploading?: boolean; error?: string };

/**
 * Toolbar control: upload PDFs, reorder them, insert a sequenced display block
 * into the Markdown body (renders as numbered iframe viewers on the public site).
 */
export default function PdfSequenceToolbar() {
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DraftPdf[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setItems((prev) => [
          ...prev,
          { id, src: "", title: file.name.replace(/\.pdf$/i, ""), uploading: true },
        ]);
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload-pdf", { method: "POST", body });
        const data = (await res.json().catch(() => null)) as
          | { ok: boolean; src?: string; title?: string; error?: string }
          | null;
        if (!res.ok || !data?.ok || !data.src) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, uploading: false, error: data?.error || "Upload failed" }
                : p
            )
          );
          continue;
        }
        setItems((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  src: data.src!,
                  title: data.title || p.title,
                  uploading: false,
                  error: undefined,
                }
              : p
          )
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const insert = () => {
    const ready = items.filter((i) => i.src && !i.uploading && !i.error);
    if (!ready.length) {
      setError("Upload at least one PDF first.");
      return;
    }
    const md = buildPdfSequenceMarkdown(ready.map(({ src, title }) => ({ src, title })));
    insertMarkdown(md);
    setOpen(false);
    setItems([]);
    setError("");
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        title="Upload and sequence PDFs"
        aria-label="Upload and sequence PDFs"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-ink-800 hover:bg-cream-200"
      >
        <span aria-hidden>PDF</span>
        <span className="hidden sm:inline">PDFs</span>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-cream-300 bg-white p-3 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-500">
            PDF sequence
          </p>
          <p className="mb-3 text-[11px] text-ink-600 leading-relaxed">
            Upload one or more PDFs, set titles, reorder with ↑ ↓, then insert a numbered viewer
            sequence into the article.
          </p>

          <label className="block">
            <span className="sr-only">Upload PDF files</span>
            <input
              type="file"
              accept={PDF_ACCEPT}
              multiple
              disabled={busy}
              onChange={(e) => {
                void uploadFiles(e.target.files);
                e.target.value = "";
              }}
              className="block w-full text-xs text-ink-700 file:mr-2 file:rounded-lg file:border-0 file:bg-cream-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-800"
            />
          </label>

          {items.length > 0 ? (
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-cream-300 bg-cream-50/80 p-2 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-950 text-[11px] font-bold text-cream-50">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p) => (p.id === item.id ? { ...p, title: e.target.value } : p))
                        )
                      }
                      placeholder={`Document ${index + 1}`}
                      className="min-w-0 flex-1 rounded-md border border-cream-300 bg-white px-2 py-1 text-xs outline-none focus:border-butter-500"
                    />
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="h-7 w-7 rounded-md border border-cream-300 text-xs font-bold disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className="h-7 w-7 rounded-md border border-cream-300 text-xs font-bold disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                      className="h-7 w-7 rounded-md text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                  {item.uploading ? (
                    <p className="text-[10px] text-ink-500">Uploading…</p>
                  ) : item.error ? (
                    <p className="text-[10px] text-red-600">{item.error}</p>
                  ) : (
                    <p className="truncate text-[10px] text-ink-500" title={item.src}>
                      {item.src}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {error ? <p className="mt-2 text-[11px] text-red-600">{error}</p> : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={insert}
              disabled={busy || !items.some((i) => i.src)}
              className="flex-1 rounded-lg bg-ink-950 px-2 py-2 text-xs font-semibold text-cream-50 hover:bg-ink-800 disabled:opacity-40"
            >
              Insert sequence
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
              className="rounded-lg border border-cream-300 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-50"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
