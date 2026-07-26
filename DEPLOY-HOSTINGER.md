# Hostinger NVMe — one-click install (simple)

Certko needs a **Hostinger VPS (NVMe)** with SSH — not shared hosting.

---

## Before you start (2 minutes)

1. In Hostinger hPanel → **VPS** → create/open server → **Ubuntu 22.04 or 24.04**
2. Copy the **VPS IP** and **root password**
3. Point DNS to the VPS:

| Type | Name | Value |
|------|------|--------|
| A | `@` | your VPS IP |
| A | `www` | your VPS IP |

Wait a few minutes for DNS.

---

## One-click install (copy & paste)

### 1) Login to the VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2) Run the installer

**Option A — from GitHub (easiest):**

```bash
curl -fsSL https://raw.githubusercontent.com/instacertify/cusor/main/scripts/hostinger-one-click.sh -o install.sh
bash install.sh
```

If `main` does not have the script yet, use your deploy branch:

```bash
curl -fsSL https://raw.githubusercontent.com/instacertify/cusor/cursor/certko-website-cms-2bc7/scripts/hostinger-one-click.sh -o install.sh
bash install.sh
```

**Option B — clone first:**

```bash
git clone https://github.com/instacertify/cusor.git /var/www/certko
cd /var/www/certko
bash scripts/hostinger-one-click.sh
```

### 3) Answer 3 questions

1. **Domain** — e.g. `certko.com` (or leave blank)
2. **Branch** — press Enter for `main` (or type your branch)
3. **SSL** — type `y` for free HTTPS (only if DNS already points to this VPS)

The script installs Node, builds Certko, starts PM2, configures Nginx, and optionally SSL.  
SQLite uses **sql.js** (`sql-asm.js` — pure JS, no Python / `node-gyp` / native modules / `.wasm`).

---

## Login to admin

Open:

`https://YOUR_DOMAIN/admin/login`

| Field | Value |
|-------|--------|
| Login ID | `admin` |
| Password | `certko-admin` |
| Captcha | type the **number** answer |

Then go to **Admin → Login & password** and change them.

---

## Useful commands

```bash
pm2 status
pm2 logs certko
pm2 restart certko
```

### Update site after new code

```bash
cd /var/www/certko
git pull
npm ci
npm run build
pm2 restart certko
```

### Backup (important)

```bash
cp /var/www/certko/data/certko.db /root/certko-backup-$(date +%F).db
tar -czf /root/uploads-backup-$(date +%F).tar.gz -C /var/www/certko/public uploads
```

---

## If SSL failed the first time

DNS was probably not ready. After DNS works:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## What the one-click script does for you

1. Updates Ubuntu  
2. Installs Node.js + PM2 + Nginx  
3. Clones/updates Certko  
4. Creates a strong `CERTKO_SECRET`  
5. Runs `npm ci` + `npm run build`  
6. Starts the app with PM2 (auto-restart on reboot)  
7. Configures Nginx reverse proxy  
8. Optional Let’s Encrypt HTTPS  

That’s the whole deploy.

---

## Hostinger Node.js Web Apps panel (optional)

If you deploy from hPanel **Node.js** (GitHub build) instead of VPS SSH:

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Node.js | **20.x** or **22.x** |
| Root | `./` |
| Install | `npm install` (or `npm ci`) |
| Build | `npm run build` |
| Start | `npm start` (uses `$PORT` automatically) |
| Output directory | **leave empty** (do not set `out`) |

Environment variables:

- `CERTKO_SECRET` — long random string  
- `COOKIE_SECURE=1` — when the site is on HTTPS  

If the browser shows **Application error** with a digest like `ERROR 1358233113`, open **Deployments → Logs** (runtime/server logs). The real message is there (digest alone is not enough). Common causes:

1. Old deploy still on `better-sqlite3` / Python — redeploy latest `main`  
2. Wrong output directory (`out`) — clear it  
3. App can’t write `data/` — latest code falls back to `/tmp/certko-data`
