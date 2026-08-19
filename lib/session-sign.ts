/**
 * HMAC session + captcha signing without importing SQLite / seed.
 * /admin/login must stay on this module so Hostinger does not boot the CMS
 * on the login GET (that made the page spin for tens of seconds).
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./session-edge";
import { peekCertkoSecret, resolveCertkoSecret } from "./durable-secret";

export { ADMIN_COOKIE };

const DEFAULT_DEV = "certko-dev-secret-change-me";

function signingSecret(): string {
  return peekCertkoSecret() || resolveCertkoSecret() || DEFAULT_DEV;
}

export function signPayload(payload: string, secret = signingSecret()): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = signPayload(payload);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
