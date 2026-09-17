import { describe, expect, it } from 'vitest';
import { chunkDoc } from './chunk';
import type { RawDoc } from './types';

/** The exact sample the browser verification script drops into the tool page. */
export const SAMPLE = [
  '# 服务协议',
  '',
  '## 8.2 解约',
  '任一方提前 60 天书面通知即可解约。重大违约在解约权生效前另有 30 天补救期。',
  '',
  '## 9.1 费用',
  '双方各自承担己方产生的费用，并妥善保存相关凭证以备查验与核对之需。',
  '',
  '| 项目 | 期限 | 说明 |',
  '| --- | --- | --- |',
  '| 通知期 | 60 天 | 书面送达 |',
  '',
].join('\n');

const doc: RawDoc = {
  id: 'd',
  name: 'agreement.md',
  kind: 'md',
  size: SAMPLE.length,
  pages: [{ page: 1, text: SAMPLE }],
};

describe('markdown structure (browser sample)', () => {
  it('tracks the heading path of each chunk', () => {
    const chunks = chunkDoc(doc);
    console.log('chunks:', JSON.stringify(chunks.map((c) => ({ id: c.chunkId, path: c.headingPath, len: c.text.length, head: c.text.slice(0, 40) })), null, 1));
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((c) => c.headingPath.includes('服务协议'))).toBe(true);
  });

  it('keeps headings out of the chunk body text', () => {
    const joined = chunkDoc(doc).map((c) => c.text).join('\n');
    expect(joined).not.toContain('# 服务协议');
    expect(joined).not.toContain('## 8.2');
  });
});
