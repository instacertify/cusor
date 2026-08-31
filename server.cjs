#!/usr/bin/env node
/**
 * Hostinger Node.js Web Apps require $PORT to accept connections immediately.
 * `next start` only listens after Next finishes preparing; the panel then
 * SIGTERMs the process and Next's shutdown calls Server.close() twice:
 *   Error: Server is not running
 *
 * This wrapper binds 0.0.0.0:$PORT first, serves a tiny health response until
 * Next + CMS DB are ready, and makes close() idempotent so the race cannot crash us.
 */
"use strict";

const { createServer } = require("node:http");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { patchOutgoingRedirects } = require("./lib/public-location.cjs");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const bindHost = process.env.HOSTNAME || "0.0.0.0";
// Next uses `hostname` for absolute URLs. 0.0.0.0 is a bind address, not a browser host.
const nextHostname = bindHost === "0.0.0.0" || bindHost === "::" ? "localhost" : bindHost;
const hostname = bindHost;
const dev = process.env.NODE_ENV !== "production";

function isBenignShutdownError(err) {
  if (!err) return false;
  const msg = String(err.message || err);
  return (
    msg.includes("Server is not running") ||
    err.code === "ERR_SERVER_NOT_RUNNING"
  );
}

process.on("uncaughtException", (err) => {
  if (isBenignShutdownError(err)) {
    console.warn("[certko] ignored Hostinger shutdown race:", err.message);
    return;
  }
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  if (isBenignShutdownError(reason)) {
    console.warn("[certko] ignored Hostinger shutdown race:", reason && reason.message);
    return;
  }
  console.error(reason);
});

let nextReady = false;
let nextHandler = null;
const pending = [];

function flushPending() {
  if (!nextHandler || !nextReady) return;
  while (pending.length) {
    const job = pending.shift();
    if (!job) continue;
    const { req, res } = job;
    if (res.writableEnded) continue;
    nextHandler(req, res);
  }
}

const server = createServer((req, res) => {
  patchOutgoingRedirects(res);
  const url = (req.url || "/").split("?")[0];
  // Health must succeed before Next/CMS finish — Hostinger kills us otherwise.
  if (url === "/healthz" || url === "/ready" || (req.method === "HEAD" && url === "/")) {
    res.statusCode = 200;
    res.setHeader("cache-control", "no-store");
    res.end(req.method === "HEAD" ? undefined : "ok");
    return;
  }
  if (nextReady && nextHandler) {
    nextHandler(req, res);
    return;
  }
  // Hold page traffic until Next + ensureDbReady finish — prevents
  // "Database not ready yet" when sync RSC pages call getDb() during bootstrap.
  pending.push({ req, res });
  res.on("close", () => {
    const idx = pending.findIndex((job) => job.res === res);
    if (idx >= 0) pending.splice(idx, 1);
  });
});

const originalClose = server.close.bind(server);
server.close = function patchedClose(cb) {
  if (!server.listening) {
    if (typeof cb === "function") cb.call(server);
    return server;
  }
  return originalClose(cb);
};

server.listen(port, hostname, () => {
  console.info(`[certko] listening on ${hostname}:${port} (Next preparing)`);
});

const next = require("next");
const app = next({
  dev,
  hostname: nextHostname,
  port,
  dir: process.cwd(),
  httpServer: server,
});

async function warmCmsInThisProcess() {
  // Same Node process as Next — globalThis.__certkoDb is shared with SSR bundles.
  try {
    require("tsx/cjs/api").register();
  } catch {
    /* tsx may already be registered via node --import */
  }
  const dbUrl = pathToFileURL(path.join(process.cwd(), "lib", "db.ts")).href;
  const { ensureDbReady } = await import(dbUrl);
  await ensureDbReady();
}

app
  .prepare()
  .then(async () => {
    nextHandler = app.getRequestHandler();
    console.info(`[certko] Next.js prepared on ${hostname}:${port} — warming CMS`);
    try {
      await warmCmsInThisProcess();
      console.info(`[certko] CMS ready — accepting page traffic`);
    } catch (err) {
      console.error("[certko] CMS warm failed; pages may error until first ensureDbReady:", err);
    }
    nextReady = true;
    console.info(`[certko] Next.js ready on ${hostname}:${port}`);
    flushPending();
  })
  .catch((err) => {
    console.error("[certko] Next.js prepare failed:", err);
    process.exit(1);
  });

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`[certko] ${signal} — closing`);
  try {
    server.close(() => process.exit(0));
  } catch (err) {
    if (!isBenignShutdownError(err)) console.error(err);
    process.exit(0);
  }
  setTimeout(() => process.exit(0), 4000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
