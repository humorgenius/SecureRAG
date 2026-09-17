import { isStopToken } from './stopwords';
import { sentencesWithHeading } from './answer/extractive';
import type { Chunk } from './types';

/**
 * Exhaustive literal matching — deliberately separate from the RAG answer path.
 *
 * The answer path is built to produce a *summary*: it fuses two retrievers, then
 * MMR discards chunks whose embeddings are near-duplicates of an already-picked
 * chunk (cosine >= 0.92) and quotes at most MAX_SENTENCES of what survives. A
 * document that mentions "potato" thirty times produces thirty near-identical
 * chunks, so that pipeline surfaces two of them — by design, not by accident.
 *
 * "Where does this word appear in my files?" is a different question and needs a
 * different pass: every chunk, every sentence, in document order, matched
 * literally, with no ranking, no dedup and no top-k. That is what this module
 * does, so the UI can say "34 matches in 2 files" instead of "2 results".
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

/**
 * Left-boundary word match. Deliberately prefix-tolerant on the right: searching
 * "potato" should find "potatoes"; it should not find "sweetpotato".
 */
function containsLatin(haystack: string, term: string): boolean {
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(term, from);
    if (at === -1) return false;
    const before = at > 0 ? haystack[at - 1] : '';
    if (!/[a-z0-9]/.test(before)) return true;
    from = at + 1;
  }
}

function matchedTerms(sentenceLower: string, terms: MatchTerm[], into: string[]): void {
  for (const t of terms) {
    const hit = t.cjk ? sentenceLower.includes(t.term) : containsLatin(sentenceLower, t.term);
    if (hit) into.push(t.term);
  }
}

/** Every sentence in every chunk that contains at least one of the query's terms. */
export function matchAll(chunks: Chunk[], query: string, cap = MATCH_ITEM_CAP): MatchResult {
  const terms = queryTerms(query);
  const byDoc = new Map<string, MatchesByDoc>();
  let total = 0;
  let returned = 0;

  if (terms.length > 0) {
    const lowercase = terms.filter((t) => !t.cjk).map((t) => t.term);
    // Chunks overlap by 15%, so a sentence near a boundary lives in two chunks.
    // Without this, a library would report matches it does not have.
    const seen = new Set<string>();

    chunks.forEach((chunk, chunkIndex) => {
      const lower = chunk.text.toLowerCase();
      // Cheap reject: a chunk that cannot contain any Latin term and has no CJK
      // term inside it needs no sentence splitting at all.
      if (lowercase.length > 0 && !lowercase.some((t) => lower.includes(t))) {
        if (!terms.some((t) => t.cjk && lower.includes(t.term))) return;
      }

      let doc = byDoc.get(chunk.docId);
      for (const { text, heading } of sentencesWithHeading(chunk.text, chunk.headingPath)) {
        const key = `${chunk.docId}\u0000${text.trim()}`;
        if (seen.has(key)) continue;
        const hit: string[] = [];
        matchedTerms(text.toLowerCase(), terms, hit);
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
  }

  const docs = Array.from(byDoc.values());
  // Chunks are visited in library order; keep the per-document lists in the same
  // order the reader will find them in the file.
  for (const doc of docs) doc.items.sort((a, b) => a.chunkIndex - b.chunkIndex);

  return {
    terms: terms.map((t) => t.term),
    total,
    docs,
    capped: total > returned,
    scanned: chunks.length,
  };
}
