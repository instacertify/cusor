import fs from "fs";
import path from "path";
import { getDatabaseUrl } from "./sqlite";
import {
  backupCertkoSqliteIfPresent,
  getCertkoDataDir,
  getCertkoDbPath,
  getCertkoUploadsDir,
  isInsideHbuildsVersionTree,
} from "./storage-paths";
import { resolveCertkoSecret } from "./durable-secret";

function isNextBuildPhase(): boolean {
  const lifecycle = process.env.npm_lifecycle_event || "";
  if (lifecycle === "start" || lifecycle === "dev") return false;
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    lifecycle === "build"
  );
}

function looksEphemeral(dir: string): boolean {
  const resolved = path.resolve(dir).toLowerCase();
  if (resolved.startsWith("/tmp/") || resolved === "/tmp" || resolved.includes("/tmp/certko")) {
    return true;
  }
  // Hostinger wipes version folders; hbuilds/data (outside versions/) is the shared persist path.
  if (resolved.includes("/hbuilds/versions/")) return true;
  return false;
}

function looksInsideReplaceableAppTree(dir: string): boolean {
  const resolved = path.resolve(dir);
  const cwd = path.resolve(process.cwd());
  // App code is replaceable on deploy; uploads must live outside it when possible.
  return resolved === cwd || resolved.startsWith(cwd + path.sep);
}

function countUploads(dir: string): number {
  try {
    if (!fs.existsSync(dir)) return 0;
    let n = 0;
    const walk = (d: string) => {
      for (const name of fs.readdirSync(d)) {
        const p = path.join(d, name);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else n += 1;
      }
    };
    walk(dir);
    return n;
  } catch {
    return 0;
  }
}

/**
 * Warn (never crash public pages) if config would lose password/blogs/uploads
 * on restart. Soft during `next build` so Hostinger/CI page collection can finish.
 *
 * Hostinger Node panel + durable SQLite under hbuilds/data is a supported mode —
 * missing DATABASE_URL is NOT an error when the data dir is durable.
 */
export function assertDurableRuntimeConfig(): void {
  if (isNextBuildPhase()) return;

  const production = process.env.NODE_ENV === "production";
  const url = getDatabaseUrl();
  const secret = resolveCertkoSecret();

  if (production && (!secret || secret === "certko-dev-secret-change-me")) {
    console.warn(
      "[certko] CERTKO_SECRET could not be persisted. Admin sessions may reset on restart. Set CERTKO_SECRET once in hPanel, or use the VPS installer."
    );
  }

  let dataDir: string;
  try {
    dataDir = getCertkoDataDir();
  } catch (err) {
    console.warn("[certko] data dir not ready:", err);
    return;
  }

  const ephemeral =
    looksEphemeral(dataDir) || isInsideHbuildsVersionTree(dataDir);
  const insideApp = production && looksInsideReplaceableAppTree(dataDir);

  if (!url && ephemeral) {
    // Real risk: SQLite with no Postgres AND unsafe path.
    console.warn(
      `[certko] SQLite data dir looks ephemeral (${dataDir}). Set CERTKO_DATA_DIR to hbuilds/data (outside versions/) or set DATABASE_URL for Postgres — otherwise CMS/uploads may reset on deploy.`
    );
  } else if (ephemeral) {
    console.warn(
      `[certko] CERTKO_DATA_DIR resolves to ephemeral / version path (${dataDir}). Uploads may vanish on the next deploy. Prefer hbuilds/data or /var/lib/certko — never inside hbuilds/versions/.`
    );
  }

  if (insideApp && !ephemeral) {
    // hbuilds/data is outside the app package but may still sit under domains/… —
    // only warn when clearly inside the replaceable app tree.
    console.warn(
      `[certko] CERTKO_DATA_DIR is inside the app folder (${dataDir}). Prefer a path outside the version folder, or DATABASE_URL for Postgres.`
    );
  } else if (insideApp) {
    /* already warned via ephemeral */
  }

  const uploads = getCertkoUploadsDir();
  fs.mkdirSync(uploads, { recursive: true });

  const dbPath = getCertkoDbPath();
  let dbBytes = 0;
  try {
    if (fs.existsSync(dbPath)) dbBytes = fs.statSync(dbPath).size;
  } catch {
    dbBytes = 0;
  }

  const bak = backupCertkoSqliteIfPresent();

  // Quiet success path — Hostinger Node + durable SQLite is OK (not an error).
  if (!url && !ephemeral) {
    console.info(
      "[certko] CMS storage: sqlite (durable) — DATABASE_URL optional. Data kept across builds.",
      { dataDir, dbPath, dbBytes }
    );
  }

  console.info("[certko] durable runtime OK — build updates keep this data", {
    database: url ? "postgresql" : "sqlite",
    dataDir,
    dbPath: url ? "(postgres)" : dbPath,
    dbBytes: url ? undefined : dbBytes,
    sqliteBackup: bak || undefined,
    uploadsDir: uploads,
    uploadFiles: countUploads(uploads),
    secretConfigured: Boolean(secret) && secret !== "certko-dev-secret-change-me",
  });
}
