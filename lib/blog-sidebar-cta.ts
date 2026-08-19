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
  blog_cta_submit_label: "Request quote",
  blog_more_title: "More from the blog",
  blog_more_subtitle: "Scroll for more articles",
} as const;

export type BlogCtaKind = "certification" | "testing";
export type BlogCtaMode = "default" | "custom";
export type BlogMorePostsMode = "default" | "hide" | "custom";

export type BlogSidebarCtaResolved = {
  kind: BlogCtaKind;
  heading: string;
  body: string;
  topic: string;
  intent: "certification" | "test";
  submitLabel: string;
  morePostsMode: BlogMorePostsMode;
  moreTitle: string;
  moreSubtitle: string;
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
  cta_submit_label?: string | null;
  more_posts_mode?: string | null;
  more_posts_title?: string | null;
  more_posts_subtitle?: string | null;
};

/** Resolve CTA + related-posts behaviour for one article. */
export function resolveBlogSidebarCta(
  post: Pick<Post, "title" | "excerpt" | "content"> & BlogSidebarPostFields,
  settings: Record<string, string> = {}
): BlogSidebarCtaResolved {
  const mode: BlogCtaMode =
    (post.cta_mode || "").trim() === "custom" ? "custom" : "default";
  const moreRaw = (post.more_posts_mode || "").trim();
  const morePostsMode: BlogMorePostsMode =
    moreRaw === "hide" ? "hide" : moreRaw === "custom" ? "custom" : "default";

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
  const defaultSubmit =
    (settings.blog_cta_submit_label || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_cta_submit_label;
  const defaultMoreTitle =
    (settings.blog_more_title || "").trim() || BLOG_CTA_DEFAULTS.blog_more_title;
  const defaultMoreSubtitle =
    (settings.blog_more_subtitle || "").trim() ||
    BLOG_CTA_DEFAULTS.blog_more_subtitle;

  const customHeading = (post.cta_heading || "").trim();
  const customTopic = (post.cta_topic || "").trim();
  const customBody = (post.cta_body || "").trim();
  const customSubmit = (post.cta_submit_label || "").trim();
  const customMoreTitle = (post.more_posts_title || "").trim();
  const customMoreSubtitle = (post.more_posts_subtitle || "").trim();

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

  const submitLabel =
    mode === "custom" && customSubmit ? customSubmit : defaultSubmit;

  const moreTitle =
    morePostsMode === "custom" && customMoreTitle
      ? customMoreTitle
      : defaultMoreTitle;
  const moreSubtitle =
    morePostsMode === "custom" && customMoreSubtitle
      ? customMoreSubtitle
      : defaultMoreSubtitle;

  return {
    kind,
    heading,
    body,
    topic,
    intent: kind === "testing" ? "test" : "certification",
    submitLabel,
    morePostsMode,
    moreTitle,
    moreSubtitle,
  };
}
