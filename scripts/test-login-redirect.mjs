#!/usr/bin/env node
/**
 * Login after Hostinger bind must never send the browser to https://0.0.0.0:3000
 * Login page must not mutate cookies during Server Component render.
 */
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { toPublicLocation, toPublicActionRedirect, patchOutgoingRedirects } = require(
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
assert(
  toPublicActionRedirect("https://0.0.0.0:3000/admin/settings?saved=1;replace") ===
    "/admin/settings?saved=1;replace",
  "x-action-redirect bind host becomes relative"
);
assert(
  toPublicActionRedirect("https://certko.com/admin;push") ===
    "https://certko.com/admin;push",
  "x-action-redirect public host left intact"
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

const actionServer = http.createServer((req, res) => {
  patchOutgoingRedirects(res);
  res.statusCode = 303;
  res.setHeader(
    "x-action-redirect",
    "https://0.0.0.0:3000/admin/settings?saved=1;replace"
  );
  res.end();
});

await new Promise((resolve, reject) => {
  actionServer.listen(0, "127.0.0.1", () => resolve());
  actionServer.on("error", reject);
});

const actionPort = actionServer.address().port;
const actionRes = await fetch(`http://127.0.0.1:${actionPort}/`, {
  redirect: "manual",
});
const actionRedirect = actionRes.headers.get("x-action-redirect");
assert(
  actionRedirect === "/admin/settings?saved=1;replace",
  "patched x-action-redirect, got " + actionRedirect
);
assert(!String(actionRedirect).includes("0.0.0.0"), "x-action-redirect must not contain 0.0.0.0");
actionServer.close();

const loginPage = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../app/admin/login/page.tsx"),
  "utf8"
);
assert(!loginPage.includes("clearAdminSession"), "login page must not clear cookies during render");
assert(!loginPage.includes("jar.set"), "login page must not cookies().set during render");
assert(!loginPage.includes('from "next/headers"'), "login page must not import next/headers cookies");
assert(!loginPage.includes("@/lib/auth"), "login page must not import lib/auth (pulls SQLite)");
assert(!loginPage.includes("@/components/Logo"), "login page must not import Logo (pulls SQLite)");
assert(
  loginPage.includes("createCaptchaChallenge"),
  "login page still issues a signed captcha token for the form"
);

const layoutSrc = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../app/layout.tsx"),
  "utf8"
);
assert(
  !layoutSrc.includes('import { ensureDbReady'),
  "root layout must not statically import the database (login would boot SQLite)"
);
assert(
  layoutSrc.includes("isDbFreePath"),
  "root layout still skips CMS boot on /admin/login"
);

const loginForm = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../components/admin/AdminLoginForm.tsx"),
  "utf8"
);
assert(
  !/disabled=\{locked \|\| submitting/.test(loginForm),
  "login form must not disable named fields on submit (browser omits them → captcha always fails)"
);
assert(
  loginForm.includes("disabled={locked || !token}"),
  "captcha input still disables only when locked or token missing"
);
assert(
  loginForm.includes('name="captcha"'),
  "captcha field is still posted"
);

const loginRoute = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../app/api/admin/login/route.ts"),
  "utf8"
);
const postFn = loginRoute.split("export async function POST")[1] || "";
assert(
  postFn.indexOf("verifyCaptchaToken") < postFn.indexOf("await ensureDbReady()"),
  "captcha must be verified before ensureDbReady() so migrate cannot rotate the signing secret"
);
const captchaFailBlock = postFn.split("verifyCaptchaToken")[1]?.split("ensureDbReady")[0] || "";
assert(
  captchaFailBlock.includes("bad_captcha"),
  "captcha failures are still logged"
);
assert(
  !captchaFailBlock.includes("recordLoginFailure"),
  "captcha failures must not count toward the 15-minute lockout"
);

const captchaSrc = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../lib/captcha.ts"),
  "utf8"
);
assert(captchaSrc.includes('const op = add ? "+" : "-"'), "captcha SVG uses ASCII minus, not unicode −");
assert(captchaSrc.includes("normalizeCaptchaAnswer"), "captcha verify accepts typed sums like 6+4");

console.log("ok login Location never uses 0.0.0.0");
console.log("ok login page does not mutate cookies during render");
console.log("ok login layout does not boot SQLite");
console.log("ok login captcha fields stay enabled on submit");
process.exit(0);
