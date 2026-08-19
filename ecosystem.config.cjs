/**
 * PM2 ecosystem for Hostinger VPS.
 * Loads .env so DATABASE_URL / CERTKO_SECRET / CERTKO_DATA_DIR survive restarts.
 *
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const root = __dirname;
const env = {
  ...loadEnvFile(path.join(root, ".env.production")),
  ...loadEnvFile(path.join(root, ".env")),
  NODE_ENV: "production",
};

module.exports = {
  apps: [
    {
      name: "certko",
      cwd: root,
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "5s",
      env,
    },
  ],
};
