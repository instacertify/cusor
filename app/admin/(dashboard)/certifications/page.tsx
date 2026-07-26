import Link from "next/link";
import IconChip from "@/components/IconChip";
import { getCertifications, getCertProducts } from "@/lib/queries";
import { CERTIFICATION_PRESETS } from "@/lib/certification-presets";
import {
  createCertification,
  createCertificationPreset,
  saveCertProduct,
} from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCertifications({ searchParams }: Props) {
  const sp = await searchParams;
  const certs = getCertifications();
  const existingSlugs = new Set(certs.map((c) => c.slug));
  const missingPresets = CERTIFICATION_PRESETS.filter((p) => !existingSlugs.has(p.slug));
  const certsWithProducts = certs.map((c) => ({
    ...c,
    products: getCertProducts(c.id),
  }));
  const totalProducts = certsWithProducts.reduce((n, c) => n + c.products.length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Certifications</h1>
        <BulkImportLink entities={["certifications", "cert_products"]} />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Create certification programmes (BEE, GMARK, SABER, CE, FCC, custom…) and add the{" "}
        <strong>products covered</strong> under each. {certs.length} certification
        {certs.length === 1 ? "" : "s"} · {totalProducts} catalogue product
        {totalProducts === 1 ? "" : "s"}.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      {missingPresets.length > 0 && (
        <section className="mb-8 bg-butter-300/25 rounded-2xl border border-butter-400/50 p-5">
          <h2 className="font-display font-bold text-ink-950 mb-1">
            Quick-add common certifications
          </h2>
          <p className="text-sm text-ink-700 mb-4">
            One click creates the programme page with starter writeup and FAQs. Then add products
            covered under it below.
          </p>
          <div className="flex flex-wrap gap-2">
            {missingPresets.map((p) => (
              <form key={p.slug} action={createCertificationPreset}>
                <input type="hidden" name="preset_slug" value={p.slug} />
                <button className="text-sm font-bold bg-ink-900 hover:bg-ink-800 text-white rounded-xl px-4 py-2.5 transition">
                  + {p.name}
                  <span className="font-medium text-cream-200 ml-1.5 text-xs">({p.region})</span>
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h2 className="font-display font-bold text-ink-950 mb-1">Create a certification</h2>
          <p className="text-xs text-ink-600 mb-4">
            Add BEE, GMARK, SABER or any other scheme. Public URL:{" "}
            <span className="font-mono">/certifications/…</span>
          </p>
          <form action={createCertification} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name" name="name" required placeholder="e.g. SABER / BEE / Custom" />
              <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name" name="full_name" placeholder="e.g. Gulf Conformity Mark" />
              <Field label="Region" name="region" placeholder="e.g. GCC / Saudi Arabia / India" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Icon" name="icon" placeholder="award" defaultValue="award" />
              <Field label="Menu sort" name="sort" type="number" placeholder="auto" />
            </div>
            <Field label="Summary" name="summary" placeholder="One-line description for cards & search" />
            <TextArea label="Content writeup (Markdown)" name="content" rows={4} />
            <Field label="Meta title" name="meta_title" placeholder="auto from name" />
            <TextArea label="Meta description" name="meta_description" rows={2} />
            <ImageUpload current="" label="Front image (optional)" allowClear={false} />
            <SubmitButton label="Create certification" />
          </form>
        </div>

        <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5">
          <h2 className="font-display font-bold text-ink-950 mb-1">
            Add a product covered under a certification
          </h2>
          <p className="text-xs text-ink-600 mb-4">
            Pick BEE, GMARK, SABER or any other certification, then add the product / category
            covered.
          </p>
          {certs.length === 0 ? (
            <p className="text-sm text-ink-700 bg-white border border-cream-300 rounded-xl px-4 py-3">
              Create a certification first, then add products under it.
            </p>
          ) : (
            <form action={saveCertProduct} className="space-y-3">
              <div>
                <label
                  htmlFor="certification_id"
                  className="block text-xs font-bold uppercase tracking-wide text-ink-600 mb-1.5"
                >
                  Certification
                </label>
                <select
                  id="certification_id"
                  name="certification_id"
                  required
                  defaultValue={
                    certs.find((c) => c.slug === "bee")?.id ||
                    certs.find((c) => c.slug === "g-mark")?.id ||
                    certs.find((c) => c.slug === "saber")?.id ||
                    certs[0]?.id
                  }
                  className="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-butter-500"
                >
                  {certs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.region || "—"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="Product / category name"
                  name="name"
                  required
                  placeholder="e.g. Room Air Conditioner"
                />
                <Field label="Slug (optional)" name="slug" placeholder="auto from name" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Family / group" name="family" placeholder="e.g. Mandatory" />
                <Field label="Regime" name="regime" placeholder="Mandatory / Voluntary" />
                <Field label="Sort" name="sort" type="number" defaultValue={1} />
              </div>
              <Field label="Standards" name="standards" placeholder="IS / IEC / GSO / SASO…" />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Min testing price (INR)" name="min_price" type="number" />
                <Field label="Max testing price (INR)" name="max_price" type="number" />
              </div>
              <TextArea label="Summary" name="summary" rows={2} />
              <TextArea label="Content (Markdown)" name="content" rows={3} />
              <TextArea label="Labs (indicative)" name="labs" rows={2} />
              <TextArea label="Fee note" name="fee_note" rows={2} />
              <ImageUpload current="" label="Product image" allowClear={false} />
              <SubmitButton label="Create covered product" />
            </form>
          )}
        </div>
      </div>

      <h2 className="font-display text-xl font-bold text-ink-950 mb-3">
        Certifications & products covered
      </h2>
      <div className="space-y-4">
        {certsWithProducts.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-4 p-5 border-b border-cream-200">
              <Link
                href={`/admin/certifications/${c.id}`}
                className="flex items-center gap-4 min-w-0 flex-1"
              >
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover border border-cream-200 shrink-0"
                  />
                ) : (
                  <IconChip name={c.icon} size={24} chip="lg" tone="neutral" />
                )}
                <span className="min-w-0">
                  <span className="block font-display font-bold text-ink-950 truncate">{c.name}</span>
                  <span className="block text-xs text-ink-500">
                    /certifications/{c.slug} · {c.region || "—"} · {c.products.length} product
                    {c.products.length === 1 ? "" : "s"} covered
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-3 text-sm font-bold shrink-0">
                <Link
                  href={`/certifications/${c.slug}`}
                  target="_blank"
                  className="text-ink-600 hover:text-ink-900"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/certifications/${c.id}/products`}
                  className="text-butter-700 hover:text-butter-600"
                >
                  View all →
                </Link>
                <Link
                  href={`/admin/certifications/${c.id}`}
                  className="text-ink-700 hover:text-ink-900"
                >
                  Settings
                </Link>
              </div>
            </div>

            {c.products.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-500">
                No products covered yet. Use “Add a product covered…” above, or{" "}
                <Link
                  href={`/admin/certifications/${c.id}/products#add-product`}
                  className="font-bold text-butter-700"
                >
                  open View all →
                </Link>
              </p>
            ) : (
              <>
                <ul className="divide-y divide-cream-100">
                  {c.products.slice(0, 5).map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-cream-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-950 truncate">
                          {p.name}
                        </span>
                        <span className="block text-xs text-ink-500 truncate">
                          {p.standards || "No standard set"}
                          {p.regime ? ` · ${p.regime}` : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-3 border-t border-cream-200 bg-cream-50">
                  <Link
                    href={`/admin/certifications/${c.id}/products`}
                    className="text-sm font-bold text-butter-700 hover:text-butter-600"
                  >
                    View all {c.products.length} product{c.products.length === 1 ? "" : "s"} under{" "}
                    {c.name} →
                  </Link>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
