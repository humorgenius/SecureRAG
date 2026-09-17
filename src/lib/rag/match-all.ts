import { isStopToken } from './stopwords';
import { sentencesWithHeading } from './answer/extractive';
import type { Chunk } from './types';

/**
 * Two kinds of literal search, both deliberately separate from the RAG answer path.
 *
 * The answer path is built to produce a *summary*: it fuses two retrievers, then
 * MMR discards chunks whose embeddings are near-duplicates of an already-picked
 * chunk (cosine >= 0.92) and quotes at most MAX_SENTENCES of what survives. A
 * document that mentions "potato" thirty times produces thirty near-identical
 * chunks, so that pipeline surfaces two of them — by design, not by accident.
 *
 * "Where does this word appear in my files?" is a different question and needs a
 * different pass: every chunk, every sentence, in document order, matched
 * literally, with no ranking, no dedup-by-similarity and no top-k.
 *
 *   matchAll   — fuzzy mode: a sentence qualifies if it contains any meaningful
 *                term of the question. Word forms still match ("potato" finds
 *                "potatoes"), question words are ignored.
 *   matchExact — exact mode: a sentence qualifies only if it contains the query
 *                as one unbroken string, and Latin matches must sit on word
 *                boundaries, so "potato" does not find "potatoes" here.
 */

export interface MatchTerm {
  term: string;
  /** CJK terms are matched as plain substrings; Latin terms need a word boundary. */
  cjk: boolean;
}

export interface MatchItem {
  /** Breadcrumb of headings this sentence sits under, outermost first. */
  heading: string[];
  text: string;
  /** so a click can jump back to the exact chunk in the source view */
  chunkId: string;
  chunkIndex: number;
  page?: number;
  terms: string[];
}

export interface MatchesByDoc {
  docId: string;
  docName: string;
  count: number;
  items: MatchItem[];
}

export interface MatchResult {
  /** The terms actually searched for, after dropping question words. */
  terms: string[];
  /** Total matching sentences in the whole library, even beyond the cap. */
  total: number;
  docs: MatchesByDoc[];
  /** True when `total` exceeds the number of items returned. */
  capped: boolean;
  /** How many chunks were scanned — the UI uses it to be honest about coverage. */
  scanned: number;
}

/** Hard cap on returned items; `total` is still exact when it trips. */
export const MATCH_ITEM_CAP = 400;

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/;
const LATIN_WORD = /[a-z0-9][a-z0-9'’-]*/g;
const isCjkChar = (ch: string) => CJK.test(ch);
const isWordChar = (ch: string) => /[a-z0-9]/.test(ch);

/**
 * Turn a question into the terms a reader would search for.
 *
 * Latin: lowercased words, question words dropped. CJK: bigrams of adjacent
 * content characters — single characters like 我 / 的 / 是 are not evidence (they
 * are what made early answers unreadable), and bigrams are the smallest run that
 * still carries meaning. A bigram is only formed between characters that are
 * adjacent in the *original* text, so a stop character between two content
 * characters cannot manufacture a term that was never there.
 */
export function queryTerms(query: string): MatchTerm[] {
  const out: MatchTerm[] = [];
  const seen = new Set<string>();

  const push = (term: string, cjk: boolean) => {
    const key = `${cjk ? 'c' : 'l'}:${term}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ term, cjk });
  };

  for (const word of query.toLowerCase().match(LATIN_WORD) ?? []) {
    if (word.length < 2 || isStopToken(word)) continue;
    push(word, false);
  }

  // Adjacent content characters only: walk the raw string and break the run at
  // every non-content character.
  let run: string[] = [];
  const flush = () => {
    for (let i = 0; i + 1 < run.length; i++) {
      const bigram = run[i] + run[i + 1];
      // 多少 / 什么 / 如何 … are question scaffolding, not search terms.
      if (isStopToken(bigram)) continue;
      push(bigram, true);
    }
    run = [];
  };
  for (const ch of query) {
    if (isCjkChar(ch) && !isStopToken(ch)) run.push(ch);
    else flush();
  }
  flush();

  return out;
}

/** Trim and collapse whitespace: "potato   harvest" and a line break are one query. */
export function normalizePhrase(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

/**
 * Left-boundary word match. Deliberately prefix-tolerant on the right: searching
 * "potato" should find "potatoes"; it should not find "sweetpotato".
 */
function containsLatin(haystack: string, term: string): boolean {
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(term, from);
    if (at === -1) return false;
    if (!isWordChar(at > 0 ? haystack[at - 1] : '')) return true;
    from = at + 1;
  }
}

function matchedTerms(sentenceLower: string, terms: MatchTerm[], into: string[]): void {
  for (const t of terms) {
    const hit = t.cjk ? sentenceLower.includes(t.term) : containsLatin(sentenceLower, t.term);
    if (hit) into.push(t.term);
  }
}

/**
 * Strict containment for exact mode: the whole phrase as typed must appear, and a
 * Latin phrase must be bounded on BOTH sides — "potato" does not match "potatoes"
 * or "sweetpotato". Chinese has no word boundaries, so a phrase matches as a
 * substring: searching 身份 finds 身份证, which is what a Chinese reader expects.
 */
function containsExact(sentenceLower: string, phrase: string, latin: boolean): boolean {
  const hay = normalizePhrase(sentenceLower);
  if (!latin) return hay.includes(phrase);
  let from = 0;
  for (;;) {
    const at = hay.indexOf(phrase, from);
    if (at === -1) return false;
    const before = at > 0 ? hay[at - 1] : '';
    const after = hay[at + phrase.length] ?? '';
    if (!isWordChar(before) && !isWordChar(after)) return true;
    from = at + 1;
  }
}

/**
 * The shared walk: every sentence of every chunk, once, in library order, with
 * `match` deciding whether it qualifies. Chunks overlap by 15%, so a sentence near
 * a boundary lives in two chunks — without the de-duplication step a library would
 * report matches it does not have.
 */
function collect(
  chunks: Chunk[],
  cap: number,
  match: (sentenceLower: string, into: string[]) => void,
  prefilter?: (chunkLower: string) => boolean
): MatchResult {
  const byDoc = new Map<string, MatchesByDoc>();
  const seen = new Set<string>();
  let total = 0;
  let returned = 0;

  chunks.forEach((chunk, chunkIndex) => {
    const lower = chunk.text.toLowerCase();
    if (prefilter && !prefilter(lower)) return;

    let doc = byDoc.get(chunk.docId);
    for (const { text, heading } of sentencesWithHeading(chunk.text, chunk.headingPath)) {
      const key = `${chunk.docId}\u0000${text.trim()}`;
      if (seen.has(key)) continue;

      const hit: string[] = [];
      match(text.toLowerCase(), hit);
      if (hit.length === 0) continue;
      seen.add(key);

      total++;
      if (returned >= cap) continue;
      returned++;
      if (!doc) {
        doc = { docId: chunk.docId, docName: chunk.docName, count: 0, items: [] };
        byDoc.set(chunk.docId, doc);
      }
      doc.count++;
      doc.items.push({ heading, text, chunkId: chunk.chunkId, chunkIndex, page: chunk.page, terms: hit });
    }
  });

  return {
    terms: [],
    total,
    docs: Array.from(byDoc.values()),
    capped: total > returned,
    scanned: chunks.length,
  };
}

/** Fuzzy literal search: every sentence containing any meaningful term of `query`. */
export function matchAll(chunks: Chunk[], query: string, cap = MATCH_ITEM_CAP): MatchResult {
  const terms = queryTerms(query);
  if (terms.length === 0) {
    return { terms: [], total: 0, docs: [], capped: false, scanned: chunks.length };
  }
  const latin = terms.filter((t) => !t.cjk).map((t) => t.term);

  const result = collect(
    chunks,
    cap,
    (sentenceLower, into) => matchedTerms(sentenceLower, terms, into),
    // Cheap reject: a chunk that cannot contain any Latin term and no CJK term
    // needs no sentence splitting at all.
    (chunkLower) =>
      latin.some((t) => chunkLower.includes(t)) ||
      terms.some((t) => t.cjk && chunkLower.includes(t.term))
  );

  result.terms = terms.map((t) => t.term);
  return result;
}

/**
 * Exact search: every sentence containing the query as one unbroken phrase.
 * Case-insensitive, because "Potato" and "potato" are the same word to a reader;
 * whitespace in the query is collapsed, so a phrase typed with a line break in it
 * still matches.
 */
export function matchExact(chunks: Chunk[], query: string, cap = MATCH_ITEM_CAP): MatchResult {
  const phrase = normalizePhrase(query).toLowerCase();
  if (phrase.length === 0) {
    return { terms: [], total: 0, docs: [], capped: false, scanned: chunks.length };
  }
  const latin = /[a-z]/.test(phrase);

  const result = collect(
    chunks,
    cap,
    (sentenceLower, into) => {
      if (containsExact(sentenceLower, phrase, latin)) into.push(phrase);
    },
    (chunkLower) => normalizePhrase(chunkLower).includes(phrase)
  );

  result.terms = [phrase];
  return result;
}
