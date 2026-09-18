import type { ContentPage } from './types';

export default {
  slug: 'faq',
  nav: '/faq/',
  ads: 1,
  schema: { article: true, faq: true },
  related: [
    { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '管线如何运转' },
    { path: '/models/', labelEn: 'Model sizes and licences', labelZh: '模型体积与许可' },
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/glossary/', labelEn: 'Glossary of terms', labelZh: '术语表' },
  ],
  copy: {
    en: {
      title: 'SecureRAG FAQ: privacy, models, formats, limits',
      description:
        'Twenty-one answers about SecureRAG: verifying that nothing is uploaded, where chunks and vectors live, supported formats, model sizes, speed and limits.',
      h1: 'Frequently asked questions',
      intro:
        'A question-and-answer page about a browser-local RAG tool: what stays inside the tab, what the one outbound request carries, which files work, how large the models are, and where the approach stops being a good fit.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'SecureRAG answers questions about your own documents without sending them anywhere: parsing, chunking, embedding and retrieval all run in the browser tab, the models are downloaded once into your own Cache Storage, and there is no account, no server-side index and no upload step to audit. The answers below state the limits of that arrangement as plainly as its benefits.',
        },
        { t: 'h2', text: 'Two checks you can run in a minute' },
        {
          t: 'p',
          text: 'Privacy claims are worth only what you can test. Both of these take under a minute in a desktop browser, and neither needs any special access.',
        },
        {
          t: 'ol',
          items: [
            'Press F12 to open DevTools, switch to the Network tab, and clear the list. Filter for Fetch/XHR, then drop a file into the workspace. No request carries the file: only GET requests for model weight files appear, and the model is fetched once per model, not once per document.',
            'Switch the Network tab to offline. Ask a question about the document you just imported: the answer, with its cited passages, still comes back, which is only possible if nothing needed the network.',
            'In the Application tab, expand IndexedDB, open the securerag database and its library store: the docs key holds one metadata record per document, and each document also has an index key holding its chunk text together with the Float32Array vectors. Clear site data and both disappear.',
          ],
        },
        { t: 'h2', text: 'Limits and formats at a glance' },
        {
          t: 'table',
          caption: 'Table 1 — formats, ceilings and settings, as shipped in v0.1',
          head: ['Item', 'Value or answer'],
          rows: [
            ['Supported formats', 'PDF with a text layer, DOCX, TXT, Markdown, CSV, HTML, JSON'],
            ['Rejected files', 'Encrypted PDF, scanned PDF without a text layer, legacy .doc, any single file over 25 MB'],
            ['File size ceiling', '25 MB per file'],
            ['Files per knowledge base', '40 on desktop, 10 on phones'],
            ['Total size per knowledge base', '200 MB'],
            ['Chunks per knowledge base', '20,000'],
            ['Default embedder, Chinese', 'bge-small-zh-v1.5, about 25 MB'],
            ['Default embedder, English', 'all-MiniLM-L6-v2, about 23 MB'],
            ['Mixed Chinese and English', 'multilingual-e5-small, about 120 MB'],
            ['Optional generator', 'Qwen2.5 0.5B to 1.5B, 4-bit quantised, 400 MB to 1.0 GB, needs a confirmation click'],
            ['Generation speed', 'About 3-8 tokens per second on CPU/WASM, faster where WebGPU is available'],
            ['Retrieval', 'Vector search plus BM25, fused with RRF (k=60), MMR at lambda 0.7, top 6 passages'],
            ['Works offline', 'Yes, once the model weights are cached'],
          ],
        },
        { t: 'h2', text: 'Questions and answers' },
        {
          t: 'faq',
          items: [
            {
              q: 'How can I verify that nothing is uploaded?',
              a: 'Open DevTools with F12, go to the Network tab, clear the list and filter by Fetch/XHR, then drop a file into the workspace. No request carries the file: parsing, chunking and embedding happen in the same tab that displays the result. The only outbound requests are GET calls for model weight files, which carry a file name and nothing else. Switch DevTools to offline mode after a model is cached and the tool keeps working.',
            },
            {
              q: 'Where are my documents and vectors stored?',
              a: 'In your own browser profile. Text chunks and their vectors sit in IndexedDB for this site, the model weights in Cache Storage, and your settings in local storage. Nothing is written to a server, so there is no remote copy for us to hold, leak or hand over. Clearing site data for this site removes all three at once.',
            },
            {
              q: 'Which file types can I import?',
              a: 'PDF with a text layer, DOCX, TXT, Markdown, CSV, HTML and JSON. The importer sniffs the magic bytes first, so a file renamed from .doc to .docx is rejected rather than half-parsed. PDF page numbers and DOCX heading levels survive parsing, which is why a citation can point at a page or a section instead of a character offset.',
            },
            {
              q: 'Which files are rejected outright?',
              a: 'Encrypted PDFs, scanned PDFs with no text layer, legacy .doc files, and any single file above 25 MB. Each rejection is reported by its own name — PDF_ENCRYPTED, PDF_NO_TEXT_LAYER, LEGACY_DOC, FILE_TOO_LARGE, UNSUPPORTED_FORMAT — instead of a generic failure, so you know whether to remove a password, run OCR, convert the format, or split the file. A PDF that yields fewer than 40 characters of text is treated as a scan rather than as an empty document.',
            },
            {
              q: 'Can I use it on a phone?',
              a: 'Yes, with a smaller allowance: the per-knowledge-base limit drops from 40 files to 10 on mobile. Embedding runs several times slower on a phone CPU than on a laptop, and the optional generator is usually too slow to be pleasant there. On a phone, extraction mode with citations is the practical choice.',
            },
            {
              q: 'How large are the models, and when are they downloaded?',
              a: 'The default embedder is bge-small-zh-v1.5 at about 25 MB for Chinese or all-MiniLM-L6-v2 at about 23 MB for English; multilingual-e5-small, for mixed Chinese and English text, is about 120 MB. The optional generator, Qwen2.5 0.5B to 1.5B in 4-bit quantisation, costs 400 MB to 1.0 GB and downloads only after you press a button that names the size.',
            },
            {
              q: 'Why is it slower than a hosted assistant?',
              a: 'Nothing was precomputed for you. Chunks are embedded on your hardware, and with the local generator enabled every token is produced there too, at roughly 3-8 tokens per second on CPU/WASM. A hosted service amortises one GPU across many users; here you spend your own CPU time and get the privacy in return. The second question about the same document is faster, because the index and the model are already local.',
            },
            {
              q: 'How is a free site funded?',
              a: 'By Google AdSense, on every page, up to six labelled slots (three in-page banners, two side rails, one collapsible anchor). Personalized ads load personalized only after you agree. Decline and the tool behaves identically: outside the EEA, UK and Switzerland you still get non-personalized ads, and inside them no ad script loads at all. There is no paid tier, no account and no data product.',
            },
            {
              q: 'Do you train models on my documents?',
              a: 'No. The models here run inference only: they compute vectors and answers, never gradients, and no feedback path writes your text back into a model. We could not train on your content even if we wanted to, because no copy of it reaches us at any point.',
            },
            {
              q: 'Can I use it at work or commercially?',
              a: 'Yes. The terms place no fee and no licence restriction on the tool: it is free to use, including for work and commercial purposes, and your documents, questions and answers remain yours. Two things sit outside that answer. The downloaded models carry their own licences, listed per model on the models page and governed by the upstream model page rather than by us. And no accuracy is warranted, so a decision that has to satisfy a regulator, an auditor or a client still needs a human to check the cited passage against the source document.',
            },
            {
              q: 'How many documents fit in one knowledge base?',
              a: 'Up to 40 files, 200 MB in total and 20,000 chunks per knowledge base, with a 25 MB ceiling on any single file; on phones the file cap is 10. When a limit is reached the importer says which one it was. Removing the largest file you no longer need clears the block in most cases.',
            },
            {
              q: 'Does it work offline?',
              a: 'After the model weights are cached, yes. Put the browser into offline mode, close the tab, reopen the site and ask a question: parsing, retrieval and extraction all run locally. The model download is the only step that needs a network, and it happens once per model, not once per session.',
            },
            {
              q: 'What can I export, and how?',
              a: 'A session exports from the chat panel as Markdown, JSON or plain text, and the export carries the model name, the strictness setting and every citation, which is the most reliable way to keep an answer next to its sources. Answers also copy to the clipboard, and browser printing produces a PDF of any page. No part of the export touches a server, because there is no server to run the job.',
            },
            {
              q: 'The answer looks wrong. What should I do?',
              a: 'Read the citations before doubting the tool. If the passage that contains the answer is not among them, the problem is retrieval rather than reading: raise strictness, ask a narrower question, or re-import the document when repeated headers and footers are crowding out the body text. If the right passage is cited and the answer still misreads it, switch strictness to “Documents only” and read the passage yourself.',
            },
            {
              q: 'Can it read tables?',
              a: 'Only as text. In a PDF a table is flattened into lines in reading order, so a wide table with merged cells loses its column alignment; a CSV keeps each row intact. Where the columns carry the meaning, converting the table to CSV before importing gives noticeably better answers.',
            },
            {
              q: 'What about scanned PDFs and images?',
              a: 'Scanned PDFs with no text layer are not supported: the parser finds no characters and returns nothing, and the importer says so rather than pretending the file was indexed. No OCR model is bundled, because one would add hundreds of megabytes to the download for a case a browser handles poorly. Run OCR in another tool first, then import the text-layer PDF or the exported TXT.',
            },
            {
              q: 'Can I open a password-protected PDF?',
              a: 'No. Encrypted PDFs are rejected before parsing and no password field appears, because the app has no decryption path. Remove the password in a PDF reader and import the unprotected copy; the original file on your disk is untouched either way.',
            },
            {
              q: 'How does this compare with an assistant that accepts uploads?',
              a: 'A hosted assistant usually answers better: larger models, faster replies, and abilities this tool does not attempt, such as reading charts. The trade is what happens to your file. If the documents are public and you want the strongest answers, a hosted assistant wins. If the text is confidential, regulated, or simply not yours to upload, keeping it local is the point.',
            },
            {
              q: 'Can I run it in a controlled corporate environment?',
              a: 'Usually yes, and it is easier to approve than a cloud tool: the site is static files, the single outbound request is a model download, and you can host the model weights on an internal mirror and point the app there instead of at a public host. Two caveats: the machine needs a current browser with WebAssembly support and writable browser storage, and managed devices that lock down site storage will not run it at all.',
            },
            {
              q: 'Which browsers are supported?',
              a: 'Current Chrome and Edge, plus recent Firefox and Safari versions with WebAssembly. WebGPU, used only for the optional generation model, is present in current Chromium browsers; everywhere else the pipeline falls back to CPU/WASM, which is slower. A private window works, but its index is discarded when the window closes.',
            },
            {
              q: 'Do the ads receive my documents or my questions?',
              a: 'Ad slots sit outside the chat workspace, and no document text, chunk or question is handed to the advertising script. What an ad request carries is the page address plus the standard device and browser details any ad request includes. If you would rather have no third-party script at all, decline the consent message — inside the EEA, UK and Switzerland that stops every ad request outright; elsewhere it narrows requests to non-personalized ones.',
            },
          
          { q: 'Can I search several file formats at the same time?', a: 'Yes. Add PDFs, Word files, spreadsheets and notes together and they are searched as one collection; each result says which file and which paragraph it came from.' },
          { q: 'Can I upload many files and search across all of them?', a: 'You can add as many as you like. Strictly speaking there is no upload step: the browser opens the files for us straight from your disk, so they never leave your computer.' },
          { q: 'What is the difference between exact and fuzzy search?', a: 'Exact search returns only sentences containing your text as typed - whole words in English, case-insensitive - with no model involved, so it works the moment the page loads, before anything is downloaded. Fuzzy search takes the semantic path and returns sentences that mean something similar, which is what you want when you are hunting a concept rather than a phrase.' },
          { q: 'Do I need to install anything or create an account?', a: 'No. Open the page and use it: no account, no installer, no sign-in. Once the model is cached it keeps working with the network off.' },
          { q: 'How is this different from pasting a file into an AI chatbot?', a: 'Two differences that matter: your file is never sent anywhere, and every answer is assembled from the sentences in your own documents with numbers that jump back to the paragraph, so you verify the source rather than a rewrite.' },
          { q: 'Will it miss sentences that contain my words?', a: 'Exact search walks every sentence of every file and lists all of them in document order, unfiltered, instead of handing you a few “most relevant” hits. Only fuzzy search ranks, and the two are separate buttons.' },
          { q: 'Does it work in Chinese and English?', a: 'Both. Chinese matches as a substring, English as whole words, case-insensitively, and a single file can mix the two.' },
          { q: 'Is it slow with large files?', a: 'The first pass parses and indexes, so the bigger the document the longer that step takes, and the progress bar tells you where it is. Searching an index that already exists takes milliseconds, and the index lives in your browser, so you do not rebuild it next time.' },
          { q: 'What happens to my files after I close the tab?', a: 'The index is kept in your browser’s local storage, so it is still there when you come back. Clearing your browser data removes it along with everything else - that is the “deleting really deletes” part.' },
          ],
        },
        { t: 'h2', text: 'If your question is not here' },
        {
          t: 'p',
          text: 'Send it to guweiicy@gmail.com with your browser name and version, the file type you were using and the exact wording of any message you saw. Questions that turn out to expose a real gap are answered and then added to this page, so the next person does not have to ask.',
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'This page carries ad slots too.',
          text: 'It sits below the article and outside the chat workspace, and no document text or question is passed to it. The privacy policy, the terms and the security pages carry ad slots at all.',
        },
      ],
    },
    zh: {
      title: 'SecureRAG 常见问题：隐私、模型、格式与限额',
      description:
        '21 个常见问题的直接回答：如何验证文件没有上传、文本块与向量存在哪里、支持与不支持哪些格式、模型多大、为什么慢、能否离线、企业环境能否使用。',
      h1: '常见问题',
      intro:
        '这一页回答关于浏览器本地 RAG 工具的常见疑问：什么留在标签页里、唯一的外发请求带什么、哪些文件能用、模型多大，以及这套做法在哪些情况下并不合适。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'SecureRAG 在你的文档上回答问题，而文档始终不离开你的设备：解析、分块、向量化、检索全部在浏览器标签页内完成，模型权重一次性下载进你自己的 Cache Storage，没有账号、没有服务器端索引，也没有一个需要你去审查的上传步骤。下面每个回答都会同样说清这套安排的边界。',
        },
        { t: 'h2', text: '一分钟能做完的两个验证' },
        {
          t: 'p',
          text: '隐私声明只有能被验证才有价值。下面两件事在桌面浏览器里都花不到一分钟，也不需要任何特殊权限。',
        },
        {
          t: 'ol',
          items: [
            '按 F12 打开开发者工具，切到 Network 面板并清空列表。筛选用 Fetch/XHR，然后往工作区里拖入一个文件。没有任何请求带着这个文件：出现的只有下载模型权重的 GET 请求，而模型是每个模型下载一次，不是每份文档一次。',
            '把 Network 面板切到 offline（离线）。再问一个关于刚导入文档的问题：带引用的回答照样返回，只有完全不依赖网络时才可能这样。',
            '在 Application 面板里展开 IndexedDB，打开 securerag 数据库下的 library 存储：docs 键里是每份文档一条的元数据记录，每份文档还有一个 index 开头的键，保存着文本块与对应的 Float32Array 向量。清除站点数据，两者一起消失。',
          ],
        },
        { t: 'h2', text: '格式与限额一览' },
        {
          t: 'table',
          caption: '表 1 — v0.1 的格式、限额与设置',
          head: ['项目', '数值或答案'],
          rows: [
            ['支持格式', '带文字层的 PDF、DOCX、TXT、Markdown、CSV、HTML、JSON'],
            ['直接拒绝的文件', '加密 PDF、无文字层的扫描件 PDF、旧版 .doc、单文件超过 25MB'],
            ['单文件上限', '25MB'],
            ['单库文件数', '桌面端 40 份，手机端 10 份'],
            ['单库总大小', '200MB'],
            ['单库文本块上限', '20,000'],
            ['默认向量模型（中文）', 'bge-small-zh-v1.5，约 25MB'],
            ['默认向量模型（英文）', 'all-MiniLM-L6-v2，约 23MB'],
            ['中英混排', 'multilingual-e5-small，约 120MB'],
            ['可选生成模型', 'Qwen2.5 0.5B–1.5B，4-bit 量化，400MB–1.0GB，必须点确认才开始下载'],
            ['生成速度', 'CPU/WASM 下约 3–8 token/s，有 WebGPU 时更快'],
            ['检索配置', '向量检索 + BM25，RRF 融合（k=60），MMR λ=0.7，取前 6 条'],
            ['能否离线', '可以，模型权重缓存之后即可离线使用'],
          ],
        },
        { t: 'h2', text: '问题与回答' },
        {
          t: 'faq',
          items: [
            {
              q: '怎么验证文件确实没有上传？',
              a: '按 F12 打开开发者工具，进入 Network 面板，清空列表并按 Fetch/XHR 筛选，然后往工作区拖入一个文件。没有任何请求带着这个文件：解析、分块、向量化都发生在显示结果的同一个标签页里。唯一的外发请求是下载模型权重的 GET 请求，里面只有一个文件名。模型缓存之后把开发者工具切成离线模式，工具仍然能用。',
            },
            {
              q: '文档和向量存在哪里？',
              a: '存在你自己的浏览器配置目录里。文本块和向量放在本站的 IndexedDB，模型权重放在 Cache Storage，设置放在本地存储。没有任何内容写到服务器，所以我们这边不存在可以保留、泄露或交出去的副本。清除本站的站点数据，这三块会一起消失。',
            },
            {
              q: '支持导入哪些文件类型？',
              a: '带文字层的 PDF、DOCX、TXT、Markdown、CSV、HTML 和 JSON。导入前先做魔数嗅探，所以把 .doc 改名成 .docx 会被拒绝，而不是解析出一堆错内容。PDF 的页码、DOCX 的标题层级在解析后保留下来，所以引用能指到某一页或某一节，而不是一个字符偏移。',
            },
            {
              q: '哪些文件会被直接拒绝？',
              a: '加密 PDF、没有文字层的扫描件 PDF、旧版 .doc，以及单文件超过 25MB。每一种都会报出自己的名字——PDF_ENCRYPTED、PDF_NO_TEXT_LAYER、LEGACY_DOC、FILE_TOO_LARGE、UNSUPPORTED_FORMAT——而不是一句笼统的「导入失败」，这样你就知道该去解密、该去别处做 OCR、该转换格式，还是该先拆分文件。一份 PDF 若只能抽出不到 40 个字符，会被当作扫描件处理，而不是当作空文档。',
            },
            {
              q: '手机上能用吗？',
              a: '能用，但额度更小：手机端单库文件上限从 40 份降到 10 份。手机 CPU 做向量化比笔记本慢好几倍，可选的生成模型在手机上通常慢到不适合日常使用，所以在手机上更实际的选择是带引用的抽取式回答。',
            },
            {
              q: '模型有多大，什么时候下载？',
              a: '默认向量模型是中文的 bge-small-zh-v1.5（约 25MB）或英文的 all-MiniLM-L6-v2（约 23MB）；中英混排用 multilingual-e5-small，约 120MB。可选生成模型是 4-bit 量化的 Qwen2.5 0.5B–1.5B，体积 400MB–1.0GB，只有你按下写着体积的那个按钮之后才会开始下载。',
            },
            {
              q: '为什么比云端助手慢？',
              a: '因为没有任何东西是预先替你算好的。文本块的向量在你的硬件上算出来，开了本地生成模型之后，每个 token 也在你的硬件上产生，CPU/WASM 下大约 3–8 token/s。云端服务把一块 GPU 摊给许多用户，这里花的是你自己的 CPU 时间，换来的是隐私。同一份文档的第二个问题会快一些，因为索引和模型已经在本地了。',
            },
            {
              q: '免费站点靠什么维持？',
              a: '靠 Google AdSense，每个页面最多六个标注清楚的广告位（页内三条横幅、两侧两条竖幅、底部一条可折叠）。个性化广告只在你同意之后加载。拒绝后工具行为完全相同：在欧盟、英国、瑞士以外你仍会看到非个性化广告，在这三个地区内则完全不加载广告脚本。没有付费档、没有账号、也没有数据产品。',
            },
            {
              q: '会用我的文档训练模型吗？',
              a: '不会。这里的模型只做推理：它们计算向量和答案，不计算梯度，也没有任何反馈通道把你的文本写回模型。实际上就算想训也训不到，因为你的内容在任何一个环节都不会到达我们这里。',
            },
            {
              q: '能用于工作或商业用途吗？',
              a: '可以。使用条款对工具本身不收费、不附加许可限制：免费使用，包括工作和商业场景，你的文档、提问和回答仍然属于你。有两点在这个回答之外。下载的模型有各自的许可，模型页面逐个列出，以对应模型页的说明为准，而不是以我们的说法为准。另外这里不对准确率做任何担保，所以任何需要经得起监管、审计或客户检查的结论，仍然要人工把引用段落和源文件核对一遍。',
            },
            {
              q: '单个知识库能放多少文档？',
              a: '最多 40 份文件、总量 200MB、20,000 个文本块，单文件不超过 25MB；手机端文件上限是 10 份。触到上限时导入器会说明是哪一个限制。多数情况下，删掉最大那份已经用不上的文件就能继续。',
            },
            {
              q: '能离线使用吗？',
              a: '模型权重缓存之后可以。把浏览器切成离线模式，关掉标签页，重新打开站点再提问：解析、检索、抽取全都在本地完成。需要网络的只有模型下载这一步，而且每个模型只发生一次，不是每次使用都发生。',
            },
            {
              q: '能导出什么，怎么导？',
              a: '在对话面板里可以把本次会话导出为 Markdown、JSON 或纯文本，导出内容包含模型名、严格度设置与全部引用，这是把回答和来源一起保存最可靠的方式。回答也可以复制到剪贴板，浏览器打印能把任意页面变成 PDF。整个导出过程不经过服务器，因为没有服务器来跑这个任务。',
            },
            {
              q: '回答看起来不对，该怎么办？',
              a: '先看引用，再怀疑工具。如果含答案的那一段根本不在引用里，问题出在检索而不是在阅读：提高严格度、把问题问得更窄，或者在重复页眉页脚挤占正文时重新导入这份文档。如果正确的段落被引用了、回答还是读错，就把严格度切回「仅依据文档」，自己读那一段。',
            },
            {
              q: '能处理表格吗？',
              a: '只能按文本处理。PDF 里的表格会按阅读顺序被摊成一行行文字，所以带合并单元格的宽表格会丢掉列对齐；CSV 则保留每一行的完整结构。如果含义主要靠列来表达，先转成 CSV 再导入，回答质量会明显不同。',
            },
            {
              q: '扫描件和图片怎么办？',
              a: '没有文字层的扫描件 PDF 不支持：解析器取不到任何字符，结果是空的，导入器会直接告诉你，而不是假装索引成功。这里没有内置 OCR，因为带一个 OCR 模型会让下载体积多出几百 MB，而浏览器处理这类文件本来就不擅长。请先用别的工具做 OCR，再导入带文字层的 PDF 或导出的 TXT。',
            },
            {
              q: '能打开带密码的 PDF 吗？',
              a: '不能。加密 PDF 在解析之前就被拒绝，也不会弹出密码输入框，因为应用里没有解密这条代码路径。请先在 PDF 阅读器里去掉密码，再导入那份没有保护的副本；你磁盘上的原文件在两种情况下都不会被改动。',
            },
            {
              q: '和能上传文件的云端助手相比，差在哪？',
              a: '云端助手通常回答得更好：模型更大、回复更快，还能做这里根本不尝试的事，比如读图表。交换的是你的文件之后会怎样。如果文档是公开的、你想要最好的回答，云端助手胜出；如果内容涉密、受监管，或者本来就不该上传，留在本地才是重点。',
            },
            {
              q: '能在管控严格的公司环境里用吗？',
              a: '通常可以，而且比云工具更容易过审：站点就是一组静态文件，唯一的外发请求是模型下载，你还可以把模型权重放到内网镜像上，让应用指向自己的副本而不是公开托管站。有两个前提：机器需要支持 WebAssembly、且允许写入浏览器存储的现代浏览器；把站点存储完全锁死的管控设备上，它跑不起来。',
            },
            {
              q: '支持哪些浏览器？',
              a: '当前的 Chrome 和 Edge，以及支持 WebAssembly 的较新 Firefox 和 Safari。WebGPU 只用于可选的生成模型，在当前 Chromium 内核浏览器上可用；其他环境会退回 CPU/WASM，速度更慢。隐私窗口也能用，但窗口关闭时索引会被丢弃。',
            },
            {
              q: '广告会拿到我的文档或提问吗？',
              a: '广告位在聊天工作区之外，没有任何文档正文、文本块或提问交给广告脚本。广告请求携带的是页面地址，以及任何广告请求都会带的设备与浏览器信息。如果你希望页面里完全不出现第三方脚本，在同意提示里选择拒绝——在欧盟、英国、瑞士境内，拒绝会彻底停止一切广告请求；在其他地区则只保留非个性化广告请求。',
            },
          
          { q: '支持哪些文件格式？', a: 'PDF、DOCX、TXT、Markdown、CSV、HTML、JSON，一共 7 种，纯文本也能放进来。混着加进去就能一次搜，不用先转格式。' },
          { q: '能不能一次把好几种格式的文件一起搜？', a: '能。把 PDF、Word、表格、笔记一起加进来，它们在同一批里被检索，结果里会标出每句出自哪份文件的哪一段。' },
          { q: '我可以一次上传多份文件，然后一起搜吗？', a: '可以一次加很多份。不过严格说没有“上传”这一步：文件是用浏览器自己的功能从你硬盘打开的，从头到尾没离开你的电脑。' },
          { q: '“精准检索”和“模糊检索”有什么区别？', a: '精准检索只返回和输入完全相同的原句（英文按整词匹配、忽略大小写），不经过任何模型，所以打开就能用、连模型都不用先下载。模糊检索走语义通道，返回意思相近的句子，适合你要找的是一个概念而不是一句原话。' },
          { q: '需要安装软件或注册账号吗？', a: '都不用。打开网页就能用：没有账号、没有安装包、也不用登录。模型缓存之后，断网也照样能用。' },
          { q: '它和把文件发到 ChatGPT 里问有什么区别？', a: '两个区别：一是文件不用发出去，全程在你电脑上处理；二是答案由你文件里的原句构成、带编号，点编号能跳回原文——你核对的是原文，不是一段改写。' },
          { q: '搜出来的结果会不会漏掉一些句子？', a: '精准检索会把每一份文件的每一句都走一遍，包含这个词的句子全部列出、按文档顺序、不做筛选，不会只给你几条“最相关”。只有模糊检索才有排序，两者是分开的按钮。' },
          { q: '中文和英文都能搜吗？', a: '都能。中文按字串匹配，英文按整词匹配并忽略大小写，同一份文件里中英混排也可以。' },
          { q: '大文件会不会很慢？', a: '第一次处理要解析和建索引，文件越大这一步越久，进度条会显示进行到哪一步；索引建好之后，检索是毫秒级的。索引存在你的浏览器里，下次打开不用重新处理。' },
          { q: '关掉网页之后，我加的文件还在吗？', a: '索引保存在浏览器的本地存储里，重新打开还在。清除浏览器数据就会一起删掉——这就是“删掉就是真删掉”的那部分。' },
          ],
        },
        { t: 'h2', text: '这里没有你的问题' },
        {
          t: 'p',
          text: '请写信到 guweiicy@gmail.com，附上浏览器名称与版本、你当时使用的文件类型，以及你看到的提示原文。如果一个问题暴露出真实的缺口，我们会回答它，并把它补进这一页，让下一个人不必再问。',
        },
        {
          t: 'callout',
          kind: 'info',
          title: '这一页也有广告位。',
          text: '它位于正文下方、聊天工作区之外，不会有任何文档正文或提问传到它那里。每个页面都是同样的安排，包括隐私政策与条款页。',
        },
      ],
    },
  },
} satisfies ContentPage;
