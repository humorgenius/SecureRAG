import { LIMITS, RagError } from './limits';

/**
 * Model registry. Every entry states its real download size, because the UI shows
 * those numbers to the visitor before anything is fetched. Nothing above 30 MB is
 * ever downloaded without an explicit confirmation.
 */
export interface EmbeddingModel {
  id: string;
  sizeMB: number;
  dim: number;
  language: 'zh' | 'en' | 'multi';
  label: { en: string; zh: string };
  note: { en: string; zh: string };
}

export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'Xenova/bge-small-zh-v1.5',
    sizeMB: 25,
    dim: 512,
    language: 'zh',
    label: { en: 'Chinese-first (recommended for 中文文档)', zh: '中文优先（中文文档推荐）' },
    note: { en: 'Default when your documents are mostly Chinese.', zh: '文档以中文为主时的默认选择。' },
  },
  {
    id: 'Xenova/all-MiniLM-L6-v2',
    sizeMB: 23,
    dim: 384,
    language: 'en',
    label: { en: 'English-first (smallest, fastest)', zh: '英文优先（最小最快）' },
    note: { en: 'Default when your documents are mostly English.', zh: '文档以英文为主时的默认选择。' },
  },
  {
    id: 'Xenova/multilingual-e5-small',
    sizeMB: 120,
    dim: 384,
    language: 'multi',
    label: { en: 'Bilingual collections (100+ languages)', zh: '中英混排（支持 100+ 语言）' },
    note: { en: 'Pick this when one library mixes Chinese and English.', zh: '同一个文档库里中英混排时选它。' },
  },
];

export interface GenerationModel {
  id: string;
  sizeMB: number;
  label: { en: string; zh: string };
}

export const GENERATION_MODELS: GenerationModel[] = [
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    sizeMB: 400,
    label: { en: 'Qwen2.5 0.5B (q4) — small, usable on CPU', zh: 'Qwen2.5 0.5B（q4）——体积小，CPU 也能用' },
  },
  {
    id: 'onnx-community/Qwen2.5-1.5B-Instruct',
    sizeMB: 1000,
    label: { en: 'Qwen2.5 1.5B (q4) — better prose, wants WebGPU', zh: 'Qwen2.5 1.5B（q4）——成文更好，需要 WebGPU' },
  },
];

export interface LoadProgress {
  loaded: number;
  total: number;
  file?: string;
}

export type ProgressFn = (progress: LoadProgress) => void;

/**
 * A blocked network often hangs instead of failing, which would leave the tool
 * spinning forever. Reject when no byte has moved for `stallMs`, and hard-cap the
 * whole download — a clear "download failed, retry or switch mirror" beats silence.
 */
export function stallGuard<T>(
  work: Promise<T>,
  getLastActivity: () => number,
  stallMs = 30_000,
  hardCapMs = 300_000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const stalled = Date.now() - getLastActivity() > stallMs;
      const overrun = Date.now() - started > hardCapMs;
      if (stalled || overrun) {
        clearInterval(timer);
        reject(new Error(stalled ? 'model download stalled' : 'model download exceeded the time limit'));
      }
    }, 1500);
    work.then(
      (value) => {
        clearInterval(timer);
        resolve(value);
      },
      (error) => {
        clearInterval(timer);
        reject(error);
      }
    );
  });
}

/** WebGPU is the difference between "a few tokens a second" and "pleasant". */
export async function hasWebGPU(): Promise<boolean> {
  const nav = navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } };
  if (!nav.gpu) return false;
  try {
    return Boolean(await nav.gpu.requestAdapter());
  } catch {
    return false;
  }
}

type Device = 'webgpu' | 'wasm';

async function pickDevice(preferGpu: boolean): Promise<Device> {
  if (!preferGpu) return 'wasm';
  return (await hasWebGPU()) ? 'webgpu' : 'wasm';
}

/** Self-hosted onnxruntime wasm; the page must not depend on a third-party CDN. */
async function configureRuntime(): Promise<void> {
  const { env } = await import('@huggingface/transformers');
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  // served from our own /ort/ directory — no third-party CDN, so the network
  // shield only ever shows the model weights.
  (env.backends as unknown as { onnx?: { wasm?: Record<string, unknown> } }).onnx ??= {};
  const onnx = (env.backends as unknown as { onnx?: { wasm?: Record<string, unknown> } }).onnx!;
  onnx.wasm ??= {};
  const wasm = onnx.wasm as Record<string, unknown>;
  wasm.wasmPaths = new URL('/ort/', location.origin).href;
  // Static hosts (GitHub Pages, Netlify free tier) cannot send COOP/COEP, so
  // SharedArrayBuffer is unavailable and the threaded build fails to initialise
  // ("No available adapters"). Pin single-threaded execution — it is the only
  // configuration guaranteed to work where this site is actually deployed.
  wasm.numThreads = 1;
  wasm.simd = true;
  wasm.proxy = false;
}

export type Embedder = (texts: string[], batch?: number) => Promise<Float32Array[]>;

/**
 * Create an embedding function. Each call returns L2-normalised Float32Array
 * vectors, so similarity later reduces to a dot product.
 */
export async function createEmbedder(modelId: string, onProgress?: ProgressFn): Promise<Embedder> {
  await configureRuntime();
  const { pipeline } = await import('@huggingface/transformers');
  const device = await pickDevice(true);

  let lastActivity = Date.now();
  const load = (dev: Device) =>
    stallGuard(
      pipeline('feature-extraction', modelId, {
        dtype: 'q8',
        device: dev,
        progress_callback: (report: { status?: string; loaded?: number; total?: number; file?: string }) => {
          lastActivity = Date.now();
          if (report?.status === 'progress' && report.total) {
            onProgress?.({ loaded: report.loaded ?? 0, total: report.total, file: report.file });
          }
        },
      }),
      () => lastActivity
    );

  let pipe: Awaited<ReturnType<typeof load>>;
  try {
    pipe = await load(device);
  } catch (error) {
    if (device === 'wasm') throw new RagError('MODEL_LOAD_FAILED', String(error));
    // WebGPU can exist but fail on a given driver — fall back rather than break.
    lastActivity = Date.now();
    try {
      pipe = await load('wasm');
    } catch (fallbackError) {
      throw new RagError('MODEL_LOAD_FAILED', String(fallbackError));
    }
  }

  return async (texts: string[], batch = LIMITS.embeddingBatch) => {
    const out: Float32Array[] = [];
    for (let i = 0; i < texts.length; i += batch) {
      const slice = texts.slice(i, i + batch);
      const result = await pipe(slice, { pooling: 'mean', normalize: true } as never);
      const { data, dims } = result as unknown as { data: Float32Array; dims: number[] };
      const dim = dims[dims.length - 1];
      for (let row = 0; row < slice.length; row++) {
        out.push(data.slice(row * dim, (row + 1) * dim));
      }
    }
    return out;
  };
}

export interface GeneratorOptions {
  maxNewTokens?: number;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

/** Optional generation tier. Runs the same ONNX runtime, accelerated when WebGPU exists. */
export async function createGenerator(modelId: string, onProgress?: ProgressFn) {
  await configureRuntime();
  const { pipeline, TextStreamer } = await import('@huggingface/transformers');
  const device = await pickDevice(true);

  const load = (dev: Device) =>
    pipeline('text-generation', modelId, {
      dtype: 'q4',
      device: dev,
      progress_callback: (report: { status?: string; loaded?: number; total?: number; file?: string }) => {
        if (report?.status === 'progress' && report.total) {
          onProgress?.({ loaded: report.loaded ?? 0, total: report.total, file: report.file });
        }
      },
    });

  let pipe: Awaited<ReturnType<typeof load>>;
  try {
    pipe = await load(device);
  } catch {
    pipe = await load('wasm');
  }

  return async (
    messages: { role: string; content: string }[],
    opt: GeneratorOptions = {}
  ): Promise<string> => {
    const streamer = opt.onToken
      ? new TextStreamer((pipe as unknown as { tokenizer: unknown }).tokenizer as never, {
          skip_prompt: true,
          skip_special_tokens: true,
          callback_function: (token: string) => opt.onToken?.(token),
        })
      : undefined;

    const result = await pipe(messages, {
      max_new_tokens: opt.maxNewTokens ?? 320,
      do_sample: false,
      temperature: 0.2,
      streamer,
    } as never);

    const first = (result as { generated_text: unknown }[])[0]?.generated_text;
    if (typeof first === 'string') return first;
    if (Array.isArray(first)) {
      const last = first[first.length - 1] as { content?: string };
      return last?.content ?? '';
    }
    return '';
  };
}
