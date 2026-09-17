/// <reference lib="webworker" />
import { LIMITS } from '../lib/rag/limits';
import { buildPrompt } from '../lib/rag/answer/prompt';
import { createEmbedder, createGenerator } from '../lib/rag/models';
import { hybridRetrieve } from '../lib/rag/retrieve';
import { matchAll, matchExact, type MatchResult } from '../lib/rag/match-all';
import type { Chunk, ScoredChunk, Strictness } from '../lib/rag/types';

/**
 * Search worker: embeds the question and runs hybrid retrieval off the main thread
 * so typing stays responsive on large libraries.
 */
export interface SearchRequest {
  type: 'search';
  queryText: string;
  chunks: Chunk[];
  vectors: Float32Array[];
  modelId: string;
  k: number;
  /** 'exact' searches for the typed phrase only and never loads a model. */
  mode?: 'exact' | 'fuzzy';
}

export interface GenerateRequest {
  type: 'generate';
  question: string;
  chunks: ScoredChunk[];
  mode: Strictness;
  lang: 'en' | 'zh';
  modelId: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  maxNewTokens: number;
}

export type SearchEvent =
  | { type: 'model-progress'; loaded: number; total: number; file?: string }
  | { type: 'results'; chunks: ScoredChunk[]; best: number; matches: MatchResult }
  | { type: 'token'; text: string }
  | { type: 'generated'; text: string }
  | { type: 'error'; code: string; detail?: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let cache: { modelId: string; run: Awaited<ReturnType<typeof createEmbedder>> } | null = null;
let generatorCache: { modelId: string; run: Awaited<ReturnType<typeof createGenerator>> } | null = null;

async function embedderFor(modelId: string) {
  if (cache?.modelId === modelId) return cache.run;
  const run = await createEmbedder(modelId, (progress) =>
    ctx.postMessage({ type: 'model-progress', ...progress } satisfies SearchEvent)
  );
  cache = { modelId, run };
  return run;
}

async function generatorFor(modelId: string) {
  if (generatorCache?.modelId === modelId) return generatorCache.run;
  const run = await createGenerator(modelId, (progress) =>
    ctx.postMessage({ type: 'model-progress', ...progress } satisfies SearchEvent)
  );
  generatorCache = { modelId, run };
  return run;
}

/**
 * Optional generation tier. Runs in this worker so streaming tokens never block the
 * UI thread. The prompt is built here from the already-retrieved chunks only.
 */
async function handleGenerate(msg: GenerateRequest) {
  const { system, user } = buildPrompt({
    question: msg.question,
    chunks: msg.chunks,
    mode: msg.mode,
    lang: msg.lang,
    history: msg.history,
  });
  const generate = await generatorFor(msg.modelId);
  const text = await generate(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    {
      maxNewTokens: msg.maxNewTokens,
      onToken: (token) => ctx.postMessage({ type: 'token', text: token } satisfies SearchEvent),
    }
  );
  ctx.postMessage({ type: 'generated', text } satisfies SearchEvent);
}

ctx.addEventListener('message', async (event: MessageEvent<SearchRequest | GenerateRequest>) => {
  const msg = event.data;
  if (msg.type === 'generate') {
    try {
      await handleGenerate(msg);
    } catch (error) {
      ctx.postMessage({
        type: 'error',
        code: 'MODEL_LOAD_FAILED',
        detail: String(error),
      } satisfies SearchEvent);
    }
    return;
  }
  if (msg.type !== 'search') return;
  try {
    // Exact mode is pure string matching: no embedder, no model download, no
    // network. It answers instantly even before the AI tier is available.
    if (msg.mode === 'exact') {
      ctx.postMessage({
        type: 'results',
        chunks: [],
        best: 1,
        matches: matchExact(msg.chunks, msg.queryText),
      } satisfies SearchEvent);
      return;
    }
    const embed = await embedderFor(msg.modelId);
    const [queryVector] = await embed([msg.queryText], 1);
    const result = hybridRetrieve({
      chunks: msg.chunks,
      vectors: msg.vectors,
      queryVector,
      queryText: msg.queryText,
      k: msg.k ?? LIMITS.topK,
    });
    ctx.postMessage({
      type: 'results',
      chunks: result.chunks,
      best: result.best,
      // Exhaustive literal matches from the same scan. The chunks above are the
      // ranked summary; these are every sentence in the whole library that
      // contains a term from the question, in document order, uncapped by top-k.
      matches: matchAll(msg.chunks, msg.queryText),
    } satisfies SearchEvent);
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      code: 'MODEL_LOAD_FAILED',
      detail: String(error),
    } satisfies SearchEvent);
  }
});
