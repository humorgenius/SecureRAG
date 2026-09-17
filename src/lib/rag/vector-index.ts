import { LIMITS } from './limits';
import type { ScoredIndex } from './bm25';

/** L2-normalise in place and return the same array, so cosine similarity becomes a dot product. */
export function l2normalize(vector: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) sum += vector[i] * vector[i];
  const norm = Math.sqrt(sum);
  if (norm === 0) return vector;
  for (let i = 0; i < vector.length; i++) vector[i] /= norm;
  return vector;
}

export function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function cosine(a: Float32Array, b: Float32Array): number {
  let s = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    s += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : s / d;
}

/**
 * Brute-force flat index. At the documented ceiling (20,000 chunks × 512 dims)
 * a full scan is ~10M multiply-adds, which lands in the low milliseconds in a
 * Worker — fast enough that an ANN index would be complexity without benefit.
 */
export class VectorIndex {
  readonly dim: number;
  private readonly vectors: Float32Array[];

  constructor(vectors: Float32Array[], dim?: number) {
    this.vectors = vectors.map((v) => l2normalize(v));
    this.dim = dim ?? this.vectors[0]?.length ?? 0;
    if (this.vectors.some((v) => v.length !== this.dim)) {
      throw new Error('VectorIndex: inconsistent embedding dimensions');
    }
  }

  get size(): number {
    return this.vectors.length;
  }

  vectorAt(i: number): Float32Array | undefined {
    return this.vectors[i];
  }

  search(query: Float32Array, k = LIMITS.candidates): ScoredIndex[] {
    if (this.vectors.length === 0) return [];
    const q = l2normalize(Float32Array.from(query));
    const out: ScoredIndex[] = [];
    for (let i = 0; i < this.vectors.length; i++) out.push({ index: i, score: dot(q, this.vectors[i]) });
    out.sort((a, b) => b.score - a.score || a.index - b.index);
    return out.slice(0, k);
  }
}
