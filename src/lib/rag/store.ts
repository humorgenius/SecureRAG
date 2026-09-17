import { clear, createStore, del, get, keys, set } from 'idb-keyval';
import type { Chunk, Strictness } from './types';

/**
 * All persistence lives in the visitor's own browser profile.
 * There is no server-side copy of anything — clearing site data is the delete button.
 */
const SCHEMA_KEY = 'schema-version';
export const SCHEMA_VERSION = 2;

const store = createStore('securerag', 'library');

export interface DocMeta {
  id: string;
  name: string;
  kind: string;
  size: number;
  pages: number;
  chunkCount: number;
  addedAt: number;
  enabled: boolean;
  group: string;
  model: string;
}

export interface DocIndex {
  docId: string;
  chunks: Chunk[];
  vectors: Float32Array[];
  model: string;
  builtAt: number;
}

export interface Settings {
  embeddingModel: string;
  generationModel: string;
  strictness: Strictness;
  contextTurns: number;
  useGeneration: boolean;
  lang: 'en' | 'zh';
}

export const DEFAULT_SETTINGS: Settings = {
  embeddingModel: 'Xenova/bge-small-zh-v1.5',
  generationModel: 'onnx-community/Qwen2.5-0.5B-Instruct',
  strictness: 'strict',
  contextTurns: 6,
  useGeneration: false,
  lang: 'en',
};

const kDocs = 'docs';
const kIndex = (docId: string) => `index:${docId}`;
const kSettings = 'settings';
const kSession = (id: string) => `session:${id}`;

/** Drops the whole database when the stored schema no longer matches. */
export async function ensureSchema(): Promise<void> {
  const version = await get<number>(SCHEMA_KEY, store);
  if (version !== SCHEMA_VERSION) {
    await clear(store);
    await set(SCHEMA_KEY, SCHEMA_VERSION, store);
  }
}

export async function loadDocs(): Promise<DocMeta[]> {
  return (await get<DocMeta[]>(kDocs, store)) ?? [];
}

export async function saveDocs(docs: DocMeta[]): Promise<void> {
  await set(kDocs, docs, store);
}

export async function saveIndex(index: DocIndex): Promise<void> {
  await set(kIndex(index.docId), index, store);
}

export async function loadIndex(docId: string): Promise<DocIndex | undefined> {
  return get<DocIndex>(kIndex(docId), store);
}

export async function deleteIndex(docId: string): Promise<void> {
  await del(kIndex(docId), store);
}

export async function loadAllIndexes(docs: DocMeta[]): Promise<DocIndex[]> {
  const out: DocIndex[] = [];
  for (const doc of docs) {
    if (!doc.enabled) continue;
    const index = await loadIndex(doc.id);
    if (index) out.push(index);
  }
  return out;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: {
    index: number;
    /** needed so a citation click can jump back to the exact chunk */
    chunkId: string;
    docName: string;
    page?: number;
    headingPath: string[];
    quote: string;
  }[];
  inferred?: string[];
  notFound?: boolean;
  /** why an empty answer was returned — drives the help text */
  kind?: 'notFound' | 'noDocs' | 'error';
  at: number;
  model?: string;
  strictness?: Strictness;
}

export async function saveSession(id: string, messages: SessionMessage[]): Promise<void> {
  await set(kSession(id), messages, store);
}

export async function loadSession(id: string): Promise<SessionMessage[]> {
  return (await get<SessionMessage[]>(kSession(id), store)) ?? [];
}

export async function loadSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...((await get<Partial<Settings>>(kSettings, store)) ?? {}) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await set(kSettings, settings, store);
}

export async function listKeys(): Promise<string[]> {
  return (await keys(store)).map(String);
}

/** Wipe everything this app has ever stored, locally. */
export async function wipeAll(): Promise<void> {
  await clear(store);
  await set(SCHEMA_KEY, SCHEMA_VERSION, store);
}

/** Ask the browser to make this origin's storage persistent (survives eviction pressure). */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | undefined> {
  if (!navigator.storage?.estimate) return undefined;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota };
}
