import { detectKind } from '../detect';
import { RagError } from '../limits';
import { normalize } from '../normalize';
import type { RawDoc } from '../types';
import { parseDocx } from './docx';
import { parsePdf } from './pdf';
import { parseText } from './text';

export interface ParseOptions {
  id: string;
  maxBytes: number;
}

/**
 * The only entry point the rest of the app uses to turn a File into text.
 * Order matters: sniff the container first (magic bytes), then dispatch, then
 * normalise away running headers/footers before anything is chunked.
 */
export async function parseFile(file: File, opt: ParseOptions): Promise<RawDoc> {
  if (file.size > opt.maxBytes) throw new RagError('FILE_TOO_LARGE', `${file.name} (${mb(file.size)} MB)`);

  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const kind = detectKind(head, file.name);
  const buffer = await file.arrayBuffer();

  let doc: RawDoc;
  switch (kind) {
    case 'pdf':
      doc = await parsePdf(buffer, file.name, opt.id);
      break;
    case 'docx':
      doc = await parseDocx(buffer, file.name, opt.id);
      break;
    default:
      doc = parseText(buffer, file.name, kind, opt.id);
  }

  return normalize(doc);
}

function mb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}
