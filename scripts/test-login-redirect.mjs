#!/usr/bin/env node
/**
 * Login after Hostinger bind must never send the browser to https://0.0.0.0:3000
 */
import http from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { toPublicLocation, patchOutgoingRedirects } = require(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../lib/public-location.cjs")
);

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

assert(
  toPublicLocation("https://0.0.0.0:3000/admin/login?error=captcha") ===
    "/admin/login?error=captcha",
  "https 0.0.0.0 captcha redirect becomes relative"
);
assert(
  toPublicLocation("http://0.0.0.0:3000/admin") === "/admin",
  "http 0.0.0.0 success redirect becomes relative"
);
assert(
  toPublicLocation("http://127.0.0.1:3000/admin/login") === "/admin/login",
  "loopback redirect becomes relative"
);
assert(
  toPublicLocation("https://certko.com/admin/login?error=captcha") ===
    "https://certko.com/admin/login?error=captcha",
  "public host left intact"
);
assert(
  toPublicLocation("/admin/login?error=captcha") === "/admin/login?error=captcha",
  "already-relative Location left intact"
);

const server = http.createServer((req, res) => {
  patchOutgoingRedirects(res);
  res.statusCode = 303;
  res.setHeader("Location", "https://0.0.0.0:3000/admin/login?error=captcha");
  res.end();
});

await new Promise((resolve, reject) => {
  server.listen(0, "127.0.0.1", () => resolve());
  server.on("error", reject);
});

const { port } = server.address();
const res = await fetch(`http://127.0.0.1:${port}/api/admin/login`, {
  method: "POST",
  redirect: "manual",
});
const location = res.headers.get("location");
assert(res.status === 303, "status 303, got " + res.status);
assert(location === "/admin/login?error=captcha", "patched Location, got " + location);
assert(!String(location).includes("0.0.0.0"), "Location must not contain 0.0.0.0");

server.close();
console.log("ok login Location never uses 0.0.0.0");
process.exit(0);
