# Certko

Certko is a BIS / product-certification checker website for **certko.com**, modeled on the structure of
bischeck.in but with an original "buttery" brand and a full content-editing backend (CMS).

## Stack
- **Node.js + Express** (server-rendered **EJS** views, no build step)
- **better-sqlite3** for data + sessions (file DB in `data/`, created & seeded automatically on first run)
- Plain CSS design system in `public/css/`

## Run
- Install: `npm install`
- Dev (auto-reload): `npm run dev` — serves http://localhost:3000
- Prod-style start: `npm start`
- Re-seed (only fills empty tables): `npm run seed`

## Admin / content backend
- URL: `/admin` (login at `/admin/login`)
- Default credentials: `admin` / `certko123` (override with `ADMIN_USER` / `ADMIN_PASS` **before first run**, since the admin row is only created when the `admins` table is empty).
- The admin panel edits every field on the site: site settings, products (with HTML write-ups + image upload), categories, FAQs, testimonials, content pages, and captured leads.

## Cursor Cloud specific instructions
- Start the app with `npm start` (or `npm run dev`). It listens on port 3000.
- The SQLite DB at `data/certko.db` is **git-ignored** and auto-created + auto-seeded on first launch (`server.js` runs `src/seed.js`). To reset all content, stop the server and delete `data/certko.db*`, then restart.
- Seeding is idempotent per-table: it only inserts when a table is empty, so editing content via `/admin` will not be overwritten on restart. Changing seed data in `src/seed.js` will NOT update already-seeded rows — reset the DB to re-seed.
- Admin credentials are seeded once. If you need to change them after the DB exists, delete the DB (above) or update the `admins` row directly.
- Uploaded images go to `public/uploads/` (git-ignored). Brand/seed images live in `public/images/` and are committed.
- No external services or network access are required to run or test.
