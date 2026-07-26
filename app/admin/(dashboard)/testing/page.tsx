import Link from "next/link";
import Icon from "@/components/Icon";
import { getTestingCategories, countTestingServices } from "@/lib/queries";
import { createTestingCategory, deleteTestingCategory } from "../../actions";
import { Field, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTesting({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = getTestingCategories();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Product Testing</h1>
      <p className="text-ink-600 text-sm mb-6">
        Manage testing categories and individual tests. Each category and test page supports image,
        writeup, FAQs and SEO. Pages appear under Product Testing in the header and site search.
      </p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="bg-cream-100 rounded-2xl border border-cream-300 p-5 mb-8">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add a testing category</h2>
        <form action={createTestingCategory} className="space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Name" name="name" required placeholder="e.g. Environmental Testing" />
            <Field label="URL slug (optional)" name="slug" placeholder="auto from name" />
            <Field label="Icon" name="icon" placeholder="microscope" defaultValue="microscope" />
          </div>
          <Field label="Summary" name="summary" placeholder="One-line description for cards & search" />
          <ImageUpload current="" label="Front image (optional)" allowClear={false} />
          <SubmitButton label="Create category" />
        </form>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((c) => {
          const serviceCount = countTestingServices(c.id);
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-card hover:shadow-card-hover transition p-5"
            >
              <Link href={`/admin/testing/${c.id}`} className="flex items-center gap-4">
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
                    sort {c.sort} · {serviceCount} test{serviceCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="ml-auto text-butter-700 font-bold text-sm shrink-0">Edit →</span>
              </Link>
              <form action={deleteTestingCategory} className="mt-3 pt-3 border-t border-cream-200">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-[11px] font-semibold text-red-600 hover:text-red-700">
                  Delete category & tests
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
