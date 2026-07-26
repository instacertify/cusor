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

export function SavedBanner({ saved, error }: { saved?: string; error?: string }) {
  if (error) {
    return (
      <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
        Something went wrong — please check required fields.
      </p>
    );
  }
  if (!saved) return null;
  return (
    <p className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
      ✓ Changes saved and live on the site.
    </p>
  );
}

export function SubmitButton({ label = "Save Changes" }: { label?: string }) {
  return (
    <button className="bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl px-6 py-3 text-sm transition">
      {label}
    </button>
  );
}

export function ImageUpload({
  current,
  name = "image_file",
  label = "Image",
  allowClear = true,
}: {
  current?: string;
  name?: string;
  label?: string;
  allowClear?: boolean;
}) {
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
          className="w-full max-w-xs rounded-xl border border-cream-300 mb-2 object-cover"
        />
      ) : (
        <p className="text-xs text-ink-500 mb-2">No image set yet.</p>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-800 hover:file:bg-cream-300"
      />
      {allowClear && current ? (
        <label className="mt-2 flex items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" name="clear_image" value="1" className="rounded border-cream-300" />
          Remove current image
        </label>
      ) : null}
      <p className="text-[11px] text-ink-500 mt-1">Upload PNG/JPG/WebP to replace the current image.</p>
    </div>
  );
}
