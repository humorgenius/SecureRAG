/** Hard limits and tunables for the local engine. Single source of truth. */
export const LIMITS = {
  maxFileBytes: 25 * 1024 * 1024,
  maxFiles: 40,
  maxTotalBytes: 200 * 1024 * 1024,
  maxChunks: 20_000,
  /** chunk target size in characters (CJK counts as 1) */
  chunkSize: 700,
  chunkOverlap: 0.15,
  /** minimum characters for a chunk to be worth embedding */
  minChunkChars: 40,
  topK: 6,
  /** candidate pool fetched from each retriever before fusion */
  candidates: 20,
  rrfK: 60,
  mmrLambda: 0.7,
  /**
   * Relevance gate. A corpus counts as "silent" when the best dense cosine is
   * below `denseFloor` AND the best BM25 raw score is below `bm25Floor` — i.e. the
   * question matches nothing semantically and contains no matching keyword either.
   * Exposed as a single 0-1 confidence by `confidenceOf()` for the UI and tests.
   */
  denseFloor: 0.25,
  bm25Floor: 2.0,
  minConfidence: 0.25,
  /** chunks more similar than this to an already-selected chunk are dropped as duplicates */
  nearDuplicateCosine: 0.92,
  embeddingBatch: 16,
  /** on-screen caps for small screens, applied by the UI */
  mobileMaxFiles: 10,
} as const;

export type RagErrorCode =
  | 'UNSUPPORTED_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_FILES'
  | 'TOTAL_SIZE_EXCEEDED'
  | 'PDF_ENCRYPTED'
  | 'PDF_NO_TEXT_LAYER'
  | 'LEGACY_DOC'
  | 'EMPTY_DOCUMENT'
  | 'TOO_MANY_CHUNKS'
  | 'MODEL_LOAD_FAILED'
  | 'RUNTIME_INIT_FAILED'
  | 'OUT_OF_MEMORY'
  | 'NO_RESULTS'
  | 'INDEX_CORRUPT';

const HINTS: Record<RagErrorCode, { en: string; zh: string }> = {
  UNSUPPORTED_FORMAT: {
    en: 'That file type is not supported. Supported: PDF, DOCX, TXT, Markdown, CSV, HTML, JSON.',
    zh: '不支持这种文件格式。支持：PDF、DOCX、TXT、Markdown、CSV、HTML、JSON。',
  },
  FILE_TOO_LARGE: {
    en: 'This file is larger than 25 MB. Split it, or extract the text first with the PDF text tool.',
    zh: '这个文件超过 25MB。请拆分，或先用 PDF 提取文字工具把文本抽出来。',
  },
  TOO_MANY_FILES: {
    en: 'You have reached the 40-file limit for one library. Remove a document before adding another.',
    zh: '已达单个文档库 40 份的上限。请先删除一些文档再添加。',
  },
  TOTAL_SIZE_EXCEEDED: {
    en: 'The library would exceed 200 MB in total. Remove a document first.',
    zh: '文档库总量将超过 200MB 上限，请先删除部分文档。',
  },
  PDF_ENCRYPTED: {
    en: 'This PDF is password-protected, so its text cannot be read locally. Remove the password and try again.',
    zh: '这个 PDF 有密码保护，无法在本地读取文字。请先去掉密码再试。',
  },
  PDF_NO_TEXT_LAYER: {
    en: 'No text layer found — this looks like a scan. Run OCR on it first, then import the result.',
    zh: '没有检测到文字层，这看起来是扫描件。请先做 OCR，再导入处理后的文件。',
  },
  LEGACY_DOC: {
    en: 'The old .doc format is not supported. Save it as .docx or PDF and try again.',
    zh: '不支持旧版 .doc 格式。请另存为 .docx 或 PDF 后再试。',
  },
  EMPTY_DOCUMENT: {
    en: 'No readable text was found in this file.',
    zh: '这个文件里没有可读取的文字。',
  },
  TOO_MANY_CHUNKS: {
    en: 'This library would exceed 20,000 text chunks. Remove some documents or split the collection.',
    zh: '该文档库将超过 20,000 个文本块上限。请删除部分文档，或拆成多个文档库。',
  },
  RUNTIME_INIT_FAILED: {
    en: 'The local inference runtime could not start in this browser, so the model was never loaded. This is not a network problem. Reload the page; if it persists, try Chrome or Edge with WebAssembly enabled, or report it with your browser version.',
    zh: '本地推理运行时在这个浏览器里启动失败，模型根本没有开始下载。这不是网络问题。请刷新页面；若持续出现，请换用 Chrome 或 Edge 并确认未禁用 WebAssembly，或把浏览器版本反馈给我们。',
  },
  MODEL_LOAD_FAILED: {
    en: 'The model could not be downloaded. Check the connection, then retry — or point the app at a mirror.',
    zh: '模型下载失败。请检查网络后重试，或切换到镜像源。',
  },
  OUT_OF_MEMORY: {
    en: 'The browser ran out of memory. Remove some documents, switch to the lightweight tier, or close other tabs.',
    zh: '浏览器内存不足。请删除部分文档、切换到轻量档，或关掉其他标签页。',
  },
  NO_RESULTS: {
    en: 'Nothing in your documents matched that question. Try different wording, or allow inference mode.',
    zh: '文档里没有匹配这个问题的内容。换个说法试试，或允许推理模式。',
  },
  INDEX_CORRUPT: {
    en: 'The local index could not be read. Rebuild the index for this document — your original file is untouched.',
    zh: '本地索引读取失败。请重建该文档的索引——你的原始文件不受影响。',
  },
};

export class RagError extends Error {
  readonly code: RagErrorCode;
  readonly detail?: string;

  constructor(code: RagErrorCode, detail?: string) {
    super(`${code}${detail ? `: ${detail}` : ''}`);
    this.name = 'RagError';
    this.code = code;
    this.detail = detail;
  }

  /** Localised, user-facing hint for the current UI language. */
  hint(lang: 'en' | 'zh'): string {
    return HINTS[this.code][lang];
  }
}

/** Every code the UI can explain. Anything else is reported as an unknown failure. */
export const HINTS_BY_CODE: Record<string, { en: string; zh: string }> = HINTS;

export function hintFor(code: RagErrorCode, lang: 'en' | 'zh'): string {
  return HINTS[code][lang];
}
