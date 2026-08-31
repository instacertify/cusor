export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Hostinger's Node panel SIGTERMs the process if $PORT is not serving
  // ("Error: Server is not running"). Never block the listen path on SQLite
  // bootstrap — warm the DB in the background as soon as Node is up so the
  // first real page/metadata request does not race "Database not ready yet".
  const warmSoon = setTimeout(() => {
    void (async () => {
      try {
        const { ensureDbReady } = await import("@/lib/db");
        await ensureDbReady();
      } catch (err) {
        console.error("[certko] early DB warm failed:", err);
      }
    })();
  }, 250);
  warmSoon.unref?.();

  // Heavier boot work after the process has been accepting traffic for a bit.
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
