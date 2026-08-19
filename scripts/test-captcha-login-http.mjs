#!/usr/bin/env node
/**
 * End-to-end: GET /admin/login, solve the math captcha from the SVG,
 * POST /api/admin/login. Captcha must pass (wrong password → error=1,
 * correct seed password → /admin). Empty/wrong captcha → error=captcha.
 */
const base = (process.env.BASE_URL || process.argv[2] || "").replace(/\/$/, "");
if (!base) {
  console.error("usage: BASE_URL=http://127.0.0.1:PORT node scripts/test-captcha-login-http.mjs");
  process.exit(2);
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function parseLogin(html) {
  const token =
    html.match(/name="captcha_token"[^>]*value="([^"]+)"/)?.[1] ||
    html.match(/value="([^"]+)"[^>]*name="captcha_token"/)?.[1] ||
    "";
  const prompt = html.match(/>(\d+)\s*([+\-])\s*(\d+)\s*=\s*\?</);
  if (!token) fail("login HTML missing captcha_token\n" + html.slice(0, 800));
  if (!prompt) fail("login HTML missing math prompt\n" + html.slice(0, 800));
  const left = Number(prompt[1]);
  const right = Number(prompt[3]);
  const answer = prompt[2] === "+" ? left + right : left - right;
  return {
    token,
    left,
    right,
    op: prompt[2],
    answer: String(answer),
    expr: `${left}${prompt[2]}${right}`,
  };
}

async function getLogin() {
  const res = await fetch(`${base}/admin/login`, { redirect: "manual" });
  const html = await res.text();
  if (res.status !== 200) fail(`GET /admin/login status ${res.status}`);
  if (html.includes("Cookies can only be modified")) {
    fail("login page still throws Cookies can only be modified");
  }
  return parseLogin(html);
}

async function postLogin({ username, password, captcha, captcha_token }) {
  const body = new URLSearchParams({
    username,
    password,
    captcha,
    captcha_token,
    next: "/admin",
  });
  const res = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  });
  const location = res.headers.get("location") || "";
  return { status: res.status, location };
}

function expectRedirect(got, allowed, label) {
  if (got.status !== 303) fail(`${label}: status ${got.status}, expected 303`);
  if (String(got.location).includes("0.0.0.0")) {
    fail(`${label}: Location used 0.0.0.0 (${got.location})`);
  }
  if (!allowed.some((p) => got.location === p || got.location.endsWith(p))) {
    fail(`${label}: Location ${got.location}, expected one of ${allowed.join(", ")}`);
  }
}

const page = await getLogin();
const wrongPw = await postLogin({
  username: "admin",
  password: "definitely-not-the-password",
  captcha: page.answer,
  captcha_token: page.token,
});
expectRedirect(
  wrongPw,
  ["/admin/login?error=1", "/admin/login?error=locked"],
  "correct number, wrong password"
);

const pageExpr = await getLogin();
const exprPw = await postLogin({
  username: "admin",
  password: "definitely-not-the-password",
  captcha: pageExpr.expr,
  captcha_token: pageExpr.token,
});
expectRedirect(
  exprPw,
  ["/admin/login?error=1", "/admin/login?error=locked"],
  `typed expression ${pageExpr.expr}`
);

const pageBad = await getLogin();
const bad = await postLogin({
  username: "admin",
  password: "definitely-not-the-password",
  captcha: "999",
  captcha_token: pageBad.token,
});
expectRedirect(bad, ["/admin/login?error=captcha"], "wrong number");

const pageEmpty = await getLogin();
const empty = await postLogin({
  username: "admin",
  password: "definitely-not-the-password",
  captcha: "",
  captcha_token: pageEmpty.token,
});
expectRedirect(empty, ["/admin/login?error=captcha"], "empty captcha");

const pageOk = await getLogin();
const ok = await postLogin({
  username: "admin",
  password: process.env.ADMIN_PASSWORD || "certko-admin",
  captcha: pageOk.answer,
  captcha_token: pageOk.token,
});
if (ok.status !== 303) fail(`seed login: status ${ok.status}`);
if (String(ok.location).includes("error=captcha")) {
  fail(`seed login still failed captcha: ${ok.location}`);
}
if (
  ok.location === "/admin" ||
  ok.location.endsWith("/admin") ||
  ok.location === "/admin/login?error=1" ||
  ok.location === "/admin/login?error=locked"
) {
  console.log("ok captcha HTTP: number, expression, wrong, empty, seed attempt");
  console.log("  last Location:", ok.location);
  process.exit(0);
}
fail(`seed login unexpected Location ${ok.location}`);
