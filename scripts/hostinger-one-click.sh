#!/usr/bin/env bash
# Certko — one-command install for Hostinger NVMe VPS (Ubuntu)
# Usage (as root):
#   curl -fsSL https://raw.githubusercontent.com/instacertify/cusor/main/scripts/hostinger-one-click.sh | bash
# Or after cloning:
#   sudo bash scripts/hostinger-one-click.sh
set -euo pipefail

APP_NAME="certko"
APP_DIR="/var/www/certko"
REPO_URL="${REPO_URL:-https://github.com/instacertify/cusor.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
APP_PORT="${APP_PORT:-3000}"
NODE_MAJOR="${NODE_MAJOR:-20}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
bold() { printf '\033[1m%s\033[0m\n' "$*"; }

if [[ "$(id -u)" -ne 0 ]]; then
  red "Run this script as root (or with sudo)."
  exit 1
fi

if ! grep -qi ubuntu /etc/os-release 2>/dev/null; then
  yellow "This script is built for Ubuntu on Hostinger VPS. Continuing anyway…"
fi

echo
bold "========================================"
bold "  Certko one-click install (Hostinger)"
bold "========================================"
echo
yellow "Default admin after install:"
echo "  Login ID : admin"
echo "  Password : certko-admin"
echo "  URL      : https://YOUR_DOMAIN/admin/login"
echo

read -r -p "Your domain (e.g. certko.com) — leave blank to skip SSL for now: " DOMAIN
DOMAIN="$(echo "${DOMAIN:-}" | tr '[:upper:]' '[:lower:]' | xargs || true)"
WWW_DOMAIN=""
if [[ -n "$DOMAIN" ]]; then
  WWW_DOMAIN="www.$DOMAIN"
fi

read -r -p "Git branch to deploy [${REPO_BRANCH}]: " BRANCH_IN
REPO_BRANCH="${BRANCH_IN:-$REPO_BRANCH}"

read -r -p "Install free HTTPS with Let's Encrypt now? (y/N): " WANT_SSL
WANT_SSL="$(echo "${WANT_SSL:-n}" | tr '[:upper:]' '[:lower:]')"

echo
green "1/8 Updating system packages…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ca-certificates build-essential ufw nginx openssl

echo
green "2/8 Installing Node.js ${NODE_MAJOR}…"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//;s/\..*//')" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
npm install -g pm2
node -v
npm -v

echo
green "3/8 Getting Certko code…"
mkdir -p /var/www
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch --all --prune
  git checkout "$REPO_BRANCH"
  git pull origin "$REPO_BRANCH" || git pull
else
  rm -rf "$APP_DIR"
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo
green "4/8 Writing .env.production…"
SECRET="$(openssl rand -hex 32)"
cat > "$APP_DIR/.env.production" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
CERTKO_SECRET=${SECRET}
COOKIE_SECURE=1
EOF
# Also expose for the running process
cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
CERTKO_SECRET=${SECRET}
COOKIE_SECURE=1
EOF

echo
green "5/8 Installing dependencies & building…"
cd "$APP_DIR"
npm ci
npm run build

echo
green "6/8 Starting with PM2…"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
cd "$APP_DIR"
pm2 start npm --name "$APP_NAME" -- start
pm2 save
# Configure startup without interactive prompt when possible
STARTUP_CMD="$(pm2 startup systemd -u root --hp /root | tail -n 1 || true)"
if [[ "$STARTUP_CMD" == sudo* ]]; then
  eval "$STARTUP_CMD" || true
fi
pm2 save

echo
green "7/8 Configuring Nginx…"
if [[ -n "$DOMAIN" ]]; then
  SERVER_NAMES="$DOMAIN $WWW_DOMAIN"
else
  SERVER_NAMES="_"
fi

cat > /etc/nginx/sites-available/certko <<EOF
server {
    listen 80;
    server_name ${SERVER_NAMES};

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/certko /etc/nginx/sites-enabled/certko
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

echo
green "8/8 HTTPS (optional)…"
if [[ "$WANT_SSL" == "y" || "$WANT_SSL" == "yes" ]]; then
  if [[ -z "$DOMAIN" ]]; then
    red "SSL skipped — no domain entered."
  else
    apt-get install -y certbot python3-certbot-nginx
    # Non-interactive certbot; fails safely if DNS is not ready yet
    if certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
      green "SSL installed for $DOMAIN"
    else
      yellow "SSL failed (DNS may not point here yet)."
      yellow "Later run:"
      yellow "  certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
    fi
  fi
else
  yellow "SSL skipped. When DNS is ready:"
  if [[ -n "$DOMAIN" ]]; then
    yellow "  certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
  else
    yellow "  certbot --nginx -d yourdomain.com -d www.yourdomain.com"
  fi
fi

# Quick health check
sleep 2
if curl -fsS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${APP_PORT}" | grep -Eq '200|307|308|404'; then
  green "App is responding on port ${APP_PORT}."
else
  yellow "App may still be starting — check: pm2 logs certko"
fi

IP="$(curl -fsS ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"

echo
bold "========================================"
bold "  DONE — Certko is installed"
bold "========================================"
echo
echo "Open site:"
if [[ -n "$DOMAIN" ]]; then
  echo "  http://$DOMAIN"
  echo "  https://$DOMAIN   (if SSL worked)"
else
  echo "  http://$IP"
fi
echo
echo "Admin login:"
if [[ -n "$DOMAIN" ]]; then
  echo "  https://$DOMAIN/admin/login"
else
  echo "  http://$IP/admin/login"
fi
echo "  Login ID : admin"
echo "  Password : certko-admin"
echo
yellow "IMPORTANT: Change login ID/password under Admin → Login & password"
echo
echo "Useful commands:"
echo "  pm2 status"
echo "  pm2 logs certko"
echo "  pm2 restart certko"
echo
echo "Update later:"
echo "  cd $APP_DIR && git pull && npm ci && npm run build && pm2 restart certko"
echo
green "Backup these folders regularly:"
echo "  $APP_DIR/data/certko.db"
echo "  $APP_DIR/public/uploads/"
echo
