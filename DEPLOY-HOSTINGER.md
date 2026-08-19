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

The script installs **Node**, **PostgreSQL**, builds Certko, starts PM2, configures Nginx, and optionally SSL.

CMS data (blogs, pages, settings, admin password) lives in **PostgreSQL**.  
Uploaded images live on disk under `CERTKO_DATA_DIR/uploads`.

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

### Update site after new code (keeps blogs + uploads + password)

A new build must **not** reset earlier admin uploads, manually written blogs, or the admin password.

| Path | What it holds |
|------|----------------|
| PostgreSQL (`DATABASE_URL`) | Preferred CMS store (blogs, pages, settings, **admin password hash**) |
| SQLite (`CERTKO_DATA_DIR/certko.db`) | Automatic fallback when `DATABASE_URL` is unset (Hostinger Node panel) |
| `/var/lib/certko/uploads/` | Cover images & media |
| `/var/www/certko/` | Application code only (safe to `git pull`) |

Set once in `.env`:

```bash
DATABASE_URL=postgres://certko:PASSWORD@127.0.0.1:5432/certko
CERTKO_DATA_DIR=/var/lib/certko
CERTKO_SECRET=<keep-this-stable>
```

**Preferred (backs up first, then pulls + builds):**

```bash
bash /var/www/certko/scripts/hostinger-safe-update.sh
```

Do **not** drop the Postgres database — that deletes blogs and the admin password.  
Do **not** run `rm -rf /var/lib/certko` — that deletes uploaded images.  
Do **not** rotate `CERTKO_SECRET` on every deploy — that only invalidates sessions (password itself is in Postgres).

### Uploaded images on the public site

Admin uploads are served at **`/api/uploads/...`**. Keep Nginx proxying all traffic to Node. Do **not** add a static-only `location /uploads`.

Image storage limits:

- Max upload: **8 MB**
- Max stored after compression: **~1.5 MB**
- Max dimension: **1920px** (longest edge)

### Backup (important)

```bash
# Load DATABASE_URL from app env
set -a; source /var/www/certko/.env; set +a
pg_dump "$DATABASE_URL" --no-owner -f /root/certko-backup-$(date +%F).sql
tar -czf /root/uploads-backup-$(date +%F).tar.gz -C /var/lib/certko uploads
```

Local Docker Postgres (dev):

```bash
docker compose up -d db
export DATABASE_URL=postgres://certko:certko@127.0.0.1:5432/certko
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
2. Installs Node.js + PM2 + Nginx + **PostgreSQL**  
3. Clones/updates Certko  
4. Creates `DATABASE_URL` + a strong `CERTKO_SECRET` (once)  
5. Runs `npm ci` + `npm run build`  
6. Starts the app with PM2 (auto-restart on reboot)  
7. Configures Nginx reverse proxy  
8. Optional Let’s Encrypt HTTPS  

That’s the whole deploy.

---

## Hostinger Node.js Web Apps panel (not recommended)

The hPanel **Node.js** GitHub builder runs in an ephemeral `hbuilds` sandbox. That environment:

- often has **no durable disk** for uploads  
- usually has **no local PostgreSQL**  
- replaces the app tree on every deploy  

Prefer the **VPS one-click installer** above. If you must use the Node panel, the site **will boot without Postgres** (SQLite under `./data` or `CERTKO_DATA_DIR`). For data that survives deploys, still set:

| Variable | Recommended value |
|----------|----------------|
| `DATABASE_URL` | External/managed Postgres URL (not wiped by deploys) |
| `CERTKO_DATA_DIR` | Persistent writable path **outside** the build folder |
| `CERTKO_SECRET` | Stable secret — set once, never rotate on deploy |
| `COOKIE_SECURE` | `1` on HTTPS |

Leaving `CERTKO_SECRET` unset (or regenerating `.env` each deploy) is what made the admin password look “reset.” Missing `DATABASE_URL` no longer 500s the public site.

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Node.js | **20.x** or **22.x** |
| Root | `./` |
| Install | `npm install` (or `npm ci`) |
| Build | `npm run build` |
| Start | `npm start` (uses `$PORT` automatically) |
| Output directory | **leave empty** (do not set `out`) |

`next build` skips DB init. **Runtime** uses PostgreSQL when `DATABASE_URL` is set, otherwise SQLite so pages can serve.

If the browser shows **Application error** with a digest like `ERROR 1358233113`, open **Deployments → Logs**. Common causes:

1. A previous build that required `DATABASE_URL` at runtime (fixed — SQLite fallback)  
2. Wrong output directory (`out`) — clear it  
3. Uploads path ephemeral — set `CERTKO_DATA_DIR` outside the deploy folder  
