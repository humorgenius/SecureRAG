import type { ContentPage } from './types';

export default {
  slug: 'security',
  nav: '/security/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
    { path: '/how-it-works/', labelEn: 'How it works', labelZh: '工作原理' },
    { path: '/privacy/', labelEn: 'Privacy policy', labelZh: '隐私政策' },
    { path: '/terms/', labelEn: 'Terms of use', labelZh: '使用条款' },
  ],
  copy: {
    en: {
      title: 'Security and data flow: nothing your browser did not do',
      description:
        'Where each processing step runs, the four layers of defence, the boundaries we cannot control, and a five-minute DevTools verification.',
      h1: 'Security and data flow, written so you can check it',
      intro:
        'Your documents are parsed, chunked, embedded, indexed and searched inside one browser tab. This page maps each step to where it happens, lists the four layers that keep it that way, and shows how to confirm the whole thing in DevTools.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'There is no upload path in this application, so there is no document store, no queue, no log line and no database row containing your files. The only request the site ever makes is a plain file download of model weights, requested by name.',
        },
        { t: 'h2', text: 'The life of one document, step by step' },
        {
          t: 'table',
          caption: 'Table 1 — where each step runs, and whether anything leaves your device',
          head: ['Step', 'Where it runs', 'Leaves your device?'],
          rows: [
            [
              'You drag a PDF, DOCX, Markdown or plain-text file onto the page',
              'Your browser, in memory, through the local File API',
              'No',
            ],
            [
              'Format detection',
              'Your browser — magic bytes in the file header, not the file extension',
              'No',
            ],
            [
              'Text extraction (PDF text layer, Word headings, Markdown structure)',
              'Your browser — the parser is compiled into the site and served from our own files',
              'No',
            ],
            [
              'Cleaning, chunking, overlap between chunks',
              'Your browser, in a Web Worker',
              'No',
            ],
            [
              'Vectorisation of every chunk',
              'Your browser — onnxruntime WebAssembly or WebGPU, both bundled with the site',
              'No',
            ],
            [
              'Index write (chunks plus vectors)',
              'Your browser — IndexedDB, inside your own browser profile',
              'No',
            ],
            [
              'Model weights, on first use only',
              'A public model host: HuggingFace or a mirror',
              'Yes — a single GET carrying the file name only',
            ],
            [
              'Your question',
              'Your browser — embedded with the same local model',
              'No',
            ],
            [
              'Retrieval: vector search and keyword search, merged',
              'Your browser',
              'No',
            ],
            [
              'Answer assembly, or local text generation',
              'Your browser',
              'No',
            ],
            [
              'Citations, copy, print, export',
              'Your browser',
              'No request is involved',
            ],
            [
              'Advertising, on the pages that carry it',
              'Google AdSense, and personalized only after you agree to ad scripts',
              'Yes — page level only, and never inside the chat workspace',
            ],
            [
              'Deleting everything',
              'Your browser — clear site data',
              'No; deletion is local and immediate',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: 'The short version:',
          text: 'one outbound request, on first use, for a model file. Everything that touches the content of your documents happens on the machine you are sitting at.',
        },
        { t: 'h2', text: 'Four layers of defence' },
        { t: 'h3', text: '1. The code layer: there is no upload path to disable' },
        {
          t: 'p',
          text: 'The site is a set of static HTML, CSS and JavaScript files. There is no server-side code, no database, no accounts and no endpoint that accepts a document, which means there is nothing to misconfigure later. A content security policy is sent with every page and limits where the page is allowed to connect: the model host and its file delivery host, plus Google\u2019s ad origins on the handful of pages that show ads. Pages like this one carry no ad slots at all, so those origins are never allowed here.',
        },
        {
          t: 'ul',
          items: [
            'No analytics SDK, no session recording, no heatmap script, no support chat widget.',
            'No third-party font or script CDN: the fonts and the onnxruntime WebAssembly build are served from this site.',
            'The model host is a plain file server. It receives a file name, it hands back a file, and it is never given a place to send anything.',
            'A page that shows ads still receives no document content, because the ad script runs in the page frame, outside the worker where your text and vectors live.',
          ],
        },
        { t: 'h3', text: '2. The verifiable layer: watch the traffic yourself' },
        {
          t: 'p',
          text: 'The application has a network shield panel that lists every request the page makes while you work — host, path, size and purpose — and marks anything that is not on the disclosed allow-list. It exists so that a claim on this page can be checked against what your own browser sees, instead of being taken on trust. The DevTools procedure below does the same job with a tool nobody has to trust us for.',
        },
        { t: 'h3', text: '3. The disclosure layer: models ask before they download' },
        {
          t: 'p',
          text: 'Any file above 30 MB, and in fact every model file, is behind a panel that names the file, its exact size, its host and its licence before anything is transferred. Nothing is fetched while a page loads, and nothing is fetched quietly while you type. The sizes and licences are listed in full on the models page.',
        },
        { t: 'h3', text: '4. The legal layer: commitments you can hold us to' },
        {
          t: 'p',
          text: 'The privacy policy states what is not collected, not merely what is. The terms state that your documents remain yours. Both pages carry a last-updated date, and a change in behaviour is a change to those pages — not a silent release note.',
        },
        { t: 'h2', text: 'How to verify us yourself, in about five minutes' },
        {
          t: 'steps',
          items: [
            {
              title: 'Open the tool and DevTools together',
              text: 'Press F12, or Command-Option-I on a Mac, and go to the Network tab. Tick “Preserve log” so a reload does not wipe the evidence.',
            },
            {
              title: 'Clear the request list',
              text: 'Use the clear button. You start from an empty list, so anything that appears afterwards is caused by what you do next.',
            },
            {
              title: 'Add a document',
              text: 'Drop in a PDF and watch the indexing progress. The request list stays empty while the browser parses, chunks and vectorises the file.',
            },
            {
              title: 'Ask three questions',
              text: 'Still empty. Retrieval, ranking and the retrieval-only answer path are all local, and the list proves it.',
            },
            {
              title: 'Force the one model request',
              text: 'In a fresh browser profile, or after clearing site data, ask a question again. You will see a single request to the model host. Its path holds the model file name, it carries no query string about your content, no cookie and no request body.',
            },
            {
              title: 'Cut the network and keep working',
              text: 'Switch the Network tab to Offline and ask another question. It still answers, with citations, which is only possible if nothing was being sent away.',
            },
            {
              title: 'Delete everything and see what is gone',
              text: 'Go to the Application tab: IndexedDB holds your chunks and vectors, Cache Storage holds the model weights. Clear site data, reload, and the library is empty. There is no copy elsewhere for anyone to restore.',
            },
          ],
        },
        { t: 'h2', text: 'Security boundaries: what we cannot control' },
        {
          t: 'p',
          text: 'A page listing only strengths is an advertisement, not a security page. These are the risks that sit outside the application, and the app does not pretend otherwise.',
        },
        {
          t: 'ul',
          items: [
            'Password-protected or encrypted PDFs cannot be opened. There is no decryption step, so you get an error rather than a partial result.',
            'Scanned documents without a text layer produce no usable text. No OCR engine ships with the site, and we say so instead of returning an empty answer.',
            'Size limits are enforced rather than hidden: up to 25 MB per file, 40 files per library, 200 MB in total and 20,000 chunks. Larger collections are refused up front.',
            'On a shared or public computer, the library lives in that computer\u2019s browser profile. Anyone who can use that profile can open your documents. Use a private window and clear site data when you are done.',
            'Our storage sits in IndexedDB and is not encrypted by the application. Whatever protects it is your operating system and browser profile encryption, or the absence of both — that part is your device\u2019s job, not ours.',
            'Browser extensions with permission to read pages can read the page, the text it is showing and the data the page can reach. We cannot block that. Auditing your installed extensions matters more than trusting any website.',
            'Malware, keyloggers or someone with physical access to your device can do things no browser-based tool can prevent.',
            'A screenshot, a printed page or a downloaded copy leaves the browser\u2019s protection behind, because it is now an ordinary image or file on a device.',
            'Loss of local data is a real risk: clearing site data, a browser cleanup tool or a wiped profile removes the index, and there is no backup on our side to restore it from.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'We do not claim this is 100% secure, or even that we cannot be wrong.',
          text: 'The honest claim is narrower and easier to test: there is no server holding your documents, the only outbound request carries a file name, and you can watch all of it in DevTools. Treat any page that promises perfect safety as a warning sign, including ours.',
        },
        { t: 'h2', text: 'Reporting a security problem' },
        {
          t: 'p',
          text: 'Write to guweiicy@gmail.com. Include the browser and version, the steps that reproduce the problem, and what you observed in DevTools if you saw something unexpected. This is a small project with no bug bounty programme, and we would rather tell you that plainly than imply a reward that does not exist. Anything that turns out to be real gets fixed and described in the changelog.',
        },
      ],
    },
    zh: {
      title: '安全与数据流：全部发生在你的浏览器里',
      description:
        '文档处理的每一步在哪里执行、四道防线分别是什么、我们控制不了的边界有哪些，以及五分钟就能自己验证全过程的具体操作步骤与命令。',
      h1: '安全与数据流，写成你能亲手核对的样子',
      intro:
        '你的文档在一个浏览器标签页里完成解析、分块、向量化、建索引和检索。这一页把每一步对应到具体位置，列出维持这个状态的四道防线，并给出用开发者工具确认全过程的步骤。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '这个应用里没有上传路径，所以也没有文档存储、没有队列、没有日志、没有一行数据库记录装着你的文件。整站唯一会发出的请求，是一次按文件名索取模型权重的普通文件下载。',
        },
        { t: 'h2', text: '一份文档的完整旅程，逐步对照' },
        {
          t: 'table',
          caption: '表 1 — 每一步在哪里执行，有没有东西离开你的设备',
          head: ['步骤', '在哪里执行', '会离开你的设备吗'],
          rows: [
            ['你把 PDF、DOCX、Markdown 或纯文本文件拖进页面', '你的浏览器，通过本地 File API 读入内存', '不会'],
            ['识别文件格式', '你的浏览器——读文件头部的魔数，不看扩展名', '不会'],
            ['抽取文本（PDF 文字层、Word 标题层级、Markdown 结构）', '你的浏览器——解析器编译进站点，由我们自己的文件提供', '不会'],
            ['清洗、分块、块间重叠', '你的浏览器，在 Web Worker 里', '不会'],
            ['把每个文本块转成向量', '你的浏览器——onnxruntime 的 WebAssembly 或 WebGPU 版本，都随站点自带', '不会'],
            ['写入索引（文本块与向量）', '你的浏览器——IndexedDB，在你自己的浏览器配置目录里', '不会'],
            ['模型权重，仅在首次使用时', '公开模型托管站：HuggingFace 或镜像', '会——一个只带文件名的 GET 请求'],
            ['你的提问', '你的浏览器——用同一个本地模型转成向量', '不会'],
            ['检索：向量检索与关键词检索，然后融合', '你的浏览器', '不会'],
            ['拼接回答，或本地生成回答', '你的浏览器', '不会'],
            ['引用、复制、打印、导出', '你的浏览器', '不涉及任何请求'],
            ['广告，只出现在有广告位的页面', 'Google AdSense，且只在你同意加载广告脚本之后', '会——仅限页面层面，绝不进入聊天工作区'],
            ['删除全部数据', '你的浏览器——清除站点数据', '不需要任何请求，删除是本地且立即的'],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: '一句话版本：',
          text: '只有一次外发请求，在首次使用时，内容是一个模型文件。凡是碰到你文档内容的环节，全部发生在你正坐着的这台机器上。',
        },
        { t: 'h2', text: '四道防线' },
        { t: 'h3', text: '一、代码层：不存在可以关掉的上传路径' },
        {
          t: 'p',
          text: '整个站点是一组静态 HTML、CSS 和 JavaScript 文件。没有服务端代码、没有数据库、没有账号系统，也没有接收文档的接口，所以也不存在以后被错误配置的可能。每个页面都带内容安全策略（CSP），限制页面能连接到哪里：模型托管站及其文件分发域名，以及在少数带广告的页面上，Google 的广告域名。这一页也带广告位。',
        },
        {
          t: 'ul',
          items: [
            '没有统计 SDK、没有会话录制、没有热力图脚本、没有在线客服组件。',
            '没有第三方字体或脚本 CDN：字体和 onnxruntime 的 WebAssembly 版本都由本站自己提供。',
            '模型托管方只是一个普通文件服务器。它收到一个文件名，返回一个文件，我们从来没给它留过接收内容的地方。',
            '带广告的页面同样拿不到文档内容，因为广告脚本运行在页面框架里，而你的文本和向量在 Worker 里，两者不在一处。',
          ],
        },
        { t: 'h3', text: '二、可验证层：流量你自己就能看' },
        {
          t: 'p',
          text: '它存在的意义，是让这一页上的说法能对照你浏览器实际看到的东西，而不是靠相信我们。下面的开发者工具步骤做的是同一件事，用的是你不需要信任任何人都能用的工具。',
        },
        { t: 'h3', text: '三、展示层：模型下载前要你确认' },
        {
          t: 'p',
          text: '超过 30MB 的文件都要确认，实际上每一个模型文件都在确认之列：面板会把文件名、精确体积、来源主机和许可写在上面，然后才开始传输。页面加载时不会下载，你打字时也不会偷偷下载。全部体积与许可在《模型》一页里完整列出。',
        },
        { t: 'h3', text: '四、法律层：可以拿来要求我们的承诺' },
        {
          t: 'p',
          text: '隐私政策写明我们不收集什么，不只是写明收集什么；使用条款写明你的文档始终属于你。两页都带最后更新日期，行为变了，这两页就会变，而不是只在更新日志里悄悄提一句。',
        },
        { t: 'h2', text: '五分钟，自己把上面的话验一遍' },
        {
          t: 'steps',
          items: [
            {
              title: '同时打开工具页和开发者工具',
              text: '按 F12，Mac 上按 Command-Option-I，切到 Network 面板。勾上「Preserve log」，这样刷新一次也不会把证据冲掉。',
            },
            {
              title: '清空请求列表',
              text: '点清空按钮，从一个空列表开始。之后出现的任何请求，都是你接下来的操作导致的。',
            },
            {
              title: '添加一份文档',
              text: '拖入一个 PDF，看着索引进度走。浏览器解析、分块、向量化的过程中，请求列表一直是空的。',
            },
            {
              title: '连问三个问题',
              text: '依然是空的。检索、排序、检索档的回答都在本地完成，列表本身就是证据。',
            },
            {
              title: '制造那唯一一次模型请求',
              text: '换一个全新的浏览器配置目录，或先清除站点数据，再问一次。你会看到发往模型托管站的一个请求：路径里是模型文件名，没有和你内容相关的查询串，没有 Cookie，没有请求体。',
            },
            {
              title: '断网之后继续用',
              text: '把 Network 面板切到 Offline，再问一个问题。它照样带引用回答出来——如果有任何东西被发走，这一步不可能成立。',
            },
            {
              title: '删掉一切，看看少了什么',
              text: '切到 Application 面板：IndexedDB 里是你的文本块和向量，Cache Storage 里是模型权重。清除站点数据、刷新，文档库空了。别处没有副本可以恢复。',
            },
          ],
        },
        { t: 'h2', text: '安全边界：我们控制不了的部分' },
        {
          t: 'p',
          text: '只讲优点的页面是广告，不是安全页。下面这些风险在应用之外，我们不假装它们不存在。',
        },
        {
          t: 'ul',
          items: [
            '带口令或加密的 PDF 打不开。这里没有解密环节，所以你得到的是一条报错，而不是一半内容。',
            '没有文字层的扫描件抽不出可用文本。站内不带 OCR 引擎，我们会直接说明，而不是返回一个空回答。',
            '体积限制是硬性的，不是藏着不说的：单文件 25MB、单个库最多 40 份、总量 200MB、最多 20,000 个文本块。超出就在一开始被拒绝。',
            '在共用或公共电脑上，文档库就存在那台电脑的浏览器配置里。能用这个配置的人就能打开你的文档。用完请用隐私窗口，并清除站点数据。',
            '我们的存储放在 IndexedDB 里，应用本身不做加密。真正保护它的是你系统的磁盘加密和浏览器配置加密，或者两者都没有——这部分是你设备的事，不是我们的。',
            '有读取页面权限的浏览器扩展可以读到页面、页面上显示的文字，以及页面能接触到的数据。我们拦不住这类扩展。检查一下你装了哪些扩展，比相信任何网站都重要。',
            '恶意软件、键盘记录程序，或者能物理接触你设备的人，能做到任何基于浏览器的工具都拦不住的事。',
            '截图、打印出来的页面、下载下来的副本，都会脱离浏览器的保护——因为它们已经是设备上普通的图片和文件了。',
            '本地数据丢失是真实风险：清除站点数据、浏览器清理工具、或者被重置的配置，都会带走索引，而我们这边没有任何备份可以还给你。',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '我们不说自己 100% 安全，也不说自己不会出错。',
          text: '能站得住的说法要窄得多，也好验证得多：没有服务器存着你的文档，唯一的外发请求只带一个文件名，而这一切你都能在开发者工具里看到。任何承诺「绝对安全」的页面都值得警惕，包括我们的。',
        },
        { t: 'h2', text: '报告安全问题' },
        {
          t: 'p',
          text: '写信到 guweiicy@gmail.com，附上浏览器和版本号、能复现问题的步骤，以及你在开发者工具里看到的异常。这是一个小项目，没有漏洞赏金计划，我们宁愿把这话说清楚，也不愿暗示一个并不存在的奖励。确认属实的问题会修掉，并写进更新日志。',
        },
      ],
    },
  },
} satisfies ContentPage;
