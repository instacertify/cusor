import fs from "fs";
import path from "path";
import { getDatabaseUrl } from "./sqlite";
import { getCertkoDataDir, getCertkoUploadsDir } from "./storage-paths";
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

/**
 * Warn (never crash public pages) if config would lose password/blogs/uploads
 * on restart. Soft during `next build` so Hostinger/CI page collection can finish.
 */
export function assertDurableRuntimeConfig(): void {
  if (isNextBuildPhase()) return;

  const production = process.env.NODE_ENV === "production";
  const url = getDatabaseUrl();
  const secret = resolveCertkoSecret();

  if (!url) {
    console.warn(
      "[certko] DATABASE_URL is not set — using SQLite file storage so the site can boot. A Hostinger VPS + PostgreSQL is the permanent store for CMS data."
    );
  }

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

  if (looksEphemeral(dataDir)) {
    console.warn(
      `[certko] CERTKO_DATA_DIR resolves to ephemeral path (${dataDir}). Uploads may vanish on restart. Prefer CERTKO_DATA_DIR=/var/lib/certko`
    );
  }

  if (production && looksInsideReplaceableAppTree(dataDir)) {
    console.warn(
      `[certko] CERTKO_DATA_DIR is inside the app folder (${dataDir}). On Hostinger hbuilds, set CERTKO_DATA_DIR to a persistent path outside the version folder (or use managed Postgres + DATABASE_URL). Uploads and SQLite reset on each deploy otherwise.`
    );
  }

  const uploads = getCertkoUploadsDir();
  fs.mkdirSync(uploads, { recursive: true });

  console.info("[certko] durable runtime OK", {
    database: url ? "postgresql" : "sqlite",
    uploadsDir: uploads,
    secretConfigured: Boolean(secret) && secret !== "certko-dev-secret-change-me",
  });
}
