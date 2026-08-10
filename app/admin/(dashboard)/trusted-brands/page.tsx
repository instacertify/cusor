import { getTrustedBrands } from "@/lib/queries";
import { saveTrustedBrand, deleteTrustedBrand } from "../../actions";
import { Field, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTrustedBrands({ searchParams }: Props) {
  const sp = await searchParams;
  const brands = getTrustedBrands();
  const activeCount = brands.filter((b) => b.active && b.logo).length;
  const errorMessage =
    sp.error === "logo"
      ? "Please upload a brand logo (PNG, JPG, WebP, SVG or GIF)."
      : sp.error
        ? "Brand name is required."
        : undefined;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">
        Trusted by — brand logos
      </h1>
      <p className="text-ink-600 text-sm mb-6 max-w-3xl">
        Upload logos for the scrolling <strong>Trusted by Global Brands</strong> strip. Active logos
        appear on the homepage and every page with the sitewide trust section (certifications,
        testing, products, blog, contact and more). Any upload size is shown in the same fixed logo
        slot on the public scroll. {activeCount} active of {brands.length} total.
      </p>
      <SavedBanner saved={sp.saved} />
      {errorMessage ? (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-4 mb-10">
        {brands.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
            <form action={saveTrustedBrand} className="space-y-3">
              <input type="hidden" name="id" value={b.id} />
              <div className="grid sm:grid-cols-[1fr_1fr_100px] gap-3">
                <Field label="Brand name" name="name" defaultValue={b.name} required />
                <Field
                  label="Optional link URL"
                  name="href"
                  defaultValue={b.href}
                  placeholder="https://… or /page"
                />
                <Field label="Sort" name="sort" type="number" defaultValue={b.sort} />
              </div>
              <ImageUpload
                current={b.logo}
                label="Brand logo"
                previewFit="contain"
                previewAspect="aspect-[3/1]"
                hint="Any size is fine — the public scroll shows every logo in the same fixed dimensions (object-fit contain)."
              />
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <input type="hidden" name="active" value="0" />
                <input
                  type="checkbox"
                  name="active"
                  value="1"
                  defaultChecked={Boolean(b.active)}
                  className="rounded border-cream-300"
                />
                <span>
                  <strong>Active</strong> — show in the scrolling Trusted by strip
                </span>
              </label>
              <SubmitButton label="Save brand" />
            </form>
            <ConfirmDeleteForm
              action={deleteTrustedBrand}
              className="mt-2"
              itemLabel={`brand “${b.name}”`}
            >
              <input type="hidden" name="id" value={b.id} />
              <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
            </ConfirmDeleteForm>
          </div>
        ))}
      </div>

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-1">Add brand logo</h2>
        <p className="text-xs text-ink-600 mb-4">
          New logos appear in the Trusted by scroll on public pages once marked Active.
        </p>
        <form action={saveTrustedBrand} className="space-y-3">
          <div className="grid sm:grid-cols-[1fr_1fr_100px] gap-3">
            <Field label="Brand name" name="name" required placeholder="e.g. Acme Electronics" />
            <Field label="Optional link URL" name="href" placeholder="https://…" />
            <Field label="Sort" name="sort" type="number" defaultValue={brands.length * 10 + 10} />
          </div>
          <ImageUpload
            current=""
            label="Brand logo"
            allowClear={false}
            previewFit="contain"
            previewAspect="aspect-[3/1]"
            hint="Upload PNG/JPG/WebP/SVG (required). Displayed in a uniform logo slot on the site."
          />
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input type="hidden" name="active" value="0" />
            <input
              type="checkbox"
              name="active"
              value="1"
              defaultChecked
              className="rounded border-cream-300"
            />
            <span>
              <strong>Active</strong> — show in the scrolling Trusted by strip
            </span>
          </label>
          <SubmitButton label="Add brand" />
        </form>
      </div>
    </div>
  );
}
