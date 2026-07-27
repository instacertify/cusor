import type { SqliteDatabase } from "./sqlite";
import { getDb } from "./db";
import { slugify } from "./format";
import {
  getInternalLinkTargets,
  type InternalLinkTarget,
} from "./backlinks";
import { ensureContentDraftsCatalog as ensureSchema } from "./growth-schema";

export type ContentType =
  | "guide"
  | "product"
  | "faq"
  | "comparison"
  | "news"
  | "pillar";

export type ContentTone = "professional" | "plain" | "sales";

export interface ContentDraft {
  id: number;
  title: string;
  focus_keyword: string;
  content_type: ContentType;
  tone: ContentTone;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  secondary_keywords: string;
  internal_links_json: string;
  post_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateContentInput {
  title: string;
  focus_keyword: string;
  content_type: ContentType;
  tone: ContentTone;
  secondary_keywords?: string;
  audience?: string;
  product_slug?: string;
  notes?: string;
  auto_link?: boolean;
}

export interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  secondary_keywords: string;
  internal_links: { label: string; path: string }[];
  word_count: number;
}

const VALID_TYPES = new Set<ContentType>([
  "guide",
  "product",
  "faq",
  "comparison",
  "news",
  "pillar",
]);
const VALID_TONES = new Set<ContentTone>(["professional", "plain", "sales"]);

export function ensureContentDraftsCatalog(db: SqliteDatabase): void {
  ensureSchema(db);
}

export function listContentDrafts(): ContentDraft[] {
  return getDb()
    .prepare(
      `SELECT * FROM content_drafts ORDER BY datetime(updated_at) DESC, id DESC`
    )
    .all() as ContentDraft[];
}

export function getContentDraftById(id: number): ContentDraft | undefined {
  return getDb().prepare("SELECT * FROM content_drafts WHERE id = ?").get(id) as
    | ContentDraft
    | undefined;
}

export function deleteContentDraft(id: number): void {
  getDb().prepare("DELETE FROM content_drafts WHERE id = ?").run(id);
}

export function saveContentDraft(input: {
  id?: number;
  title: string;
  focus_keyword: string;
  content_type: string;
  tone: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  secondary_keywords: string;
  internal_links_json?: string;
  post_id?: number | null;
  status?: string;
}): number {
  const content_type = VALID_TYPES.has(input.content_type as ContentType)
    ? input.content_type
    : "guide";
  const tone = VALID_TONES.has(input.tone as ContentTone) ? input.tone : "professional";
  const db = getDb();
  if (input.id) {
    db.prepare(
      `UPDATE content_drafts SET
        title=?, focus_keyword=?, content_type=?, tone=?, excerpt=?, content=?,
        meta_title=?, meta_description=?, secondary_keywords=?,
        internal_links_json=?, post_id=COALESCE(?, post_id), status=?,
        updated_at=datetime('now')
       WHERE id=?`
    ).run(
      input.title.trim(),
      input.focus_keyword.trim(),
      content_type,
      tone,
      input.excerpt.trim(),
      input.content,
      input.meta_title.trim(),
      input.meta_description.trim(),
      input.secondary_keywords.trim(),
      input.internal_links_json ?? "[]",
      input.post_id ?? null,
      input.status ?? "draft",
      input.id
    );
    return input.id;
  }
  const res = db
    .prepare(
      `INSERT INTO content_drafts
        (title, focus_keyword, content_type, tone, excerpt, content, meta_title, meta_description, secondary_keywords, internal_links_json, post_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.title.trim(),
      input.focus_keyword.trim(),
      content_type,
      tone,
      input.excerpt.trim(),
      input.content,
      input.meta_title.trim(),
      input.meta_description.trim(),
      input.secondary_keywords.trim(),
      input.internal_links_json ?? "[]",
      input.post_id ?? null,
      input.status ?? "draft"
    );
  return Number(res.lastInsertRowid);
}

function trimMeta(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function pickLinks(
  keyword: string,
  productSlug?: string,
  max = 5
): InternalLinkTarget[] {
  const all = getInternalLinkTargets(80);
  const kw = keyword.toLowerCase();
  const scored = all.map((t) => {
    let score = 0;
    if (productSlug && t.path.includes(productSlug)) score += 20;
    const hay = `${t.title} ${t.path} ${t.suggested_anchors.join(" ")}`.toLowerCase();
    for (const part of kw.split(/\s+/).filter((w) => w.length > 2)) {
      if (hay.includes(part)) score += 3;
    }
    if (t.kind === "product") score += 2;
    if (t.kind === "cert") score += 1;
    return { t, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((s) => s.t);
}

function toneLead(tone: ContentTone, topic: string, keyword: string): string {
  if (tone === "plain") {
    return `${topic} matters when you sell into regulated markets. This guide covers **${keyword}** in clear steps so your team can plan testing, paperwork and timelines without guesswork.`;
  }
  if (tone === "sales") {
    return `Need **${keyword}** done right the first time? Certko helps manufacturers move from standards research to lab booking and certification filing — with fewer delays and clearer next steps.`;
  }
  return `Understanding **${keyword}** is essential for manufacturers who want predictable market access. This Certko guide explains the requirements, process and practical decisions behind **${topic}**.`;
}

function faqBlock(keyword: string, productName?: string): string {
  const subject = productName || keyword;
  return `## Frequently asked questions

### What is ${subject}?
${subject} refers to the compliance pathway manufacturers follow to meet applicable standards, testing and marking rules before placing products on the market.

### How long does ${keyword} usually take?
Timelines vary by standard, lab capacity and documentation readiness. Many programmes run from several weeks to a few months once samples and paperwork are complete.

### Do I need a testing lab?
Most certification routes require accredited testing against the applicable Indian Standard or scheme rules. Confirm the correct standard before booking a lab.

### How can Certko help?
Certko maps the right certification or testing path, connects you with suitable labs, and supports documentation so your team stays focused on production and launch.`;
}

function ctaBlock(): string {
  return `## Next step

Ready to map your certification or testing path? [Contact Certko](/contact) for expert help, or [browse BIS products](/products) to find your standard and indicative fees.`;
}

function buildGuide(
  title: string,
  keyword: string,
  tone: ContentTone,
  links: InternalLinkTarget[],
  notes: string,
  audience: string
): string {
  const linkLines = links
    .slice(0, 4)
    .map((l) => `- [${l.suggested_anchors[0] || l.title}](${l.path})`)
    .join("\n");

  return `# ${title}

${toneLead(tone, title, keyword)}

${audience ? `**Who this is for:** ${audience}\n` : ""}
## Why ${keyword} matters

Regulated markets expect proof that products meet the right standards. Getting **${keyword}** wrong can mean delayed launches, rejected consignments or retesting. A clear plan covering standards, samples, labs and documentation reduces cost and calendar risk.

## Step-by-step process

1. **Confirm the applicable standard or scheme** — identify the correct IS/scheme, category and any QCO or mandatory listing rules.
2. **Prepare the product and documentation** — drawings, BOM, markings, factory details and sample plan.
3. **Select an accredited testing lab** — match scope, location and capacity to your product.
4. **Complete testing and review reports** — address non-conformities early.
5. **File certification / marking applications** — follow the scheme process through to grant and labelling.

## Practical checklist

- [ ] Standard / scheme confirmed
- [ ] Factory and product documentation ready
- [ ] Sample quantity and conditioning understood
- [ ] Lab shortlist with scope match
- [ ] Timeline and fee budget agreed
- [ ] Post-grant marking and surveillance plan

${notes ? `## Notes from your brief\n\n${notes}\n` : ""}
## Related Certko resources

${linkLines || "- [Explore certifications](/certifications)\n- [Product testing](/testing)\n- [Contact the team](/contact)"}

${faqBlock(keyword)}

${ctaBlock()}
`;
}

function buildProductArticle(
  title: string,
  keyword: string,
  tone: ContentTone,
  product: { name: string; slug: string; standard: string; description: string } | null,
  links: InternalLinkTarget[]
): string {
  const name = product?.name || keyword;
  const standard = product?.standard || "the applicable Indian Standard";
  const path = product ? `/product/${product.slug}` : "/products";
  const extra = links
    .filter((l) => l.path !== path)
    .slice(0, 3)
    .map((l) => `- [${l.suggested_anchors[0] || l.title}](${l.path})`)
    .join("\n");

  return `# ${title}

${toneLead(tone, name, keyword)}

## About ${name}

${product?.description?.trim() || `${name} falls under BIS / product certification requirements that manufacturers should verify before sale in India.`}

- **Product:** [${name}](${path})
- **Standard focus:** ${standard}
- **Keyword focus:** ${keyword}

## Certification overview

Manufacturers typically need to confirm whether ${name} is covered under a mandatory QCO, which IS applies, and which labs are authorised for testing. Fees, sample size and factory audit requirements depend on the scheme (for example ISI / CRS) and organisation size.

## What to prepare

1. Product identification and model variants
2. Bill of materials and critical components
3. Marking / labelling artwork drafts
4. Factory address and quality system summary
5. Preferred lab region and timeline

## Useful links

- [${name} product page](${path})
${extra || "- [All BIS products](/products)\n- [Certifications](/certifications)"}

${faqBlock(keyword, name)}

${ctaBlock()}
`;
}

function buildFaqArticle(title: string, keyword: string, tone: ContentTone): string {
  return `# ${title}

${toneLead(tone, title, keyword)}

${faqBlock(keyword)}

### Is ${keyword} mandatory for every manufacturer?
It depends on the product category, notified QCO and destination market. Always verify the latest gazette / scheme listing before production planning.

### Can one lab cover every test?
Not always. Scope, accreditation and equipment differ. Match the lab scope to your exact standard clauses.

### Should startups begin differently from large plants?
Startups often begin with a tighter model list and clearer sample plan. Larger plants may need multi-plant or multi-model strategies and surveillance planning.

${ctaBlock()}
`;
}

function buildComparison(
  title: string,
  keyword: string,
  tone: ContentTone,
  links: InternalLinkTarget[]
): string {
  const a = links[0];
  const b = links[1];
  return `# ${title}

${toneLead(tone, title, keyword)}

## Quick comparison

| Factor | Option A | Option B |
| --- | --- | --- |
| Best when | You need a focused certification path | You need broader testing or alternate schemes |
| Start with | Standards + product mapping | Risk / market destination mapping |
| Typical next step | Lab booking + documentation pack | Scheme selection workshop |

${a ? `### ${a.title}\nReview [${a.suggested_anchors[0] || a.title}](${a.path}) for scheme details and related products.\n` : ""}
${b ? `### ${b.title}\nCompare against [${b.suggested_anchors[0] || b.title}](${b.path}) before locking your compliance plan.\n` : ""}

## How to choose

1. Confirm whether the requirement is certification, testing, or both
2. Check mandatory vs voluntary status for your SKU
3. Estimate timeline against launch date
4. Budget lab fees, application fees and retest contingency

${ctaBlock()}
`;
}

function buildNews(
  title: string,
  keyword: string,
  tone: ContentTone,
  notes: string
): string {
  return `# ${title}

${toneLead(tone, title, keyword)}

## What changed

${notes || `Regulatory and scheme updates around **${keyword}** can affect testing priorities, labelling and go-to-market timing. Use this brief to align product, quality and compliance teams.`}

## Who should act

- Product managers planning launches into regulated markets
- Quality / compliance owners updating SOPs
- Sourcing teams selecting components with certification impact

## Recommended actions this week

1. Map affected SKUs against the latest standard / QCO wording
2. Check open lab bookings for scope fit
3. Update internal FAQ and sales enablement notes
4. Escalate unclear cases to [Certko](/contact)

${ctaBlock()}
`;
}

function buildPillar(
  title: string,
  keyword: string,
  tone: ContentTone,
  links: InternalLinkTarget[]
): string {
  const clusters = links.slice(0, 8).map(
    (l) => `### ${l.title}\n[${l.suggested_anchors[0] || l.title}](${l.path}) — use this page when readers need deeper detail on ${l.title.toLowerCase()}.`
  );
  return `# ${title}

${toneLead(tone, title, keyword)}

## Hub overview

This pillar page organises Certko guidance around **${keyword}**. Use it as the parent URL for internal links from blog posts, product pages and outreach content.

## Topic clusters

${clusters.join("\n\n") || "### Start here\n- [Products](/products)\n- [Certifications](/certifications)\n- [Testing](/testing)"}

## Editorial tips

- Link from every new article back to this hub once
- Prefer descriptive anchors over “click here”
- Refresh this page when QCO or scheme lists change

${faqBlock(keyword)}

${ctaBlock()}
`;
}

function countWords(md: string): number {
  return md
    .replace(/[#>*`_\-|[\]]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function generateContent(input: GenerateContentInput): GeneratedContent {
  const title = input.title.trim() || `Guide to ${input.focus_keyword.trim()}`;
  const keyword = input.focus_keyword.trim() || title;
  const content_type = VALID_TYPES.has(input.content_type) ? input.content_type : "guide";
  const tone = VALID_TONES.has(input.tone) ? input.tone : "professional";
  const secondary = (input.secondary_keywords || "")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const notes = (input.notes || "").trim();
  const audience = (input.audience || "").trim();
  const autoLink = input.auto_link !== false;

  type ProductRow = {
    name: string;
    slug: string;
    standard: string;
    description: string;
  };
  let product: ProductRow | null = null;
  if (input.product_slug?.trim()) {
    product =
      (getDb()
        .prepare(
          `SELECT name, slug, standard, description FROM products WHERE slug = ?`
        )
        .get(input.product_slug.trim()) as ProductRow | undefined) ?? null;
  }

  const links = autoLink
    ? pickLinks(keyword, product?.slug, content_type === "pillar" ? 8 : 5)
    : [];

  let content = "";
  switch (content_type) {
    case "product":
      content = buildProductArticle(title, keyword, tone, product, links);
      break;
    case "faq":
      content = buildFaqArticle(title, keyword, tone);
      break;
    case "comparison":
      content = buildComparison(title, keyword, tone, links);
      break;
    case "news":
      content = buildNews(title, keyword, tone, notes);
      break;
    case "pillar":
      content = buildPillar(title, keyword, tone, links);
      break;
    default:
      content = buildGuide(title, keyword, tone, links, notes, audience);
  }

  // Light secondary-keyword weave (first unused keyword into one H2 if missing)
  for (const sk of secondary.slice(0, 2)) {
    if (!content.toLowerCase().includes(sk.toLowerCase())) {
      content = content.replace(
        "## Why",
        `## Why ${sk} and`
      );
      break;
    }
  }

  const excerpt = trimMeta(
    `${title}: practical guidance on ${keyword} for manufacturers planning certification, testing and market access with Certko.`,
    160
  );
  const meta_title = trimMeta(`${title} | Certko`, 60);
  const meta_description = trimMeta(
    `Learn ${keyword} with Certko — process, checklist, FAQs and next steps for compliance and market access.`,
    155
  );

  const internal_links = links.map((l) => ({
    label: l.suggested_anchors[0] || l.title,
    path: l.path,
  }));

  return {
    title,
    excerpt,
    content: content.trim() + "\n",
    meta_title,
    meta_description,
    secondary_keywords: secondary.join(", "),
    internal_links,
    word_count: countWords(content),
  };
}

/** Create a blog post draft from a content_draft and link them. */
export function publishDraftToBlog(draftId: number, authorId?: number): number {
  const draft = getContentDraftById(draftId);
  if (!draft) throw new Error("Draft not found");
  const db = getDb();

  let authorName = "Certko Team";
  let resolvedAuthorId: number | null = authorId ?? null;
  if (resolvedAuthorId) {
    const a = db
      .prepare("SELECT id, name FROM authors WHERE id = ?")
      .get(resolvedAuthorId) as { id: number; name: string } | undefined;
    if (a) {
      authorName = a.name;
      resolvedAuthorId = a.id;
    } else {
      resolvedAuthorId = null;
    }
  }
  if (!resolvedAuthorId) {
    const a = db
      .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
      .get() as { id: number; name: string } | undefined;
    if (a) {
      authorName = a.name;
      resolvedAuthorId = a.id;
    }
  }

  let slug = slugify(draft.title) || `draft-${draftId}`;
  let n = 2;
  while (db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug)) {
    slug = `${slugify(draft.title)}-${n++}`;
  }

  if (draft.post_id) {
    db.prepare(
      `UPDATE posts SET title=?, excerpt=?, content=?, meta_title=?, meta_description=?,
        author=?, author_id=? WHERE id=?`
    ).run(
      draft.title,
      draft.excerpt,
      draft.content,
      draft.meta_title,
      draft.meta_description,
      authorName,
      resolvedAuthorId,
      draft.post_id
    );
    db.prepare(
      `UPDATE content_drafts SET status='saved_to_post', updated_at=datetime('now') WHERE id=?`
    ).run(draftId);
    return draft.post_id;
  }

  const res = db
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, author, author_id, status, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
    )
    .run(
      slug,
      draft.title,
      draft.excerpt,
      draft.content,
      authorName,
      resolvedAuthorId,
      draft.meta_title,
      draft.meta_description
    );
  const postId = Number(res.lastInsertRowid);
  db.prepare(
    `UPDATE content_drafts SET post_id=?, status='saved_to_post', updated_at=datetime('now') WHERE id=?`
  ).run(postId, draftId);
  return postId;
}
