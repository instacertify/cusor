import { createRequire } from "node:module";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Hostinger `next start` (and npm start) both need this: a new hPanel
  // upload SIGTERMs the previous process, and Next 16 then crashes with
  // "Error: Server is not running" from a double Server.close().
  createRequire(import.meta.url)("./lib/patch-http-server-close.cjs");

  // Do not touch SQLite / sql.js here — public pages already call
  // ensureDbReady() on the first request.
  const later = setTimeout(() => {
    void (async () => {
      try {
        const { assertDurableRuntimeConfig } = await import("@/lib/durable-runtime");
        assertDurableRuntimeConfig();
      } catch (err) {
        console.error("[certko] durable runtime warning (continuing):", err);
      }

      const { startBlogScheduler } = await import("@/lib/blog-scheduler");
      startBlogScheduler();

      const { refreshSitemapFiles } = await import("@/lib/sitemap-xml");
      void refreshSitemapFiles().catch((err) => {
        console.error("[certko] deferred sitemap refresh failed:", err);
      });
    })().catch((err) => {
      console.error("[certko] background boot failed:", err);
    });
  }, 45_000);
  later.unref?.();
}
