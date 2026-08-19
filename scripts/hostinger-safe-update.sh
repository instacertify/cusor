#!/usr/bin/env bash
# Certko — safe production update for Hostinger VPS
# Preserves PostgreSQL CMS data (blogs / settings / admin password) and uploaded images.
#
# Durable layout:
#   DATABASE_URL=postgres://…     (blogs, pages, settings, password hash)
#   CERTKO_DATA_DIR=/var/lib/certko
#     uploads/                    (images — outside git)
#
# Usage:
#   bash scripts/hostinger-safe-update.sh
#   APP_DIR=/var/www/certko REPO_BRANCH=main bash scripts/hostinger-safe-update.sh
set -euo pipefail

APP_NAME="${APP_NAME:-certko}"
APP_DIR="${APP_DIR:-/var/www/certko}"
REPO_BRANCH="${REPO_BRANCH:-main}"
DATA_DIR="${CERTKO_DATA_DIR:-/var/lib/certko}"
BACKUP_ROOT="${BACKUP_ROOT:-/root/certko-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
bold() { printf '\033[1m%s\033[0m\n' "$*"; }

if [[ ! -d "$APP_DIR/.git" ]]; then
  red "No git checkout at $APP_DIR — aborting (will not wipe an unknown tree)."
  exit 1
fi

bold "Certko safe update — preserve Postgres + uploads + admin password"
echo "App dir  : $APP_DIR"
echo "Data dir : $DATA_DIR   (uploads outside git — survives deploys)"
echo "Branch   : $REPO_BRANCH"
echo

mkdir -p "$BACKUP_ROOT/$STAMP" "$DATA_DIR" "$DATA_DIR/uploads"
cd "$APP_DIR"

# Load env early for DATABASE_URL
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env" 2>/dev/null || true
set +a
DATA_DIR="${CERTKO_DATA_DIR:-$DATA_DIR}"

# --- 1) Backup live content before touching code ---
green "1/6 Backing up PostgreSQL and uploads → $BACKUP_ROOT/$STAMP"

if [[ -n "${DATABASE_URL:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
  if pg_dump "$DATABASE_URL" --no-owner --format=custom -f "$BACKUP_ROOT/$STAMP/certko.dump" 2>/dev/null \
    || pg_dump "$DATABASE_URL" --no-owner -f "$BACKUP_ROOT/$STAMP/certko.sql" 2>/dev/null; then
    green "Backed up PostgreSQL via DATABASE_URL"
  else
    yellow "pg_dump failed — check DATABASE_URL / Postgres access."
  fi
else
  yellow "No DATABASE_URL or pg_dump — skipping DB backup."
fi

# Legacy SQLite files (pre-Postgres installs) — keep a copy if present
if [[ -f "$DATA_DIR/certko.db" ]]; then
  cp -a "$DATA_DIR/certko.db" "$BACKUP_ROOT/$STAMP/certko.db"
fi
if [[ -f "$APP_DIR/data/certko.db" ]]; then
  cp -a "$APP_DIR/data/certko.db" "$BACKUP_ROOT/$STAMP/legacy-app-certko.db"
fi

if [[ -d "$DATA_DIR/uploads" ]]; then
  tar -czf "$BACKUP_ROOT/$STAMP/data-dir-uploads.tar.gz" -C "$DATA_DIR" uploads
fi
if [[ -d "$APP_DIR/public/uploads" ]]; then
  tar -czf "$BACKUP_ROOT/$STAMP/public-uploads.tar.gz" -C "$APP_DIR/public" uploads
fi
if [[ -d "$APP_DIR/data/uploads" ]]; then
  tar -czf "$BACKUP_ROOT/$STAMP/app-data-uploads.tar.gz" -C "$APP_DIR/data" uploads
fi
if [[ -f "$APP_DIR/.env" ]]; then
  cp -a "$APP_DIR/.env" "$BACKUP_ROOT/$STAMP/.env"
fi
if [[ -f "$APP_DIR/.env.production" ]]; then
  cp -a "$APP_DIR/.env.production" "$BACKUP_ROOT/$STAMP/.env.production"
fi

# --- 2) Migrate legacy upload dirs into durable DATA_DIR (never delete source) ---
green "2/6 Ensuring uploads live in $DATA_DIR/uploads"
if [[ -d "$APP_DIR/public/uploads" ]]; then
  cp -an "$APP_DIR/public/uploads/." "$DATA_DIR/uploads/" 2>/dev/null || true
fi
if [[ -d "$APP_DIR/data/uploads" ]]; then
  cp -an "$APP_DIR/data/uploads/." "$DATA_DIR/uploads/" 2>/dev/null || true
fi

# --- 3) Pull new code without deleting runtime dirs ---
green "3/6 Pulling $REPO_BRANCH (code only — never deletes Postgres or $DATA_DIR)"
git fetch origin "$REPO_BRANCH"
git checkout "$REPO_BRANCH"
git pull --ff-only origin "$REPO_BRANCH"

mkdir -p "$APP_DIR/data" "$APP_DIR/public/uploads" "$DATA_DIR/uploads"
touch "$APP_DIR/public/uploads/.gitkeep"

# --- 4) Keep secrets stable (admin password is in Postgres; CERTKO_SECRET must not rotate) ---
green "4/6 Keeping existing .env / CERTKO_SECRET / DATABASE_URL"
if [[ ! -f "$APP_DIR/.env" && -f "$BACKUP_ROOT/$STAMP/.env" ]]; then
  cp -a "$BACKUP_ROOT/$STAMP/.env" "$APP_DIR/.env"
fi
ensure_env_key() {
  local file="$1" key="$2" value="$3"
  [[ -f "$file" ]] || touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    return 0
  fi
  printf '\n%s=%s\n' "$key" "$value" >> "$file"
}
ensure_env_key "$APP_DIR/.env" "CERTKO_DATA_DIR" "$DATA_DIR"
ensure_env_key "$APP_DIR/.env" "NODE_ENV" "production"
if [[ -f "$APP_DIR/.env.production" ]]; then
  ensure_env_key "$APP_DIR/.env.production" "CERTKO_DATA_DIR" "$DATA_DIR"
fi
# Never invent a new CERTKO_SECRET here — that would log everyone out.
if ! grep -q '^CERTKO_SECRET=' "$APP_DIR/.env" 2>/dev/null; then
  yellow "No CERTKO_SECRET in .env — generating once (will not change on later updates)."
  printf '\nCERTKO_SECRET=%s\n' "$(openssl rand -hex 32)" >> "$APP_DIR/.env"
fi
if ! grep -q '^DATABASE_URL=' "$APP_DIR/.env" 2>/dev/null; then
  red "DATABASE_URL missing in $APP_DIR/.env — set postgres://user:pass@host:5432/certko before restart."
  exit 1
fi

# --- 5) Build ---
green "5/6 Installing dependencies & building"
npm ci
npm run build

# --- 6) Restart ---
green "6/6 Restarting PM2 app: $APP_NAME"
if command -v pm2 >/dev/null 2>&1; then
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env" 2>/dev/null || true
  set +a
  export CERTKO_DATA_DIR="$DATA_DIR"
  systemctl enable postgresql 2>/dev/null || true
  if [[ -f "$APP_DIR/ecosystem.config.cjs" ]]; then
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    pm2 start "$APP_DIR/ecosystem.config.cjs"
  else
    pm2 restart "$APP_NAME" --update-env || pm2 start npm --name "$APP_NAME" -- start
  fi
  pm2 save || true
else
  yellow "pm2 not found — start with: DATABASE_URL=… CERTKO_DATA_DIR=$DATA_DIR npm start"
fi

echo
green "Update complete."
echo "  Code     : $APP_DIR   (safe to git pull)"
echo "  Database : PostgreSQL via DATABASE_URL   (blogs + admin password)"
echo "  Uploads  : $DATA_DIR/uploads/    (images)"
echo "  Backup   : $BACKUP_ROOT/$STAMP"
echo
yellow "Do NOT: drop the Postgres database — that deletes blogs and the admin password."
yellow "Do NOT: rm -rf $DATA_DIR — that deletes uploaded images."
yellow "Do NOT: rotate CERTKO_SECRET casually — that logs everyone out (password itself is in Postgres)."
echo "Next update: bash $APP_DIR/scripts/hostinger-safe-update.sh"
echo
