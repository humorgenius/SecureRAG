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
      question: string;
      answerLabel: string;
      answer: { a: string; strong: string; b: string; c1: string; mid: string; c2: string };
      sourceLabel: string;
      source: { pre: string; mark: string; post: string };
      /**
       * Copy for the live demo that now sits where the decorative input used to
       * be. `{n}` is substituted by the island.
       */
      demo: {
        placeholder: string;
        button: string;
        matches: string;
        /** same, for a count of exactly one — "1 matches" reads as a bug */
        matchesOne: string;
        files: string;
        filesOne: string;
        none: string;
        note: string;
        openTool: string;
        reset: string;
      };
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
  };
  faq: { eyebrow: string; heading: string; items: QA[] };
}

export const home: Record<Lang, HomeContent> = {
  en: {
    meta: {
      title: 'SecureRAG — cross-format AI file search, nothing uploaded',
      description:
        'Search PDF, DOCX, TXT, Markdown, CSV, HTML and JSON with AI in one place. Parsing, indexing and answering run entirely in your browser — no account, nothing uploaded.',
    },
    hero: {
      badge: 'Built for documents you are not allowed to upload',
      h1Lines: [
        'SecureRAG Cross-format file indexing.',
        'Runs locally. Never uploaded.',
        'AI retrieval, fast and simple.',
      ],
      h1AccentLine: 1,
      lede: 'SecureRAG is a cross-format AI file search tool from Lilink. It accepts many file formats (PDF · DOCX · TXT · Markdown · CSV · HTML · JSON …) and uses AI to search their contents in one unified place. The whole process is fast and safe: your files always stay on your own machine, are never uploaded to the cloud, so your information stays completely private.',
      ctaPrimary: 'Start with a document',
      ctaSecondary: 'How to verify us',
      preview: {
        url: 'Tool demo',
        live: 'LOCAL SESSION · 0 REQUESTS',
        docsTitle: 'Documents · 3 indexed',
        docs: [
          { tag: 'PDF', kind: 'pdf', name: 'Example file (1)', meta: '42 pages · 84 chunks' },
          { tag: 'DOC', kind: 'docx', name: 'Example file (2)', meta: '18 pages · 41 chunks' },
          { tag: 'MD', kind: 'md', name: 'Example file (3)', meta: '9 chunks' },
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
        sourceLabel: 'Source 1 · Example file (1) · p.14 · §8.2',
        source: {
          pre: '“…termination shall be effective sixty (60) days after written ',
          mark: 'notice',
          post: ' is delivered to the other party.”',
        },
        demo: {
          placeholder: 'Try “termination”, or any word of your own…',
          button: 'Search',
          matches: '{n} matches',
          matchesOne: '{n} match',
          files: 'in {n} files',
          filesOne: 'in {n} file',
          none: 'Nothing in these three documents contains that.',
          note: 'Matched in your browser, against documents that ship with this page. Nothing is uploaded and no model is downloaded.',
          openTool: 'Open the full tool',
          reset: 'Start over',
        },
      },
    },
    metrics: [
      { n: '0', label: 'documents leaked, ever' },
      { n: '1', unit: 'request', label: 'model weights, cached after first load' },
      { n: '25', unit: 'MB', label: 'default first download — nothing above 30 MB without your consent' },
      { n: '100', unit: '%', label: 'of parsing, embedding and retrieval happens in your tab' },
    ],
    capabilities: {
      eyebrow: 'Capabilities',
      heading: 'Search every file at once — no uploading, no sign-up',
      items: [
        {
          icon: 'shield',
          title: 'Your files stay on your computer',
          body: 'Nothing is uploaded, so there is no queue, no size limit nobody tells you about, and nobody waiting to approve your file. Add a document and it is searchable seconds later.',
          foot: 'Check DevTools → Network yourself',
        },
        {
          icon: 'docs',
          title: 'Search dozens of files at once',
          body: 'PDF, Word, Markdown, CSV, HTML, JSON and plain text, mixed together in one search. You do not convert anything first, and you do not open them one by one.',
          foot: '7 formats, one search box',
        },
        {
          icon: 'cite',
          title: 'Every answer links back to the source',
          body: 'Answers are built from sentences in your own files, each carrying a number that jumps to the paragraph it came from. You check the source instead of trusting a summary.',
          foot: 'Click a number to read the paragraph',
        },
        {
          icon: 'offline',
          title: 'Works with the internet off',
          body: 'The first visit downloads about 25 MB of model weights. After that you can pull the network cable and keep searching and asking questions.',
          foot: 'About 25 MB, once',
        },
        {
          icon: 'dial',
          title: 'Quotes only, or an explanation',
          body: 'Ask for the exact sentence and you get that exact sentence. Switch to the looser mode when you would rather have the wording explained than quoted.',
          foot: 'Two search buttons: exact and fuzzy',
        },
        {
          icon: 'export',
          title: 'Export the whole session',
          body: 'Every question, every answer and every matching sentence leaves as .txt, .md or .json, ready for your notes or a report.',
          foot: 'txt / md / json',
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
          a: 'Labeled display advertising, up to six units per page (three in-page banners, two side rails, one collapsible anchor) and never placed inside the chat workspace or above the primary action. There is no subscription and no data sale. Personalized ads load personalized only after you agree; outside the EEA, UK and Switzerland a refusal still shows non-personalized ads.',
        },
      ],
    },
  },

  zh: {
    meta: {
      title: 'SecureRAG — 跨格式文件索引工具，本地运行、文件不上传',
      description:
        '支持 PDF、DOCX、TXT、Markdown、CSV、HTML、JSON 等格式，借助 AI 统一检索文件内容。解析、建索引与回答全部在浏览器本地完成，无需账号，文件不上传。',
    },
    hero: {
      badge: '为那些“不允许上传”的文档而建',
      h1Lines: ['SecureRAG 跨格式文件索引工具。', '本地安全运行，文件不上传。', 'AI 智能检索，方便快捷。'],
      h1AccentLine: 1,
      lede: 'SecureRAG 是一款 Lilink 旗下的、可以跨格式快速检索信息的 AI 文件智能检索工具。它支持上传多种文件格式（PDF · DOCX · TXT · Markdown · CSV · HTML · JSON……）并借助 AI 对这些文件中的内容进行快速的统一检索。整个过程安全快捷，你的文件始终保存在你的本地，不会上传云端，保证你信息的绝对安全。',
      ctaPrimary: '从一份文档开始',
      ctaSecondary: '如何验证我们',
      preview: {
        url: '工具示例',
        live: '本地会话 · 0 请求',
        docsTitle: '文档库 · 已索引 3 份',
        docs: [
          { tag: 'PDF', kind: 'pdf', name: '示例文件（1）', meta: '42 页 · 84 块' },
          { tag: 'DOC', kind: 'docx', name: '示例文件（2）', meta: '18 页 · 41 块' },
          { tag: 'MD', kind: 'md', name: '示例文件（3）', meta: '9 块' },
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
        sourceLabel: '来源 1 · 示例文件（1） · 第 14 页 · §8.2',
        source: {
          pre: '“……解约于书面',
          mark: '通知',
          post: '送达对方六十（60）日后生效。”',
        },
        demo: {
          placeholder: '试试搜「解约」，或输入你自己的词……',
          button: '检索',
          matches: '{n} 处匹配',
          matchesOne: '{n} 处匹配',
          files: '来自 {n} 份文档',
          filesOne: '来自 {n} 份文档',
          none: '这三份文档里没有包含这个词的句子。',
          note: '在你的浏览器本地完成匹配，语料随页面一起发布。不上传任何内容，也不下载模型。',
          openTool: '打开完整工具',
          reset: '重新开始',
        },
      },
    },
    metrics: [
      { n: '0', label: '至今泄露过的文档数量' },
      { n: '1', unit: '个请求', label: '模型权重，首次加载后即缓存' },
      { n: '25', unit: 'MB', label: '默认首次下载体积，超过 30MB 必须经你同意' },
      { n: '100', unit: '%', label: '的解析、向量化与检索发生在你的标签页里' },
    ],
    capabilities: {
      eyebrow: '能力',
      heading: '一次搜完所有文件，不用上传、不用注册',
      items: [
        {
          icon: 'shield',
          title: '文件不上传，就在你电脑上搜',
          body: '没有上传这一步，所以不用排队、没有不说清的体积上限、也不用等谁批准。文件加进去，几秒后就能搜。',
          foot: '用开发者工具的网络面板自己看',
        },
        {
          icon: 'docs',
          title: '一次搜几十份文件',
          body: 'PDF、Word、Markdown、CSV、HTML、JSON 和纯文本可以混在一起搜，不用先转格式，也不用一份份翻。',
          foot: '7 种格式，一个搜索框',
        },
        {
          icon: 'cite',
          title: '答案带出处，能点回原文',
          body: '回答由你文件里的原句拼成，每句带编号，点编号就跳到它所在的那一段。你核对原文，不用信一个摘要。',
          foot: '点编号就能看到原段',
        },
        {
          icon: 'offline',
          title: '断网也能用',
          body: '第一次打开会下载约 25 MB 的模型，之后拔掉网线照样能搜、能问。',
          foot: '约 25 MB，只下一次',
        },
        {
          icon: 'dial',
          title: '要原文还是要解释，你说了算',
          body: '想要一模一样的原句，就给你原句；想让 AI 把意思讲清楚，就换个模式。',
          foot: '精准检索 / 模糊检索两个按钮',
        },
        {
          icon: 'export',
          title: '问答记录可以导出',
          body: '每个问题、每个回答、每一句匹配到的原文，都能导成 .txt、.md 或 .json，放进笔记或报告里。',
          foot: 'txt / md / json',
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
    },
    faq: {
      eyebrow: '常见问题',
      heading: '来自手握敏感文档的人的问题',
      items: [
        {
          q: '我能否在不信任你们的前提下验证“不上传”？',
          a: '可以，而且我们更希望你去验。打开开发者工具 → Network，清空日志，然后添加文档并连问几个问题。首次访问你唯一应看到的请求就是模型权重。之后把网络断开重试：它照常工作。',
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
          a: '明确标注的展示广告，每页最多六个（页内三条横幅、两侧两条竖幅、底部一条可折叠），绝不放进聊天工作区，也不压在主要操作上方。没有订阅制、不卖数据。个性化广告只在你同意后加载；在欧盟、英国、瑞士以外，拒绝后仍会展示非个性化广告。',
        },
      ],
    },
  },
};
