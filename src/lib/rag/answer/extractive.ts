import { LIMITS } from '../limits';
import { tokenize } from '../bm25';
import { isHeadingLine } from '../chunk';
import { contentChars, longestCommonRun } from '../stopwords';
import type { AnswerResult, CitationRef, ScoredChunk, Strictness } from '../types';

const SENTENCE_SPLIT = /(?<=[。！？；])|(?<=[.!?;])\s+/;

export function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * Sentence relevance inside a retrieved chunk.
 * coverage = how much of the question appears in the sentence
 * density  = how much of the sentence is question material (penalises boilerplate)
 * Both matter: a long paragraph containing one query word is less useful than a
 * short clause containing three.
 */
export function scoreSentence(
  sentence: string,
  queryTokens: Set<string>,
  queryContent: string
): { score: number; hits: number; run: number; qualified: boolean } {
  // The "don't split my word" rule, measured rather than guessed: how many
  // consecutive content characters does this sentence share with the question?
  // Asking "身份证" then demands that 身份 actually appear — a sentence holding
  // only 身份 or only 证 is not treated as containing the answer.
  const run = longestCommonRun(queryContent, contentChars(sentence));

  const tokens = tokenize(sentence);
  if (tokens.length === 0) return { score: 0, hits: 0, run, qualified: false };

  const unique = new Set(tokens);
  let hits = 0;
  for (const t of unique) if (queryTokens.has(t)) hits++;

  const coverage = hits / Math.max(1, queryTokens.size);
  const density = hits / Math.max(1, unique.size);
  const lengthPenalty = sentence.length > 420 ? 0.7 : 1;
  const runShare = queryContent.length ? Math.min(1, run / queryContent.length) : 0;
  const qualified = run >= 2;

  return {
    score: qualified ? (runShare * 0.55 + coverage * 0.3 + density * 0.15) * lengthPenalty : 0,
    hits,
    run,
    qualified,
  };
}

interface Candidate {
  chunkIndex: number;
  sentenceIndex: number;
  text: string;
  score: number;
  hits: number;
  inferred: boolean;
  /** the section this sentence sits under — may be narrower than the chunk's */
  heading: string[];
  /** longest run of content characters shared with the question */
  run: number;
  /** cleared the "shares a meaningful run" bar — only these may be quoted */
  qualified: boolean;
}

/**
 * Recover the heading that applies to each sentence inside a chunk.
 *
 * The chunker keeps headings as lines inside the chunk text, so the applicable
 * section can be read back out of it. Without this a chunk that spans two
 * sections reports only the chunk's final heading, and a quote taken from
 * "8.2 解约" is displayed under "9.1 费用" — the citation then sends the reader
 * to the wrong part of the document.
 *
 * Sentences that appear before any heading in the chunk fall back to the
 * chunk's own heading path, which is the best information available there.
 */
export function sentencesWithHeading(text: string, base: string[]): { text: string; heading: string[] }[] {
  const out: { text: string; heading: string[] }[] = [];
  let local: string[] | null = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isHeadingLine(line)) {
      // Keep the document's top-level heading so the path still reads as a path.
      local = [...(base.length ? [base[0]] : []), line.replace(/^#{1,6}\s*/, '')];
      continue;
    }
    for (const sentence of splitSentences(line)) {
      out.push({ text: sentence, heading: local ? [...local] : [...base] });
    }
  }
  return out;
}

const MAX_SENTENCES: Record<Strictness, number> = { strict: 4, balanced: 6 };

/**
 * Extractive answering: no language model writes anything, the most relevant
 * source sentences are selected, kept in their original order, and every one of
 * them carries a citation marker. This is the default tier precisely because it
 * cannot hallucinate — it can only quote.
 */
export function extractiveAnswer(chunks: ScoredChunk[], question: string, mode: Strictness): AnswerResult {
  if (chunks.length === 0) {
    return { mode, text: '', citations: [], usedChunkIds: [], notFound: true, inferred: [] };
  }

  const queryTokens = new Set(tokenize(question));
  const queryContent = contentChars(question);
  const candidates: Candidate[] = [];

  chunks.forEach((chunk, chunkIndex) => {
    sentencesWithHeading(chunk.text, chunk.headingPath).forEach(({ text: sentence, heading }, sentenceIndex) => {
      const { score, hits, run, qualified } = scoreSentence(sentence, queryTokens, queryContent);
      // Keep EVERY sentence as a candidate so balanced mode can still show the
      // surrounding context; the gate only decides what may be presented as the
      // answer. Filtering here instead would also remove the neighbours that
      // balanced mode exists to provide.
      candidates.push({ chunkIndex, sentenceIndex, text: sentence, score, hits, inferred: hits === 0, heading, run, qualified });
    });
  });

  // The answer pool. A sentence must share at least two consecutive content
  // characters with the question: single characters like 我 / 的 / 是 are not
  // evidence, and quoting them is what produced unreadable answers.
  const direct = candidates
    .filter((c) => c.qualified)
    .sort((a, b) => b.run - a.run || b.score - a.score || a.chunkIndex - b.chunkIndex);

  if (direct.length === 0) {
    // Nothing in the corpus shares a meaningful run with the question.
    return { mode, text: '', citations: [], usedChunkIds: [], notFound: true, inferred: [] };
  }

  const picked: Candidate[] = direct.slice(0, MAX_SENTENCES[mode]);

  if (mode === 'balanced') {
    // Pull in the neighbouring sentences of the chunks we already trust, and label
    // them as inferred so the reader knows which parts are not direct quotes.
    const seen = new Set(picked.map((c) => `${c.chunkIndex}:${c.sentenceIndex}`));
    for (const c of picked) {
      for (const delta of [-1, 1]) {
        const neighbour = candidates.find(
          (n) => n.chunkIndex === c.chunkIndex && n.sentenceIndex === c.sentenceIndex + delta
        );
        if (!neighbour) continue;
        if (neighbour.text.length < 30 || neighbour.text.length > 420) continue;
        const key = `${neighbour.chunkIndex}:${neighbour.sentenceIndex}`;
        if (seen.has(key)) continue;
        seen.add(key);
        picked.push({ ...neighbour, inferred: true });
      }
    }
  }

  // Restore document order so the answer reads like the source, not like a ranking.
  picked.sort((a, b) => a.chunkIndex - b.chunkIndex || a.sentenceIndex - b.sentenceIndex);

  const citationOfChunk = new Map<number, number>();
  const citations: CitationRef[] = [];
  const parts: string[] = [];
  const inferred: string[] = [];

  for (const c of picked) {
    const chunk = chunks[c.chunkIndex];
    let marker = citationOfChunk.get(c.chunkIndex);
    if (marker === undefined) {
      marker = citations.length + 1;
      citationOfChunk.set(c.chunkIndex, marker);
      citations.push({
        index: marker,
        chunkId: chunk.chunkId,
        docId: chunk.docId,
        docName: chunk.docName,
        page: chunk.page,
        // picked is in document order, so the first quote from this chunk is the
        // earliest one — its section is what the reader will land on.
        headingPath: c.heading.length ? c.heading : chunk.headingPath,
        quote: c.text.length > 420 ? `${c.text.slice(0, 417)}…` : c.text,
      });
    }
    parts.push(`${c.text}[${marker}]`);
    if (c.inferred) inferred.push(c.text);
  }

  return {
    mode,
    text: parts.join(' '),
    citations,
    usedChunkIds: citations.map((c) => c.chunkId),
    notFound: false,
    inferred,
  };
}

/** Message shown when nothing cleared the relevance gate. */
export function notFoundMessage(mode: Strictness, lang: 'en' | 'zh'): string {
  if (mode === 'strict') {
    return lang === 'zh'
      ? '你的文档中没有找到与这个问题相关的内容。可以换个说法，或把严格度调成「允许推理」。'
      : 'Nothing in your documents matches that question. Try different wording, or switch strictness to “allow inference”.';
  }
  return lang === 'zh'
    ? '相关度太低，无法给出有依据的回答。建议换个更具体的问法。'
    : 'The match was too weak to answer with any support. Try a more specific question.';
}

export function topKGuard(k: number): number {
  return Math.max(1, Math.min(k, LIMITS.candidates));
}
