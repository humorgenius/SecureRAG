// Imported here, not in each page: the styles must travel with the island that
// depends on them. Forgetting this import on the tool pages left every .sr-*
// element at browser-default size (a 51x162px paste box) with no error anywhere.
import '../../styles/app.css';
import { useState } from 'preact/hooks';
import { ta } from '../../i18n/app';
import type { Lang } from '../../i18n/utils';
import { LIMITS } from '../../lib/rag/limits';
import { chunkDoc } from '../../lib/rag/chunk';
import { detectKind } from '../../lib/rag/detect';
import type { Chunk } from '../../lib/rag/types';

export type ToolId = 'pdf-text' | 'token-counter' | 'chunk-preview';

const estTokens = (text: string): number => {
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const rest = text.length - cjk;
  return Math.round(cjk / 1.5 + rest / 4);
};

const readText = (file: File) => file.text();

/** Drag-or-click file picker shared by all three tools. */
function Picker({
  lang,
  accept,
  onText,
  onFile,
  label,
  hint,
}: {
  lang: Lang;
  accept: string;
  onText?: (text: string, name: string) => void;
  onFile?: (file: File) => void;
  label: string;
  hint: string;
}) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      if (onFile) onFile(file);
      else onText?.(await readText(file), file.name);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        class={`sr-drop ${over ? 'is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer?.files?.[0];
          if (file) void take(file);
        }}
      >
        <p class="sr-drop-title">{label}</p>
        <p class="sr-drop-sub">{hint}</p>
        <p class="sr-drop-formats">
          {busy ? ta(lang, 'tools.working') : accept.replaceAll(',', ' · ')}
        </p>
        <label class="btn btn-blue">
          {ta(lang, 'drop.choose')}
          <input
            type="file"
            accept={accept}
            hidden
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) void take(file);
            }}
          />
        </label>
        <p class="sr-drop-limits">{ta(lang, 'drop.localOnly')}</p>
      </div>
      {error && <p class="sr-error">{error}</p>}
    </div>
  );
}

function PdfText({ lang }: { lang: Lang }) {
  const [pages, setPages] = useState<{ n: number; chars: number; text: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = async (file: File) => {
    setBusy(true);
    setError(null);
    setPages(null);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/ort/pdf.worker.min.mjs';
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer(), useSystemFonts: false }).promise;
      const out: { n: number; chars: number; text: string }[] = [];
      for (let i = 1; i <= doc.numPages && i <= 300; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        let text = '';
        for (const item of content.items as { str?: string; hasEOL?: boolean }[]) {
          if (typeof item.str !== 'string') continue;
          text += item.str + (item.hasEOL ? '\n' : '');
        }
        const clean = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
        out.push({ n: i, chars: clean.length, text: clean });
      }
      await (doc as unknown as { destroy?: () => Promise<void> }).destroy?.();
      const total = out.reduce((sum, p) => sum + p.chars, 0);
      if (total < 40) setError(ta(lang, 'err.noTextLayer'));
      else setPages(out);
    } catch (e) {
      const name = (e as { name?: string })?.name ?? '';
      setError(name === 'PasswordException' ? ta(lang, 'err.encrypted') : `${ta(lang, 'err.parse')} ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const full = pages?.map((p) => `--- page ${p.n} ---\n${p.text}`).join('\n\n') ?? '';

  return (
    <div class="sr-tool">
      <Picker
        lang={lang}
        accept="application/pdf,.pdf"
        onFile={(f) => void extract(f)}
        label={ta(lang, 'tools.pdf.label')}
        hint={ta(lang, 'tools.pdf.hint')}
      />
      {busy && <p class="sr-hint">{ta(lang, 'tools.working')}</p>}
      {error && <p class="sr-error">{error}</p>}
      {pages && (
        <>
          <p class="sr-hint">
            {ta(lang, 'tools.pdf.pages')}: {pages.length} · {ta(lang, 'tools.chars')}:{' '}
            {pages.reduce((s, p) => s + p.chars, 0).toLocaleString()}
          </p>
          <div class="sr-scroll">
            <table class="sr-table">
              <thead>
                <tr>
                  <th>{ta(lang, 'tools.pdf.page')}</th>
                  <th>{ta(lang, 'tools.chars')}</th>
                  <th>{ta(lang, 'tools.pdf.preview')}</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.n}>
                    <td>{p.n}</td>
                    <td>{p.chars.toLocaleString()}</td>
                    <td class="sr-cut">{p.text.slice(0, 90).replace(/\n/g, ' ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div class="sr-row">
            <button
              class="btn btn-ghost"
              type="button"
              onClick={() => void navigator.clipboard.writeText(full)}
            >
              {ta(lang, 'tools.copy')}
            </button>
            <button
              class="btn btn-blue"
              type="button"
              onClick={() => {
                const url = URL.createObjectURL(new Blob([full], { type: 'text/plain;charset=utf-8' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'extracted.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              {ta(lang, 'tools.download')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TokenCounter({ lang }: { lang: Lang }) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');

  const chars = text.length;
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9']+/g) ?? []).length;
  const tokens = estTokens(text);
  const chunks = Math.max(0, Math.ceil(chars / (LIMITS.chunkSize * (1 - LIMITS.chunkOverlap))));
  const bytes = new TextEncoder().encode(text).length;

  return (
    <div class="sr-tool">
      <Picker
        lang={lang}
        accept=".txt,.md,.csv,.json,text/plain"
        onText={(t, n) => {
          setText(t.slice(0, 400000));
          setName(n);
        }}
        label={ta(lang, 'tools.tokens.label')}
        hint={ta(lang, 'tools.tokens.hint')}
      />
      <textarea
        class="sr-input sr-textarea-lg"
        value={text}
        placeholder={ta(lang, 'tools.tokens.paste')}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
      />
      {name && <p class="sr-hint">{name}</p>}
      <div class="sr-stats">
        {[
          [ta(lang, 'tools.chars'), chars.toLocaleString()],
          [ta(lang, 'tools.cjk'), cjk.toLocaleString()],
          [ta(lang, 'tools.words'), words.toLocaleString()],
          [ta(lang, 'tools.bytes'), bytes.toLocaleString()],
          [ta(lang, 'tools.tokens'), `≈ ${tokens.toLocaleString()}`],
          [ta(lang, 'tools.chunks'), chunks.toLocaleString()],
        ].map(([label, value]) => (
          <div class="sr-stat" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p class="sr-hint">{ta(lang, 'tools.tokens.note')}</p>
    </div>
  );
}

function ChunkPreview({ lang }: { lang: Lang }) {
  const [text, setText] = useState('');
  const [name, setName] = useState(ta(lang, 'tools.chunks.sample'));
  const [size, setSize] = useState<number>(LIMITS.chunkSize);
  const [overlap, setOverlap] = useState(Math.round(LIMITS.chunkOverlap * 100));

  const chunks: Chunk[] = text.trim()
    ? chunkDoc(
        {
          id: 'local',
          name,
          kind: (() => {
            try {
              return detectKind(new TextEncoder().encode(text.slice(0, 512)), name);
            } catch {
              return 'txt' as const;
            }
          })(),
          size: text.length,
          pages: [{ page: 1, text }],
        },
        { size, overlap: overlap / 100 }
      )
    : [];

  const avg = chunks.length ? Math.round(chunks.reduce((s, c) => s + c.text.length, 0) / chunks.length) : 0;
  const carry = Math.round(size * (overlap / 100));

  return (
    <div class="sr-tool">
      <Picker
        lang={lang}
        accept=".txt,.md,.csv,.json,text/plain"
        onText={(t, n) => {
          setText(t.slice(0, 200000));
          setName(n);
        }}
        label={ta(lang, 'tools.chunks.label')}
        hint={ta(lang, 'tools.chunks.hint')}
      />
      <textarea
        class="sr-input sr-textarea-lg"
        value={text}
        placeholder={ta(lang, 'tools.chunks.paste')}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
      />
      <div class="sr-row sr-sliders">
        <label>
          {ta(lang, 'tools.chunks.size')}: <b>{size}</b>
          <input
            type="range"
            min={200}
            max={1600}
            step={50}
            value={size}
            onInput={(e) => setSize(Number((e.target as HTMLInputElement).value))}
          />
        </label>
        <label>
          {ta(lang, 'tools.chunks.overlap')}: <b>{overlap}%</b>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={overlap}
            onInput={(e) => setOverlap(Number((e.target as HTMLInputElement).value))}
          />
        </label>
      </div>
      {chunks.length > 0 && (
        <>
          <p class="sr-hint">
            {chunks.length} {ta(lang, 'tools.chunks.count')} · {ta(lang, 'tools.chunks.avg')} {avg} ·{' '}
            {ta(lang, 'tools.chunks.carry')} ~{carry}
          </p>
          <ol class="sr-chunks">
            {chunks.slice(0, 40).map((c) => (
              <li key={c.chunkId}>
                <div class="sr-chunk-head">
                  <b>#{c.chunkId}</b>
                  <span>{c.text.length}</span>
                  {c.headingPath.length > 0 && <span class="sr-path">{c.headingPath.join(' › ')}</span>}
                </div>
                <p>{c.text.length > 420 ? `${c.text.slice(0, 420)}…` : c.text}</p>
              </li>
            ))}
          </ol>
          {chunks.length > 40 && <p class="sr-hint">{ta(lang, 'tools.chunks.more')}</p>}
        </>
      )}
    </div>
  );
}

export default function Tools({ tool, lang }: { tool: ToolId; lang: Lang }) {
  if (tool === 'pdf-text') return <PdfText lang={lang} />;
  if (tool === 'token-counter') return <TokenCounter lang={lang} />;
  return <ChunkPreview lang={lang} />;
}
