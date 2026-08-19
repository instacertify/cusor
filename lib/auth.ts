import { cookies, headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "./db";
import { ADMIN_COOKIE } from "./session-edge";
import { shouldUseSecureCookies } from "./cookie-secure";
import { resolveCertkoSecret } from "./durable-secret";

export { ADMIN_COOKIE };

export const ADMIN_SESSION_DAYS = 7;
const SESSION_DAYS = ADMIN_SESSION_DAYS;
const BCRYPT_ROUNDS = 12;

export function adminSessionCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  secure: boolean;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    secure,
  };
}

function getSecret(): string {
  return resolveCertkoSecret();
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
  const hdrs = await headers();
  store.set(ADMIN_COOKIE, createSessionToken(), adminSessionCookieOptions(shouldUseSecureCookies(hdrs)));
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

export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "certko-admin";

export function getAdminUsername(): string {
  const stored = getSetting("admin_username", "").trim();
  return stored || DEFAULT_ADMIN_USERNAME;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateAdminUsername(username: string): string {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 64) {
    throw new Error("Login ID must be 3–64 characters");
  }
  if (!/^[a-zA-Z0-9._@-]+$/.test(trimmed)) {
    throw new Error("Login ID may only use letters, numbers, . _ @ -");
  }
  return trimmed;
}

export async function checkPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const stored = getSetting("admin_password", "");
  if (!stored) {
    if (password === DEFAULT_ADMIN_PASSWORD) {
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

export async function checkCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!username.trim() || !password) return false;
  const expected = normalizeUsername(getAdminUsername());
  const got = normalizeUsername(username);
  if (expected.length !== got.length) return false;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got))) {
      return false;
    }
  } catch {
    return false;
  }
  return checkPassword(password);
}

export async function updateAdminPassword(nextPassword: string): Promise<void> {
  const trimmed = nextPassword.trim();
  if (trimmed.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  setSetting("admin_password", await hashPassword(trimmed));
}

export async function updateAdminUsername(nextUsername: string): Promise<void> {
  setSetting("admin_username", validateAdminUsername(nextUsername));
}

export type CredentialsChangeInput = {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
  confirmPassword?: string;
};

/** Change login ID and/or password after verifying the current password. */
export async function changeAdminCredentials(
  input: CredentialsChangeInput
): Promise<{ usernameChanged: boolean; passwordChanged: boolean }> {
  if (!(await checkPassword(input.currentPassword))) {
    throw new Error("Current password is incorrect");
  }

  const nextUser = (input.newUsername ?? "").trim();
  const nextPass = (input.newPassword ?? "").trim();
  const confirmPass = (input.confirmPassword ?? "").trim();

  if (!nextUser && !nextPass) {
    throw new Error("Enter a new login ID and/or a new password");
  }

  let usernameChanged = false;
  let passwordChanged = false;

  if (nextUser) {
    const validated = validateAdminUsername(nextUser);
    if (normalizeUsername(validated) !== normalizeUsername(getAdminUsername())) {
      setSetting("admin_username", validated);
      usernameChanged = true;
    }
  }

  if (nextPass) {
    if (nextPass.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    if (nextPass !== confirmPass) {
      throw new Error("New password and confirmation do not match");
    }
    setSetting("admin_password", await hashPassword(nextPass));
    passwordChanged = true;
  }

  if (!usernameChanged && !passwordChanged) {
    throw new Error("Nothing to update — values are unchanged");
  }

  return { usernameChanged, passwordChanged };
}
