# Certko

A BIS / product-certification checker website for **certko.com** — inspired by the structure of
[bischeck.in](https://bischeck.in) but with an original "buttery" brand (warm amber + deep navy) and a
full content-editing **admin backend**.

## Features
- **Instant checker** — search a product name or HSN code to see if BIS certification is required, the scheme, estimated cost and timeline.
- **Products** — browsable, filterable catalog with per-product write-ups and imagery.
- **Categories** — products grouped by category, each with its own page and image.
- **Cost Calculator** — pick a product for an instant all-in cost estimate.
- **Guide & About** — editable long-form content pages.
- **FAQ** — grouped, accordion-style frequently asked questions.
- **Expert help / lead capture** — contact form and newsletter capture saved to the database.
- **Admin CMS** (`/admin`) — edit every field on the site: settings, products, categories, FAQs, testimonials, pages, and view leads. Supports image upload.

## Tech
- Node.js + Express + EJS (server-rendered, no build step)
- better-sqlite3 (data + sessions), auto-created and seeded on first run

## Quick start
```bash
npm install
npm run dev      # http://localhost:3000
```
Admin: visit `/admin` and log in with `admin` / `certko123` (change via `ADMIN_USER` / `ADMIN_PASS` before first run).

## Notes
- The database (`data/certko.db`) is created and seeded automatically; it is git-ignored.
- Seeding is idempotent per table — content edited in the admin panel is preserved across restarts.
- To reset all content, stop the server, delete `data/certko.db*`, and restart.

> Certko is an independent guidance concept and is not affiliated with the Bureau of Indian Standards.
