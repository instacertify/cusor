export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Return immediately so Next.js can bind $PORT. Hostinger kills the process
  // if the HTTP server is not listening within ~1–2s ("Server is not running").
  setTimeout(() => {
    void (async () => {
      const { assertDurableRuntimeConfig } = await import("@/lib/durable-runtime");
      try {
        assertDurableRuntimeConfig();
      } catch (err) {
        console.error("[certko] durable runtime warning (continuing):", err);
      }

      const { ensureDbReady } = await import("@/lib/db");
      await ensureDbReady();

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
  }, 0);
}
