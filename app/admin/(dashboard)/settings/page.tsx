import { getSettings } from "@/lib/db";
import { isMailConfigured } from "@/lib/mail";
import { saveSettings, sendTestLeadEmailAction } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

const DEFAULT_LOGO_PRIMARY = "/brand/certko-logo.png";
const DEFAULT_LOGO_ON_DARK = "/brand/certko-logo-light.png";

interface Props {
  searchParams: Promise<{ saved?: string; mail?: string; mail_error?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = getSettings();
  const logoPrimary = s.logo_primary || DEFAULT_LOGO_PRIMARY;
  const logoOnDark = s.logo_on_dark || DEFAULT_LOGO_ON_DARK;
  const mailReady = isMailConfigured();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Site Settings</h1>
      <p className="text-ink-600 text-sm mb-6">
        Brand fields, hero copy, stats and contact details shown across the site.
      </p>
      <SavedBanner saved={sp.saved} />
      {sp.mail === "sent" && (
        <p className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
          Test lead email sent to {s.lead_notify_email || "contact@instacertify.com"}.
        </p>
      )}
      {sp.mail === "error" && (
        <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          Could not send test email: {sp.mail_error || "check SMTP App Password and try again."}
        </p>
      )}
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

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-ink-950">Lead email (Google Workspace)</h2>
              <p className="text-sm text-ink-600 mt-1">
                When someone submits Contact / Request a quote on certko.com, notify this inbox.
                Status:{" "}
                <span className={mailReady ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
                  {mailReady ? "SMTP configured" : "SMTP App Password still needed"}
                </span>
              </p>
            </div>
          </div>
          <Field
            label="Notify email (lead inbox)"
            name="lead_notify_email"
            defaultValue={s.lead_notify_email || "contact@instacertify.com"}
            placeholder="contact@instacertify.com"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="SMTP host"
              name="smtp_host"
              defaultValue={s.smtp_host || "smtp.gmail.com"}
            />
            <Field
              label="SMTP port"
              name="smtp_port"
              defaultValue={s.smtp_port || "587"}
              placeholder="587"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="SMTP username (Google Workspace)"
              name="smtp_user"
              defaultValue={s.smtp_user || "contact@instacertify.com"}
            />
            <Field
              label="SMTP App Password"
              name="smtp_pass"
              type="password"
              defaultValue=""
              placeholder={s.smtp_pass ? "•••••••• (saved — leave blank to keep)" : "Google App Password"}
            />
          </div>
          <Field
            label="From address"
            name="smtp_from"
            defaultValue={s.smtp_from || s.smtp_user || "contact@instacertify.com"}
          />
          <input type="hidden" name="smtp_enabled" value="0" />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="smtp_enabled"
              value="1"
              defaultChecked={(s.smtp_enabled ?? "1") !== "0"}
              className="rounded border-cream-300"
            />
            Enable lead email notifications
          </label>
          <p className="text-[11px] text-ink-500 leading-relaxed">
            Google Workspace setup: Google Account → Security → 2-Step Verification → App passwords →
            create one for Mail, then paste it above. You can also set env vars{" "}
            <code className="bg-cream-100 px-1 rounded">SMTP_PASS</code>,{" "}
            <code className="bg-cream-100 px-1 rounded">SMTP_USER</code>,{" "}
            <code className="bg-cream-100 px-1 rounded">LEAD_NOTIFY_EMAIL</code>.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Analytics & verification</h2>
          <p className="text-sm text-ink-600">
            Enter tracking IDs and site-verification codes. They are injected site-wide after save
            (public pages only — not required for admin).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Google Analytics 4 ID"
              name="ga4_measurement_id"
              defaultValue={s.ga4_measurement_id}
              placeholder="G-XXXXXXXXXX"
            />
            <Field
              label="Google Tag Manager ID"
              name="gtm_container_id"
              defaultValue={s.gtm_container_id}
              placeholder="GTM-XXXXXXX"
            />
          </div>
          <p className="text-[11px] text-ink-500">
            If GTM is set, use GTM to load GA (the GA4 field is skipped to avoid double-counting).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Google Search Console verification"
              name="google_site_verification"
              defaultValue={s.google_site_verification}
              placeholder="meta content=… value only"
            />
            <Field
              label="Bing Webmaster verification"
              name="bing_site_verification"
              defaultValue={s.bing_site_verification}
              placeholder="msvalidate.01 content value"
            />
          </div>
          <Field
            label="Facebook domain verification"
            name="facebook_domain_verification"
            defaultValue={s.facebook_domain_verification}
            placeholder="facebook-domain-verification content value"
          />
          <TextArea
            label="Custom head HTML / scripts"
            name="custom_head_html"
            defaultValue={s.custom_head_html}
            rows={5}
            hint="Paste extra <meta> or <script> tags for other analytics / verification tools. Injected in <head>."
          />
          <TextArea
            label="Custom body HTML / scripts"
            name="custom_body_html"
            defaultValue={s.custom_body_html}
            rows={4}
            hint="Optional snippets placed at the start of <body> (chat widgets, pixel noscript tags, etc.)."
          />
        </section>

        <SubmitButton />
      </form>

      <form action={sendTestLeadEmailAction} className="mt-4">
        <button
          type="submit"
          className="rounded-full border border-ink-900 px-6 py-2.5 text-sm font-semibold text-ink-900 hover:bg-cream-100 transition-colors"
        >
          Send test lead email
        </button>
        <p className="mt-2 text-xs text-ink-500">
          Uses saved SMTP settings (or SMTP_* env vars). Does not change Site Settings.
        </p>
      </form>
    </div>
  );
}
