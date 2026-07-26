# Dummy’s Guide: Deploy Certko on Hostinger NVMe VPS

This guide is for **Hostinger VPS (NVMe)** — the kind with **SSH / root access**.

> **Do not use** normal Hostinger shared hosting / “Website” plans for this project.  
> Certko needs a real Node.js server + disk for SQLite (`data/certko.db`) and uploads.

Time needed: about **45–90 minutes** the first time.

---

## What you need before starting

1. A **Hostinger VPS NVMe** plan (KVM VPS)
2. Your **domain** (e.g. `certko.com`) — can be on Hostinger or elsewhere
3. Your project on **GitHub** (this repo: `instacertify/cusor`)
4. A computer with:
   - **Mac / Linux:** Terminal  
   - **Windows:** PowerShell or [PuTTY](https://www.putty.org/)

Write these down when Hostinger shows them:

| Item | Example | Your value |
|------|---------|------------|
| VPS IP | `123.45.67.89` | ________ |
| Root password | (from email / hPanel) | ________ |
| Domain | `certko.com` | ________ |

---

## STEP 0 — Buy / open the VPS (hPanel)

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Go to **VPS** → your server → **Manage**
3. When creating the VPS (or rebuilding):
   - **OS:** Ubuntu **22.04** or **24.04** LTS  
   - Set a **strong root password** (save it in a password manager)
4. On **Overview**, copy the **IP address**

Optional but nice: use Hostinger’s **MERN / Node** template if offered — you can still follow this guide.

---

## STEP 1 — Point your domain to the VPS

In DNS (Hostinger Domains **or** wherever the domain is managed):

Create / edit these records:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| **A** | `@` | `YOUR_VPS_IP` | 300 or Auto |
| **A** | `www` | `YOUR_VPS_IP` | 300 or Auto |

Wait 5–30 minutes (sometimes up to a few hours).

Check later with:

```bash
ping certko.com
```

You should see your VPS IP.

---

## STEP 2 — Connect with SSH

### Mac / Linux / Windows PowerShell

```bash
ssh root@YOUR_VPS_IP
```

- Type `yes` if asked about fingerprint  
- Paste the root password (nothing shows while typing — that is normal)  
- Press Enter  

You should see a prompt like `root@srvXXXXX:~#`

---

## STEP 3 — Update the server

Copy–paste **one block at a time**:

```bash
apt update && apt upgrade -y
```

```bash
apt install -y git curl build-essential ufw nginx
```

(`build-essential` is needed so `better-sqlite3` can compile.)

---

## STEP 4 — Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

You want Node **v20.x** (or newer LTS).

Install PM2 (keeps the site running after reboot):

```bash
npm install -g pm2
```

---

## STEP 5 — Get the Certko code on the server

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/instacertify/cusor.git certko
cd /var/www/certko
```

Use your real branch if needed:

```bash
git checkout main
# or: git checkout cursor/certko-website-cms-2bc7
```

If the repo is **private**, create a GitHub Personal Access Token and clone with:

```bash
git clone https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/instacertify/cusor.git certko
```

---

## STEP 6 — Create the secret env file

```bash
cd /var/www/certko
nano .env.production
```

Paste this (change the secret!):

```bash
NODE_ENV=production
PORT=3000
CERTKO_SECRET=REPLACE_WITH_A_LONG_RANDOM_STRING_32_CHARS_MIN
COOKIE_SECURE=1
```

How to make a random secret on the server:

```bash
openssl rand -hex 32
```

Copy the output into `CERTKO_SECRET=...`

Save in nano: `Ctrl+O` → Enter → `Ctrl+X`

---

## STEP 7 — Install packages and build

```bash
cd /var/www/certko
npm ci
npm run build
```

First build can take a few minutes.  
If `better-sqlite3` fails, make sure Step 3 installed `build-essential`, then:

```bash
npm rebuild better-sqlite3
npm run build
```

---

## STEP 8 — Start Certko with PM2

```bash
cd /var/www/certko
pm2 start npm --name certko -- start
pm2 save
pm2 startup
```

PM2 will print a command starting with `sudo env PATH=...` — **copy and run that exact command**, then:

```bash
pm2 save
```

Useful checks:

```bash
pm2 status
pm2 logs certko --lines 50
curl -I http://127.0.0.1:3000
```

You want HTTP `200` or `307` from curl, not “connection refused”.

---

## STEP 9 — Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## STEP 10 — Nginx reverse proxy (domain → app)

```bash
nano /etc/nginx/sites-available/certko
```

Paste (**change the domain**):

```nginx
server {
    listen 80;
    server_name certko.com www.certko.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
ln -sf /etc/nginx/sites-available/certko /etc/nginx/sites-enabled/certko
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Open in browser: `http://certko.com`  
If DNS is ready, the site should load.

---

## STEP 11 — Free HTTPS (SSL)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d certko.com -d www.certko.com
```

- Enter email  
- Agree to terms  
- Choose redirect HTTP → HTTPS (**yes**)

Then open: `https://certko.com`

---

## STEP 12 — First admin login (important)

1. Go to `https://your-domain.com/admin/login`
2. Default credentials:
   - **Login ID:** `admin`
   - **Password:** `certko-admin`
   - Solve the **math captcha** (type the number answer)
3. Immediately go to **Admin → Login & password** and change both login ID and password
4. Confirm twice when asked

Also set SMTP under **Admin → Email / SMTP** if you want inquiry emails.

---

## STEP 13 — What you must never delete

These live on the VPS disk and hold your real content:

| Path | What it is |
|------|------------|
| `/var/www/certko/data/certko.db` | Database (pages, products, blogs, settings) |
| `/var/www/certko/public/uploads/` | Images / videos you upload in admin |

### Simple backup (run anytime)

```bash
mkdir -p /root/certko-backups
cp /var/www/certko/data/certko.db /root/certko-backups/certko-$(date +%F).db
tar -czf /root/certko-backups/uploads-$(date +%F).tar.gz -C /var/www/certko/public uploads
ls -lah /root/certko-backups
```

Download backups to your PC occasionally (Hostinger file manager / `scp`).

---

## How to update the site later (after code changes)

```bash
cd /var/www/certko
git pull
npm ci
npm run build
pm2 restart certko
```

Your database and uploads stay (they are not in git).

---

## If something breaks — quick fixes

### Site down

```bash
pm2 status
pm2 restart certko
pm2 logs certko --lines 100
```

### Nginx error

```bash
nginx -t
systemctl status nginx
tail -50 /var/log/nginx/error.log
```

### Rebuild native SQLite module after Node upgrade

```bash
cd /var/www/certko
npm rebuild better-sqlite3
pm2 restart certko
```

### Forgot admin password

SSH in, then reset via SQLite only if you know what you are doing — easier: from a working local DB, or ask a developer. Best prevention: change password after first login and store it safely.

---

## One-page checklist

- [ ] Hostinger **VPS NVMe** created (Ubuntu)
- [ ] Domain **A records** → VPS IP
- [ ] SSH works as `root`
- [ ] Node 20 + PM2 installed
- [ ] Repo cloned to `/var/www/certko`
- [ ] `.env.production` with strong `CERTKO_SECRET`
- [ ] `npm ci` + `npm run build` OK
- [ ] `pm2 start` + `pm2 startup` OK
- [ ] Nginx proxy OK
- [ ] Certbot HTTPS OK
- [ ] Admin login works; password changed
- [ ] Backup folder created

---

## Mental picture

```
Internet → HTTPS (Nginx) → http://127.0.0.1:3000 (Next.js / PM2)
                              ├─ data/certko.db   (SQLite)
                              └─ public/uploads/  (media)
```

You are done when `https://your-domain.com` loads and `/admin/login` lets you in.
