/** Shared types for the local RAG engine. Everything here is plain data — no DOM, no network. */

export type DocKind = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'html' | 'json';

export interface RawPage {
  /** 1-based page number for paginated formats; 0 when the format has no pages */
  page: number;
  text: string;
}

export interface RawDoc {
  id: string;
  name: string;
  kind: DocKind;
  size: number;
  pages: RawPage[];
}

export interface Chunk {
  docId: string;
  docName: string;
  /** stable id, `${docId}:${index}` */
  chunkId: string;
  text: string;
  /** page number when the source format has pages */
  page?: number;
  /** breadcrumb of headings the chunk sits under, outermost first */
  headingPath: string[];
  /** character offset within the normalised document, used for the "jump to source" view */
  offset: number;
}

export interface StoredChunk extends Chunk {
  /** L2-normalised embedding */
  vector: Float32Array;
}

export type RetrievalSource = 'dense' | 'bm25' | 'fused';

export interface ScoredChunk extends Chunk {
  score: number;
  source: RetrievalSource;
}

export interface CitationRef {
  /** 1-based marker shown in the answer text: [1] */
  index: number;
  chunkId: string;
  docId: string;
  docName: string;
  page?: number;
  headingPath: string[];
  /** the exact sentence(s) the answer draws on */
  quote: string;
}

export type Strictness = 'strict' | 'balanced';

export interface AnswerResult {
  mode: Strictness;
  /** answer text with [n] markers */
  text: string;
  citations: CitationRef[];
  /** chunks the answer actually used, in citation order */
  usedChunkIds: string[];
  /** true when nothing cleared the relevance threshold and strict mode refused */
  notFound: boolean;
  /** sentences that were inferred rather than quoted (only in balanced mode) */
  inferred: string[];
}

export interface RetrievedContext {
  chunks: ScoredChunk[];
  /** best fused score, used for threshold decisions */
  best: number;
}
