import type { SectionModule } from '../pages/types';

export default {
  label: { en: 'Comparisons', zh: '方案对比' },
  copy: {
    en: {
      title: 'SecureRAG vs NotebookLM, ChatPDF and ChatGPT file uploads',
      description:
        'Head-to-head comparisons of NotebookLM, ChatPDF and ChatGPT file uploads: where your file actually goes, what each does better, and what the local route costs.',
      h1: 'Three ways to ask a document a question, and where your file ends up in each',
      intro:
        'NotebookLM, ChatPDF and ChatGPT all answer questions about a document you hand them, and all three copy that document onto a company server before anything is indexed. SecureRAG does the same job inside one browser tab: bge-small-zh-v1.5 (~25 MB) or all-MiniLM-L6-v2 (~23 MB) embeds your text locally, retrieval fuses vector search with BM25, and the only outbound request the application ever makes is the model download. These three pages compare each hosted tool against that approach, including the cases where the hosted tool wins.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'The dividing line is not features. It is the copy of the file, and who holds it after you close the tab.',
        },
        { t: 'h2', text: 'How these comparisons were written' },
        {
          t: 'p',
          text: 'Every claim about a competitor comes from that vendor\'s own documentation, read in September 2026: Google\'s NotebookLM help pages, the chatpdf.com FAQ, and OpenAI\'s help centre. Where a number changes with the plan — daily quotas, page ceilings, per-file size limits — this page names the pricing model and sends you to the vendor for the figure instead of quoting something we cannot keep current. Claims about SecureRAG are quoted exactly as the tool ships, limits included.',
        },
        {
          t: 'table',
          caption: 'Table 1 — the same six questions asked of every option',
          head: ['Question', 'NotebookLM', 'ChatPDF', 'ChatGPT file upload', 'SecureRAG'],
          rows: [
            [
              'Where the file is parsed',
              'Google\'s servers',
              'ChatPDF\'s servers',
              'OpenAI\'s servers',
              'Your browser tab, in memory',
            ],
            [
              'Account needed',
              'Google Account, signed in',
              'No account to start; sign-in for saved history and multi-document chats',
              'OpenAI account',
              'No account, no tracking pixels',
            ],
            [
              'Works with the network off',
              'No',
              'No',
              'No',
              'Yes, once the model is cached',
            ],
            [
              'What a citation points at',
              'A numbered inline citation that opens the source passage',
              'A page reference back into the PDF',
              'Quoted passages inside the reply; no page anchor for uploaded files',
              'A numbered link per sentence to the chunk; PDF chunks keep page numbers, DOCX chunks keep heading levels',
            ],
            [
              'What writes the answer',
              'A large cloud model',
              'A large cloud model',
              'A large cloud model',
              'Extractive selection by default; optional Qwen2.5 0.5B–1.5B at 4-bit, 400 MB–1.0 GB, roughly 3–8 tokens/s on CPU',
            ],
            [
              'File ceilings',
              'Per-plan source and notebook limits; see Google\'s help pages',
              'Per-plan page and size limits; see chatpdf.com',
              'Per-plan size and token limits; see OpenAI\'s help centre',
              '≤25 MB per file, ≤40 files, ≤200 MB per library, ≤20,000 chunks per library',
            ],
          ],
        },
        { t: 'h2', text: 'The copy is the part people forget to price in' },
        {
          t: 'p',
          text: 'Upload a 40-page severance agreement to a hosted tool and you now have two documents: the original on your disk, and a copy on someone else\'s. That copy lands in a storage bucket, gets picked up by a backup rotation, and is answerable to whatever legal process the vendor is subject to. Deleting the chat later removes the visible entry, not necessarily the object in the backup set. SecureRAG reads the file through the browser File API into an ArrayBuffer, splits it at roughly 700 characters with 15% overlap along heading, paragraph and sentence boundaries, embeds each chunk in a Web Worker and writes vectors to IndexedDB inside your browser profile. Clearing site data removes the whole library, and there is no second copy anywhere to chase.',
        },
        { t: 'h2', text: 'When the local option is the wrong choice' },
        {
          t: 'ul',
          items: [
            'You want an audio overview, a mind map or a generated briefing document. Hosted notebooks ship these; SecureRAG does not.',
            'You need the same library on a laptop and a phone without re-importing. SecureRAG has no account, so there is nothing to sync.',
            'Your documents are scans without a text layer. The ingestion step detects the missing text and refuses the file; OCR is not in the pipeline.',
            'You need the most fluent prose available. A 0.5B–1.5B quantised model writes plainly next to a frontier cloud model, and the first load costs 400 MB–1.0 GB.',
            'You need to hand a colleague a link. A static page with no backend has no share link to hand over.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Numbers dated, never invented.',
          text: 'Free-tier quotas at Google, ChatPDF and OpenAI change without announcement. These pages describe each pricing model — free tier, paid tiers, higher limits on work or enterprise accounts — and point at the vendor\'s own documentation for the figure. Written September 2026.',
        },
        { t: 'h2', text: 'Choose by the question you are actually asking' },
        {
          t: 'ol',
          items: [
            'If the answer has to be quotable later — a contract clause, a policy section, a filing paragraph — start with the tool that never moves the file: open the tool, drop two PDFs, and check that a citation marker lands on the right paragraph before you rely on it.',
            'If you need to share a source with a team, or listen to a summary on the way home, a hosted notebook fits better. Use it deliberately: redact first, or upload only documents you would be comfortable attaching to an email.',
            'If you already pay for a cloud assistant and merely need a quick read of one file, keep using it. You are trading a copy on a server for convenience, and that is sometimes the right trade.',
            'If the file is covered by an NDA, a works-council agreement or a client contract with a confidentiality clause, run SecureRAG with strictness set to "documents only". Ask something the text cannot answer and confirm you get "not found in your documents" rather than a plausible guess.',
          ],
        },
        {
          t: 'faq',
          items: [
            {
              q: 'Does SecureRAG make no network requests at all?',
              a: 'It makes one. On first use it issues a GET for the embedding model weights from a public model host (HuggingFace or a mirror); the request carries the model file name and nothing else — no document, no question, no identifier. After that it works offline once cached, and switching DevTools to Offline will not stop it.',
            },
            {
              q: 'Why not use a cloud tool and delete the file afterwards?',
              a: 'Because deletion runs on someone else\'s schedule. Retention windows and backup rotation are policy decisions you cannot inspect from the outside. A file that never leaves the device has no deletion window to track.',
            },
            {
              q: 'Are the competitor facts on these pages verified?',
              a: 'They are taken from each vendor\'s own published documentation as of September 2026: Google\'s NotebookLM help pages, the chatpdf.com FAQ and OpenAI\'s help centre. Where a figure varies by plan, the page defers to the vendor rather than quoting a number that will be wrong next quarter.',
            },
            {
              q: 'Is SecureRAG a drop-in replacement for these tools?',
              a: 'No. It replaces retrieval and citation over documents you own: local parsing, structure-aware chunking, hybrid search and sentence-level citations. It does not replace audio overviews, Drive source syncing, notebook sharing, image understanding or frontier-model prose.',
            },
          ],
        },
      ],
    },
    zh: {
      title: '方案对比：SecureRAG 与 NotebookLM、ChatPDF、ChatGPT 上传文件',
      description:
        '把 NotebookLM、ChatPDF 与 ChatGPT 文件上传逐项对比：文件究竟落在谁的服务器上、各自强在哪里、本地方案要付出什么代价，全部只依据厂商公开发布的文档，写于 2026 年 9 月。',
      h1: '把文档丢进去提问的三种做法，以及文件各自去了哪里',
      intro:
        'NotebookLM、ChatPDF、ChatGPT 都能就你给的文档回答问题，三者在索引之前都会先把文档复制一份到自家服务器。SecureRAG 把同样的事放在一个浏览器标签页里做：bge-small-zh-v1.5（约 25MB）或 all-MiniLM-L6-v2（约 23MB）在本地生成向量，检索把向量与 BM25 融合，整个应用唯一的外发请求就是下载模型权重。下面三篇分别把它们和这套做法逐项对照，包括对手确实更强的地方。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '分界线不在功能列表，而在那份副本：你关掉标签页之后，谁还留着你的文件。',
        },
        { t: 'h2', text: '这些对比是怎么写出来的' },
        {
          t: 'p',
          text: '所有关于竞品的说法都来自厂商自己发布的文档，阅读时间 2026 年 9 月：Google 的 NotebookLM 帮助页、chatpdf.com 的 FAQ、OpenAI 帮助中心。凡是随套餐变化的数字——每日额度、页数上限、单文件大小——本页只写清楚它的收费模式，具体数字请以对方官网为准，我们不抄一个自己无法保持最新的数值。关于 SecureRAG 的描述按工具实际发布的状态写，限额一并写上。',
        },
        {
          t: 'table',
          caption: '表 1 — 同一组问题，四种方案各答一次',
          head: ['问题', 'NotebookLM', 'ChatPDF', 'ChatGPT 文件上传', 'SecureRAG'],
          rows: [
            ['文件在哪里被解析', 'Google 的服务器', 'ChatPDF 的服务器', 'OpenAI 的服务器', '你的浏览器标签页，内存中'],
            ['是否需要账号', '需要 Google 账号并保持登录', '开始用不需要账号；登录后可保存历史与多文档对话', '需要 OpenAI 账号', '无账号、无追踪像素'],
            [
              '断网能用吗',
              '不能',
              '不能',
              '不能',
              '能，模型缓存之后即可离线',
            ],
            [
              '引用指向什么',
              '带编号的行内引用，点开跳到来源段落',
              '指回 PDF 的页码引用',
              '回答里会摘录原文片段，上传文件没有页码锚点',
              '每句话都有编号指回具体文本块；PDF 块保留页码，DOCX 块保留标题层级',
            ],
            [
              '谁来写答案',
              '云端大模型',
              '云端大模型',
              '云端大模型',
              '默认抽取式拼接；可选 Qwen2.5 0.5B–1.5B、4-bit 量化、400MB–1.0GB、CPU 上约 3–8 token/s',
            ],
            [
              '文件上限',
              '按套餐限定来源数；以 Google 帮助页为准',
              '按套餐限定页数与大小；以 chatpdf.com 为准',
              '按套餐限定文件大小与 token 数；以 OpenAI 帮助中心为准',
              '单文件 ≤25MB、≤40 份、单库 ≤200MB、单库 ≤20,000 个文本块',
            ],
          ],
        },
        { t: 'h2', text: '那份副本，是大家最容易漏算的成本' },
        {
          t: 'p',
          text: '把一份 40 页的离职补偿协议上传到托管工具，你名下就多了一份文档：硬盘上的原件，和别人的服务器上的一份副本。这份副本会落进存储桶，被备份轮转带走，并且要响应该厂商所受的司法程序。事后删除对话，删掉的是界面上那一条记录，备份集里的对象不一定跟着消失。SecureRAG 通过浏览器 File API 把文件读进 ArrayBuffer，按标题、段落、句子边界切成约 700 字符、15% 重叠的块，在 Web Worker 里逐个向量化，再把向量写进浏览器配置目录下的 IndexedDB。清除站点数据就能清掉整个文档库，别处没有第二份要追。',
        },
        { t: 'h2', text: '什么情况下不该选本地方案' },
        {
          t: 'ul',
          items: [
            '你想要音频概览、思维导图或自动生成的简报文档。托管笔记库有这些功能，SecureRAG 没有。',
            '你想在笔记本和手机上共用同一个库，又不想重新导入。SecureRAG 没有账号，也就没有同步。',
            '你的文档是没有文字层的扫描件。摄取阶段会检测到并拒绝这个文件，管线里没有 OCR。',
            '你需要尽可能好的文笔。0.5B–1.5B 的量化模型写出来的句子比云端前沿模型朴素得多，而且第一次使用要下载 400MB–1.0GB。',
            '你想把一个链接发给同事。没有后端的静态页面，没有链接可以发。',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '数字写日期，不编数字。',
          text: 'Google、ChatPDF、OpenAI 的免费额度都会不做预告地调整。这几页只写清楚各自的收费模式——免费档、付费档、工作或企业账号额度更高——具体数字以对方官网为准。本文写于 2026 年 9 月。',
        },
        { t: 'h2', text: '按你真正要问的问题来选' },
        {
          t: 'ol',
          items: [
            '如果答案以后要能被引用——合同条款、制度条目、申报材料的某一段——先用那个不动文件的工具：打开工具，丢两份 PDF 进去，先确认引用编号能落到正确段落，再决定要不要依赖它。',
            '如果你需要把来源分享给团队，或者想在通勤路上听一段总结，托管笔记库更合适。用的时候有意为之：先做脱敏，或者只上传你愿意当作邮件附件发出去的文件。',
            '如果你已经为某个云端助手付了钱，只是想快速读一份文件，那就继续用。你是在拿服务器上的一份副本换便利，有时候这笔交易是划算的。',
            '如果文件受保密协议、劳资协议或含保密条款的客户合同约束，用 SecureRAG 时把严格度设为「仅依据文档」。问一个文本里根本答不出的问题，确认你得到的是「文档中未找到」，而不是一个看起来合理的猜测。',
          ],
        },
        {
          t: 'faq',
          items: [
            {
              q: 'SecureRAG 真的一次网络请求都不发吗？',
              a: '会发一次。首次使用时向公开模型托管站（HuggingFace 或镜像）发一个 GET 请求下载嵌入模型权重，请求里只有模型文件名——不含文档、不含问题、不含任何标识。此后缓存后可离线，把开发者工具切成 Offline 也不会中断。',
            },
            {
              q: '为什么不能先用云端工具、用完再删掉？',
              a: '因为删除按别人的时间表执行。保留周期和备份轮转是对方的策略决定，你从外面看不到。文件从未离开设备，就没有删除窗口需要盯。',
            },
            {
              q: '这些页面上关于竞品的信息可靠吗？',
              a: '取自各厂商自己发布的文档，时间 2026 年 9 月：Google 的 NotebookLM 帮助页、chatpdf.com 的 FAQ、OpenAI 帮助中心。凡是随套餐变化的数字，本页交给对方官网说明，而不是抄一个下个季度就会过时的数值。',
            },
            {
              q: 'SecureRAG 能直接替代这些工具吗？',
              a: '不能。它替代的是「对自有文档做检索并给出引用」这一段：本地解析、结构感知分块、混合检索、句子级引用。它替代不了音频概览、Drive 来源自动同步、笔记库共享、图像理解，也替代不了前沿模型的文笔。',
            },
          ],
        },
      ],
    },
  },
  items: [
    {
      slug: 'notebooklm',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/how-it-works/', labelEn: 'How the local pipeline works', labelZh: '本地管线是怎么跑的' },
        { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
        { path: '/compare/chatpdf/', labelEn: 'Next: ChatPDF', labelZh: '下一篇：ChatPDF' },
      ],
      copy: {
        en: {
          title: 'NotebookLM alternative that runs offline in your browser',
          description:
            'NotebookLM indexes your sources in Google\'s cloud behind a signed-in account. What it does better, what SecureRAG does instead, and where local loses.',
          h1: 'NotebookLM keeps your sources in a Google account. SecureRAG keeps them in the tab.',
          intro:
            'NotebookLM is a hosted notebook: you add sources, it indexes them on Google\'s servers and answers with citations that open the source passage. SecureRAG keeps the retrieval half of that workflow and moves it into the browser — the same file is parsed, chunked and embedded locally with a 23–25 MB model, and the library never leaves the machine. This page compares the two on storage, citations, offline behaviour, limits and writing quality, and names the four things NotebookLM does better.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'Short answer: sources stay in Google\'s cloud and need a signed-in account; SecureRAG parses the same files in the tab and answers with the network off.',
            },
            { t: 'h2', text: 'What NotebookLM genuinely does better' },
            {
              t: 'p',
              text: 'A comparison that only lists the local tool\'s advantages is advertising. These are the capabilities a single browser tab does not have, and no amount of pipeline tuning changes that:',
            },
            {
              t: 'ul',
              items: [
                'Audio Overviews — a spoken two-host summary generated from your sources, which you can listen to away from a screen.',
                'Sources that stay current. A file imported from Google Drive refreshes every few minutes, and editing the original updates the notebook. Google states that footnotes and comments from Google files are not imported.',
                'Wide intake, including website URLs and YouTube links alongside PDFs, Google Docs, Slides, Sheets and pasted text.',
                'Frontier-model prose. Summaries are written by a large cloud model, not by a 0.5B–1.5B quantised one running at 3–8 tokens/s on your CPU.',
                'Sharing. A notebook can be opened to another account or a team; a static page with no backend has nothing to share.',
              ],
            },
            { t: 'h2', text: 'The decisive difference is where the source lives' },
            {
              t: 'p',
              text: 'Both tools answer a question about a 60-page policy manual in seconds, and the visible difference in the answer quality is small. The invisible difference is the file. In NotebookLM the manual is a row in your Google account: it appears in the notebook list on any device you sign into, it is covered by Google\'s retention and access policies, and your organisation\'s admin may control whether the app is available at all on a work account. In SecureRAG the manual is read through the browser File API into memory, cut into ~700-character chunks with 15% overlap, embedded with bge-small-zh-v1.5 (~25 MB) or all-MiniLM-L6-v2 (~23 MB) in a Web Worker, and written to IndexedDB in your browser profile. Files never leave the device.',
            },
            {
              t: 'table',
              caption: 'Table 1 — NotebookLM and SecureRAG, question by question',
              head: ['Question', 'NotebookLM', 'SecureRAG'],
              rows: [
                ['Sign-in', 'A personal or work Google Account, signed in; age verification and regional availability apply', 'None — no account, no tracking pixels'],
                ['Where sources are stored', 'In the notebook, in Google\'s cloud; Drive sources re-sync every few minutes', 'In IndexedDB, in your browser profile; clearing site data deletes them'],
                ['Offline use', 'Not available', 'Works offline once the model is cached'],
                ['Training on your content', 'Governed by Google\'s terms for the account type you use; read the current policy', 'Not used for training — there is no server to train on'],
                [
                  'Citations',
                  'Numbered inline citations that open the source passage',
                  'A per-sentence citation back to the chunk; PDF chunks keep their page numbers, DOCX chunks keep heading levels',
                ],
                ['Limits', 'Per-plan source and notebook limits; see Google\'s help pages', '≤25 MB per file, ≤40 files, ≤200 MB per library, ≤20,000 chunks'],
                [
                  'Answer engine',
                  'A large cloud model, quality tied to the plan',
                  'Extractive by default; optional Qwen2.5 0.5B–1.5B at 4-bit (400 MB–1.0 GB) writing from the retrieved passages',
                ],
              ],
            },
            { t: 'h2', text: 'Citation granularity, on a concrete question' },
            {
              t: 'p',
              text: 'Ask both tools "what notice period applies to a resignation during probation?" and click the citation. NotebookLM lands you in the right passage of the right source. SecureRAG lands you in a specific chunk of a specific file: the page number is preserved for PDFs because parsing runs through PDF.js, and the heading path is preserved for DOCX because the parser reads the archive with jszip and keeps heading levels. The difference is visible when an answer combines four passages — the local version shows which sentence came from which chunk, because the default answering step selects text rather than generating it. In the optional generation tier, the same citations are attached before the text reaches you.',
            },
            {
              t: 'callout',
              kind: 'good',
              title: 'Check the offline claim yourself:',
              text: 'open the tool and DevTools → Network in two windows, add a PDF, ask three questions, then switch DevTools to Offline and ask a fourth. One model request appears in the log. Your questions never appear in it.',
            },
            { t: 'h2', text: 'Where SecureRAG loses to NotebookLM' },
            {
              t: 'ul',
              items: [
                'No audio overview, no mind map, no generated briefing document. If those are the deliverable, this is the wrong tool.',
                'No sync between devices. Import the same four PDFs on a second machine and they are indexed again from zero.',
                'No sharing. There is no link to send, because there is no server.',
                'Plain prose. Asked to summarise a 60-page manual, a 0.5B–1.5B quantised model is visibly weaker than a cloud model, and on a machine without WebGPU it runs at roughly 3–8 tokens/s.',
                'No OCR. A scanned PDF with no text layer is detected during ingestion and reported, rather than quietly returning an empty answer.',
                'Stricter limits. A single file over 25 MB is refused outright, and a library stops at 40 files, 200 MB or 20,000 chunks — whichever comes first. On mobile browsers the cap is lower, because memory is tighter.',
              ],
            },
            { t: 'h2', text: 'Moving a notebook workflow onto the local tool' },
            {
              t: 'steps',
              items: [
                {
                  title: 'List the sources you actually re-read',
                  text: 'Open the notebook and sort by what you cited this month. Most notebooks hold twenty to forty sources and three of them carry the answers you keep coming back to.',
                },
                {
                  title: 'Download originals, not exports',
                  text: 'A Google Doc exported to DOCX keeps its heading levels, and the parser preserves them. PDFs keep their page numbers. Sheets export to CSV and are read as plain text — column alignment is not preserved, which matters for wide financial tables.',
                },
                {
                  title: 'Import and watch the counters',
                  text: 'The library caps at 40 files and 200 MB total, with 20,000 chunks. The tool reports progress per file, so a refused file is named instead of failing the whole batch.',
                },
                {
                  title: 'Set strictness to "documents only" for the first three questions',
                  text: 'You want to see "not found in your documents" once, on a question you know the text cannot answer, before you trust an answer that it can.',
                },
                {
                  title: 'Verify with the network off',
                  text: 'Switch DevTools to Offline and repeat a question. Then clear site data and confirm the library is empty. Both checks take under a minute and are worth doing on your own machine rather than accepting our word for it.',
                },
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'Quotas are set by Google, not by us.',
              text: 'NotebookLM\'s free tier and the higher limits attached to Google\'s paid plans change without notice, and work accounts have their own admin-controlled availability. This page describes the shape of the offer and defers to Google\'s help pages for current numbers. Written September 2026.',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Can NotebookLM be used offline?',
                  a: 'No. Sources are indexed and answered in Google\'s cloud, which needs a signed-in Google Account and a network connection. SecureRAG caches its embedding model after the first load and keeps answering with the network switched off.',
                },
                {
                  q: 'Does NotebookLM train on my sources?',
                  a: 'That depends on the account type and on Google\'s current terms, published on Google\'s own pages. We do not restate those terms here because they change. SecureRAG has no server side, so the question does not arise — there is nowhere for a copy to be used.',
                },
                {
                  q: 'Is SecureRAG a full replacement for NotebookLM?',
                  a: 'No. It replaces retrieval and citation over documents you own. It does not replace audio overviews, Drive source syncing, notebook sharing, or the prose quality of a frontier model.',
                },
                {
                  q: 'What happens to my library if I clear browser data?',
                  a: 'It is deleted, completely and immediately — IndexedDB is the only store. That is the intended behaviour rather than a defect: nothing is kept on a server for you, so there is no recovery path, and no export button is needed to remove it.',
                },
              ],
            },
          ],
        },
        zh: {
          title: 'NotebookLM 的本地替代：离线可用的浏览器内 RAG',
          description:
            'NotebookLM 把来源索引在 Google 云端、需要保持登录。这篇写清它确实更强的几处、SecureRAG 换来的本地检索与离线能力、本地方案会输在哪里，并给出把笔记库搬到本地的五步做法。',
          h1: 'NotebookLM 把来源存在 Google 账号里，SecureRAG 把它留在标签页里。',
          intro:
            'NotebookLM 是一套托管笔记库：你添加来源，它在 Google 的服务器上建索引，并用可点开的引用回答。SecureRAG 保留这套流程里的检索部分并把它搬进浏览器——同一份文件在本地用 23–25MB 的模型完成解析、分块与向量化，文档库不离开这台机器。这一页就存储位置、引用、离线、限额与文笔逐项比较，并列出 NotebookLM 确实做得到的四件事。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '一句话结论：来源存放在 Google 云端、必须登录账号；SecureRAG 在标签页里解析同样的文件，断网也能回答。',
            },
            { t: 'h2', text: 'NotebookLM 确实更强的地方' },
            {
              t: 'p',
              text: '只列本地工具优点的对比，那是广告。下面这些能力单个浏览器标签页给不了，跟管线调优多少无关：',
            },
            {
              t: 'ul',
              items: [
                '音频概览——把来源变成一段两人对谈的语音总结，可以离开屏幕时听。',
                '来源会自动更新。从 Google Drive 导入的文件每隔几分钟同步一次，你改原件，笔记库跟着变。Google 也说明过：Google 文件里的脚注和批注不会被导入。',
                '入口更宽：除了 PDF、Google 文档、幻灯片、表格和粘贴的文本，还能直接加网页链接和 YouTube 链接。',
                '前沿模型的文笔。总结由云端大模型写出来，而不是你 CPU 上以 3–8 token/s 速度跑的 0.5B–1.5B 量化模型。',
                '共享。笔记库可以开放给另一个账号或一个团队；没有后端的静态页面没有东西可分享。',
              ],
            },
            { t: 'h2', text: '真正的分水岭：来源文件存在哪' },
            {
              t: 'p',
              text: '问一份 60 页制度手册里的问题，两者都能在几秒内作答，回答质量上的可见差距并不大。看不见的差距在文件本身。在 NotebookLM 里，这份手册是你 Google 账号中的一条记录：任何登录设备都能在笔记库列表里看到它，它受 Google 的保留与访问策略约束，工作账号还取决于管理员是否开放这个应用。在 SecureRAG 里，这份手册经浏览器 File API 读入内存，切成约 700 字符、15% 重叠的文本块，由 bge-small-zh-v1.5（约 25MB）或 all-MiniLM-L6-v2（约 23MB）在 Web Worker 里向量化，再写进浏览器配置目录下的 IndexedDB。文件永不离开你的设备。',
            },
            {
              t: 'table',
              caption: '表 1 — NotebookLM 与 SecureRAG，逐项对照',
              head: ['问题', 'NotebookLM', 'SecureRAG'],
              rows: [
                ['登录', '需要个人或单位 Google 账号并保持登录；有年龄验证与地区可用性限制', '完全不需要——无账号、无追踪像素'],
                ['来源存在哪', '存在笔记库里，即 Google 云端；Drive 来源每隔几分钟重新同步', '存在浏览器配置目录下的 IndexedDB；清除站点数据即删除'],
                ['离线可用', '不支持', '缓存后可离线'],
                ['内容是否用于训练', '取决于你所用的账号类型与 Google 现行条款，请读官方政策', '不用于训练——没有服务器可训'],
                [
                  '引用',
                  '带编号的行内引用，点开跳到来源段落',
                  '每句话都有编号指回具体文本块；PDF 块保留页码，DOCX 块保留标题层级',
                ],
                ['限额', '按套餐限定来源数与笔记库数；以 Google 帮助页为准', '单文件 ≤25MB、≤40 份、单库 ≤200MB、≤20,000 个文本块'],
                [
                  '回答引擎',
                  '云端大模型，质量随套餐档位变化',
                  '默认抽取式拼接；可选 Qwen2.5 0.5B–1.5B 4-bit（400MB–1.0GB），基于检索到的段落写作',
                ],
              ],
            },
            { t: 'h2', text: '拿一个具体问题看引用颗粒度' },
            {
              t: 'p',
              text: '向两边都问「试用期内辞职要提前多久通知」，然后点引用。NotebookLM 会把你带到对的来源里对的段落。SecureRAG 会把你带到某个文件里的某一个文本块：PDF 走 PDF.js 解析，页码被保留；DOCX 由 jszip 读取归档并保留标题层级。当一个答案要拼合四段文本时，差别就看出来了——本地版能告诉你哪句话来自哪个块，因为默认的回答环节是在选句子，不是在写句子。可选的生成档同样会先把引用挂好，再让文本到达你眼前。',
            },
            {
              t: 'callout',
              kind: 'good',
              title: '离线这件事自己验一遍：',
              text: '打开工具，另开一个窗口打开开发者工具的 Network 面板，添加一份 PDF 并连问三个问题，然后把 DevTools 切到 Offline 再问第四个。日志里只会出现那一次模型请求，你的问题不会出现在里面。',
            },
            { t: 'h2', text: 'SecureRAG 输给 NotebookLM 的地方' },
            {
              t: 'ul',
              items: [
                '没有音频概览、没有思维导图、没有自动生成的简报。如果交付物就是这些，那这个工具不适合你。',
                '没有跨设备同步。在第二台机器上导入同样的四份 PDF，一切从零重新索引。',
                '没有共享。发不出链接，因为没有服务器。',
                '文笔朴素。让它总结 60 页手册，0.5B–1.5B 量化模型明显不如云端模型；在没有 WebGPU 的机器上大约只有 3–8 token/s。',
                '没有 OCR。没有文字层的扫描件在摄取阶段就会被检测出来并明确告知，而不是悄悄给出空回答。',
                '限额更紧。超过 25MB 的单个文件直接拒收；一个库最多 40 份、200MB、20,000 个文本块，先到哪个算哪个。移动浏览器上上限更低，因为内存更紧张。',
              ],
            },
            { t: 'h2', text: '把一个笔记库工作流搬到本地' },
            {
              t: 'steps',
              items: [
                {
                  title: '先列出你真正反复翻的来源',
                  text: '打开笔记库，按这个月引用过的排序。多数笔记库里堆着二三十份来源，真正承载答案的就那三份。',
                },
                {
                  title: '下载原件，不要导出件',
                  text: 'Google 文档导成 DOCX 会保留标题层级，解析器会把它留下。PDF 保留页码。表格导成 CSV 后按纯文本读取——列对齐不会保留，宽表格尤其要注意。',
                },
                {
                  title: '导入并盯着计数器',
                  text: '文档库上限是 40 份、总量 200MB、20,000 个文本块。工具会逐个文件上报进度，被拒的文件会被点名，而不是整批失败。',
                },
                {
                  title: '前三个问题把严格度设为「仅依据文档」',
                  text: '先用一个你确定文本里答不出的问题，看它老老实实回答「文档中未找到」，再去相信它答得出的那些。',
                },
                {
                  title: '断网验证一遍',
                  text: '把 DevTools 切到 Offline 重复一个问题，然后清除站点数据确认文档库已空。两步都花不了一分钟，值得在你自己的机器上做，而不是听我们讲。',
                },
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '额度是 Google 定的，不是我们定的。',
              text: 'NotebookLM 的免费档与 Google 付费套餐附带的上限会随时调整，单位账号的可用性还由管理员控制。本页只描述它的大致形态，具体数字以 Google 帮助页为准。本文写于 2026 年 9 月。',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'NotebookLM 能离线使用吗？',
                  a: '不能。来源在 Google 云端建立索引并作答，需要登录 Google 账号并联网。SecureRAG 在首次加载后把嵌入模型缓存下来，断网仍能继续回答。',
                },
                {
                  q: 'NotebookLM 会拿我的来源去训练吗？',
                  a: '这取决于账号类型和 Google 的现行条款，以 Google 自己的说明为准。条款会变，我们不复述。SecureRAG 没有服务端，这个问题不成立——副本没有地方可被使用。',
                },
                {
                  q: 'SecureRAG 能完整替代 NotebookLM 吗？',
                  a: '不能。它替代的是对自有文档的检索与引用。音频概览、Drive 来源同步、笔记库共享以及前沿模型的文笔，它都替代不了。',
                },
                {
                  q: '清除浏览器数据后我的文档库会怎样？',
                  a: '会立刻完整删除——IndexedDB 是唯一的存储位置。这是设计如此，不是缺陷：服务器上没有为你保留任何东西，所以既没有找回路径，也不需要导出按钮来清理。',
                },
              ],
            },
          ],
        },
      },
    },
    {
      slug: 'chatpdf',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/how-it-works/', labelEn: 'How the local pipeline works', labelZh: '本地管线是怎么跑的' },
        { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
        { path: '/compare/chatgpt-file-upload/', labelEn: 'Next: ChatGPT file upload', labelZh: '下一篇：ChatGPT 上传文件' },
      ],
      copy: {
        en: {
          title: 'ChatPDF alternative: local PDF Q&A that keeps the file',
          description:
            'ChatPDF\'s FAQ says its free plan analyses 2 documents a day and that sign-in is only needed for history. This page compares that trade with local PDF Q&A.',
          h1: 'ChatPDF answers from an uploaded PDF. SecureRAG answers from the same PDF without moving it.',
          intro:
            'ChatPDF answers questions about a PDF you upload, with page references back into the document, and its own FAQ states that you can start without an account. SecureRAG covers the same ground — PDF parsing with page numbers preserved, hybrid retrieval, per-sentence citations — with the file staying in the browser tab. This page compares the two on setup, page anchoring, document ceilings and failure cases, and is explicit about where the cloud tool is the more practical choice.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'Short answer: ChatPDF uploads the PDF to its servers and keeps the chat there; SecureRAG parses it with PDF.js in the tab and keeps the page numbers.',
            },
            { t: 'h2', text: 'What ChatPDF does better' },
            {
              t: 'ul',
              items: [
                'Nothing to download. Its FAQ states the free plan analyses 2 documents per day and that core features work before you create an account; an account adds saved history and multi-document chats.',
                'No model fetch on first use. SecureRAG pulls a 23–25 MB embedding model the first time you open it — 120 MB if you switch to multilingual-e5-small for mixed Chinese and English text.',
                'Fewer per-file restrictions in front of the index. SecureRAG refuses a file over 25 MB outright; hosted services set their own per-plan ceilings, which are worth reading on their site.',
                'History that follows you. Sign in and the chat exists on another device. SecureRAG has no account, so a new browser profile means importing again.',
              ],
            },
            { t: 'h2', text: 'What happens to a 30-page PDF in each' },
            {
              t: 'p',
              text: 'The ingestion path is the whole story. ChatPDF receives the upload and indexes it server-side, which is why the same chat is available from a phone an hour later. SecureRAG reads the file through the browser File API, parses it with PDF.js so every chunk remembers the page it came from, strips repeated headers and footers, rejoins hard line breaks inside paragraphs, then cuts the text along heading, paragraph and sentence boundaries into roughly 700-character chunks with 15% overlap. Those chunks are embedded in a Web Worker and written to IndexedDB. Ask a question and the query is embedded with the same model, two ranked lists are produced — dense vectors and BM25 keyword matches — fused with reciprocal rank fusion at k=60, thinned by maximal marginal relevance at λ=0.7, and the top 6 chunks are handed to the answering step.',
            },
            {
              t: 'table',
              caption: 'Table 1 — the same PDF, two routes',
              head: ['Question', 'ChatPDF', 'SecureRAG'],
              rows: [
                ['Getting started', 'Open the site and upload; no account for core use', 'Open the site; first load fetches a 23–25 MB embedding model'],
                ['Where the PDF is parsed', 'ChatPDF\'s servers', 'Your browser tab'],
                ['What a citation points at', 'A page reference back into the uploaded PDF', 'A chunk with the source page number, plus every sentence carrying its own numbered link'],
                ['Multiple documents', 'Multi-document chat after sign-in, per its FAQ', 'Up to 40 files in one library by default, searched together'],
                ['Offline', 'No', 'Works offline once cached'],
                ['Ceilings', 'Per-plan page counts and file sizes; see chatpdf.com', '≤25 MB per file, ≤40 files, ≤200 MB per library, ≤20,000 chunks'],
                ['Unsupported input', 'Check the vendor\'s current format list', 'Encrypted PDFs, scans without a text layer, legacy .doc, and anything over 25 MB are refused'],
              ],
            },
            { t: 'h2', text: 'Page numbers are the part people actually notice' },
            {
              t: 'p',
              text: 'Both tools answer a question about a 30-page contract with a pointer into the document. The difference shows up in the second question. Ask something that requires two clauses in different sections, then click every citation: ChatPDF returns you to the pages it used; SecureRAG returns one citation per sentence, so you can see that the notice period came from page 12 and the exception from page 27, and that the connective sentence between them is a selection rather than a claim the documents make. In "documents only" mode an unsupported question returns "not found in your documents" instead of a plausible paragraph stitched from unrelated pages.',
            },
            {
              t: 'callout',
              kind: 'info',
              title: 'Two honest caveats about the local route:',
              text: 'a scanned PDF with no text layer is refused rather than OCR-ed, and a PDF over 25 MB is refused rather than streamed. Both limits are hard, and both are visible in the interface before you wait for an index to build.',
            },
            { t: 'h2', text: 'Where SecureRAG loses to ChatPDF' },
            {
              t: 'ul',
              items: [
                'It costs you a download. 23–25 MB for the default tier, 400 MB–1.0 GB if you enable the generation tier, and that tier runs at roughly 3–8 tokens/s on CPU when WebGPU is unavailable.',
                'No saved history across devices. Close the browser profile and the library is gone unless you exported it.',
                'No OCR and no encrypted-PDF support. Password-protected files are out of scope entirely.',
                'Lower file ceilings than a paid hosted plan: 25 MB per file, 40 files, 200 MB per library, 20,000 chunks, and less again on mobile browsers.',
                'Prose that loses to a cloud model. A 0.5B–1.5B quantised model answers more tersely and summarises less fluently.',
              ],
            },
            { t: 'h2', text: 'Run the comparison on one of your own PDFs' },
            {
              t: 'ol',
              items: [
                'Pick a PDF you know well, longer than 20 pages, with a numbered clause and at least one table.',
                'Ask three questions: one whose answer is a single figure, one that requires two distant sections to be combined, and one the document cannot answer at all.',
                'Click every citation in both tools. A page reference tells you roughly where the answer lives; a per-sentence citation tells you which sentence is load-bearing.',
                'Switch the network off and repeat the second question. Only one of the two tools keeps answering.',
                'Open DevTools → Network, clear the log, and repeat the first question. Compare what each request contains.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'Quotas change; the model does not.',
              text: 'ChatPDF sets its own free and paid limits — daily document counts, pages per file, file size, questions per day — and revises them. This page quotes only its published FAQ statement and defers to chatpdf.com for the rest. Written September 2026.',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Can SecureRAG read a scanned PDF?',
                  a: 'No, if the scan has no text layer. Ingestion detects the empty text and refuses the file with an explanation rather than returning an empty answer. OCR is not part of the pipeline; you would need to OCR the file elsewhere and import the text version.',
                },
                {
                  q: 'Do I need an account to use SecureRAG?',
                  a: 'No account, no tracking pixels, no email. Nothing is stored outside you browser profile, which also means there is no password reset and no support channel that can recover a lost library.',
                },
                {
                  q: 'How many PDFs can be searched at once?',
                  a: 'Up to 40 files per library by default, 200 MB in total and 20,000 chunks, whichever limit is reached first. Retrieval searches the whole library at once rather than one file at a time, so a question can be answered from two different documents and cite both.',
                },
                {
                  q: 'Is the answer quality comparable to ChatPDF?',
                  a: 'For extractive answers over clear text, close enough that most people will not notice. For long summaries and fluent rewrites, no — that is the trade you accept in exchange for the file never leaving the device, and the optional generation tier narrows the gap without closing it.',
                },
              ],
            },
          ],
        },
        zh: {
          title: 'ChatPDF 的本地替代：PDF 不上传的问答工具',
          description:
            'ChatPDF 官网 FAQ 写明免费档每天可分析 2 份文档、核心功能无需注册。这篇对比这套便利与「文件不出本地」各自要付的代价。',
          h1: 'ChatPDF 靠上传的 PDF 回答，SecureRAG 回答同一份 PDF 而不把它搬走。',
          intro:
            'ChatPDF 就你上传的 PDF 作答，并把答案指回文档页码；它的官网 FAQ 也写明开始使用不需要账号。SecureRAG 覆盖同一段事情——解析 PDF 并保留页码、混合检索、句子级引用——而文件始终待在浏览器标签页里。这一页比较两者的上手成本、页码锚点、文件上限与失败情形，并明确写出云端方案在什么时候更实用。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '一句话结论：ChatPDF 把 PDF 传到它的服务器并把对话留在那儿；SecureRAG 用 PDF.js 在标签页里解析，页码照旧保留。',
            },
            { t: 'h2', text: 'ChatPDF 更强的地方' },
            {
              t: 'ul',
              items: [
                '什么都不用下载。官网 FAQ 写明免费档每天可分析 2 份文档，核心功能在注册之前就能用；注册后多出保存历史与多文档对话。',
                '首次使用不用等模型。SecureRAG 第一次打开要拉一个 23–25MB 的嵌入模型——如果你要处理中英混排、切到 multilingual-e5-small，则是 120MB。',
                '进入索引之前的单文件限制更松。SecureRAG 超过 25MB 直接拒收；托管服务按自己的套餐设上限，具体数值值得去它官网读。',
                '历史跟着你走。登录后同一个对话在另一台设备上还在。SecureRAG 没有账号，换个浏览器配置就等于重新导入。',
              ],
            },
            { t: 'h2', text: '一份 30 页 PDF 在两边各经历了什么' },
            {
              t: 'p',
              text: '摄取路径就是全部差别。ChatPDF 收到上传文件后在服务端建索引，所以一小时后你用手机打开同一个对话还在。SecureRAG 经浏览器 File API 读入文件，用 PDF.js 解析，让每个文本块都记得自己来自第几页，剔除重复页眉页脚，把段落内的硬换行重新拼起来，再按标题、段落、句子的顺序切成约 700 字符、15% 重叠的块。这些块在 Web Worker 里向量化并写入 IndexedDB。提问时，问题用同一个模型转成向量，同时产出两份排序——稠密向量与 BM25 关键词——以 RRF（k=60）融合，用 MMR（λ=0.7）去掉近重复，取前 6 个块交给回答环节。',
            },
            {
              t: 'table',
              caption: '表 1 — 同一份 PDF，两条路',
              head: ['问题', 'ChatPDF', 'SecureRAG'],
              rows: [
                ['怎么开始用', '打开网站上传即可；核心功能不需要账号', '打开网站即可，首次加载会拉取 23–25MB 的嵌入模型'],
                ['PDF 在哪里被解析', 'ChatPDF 的服务器', '你的浏览器标签页'],
                ['引用指向什么', '指回上传 PDF 的页码', '指回具体文本块并带来源页码，且每句话都有自己的编号链接'],
                ['多份文档', '登录后可多文档对话，以官网 FAQ 为准', '默认单个文档库最多 40 份文件，一起检索'],
                ['离线', '不能', '缓存后可离线'],
                ['上限', '按套餐限定页数与文件大小；以 chatpdf.com 为准', '单文件 ≤25MB、≤40 份、单库 ≤200MB、≤20,000 个文本块'],
                ['不支持什么', '以对方官网当前的格式清单为准', '加密 PDF、无文字层扫描件、旧版 .doc、超过 25MB 的文件，一律拒收'],
              ],
            },
            { t: 'h2', text: '大家真正在意的是页码那件事' },
            {
              t: 'p',
              text: '问一份 30 页合同里的问题，两者都会指给你文档里的位置。第二个问题才见差别。问一个需要跨章节两处条款才能回答的问题，然后逐个点引用：ChatPDF 把你带回它用过的那几页；SecureRAG 是每句话一个引用，你能看到通知期来自第 12 页、例外条款来自第 27 页，而中间那句起连接作用的话是系统选出来的，而不是文档里原本的说法。在「仅依据文档」模式下，文档答不出的问题会返回「文档中未找到」，而不是用不相干页面拼出一段看起来合理的文字。',
            },
            {
              t: 'callout',
              kind: 'info',
              title: '关于本地路线，两个诚实的提醒：',
              text: '没有文字层的扫描件会被直接拒收，而不是先做 OCR；超过 25MB 的 PDF 也是直接拒收，而不是流式读取。两条都是硬限制，而且都在等你索引之前就写在界面上。',
            },
            { t: 'h2', text: 'SecureRAG 输给 ChatPDF 的地方' },
            {
              t: 'ul',
              items: [
                '你要付出一次下载。默认档 23–25MB，启用生成档是 400MB–1.0GB；在拿不到 WebGPU 的机器上，生成档大约 3–8 token/s。',
                '没有跨设备的历史。换掉浏览器配置，文档库就没了，除非你自己先导出去。',
                '没有 OCR，也不支持加密 PDF。设了密码的文件完全不在支持范围内。',
                '单文件上限低于付费托管套餐：单文件 25MB、40 份、单库 200MB、20,000 个文本块，移动浏览器上还要再低。',
                '文笔比不过云端模型。0.5B–1.5B 量化模型的回答更简短，总结也更生硬。',
              ],
            },
            { t: 'h2', text: '拿你自己的一份 PDF 走一遍对比' },
            {
              t: 'ol',
              items: [
                '挑一份你熟悉的 PDF，超过 20 页，里面有编号条款，最好还有一张表。',
                '问三个问题：一个答案就是某个数字的，一个必须把相隔很远的两节拼起来才能答的，还有一个文档里根本答不出的。',
                '在两边逐个点引用。页码引用只告诉你答案大概在哪；句子级引用会告诉你哪一句话是关键支撑。',
                '断网，重复第二个问题。两边只有一个还能继续答。',
                '打开开发者工具的 Network 面板，清空日志，重复第一个问题，比较两边请求里究竟带了什么。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '额度会变，模型不会。',
              text: 'ChatPDF 的免费与付费上限——每天可分析的文档数、每份页数、文件大小、每日提问量——由它自己设定并且会调整。本页只引用它 FAQ 里已公布的表述，其余以 chatpdf.com 官网为准。本文写于 2026 年 9 月。',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'SecureRAG 能读扫描件 PDF 吗？',
                  a: '如果扫描件没有文字层，不能。摄取阶段会检测到抽不出文本并明确拒收，而不是返回一个空答案。管线里没有 OCR；你需要先在别处把文件 OCR 成文本，再导入文本版本。',
                },
                {
                  q: '用 SecureRAG 需要注册账号吗？',
                  a: '无账号、无追踪像素、不要邮箱。所有数据只存在你的浏览器配置里，这也意味着没有密码找回，也没有任何客服渠道能帮你恢复误删的文档库。',
                },
                {
                  q: '一次能同时检索多少份 PDF？',
                  a: '默认单个文档库最多 40 份文件、总量 200MB、20,000 个文本块，哪个先到算哪个。检索是在整个库上做的，不是逐份文件做，所以一个问题可以由两份不同文档共同回答，并同时引用它们。',
                },
                {
                  q: '回答质量和 ChatPDF 可比吗？',
                  a: '对文字清晰的文档做抽取式回答，差距小到多数人不会注意；做长文总结和通顺改写则比不过——这就是「文件永不离开你的设备」要换的代价，可选的生成档能缩小差距，但补不平。',
                },
              ],
            },
          ],
        },
      },
    },
    {
      slug: 'chatgpt-file-upload',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
        { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
        { path: '/compare/notebooklm/', labelEn: 'Also compare: NotebookLM', labelZh: '同时对比：NotebookLM' },
      ],
      copy: {
        en: {
          title: 'ChatGPT file upload vs a local document assistant',
          description:
            'ChatGPT parses uploaded files on OpenAI\'s servers, and its help centre says consumer chats train models unless you opt out. Here is what a local-only alternative changes.',
          h1: 'ChatGPT reads an uploaded file on OpenAI\'s servers. Here is what that changes.',
          intro:
            'Upload a PDF to ChatGPT and it is parsed, chunked and searched on OpenAI\'s infrastructure, with the answer written by a frontier model. SecureRAG does the parsing, chunking and searching in the browser tab and answers from your own retrieval, with the file never leaving the device. The interesting comparison is not raw capability — ChatGPT wins that outright — but what happens to the document, which setting decides it, and which jobs only a hosted model can do.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'Short answer: an uploaded file is parsed on OpenAI\'s servers and on consumer plans may improve their models unless you opt out; SecureRAG keeps it local.',
            },
            { t: 'h2', text: 'What ChatGPT does better' },
            {
              t: 'ul',
              items: [
                'It does more with a file than answer questions about it: rewrite, translate, restructure into a table, generate code that reads the file, plot the numbers, then continue from that output.',
                'File uploads work on Free and paid plans, on the web and in supported mobile apps, subject to per-plan limits — no download, no model fetch.',
                'ChatGPT Enterprise has PDF visual retrieval, which reads layout and figures from a PDF. Other plans extract digital text and discard images. SecureRAG also reads text only: stamps, signatures and figures in a scanned or image-heavy PDF are not seen.',
                'One conversation can combine the file with web browsing, code execution and the model\'s general knowledge. A local retrieval tool deliberately does only retrieval.',
                'Frontier-model prose and long-context handling that a 0.5B–1.5B quantised model cannot match.',
              ],
            },
            { t: 'h2', text: 'The setting that decides what happens to your document' },
            {
              t: 'p',
              text: 'OpenAI\'s help centre states that ChatGPT improves by further training on conversations unless you opt out, and that the opt-out sits in Settings → Data Controls → "Improve the model for everyone", or in the privacy portal as "Do not train on my content". Content can include files you upload. The same help centre states that business offerings — the API, ChatGPT Business and Enterprise — are not used to improve model performance by default. Three different answers exist for the same question, and which one applies depends on whether you are using consumer ChatGPT, an API call, or an enterprise workspace. Read your own plan\'s policy rather than a summary of it, including this page.',
            },
            {
              t: 'table',
              caption: 'Table 1 — the upload route and the local route',
              head: ['Question', 'ChatGPT file upload', 'SecureRAG'],
              rows: [
                ['Where the file is parsed', 'OpenAI\'s servers', 'Your browser tab'],
                ['Account', 'OpenAI account', 'None — no account, no tracking pixels'],
                ['Training use', 'Consumer plans train on content unless you opt out; business offerings are opted out by default', 'Not used for training — no server exists to train on'],
                ['Offline', 'No', 'Works offline once cached'],
                ['What a citation points at', 'Quoted passages inside the reply; no page anchor for an uploaded PDF', 'A numbered citation per sentence to a chunk, with PDF page numbers and DOCX heading levels preserved'],
                ['Answer engine', 'A frontier cloud model', 'Extractive selection by default; optional Qwen2.5 0.5B–1.5B at 4-bit, 400 MB–1.0 GB, roughly 3–8 tokens/s on CPU'],
                ['Ceilings', 'Per-plan file size and token limits; see OpenAI\'s help centre', '≤25 MB per file, ≤40 files, ≤200 MB per library, ≤20,000 chunks'],
                ['Supported input', 'Common document, spreadsheet, presentation and text formats; see the help centre', 'PDF, DOCX, TXT, Markdown, CSV, HTML, JSON. No encrypted PDFs, no scans without a text layer, no legacy .doc'],
              ],
            },
            { t: 'h2', text: 'Citations come from different places' },
            {
              t: 'p',
              text: 'ChatGPT quotes from the file inside its reply, which is usually enough when you are reading for understanding. It is not a citation system: there is no per-sentence anchor back to page 14, and a fluent paragraph can blend a direct quote with the model\'s own paraphrase. SecureRAG separates those two things. The default answering tier selects sentences from the retrieved chunks, keeps them in their original order, and attaches a numbered link to each one, so a paraphrase is never presented as a quote. The optional generation tier writes prose, but the citations are attached from the retrieved chunks before the text reaches you — the model is never asked to produce references, because models invent them.',
            },
            { t: 'h2', text: 'Where SecureRAG loses to ChatGPT file upload' },
            {
              t: 'ul',
              items: [
                'It cannot write. A 0.5B–1.5B quantised model produces terse, literal prose next to a frontier model, and enabling that tier costs a 400 MB–1.0 GB download and runs at roughly 3–8 tokens/s on CPU without WebGPU.',
                'No image understanding. Figures, charts, handwriting and stamps are not read. A PDF that is mostly images yields mostly nothing.',
                'No code execution, no web browsing, no plugins. What is in the index is all the system knows.',
                'Tighter ceilings: 25 MB per file, 40 files, 200 MB per library, 20,000 chunks, and lower caps on mobile browsers where memory is scarcer.',
                'No cross-session memory in the Cloudflare sense of a hosted assistant. The index persists in IndexedDB; the conversation does not travel to another device.',
                'First load is slower. Parsing a 20 MB PDF and embedding 900 chunks takes real seconds on a laptop, where a hosted service shows a spinner on someone else\'s hardware.',
              ],
            },
            { t: 'h2', text: 'A five-minute test with a document you already have' },
            {
              t: 'ol',
              items: [
                'Take a contract or report you know well, between 10 and 25 MB so it fits inside the 25 MB ceiling, and note one clause number you can quote from memory.',
                'Ask the same question in both tools: "Which clause covers early termination, and what notice does it require?"',
                'Check what supports the answer. In ChatGPT you get a quoted passage inside the reply; in SecureRAG you get a numbered citation on each sentence that opens the chunk and shows the page number.',
                'Ask a question the document cannot answer. Set strictness to "documents only" locally and confirm you get "not found in your documents" rather than an inferred clause number.',
                'Open DevTools → Network in both. In one you will see a multipart POST carrying the file; in the other, one GET for model weights and nothing after it.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'Data policy differs by product and by plan.',
              text: 'Consumer ChatGPT, the API, ChatGPT Business and Enterprise have different data-use defaults, and they change. The authoritative statement is OpenAI\'s own: its data-controls help pages and the privacy policy for the product you actually use. Written September 2026.',
            },
            {
              t: 'callout',
              kind: 'info',
              title: 'A practical middle path:',
              text: 'use ChatGPT for drafting over text you can share, and SecureRAG for the documents you cannot send anywhere — an unsigned contract, a medical report, a personnel file, a client\'s unpublished financials. The two do not have to compete for the same folder.',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Does ChatGPT train on files I upload?',
                  a: 'For consumer plans, OpenAI\'s help centre states that it improves by further training on conversations unless you opt out, and that uploaded content can be included. The opt-out is in Settings → Data Controls ("Improve the model for everyone") or through the privacy portal. Business offerings such as the API and ChatGPT Enterprise are not trained on by default. Check your own plan\'s page, because the answer is plan-specific and changes.',
                },
                {
                  q: 'Can SecureRAG answer questions that require reasoning across documents?',
                  a: 'It can retrieve across up to 40 files at once and cite passages from several of them, and it can stitch those passages together in document order. What it will not do is invent a conclusion those passages do not support — in "documents only" mode it returns "not found in your documents" instead.',
                },
                {
                  q: 'Why is the local answer shorter?',
                  a: 'Because it is assembled from sentences that already exist in your files. Extraction cannot expand an argument the way generation can, and that is the mechanism that keeps invented clause numbers out of the answer.',
                },
                {
                  q: 'Will enabling the generation tier give me ChatGPT-quality writing?',
                  a: 'No. It gives fluent, grammatical prose from a 0.5B–1.5B quantised model — an improvement over extractive stitching, still a distance below a frontier model. It also requires an explicit click before any download starts, and can be turned off again at any time.',
                },
              ],
            },
          ],
        },
        zh: {
          title: 'ChatGPT 上传文件与本地文档助手的区别',
          description:
            'ChatGPT 在 OpenAI 的服务器上解析上传文件；其帮助中心写明消费级对话默认会被用于训练，除非你主动退出。这篇对比本地方案改了什么。',
          h1: 'ChatGPT 在 OpenAI 的服务器上读你上传的文件。这篇讲这意味着什么。',
          intro:
            '把一份 PDF 上传给 ChatGPT，它会在 OpenAI 的基础设施上被解析、切分、检索，答案由前沿模型写成。SecureRAG 把解析、切分、检索放在浏览器标签页里完成，用你自己的检索结果作答，文件不离开设备。值得比的不只是能力——纯能力 ChatGPT 完胜——而是这份文档之后会怎样、由哪个开关决定，以及哪些活只有云端模型干得了。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '一句话结论：上传的文件在 OpenAI 服务器上解析，消费级套餐默认会用于改进模型，除非你主动关掉；SecureRAG 把这一切留在本地。',
            },
            { t: 'h2', text: 'ChatGPT 更强的地方' },
            {
              t: 'ul',
              items: [
                '拿到文件之后它能做的事更多：改写、翻译、整理成表格、生成读取该文件的代码、把数字画成图，然后接着往下做。',
                '文件上传在免费与付费套餐上都能用，网页版和受支持的手机应用都有，各自有用量限制——不用下载、不拉模型。',
                'ChatGPT 企业版有 PDF 视觉检索，能读取 PDF 的版式与图表；其他套餐只抽取文字层，图像会被丢弃。SecureRAG 也只读文字：扫描件或图多的 PDF 里的印章、签名、图表都读不到。',
                '同一个对话里可以把文件与联网搜索、代码执行和模型自身知识结合起来用。本地检索工具刻意只做检索这一件事。',
                '前沿模型的文笔与长上下文处理能力，0.5B–1.5B 量化模型比不了。',
              ],
            },
            { t: 'h2', text: '决定你文档去向的那个开关' },
            {
              t: 'p',
              text: 'OpenAI 帮助中心写明：ChatGPT 会进一步在用户的对话上训练，除非你选择退出；退出入口在「设置 → 数据控制 → 为所有人改进模型」（隐私门户里对应「不要用我的内容进行训练」）。内容可以包括你上传的文件。同一份帮助文档也写明：面向企业的产品（API、ChatGPT Business、Enterprise）默认不使用客户提交的内容改进模型性能。同一个问题有三个不同答案，适用哪一个取决于你用的是消费级 ChatGPT、API，还是企业工作区。请读你所用的那份政策原文，而不是任何二手概述，包括这一页。',
            },
            {
              t: 'table',
              caption: '表 1 — 上传路线与本地路线',
              head: ['问题', 'ChatGPT 文件上传', 'SecureRAG'],
              rows: [
                ['文件在哪里被解析', 'OpenAI 的服务器', '你的浏览器标签页'],
                ['账号', '需要 OpenAI 账号', '不需要——无账号、无追踪像素'],
                ['是否用于训练', '消费级套餐默认会用于训练，除非主动退出；企业产品默认不训练', '不用于训练——不存在可以被训练的服务器'],
                ['离线', '不能', '缓存后可离线'],
                ['引用指向什么', '回答里摘录原文片段；上传的 PDF 没有页码锚点', '每句话一个编号引用指回具体文本块，PDF 保留页码、DOCX 保留标题层级'],
                ['回答引擎', '云端前沿模型', '默认抽取式选句；可选 Qwen2.5 0.5B–1.5B 4-bit，400MB–1.0GB，CPU 上约 3–8 token/s'],
                ['上限', '按套餐限定文件大小与 token 数；以 OpenAI 帮助中心为准', '单文件 ≤25MB、≤40 份、单库 ≤200MB、≤20,000 个文本块'],
                ['支持格式', '常见文档、表格、演示与文本格式；以帮助中心为准', 'PDF、DOCX、TXT、Markdown、CSV、HTML、JSON。不支持加密 PDF、无文字层扫描件、旧版 .doc'],
              ],
            },
            { t: 'h2', text: '引用是从哪儿来的' },
            {
              t: 'p',
              text: 'ChatGPT 会在回答里摘录文件原文，读个大概通常够用。它不是一套引用机制：没有指回第 14 页的逐句锚点，而一段通顺的文字可以把原文摘录和模型自己的改写揉在一起。SecureRAG 把这两件事分开。默认抽取档从检索到的文本块里挑句子，按原文顺序排列，每句挂一个编号链接，改写不会被当成原文引用。生成档会写句子，但引用是在文本到达你眼前之前就挂好的——我们不会让模型自己产出引用，因为模型会编造引用。',
            },
            { t: 'h2', text: 'SecureRAG 输给 ChatGPT 上传文件的地方' },
            {
              t: 'ul',
              items: [
                '它不会写作。0.5B–1.5B 量化模型写出的句子简短、字面，放在前沿模型旁边差距明显；开启这一档要下载 400MB–1.0GB，在没有 WebGPU 的机器上大约 3–8 token/s。',
                '不理解图像。图表、手写批注、印章都读不到。一份以图片为主的 PDF，抽出来的东西也基本为零。',
                '不能执行代码、不能联网、没有插件。索引里有什么，系统就知道什么。',
                '上限更紧：单文件 25MB、40 份、单库 200MB、20,000 个文本块；移动浏览器内存更紧张，上限还会调低。',
                '没有跨设备的会话记忆。索引留在 IndexedDB 里，对话不会跟着你去另一台设备。',
                '首次使用更慢。解析一份 20MB 的 PDF、把 900 个文本块向量化，在笔记本上要实打实等上几秒；托管服务则是在别人的机器上转圈。',
              ],
            },
            { t: 'h2', text: '用你手边已有的文档做五分钟测试' },
            {
              t: 'ol',
              items: [
                '挑一份你熟悉的合同或报告，大小在 10–25MB 之间以便落在 25MB 上限内，并记住一个你能背出来的条款号。',
                '在两边问同一个问题：「哪一条规定了提前终止，要求多长通知期？」',
                '看答案凭什么成立。ChatGPT 会在回答里摘一段原文；SecureRAG 是每句话都挂编号引用，点开是具体文本块并显示页码。',
                '再问一个文档里答不出的问题。本地把严格度设为「仅依据文档」，确认返回的是「文档中未找到」，而不是一个推断出来的条款号。',
                '两边都打开开发者工具的 Network 面板。一个是携带文件的多部分 POST；另一个只有一次下载模型权重的 GET，之后什么都没有。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '数据政策按产品和套餐而异。',
              text: '消费级 ChatGPT、API、ChatGPT Business 与 Enterprise 的数据使用默认值各不相同，而且会变。权威说法在 OpenAI 自己那里：它所服务产品的数据控制帮助页与隐私政策。本文写于 2026 年 9 月。',
            },
            {
              t: 'callout',
              kind: 'info',
              title: '一个务实的中间路线：',
              text: '能随便分享的文本用 ChatGPT 起草，不能往外发的文件用 SecureRAG——没签的合同、体检报告、人事档案、客户还没公开的财务数据。两者不必抢同一个文件夹。',
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'ChatGPT 会拿我上传的文件训练吗？',
                  a: '对消费级套餐，OpenAI 帮助中心写明：除非主动退出，它会进一步在用户的对话上训练，上传的内容也可能被包含在内。退出入口在「设置 → 数据控制 → 为所有人改进模型」，或走隐私门户。API、ChatGPT Enterprise 这类企业产品默认不用于训练。请以你所用的那档套餐对应的页面为准，答案随套餐变化。',
                },
                {
                  q: 'SecureRAG 能回答需要跨文档推理的问题吗？',
                  a: '它可以一次在最多 40 份文件上检索并引用其中几份的段落，也能把这些段落按原文顺序拼接起来。它不会做的事情是编出一个这些段落并不支持的结论——「仅依据文档」模式下会直接回答「文档中未找到」。',
                },
                {
                  q: '为什么本地的回答更短？',
                  a: '因为它是用你文件里已有的句子拼起来的。抽取式回答没法像生成式那样把论述展开，而正是这个机制把编造出来的条款号挡在答案之外。',
                },
                {
                  q: '开启生成档就能得到 ChatGPT 级别的文笔吗？',
                  a: '不能。它得到的是一个 0.5B–1.5B 量化模型写出的通顺文字，比抽取式拼接好，但仍明显低于前沿模型。而且任何下载都必须由你先点确认才会开始，也随时可以关掉。',
                },
              ],
            },
          ],
        },
      },
    },
  ],
} satisfies SectionModule;
