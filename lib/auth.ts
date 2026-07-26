import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "./db";
import { ADMIN_COOKIE } from "./session-edge";

export { ADMIN_COOKIE };

const SESSION_DAYS = 7;
const BCRYPT_ROUNDS = 12;

function getSecret(): string {
  return process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
}

export function signPayload(payload: string, secret = getSecret()): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * SESSION_DAYS;
  const payload = String(expires);
  return `${payload}.${signPayload(payload)}`;
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

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function checkPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const stored = getSetting("admin_password", "");
  if (!stored) {
    if (password === "certko-admin") {
      setSetting("admin_password", await hashPassword(password));
      return true;
    }
    return false;
  }
  if (isBcryptHash(stored)) {
    return bcrypt.compare(password, stored);
  }
  // Legacy plaintext — timing-safe compare, then upgrade to bcrypt
  if (password.length !== stored.length) return false;
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(stored));
    if (ok) setSetting("admin_password", await hashPassword(password));
    return ok;
  } catch {
    return false;
  }
}

export async function updateAdminPassword(nextPassword: string): Promise<void> {
  const trimmed = nextPassword.trim();
  if (trimmed.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  setSetting("admin_password", await hashPassword(trimmed));
}
