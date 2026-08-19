/**
 * Hostinger SIGTERMs the previous Node process when a new build is uploaded.
 * Next.js 16 `next start` then calls `server.close()` after the socket is
 * already gone:
 *   Error: Server is not running.
 *     at Server.close (node:net:…)
 *
 * Patch both http and https Server.close so a second close is a no-op.
 * Safe to load more than once (npm start and Next instrumentation).
 */
"use strict";

const http = require("node:http");
const https = require("node:https");

function isBenignCloseError(err) {
  if (!err) return false;
  const msg = String(err.message || err);
  return msg.includes("Server is not running") || err.code === "ERR_SERVER_NOT_RUNNING";
}

function patchServerClose(Server) {
  if (!Server || !Server.prototype || Server.prototype.__certkoClosePatched) return;
  const original = Server.prototype.close;
  Server.prototype.close = function patchedClose(cb) {
    if (!this.listening) {
      if (typeof cb === "function") {
        process.nextTick(() => cb.call(this));
      }
      return this;
    }
    return original.call(this, function (err) {
      if (isBenignCloseError(err)) err = undefined;
      if (typeof cb === "function") cb.call(this, err);
    });
  };
  Server.prototype.__certkoClosePatched = true;
}

function installUncaughtFilter() {
  if (global.__certkoCloseUncaught) return;
  global.__certkoCloseUncaught = true;
  process.on("uncaughtException", (err) => {
    if (isBenignCloseError(err)) {
      console.warn("[certko] ignored Hostinger shutdown race:", err.message);
      return;
    }
    console.error(err);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    if (isBenignCloseError(reason)) {
      console.warn(
        "[certko] ignored Hostinger shutdown race:",
        reason && reason.message
      );
      return;
    }
    console.error(reason);
    process.exit(1);
  });
}

function install() {
  if (global.__certkoHttpClosePatch) return global.__certkoHttpClosePatch;
  patchServerClose(http.Server);
  patchServerClose(https.Server);
  installUncaughtFilter();
  global.__certkoHttpClosePatch = { patched: true };
  return global.__certkoHttpClosePatch;
}

install();

module.exports = { install, isBenignCloseError };
