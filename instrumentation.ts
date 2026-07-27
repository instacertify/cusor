export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDbReady } = await import("@/lib/db");
    await ensureDbReady();
    // Keep a static public/sitemap.xml on disk so Google/LiteSpeed can fetch
    // it with Content-Length (avoids GSC "General HTTP error").
    const { refreshSitemapFiles } = await import("@/lib/sitemap-xml");
    void refreshSitemapFiles();
  }
}
