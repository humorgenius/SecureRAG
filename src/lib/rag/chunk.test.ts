import { describe, expect, it } from 'vitest';
import { chunkDoc, tailSentences } from './chunk';
import { LIMITS } from './limits';
import type { RawDoc } from './types';

const doc = (text: string): RawDoc => ({
  id: 'd1',
  name: 'contract.md',
  kind: 'md',
  size: text.length,
  pages: [{ page: 1, text }],
});

describe('chunkDoc', () => {
  it('keeps markdown headings out of body text and records the heading path', () => {
    const chunks = chunkDoc(
      doc(
        [
          '# 服务协议',
          '',
          '## 第 8 条 解除',
          '',
          '任一方提前六十天书面通知即可解约。重大违约另有三十天补救期。',
        ].join('\n')
      )
    );
    const body = chunks.find((c) => c.text.includes('六十天'));
    expect(body).toBeDefined();
    expect(body!.headingPath).toContain('服务协议');
    expect(body!.headingPath).toContain('第 8 条 解除');
  });

  it('never splits a sentence across chunks when the text allows it', () => {
    const sentence = '这是用于测试分块行为的一句话，长度适中。';
    const text = Array.from({ length: 120 }, () => sentence).join('');
    const chunks = chunkDoc(doc(text));
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      // every chunk must end on a sentence terminator, not mid-sentence
      expect(/[。！？]$/.test(chunk.text.trim())).toBe(true);
    }
  });

  it('respects the size ceiling (allowing one long sentence of slack)', () => {
    const sentence = 'abcdefghij 。';
    const text = Array.from({ length: 200 }, () => sentence).join('');
    for (const chunk of chunkDoc(doc(text))) {
      expect(chunk.text.length).toBeLessThanOrEqual(LIMITS.chunkSize * 1.3);
    }
  });

  it('keeps table rows intact instead of reflowing them into prose', () => {
    const chunks = chunkDoc(
      doc(
        [
          '| 项目 | 期限 | 说明 |',
          '| --- | --- | --- |',
          '| 解约 | 60 天 | 任一方书面通知即可解约 |',
          '| 违约 | 30 天 | 重大违约的补救期 |',
        ].join('\n')
      )
    );
    const joined = chunks.map((c) => c.text).join('\n');
    expect(joined).toContain('| 解约 | 60 天 | 任一方书面通知即可解约 |');
    expect(joined).toContain('| 违约 | 30 天 | 重大违约的补救期 |');
    expect(joined.split('\n').filter((l) => l.startsWith('|'))).toHaveLength(4);
  });

  it('drops chunks that are too short to be worth embedding', () => {
    const chunks = chunkDoc(doc('短。'));
    expect(chunks).toHaveLength(0);
  });

  it('numbers chunks in order and links them to their document', () => {
    const text = Array.from({ length: 60 }, (_, i) => `这是第${i}句足够长的测试文本，用来撑出多个分块。`).join('');
    const chunks = chunkDoc(doc(text));
    chunks.forEach((c, i) => {
      expect(c.chunkId).toBe(`d1:${i}`);
      expect(c.docId).toBe('d1');
      expect(c.docName).toBe('contract.md');
    });
  });
});

describe('tailSentences', () => {
  it('returns whole trailing sentences within the carry budget', () => {
    const tail = tailSentences('第一句。第二句。第三句。', 8);
    expect(tail).toContain('第三句。');
    expect(tail).not.toContain('第一句。');
  });

  it('returns nothing when the budget is zero', () => {
    expect(tailSentences('第一句。', 0)).toBe('');
  });
});
