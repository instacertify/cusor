#!/usr/bin/env node
/**
 * Hostinger new-build SIGTERM calls Server.close() after the socket is gone.
 * The prototype patch must make a second close a no-op (no throw, no err).
 */
import http from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { isBenignCloseError } = require("../lib/patch-http-server-close.cjs");

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}
function assert(cond, msg) {
  if (!cond) fail(msg);
}

assert(isBenignCloseError(new Error("Server is not running.")), "matches Next/Hostinger message");
assert(isBenignCloseError(Object.assign(new Error("x"), { code: "ERR_SERVER_NOT_RUNNING" })), "matches Node code");
assert(!isBenignCloseError(new Error("EADDRINUSE")), "does not swallow real listen errors");

const idle = http.createServer();
const idleErr = await new Promise((resolve) => {
  idle.close((err) => resolve(err || null));
});
assert(!idleErr, "close() on a server that never listened must not pass an error, got " + idleErr);

const live = http.createServer();
await new Promise((resolve, reject) => {
  live.listen(0, "127.0.0.1", (err) => (err ? reject(err) : resolve()));
});
const first = await new Promise((resolve) => live.close((err) => resolve(err || null)));
assert(!first, "first close of a listening server must succeed, got " + first);
const second = await new Promise((resolve) => live.close((err) => resolve(err || null)));
assert(!second, "second close must be a no-op, got " + second);

const instr = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../instrumentation.ts"),
  "utf8"
);
assert(
  instr.includes("patch-http-server-close.cjs"),
  "instrumentation must load the close patch so `next start` is covered"
);

const pkg = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf8")
);
assert(pkg.scripts.start.includes("server.cjs"), "npm start still uses server.cjs");
assert(pkg.scripts["start:next"].includes("server.cjs"), "start:next must not invoke next start");

console.log("ok hostinger Server.close patch is idempotent");
process.exit(0);
