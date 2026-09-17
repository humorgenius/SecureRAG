import type { ContentPage } from './types';

export default {
  slug: 'changelog',
  nav: '/changelog/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/about/', labelEn: 'About this project', labelZh: '关于这个项目' },
    { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '管线如何运转' },
    { path: '/models/', labelEn: 'Model sizes and licences', labelZh: '模型体积与许可' },
    { path: '/contact/', labelEn: 'Report a problem', labelZh: '报告问题' },
  ],
  copy: {
    en: {
      title: 'Changelog: v0.1, the first release (2026-09-17)',
      description:
        'The v0.1 release record, published 17 September 2026: what shipped, the limitations knowingly left in, and what comes next, with no invented version history.',
      h1: 'Changelog',
      intro:
        'This page records what shipped in each released version of the site and the tool, what was knowingly left unfinished, and what changes next. There is one entry so far: v0.1, published 17 September 2026. Nothing earlier exists, and no entry here is backfilled to look like a longer history.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'v0.1 is the first public version, released on 2026-09-17. It ships a browser-local document question-answering tool: files are parsed, chunked, embedded, indexed and searched inside the tab, the embedding model is a one-time download of 23 to 25 MB, and a larger optional generation model is available behind an explicit confirmation step.',
        },
        { t: 'h2', text: 'v0.1 — 17 September 2026' },
        { t: 'h3', text: 'What shipped' },
        {
          t: 'table',
          caption: 'Table 1 — the v0.1 feature set, with its numbers',
          head: ['Area', 'What is in v0.1'],
          rows: [
            [
              'Import',
              'Magic-byte sniffing before parsing, then PDF, DOCX, TXT, Markdown, CSV, HTML and JSON. PDF page numbers and DOCX heading levels are preserved, so a citation can name a page or a section.',
            ],
            [
              'Preparation',
              'Normalisation that drops repeated headers and footers, followed by structure-aware chunking at roughly 700 characters with 15% overlap.',
            ],
            [
              'Embedding',
              'Local vector computation in a Web Worker, on the GPU through WebGPU where the browser exposes it, otherwise on the CPU through the WebAssembly build of onnxruntime.',
            ],
            [
              'Storage',
              'Text chunks and vectors in IndexedDB for the site, model weights in Cache Storage. Clearing site data removes both, and there is no server-side copy.',
            ],
            [
              'Retrieval',
              'Hybrid search combining vector similarity with BM25, fused by reciprocal rank fusion at k=60, re-ranked by maximal marginal relevance at lambda 0.7, with the top 6 passages passed to the answering step.',
            ],
            [
              'Answering',
              'Extractive answers by default, assembled from retrieved sentences with citations pointing back to a document, a page or a section. A strictness setting controls how much interpretation is allowed.',
            ],
            [
              'Optional generation',
              'Qwen2.5 0.5B or 1.5B, 4-bit quantised, 400 MB to 1.0 GB, downloaded only after a dialog names the size and you confirm it. Roughly 3 to 8 tokens per second on the CPU path.',
            ],
            [
              'Embedding models',
              'bge-small-zh-v1.5, about 25 MB, 512 dimensions, default for Chinese; all-MiniLM-L6-v2, about 23 MB, 384 dimensions, default for English; multilingual-e5-small, about 120 MB, 384 dimensions, for mixed-language libraries.',
            ],
            [
              'Limits',
              '25 MB per file, 40 files, 200 MB and 20,000 chunks per knowledge base, with the file cap lowered to 10 on phones.',
            ],
            [
              'Offline behaviour',
              'After the model weights are cached, question answering works with no network. The model download is the only outbound request the tool makes, and it carries a file name.',
            ],
            [
              'Language',
              'Every page is published in English and Simplified Chinese, with the language switch in the header and hreflang links on both versions.',
            ],
            [
              'Keyboard and screen readers',
              'A skip link, labelled navigation and panels, a visible focus outline, live regions announcing indexing and generation progress, and reduced-motion support. The accessibility page lists what is still missing.',
            ],
            [
              'Advertising',
              'Google AdSense, consent-gated, at most three labelled slots per page, never inside the chat workspace. The privacy, terms, security, accessibility, about, contact and changelog pages carry no advertising.',
            ],
            [
              'Taking work out',
              'An answer copies to the clipboard with its citations, and browser printing produces a PDF of any page. There is no server-side export.',
            ],
          ],
        },
        { t: 'h3', text: 'Known limitations in v0.1' },
        {
          t: 'p',
          text: 'These are the limits shipped knowingly, not defects discovered later:',
        },
        {
          t: 'ul',
          items: [
            'Scanned PDFs with no text layer are rejected. No OCR is bundled, so a scan has to be converted elsewhere first.',
            'Encrypted PDFs are rejected, with no password prompt, because there is no decryption path in the app.',
            'Legacy .doc files are not supported, and any single file above 25 MB is refused.',
            'Tables in PDFs are read as text only: column alignment is lost, while CSV rows keep their structure.',
            'Generation on the CPU/WASM path runs at roughly 3 to 8 tokens per second, and generation is off by default on phones.',
            'The model download dialog does not trap keyboard focus or close on Escape, and the mobile Docs/Chat/Settings switcher does not implement the tablist pattern. Both are listed on the accessibility page as outstanding.',
            'The index lives in one browser profile. There is no cloud sync, so another machine means re-importing the files.',
            'Accuracy is not guaranteed. Every answer carries citations so it can be checked, and the check is the reader’s.',
          ],
        },
        { t: 'h3', text: 'What is next' },
        {
          t: 'p',
          text: 'The first work is the two accessibility gaps named above: keyboard focus handling in the confirmation dialog and a proper tablist for the mobile panel switcher. Beyond that, priority comes from reports sent to the mailbox, and fixes are published here rather than promised in advance.',
        },
        {
          t: 'p',
          text: 'No dates are attached to future work and no roadmap is published, because a roadmap with dates that cannot be met is worth less than a record of what actually shipped. This page is that record.',
        },
        { t: 'h2', text: 'How this page is written' },
        {
          t: 'ul',
          items: [
            'One entry per released version, headed by the version number and an ISO date in the form 2026-09-17.',
            'Version numbers move when shipped behaviour changes, not when a page is edited. A typo fixed on the models page is a correction to that page, not a release.',
            'A limitation that gets fixed is removed from the entry that listed it and named in the entry where the fix shipped, so a reader can see when a gap closed.',
            'A limitation that turns out to be wrong is corrected in place and noted here, including when the correction makes the project look worse.',
            'Security fixes are described after they are live, with the mechanism kept vague until users on the current version are no longer exposed.',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'This is the only version so far.',
          text: 'v0.1 is the first public release, dated 2026-09-17. Older version numbers are not invented, and the entries above describe what the code does on that date rather than what was planned for it.',
        },
        { t: 'h2', text: 'Reporting something this page gets wrong' },
        {
          t: 'p',
          text: 'If a feature listed above does not behave as described, that is a defect worth reporting rather than a changelog wording problem. Write to hello@securerag.app with your browser and version, the steps you took and what happened, and the entry gets corrected along with the fix.',
        },
      ],
    },
    zh: {
      title: '更新日志：v0.1 首个版本（2026-09-17）',
      description:
        'SecureRAG 的 v0.1 发布记录（2026 年 9 月 17 日）：首发功能与具体数值、明知未做的限制，以及下一步安排；不编写不存在的历史版本。',
      h1: '更新日志',
      intro:
        '这一页记录每个已发布版本里站点与工具实际交付的内容、明知尚未完成的部分，以及接下来会变的地方。目前只有一条：v0.1，发布于 2026 年 9 月 17 日。更早的版本不存在，这里的记录也不会为了显得更久而补写。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'v0.1 是首个公开版本，发布于 2026-09-17。它交付的是一个浏览器本地的文档问答工具：文件在标签页内被解析、分块、向量化、建索引并检索，嵌入模型是一次性下载的 23 到 25MB，更大体积的可选生成模型则放在一个明确的确认步骤之后。',
        },
        { t: 'h2', text: 'v0.1 — 2026 年 9 月 17 日' },
        { t: 'h3', text: '首发功能' },
        {
          t: 'table',
          caption: '表 1 — v0.1 的功能清单与对应数值',
          head: ['范围', 'v0.1 包含什么'],
          rows: [
            [
              '导入',
              '解析前先做魔数嗅探，随后支持 PDF、DOCX、TXT、Markdown、CSV、HTML、JSON。PDF 页码与 DOCX 标题层级都会保留，所以引用可以指明某一页或某一节。',
            ],
            [
              '预处理',
              '规范化阶段剔除重复出现的页眉页脚，随后按结构分块，约 700 字符、相邻块保留 15% 重叠。',
            ],
            [
              '向量化',
              '在 Web Worker 里本地计算向量：浏览器暴露 WebGPU 时走 GPU，否则走 onnxruntime 的 WebAssembly 版本、跑在 CPU 上。',
            ],
            [
              '存储',
              '文本块与向量存在本站的 IndexedDB，模型权重存在 Cache Storage。清除站点数据两者一起消失，服务器端不存在副本。',
            ],
            [
              '检索',
              '混合搜索：向量相似度与 BM25 两路结果用 RRF 融合（k=60），再用 MMR 重排（λ=0.7），最终取前 6 条交给回答环节。',
            ],
            [
              '回答',
              '默认抽取式：回答由检索到的句子组成，引用指回文档、页码或小节。严格度设置决定允许多少解释成分。',
            ],
            [
              '可选生成',
              'Qwen2.5 0.5B 或 1.5B，4-bit 量化，400MB–1.0GB；只有在对话框写明体积、你确认之后才下载。CPU 路径上大约每秒 3 到 8 个 token。',
            ],
            [
              '嵌入模型',
              'bge-small-zh-v1.5（约 25MB、512 维）为中文默认；all-MiniLM-L6-v2（约 23MB、384 维）为英文默认；multilingual-e5-small（约 120MB、384 维）用于中英混排的资料库。',
            ],
            [
              '限额',
              '单文件 25MB、40 份文件、200MB 与 20,000 个文本块；手机端文件上限降为 10 份。',
            ],
            [
              '离线行为',
              '模型权重缓存之后，无网络也能问答。模型下载是工具唯一的对外请求，携带的只是文件名。',
            ],
            [
              '语言',
              '每个页面都有英文与简体中文两个版本，页头有语言切换，两边都带 hreflang 链接。',
            ],
            [
              '键盘与屏幕阅读器',
              '跳到主要内容的链接、带标签的导航与面板、可见的焦点轮廓、播报索引与生成进度的实时区域，以及减少动效支持。还缺什么写在无障碍页面上。',
            ],
            [
              '广告',
              'Google AdSense，需先经同意，单页最多三个标注清楚的广告位，绝不进入聊天工作区。隐私、条款、安全、无障碍、关于、联系与更新日志页面不含广告。',
            ],
            [
              '把结果带走',
              '回答可连同引用复制到剪贴板，浏览器打印能把任意页面导出成 PDF。没有服务端导出。',
            ],
          ],
        },
        { t: 'h3', text: 'v0.1 已知限制' },
        {
          t: 'p',
          text: '以下是发布时就知道的限制，不是事后才发现的缺陷：',
        },
        {
          t: 'ul',
          items: [
            '没有文字层的扫描件 PDF 会被拒绝。这里没有内置 OCR，扫描件必须先在其他工具里转换。',
            '加密 PDF 会被拒绝，也不会弹出密码输入框，因为应用里没有解密路径。',
            '不支持旧版 .doc，任何超过 25MB 的单个文件也会被拒绝。',
            'PDF 里的表格只能按文本读取，列对齐会丢失；CSV 则保留行结构。',
            'CPU/WASM 路径上的生成速度大约每秒 3 到 8 个 token，手机端默认关闭生成。',
            '模型下载对话框没有锁定键盘焦点、也不能用 Escape 关闭；手机端「文档 / 对话 / 设置」切换没有实现 tablist 模式。两项都列在无障碍页面的待办里。',
            '索引只存在于一个浏览器配置中。没有云同步，换机器意味着重新导入文件。',
            '不保证准确。每个回答都带引用以便核对，而核对这一步属于读者。',
          ],
        },
        { t: 'h3', text: '下一步' },
        {
          t: 'p',
          text: '最先做的是上面那两项无障碍缺口：确认对话框的键盘焦点处理，以及手机端面板切换的 tablist 实现。除此之外，优先级来自邮箱里收到的报告，修复完成之后写在这里，而不是提前承诺。',
        },
        {
          t: 'p',
          text: '未来的工作不附日期，也不发布路线图，因为一份注定跳票的路线图，价值低于一份记录实际交付内容的清单。这一页就是那份清单。',
        },
        { t: 'h2', text: '这一页的写法约定' },
        {
          t: 'ul',
          items: [
            '每个已发布版本一条记录，标题写版本号与 ISO 日期，形如 2026-09-17。',
            '版本号在已交付行为变化时才动，页面编辑不动版本号。模型页上改掉一个错字，是那一页的更正，不是一次发布。',
            '修好的限制会从原来那条记录里删除，并在修复发布的那个版本里点名写出，读者因此可以看出缺口是什么时候补上的。',
            '如果某条限制后来被发现写错了，会在原处更正并在这里注明，即使更正之后看起来更不体面。',
            '安全修复在生效之后才描述，在还在用旧版本的用户不再暴露之前，机制细节保持模糊。',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: '目前只有这一个版本。',
          text: 'v0.1 是首个公开版本，日期为 2026-09-17。这里不编造更早的版本号，上面的条目描述的是代码在那一天的实际行为，而不是原本的计划。',
        },
        { t: 'h2', text: '这一页写错了怎么办' },
        {
          t: 'p',
          text: '如果上面列出的某项功能表现与描述不符，那是值得报告的缺陷，而不是更新日志的措辞问题。写信到 hello@securerag.app，附上浏览器与版本、你操作的步骤和实际结果，条目会随修复一起更正。',
        },
      ],
    },
  },
} satisfies ContentPage;
