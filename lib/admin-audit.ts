import { getDb } from "./db";

export function ensureAdminAuditTable() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      ip TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at);
  `);
}

export function logAdminEvent(event: string, ip = "", detail = "") {
  try {
    ensureAdminAuditTable();
    getDb()
      .prepare("INSERT INTO admin_audit_log (event, ip, detail) VALUES (?, ?, ?)")
      .run(event, ip.slice(0, 128), detail.slice(0, 500));
  } catch {
    // never break auth flow on audit failure
  }
}

/** Simple in-memory login rate limit (per process). */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function getClientIp(headersList: Headers): string {
  const xf = headersList.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || "unknown";
}

export function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || row.resetAt < now) return false;
  return row.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(ip: string): number {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || row.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return 1;
  }
  row.count += 1;
  return row.count;
}

export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}
