#!/usr/bin/env node
/**
 * Hostinger Node.js Web Apps require $PORT to accept connections immediately.
 * `next start` only listens after Next finishes preparing; the panel then
 * SIGTERMs the process and Next's shutdown calls Server.close() twice:
 *   Error: Server is not running
 *
 * This wrapper binds 0.0.0.0:$PORT first, serves a tiny health response until
 * Next is ready, and makes close() idempotent so the race cannot crash us.
 */
"use strict";

const { createServer } = require("node:http");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
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
  if (!nextHandler) return;
  while (pending.length) {
    const job = pending.shift();
    if (!job) continue;
    const { req, res } = job;
    if (res.writableEnded) continue;
    nextHandler(req, res);
  }
}

const server = createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
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
  // Do not return a fake 200 HTML body — that shows as a broken page, then
  // a reload "fixes" it once Next is ready. Hold the request instead.
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
  hostname,
  port,
  dir: process.cwd(),
  httpServer: server,
});

app
  .prepare()
  .then(() => {
    nextHandler = app.getRequestHandler();
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
