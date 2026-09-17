import { RagError } from './limits';
import type { DocKind } from './types';

/**
 * Format detection by magic bytes first, extension second.
 * A renamed file must not silently produce empty text — that is the failure this
 * function exists to prevent.
 */
export function detectKind(head: Uint8Array, name: string): DocKind {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  const txt = new TextDecoder('latin1').decode(head.slice(0, 8));

  if (txt.startsWith('%PDF-')) return 'pdf';
  // ZIP container: DOCX (and other OOXML) start with PK\x03\x04
  if (head[0] === 0x50 && head[1] === 0x4b && (head[2] === 0x03 || head[2] === 0x05 || head[2] === 0x07)) {
    if (ext === 'docx') return 'docx';
    if (ext === 'doc') throw new RagError('LEGACY_DOC', name);
    return 'docx';
  }
  // OLE2 compound file = legacy .doc / .xls / .ppt
  if (head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0) {
    throw new RagError('LEGACY_DOC', name);
  }

  switch (ext) {
    case 'pdf':
      throw new RagError('UNSUPPORTED_FORMAT', `${name}: looks like a PDF but has no %PDF header`);
    case 'docx':
      throw new RagError('UNSUPPORTED_FORMAT', `${name}: looks like a DOCX but is not a ZIP container`);
    case 'txt':
    case 'log':
      return 'txt';
    case 'md':
    case 'markdown':
    case 'mdx':
      return 'md';
    case 'csv':
    case 'tsv':
      return 'csv';
    case 'html':
    case 'htm':
      return 'html';
    case 'json':
      return 'json';
    case 'doc':
      throw new RagError('LEGACY_DOC', name);
    default:
      throw new RagError('UNSUPPORTED_FORMAT', `${name} (.${ext})`);
  }
}

export function isSupportedName(name: string): boolean {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  return ['pdf', 'docx', 'txt', 'log', 'md', 'markdown', 'mdx', 'csv', 'tsv', 'html', 'htm', 'json'].includes(ext);
}
