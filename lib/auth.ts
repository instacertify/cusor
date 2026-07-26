import { cookies } from "next/headers";
import crypto from "crypto";
import { getSetting } from "./db";

const SECRET = process.env.CERTKO_SECRET || "certko-dev-secret-change-me";
const COOKIE = "certko_admin";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(sign(payload)), Buffer.from(sig))
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return Number(payload) > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export function checkPassword(password: string): boolean {
  return password.length > 0 && password === getSetting("admin_password", "certko-admin");
}
