import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { RagError } from '../limits';
import { parseDocx } from './docx';

/**
 * The DOCX path had no tests at all, which is how a runtime `import('jszip')`
 * failure inside the worker could ship as "unsupported file format" for every
 * .docx upload. These fixtures are built in memory so the container is known.
 */
const DOC_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const OPEN = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>';
const CLOSE = '</w:body></w:document>';

async function zipDocx(documentXml: string, extra: Record<string, string> = {}): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types/>');
  zip.file('_rels/.rels', '<?xml version="1.0"?><Relationships/>');
  zip.file('word/document.xml', documentXml);
  for (const [path, body] of Object.entries(extra)) zip.file(path, body);
  return zip.generateAsync({ type: 'arraybuffer' });
}

const para = (text: string, style?: string) =>
  `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}<w:r><w:t>${text}</w:t></w:r></w:p>`;

describe('parseDocx on a ZIP container', () => {
  it('extracts paragraphs and marks headings so the chunker keeps structure', async () => {
    const buffer = await zipDocx(`${DOC_HEAD}${OPEN}${para('个人资料', 'Heading1')}${para('身份证号码为 110101199003071234。')}${CLOSE}`);
    const doc = await parseDocx(buffer, 'profile.docx', 'id-1');
    expect(doc.kind).toBe('docx');
    expect(doc.name).toBe('profile.docx');
    expect(doc.pages).toHaveLength(1);
    expect(doc.pages[0].text).toContain('# 个人资料');
    expect(doc.pages[0].text).toContain('110101199003071234');
  });

  it('reads outline levels as heading depth', async () => {
    const withOutline = '<w:p><w:pPr><w:outlineLvl w:val="1"/></w:pPr><w:r><w:t>证件</w:t></w:r></w:p>';
    // padded past the 20-character "this document is empty" floor
    const filler = para('下面是证件小节的正文，用来让文档不算空。');
    const buffer = await zipDocx(`${DOC_HEAD}${OPEN}${withOutline}${filler}${CLOSE}`);
    const doc = await parseDocx(buffer, 'a.docx', 'id-2');
    expect(doc.pages[0].text).toContain('## 证件');
  });

  it('renders a table as pipe rows instead of losing it', async () => {
    const table =
      '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>项目</w:t></w:r></w:p></w:tc>' +
      '<w:tc><w:p><w:r><w:t>值</w:t></w:r></w:p></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p><w:r><w:t>通知期</w:t></w:r></w:p></w:tc>' +
      '<w:tc><w:p><w:r><w:t>60 天</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
    const buffer = await zipDocx(`${DOC_HEAD}${OPEN}${para('这段前置文字要足够长，避免整篇被判为空文档。')}${table}${CLOSE}`);
    const doc = await parseDocx(buffer, 't.docx', 'id-3');
    expect(doc.pages[0].text).toContain('| 项目 | 值 |');
    expect(doc.pages[0].text).toContain('| 通知期 | 60 天 |');
  });

  it('decodes XML entities rather than leaving them raw', async () => {
    const buffer = await zipDocx(`${DOC_HEAD}${OPEN}${para('A &amp; B &lt;tag&gt; 说明文字够长了。')}${CLOSE}`);
    const doc = await parseDocx(buffer, 'e.docx', 'id-4');
    expect(doc.pages[0].text).toContain('A & B <tag>');
  });

  it('reports an empty document instead of returning nothing', async () => {
    const buffer = await zipDocx(`${DOC_HEAD}${OPEN}${CLOSE}`);
    await expect(parseDocx(buffer, 'empty.docx', 'id-5')).rejects.toBeInstanceOf(RagError);
  });

  it('says document.xml is missing when the container lacks it', async () => {
    // a real ZIP, but with no word/document.xml inside it
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types/>');
    zip.file('word/other.xml', '<x/>');
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    await expect(parseDocx(buffer, 'weird.docx', 'id-6')).rejects.toThrow(/document\.xml|readable/i);
  });
});

describe('parseDocx on a flat OPC document (a .docx that is not a ZIP)', () => {
  it('parses the XML directly', async () => {
    const flat = `${DOC_HEAD}${OPEN}${para('这是一份扁平 OPC 文档，它不是压缩包。')}${CLOSE}`;
    const buffer = new TextEncoder().encode(flat).buffer;
    const doc = await parseDocx(buffer, 'flat.docx', 'id-7');
    expect(doc.kind).toBe('docx');
    expect(doc.pages[0].text).toContain('扁平 OPC');
  });
});
