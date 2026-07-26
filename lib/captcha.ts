import crypto from "crypto";
import svgCaptcha from "svg-captcha";
import { signPayload } from "./auth";

export const CAPTCHA_COOKIE = "certko_captcha";
const CAPTCHA_TTL_MS = 1000 * 60 * 10; // 10 minutes

function getSecret(): string {
  return process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
}

export function createCaptchaChallenge(): { svg: string; token: string } {
  const captcha = svgCaptcha.create({
    size: 5,
    ignoreChars: "0oO1ilI",
    noise: 3,
    color: true,
    background: "#f4f1ea",
    width: 180,
    height: 56,
    fontSize: 48,
  });
  const answer = captcha.text.toLowerCase();
  const expires = String(Date.now() + CAPTCHA_TTL_MS);
  const answerHash = crypto.createHash("sha256").update(`${answer}:${getSecret()}`).digest("hex");
  const payload = `${expires}.${answerHash}`;
  const token = `${payload}.${signPayload(payload)}`;
  return { svg: captcha.data, token };
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

  const normalized = userAnswer.trim().toLowerCase();
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
