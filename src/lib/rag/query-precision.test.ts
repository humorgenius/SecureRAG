import { describe, expect, it } from 'vitest';
import { extractiveAnswer } from './answer/extractive';
import { tokenize } from './bm25';
import { contentChars, longestCommonRun } from './stopwords';
import type { ScoredChunk } from './types';

/**
 * The report that started this work:
 *
 *   "我给工具一个文件，发送'我的身份证号是多少？'，它会给我返回很多和这句话
 *    不相关的句子。"
 *
 * The cause was that single CJK characters were indexed and any one matching
 * token qualified a sentence, so 我 / 的 / 是 made half the document look
 * relevant. These tests pin the behaviour that replaces it.
 */
const chunkOf = (text: string): ScoredChunk => ({
  docId: 'd',
  docName: 'profile.md',
  chunkId: 'd:0',
  text,
  page: 1,
  offset: 0,
  headingPath: [],
  score: 1,
  source: 'fused',
});

const DOC = [
  '# 个人资料',
  '',
  '我是本表格的填写人。',
  '我的住址如下所述。',
  '',
  '## 证件',
  '',
  '身份证号码为 110101199003071234。',
  '',
  '本合同一式两份。',
].join('\n');

describe('the question reduces to its content', () => {
  it('strips function words and question words', () => {
    expect(contentChars('我的身份证号是多少？')).toBe('身份证号');
    expect(contentChars('我的身份证号是多少？')).not.toContain('我');
    expect(contentChars('我的身份证号是多少？')).not.toContain('多少');
  });

  it('does not index single characters that appear everywhere', () => {
    const tokens = tokenize('我是本表格的填写人。');
    expect(tokens).not.toContain('我');
    expect(tokens).not.toContain('的');
    expect(tokens).not.toContain('是');
  });

  it('measures shared runs, so a longer phrase beats a shorter one', () => {
    expect(longestCommonRun('身份证号', contentChars('身份证号码为 110101199003071234。'))).toBe(4);
    expect(longestCommonRun('身份证号', contentChars('我的住址如下所述。'))).toBe(0);
  });
});

describe('answering "我的身份证号是多少？"', () => {
  it('quotes the sentence with the answer and nothing else', () => {
    const answer = extractiveAnswer([chunkOf(DOC)], '我的身份证号是多少？', 'strict');
    expect(answer.notFound).toBe(false);
    expect(answer.text).toContain('110101199003071234');
    expect(answer.text).not.toContain('填写人');
    expect(answer.text).not.toContain('住址');
    expect(answer.text).not.toContain('一式两份');
    expect(answer.citations).toHaveLength(1);
    expect(answer.citations[0].headingPath.join('')).toContain('证件');
  });

  it('refuses rather than returning the nearest unrelated sentences', () => {
    const noAnswer = chunkOf(['# 个人资料', '', '我是本表格的填写人。', '我的住址如下所述。'].join('\n'));
    const answer = extractiveAnswer([noAnswer], '我的身份证号是多少？', 'strict');
    expect(answer.notFound).toBe(true);
    expect(answer.text).toBe('');
  });

  it('still matches when the document words it differently', () => {
    const longer = chunkOf('本人身份证件的有效期至 2031 年 12 月。');
    const answer = extractiveAnswer([longer], '我的身份证号是多少？', 'strict');
    expect(answer.notFound).toBe(false);
    expect(answer.text).toContain('2031');
  });
});
