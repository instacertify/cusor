import { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";
import { CAPTCHA_COOKIE, verifyCaptchaToken } from "@/lib/captcha";
import { shouldUseSecureCookies } from "@/lib/cookie-secure";
import { ensureDbReady } from "@/lib/db";
import { seeOther } from "@/lib/http-redirect";
import { safeAdminNextPath } from "@/lib/request-path";
import {
  clearLoginFailures,
  getClientIp,
  isLoginRateLimited,
  logAdminEvent,
  recordLoginFailure,
} from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectTo(path: string) {
  return seeOther(path);
}

/**
 * Classic form POST + 303 with a relative Location.
 * Do not use next/navigation redirect() or `new URL(path, req.url)` —
 * Hostinger binds 0.0.0.0, so req.url becomes https://0.0.0.0:3000/... and
 * Chrome shows ERR_ADDRESS_INVALID. RSC redirect() also fails loopback fetch.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const ip = getClientIp(req.headers);
  const next = safeAdminNextPath(String(form.get("next") ?? "/admin"));
  const secure = shouldUseSecureCookies(req.headers);

  if (isLoginRateLimited(ip)) {
    logAdminEvent("login_blocked", ip, "rate_limited");
    return redirectTo("/admin/login?error=locked");
  }

  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const captcha = String(form.get("captcha") ?? "");
  const formToken = String(form.get("captcha_token") ?? "").trim();
  const cookieToken = req.cookies.get(CAPTCHA_COOKIE)?.value || "";
  const captchaToken = formToken || cookieToken;

  // Verify before ensureDbReady() so a data-dir migrate cannot rotate the
  // signing secret between GET /admin/login and this POST.
  if (!verifyCaptchaToken(captchaToken, captcha)) {
    // Wrong/empty captcha is not a credential failure — do not lock the IP.
    logAdminEvent("login_fail", ip, "bad_captcha");
    const res = redirectTo("/admin/login?error=captcha");
    res.cookies.delete(CAPTCHA_COOKIE);
    return res;
  }

  await ensureDbReady();

  if (!(await checkCredentials(username, password))) {
    const n = recordLoginFailure(ip);
    logAdminEvent("login_fail", ip, `bad_credentials attempt=${n}`);
    const res = redirectTo(
      n >= 8 ? "/admin/login?error=locked" : "/admin/login?error=1"
    );
    res.cookies.delete(CAPTCHA_COOKIE);
    return res;
  }

  clearLoginFailures(ip);
  logAdminEvent("login_ok", ip, "session_created");
  const res = redirectTo(next);
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), adminSessionCookieOptions(secure));
  res.cookies.delete(CAPTCHA_COOKIE);
  return res;
}
