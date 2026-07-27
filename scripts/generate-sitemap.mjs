/**
 * Ensures public/sitemap.xml exists for deploy.
 * Full regeneration happens at runtime via instrumentation.ts (Next can load the DB).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "sitemap.xml");

if (fs.existsSync(out) && fs.readFileSync(out, "utf8").includes("<urlset")) {
  const n = fs.statSync(out).size;
  console.log(`[sitemap] public/sitemap.xml present (${n} bytes)`);
  process.exit(0);
}

const minimal =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `<url><loc>https://certko.com</loc></url>\n` +
  `<url><loc>https://certko.com/products</loc></url>\n` +
  `<url><loc>https://certko.com/certifications</loc></url>\n` +
  `<url><loc>https://certko.com/testing</loc></url>\n` +
  `<url><loc>https://certko.com/contact</loc></url>\n` +
  `<url><loc>https://certko.com/sitemap</loc></url>\n` +
  `</urlset>\n`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, minimal, "utf8");
console.log("[sitemap] wrote minimal public/sitemap.xml");
