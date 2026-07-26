import { getTestimonials } from "@/lib/queries";
import { saveTestimonial, deleteTestimonial } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";
import BulkImportLink from "@/components/admin/BulkImportLink";
import ConfirmDeleteForm from "@/components/admin/ConfirmDeleteForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminTestimonials({ searchParams }: Props) {
  const sp = await searchParams;
  const testimonials = getTestimonials();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl font-semibold text-ink-950">Testimonials</h1>
        <BulkImportLink entity="testimonials" />
      </div>
      <p className="text-ink-600 text-sm mb-6">Shown on the homepage trust section. Add one below or bulk-upload via Excel.</p>
      <SavedBanner saved={sp.saved} error={sp.error} />

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-cream-300 shadow-card p-5">
            <form action={saveTestimonial} className="space-y-3">
              <input type="hidden" name="id" value={t.id} />
              <div className="grid sm:grid-cols-[1fr_1fr_90px] gap-3">
                <Field label="Name" name="name" defaultValue={t.name} required />
                <Field label="Role" name="role" defaultValue={t.role} />
                <Field label="Rating (1-5)" name="rating" type="number" defaultValue={t.rating} />
              </div>
              <TextArea label="Quote" name="quote" defaultValue={t.quote} rows={3} />
              <SubmitButton label="Save" />
            </form>
            <ConfirmDeleteForm
              action={deleteTestimonial}
              className="mt-2"
              itemLabel={`testimonial from “${t.name}”`}
            >
              <input type="hidden" name="id" value={t.id} />
              <button className="text-xs font-semibold text-red-600 hover:text-red-700">Delete</button>
            </ConfirmDeleteForm>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-cream-100 rounded-2xl border border-cream-300 p-5">
        <h2 className="font-display font-bold text-ink-950 mb-3">Add Testimonial</h2>
        <form action={saveTestimonial} className="space-y-3">
          <div className="grid sm:grid-cols-[1fr_1fr_90px] gap-3">
            <Field label="Name" name="name" required />
            <Field label="Role" name="role" />
            <Field label="Rating (1-5)" name="rating" type="number" defaultValue={5} />
          </div>
          <TextArea label="Quote" name="quote" rows={3} />
          <SubmitButton label="Add" />
        </form>
      </div>
    </div>
  );
}
