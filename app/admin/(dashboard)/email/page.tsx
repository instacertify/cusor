import Link from "next/link";
import { getSettings } from "@/lib/db";
import { isMailConfigured, getMailConfig } from "@/lib/mail";
import { saveSmtpSettings, sendTestLeadEmailAction } from "../../actions";
import { Field, SavedBanner, SubmitButton } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ saved?: string; mail?: string; mail_error?: string }>;
}

export default async function AdminEmailPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = getSettings();
  const mailReady = isMailConfigured();
  const live = getMailConfig();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 mb-1">Email / SMTP</h1>
      <p className="text-ink-600 text-sm mb-6">
        Configure the SMTP server used to email new contact and request-a-quote leads.
        Status:{" "}
        <span className={mailReady ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
          {mailReady ? "Ready to send" : "Password / SMTP not complete"}
        </span>
      </p>

      <SavedBanner saved={sp.saved} />
      {sp.mail === "sent" && (
        <p className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
          Test lead email sent to {live.notifyTo}.
        </p>
      )}
      {sp.mail === "error" && (
        <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          Could not send test email: {sp.mail_error || "check SMTP host, username and password."}
        </p>
      )}

      <form action={saveSmtpSettings} className="space-y-6">
        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">Lead notifications</h2>
          <p className="text-sm text-ink-600">
            When a visitor submits the contact or request-a-quote form, the lead is saved under{" "}
            <Link href="/admin/inquiries" className="font-semibold text-butter-700 hover:underline">
              Inquiries
            </Link>{" "}
            and emailed to the notify address below.
          </p>
          <Field
            label="Notify email (where leads are sent)"
            name="lead_notify_email"
            defaultValue={s.lead_notify_email || "contact@instacertify.com"}
            placeholder="contact@instacertify.com"
            required
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
        </section>

        <section className="bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-4">
          <h2 className="font-display font-bold text-ink-950">SMTP server</h2>
          <p className="text-sm text-ink-600">
            Works with Google Workspace, Gmail, Microsoft 365, Zoho, or any standard SMTP provider.
            Google Workspace defaults are prefilled for <strong>contact@instacertify.com</strong>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="SMTP host"
              name="smtp_host"
              defaultValue={s.smtp_host || "smtp.gmail.com"}
              placeholder="smtp.gmail.com"
              required
            />
            <Field
              label="SMTP port"
              name="smtp_port"
              defaultValue={s.smtp_port || "587"}
              placeholder="587 (TLS) or 465 (SSL)"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="SMTP username"
              name="smtp_user"
              defaultValue={s.smtp_user || "contact@instacertify.com"}
              placeholder="contact@instacertify.com"
              required
            />
            <Field
              label="SMTP password / App Password"
              name="smtp_pass"
              type="password"
              defaultValue=""
              placeholder={s.smtp_pass ? "•••••••• (saved — leave blank to keep)" : "App Password or SMTP password"}
            />
          </div>
          <Field
            label="From address"
            name="smtp_from"
            defaultValue={s.smtp_from || s.smtp_user || "contact@instacertify.com"}
            placeholder="contact@instacertify.com"
          />
          <input type="hidden" name="smtp_secure" value="0" />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="smtp_secure"
              value="1"
              defaultChecked={(s.smtp_secure ?? (s.smtp_port === "465" ? "1" : "0")) === "1"}
              className="rounded border-cream-300"
            />
            Use SSL/TLS immediately (secure connection — usually for port 465)
          </label>
          <p className="text-[11px] text-ink-500 leading-relaxed">
            Google Workspace: Account → Security → 2-Step Verification → App passwords → Mail, then paste
            the 16-character password above. Env vars{" "}
            <code className="bg-cream-100 px-1 rounded">SMTP_HOST</code>,{" "}
            <code className="bg-cream-100 px-1 rounded">SMTP_USER</code>,{" "}
            <code className="bg-cream-100 px-1 rounded">SMTP_PASS</code>,{" "}
            <code className="bg-cream-100 px-1 rounded">LEAD_NOTIFY_EMAIL</code> override these fields when set.
          </p>
          <SubmitButton label="Save SMTP settings" />
        </section>
      </form>

      <section className="mt-6 bg-white rounded-2xl border border-cream-300 shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-ink-950">Test delivery</h2>
        <p className="text-sm text-ink-600">
          Sends a sample lead email to <strong>{live.notifyTo}</strong> using the saved SMTP settings.
        </p>
        <form action={sendTestLeadEmailAction}>
          <button
            type="submit"
            className="rounded-full border border-ink-900 px-6 py-2.5 text-sm font-semibold text-ink-900 hover:bg-cream-100 transition-colors"
          >
            Send test lead email
          </button>
        </form>
      </section>
    </div>
  );
}
