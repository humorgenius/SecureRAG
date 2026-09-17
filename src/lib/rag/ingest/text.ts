import { RagError } from '../limits';
import type { DocKind, RawDoc, RawPage } from '../types';

/** HTML/markup to plain text without a DOM (workers have no DOMParser). */
export function htmlToText(html: string): string {
  const withoutHead = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ');
  const withBreaks = withoutHead
    .replace(/<(h[1-6])[^>]*>/gi, (_, tag: string) => `\n${'#'.repeat(Number(tag[1]))} `)
    .replace(/<\/(h[1-6])>/gi, '\n')
    .replace(/<\/(p|div|section|article|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(withBreaks)
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    mdash: '—',
    ndash: '–',
    hellip: '…',
  };
  return text
    .replace(/&([a-z]+);/gi, (m, name: string) => named[name.toLowerCase()] ?? m)
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)));
}

/** CSV/TSV rows become one line per row so the chunker keeps rows intact. */
export function tableToLines(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

export function prettifyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

const decoders: Record<string, (raw: string) => string> = {
  html: htmlToText,
  csv: tableToLines,
  json: prettifyJson,
  txt: (raw) => raw,
  md: (raw) => raw,
};

/** Plain-text family: decode, apply the format-specific transform, sanity-check. */
export function parseText(buffer: ArrayBuffer, name: string, kind: DocKind, id: string): RawDoc {
  const raw = new TextDecoder('utf-8').decode(buffer);
  const transform = decoders[kind] ?? ((t: string) => t);
  const text = transform(raw).replace(/\r\n?/g, '\n').trim();

  if (text.length < 10) throw new RagError('EMPTY_DOCUMENT', name);

  const pages: RawPage[] = [{ page: 0, text }];
  return { id, name, kind, size: buffer.byteLength, pages };
}
