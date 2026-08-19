import fs from "fs";
import path from "path";

/**
 * Durable CMS file storage (uploads) — prefer a path outside the git deploy tree
 * so `git pull` / rebuilds never delete images.
 * Relational CMS data uses PostgreSQL when DATABASE_URL is set, otherwise SQLite
 * at CERTKO_DATA_DIR/certko.db so Hostinger Node hosting can boot without Postgres.
 *
 * Layout (production VPS):
 *   CERTKO_DATA_DIR=/var/lib/certko
 *     uploads/
 *     certko.db          (only when DATABASE_URL is unset)
 *   DATABASE_URL=postgres://…  (preferred)
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

/** Prefer a real SQLite file over a zero-byte placeholder. */
function copyDbIfDestEmpty(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const destExists = fs.existsSync(dest);
  if (destExists && fs.statSync(dest).size > 0) return;
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
    } else {
      copyDbIfDestEmpty(path.join(appData, "certko.db"), destDb);
      copyFileIfMissing(path.join(appData, ".certko-secret"), path.join(dataDir, ".certko-secret"));
      copyFileIfMissing(path.join(appData, "inquiries.jsonl"), path.join(dataDir, "inquiries.jsonl"));
      copyFileIfMissing(
        path.join(appData, "inquiries-deleted.jsonl"),
        path.join(dataDir, "inquiries-deleted.jsonl")
      );
      copyFileIfMissing(
        path.join(appData, "settings-archive.json"),
        path.join(dataDir, "settings-archive.json")
      );
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
    }
  } catch (err) {
    console.warn("[certko] legacy data migrate skipped:", err);
  }
  recoverFromPriorHbuildsVersions(dataDir);
}

function isNextBuildPhase(): boolean {
  const lifecycle = process.env.npm_lifecycle_event || "";
  if (lifecycle === "start" || lifecycle === "dev") return false;
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    lifecycle === "build"
  );
}

/** Hostinger hbuilds deploys wipe `versions/<uuid>/nodejs/data` on each release. */
function hostingerPersistentCandidates(cwd: string): string[] {
  const resolved = path.resolve(cwd);
  if (!resolved.includes("/hbuilds/")) return [];

  const parts: string[] = [];
  // hbuilds/versions/<uuid>/nodejs → hbuilds/data (shared across deploy versions)
  parts.push(path.resolve(resolved, "../../../data"));
  // domain root siblings (common on Hostinger File Manager layouts)
  parts.push(path.resolve(resolved, "../../../../certko-data"));
  parts.push(path.resolve(resolved, "../../../../private/certko-data"));
  parts.push(path.resolve(resolved, "../../../../data/certko"));
  parts.push(path.resolve(resolved, "../../../../.certko-data"));

  const domainMatch = resolved.match(/^(.+\/domains\/[^/]+)\//);
  if (domainMatch) {
    const domainRoot = domainMatch[1];
    parts.push(path.join(domainRoot, "certko-data"));
    parts.push(path.join(domainRoot, "private", "certko-data"));
    parts.push(path.join(domainRoot, "data", "certko"));
  }

  return [...new Set(parts)];
}

const SIDECAR_FILES = [
  "certko.db",
  ".certko-secret",
  "inquiries.jsonl",
  "inquiries-deleted.jsonl",
  "settings-archive.json",
];

/**
 * Copy CMS files from older Hostinger version folders when the shared data dir
 * is missing them (first boot after switching persist path).
 */
function recoverFromPriorHbuildsVersions(dataDir: string): void {
  const cwd = path.resolve(process.cwd());
  const match = cwd.match(/^(.*\/hbuilds)\/versions\//);
  if (!match) return;
  const versionsRoot = path.join(match[1], "versions");
  if (!fs.existsSync(versionsRoot)) return;

  let versionDirs: string[] = [];
  try {
    versionDirs = fs
      .readdirSync(versionsRoot)
      .map((name) => path.join(versionsRoot, name))
      .filter((dir) => {
        try {
          return fs.statSync(dir).isDirectory();
        } catch {
          return false;
        }
      });
  } catch {
    return;
  }

  versionDirs.sort((a, b) => {
    try {
      return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
    } catch {
      return 0;
    }
  });

  for (const versionDir of versionDirs.slice(0, 20)) {
    const srcDir = path.join(versionDir, "nodejs", "data");
    if (!fs.existsSync(srcDir)) continue;
    for (const name of SIDECAR_FILES) {
      const from = path.join(srcDir, name);
      const to = path.join(dataDir, name);
      if (name === "certko.db") copyDbIfDestEmpty(from, to);
      else copyFileIfMissing(from, to);
    }
    const srcUploads = path.join(srcDir, "uploads");
    if (fs.existsSync(srcUploads)) {
      copyDirContents(srcUploads, path.join(dataDir, "uploads"));
    }
  }
}

/**
 * Persistent root for uploads (and SQLite when DATABASE_URL is unset).
 * Prefer CERTKO_DATA_DIR, then /var/lib/certko in production, then ./data.
 * Fall back to /tmp with a warning so the public site can still boot.
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

    for (const candidate of hostingerPersistentCandidates(process.cwd())) {
      if (canUse(candidate)) {
        console.info("[certko] Using Hostinger persistent data dir:", candidate);
        cachedDir = candidate;
        migrateLegacyInto(cachedDir);
        return cachedDir;
      }
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

  const tmp = path.join("/tmp", "certko-data");
  fs.mkdirSync(tmp, { recursive: true });
  console.warn(
    "[certko] No writable persistent data directory; using",
    tmp,
    "— uploads and SQLite may vanish on restart. Set CERTKO_DATA_DIR=/var/lib/certko when possible."
  );
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
