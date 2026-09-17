// The island owns its stylesheet — see the note in Tools.tsx.
import '../../styles/app.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ta } from '../../i18n/app';
import type { Lang } from '../../i18n/utils';
import { extractiveAnswer } from '../../lib/rag/answer/extractive';
import type { MatchResult } from '../../lib/rag/match-all';
import { HINTS_BY_CODE, LIMITS, RagError, hintFor, type RagErrorCode } from '../../lib/rag/limits';
import { GENERATION_MODELS, hasWebGPU } from '../../lib/rag/models';
import {
  deleteIndex,
  ensureSchema,
  loadDocs,
  loadIndex,
  loadSession,
  loadSettings,
  requestPersistence,
  saveDocs,
  saveIndex,
  saveSession,
  saveSettings,
  storageEstimate,
  type DocIndex,
  type DocMeta,
  type SessionMessage,
  type Settings,
} from '../../lib/rag/store';
import type { Chunk, ScoredChunk } from '../../lib/rag/types';
import {
  ChatPanel,
  DocList,
  DownloadConfirm,
  DropZone,
  SettingsPanel,
  Shield,
  type NetworkRequest,
  type ProgressState,
} from './Panels';

interface Props {
  lang: Lang;
  sessionId: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Workspace({ lang, sessionId }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [modelProgress, setModelProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'searching' | 'generating'>('idle');
  const [streamText, setStreamText] = useState('');
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [webgpu, setWebgpu] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [pane, setPane] = useState<'docs' | 'chat' | 'settings'>('docs');
  const [mobile, setMobile] = useState(false);

  const ingestRef = useRef<Worker | null>(null);
  const searchRef = useRef<Worker | null>(null);
  const filesRef = useRef(new Map<string, File>());
  const pendingRef = useRef<{ resolve: (value: unknown) => void; reject: (reason: unknown) => void } | null>(null);
  const docsRef = useRef<DocMeta[]>([]);

  docsRef.current = docs;

  /* ---------------------------------------------------------------- boot */

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensureSchema();
      const [loaded, storedSettings, session] = await Promise.all([loadDocs(), loadSettings(), loadSession(sessionId)]);
      if (!alive) return;
      setDocs(loaded);
      setSettings({ ...storedSettings, lang });
      setMessages(session);
      setWebgpu(await hasWebGPU());
      setMobile(window.matchMedia('(max-width: 760px)').matches);
      setStorage((await storageEstimate()) ?? null);
      void requestPersistence();
    })();

    const onResize = () => setMobile(window.matchMedia('(max-width: 760px)').matches);
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
    };
  }, [sessionId, lang]);

  /* ------------------------------------------------------------- workers */

  useEffect(() => {
    const ingest = new Worker(new URL('../../workers/ingest.worker.ts', import.meta.url), { type: 'module' });
    const search = new Worker(new URL('../../workers/search.worker.ts', import.meta.url), { type: 'module' });
    ingestRef.current = ingest;
    searchRef.current = search;

    const wireWorkerError = (worker: Worker) => {
      worker.onerror = (event) => {
        setError(hintFor('MODEL_LOAD_FAILED', lang));
        setBusy(false);
        setProgress(null);
        setModelProgress(null);
        console.error('[securerag] worker failed to start', event.message ?? event);
      };
    };
    wireWorkerError(ingest);
    wireWorkerError(search);

    ingest.onmessage = async (event: MessageEvent<Record<string, unknown>>) => {
      const msg = event.data as { type: string } & Record<string, never>;
      switch (msg.type) {
        case 'stage': {
          const stage = msg as unknown as ProgressState & { type: string };
          const visible = ['parse', 'chunk', 'embed', 'model', 'done'] as const;
          if ((visible as readonly string[]).includes(stage.stage)) {
            setProgress({ file: stage.file, stage: stage.stage, done: stage.done, total: stage.total });
            if (stage.stage === 'done') setProgress(null);
          }
          break;
        }
        case 'model-progress': {
          const p = msg as unknown as { loaded: number; total: number; file?: string };
          setModelProgress({ loaded: p.loaded, total: p.total });
          break;
        }
        case 'doc': {
          const d = msg as unknown as {
            id: string;
            name: string;
            kind: string;
            pages: number;
            size: number;
            chunks: Chunk[];
            vectors: Float32Array[];
            model: string;
          };
          const meta: DocMeta = {
            id: d.id,
            name: d.name,
            kind: d.kind,
            size: d.size,
            pages: d.pages,
            chunkCount: d.chunks.length,
            addedAt: Date.now(),
            enabled: true,
            group: 'default',
            model: d.model,
          };
          const index: DocIndex = { docId: d.id, chunks: d.chunks, vectors: d.vectors, model: d.model, builtAt: Date.now() };
          await saveIndex(index);
          const next = [...docsRef.current.filter((x) => x.id !== meta.id), meta];
          await saveDocs(next);
          setDocs(next);
          break;
        }
        case 'error': {
          const e = msg as unknown as { code: string; file: string; detail?: string };
          // An unrecognised failure must never be described as "unsupported
          // format" — the old fallback told the user their .docx was the wrong
          // type while the real error was something else entirely.
          const known = e.code in HINTS_BY_CODE ? hintFor(e.code as RagErrorCode, lang) : '';
          const summary = known
            ? known
            : lang === 'zh'
              ? '这个文件处理失败了（不是格式问题，也不是网络问题）。'
              : 'This file could not be processed — the format is not the problem, and neither is the network.';
          const detail = e.detail ? ` · ${e.detail.slice(0, 180)}` : '';
          setError(`${e.file ? `${e.file} — ` : ''}${summary}${detail}`);
          setProgress(null);
          setModelProgress(null);
          setBusy(false);
          break;
        }
        case 'all-done': {
          setProgress(null);
          setModelProgress(null);
          setBusy(false);
          void refreshStorage();
          break;
        }
      }
    };

    search.onmessage = (event: MessageEvent<Record<string, unknown>>) => {
      const msg = event.data as { type: string };
      if (msg.type === 'token') {
        setStreamText((text) => text + (msg as unknown as { text: string }).text);
        return;
      }
      if (msg.type === 'model-progress') {
        const p = msg as unknown as { loaded: number; total: number };
        setModelProgress({ loaded: p.loaded, total: p.total });
        return;
      }
      if (msg.type === 'error') {
        const e = msg as unknown as { code: string; detail?: string };
        pendingRef.current?.reject(new RagError((e.code as RagErrorCode) ?? 'MODEL_LOAD_FAILED', e.detail));
        return;
      }
      pendingRef.current?.resolve(msg);
    };

    return () => {
      ingest.terminate();
      search.terminate();
    };
  }, [lang]);

  /* ------------------------------------------------------- network shield */

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;
    const seen = new Set<string>();
    const observer = new PerformanceObserver((list) => {
      const additions: NetworkRequest[] = [];
      for (const entry of list.getEntries()) {
        if (entry.entryType !== 'resource') continue;
        const resource = entry as PerformanceResourceTiming;
        let origin: string;
        try {
          origin = new URL(resource.name).origin;
        } catch {
          continue;
        }
        if (origin === location.origin) continue;
        const key = origin + resource.name;
        if (seen.has(key)) continue;
        seen.add(key);
        additions.push({
          id: key,
          origin: origin.replace(/^https?:\/\//, ''),
          url: resource.name,
          bytes: resource.transferSize > 0 ? resource.transferSize : null,
          at: Date.now(),
        });
      }
      if (additions.length) setRequests((prev) => [...prev, ...additions]);
    });
    try {
      observer.observe({ type: 'resource', buffered: true });
    } catch {
      observer.observe({ entryTypes: ['resource'] });
    }
    return () => observer.disconnect();
  }, []);

  const refreshStorage = async () => setStorage((await storageEstimate()) ?? null);

  /* ------------------------------------------------------------ ingestion */

  const addFiles = async (files: File[]) => {
    if (!settings) return;
    const limit = mobile ? LIMITS.mobileMaxFiles : LIMITS.maxFiles;
    const problems: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      if (file.size > LIMITS.maxFileBytes) {
        problems.push(`${file.name} — ${hintFor('FILE_TOO_LARGE', lang)}`);
        continue;
      }
      if (accepted.length + docsRef.current.length >= limit) {
        problems.push(hintFor('TOO_MANY_FILES', lang));
        break;
      }
      accepted.push(file);
      filesRef.current.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    }

    const totalBytes = docsRef.current.reduce((sum, d) => sum + d.size, 0) + accepted.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > LIMITS.maxTotalBytes) {
      setError(hintFor('TOTAL_SIZE_EXCEEDED', lang));
      return;
    }

    if (problems.length) setError(problems[0]);
    if (!accepted.length) return;

    setBusy(true);
    setError(null);
    const totalChunks = docsRef.current.reduce((sum, d) => sum + d.chunkCount, 0);
    ingestRef.current?.postMessage({
      type: 'ingest',
      files: accepted,
      modelId: settings.embeddingModel,
      totalChunksSoFar: totalChunks,
    });
  };

  /* ----------------------------------------------------------------- ask */

  const request = <T,>(payload: Record<string, unknown>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      pendingRef.current = { resolve: resolve as (value: unknown) => void, reject };
      searchRef.current?.postMessage(payload);
    });

  const collected = async (): Promise<{ chunks: Chunk[]; vectors: Float32Array[] }> => {
    const chunks: Chunk[] = [];
    const vectors: Float32Array[] = [];
    for (const doc of docsRef.current) {
      if (!doc.enabled) continue;
      const index = await loadIndex(doc.id);
      if (!index) continue;
      chunks.push(...index.chunks);
      vectors.push(...index.vectors);
    }
    return { chunks, vectors };
  };

  const push = (message: SessionMessage) => {
    setMessages((prev) => {
      const next = [...prev, message];
      void saveSession(sessionId, next);
      return next;
    });
  };

  const ask = async (question: string) => {
    if (!settings || busy) return;
    push({ id: uid(), role: 'user', text: question, at: Date.now() });
    setBusy(true);
    setPhase('searching');
    setStreamText('');
    setError(null);

    try {
      const { chunks, vectors } = await collected();
      if (chunks.length === 0) {
        // An empty library is not "not found" — say what to do instead.
        push({ id: uid(), role: 'assistant', text: '', at: Date.now(), notFound: true, kind: 'noDocs', citations: [] });
        return;
      }

      const results = await request<{ chunks: ScoredChunk[]; best: number; matches: MatchResult }>({
        type: 'search',
        queryText: question,
        chunks,
        vectors,
        modelId: settings.embeddingModel,
        k: LIMITS.topK,
      });
      setModelProgress(null);

      const matches = results.matches;
      // A low confidence score only silences the *summary*. If the library still
      // contains sentences with the words the reader typed, that is an answer of
      // sorts and it must be shown — otherwise a word that appears 30 times looks
      // like it appears twice.
      if ((!results.chunks.length || results.best < LIMITS.minConfidence) && (matches?.total ?? 0) === 0) {
        push({ id: uid(), role: 'assistant', text: '', at: Date.now(), notFound: true, citations: [] });
        return;
      }

      const citations = results.chunks.map((chunk, i) => ({
        index: i + 1,
        chunkId: chunk.chunkId,
        docName: chunk.docName,
        page: chunk.page,
        headingPath: chunk.headingPath,
        quote: chunk.text.length > 420 ? `${chunk.text.slice(0, 417)}…` : chunk.text,
      }));

      if (settings.useGeneration) {
        setPhase('generating');
        const history = messages
          .slice(-settings.contextTurns * 2)
          .map((m) => ({ role: m.role, content: m.text }))
          .filter((m) => m.content.length > 0);
        const generated = await request<{ text: string }>({
          type: 'generate',
          question,
          chunks: results.chunks,
          mode: settings.strictness,
          lang,
          modelId: settings.generationModel,
          history,
          maxNewTokens: 320,
        });
        setModelProgress(null);
        const text = (generated.text ?? '').trim();
        push({
          id: uid(),
          role: 'assistant',
          text: text || ta(lang, 'chat.notFound'),
          at: Date.now(),
          citations,
          matches,
          model: settings.generationModel,
          strictness: settings.strictness,
        });
      } else {
        const answer = extractiveAnswer(results.chunks, question, settings.strictness);
        if (answer.notFound) {
          // No quotable sentence, but the exhaustive list may still have hits.
          push({ id: uid(), role: 'assistant', text: '', at: Date.now(), notFound: true, citations: [], matches });
        } else {
          push({
            id: uid(),
            role: 'assistant',
            text: answer.text,
            at: Date.now(),
            citations: answer.citations,
            matches,
            inferred: answer.inferred,
            strictness: settings.strictness,
          });
        }
      }
      void refreshStorage();
    } catch (err) {
      const code: RagErrorCode = err instanceof RagError ? err.code : 'MODEL_LOAD_FAILED';
      setError(hintFor(code, lang));
      setModelProgress(null);
    } finally {
      setBusy(false);
      setPhase('idle');
      setStreamText('');
    }
  };

  /* ------------------------------------------------------- document ops */

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  };

  const onRename = async (id: string, name: string) => {
    const next = docsRef.current.map((d) => (d.id === id ? { ...d, name } : d));
    setDocs(next);
    await saveDocs(next);
  };

  const onToggle = async (id: string) => {
    const next = docsRef.current.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d));
    setDocs(next);
    await saveDocs(next);
  };

  const onDelete = async (id: string) => {
    if (!window.confirm(ta(lang, 'docs.confirmDelete'))) return;
    const next = docsRef.current.filter((d) => d.id !== id);
    setDocs(next);
    await saveDocs(next);
    await deleteIndex(id);
    filesRef.current.delete(id);
    void refreshStorage();
  };

  const onReindex = async (id: string) => {
    if (!settings) return;
    const file = filesRef.current.get(id);
    const doc = docsRef.current.find((d) => d.id === id);
    if (!file || !doc) return;
    const next = docsRef.current.filter((d) => d.id !== id);
    setDocs(next);
    await saveDocs(next);
    await deleteIndex(id);
    setBusy(true);
    ingestRef.current?.postMessage({
      type: 'ingest',
      files: [file],
      modelId: settings.embeddingModel,
      totalChunksSoFar: next.reduce((sum, d) => sum + d.chunkCount, 0),
    });
  };

  /* ------------------------------------------------------------- export */

  const exportSession = (format: 'md' | 'json' | 'txt') => {
    const header = [
      `# SecureRAG session — ${new Date().toISOString()}`,
      `model: ${settings?.embeddingModel}${settings?.useGeneration ? ` + ${settings.generationModel}` : ''}`,
      `strictness: ${settings?.strictness}`,
      '',
    ].join('\n');

    let body: string;
    if (format === 'json') {
      body = JSON.stringify(
        { exportedAt: new Date().toISOString(), settings, messages },
        null,
        2
      );
    } else if (format === 'txt') {
      body = messages
        .map((m) => (m.role === 'user' ? `Q: ${m.text}` : `A: ${m.text}${m.notFound ? ` (${ta(lang, 'chat.notFound')})` : ''}`))
        .join('\n\n');
    } else {
      body = header + messages
        .map((m) => {
          if (m.role === 'user') return `**Q.** ${m.text}`;
          const cites = (m.citations ?? [])
            .map((c) => `  ${c.index}. ${c.docName}${c.page ? ` p.${c.page}` : ''} — ${c.quote}`)
            .join('\n');
          return `**A.** ${m.notFound ? ta(lang, 'chat.notFound') : m.text}${cites ? `\n\n${cites}` : ''}`;
        })
        .join('\n\n');
    }

    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `securerag-session-${Date.now()}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openSource = (chunkId: string) => {
    const docId = chunkId.split(':')[0];
    void loadIndex(docId).then((index) => {
      const chunk = index?.chunks.find((c) => c.chunkId === chunkId);
      if (chunk) setPane('chat');
    });
  };

  /* -------------------------------------------------------------- render */

  const limits = useMemo(() => ({ files: LIMITS.maxFiles, size: 25, total: 200 }), []);
  const confirmSize = pendingDownload
    ? GENERATION_MODELS.find((m) => m.id === settings?.generationModel)?.sizeMB ?? 400
    : 0;

  if (!settings) {
    return <div class="sr-loading">{ta(lang, 'stage.working')}</div>;
  }

  return (
    <div class="sr-app">
      <p class="sr-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2.6 4.6 5.3v6c0 4.6 3.1 8.8 7.4 10.1 4.3-1.3 7.4-5.5 7.4-10.1v-6L12 2.6Z" stroke="currentColor" stroke-width="1.8" />
        </svg>
        {ta(lang, 'app.privacyBanner')}
      </p>

      {mobile && (
        <nav class="sr-tabs" aria-label={ta(lang, 'nav.docs')}>
          {(['docs', 'chat', 'settings'] as const).map((tab) => (
            <button type="button" class={pane === tab ? 'is-on' : ''} onClick={() => setPane(tab)}>
              {ta(lang, `nav.${tab}` as 'nav.docs')}
            </button>
          ))}
        </nav>
      )}

      <div class={`sr-grid ${mobile ? `is-${pane}` : ''}`}>
        <div class="sr-col sr-col-left">
          <DropZone
            lang={lang}
            onFiles={addFiles}
            busy={busy}
            progress={progress}
            modelProgress={modelProgress}
            limits={limits}
            mobile={mobile}
            error={error}
            onDismissError={() => setError(null)}
          />
          <DocList
            lang={lang}
            docs={docs}
            onRename={onRename}
            onDelete={onDelete}
            onToggle={onToggle}
            onReindex={onReindex}
            canReindex={(id) => filesRef.current.has(id)}
            busy={busy}
            editing={editing}
            onEdit={setEditing}
          />
          <SettingsPanel
            lang={lang}
            embeddingModel={settings.embeddingModel}
            generationModel={settings.generationModel}
            useGeneration={settings.useGeneration}
            strictness={settings.strictness}
            turns={settings.contextTurns}
            webgpu={webgpu}
            pending={pendingDownload}
            onEmbedding={(id) => updateSettings({ embeddingModel: id })}
            onGeneration={(id) => updateSettings({ generationModel: id })}
            onToggleGeneration={() => {
              if (settings.useGeneration) {
                updateSettings({ useGeneration: false });
                return;
              }
              const size = GENERATION_MODELS.find((m) => m.id === settings.generationModel)?.sizeMB ?? 400;
              setPendingDownload(size);
            }}
            onStrictness={(mode) => updateSettings({ strictness: mode })}
            onTurns={(n) => updateSettings({ contextTurns: n })}
            onConfirmDownload={() => {
              updateSettings({ useGeneration: true });
              setPendingDownload(null);
            }}
            onCancelDownload={() => setPendingDownload(null)}
            storage={storage}
            busy={busy}
          />
        </div>

        <div class="sr-col sr-col-right">
          <ChatPanel
            lang={lang}
            messages={messages}
            onAsk={ask}
            busy={busy}
            phase={phase}
            streamText={streamText}
            strictness={settings.strictness}
            onExport={exportSession}
            onClear={() => {
              setMessages([]);
              void saveSession(sessionId, []);
            }}
            onOpenSource={openSource}
          />
          <Shield lang={lang} requests={requests} modelBytes={busy || modelProgress ? modelProgress : null} />
        </div>
      </div>

      {pendingDownload !== null && (
        <DownloadConfirm
          lang={lang}
          sizeMB={confirmSize}
          onConfirm={() => {
            updateSettings({ useGeneration: true });
            setPendingDownload(null);
          }}
          onCancel={() => setPendingDownload(null)}
        />
      )}
    </div>
  );
}

function safeHint(code: RagErrorCode, lang: Lang): string {
  try {
    return hintFor(code, lang);
  } catch {
    return hintFor('UNSUPPORTED_FORMAT', lang);
  }
}
