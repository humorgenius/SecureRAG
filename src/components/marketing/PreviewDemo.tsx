import { useMemo, useState } from 'preact/hooks';
import { demoChips, demoChunks } from '../../data/demo-corpus';
import type { Lang } from '../../i18n/utils';
import { matchAll } from '../../lib/rag/match-all';
import '../../styles/demo-card.css';

/**
 * The hero card's right column, now live.
 *
 * Before: a grey string in a div pretending to be an input, and a button that did
 * nothing. The first paint here renders exactly the same markup with exactly the
 * same classes, so the card is unchanged — only the input is a real input, and the
 * answer area answers.
 *
 * Submitting runs `matchAll` from the shipped engine over three bundled documents
 * (see demo-corpus). No model is downloaded, nothing is uploaded, and the match
 * count is the whole point: every sentence containing the word is listed.
 */

export interface PreviewMock {
  question: string;
  answerLabel: string;
  answer: { a: string; strong: string; b: string; c1: string; mid: string; c2: string };
  sourceLabel: string;
  source: { pre: string; mark: string; post: string };
}

export interface PreviewDemoLabels {
  placeholder: string;
  button: string;
  matches: string;
  matchesOne: string;
  files: string;
  filesOne: string;
  none: string;
  note: string;
  openTool: string;
  reset: string;
}

interface Props {
  lang: Lang;
  mock: PreviewMock;
  labels: PreviewDemoLabels;
  toolHref: string;
}

/** Mark the searched words inside a matched sentence. Longest first, so a phrase
 *  is not chopped up by one of its own words. */
function highlight(text: string, terms: string[]) {
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

export default function PreviewDemo({ lang, mock, labels, toolHref }: Props) {
  const chunks = useMemo(() => demoChunks(lang), [lang]);
  const chips = demoChips[lang];
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');

  const result = useMemo(() => (query.length > 0 ? matchAll(chunks, query) : null), [chunks, query]);

  const run = (text: string) => {
    const next = text.trim();
    if (next.length === 0) return;
    setValue(next);
    setQuery(next);
  };

  return (
    <>
      {result ? (
        <div class="q2">{query}</div>
      ) : (
        <div class="q2">{mock.question}</div>
      )}

      <div class="a2">
        {result ? (
          <>
            <div class="who">
              {result.total > 0
                ? `${(result.total === 1 ? labels.matchesOne : labels.matches).replace('{n}', String(result.total))} · ${(result.docs.length === 1 ? labels.filesOne : labels.files).replace('{n}', String(result.docs.length))}`
                : labels.none}
            </div>
            {result.total > 0 && (
              <div class="demo-hits">
                {result.docs.map((doc) => (
                  <div class="demo-doc">
                    <div class="demo-doc-h">
                      <b>{doc.docName}</b>
                      <span>{doc.count}</span>
                    </div>
                    <ul>
                      {doc.items.map((item) => (
                        <li>{highlight(item.text, item.terms)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {result.total === 0 && (
              <div class="demo-chips">
                {chips.map((chip) => (
                  <button type="button" class="demo-chip" onClick={() => run(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <p class="demo-note">{labels.note}</p>
            <div class="demo-foot">
              <a class="demo-open" href={toolHref}>
                {labels.openTool} →
              </a>
              <button type="button" class="demo-reset" onClick={() => {
                setQuery('');
                setValue('');
              }}>
                {labels.reset}
              </button>
            </div>
          </>
        ) : (
          <>
            <div class="who">● {mock.answerLabel}</div>
            <p>
              {mock.answer.a}
              <strong>{mock.answer.strong}</strong>
              {mock.answer.b}
              <span class="cite">{mock.answer.c1}</span>
              {mock.answer.mid}
              <span class="cite">{mock.answer.c2}</span>
            </p>
            <div class="srcline">
              <div class="sh">{mock.sourceLabel}</div>
              <div class="sb">
                {mock.source.pre}
                <mark>{mock.source.mark}</mark>
                {mock.source.post}
              </div>
            </div>
          </>
        )}
      </div>

      <div class="hc-foot">
        <input
          class="ph2"
          type="text"
          value={value}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          onInput={(e) => setValue((e.currentTarget as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              run((e.currentTarget as HTMLInputElement).value);
            }
          }}
        />
        <button class="btn btn-blue" type="button" onClick={() => run(value)} disabled={value.trim().length === 0}>
          {labels.button}
        </button>
      </div>
    </>
  );
}
