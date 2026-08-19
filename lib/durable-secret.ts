import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getCertkoDataDir, listCertkoSecretCandidateFiles } from "./storage-paths";

const DEFAULT_DEV = "certko-dev-secret-change-me";

let cachedSecret: string | null = null;

function secretFilePath(): string {
  return path.join(getCertkoDataDir(), ".certko-secret");
}

function readFileSecret(): string {
  try {
    const raw = fs.readFileSync(secretFilePath(), "utf8").trim();
    return raw;
  } catch {
    return "";
  }
}

function writeFileSecret(secret: string): void {
  const file = secretFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, secret, { encoding: "utf8", mode: 0o600 });
}

/**
 * Read the signing secret without creating the data dir or copying SQLite.
 * Login/captcha use this so Hostinger does not migrate hbuilds on GET /admin/login.
 */
export function peekCertkoSecret(): string {
  if (cachedSecret) return cachedSecret;

  const fromEnv = (process.env.CERTKO_SECRET || "").trim();
  if (fromEnv && fromEnv !== DEFAULT_DEV) {
    cachedSecret = fromEnv;
    return fromEnv;
  }

  for (const file of listCertkoSecretCandidateFiles()) {
    try {
      const raw = fs.readFileSync(file, "utf8").trim();
      if (raw && raw !== DEFAULT_DEV && raw.length >= 16) {
        cachedSecret = raw;
        if (!process.env.CERTKO_SECRET) process.env.CERTKO_SECRET = raw;
        return raw;
      }
    } catch {
      /* missing */
    }
  }
  return "";
}

/**
 * Stable signing secret for admin sessions.
 * Preference: env CERTKO_SECRET → existing secret file → generate once.
 * Disk persist (and hbuilds migrate) runs only when peek misses.
 */
export function resolveCertkoSecret(): string {
  const peeked = peekCertkoSecret();
  if (peeked) return peeked;

  const generated = crypto.randomBytes(32).toString("hex");
  try {
    writeFileSecret(generated);
    process.env.CERTKO_SECRET = generated;
    cachedSecret = generated;
    console.info(
      "[certko] Generated a stable CERTKO_SECRET in the data directory. Admin sessions will survive restarts."
    );
    return generated;
  } catch (err) {
    console.error("[certko] Could not persist CERTKO_SECRET to disk:", err);
    cachedSecret = (process.env.CERTKO_SECRET || "").trim() || DEFAULT_DEV;
    return cachedSecret;
  }
}

/** Tests only. */
export function resetDurableSecretCache(): void {
  cachedSecret = null;
}
