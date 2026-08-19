# Certko

BIS / product certification website with a full CMS admin backend.

**Repo:** https://github.com/instacertify/cusor  
**Stack:** Next.js 16 · React 19 · **PostgreSQL** · Tailwind · disk uploads  
**Requires:** Node.js **18+**. PostgreSQL **14+** is preferred in production; without `DATABASE_URL` the app falls back to SQLite so pages still serve.

---

## Local development

```bash
# Start Postgres (Docker)
docker compose up -d db
export DATABASE_URL=postgres://certko:certko@127.0.0.1:5432/certko
export CERTKO_DATA_DIR=./data
export CERTKO_SECRET=dev-secret

npm ci
npm run dev
```

Open http://localhost:3000

### Admin

- URL: http://localhost:3000/admin/login  
- Login ID: `admin`  
- Password: `certko-admin`  
- Captcha: type the **number** answer  

Change credentials after first login: **Admin → Login & password**

---

## Production (Hostinger NVMe VPS — recommended)

Use a **VPS with SSH**, not shared hosting and not the Node.js Web Apps panel alone.
The VPS keeps PostgreSQL + `/var/lib/certko/uploads` outside the git tree so restarts and deploys cannot wipe the admin password, blogs, or images.

One-click guide: **[DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md)**

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://raw.githubusercontent.com/instacertify/cusor/main/scripts/hostinger-one-click.sh -o install.sh
bash install.sh
```

---

## What must never change on restart / deploy

| Item | Where it lives | Rule |
|------|----------------|------|
| Admin password hash | Postgres `settings.admin_password`, or SQLite if `DATABASE_URL` is unset | Keep the same DB / data dir |
| Blogs / pages / CMS | PostgreSQL or SQLite fallback | Never drop the database |
| Uploaded images | `CERTKO_DATA_DIR/uploads` | Keep `/var/lib/certko` |
| Login sessions | Signed with `CERTKO_SECRET` | Never regenerate `.env` |

```bash
DATABASE_URL=postgres://certko:PASSWORD@127.0.0.1:5432/certko
CERTKO_DATA_DIR=/var/lib/certko
CERTKO_SECRET=<stable-random-hex>
```

---

## Important paths

| Path | Purpose |
|------|---------|
| PostgreSQL (`DATABASE_URL`) | CMS database (blogs, settings, password) |
| `/var/lib/certko/uploads/` | Admin-uploaded media |
| `scripts/hostinger-one-click.sh` | VPS installer (Postgres + PM2 + Nginx) |
| `ecosystem.config.cjs` | PM2 loads `.env` on every restart |
| `.env` | `DATABASE_URL`, `CERTKO_SECRET`, `CERTKO_DATA_DIR` |

---

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm start        # production server (port 3000)
```
