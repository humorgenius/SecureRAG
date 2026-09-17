/**
 * What counts as topical signal in a query.
 *
 * Why this file exists: the first version indexed CJK single characters, so a
 * question like "我的身份证号是多少？" matched every sentence containing 我, 的 or
 * 是 — the answer came back as a pile of unrelated sentences. A single Chinese
 * character carries almost no information (unlike a Latin word, which is
 * bounded by spaces and is therefore already a meaningful unit).
 *
 * The rule now: single CJK characters are not evidence, common question words
 * are not evidence, and a sentence must share a run of at least two meaningful
 * characters with the question before it can be quoted as an answer.
 */

/** Characters that appear in nearly every Chinese sentence. */
const CJK_STOP_CHARS = new Set(
  Array.from('的了是在我你他她它们这那吗呢吧啊呀么就都也还请把被与及或且而之其此为所以于')
);

/** Whole phrases that are question scaffolding rather than content. */
const PHRASE_STOPWORDS = new Set([
  '什么',
  '多少',
  '怎么',
  '如何',
  '哪个',
  '哪些',
  '哪位',
  '为什么',
  '请问',
  '可以',
  '是不是',
  '有没有',
  '多久',
  '多远',
  '多长',
  '是否',
]);

/** Latin function words. */
const LATIN_STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'was', 'were', 'been', 'being', 'with', 'this', 'that', 'these',
  'those', 'from', 'into', 'onto', 'than', 'then', 'them', 'they', 'there', 'here', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'whose', 'why', 'how', 'much', 'many',
  'have', 'has', 'had', 'does', 'did', 'doing', 'done', 'not', 'but', 'you', 'your', 'yours',
  'our', 'ours', 'its', 'his', 'her', 'hers', 'their', 'theirs', 'can', 'could', 'should',
  'would', 'will', 'shall', 'may', 'might', 'must', 'about', 'above', 'after', 'again',
  'against', 'all', 'any', 'because', 'before', 'below', 'between', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'too', 'very', 'just',
]);

const CJK_RUNS = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]+/g;

/** True when a token carries no topical signal. */
export function isStopToken(token: string): boolean {
  const t = token.toLowerCase();
  if (LATIN_STOPWORDS.has(t)) return true;
  if (PHRASE_STOPWORDS.has(t)) return true;
  if (t.length === 1 && CJK_STOP_CHARS.has(t)) return true;
  return false;
}

export function isCjkStopChar(ch: string): boolean {
  return CJK_STOP_CHARS.has(ch);
}

/**
 * The question reduced to its content characters, in order.
 *
 * "我的身份证号是多少？" -> "身份证号". Used for the substring test that decides
 * whether a sentence is allowed to answer at all.
 */
export function contentChars(text: string): string {
  const lower = text.toLowerCase();
  const words: string[] = [];
  for (const w of lower.match(/[a-z0-9][a-z0-9._-]*/g) ?? []) {
    if (!isStopToken(w)) words.push(w);
  }
  let out = words.join('');
  for (const run of lower.match(CJK_RUNS) ?? []) {
    const chars = Array.from(run);
    // Drop stop phrases first so removing 多少 cannot leave the artefact 多 + 少.
    let kept = chars.map((c) => (CJK_STOP_CHARS.has(c) ? '\u0000' : c)).join('');
    for (const phrase of PHRASE_STOPWORDS) {
      if (phrase.length < 2) continue;
      const asMasked = Array.from(phrase)
        .map((c) => (CJK_STOP_CHARS.has(c) ? '\u0000' : c))
        .join('');
      kept = kept.split(asMasked).join('\u0000'.repeat(phrase.length));
      kept = kept.split(phrase).join('\u0000'.repeat(phrase.length));
    }
    out += kept.split('\u0000').join('');
  }
  return out;
}

/**
 * Longest run of characters shared by both strings.
 * This is the "don't split my word" rule: a sentence containing 身份证号 shares a
 * 4-character run with the question 我的身份证号是多少, while a sentence containing
 * only 身份 shares 2 — the same measurement the user asked for, expressed in a way
 * that still tolerates inflected or extended forms (身份证件 scores 3, not 0).
 */
export function longestCommonRun(a: string, b: string): number {
  if (!a || !b) return 0;
  const prev = new Array<number>(b.length + 1).fill(0);
  const cur = new Array<number>(b.length + 1).fill(0);
  let best = 0;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0;
      if (cur[j] > best) best = cur[j];
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = cur[j];
      cur[j] = 0;
    }
  }
  return best;
}
