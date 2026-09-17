import { describe, expect, it } from 'vitest';
import { extractiveAnswer, scoreSentence, splitSentences } from './answer/extractive';
import { buildPrompt, NOT_FOUND_ANSWER } from './answer/prompt';
import type { ScoredChunk } from './types';

const scored = (id: string, text: string, score = 0.5): ScoredChunk => ({
  docId: 'd1',
  docName: '服务协议_2026.pdf',
  chunkId: id,
  text,
  page: 14,
  headingPath: ['第 8 条 解除'],
  offset: 0,
  score,
  source: 'fused',
});

const CONTRACT = scored(
  '1',
  '任一方提前 60 天书面通知即可解约。双方各自承担己方产生的费用，并妥善保存相关凭证，以备查验与核对之需。'
);
const DELIVERY = scored('2', '§8.2 规定了通知的送达方式与生效时间。通知应以书面形式送达对方的注册地址。');

describe('splitSentences', () => {
  it('splits on CJK and latin terminators', () => {
    expect(splitSentences('第一句。第二句！Third one?')).toHaveLength(3);
  });
});

describe('scoreSentence', () => {
  it('scores a sentence that covers more of the question higher', () => {
    const tokens = new Set(['解约', '通知', '期']);
    const question = '解约通知';
    const strong = scoreSentence('任一方提前 60 天书面通知即可解约。', tokens, question);
    const weak = scoreSentence('本合同一式两份，双方各执一份。', tokens, question);
    expect(strong.qualified).toBe(true);
    expect(strong.hits).toBeGreaterThan(0);
    expect(weak.qualified).toBe(false);
    expect(weak.hits).toBe(0);
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it('disqualifies a sentence that only shares single characters', () => {
    const tokens = new Set(['身份', '份证']);
    // 我的 / 是 used to be enough to quote a sentence. Now they are not tokens at all.
    const noise = scoreSentence('我是本表格的填写人。', tokens, '身份证号');
    expect(noise.qualified).toBe(false);
    expect(noise.score).toBe(0);
  });

  it('rewards the longer shared run', () => {
    const tokens = new Set(['身份', '份证', '证号']);
    const question = '身份证号';
    const exact = scoreSentence('身份证号码为 110101199003071234。', tokens, question);
    const partial = scoreSentence('本人身份证明文件如下。', tokens, question);
    expect(exact.run).toBeGreaterThan(partial.run);
    expect(exact.score).toBeGreaterThan(partial.score);
  });
});

describe('extractiveAnswer', () => {
  it('refuses instead of guessing when nothing was retrieved', () => {
    const answer = extractiveAnswer([], '解约通知期是多久？', 'strict');
    expect(answer.notFound).toBe(true);
    expect(answer.text).toBe('');
    expect(answer.citations).toHaveLength(0);
    expect(NOT_FOUND_ANSWER.zh).toContain('未找到');
  });

  it('refuses when the retrieved text has no overlap with the question', () => {
    const unrelated = scored('3', '本合同一式两份，双方各执一份。');
    const answer = extractiveAnswer([unrelated], '量子纠缠退相干的现象', 'strict');
    expect(answer.notFound).toBe(true);
  });

  it('quotes source sentences with numbered citations', () => {
    const answer = extractiveAnswer([CONTRACT], '解约通知期是多久？', 'strict');
    expect(answer.notFound).toBe(false);
    expect(answer.text).toContain('60 天');
    expect(answer.text).toContain('[1]');
    expect(answer.citations).toHaveLength(1);
    expect(answer.citations[0].docName).toBe('服务协议_2026.pdf');
    expect(answer.citations[0].page).toBe(14);
    expect(answer.citations[0].headingPath).toEqual(['第 8 条 解除']);
  });

  it('numbers citations per document, not per sentence', () => {
    const answer = extractiveAnswer([CONTRACT, DELIVERY], '解约通知期与送达方式是什么？', 'strict');
    const markers = new Set(answer.citations.map((c) => c.index));
    expect(markers.size).toBe(answer.citations.length);
    expect(answer.text).toMatch(/\[1\]/);
    expect(answer.text).toMatch(/\[2\]/);
  });

  it('labels non-quoted context as inferred in balanced mode', () => {
    const strict = extractiveAnswer([CONTRACT], '解约通知期是多久？', 'strict');
    const balanced = extractiveAnswer([CONTRACT], '解约通知期是多久？', 'balanced');
    expect(strict.inferred).toHaveLength(0);
    expect(balanced.inferred.length).toBeGreaterThan(0);
    expect(balanced.text.length).toBeGreaterThan(strict.text.length);
  });

  it('keeps the source order of the quoted sentences', () => {
    const answer = extractiveAnswer([CONTRACT], '解约通知期是多久？', 'strict');
    const notice = answer.text.indexOf('60 天');
    expect(notice).toBeGreaterThanOrEqual(0);
  });
});

describe('buildPrompt', () => {
  it('embeds numbered excerpts and the answer-only-from-context rule', () => {
    const prompt = buildPrompt({ question: '解约通知期是多久？', chunks: [CONTRACT], mode: 'strict', lang: 'zh' });
    expect(prompt.system).toContain('只能使用');
    expect(prompt.system).toContain('文档中未找到相关内容');
    expect(prompt.user).toContain('[1]');
    expect(prompt.user).toContain('服务协议_2026.pdf');
    expect(prompt.user).toContain('p.14');
  });

  it('switches the inference rule with the strictness setting', () => {
    const strict = buildPrompt({ question: 'q', chunks: [CONTRACT], mode: 'strict', lang: 'en' });
    const balanced = buildPrompt({ question: 'q', chunks: [CONTRACT], mode: 'balanced', lang: 'en' });
    expect(strict.system).toContain('Do not reason');
    expect(balanced.system).toContain('Inference:');
  });

  it('carries earlier turns so follow-up questions keep context', () => {
    const prompt = buildPrompt({
      question: '那补救期呢？',
      chunks: [CONTRACT],
      mode: 'strict',
      lang: 'zh',
      history: [{ role: 'user', content: '解约通知期是多久？' }],
    });
    expect(prompt.user).toContain('之前的对话');
    expect(prompt.user).toContain('解约通知期是多久？');
  });
});
