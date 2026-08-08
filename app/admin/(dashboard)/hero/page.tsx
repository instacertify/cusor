import Image from "next/image";
import { getAllHeroSlides } from "@/lib/queries";
import { formatImageUploadHint } from "@/lib/image-upload-guide";
import { saveHeroSlide, deleteHeroSlide } from "../../actions";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";
import { Field, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

function MediaPreview({ src, type }: { src: string; type: string }) {
  if (!src) return <p className="text-xs text-ink-500">No media</p>;
  if (type === "video") {
    return (
      <video src={src} poster="" className="w-full max-w-xs rounded-xl border border-cream-300" muted playsInline controls />
    );
  }
  if (type === "gif" || src.endsWith(".gif") || src.endsWith(".svg")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="w-full max-w-xs rounded-xl border border-cream-300 object-cover" />;
  }
  return (
    <Image src={src} alt="" width={320} height={200} className="w-full max-w-xs rounded-xl border border-cream-300 object-cover" />
  );
}

export default async function AdminHeroPage({ searchParams }: Props) {
  const sp = await searchParams;
  const slides = getAllHeroSlides();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Hero slider</h1>
      <p className="text-ink-600 text-sm mb-6">
        Deploy homepage hero banner slides. Supports images (PNG, JPG, WebP, AVIF, SVG), animated GIF, and video
        (MP4, WebM, MOV). {formatImageUploadHint("hero")}
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="space-y-5 mb-10">
        {slides.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display font-bold text-ink-950">
                Slide #{s.id}{" "}
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-500 ml-2">
                  {s.media_type || "image"} · {s.active ? "Active" : "Hidden"}
                </span>
              </h2>
            </div>
            <MediaPreview src={s.media} type={s.media_type} />
            <form action={saveHeroSlide} className="space-y-3">
              <input type="hidden" name="id" value={s.id} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Title (overlay)" name="title" defaultValue={s.title} />
                <Field label="Subtitle" name="subtitle" defaultValue={s.subtitle} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Link URL" name="link_href" defaultValue={s.link_href} placeholder="/products" />
                <Field label="Link label" name="link_label" defaultValue={s.link_label} placeholder="Browse products" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Duration (ms)" name="duration_ms" type="number" defaultValue={s.duration_ms || 6000} />
                <Field label="Sort" name="sort" type="number" defaultValue={s.sort} />
                <label className="flex items-end gap-2 text-sm text-ink-700 pb-2">
                  <input type="hidden" name="active" value="0" />
                  <input
                    type="checkbox"
                    name="active"
                    value="1"
                    defaultChecked={Boolean(s.active)}
                    className="rounded border-cream-300"
                  />
                  Show on homepage
                </label>
              </div>
              <label className="block text-sm">
                <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
                  Replace media (image / GIF / video)
                </span>
                <input
                  name="media_file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,image/bmp,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v,.gif"
                  className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-800"
                />
                <span className="mt-1.5 block text-[11px] text-ink-500 leading-relaxed">
                  {formatImageUploadHint("hero")}
                </span>
              </label>
              {s.media_type === "video" || s.media.endsWith(".mp4") || s.media.endsWith(".webm") ? (
                <ImageUpload
                  current={s.poster}
                  name="poster_file"
                  clearName="clear_poster"
                  label="Video poster image (optional)"
                  size="heroPoster"
                  hint="Shown before video plays / as fallback."
                />
              ) : null}
              <SubmitButton label="Save slide" />
            </form>
            <ConfirmDeleteForm action={deleteHeroSlide} itemLabel="this hero slide">
              <input type="hidden" name="id" value={s.id} />
              <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete slide</button>
            </ConfirmDeleteForm>
          </div>
        ))}
        {slides.length === 0 ? (
          <p className="text-sm text-ink-500">No slides yet — add the first one below.</p>
        ) : null}
      </div>

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 space-y-4">
        <h2 className="font-display font-bold text-ink-950">Add hero slide</h2>
        <form action={saveHeroSlide} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title (overlay)" name="title" placeholder="Optional headline on the slide" />
            <Field label="Subtitle" name="subtitle" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Link URL" name="link_href" placeholder="/contact" />
            <Field label="Link label" name="link_label" placeholder="Get a quote" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Duration (ms)" name="duration_ms" type="number" defaultValue={6000} />
            <Field label="Sort" name="sort" type="number" defaultValue={slides.length} />
            <label className="flex items-end gap-2 text-sm text-ink-700 pb-2">
              <input type="hidden" name="active" value="0" />
              <input type="checkbox" name="active" value="1" defaultChecked className="rounded border-cream-300" />
              Show on homepage
            </label>
          </div>
          <label className="block text-sm">
            <span className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5">
              Media file (required)
            </span>
            <input
              name="media_file"
              type="file"
              required
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,image/bmp,video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v,.gif"
              className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cream-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-800"
            />
            <span className="mt-1.5 block text-[11px] text-ink-500 leading-relaxed">
              {formatImageUploadHint("hero")} Images: PNG, JPG, WebP, AVIF, SVG, GIF · Video: MP4, WebM, MOV, M4V.
            </span>
          </label>
          <ImageUpload
            current=""
            name="poster_file"
            allowClear={false}
            label="Poster image for video (optional)"
            size="heroPoster"
            hint="Recommended when uploading a video."
          />
          <SubmitButton label="Add slide" />
        </form>
      </div>
    </div>
  );
}
