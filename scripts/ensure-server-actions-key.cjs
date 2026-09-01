/**
 * Stabilize Next.js Server Action encryption across Hostinger rebuilds.
 *
 * Without a fixed NEXT_SERVER_ACTIONS_ENCRYPTION_KEY, each `next build` can
 * mint action IDs that stale admin tabs still POST →
 * "Failed to find Server Action. This request might be from an older or newer deployment."
 *
 * Also sets NEXT_DEPLOYMENT_ID from the Hostinger version folder when present
 * so clients hard-reload on skew.
 *
 * Usage: node --require ./scripts/ensure-server-actions-key.cjs …
 */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function readSecretFile(file) {
  try {
    const raw = fs.readFileSync(file, "utf8").trim();
    if (raw && raw !== "certko-dev-secret-change-me" && raw.length >= 16) return raw;
  } catch {
    /* missing */
  }
  return "";
}

function findCertkoSecret() {
  const fromEnv = (process.env.CERTKO_SECRET || "").trim();
  if (fromEnv && fromEnv !== "certko-dev-secret-change-me") return fromEnv;

  const cwd = process.cwd();
  const candidates = [];
  if (process.env.CERTKO_DATA_DIR) {
    candidates.push(path.join(process.env.CERTKO_DATA_DIR, ".certko-secret"));
  }
  // Hostinger: …/hbuilds/versions/<id>/nodejs → …/hbuilds/data/.certko-secret
  candidates.push(path.resolve(cwd, "../../../data/.certko-secret"));
  candidates.push(path.resolve(cwd, "../../data/.certko-secret"));
  candidates.push(path.join(cwd, "data", ".certko-secret"));
  candidates.push(path.join(cwd, ".certko-secret"));

  for (const file of candidates) {
    const secret = readSecretFile(file);
    if (secret) return secret;
  }
  return "";
}

/** 32-byte AES key as base64 (Next.js requirement). */
function aesKeyBase64FromSecret(secret) {
  return crypto.createHash("sha256").update(`certko-server-actions:${secret}`).digest("base64");
}

function detectHostingerDeploymentId() {
  const cwd = process.cwd();
  const match = cwd.match(/hbuilds[/\\]versions[/\\]([^/\\]+)/i);
  return match ? match[1] : "";
}

if (!process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY) {
  const secret = findCertkoSecret();
  if (secret) {
    process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY = aesKeyBase64FromSecret(secret);
    if (!process.env.CERTKO_QUIET_BOOT) {
      console.info(
        "[certko] NEXT_SERVER_ACTIONS_ENCRYPTION_KEY derived from durable CERTKO_SECRET (stable across builds)"
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[certko] No CERTKO_SECRET for Server Actions key — set CERTKO_SECRET in hPanel so admin forms survive redeploys"
    );
  }
}

if (!process.env.NEXT_DEPLOYMENT_ID) {
  const dpl = detectHostingerDeploymentId();
  if (dpl) {
    process.env.NEXT_DEPLOYMENT_ID = dpl;
    if (!process.env.CERTKO_QUIET_BOOT) {
      console.info("[certko] NEXT_DEPLOYMENT_ID from Hostinger version:", dpl);
    }
  }
}
