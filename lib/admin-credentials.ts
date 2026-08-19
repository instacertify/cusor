import fs from "fs";
import path from "path";
import {
  DEFAULT_ADMIN_USERNAME,
  isBcryptPassword,
  isSeedAdminPassword,
  isSeedAdminUsername,
  sidecarCredentialStrength,
} from "./admin-credential-guards";
import { getCertkoDataDir, listDurableSidecarSearchDirs, replicateDurableTextFile } from "./storage-paths";
import type { SqliteDatabase } from "./sqlite";

/**
 * Dedicated admin login sidecar. Unlike settings-archive.json this file is
 * never written with seed defaults (`admin` / `certko-admin`), so a later
 * Hostinger deploy cannot snapshot-clobber a real login.
 */
export const ADMIN_CREDENTIALS_FILE = ".certko-admin.json";

export type AdminCredentialsFile = {
  username: string;
  passwordHash: string;
  savedAt: string;
};

function primaryPath(): string {
  return path.join(getCertkoDataDir(), ADMIN_CREDENTIALS_FILE);
}

function parseCredentials(raw: string): AdminCredentialsFile | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const rec = parsed as Record<string, unknown>;
    const username = typeof rec.username === "string" ? rec.username.trim() : "";
    const passwordHash = typeof rec.passwordHash === "string" ? rec.passwordHash.trim() : "";
    const savedAt = typeof rec.savedAt === "string" ? rec.savedAt : "";
    if (!isBcryptPassword(passwordHash)) return null;
    return {
      username: username || DEFAULT_ADMIN_USERNAME,
      passwordHash,
      savedAt,
    };
  } catch {
    return null;
  }
}

/** Best hashed login found in the data dir, Hostinger persist dirs, or old version folders. */
export function peekAdminCredentials(): AdminCredentialsFile | null {
  let best: AdminCredentialsFile | null = null;
  let bestScore = -1;
  const seen = new Set<string>();

  for (const dir of listDurableSidecarSearchDirs()) {
    const file = path.join(dir, ADMIN_CREDENTIALS_FILE);
    const resolved = path.resolve(file);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    if (!fs.existsSync(file)) continue;
    const score = sidecarCredentialStrength(file);
    if (score <= bestScore) continue;
    try {
      const parsed = parseCredentials(fs.readFileSync(file, "utf8"));
      if (!parsed) continue;
      best = parsed;
      bestScore = score;
    } catch {
      /* skip unreadable */
    }
  }
  return best;
}

function upsertSetting(db: SqliteDatabase, key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

function readSetting(db: SqliteDatabase, key: string): string {
  return (
    (
      db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
        | { value: string }
        | undefined
    )?.value ?? ""
  );
}

/** Write hashed login to the data dir and every writable Hostinger persist path. */
export function persistAdminCredentials(db: SqliteDatabase): void {
  try {
    const username = readSetting(db, "admin_username").trim() || DEFAULT_ADMIN_USERNAME;
    const passwordHash = readSetting(db, "admin_password");
    if (!isBcryptPassword(passwordHash)) return;

    const payload: AdminCredentialsFile = {
      username,
      passwordHash,
      savedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(payload);
    fs.mkdirSync(path.dirname(primaryPath()), { recursive: true });
    fs.writeFileSync(primaryPath(), json, { encoding: "utf8", mode: 0o600 });
    replicateDurableTextFile(ADMIN_CREDENTIALS_FILE, json, 0o600);
  } catch (err) {
    console.error("[certko] admin credentials file write failed:", err);
  }
}

/**
 * Restore hashed login + username onto a re-seeded DB.
 * Username `admin` is treated as a seed default even when the password is already hashed.
 */
export function restoreAdminCredentials(db: SqliteDatabase): number {
  const saved = peekAdminCredentials();
  if (!saved) return 0;

  let restored = 0;
  const liveUser = readSetting(db, "admin_username");
  const livePass = readSetting(db, "admin_password");

  if (isBcryptPassword(saved.passwordHash) && isSeedAdminPassword(livePass)) {
    upsertSetting(db, "admin_password", saved.passwordHash);
    restored += 1;
  }

  if (saved.username && saved.username !== liveUser && isSeedAdminUsername(liveUser)) {
    upsertSetting(db, "admin_username", saved.username);
    restored += 1;
  }

  if (restored > 0) {
    console.info(`[certko] Restored admin login from ${ADMIN_CREDENTIALS_FILE}`);
  }
  return restored;
}

export function restoreAdminCredentialsSafe(db: SqliteDatabase): number {
  try {
    return restoreAdminCredentials(db);
  } catch (err) {
    console.error("[certko] admin credentials restore failed:", err);
    return 0;
  }
}
