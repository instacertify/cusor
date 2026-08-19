import fs from "fs";
import path from "path";
import { getDatabaseUrl } from "./sqlite";
import { getCertkoDataDir, getCertkoUploadsDir } from "./storage-paths";

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
  return (
    resolved.startsWith("/tmp/") ||
    resolved === "/tmp" ||
    resolved.includes("/hbuilds/") ||
    resolved.includes("/tmp/certko")
  );
}

function looksInsideReplaceableAppTree(dir: string): boolean {
  const resolved = path.resolve(dir);
  const cwd = path.resolve(process.cwd());
  // App code is replaceable on deploy; uploads must live outside it when possible.
  return resolved === cwd || resolved.startsWith(cwd + path.sep);
}

/**
 * Fail fast in production if config would lose password/blogs/uploads on restart.
 * Soft during `next build` so Hostinger/CI page collection can finish.
 */
export function assertDurableRuntimeConfig(): void {
  if (isNextBuildPhase()) return;

  const production = process.env.NODE_ENV === "production";
  const url = getDatabaseUrl();
  const secret = (process.env.CERTKO_SECRET || "").trim();

  if (!url) {
    const msg =
      "[certko] DATABASE_URL is required. CMS data (blogs, settings, admin password) lives in PostgreSQL and must survive restarts.";
    if (production) throw new Error(msg);
    console.warn(msg);
    return;
  }

  if (production && (!secret || secret === "certko-dev-secret-change-me")) {
    throw new Error(
      "[certko] CERTKO_SECRET must be set to a stable random value in .env. Regenerating it on every deploy logs everyone out (looks like a password reset)."
    );
  }

  let dataDir: string;
  try {
    dataDir = getCertkoDataDir();
  } catch (err) {
    if (production) throw err;
    console.warn("[certko] data dir not ready:", err);
    return;
  }

  if (looksEphemeral(dataDir)) {
    const msg = `[certko] CERTKO_DATA_DIR resolves to ephemeral path (${dataDir}). Uploads would vanish on restart. Set CERTKO_DATA_DIR=/var/lib/certko`;
    if (production) throw new Error(msg);
    console.warn(msg);
  }

  if (production && looksInsideReplaceableAppTree(dataDir)) {
    console.warn(
      `[certko] CERTKO_DATA_DIR is inside the app folder (${dataDir}). Prefer /var/lib/certko so Hostinger deploys never wipe uploads.`
    );
  }

  const uploads = getCertkoUploadsDir();
  fs.mkdirSync(uploads, { recursive: true });

  console.info("[certko] durable runtime OK", {
    database: "postgresql",
    uploadsDir: uploads,
    secretConfigured: Boolean(secret),
  });
}
