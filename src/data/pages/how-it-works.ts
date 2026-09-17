import type { ContentPage } from './types';

export const howItWorks: ContentPage = {
  slug: 'how-it-works',
  nav: '/how-it-works/',
  ads: 1,
  schema: { article: true, howTo: true },
  related: [
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
    { path: '/guides/improve-retrieval-quality/', labelEn: 'Improve retrieval quality', labelZh: '提升检索准确率' },
    { path: '/glossary/', labelEn: 'Glossary of terms', labelZh: '术语表' },
  ],
  copy: {
    en: {
      title: 'How it works — the local RAG pipeline inside your browser',
      description:
        'A step-by-step look at how SecureRAG parses, chunks, embeds and searches your documents entirely in the browser, and exactly what leaves your device (one request).',
      h1: 'How a question gets answered without anything leaving your machine',
      intro:
        'SecureRAG is a retrieval-augmented generation (RAG) pipeline that runs inside a single browser tab. Your document is parsed in memory, split into passages, converted into vectors, indexed locally and searched when you ask something. This page walks through each stage and the one network request the whole application ever makes.',
      updated: '2026-09-17',
      blocks: [
        { t: 'h2', text: 'What happens the moment you drop a file' },
        {
          t: 'p',
          lead: true,
          text: 'Four stages run in sequence, all of them on your device. Each stage is ordinary JavaScript, and each one reports progress so you can see where the time goes.',
        },
        {
          t: 'steps',
          items: [
            {
              title: 'Ingestion',
              text: 'The file is read through the browser File API into an ArrayBuffer. Format detection uses magic bytes rather than the file extension, so a mislabelled file does not silently produce empty text. PDF text layers, Word heading levels and Markdown structure are preserved.',
            },
            {
              title: 'Normalisation and chunking',
              text: 'Repeated headers and footers are stripped, hard line breaks inside paragraphs are rejoined, and the text is cut along heading, then paragraph, then sentence boundaries — about 700 characters per chunk with 15% overlap, so a sentence is not severed from its context.',
            },
            {
              title: 'Embedding',
              text: 'Each chunk is converted into a 384- or 512-dimension vector by a small quantised transformer model running in a Web Worker. Vectors are mean-pooled and L2-normalised so similarity becomes a dot product.',
            },
            {
              title: 'Indexing',
              text: 'Chunks and vectors are written to IndexedDB in your browser profile. That means a refresh does not lose your work, and clearing site data deletes everything without leaving a copy anywhere else.',
            },
          ],
        },
        { t: 'h2', text: 'How retrieval picks the passages that matter' },
        {
          t: 'p',
          text: 'When you ask a question, the question itself is embedded with the same model, and the index is searched two ways at once. The dense vector search finds passages that mean the same thing in different words. A keyword pass using BM25 finds passages that contain the exact tokens — contract numbers, model codes, defined terms — which vector search alone often misses. The two ranked lists are merged with reciprocal rank fusion, near-duplicate passages are removed with maximal marginal relevance, and the top six passages are handed to the answering step.',
        },
        {
          t: 'table',
          caption: 'Table 1 — why two retrieval methods instead of one',
          head: ['Method', 'Finds well', 'Misses'],
          rows: [
            [
              'Vector search (embeddings)',
              'Paraphrases: “notice period” matches “termination requires prior written notification”',
              'Rare exact tokens such as “§8.2” or an internal reference code',
            ],
            [
              'Keyword search (BM25)',
              'Exact identifiers, numbers, defined terms, product names',
              'Synonyms and phrasing you did not happen to use',
            ],
            ['Combined (RRF fusion)', 'Both of the above, ranked separately then merged', 'Nothing is free — fusion can promote a weak passage from each list'],
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'Why fusion matters in practice:',
          text: 'a contract question usually contains one exact identifier (“clause 8.2”, “party B”) and one paraphrased concept (“walk away early”, “notice period”). Dense-only retrieval often ranks a semantically similar but wrong clause first; keyword-only retrieval misses the paraphrase entirely.',
        },
        { t: 'h2', text: 'How the answer is produced' },
        {
          t: 'p',
          text: 'Two tiers exist, and you choose which is active. In the default retrieval tier, no language model writes anything: the most relevant sentences are selected from the retrieved passages by coverage and similarity scoring, stitched together in their original order, and every sentence keeps a numbered link back to its source. In the optional generation tier, a small instruction-tuned model (0.5B–1.5B parameters) is downloaded and runs locally to write a fluent answer from the same retrieved passages. Either way the citations are attached before the text reaches you — the model is never asked to produce references, because models invent them.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Strictness is your call.',
          text: 'In “documents only” mode, if nothing in the corpus clears the similarity threshold, the answer is “not found in your documents” rather than a plausible guess. In “allow inference” mode the assistant may summarise across several passages, but every sentence that is not directly supported by a source is labelled as an inference.',
        },
        { t: 'h2', text: 'What actually leaves your device' },
        {
          t: 'p',
          text: 'One request, on first use, and nothing else. The table below is also what the in-app network shield displays in real time while you work.',
        },
        {
          t: 'table',
          caption: 'Table 2 — every outbound request the application makes',
          head: ['Request', 'Destination', 'Payload', 'After first use'],
          rows: [
            ['Model weights (GET)', 'A public model host (HuggingFace or a mirror)', 'The model file name only — no document, no question, no identifier', 'None; served from the browser cache, works offline'],
            ['Document parsing', 'Nowhere', 'n/a', 'No request of any kind'],
            ['Embedding and search', 'Nowhere', 'n/a', 'No request of any kind'],
            ['Answer generation', 'Nowhere', 'n/a', 'No request of any kind'],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: 'Verify it:',
          text: 'open DevTools → Network, clear the log, add a document and ask three questions. You will see the model request once. Then switch DevTools to Offline and keep asking — it still works.',
        },
        { t: 'h2', text: 'Where this approach can be wrong' },
        {
          t: 'p',
          text: 'We would rather list the failure modes than pretend they do not exist. Every one of them is visible in the interface rather than hidden behind a confident sentence.',
        },
        {
          t: 'ul',
          items: [
            'Scanned PDFs without a text layer produce no text at all. SecureRAG detects this and tells you, instead of returning an empty answer.',
            'Long documents can be split across a chunk boundary in a way that separates a definition from its exception. Raising the overlap and switching to the generation tier both help; the retrieval-quality guide covers this in detail.',
            'A small local model writes less fluent prose than a frontier cloud model. That is the trade you are making, and the comparison page states it explicitly.',
            'Mobile browsers impose stricter memory limits. Collections are capped lower on phones, and the tool says so rather than failing mid-index.',
          ],
        },
        { t: 'h2', text: 'Check it yourself in five minutes' },
        {
          t: 'ol',
          items: [
            'Open the tool and DevTools → Network in two windows side by side.',
            'Add two files you already have — one PDF, one Word document. Watch the indexing progress and the absence of requests.',
            'Ask a question whose answer you know. Click a citation marker and confirm it lands on the right paragraph.',
            'Ask something the documents cannot answer, with strictness set to “documents only”. Confirm you get “not found” rather than an invented answer.',
            'Switch DevTools to Offline and repeat step 3. Then clear site data and confirm the library is empty.',
          ],
        },
      ],
    },
    zh: {
      title: '工作原理 —— 跑在浏览器里的本地 RAG 管线',
      description:
        '逐步拆解 SecureRAG 如何在浏览器内完成解析、分块、向量化与检索，并说明到底有什么会离开你的设备（只有一个请求）。',
      h1: '一个问题是怎么被回答的，而任何数据都没有离开你的机器',
      intro:
        'SecureRAG 是一条跑在单个浏览器标签页里的检索增强生成（RAG）管线。你的文档在内存中被解析、切成片段、转成向量、在本地建立索引，并在你提问时被检索。这一页逐步说明每个环节，以及整个应用唯一会发出的那个网络请求。',
      updated: '2026-09-17',
      blocks: [
        { t: 'h2', text: '把文件拖进来的那一刻发生了什么' },
        {
          t: 'p',
          lead: true,
          text: '四个阶段依次执行，全部在你的设备上完成。每个阶段都是普通的 JavaScript，并且都会上报进度，你能看见时间花在了哪一步。',
        },
        {
          t: 'steps',
          items: [
            {
              title: '摄取',
              text: '文件经浏览器 File API 读入 ArrayBuffer。格式识别用的是魔数而不是扩展名，所以改了后缀的文件不会悄悄变成空文本。PDF 的文字层、Word 的标题层级、Markdown 的结构都会被保留下来。',
            },
            {
              title: '规范化与分块',
              text: '重复的页眉页脚会被剔除，段落内的硬换行会被重新拼接，然后按标题、段落、句子的顺序切分——每块约 700 字符、15% 重叠，保证一个句子不会和它的上下文被硬切开。',
            },
            {
              title: '向量化',
              text: '每个块由一个小型量化 Transformer 模型在 Web Worker 中转成 384 或 512 维向量。向量做均值池化并 L2 归一化，于是相似度计算就变成了点积。',
            },
            {
              title: '建索引',
              text: '文本块与向量写入你浏览器配置目录下的 IndexedDB。这意味着刷新页面不会丢失进度，而清除站点数据就能彻底删除，不会在别处留下副本。',
            },
          ],
        },
        { t: 'h2', text: '检索是怎么挑出关键段落的' },
        {
          t: 'p',
          text: '你提问时，问题本身会用同一个模型转成向量，索引同时被两条路径搜索。稠密向量检索找出“换个说法但意思相同”的段落；基于 BM25 的关键词检索找出包含完全相同词元的段落——合同编号、型号、定义术语——这类东西单靠向量检索经常漏掉。两份排序用倒数排名融合（RRF）合并，再用最大边际相关（MMR）剔除近重复段落，最后把前六段交给回答环节。',
        },
        {
          t: 'table',
          caption: '表 1 — 为什么用两种检索而不是一种',
          head: ['方法', '擅长找到', '会漏掉'],
          rows: [
            ['向量检索（嵌入）', '换说法的内容：问“通知期”能命中“解约需事先书面通知”', '少见的精确词元，如“§8.2”或内部编号'],
            ['关键词检索（BM25）', '精确标识符、数字、定义术语、产品名', '你没碰巧用到的同义词与表述'],
            ['组合（RRF 融合）', '以上两者的并集，分别排序后合并', '没有白拿的好处——融合可能把两边各一个弱段落推上来'],
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: '融合为什么在实战中重要：',
          text: '一个合同问题通常同时包含一个精确标识（“第 8.2 条”“乙方”）和一个换说法的概念（“提前退出”“通知期”）。纯向量检索经常把语义相近但条款不对的段落排在前面；纯关键词检索则完全找不到换说法的那个。',
        },
        { t: 'h2', text: '回答是怎么生成的' },
        {
          t: 'p',
          text: '有两档，由你决定启用哪一档。默认的检索档中，没有任何语言模型参与写作：系统按覆盖率与相似度从检索到的段落里挑出最相关的句子，按原文顺序拼接，每句都保留指回来源的编号引用。可选的生成档会下载一个小型指令微调模型（0.5B–1.5B 参数）在本地运行，用同样的检索段落写出通顺回答。无论哪一档，引用都在文本到达你眼前之前就已挂好——我们不会让模型自己产出引用，因为模型会编造引用。',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '严格度由你决定。',
          text: '在「仅依据文档」模式下，如果语料里没有任何段落越过相似度阈值，回答就是“文档中未找到”，而不是一个看起来合理的猜测。在「允许推理」模式下，助手可以跨多个段落归纳，但每句没有直接来源支撑的话都会被标注为推断。',
        },
        { t: 'h2', text: '到底有什么会离开你的设备' },
        {
          t: 'p',
          text: '一个请求，只在首次使用时发出，此外什么都没有。下表的内容与站内「网络盾牌」面板实时显示的完全一致。',
        },
        {
          t: 'table',
          caption: '表 2 — 应用发出的全部外发请求',
          head: ['请求', '目标', '载荷', '首次使用之后'],
          rows: [
            ['模型权重（GET）', '公开模型托管站（HuggingFace 或镜像）', '只有模型文件名——不含文档、不含问题、不含任何标识', '没有请求；由浏览器缓存提供，可离线工作'],
            ['文档解析', '哪儿都没有', '不适用', '任何请求都没有'],
            ['向量化与检索', '哪儿都没有', '不适用', '任何请求都没有'],
            ['回答生成', '哪儿都没有', '不适用', '任何请求都没有'],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: '动手验证：',
          text: '打开开发者工具 → Network，清空日志，添加一份文档并连问三个问题。你只会看到那一次模型请求。然后把 DevTools 切到 Offline 继续提问——它照常工作。',
        },
        { t: 'h2', text: '这套方案会在哪里出错' },
        {
          t: 'p',
          text: '我们更愿意把失败情形列清楚，而不是假装它们不存在。每一种都会在界面上明确提示，而不会藏在一句自信的话后面。',
        },
        {
          t: 'ul',
          items: [
            '没有文字层的扫描件 PDF 完全抽不出文本。SecureRAG 会检测到并告诉你，而不是返回一个空回答。',
            '长文档可能在分块边界处被切开，导致一个定义和它的例外条款被分开。提高重叠比例、或切换到生成档都能缓解；《提升检索准确率》那篇指南里有详细做法。',
            '本地小模型的文笔不如云端前沿模型。这就是你付出的代价，对比页里写得很直白。',
            '移动浏览器的内存限制更严。手机上文档数量上限会自动调低，工具会明确告诉你，而不是在建立索引到一半时崩掉。',
          ],
        },
        { t: 'h2', text: '五分钟内自己验一遍' },
        {
          t: 'ol',
          items: [
            '打开工具页，并另开一个窗口打开开发者工具的 Network 面板。',
            '添加两份你手边的文件——一份 PDF、一份 Word。看着索引进度走，同时注意没有任何请求发出。',
            '问一个你已知答案的问题。点一下引用编号，确认它跳到了正确的段落。',
            '把严格度设为「仅依据文档」，再问一个文档里根本答不出的问题。确认你得到的是“未找到”而不是编出来的答案。',
            '把 DevTools 切到 Offline，重复第 3 步。然后清除站点数据，确认文档库已空。',
          ],
        },
      ],
    },
  },
};
