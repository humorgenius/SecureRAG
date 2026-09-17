import { describe, expect, it } from 'vitest';
import { buildSessionExport, type ExportLabels, type ExportMeta } from './export';
import type { SessionMessage } from './store';

const labels: ExportLabels = {
  notFound: 'not found',
  matchesTitle: (n) => `${n} matches`,
  filesCount: (n) => `in ${n} files`,
  perDoc: (n) => `${n}`,
  note: 'literal matches',
};

const meta: ExportMeta = {
  at: '2026-09-17T00:00:00.000Z',
  embeddingModel: 'bge-small-zh-v1.5',
  generationModel: 'qwen2.5-0.5b',
  useGeneration: false,
  strictness: 'balanced',
};

const withMatches: SessionMessage[] = [
  { id: '1', role: 'user', text: 'potato', at: 0 },
  {
    id: '2',
    role: 'assistant',
    text: 'Answer from your documents [1]',
    at: 1,
    citations: [{ index: 1, chunkId: 'd1:0', docName: '示例文件（1）', page: 4, headingPath: ['A'], quote: 'The potato was weighed.' }],
    matches: {
      terms: ['potato'],
      total: 3,
      capped: false,
      scanned: 2,
      docs: [
        {
          docId: 'd1',
          docName: '示例文件（1）',
          count: 2,
          items: [
            { heading: ['合同', '8.2 解约'], text: 'The potato was weighed.', chunkId: 'd1:0', chunkIndex: 0, terms: ['potato'] },
            { heading: [], text: 'A second potato appeared.', chunkId: 'd1:0', chunkIndex: 0, terms: ['potato'] },
          ],
        },
        {
          docId: 'd2',
          docName: '示例文件（2）',
          count: 1,
          items: [{ heading: [], text: 'Potato notes.', chunkId: 'd2:0', chunkIndex: 0, terms: ['potato'] }],
        },
      ],
    },
  },
];

/**
 * The export has to carry the whole reason the tool exists: every sentence that
 * contains the word, not just the ones the answer happened to quote.
 */
describe('session export', () => {
  it('puts every matched sentence in the plain-text export', () => {
    const out = buildSessionExport('txt', withMatches, meta, labels);
    expect(out).toContain('Q: potato');
    for (const sentence of ['The potato was weighed.', 'A second potato appeared.', 'Potato notes.']) {
      expect(out, sentence).toContain(sentence);
    }
    expect(out).toContain('示例文件（1）');
    expect(out).toContain('示例文件（2）');
    expect(out).toContain('3 matches');
    expect(out).toContain('合同 › 8.2 解约');
  });

  it('does the same in markdown while keeping the citations', () => {
    const out = buildSessionExport('md', withMatches, meta, labels);
    expect(out).toContain('**A.** Answer from your documents [1]');
    expect(out).toContain('1. 示例文件（1） p.4 — The potato was weighed.');
    expect(out).toContain('- A second potato appeared.');
    expect(out).toContain('3 matches');
  });

  it('keeps the matches in the json export', () => {
    const out = JSON.parse(buildSessionExport('json', withMatches, meta, labels));
    expect(out.messages[1].matches.total).toBe(3);
    expect(out.messages[1].matches.docs[1].items[0].text).toBe('Potato notes.');
  });

  it('adds no match block when there is nothing to list', () => {
    const plain: SessionMessage[] = [{ id: '1', role: 'user', text: 'hi', at: 0 }, { id: '2', role: 'assistant', text: 'no docs', at: 1, notFound: true, kind: 'noDocs' }];
    const out = buildSessionExport('txt', plain, meta, labels);
    expect(out).toContain('A: no docs (not found)');
    expect(out).not.toContain('matches');
  });
});
