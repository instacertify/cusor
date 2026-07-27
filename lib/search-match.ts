/**
 * Shared search matching for partial / incomplete keywords.
 * Tokenizes queries, expands common Certko synonyms, and scores relevance.
 */

const SYNONYMS: Record<string, string[]> = {
  bis: ["isi", "crs", "bureau"],
  isi: ["bis", "mark"],
  crs: ["bis", "registration"],
  bee: ["star", "energy", "efficiency"],
  gmark: ["g-mark", "gulf", "gcc", "sgso"],
  ce: ["european", "eu"],
  fcc: ["usa"],
  lab: ["laboratory", "labs", "nabl"],
  labs: ["lab", "laboratory", "nabl"],
  test: ["testing", "laboratory"],
  testing: ["test", "laboratory"],
  cert: ["certification", "certificate", "scheme"],
  certification: ["cert", "certificate", "scheme"],
  led: ["lamp", "lighting"],
  cable: ["cables", "wire", "wires"],
  cables: ["cable", "wire", "wires"],
  toy: ["toys"],
  toys: ["toy"],
};

export function tokenizeQuery(q: string): string[] {
  const raw = q
    .toLowerCase()
    .replace(/[^a-z0-9.\-/+\s]/g, " ")
    .split(/[\s+/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1);

  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    // "IS 302" / "IS-302" → keep "is302" so standard searches stay precise
    if (raw[i] === "is" && raw[i + 1] && /^\d/.test(raw[i + 1])) {
      out.push(`is${raw[i + 1]}`);
      out.push(raw[i + 1]);
      i += 1;
      continue;
    }
    out.push(raw[i]);
  }
  return out;
}

/** Meaningful search tokens (drop ultra-short noise unless numeric / standard-like). */
export function meaningfulTokens(q: string): string[] {
  return tokenizeQuery(q).filter(
    (t) => t.length >= 2 || /^\d/.test(t) || /^is\d/i.test(t)
  );
}

export function expandTerm(term: string): string[] {
  const t = term.toLowerCase();
  const extras = SYNONYMS[t] || [];
  return [...new Set<string>([t, ...extras])];
}

/** Short catalogue keywords should match whole words only (avoid "bis" → "biscuits"). */
const EXACT_WORD_TERMS = new Set(
  Object.keys(SYNONYMS).filter((k) => k.length <= 3).concat(["ce", "fcc", "isi", "crs", "bee", "bis", "led", "lab"])
);

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/is\s+(\d)/g, "is$1")
    .split(/[^a-z0-9.]+/)
    .filter(Boolean);
}

/**
 * Does `haystack` contain this term as a word, word-prefix (incomplete keyword),
 * or (for longer terms) substring? Synonyms only match as whole words to avoid
 * "bee" → "star" → "start" false positives.
 */
export function termMatchesText(haystack: string, term: string): boolean {
  if (!term) return false;
  const h = haystack.toLowerCase();
  const words = wordsOf(h);
  const variants = expandTerm(term);

  for (const v of variants) {
    if (!v) continue;
    const isOriginal = v === term.toLowerCase();

    // Exact whole-word match (original or synonym)
    if (words.some((w) => w === v)) return true;

    // Synonyms: exact word only (handled above)
    if (!isOriginal) continue;

    // Known short keywords (bis, bee, led…): exact word only
    if (EXACT_WORD_TERMS.has(v)) continue;

    // Incomplete keyword: word prefix ("cabl" → cables, "pressu" → pressure)
    if (v.length >= 3 && words.some((w) => w.startsWith(v))) return true;

    // Longer fragments may sit mid-token after normalization
    if (v.length >= 4 && h.includes(v)) return true;

    // Numeric / HSN / IS-standard prefixes
    if (/^\d/.test(v) && words.some((w) => w.startsWith(v) || w.includes(v))) {
      return true;
    }
    if (
      /^is\d/i.test(v) &&
      (h.includes(v) || words.some((w) => w.startsWith(v) || w.includes(v)))
    ) {
      return true;
    }
  }
  return false;
}

export type MatchQuality = {
  matched: number;
  total: number;
  /** Lower is better */
  score: number;
  matchedTerms: string[];
};

/**
 * Score how well `haystack` / `name` match a query.
 * Supports half-typed keywords via prefix matching and synonym expansion.
 * Soft-AND: prefers all tokens, but still accepts majority / longest-token hits
 * so incomplete multi-word queries keep returning relevant rows.
 */
export function scoreTextMatch(
  query: string,
  haystack: string,
  name = ""
): MatchQuality | null {
  const terms = meaningfulTokens(query);
  if (terms.length === 0) return null;

  const h = haystack.toLowerCase();
  const n = name.toLowerCase();
  const matchedTerms: string[] = [];
  let score = 0;

  for (const term of terms) {
    const inName = termMatchesText(n, term);
    const inHay = inName || termMatchesText(h, term);
    if (!inHay) continue;
    matchedTerms.push(term);

    if (n.startsWith(term) || wordsOf(n).some((w) => w.startsWith(term))) {
      score -= 24;
    } else if (inName) {
      score -= 12;
    } else {
      const idx = h.indexOf(term);
      score += idx >= 0 ? Math.min(30, idx) : 18;
    }
    score -= Math.min(10, term.length);
  }

  const matched = matchedTerms.length;
  if (matched === 0) return null;

  const total = terms.length;
  const longest = terms.reduce((a, b) => (a.length >= b.length ? a : b));
  const longestMatched = matchedTerms.includes(longest);
  const ratio = matched / total;

  const last = terms[terms.length - 1];
  const priorOk =
    terms.length > 1 &&
    terms.slice(0, -1).every((t) => matchedTerms.includes(t)) &&
    last.length < 4 &&
    !EXACT_WORD_TERMS.has(last);

  if (!(matched === total || (longestMatched && ratio >= 0.5 && longest.length >= 4) || priorOk)) {
    return null;
  }

  score += (total - matched) * 25;
  return { matched, total, score, matchedTerms };
}

/** Build SQL-friendly per-token LIKE patterns for AND matching across fields. */
export function likeTokensForQuery(q: string): string[] {
  const terms = meaningfulTokens(q);
  if (terms.length === 0) return [];
  return terms.map((t) => `%${t}%`);
}

/** True when the text is relevant to the query (partial keywords OK). */
export function textMatchesQuery(text: string, query: string): boolean {
  return scoreTextMatch(query, text, text) != null;
}
