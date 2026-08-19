/** PDF upload helpers for admin content editor. */

export const PDF_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
export const PDF_ACCEPT = "application/pdf,.pdf";

export function isPdfBuffer(buf: Buffer): boolean {
  // PDF files start with "%PDF-"
  if (buf.length < 5) return false;
  return buf.subarray(0, 5).toString("ascii") === "%PDF-";
}

export function sanitizePdfBasename(filename: string): string {
  const base = filename.replace(/\\/g, "/").split("/").pop() || "document.pdf";
  const withoutExt = base.replace(/\.pdf$/i, "");
  const cleaned = withoutExt.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").slice(0, 80);
  return cleaned || "document";
}

export type PdfSequenceItem = {
  src: string;
  title: string;
};

/** Build Markdown/HTML block for an ordered PDF sequence in CMS content. */
export function buildPdfSequenceMarkdown(items: PdfSequenceItem[]): string {
  const figures = items
    .filter((i) => i.src)
    .map((item, index) => {
      const n = index + 1;
      const title = (item.title || `Document ${n}`).replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const src = item.src.replace(/"/g, "");
      return [
        `<figure class="certko-pdf-item">`,
        `<figcaption><span class="certko-pdf-step">${n}</span> ${title}</figcaption>`,
        `<iframe src="${src}" title="${title}" loading="lazy" class="certko-pdf-frame"></iframe>`,
        `<p class="certko-pdf-actions"><a href="${src}" target="_blank" rel="noopener noreferrer">Open / download PDF</a></p>`,
        `</figure>`,
      ].join("\n");
    })
    .join("\n\n");

  if (!figures) return "";
  return `\n\n<div class="certko-pdf-sequence">\n\n${figures}\n\n</div>\n\n`;
}
