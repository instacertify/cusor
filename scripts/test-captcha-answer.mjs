#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}
function assert(cond, msg) {
  if (!cond) fail(msg);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { normalizeCaptchaAnswer } = await import(
  pathToFileURL(path.join(root, "lib/captcha-answer.ts")).href
);

assert(normalizeCaptchaAnswer("10") === "10", "plain number");
assert(normalizeCaptchaAnswer(" 10 ") === "10", "trimmed number");
assert(normalizeCaptchaAnswer("6+4") === "10", "plus expression");
assert(normalizeCaptchaAnswer("6 + 4") === "10", "plus with spaces");
assert(normalizeCaptchaAnswer("7-3") === "4", "minus expression");
assert(normalizeCaptchaAnswer("7−3") === "4", "unicode minus expression");
assert(normalizeCaptchaAnswer("9+8") === "17", "two-digit result");
assert(normalizeCaptchaAnswer("6+4=10") === "10", "expression with equals");
assert(normalizeCaptchaAnswer("99") === "99", "wrong-looking number still parsed");
assert(normalizeCaptchaAnswer("") === "", "empty stays empty");

console.log("ok captcha answer normalizer");
