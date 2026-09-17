import { LIMITS } from './limits';
import { isStructural } from './normalize';
import type { Chunk, RawDoc } from './types';

export interface ChunkOptions {
  size?: number;
  overlap?: number;
}

interface Block {
  text: string;
  headingPath: string[];
  page: number;
  offset: number;
  atomic: boolean;
}

const MD_HEADING = /^(#{1,6})\s+(.*)$/;
const NUM_HEADING = /^((?:第\s*[0-9一二三四五六七八九十百]+\s*[章节条款]|[0-9]+(?:\.[0-9]+){0,3}[.、)]?|Article\s+[0-9IVX]+|Section\s+[0-9.]+|附录\s*[A-Z0-9一二三四五六七八九十]+)\s*[:：]?\s*)(.*)$/i;
const SENTENCE_SPLIT = /(?<=[。！？；])|(?<=[.!?;])\s+/;

/** Is this short line a heading, or just a short line? */
function looksLikeHeading(line: string, next: string | undefined): boolean {
  const t = line.trim();
  if (t.length === 0 || t.length > 70) return false;
  // table rows and fenced code are structured content, never headings
  if (/^\|.*\|$/.test(t) || /^```/.test(t)) return false;
  if (isStructural(t) && !/^[\-(*•]/.test(t)) return true;
  // Sentence punctuation vetoes a heading, and it has to be checked before the
  // "next line is blank" rule: in Markdown EVERY paragraph is followed by a
  // blank line, so that rule alone promotes ordinary prose into the heading
  // stack and the real headings lose their path. Chinese commas count too —
  // a line ending in ，is prose, not a title.
  if (/[。！？.!?；;，,、：:]$/.test(t)) return false;
  if (next !== undefined && next.trim() === '' && t.split(/\s+/).length <= 12) return true;
  if (t.split(/\s+/).length <= 9) return true;
  return false;
}

/** Turn one document into structural blocks, tracking the heading path. */
function toBlocks(doc: RawDoc): Block[] {
  const blocks: Block[] = [];
  const headingStack: string[] = [];
  let offset = 0;
  let fence = false;

  for (const page of doc.pages) {
    const lines = page.text.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const start = offset;
      offset += line.length + 1;

      if (/^```/.test(line.trim())) {
        fence = !fence;
        blocks.push({ text: line, headingPath: [...headingStack], page: page.page, offset: start, atomic: true });
        i++;
        continue;
      }
      if (fence) {
        blocks.push({ text: line, headingPath: [...headingStack], page: page.page, offset: start, atomic: true });
        i++;
        continue;
      }

      const trimmed = line.trim();
      if (trimmed === '') {
        i++;
        continue;
      }

      const md = trimmed.match(MD_HEADING);
      if (md) {
        const level = md[1].length;
        const title = md[2].trim();
        headingStack.length = Math.min(headingStack.length, level - 1);
        headingStack.push(title);
        blocks.push({ text: title, headingPath: [...headingStack], page: page.page, offset: start, atomic: true });
        i++;
        continue;
      }

      if (looksLikeHeading(trimmed, lines[i + 1])) {
        const num = trimmed.match(NUM_HEADING);
        const title = num ? trimmed : trimmed;
        const depth = num ? Math.min(3, num[1].split('.').length) : 1;
        headingStack.length = Math.min(headingStack.length, depth - 1);
        headingStack.push(title);
        blocks.push({ text: title, headingPath: [...headingStack], page: page.page, offset: start, atomic: true });
        i++;
        continue;
      }

      // table row block
      if (/^\|.*\|$/.test(trimmed)) {
        blocks.push({ text: trimmed, headingPath: [...headingStack], page: page.page, offset: start, atomic: false });
        i++;
        continue;
      }

      blocks.push({ text: trimmed, headingPath: [...headingStack], page: page.page, offset: start, atomic: false });
      i++;
    }
  }

  return blocks;
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Structure-aware chunking: headings are never merged into body text, tables and
 * fenced code stay whole, and chunks break on sentence boundaries whenever possible.
 */
export function chunkDoc(doc: RawDoc, opt: ChunkOptions = {}): Chunk[] {
  const size = opt.size ?? LIMITS.chunkSize;
  const overlap = opt.overlap ?? LIMITS.chunkOverlap;
  const carryChars = Math.floor(size * overlap);
  const blocks = toBlocks(doc);
  const chunks: Chunk[] = [];

  let current: { text: string[]; headingPath: string[]; page: number; offset: number; chars: number } | null = null;

  const flush = () => {
    if (!current) return;
    const text = current.text.join('\n').trim();
    if (text.length >= LIMITS.minChunkChars || chunks.length === 0) {
      chunks.push({
        docId: doc.id,
        docName: doc.name,
        chunkId: `${doc.id}:${chunks.length}`,
        text,
        page: current.page || undefined,
        headingPath: current.headingPath,
        offset: current.offset,
      });
    }
    current = null;
  };

  for (const block of blocks) {
    if (block.atomic && block.text.length < 80) {
      // heading: keep it attached to the following body by starting a new chunk
      if (current && current.chars > size * 0.4) flush();
      if (!current) {
        current = { text: [block.text], headingPath: block.headingPath, page: block.page, offset: block.offset, chars: block.text.length };
      } else {
        current.text.push(block.text);
        current.chars += block.text.length;
        current.headingPath = block.headingPath;
      }
      continue;
    }

    // oversized atomic block (long table / code fence): emit on its own
    if (block.atomic && block.text.length > size) {
      flush();
      chunks.push({
        docId: doc.id,
        docName: doc.name,
        chunkId: `${doc.id}:${chunks.length}`,
        text: block.text,
        page: block.page || undefined,
        headingPath: block.headingPath,
        offset: block.offset,
      });
      continue;
    }

    const sentences = splitSentences(block.text);
    for (const sentence of sentences) {
      if (!current) {
        current = { text: [sentence], headingPath: block.headingPath, page: block.page, offset: block.offset, chars: sentence.length };
      } else if (current.chars + sentence.length + 1 <= size) {
        current.text.push(sentence);
        current.chars += sentence.length + 1;
      } else {
        const tail = tailSentences(current.text.join(' '), carryChars);
        flush();
        current = {
          text: tail ? [tail, sentence] : [sentence],
          headingPath: block.headingPath,
          page: block.page,
          offset: block.offset,
          chars: (tail ? tail.length + 1 : 0) + sentence.length,
        };
      }
    }
  }
  flush();

  return chunks.filter((c) => c.text.trim().length >= LIMITS.minChunkChars);
}

/** Last `carryChars` worth of whole sentences, used as the overlap between chunks. */
export function tailSentences(text: string, carryChars: number): string {
  if (carryChars <= 0) return '';
  const sentences = splitSentences(text);
  const out: string[] = [];
  let chars = 0;
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (chars + sentences[i].length > carryChars) break;
    out.unshift(sentences[i]);
    chars += sentences[i].length;
  }
  return out.join(' ');
}
