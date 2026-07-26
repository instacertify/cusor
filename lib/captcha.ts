import crypto from "crypto";
import { signPayload } from "./auth";

export const CAPTCHA_COOKIE = "certko_captcha";
const CAPTCHA_TTL_MS = 1000 * 60 * 10; // 10 minutes

function getSecret(): string {
  return process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
}

/** Large, high-contrast math captcha — easy to read and type. */
function buildMathCaptcha(): { svg: string; answer: string; prompt: string } {
  let left = 2 + Math.floor(Math.random() * 8); // 2–9
  let right = 1 + Math.floor(Math.random() * 8); // 1–8
  const add = Math.random() > 0.45;
  if (!add && left < right) {
    const tmp = left;
    left = right;
    right = tmp;
  }
  const op = add ? "+" : "−";
  const answer = String(add ? left + right : left - right);
  const prompt = `${left} ${op} ${right}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="88" viewBox="0 0 320 88" role="img" aria-label="Math captcha">
  <rect width="320" height="88" rx="12" fill="#ffffff"/>
  <rect x="2" y="2" width="316" height="84" rx="10" fill="none" stroke="#d6d0c4" stroke-width="2"/>
  <text x="160" y="54" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="700" fill="#141820">${prompt} = ?</text>
  <text x="160" y="78" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">Type the number answer</text>
</svg>`;

  return { svg, answer, prompt };
}

export function createCaptchaChallenge(): { svg: string; token: string; text: string } {
  const { svg, answer } = buildMathCaptcha();
  const normalized = answer.trim().toLowerCase();
  const expires = String(Date.now() + CAPTCHA_TTL_MS);
  const answerHash = crypto
    .createHash("sha256")
    .update(`${normalized}:${getSecret()}`)
    .digest("hex");
  const payload = `${expires}.${answerHash}`;
  const token = `${payload}.${signPayload(payload)}`;
  return { svg, token, text: answer };
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
