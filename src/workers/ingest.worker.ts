/// <reference lib="webworker" />
import { chunkDoc } from '../lib/rag/chunk';
import { parseFile } from '../lib/rag/ingest';
import { LIMITS, RagError } from '../lib/rag/limits';
import { createEmbedder } from '../lib/rag/models';
import type { Chunk } from '../lib/rag/types';

/**
 * Ingestion worker: parse → chunk → embed, reporting progress so the UI can show
 * a real percentage instead of a spinner. The document never leaves this thread.
 */
export interface IngestRequest {
  type: 'ingest';
  files: File[];
  modelId: string;
  totalChunksSoFar: number;
}

export type IngestEvent =
  | { type: 'stage'; file: string; stage: 'parse' | 'chunk' | 'embed' | 'model' | 'done'; done?: number; total?: number }
  | { type: 'model-progress'; loaded: number; total: number; file?: string }
  | { type: 'doc'; id: string; name: string; kind: string; pages: number; size: number; chunks: Chunk[]; vectors: Float32Array[]; model: string }
  | { type: 'error'; file: string; code: string; detail?: string }
  | { type: 'all-done' };

interface ChunkMessage {
  type: 'ingest' | 'embed';
  texts?: string[];
  modelId: string;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let cache: { modelId: string; run: Awaited<ReturnType<typeof createEmbedder>> } | null = null;

async function embedderFor(modelId: string) {
  if (cache?.modelId === modelId) return cache.run;
  const run = await createEmbedder(modelId, (progress) =>
    ctx.postMessage({ type: 'model-progress', ...progress } satisfies IngestEvent)
  );
  cache = { modelId, run };
  return run;
}

async function handleIngest(msg: IngestRequest) {
  let totalChunks = msg.totalChunksSoFar;

  // The embedder is created before the file loop, so a failed model download used
  // to leave the UI spinning forever with no explanation. Report it explicitly.
  ctx.postMessage({
    type: 'stage',
    file: msg.files[0]?.name ?? '',
    stage: 'model',
  } satisfies IngestEvent);

  let embed: Awaited<ReturnType<typeof createEmbedder>>;
  try {
    embed = await embedderFor(msg.modelId);
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      file: msg.files[0]?.name ?? '',
      code: 'MODEL_LOAD_FAILED',
      detail: String(error),
    } satisfies IngestEvent);
    ctx.postMessage({ type: 'all-done' } satisfies IngestEvent);
    return;
  }

  for (const file of msg.files) {
    try {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      ctx.postMessage({ type: 'stage', file: file.name, stage: 'parse' } satisfies IngestEvent);
      const raw = await parseFile(file, { id, maxBytes: LIMITS.maxFileBytes });

      ctx.postMessage({ type: 'stage', file: file.name, stage: 'chunk' } satisfies IngestEvent);
      const chunks = chunkDoc(raw);

      if (totalChunks + chunks.length > LIMITS.maxChunks) {
        throw new RagError('TOO_MANY_CHUNKS', `${totalChunks + chunks.length}`);
      }

      ctx.postMessage({
        type: 'stage',
        file: file.name,
        stage: 'embed',
        done: 0,
        total: chunks.length,
      } satisfies IngestEvent);

      const vectors: Float32Array[] = [];
      const batch = LIMITS.embeddingBatch;
      for (let i = 0; i < chunks.length; i += batch) {
        const slice = chunks.slice(i, i + batch).map((c) => c.text);
        const embedded = await embed(slice, batch);
        vectors.push(...embedded);
        ctx.postMessage({
          type: 'stage',
          file: file.name,
          stage: 'embed',
          done: Math.min(i + batch, chunks.length),
          total: chunks.length,
        } satisfies IngestEvent);
      }

      totalChunks += chunks.length;
      ctx.postMessage({
        type: 'doc',
        id: raw.id,
        name: raw.name,
        kind: raw.kind,
        pages: raw.pages.length,
        size: raw.size,
        chunks,
        vectors,
        model: msg.modelId,
      } satisfies IngestEvent);
      ctx.postMessage({ type: 'stage', file: file.name, stage: 'done' } satisfies IngestEvent);
    } catch (error) {
      const rag = error instanceof RagError ? error : undefined;
      ctx.postMessage({
        type: 'error',
        file: file.name,
        code: rag?.code ?? 'UNKNOWN',
        detail: rag?.detail ?? String(error),
      } satisfies IngestEvent);
    }
  }

  ctx.postMessage({ type: 'all-done' } satisfies IngestEvent);
}

async function handleEmbed(msg: ChunkMessage) {
  const embed = await embedderFor(msg.modelId);
  const vectors = await embed(msg.texts ?? []);
  ctx.postMessage({ type: 'embedded', vectors, model: msg.modelId });
}

ctx.addEventListener('message', (event: MessageEvent<IngestRequest | ChunkMessage>) => {
  const data = event.data;
  if (data.type === 'ingest') void handleIngest(data as IngestRequest);
  else if (data.type === 'embed') void handleEmbed(data as ChunkMessage);
});
