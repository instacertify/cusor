import { BASE_URL } from "./seo";

/** Public IndexNow ownership key — also hosted at /{key}.txt */
export const INDEXNOW_KEY = "6e537741d33144718d58d511b1838b83";

export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

export const INDEXNOW_KEY_URL = `${BASE_URL}${INDEXNOW_KEY_PATH}`;

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  ok: boolean;
  status: number;
  submitted: number;
  message: string;
};

function hostFromBase(): string {
  try {
    return new URL(BASE_URL).host.replace(/^www\./, "");
  } catch {
    return "certko.com";
  }
}

function normalizeUrlList(urls: string[]): string[] {
  const host = hostFromBase();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    let absolute = trimmed;
    if (trimmed.startsWith("/")) absolute = `${BASE_URL}${trimmed}`;
    try {
      const u = new URL(absolute);
      const uHost = u.host.replace(/^www\./, "");
      if (uHost !== host) continue;
      u.protocol = "https:";
      u.host = host;
      const href = u.toString();
      if (seen.has(href)) continue;
      seen.add(href);
      out.push(href);
    } catch {
      /* skip invalid */
    }
  }
  return out.slice(0, 10000);
}

/**
 * Submit one or more certko.com URLs to IndexNow (Bing, Yandex, etc.).
 * Requires the public key file at INDEXNOW_KEY_URL.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const urlList = normalizeUrlList(urls);
  if (urlList.length === 0) {
    return {
      ok: false,
      status: 0,
      submitted: 0,
      message: "No valid certko.com URLs to submit",
    };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: hostFromBase(),
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_URL,
        urlList,
      }),
      signal: AbortSignal.timeout(15000),
    });

    // IndexNow: 200 OK, 202 Accepted are success
    const ok = res.status === 200 || res.status === 202;
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      detail = "";
    }

    return {
      ok,
      status: res.status,
      submitted: ok ? urlList.length : 0,
      message: ok
        ? `Submitted ${urlList.length} URL${urlList.length === 1 ? "" : "s"} to IndexNow (${res.status})`
        : `IndexNow error ${res.status}${detail ? `: ${detail}` : ""}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      submitted: 0,
      message: err instanceof Error ? err.message : "IndexNow request failed",
    };
  }
}

/** Fire-and-forget notify after CMS publish (never throws). */
export function notifyIndexNow(urls: string[]): void {
  void submitToIndexNow(urls).catch(() => {});
}
