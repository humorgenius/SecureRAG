import { chunkDoc } from '../lib/rag/chunk';
import type { Chunk } from '../lib/rag/types';
import type { Lang } from '../i18n/utils';

/**
 * The corpus behind the homepage live demo.
 *
 * The hero card used to end in a decorative input: a grey string and a button
 * that did nothing. This is the same footprint, but the visitor's words are run
 * through the real engine — the same `chunkDoc` and the same matcher the tool
 * uses — against three short documents that ship with the page. Nothing is
 * downloaded (no model is needed for literal matching) and nothing is uploaded.
 *
 * The documents deliberately repeat their key terms, because the point of the
 * demo is the count: a word that appears five times must come back as five
 * matches, which is the property the tool was fixed to guarantee.
 */

export interface DemoDoc {
  id: string;
  name: string;
  kind: 'pdf' | 'docx' | 'md';
  text: string;
}

const DOCS: Record<Lang, DemoDoc[]> = {
  zh: [
    {
      id: 'demo-agreement',
      name: '服务协议_2026.pdf',
      kind: 'pdf',
      text: `服务协议（2026 版）

第 8 条 期限与解除
8.1 本协议自双方签署之日起生效，有效期为二十四个月。
8.2 解约：任一方提前六十（60）日书面通知对方即可解约，无需说明理由。
8.3 解约通知应当以书面形式送达对方联系人，电子邮件与纸质函件均可。
8.4 解约生效后，双方应当在十五日内完成资料交接与费用结算。

第 9 条 费用与不可抗力
9.1 服务费按季度结算，逾期未付的部分按日计息。
9.2 因不可抗力导致服务中断超过三十日的，任一方可以书面通知解约，已付费用按实际使用天数折算。`,
    },
    {
      id: 'demo-review',
      name: 'Q3 产品评审.docx',
      kind: 'docx',
      text: `Q3 产品评审纪要

一、检索质量
本次评审的重点是检索质量。评测集包含 120 个问题，覆盖中文与英文两种语言。
向量索引的召回率较上季度提升 9 个百分点，主要来自分块策略的调整。
分块长度从 500 字符调整为 700 字符，重叠比例保持 15%。
索引重建时间在三万块的语料上约为 40 秒。

二、待改进项
短查询在纯向量检索下召回偏低，需要补充关键词检索作为兜底。
关键词检索与向量检索的结果用 RRF 融合排序，避免单一检索器主导结果。
下一季度要复测长文档上的检索质量，并补充引用准确性的抽样检查。`,
    },
    {
      id: 'demo-deploy',
      name: 'deployment-notes.md',
      kind: 'md',
      text: `# 部署说明

## 发布流程
构建产物是纯静态文件，推送到 Pages 即完成部署。
部署之前先跑一次构建与三道检查，任何一道失败都不部署。
缓存策略：带哈希的静态资源可以长期缓存，HTML 不参与缓存。
缓存是否失效只取决于文件名里的哈希，所以不需要手动清理缓存。
灰度发布时新旧两份产物同时在线，验证通过后再下线旧版本。

## 回滚
线上出问题时，回滚只需切回上一个构建产物，通常一分钟内完成。
部署记录保留最近十个版本，回滚时可以选择其中任意一个版本。`,
    },
  ],
  en: [
    {
      id: 'demo-agreement',
      name: '服务协议_2026.pdf',
      kind: 'pdf',
      text: `Service Agreement (2026 edition)

Clause 8 — Term and termination
8.1 This agreement takes effect on the date of signature and runs for twenty-four months.
8.2 Termination: either party may terminate on sixty (60) days' written notice, without giving a reason.
8.3 A termination notice must be delivered in writing to the other party's contact, by email or by letter.
8.4 After termination takes effect, both parties have fifteen days to hand over materials and settle fees.

Clause 9 — Fees and force majeure
9.1 Service fees are settled quarterly; late amounts accrue daily interest.
9.2 If force majeure interrupts the service for more than thirty days, either party may terminate by written
notice, and fees already paid are prorated by days actually used.`,
    },
    {
      id: 'demo-review',
      name: 'Q3 产品评审.docx',
      kind: 'docx',
      text: `Q3 product review minutes

1. Retrieval quality
The review focused on retrieval quality. The evaluation set holds 120 questions, in Chinese and English.
Recall of the vector index improved by 9 points over the previous quarter, mostly from a change to chunking.
Chunk size moved from 500 to 700 characters, with the overlap ratio kept at 15%.
Rebuilding the index over thirty thousand chunks takes about 40 seconds.

2. Open items
Short queries recall poorly under pure vector retrieval, so keyword retrieval is needed as a backstop.
Keyword and vector results are fused with RRF so that neither retriever dominates the ranking.
Next quarter we re-test retrieval quality on long documents and add sampling of citation accuracy.`,
    },
    {
      id: 'demo-deploy',
      name: 'deployment-notes.md',
      kind: 'md',
      text: `# Deployment notes

## Release flow
The build output is plain static files, so deployment means pushing them to Pages.
Before deployment, run the build and the three checks; if any check fails, nothing is published.
Caching: hashed static assets can be cached for a long time, while HTML is not cached at all.
Cache invalidation depends only on the hash inside each file name, so no cache is cleared by hand.
During a canary release both builds are online, and the old one is retired after verification.

## Rollback
If production breaks, rollback means switching back to the previous build output, usually within a minute.
Deployment history keeps the last ten versions, so a rollback can pick any of them.`,
    },
  ],
};

export const demoDocs = (lang: Lang): DemoDoc[] => DOCS[lang];

/** Chunk the demo documents with the real chunker, exactly as the tool does. */
export function demoChunks(lang: Lang): Chunk[] {
  return DOCS[lang].flatMap((doc) =>
    chunkDoc({
      id: doc.id,
      name: doc.name,
      kind: doc.kind === 'pdf' ? 'pdf' : doc.kind === 'docx' ? 'docx' : 'md',
      size: doc.text.length,
      pages: [{ page: 1, text: doc.text }],
    })
  );
}

/** Words worth trying, chosen because each one appears several times above. */
export const demoChips: Record<Lang, string[]> = {
  zh: ['解约', '检索', '缓存'],
  en: ['termination', 'retrieval', 'cache'],
};
