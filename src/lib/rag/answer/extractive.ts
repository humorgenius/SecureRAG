import { LIMITS } from '../limits';
import { tokenize } from '../bm25';
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
export function scoreSentence(sentence: string, queryTokens: Set<string>): { score: number; hits: number } {
  const tokens = tokenize(sentence);
  if (tokens.length === 0) return { score: 0, hits: 0 };
  const unique = new Set(tokens);
  let hits = 0;
  for (const t of unique) if (queryTokens.has(t)) hits++;
  const coverage = hits / Math.max(1, queryTokens.size);
  const density = hits / Math.max(1, unique.size);
  const lengthPenalty = sentence.length > 420 ? 0.7 : 1;
  return { score: (coverage * 0.7 + density * 0.3) * lengthPenalty, hits };
}

interface Candidate {
  chunkIndex: number;
  sentenceIndex: number;
  text: string;
  score: number;
  hits: number;
  inferred: boolean;
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
  const candidates: Candidate[] = [];

  chunks.forEach((chunk, chunkIndex) => {
    splitSentences(chunk.text).forEach((sentence, sentenceIndex) => {
      const { score, hits } = scoreSentence(sentence, queryTokens);
      candidates.push({ chunkIndex, sentenceIndex, text: sentence, score, hits, inferred: hits === 0 });
    });
  });

  const direct = candidates.filter((c) => c.hits > 0).sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex);

  if (direct.length === 0) {
    // Nothing in the corpus echoes the question at all.
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
        headingPath: chunk.headingPath,
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
