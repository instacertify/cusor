import Link from "next/link";
import {
  anonymizeExpiredInquiries,
  consentStats,
  countOpenGdprRequests,
  getGdprPublicSettings,
  listConsentEvents,
  listGdprRequests,
  saveGdprAdminSettings,
  updateGdprRequestStatus,
  type GdprRequestStatus,
} from "@/lib/gdpr";
import { GDPR_REQUEST_TYPES } from "@/lib/gdpr-request-types";
import { requireAdmin } from "@/lib/auth";
import { SavedBanner, SubmitButton } from "@/components/admin/Field";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; redacted?: string }>;
}

async function saveCookieManagementAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const categoriesJson = JSON.stringify({
    necessary: {
      label: String(formData.get("cat_necessary_label") || "Necessary"),
      description: String(formData.get("cat_necessary_description") || ""),
      examples: String(formData.get("cat_necessary_examples") || ""),
      offered: true,
    },
    analytics: {
      label: String(formData.get("cat_analytics_label") || "Analytics"),
      description: String(formData.get("cat_analytics_description") || ""),
      examples: String(formData.get("cat_analytics_examples") || ""),
      offered: formData.get("cat_analytics_offered") === "on",
    },
    marketing: {
      label: String(formData.get("cat_marketing_label") || "Marketing"),
      description: String(formData.get("cat_marketing_description") || ""),
      examples: String(formData.get("cat_marketing_examples") || ""),
      offered: formData.get("cat_marketing_offered") === "on",
    },
  });

  saveGdprAdminSettings({
    gdpr_banner_enabled: formData.get("gdpr_banner_enabled") === "on" ? "1" : "0",
    gdpr_require_analytics_consent:
      formData.get("gdpr_require_analytics_consent") === "on" ? "1" : "0",
    gdpr_show_floating_cookie_button:
      formData.get("gdpr_show_floating_cookie_button") === "on" ? "1" : "0",
    gdpr_banner_show_categories_default:
      formData.get("gdpr_banner_show_categories_default") === "on" ? "1" : "0",
    gdpr_banner_title: String(formData.get("gdpr_banner_title") || ""),
    gdpr_banner_text: String(formData.get("gdpr_banner_text") || ""),
    gdpr_cookie_categories_json: categoriesJson,
    gdpr_privacy_officer_email: String(formData.get("gdpr_privacy_officer_email") || ""),
    gdpr_inquiry_retention_days: String(formData.get("gdpr_inquiry_retention_days") || "365"),
    gdpr_policy_version: String(formData.get("gdpr_policy_version") || ""),
  });
  revalidatePath("/admin/gdpr");
  revalidatePath("/privacy/cookies");
  revalidatePath("/", "layout");
  const { redirect } = await import("next/navigation");
  redirect("/admin/gdpr?saved=1");
}

async function updateRequestAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") || "new") as GdprRequestStatus;
  const notes = String(formData.get("admin_notes") || "");
  if (id) updateGdprRequestStatus(id, status, notes);
  revalidatePath("/admin/gdpr");
  const { redirect } = await import("next/navigation");
  redirect("/admin/gdpr?saved=1");
}

async function runRetentionAction() {
  "use server";
  await requireAdmin();
  const n = anonymizeExpiredInquiries();
  revalidatePath("/admin/gdpr");
  revalidatePath("/admin/inquiries");
  const { redirect } = await import("next/navigation");
  redirect(`/admin/gdpr?redacted=${n}`);
}

function typeLabel(value: string) {
  return GDPR_REQUEST_TYPES.find((t) => t.value === value)?.label || value;
}

export default async function AdminGdprPage({ searchParams }: Props) {
  const sp = await searchParams;
  const settings = getGdprPublicSettings();
  const requests = listGdprRequests(100);
  const consents = listConsentEvents(50);
  const openCount = countOpenGdprRequests();
  const stats = consentStats();
  const byKey = Object.fromEntries(settings.categories.map((c) => [c.key, c]));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">
        GDPR &amp; DPDP
      </h1>
      <p className="text-ink-600 text-sm mb-6 max-w-2xl">
        Cookie management, consent logging, and privacy data requests. Public pages:{" "}
        <Link href="/privacy/cookies" className="font-semibold text-butter-700 hover:underline">
          Cookie options
        </Link>
        {" · "}
        <Link
          href="/privacy/gdpr-and-dpdp"
          className="font-semibold text-butter-700 hover:underline"
        >
          GDPR &amp; DPDP guide
        </Link>
        .
      </p>

      <SavedBanner saved={sp.saved} message="Saved — cookie / GDPR settings updated." />
      {sp.redacted != null ? (
        <p className="mb-6 rounded-xl border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-ink-700">
          Retention run complete — anonymised <strong>{sp.redacted}</strong> inquiry
          record(s).
        </p>
      ) : null}

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
            Cookie banner
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-ink-950">
            {settings.bannerEnabled ? "On" : "Off"}
          </p>
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
            Consent events
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-950">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
            Analytics accepted
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-950">
            {stats.analyticsYes}
          </p>
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
            Open data requests
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-950">{openCount}</p>
        </div>
      </div>

      {/* ---- Cookie management (primary) ---- */}
      <section
        id="cookie-management"
        className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-950">
              Cookie management
            </h2>
            <p className="mt-1 text-sm text-ink-600 max-w-xl">
              Control the website cookie banner, floating Cookie options button, and each
              category visitors can choose.
            </p>
          </div>
          <Link
            href="/privacy/cookies"
            className="inline-flex min-h-10 items-center rounded-xl border border-cream-300 px-4 text-sm font-semibold text-ink-800 hover:border-butter-500"
          >
            Open public cookie page →
          </Link>
        </div>

        <form action={saveCookieManagementAction} className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 text-sm text-ink-800 rounded-xl border border-cream-200 px-4 py-3">
              <input
                type="checkbox"
                name="gdpr_banner_enabled"
                defaultChecked={settings.bannerEnabled}
              />
              Show cookie consent banner on first visit
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-800 rounded-xl border border-cream-200 px-4 py-3">
              <input
                type="checkbox"
                name="gdpr_require_analytics_consent"
                defaultChecked={settings.requireAnalyticsConsent}
              />
              Load GA / GTM only after analytics consent
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-800 rounded-xl border border-cream-200 px-4 py-3">
              <input
                type="checkbox"
                name="gdpr_show_floating_cookie_button"
                defaultChecked={settings.showFloatingCookieButton}
              />
              Show floating “Cookie options” button on website
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-800 rounded-xl border border-cream-200 px-4 py-3">
              <input
                type="checkbox"
                name="gdpr_banner_show_categories_default"
                defaultChecked={settings.bannerShowCategoriesDefault}
              />
              Show category toggles on the banner by default
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                Banner title
              </label>
              <input
                name="gdpr_banner_title"
                defaultValue={settings.bannerTitle}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                Policy version tag
              </label>
              <input
                name="gdpr_policy_version"
                defaultValue={settings.policyVersion}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
              Banner text
            </label>
            <textarea
              name="gdpr_banner_text"
              rows={3}
              defaultValue={settings.bannerText}
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950 mb-3">
              Cookie categories
            </h3>
            <div className="space-y-5">
              {(["necessary", "analytics", "marketing"] as const).map((key) => {
                const cat = byKey[key]!;
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-cream-300 bg-cream-50/80 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink-950 capitalize">{key}</p>
                      {key === "necessary" ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                          Always on
                        </span>
                      ) : (
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                          <input
                            type="checkbox"
                            name={`cat_${key}_offered`}
                            defaultChecked={cat.offered}
                          />
                          Offer this category on the website
                        </label>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                          Label
                        </label>
                        <input
                          name={`cat_${key}_label`}
                          defaultValue={cat.label}
                          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                          Examples / cookie names
                        </label>
                        <input
                          name={`cat_${key}_examples`}
                          defaultValue={cat.examples}
                          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                        Description shown to visitors
                      </label>
                      <textarea
                        name={`cat_${key}_description`}
                        rows={2}
                        defaultValue={cat.description}
                        className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-cream-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                Privacy officer email
              </label>
              <input
                name="gdpr_privacy_officer_email"
                type="email"
                defaultValue={settings.privacyOfficerEmail}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-500 mb-1">
                Inquiry retention (days)
              </label>
              <input
                name="gdpr_inquiry_retention_days"
                type="number"
                min={30}
                defaultValue={settings.inquiryRetentionDays}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <SubmitButton
            label="Save cookie management"
            className="inline-flex min-h-10 items-center rounded-xl bg-ink-950 px-5 text-sm font-semibold text-white disabled:opacity-60"
          />
        </form>

        <form action={runRetentionAction} className="mt-6 pt-6 border-t border-cream-200">
          <p className="text-sm text-ink-600 mb-3">
            Anonymise contact inquiries older than {settings.inquiryRetentionDays} days.
          </p>
          <SubmitButton
            label="Run retention now"
            className="inline-flex min-h-10 items-center rounded-xl border border-cream-300 px-5 text-sm font-semibold text-ink-800 hover:border-butter-500 disabled:opacity-60"
          />
        </form>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">
          Data requests (DSAR / DPDP)
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-ink-500 bg-white rounded-2xl border border-cream-300 p-6">
            No privacy requests yet. Public form:{" "}
            <Link
              href="/privacy/data-request"
              className="font-semibold text-butter-700 hover:underline"
            >
              /privacy/data-request
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-cream-300 shadow-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-ink-950">{r.name}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {r.email} · {typeLabel(r.request_type)} · {r.region} · {r.created_at} UTC
                    </p>
                  </div>
                  <form action={updateRequestAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="rounded-lg border border-cream-300 px-2 py-1.5 text-xs bg-white"
                    >
                      <option value="new">new</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="rejected">rejected</option>
                    </select>
                    <input
                      name="admin_notes"
                      defaultValue={r.admin_notes}
                      placeholder="Notes"
                      className="rounded-lg border border-cream-300 px-2 py-1.5 text-xs w-40"
                    />
                    <SubmitButton
                      label="Update"
                      className="text-xs font-bold bg-ink-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-60"
                    />
                  </form>
                </div>
                {r.details ? (
                  <p className="mt-3 text-sm text-ink-700 bg-cream-50 rounded-xl p-3">
                    {r.details}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-ink-950 mb-4">
          Recent consent events
        </h2>
        {consents.length === 0 ? (
          <p className="text-sm text-ink-500 bg-white rounded-2xl border border-cream-300 p-6">
            No consent events logged yet. Choices from the banner or{" "}
            <Link href="/privacy/cookies" className="font-semibold text-butter-700 hover:underline">
              /privacy/cookies
            </Link>{" "}
            appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cream-300 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-2 font-semibold">When</th>
                  <th className="px-4 py-2 font-semibold">Source</th>
                  <th className="px-4 py-2 font-semibold">Analytics</th>
                  <th className="px-4 py-2 font-semibold">Marketing</th>
                  <th className="px-4 py-2 font-semibold">Policy</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id} className="border-t border-cream-200 text-ink-700">
                    <td className="px-4 py-2 whitespace-nowrap">{c.created_at}</td>
                    <td className="px-4 py-2">{c.source}</td>
                    <td className="px-4 py-2">{c.analytics ? "yes" : "no"}</td>
                    <td className="px-4 py-2">{c.marketing ? "yes" : "no"}</td>
                    <td className="px-4 py-2">{c.policy_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
