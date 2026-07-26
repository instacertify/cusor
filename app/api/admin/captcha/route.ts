import { NextResponse } from "next/server";
import { CAPTCHA_COOKIE, createCaptchaChallenge } from "@/lib/captcha";
import { shouldUseSecureCookies } from "@/lib/cookie-secure";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { svg, token } = createCaptchaChallenge();
  const secure = shouldUseSecureCookies(request.headers);

  // Token is an HMAC of the answer hash — safe to return to the client for
  // form submit when Secure cookies are unavailable on HTTP.
  const res = NextResponse.json({
    svg,
    token,
    alt: "Enter the characters shown in the image",
  });
  res.cookies.set(CAPTCHA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    secure,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
