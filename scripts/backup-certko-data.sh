#!/usr/bin/env bash
# Backup Certko durable CMS data before a Hostinger deploy / build update.
# Does NOT touch application code. Safe to run anytime.
#
# Usage:
#   bash scripts/backup-certko-data.sh
#   CERTKO_DATA_DIR=/path/to/hbuilds/data bash scripts/backup-certko-data.sh
#
set -euo pipefail

guess_data_dir() {
  if [[ -n "${CERTKO_DATA_DIR:-}" && -d "$CERTKO_DATA_DIR" ]]; then
    echo "$CERTKO_DATA_DIR"
    return
  fi
  if [[ -d /var/lib/certko ]]; then
    echo /var/lib/certko
    return
  fi
  # Hostinger Node panel: …/hbuilds/versions/<uuid>/nodejs → …/hbuilds/data
  local cwd
  cwd="$(pwd -P)"
  if [[ "$cwd" == *"/hbuilds/versions/"* ]]; then
    local candidate
    candidate="$(cd "$cwd/../../../data" 2>/dev/null && pwd -P || true)"
    if [[ -n "$candidate" && -d "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  fi
  if [[ -d ./data ]]; then
    echo "$(pwd -P)/data"
    return
  fi
  echo ""
}

DATA_DIR="$(guess_data_dir)"
if [[ -z "$DATA_DIR" || ! -d "$DATA_DIR" ]]; then
  echo "ERROR: Could not find CERTKO_DATA_DIR. Set it and re-run." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${CERTKO_BACKUP_DIR:-$HOME/certko-backups}"
mkdir -p "$OUT_DIR"
ARCHIVE="$OUT_DIR/certko-data-$STAMP.tar.gz"

echo "Backing up durable CMS data from: $DATA_DIR"
tar -czf "$ARCHIVE" \
  -C "$(dirname "$DATA_DIR")" \
  "$(basename "$DATA_DIR")"

echo "Wrote $ARCHIVE ($(du -h "$ARCHIVE" | awk '{print $1}'))"
echo "Keep this archive before deploying. Do NOT delete $DATA_DIR after deploy."
