import type { ContentPage } from './types';

export default {
  slug: 'glossary',
  nav: '/glossary/',
  ads: 1,
  schema: { article: true },
  related: [
    { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '管线如何运转' },
    { path: '/models/', labelEn: 'Model sizes and dimensions', labelZh: '模型体积与维度' },
    { path: '/faq/', labelEn: 'Frequently asked questions', labelZh: '常见问题' },
    { path: '/compare/', labelEn: 'How it compares with cloud tools', labelZh: '与云端工具的对比' },
  ],
  copy: {
    en: {
      title: 'Glossary: RAG, embeddings, BM25, RRF, top-k',
      description:
        'Twenty-one retrieval terms, each with a one-line definition, the figures this site ships, and the concept people confuse it with.',
      h1: 'Glossary of retrieval terms',
      intro:
        'Definitions of the terms that appear on the rest of this site: retrieval and ranking, model formats and runtimes, storage in the browser, and the failure modes that come with each of them. Every entry says how the term is used here, with the figures this site actually ships.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'This glossary defines 21 terms in the order you tend to meet them when running a retrieval tool on your own machine: what retrieval-augmented generation is, how text becomes numbers, how two different search methods are combined, which file formats and browser APIs carry it, and where each step goes wrong. Definitions describe how this site uses the term, with the values it actually ships.',
        },
        { t: 'h2', text: 'How to read an entry' },
        {
          t: 'p',
          text: 'Each entry has a definition sentence, the reason the term matters in practice, and a note on the concept it is most often confused with. Where a number is specific to this site it is given rather than described, so a definition you cannot check is rare on this page.',
        },
        { t: 'h2', text: 'Terms, roughly in the order you meet them' },
        { t: 'h3', text: 'RAG (retrieval-augmented generation)' },
        {
          t: 'p',
          text: 'RAG is the pattern of finding relevant passages in a corpus first and producing an answer from those passages, instead of answering from model weights alone. Here retrieval is a hybrid search over your own chunks, and answering is either extraction of the matching sentences or an optional small local model. It is confused with fine-tuning: RAG adds no knowledge to a model, it supplies text at question time, and removing a document removes it from the answers immediately.',
        },
        { t: 'h3', text: 'Embedding (vector embedding)' },
        {
          t: 'p',
          text: 'An embedding is a fixed-length list of numbers standing for a piece of text, positioned so that texts with similar meaning sit close together. This site computes one embedding per chunk with a sentence-transformer model, which is why a question can match a passage that shares almost no words with it. It is confused with keyword matching: embeddings capture meaning but lose exact strings, which is the gap BM25 fills.',
        },
        { t: 'h3', text: 'Chunking' },
        {
          t: 'p',
          text: 'Chunking is splitting a parsed document into passages small enough to embed and specific enough to cite. This site chunks with structure in mind, at roughly 700 characters with 15% overlap, so a sentence that straddles a boundary still appears whole in at least one chunk. It is confused with page splitting: page numbers are kept here as citation anchors, not used as the chunking unit.',
        },
        { t: 'h3', text: 'Vector dimension' },
        {
          t: 'p',
          text: 'Vector dimension is the number of floats stored per chunk, fixed by the embedding model: 512 for bge-small-zh-v1.5, and 384 for all-MiniLM-L6-v2 and multilingual-e5-small. It decides the storage per chunk and whether two models can share an index at all. It is confused with accuracy: more dimensions are not automatically better, and vectors from two different models cannot be compared, because a 512-value and a 384-value vector have no shared coordinate meaning.',
        },
        { t: 'h3', text: 'Cosine similarity' },
        {
          t: 'p',
          text: 'Cosine similarity measures the angle between two vectors and ignores their length, returning a value between -1 and 1 where 1 means identical direction. It is the score that ranks chunks in the vector half of the search here. It is confused with a probability: a score of 0.8 does not mean an 80% chance of being correct, and scores are not comparable across different embedding models.',
        },
        { t: 'h3', text: 'BM25' },
        {
          t: 'p',
          text: 'BM25 is a lexical ranking function that scores a passage by how often your query terms appear in it, weighted by how rare those terms are in the collection and damped by passage length. It is the keyword half of the hybrid search here, and it is what rescues exact strings: error codes, part numbers, names, Chinese terms copied from a contract. It is confused with plain word counting, since the rarity weighting is the substance of it.',
        },
        { t: 'h3', text: 'RRF (reciprocal rank fusion)' },
        {
          t: 'p',
          text: 'RRF merges two ranked lists by giving each item a score of 1/(k + rank) and summing the scores, with k fixed at 60 here. It works on positions rather than scores, which is what allows a vector search and a BM25 search to be combined without calibrating two inherently incomparable score scales. It is confused with weighted averaging of raw scores, which needs normalisation and drifts whenever one retriever changes its score range.',
        },
        { t: 'h3', text: 'MMR (maximal marginal relevance)' },
        {
          t: 'p',
          text: 'MMR re-ranks candidate passages to balance relevance against novelty, scoring each new passage as lambda times its relevance minus (1 - lambda) times its similarity to the passages already chosen; this site uses lambda 0.7. The practical effect is that the six passages handed to the reader cover different parts of a document instead of being six restatements of one paragraph. It is confused with deduplication: near-duplicates are pushed down the ranking, not deleted, and lowering lambda is what promotes variety.',
        },
        { t: 'h3', text: 'top-k' },
        {
          t: 'p',
          text: 'top-k is the number of passages passed to the answering step, and here k is 6. Raising it gives the reader more material and more noise at the same time, and with the optional generator it consumes context window. It is confused with the size of the candidate pool: many more passages are scored during retrieval than the 6 that survive MMR.',
        },
        { t: 'h3', text: 'Quantisation (q4, q8)' },
        {
          t: 'p',
          text: 'Quantisation stores model weights in fewer bits, q8 at eight bits per weight and q4 at four, shrinking the download and the memory footprint in exchange for some accuracy. The embedders here ship as int8 ONNX builds and the optional Qwen2.5 generator as a 4-bit weight-only build, which is what brings it into the 400 MB to 1.0 GB range. It is confused with ordinary file compression: quantised arithmetic is what the model then executes, so the weights do not return to full precision when loaded.',
        },
        { t: 'h3', text: 'ONNX' },
        {
          t: 'p',
          text: 'ONNX is an open file format describing a neural network graph, and the .onnx files this site downloads are the embedder and generator weights in that format. It exists so a model trained in one framework can be run by a different runtime, including one that runs inside a browser. It is confused with a runtime: ONNX describes the graph, onnxruntime-web executes it.',
        },
        { t: 'h3', text: 'WebGPU' },
        {
          t: 'p',
          text: 'WebGPU is the browser API that gives a page access to the graphics processor for general computation, and this site uses it for the optional generation model where the browser offers it. It matters because tokens per second differ by an order of magnitude between the GPU and CPU paths. It is confused with WebGL, which is a graphics API not built for this work, which is why the fallback here is CPU/WASM rather than WebGL.',
        },
        { t: 'h3', text: 'WASM (WebAssembly)' },
        {
          t: 'p',
          text: 'WebAssembly is a compact binary instruction format that browsers execute close to native speed, and it is the path both models take when WebGPU is unavailable. It runs on the CPU, which is why generation through it lands at roughly 3 to 8 tokens per second. It is confused with JavaScript: the pipeline is JavaScript, and the tensor arithmetic inside it runs as WebAssembly.',
        },
        { t: 'h3', text: 'Context window' },
        {
          t: 'p',
          text: 'The context window is the maximum number of tokens a generative model can attend to at once, covering the instruction, the retrieved passages and the answer produced so far. It is the ceiling on how much material a generated answer can read, and one reason top-k is not simply raised to twenty. It is confused with the size of your library: only the retrieved passages enter the window, never the whole collection.',
        },
        { t: 'h3', text: 'Hallucination' },
        {
          t: 'p',
          text: 'A hallucination is a fluent statement a model produces that the material it was given does not support. Extraction mode here cannot invent text it did not retrieve, because it returns retrieved sentences with citations; the optional generator can, which is why a generated answer is meant to be read against its citations. It is confused with a retrieval miss: an answer that cites nothing relevant is a search problem, not a model inventing facts.',
        },
        { t: 'h3', text: 'Extractive answer' },
        {
          t: 'p',
          text: 'An extractive answer is assembled from the retrieved passages themselves, with every sentence traceable to a document, a page and a chunk. It is the default mode here because it cannot fabricate and needs no generation model, which is what makes the tool usable on a phone or a laptop without WebGPU. It is confused with keyword highlighting: sentences are selected and ordered as an answer, not merely marked in the source text.',
        },
        { t: 'h3', text: 'Strictness' },
        {
          t: 'p',
          text: 'Strictness is the setting that decides how much interpretation the answering step may apply: citations only, a composed sentence from the retrieved text, or the local generator. It is the first control to change when an answer is wrong, because it separates what was retrieved from what was inferred. It is confused with a quality score: it is a policy you choose, not a measurement of the answer you got.',
        },
        { t: 'h3', text: 'IndexedDB' },
        {
          t: 'p',
          text: 'IndexedDB is the browser database holding the chunks and their vectors for this site, keyed by knowledge base and document. It is why an index survives a reload and disappears when you clear site data, and it is what keeps the tool working with no network. It is confused with local storage or a cookie: both are small and synchronous, and neither is meant to hold megabytes of vectors.',
        },
        { t: 'h3', text: 'Service Worker' },
        {
          t: 'p',
          text: 'A service worker is a background script a site can register to intercept network requests and reply from a cache, which is the usual mechanism behind a web page that opens without a connection. The model weights here live in Cache Storage, the same cache API a service worker reads from, and local question answering works offline regardless, because retrieval never needed the network. It is confused with a server: a service worker has no storage beyond caches, cannot answer questions by itself, and is deleted along with site data.',
        },
        { t: 'h3', text: 'OCR (optical character recognition)' },
        {
          t: 'p',
          text: 'OCR reads text out of an image, which is what turns a scan or a photograph of a page into searchable characters. It is not part of this tool: a scanned PDF without a text layer is refused rather than indexed as an empty document, because bundling an OCR model would add hundreds of megabytes to the download. It is confused with parsing: parsing extracts characters that are already present, OCR has to recognise them, and a poor OCR pass produces text that search will happily retrieve and misquote.',
        },
        { t: 'h3', text: 'Text layer' },
        {
          t: 'p',
          text: 'The text layer is the invisible text stored alongside the page image inside a digital PDF, and it is what makes selection, copying and searching possible. Its presence or absence decides whether a PDF can be imported here at all. It is confused with the document looking right: a scanned report can render perfectly on screen and contain no text layer whatsoever, which is why the importer checks the file instead of trusting its appearance.',
        },
        { t: 'h2', text: 'Numbers that recur on this site' },
        {
          t: 'table',
          caption: 'Table 1 — the figures behind the vocabulary above',
          head: ['Value', 'Where it comes from'],
          rows: [
            ['512 and 384', 'Vector dimensions: 512 for bge-small-zh-v1.5, 384 for all-MiniLM-L6-v2 and multilingual-e5-small'],
            ['About 700 characters, 15% overlap', 'Chunk size and the overlap kept between neighbouring chunks'],
            ['k = 60', 'Constant in the RRF formula that fuses the vector and BM25 rankings'],
            ['lambda 0.7', 'MMR weight on relevance against novelty'],
            ['6', 'top-k passages passed to the answering step'],
            ['25 MB, 23 MB, 120 MB', 'Embedder downloads: bge-small-zh-v1.5, all-MiniLM-L6-v2, multilingual-e5-small'],
            ['400 MB to 1.0 GB', 'The optional Qwen2.5 0.5B to 1.5B generator in 4-bit form'],
            ['3 to 8 tokens/s', 'Generation speed on the CPU/WASM path'],
            ['40 files, 200 MB, 20,000 chunks', 'Per-knowledge-base ceilings, with 10 files on phones'],
            ['int8 and 4-bit', 'Quantisation used for the embedders and for the generator respectively'],
          ],
        },
        { t: 'h2', text: 'Where the primary source sits elsewhere' },
        {
          t: 'p',
          text: 'This page describes how these terms are used here, not how they are defined by their originators. For model parameters, quantisation and licences, the upstream model page listed on the models page governs. For browser APIs such as IndexedDB, Cache Storage, WebGPU and WebAssembly, the platform documentation is authoritative. Where a figure here disagrees with a primary source, the primary source is right and this page is wrong: tell us at hello@securerag.app and it gets corrected.',
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'Definitions here are working definitions.',
          text: 'They are written to be checkable against the tool rather than to be complete. A term you cannot verify by watching the interface is a term we have described badly, and that is worth an email.',
        },
      ],
    },
    zh: {
      title: '术语表：RAG、向量嵌入、BM25、RRF、top-k',
      description:
        '21 个浏览器本地检索工具的常用术语：每条一句话定义、本站实际使用的数值，以及最容易与之混淆的相邻概念，便于对照界面逐条核对。',
      h1: '检索术语表',
      intro:
        '这一页解释站内其他地方反复出现的术语：检索与排序、模型格式与运行时、浏览器里的存储，以及每一步各自的失效方式。每条都会说明本站是怎么用这个词的，数值取本站实际发布的值。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '这份术语表按你在本地跑检索工具时遇到它们的顺序，定义 21 个词：检索增强生成是什么、文本如何变成数字、两种检索结果怎么合并、哪些文件格式与浏览器接口在承担这件事，以及每一步会在哪里出错。定义描述的是本站如何用这些词，数值就是实际发布的值。',
        },
        { t: 'h2', text: '怎么读每一条' },
        {
          t: 'p',
          text: '每条包含一句定义、它在实战中为什么重要，以及它最容易被和什么概念搞混。凡是本站特有的数字都直接给出而不是形容，所以这一页上你无法核对的描述很少。',
        },
        { t: 'h2', text: '按你遇到它们的顺序排列' },
        { t: 'h3', text: 'RAG（检索增强生成）' },
        {
          t: 'p',
          text: 'RAG 是先从语料里找出相关段落、再基于这些段落生成回答的做法，而不是只靠模型权重作答。这里的检索是在你自己的文本块上做混合搜索，回答则由两步之一完成：抽取命中的句子，或用可选的本地小模型生成。它常和微调混淆：RAG 不给模型增加知识，它在提问时提供文本，所以删掉一份文档，它马上就不在回答范围里了。',
        },
        { t: 'h3', text: 'embedding（向量嵌入）' },
        {
          t: 'p',
          text: '向量嵌入是一串固定长度的数字，用来代表一段文本，语义相近的文本在空间里彼此靠近。本站用句向量模型为每个文本块算一个向量，所以一个问题能和几乎没有共同词汇的段落匹配上。它常和关键词匹配混淆：嵌入抓住的是语义，丢掉的是精确字符串，而精确字符串正是 BM25 负责补上的那一块。',
        },
        { t: 'h3', text: 'chunking（分块）' },
        {
          t: 'p',
          text: '分块是把解析后的文档切成既足够小、能被嵌入，又足够具体、能被引用的段落。本站按结构分块，约 700 字符、相邻块之间保留 15% 重叠，所以跨在边界上的一句话至少会在某一个块里完整出现。它常和按页切分混淆：页码在这里是引用的锚点，不是分块的单位。',
        },
        { t: 'h3', text: '向量维度' },
        {
          t: 'p',
          text: '向量维度是每个文本块存多少个浮点数，由嵌入模型决定：bge-small-zh-v1.5 是 512 维，all-MiniLM-L6-v2 和 multilingual-e5-small 是 384 维。它决定了每个块的存储开销，也决定了两个模型能不能共用同一个索引。它常和精度混淆：维度多不代表更准，而且两个不同模型的向量无法互相比较，因为 512 维和 384 维之间不存在共享的坐标含义。',
        },
        { t: 'h3', text: '余弦相似度' },
        {
          t: 'p',
          text: '余弦相似度衡量两个向量之间的夹角，忽略各自的长度，取值在 -1 到 1 之间，1 表示方向完全一致。这里的向量检索就用这个分数给文本块排序。它常被当成概率：分数 0.8 并不意味着有 80% 的概率是对的，而且不同嵌入模型的分数之间不可比。',
        },
        { t: 'h3', text: 'BM25' },
        {
          t: 'p',
          text: 'BM25 是一种词法排序函数，按查询词在段落中出现的次数打分，出现得越稀有权重越高，再按段落长度做衰减。它是这里混合搜索的关键词一侧，专门救回精确字符串：错误码、零件编号、人名，以及从合同里复制过来的中文术语。它常和单纯数词频混淆，而稀有词的权重正是它的实质。',
        },
        { t: 'h3', text: 'RRF（倒数排名融合）' },
        {
          t: 'p',
          text: 'RRF 用 1/(k + 名次) 给两条排序列表里的每一项打分再相加，这里的 k 固定为 60。它基于名次而不是分数，所以向量检索和 BM25 检索可以合并，而不必去校准两套本来就不可比的分数尺度。它常和原始分数加权平均混淆，后者需要归一化，一旦某一侧的分数量纲变化就会失准。',
        },
        { t: 'h3', text: 'MMR（最大边际相关）' },
        {
          t: 'p',
          text: 'MMR 重新排序候选段落，在相关性与新鲜度之间取舍：每个新段落的得分等于 λ 乘它的相关度，减去 (1-λ) 乘它与已选段落的相似度，本站 λ 取 0.7。实际效果是交给阅读环节的 6 条覆盖文档的不同位置，而不是同一段话的 6 次复述。它常和去重混淆：近似重复的段落只是被往后排，并没有被删掉，调低 λ 才会主动引入差异更大的内容。',
        },
        { t: 'h3', text: 'top-k' },
        {
          t: 'p',
          text: 'top-k 是交给回答环节的段落数量，这里 k=6。调大它等于同时给阅读环节更多材料和更多噪声，如果开了可选的生成模型，还会消耗上下文窗口。它常和候选池大小混淆：检索阶段打分的段落远多于最终通过 MMR 的那 6 条。',
        },
        { t: 'h3', text: '量化（q4 / q8）' },
        {
          t: 'p',
          text: '量化是用更少的位来存模型权重，q8 是每个权重 8 位、q4 是 4 位，代价是一些精度，收益是下载体积和内存占用。这里的嵌入模型以 int8 的 ONNX 版本发布，可选的 Qwen2.5 生成模型是 4-bit 仅权重量化，正是它把体积压到 400MB–1.0GB 这个区间。它常和普通文件压缩混淆：量化之后的数值就是模型实际参与运算的数值，加载时并不会还原成完整精度。',
        },
        { t: 'h3', text: 'ONNX' },
        {
          t: 'p',
          text: 'ONNX 是一种描述神经网络计算图的开放文件格式，本站下载的 .onnx 文件就是这种格式的嵌入模型和生成模型权重。它存在的意义是让在一个框架里训练出来的模型能被另一个运行时执行，包括跑在浏览器里的运行时。它常和运行时混淆：ONNX 描述计算图，onnxruntime-web 负责执行它。',
        },
        { t: 'h3', text: 'WebGPU' },
        {
          t: 'p',
          text: 'WebGPU 是让网页使用图形处理器做通用计算的浏览器接口，在浏览器支持的情况下，本站在可选的生成模型上使用它。它重要是因为 GPU 路径和 CPU 路径的每秒 token 数差一个数量级。它常和 WebGL 混淆，而 WebGL 是面向图形的接口，并不为这类计算设计，这也是本站的回退路径是 CPU/WASM 而不是 WebGL 的原因。',
        },
        { t: 'h3', text: 'WASM（WebAssembly）' },
        {
          t: 'p',
          text: 'WebAssembly 是浏览器能以接近原生速度执行的紧凑二进制指令格式，在没有 WebGPU 时，两个模型都走这条路。它跑在 CPU 上，所以通过它生成回答大约只有每秒 3 到 8 个 token。它常和 JavaScript 混淆：整个管线是 JavaScript，其中的张量运算以 WebAssembly 执行。',
        },
        { t: 'h3', text: '上下文窗口' },
        {
          t: 'p',
          text: '上下文窗口是生成模型一次能关注的最大 token 数，涵盖指令、检索到的段落以及已经生成的回答。它决定了生成的回答一次能读多少材料，也是 top-k 不能简单调到二十的原因之一。它常和你的资料库大小混淆：进入窗口的只有被检索到的段落，绝不会是整个库。',
        },
        { t: 'h3', text: '幻觉' },
        {
          t: 'p',
          text: '幻觉是模型说出的、给定材料并不支持的一句流畅陈述。这里的抽取式回答不可能编出没有检索到的文字，因为它返回的就是带引用的原文句子；可选的本地生成模型则有这个风险，所以生成的回答应当对照引用去读。它常和检索失败混淆：一条引用什么都对不上的回答是搜索出了问题，不是模型编造了事实。',
        },
        { t: 'h3', text: '抽取式回答' },
        {
          t: 'p',
          text: '抽取式回答由检索到的段落本身拼成，每一句都能追溯到某份文档、某一页、某个文本块。它是本站的默认方式，因为它编不出内容，也不需要生成模型，这也是手机或没有 WebGPU 的笔记本上依然可用的原因。它常和高亮关键词混淆：句子是被挑选并组织成回答的，不只是被标记在原文里。',
        },
        { t: 'h3', text: '严格度' },
        {
          t: 'p',
          text: '严格度决定回答环节可以做多少解释：只给引用、基于检索文本组织句子，或者交给本地生成模型。回答不对时最先该动的就是它，因为它把「检索到了什么」和「推断出了什么」分开。它常和被当成质量分数：它是你选的策略，不是对你这次回答的测量。',
        },
        { t: 'h3', text: 'IndexedDB' },
        {
          t: 'p',
          text: 'IndexedDB 是浏览器里的数据库，本站用它按知识库和文档保存文本块及其向量。它让索引在刷新后仍然存在，也让清除站点数据时索引一起消失，同时是没有网络时工具仍能工作的原因。它常和本地存储或 Cookie 混淆：后两者容量小得多，也都不适合存放以 MB 计的向量。',
        },
        { t: 'h3', text: 'Service Worker' },
        {
          t: 'p',
          text: 'Service Worker 是站点可以注册的后台脚本，用来拦截网络请求并从缓存中回应，这也是网页断网还能打开时的常见机制。本站的模型权重存在 Cache Storage 里，而 Service Worker 读的正是同一套缓存接口；本地问答在离线状态下仍能工作，是因为检索本来就不需要网络。它常和服务器混淆：除了缓存它没有别的存储，也不能自己回答问题，并且会随站点数据一起被删除。',
        },
        { t: 'h3', text: 'OCR（光学字符识别）' },
        {
          t: 'p',
          text: 'OCR 是把文字从图像里读出来，也就是把扫描件或翻拍页面变成可搜索字符的那一步。它不在本工具里：没有文字层的扫描件 PDF 会被拒绝，而不是当成空文档索引进去，因为内置一个 OCR 模型会让下载体积多出几百 MB。它常和解析混淆：解析提取的是本来就存在的字符，OCR 需要先识别它们，而一次糟糕的 OCR 会产出能被检索到、并被错误引用的文本。',
        },
        { t: 'h3', text: '文本层' },
        {
          t: 'p',
          text: '文本层是数字 PDF 里与页面图像并存的隐藏文本，选择、复制、搜索都靠它。它的有无直接决定一份 PDF 在这里能不能被导入。它常和「文件看起来正常」混淆：一份扫描版报告在屏幕上可以显示得非常清楚，却完全不含文本层，所以导入器去检查文件本身，而不是相信外观。',
        },
        { t: 'h2', text: '本站反复出现的数字' },
        {
          t: 'table',
          caption: '表 1 — 上面这些词汇背后的数值',
          head: ['数值', '出处'],
          rows: [
            ['512 与 384', '向量维度：bge-small-zh-v1.5 为 512，all-MiniLM-L6-v2 与 multilingual-e5-small 为 384'],
            ['约 700 字符，15% 重叠', '文本块大小，以及相邻块之间保留的重叠'],
            ['k = 60', 'RRF 公式里的常数，用来融合向量与 BM25 两套排序'],
            ['λ = 0.7', 'MMR 中相关性相对新鲜度的权重'],
            ['6', '交给回答环节的 top-k 段落数'],
            ['25MB / 23MB / 120MB', '三个嵌入模型的下载体积：bge-small-zh-v1.5、all-MiniLM-L6-v2、multilingual-e5-small'],
            ['400MB–1.0GB', '可选的 Qwen2.5 0.5B–1.5B 生成模型，4-bit 版本'],
            ['3–8 token/s', 'CPU/WASM 路径上的生成速度'],
            ['40 份 / 200MB / 20,000 块', '单库上限，手机端文件上限为 10 份'],
            ['int8 与 4-bit', '嵌入模型与生成模型分别使用的量化方式'],
          ],
        },
        { t: 'h2', text: '权威说明在别处' },
        {
          t: 'p',
          text: '这一页写的是这些词在本站的用法，而不是提出者的定义。模型的参数量、量化方式与许可，以模型页面里列出的上游模型页为准；IndexedDB、Cache Storage、WebGPU、WebAssembly 这类浏览器接口，以平台文档为准。如果这里的某个数字与原始出处冲突，原始出处是对的、这一页是错的：写信到 hello@securerag.app，我们会改正。',
        },
        {
          t: 'callout',
          kind: 'info',
          title: '这里的定义是可操作的定义。',
          text: '它们是为了让你能对着工具逐条核对而写，不是为了追求大而全。凡是你在界面上核不对的术语，都是我们没写清楚，值得来信指出。',
        },
      ],
    },
  },
} satisfies ContentPage;
