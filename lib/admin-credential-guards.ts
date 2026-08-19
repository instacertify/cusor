import fs from "fs";

/** Seed values written on a blank SQLite file. Never treat these as a saved login. */
export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "certko-admin";

export function isBcryptPassword(value: string): boolean {
  return /^\$2[aby]?\$\d{2}\$/.test(value ?? "");
}

export function isSeedAdminPassword(value: string): boolean {
  const v = (value ?? "").trim();
  return !v || v === DEFAULT_ADMIN_PASSWORD || !isBcryptPassword(v);
}

export function isSeedAdminUsername(value: string): boolean {
  const v = (value ?? "").trim();
  return !v || v.toLowerCase() === DEFAULT_ADMIN_USERNAME;
}

/**
 * How trustworthy a sidecar is for restoring admin login.
 * Missing: -1 · seed/empty: 0 · custom plaintext: 1 · bcrypt: 2 · bcrypt + custom id: 3
 */
export function sidecarCredentialStrength(filePath: string): number {
  if (!fs.existsSync(filePath)) return -1;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
    const pass =
      (typeof parsed.passwordHash === "string" && parsed.passwordHash) ||
      (typeof parsed.admin_password === "string" && parsed.admin_password) ||
      "";
    const user =
      (typeof parsed.username === "string" && parsed.username) ||
      (typeof parsed.admin_username === "string" && parsed.admin_username) ||
      "";
    if (isBcryptPassword(pass)) {
      return isSeedAdminUsername(user) ? 2 : 3;
    }
    if (pass && pass !== DEFAULT_ADMIN_PASSWORD) return 1;
    return 0;
  } catch {
    return 0;
  }
}
