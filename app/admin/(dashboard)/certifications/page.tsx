import Link from "next/link";
import Icon from "@/components/Icon";
import { getCertifications, countCertProducts } from "@/lib/queries";
import { createCertification, deleteCertification } from "../../actions";
import { Field, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCertifications({ searchParams }: Props) {
  const sp = await searchParams;
  const certs = getCertifications();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Certifications</h1>
        <BulkImportLink entity="certifications" />
      </div>
      <p className="text-ink-600 text-sm mb-6">
        Add any certification programme (BIS, BEE, GMARK, CE, FCC, SABER, custom…). Pages appear in the
        header, footer and search. Each certification can hold an editable product catalogue. Or bulk-upload via Excel.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add a New Certification</h2>
        <form action={createCertification} className="space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Name" name="name" required placeholder="e.g. FDA Registration" />
            <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
            <Field label="Full Name" name="full_name" placeholder="e.g. US Food & Drug Administration" />
            <Field label="Region" name="region" placeholder="e.g. United States" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Icon" name="icon" placeholder="award" defaultValue="award" />
            <Field label="Summary" name="summary" placeholder="One-line description for cards & search" />
          </div>
          <ImageUpload current="" label="Front image (optional)" allowClear={false} />
          <SubmitButton label="Create certification" />
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {certs.map((c) => {
          const productCount = countCertProducts(c.id);
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
            >
              <Link href={`/admin/certifications/${c.id}`} className="flex items-center gap-4">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-cream-200" />
                ) : (
                  <span className="shrink-0 w-11 h-11 rounded-xl bg-cream-100 text-ink-700 flex items-center justify-center">
                    <Icon name={c.icon} size={24} />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-display font-bold text-ink-950 truncate">{c.name}</span>
                  <span className="block text-xs text-ink-500 truncate">
                    {c.region} · sort {c.sort} · {productCount} catalogue product{productCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="ml-auto text-butter-700 font-bold text-sm shrink-0">Edit →</span>
              </Link>
              <form action={deleteCertification} className="mt-3 pt-3 border-t border-cream-200">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-[11px] font-semibold text-red-600 hover:text-red-700">
                  Delete certification page
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
