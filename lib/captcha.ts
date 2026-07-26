import crypto from "crypto";
import svgCaptcha from "svg-captcha";
import { signPayload } from "./auth";

export const CAPTCHA_COOKIE = "certko_captcha";
const CAPTCHA_TTL_MS = 1000 * 60 * 10; // 10 minutes

function getSecret(): string {
  return process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
}

export function createCaptchaChallenge(): { svg: string; token: string; text: string } {
  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: "0oO1ilI9gq",
    noise: 2,
    color: true,
    background: "#f7f4ec",
    width: 200,
    height: 64,
    fontSize: 52,
    charPreset: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
  });
  const answer = captcha.text.toLowerCase();
  const expires = String(Date.now() + CAPTCHA_TTL_MS);
  const answerHash = crypto.createHash("sha256").update(`${answer}:${getSecret()}`).digest("hex");
  const payload = `${expires}.${answerHash}`;
  const token = `${payload}.${signPayload(payload)}`;
  return { svg: captcha.data, token, text: captcha.text };
}

export function verifyCaptchaToken(
  token: string | undefined | null,
  userAnswer: string
): boolean {
  if (!token || !userAnswer.trim()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expires, answerHash, sig] = parts;
  const payload = `${expires}.${answerHash}`;
  const expected = signPayload(payload);
  try {
    if (
      expected.length !== sig.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return false;
    }
  } catch {
    return false;
  }
  if (Number(expires) < Date.now()) return false;

  // Accept case-insensitive; strip spaces
  const normalized = userAnswer.trim().toLowerCase().replace(/\s+/g, "");
  const got = crypto
    .createHash("sha256")
    .update(`${normalized}:${getSecret()}`)
    .digest("hex");
  try {
    return (
      got.length === answerHash.length &&
      crypto.timingSafeEqual(Buffer.from(got), Buffer.from(answerHash))
    );
  } catch {
    return false;
  }
}
