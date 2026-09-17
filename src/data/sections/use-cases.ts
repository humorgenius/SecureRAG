import type { SectionModule } from '../pages/types';

/**
 * Use cases section: one hub page plus four workflow pages.
 * Every number here must match the rest of the site (models, limits, pipeline).
 */
export default {
  label: { en: 'Use cases', zh: '应用场景' },
  copy: {
    en: {
      title: 'Use cases — where local document Q&A fits',
      description:
        'Four workflows in a browser-local RAG tool: contracts, literature, coursework, HR and finance files — the formats, question patterns and limits of each.',
      h1: 'Four kinds of document work this tool is built for',
      intro:
        'SecureRAG answers questions across PDF, Word, Markdown and CSV files inside a single browser tab. This section covers four workflows in detail: the files involved, the questions that retrieve well, and the limits that decide whether it fits. Files never leave the device.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'Start with the workflow that looks most like yours. Each page names the file types, the question patterns that retrieve well, and the point where a different tool would serve you better.',
        },
        { t: 'h2', text: 'What all four workflows share' },
        {
          t: 'p',
          text: 'They run the same pipeline: magic-byte sniffing instead of extension guessing, parsing that keeps PDF page numbers and Word heading levels, chunking at about 700 characters with 15% overlap, local embedding in a Web Worker, an index in IndexedDB, then hybrid retrieval — vector search fused with BM25 by reciprocal rank fusion (k=60), maximal marginal relevance at λ=0.7, top-k 6. The default answer tier quotes retrieved sentences and keeps numbered citations. The optional generation tier adds a local Qwen2.5 0.5B–1.5B model at 4-bit and needs a click to confirm the download.',
        },
        {
          t: 'table',
          caption: 'Table 1 — the four workflows at a glance',
          head: ['Workflow', 'Typical library', 'A question that retrieves well', 'Where it stops'],
          rows: [
            [
              'Legal',
              '30–40 contracts, policies and filings as PDF or DOCX',
              '“Where is the notice period defined, and what triggers it?”',
              'Scanned attachments with no text layer; a human still has to read the clause',
            ],
            [
              'Research',
              'Up to 40 preprints plus CSV or JSON data appendices',
              '“Which of these papers report an ablation on the decoder depth?”',
              'Maths typeset as images; two-column PDFs where reading order occasionally breaks',
            ],
            [
              'Students',
              'Lecture PDFs, textbook chapters, past papers, your own notes',
              '“Which definition from week 3 does question 2 of the 2024 paper test?”',
              'Anything your course says you must do unaided',
            ],
            [
              'HR and finance',
              'Handbook, expense policy, vendor contracts, invoices exported to CSV',
              '“What receipt does a taxi claim of 800 CNY require?”',
              '200 MB per library; spreadsheets that were never exported to CSV',
            ],
          ],
        },
        { t: 'h2', text: 'The limits that decide whether a workflow fits' },
        {
          t: 'table',
          caption: 'Table 2 — hard limits, and what they mean in practice',
          head: ['Limit', 'Value', 'When you actually hit it'],
          rows: [
            ['Single file', '≤25 MB', 'Rarely binds on text PDFs (a 300-page document is often 3–8 MB); image-heavy PDFs reach it quickly'],
            ['Documents per library', '≤40', 'A term of coursework or a 40-paper screen fits; a 200-paper review does not, so split it'],
            ['Total per library', '≤200 MB', 'Roughly 30–40 mid-sized PDFs; scans consume this budget fastest'],
            [
              'Chunks per library',
              '≤20,000',
              'At about 700 characters per chunk that is roughly 14 million characters, so the size cap usually arrives first',
            ],
            [
              'First model download',
              '≈23 MB all-MiniLM-L6-v2 (English), ≈25 MB bge-small-zh-v1.5 (Chinese), ≈120 MB multilingual-e5-small (mixed)',
              'One request carrying the file name only, then cached and offline',
            ],
            [
              'Optional generation model',
              '400 MB – 1.0 GB, click to confirm',
              'Qwen2.5 0.5B–1.5B at 4-bit; WebGPU through WebLLM, otherwise CPU at about 3–8 tokens per second',
            ],
          ],
        },
        { t: 'h2', text: 'Which tier a workflow usually needs' },
        {
          t: 'ul',
          items: [
            'Contract and policy work is mostly “find the exact clause”, which the default retrieval tier already does: it quotes the retrieved sentences and keeps numbered citations.',
            'Literature screening gains from the generation tier when you want a paragraph stitched from several passages. Without WebGPU, expect a few tokens per second on CPU.',
            'Coursework rarely needs the generation model. The questions are usually “where is this stated”, and a quoted passage with a slide number is what you study from.',
            'Mixed Chinese and English libraries are the case for multilingual-e5-small at about 120 MB, instead of two separate single-language models.',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'Fixed wording, not marketing:',
          text: 'Files never leave the device. No account, no tracking pixels. Not used for training. Works offline once cached. The only outbound request the application ever makes is the first GET for model weights, and the payload is the file name and nothing else.',
        },
        { t: 'h2', text: 'When none of these pages fits' },
        {
          t: 'ul',
          items: [
            'You need one shared, permissioned library for a team. There is no backend and no shared index: each person imports their own copies, and the index lives in that person’s browser profile.',
            'Your corpus is larger than 40 files or 200 MB and cannot be split into batches.',
            'The material is image-only scans and you have no OCR step before import.',
            'You need automatic arithmetic across many documents, or an audit log of who read what. Nothing is logged anywhere.',
            'The answer would be relied on without anyone reading the cited passage. Retrieval returns passages, not verified findings.',
          ],
        },
        { t: 'h2', text: 'Three steps to test it on your own files' },
        {
          t: 'ol',
          items: [
            'Open the tool with DevTools → Network in a second window, and clear the log.',
            'Add two files you already have on disk — one PDF, one DOCX — and watch the indexing progress with no requests appearing.',
            'Ask a question whose answer you know, click the citation marker, and switch DevTools to Offline to confirm the answers keep coming.',
          ],
        },
      ],
    },
    zh: {
      title: '应用场景 —— 本地文档问答适合哪些活儿',
      description:
        '四类能在浏览器本地完成的文档工作：合同与卷宗、论文与数据附录、课程材料、人事与财务文件。每页写清支持哪些文件类型、哪些提问方式能检索到内容、上限在哪里，以及什么情况下该换别的工具。',
      h1: '这个工具是为哪四种文档工作准备的',
      intro:
        'SecureRAG 在单个浏览器标签页里，对 PDF、Word、Markdown、CSV 等文件回答问题。这一栏目把四类用法写细：会碰到什么文件、哪些提问能检索到东西、以及什么时候该换别的工具。文件永不离开你的设备。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '先挑一页和你手上活儿最像的看。每页都会写明文件类型、能检索到内容的提问方式，以及在哪一步它就不再是最合适的工具。',
        },
        { t: 'h2', text: '四种用法的共同点' },
        {
          t: 'p',
          text: '它们跑的是同一条管线：用魔数嗅探而不是看扩展名，解析时保留 PDF 页码与 Word 标题层级，按约 700 字符、15% 重叠切块，在 Web Worker 里本地向量化，索引写进 IndexedDB，再做混合检索——向量检索与 BM25 用 RRF（k=60）融合，MMR 取 λ=0.7，返回前 6 段。默认回答档直接摘取检索到的原句并保留编号引用。可选的生成档会加载本地 Qwen2.5 0.5B–1.5B（4-bit），下载前需要你点一次确认。',
        },
        {
          t: 'table',
          caption: '表 1 — 四类用法一览',
          head: ['用法', '典型的文件库', '好用的提问', '在哪里失效'],
          rows: [
            [
              '法律',
              '30–40 份合同、制度、诉讼文书，PDF 或 DOCX',
              '“通知期是在哪一条定义的？触发条件是什么？”',
              '没有文字层的扫描附件；条款最终仍要人来读',
            ],
            [
              '科研',
              '最多 40 篇预印本，外加 CSV 或 JSON 数据附录',
              '“这些论文里，哪几篇对解码器层数做了消融实验？”',
              '公式是图片；双栏 PDF 偶发阅读顺序错乱',
            ],
            [
              '学生',
              '课堂讲义 PDF、教材章节、历年真题、自己的笔记',
              '“2024 年那份卷子的第 2 题考的是第 3 周的哪个定义？”',
              '课程规定必须独立完成的环节',
            ],
            [
              '人事与财务',
              '员工手册、报销制度、供应商合同、导出成 CSV 的发票',
              '“打车 800 元要什么凭证？”',
              '单库 200MB 上限；没导出成 CSV 的表格',
            ],
          ],
        },
        { t: 'h2', text: '决定这套方案能不能用的几个上限' },
        {
          t: 'table',
          caption: '表 2 — 硬上限，以及实际会怎么撞上',
          head: ['上限', '数值', '实际什么时候会撞到'],
          rows: [
            ['单个文件', '≤25MB', '纯文字 PDF 很少撞到（300 页常常只有 3–8MB）；图片多的 PDF 很容易顶到'],
            ['单库文件数', '≤40 份', '一个学期的课程材料、一次 40 篇的初筛装得下；200 篇的综述装不下，得分批'],
            ['单库总量', '≤200MB', '大约 30–40 份中等体量的 PDF；扫描件最耗这个额度'],
            ['单库块数', '≤20,000', '按每块约 700 字符算，约合 1400 万字符，所以通常先撞到体积上限'],
            [
              '首次模型下载',
              'all-MiniLM-L6-v2 约 23MB（英文）、bge-small-zh-v1.5 约 25MB（中文）、multilingual-e5-small 约 120MB（中英混排）',
              '只发一个请求，载荷只有模型文件名，之后走缓存、可离线',
            ],
            [
              '可选生成档',
              '400MB–1.0GB，需点击确认',
              'Qwen2.5 0.5B–1.5B（4-bit）；有 WebGPU 走 WebLLM，否则 CPU 约 3–8 token/s',
            ],
          ],
        },
        { t: 'h2', text: '哪类活儿通常需要哪一档' },
        {
          t: 'ul',
          items: [
            '合同与制度类的活儿多半是「找出准确的那一条」，默认的抽取档就够：它摘取原句并保留编号引用，不写一个字。',
            '文献初筛在需要跨段落串成一段话时，生成档更省事。没有 WebGPU 时，CPU 上每秒只有几个 token，长答案要等。',
            '课程材料基本不需要生成档。问题多是「这句话出自哪里」，带页码或幻灯片号的原文才是你要复习的东西。',
            '中英混排的资料用 multilingual-e5-small（约 120MB）更合适，比装两个单语模型省事。',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: '固定措辞，不是宣传语：',
          text: '文件永不离开你的设备。无账号、无追踪像素。不用于训练。缓存后可离线。整个应用唯一的外发请求是首次拉取模型权重，载荷只有文件名，没有别的。',
        },
        { t: 'h2', text: '这几页都用不上的情况' },
        {
          t: 'ul',
          items: [
            '需要一个团队共用、带权限的文档库。这里没有后端也没有共享索引：每个人导入自己的副本，索引存在各自的浏览器配置里。',
            '资料超过 40 份或 200MB，而且没法分批。',
            '素材全是没有文字层的扫描件，手头也没有 OCR 环节。',
            '需要跨大量文档自动算数，或者需要「谁看过什么」的审计日志。这里什么都不记录。',
            '答案会被直接采信，而没有人去读引用的那一段。检索返回的是段落，不是核对过的结论。',
          ],
        },
        { t: 'h2', text: '拿自己的文件试三步' },
        {
          t: 'ol',
          items: [
            '打开工具页，另开一个窗口打开开发者工具的 Network 面板并清空日志。',
            '添加两份你电脑上已有的文件——一份 PDF、一份 DOCX——看着索引进度走，同时确认没有任何请求发出。',
            '问一个你已知答案的问题，点一下引用编号跳转；再把 DevTools 切到 Offline，确认回答照常给出。',
          ],
        },
      ],
    },
  },
  items: [
    {
      slug: 'legal',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/guides/private-document-qa/', labelEn: 'Private document Q&A', labelZh: '不上传的文档问答' },
        { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
        { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
      ],
      copy: {
        en: {
          title: 'Contract and case-file Q&A that stays on your machine',
          description:
            'Contract review, clause comparison and interrogation in a browser-local tool: formats, question patterns, retrieval limits, and when to use something else.',
          h1: 'Reading a contract without sending it to a server',
          intro:
            'SecureRAG lets a lawyer, paralegal or compliance analyst ask questions across up to 40 PDF or DOCX files at once, with parsing, embedding and search all running in the browser. Files never leave the device. This page lists the formats that work, the questions that retrieve well, and the cases where a local tool is the wrong choice.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'Contract questions come in two kinds: find an exact identifier, or find a passage that says the same thing in different words. This pipeline searches for both at once, which is why vector ranking and BM25 run side by side and get fused rather than chosen between.',
            },
            { t: 'h2', text: 'What a legal working set looks like' },
            {
              t: 'p',
              text: 'A typical set is 30–40 files: the agreement under review, its annexes, the internal policy it has to fit, and the template it was drafted from. All of it is small enough that the 40-file cap is the first limit you meet, not the 200 MB one.',
            },
            {
              t: 'table',
              caption: 'Table 1 — what each format gives back',
              head: ['Format', 'Typical size', 'What parsing preserves', 'What it loses'],
              rows: [
                ['PDF with a text layer', '1–12 MB for 20–300 pages', 'Page numbers on every chunk, so a citation reads “page 14”', 'Table grid structure collapses into a stream of cells'],
                ['DOCX', '80 KB – 2 MB', 'Heading levels, so Clause 8.2 keeps its nesting', 'Comments and tracked changes are ignored'],
                ['Markdown or TXT', 'Under 1 MB', 'Heading and line structure', 'n/a'],
                ['CSV or JSON', 'Under 25 MB', 'Row boundaries, so a question can target a column', 'n/a'],
                ['Image-only scanned PDF', 'Any size', 'Nothing — the file is detected and reported', 'The entire document until you run OCR elsewhere'],
              ],
            },
            { t: 'h2', text: 'Questions that retrieve well, and why' },
            {
              t: 'p',
              text: 'A question that pairs one exact token with one paraphrase engages both rankers. A question that needs arithmetic across three documents does not: retrieval returns passages, and the optional generation step is a 0.5B–1.5B local model with a limited context window.',
            },
            {
              t: 'ol',
              items: [
                '“Where is the notice period defined?” — the defined term is an exact-token match, the paraphrase is a vector match.',
                '“Which clauses let the supplier raise prices, and under what conditions?” — returns the clause plus its carve-outs, which is where the 15% chunk overlap earns its keep.',
                '“Show every mention of clause 8.2.” — exact-token question; keyword ranking does the work and the citations carry page numbers.',
                '“Compare the liability cap in these four contracts.” — returns four passages with file and page references, and you do the comparing.',
                '“Which agreements expire in the next 90 days?” — works when dates are written as text; a date inside a scanned stamp is invisible.',
                '“Who signed, and on what date?” — signature blocks are plain text in most DOCX and text-layer PDF files, so this usually resolves.',
              ],
            },
            { t: 'h2', text: 'A 40-minute pass over one supply agreement' },
            {
              t: 'steps',
              items: [
                {
                  title: 'Load the agreement with its annexes',
                  text: 'Drop the main agreement PDF, the pricing annex PDF and the service-level annex DOCX into one library. Three files index in well under a minute on a laptop; no GPU is involved at this stage.',
                },
                {
                  title: 'Ask for the definition first',
                  text: 'Question: “What does Effective Date mean in this agreement?” The definitions clause repeats the term densely, so it outranks the places where the phrase is merely used.',
                },
                {
                  title: 'Walk the obligations one at a time',
                  text: 'Delivery windows, price adjustment, exclusivity, termination triggers — one question each. Numbered citations let you click straight to the page and nearby paragraph.',
                },
                {
                  title: 'Hunt the exception',
                  text: 'Exceptions usually sit in the sentence after the rule, which is exactly where a chunk boundary can cut. Raise the overlap in settings, or ask for the passage following the one you were shown.',
                },
                {
                  title: 'Read the citations you did not click',
                  text: 'Retrieval surfaces the passages it ranked highest, which is not the same set as the passages that matter to the deal.',
                },
                {
                  title: 'Leave a trace',
                  text: 'Export the question list with its citations to Markdown or CSV so the same reading can be repeated later. The index itself stays in this browser profile and disappears when site data is cleared.',
                },
              ],
            },
            { t: 'h2', text: 'Where retrieval will let you down' },
            {
              t: 'table',
              caption: 'Table 2 — failure modes you can predict',
              head: ['Symptom', 'Cause', 'What to do instead'],
              rows: [
                ['A clause you know exists never appears', 'The annex is a scan with no text layer', 'Run OCR first, then import the text version'],
                ['Numbers land in the wrong column', 'The PDF table was flattened into reading order', 'Ask for the page number and read the table by eye'],
                ['A defined term resolves to the wrong place', 'The term is defined once and reused forty times', 'Ask for “the clause that defines X”, not for X'],
                ['A cross-reference misleads', '“Subject to clause 12” is quoted without clause 12', 'Ask for clause 12 by number — an exact-token match'],
                ['A long answer is partly wrong', 'The generation tier inferred across passages', 'Switch back to the default retrieval tier for a quoted-only answer'],
              ],
            },
            { t: 'h2', text: 'When this is not the right approach' },
            {
              t: 'ul',
              items: [
                'The analysis has to be reviewable by someone else inside a shared system. There is no backend and no shared index: each person imports their own copies, into their own browser profile.',
                'The document set runs past 40 files or 200 MB. Split it by matter, or use a repository built for scale.',
                'The key documents are scans without a text layer. Without OCR the file yields no text at all, and the parser reports it rather than indexing emptiness.',
                'You need a record of who read what. Nothing is logged anywhere, which is the privacy property and a problem for chain-of-custody requirements.',
                'The output would be relied on without anyone reading the cited passage. Nothing here checks whether a quoted clause is still in force, or whether the governing law is the one your client assumes.',
                'You need the tool to reach a conclusion about the documents. It retrieves and quotes; the judgement stays with a person.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'Scope of this page:',
              text: 'It describes how a retrieval tool behaves on document sets. It is not legal advice, and no configuration of SecureRAG makes a process compliant with any regulation. Whether a given matter may be worked on in a browser under your firm’s rules is a decision for your firm.',
            },
            { t: 'h2', text: 'Data handling, stated plainly' },
            {
              t: 'ul',
              items: [
                'Files never leave the device. Parsing, chunking, embedding and search all run in the tab.',
                'No account, no tracking pixels. There is no login and nothing to attribute a document to.',
                'Not used for training. There is no service on the other side receiving text.',
                'Works offline once cached. The single outbound request is the first GET for model weights, and its payload is the file name.',
                'Clearing site data in the browser deletes the index, the chunks and the vectors. There is no copy elsewhere to delete.',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Can SecureRAG read scanned contracts?',
                  a: 'Only if the PDF carries a text layer. Image-only pages produce no text, and the parser reports the file instead of indexing an empty document.',
                },
                {
                  q: 'Is the contract sent anywhere for embedding?',
                  a: 'No. Embedding runs in a Web Worker on your machine using a model of about 25 MB for Chinese (bge-small-zh-v1.5), about 23 MB for English (all-MiniLM-L6-v2), or about 120 MB for mixed-language sets (multilingual-e5-small). The one outbound request is the first download of those weights.',
                },
                {
                  q: 'How many contracts fit in one library?',
                  a: 'Forty files, 25 MB each, 200 MB in total, 20,000 chunks. Contracts are small, so the file count is normally the limit you reach first.',
                },
                {
                  q: 'Can two people share one index?',
                  a: 'No. The index lives in IndexedDB inside one browser profile. Sharing means exporting answers with citations, or each person importing their own copies of the same files.',
                },
                {
                  q: 'Is a generated summary safe to put in a file?',
                  a: 'Treat it as a search result, not a checked one. The optional generation tier runs a 0.5B–1.5B model at 4-bit on your device and citations are attached from the retrieved passages, but each sentence still needs to be read against the source before it becomes work product.',
                },
              ],
            },
            {
              t: 'callout',
              kind: 'info',
              title: 'If you try one thing:',
              text: 'Open the tool, add three files already on your disk, and ask for a clause you know by heart. Click the citation marker and check that it lands where you expect. That minute tells you more than any description of the pipeline.',
            },
          ],
        },
        zh: {
          title: '合同与卷宗问答，全程留在你自己的机器上',
          description:
            '在浏览器本地做合同审阅、条款比对和案卷检索：支持哪些格式、引用里是否带页码、哪些提问方式检索得到、会在哪里失效，以及什么时候本地工具就是选错了。',
          h1: '不用把合同发给服务器，也能把它问一遍',
          intro:
            '律师、律师助理或合规人员可以一次对最多 40 份 PDF 或 DOCX 提问，解析、向量化、检索全部在浏览器里完成。文件永不离开你的设备。这一页写明哪些格式靠得住、哪些提问能检索到内容，以及什么时候本地工具就是选错了。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '合同类问题分两种：找精确的标识，或者找一段换个说法讲同一件事的原文。这套检索同时做这两件事，所以向量排序和 BM25 是并行跑完再融合，而不是二选一。',
            },
            { t: 'h2', text: '法律工作里的文件库长什么样' },
            {
              t: 'p',
              text: '典型体量是 30–40 份：待审的合同、它的附件、它必须符合的内部制度，以及它起草时参照的模板。这些文件都不大，所以你会先撞到 40 份的数量上限，而不是 200MB 的体积上限。',
            },
            {
              t: 'table',
              caption: '表 1 — 各种格式解析后会剩下什么',
              head: ['格式', '常见体量', '解析保留什么', '会丢掉什么'],
              rows: [
                ['有文字层的 PDF', '20–300 页，1–12MB', '每个文本块都带页码，引用能写成「第 14 页」', '表格的网格结构会塌成一段单元格文字'],
                ['DOCX', '80KB–2MB', '标题层级，第 8.2 条能保持它的归属', '批注和修订痕迹不参与解析'],
                ['Markdown 或 TXT', '1MB 以下', '标题与行结构', '不适用'],
                ['CSV 或 JSON', '25MB 以下', '行边界，提问可以针对某一列', '不适用'],
                ['纯图片扫描 PDF', '不限', '什么都不保留——系统会识别并报出来', '在你另做 OCR 之前，整份文件都用不上'],
              ],
            },
            { t: 'h2', text: '哪些提问检索得到，以及为什么' },
            {
              t: 'p',
              text: '一个问题里同时出现一个精确词元和一个换说法的概念，两路排序就都被激活了。需要跨三份文件做算术的问题则不行：检索返回的是段落，可选的生成环节只是本地 0.5B–1.5B 模型，上下文窗口有限。',
            },
            {
              t: 'ol',
              items: [
                '“通知期是在哪一条定义的？”——定义术语是精确词元命中，换说法的部分靠向量命中。',
                '“哪些条款允许供应商涨价？条件是什么？”——会把条款和它的例外一起找出来，15% 的分块重叠就是在这儿起作用。',
                '“把所有提到第 8.2 条的地方列出来。”——精确词元问题，关键词排序负责，引用里带页码。',
                '“这四份合同的赔偿上限分别是多少？”——返回四段原文，各自带文件名和页码，比较由你来做。',
                '“哪些协议在 90 天内到期？”——日期以文字写出时可行；盖在扫描件印章里的日期看不到。',
                '“谁签的？哪天签的？”——签署块在多数 DOCX 和有文字层的 PDF 里就是纯文本，通常能答上来。',
              ],
            },
            { t: 'h2', text: '用 40 分钟把一份供货合同过一遍' },
            {
              t: 'steps',
              items: [
                {
                  title: '把主合同和附件一起导入',
                  text: '供货合同正文 PDF、价格附件 PDF、服务级别附件 DOCX 放进同一个库。三份文件在笔记本上不到一分钟就建完索引，这一步用不到显卡。',
                },
                {
                  title: '先问定义',
                  text: '提问：「生效日在合同里是怎么定义的？」定义条款里这个术语反复出现，密度高，排序会排在那些只是顺带用到它的段落前面。',
                },
                {
                  title: '义务一条一条问',
                  text: '交付窗口、调价机制、独家条款、解约触发条件——一个问题问一条。答案里的编号引用可以直接点到对应页码和附近的段落。',
                },
                {
                  title: '找例外',
                  text: '例外条款通常紧跟在规则后面那句，这正是分块边界容易切开的位置。可以在设置里调高重叠，或者直接追问「上一条后面的那段」。',
                },
                {
                  title: '把没点开的引用也读一遍',
                  text: '检索浮上来的是它认为排序最高的段落，和这单交易真正关键的段落不是同一个集合。',
                },
                {
                  title: '留一份记录',
                  text: '把问题清单连同引用导出成 Markdown 或 CSV，以后可以照着重走一遍。索引本身留在当前浏览器配置里，清除站点数据即消失。',
                },
              ],
            },
            { t: 'h2', text: '检索会在哪些地方掉链子' },
            {
              t: 'table',
              caption: '表 2 — 可以提前预判的失败情况',
              head: ['现象', '原因', '该怎么办'],
              rows: [
                ['明知道存在的条款怎么都搜不到', '那份附件是扫描件，没有文字层', '先做 OCR，再导入文字版'],
                ['金额落到了错误的列', 'PDF 表格被压成了阅读顺序的文字流', '直接问页码，用眼睛读表'],
                ['定义术语指到了错的地方', '这个术语只定义了一次，后面被重复使用四十次', '问「定义 X 的那一条」，而不是问 X'],
                ['交叉引用把人带偏', '引到「依第 12 条」却没带出第 12 条原文', '按条号直接问第 12 条，这是精确词元命中'],
                ['长答案有一部分是错的', '生成档跨段落做了推断', '切回默认的抽取档，只要引用原文的回答'],
              ],
            },
            { t: 'h2', text: '这个方案不适合你的时候' },
            {
              t: 'ul',
              items: [
                '分析结果需要别人在共享系统里复核。这里没有后端也没有共享索引：每个人只能把文件导入自己的浏览器配置。',
                '文件数量超过 40 份或总量超过 200MB。按事项拆开，或者改用为规模设计的文档库。',
                '关键文件是没有文字层的扫描件。没有 OCR 就一点文字都抽不出来，系统会直接报出这份文件，而不是建一个空索引。',
                '需要留下「谁看过什么」的记录。这里什么都不记录，这正是隐私上的优点，也是保管链要求下的缺点。',
                '答案会被直接采信，没有人去读那段被引用的原文。这里不核对被引条款是否仍然有效，也不判断适用法律是否就是客户以为的那部。',
                '你希望工具直接对文件下结论。它负责检索和引用原文，判断留在人这边。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '本页的范围：',
              text: '这一页讲的是一个检索工具处理文档时的行为。它不是法律意见，任何 SecureRAG 配置也不会让某个流程符合任何法规。某个案子能不能在浏览器里处理，要由你所在的机构按自己的规则决定。',
            },
            { t: 'h2', text: '数据处理，直说' },
            {
              t: 'ul',
              items: [
                '文件永不离开你的设备。解析、分块、向量化、检索都在标签页里完成。',
                '无账号、无追踪像素。没有登录，也就没有把文档和某个人对应起来的可能。',
                '不用于训练。另一端没有任何服务在接收文本。',
                '缓存后可离线。唯一的外发请求是首次拉取模型权重，载荷只有文件名。',
                '在浏览器里清除站点数据，索引、文本块和向量就一起删掉了，不会在别处留副本。',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: '扫描版合同能读吗？',
                  a: '只有带文字层才行。纯图片页抽不出任何文字，解析器会把这份文件报出来，而不是建一个空文档。',
                },
                {
                  q: '合同会被发去别处做向量化吗？',
                  a: '不会。向量化在你的机器上由 Web Worker 完成：中文用 bge-small-zh-v1.5（约 25MB），英文用 all-MiniLM-L6-v2（约 23MB），中英混排用 multilingual-e5-small（约 120MB）。唯一的外发请求就是第一次下载这些权重。',
                },
                {
                  q: '一个库里能放多少份合同？',
                  a: '40 份文件、单份不超过 25MB、总量不超过 200MB、不超过 20,000 个文本块。合同文件通常很小，所以实际先撞到的是份数上限。',
                },
                {
                  q: '两个人能共用一个索引吗？',
                  a: '不能。索引存在某一个浏览器配置的 IndexedDB 里。要「共享」，只能导出带引用的问答记录，或者各自导入同一批文件。',
                },
                {
                  q: '生成的摘要能直接放进案卷吗？',
                  a: '把它当成一条检索结果，而不是核对过的结论。可选的生成档在本地跑 0.5B–1.5B（4-bit）模型，引用是从检索到的段落挂上去的，但每一句在成为工作成果之前，仍然要对着原文读一遍。',
                },
              ],
            },
            {
              t: 'callout',
              kind: 'info',
              title: '如果只试一件事：',
              text: '打开工具，加三份你电脑上已有的文件，问一条你背得下来的条款。点一下引用编号，看它是不是落在你预期的位置。这一分钟比任何对管线的描述都有用。',
            },
          ],
        },
      },
    },
    {
      slug: 'research',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/guides/improve-retrieval-quality/', labelEn: 'Improve retrieval quality', labelZh: '提升检索准确率' },
        { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '工作原理' },
        { path: '/glossary/', labelEn: 'Glossary of terms', labelZh: '术语表' },
      ],
      copy: {
        en: {
          title: 'Literature Q&A across 40 PDFs, entirely offline',
          description:
            'A local literature-review workflow: what parses well in preprint PDFs, how to batch the 40-document cap, which questions retrieve, and the academic limits.',
          h1: 'Screening papers without uploading them',
          intro:
            'A researcher can ask questions across up to 40 PDFs at once without sending a single file anywhere: parsing, embedding and search run in the browser tab. This page covers what the parser does with preprint PDFs, how to split a larger screen into batches, and where a small local model stops being enough.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'The useful unit here is a folder you already curate, not a whole database. Forty PDFs at about 700 characters per chunk is a few thousand chunks, which embeds in about a minute on a laptop and stays searchable after the tab goes offline.',
            },
            { t: 'h2', text: 'What the parser keeps from a preprint' },
            {
              t: 'table',
              caption: 'Table 1 — preprint PDFs, assessed without optimism',
              head: ['Element', 'What comes through', 'What you do about it'],
              rows: [
                ['Single-column body text', 'In order, with page numbers on every chunk', 'Nothing — a citation reads “page 6”'],
                ['Two-column layout', 'Usually correct, with occasional column bleed', 'Skim the cited passage before quoting it'],
                ['Inline maths symbols', 'Partial: simple symbols survive as text', 'Read the derivation in the source PDF'],
                ['Equations rendered as images', 'Nothing', 'Screenshot the equation yourself'],
                ['Tables', 'Cell text in reading order, without the grid', 'Ask for the page and read the table in the PDF'],
                ['Reference list', 'Plain text, so author names are searchable', 'Useful for “which paper cites X” questions'],
                ['Supplementary CSV', 'Parsed row-wise, so a question can target a column', 'Import it alongside the PDF'],
              ],
            },
            { t: 'h2', text: 'Questions a literature pass answers well' },
            {
              t: 'ol',
              items: [
                '“Which of these papers train on fewer than 10,000 examples?” — works when the number is written out in the text.',
                '“Where does this paper state its main limitation?” — limitation paragraphs reuse the paper’s own vocabulary, so they rank high.',
                '“Which papers compare against the same baseline?” — an exact-token match on the baseline name, which vector search alone tends to smear.',
                '“What evaluation metrics appear across this set?” — returns the metric mentions with file and page; you assemble the table.',
                '“Is there any mention of a replication study?” — with strictness set to documents only, an empty result is itself a usable finding.',
              ],
            },
            { t: 'h2', text: 'Splitting a 200-paper screen into batches' },
            {
              t: 'steps',
              items: [
                {
                  title: 'Group by sub-topic instead of alphabetically',
                  text: 'Forty papers that share vocabulary retrieve far better than forty unrelated titles, because a question about a baseline gets real competition among neighbours.',
                },
                {
                  title: 'Name your batches in your own notes',
                  text: 'One library lives per browser profile. Keeping “topic-a”, “topic-b” and “methods” as separate passes means a question is scoped by whatever you loaded, so track which pass you are in.',
                },
                {
                  title: 'Export before you clear',
                  text: 'Save the question list and citation sets to CSV or Markdown before clearing site data to make room for the next forty. The export is plain text and stays readable.',
                },
                {
                  title: 'Re-check every claim at the PDF',
                  text: 'Each retrieved passage carries a file name and a page number. Verify there, not at the summary paragraph.',
                },
              ],
            },
            { t: 'h2', text: 'Where a local model is not enough' },
            {
              t: 'ul',
              items: [
                'Cross-paper synthesis. The generation tier runs a 0.5B–1.5B model at 4-bit on your device. It can stitch three retrieved passages into a sentence; it cannot hold a 200-paper field in view.',
                'Non-text evidence. A result expressed only as a figure, an image-based equation or a colour heat map is invisible to a text pipeline.',
                'Scan-only material. Older scanned journals without an OCR layer produce no text, and the parser says so instead of indexing nothing.',
                'Mathematical verification. The tool finds where a proof is written. It does not check the proof.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'On authorship:',
              text: 'The generation tier is a reading aid. Using it to produce text you submit as your own, or to paraphrase sources without attribution, is a matter for your institution’s rules — running locally does not change how the work is judged.',
            },
            { t: 'h2', text: 'When this is not the right approach' },
            {
              t: 'ul',
              items: [
                'You need to search a field, not a folder. There is no remote corpus: only the files you imported are searchable.',
                'Two collaborators must query the same live index. The index lives in one browser profile and is never synchronised.',
                'The screening set is bigger than 40 files or 200 MB and cannot be meaningfully split by topic.',
                'The evidence you need is in figures, scanned pages or typeset maths.',
                'You need a reviewable, timestamped log of what was searched. Nothing is logged, by design.',
                'The question demands arithmetic over many papers, such as pooling sample sizes. Retrieval returns passages; the summing is yours.',
              ],
            },
            { t: 'h2', text: 'Models, offline use and what leaves the machine' },
            {
              t: 'ul',
              items: [
                'English libraries: all-MiniLM-L6-v2 at about 23 MB. Chinese libraries: bge-small-zh-v1.5 at about 25 MB. Mixed-language sets: multilingual-e5-small at about 120 MB.',
                'The optional generation tier downloads Qwen2.5 0.5B–1.5B at 4-bit, 400 MB to 1.0 GB, and only after you click to confirm.',
                'One outbound request ever: the first GET for model weights, carrying the file name. Afterwards the tool works offline.',
                'No account and no tracking pixels, so there is nothing to attach a half-finished review to.',
                'Per-library ceiling: 40 files, 25 MB each, 200 MB total, 20,000 chunks.',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Can I search my whole reference manager at once?',
                  a: 'Not through this tool. A library holds at most 40 files, so a full corpus has to be worked in batches you define.',
                },
                {
                  q: 'Does it handle LaTeX source or arXiv HTML?',
                  a: 'HTML and plain text are supported formats, so an arXiv HTML export is parsed. LaTeX source is plain text too, but macro-heavy files produce noisy chunks.',
                },
                {
                  q: 'Will it extract a numbers table across papers?',
                  a: 'It will retrieve each mention with its page, and the optional generation tier can arrange them into a list. The numbers themselves should be transcribed by you; a small local model misreads digits more often than it misreads prose.',
                },
                {
                  q: 'What happens with two-column PDFs?',
                  a: 'Reading order is usually right but not guaranteed. When a citation looks scrambled, check the passage in the PDF before quoting; the page number in the citation makes that quick.',
                },
                {
                  q: 'Can I use it on a machine with no GPU?',
                  a: 'Yes. Embedding and retrieval are CPU work. Only the optional generation tier benefits from WebGPU through WebLLM; on CPU expect roughly 3–8 tokens per second.',
                },
              ],
            },
          ],
        },
        zh: {
          title: '40 篇 PDF 的文献问答，全程离线',
          description:
            '本地文献阅读流程：预印本 PDF 里哪些内容解析得住、超过 40 份的初筛怎么分批、哪些提问能检索到原文，以及在学术上必须守住的边界。',
          h1: '不把论文传出去，也能把它们筛一遍',
          intro:
            '研究者可以一次对最多 40 份 PDF 提问，不用把任何文件发出去：解析、向量化、检索都跑在浏览器标签页里。这一页讲解析器对预印本 PDF 的实际表现、超过 40 篇的综述怎么分批，以及本地小模型在哪里就不够用了。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '这里好用的单位是你自己整理过的一个文件夹，而不是整个数据库。40 份 PDF、每块约 700 字符，算下来几千个块，在笔记本上向量化大约一分钟，之后断网也能继续检索。',
            },
            { t: 'h2', text: '解析器能从预印本里留下什么' },
            {
              t: 'table',
              caption: '表 1 — 预印本 PDF 的真实表现',
              head: ['元素', '能拿到什么', '你该怎么办'],
              rows: [
                ['单栏正文', '顺序正确，每块都带页码', '不用处理，引用直接写「第 6 页」'],
                ['双栏排版', '多数正确，偶尔出现跨栏串行', '引用前把那段在 PDF 里看一眼'],
                ['行内数学符号', '部分保留：简单符号会变成文字', '推导过程回原始 PDF 读'],
                ['公式以图片形式嵌入', '什么都没有', '自己截图保存'],
                ['表格', '单元格文字按阅读顺序排，网格丢失', '问页码，然后在 PDF 里读表'],
                ['参考文献表', '纯文本，作者名可被检索', '适合「哪篇引用了 X」这类问题'],
                ['补充材料 CSV', '按行解析，提问可以针对某一列', '和 PDF 一起导入'],
              ],
            },
            { t: 'h2', text: '什么样的提问能检索到内容' },
            {
              t: 'ol',
              items: [
                '“这些论文里，哪几篇的训练样本少于 1 万？”——前提是这个数字在正文里写出来了。',
                '“这篇论文在哪一段说明它的主要局限？”——局限段落大量复用自己的术语，排序会靠前。',
                '“哪几篇用了同一个基线做对比？”——基线名是精确词元命中，单靠向量检索容易把不同基线混在一起。',
                '“这批论文里出现了哪些评价指标？”——会把每处提法和文件、页码一起返回，汇总表由你来拼。',
                '“有没有提到复现研究？”——把严格度设为「仅依据文档」时，返回空本身就是有用的结论。',
              ],
            },
            { t: 'h2', text: '把 200 篇的初筛拆成几批' },
            {
              t: 'steps',
              items: [
                {
                  title: '按子主题分组，不要按字母序',
                  text: '术语相同、能互相竞争的 40 篇，检索效果远好于 40 个彼此无关的标题：问基线时，排序里才有真正的候选互相比较。',
                },
                {
                  title: '在自己的笔记里给每批起名',
                  text: '一个浏览器配置对应一个库。「主题 A」「主题 B」「方法」分开跑，等于用「导入了什么」给提问划范围，所以要记清当前在哪一批。',
                },
                {
                  title: '腾地方之前先导出',
                  text: '在清除站点数据、为下一批让位之前，把问题清单和引用集合导出成 CSV 或 Markdown。导出的是纯文本，以后仍然可读。',
                },
                {
                  title: '每条结论都回 PDF 核对',
                  text: '每个检索到的段落都带文件名和页码。核对要在那里做，而不是对着那段总结做。',
                },
              ],
            },
            { t: 'h2', text: '本地小模型不够用的地方' },
            {
              t: 'ul',
              items: [
                '跨论文综合。生成档在你的设备上跑 0.5B–1.5B（4-bit）模型，能把检索到的三段拼成一句话，但装不下一个两百篇的领域。',
                '非文字证据。只存在于图、图片公式或热力配色里的结论，文字管线看不见。',
                '只能扫描的资料。老期刊没有 OCR 层就抽不出文字，解析器会直接告诉你，而不是建一个空索引。',
                '数学验算。工具能帮你找到证明写在哪一页，不会去验证这个证明。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '关于署名：',
              text: '生成档是阅读辅助。用它产出你署名提交的文字，或者不加出处地改写别人的表达，都属于你所在机构的规则范围——在本地运行并不改变成果被评价的方式。',
            },
            { t: 'h2', text: '这个方案不适合你的时候' },
            {
              t: 'ul',
              items: [
                '你要检索的是整个领域，而不是一个文件夹。这里没有远端语料，只有你导入的文件可查。',
                '两位合作者需要同时查同一个实时索引。索引只在一个浏览器配置里，从不跨设备同步。',
                '初筛集超过 40 份或 200MB，而且没法按主题合理拆分。',
                '你需要的证据在图里、扫描页里，或者排版的公式里。',
                '需要一份可复核、带时间戳的检索记录。这里什么都不记录，这是设计选择。',
                '问题需要对很多论文做算术，比如合并样本量。检索返回段落，加总由你来做。',
              ],
            },
            { t: 'h2', text: '模型、离线使用，以及到底什么会离开这台机器' },
            {
              t: 'ul',
              items: [
                '英文库用 all-MiniLM-L6-v2（约 23MB）；中文库用 bge-small-zh-v1.5（约 25MB）；中英混排用 multilingual-e5-small（约 120MB）。',
                '可选生成档会下载 Qwen2.5 0.5B–1.5B（4-bit），400MB 到 1.0GB，且必须你点击确认后才会开始。',
                '整个应用只有一个外发请求：首次拉取模型权重，载荷是文件名。之后可离线工作。',
                '无账号、无追踪像素，也就没有地方把一份没写完的综述和某个人挂上关系。',
                '单库上限：40 份文件、单份 ≤25MB、总量 ≤200MB、≤20,000 个块。',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: '能一次检索整个文献管理软件吗？',
                  a: '这个工具做不到。单库最多 40 份文件，整个语料必须按你自己划的批次来做。',
                },
                {
                  q: 'LaTeX 源文件或 arXiv 的 HTML 版本能处理吗？',
                  a: 'HTML 和纯文本都在支持列表里，arXiv 的 HTML 导出可以解析。LaTeX 源码也是纯文本，但宏用得多的话，切出来的块会很碎。',
                },
                {
                  q: '能把各篇的数字汇总成一张表吗？',
                  a: '它会把每处提到数字的地方连同页码返回，可选的生成档能把它们排成列表。数字本身建议你自己誊，本地小模型看错数字的概率比看错句子的概率更高。',
                },
                {
                  q: '双栏 PDF 会乱吗？',
                  a: '阅读顺序多数正确，但不保证。发现引用看起来串行时，回 PDF 里确认那一段；引用里带页码，核对很快。',
                },
                {
                  q: '没有显卡的机器能用吗？',
                  a: '可以。向量化和检索都是 CPU 的活儿。只有可选的生成档能从 WebGPU（走 WebLLM）里受益；纯 CPU 大约每秒 3–8 个 token。',
                },
              ],
            },
          ],
        },
      },
    },
    {
      slug: 'students',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/guides/private-document-qa/', labelEn: 'Private document Q&A', labelZh: '不上传的文档问答' },
        { path: '/use-cases/research/', labelEn: 'Literature review workflow', labelZh: '文献阅读用法' },
        { path: '/faq/', labelEn: 'Frequently asked questions', labelZh: '常见问题' },
      ],
      copy: {
        en: {
          title: 'Study from your own PDFs — no upload, no account',
          description:
            'A study workflow for lecture PDFs, textbook chapters and past papers: what parses, revising from citations, phone limits, and the integrity boundary.',
          h1: 'Revising from lecture slides, textbook chapters and past papers',
          intro:
            'Course material can be queried without uploading anything: up to 40 files, 25 MB each, parsed and indexed inside the browser tab. This page shows what to load for one term, how to ask questions that lead back to slide and page numbers, and which uses cross the line your institution draws.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'A term of material is usually 15–30 files, which fits the 40-file cap once. So the real decision is which files to include, not how to squeeze them in.',
            },
            { t: 'h2', text: 'What to load for one term' },
            {
              t: 'table',
              caption: 'Table 1 — material worth importing',
              head: ['What you have', 'Format', 'Worth importing?', 'Note'],
              rows: [
                ['Lecture slides', 'PDF export', 'Yes — text and slide numbers come through', 'A slide that is one big image keeps only its caption'],
                ['Textbook chapters', 'PDF with a text layer', 'Yes', 'Scan-only editions yield nothing at all'],
                ['Past papers', 'DOCX or PDF', 'Yes, all of them', 'Often the highest-value set for spotting repeated question patterns'],
                ['Your own notes', 'Markdown or TXT', 'Yes', 'Your wording helps retrieval, because you ask questions in your own vocabulary'],
                ['A scanned textbook', 'Image-only PDF', 'No, not before OCR', 'The parser reports the file instead of indexing emptiness'],
                ['Marks in a spreadsheet', 'CSV after export', 'Rarely useful', 'Retrieval is text-based; numbers alone have little context to match'],
              ],
            },
            { t: 'h2', text: 'A revision loop built on citations' },
            {
              t: 'ol',
              items: [
                'Load the term’s material into one library and let indexing finish; progress is shown per file.',
                'Ask a definition question you can already answer, such as “How does this course define opportunity cost?” Check that the citation lands on the right slide.',
                'Ask a gap question: “Which week 3 topics appear in the 2024 paper?” Answer the retrieved questions from memory before checking the slides.',
                'Ask a comparison question across sources: “Do the slides and the textbook define variance differently?” Both passages come back, and you decide which one your examiner follows.',
                'Keep the citations you used in a Markdown file. Re-reading your own question list is faster than re-reading a chapter.',
              ],
            },
            { t: 'h2', text: 'Where the material fights back' },
            {
              t: 'ul',
              items: [
                'Diagrams and timelines carry meaning a text pipeline cannot see, so a question about a diagram returns only caption text.',
                'Formula-heavy pages usually lose superscripts and subscripts, which changes what an expression says. Read the formula in the source.',
                'Handwritten notes in a scan do not parse at all.',
                'A 40-file library holds one term comfortably. A whole degree means clearing site data between terms, which also deletes the index — export what you want to keep first.',
              ],
            },
            { t: 'h2', text: 'The 20,000-chunk ceiling, in context' },
            {
              t: 'p',
              text: 'Chunks run about 700 characters with 15% overlap, so 20,000 chunks is around 14 million characters of text. A 60-slide lecture PDF is often under 30,000 characters, which means the 40-file cap normally binds long before the chunk cap does.',
            },
            { t: 'h2', text: 'When this is not the right approach' },
            {
              t: 'ul',
              items: [
                'You want a chapter-by-chapter summary of a whole book in one answer. Retrieval returns the top six passages, not a condensation.',
                'The work is graded and you were told to do it unaided. Read your course rules first: running locally does not change whether assistance is permitted.',
                'You need the same library on a phone and a laptop. The index sits in one browser profile and is not synchronised.',
                'You want to hand a study set to a group. Files never leave the device, so the index cannot be shared — share your question list and citations, or each person imports their own copies.',
                'Your device has little free memory. Mobile browsers cap collections lower, and the tool states the reduced limit instead of failing part-way through indexing.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'Academic integrity:',
              text: 'This is a retrieval tool. Using the optional generation tier to produce paragraphs you submit as your own writing is not what it is for, and running on your own device does not change how your institution treats that.',
            },
            { t: 'h2', text: 'Settings that suit studying' },
            {
              t: 'ul',
              items: [
                'Stay in the default retrieval tier: it quotes the retrieved sentences and keeps numbered citations, which is what you want to memorise from.',
                'Set strictness to documents only. When nothing clears the similarity threshold you get “not found in your documents” instead of a plausible invention.',
                'Turn on the generation tier only if you have WebGPU; without it, CPU runs at roughly 3–8 tokens per second and the download is 400 MB to 1.0 GB.',
                'Files never leave the device, there is no account and no tracking pixels, and the library works offline once the embeddings are cached.',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Does it work on a phone?',
                  a: 'Yes, with a lower collection cap because mobile browsers allow less memory. The interface reports the reduced limit rather than failing during indexing.',
                },
                {
                  q: 'Will it summarise an entire textbook?',
                  a: 'No. It retrieves the six most relevant passages for a question. For a chapter summary you would be reading a hallucination risk rather than a source.',
                },
                {
                  q: 'Can my study group share one library?',
                  a: 'Not directly. There is no server and no shared index; each person imports their own copies of the same files, and the index stays in their browser profile.',
                },
                {
                  q: 'Is this cheating?',
                  a: 'That is defined by your course, not by this page. A retrieval tool that quotes your own course material is closest to a search index of your notes; submitting generated prose as your own work is a different matter.',
                },
                {
                  q: 'Why did my textbook PDF index as empty?',
                  a: 'It is almost certainly an image-only scan without a text layer. The parser detects this and reports the file, leaving the rest of the library usable.',
                },
              ],
            },
          ],
        },
        zh: {
          title: '用自己的 PDF 复习，不上传、不注册',
          description:
            '面向讲义、教材章节和历年真题的复习流程：哪些材料解析得住、怎么靠带页码的引用复习、手机上的内存限制，以及学术诚信那条线在哪里。',
          h1: '用讲义、教材章节和历年真题复习',
          intro:
            '课程材料不用上传也能提问：最多 40 份文件、单份 ≤25MB，解析和索引都在浏览器标签页里完成。这一页讲一个学期该导入哪些文件、怎么问出能跳回幻灯片和页码的答案，以及哪些用法会越过学校划的那条线。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '一个学期的材料通常 15–30 份，40 份的上限一次就够用。所以要决定的是放进哪些文件，而不是怎么把它们塞进去。',
            },
            { t: 'h2', text: '一个学期该导入什么' },
            {
              t: 'table',
              caption: '表 1 — 值得导入的材料',
              head: ['你手上的东西', '格式', '值得导入吗', '说明'],
              rows: [
                ['课堂讲义', '导出为 PDF', '值得——文字和幻灯片号都在', '整页是一张大图的幻灯片只会留下图注'],
                ['教材章节', '带文字层的 PDF', '值得', '纯扫描版一点文字都抽不出来'],
                ['历年真题', 'DOCX 或 PDF', '全部导入', '常常是价值最高的一批，能看出重复的题型'],
                ['自己的笔记', 'Markdown 或 TXT', '值得', '你自己的用词有助检索，因为你也是用自己的话提问'],
                ['扫描版教材', '纯图片 PDF', '先做 OCR 再说', '解析器会把这份文件报出来，而不是建空索引'],
                ['成绩表格', '导出为 CSV', '基本用不上', '检索基于文字，孤零零的数字缺少可匹配的上下文'],
              ],
            },
            { t: 'h2', text: '靠引用跑起来的复习循环' },
            {
              t: 'ol',
              items: [
                '把一个学期的材料放进一个库，等索引建完；进度是按文件显示的。',
                '先问一个你已经会答的定义题，比如「这门课里机会成本是怎么定义的」，确认引用落在正确的幻灯片上。',
                '再问缺口：「第 3 周的哪些内容出现在 2024 年那份卷子里？」把检索出来的题目先在脑子里答一遍，再翻讲义核对。',
                '问跨材料的比对题：「讲义和教材对「方差」的定义一样吗？」两段原文都会返回，由你判断你们老师按哪个讲。',
                '把你用过的引用记到一个 Markdown 文件里。重读自己的问题清单，比重读一整章快。',
              ],
            },
            { t: 'h2', text: '材料会怎么跟你作对' },
            {
              t: 'ul',
              items: [
                '图表和时间轴承载的信息文字管线看不到，问一张图只会返回图注里的那几个字。',
                '公式密集的页面通常丢掉上下标，表达式的含义因此变化。公式回原文读。',
                '扫描件里的手写笔记完全解析不出来。',
                '一个 40 份的库装一个学期很宽松。读完整学位要在学期之间清除站点数据，索引也会一起删掉——想留的先导出。',
              ],
            },
            { t: 'h2', text: '20,000 块的上限放在这里是什么意思' },
            {
              t: 'p',
              text: '每块约 700 字符、15% 重叠，20,000 块大约是 1400 万字符。一份 60 页幻灯片的讲义常常不到 3 万字符，所以通常先是 40 份的数量上限到顶，块数上限还远着。',
            },
            { t: 'h2', text: '这个方案不适合你的时候' },
            {
              t: 'ul',
              items: [
                '你想要一整本书、按章节逐章生成的总结。检索返回的是最相关的前六段，不是一份缩编。',
                '这份作业要计分，而且要求独立完成。先看课程的规定：在本地运行并不改变「是否允许借助工具」这件事。',
                '你需要在手机和笔记本上共用同一个库。索引在某个浏览器配置里，不会同步。',
                '你想把复习资料打包给小组。文件永不离开设备，索引也就没法分享——要么共享问题清单和引用，要么各自导入同一批文件。',
                '设备可用内存很小。移动浏览器会把文档数量上限调低，工具会明确告诉你，而不是建索引建到一半崩掉。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '学术诚信：',
              text: '这是一个检索工具。用可选的生成档产出你署名提交的段落，不是它的用途；在你自己设备上运行，也不会改变学校对这件事的处理方式。',
            },
            { t: 'h2', text: '适合复习的设置' },
            {
              t: 'ul',
              items: [
                '留在默认的抽取档：它摘取检索到的原句并保留编号引用，正是用来背材料的那一档。',
                '严格度设为「仅依据文档」。没有任何段落越过相似度阈值时，你会看到「文档中未找到」，而不是一个编得像那么回事的答案。',
                '只有有 WebGPU 时才开生成档；没有的话，CPU 大约每秒 3–8 个 token，而且要下载 400MB 到 1.0GB。',
                '文件永不离开你的设备，无账号、无追踪像素；向量缓存之后整个库可以离线使用。',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: '手机能用吗？',
                  a: '能，但文档数量上限更低，因为移动浏览器允许的内存更少。界面会直接给出调低后的上限，而不是建索引到一半失败。',
                },
                {
                  q: '能把整本教材总结出来吗？',
                  a: '不能。它针对一个问题返回最相关的前六段。想要章节摘要，等于在赌模型不乱写，而不是在读来源。',
                },
                {
                  q: '小组能共用一个库吗？',
                  a: '不能直接用。没有服务器也没有共享索引；每个人各自导入同一批文件，索引留在各自的浏览器配置里。',
                },
                {
                  q: '这算作弊吗？',
                  a: '那由你的课程规定来界定，不由这一页来界定。检索你自己的课程材料，最接近「给自己的笔记建了个搜索索引」；把生成的文字当成自己写的提交，是另一回事。',
                },
                {
                  q: '为什么我的教材 PDF 导进去是空的？',
                  a: '几乎肯定是没有文字层的扫描件。解析器会识别出来并报出这份文件，库里其他材料照常可用。',
                },
              ],
            },
          ],
        },
      },
    },
    {
      slug: 'hr-finance',
      ads: 1,
      schema: { article: true, faq: true },
      related: [
        { path: '/app/', labelEn: 'Open the tool', labelZh: '打开工具' },
        { path: '/guides/private-document-qa/', labelEn: 'Private document Q&A', labelZh: '不上传的文档问答' },
        { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
        { path: '/use-cases/legal/', labelEn: 'Contract workflow', labelZh: '合同类用法' },
      ],
      copy: {
        en: {
          title: 'HR and finance Q&A that never leaves the laptop',
          description:
            'Query handbooks, expense policies, vendor contracts and CSV invoices in a local index: formats, question patterns, limits, and the controls you still need.',
          h1: 'Answering policy and expense questions on-device',
          intro:
            'An HR or finance team can put up to 40 documents — employee handbook, expense policy, vendor contracts, invoices exported to CSV — into one browser-local library and question them together. Nothing is uploaded. This page covers the supported formats, the question patterns that work, and the governance questions a local tool does not answer.',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: 'Most of the value sits in three recurring questions: what does the policy say, which contract clause applies, and does this invoice match the agreed price. The first two are retrieval problems. The third needs the numbers present as text.',
            },
            { t: 'h2', text: 'Formats, including one gap worth knowing' },
            {
              t: 'p',
              text: 'PDF, DOCX, TXT, Markdown, CSV, HTML and JSON are supported directly. Spreadsheets are not parsed as .xlsx, so an expense log has to be exported to CSV first — a single click in most suites, and a step people forget until a library comes back with nothing useful from their biggest file.',
            },
            {
              t: 'table',
              caption: 'Table 1 — getting each source into a parseable form',
              head: ['Source', 'How it goes in', 'Why that matters'],
              rows: [
                ['Employee handbook .docx', 'Import as is', 'Heading levels are preserved, so Section 4.2 keeps its parent'],
                ['Expense policy .pdf', 'Import as is', 'Page numbers come through, so a citation reads “page 3”'],
                ['Invoice bundle .xlsx', 'Export each sheet to CSV', 'Spreadsheets are not parsed; a CSV keeps row boundaries intact'],
                ['Vendor master held online', 'Download as CSV', 'The same export works offline once cached'],
                ['Scan-only receipts .pdf', 'OCR first', 'Image-only pages yield no text at all'],
                ['Mixed audit working papers', 'Merge into one PDF where possible', 'Fewer files keeps you under the 40-file cap'],
              ],
            },
            { t: 'h2', text: 'Three question patterns, with examples' },
            {
              t: 'ol',
              items: [
                'Policy lookup — “What receipt does a taxi claim of 800 CNY require, and which section says so?” The answer returns the section with its heading path and a page number.',
                'Clause location — “Which vendor contracts have a 30-day termination for convenience clause?” Both phrases are exact tokens, so keyword ranking surfaces them and the answer quotes each clause with a file name.',
                'Reconciliation — “Which invoices here bill above the unit price stated in the contract?” Needs the CSV and the contract loaded in the same library. Retrieval returns both figures; the subtraction stays with you.',
              ],
            },
            { t: 'h2', text: 'Two hours of audit prep, step by step' },
            {
              t: 'steps',
              items: [
                {
                  title: 'Collect the paper equivalents in one folder',
                  text: 'Handbook, expense policy, the three vendor contracts under review, and one quarter of invoices exported to CSV. Ten files, comfortably under 200 MB.',
                },
                {
                  title: 'Import and watch the index build',
                  text: 'Parsing starts with magic-byte sniffing rather than the extension, then format-specific extraction, then chunking at about 700 characters with 15% overlap. The progress panel names each file and reports the ones it cannot read.',
                },
                {
                  title: 'Ask in the wording employees actually use',
                  text: 'Staff ask “can I claim a taxi home after 9pm?” while the policy says “late-night transport”. Ask it both ways: hybrid retrieval exists for exactly this vocabulary mismatch.',
                },
                {
                  title: 'Verify two answers against the source',
                  text: 'Click each citation and confirm the section number and the policy revision date. Nothing checks whether the version you loaded is the current one.',
                },
                {
                  title: 'Handle the spreadsheet separately',
                  text: 'Export to CSV, then import. Confirm the delimiter was detected; a misread delimiter turns a six-column file into one column of noise.',
                },
                {
                  title: 'Save the outcome, not the index',
                  text: 'Export the question and answer list with citations to Markdown for the working papers. The index itself is disposable and disappears when site data is cleared; the export survives.',
                },
              ],
            },
            { t: 'h2', text: 'What a local tool does not solve' },
            {
              t: 'ul',
              items: [
                'Data classification. Which categories of employee data may be processed at all is a policy decision, and it is not settled by where the computation happens.',
                'Access control. There are no accounts and no permission layer: whoever has the unlocked device and that browser profile has the library.',
                'Device loss. Clearing site data deletes the index, which is good for disposal and bad if the only copy of your notes lived there.',
                'Shared machines. A library in a shared browser profile is readable by the next person who opens it. Use a separate OS account, or clear site data when you finish.',
                'Retention rules. Nothing is logged, so there is no automatic evidence that a check was performed. Take your own notes.',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: 'What this page is not:',
              text: 'It describes how a document tool is used. It is not HR, tax, accounting or legal advice, and using SecureRAG does not by itself make a process compliant with any regulation. Ask whoever owns that decision in your organisation.',
            },
            { t: 'h2', text: 'When this is not the right approach' },
            {
              t: 'ul',
              items: [
                'You need a central, permissioned repository with an audit log. That is a different class of system, deliberately.',
                'The corpus exceeds 40 files or 200 MB. A full invoice archive does not fit: split by quarter, or use the accounting system’s own search.',
                'Scanned receipts are the core of the work and no OCR step exists in your process.',
                'Two people must work from the same live index at once.',
                'You need numbers extracted and totalled automatically. Retrieval returns passages; arithmetic on them is yours, and a wrong total from a language model is worse than no total.',
                'The answers would be filed as controls evidence without a human reading the cited passage.',
              ],
            },
            { t: 'h2', text: 'Verifying the privacy claim yourself' },
            {
              t: 'ol',
              items: [
                'Open the tool beside DevTools → Network and clear the log.',
                'Add a policy PDF. Parsing, chunking and indexing produce no request at all.',
                'Ask three questions in the default retrieval tier. Still no request.',
                'Only when you opt into the generation tier does one model download appear — 400 MB to 1.0 GB behind a click-to-confirm dialog — then switch DevTools to Offline and keep working.',
                'Clear site data and confirm the library is empty.',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: 'Can it read our expense spreadsheet directly?',
                  a: 'Not as .xlsx. Export the sheet to CSV and import that; the parser supports CSV and JSON, and a CSV keeps the row boundaries that make “sum the amounts above 500” style questions possible.',
                },
                {
                  q: 'Where is the index stored, and who can read it?',
                  a: 'In IndexedDB in the browser profile you used. Anyone with that device and that profile can open it, so on a shared machine use a separate OS account or clear site data when you finish.',
                },
                {
                  q: 'Does using this make us GDPR or PIPL compliant?',
                  a: 'No tool makes a process compliant. Keeping processing local changes which transfers happen; the lawful basis, retention and access decisions remain yours.',
                },
                {
                  q: 'How many documents fit?',
                  a: '40 files, 25 MB each, 200 MB total and 20,000 chunks per library. A policy set fits easily; an invoice archive needs splitting by quarter.',
                },
                {
                  q: 'Can two colleagues query the same library?',
                  a: 'No. The index is per browser profile with no server behind it. Share exported answers with citations, or have each person import their own copies.',
                },
              ],
            },
          ],
        },
        zh: {
          title: '人事与财务的问答，不出这台电脑',
          description:
            '把员工手册、报销制度、供应商合同和导出成 CSV 的发票放进浏览器本地索引来提问：支持哪些格式、哪些提问方式管用、上限是多少，以及工具解决不了的管控问题。',
          h1: '在本地回答制度与报销类问题',
          intro:
            '人事或财务可以把最多 40 份文件——员工手册、报销制度、供应商合同、导出为 CSV 的发票——放进一个浏览器本地的库，一起提问。什么都不上传。这一页讲支持哪些格式、哪些提问方式管用，以及一个本地工具回答不了的管控问题。',
          updated: '2026-09-17',
          blocks: [
            {
              t: 'p',
              lead: true,
              text: '价值主要集中在三个反复出现的问题上：制度怎么规定的、适用哪一条合同条款、这张发票的价格和约定是否一致。前两个是检索问题，第三个要求数字以文字形式存在。',
            },
            { t: 'h2', text: '支持哪些格式，以及一个值得提前知道的缺口' },
            {
              t: 'p',
              text: 'PDF、DOCX、TXT、Markdown、CSV、HTML、JSON 都是直接支持。表格文件不会按 .xlsx 解析，报销流水要先用 CSV 导出——在多数办公套件里就是点一下，但常常被忽略，直到库建好之后发现最大的那个文件什么都没搜出来。',
            },
            {
              t: 'table',
              caption: '表 1 — 每种来源怎么变成可解析的形式',
              head: ['来源', '怎么导进去', '为什么要注意'],
              rows: [
                ['员工手册 .docx', '直接导入', '标题层级会保留，第 4.2 节能挂住它的上级标题'],
                ['报销制度 .pdf', '直接导入', '页码会带出来，引用能写成「第 3 页」'],
                ['发票汇总 .xlsx', '每个工作表导出成 CSV', '表格不参与解析；CSV 保留行边界'],
                ['在线维护的供应商台账', '下载为 CSV', '导出之后离线也能用'],
                ['纯扫描的票据 PDF', '先做 OCR', '纯图片页抽不出任何文字'],
                ['混在一起的审计底稿', '尽量合并成一个 PDF', '文件少一点，才不容易撞到 40 份上限'],
              ],
            },
            { t: 'h2', text: '三种提问方式，各带例子' },
            {
              t: 'ol',
              items: [
                '找制度——“打车 800 元要什么凭证？写在哪一节？”答案会连标题路径和页码一起给出。',
                '找条款——“哪些供应商合同里有 30 天无理由解约条款？”两个词都是精确词元，关键词排序就能捞出来，答案会各自带上文件名并引用条款原文。',
                '做核对——“这里哪些发票的单价高于合同约定？”需要把 CSV 和合同放在同一个库里。检索会把两边的数字都返回，减法由你来做。',
              ],
            },
            { t: 'h2', text: '两小时的审计准备，一步一步' },
            {
              t: 'steps',
              items: [
                {
                  title: '把纸质对应物收进一个文件夹',
                  text: '员工手册、报销制度、这次要看的三个供应商合同，再加一个季度的发票导出成 CSV。十份文件，远不到 200MB。',
                },
                {
                  title: '导入，看着索引建起来',
                  text: '解析先做魔数嗅探（不看扩展名），再做格式相关的抽取，然后按约 700 字符、15% 重叠切块。进度面板会逐个点名文件，读不了的也会报出来。',
                },
                {
                  title: '用同事平时说的那句话提问',
                  text: '员工问的是「晚上 9 点以后打车回家能报吗」，制度里写的是「深夜交通费」。两种问法都试一遍：混合检索就是为这种用词错位准备的。',
                },
                {
                  title: '挑两条答案回原文核对',
                  text: '点开每个引用，确认条款号和制度版本日期。系统不会替你检查导入的是不是最新版。',
                },
                {
                  title: '表格单独处理',
                  text: '导出 CSV 再导入，并确认分隔符识别正确；分隔符认错时，六列的文件会变成一列噪声。',
                },
                {
                  title: '留下结果，而不是索引',
                  text: '把问答记录连引用导出成 Markdown 放进底稿。索引本身是一次性的，清除站点数据就没了；导出件还在。',
                },
              ],
            },
            { t: 'h2', text: '本地工具解决不了的事' },
            {
              t: 'ul',
              items: [
                '数据分类。哪些类别的员工数据可以被处理，是制度层面的决定，不因为计算发生在哪里而改变。',
                '权限控制。这里没有账号，也没有权限层：谁拿到没锁的设备和那个浏览器配置，谁就能打开这个库。',
                '设备丢失。清除站点数据会删掉索引，这对处置是好事，但如果你的笔记只存在那里，就是坏事。',
                '共用电脑。共用浏览器配置里的库，下一个打开的人就能读。用独立的系统账号，或者用完清除站点数据。',
                '留存规则。这里什么都不记录，也就没有「某次核查做过」的自动凭证。记录要自己留。',
              ],
            },
            {
              t: 'callout',
              kind: 'warn',
              title: '这一页不是什么：',
              text: '它讲的是一个文档工具怎么用，不是人事、税务、会计或法律意见；使用 SecureRAG 本身也不会让某个流程符合任何法规。这件事该由你们机构里负责的人来定。',
            },
            { t: 'h2', text: '这个方案不适合你的时候' },
            {
              t: 'ul',
              items: [
                '你需要一个集中的、带权限的文档库和审计日志。那是另一类系统，这里的缺席是有意的。',
                '文件超过 40 份或 200MB。整个发票归档装不下：按季度拆开，或者用账务系统自带的检索。',
                '工作核心就是扫描票，而流程里没有 OCR 环节。',
                '两个人必须同时用一个实时索引。',
                '需要自动把数字抽出来并加总。检索返回的是段落，加总由你来做；语言模型给出的错误合计比没有合计更麻烦。',
                '答案会被当作控制测试的证据归档，而没有人去读被引的原文。',
              ],
            },
            { t: 'h2', text: '自己核对这条隐私说法' },
            {
              t: 'ol',
              items: [
                '打开工具页，旁边开着开发者工具的 Network 面板，先清空日志。',
                '添加一份制度 PDF。解析、分块、建索引，全程没有任何请求。',
                '在默认抽取档里问三个问题。依然没有请求。',
                '只有你主动开启生成档时，才会出现一次模型下载——400MB 到 1.0GB，前面有确认弹窗——之后把 DevTools 切到 Offline，继续提问。',
                '清除站点数据，确认库已空。',
              ],
            },
            {
              t: 'faq',
              items: [
                {
                  q: '能直接读我们的报销表格吗？',
                  a: '不能按 .xlsx 读。把工作表导出成 CSV 再导入：解析器支持 CSV 和 JSON，而 CSV 保留的行边界，正是「把 500 元以上的金额加起来」这类问题能用得上的前提。',
                },
                {
                  q: '索引存在哪里？谁能读到？',
                  a: '存在你使用的那个浏览器配置的 IndexedDB 里。拿到这台设备和这个配置的人都能打开，所以在共用电脑上要用独立的系统账号，或者用完清除站点数据。',
                },
                {
                  q: '用了这个就算符合 GDPR 或个人信息保护法了吗？',
                  a: '任何工具都不能让流程「符合」。把处理放在本地改变的是数据流向哪里；合法性基础、留存期限、访问权限这些判断仍然在你这边。',
                },
                {
                  q: '能放多少份文件？',
                  a: '单库 40 份文件、单份 ≤25MB、总量 ≤200MB、≤20,000 个块。制度类文件很宽松；发票归档需要按季度拆。',
                },
                {
                  q: '两位同事能查同一个库吗？',
                  a: '不能。索引按浏览器配置存放，背后没有服务器。要么共享带引用的问答导出件，要么各自导入同一批文件。',
                },
              ],
            },
          ],
        },
      },
    },
  ],
} satisfies SectionModule;
