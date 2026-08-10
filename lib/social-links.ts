export type SocialNetworkId = "twitter" | "linkedin" | "youtube";

export interface SocialNetworkConfig {
  id: SocialNetworkId;
  label: string;
  shortLabel: string;
  urlKey: string;
  iconKey: string;
  fileKey: string;
  clearKey: string;
  placeholder: string;
}

export const SOCIAL_NETWORKS: SocialNetworkConfig[] = [
  {
    id: "twitter",
    label: "X (Twitter)",
    shortLabel: "X",
    urlKey: "social_twitter_url",
    iconKey: "social_twitter_icon",
    fileKey: "social_twitter_icon_file",
    clearKey: "clear_social_twitter_icon",
    placeholder: "https://x.com/yourcompany",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "LinkedIn",
    urlKey: "social_linkedin_url",
    iconKey: "social_linkedin_icon",
    fileKey: "social_linkedin_icon_file",
    clearKey: "clear_social_linkedin_icon",
    placeholder: "https://www.linkedin.com/company/yourcompany",
  },
  {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YouTube",
    urlKey: "social_youtube_url",
    iconKey: "social_youtube_icon",
    fileKey: "social_youtube_icon_file",
    clearKey: "clear_social_youtube_icon",
    placeholder: "https://www.youtube.com/@yourcompany",
  },
];

export interface SocialLink {
  id: SocialNetworkId;
  label: string;
  shortLabel: string;
  href: string;
  iconSrc: string;
}

function normalizeSocialUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/** Active social profiles from site settings (URL required). */
export function getSocialLinks(settings: Record<string, string>): SocialLink[] {
  const links: SocialLink[] = [];
  for (const network of SOCIAL_NETWORKS) {
    const href = normalizeSocialUrl(settings[network.urlKey] || "");
    if (!href) continue;
    links.push({
      id: network.id,
      label: network.label,
      shortLabel: network.shortLabel,
      href,
      iconSrc: (settings[network.iconKey] || "").trim(),
    });
  }
  return links;
}
