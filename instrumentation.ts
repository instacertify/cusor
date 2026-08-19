export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertDurableRuntimeConfig } = await import("@/lib/durable-runtime");
    try {
      assertDurableRuntimeConfig();
    } catch (err) {
      // Never take the public site down for a durability warning.
      console.error("[certko] durable runtime warning (continuing):", err);
    }

    // Do not await CMS bootstrap here — Hostinger's Node panel health checks
    // expect the HTTP port to open quickly (~10s). Blocking instrumentation on
    // ensureDbReady() delayed port bind → SIGTERM → "Server is not running".
    // Pages already call ensureDbReady() before reading the DB.
    void (async () => {
      const { ensureDbReady } = await import("@/lib/db");
      await ensureDbReady();

      // Delay heavy post-boot work so the first requests stay responsive.
      const { refreshSitemapFiles } = await import("@/lib/sitemap-xml");
      const sitemapTimer = setTimeout(() => {
        void refreshSitemapFiles().catch((err) => {
          console.error("[certko] deferred sitemap refresh failed:", err);
        });
      }, 60_000);
      sitemapTimer.unref?.();

      const { startBlogScheduler } = await import("@/lib/blog-scheduler");
      startBlogScheduler();
    })().catch((err) => {
      console.error("[certko] background boot failed:", err);
    });
  }
}
