export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Hostinger's Node panel SIGTERMs the process if $PORT is not serving
  // ("Error: Server is not running"). Do not touch SQLite / sql.js here —
  // public pages already call ensureDbReady() on the first request.
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
