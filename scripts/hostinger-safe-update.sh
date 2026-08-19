#!/usr/bin/env bash
# Certko — safe production update for Hostinger VPS
# Preserves SQLite (manual blogs / CMS) and uploaded images across deploys.
#
# Usage (as root or the app user that owns /var/www/certko):
#   bash scripts/hostinger-safe-update.sh
#   APP_DIR=/var/www/certko REPO_BRANCH=main bash scripts/hostinger-safe-update.sh
set -euo pipefail

APP_NAME="${APP_NAME:-certko}"
APP_DIR="${APP_DIR:-/var/www/certko}"
REPO_BRANCH="${REPO_BRANCH:-main}"
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

bold "Certko safe update — preserve DB + uploads"
echo "App dir : $APP_DIR"
echo "Branch  : $REPO_BRANCH"
echo

mkdir -p "$BACKUP_ROOT/$STAMP"
cd "$APP_DIR"

# --- 1) Backup live content before touching code ---
green "1/5 Backing up database and uploads → $BACKUP_ROOT/$STAMP"
if [[ -f "$APP_DIR/data/certko.db" ]]; then
  cp -a "$APP_DIR/data/certko.db" "$BACKUP_ROOT/$STAMP/certko.db"
  # sql.js / WAL companions if present
  cp -a "$APP_DIR"/data/certko.db-* "$BACKUP_ROOT/$STAMP/" 2>/dev/null || true
else
  yellow "No data/certko.db yet — skipping DB backup."
fi

if [[ -d "$APP_DIR/public/uploads" ]]; then
  tar -czf "$BACKUP_ROOT/$STAMP/public-uploads.tar.gz" -C "$APP_DIR/public" uploads
fi
if [[ -d "$APP_DIR/data/uploads" ]]; then
  tar -czf "$BACKUP_ROOT/$STAMP/data-uploads.tar.gz" -C "$APP_DIR/data" uploads
fi
# Keep env (admin secret) out of git but back it up too
if [[ -f "$APP_DIR/.env" ]]; then
  cp -a "$APP_DIR/.env" "$BACKUP_ROOT/$STAMP/.env"
fi
if [[ -f "$APP_DIR/.env.production" ]]; then
  cp -a "$APP_DIR/.env.production" "$BACKUP_ROOT/$STAMP/.env.production"
fi

# --- 2) Pull new code without deleting runtime dirs ---
green "2/5 Pulling $REPO_BRANCH (never deletes data/ or uploads)"
# Refuse destructive cleanup patterns — manual blogs live in SQLite.
if [[ "${ALLOW_WIPE:-}" == "1" ]]; then
  yellow "ALLOW_WIPE=1 set — still will not delete data/ or uploads in this script."
fi
# Keep local runtime paths even if git clean is used elsewhere
git fetch origin "$REPO_BRANCH"
git checkout "$REPO_BRANCH"
# Never use git clean -fdx / reset --hard that would touch ignored uploads
git pull --ff-only origin "$REPO_BRANCH"

# Ensure runtime dirs exist and are not empty-wiped by deploy habits
mkdir -p "$APP_DIR/data" "$APP_DIR/public/uploads" "$APP_DIR/data/uploads"
touch "$APP_DIR/public/uploads/.gitkeep"

# Restore DB if a mistaken pull somehow removed it (should not happen — gitignored)
if [[ ! -f "$APP_DIR/data/certko.db" && -f "$BACKUP_ROOT/$STAMP/certko.db" ]]; then
  yellow "Restoring certko.db from backup taken this run."
  cp -a "$BACKUP_ROOT/$STAMP/certko.db" "$APP_DIR/data/certko.db"
fi
# Restore uploads if the tree lost them (git should never track/delete these)
if [[ ! -d "$APP_DIR/public/uploads" || -z "$(ls -A "$APP_DIR/public/uploads" 2>/dev/null | grep -v '^\.gitkeep$' || true)" ]]; then
  if [[ -f "$BACKUP_ROOT/$STAMP/public-uploads.tar.gz" ]]; then
    yellow "Restoring public/uploads from backup taken this run."
    tar -xzf "$BACKUP_ROOT/$STAMP/public-uploads.tar.gz" -C "$APP_DIR/public"
  fi
fi
if [[ -f "$BACKUP_ROOT/$STAMP/data-uploads.tar.gz" && ! -d "$APP_DIR/data/uploads" ]]; then
  yellow "Restoring data/uploads from backup taken this run."
  tar -xzf "$BACKUP_ROOT/$STAMP/data-uploads.tar.gz" -C "$APP_DIR/data"
fi

# --- 3) Never overwrite production secrets on update ---
green "3/5 Keeping existing .env / .env.production"
if [[ ! -f "$APP_DIR/.env" && -f "$BACKUP_ROOT/$STAMP/.env" ]]; then
  cp -a "$BACKUP_ROOT/$STAMP/.env" "$APP_DIR/.env"
fi

# --- 4) Build ---
green "4/5 Installing dependencies & building"
npm ci
npm run build

# --- 5) Restart process manager ---
green "5/5 Restarting PM2 app: $APP_NAME"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env || pm2 start npm --name "$APP_NAME" -- start
  pm2 save || true
else
  yellow "pm2 not found — start the app manually."
fi

echo
green "Update complete. Manual blogs, CMS edits, and uploads were preserved."
echo "Backup folder: $BACKUP_ROOT/$STAMP"
echo
yellow "Do NOT run: rm -rf $APP_DIR  (that wipes the database and uploads)"
echo "Safe update command next time:"
echo "  bash $APP_DIR/scripts/hostinger-safe-update.sh"
echo
