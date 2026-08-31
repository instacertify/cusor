export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Patches work under bare `next start` AND under server.cjs.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./lib/hostinger-runtime-patch.cjs").installHostingerRuntimePatches();
  } catch (err) {
    console.error("[certko] runtime patch install failed:", err);
  }

  // Warm CMS immediately — do not delay. getDb() will also wait if a request
  // wins the race; early warm still cuts first-byte latency.
  void (async () => {
    try {
      const { ensureDbReady } = await import("@/lib/db");
      await ensureDbReady();
    } catch (err) {
      console.error("[certko] early DB warm failed:", err);
    }
  })();

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
