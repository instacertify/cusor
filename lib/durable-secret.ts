import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getCertkoDataDir } from "./storage-paths";

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
 * Stable signing secret for admin sessions.
 * Preference: env CERTKO_SECRET → file in CERTKO_DATA_DIR → generate once.
 * The file lives next to SQLite/uploads so Hostinger hbuilds restarts keep sessions.
 */
export function resolveCertkoSecret(): string {
  if (cachedSecret) return cachedSecret;

  const fromEnv = (process.env.CERTKO_SECRET || "").trim();
  if (fromEnv && fromEnv !== DEFAULT_DEV) {
    try {
      const existing = readFileSecret();
      if (existing !== fromEnv) writeFileSecret(fromEnv);
    } catch {
      /* disk not writable — env still works */
    }
    cachedSecret = fromEnv;
    return fromEnv;
  }

  const fromFile = readFileSecret();
  if (fromFile && fromFile !== DEFAULT_DEV && fromFile.length >= 16) {
    if (!process.env.CERTKO_SECRET) process.env.CERTKO_SECRET = fromFile;
    cachedSecret = fromFile;
    return fromFile;
  }

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
    cachedSecret = fromEnv || DEFAULT_DEV;
    return cachedSecret;
  }
}

/** Tests only. */
export function resetDurableSecretCache(): void {
  cachedSecret = null;
}
