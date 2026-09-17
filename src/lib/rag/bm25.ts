/**
 * Minimal BM25 over a small in-memory corpus.
 * Tokenisation is CJK-aware: every CJK character becomes a unigram, and adjacent
 * CJK pairs become bigrams (which is what makes "解约通知期" match "通知期").
 */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/;

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const lower = text.toLowerCase();
  const latin = lower.match(/[a-z0-9][a-z0-9._§#-]*/g) ?? [];
  for (const w of latin) {
    if (w.length > 1) tokens.push(w);
    else if (/[0-9]/.test(w)) tokens.push(w);
  }

  const cjkRuns = lower.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]+/g) ?? [];
  for (const run of cjkRuns) {
    const chars = Array.from(run);
    for (const ch of chars) tokens.push(ch);
    for (let i = 0; i < chars.length - 1; i++) tokens.push(chars[i] + chars[i + 1]);
  }
  return tokens;
}

export interface ScoredIndex {
  index: number;
  score: number;
}

export class Bm25Index {
  private readonly docs: string[][];
  private readonly df = new Map<string, number>();
  private readonly lengths: number[];
  private readonly avgLength: number;
  private readonly k1 = 1.2;
  private readonly b = 0.75;

  constructor(texts: string[]) {
    this.docs = texts.map((t) => tokenize(t));
    this.lengths = this.docs.map((d) => d.length);
    this.avgLength = this.lengths.reduce((a, b) => a + b, 0) / Math.max(1, this.lengths.length);

    for (const tokens of this.docs) {
      const unique = new Set(tokens);
      for (const term of unique) this.df.set(term, (this.df.get(term) ?? 0) + 1);
    }
  }

  private idf(term: string): number {
    const n = this.docs.length;
    const df = this.df.get(term) ?? 0;
    if (df === 0) return 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  search(query: string, k: number): ScoredIndex[] {
    const terms = tokenize(query);
    if (terms.length === 0 || this.docs.length === 0) return [];

    const uniqueQueryTerms = Array.from(new Set(terms));
    const scores = new Float64Array(this.docs.length);

    for (const term of uniqueQueryTerms) {
      const idf = this.idf(term);
      if (idf === 0) continue;
      for (let i = 0; i < this.docs.length; i++) {
        const doc = this.docs[i];
        // count occurrences without allocating a map per query term
        let tf = 0;
        for (let j = 0; j < doc.length; j++) if (doc[j] === term) tf++;
        if (tf === 0) continue;
        const denom = tf + this.k1 * (1 - this.b + (this.b * this.lengths[i]) / Math.max(1e-6, this.avgLength));
        scores[i] += idf * ((tf * (this.k1 + 1)) / denom);
      }
    }

    const out: ScoredIndex[] = [];
    for (let i = 0; i < scores.length; i++) if (scores[i] > 0) out.push({ index: i, score: scores[i] });
    out.sort((a, b) => b.score - a.score || a.index - b.index);
    return out.slice(0, k);
  }
}
