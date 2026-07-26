import { getSettings } from "@/lib/db";
import { saveSettings } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

const DEFAULT_LOGO_PRIMARY = "/brand/certko-logo.png";
const DEFAULT_LOGO_ON_DARK = "/brand/certko-logo-light.png";

interface Props {
  searchParams: Promise<{ saved?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = getSettings();
  const logoPrimary = s.logo_primary || DEFAULT_LOGO_PRIMARY;
  const logoOnDark = s.logo_on_dark || DEFAULT_LOGO_ON_DARK;

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
          <div className="pt-2 border-t border-cream-200">
            <h3 className="font-display font-semibold text-ink-900 mb-1">Site logo</h3>
            <p className="text-xs text-ink-500 mb-4">
              Upload a transparent PNG so it sits on the normal page background (no extra box).
              Changes apply to the header, footer, and admin login.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <ImageUpload
                current={logoPrimary}
                name="logo_primary_file"
                label="Primary logo (header / light backgrounds)"
                clearName="clear_logo_primary"
                clearLabel="Reset to default CERTKO logo"
                previewFit="contain"
                hint="Preferred: transparent PNG with wordmark + tagline."
              />
              <div>
                <ImageUpload
                  current={logoOnDark}
                  name="logo_on_dark_file"
                  label="Footer logo (dark backgrounds)"
                  clearName="clear_logo_on_dark"
                  clearLabel="Reset to default light logo"
                  previewFit="contain"
                  hint="Use a light / cream wordmark PNG for the dark footer."
                />
                <div className="mt-2 max-w-xs rounded-xl bg-ink-950 p-4 border border-ink-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoOnDark}
                    alt="Footer logo preview on dark"
                    className="w-full h-auto object-contain bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
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
          <TextArea
            label="Office Address"
            name="contact_address"
            defaultValue={s.contact_address}
            rows={3}
          />
          <Field label="Admin Password" name="admin_password" defaultValue={s.admin_password} type="text" />
        </section>

        <SubmitButton />
      </form>
    </div>
  );
}
