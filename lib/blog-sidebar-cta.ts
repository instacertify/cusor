/**
 * Blog article sidebar CTA — "Get certified faster" / "Get tested faster"
 * with site-wide defaults and optional per-post overrides.
 */
import type { Post } from "./db";

export const BLOG_CTA_DEFAULTS = {
  blog_cta_default_kind: "auto",
  blog_cta_heading_cert: "Get certified faster",
  blog_cta_heading_test: "Get tested faster",
  blog_cta_body_template:
    "Our experts handle the application, coordinate testing for {topic} and manage the inspection. Free quote in 24 hours.",
  blog_cta_default_topic: "your product",
} as const;

export type BlogCtaKind = "certification" | "testing";
export type BlogCtaMode = "default" | "custom";
export type BlogMorePostsMode = "default" | "hide";

export type BlogSidebarCtaResolved = {
  kind: BlogCtaKind;
  heading: string;
  body: string;
  topic: string;
  intent: "certification" | "test";
  submitLabel: string;
  morePostsMode: BlogMorePostsMode;
};

const TEST_RE =
  /\b(test(ing)?|emi|emc|lab(?:orator(?:y|ies))?|nabl|sample size|safety test|type test|rohs|reach|chemical test|electrical test|microbiology)\b/i;
const CERT_RE =
  /\b(certif|bis\b|bee\b|isi\b|crs\b|qco\b|licen[cs]e|scheme|marking|fmcs|cdsco|gmark|saber|ce mark|fcc\b|wpc\b|compliance)\b/i;

/** Infer certification vs testing from article copy when using defaults. */
export function detectBlogCtaKind(post: Pick<Post, "title" | "excerpt" | "content">): BlogCtaKind {
  const hay = `${post.title}\n${post.excerpt}\n${post.content}`;
  const testHits = (hay.match(new RegExp(TEST_RE.source, "gi")) || []).length;
  const certHits = (hay.match(new RegExp(CERT_RE.source, "gi")) || []).length;
  if (testHits > certHits) return "testing";
  if (certHits > 0) return "certification";
  return "certification";
}

function fillTopic(template: string, topic: string): string {
  const t = topic.trim() || BLOG_CTA_DEFAULTS.blog_cta_default_topic;
  if (template.includes("{topic}")) return template.split("{topic}").join(t);
  return template;
}

export type BlogSidebarPostFields = {
  cta_mode?: string | null;
  cta_kind?: string | null;
  cta_heading?: string | null;
  cta_topic?: string | null;
  cta_body?: string | null;
  more_posts_mode?: string | null;
};

/** Resolve CTA + related-posts behaviour for one article. */
export function resolveBlogSidebarCta(
  post: Pick<Post, "title" | "excerpt" | "content"> & BlogSidebarPostFields,
  settings: Record<string, string> = {}
): BlogSidebarCtaResolved {
  const mode: BlogCtaMode =
    (post.cta_mode || "").trim() === "custom" ? "custom" : "default";
  const morePostsMode: BlogMorePostsMode =
    (post.more_posts_mode || "").trim() === "hide" ? "hide" : "default";

  const defaultKindSetting = (settings.blog_cta_default_kind || "").trim().toLowerCase();

  let kind: BlogCtaKind;
  if (mode === "custom") {
    kind = (post.cta_kind || "").trim() === "testing" ? "testing" : "certification";
  } else if (defaultKindSetting === "testing" || defaultKindSetting === "certification") {
    kind = defaultKindSetting;
  } else {
    kind = detectBlogCtaKind(post);
  }

  const headingCert =
    (settings.blog_cta_heading_cert || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_cta_heading_cert;
  const headingTest =
    (settings.blog_cta_heading_test || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_cta_heading_test;
  const bodyTemplate =
    (settings.blog_cta_body_template || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_cta_body_template;
  const defaultTopic =
    (settings.blog_cta_default_topic || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_cta_default_topic;

  const customHeading = (post.cta_heading || "").trim();
  const customTopic = (post.cta_topic || "").trim();
  const customBody = (post.cta_body || "").trim();

  const heading =
    mode === "custom" && customHeading
      ? customHeading
      : kind === "testing"
        ? headingTest
        : headingCert;

  const topic =
    mode === "custom" && customTopic
      ? customTopic
      : defaultTopic;

  const body =
    mode === "custom" && customBody
      ? fillTopic(customBody, topic)
      : fillTopic(bodyTemplate, topic);

  return {
    kind,
    heading,
    body,
    topic,
    intent: kind === "testing" ? "test" : "certification",
    submitLabel: "Request quote",
    morePostsMode,
  };
}
