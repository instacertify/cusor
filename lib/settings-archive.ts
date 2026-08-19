import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getCertkoDataDir } from "./storage-paths";
import type { SqliteDatabase } from "./sqlite";

/**
 * Sidecar snapshot of CMS settings (admin login, SMTP, site copy).
 * Survives a replaced/empty SQLite file as long as CERTKO_DATA_DIR stays.
 */
const INSTANCE_KEY = "certko_data_instance";

function archivePath(): string {
  return path.join(getCertkoDataDir(), "settings-archive.json");
}

function isBcrypt(value: string): boolean {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
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

export function snapshotSettings(db: SqliteDatabase): void {
  try {
    const data = readAllSettings(db);
    if (!data[INSTANCE_KEY]) {
      const id = crypto.randomUUID();
      upsertSetting(db, INSTANCE_KEY, id);
      data[INSTANCE_KEY] = id;
    }
    fs.mkdirSync(path.dirname(archivePath()), { recursive: true });
    fs.writeFileSync(archivePath(), JSON.stringify(data), "utf8");
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
  return !current || current === "certko-admin" || !isBcrypt(current);
}

/**
 * Restore snapshot onto a wiped/re-seeded DB. Never overwrite a live bcrypt password.
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
      if (isBcrypt(snapVal) && !isBcrypt(current)) {
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
