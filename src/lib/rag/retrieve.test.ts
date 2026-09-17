import { describe, expect, it } from 'vitest';
import { confidenceOf, hybridRetrieve, isSilent, mmrSelect, rrfFuse } from './retrieve';
import { LIMITS } from './limits';
import type { Chunk } from './types';

const chunk = (id: string, text: string): Chunk => ({
  docId: 'd1',
  docName: 'contract.md',
  chunkId: id,
  text,
  headingPath: [],
  offset: 0,
});

const v = (...n: number[]) => Float32Array.from(n);

const CHUNKS: Chunk[] = [
  chunk('0', '附录 A 费用清单与付款方式，详见附表。'),
  chunk('1', '任一方提前 60 天书面通知即可解约。重大违约另有 30 天补救期。'),
  chunk('2', '§8.2 条款规定了通知的送达方式与生效时间。'),
  chunk('3', '本合同一式两份，双方各执一份。'),
];

const VECTORS = [v(1, 0, 0, 0), v(0, 1, 0, 0), v(0, 0, 1, 0), v(0, 0, 0, 1)];

describe('rrfFuse', () => {
  it('rewards a document that both retrievers found', () => {
    const fused = rrfFuse([
      [
        { index: 5, score: 0.9 },
        { index: 7, score: 0.8 },
      ],
      [
        { index: 7, score: 12 },
        { index: 9, score: 8 },
      ],
    ]);
    expect(fused.get(7)!).toBeGreaterThan(fused.get(5)!);
    expect(fused.get(7)!).toBeGreaterThan(fused.get(9)!);
  });

  it('uses the conventional k=60 flattening', () => {
    const fused = rrfFuse([[{ index: 0, score: 1 }]], 60);
    expect(fused.get(0)).toBeCloseTo(1 / 61, 6);
  });
});

describe('confidenceOf / isSilent', () => {
  it('treats a strong semantic match as answerable', () => {
    expect(isSilent(0.62, 0)).toBe(false);
    expect(confidenceOf(0.62, 0)).toBeCloseTo(0.62, 5);
  });

  it('treats a strong keyword hit as answerable even with a weak vector score', () => {
    expect(isSilent(0.11, 4.5)).toBe(false);
    expect(confidenceOf(0.11, 4.5)).toBeGreaterThan(LIMITS.minConfidence);
  });

  it('is silent when neither retriever has anything', () => {
    expect(isSilent(0.08, 0.4)).toBe(true);
    expect(confidenceOf(0.08, 0.4)).toBeLessThan(LIMITS.minConfidence);
  });
});

describe('hybridRetrieve', () => {
  it('returns the semantically matching chunk first', () => {
    const result = hybridRetrieve({
      chunks: CHUNKS,
      vectors: VECTORS,
      queryVector: VECTORS[1],
      queryText: '解约需要提前多少天通知？',
    });
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks[0].chunkId).toBe('1');
    expect(result.best).toBeGreaterThan(LIMITS.minConfidence);
  });

  it('reports the corpus as silent instead of returning a bad match', () => {
    const unrelated = [chunk('a', '本合同一式两份。'), chunk('b', '附录 A 费用清单与付款方式。')];
    const result = hybridRetrieve({
      chunks: unrelated,
      vectors: [v(0, 0, 0, 1), v(0, 0, 0, 1)],
      queryVector: v(1, 0, 0, 0),
      queryText: '量子纠缠退相干时间',
    });
    expect(result.chunks).toHaveLength(0);
    expect(result.best).toBeLessThan(LIMITS.minConfidence);
  });

  it('returns an empty result for an empty library', () => {
    const result = hybridRetrieve({ chunks: [], vectors: [], queryVector: v(1, 0), queryText: 'anything' });
    expect(result).toEqual({ chunks: [], best: 0 });
  });

  it('never returns more than k chunks', () => {
    const result = hybridRetrieve({
      chunks: CHUNKS,
      vectors: VECTORS,
      queryVector: VECTORS[1],
      queryText: '通知 解约 费用',
      k: 2,
    });
    expect(result.chunks.length).toBeLessThanOrEqual(2);
  });
});

describe('mmrSelect', () => {
  it('skips a near-duplicate chunk in favour of a distinct one', () => {
    const picked = mmrSelect(
      [
        { index: 0, relevance: 0.033, vector: v(1, 0, 0, 0) },
        { index: 1, relevance: 0.032, vector: v(1, 0, 0, 0) }, // identical to 0
        { index: 2, relevance: 0.03, vector: v(0.85, 0.53, 0, 0) },
      ],
      2,
      0.7,
      0.92
    );
    expect(picked).toEqual([0, 2]);
  });

  it('stops early rather than padding the context with duplicates', () => {
    const picked = mmrSelect(
      [
        { index: 0, relevance: 0.03, vector: v(1, 0, 0, 0) },
        { index: 1, relevance: 0.029, vector: v(1, 0, 0, 0) },
      ],
      5,
      0.7,
      0.92
    );
    expect(picked).toEqual([0]);
  });

  it('handles an empty candidate list', () => {
    expect(mmrSelect([], 3)).toEqual([]);
  });
});
