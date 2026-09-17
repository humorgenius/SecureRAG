import type { ContentPage } from './types';

export default {
  slug: 'about',
  nav: '/about/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '管线如何运转' },
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/contact/', labelEn: 'Contact', labelZh: '联系方式' },
    { path: '/privacy/', labelEn: 'Privacy policy', labelZh: '隐私政策' },
  ],
  copy: {
    en: {
      title: 'About SecureRAG: a browser-local document tool',
      description:
        'What this site is, why it was built, which open-source libraries carry it, the things it refuses to do, and the checks that verify every claim.',
      h1: 'About this site',
      intro:
        'SecureRAG is a static website whose only tool answers questions about your own documents without sending them anywhere: the parsing, indexing and retrieval code runs in the browser tab, and the models that power it are downloaded once into your own browser storage. This page covers why it exists, what it is built from, what it refuses to do, and how to check all of it yourself.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'This is a website about a browser-local retrieval tool: static HTML and JavaScript, no backend, no database, no account, and a single outbound request that fetches model weight files by name. It exists because the alternative for most people is uploading a document to a service they cannot inspect, and because the technical pieces needed to avoid that have only recently become good enough to work in a browser tab.',
        },
        { t: 'h2', text: 'What this site is, and what it is not' },
        {
          t: 'table',
          caption: 'Table 1 — the shape of the project',
          head: ['Question', 'Answer'],
          rows: [
            ['What it is', 'A set of static files that deliver one tool: ask questions about your own PDF, DOCX or text files, with citations, entirely in the browser'],
            ['What it is not', 'Not a company, not a service with an account system, not a storage provider, not an API, not a chatbot with memory'],
            ['Where documents go', 'Nowhere. They are parsed in the tab and stored in your own IndexedDB and Cache Storage'],
            ['What it costs', 'Nothing. There is no paid tier, no trial and no subscription to cancel'],
            ['How it is funded', 'Google AdSense on a limited set of pages, loaded only after you agree'],
            ['Who runs it', 'One developer and a small number of contributors. No company entity, no registered office, no funding round to describe'],
          ],
        },
        { t: 'h2', text: 'Why it was built' },
        {
          t: 'p',
          text: 'The trigger was ordinary. A contract, a report and a set of meeting notes needed answering, and every tool available wanted the file first. Uploading a client contract to a third-party service means deciding that a company you cannot audit may hold it indefinitely, and for a lot of documents that is simply not a decision worth making. The obvious alternative, reading 200 pages by hand, is slow enough that people take the upload instead.',
        },
        {
          t: 'p',
          text: 'What changed recently is that retrieval no longer needs a server. A small embedding model quantised to int8 is about 23 to 25 MB, a browser can run it through WebAssembly in seconds, and an index of 20,000 chunks fits comfortably in IndexedDB. Once those three facts hold, the server stops being a requirement and starts being a data collection point. This site is what you get when you remove it.',
        },
        { t: 'h2', text: 'Where the privacy stance comes from' },
        {
          t: 'p',
          text: 'The stance is architectural rather than a promise. There is no upload endpoint to secure, no server-side index to encrypt, no retention period to shorten, because there is no server holding the data. That removes a class of risk that a policy document cannot remove: a subpoena, a breach, an acquihire, a misconfigured storage bucket. It also means we cannot help you recover anything, and that trade is the whole point of this page.',
        },
        {
          t: 'p',
          text: 'The same logic applies to accounts. An account exists to give a server someone to bill, remember and identify. Remove the server and the account has nothing left to do, which is why there is no sign-up form anywhere on this site.',
        },
        { t: 'h2', text: 'What it is built from' },
        {
          t: 'p',
          text: 'Every piece is open source and public, which is what makes the claims above checkable by reading code rather than by trusting a sentence.',
        },
        {
          t: 'table',
          caption: 'Table 2 — the stack, and the job each part does',
          head: ['Component', 'Role here'],
          rows: [
            ['Astro, static output', 'Generates the pages as pre-built HTML with no server-side rendering at request time, which is why the site can be served from any static host'],
            ['Preact islands', 'Ships only the interactive parts as JavaScript: the workspace, the file drop zone, the settings panel. A documentation page loads no application code'],
            ['Transformers.js', 'Runs the embedding and generation models in the browser, with the same model files the upstream libraries consume'],
            ['onnxruntime-web', 'Executes the ONNX model graphs, on WebGPU where available and through WebAssembly on the CPU otherwise'],
            ['PDF.js', 'Parses PDF files in the browser and keeps page numbers attached to the extracted text, which is what makes a citation point at a page'],
            ['jszip', 'Reads DOCX, which is a ZIP container of XML parts, and keeps heading levels attached to the text inside it'],
            ['IndexedDB', 'Stores text chunks and their vectors per knowledge base in your browser'],
            ['Cache Storage', 'Stores the model weight files, so the download happens once per model rather than once per visit'],
          ],
        },
        {
          t: 'p',
          text: 'The WebAssembly binaries that onnxruntime needs are published with the site itself rather than pulled from a third-party content network, so the number of external hosts involved in the tool stays at one: the model host.',
        },
        { t: 'h2', text: 'What we deliberately do not do' },
        {
          t: 'ul',
          items: [
            'No accounts. There is no registration, no login and no email address required to use the tool, so there is nothing to lose in a credential breach.',
            'No cloud sync. Documents indexed on one machine are not available on another, because syncing them would require a server to hold them. Moving an index means re-importing the files.',
            'No bring-your-own-key upload. The site does not ask for an API key and does not offer to send your documents to a provider under your credentials. That design would keep the file leaving your device, which is the thing this project exists to avoid.',
            'No analytics, no tracking pixels and no session recording. There is no third-party measurement script on any page; the only third-party script present is the advertising one, and only where ads exist and only with your consent.',
            'No training on your content, and no mechanism by which it could happen, because no copy of it leaves the browser.',
            'No claim of accuracy. The tool retrieves and, optionally, generates; it does not verify. Anything that has to be right gets checked by a person against the cited passage.',
          ],
        },
        { t: 'h2', text: 'How to verify us in about two minutes' },
        {
          t: 'steps',
          items: [
            {
              title: 'Watch the network while you add a file',
              text: 'Open DevTools with F12, go to the Network tab, clear it, filter by Fetch/XHR and drop in a document. No request carries the file. What you see are GET requests for ONNX weight files, with a file name in the path and no request body.',
            },
            {
              title: 'Pull the plug and ask a question',
              text: 'Switch the Network panel to offline and ask something about the document you just imported. The answer arrives with citations, which is only possible if retrieval, chunking and embedding were local all along.',
            },
            {
              title: 'Look at what is stored, and where',
              text: 'In the Application tab, expand IndexedDB and you will find a database called securerag, holding one metadata record per document and, under an index key, the chunk text with its Float32Array vectors; expand Cache Storage on the same origin and you will find the model weights. Clear site data and both are gone, with nothing left for us to delete.',
            },
            {
              title: 'Read the page source for what is missing',
              text: 'View source on any page and search for the usual analytics hosts. There is no measurement script, no font or script pulled from a third-party content network, and no hidden form posting anywhere.',
            },
            {
              title: 'Check the model host yourself',
              text: 'The models page names each model and links to its upstream page, where you can read the parameter count, the quantisation and the licence, and compare them with the figures published here.',
            },
            {
              title: 'Then tell us what you found',
              text: 'If a check above fails, that is a bug worth reporting rather than a wording problem. Write to hello@securerag.app with the browser you used and what you saw.',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: 'A claim you cannot test is worth less than one you can.',
          text: 'Everything asserted on this site is meant to be checkable from your own browser, without an account, a tool from us or a leap of faith.',
        },
        { t: 'h2', text: 'Known limitations, stated here as well' },
        {
          t: 'p',
          text: 'The tool is deliberately small in scope, and the honest list is: it runs only on current browsers with WebAssembly and writable site storage; it refuses encrypted PDFs, scanned PDFs without a text layer, legacy .doc and any file above 25 MB; a knowledge base holds at most 40 documents, 200 MB and 20,000 chunks, with 10 files on phones; the optional generator is roughly 3 to 8 tokens per second on the CPU path and produces text that still has to be checked against its citations; and indexing lives per browser profile, so a cleared site or a new machine starts from an empty index.',
        },
        { t: 'h2', text: 'Contact' },
        {
          t: 'p',
          text: 'Corrections, questions and reports go to hello@securerag.app. The contact page describes what to include so that a report can be acted on, and the changelog records what changed once it has been.',
        },
      ],
    },
    zh: {
      title: '关于 SecureRAG：只跑在浏览器里的跨格式文件索引工具',
      description:
        '这个站点是什么、为什么做、由哪些开源库构成、刻意不做的四件事（账号、云同步、代上传、统计），以及两分钟内可以自己验证的每一项说法。',
      h1: '关于这个项目',
      intro:
        'SecureRAG 是一个静态站点，它唯一的工具能在不把文档发到任何地方的前提下回答你文档里的问题：解析、建索引、检索都在浏览器标签页内完成，支撑它的模型只下载一次，存进你自己的浏览器存储。这一页说明它为什么存在、由什么搭起来、刻意不做什么，以及怎么自己把这些都验证一遍。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '这是一个关于「浏览器本地检索工具」的站点：静态 HTML 与 JavaScript，没有后端、没有数据库、没有账号，只有一个按文件名下载模型权重的外发请求。它之所以存在，是因为对多数人来说，另一条路是把文档上传给一个自己无法检查的服务；而避开这条路所需要的技术件，直到最近才足够好，能在浏览器标签页里跑起来。',
        },
        { t: 'h2', text: '这个站点是什么，不是什么' },
        {
          t: 'table',
          caption: '表 1 — 项目的形态',
          head: ['问题', '回答'],
          rows: [
            ['它是什么', '一组静态文件，交付一个工具：在自己的 PDF、DOCX 或文本文件上提问，带引用，全程在浏览器里'],
            ['它不是什么', '不是公司，不是有账号体系的服务，不是网盘，不是 API，也不是带记忆的聊天机器人'],
            ['文档去了哪里', '哪里都没去。它们在标签页里被解析，存进你自己的 IndexedDB 与 Cache Storage'],
            ['要花多少钱', '零。没有付费档、没有试用期，也没有需要取消的订阅'],
            ['靠什么维持', '只有限的若干页面上放 Google AdSense，且只在你同意后才加载'],
            ['谁在做', '一个开发者和少量贡献者。没有公司实体、没有注册地址、没有融资轮次可以介绍'],
          ],
        },
        { t: 'h2', text: '为什么做这件事' },
        {
          t: 'p',
          text: '起点很普通。一份合同、一份报告和一堆会议记录需要找答案，而当时能找到的工具都先要文件。把客户合同上传给第三方服务，等于认定一家你无法审计的公司可以长期持有它；对很多文档来说，这个决定根本不值得做。另一条显而易见的路是手工读两百页，慢到人们宁愿选择上传。',
        },
        {
          t: 'p',
          text: '近几年变化的是：检索不再必须依赖服务器。量化为 int8 的小型嵌入模型只有 23 到 25MB，浏览器通过 WebAssembly 几秒就能跑起来，两万个文本块的索引放进 IndexedDB 也是轻松的。当这三件事同时成立，服务器就从必需品变成了数据收集点。把它拿掉之后剩下的东西，就是这个站点。',
        },
        { t: 'h2', text: '隐私立场从哪里来' },
        {
          t: 'p',
          text: '这份立场来自架构，而不是一句承诺。这里没有需要加固的上传接口，没有需要加密的服务器端索引，也没有需要缩短的保留期，因为不存在持有数据的服务器。这消掉了一整类风险：传票、泄露、被收购后的数据转移、配错的存储桶——而这些都不是一份政策文档能消掉的。代价是我们也无法替你找回任何东西，这个交换正是这一页的全部要点。',
        },
        {
          t: 'p',
          text: '同样的逻辑适用于账号。账号的存在是为了让服务器有人可以计费、可以记住、可以识别。把服务器拿掉，账号就没有事情可做了，所以本站上没有任何注册表单。',
        },
        { t: 'h2', text: '它由什么搭起来' },
        {
          t: 'p',
          text: '每一块都是开源且公开的，这正是上面那些说法能靠读代码来核对、而不必靠信任一句话的原因。',
        },
        {
          t: 'table',
          caption: '表 2 — 技术栈，以及每一部分承担的工作',
          head: ['组件', '在这里的作用'],
          rows: [
            ['Astro，静态输出', '把页面预先生成为 HTML，请求时不经过服务端渲染，所以任何静态托管都能承载这个站点'],
            ['Preact 工具岛', '只把交互部分作为 JavaScript 发出：工作区、文件拖放区、设置面板。文档类页面不加载应用代码'],
            ['Transformers.js', '在浏览器里运行嵌入与生成模型，使用与上游库相同的模型文件'],
            ['onnxruntime-web', '执行 ONNX 计算图：有 WebGPU 时走 GPU，否则通过 WebAssembly 跑在 CPU 上'],
            ['PDF.js', '在浏览器里解析 PDF，并把页码绑在抽取出的文字上，引用才能指到某一页'],
            ['jszip', '读取 DOCX——它本质是一个由 XML 部件组成的 ZIP 包，并保留内部的标题层级'],
            ['IndexedDB', '在你自己的浏览器里按知识库保存文本块及其向量'],
            ['Cache Storage', '保存模型权重文件，所以下载是每个模型一次，而不是每次访问一次'],
          ],
        },
        {
          t: 'p',
          text: 'onnxruntime 需要的 WebAssembly 二进制随站点一起发布，而不是从第三方内容网络拉取，因此整套工具涉及的外部主机只有一个：模型托管站。',
        },
        { t: 'h2', text: '我们刻意不做的事' },
        {
          t: 'ul',
          items: [
            '不做账号。没有注册、没有登录，使用工具不需要邮箱，因此不存在一个会在凭据泄露里丢掉的东西。',
            '不做云同步。在一台机器上建好的索引不会出现在另一台上，因为同步它就意味着要有服务器持有它。换机器的方式是重新导入文件。',
            '不做「上传你的密钥」式的代传。本站不索要 API Key，也不提供用你自己的凭据把文档发给模型厂商的功能。那种设计会让文件离开你的设备，而这件事正是本项目要避免的。',
            '不做统计、不做追踪像素、不做会话录制。任何页面上都没有第三方统计脚本；站内唯一的第三方脚本是广告脚本，只出现在有广告位的地方，且只在获得你同意之后。',
            '不用你的内容训练，也不存在能这么做的机制，因为没有任何副本离开浏览器。',
            '不宣称准确。工具负责检索，可选地生成；它不负责核实。任何必须正确的结论，都要由人对着被引用的段落核对一遍。',
          ],
        },
        { t: 'h2', text: '两分钟内验证我们' },
        {
          t: 'steps',
          items: [
            {
              title: '添加文件时盯着网络面板',
              text: '按 F12 打开开发者工具，进入 Network，清空列表，按 Fetch/XHR 筛选，然后拖入一份文档。没有任何请求带着这个文件。你会看到的是下载 ONNX 权重文件的 GET 请求，路径里是文件名，没有请求体。',
            },
            {
              title: '拔掉网络再提问',
              text: '把 Network 面板切到离线，就刚刚导入的文档提问。回答带着引用返回，这只有在检索、分块、向量化本来就在本地的前提下才可能。',
            },
            {
              title: '看看到底存了什么、存在哪',
              text: '在 Application 面板里展开 IndexedDB，你会找到一个名为 securerag 的数据库：里面是每份文档一条的元数据记录，以及在 index 键下保存的文本块与 Float32Array 向量；展开同一来源下的 Cache Storage，你会找到模型权重。清除站点数据，两者一起消失，也不会剩下任何需要我们删除的东西。',
            },
            {
              title: '去源码里找「本应出现却没有出现」的东西',
              text: '在任意页面查看源代码，搜索那些常见的统计域名。没有统计脚本，没有从第三方内容网络拉取的字体或脚本，也没有任何隐藏的表单在向别处提交。',
            },
            {
              title: '自己去核对模型托管站',
              text: '模型页面逐个列出模型并给出上游页面链接，你可以在那里读到参数量、量化方式与许可，再和本站公布的数值对照。',
            },
            {
              title: '然后把结果告诉我们',
              text: '如果上面任何一项验证失败，那是值得报告的缺陷，而不是措辞问题。写信到 hello@securerag.app，附上你用的浏览器和你看到的现象。',
            },
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: '无法验证的说法，价值低于可以验证的。',
          text: '本站写下的每一条，都是为了让你在自己的浏览器里核对：不需要账号，不需要我们提供工具，也不需要先信一次。',
        },
        { t: 'h2', text: '局限也写在这里' },
        {
          t: 'p',
          text: '这个工具的范围刻意做得很小，诚实的清单是：只能在支持 WebAssembly、且允许写入站点存储的现代浏览器上运行；直接拒绝加密 PDF、没有文字层的扫描件、旧版 .doc，以及任何超过 25MB 的单个文件；单个知识库最多 40 份文档、200MB、20,000 个文本块，手机端文件上限 10 份；可选的生成模型在 CPU 路径上大约每秒 3 到 8 个 token，产出的文字仍要对照引用核对；索引保存在浏览器配置里，清除站点数据或换一台机器就等于从空索引开始。',
        },
        { t: 'h2', text: '联系方式' },
        {
          t: 'p',
          text: '纠错、提问与问题报告都请发到 hello@securerag.app。联系页面说明了邮件里该写什么，才能让一份报告真正可处理；改动完成之后，会记进更新日志。',
        },
      ],
    },
  },
} satisfies ContentPage;
