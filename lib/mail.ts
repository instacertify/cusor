import nodemailer from "nodemailer";
import { getSetting } from "./db";

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  product?: string;
  message?: string;
}

function envOrSetting(envKey: string, settingKey: string, fallback = ""): string {
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  return getSetting(settingKey, fallback).trim();
}

export function getMailConfig() {
  return {
    host: envOrSetting("SMTP_HOST", "smtp_host", "smtp.gmail.com"),
    port: Number(envOrSetting("SMTP_PORT", "smtp_port", "587")) || 587,
    user: envOrSetting("SMTP_USER", "smtp_user", "contact@instacertify.com"),
    pass: envOrSetting("SMTP_PASS", "smtp_pass", ""),
    from:
      envOrSetting("SMTP_FROM", "smtp_from", "") ||
      envOrSetting("SMTP_USER", "smtp_user", "contact@instacertify.com"),
    notifyTo: envOrSetting(
      "LEAD_NOTIFY_EMAIL",
      "lead_notify_email",
      "contact@instacertify.com"
    ),
    enabled: envOrSetting("SMTP_ENABLED", "smtp_enabled", "1") !== "0",
  };
}

export function isMailConfigured(): boolean {
  const c = getMailConfig();
  return Boolean(c.enabled && c.host && c.user && c.pass && c.notifyTo);
}

function createTransport() {
  const c = getMailConfig();
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: {
      user: c.user,
      pass: c.pass,
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendLeadNotification(lead: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return {
      ok: false,
      error:
        "Email not configured. Add Google Workspace SMTP user + App Password in Admin → Site Settings.",
    };
  }

  const c = getMailConfig();
  const subjectProduct = lead.product ? ` — ${lead.product}` : "";
  const subject = `[Certko lead] ${lead.name}${subjectProduct}`;

  const text = [
    "New lead from certko.com",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "—"}`,
    `Product / test / certification: ${lead.product || "—"}`,
    "",
    "Message:",
    lead.message || "—",
    "",
    "—",
    "Saved in Admin → Inquiries",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#16263D">
      <h2 style="margin:0 0 12px">New lead from certko.com</h2>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:6px 0;font-weight:bold">Name</td><td style="padding:6px 0">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding:6px 0;font-weight:bold">Phone</td><td style="padding:6px 0">${escapeHtml(lead.phone || "—")}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold">Request</td><td style="padding:6px 0">${escapeHtml(lead.product || "—")}</td></tr>
      </table>
      <p style="margin:16px 0 6px;font-weight:bold">Message</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message || "—")}</p>
      <p style="margin:20px 0 0;color:#666;font-size:12px">Also saved in Certko Admin → Inquiries</p>
    </div>
  `;

  try {
    const transport = createTransport();
    const from = c.from.includes("<") ? c.from : `"Certko Leads" <${c.from}>`;
    await transport.sendMail({
      from,
      to: c.notifyTo,
      replyTo: lead.email,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[mail] lead notification failed:", message);
    return { ok: false, error: message };
  }
}

export async function sendTestLeadEmail(): Promise<{ ok: boolean; error?: string }> {
  return sendLeadNotification({
    name: "Certko SMTP test",
    email: getMailConfig().notifyTo,
    phone: "+91-0000000000",
    product: "SMTP configuration test",
    message: "If you received this, Google Workspace SMTP lead alerts are working for certko.com.",
  });
}
