import { notFound } from "next/navigation";
import Link from "next/link";
import { ensureDbReady, getDb } from "@/lib/db";
import type { Certification } from "@/lib/db";
import { getCertProducts } from "@/lib/queries";
import { saveCertProduct } from "../../../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import CertProductExpandableList from "@/components/admin/CertProductExpandableList";

export const dynamic = "force-dynamic";

function includesQ(value: string | null | undefined, q: string): boolean {
  return (value ?? "").toLowerCase().includes(q);
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; edit?: string; q?: string }>;
}

export default async function AdminCertificationProductsList({ params, searchParams }: Props) {
  await ensureDbReady();
  const { id } = await params;
  const sp = await searchParams;
  const cert = getDb()
    .prepare("SELECT * FROM certifications WHERE id = ?")
    .get(Number(id)) as Certification | undefined;
  if (!cert) notFound();

  const allProducts = getCertProducts(cert.id);
  const q = (sp.q ?? "").trim().toLowerCase();
  const products = q
    ? allProducts.filter(
        (p) =>
          includesQ(p.name, q) ||
          includesQ(p.standards, q) ||
          includesQ(p.family, q) ||
          includesQ(p.regime, q) ||
          includesQ(p.slug, q)
      )
    : allProducts;
  const initialOpenId = sp.edit ? Number(sp.edit) || null : null;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link
            href={`/admin/certifications/${cert.id}`}
            className="text-xs font-bold text-ink-500 hover:text-butter-700"
          >
            ← {cert.name} settings
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-950 mt-1">
            {cert.name} — all products
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            Full catalogue list ({allProducts.length}). Click <strong>Edit</strong> on a row to
            enlarge and update that option.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0 text-sm font-bold">
          <Link href={`/certifications/${cert.slug}`} target="_blank" className="text-ink-600">
            Public page ↗
          </Link>
          <a
            href="#add-product"
            className="bg-butter-500 hover:bg-butter-400 text-ink-950 rounded-xl px-4 py-2 transition"
          >
            + Add product
          </a>
        </div>
      </div>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <form
        action={`/admin/certifications/${cert.id}/products`}
        method="GET"
        className="mb-5 flex flex-wrap gap-3"
      >
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name, standard, family…"
          className="flex-1 min-w-[200px] rounded-xl border border-cream-300 px-4 py-2.5 text-sm outline-none focus:border-butter-500 bg-white"
        />
        <button className="bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition">
          Search
        </button>
        {q ? (
          <Link
            href={`/admin/certifications/${cert.id}/products`}
            className="text-sm font-bold text-ink-600 self-center"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <section className="mb-10 bg-white rounded-2xl border border-cream-300 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-950">
            Showing {products.length}
            {q ? ` match${products.length === 1 ? "" : "es"}` : ` product${products.length === 1 ? "" : "s"}`}
          </h2>
        </div>
        <CertProductExpandableList
          products={products}
          certificationId={cert.id}
          certSlug={cert.slug}
          hideLabs={cert.slug === "bee"}
          initialOpenId={initialOpenId}
        />
      </section>

      <section
        id="add-product"
        className="mb-6 bg-cream-100 rounded-2xl border border-cream-300 p-5 scroll-mt-24"
      >
        <h2 className="font-display font-bold text-ink-950 mb-1">
          Add a product covered under {cert.name}
        </h2>
        <p className="text-xs text-ink-600 mb-4">
          New items appear in this list and on the public {cert.name} catalogue.
        </p>
        <form action={saveCertProduct} className="space-y-3">
          <input type="hidden" name="certification_id" value={cert.id} />
          <input type="hidden" name="return_to" value="products" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Product name" name="name" required placeholder="e.g. Room Air Conditioner" />
            <Field label="Slug (optional)" name="slug" placeholder="auto from name" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Family / group" name="family" placeholder="e.g. Mandatory" />
            <Field label="Regime" name="regime" placeholder="Mandatory / Voluntary" />
            <Field label="Sort" name="sort" type="number" defaultValue={String(allProducts.length + 1)} />
          </div>
          <Field label="Standards" name="standards" placeholder="IS / IEC / GSO / SASO…" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Min testing price (INR)" name="min_price" type="number" />
            <Field label="Max testing price (INR)" name="max_price" type="number" />
          </div>
          <TextArea label="Summary" name="summary" rows={2} />
          {cert.slug !== "bee" && <TextArea label="Labs (indicative)" name="labs" rows={2} />}
          {cert.slug === "bee" && <input type="hidden" name="labs" value="" />}
          <TextArea label="Fee note" name="fee_note" rows={2} />
          <TextArea label="Content (Markdown)" name="content" rows={4} />
          <TextArea
            label="Extras JSON"
            name="extras"
            rows={2}
            defaultValue="{}"
            hint='Optional structured fields, e.g. {"star_table":"…","emc":"Yes"}'
          />
          <ImageUpload current="" label="Product image" allowClear={false} />
          <SubmitButton label="Create covered product" />
        </form>
      </section>
    </div>
  );
}
