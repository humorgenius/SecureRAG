import { describe, expect, it } from 'vitest';
import { cleanText, normalize, repeatedLines } from './normalize';
import type { RawDoc } from './types';

describe('repeatedLines', () => {
  it('finds running headers shared by most pages', () => {
    const pages = [
      '内部资料 · 第 1 页\n正文一',
      '内部资料 · 第 2 页\n正文二',
      '内部资料 · 第 3 页\n正文三',
      '完全不同的内容',
    ];
    const noise = repeatedLines(pages);
    expect(noise.has('内部资料 · 第 1 页')).toBe(false);
    expect(noise.has('内部资料 · 第 2 页')).toBe(false);
  });

  it('returns nothing for very short documents', () => {
    expect(repeatedLines(['a', 'a']).size).toBe(0);
  });
});

describe('cleanText', () => {
  it('drops page-number-only lines but keeps the paragraph boundary', () => {
    expect(cleanText('正文\n12\n继续', new Set())).toBe('正文\n\n继续');
  });

  it('rejoins hard-wrapped English lines inside a paragraph', () => {
    const out = cleanText('The notice period is sixty days\nfrom delivery of written notice.', new Set());
    expect(out).toBe('The notice period is sixty days from delivery of written notice.');
  });

  it('does not merge across headings or list items', () => {
    const out = cleanText('## 8.2 解约\n- 第一项\n- 第二项', new Set());
    expect(out.split('\n')).toEqual(['## 8.2 解约', '- 第一项', '- 第二项']);
  });

  it('does not merge a sentence ending with a full stop into the next line', () => {
    const out = cleanText('期限为六十天。\n另有三十天补救期。', new Set());
    expect(out.split('\n')).toHaveLength(2);
  });

  it('collapses runs of blank lines', () => {
    expect(cleanText('a\n\n\n\nb', new Set())).toBe('a\n\nb');
  });
});

describe('normalize', () => {
  it('removes a footer that repeats on every page', () => {
    const doc: RawDoc = {
      id: 'd1',
      name: 'contract.pdf',
      kind: 'pdf',
      size: 1000,
      pages: [
        { page: 1, text: '甲乙双方协议\n机密 · 不得外传\n第一条 定义' },
        { page: 2, text: '第二条 期限\n机密 · 不得外传\n第三条 解约' },
        { page: 3, text: '第四条 争议\n机密 · 不得外传' },
      ],
    };
    const out = normalize(doc);
    expect(out.pages.every((p) => !p.text.includes('机密 · 不得外传'))).toBe(true);
    expect(out.pages[0].text).toContain('第一条 定义');
  });
});
