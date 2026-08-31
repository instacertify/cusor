import fs from "fs";
import path from "path";
import { getCertkoDataDir, replicateDurableTextFile } from "./storage-paths";
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

/** Normalize timestamps so SQLite "YYYY-MM-DD HH:MM:SS" matches ISO archive stamps. */
export function normalizeInquiryCreatedAt(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 19);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(normalized.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}Z`);
  if (Number.isFinite(d.getTime())) return d.toISOString().slice(0, 19);
  return raw.slice(0, 19);
}

/**
 * Stable identity for restore/delete matching.
 * Do NOT include message — deleteInquiry previously omitted it, so tombstones
 * never matched archive rows and deleted leads kept coming back on bootstrap.
 */
export function inquiryRowKey(r: {
  email: string;
  created_at: string;
  name: string;
}): string {
  return `${(r.email || "").trim().toLowerCase()}|${normalizeInquiryCreatedAt(r.created_at)}|${(r.name || "").trim().toLowerCase()}`;
}

function rewriteJsonl(file: string, rows: ArchivedInquiry[]): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = rows.length === 0 ? "" : rows.map((r) => JSON.stringify(r) + "\n").join("");
  fs.writeFileSync(file, body, "utf8");
  // Mirror into every Hostinger persist dir so a version wipe cannot drop leads.
  try {
    replicateDurableTextFile(path.basename(file), body);
  } catch {
    /* optional */
  }
}

/** Append-only lead backup — survives SQLite file replacement on Hostinger. */
export function archiveInquiry(row: ArchivedInquiry): void {
  try {
    const file = archivePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, JSON.stringify(row) + "\n", "utf8");
    try {
      const full = fs.readFileSync(file, "utf8");
      replicateDurableTextFile("inquiries.jsonl", full);
    } catch {
      /* optional */
    }
  } catch (err) {
    console.error("[certko] inquiry archive write failed:", err);
  }
}

/**
 * Mark a lead deleted and remove it from the durable archive so bootstrap
 * cannot resurrect it after Admin → Delete.
 */
export function archiveInquiryDeleted(key: {
  email: string;
  created_at: string;
  name: string;
}): void {
  try {
    const target = inquiryRowKey(key);
    const tomb = tombstonePath();
    fs.mkdirSync(path.dirname(tomb), { recursive: true });
    fs.appendFileSync(
      tomb,
      JSON.stringify({
        email: key.email,
        created_at: key.created_at,
        name: key.name,
        deleted: true,
      }) + "\n",
      "utf8"
    );
    try {
      replicateDurableTextFile("inquiries-deleted.jsonl", fs.readFileSync(tomb, "utf8"));
    } catch {
      /* optional */
    }

    const remaining = readJsonl(archivePath()).filter((row) => inquiryRowKey(row) !== target);
    rewriteJsonl(archivePath(), remaining);
  } catch (err) {
    console.error("[certko] inquiry tombstone / archive purge failed:", err);
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

function createdAtString(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return new Date().toISOString();
}

/**
 * Re-insert archived leads missing from SQLite/Postgres (new deploy empty DB).
 * Skips anything listed in inquiries-deleted.jsonl (stable key match).
 */
export function restoreArchivedInquiries(db: SqliteDatabase): number {
  const archived = readJsonl(archivePath());
  if (archived.length === 0) return 0;

  const deleted = new Set(readJsonl(tombstonePath()).map((r) => inquiryRowKey(r)));

  const existing = db
    .prepare("SELECT name, email, created_at FROM inquiries")
    .all() as Array<{ name: string; email: string; created_at: string }>;
  const have = new Set(existing.map((r) => inquiryRowKey(r)));

  const insert = db.prepare(
    `INSERT INTO inquiries (name, email, phone, product, message, intent, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let restored = 0;
  const tx = db.transaction(() => {
    for (const row of archived) {
      if (!row.email || !row.name) continue;
      if (row.deleted) continue;
      const key = inquiryRowKey(row);
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
