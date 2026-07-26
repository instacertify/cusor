/**
 * Edge-safe session helpers for Next.js middleware.
 * Keep this file free of Node-only deps (bcrypt, sqlite, fs).
 */

export const ADMIN_COOKIE = "certko_admin";

export function getAuthSecret(): string {
  return process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
}

export async function verifySessionTokenEdge(
  token: string | undefined | null,
  secret = getAuthSecret()
): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const hex = [...new Uint8Array(signature)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (hex.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < hex.length; i++) {
      diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    if (diff !== 0) return false;
    const expires = Number(payload);
    return Number.isFinite(expires) && expires > Date.now();
  } catch {
    return false;
  }
}
