export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white"
      />
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 focus:ring-4 focus:ring-butter-300/30 bg-white font-mono text-[13px] leading-relaxed"
      />
      {hint && <p className="text-[11px] text-ink-500 mt-1">{hint}</p>}
    </div>
  );
}

export { default as SavedBanner } from "./SavedBanner";
export { default as SubmitButton } from "./SubmitButton";

export function ImageUpload({
  current,
  name = "image_file",
  label = "Image",
  allowClear = true,
  clearName = "clear_image",
  clearLabel = "Remove current image",
  previewFit = "cover",
  /** Tailwind aspect class for the preview frame (e.g. aspect-[16/9] for blog covers). */
  previewAspect,
  accept = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
  hint = "Upload PNG/JPG/WebP to replace the current image.",
}: {
  current?: string;
  name?: string;
  label?: string;
  allowClear?: boolean;
  /** Distinct checkbox name when multiple uploads share one form */
  clearName?: string;
  clearLabel?: string;
  previewFit?: "cover" | "contain";
  previewAspect?: string;
  accept?: string;
  hint?: string;
}) {
  const fitClass = previewFit === "contain" ? "object-contain bg-cream-100 p-3" : "object-cover";
  const frameClass = previewAspect
    ? `w-full max-w-md ${previewAspect} rounded-xl border border-cream-300 mb-2 overflow-hidden`
    : "w-full max-w-xs rounded-xl border border-cream-300 mb-2";
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
        {label}
      </label>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt="Current"
          className={`${frameClass} ${fitClass}`}
        />
      ) : (
        <div
          className={`${frameClass} bg-cream-100 flex items-center justify-center`}
          aria-hidden
        >
          <p className="text-xs text-ink-500 px-3 text-center">No image set yet.</p>
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-800 hover:file:bg-cream-300"
      />
      {allowClear && current ? (
        <label className="mt-2 flex items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" name={clearName} value="1" className="rounded border-cream-300" />
          {clearLabel}
        </label>
      ) : null}
      <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}
