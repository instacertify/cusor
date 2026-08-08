<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Blog seeding rules

When adding new blog posts via code/seed:

- **Never edit or change cover images on older blogs.** Existing `posts.image` values are owned by humans after they log into `/admin/blog` and upload covers.
- Prefer seeding new posts with an empty `image` (`''`). Covers are set later in the admin backend.
- Default helper: `insertBlogPostsIfMissing` — insert-if-missing by slug only (no updates).
- When intentionally **revising** seeded article copy, use `upsertBlogPostCopyPreservingImage` — it may refresh title/excerpt/content/meta but **must never update `image`**.
