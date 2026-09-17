import { describe, expect, it } from 'vitest';
import { matchAll, matchExact, normalizePhrase, queryTerms, MATCH_ITEM_CAP } from './match-all';
import type { Chunk } from './types';

function chunk(docId: string, docName: string, index: number, text: string, headingPath: string[] = []): Chunk {
  return { docId, docName, chunkId: `${docId}:${index}`, text, headingPath, offset: index * 1000 };
}

/** The case that started this: one word, mentioned over and over. */
const POTATO_DOC = Array.from(
  { length: 30 },
  (_, i) => `Note ${i + 1}: the potato harvest in region ${i + 1} was recorded on day ${i + 1}.`
).join(' ');

describe('queryTerms', () => {
  it('keeps meaningful words and drops question words', () => {
    expect(queryTerms('Where is the potato stored?').map((t) => t.term)).toEqual(['potato', 'stored']);
    expect(queryTerms('the and of').map((t) => t.term)).toEqual([]);
  });

  it('uses adjacent content bigrams for CJK, never single characters', () => {
    const terms = queryTerms('我的身份证号是多少？').map((t) => t.term);
    expect(terms).toContain('身份');
    expect(terms).toContain('证号');
    // 我 / 的 / 是 are question words and single characters are not evidence.
    expect(terms).not.toContain('我');
    expect(terms).not.toContain('的');
    expect(terms).not.toContain('是');
  });

  it('does not build a bigram across a stop character', () => {
    // 身 的 份 are not adjacent in the original text, so 份证 must not appear.
    expect(queryTerms('身的份').map((t) => t.term)).not.toContain('份证');
  });
});

describe('matchAll', () => {
  it('returns every sentence that mentions the word, not a top-k sample', () => {
    const chunks = [chunk('d1', 'Potato Picker.pdf', 0, POTATO_DOC)];
    const result = matchAll(chunks, 'potato');
    expect(result.total).toBe(30);
    expect(result.capped).toBe(false);
    expect(result.docs).toHaveLength(1);
    expect(result.docs[0].count).toBe(30);
    expect(result.docs[0].items).toHaveLength(30);
    expect(result.docs[0].docName).toBe('Potato Picker.pdf');
  });

  it('groups matches per document and keeps them in document order', () => {
    const chunks = [
      chunk('d1', 'a.pdf', 0, 'The potato crop failed. The potato price rose.'),
      chunk('d2', 'b.pdf', 0, 'A potato landed here.'),
      chunk('d1', 'a.pdf', 1, 'Another potato appeared later.'),
    ];
    const result = matchAll(chunks, 'potato');
    expect(result.total).toBe(4);
    expect(result.docs.map((d) => [d.docName, d.count])).toEqual([
      ['a.pdf', 3],
      ['b.pdf', 1],
    ]);
    // d1 items come from chunk 0 then chunk 1, never interleaved.
    // chunkIndex is the position in the library, so d1's second chunk is 2.
    expect(result.docs[0].items.map((i) => i.chunkIndex)).toEqual([0, 0, 2]);
  });

  it('reports the true total even when the returned list is capped', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, POTATO_DOC)];
    const result = matchAll(chunks, 'potato', 5);
    expect(result.total).toBe(30);
    expect(result.capped).toBe(true);
    expect(result.docs[0].items).toHaveLength(5);
    expect(MATCH_ITEM_CAP).toBeGreaterThan(5);
  });

  it('matches word prefixes but not word interiors', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, 'The potatoes were stored. A sweetpotato is different.')];
    const result = matchAll(chunks, 'potato');
    expect(result.total).toBe(1);
    expect(result.docs[0].items[0].text).toContain('potatoes');
  });

  it('finds Chinese sentences for a question phrased naturally', () => {
    const chunks = [
      chunk('d1', '档案.txt', 0, '我的身份证号码为 110101199003071234。今天天气不错。证件丢失需要补办。'),
      chunk('d2', '合同.txt', 0, '本合同的签署不需要身份证件复印件。'),
    ];
    const result = matchAll(chunks, '我的身份证号是多少？');
    expect(result.total).toBe(2);
    expect(result.docs.map((d) => d.docName)).toEqual(['档案.txt', '合同.txt']);
  });

  it('counts a sentence once even when chunk overlap repeats it', () => {
    // 15% overlap means the boundary sentence sits in both chunks.
    const chunks = [
      chunk('d1', 'a.pdf', 0, 'The potato was stored. The potato was sold.'),
      chunk('d1', 'a.pdf', 1, 'The potato was sold. The potato was eaten.'),
    ];
    const result = matchAll(chunks, 'potato');
    expect(result.total).toBe(3);
    expect(result.docs[0].items.map((i) => i.text)).toEqual([
      'The potato was stored.',
      'The potato was sold.',
      'The potato was eaten.',
    ]);
  });

  it('returns nothing when the question carries no searchable term', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, 'The potato crop failed.')];
    const result = matchAll(chunks, '的是什么');
    expect(result.total).toBe(0);
    expect(result.docs).toEqual([]);
    expect(result.terms).toEqual([]);
  });

  it('carries the heading breadcrumb of each match', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, '任一方提前六十天书面通知即可解约。', ['服务协议', '8.2 解约'])];
    const result = matchAll(chunks, '解约');
    expect(result.docs[0].items[0].heading).toEqual(['服务协议', '8.2 解约']);
  });
});

describe('matchExact', () => {
  it('finds only the sentence containing the phrase as typed', () => {
    const chunks = [
      chunk('d1', 'a.pdf', 0, 'The potato harvest was late. The potatoes were small. A sweetpotato is not a potato.'),
    ];
    const result = matchExact(chunks, 'potato');
    expect(result.total).toBe(2);
    expect(result.docs[0].items.map((i) => i.text)).toEqual([
      'The potato harvest was late.',
      'A sweetpotato is not a potato.',
    ]);
  });

  it('ignores letter case, because that is not a different word to a reader', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, 'The Potato harvest was late.')];
    expect(matchExact(chunks, 'POTATO').total).toBe(1);
    expect(matchExact(chunks, 'potato').total).toBe(1);
  });

  it('matches a multi-word phrase only as a whole', () => {
    const chunks = [
      chunk('d1', 'a.pdf', 0, 'The potato harvest was late. The potato price rose.'),
    ];
    expect(matchExact(chunks, 'potato harvest').total).toBe(1);
    expect(matchExact(chunks, 'potato   harvest').total).toBe(1);
    expect(matchExact(chunks, 'harvest potato').total).toBe(0);
  });

  it('matches Chinese phrases as substrings, with no word boundaries to respect', () => {
    const chunks = [
      chunk('d1', 'a.txt', 0, '员工的身份证号码登记在第 1 页。他的身份证件已经过期。'),
    ];
    expect(matchExact(chunks, '身份证').total).toBe(2);
    expect(matchExact(chunks, '身份').total).toBe(2);
    expect(matchExact(chunks, '员工证').total).toBe(0);
  });

  it('reports nothing when the phrase is absent, and handles an empty query', () => {
    const chunks = [chunk('d1', 'a.pdf', 0, 'The potato harvest was late.')];
    expect(matchExact(chunks, 'banana').total).toBe(0);
    expect(matchExact(chunks, '   ').total).toBe(0);
  });

  it('normalises whitespace in the query', () => {
    expect(normalizePhrase('  potato \n harvest  ')).toBe('potato harvest');
  });
});
