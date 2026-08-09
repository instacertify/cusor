import Link from "next/link";
import { getSettings } from "@/lib/db";
import { isMailConfigured } from "@/lib/mail";
import { resolveColorScheme } from "@/lib/color-schemes";
import { iconStyleLabel, resolveIconStyle } from "@/lib/icon-style";
import { saveSettings } from "../../actions";
import { Field, TextArea, SavedBanner, SubmitButton, ImageUpload } from "@/components/admin/Field";
import ColorSchemePicker from "@/components/ColorSchemePicker";
import IconStylePicker from "@/components/IconStylePicker";
import SocialIconGlyph from "@/components/SocialIconGlyph";
import { SOCIAL_NETWORKS } from "@/lib/social-links";

export const dynamic = "force-dynamic";

const DEFAULT_LOGO_PRIMARY = "/brand/certko-logo.png";
const DEFAULT_LOGO_ON_DARK = "/brand/certko-logo-light.png";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string; cache?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = getSettings();
  const logoPrimary = s.logo_primary || DEFAULT_LOGO_PRIMARY;
  const logoOnDark = s.logo_on_dark || DEFAULT_LOGO_ON_DARK;
  const mailReady = isMailConfigured();
  const colorScheme = resolveColorScheme(s.color_scheme);
  const iconStyle = resolveIconStyle(s.icon_style);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Site Settings</h1>
      <p className="text-ink-600 text-sm mb-6">
        Brand hub: color scheme, icons, logos, hero copy, contact details and analytics. Email delivery is under{" "}
        <Link href="/admin/email" className="font-semibold text-butter-700 hover:underline">
          Email / SMTP
        </Link>
        . Use the sidebar <strong>Clear cache</strong> button anytime to refresh the public site.
      </p>
      <SavedBanner saved={sp.saved} />

      <form action={saveSettings} className="space-y-8">
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Color scheme</h2>
          <p className="text-sm text-ink-600">
            Tap a palette to select it, then click <strong>Save Changes</strong> at the bottom.
            Applies sitewide to backgrounds, text, buttons and accents. Current:{" "}
            <strong className="text-ink-950">{colorScheme.name}</strong>.
          </p>
          <ColorSchemePicker value={colorScheme.id} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Icon style</h2>
          <p className="text-sm text-ink-600">
            Choose no-color outline, original color, or original color 3D icons for chips across
            the whole website. Current:{" "}
            <strong className="text-ink-950">{iconStyleLabel(iconStyle)}</strong>.
          </p>
          <IconStylePicker value={iconStyle} />
        </section>

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
          <p className="text-sm text-ink-600">
            Edit the main headline here. Manage the dark stats strip in the section below, and
            category GIF/video slides plus <strong>Explore more</strong> buttons on{" "}
            <Link href="/admin/hero" className="font-semibold text-butter-700 hover:underline">
              Hero Banner
            </Link>
            .
          </p>
          <Field label="Hero Heading" name="hero_heading" defaultValue={s.hero_heading} />
          <TextArea label="Hero Subheading" name="hero_subheading" defaultValue={s.hero_subheading} rows={3} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-5">
          <div>
            <h2 className="font-display font-bold text-ink-950">Homepage stats strip</h2>
            <p className="text-sm text-ink-600 mt-1">
              Edit the dark proof strip under the hero. Change the large number/text, the label under it,
              and optionally upload a logo or icon for each slot. Clear both value and label to hide a slot.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => {
              const valueKey = `stat_${i}_value`;
              const labelKey = `stat_${i}_label`;
              const iconKey = `stat_${i}_icon`;
              const icon = (s[iconKey] || "").trim();
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-cream-300 bg-cream-50/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display font-bold text-ink-950">Stat {i}</p>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 text-cream-50 overflow-hidden">
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={icon} alt="" className="h-7 w-7 object-contain" />
                      ) : (
                        <span className="text-[10px] font-semibold text-cream-100/70">No logo</span>
                      )}
                    </span>
                  </div>
                  <Field
                    label="Value (large text)"
                    name={valueKey}
                    defaultValue={s[valueKey]}
                    placeholder="e.g. 2,500+"
                  />
                  <Field
                    label="Label (under value)"
                    name={labelKey}
                    defaultValue={s[labelKey]}
                    placeholder="e.g. Product Categories Covered"
                  />
                  <ImageUpload
                    current={icon || undefined}
                    name={`${iconKey}_file`}
                    label="Logo / icon (optional)"
                    clearName={`clear_${iconKey}`}
                    clearLabel="Remove logo from this slot"
                    previewFit="contain"
                    previewAspect="aspect-square max-w-[7rem]"
                    hint="PNG or SVG on transparent background works best on the dark strip."
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Call-to-Action Banner</h2>
          <Field label="CTA Heading" name="cta_heading" defaultValue={s.cta_heading} />
          <TextArea label="CTA Text" name="cta_text" defaultValue={s.cta_text} rows={2} />
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Talk to a certification expert</h2>
          <p className="text-sm text-ink-600">
            Controls the header button, footer button and floating button on public pages. Keep the
            wording plain — short sentences work best for search and readers.
          </p>
          <Field
            label="Full label"
            name="expert_cta_label"
            defaultValue={s.expert_cta_label || "Talk to a certification expert"}
          />
          <Field
            label="Short label (header)"
            name="expert_cta_label_short"
            defaultValue={s.expert_cta_label_short || "Talk to expert"}
          />
          <Field
            label="Link"
            name="expert_cta_href"
            defaultValue={s.expert_cta_href || "/contact?intent=expert"}
            hint="Must start with / — usually /contact?intent=expert"
          />
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
          <p className="text-sm text-ink-600 rounded-xl border border-cream-300 bg-cream-50 px-4 py-3">
            Admin login ID and password are managed on{" "}
            <Link href="/admin/account" className="font-semibold text-butter-700 hover:underline">
              Login &amp; password
            </Link>{" "}
            (requires current password and double confirmation).
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-5">
          <div>
            <h2 className="font-display font-bold text-ink-950">Social media</h2>
            <p className="text-sm text-ink-600 mt-1">
              Add profile URLs for the footer. Leave a URL blank to hide that network.
              Optionally upload a custom icon (PNG/SVG) to replace the default brand glyph.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {SOCIAL_NETWORKS.map((network) => {
              const url = s[network.urlKey] || "";
              const icon = s[network.iconKey] || "";
              return (
                <div
                  key={network.id}
                  className="rounded-2xl border border-cream-300 bg-cream-50/60 p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-cream-50">
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={icon} alt="" className="h-4 w-4 object-contain" />
                      ) : (
                        <SocialIconGlyph id={network.id} className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="font-display font-bold text-ink-950">{network.label}</p>
                      <p className="text-[11px] text-ink-500">Footer social link</p>
                    </div>
                  </div>
                  <Field
                    label={`${network.label} URL`}
                    name={network.urlKey}
                    defaultValue={url}
                    type="url"
                    placeholder={network.placeholder}
                  />
                  <ImageUpload
                    current={icon || undefined}
                    name={network.fileKey}
                    label={`${network.label} icon (optional)`}
                    clearName={network.clearKey}
                    clearLabel="Use default brand icon"
                    previewFit="contain"
                    previewAspect="aspect-square max-w-[7rem]"
                    hint="Square PNG or SVG works best. Leave empty to keep the built-in icon."
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-3">
          <h2 className="font-display font-bold text-ink-950">Email / SMTP</h2>
          <p className="text-sm text-ink-600">
            Lead notification mailer status:{" "}
            <span className={mailReady ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
              {mailReady ? "Ready to send" : "Needs SMTP password"}
            </span>
            . Configure host, username, password and notify inbox on the dedicated page.
          </p>
          <Link
            href="/admin/email"
            className="inline-flex items-center justify-center rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition"
          >
            Open Email / SMTP settings
          </Link>
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
    </div>
  );
}
