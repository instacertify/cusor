import fs from "fs";
import path from "path";

/**
 * Durable CMS file storage (uploads) — lives OUTSIDE the git deploy tree
 * so `git pull` / rebuilds never delete images.
 * Relational CMS data (blogs, settings, password hash) lives in PostgreSQL.
 *
 * Layout (production):
 *   CERTKO_DATA_DIR=/var/lib/certko
 *     uploads/
 *   DATABASE_URL=postgres://…
 *
 * Application code stays in /var/www/certko (replaceable).
 */

let cachedDir: string | null = null;
let migrated = false;

function canUse(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    // Prove we can write (some hosts allow mkdir but not create files).
    const probe = path.join(dir, ".certko-write-test");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function copyFileIfMissing(src: string, dest: string) {
  if (!fs.existsSync(src) || fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirContents(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (name === ".gitkeep") continue;
    const from = path.join(srcDir, name);
    const to = path.join(destDir, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) {
      copyDirContents(from, to);
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
    }
  }
}

/**
 * One-time migrate from legacy in-app paths (./data, ./public/uploads)
 * into the durable data dir — never deletes the source.
 */
function migrateLegacyInto(dataDir: string) {
  if (migrated) return;
  migrated = true;
  try {
    const appData = path.join(process.cwd(), "data");
    const appUploads = path.join(process.cwd(), "public", "uploads");
    const destDb = path.join(dataDir, "certko.db");
    const destUploads = path.join(dataDir, "uploads");

    if (path.resolve(appData) === path.resolve(dataDir)) {
      // Already using ./data — still pull public/uploads into data/uploads.
      copyDirContents(appUploads, destUploads);
      return;
    }

    copyFileIfMissing(path.join(appData, "certko.db"), destDb);
    for (const f of fs.existsSync(appData) ? fs.readdirSync(appData) : []) {
      if (f.startsWith("certko.db-")) {
        copyFileIfMissing(path.join(appData, f), path.join(dataDir, f));
      }
    }
    copyDirContents(path.join(appData, "uploads"), destUploads);
    copyDirContents(appUploads, destUploads);

    if (fs.existsSync(destDb)) {
      console.info("[certko] durable data dir ready:", dataDir);
    }
  } catch (err) {
    console.warn("[certko] legacy data migrate skipped:", err);
  }
}

function isNextBuildPhase(): boolean {
  const lifecycle = process.env.npm_lifecycle_event || "";
  if (lifecycle === "start" || lifecycle === "dev") return false;
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    lifecycle === "build"
  );
}

/**
 * Persistent root for uploads (and legacy SQLite files if present).
 * Prefer CERTKO_DATA_DIR, then /var/lib/certko in production, then ./data.
 * Never silently use /tmp at runtime in production (images would vanish on restart).
 * During `next build` only, a temp dir is allowed so Hostinger/CI page collection can finish.
 */
export function getCertkoDataDir(): string {
  if (cachedDir) return cachedDir;

  const fromEnv = (process.env.CERTKO_DATA_DIR || "").trim();
  if (fromEnv && canUse(fromEnv)) {
    cachedDir = path.resolve(fromEnv);
    migrateLegacyInto(cachedDir);
    return cachedDir;
  }

  if (process.env.NODE_ENV === "production") {
    const systemDir = "/var/lib/certko";
    if (canUse(systemDir)) {
      cachedDir = systemDir;
      migrateLegacyInto(cachedDir);
      return cachedDir;
    }
  }

  const local = path.join(process.cwd(), "data");
  if (canUse(local)) {
    cachedDir = local;
    migrateLegacyInto(cachedDir);
    return cachedDir;
  }

  // Hostinger/CI `next build` must not crash when the deploy sandbox has no durable dir.
  if (isNextBuildPhase()) {
    const tmp = path.join("/tmp", "certko-build-data");
    fs.mkdirSync(tmp, { recursive: true });
    console.warn("[certko] build-only temp data dir (not used at runtime):", tmp);
    cachedDir = tmp;
    return cachedDir;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[certko] No writable persistent data directory. Set CERTKO_DATA_DIR=/var/lib/certko (or another path outside the app deploy folder) and ensure it is writable. Refusing /tmp so uploads survive restarts."
    );
  }

  const tmp = path.join("/tmp", "certko-data");
  fs.mkdirSync(tmp, { recursive: true });
  console.warn("[certko] DEV ONLY: using temporary data dir", tmp);
  cachedDir = tmp;
  return cachedDir;
}

export function getCertkoUploadsDir(): string {
  const dir = path.join(getCertkoDataDir(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getCertkoDbPath(): string {
  return path.join(getCertkoDataDir(), "certko.db");
}

/** Reset cache (tests). */
export function resetStoragePathCache() {
  cachedDir = null;
  migrated = false;
}
