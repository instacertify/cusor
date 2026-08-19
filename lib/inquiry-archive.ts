import fs from "fs";
import path from "path";
import { getCertkoDataDir } from "./storage-paths";
import type { SqliteDatabase } from "./sqlite";

export type ArchivedInquiry = {
  name: string;
  email: string;
  phone: string;
  product: string;
  message: string;
  intent: string;
  status: string;
  created_at: string;
  deleted?: boolean;
};

function archivePath(): string {
  return path.join(getCertkoDataDir(), "inquiries.jsonl");
}

function tombstonePath(): string {
  return path.join(getCertkoDataDir(), "inquiries-deleted.jsonl");
}

/** Append-only lead backup — survives SQLite file replacement on Hostinger. */
export function archiveInquiry(row: ArchivedInquiry): void {
  try {
    const line = JSON.stringify(row) + "\n";
    fs.mkdirSync(path.dirname(archivePath()), { recursive: true });
    fs.appendFileSync(archivePath(), line, "utf8");
  } catch (err) {
    console.error("[certko] inquiry archive write failed:", err);
  }
}

export function archiveInquiryDeleted(key: { email: string; created_at: string; name: string }): void {
  try {
    fs.mkdirSync(path.dirname(tombstonePath()), { recursive: true });
    fs.appendFileSync(tombstonePath(), JSON.stringify({ ...key, deleted: true }) + "\n", "utf8");
  } catch (err) {
    console.error("[certko] inquiry tombstone write failed:", err);
  }
}

function readJsonl(file: string): ArchivedInquiry[] {
  try {
    if (!fs.existsSync(file)) return [];
    return fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .flatMap((l) => {
        try {
          return [JSON.parse(l) as ArchivedInquiry];
        } catch {
          return [];
        }
      });
  } catch {
    return [];
  }
}

function rowKey(r: { email: string; created_at: string; name: string; message?: string }): string {
  return `${r.email}|${r.created_at}|${r.name}|${(r.message || "").slice(0, 80)}`;
}

function createdAtString(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return new Date().toISOString();
}

/** Re-insert archived leads missing from SQLite/Postgres (new deploy empty DB). */
export function restoreArchivedInquiries(db: SqliteDatabase): number {
  const archived = readJsonl(archivePath());
  if (archived.length === 0) return 0;

  const deleted = new Set(
    readJsonl(tombstonePath()).map((r) => rowKey(r))
  );

  const existing = db
    .prepare("SELECT name, email, created_at, message FROM inquiries")
    .all() as Array<{ name: string; email: string; created_at: string; message: string }>;
  const have = new Set(existing.map((r) => rowKey(r)));

  const insert = db.prepare(
    `INSERT INTO inquiries (name, email, phone, product, message, intent, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let restored = 0;
  const tx = db.transaction(() => {
    for (const row of archived) {
      if (!row.email || !row.name) continue;
      const key = rowKey(row);
      if (deleted.has(key) || have.has(key)) continue;
      insert.run(
        row.name,
        row.email,
        row.phone || "",
        row.product || "",
        row.message || "",
        row.intent || "",
        row.status || "new",
        createdAtString(row.created_at)
      );
      have.add(key);
      restored += 1;
    }
  });
  tx();

  if (restored > 0) {
    console.info(`[certko] Restored ${restored} lead(s) from durable inquiry archive`);
  }
  return restored;
}

export function restoreArchivedInquiriesSafe(db: SqliteDatabase): number {
  try {
    return restoreArchivedInquiries(db);
  } catch (err) {
    console.error("[certko] inquiry archive restore failed:", err);
    return 0;
  }
}
