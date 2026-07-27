/**
 * Shared search matching for partial / incomplete keywords.
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

const EXACT_WORD_TERMS = new Set(
  Object.keys(SYNONYMS)
    .filter((k) => k.length <= 3)
    .concat(["ce", "fcc", "isi", "crs", "bee", "bis", "led", "lab"])
);

export function tokenizeQuery(q: string): string[] {
  const raw = q
    .toLowerCase()
    .replace(/[^a-z0-9.\-/+\s]/g, " ")
    .split(/[\s+/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1);

  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
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

export function meaningfulTokens(q: string): string[] {
  return tokenizeQuery(q).filter(
    (t) => t.length >= 2 || /^\d/.test(t) || /^is\d/i.test(t)
  );
}

export function expandTerm(term: string): string[] {
  const t = term.toLowerCase();
  return [...new Set<string>([t, ...(SYNONYMS[t] || [])])];
}

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/is\s+(\d)/g, "is$1")
    .split(/[^a-z0-9.]+/)
    .filter(Boolean);
}

export function termMatchesText(haystack: string, term: string): boolean {
  if (!term) return false;
  const h = haystack.toLowerCase();
  const words = wordsOf(h);
  const variants = expandTerm(term);

  for (const v of variants) {
    if (!v) continue;
    const isOriginal = v === term.toLowerCase();
    if (words.some((w) => w === v)) return true;
    if (!isOriginal) continue;
    if (EXACT_WORD_TERMS.has(v)) continue;
    if (v.length >= 3 && words.some((w) => w.startsWith(v))) return true;
    if (v.length >= 4 && h.includes(v)) return true;
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
  score: number;
  matchedTerms: string[];
};

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

  if (
    !(
      matched === total ||
      (longestMatched && ratio >= 0.5 && longest.length >= 4) ||
      priorOk
    )
  ) {
    return null;
  }

  score += (total - matched) * 25;
  return { matched, total, score, matchedTerms };
}

export function textMatchesQuery(text: string, query: string): boolean {
  return scoreTextMatch(query, text, text) != null;
}
