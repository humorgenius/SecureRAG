import type { RawDoc } from './types';

const SENTENCE_END = /[。！？!?；;]\s*$|\.\s*$/;

/**
 * Clean up extracted text without destroying structure:
 *  - drop repeated running headers / footers (same line on 3+ pages)
 *  - rejoin hard-wrapped lines inside a paragraph
 *  - collapse repeated blank lines
 * Headings, list markers and table rows are preserved.
 */
export function normalize(raw: RawDoc): RawDoc {
  const pages = raw.pages.map((p) => ({ page: p.page, text: p.text }));
  const noise = repeatedLines(pages.map((p) => p.text));

  return {
    ...raw,
    pages: pages.map((p) => ({ page: p.page, text: cleanText(p.text, noise) })),
  };
}

/** Lines that appear on at least half the pages (min 3) are running headers/footers. */
export function repeatedLines(pageTexts: string[]): Set<string> {
  if (pageTexts.length < 3) return new Set();
  const counts = new Map<string, number>();
  for (const text of pageTexts) {
    const seen = new Set<string>();
    for (const line of text.split(/\r?\n/)) {
      const key = line.trim();
      if (key.length < 3 || key.length > 90) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.ceil(pageTexts.length / 2));
  const noise = new Set<string>();
  for (const [line, n] of counts) if (n >= threshold) noise.add(line);
  return noise;
}

export function cleanText(text: string, noise: Set<string> = new Set()): string {
  const rawLines = text.replace(/\r\n?/g, '\n').split('\n');
  const kept: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      kept.push('');
      continue;
    }
    if (noise.has(trimmed)) {
      kept.push('');
      continue;
    }
    // page-number-only lines
    if (/^[ivxlcdm]{1,7}$/i.test(trimmed) && trimmed.length <= 7) {
      kept.push('');
      continue;
    }
    if (/^(page\s*)?\d{1,4}(\s*\/\s*\d{1,4})?$/i.test(trimmed)) {
      kept.push('');
      continue;
    }
    kept.push(trimmed);
  }

  // Rejoin hard-wrapped lines: a line that does not end a sentence and is followed
  // by a line starting lowercase / CJK continues the same paragraph.
  const out: string[] = [];
  for (let i = 0; i < kept.length; i++) {
    const line = kept[i];
    const next = kept[i + 1];
    if (
      line !== '' &&
      next !== undefined &&
      next !== '' &&
      !isStructural(line) &&
      !isStructural(next) &&
      !SENTENCE_END.test(line) &&
      !/^[-*•·]\s|^\d+[.)]\s/.test(line) &&
      !/^[-*•·]\s|^\d+[.)]\s/.test(next) &&
      /[a-z\u4e00-\u9fff'"’”)]/.test(next[0] ?? '')
    ) {
      out.push(line + (needsSpace(line, next) ? ' ' : '') + next);
      i++;
      continue;
    }
    out.push(line);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function needsSpace(a: string, b: string): boolean {
  return /[A-Za-z0-9,.;:'"’”)]$/.test(a) && /^[A-Za-z0-9('“]/.test(b);
}

/** Headings, list items, table rows and fences must not be merged into paragraphs. */
export function isStructural(line: string): boolean {
  const t = line.trim();
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^[-*•·]\s/.test(t)) return true;
  if (/^\d+[.)、]\s/.test(t)) return true;
  if (/^\|.*\|$/.test(t)) return true;
  if (/^```/.test(t)) return true;
  if (/^={3,}$|^-{3,}$/.test(t)) return true;
  return false;
}
