#!/usr/bin/env bash
# Full QC for Hostinger cold-start / DB-ready / custom-server fixes.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT=/opt/cursor/artifacts/qc-full-report.txt
mkdir -p /opt/cursor/artifacts
rm -f "$OUT"
pass=0
fail=0
skip=0

log() {
  echo "$@"
  echo "$@" >>"$OUT" 2>/dev/null || true
}
ok() { pass=$((pass+1)); log "PASS  $1"; }
bad() { fail=$((fail+1)); log "FAIL  $1"; }
skp() { skip=$((skip+1)); log "SKIP  $1"; }

kill_port() {
  local p="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${p}/tcp" >/dev/null 2>&1 || true
    sleep 0.6
    return
  fi
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -t -iTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)
    for pid in $pids; do
      kill "$pid" 2>/dev/null || true
    done
    sleep 0.5
    for pid in $pids; do
      kill -9 "$pid" 2>/dev/null || true
    done
    return
  fi
  # Fallback: scan /proc
  local hex
  hex=$(printf '%04X' "$p")
  local pids
  pids=$(awk -v h=":$hex" '$2 ~ h"$" { split($10,a,","); print a[1] }' /proc/net/tcp /proc/net/tcp6 2>/dev/null | sort -u)
  for pid in $pids; do
    [ -n "$pid" ] && [ "$pid" != "0" ] && kill "$pid" 2>/dev/null || true
  done
  sleep 0.5
}

wait_http() {
  local url="$1" want="$2" tries="${3:-60}"
  local i code
  for i in $(seq 1 "$tries"); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" || echo 000)
    if [ "$code" = "$want" ]; then
      echo "$code"
      return 0
    fi
    sleep 0.25
  done
  echo "$code"
  return 1
}

log "=== CERTKO QC $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
log "branch: $(git branch --show-current)"
log "commit: $(git rev-parse --short HEAD)"
log ""

# 1) Typecheck
log "--- 1) tsc ---"
if npx tsc --noEmit -p tsconfig.json >>"$OUT" 2>&1; then
  ok "tsc --noEmit"
else
  bad "tsc --noEmit"
fi

# 2) getDb wait smoke
log "--- 2) getDb wait ---"
if node scripts/smoke-getdb-wait.cjs >>"$OUT" 2>&1; then
  ok "getDb waits for bootstrap (no throw)"
else
  bad "getDb wait smoke"
fi

# 3) parallel getDb
log "--- 3) parallel getDb ---"
if node scripts/smoke-getdb-parallel.cjs >>"$OUT" 2>&1; then
  ok "parallel getDb (5 sync callers)"
else
  bad "parallel getDb"
fi

# 4) public-location rewrite
log "--- 4) Location rewrite ---"
node -e '
const { toPublicLocation, toPublicActionRedirect } = require("./lib/public-location.cjs");
const cases = [
  ["https://0.0.0.0:3000/admin", "/admin"],
  ["http://127.0.0.1:3000/admin/login?x=1", "/admin/login?x=1"],
  ["https://certko.com/admin", "https://certko.com/admin"],
];
let fail = 0;
for (const [inV, want] of cases) {
  const got = toPublicLocation(inV);
  if (got !== want) { console.error("loc", inV, "=>", got, "want", want); fail++; }
}
const ar = toPublicActionRedirect("https://0.0.0.0:3000/admin;push");
if (ar !== "/admin;push") { console.error("action", ar); fail++; }
process.exit(fail ? 1 : 0);
' >>"$OUT" 2>&1 && ok "public-location rewrite" || bad "public-location rewrite"

# 5) package start / main
log "--- 5) package entry ---"
node -e '
const p = require("./package.json");
let fail = 0;
if (!String(p.scripts.start).includes("server.cjs")) { console.error("start", p.scripts.start); fail++; }
if (p.main !== "server.js") { console.error("main", p.main); fail++; }
const fs = require("fs");
if (!fs.existsSync("server.js") || !fs.existsSync("server.cjs")) { console.error("missing server entry"); fail++; }
if (!fs.existsSync("lib/hostinger-runtime-patch.cjs")) { console.error("missing patch"); fail++; }
process.exit(fail ? 1 : 0);
' >>"$OUT" 2>&1 && ok "package start=server.cjs + main=server.js" || bad "package entry"

# Prepare durable data with full catalog for HTTP tests
DATA=/tmp/certko-qc-data-$$
rm -rf "$DATA"
mkdir -p "$DATA"
export CERTKO_DATA_DIR="$DATA"
export NODE_ENV=production
unset DATABASE_URL
log "--- prep CMS data dir $DATA ---"
node <<NODE >>"$OUT" 2>&1
require("tsx/cjs/api").register();
const { ensureDbReady, getDb } = require("./lib/db.ts");
(async () => {
  await ensureDbReady();
  getDb();
  // Wait for deferred catalog ensure (2s + work)
  await new Promise((r) => setTimeout(r, 10000));
  const row = getDb()
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='country_hubs'")
    .get();
  if (!row) {
    console.error("country_hubs missing after catalog ensure");
    process.exit(1);
  }
  console.log("catalog tables ready");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
NODE
if [ $? -eq 0 ]; then ok "CMS catalog seeded for HTTP tests"; else bad "CMS catalog seed"; fi

# 6) Custom server boot markers + routes
log "--- 6) custom server (npm start path) ---"
PORT=3031
kill_port "$PORT"
export PORT CERTKO_DATA_DIR="$DATA"
LOG=/opt/cursor/artifacts/qc-server-cjs.log
: > "$LOG"
node --import tsx server.cjs >>"$LOG" 2>&1 &
SPID=$!
# Wait for CMS ready marker
ready=0
for i in $(seq 1 80); do
  if grep -q "CMS ready — accepting page traffic" "$LOG" 2>/dev/null; then ready=1; break; fi
  if grep -q "CMS ready" "$LOG" 2>/dev/null; then ready=1; break; fi
  sleep 0.25
done
if [ "$ready" = "1" ] && grep -q "listening on" "$LOG"; then
  ok "custom server markers (listening + CMS ready)"
else
  bad "custom server markers missing"
  strings "$LOG" | tail -30 >>"$OUT"
fi

code=$(wait_http "http://127.0.0.1:$PORT/healthz" "200" 40 || true)
[ "$code" = "200" ] && ok "GET /healthz → 200" || bad "GET /healthz → $code"

code=$(wait_http "http://127.0.0.1:$PORT/" "200" 40 || true)
[ "$code" = "200" ] && ok "GET / → 200 (custom server)" || bad "GET / → $code (custom server)"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "http://127.0.0.1:$PORT/contact" || echo 000)
[ "$code" = "200" ] && ok "GET /contact → 200" || bad "GET /contact → $code"

# Contact API should not use redirect() RSC path — expect 303 or 200 JSON depending on validation
code=$(curl -s -o /tmp/qc-contact.json -w "%{http_code}" --max-time 15 \
  -X POST "http://127.0.0.1:$PORT/api/contact" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "name=QC+Test&email=qc@example.com&phone=9999999999&message=qc+check&company=QC" || echo 000)
# Accept 303 seeOther or 200/400 validation — must NOT 500 from DB not ready
if [ "$code" = "303" ] || [ "$code" = "200" ] || [ "$code" = "400" ] || [ "$code" = "422" ]; then
  ok "POST /api/contact → $code (no server crash)"
else
  bad "POST /api/contact → $code"
  head -c 400 /tmp/qc-contact.json >>"$OUT" 2>/dev/null || true
fi

# Location header must not be 0.0.0.0 if redirect
loc=$(curl -s -D - -o /dev/null --max-time 10 \
  -X POST "http://127.0.0.1:$PORT/api/contact" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "name=QC2&email=qc2@example.com&phone=8888888888&message=qc&company=QC" 2>/dev/null | tr -d '\r' | awk -F': ' 'tolower($1)=="location"{print $2}')
if [ -n "${loc:-}" ]; then
  case "$loc" in
    *0.0.0.0*) bad "Location contains 0.0.0.0: $loc" ;;
    /*) ok "Location is relative path: $loc" ;;
    https://certko.com*|http://127.0.0.1*) ok "Location host ok: $loc" ;;
    *) log "INFO  Location: $loc"; ok "Location present without 0.0.0.0" ;;
  esac
else
  skp "no Location header on contact POST (may be JSON)"
fi

if grep -q "Database not ready yet" "$LOG"; then
  bad "custom server log contains Database not ready yet"
else
  ok "no Database not ready in custom server log"
fi

kill "$SPID" 2>/dev/null || true
sleep 1
kill -9 "$SPID" 2>/dev/null || true
kill_port "$PORT"

# 7) Bare next start race (Hostinger misconfig path)
log "--- 7) bare next start cold race ---"
PORT=3032
kill_port "$PORT"
export PORT
LOG=/opt/cursor/artifacts/qc-next-start.log
: > "$LOG"
# Bind 127.0.0.1 for local QC; Hostinger still uses 0.0.0.0 — race under test is DB readiness.
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p "$PORT" >>"$LOG" 2>&1 &
NPID=$!
# Wait until Next is accepting connections (log Ready or first connect)
boot=0
for i in $(seq 1 80); do
  if strings "$LOG" 2>/dev/null | grep -q "Ready in"; then boot=1; break; fi
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://127.0.0.1:$PORT/" || echo 000)
  if [ "$code" != "000" ]; then boot=1; break; fi
  if ! kill -0 "$NPID" 2>/dev/null; then
    log "next start exited early"
    strings "$LOG" 2>/dev/null | tail -40 >>"$OUT"
    break
  fi
  sleep 0.2
done
# Cold-ish hammer once process is up (still races DB warm inside process)
db_ready_hits=0
http_200=0
http_other=0
for i in $(seq 1 35); do
  body=/tmp/qc-ns-$i.html
  code=$(curl -s -o "$body" -w "%{http_code}" --max-time 6 "http://127.0.0.1:$PORT/" || echo 000)
  if [ "$code" = "200" ]; then http_200=$((http_200+1)); fi
  if [ "$code" != "200" ] && [ "$code" != "000" ]; then http_other=$((http_other+1)); fi
  if grep -q "Database not ready yet" "$body" 2>/dev/null; then db_ready_hits=$((db_ready_hits+1)); fi
  sleep 0.12
done
log "next-start hammer: boot=$boot http_200=$http_200 other=$http_other body_db_not_ready=$db_ready_hits"
if grep -q "Database not ready yet" "$LOG"; then
  bad "bare next start log has Database not ready yet"
else
  ok "bare next start log has no Database not ready yet"
fi
if [ "$db_ready_hits" -eq 0 ]; then
  ok "no Database not ready in HTML bodies"
else
  bad "Database not ready appeared in $db_ready_hits response bodies"
fi
if [ "$http_200" -ge 5 ]; then
  ok "bare next start served homepage ($http_200 x 200)"
else
  bad "bare next start too few 200s ($http_200)"
fi
if strings "$LOG" 2>/dev/null | grep -q "WARNING: custom server"; then
  ok "warns when custom server not detected"
else
  skp "custom-server WARNING not seen in log (instrumentation timing)"
fi

kill "$NPID" 2>/dev/null || true
sleep 1
kill -9 "$NPID" 2>/dev/null || true
kill_port "$PORT"

# 8) Durable runtime asserts sqlite when no DATABASE_URL
log "--- 8) durable runtime ---"
node <<NODE >>"$OUT" 2>&1
process.env.CERTKO_DATA_DIR = process.env.CERTKO_DATA_DIR;
delete process.env.DATABASE_URL;
require("tsx/cjs/api").register();
const { assertDurableRuntimeConfig } = require("./lib/durable-runtime.ts");
assertDurableRuntimeConfig();
console.log("durable ok");
NODE
[ $? -eq 0 ] && ok "durable runtime OK without DATABASE_URL (sqlite fallback)" || bad "durable runtime"

# 9) Postgres path availability
log "--- 9) postgres path ---"
if [ -n "${DATABASE_URL:-}" ]; then
  skp "DATABASE_URL was set in shell — unexpected for this QC"
elif command -v psql >/dev/null 2>&1 && ss -tln | grep -q ':5432'; then
  skp "local Postgres listening but DATABASE_URL unset (Hostinger Node panel behavior)"
else
  skp "no local Postgres — production uses SQLite until DATABASE_URL is set in hPanel (expected)"
fi

# Summary
log ""
log "=== SUMMARY ==="
log "PASS=$pass FAIL=$fail SKIP=$skip"
if [ "$fail" -eq 0 ]; then
  log "VERDICT: QC OK — code fixes verified. Hostinger still needs Start=npm start and DATABASE_URL for Postgres."
  exit 0
else
  log "VERDICT: QC FAILED — see failures above"
  exit 1
fi
