import { describe, expect, it } from 'vitest';
import { detectKind, isSupportedName } from './detect';
import { RagError } from './limits';

const bytes = (...list: (number | string)[]) => {
  const out: number[] = [];
  for (const item of list) {
    if (typeof item === 'string') for (const ch of item) out.push(ch.charCodeAt(0));
    else out.push(item);
  }
  return new Uint8Array(out);
};

describe('detectKind', () => {
  it('detects PDF by magic bytes regardless of the extension', () => {
    expect(detectKind(bytes('%PDF-1.7'), 'mislabelled.bin')).toBe('pdf');
    expect(detectKind(bytes('%PDF-1.4'), 'report.pdf')).toBe('pdf');
  });

  it('detects DOCX as a ZIP container', () => {
    expect(detectKind(bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00), 'review.docx')).toBe('docx');
  });

  it('refuses legacy OLE2 .doc files with a specific code', () => {
    try {
      detectKind(bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1), 'old.doc');
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(RagError);
      expect((error as RagError).code).toBe('LEGACY_DOC');
    }
  });

  it('refuses a file whose extension claims PDF but has no PDF header', () => {
    expect(() => detectKind(bytes('hello world'), 'fake.pdf')).toThrowError(RagError);
  });

  it('falls back to the extension for plain text formats', () => {
    expect(detectKind(bytes('note'), 'notes.md')).toBe('md');
    expect(detectKind(bytes('a,b'), 'table.csv')).toBe('csv');
    expect(detectKind(bytes('x'), 'page.html')).toBe('html');
  });

  it('rejects unknown extensions', () => {
    expect(() => detectKind(bytes(0x00, 0x01), 'archive.zip')).toThrowError(RagError);
  });

  it('reports support for the formats the UI advertises', () => {
    for (const name of ['a.pdf', 'a.docx', 'a.txt', 'a.md', 'a.csv', 'a.html', 'a.json']) {
      expect(isSupportedName(name)).toBe(true);
    }
    expect(isSupportedName('a.doc')).toBe(false);
    expect(isSupportedName('a.exe')).toBe(false);
  });
});
