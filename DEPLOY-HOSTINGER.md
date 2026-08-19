# Certko on Hostinger — permanent vs Node panel

There are two Hostinger products. They are not interchangeable.

| Goal | Use this |
|------|----------|
| **Permanent** (blogs, password, leads, uploads survive forever) | **VPS (NVMe)** + PostgreSQL + `CERTKO_DATA_DIR=/var/lib/certko` — one-click script below |
| Temporary / already on Node.js Web Apps | Code now stores SQLite, secret, leads, and settings **outside** `hbuilds/versions/…` (usually `hbuilds/data/`). Still set `CERTKO_SECRET` once in hPanel. This is **durable across deploys**, not a substitute for Postgres if Hostinger wipes the whole `hbuilds` tree. |

Do **not** rotate `CERTKO_SECRET`. Do **not** delete `hbuilds/data` or `/var/lib/certko`.

---

# Hostinger NVMe — one-click install (permanent)

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

## Hostinger Node.js Web Apps panel (workaround, not VPS)

The hPanel **Node.js** GitHub builder (`hbuilds`) replaces `versions/<uuid>/nodejs/` on every deploy and typically **keeps only about three version folders**. If the hashed login lived only inside an old `versions/<uuid>/nodejs/data` tree, the next deploy deletes that folder and the site falls back to seed `admin` / `certko-admin`.

Certko now:

1. Writes SQLite, uploads, `.certko-secret`, lead archive, settings snapshot, and **`.certko-admin.json`** (hashed login + login id) to **`hbuilds/data/`** and other persist dirs outside `versions/`
2. Recovers those files from older version folders, **preferring a bcrypt login over seed defaults** (a newer folder with `admin` / `certko-admin` cannot overwrite a real password)
3. Re-inserts contact leads from `inquiries.jsonl` if SQLite is empty
4. Restores admin password / SMTP / site settings from `settings-archive.json` if SQLite was re-seeded; **does not snapshot seed defaults over a hashed archive**
5. Signs admin cookies with the disk secret so a missing hPanel env var does **not** look like a password reset
6. Does **not** check admin auth in Edge middleware (Edge cannot read the disk secret)

If login already reset to `admin` / `certko-admin`, set a new password once after this deploy. The hashed file is then kept outside version folders.

Set these **once** in hPanel → Environment. Never rotate them:

| Variable | Recommended value |
|----------|----------------|
| `CERTKO_SECRET` | `openssl rand -hex 32` — paste once, leave forever (optional if disk secret already exists) |
| `COOKIE_SECURE` | `1` on HTTPS |
| `DATABASE_URL` | External/managed Postgres URL if you have one (best Node-panel option) |
| `CERTKO_DATA_DIR` | Optional override; default auto-detects `hbuilds/data` |

SMTP is optional. Leads still save without it. Configure Admin → Email / SMTP so notify mail works.

Leaving `CERTKO_SECRET` unset used to regenerate a weak in-memory secret every process start (admin looked “reset”). The disk secret file fixes that **as long as `hbuilds/data` is not deleted**.

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Node.js | **20.x** or **22.x** |
| Root | `./` |
| Install | `npm install` (or `npm ci`) |
| Build | `npm run build` |
| Start | `npm start` (binds `$PORT` immediately via `server.cjs`) |
| Output directory | **leave empty** (do not set `out`) |

`next build` skips DB init. **Runtime** uses PostgreSQL when `DATABASE_URL` is set, otherwise SQLite so pages can serve.

If the browser shows **Application error** with a digest like `ERROR 1358233113`, open **Deployments → Logs**. Common causes:

1. A previous build that required `DATABASE_URL` at runtime (fixed — SQLite fallback)  
2. Wrong output directory (`out`) — clear it  
3. Uploads path ephemeral — data now prefers `hbuilds/data`; do not delete that folder  
4. Duplicate Next processes on `:3000` / logs show **`Ready in 0ms` twice**, then **`Error: Server is not running`**, then `[certko] DATABASE_URL is not set` — that is a **new-build upload restart**, not a captcha bug. Hostinger SIGTERMs the old `next start` while the new process boots. Restart the Node app **once**. Start command must be **`npm start`** (not `next start`). Do not set output directory `out`.
5. After login the browser goes to **`https://0.0.0.0:3000/...`** (`ERR_ADDRESS_INVALID`) — that was Next using the bind address in the `Location` header. Current `npm start` rewrites those to a same-site path (`/admin/login?...`). Redeploy this code; keep Start = `npm start`.
6. Logs show **`Cookies can only be modified in a Server Action or Route Handler`** and `/admin/login` (or the whole site) spins on “Loading…” — a previous build set the captcha cookie during page render. Current code only sets cookies from `/api/admin/login`, `/api/admin/logout`, and `/api/admin/captcha`. Redeploy this code.
