"use strict";

/**
 * Patches that must apply even when Hostinger runs bare `next start`
 * (bypassing server.cjs). Safe to call multiple times.
 *
 * - Idempotent Server.close → silences "Error: Server is not running"
 * - Location / x-action-redirect rewrite → no https://0.0.0.0:$PORT/...
 * - Fix __NEXT_PRIVATE_ORIGIN if it still points at a bind address
 */
const http = require("node:http");
const https = require("node:https");
const { patchOutgoingRedirects } = require("./public-location.cjs");

const g = globalThis;

function patchServerClose(ServerProto) {
  if (!ServerProto || ServerProto.__certkoClosePatched) return;
  const originalClose = ServerProto.close;
  if (typeof originalClose !== "function") return;
  ServerProto.close = function patchedClose(cb) {
    if (!this.listening) {
      if (typeof cb === "function") cb.call(this);
      return this;
    }
    return originalClose.call(this, cb);
  };
  ServerProto.__certkoClosePatched = true;
}

function patchCreateServer(mod) {
  if (!mod || mod.__certkoCreatePatched) return;
  const original = mod.createServer;
  if (typeof original !== "function") return;
  mod.createServer = function patchedCreateServer(...args) {
    const server = original.apply(this, args);
    server.on("request", (_req, res) => {
      try {
        patchOutgoingRedirects(res);
      } catch {
        /* non-fatal */
      }
    });
    return server;
  };
  mod.__certkoCreatePatched = true;
}

function fixPrivateOrigin() {
  const raw = process.env.__NEXT_PRIVATE_ORIGIN || "";
  if (!raw) return;
  try {
    const u = new URL(raw);
    if (u.hostname === "0.0.0.0" || u.hostname === "::") {
      u.hostname = "127.0.0.1";
      process.env.__NEXT_PRIVATE_ORIGIN = u.toString().replace(/\/$/, "");
      console.info(
        "[certko] rewrote __NEXT_PRIVATE_ORIGIN bind host →",
        process.env.__NEXT_PRIVATE_ORIGIN
      );
    }
  } catch {
    /* ignore */
  }
}

function installHostingerRuntimePatches() {
  if (g.__certkoRuntimePatchesInstalled) return;
  g.__certkoRuntimePatchesInstalled = true;

  patchServerClose(http.Server.prototype);
  patchServerClose(https.Server.prototype);
  patchCreateServer(http);
  patchCreateServer(https);

  // Next may set origin after listen — keep correcting bind hosts.
  fixPrivateOrigin();
  const tick = setInterval(fixPrivateOrigin, 1000);
  tick.unref?.();
  setTimeout(() => clearInterval(tick), 15_000).unref?.();

  if (!g.__certkoCustomServer) {
    console.warn(
      "[certko] WARNING: custom server (server.cjs / npm start) not detected. " +
        "Hostinger Start must be exactly: npm start — not `next start`. " +
        "Without it, cold-start races and dual boots are more likely."
    );
  } else {
    console.info("[certko] runtime patches active (custom server)");
  }
}

module.exports = { installHostingerRuntimePatches, fixPrivateOrigin };
