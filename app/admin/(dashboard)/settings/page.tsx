import { getSettings } from "@/lib/db";
import { saveSettings } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Site Settings</h1>
      <p className="text-ink-600 text-sm mb-6">
        Brand fields, hero copy, stats and contact details shown across the site.
      </p>
      <SavedBanner saved={sp.saved} />
      <form action={saveSettings} className="space-y-8">
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Brand</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site Name" name="site_name" defaultValue={s.site_name} required />
            <Field label="Announcement Bar" name="announcement" defaultValue={s.announcement} />
          </div>
          <TextArea label="Tagline" name="tagline" defaultValue={s.tagline} rows={2} />
          <TextArea label="Footer Disclaimer" name="footer_text" defaultValue={s.footer_text} rows={2} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Homepage Hero</h2>
          <Field label="Hero Heading" name="hero_heading" defaultValue={s.hero_heading} />
          <TextArea label="Hero Subheading" name="hero_subheading" defaultValue={s.hero_subheading} rows={3} />
          <div className="grid sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Field label={`Stat ${i} Value`} name={`stat_${i}_value`} defaultValue={s[`stat_${i}_value`]} />
                <Field label={`Stat ${i} Label`} name={`stat_${i}_label`} defaultValue={s[`stat_${i}_label`]} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Call-to-Action Banner</h2>
          <Field label="CTA Heading" name="cta_heading" defaultValue={s.cta_heading} />
          <TextArea label="CTA Text" name="cta_text" defaultValue={s.cta_text} rows={2} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Contact & Access</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Contact Email" name="contact_email" defaultValue={s.contact_email} />
            <Field label="Contact Phone" name="contact_phone" defaultValue={s.contact_phone} />
          </div>
          <Field label="Admin Password" name="admin_password" defaultValue={s.admin_password} type="text" />
        </section>

        <SubmitButton />
      </form>
    </div>
  );
}
