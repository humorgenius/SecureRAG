import type { MatchResult } from './match-all';
import type { SessionMessage } from './store';
import type { Strictness } from './types';

/**
 * Session export.
 *
 * Pulled out of the component so the one thing that matters here can be tested:
 * an answer's exhaustive match list is part of the answer. The tool exists to
 * show every sentence that contains a word, so an export that kept only the
 * three quoted sentences would silently drop most of what the reader came for.
 *
 * The JSON export needs no work — each message carries its `matches` already.
 * Markdown and plain text get the list spelled out.
 */

export interface ExportMeta {
  at: string;
  embeddingModel: string;
  generationModel: string;
  useGeneration: boolean;
  strictness: Strictness;
}

export interface ExportLabels {
  notFound: string;
  /** e.g. "4 matches" / "全部匹配处 · 4 句" */
  matchesTitle: (count: number) => string;
  /** e.g. "in 2 files" / "来自 2 份文件" */
  filesCount: (count: number) => string;
  /** e.g. "3 matches" for a single document */
  perDoc: (count: number) => string;
  note: string;
}

export type ExportFormat = 'md' | 'json' | 'txt';

function matchBlock(matches: MatchResult, labels: ExportLabels, format: 'md' | 'txt'): string {
  if (matches.total === 0) return '';
  const lines: string[] = [];

  const heading = `${labels.matchesTitle(matches.total)}（${labels.filesCount(matches.docs.length)}）`;
  lines.push(format === 'md' ? `**${heading}**` : heading);
  lines.push('');

  for (const doc of matches.docs) {
    const docHeading = `${doc.docName} — ${labels.perDoc(doc.count)}`;
    lines.push(format === 'md' ? `**${docHeading}**` : docHeading);
    for (const item of doc.items) {
      const where = item.heading.length > 0 ? `${item.heading.join(' › ')} — ` : '';
      lines.push(format === 'md' ? `- ${where}${item.text}` : `  · ${where}${item.text}`);
    }
    lines.push('');
  }

  lines.push(format === 'md' ? `*${labels.note}*` : labels.note);
  return lines.join('\n');
}

export function buildSessionExport(
  format: ExportFormat,
  messages: SessionMessage[],
  meta: ExportMeta,
  labels: ExportLabels
): string {
  if (format === 'json') {
    // Messages already carry matches, citations and inferred lines.
    return JSON.stringify(
      {
        exportedAt: meta.at,
        settings: {
          embeddingModel: meta.embeddingModel,
          generationModel: meta.useGeneration ? meta.generationModel : null,
          useGeneration: meta.useGeneration,
          strictness: meta.strictness,
        },
        messages,
      },
      null,
      2
    );
  }

  if (format === 'txt') {
    return messages
      .map((m) => {
        if (m.role === 'user') return `Q: ${m.text}`;
        const answer = `A: ${m.text}${m.notFound ? ` (${labels.notFound})` : ''}`;
        const matches = m.matches ? matchBlock(m.matches, labels, 'txt') : '';
        return matches ? `${answer}\n\n${matches}` : answer;
      })
      .join('\n\n');
  }

  const header = [
    `# SecureRAG session — ${meta.at}`,
    `model: ${meta.embeddingModel}${meta.useGeneration ? ` + ${meta.generationModel}` : ''}`,
    `strictness: ${meta.strictness}`,
    '',
  ].join('\n');

  return (
    header +
    messages
      .map((m) => {
        if (m.role === 'user') return `**Q.** ${m.text}`;
        const cites = (m.citations ?? [])
          .map((c) => `  ${c.index}. ${c.docName}${c.page ? ` p.${c.page}` : ''} — ${c.quote}`)
          .join('\n');
        const answer = `**A.** ${m.notFound ? labels.notFound : m.text}${cites ? `\n\n${cites}` : ''}`;
        const matches = m.matches ? matchBlock(m.matches, labels, 'md') : '';
        return matches ? `${answer}\n\n${matches}` : answer;
      })
      .join('\n\n')
  );
}
