import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";
import { CAPTCHA_COOKIE, verifyCaptchaToken } from "@/lib/captcha";
import { shouldUseSecureCookies } from "@/lib/cookie-secure";
import { ensureDbReady } from "@/lib/db";
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

function redirectTo(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
}

/**
 * Classic form POST + 303. Do not use next/navigation redirect() here —
 * Hostinger's RSC follow-up fetch fails ("failed to get redirect response"),
 * which shows an error until the user reloads.
 */
export async function POST(req: NextRequest) {
  await ensureDbReady();
  const form = await req.formData();
  const ip = getClientIp(req.headers);
  const next = safeAdminNextPath(String(form.get("next") ?? "/admin"));
  const secure = shouldUseSecureCookies(req.headers);

  if (isLoginRateLimited(ip)) {
    logAdminEvent("login_blocked", ip, "rate_limited");
    return redirectTo(req, "/admin/login?error=locked");
  }

  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const captcha = String(form.get("captcha") ?? "");
  const formToken = String(form.get("captcha_token") ?? "").trim();
  const cookieToken = req.cookies.get(CAPTCHA_COOKIE)?.value || "";
  const captchaToken = formToken || cookieToken;

  if (!verifyCaptchaToken(captchaToken, captcha)) {
    recordLoginFailure(ip);
    logAdminEvent("login_fail", ip, "bad_captcha");
    const res = redirectTo(req, "/admin/login?error=captcha");
    res.cookies.delete(CAPTCHA_COOKIE);
    return res;
  }

  if (!(await checkCredentials(username, password))) {
    const n = recordLoginFailure(ip);
    logAdminEvent("login_fail", ip, `bad_credentials attempt=${n}`);
    const res = redirectTo(
      req,
      n >= 8 ? "/admin/login?error=locked" : "/admin/login?error=1"
    );
    res.cookies.delete(CAPTCHA_COOKIE);
    return res;
  }

  clearLoginFailures(ip);
  logAdminEvent("login_ok", ip, "session_created");
  const res = redirectTo(req, next);
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), adminSessionCookieOptions(secure));
  res.cookies.delete(CAPTCHA_COOKIE);
  return res;
}
