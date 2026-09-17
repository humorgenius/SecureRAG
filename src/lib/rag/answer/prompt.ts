import type { ScoredChunk, Strictness } from '../types';

/** Format the retrieved chunks as numbered context blocks for the local model. */
export function formatContext(chunks: ScoredChunk[]): string {
  return chunks
    .map((c, i) => {
      const where = [c.docName, c.page ? `p.${c.page}` : '', c.headingPath.at(-1) ?? '']
        .filter(Boolean)
        .join(' · ');
      return `[${i + 1}] (${where})\n${c.text}`;
    })
    .join('\n\n');
}

/**
 * System prompt for the optional local generation tier.
 * Two hard rules carry the privacy product: answer only from the context, and
 * return the not-found sentence instead of guessing.
 */
export function buildPrompt(args: {
  question: string;
  chunks: ScoredChunk[];
  mode: Strictness;
  lang: 'en' | 'zh';
  history?: { role: 'user' | 'assistant'; content: string }[];
}): { system: string; user: string } {
  const { question, chunks, mode, lang, history = [] } = args;
  const context = formatContext(chunks);

  const system =
    lang === 'zh'
      ? [
          '你是一个只依据给定文档片段作答的助手。',
          '规则：',
          '1. 只能使用【文档片段】中的信息，不得使用任何外部知识。',
          '2. 每个结论后面必须标出它来自哪个片段，格式为 [1]、[2]。',
          '3. 如果片段里没有答案，只回复：文档中未找到相关内容。不要猜测，不要补充常识。',
          mode === 'balanced'
            ? '4. 允许你合并多个片段做归纳，但任何不是直接来自片段的句子，开头必须写「推断：」。'
            : '4. 不要做任何推理或归纳，只复述片段中的原话。',
          '5. 用与提问相同的语言回答，简洁，不要寒暄。',
        ].join('\n')
      : [
          'You answer strictly from the document excerpts provided.',
          'Rules:',
          '1. Use only the EXCERPTS below. Never use outside knowledge.',
          '2. Every claim must carry the marker of the excerpt it came from, like [1] or [2].',
          '3. If the excerpts do not contain the answer, reply exactly: Not found in your documents. Do not guess or fill in from general knowledge.',
          mode === 'balanced'
            ? '4. You may combine excerpts to summarise, but any sentence not taken directly from an excerpt must begin with "Inference:".'
            : '4. Do not reason or summarise. Quote the excerpts.',
          '5. Answer in the same language as the question. Be concise, no pleasantries.',
        ].join('\n');

  const historyBlock = history.length
    ? (lang === 'zh' ? '【之前的对话】\n' : '【Earlier conversation】\n') +
      history.map((h) => `${h.role === 'user' ? 'Q' : 'A'}: ${h.content}`).join('\n') +
      '\n\n'
    : '';

  const user =
    (lang === 'zh' ? '【文档片段】\n' : '【Excerpts】\n') +
    context +
    '\n\n' +
    historyBlock +
    (lang === 'zh' ? '【问题】\n' : '【Question】\n') +
    question;

  return { system, user };
}

export const NOT_FOUND_ANSWER = {
  en: 'Not found in your documents.',
  zh: '文档中未找到相关内容。',
} as const;
