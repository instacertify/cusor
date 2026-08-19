export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertDurableRuntimeConfig } = await import("@/lib/durable-runtime");
    try {
      assertDurableRuntimeConfig();
    } catch (err) {
      // Never take the public site down for a durability warning.
      console.error("[certko] durable runtime warning (continuing):", err);
    }
    const { ensureDbReady } = await import("@/lib/db");
    await ensureDbReady();

    // Delay heavy post-boot work so Hostinger health checks can reach a live
    // Node process. Immediate full sitemap rebuild after first-boot seed was
    // allocating a huge URL list + rewriting public/sitemap.xml while the
    // supervisor still expected a responsive upstream (→ SIGTERM → nginx 504).
    const { refreshSitemapFiles } = await import("@/lib/sitemap-xml");
    const sitemapTimer = setTimeout(() => {
      void refreshSitemapFiles().catch((err) => {
        console.error("[certko] deferred sitemap refresh failed:", err);
      });
    }, 60_000);
    sitemapTimer.unref?.();

    // Auto-publish blog posts whose scheduled time has arrived.
    const { startBlogScheduler } = await import("@/lib/blog-scheduler");
    startBlogScheduler();
  }
}
