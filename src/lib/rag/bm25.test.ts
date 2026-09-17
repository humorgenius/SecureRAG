import { describe, expect, it } from 'vitest';
import { Bm25Index, tokenize } from './bm25';

describe('tokenize', () => {
  it('produces CJK bigrams so partial phrases match', () => {
    const tokens = tokenize('解约通知期');
    expect(tokens).toContain('解');
    expect(tokens).toContain('解约');
    expect(tokens).toContain('通知');
    expect(tokens).toContain('知期');
  });

  it('keeps latin words and numeric identifiers', () => {
    const tokens = tokenize('§8.2 Termination: 60 days');
    expect(tokens).toContain('8.2');
    expect(tokens).toContain('termination');
    expect(tokens).toContain('60');
  });

  it('drops single latin letters that carry no signal', () => {
    expect(tokenize('a b c')).toHaveLength(0);
  });
});

describe('Bm25Index', () => {
  const docs = [
    '第八条 争议解决。双方应友好协商。',
    '第 8.2 条 解除。任一方提前六十天书面通知即可解约。',
    '附录 A 费用清单与付款方式。',
  ];

  it('ranks the passage that contains the exact identifier first', () => {
    const idx = new Bm25Index(docs);
    const hits = idx.search('8.2', 3);
    expect(hits[0].index).toBe(1);
  });

  it('ranks the passage that shares CJK bigrams', () => {
    const idx = new Bm25Index(docs);
    const hits = idx.search('解约需要提前多少天通知', 3);
    expect(hits[0].index).toBe(1);
  });

  it('returns nothing for a query with no term overlap', () => {
    const idx = new Bm25Index(docs);
    expect(idx.search('量子纠缠退相干时间', 3)).toHaveLength(0);
  });

  it('returns nothing for an empty corpus', () => {
    expect(new Bm25Index([]).search('任何查询', 3)).toHaveLength(0);
  });
});
