import { RagError } from '../limits';
import type { RawDoc, RawPage } from '../types';

/**
 * PDF text extraction with PDF.js.
 * The worker is self-hosted (`/ort/pdf.worker.min.mjs`) so the page never contacts
 * a third-party CDN — the only allowed outbound request in the whole app is the
 * model download.
 */
export async function parsePdf(buffer: ArrayBuffer, name: string, id: string): Promise<RawDoc> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/ort/pdf.worker.min.mjs';

  let doc: Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>;
  try {
    doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: false,
      disableAutoFetch: true,
    }).promise;
  } catch (error) {
    const message = String((error as Error)?.name ?? error);
    if (/password/i.test(message)) throw new RagError('PDF_ENCRYPTED', name);
    throw new RagError('UNSUPPORTED_FORMAT', `${name}: ${message}`);
  }

  const pages: RawPage[] = [];
  let totalChars = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let text = '';
    for (const item of content.items) {
      const chunk = item as { str?: string; hasEOL?: boolean };
      if (typeof chunk.str === 'string') text += chunk.str;
      if (chunk.hasEOL) text += '\n';
    }
    const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    totalChars += cleaned.length;
    pages.push({ page: n, text: cleaned });
    page.cleanup();
  }

  if (totalChars < 40) throw new RagError('PDF_NO_TEXT_LAYER', name);
  await doc.destroy();

  return { id, name, kind: 'pdf', size: buffer.byteLength, pages };
}
