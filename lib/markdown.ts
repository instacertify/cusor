import { marked } from "marked";

/**
 * MDXEditor HighlightToggle serializes as ==highlighted text==
 * (micromark highlight-mark). Standard `marked` leaves that literal —
 * convert to <mark> so admin highlight shows on public pages.
 */
function applyHighlightMarks(markdown: string): string {
  if (!markdown || !markdown.includes("==")) return markdown;
  const parts = markdown.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts
    .map((part) => {
      if (part.startsWith("```") || (part.startsWith("`") && part.endsWith("`"))) {
        return part;
      }
      return part.replace(/==([^=\n]+)==/g, "<mark>$1</mark>");
    })
    .join("");
}

/** Render CMS Markdown for public pages (highlight + HTML color spans preserved). */
export function renderMarkdown(markdown: string | null | undefined): string {
  const src = applyHighlightMarks(markdown ?? "");
  if (!src.trim()) return "";
  return marked.parse(src, { async: false }) as string;
}
