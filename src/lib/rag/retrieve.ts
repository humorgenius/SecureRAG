import { Bm25Index, type ScoredIndex } from './bm25';
import { LIMITS } from './limits';
import { VectorIndex, cosine } from './vector-index';
import type { Chunk, RetrievedContext, ScoredChunk, StoredChunk } from './types';

/**
 * Reciprocal rank fusion: score(d) = Σ 1/(k + rank_i(d)).
 * The constant k (60 by convention) flattens the influence of the very top ranks,
 * which keeps a single confident retriever from dominating the fused list.
 */
export function rrfFuse(lists: ScoredIndex[][], k = LIMITS.rrfK): Map<number, number> {
  const fused = new Map<number, number>();
  for (const list of lists) {
    for (let rank = 0; rank < list.length; rank++) {
      const { index } = list[rank];
      fused.set(index, (fused.get(index) ?? 0) + 1 / (k + rank + 1));
    }
  }
  return fused;
}

/**
 * Turn raw retriever scores into one 0-1 confidence value.
 * Dense cosine and BM25 raw scores live on different scales, so each is mapped to
 * 0-1 first; the best of the two wins. A question that matches semantically OR
 * contains a real keyword hit is treated as answerable.
 */
export function confidenceOf(bestDense: number, bestBm25: number): number {
  const densePart = Math.max(0, bestDense);
  const bm25Part = Math.min(1, bestBm25 / (LIMITS.bm25Floor * 3));
  return Math.max(densePart, bm25Part);
}

export function isSilent(bestDense: number, bestBm25: number): boolean {
  return bestDense < LIMITS.denseFloor && bestBm25 < LIMITS.bm25Floor;
}

/**
 * Maximal marginal relevance with an explicit near-duplicate guard.
 *
 * Relevance arrives on the RRF scale (≈0.01–0.03) while cosine similarity lives on
 * 0–1, so relevance is normalised to its own maximum first — otherwise the
 * similarity term would be meaningless. Candidates whose cosine to an already
 * selected chunk exceeds `nearDuplicate` are skipped outright rather than merely
 * penalised: with 15% chunk overlap, paraphrased neighbours would otherwise eat
 * the whole context window.
 */
export function mmrSelect(
  candidates: { index: number; relevance: number; vector: Float32Array }[],
  k: number,
  lambda: number = LIMITS.mmrLambda,
  nearDuplicate: number = LIMITS.nearDuplicateCosine
): number[] {
  if (candidates.length === 0) return [];
  const maxRel = Math.max(...candidates.map((c) => c.relevance), 1e-9);
  const pool = candidates
    .map((c) => ({ ...c, relevance: c.relevance / maxRel }))
    .sort((a, b) => b.relevance - a.relevance);

  const selected: number[] = [];
  const chosenVectors: Float32Array[] = [];

  while (selected.length < k && pool.length > 0) {
    let bestPos = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i];
      let maxSim = 0;
      for (const chosen of chosenVectors) maxSim = Math.max(maxSim, cosine(cand.vector, chosen));
      if (maxSim >= nearDuplicate) continue;
      const score = lambda * cand.relevance - (1 - lambda) * maxSim;
      if (score > bestScore) {
        bestScore = score;
        bestPos = i;
      }
    }

    if (bestPos === -1) break;
    selected.push(pool[bestPos].index);
    chosenVectors.push(pool[bestPos].vector);
    pool.splice(bestPos, 1);
  }

  return selected;
}

export interface HybridArgs {
  chunks: Chunk[];
  vectors: Float32Array[] | VectorIndex;
  queryVector: Float32Array;
  queryText: string;
  k?: number;
  mmrLambda?: number;
  useMmr?: boolean;
}

/** Dense + BM25 → RRF → MMR → top-k, with a confidence gate for "corpus is silent". */
export function hybridRetrieve({
  chunks,
  vectors,
  queryVector,
  queryText,
  k = LIMITS.topK,
  mmrLambda = LIMITS.mmrLambda,
  useMmr = true,
}: HybridArgs): RetrievedContext {
  if (chunks.length === 0) return { chunks: [], best: 0 };

  const vIndex = vectors instanceof VectorIndex ? vectors : new VectorIndex(vectors);
  const dense = vIndex.search(queryVector, LIMITS.candidates);
  const bm25 = new Bm25Index(chunks.map((c) => c.text)).search(queryText, LIMITS.candidates);

  const bestDense = dense[0]?.score ?? 0;
  const bestBm25 = bm25[0]?.score ?? 0;
  if (isSilent(bestDense, bestBm25)) return { chunks: [], best: confidenceOf(bestDense, bestBm25) };

  const fused = rrfFuse([dense, bm25]);
  const inDense = new Set(dense.map((d) => d.index));
  const inBm25 = new Set(bm25.map((d) => d.index));

  const ranked = Array.from(fused.entries())
    .map(([index, score]) => ({
      index,
      relevance: score,
      vector: vIndex.vectorAt(index) ?? new Float32Array(vIndex.dim),
      source: (inDense.has(index) && inBm25.has(index) ? 'fused' : inDense.has(index) ? 'dense' : 'bm25') as ScoredChunk['source'],
    }))
    .sort((a, b) => b.relevance - a.relevance);

  const picked = useMmr ? mmrSelect(ranked, k, mmrLambda) : ranked.slice(0, k).map((r) => r.index);
  const byIndex = new Map(ranked.map((r) => [r.index, r]));

  const out: ScoredChunk[] = picked
    .map((index) => {
      const r = byIndex.get(index)!;
      const chunk = chunks[index];
      return { ...chunk, score: r.relevance, source: r.source };
    })
    .filter(Boolean);

  return { chunks: out, best: confidenceOf(bestDense, bestBm25) };
}

/** Convenience for tests and the UI: retrieve straight from stored chunks. */
export function retrieveFromStored(
  stored: StoredChunk[],
  queryVector: Float32Array,
  queryText: string,
  k?: number
): RetrievedContext {
  return hybridRetrieve({
    chunks: stored,
    vectors: stored.map((s) => s.vector),
    queryVector,
    queryText,
    k,
  });
}
