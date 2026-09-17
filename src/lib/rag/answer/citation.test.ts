
import { describe, expect, it } from 'vitest';
import { extractiveAnswer, sentencesWithHeading } from './extractive';
import type { ScoredChunk } from '../types';

/** Mirrors the chunk the live browser produced for a two-section markdown file. */
const CROSS_SECTION: ScoredChunk = {
  docId: 'd',
  docName: 'agreement.md',
  chunkId: 'd:0',
  text:
    '服务协议\n8.2 解约\n任一方提前六十天书面通知即可解约。重大违约另有三十天补救期。\n' +
    '9.1 费用\n双方各自承担己方产生的费用，并妥善保存相关凭证以备查验之需。',
  page: 1,
  offset: 0,
  // the chunk's own path is the state at its END, which is why citing it was wrong
  headingPath: ['服务协议', '9.1 费用'],
  score: 1,
  source: 'fused',
};

describe('citation precision inside a chunk that spans two sections', () => {
  it('attributes each sentence to the heading it actually falls under', () => {
    const sentences = sentencesWithHeading(CROSS_SECTION.text, CROSS_SECTION.headingPath);
    const about = sentences.find((s) => s.text.includes('解约'));
    const fees = sentences.find((s) => s.text.includes('费用'));
    expect(about?.heading).toEqual(['服务协议', '8.2 解约']);
    expect(fees?.heading).toEqual(['服务协议', '9.1 费用']);
  });

  it('cites the 8.2 section for a question answered by the 8.2 sentence', () => {
    const answer = extractiveAnswer([CROSS_SECTION], '解约需要提前多久通知？', 'strict');
    expect(answer.notFound).toBe(false);
    expect(answer.text).toContain('六十天');
    expect(answer.citations[0]?.headingPath).toEqual(['服务协议', '8.2 解约']);
  });

  it('still cites the chunk path when the chunk has no heading of its own', () => {
    const flat: ScoredChunk = { ...CROSS_SECTION, text: '任一方提前六十天书面通知即可解约。', headingPath: ['合同'] };
    const answer = extractiveAnswer([flat], '解约需要提前多久通知？', 'strict');
    expect(answer.citations[0]?.headingPath).toEqual(['合同']);
  });
});
