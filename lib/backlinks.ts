import type { SqliteDatabase } from "./sqlite";
import { getDb } from "./db";
import { ensureBacklinksCatalog as ensureSchema } from "./growth-schema";

export type BacklinkDirection = "inbound" | "outbound" | "internal";
export type BacklinkStatus = "active" | "pending" | "lost" | "outreach";

export interface Backlink {
  id: number;
  direction: BacklinkDirection;
  source_url: string;
  target_url: string;
  anchor_text: string;
  rel_nofollow: number;
  status: BacklinkStatus;
  notes: string;
  domain_rating: number | null;
  contact_email: string;
  created_at: string;
  checked_at: string | null;
}

export interface InternalLinkTarget {
  kind: "product" | "cert" | "post" | "page" | "testcat" | "category";
  id: string;
  title: string;
  path: string;
  suggested_anchors: string[];
}

export interface LinkOpportunity {
  target: InternalLinkTarget;
  inbound_from_posts: number;
  reason: string;
}

const VALID_DIRECTIONS = new Set(["inbound", "outbound", "internal"]);
const VALID_STATUSES = new Set(["active", "pending", "lost", "outreach"]);

export function ensureBacklinksCatalog(db: SqliteDatabase): void {
  ensureSchema(db);
}

export function listBacklinks(filter?: {
  direction?: string;
  status?: string;
  q?: string;
}): Backlink[] {
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  if (filter?.direction && VALID_DIRECTIONS.has(filter.direction)) {
    clauses.push("direction = @direction");
    params.direction = filter.direction;
  }
  if (filter?.status && VALID_STATUSES.has(filter.status)) {
    clauses.push("status = @status");
    params.status = filter.status;
  }
  if (filter?.q?.trim()) {
    clauses.push(
      `(source_url LIKE @q OR target_url LIKE @q OR anchor_text LIKE @q OR notes LIKE @q OR contact_email LIKE @q)`
    );
    params.q = `%${filter.q.trim()}%`;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(
      `SELECT * FROM backlinks ${where} ORDER BY datetime(created_at) DESC, id DESC`
    )
    .all(params) as Backlink[];
}

export function getBacklinkById(id: number): Backlink | undefined {
  return getDb().prepare("SELECT * FROM backlinks WHERE id = ?").get(id) as
    | Backlink
    | undefined;
}

export function getBacklinkStats(): {
  total: number;
  inbound: number;
  outbound: number;
  internal: number;
  active: number;
  pending: number;
  outreach: number;
  lost: number;
} {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS n FROM backlinks").get() as { n: number }).n;
  const byDir = db
    .prepare("SELECT direction, COUNT(*) AS n FROM backlinks GROUP BY direction")
    .all() as { direction: string; n: number }[];
  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS n FROM backlinks GROUP BY status")
    .all() as { status: string; n: number }[];
  const dirMap = Object.fromEntries(byDir.map((r) => [r.direction, r.n]));
  const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, r.n]));
  return {
    total,
    inbound: dirMap.inbound ?? 0,
    outbound: dirMap.outbound ?? 0,
    internal: dirMap.internal ?? 0,
    active: statusMap.active ?? 0,
    pending: statusMap.pending ?? 0,
    outreach: statusMap.outreach ?? 0,
    lost: statusMap.lost ?? 0,
  };
}

export function upsertBacklink(input: {
  id?: number;
  direction: string;
  source_url: string;
  target_url: string;
  anchor_text: string;
  rel_nofollow?: boolean;
  status: string;
  notes?: string;
  domain_rating?: number | null;
  contact_email?: string;
}): number {
  const direction = VALID_DIRECTIONS.has(input.direction)
    ? input.direction
    : "inbound";
  const status = VALID_STATUSES.has(input.status) ? input.status : "pending";
  const db = getDb();
  if (input.id) {
    db.prepare(
      `UPDATE backlinks SET
        direction=?, source_url=?, target_url=?, anchor_text=?, rel_nofollow=?,
        status=?, notes=?, domain_rating=?, contact_email=?, checked_at=datetime('now')
       WHERE id=?`
    ).run(
      direction,
      input.source_url.trim(),
      input.target_url.trim(),
      input.anchor_text.trim(),
      input.rel_nofollow ? 1 : 0,
      status,
      (input.notes ?? "").trim(),
      input.domain_rating ?? null,
      (input.contact_email ?? "").trim(),
      input.id
    );
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO backlinks
        (direction, source_url, target_url, anchor_text, rel_nofollow, status, notes, domain_rating, contact_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      direction,
      input.source_url.trim(),
      input.target_url.trim(),
      input.anchor_text.trim(),
      input.rel_nofollow ? 1 : 0,
      status,
      (input.notes ?? "").trim(),
      input.domain_rating ?? null,
      (input.contact_email ?? "").trim()
    );
  return Number(res.lastInsertRowid);
}

export function deleteBacklink(id: number): void {
  getDb().prepare("DELETE FROM backlinks WHERE id = ?").run(id);
}

function countMarkdownLinksToPath(content: string, path: string): number {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\]\\(${escaped}(?:[?#][^)]*)?\\)`, "gi");
  return (content.match(re) || []).length;
}

/** Build suggested internal-link targets from the live catalogue. */
export function getInternalLinkTargets(limit = 40): InternalLinkTarget[] {
  const db = getDb();
  const targets: InternalLinkTarget[] = [];

  const products = db
    .prepare(
      `SELECT id, name, slug, standard FROM products ORDER BY featured DESC, name LIMIT ?`
    )
    .all(limit) as { id: number; name: string; slug: string; standard: string }[];
  for (const p of products) {
    targets.push({
      kind: "product",
      id: String(p.id),
      title: p.name,
      path: `/product/${p.slug}`,
      suggested_anchors: [
        p.name,
        p.standard ? `${p.name} (${p.standard})` : `${p.name} BIS certification`,
        `BIS certification for ${p.name}`,
      ].filter(Boolean),
    });
  }

  const certs = db
    .prepare(`SELECT id, name, slug FROM certifications ORDER BY sort, name LIMIT ?`)
    .all(Math.min(limit, 20)) as { id: number; name: string; slug: string }[];
  for (const c of certs) {
    targets.push({
      kind: "cert",
      id: String(c.id),
      title: c.name,
      path: `/certifications/${c.slug}`,
      suggested_anchors: [c.name, `${c.name} certification`, `Get ${c.name}`],
    });
  }

  const posts = db
    .prepare(
      `SELECT id, title, slug FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?`
    )
    .all(Math.min(limit, 20)) as { id: number; title: string; slug: string }[];
  for (const p of posts) {
    targets.push({
      kind: "post",
      id: String(p.id),
      title: p.title,
      path: `/blog/${p.slug}`,
      suggested_anchors: [p.title, "Read more"],
    });
  }

  const cats = db
    .prepare(`SELECT id, name, slug FROM categories ORDER BY sort, name LIMIT ?`)
    .all(Math.min(limit, 15)) as { id: number; name: string; slug: string }[];
  for (const c of cats) {
    targets.push({
      kind: "category",
      id: String(c.id),
      title: c.name,
      path: `/category/${c.slug}`,
      suggested_anchors: [c.name, `${c.name} products`, `BIS ${c.name}`],
    });
  }

  const pages = db
    .prepare(`SELECT slug, title FROM pages ORDER BY slug`)
    .all() as { slug: string; title: string }[];
  for (const p of pages) {
    const path = p.slug === "home" ? "/" : `/${p.slug}`;
    targets.push({
      kind: "page",
      id: p.slug,
      title: p.title,
      path,
      suggested_anchors: [p.title, `Visit ${p.title}`],
    });
  }

  return targets;
}

/** Find high-value pages that blog posts rarely link to. */
export function getInternalLinkOpportunities(limit = 12): LinkOpportunity[] {
  const posts = getDb()
    .prepare(`SELECT content FROM posts WHERE status = 'published'`)
    .all() as { content: string }[];
  const blob = posts.map((p) => p.content || "").join("\n");
  const targets = getInternalLinkTargets(60).filter((t) => t.kind !== "page" || t.id !== "home");

  const scored = targets.map((target) => {
    const inbound = countMarkdownLinksToPath(blob, target.path);
    let reason = "";
    if (inbound === 0) reason = "No published posts link here yet";
    else if (inbound === 1) reason = "Only one internal blog link";
    else reason = `${inbound} internal blog links`;
    return { target, inbound_from_posts: inbound, reason, score: inbound };
  });

  return scored
    .filter((o) => o.inbound_from_posts < 2)
    .sort((a, b) => a.score - b.score || a.target.title.localeCompare(b.target.title))
    .slice(0, limit)
    .map(({ target, inbound_from_posts, reason }) => ({
      target,
      inbound_from_posts,
      reason,
    }));
}
