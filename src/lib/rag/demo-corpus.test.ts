import { describe, expect, it } from 'vitest';
import { demoChips, demoChunks } from '../../data/demo-corpus';
import { matchAll, matchExact } from './match-all';

/**
 * The homepage demo is the first thing a visitor can touch, so it must not be able
 * to go quietly empty: a chip that finds nothing, or a corpus that stops chunking,
 * is a broken front door rather than a failing test elsewhere.
 */
describe('homepage demo corpus', () => {
  it('chunks into real chunks in both languages', () => {
    for (const lang of ['zh', 'en'] as const) {
      const chunks = demoChunks(lang);
      expect(chunks.length, lang).toBeGreaterThan(0);
      expect(chunks.every((c) => c.text.trim().length > 0)).toBe(true);
    }
  });

  it('every suggested chip finds something', () => {
    for (const lang of ['zh', 'en'] as const) {
      const chunks = demoChunks(lang);
      for (const chip of demoChips[lang]) {
        const result = matchAll(chunks, chip);
        // More than one hit: the demo exists to show a count, so a single hit is
        // a corpus problem, not a passing test.
        expect(result.total, `${lang}:${chip}`).toBeGreaterThan(1);
      }
    }
  });

  it('never lists the same sentence twice', () => {
    const result = matchExact(demoChunks('zh'), '解约');
    expect(result.total).toBeGreaterThanOrEqual(4);
    const texts = result.docs.flatMap((d) => d.items.map((i) => i.text));
    expect(new Set(texts).size).toBe(texts.length);
  });
});
