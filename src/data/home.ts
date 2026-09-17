import type { Lang } from '../i18n/utils';

export interface Metric {
  n: string;
  unit?: string;
  label: string;
}

export interface Capability {
  icon: 'shield' | 'docs' | 'cite' | 'offline' | 'dial' | 'export';
  title: string;
  body: string;
  foot: string;
}

export interface TrustPoint {
  num: string;
  title: string;
  body: string;
}

export interface CompareRow {
  criterion: string;
  us: string;
  them: string;
  /** which side wins on this row; 'note' means we state the loss plainly */
  edge: 'us' | 'them';
}

export interface Tier {
  rec: string;
  title: string;
  who: string;
  big: string;
  bigNote: string;
  items: { text: string; warn?: boolean }[];
  cta: string;
  primary: boolean;
}

export interface QA {
  q: string;
  a: string;
}

export interface HomeContent {
  meta: { title: string; description: string };
  hero: {
    badge: string;
    /** The headline, one entry per rendered line. */
    h1Lines: string[];
    /** Which entry of h1Lines carries the accent colour. */
    h1AccentLine: number;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    preview: {
      url: string;
      live: string;
      docsTitle: string;
      docs: { tag: string; kind: 'pdf' | 'docx' | 'md'; name: string; meta: string }[];
      indexTitle: string;
      indexRows: { tag: string; title: string; meta: string }[];
      question: string;
      answerLabel: string;
      answer: { a: string; strong: string; b: string; c1: string; mid: string; c2: string };
      sourceLabel: string;
      source: { pre: string; mark: string; post: string };
      placeholder: string;
      send: string;
    };
  };
  metrics: Metric[];
  capabilities: { eyebrow: string; heading: string; items: Capability[] };
  trust: { eyebrow: string; heading: string; title: string; tag: string; points: TrustPoint[] };
  compare: {
    eyebrow: string;
    heading: string;
    caption: string;
    head: { criterion: string; us: string; them: string };
    rows: CompareRow[];
    noteTitle: string;
    note: string;
  };
  tiers: { eyebrow: string; heading: string; items: Tier[]; note: string };
  faq: { eyebrow: string; heading: string; items: QA[] };
  end: { heading: string; body: string; ctaPrimary: string; ctaSecondary: string };
}

export const home: Record<Lang, HomeContent> = {
  en: {
    meta: {
      title: 'SecureRAG — private document Q&A that never uploads your files',
      description:
        'Drop in PDFs, Word files or Markdown and ask questions. Parsing, indexing and answering run entirely in your browser. No account, no upload, works offline.',
    },
    hero: {
      badge: 'Built for documents you are not allowed to upload',
      h1Lines: [
        'SecureRAG Cross-format file indexing.',
        'Runs locally. Never uploaded.',
        'AI retrieval, fast and simple.',
      ],
      h1AccentLine: 1,
      lede: 'SecureRAG is a cross-format AI file search tool from AIrich. It accepts many file formats (PDF · DOCX · TXT · Markdown · CSV · HTML · JSON …) and uses AI to search their contents in one unified place. The whole process is fast and safe: your files always stay on your own machine, are never uploaded to the cloud, so your information stays completely private.',
      ctaPrimary: 'Start with a document',
      ctaSecondary: 'How to verify us',
      preview: {
        url: 'securerag.app/app',
        live: 'LOCAL SESSION · 0 REQUESTS',
        docsTitle: 'Documents · 3 indexed',
        docs: [
          { tag: 'PDF', kind: 'pdf', name: '服务协议_2026.pdf', meta: '42 pages · 84 chunks' },
          { tag: 'DOC', kind: 'docx', name: 'Q3 产品评审.docx', meta: '18 pages · 41 chunks' },
          { tag: 'MD', kind: 'md', name: 'deployment-notes.md', meta: '9 chunks' },
        ],
        indexTitle: 'Index health',
        indexRows: [
          { tag: '512', title: 'dim · float32', meta: 'IndexedDB · persisted' },
          { tag: 'BM', title: '+ BM25 hybrid', meta: 'RRF fused · top-k 6' },
        ],
        question: 'What is the termination notice period?',
        answerLabel: 'Answer · generated locally',
        answer: {
          a: 'Either party may terminate on ',
          strong: "60 days'",
          b: ' written notice',
          c1: '1',
          mid: '. A material breach carries a 30-day cure period before termination rights activate',
          c2: '2',
        },
        sourceLabel: 'Source 1 · 服务协议_2026.pdf · p.14 · §8.2',
        source: {
          pre: '“…termination shall be effective sixty (60) days after written ',
          mark: 'notice',
          post: ' is delivered to the other party.”',
        },
        placeholder: 'Ask a follow-up…',
        send: 'Send',
      },
    },
    metrics: [
      { n: '0', label: 'documents uploaded, ever' },
      { n: '1', unit: 'request', label: 'model weights, cached after first load' },
      { n: '25', unit: 'MB', label: 'default first download — nothing above 30 MB without your consent' },
      { n: '100', unit: '%', label: 'of parsing, embedding and retrieval happens in your tab' },
    ],
    capabilities: {
      eyebrow: 'Capabilities',
      heading: 'Everything a serious document workflow needs — minus the data transfer',
      items: [
        {
          icon: 'shield',
          title: 'Zero-upload architecture',
          body: 'No API endpoint exists to receive a document. The engine is JavaScript running against your own files in browser memory, persisted in your own IndexedDB.',
          foot: 'Verifiable in DevTools → Network',
        },
        {
          icon: 'docs',
          title: 'Multi-document collections',
          body: 'Group by matter, rename, pause, delete, re-index. Ask across the whole library or scope a question to a specific subset at ask-time.',
          foot: 'Up to 40 files · 20,000 chunks',
        },
        {
          icon: 'cite',
          title: 'Paragraph-level citations',
          body: 'Every answer sentence maps to a numbered source, with the original sentence highlighted in place. PDFs carry page and section; Markdown and Word carry the heading path.',
          foot: 'Click to jump, not just to scroll',
        },
        {
          icon: 'offline',
          title: 'Offline operation',
          body: 'Application shell and model weights are cached by a service worker. Air-gapped laptops, flights, restricted networks — the tool keeps working.',
          foot: 'Installable as a PWA',
        },
        {
          icon: 'dial',
          title: 'Strictness control',
          body: 'Documents-only mode returns “not found in your documents” instead of guessing. Inference mode may summarise across chunks but flags every inferred statement.',
          foot: 'Two modes, clearly labelled output',
        },
        {
          icon: 'export',
          title: 'Exportable audit trail',
          body: 'Sessions export to Markdown, JSON or plain text with the model name, strictness setting and full citation list — enough for a colleague to reproduce the result.',
          foot: 'Reproducible by design',
        },
      ],
    },
    trust: {
      eyebrow: 'Trust center',
      heading: 'Four claims we are willing to be tested on',
      title: 'Privacy posture',
      tag: 'Test it yourself',
      points: [
        {
          num: '01',
          title: 'No document transmission',
          body: 'Your files are read via the File API into memory. There is no upload code path in the application, and no endpoint that could accept one.',
        },
        {
          num: '02',
          title: 'No training on your data',
          body: 'Models run inference only. No gradients are computed, no feedback loop exists, and no content is retained outside your browser storage.',
        },
        {
          num: '03',
          title: 'One disclosed third party',
          body: 'Model weights are fetched from a public model host. That request carries no document content, no question and no identifier — only the model file name.',
        },
        {
          num: '04',
          title: 'Deletable by you, instantly',
          body: 'Clearing site data removes every chunk, vector and conversation. We hold no copy because we never had one.',
        },
      ],
    },
    compare: {
      eyebrow: 'Comparison',
      heading: 'Local pipeline vs. uploading to a cloud assistant',
      caption: 'Table 1 — side-by-side assessment criteria',
      head: { criterion: 'Criterion', us: 'SecureRAG', them: 'Cloud assistant file upload' },
      rows: [
        { criterion: 'Document custody', us: 'You; it never moves', them: 'Vendor infrastructure', edge: 'us' },
        { criterion: 'Identity required', us: 'None', them: 'Account, often phone-verified', edge: 'us' },
        { criterion: 'Network dependency', us: 'Only for the first model fetch', them: 'Continuous', edge: 'us' },
        { criterion: 'Retention policy', us: 'Whatever your browser does', them: 'Plan-dependent, vendor-set', edge: 'us' },
        { criterion: 'Answer citations', us: 'Paragraph + page, always', them: 'Inconsistent', edge: 'us' },
        { criterion: 'Cost', us: 'Your electricity', them: 'Free tier cap, then paid', edge: 'us' },
        { criterion: 'Natural-language fluency', us: 'Bounded by a 0.5–1.5B local model', them: 'Frontier-scale', edge: 'them' },
      ],
      noteTitle: 'Where we lose, stated up front:',
      note: 'if your document is public and you want the best possible prose, a frontier cloud model will beat anything that fits in a browser tab. Choose this tool when the document is the part you cannot hand over.',
    },
    tiers: {
      eyebrow: 'Deployment tiers',
      heading: 'Both tiers run locally. You choose what to download.',
      items: [
        {
          rec: 'Enabled by default',
          title: 'Lightweight retrieval tier',
          who: 'Embedding plus extractive answering with citations. Instant start, works on phones.',
          big: '≈ 25 MB',
          bigNote: 'first visit, then cached',
          items: [
            { text: 'bge-small-zh-v1.5 or all-MiniLM-L6-v2, quantised ONNX' },
            { text: 'Hybrid vector + BM25 retrieval, RRF fusion' },
            { text: 'Answers built from source sentences — never invented' },
            { text: 'Offline-capable after the first load' },
          ],
          cta: 'Start here',
          primary: true,
        },
        {
          rec: 'Opt-in',
          title: 'Local generation tier',
          who: 'Adds a small instruct model that writes fluent answers from the retrieved passages.',
          big: '400 MB – 1.0 GB',
          bigNote: 'stated before download',
          items: [
            { text: 'Qwen2.5 0.5B–1.5B, 4-bit quantised' },
            { text: 'Transformers.js on WebGPU where available, WebAssembly on CPU otherwise' },
            { text: 'Streaming output with citation markers intact' },
            { text: 'No WebGPU means CPU speed: 3–8 tokens/second', warn: true },
          ],
          cta: 'See the trade-off',
          primary: false,
        },
      ],
      note: 'Model weights are the only thing this site ever downloads. They contain no information about you, your files or your questions — and once cached, the tool keeps working with the network switched off.',
    },
    faq: {
      eyebrow: 'FAQ',
      heading: 'Questions from people with sensitive documents',
      items: [
        {
          q: 'Can I verify the no-upload claim without trusting you?',
          a: 'Yes, and we would rather you did. Open DevTools → Network, clear the log, then add a document and ask several questions. The only request you should see on a first visit is the model weights. Repeat with the network disabled: it keeps working. The in-app shield panel reports the same records without DevTools.',
        },
        {
          q: 'What is the one third-party request, exactly?',
          a: 'A GET for the model file from a public model host (HuggingFace or a mirror). The request contains the file name and nothing else — no document, no question, no cookie identifying you. The models page lists every file by name and size so you can check what lands on your machine.',
        },
        {
          q: 'Is this suitable for regulated or confidential material?',
          a: 'Architecturally it removes the third-party transfer problem, because no transfer occurs. Whether that satisfies your specific obligations is a judgement only you and your compliance team can make — we provide the technical facts (data flow, storage location, deletion method) on the security page so that judgement can be made quickly.',
        },
        {
          q: 'How does the site fund itself?',
          a: 'Labeled display advertising, capped at three units per page and never placed inside the chat workspace or above the primary action. There is no subscription, no data sale, and no tracking beyond what the ad network itself requires — with a consent gate before any ad script loads.',
        },
      ],
    },
    end: {
      heading: 'Test the claim, not the copy',
      body: 'Add one document, ask three questions, and watch the network panel stay empty. That takes less time than reading this page.',
      ctaPrimary: 'Open the tool',
      ctaSecondary: 'Read the privacy policy',
    },
  },

  zh: {
    meta: {
      title: 'SecureRAG — 本地运行、绝不上传的文档问答工具',
      description:
        '拖入 PDF、Word 或 Markdown 文档即可提问。解析、建索引与回答全部在你的浏览器内完成，无需账号、不上传，缓存后可离线使用。',
    },
    hero: {
      badge: '为那些“不允许上传”的文档而建',
      h1Lines: ['SecureRAG 跨格式文件索引工具。', '本地安全运行，文件不上传。', 'AI 智能检索，方便快捷。'],
      h1AccentLine: 1,
      lede: 'SecureRAG 是一款 AIrich 旗下的、可以跨格式快速检索信息的 AI 文件智能检索工具。它支持上传多种文件格式（PDF · DOCX · TXT · Markdown · CSV · HTML · JSON……）并借助 AI 对这些文件中的内容进行快速的统一检索。整个过程安全快捷，你的文件始终保存在你的本地，不会上传云端，保证你信息的绝对安全。',
      ctaPrimary: '从一份文档开始',
      ctaSecondary: '如何验证我们',
      preview: {
        url: 'securerag.app/app',
        live: '本地会话 · 0 请求',
        docsTitle: '文档库 · 已索引 3 份',
        docs: [
          { tag: 'PDF', kind: 'pdf', name: '服务协议_2026.pdf', meta: '42 页 · 84 块' },
          { tag: 'DOC', kind: 'docx', name: 'Q3 产品评审.docx', meta: '18 页 · 41 块' },
          { tag: 'MD', kind: 'md', name: 'deployment-notes.md', meta: '9 块' },
        ],
        indexTitle: '索引状态',
        indexRows: [
          { tag: '512', title: '维 · float32', meta: 'IndexedDB · 已持久化' },
          { tag: 'BM', title: '+ BM25 混合检索', meta: 'RRF 融合 · top-k 6' },
        ],
        question: '合同里的解约通知期是多久？',
        answerLabel: '回答 · 本地生成',
        answer: {
          a: '任一方提前 ',
          strong: '60 天',
          b: '书面通知即可解约',
          c1: '1',
          mid: '。重大违约在解约权生效前另有 30 天补救期',
          c2: '2',
        },
        sourceLabel: '来源 1 · 服务协议_2026.pdf · 第 14 页 · §8.2',
        source: {
          pre: '“……解约于书面',
          mark: '通知',
          post: '送达对方六十（60）日后生效。”',
        },
        placeholder: '继续追问…',
        send: '发送',
      },
    },
    metrics: [
      { n: '0', label: '至今上传过的文档数量' },
      { n: '1', unit: '个请求', label: '模型权重，首次加载后即缓存' },
      { n: '25', unit: 'MB', label: '默认首次下载体积，超过 30MB 必须经你同意' },
      { n: '100', unit: '%', label: '的解析、向量化与检索发生在你的标签页里' },
    ],
    capabilities: {
      eyebrow: '能力',
      heading: '严肃的文档工作流需要的都有，除了“把数据交出去”那一步',
      items: [
        {
          icon: 'shield',
          title: '零上传架构',
          body: '不存在能接收文档的接口。引擎就是 JavaScript，读取浏览器内存里你自己的文件，并持久化在你自己的 IndexedDB 中。',
          foot: '开发者工具 → Network 即可验证',
        },
        {
          icon: 'docs',
          title: '多文档合集',
          body: '按事项分组、重命名、临时停用、删除、重建索引。可全库提问，也可在提问时把范围限定到特定子集。',
          foot: '最多 40 份文件 · 2 万个块',
        },
        {
          icon: 'cite',
          title: '段落级引用',
          body: '回答中的每一句都对应编号来源，原句会在原位高亮。PDF 标注页码与章节，Markdown 与 Word 标注标题路径。',
          foot: '可点击定位，不只是滚动',
        },
        {
          icon: 'offline',
          title: '可离线运行',
          body: '应用外壳与模型权重由 Service Worker 缓存。物理隔离的内网笔记本、飞机上、受限网络里，工具照常可用。',
          foot: '可作为 PWA 安装',
        },
        {
          icon: 'dial',
          title: '严格度可控',
          body: '「仅依据文档」在找不到时返回“文档中未找到”，而不是猜；「允许推理」可跨片段归纳，但会标注每一条推断。',
          foot: '两档模式，输出有明确标注',
        },
        {
          icon: 'export',
          title: '可导出的审计记录',
          body: '会话可导出为 Markdown、JSON 或纯文本，含模型名、严格度设置与完整引用清单——足够同事复现结果。',
          foot: '天然可复现',
        },
      ],
    },
    trust: {
      eyebrow: '信任中心',
      heading: '四条经得起你当场检验的说法',
      title: '隐私立场',
      tag: '你可以自己验',
      points: [
        {
          num: '01',
          title: '不传输文档',
          body: '文件经 File API 读入内存。应用里不存在上传代码路径，也不存在能接收上传的接口。',
        },
        {
          num: '02',
          title: '不用你的数据训练',
          body: '模型只做推理。不计算梯度、不存在反馈回路，除你浏览器的存储外不保留任何内容。',
        },
        {
          num: '03',
          title: '唯一披露的第三方',
          body: '模型权重从公开模型托管站拉取。该请求不携带文档内容、问题和任何标识，只包含模型文件名。',
        },
        {
          num: '04',
          title: '你可即时彻底删除',
          body: '清除站点数据即删除全部文本块、向量与对话。我们手上没有副本，因为从来就没有过。',
        },
      ],
    },
    compare: {
      eyebrow: '对比',
      heading: '本地管线 vs. 上传到云端助手',
      caption: '表 1 — 逐项评估',
      head: { criterion: '评估项', us: 'SecureRAG', them: '云端助手上传文件' },
      rows: [
        { criterion: '文档归属', us: '归你，且从未移动', them: '厂商基础设施', edge: 'us' },
        { criterion: '是否需要身份', us: '不需要', them: '需要账号，通常还要手机验证', edge: 'us' },
        { criterion: '网络依赖', us: '仅首次拉取模型时需要', them: '持续需要', edge: 'us' },
        { criterion: '留存策略', us: '完全由你的浏览器决定', them: '随套餐变化，由厂商设定', edge: 'us' },
        { criterion: '回答引用', us: '始终到段落与页码', them: '不稳定', edge: 'us' },
        { criterion: '成本', us: '你的电费', them: '免费额度上限，之后付费', edge: 'us' },
        { criterion: '自然语言流畅度', us: '受 0.5–1.5B 本地模型限制', them: '前沿规模模型', edge: 'them' },
      ],
      noteTitle: '我们输在哪，先说清楚：',
      note: '如果你的文档是公开的、你要的是最好的文笔，云端前沿模型会赢过任何能塞进浏览器标签页的模型。当文档本身就是你交不出去的那部分时，才该选这个工具。',
    },
    tiers: {
      eyebrow: '模型档位',
      heading: '两档都在本地运行，下载什么由你决定',
      items: [
        {
          rec: '默认开启',
          title: '轻量检索档',
          who: '嵌入 + 抽取式回答，附带引用。秒级开始，手机也能用。',
          big: '约 25 MB',
          bigNote: '首次访问，之后缓存',
          items: [
            { text: 'bge-small-zh-v1.5 或 all-MiniLM-L6-v2，量化 ONNX' },
            { text: '向量 + BM25 混合检索，RRF 融合排序' },
            { text: '回答由源句构成，绝不编造' },
            { text: '首次加载后可离线使用' },
          ],
          cta: '从这里开始',
          primary: true,
        },
        {
          rec: '需手动开启',
          title: '本地生成档',
          who: '追加一个小型指令模型，把检索到的段落写成通顺回答。',
          big: '400 MB – 1.0 GB',
          bigNote: '下载前明确告知',
          items: [
            { text: 'Qwen2.5 0.5B–1.5B，4 位量化' },
            { text: '有 WebGPU 时走 GPU，否则通过 WebAssembly 跑在 CPU 上' },
            { text: '流式输出，引用标记保持完好' },
            { text: '没有 WebGPU 就只能走 CPU：每秒 3–8 个 token', warn: true },
          ],
          cta: '查看取舍细节',
          primary: false,
        },
      ],
      note: '模型权重是本网站唯一会下载的东西。它不包含关于你、你的文件或你的问题的任何信息——而且缓存之后，关掉网络工具照常可用。',
    },
    faq: {
      eyebrow: '常见问题',
      heading: '来自手握敏感文档的人的问题',
      items: [
        {
          q: '我能否在不信任你们的前提下验证“不上传”？',
          a: '可以，而且我们更希望你去验。打开开发者工具 → Network，清空日志，然后添加文档并连问几个问题。首次访问你唯一应看到的请求就是模型权重。之后把网络断开重试：它照常工作。站内盾牌面板无需开发者工具也能显示同一份记录。',
        },
        {
          q: '那唯一一个第三方请求，具体是什么？',
          a: '向公开模型托管站（HuggingFace 或镜像）发起的一次模型文件 GET。请求里只有文件名，没有文档、没有问题、没有能标识你的 Cookie。模型页会列出每个文件的名称与体积，你可以核对到底下到了什么。',
        },
        {
          q: '它适合受监管或机密材料吗？',
          a: '从架构上讲，它消除了“第三方传输”这个问题，因为根本没有传输。至于这是否满足你的具体合规义务，只能由你和你的合规团队判断——我们在安全页里提供了技术事实（数据流、存储位置、删除方式），让你能快速做出判断。',
        },
        {
          q: '这个网站靠什么维持？',
          a: '明确标注的展示广告，每页最多三个，绝不放进聊天工作区，也不压在主要操作上方。没有订阅制、不卖数据、除广告网络自身必需之外没有额外追踪——且广告脚本加载前会有同意门。',
        },
      ],
    },
    end: {
      heading: '去验那句话，而不是信这段文案',
      body: '加一份文档，问三个问题，看网络面板保持空白。这比读完这一页还快。',
      ctaPrimary: '打开工具',
      ctaSecondary: '阅读隐私政策',
    },
  },
};
