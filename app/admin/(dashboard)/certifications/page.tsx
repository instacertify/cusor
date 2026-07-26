import Link from "next/link";
import Icon from "@/components/Icon";
import { getCertifications } from "@/lib/queries";
import { createCertification, deleteCertification } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminCertifications({ searchParams }: Props) {
  const sp = await searchParams;
  const certs = getCertifications();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Certifications</h1>
      <p className="text-ink-600 text-sm mb-6">
        Certification programme pages shown in the header menu, footer and at /certifications.
        New certifications appear in the menu automatically.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add a New Certification Page</h2>
        <form action={createCertification} className="grid sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_0.8fr_0.6fr_auto] gap-3 items-end">
          <Field label="Name" name="name" required placeholder="e.g. FDA Registration" />
          <Field label="Full Name" name="full_name" placeholder="e.g. US Food & Drug Administration" />
          <Field label="Region" name="region" placeholder="e.g. United States" />
          <Field label="Icon" name="icon" placeholder="award" />
          <SubmitButton label="Create" />
        </form>
        <p className="text-[11px] text-ink-500 mt-2">
          Creates a draft page you can then fill with a summary, writeup, image and FAQs.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {certs.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
          >
            <Link href={`/admin/certifications/${c.id}`} className="flex items-center gap-4">
              <span className="shrink-0 w-11 h-11 rounded-xl bg-cream-100 text-ink-700 flex items-center justify-center">
                <Icon name={c.icon} size={24} />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-ink-950 truncate">{c.name}</span>
                <span className="block text-xs text-ink-500 truncate">{c.region} · {c.full_name}</span>
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
        ))}
      </div>
    </div>
  );
}
