/**
 * Lead email / SMTP is intentionally disabled.
 * Contact forms only persist leads in Admin → Inquiries.
 */

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  product?: string;
  message?: string;
  intent?: string;
}

export function getMailConfig() {
  return {
    host: "",
    port: 587,
    user: "",
    pass: "",
    from: "",
    notifyTo: "",
    enabled: false,
    secure: false,
  };
}

export function isMailConfigured(): boolean {
  return false;
}

export async function sendLeadNotification(
  _lead: LeadPayload
): Promise<{ ok: boolean; error?: string }> {
  return {
    ok: false,
    error: "Lead email alerts are disabled. Leads are saved in Admin → Inquiries only.",
  };
}

export async function sendTestLeadEmail(): Promise<{ ok: boolean; error?: string }> {
  return sendLeadNotification({
    name: "disabled",
    email: "",
  });
}
