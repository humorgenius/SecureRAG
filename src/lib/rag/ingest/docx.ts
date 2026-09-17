import JSZip from 'jszip';
import { RagError } from '../limits';
import type { RawDoc, RawPage } from '../types';

/**
 * DOCX text extraction without a DOM.
 *
 * Word stores body text in `word/document.xml`. Workers have no DOMParser, so the
 * OOXML is walked with targeted regexes: paragraph by paragraph, then run by run.
 * Heading levels come from `w:pStyle` (Heading1..) or `w:outlineLvl`, which is what
 * lets the chunker keep a document's structure instead of flattening it to prose.
 */
function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
}

function headingLevel(paragraphXml: string): number {
  const style = paragraphXml.match(/<w:pStyle[^>]*w:val="([^"]+)"/)?.[1];
  if (style) {
    const heading = style.match(/^Heading\s*(\d)/i) ?? style.match(/^标题\s*(\d)/);
    if (heading) return Math.min(6, Math.max(1, Number(heading[1])));
    if (/^Title$/i.test(style)) return 1;
  }
  const outline = paragraphXml.match(/<w:outlineLvl[^>]*w:val="(\d+)"/)?.[1];
  if (outline !== undefined) return Math.min(6, Number(outline) + 1);
  return 0;
}

function paragraphText(paragraphXml: string): string {
  const runs = paragraphXml.match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g) ?? [];
  let text = runs.map((run) => decodeXml(run.replace(/<[^>]+>/g, ''))).join('');
  // tabs and explicit breaks become spaces / newlines rather than disappearing
  text = text.replace(/<w:tab\s*\/>/g, '\t').replace(/<w:br\s*\/>/g, '\n');
  return text.trim();
}

function tableRows(paragraphXml: string): string | null {
  // a row's cells live in <w:tc> inside <w:tr>; the caller passes a whole table chunk
  const cells = paragraphXml.match(/<w:tc>[\s\S]*?<\/w:tc>/g);
  if (!cells) return null;
  return '| ' + cells.map((cell) => paragraphText(cell) || ' ').join(' | ') + ' |';
}

/**
 * Get `word/document.xml` out of either container shape:
 *  - the normal OOXML ZIP
 *  - a "flat OPC" document, which is a single XML file that a few converters and
 *    exporters emit with a .docx extension. Treating that as "unsupported
 *    format" is a false negative: the text is right there.
 *
 * JSZip is a static import on purpose. As a dynamic `import('jszip')` inside the
 * ingest worker it could fail to resolve at runtime ("Failed to fetch
 * dynamically imported module") — every .docx upload then died and was reported
 * as "unsupported file format". Bundling it with the worker removes that
 * failure mode entirely.
 */
async function readDocumentXml(buffer: ArrayBuffer, name: string): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    // Lenient lookup: some producers store entries with a leading slash.
    const key = Object.keys(zip.files).find((p) => p.replace(/^\//, '').toLowerCase() === 'word/document.xml');
    if (key) return await zip.files[key].async('string');
  } catch {
    // Not a ZIP at all — fall through to the flat check below.
  }

  const asText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  if (/<w:document[\s>]/.test(asText)) return asText;

  throw new RagError(
    'UNSUPPORTED_FORMAT',
    `${name}: no readable .docx container and no flat OPC document (word/document.xml not found)`
  );
}

export async function parseDocx(buffer: ArrayBuffer, name: string, id: string): Promise<RawDoc> {
  const xml = await readDocumentXml(buffer, name);

  const body = xml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1] ?? xml;
  const blocks = body.match(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p\b[\s\S]*?<\/w:p>/g) ?? [];

  const lines: string[] = [];
  for (const block of blocks) {
    if (block.startsWith('<w:tbl>')) {
      const rows = block.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) ?? [];
      for (const row of rows) {
        const text = tableRows(row);
        if (text) lines.push(text);
      }
      lines.push('');
      continue;
    }
    const text = paragraphText(block);
    if (!text) {
      lines.push('');
      continue;
    }
    const level = headingLevel(block);
    lines.push(level > 0 ? `${'#'.repeat(level)} ${text}` : text);
  }

  const pageText = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (pageText.length < 20) throw new RagError('EMPTY_DOCUMENT', name);

  const pages: RawPage[] = [{ page: 0, text: pageText }];
  return { id, name, kind: 'docx', size: buffer.byteLength, pages };
}
