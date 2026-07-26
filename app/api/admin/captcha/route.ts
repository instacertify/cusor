import { NextResponse } from "next/server";
import { CAPTCHA_COOKIE, createCaptchaChallenge } from "@/lib/captcha";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { svg, token } = createCaptchaChallenge();
  const res = NextResponse.json({
    svg,
    // hint only for accessibility — never the answer
    alt: "Enter the characters shown in the image",
  });
  res.cookies.set(CAPTCHA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === "production",
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
