import type { FunctionComponent } from 'preact';
import { ta } from '../../i18n/app';
import type { Lang } from '../../i18n/utils';
import type { DocMeta, SessionMessage } from '../../lib/rag/store';
import { EMBEDDING_MODELS, GENERATION_MODELS, type EmbeddingModel } from '../../lib/rag/models';

/**
 * Wrap the query terms inside a matched sentence so the reader can see at a
 * glance *why* the line is in the list. Longest term first, so a phrase is not
 * chopped up by one of its own words. Prefix rule on the right mirrors the
 * matcher: "potato" highlights "potatoes".
 */
function highlightTerms(text: string, terms: string[]) {
  if (terms.length === 0) return text;
  const escaped = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const wanted = terms.map((t) => t.toLowerCase());
  return text
    .split(re)
    .map((part, i) => (wanted.some((t) => part.toLowerCase().startsWith(t)) ? <mark key={i}>{part}</mark> : part));
}

export interface ProgressState {
  file: string;
  stage: 'parse' | 'chunk' | 'embed' | 'model' | 'done';
  done?: number;
  total?: number;
}

export interface NetworkRequest {
  id: string;
  origin: string;
  url: string;
  bytes: number | null;
  at: number;
}

interface Base {
  lang: Lang;
}

/* ------------------------------------------------------------------ drop zone */

export const DropZone: FunctionComponent<
  Base & {
    onFiles: (files: File[]) => void;
    busy: boolean;
    progress: ProgressState | null;
    modelProgress: { loaded: number; total: number } | null;
    limits: { files: number; size: number; total: number };
    mobile: boolean;
    error: string | null;
    onDismissError: () => void;
  }
> = ({ lang, onFiles, busy, progress, modelProgress, limits, mobile, error, onDismissError }) => {
  const pick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx,.txt,.md,.markdown,.csv,.html,.htm,.json';
    input.onchange = () => onFiles(Array.from(input.files ?? []));
    input.click();
  };

  const fileLimit = mobile ? Math.min(limits.files, 10) : limits.files;

  return (
    <section class="sr-panel" aria-label={ta(lang, 'docs.title')}>
      <div
        class={`sr-drop ${busy ? 'is-busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('is-over');
        }}
        onDragLeave={(e) => e.currentTarget.classList.remove('is-over')}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('is-over');
          onFiles(Array.from(e.dataTransfer?.files ?? []));
        }}
      >
        <div class="sr-drop-ic" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V5m0 0L8.2 8.8M12 5l3.8 3.8M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2>{ta(lang, 'drop.title')}</h2>
        <p class="sr-muted">{ta(lang, 'drop.hint')}</p>
        <p class="sr-formats">{ta(lang, 'drop.formats')}</p>
        <p class="sr-limits">{ta(lang, 'drop.limits', { files: fileLimit, size: 25, total: 200 })}</p>
        {mobile && <p class="sr-limits">{ta(lang, 'drop.mobileNote', { files: Math.min(limits.files, 10) })}</p>}
        <button class="btn btn-blue" type="button" onClick={pick} disabled={busy}>
          {ta(lang, 'drop.choose')}
        </button>
      </div>

      {error && (
        <div class="sr-error" role="alert">
          <span>{error}</span>
          <button type="button" class="sr-x" onClick={onDismissError} aria-label="dismiss">
            ×
          </button>
        </div>
      )}

      {progress && (
        <div class="sr-progress" aria-live="polite">
          <div class="sr-progress-top">
            <span class="sr-trunc">{progress.file}</span>
            <span class="sr-muted">
              {ta(lang, `stage.${progress.stage}` as 'stage.parse')}
              {progress.total ? ` · ${progress.done ?? 0}/${progress.total}` : ''}
            </span>
          </div>
          <div class="sr-bar">
            <i
              style={{
                width: progress.total ? `${Math.round(((progress.done ?? 0) / progress.total) * 100)}%` : '35%',
              }}
            />
          </div>
        </div>
      )}

      {modelProgress && (
        <div class="sr-progress" aria-live="polite">
          <div class="sr-progress-top">
            <span>{ta(lang, 'stage.model')}</span>
            <span class="sr-muted">
              {(modelProgress.loaded / 1048576).toFixed(1)} / {(modelProgress.total / 1048576).toFixed(1)} MB
            </span>
          </div>
          <div class="sr-bar">
            <i style={{ width: `${Math.round((modelProgress.loaded / modelProgress.total) * 100)}%` }} />
          </div>
        </div>
      )}
    </section>
  );
};

/* -------------------------------------------------------------------- library */

export const DocList: FunctionComponent<
  Base & {
    docs: DocMeta[];
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    onReindex: (id: string) => void;
    canReindex: (id: string) => boolean;
    busy: boolean;
    editing: string | null;
    onEdit: (id: string | null) => void;
  }
> = ({ lang, docs, onRename, onDelete, onToggle, onReindex, canReindex, busy, editing, onEdit }) => {
  const totalChunks = docs.reduce((sum, d) => sum + d.chunkCount, 0);

  return (
    <section class="sr-panel" aria-label={ta(lang, 'docs.title')}>
      <header class="sr-panel-head">
        <h2>{ta(lang, 'docs.title')}</h2>
        <span class="sr-muted">{ta(lang, 'docs.count', { n: docs.length, chunks: totalChunks })}</span>
      </header>

      {docs.length === 0 ? (
        <p class="sr-muted sr-empty">{ta(lang, 'docs.empty')}</p>
      ) : (
        <ul class="sr-docs">
          {docs.map((doc) => (
            <li class={`sr-doc ${doc.enabled ? '' : 'is-off'}`}>
              <span class={`sr-ft sr-ft-${doc.kind}`}>{doc.kind.slice(0, 3).toUpperCase()}</span>
              {/* The actions sit under the name on purpose: with them beside it the
                  file name had barely half the column and was truncated early. */}
              <div class="sr-doc-main">
                {editing === doc.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = (e.currentTarget as HTMLFormElement).elements.namedItem('name') as HTMLInputElement;
                      onRename(doc.id, input.value.trim() || doc.name);
                      onEdit(null);
                    }}
                  >
                    <input name="name" class="sr-input" value={doc.name} autoFocus />
                    <button class="sr-link" type="submit">
                      {ta(lang, 'docs.save')}
                    </button>
                    <button class="sr-link" type="button" onClick={() => onEdit(null)}>
                      {ta(lang, 'docs.cancel')}
                    </button>
                  </form>
                ) : (
                  <>
                    <b class="sr-trunc">{doc.name}</b>
                    <span class="sr-muted">
                      {doc.pages > 0 ? `${ta(lang, 'docs.pages', { n: doc.pages })} · ` : ''}
                      {doc.chunkCount} chunks
                      {doc.enabled ? '' : ` · ${ta(lang, 'docs.excluded')}`}
                    </span>
                  </>
                )}
                <div class="sr-doc-actions">
                  <button class="sr-link" type="button" onClick={() => onEdit(doc.id)} disabled={busy}>
                    {ta(lang, 'docs.rename')}
                  </button>
                  <button class="sr-link" type="button" onClick={() => onToggle(doc.id)} disabled={busy}>
                    {ta(lang, doc.enabled ? 'docs.disable' : 'docs.enable')}
                  </button>
                  <button
                    class="sr-link"
                    type="button"
                    onClick={() => onReindex(doc.id)}
                    disabled={busy || !canReindex(doc.id)}
                    title={canReindex(doc.id) ? '' : ta(lang, 'drop.hint')}
                  >
                    {ta(lang, 'docs.reindex')}
                  </button>
                  <button class="sr-link sr-danger" type="button" onClick={() => onDelete(doc.id)} disabled={busy}>
                    {ta(lang, 'docs.delete')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/* ----------------------------------------------------------------------- chat */

export const ChatPanel: FunctionComponent<
  Base & {
    messages: SessionMessage[];
    onAsk: (question: string) => void;
    busy: boolean;
    phase: 'idle' | 'searching' | 'generating';
    streamText: string;
    strictness: 'strict' | 'balanced';
    onExport: (format: 'md' | 'json' | 'txt') => void;
    onClear: () => void;
    onOpenSource: (chunkId: string) => void;
  }
> = ({ lang, messages, onAsk, busy, phase, streamText, strictness, onExport, onClear, onOpenSource }) => {
  let input: HTMLTextAreaElement | undefined;

  const submit = () => {
    const value = input?.value.trim();
    if (!value || busy) return;
    onAsk(value);
    if (input) input.value = '';
  };

  return (
    <section class="sr-panel sr-chat" aria-label={ta(lang, 'chat.title')}>
      <header class="sr-panel-head">
        <h2>{ta(lang, 'chat.title')}</h2>
        <span class={`sr-badge ${strictness === 'strict' ? 'is-strict' : 'is-balanced'}`}>
          {ta(lang, strictness === 'strict' ? 'settings.strict' : 'settings.balanced')}
        </span>
        <div class="sr-head-actions">
          {/* Plain text first: that is the format people actually open. */}
          <span class="sr-export">
            <span class="sr-muted">{ta(lang, 'chat.export')}</span>
            {(['txt', 'md', 'json'] as const).map((format) => (
              <button
                class="sr-link"
                type="button"
                key={format}
                onClick={() => onExport(format)}
                disabled={messages.length === 0}
                title={ta(lang, format === 'txt' ? 'export.text' : format === 'md' ? 'export.markdown' : 'export.json')}
              >
                .{format}
              </button>
            ))}
          </span>
          <button class="sr-link" type="button" onClick={onClear} disabled={messages.length === 0}>
            {ta(lang, 'chat.clear')}
          </button>
        </div>
      </header>

      <div class="sr-thread" aria-live="polite">
        {messages.length === 0 && phase === 'idle' && <p class="sr-muted sr-empty">{ta(lang, 'chat.empty')}</p>}

        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div class="sr-q">{msg.text}</div>
          ) : (
            <article class="sr-a">
              <header>
                <span class="sr-dot" aria-hidden="true" />
                {ta(lang, msg.model ? 'chat.answerGenerated' : 'chat.answerLabel')}
                {msg.model ? <span class="sr-mono sr-muted"> · {msg.model}</span> : null}
              </header>

              {msg.notFound ? (
                <div class="sr-notfound">
                  {msg.kind === 'noDocs' ? (
                    <>
                      <b>{ta(lang, 'chat.noDocs')}</b>
                      <p class="sr-muted">{ta(lang, 'chat.noDocsHelp')}</p>
                    </>
                  ) : (
                    <>
                      <b>{msg.text || ta(lang, 'chat.notFound')}</b>
                      <p class="sr-muted">{ta(lang, 'chat.notFoundHelp')}</p>
                    </>
                  )}
                </div>
              ) : (
                <p class="sr-atext">
                  {msg.text.split(/(\[\d+\])/g).map((part) => {
                    const m = part.match(/^\[(\d+)\]$/);
                    if (!m) return part;
                    const cite = msg.citations?.find((c) => c.index === Number(m[1]));
                    return (
                      <button
                        type="button"
                        class="sr-cite"
                        onClick={() => cite && onOpenSource(cite.chunkId)}
                        title={cite ? `${cite.docName}${cite.page ? ` · p.${cite.page}` : ''}` : ''}
                      >
                        {m[1]}
                      </button>
                    );
                  })}
                </p>
              )}

              {!msg.model && msg.citations && msg.citations.length > 0 && (
                <p class="sr-mode-note">{ta(lang, 'chat.extractiveNote')}</p>
              )}

              {msg.citations && msg.citations.length > 0 && (
                <div class="sr-sources">
                  <span class="sr-sources-h">{ta(lang, 'chat.sources')}</span>
                  {msg.citations.map((c) => (
                    <div class="sr-src">
                      <div class="sr-src-h">
                        <b>{c.index}</b>
                        <span class="sr-trunc">
                          {c.docName}
                          {c.page ? ` · p.${c.page}` : ''}
                          {c.headingPath.length ? ` · ${c.headingPath.at(-1)}` : ''}
                        </span>
                      </div>
                      <p>{c.quote}</p>
                    </div>
                  ))}
                </div>
              )}

              {msg.matches && msg.matches.total > 0 && (
                <details class="sr-matches">
                  <summary>
                    <span class="sr-matches-h">{ta(lang, 'match.title', { n: msg.matches.total })}</span>
                    <span class="sr-muted">{ta(lang, 'match.files', { n: msg.matches.docs.length })}</span>
                  </summary>
                  <p class="sr-muted sr-matches-note">{ta(lang, 'match.note')}</p>
                  {msg.matches.capped && (
                    <p class="sr-muted">
                      {ta(lang, 'match.capped', {
                        n: msg.matches.docs.reduce((sum, d) => sum + d.items.length, 0),
                        total: msg.matches.total,
                      })}
                    </p>
                  )}
                  {msg.matches.docs.map((doc) => (
                    <div class="sr-matches-doc">
                      <div class="sr-matches-doc-h">
                        <b class="sr-trunc">{doc.docName}</b>
                        <span class="sr-muted">{doc.count}</span>
                      </div>
                      <ol>
                        {doc.items.map((item) => (
                          <li>
                            {item.heading.length > 0 && (
                              <span class="sr-match-h">
                                {item.heading.filter((h, i, arr) => i === 0 || h !== arr[i - 1]).join(' › ')}
                              </span>
                            )}
                            <button type="button" class="sr-match-t" onClick={() => onOpenSource(item.chunkId)}>
                              {highlightTerms(item.text, item.terms)}
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </details>
              )}

              {msg.inferred && msg.inferred.length > 0 && (
                <p class="sr-inferred">
                  {msg.inferred.length} × {ta(lang, 'chat.inferredLabel')}
                </p>
              )}
            </article>
          )
        )}

        {busy && (
          <article class="sr-a is-live">
            <header>
              <span class="sr-dot" aria-hidden="true" />
              {ta(lang, phase === 'generating' ? 'chat.generating' : 'chat.thinking')}
            </header>
            {streamText ? <p class="sr-atext">{streamText}</p> : <div class="sr-dots"><i /><i /><i /></div>}
          </article>
        )}
      </div>

      <div class="sr-composer">
        <textarea
          ref={(el) => {
            input = el as HTMLTextAreaElement;
          }}
          class="sr-input sr-textarea"
          rows={2}
          placeholder={ta(lang, 'chat.placeholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button class="btn btn-blue" type="button" onClick={submit} disabled={busy}>
          {ta(lang, 'chat.send')}
        </button>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------- network shield */

export const Shield: FunctionComponent<
  Base & { requests: NetworkRequest[]; modelBytes: { loaded: number; total: number } | null }
> = ({ lang, requests, modelBytes }) => (
  <section class="sr-panel sr-shield" aria-label={ta(lang, 'shield.title')}>
    <header class="sr-panel-head">
      <h2>{ta(lang, 'shield.title')}</h2>
      <span class="sr-badge is-local">{ta(lang, 'app.offlineReady')}</span>
    </header>
    <p class="sr-muted">{ta(lang, 'shield.desc')}</p>

    {requests.length === 0 && !modelBytes ? (
      <p class="sr-muted sr-empty">{ta(lang, 'shield.none')}</p>
    ) : (
      <ul class="sr-nets">
        {modelBytes && (
          <li>
            <span class="sr-net-purpose">{ta(lang, 'shield.model')}</span>
            <span class="sr-mono sr-trunc">
              {(modelBytes.loaded / 1048576).toFixed(1)} / {(modelBytes.total / 1048576).toFixed(1)} MB
            </span>
          </li>
        )}
        {requests.map((r) => (
          <li>
            <span class="sr-net-purpose sr-trunc" title={r.url}>
              {r.origin}
            </span>
            <span class="sr-mono">
              {r.bytes === null ? '—' : ta(lang, 'shield.bytes', { n: Math.round(r.bytes / 1024) })}
            </span>
          </li>
        ))}
      </ul>
    )}
    <p class="sr-muted sr-shield-note">{ta(lang, 'shield.local')}</p>
    <p class="sr-muted sr-shield-note">{ta(lang, 'shield.verify')}</p>
  </section>
);

/* ------------------------------------------------------------------- settings */

export const SettingsPanel: FunctionComponent<
  Base & {
    embeddingModel: string;
    generationModel: string;
    useGeneration: boolean;
    strictness: 'strict' | 'balanced';
    turns: number;
    webgpu: boolean;
    pending: number | null;
    onEmbedding: (id: string) => void;
    onGeneration: (id: string) => void;
    onToggleGeneration: () => void;
    onStrictness: (mode: 'strict' | 'balanced') => void;
    onTurns: (n: number) => void;
    onConfirmDownload: () => void;
    onCancelDownload: () => void;
    storage: { usage: number; quota: number } | null;
    busy: boolean;
  }
> = (props) => {
  const { lang, webgpu, pending } = props;
  return (
    <section class="sr-panel" aria-label={ta(lang, 'settings.title')}>
      <header class="sr-panel-head">
        <h2>{ta(lang, 'settings.title')}</h2>
        <span class={`sr-badge ${webgpu ? 'is-local' : ''}`}>{webgpu ? 'WebGPU' : 'CPU / WASM'}</span>
      </header>

      <label class="sr-field">
        <span>{ta(lang, 'settings.embedding')}</span>
        <select
          class="sr-input"
          value={props.embeddingModel}
          onChange={(e) => props.onEmbedding((e.currentTarget as HTMLSelectElement).value)}
          disabled={props.busy}
        >
          {EMBEDDING_MODELS.map((m: EmbeddingModel) => (
            <option value={m.id}>
              {m.label[lang]} — ≈ {m.sizeMB} MB
            </option>
          ))}
        </select>
      </label>

      <fieldset class="sr-field">
        <legend>{ta(lang, 'settings.strictness')}</legend>
        <div class="sr-seg">
          <button
            type="button"
            class={props.strictness === 'strict' ? 'is-on' : ''}
            onClick={() => props.onStrictness('strict')}
          >
            {ta(lang, 'settings.strict')}
          </button>
          <button
            type="button"
            class={props.strictness === 'balanced' ? 'is-on' : ''}
            onClick={() => props.onStrictness('balanced')}
          >
            {ta(lang, 'settings.balanced')}
          </button>
        </div>
        <p class="sr-muted">
          {ta(lang, props.strictness === 'strict' ? 'chat.strictHint' : 'chat.balancedHint')}
        </p>
      </fieldset>

      <label class="sr-field">
        <span>{ta(lang, 'settings.turns', { n: props.turns })}</span>
        <input
          class="sr-range"
          type="range"
          min={0}
          max={10}
          value={props.turns}
          onInput={(e) => props.onTurns(Number((e.currentTarget as HTMLInputElement).value))}
        />
      </label>

      <div class="sr-field sr-gen">
        <label class="sr-check">
          <input
            type="checkbox"
            checked={props.useGeneration}
            onChange={props.onToggleGeneration}
            disabled={props.busy || pending !== null}
          />
          <span>{ta(lang, 'settings.generationToggle')}</span>
        </label>
        <p class="sr-muted">{ta(lang, 'settings.generationNote')}</p>
        <select
          class="sr-input"
          value={props.generationModel}
          onChange={(e) => props.onGeneration((e.currentTarget as HTMLSelectElement).value)}
          disabled={props.busy}
        >
          {GENERATION_MODELS.map((m) => (
            <option value={m.id}>
              {m.label[lang]} — ≈ {m.sizeMB} MB
            </option>
          ))}
        </select>
      </div>

      {props.storage && (
        <p class="sr-muted sr-storage">
          {ta(lang, 'stats.storage', { mb: (props.storage.usage / 1048576).toFixed(1) })}
        </p>
      )}
    </section>
  );
};

/* -------------------------------------------------------------- confirm dialog */

export const DownloadConfirm: FunctionComponent<
  Base & { sizeMB: number; onConfirm: () => void; onCancel: () => void }
> = ({ lang, sizeMB, onConfirm, onCancel }) => (
  <div class="sr-modal" role="dialog" aria-modal="true">
    <div class="sr-modal-box">
      <h3>{ta(lang, 'settings.confirmTitle', { size: sizeMB })}</h3>
      <p class="sr-muted">{ta(lang, 'settings.confirmBody')}</p>
      <div class="sr-modal-actions">
        <button class="btn btn-blue" type="button" onClick={onConfirm}>
          {ta(lang, 'settings.confirm')}
        </button>
        <button class="btn btn-white" type="button" onClick={onCancel}>
          {ta(lang, 'settings.cancel')}
        </button>
      </div>
    </div>
  </div>
);
