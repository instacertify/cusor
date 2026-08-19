#!/usr/bin/env bash
# Certko — safe production update for Hostinger VPS
# Preserves SQLite (manual blogs / CMS / admin password) and uploaded images.
#
# Durable layout (outside the git tree):
#   CERTKO_DATA_DIR=/var/lib/certko
#     certko.db
#     uploads/
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

bold "Certko safe update — preserve DB + uploads + admin password"
echo "App dir  : $APP_DIR"
echo "Data dir : $DATA_DIR   (outside git — survives deploys)"
echo "Branch   : $REPO_BRANCH"
echo

mkdir -p "$BACKUP_ROOT/$STAMP" "$DATA_DIR" "$DATA_DIR/uploads"
cd "$APP_DIR"

# --- 1) Backup live content before touching code ---
green "1/6 Backing up database and uploads → $BACKUP_ROOT/$STAMP"

backup_db() {
  local src="$1"
  if [[ -f "$src" ]]; then
    cp -a "$src" "$BACKUP_ROOT/$STAMP/$(basename "$src")"
    local dir
    dir="$(dirname "$src")"
    cp -a "$dir"/certko.db-* "$BACKUP_ROOT/$STAMP/" 2>/dev/null || true
    return 0
  fi
  return 1
}

if backup_db "$DATA_DIR/certko.db"; then
  green "Backed up $DATA_DIR/certko.db"
elif backup_db "$APP_DIR/data/certko.db"; then
  yellow "Backed up legacy $APP_DIR/data/certko.db"
else
  yellow "No certko.db yet — skipping DB backup."
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

# --- 2) Migrate legacy in-app data into durable DATA_DIR (never delete source) ---
green "2/6 Ensuring durable data lives in $DATA_DIR"
if [[ ! -f "$DATA_DIR/certko.db" && -f "$APP_DIR/data/certko.db" ]]; then
  yellow "Migrating SQLite → $DATA_DIR/certko.db"
  cp -a "$APP_DIR/data/certko.db" "$DATA_DIR/certko.db"
  cp -a "$APP_DIR"/data/certko.db-* "$DATA_DIR/" 2>/dev/null || true
fi
# Copy any missing upload files from legacy locations
if [[ -d "$APP_DIR/public/uploads" ]]; then
  cp -an "$APP_DIR/public/uploads/." "$DATA_DIR/uploads/" 2>/dev/null || true
fi
if [[ -d "$APP_DIR/data/uploads" ]]; then
  cp -an "$APP_DIR/data/uploads/." "$DATA_DIR/uploads/" 2>/dev/null || true
fi

# --- 3) Pull new code without deleting runtime dirs ---
green "3/6 Pulling $REPO_BRANCH (code only — never deletes $DATA_DIR)"
git fetch origin "$REPO_BRANCH"
git checkout "$REPO_BRANCH"
git pull --ff-only origin "$REPO_BRANCH"

mkdir -p "$APP_DIR/data" "$APP_DIR/public/uploads" "$DATA_DIR/uploads"
touch "$APP_DIR/public/uploads/.gitkeep"

# Restore DB from this run's backup if somehow missing
if [[ ! -f "$DATA_DIR/certko.db" && -f "$BACKUP_ROOT/$STAMP/certko.db" ]]; then
  yellow "Restoring certko.db from backup taken this run."
  cp -a "$BACKUP_ROOT/$STAMP/certko.db" "$DATA_DIR/certko.db"
fi

# --- 4) Keep secrets stable (admin password is in SQLite; CERTKO_SECRET must not rotate) ---
green "4/6 Keeping existing .env / CERTKO_SECRET (password stays in SQLite)"
if [[ ! -f "$APP_DIR/.env" && -f "$BACKUP_ROOT/$STAMP/.env" ]]; then
  cp -a "$BACKUP_ROOT/$STAMP/.env" "$APP_DIR/.env"
fi
# Ensure CERTKO_DATA_DIR is pinned in .env
ensure_env_key() {
  local file="$1" key="$2" value="$3"
  [[ -f "$file" ]] || touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    # keep existing value
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

# --- 5) Build ---
green "5/6 Installing dependencies & building"
npm ci
npm run build

# --- 6) Restart ---
green "6/6 Restarting PM2 app: $APP_NAME"
if command -v pm2 >/dev/null 2>&1; then
  # Load .env into PM2 so CERTKO_DATA_DIR / CERTKO_SECRET stick across restarts
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env" 2>/dev/null || true
  set +a
  export CERTKO_DATA_DIR="$DATA_DIR"
  pm2 restart "$APP_NAME" --update-env || pm2 start npm --name "$APP_NAME" -- start
  pm2 save || true
else
  yellow "pm2 not found — start the app manually with CERTKO_DATA_DIR=$DATA_DIR"
fi

echo
green "Update complete."
echo "  Code     : $APP_DIR   (safe to git pull)"
echo "  Database : $DATA_DIR/certko.db   (blogs + admin password)"
echo "  Uploads  : $DATA_DIR/uploads/    (images)"
echo "  Backup   : $BACKUP_ROOT/$STAMP"
echo
yellow "Do NOT: rm -rf $DATA_DIR   — that deletes blogs, passwords, and images."
yellow "Do NOT: rotate CERTKO_SECRET casually — that logs everyone out (password itself is in SQLite)."
echo "Next update: bash $APP_DIR/scripts/hostinger-safe-update.sh"
echo
