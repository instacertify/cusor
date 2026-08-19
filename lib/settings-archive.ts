import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getCertkoDataDir, replicateDurableTextFile } from "./storage-paths";
import {
  isBcryptPassword,
  isSeedAdminPassword,
  isSeedAdminUsername,
} from "./admin-credential-guards";
import type { SqliteDatabase } from "./sqlite";

/**
 * Sidecar snapshot of CMS settings (admin login, SMTP, site copy).
 * Survives a replaced/empty SQLite file as long as CERTKO_DATA_DIR stays.
 */
const INSTANCE_KEY = "certko_data_instance";

function archivePath(): string {
  return path.join(getCertkoDataDir(), "settings-archive.json");
}

function readAllSettings(db: SqliteDatabase): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as Array<{
    key: string;
    value: string;
  }>;
  const data: Record<string, string> = {};
  for (const row of rows) {
    if (row?.key) data[row.key] = row.value ?? "";
  }
  return data;
}

function upsertSetting(db: SqliteDatabase, key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

/**
 * Never replace a hashed login in the archive with seed `admin` / `certko-admin`.
 * Hostinger can boot a blank SQLite, snapshot immediately, and wipe the real password.
 */
function preserveHashedLogin(
  live: Record<string, string>,
  existing: Record<string, string>
): Record<string, string> {
  const out = { ...live };
  const existingPass = existing.admin_password || "";
  const livePass = live.admin_password || "";
  if (isBcryptPassword(existingPass) && isSeedAdminPassword(livePass)) {
    out.admin_password = existingPass;
    const existingUser = existing.admin_username || "";
    if (existingUser && isSeedAdminUsername(live.admin_username || "")) {
      out.admin_username = existingUser;
    }
  }
  return out;
}

export function snapshotSettings(db: SqliteDatabase): void {
  try {
    const live = readAllSettings(db);
    if (!live[INSTANCE_KEY]) {
      const id = crypto.randomUUID();
      upsertSetting(db, INSTANCE_KEY, id);
      live[INSTANCE_KEY] = id;
    }
    const data = preserveHashedLogin(live, readSnapshot());
    const json = JSON.stringify(data);
    fs.mkdirSync(path.dirname(archivePath()), { recursive: true });
    fs.writeFileSync(archivePath(), json, "utf8");
    if (isBcryptPassword(data.admin_password || "")) {
      replicateDurableTextFile("settings-archive.json", json);
    }
  } catch (err) {
    console.error("[certko] settings archive write failed:", err);
  }
}

function readSnapshot(): Record<string, string> {
  try {
    if (!fs.existsSync(archivePath())) return {};
    const parsed = JSON.parse(fs.readFileSync(archivePath(), "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function liveLooksFresh(db: SqliteDatabase): boolean {
  const current =
    (
      db.prepare("SELECT value FROM settings WHERE key = ?").get("admin_password") as
        | { value: string }
        | undefined
    )?.value ?? "";
  return isSeedAdminPassword(current);
}

/**
 * Restore snapshot onto a wiped/re-seeded DB. Never overwrite a live bcrypt password.
 * Username `admin` is a seed default — restore a custom login id even if the hash is already live.
 */
export function restoreSettingsArchive(db: SqliteDatabase): number {
  const snap = readSnapshot();
  const keys = Object.keys(snap);
  if (keys.length === 0) return 0;

  const fullRestore = liveLooksFresh(db);
  let restored = 0;

  for (const key of keys) {
    const snapVal = snap[key];
    if (snapVal == null || snapVal === "") continue;
    const current =
      (
        db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
          | { value: string }
          | undefined
      )?.value ?? "";

    if (current === snapVal) continue;

    if (key === "admin_password") {
      if (isBcryptPassword(snapVal) && isSeedAdminPassword(current)) {
        upsertSetting(db, key, snapVal);
        restored += 1;
      }
      continue;
    }

    if (key === "admin_username") {
      if (fullRestore || isSeedAdminUsername(current)) {
        upsertSetting(db, key, snapVal);
        restored += 1;
      }
      continue;
    }

    if (fullRestore || !current || current === "certko-admin") {
      upsertSetting(db, key, snapVal);
      restored += 1;
    }
  }

  if (restored > 0) {
    console.info(`[certko] Restored ${restored} setting(s) from durable settings archive`);
  }
  return restored;
}

export function restoreSettingsArchiveSafe(db: SqliteDatabase): number {
  try {
    return restoreSettingsArchive(db);
  } catch (err) {
    console.error("[certko] settings archive restore failed:", err);
    return 0;
  }
}
