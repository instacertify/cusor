# Certko

BIS / product certification website with a full CMS admin backend.

**Repo:** https://github.com/instacertify/cusor  
**Stack:** Next.js 16 · React 19 · SQLite (Node 22 built-in `node:sqlite`) · Tailwind  
**Requires:** Node.js **22+** (no native SQLite compile / Python needed for deploy)

---

## Local development

```bash
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

## Production (Hostinger NVMe VPS)

One-click guide: **[DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md)**

```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://raw.githubusercontent.com/instacertify/cusor/main/scripts/hostinger-one-click.sh -o install.sh
bash install.sh
```

Requires a Hostinger **VPS** (not shared hosting) so SQLite + uploads can persist.

---

## Important paths

| Path | Purpose |
|------|---------|
| `data/certko.db` | CMS database (created on first run) |
| `public/uploads/` | Admin-uploaded media |
| `scripts/hostinger-one-click.sh` | VPS installer |
| `.env.production` | `CERTKO_SECRET`, `COOKIE_SECURE=1` |

---

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm start        # production server (port 3000)
```
