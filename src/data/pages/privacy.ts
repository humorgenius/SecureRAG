import type { ContentPage } from './types';

export default {
  slug: 'privacy',
  nav: '/privacy/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
    { path: '/terms/', labelEn: 'Terms of use', labelZh: '使用条款' },
    { path: '/about/', labelEn: 'About this project', labelZh: '关于这个项目' },
  ],
  copy: {
    en: {
      title: 'Privacy policy: what we never receive',
      description:
        'Plain-language privacy policy for SecureRAG: no document content, no questions, no accounts, no tracking pixels. What the one model request contains, and how ads and cookies work.',
      h1: 'Privacy policy',
      intro:
        'You can use this site without an account, and without any document or question ever reaching us. This policy lists what is not collected, where your data lives, the single outbound request the app makes, and how advertising cookies work.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'We cannot read your documents or your questions, because they never leave your browser. There is no account, no upload, no tracking pixel and no profile of you. This page explains that arrangement in the same detail we would use to explain the opposite one.',
        },
        { t: 'h2', text: 'The short version' },
        {
          t: 'ul',
          items: [
            'No registration, no login, no email address required, ever.',
            'Documents, questions and answers stay in your browser tab. They are not transmitted, logged or backed up.',
            'The application makes one outbound request: a model file download carrying nothing but a file name.',
            'Advertising is the only third-party element on the site, it appears only on some pages, and it loads only after you agree.',
            'Deleting your data means clearing site data in your browser. Nothing is left on our side to delete, because nothing was ever there.',
          ],
        },
        { t: 'h2', text: 'What we collect, and what we do not' },
        {
          t: 'table',
          caption: 'Table 1 — data categories, item by item',
          head: ['Item', 'Collected?', 'Detail'],
          rows: [
            [
              'The text of your documents',
              'No',
              'Files are parsed in memory on your device. No copy is sent, stored or inspected by us, because we operate no server that could receive one.',
            ],
            [
              'Your questions and the answers produced',
              'No',
              'They exist inside the tab while it is open. Nothing about them is transmitted or written to a log.',
            ],
            [
              'Name, email address, password',
              'No',
              'There is no sign-up and no login, so there is nothing to collect.',
            ],
            [
              'Cookies or local storage set by this site for tracking',
              'No',
              'The site sets no advertising or analytics cookies of its own. Your advertising choice is remembered locally in your browser so we do not ask twice.',
            ],
            [
              'Tracking pixels, fingerprinting, session recording',
              'No',
              'None of these scripts is loaded, and no analytics SDK is present in the page.',
            ],
            [
              'Your IP address',
              'Not by us',
              'We run no application server that could receive it. The model host sees it when a model file is downloaded, and Google sees it when ads load, exactly as any host you visit would.',
            ],
            [
              'Ordinary server logs from the web host',
              'Outside our control',
              'Whoever serves these static files keeps the usual request logs any web host keeps — IP address, user agent, timestamp — for security and abuse prevention. Those logs cannot be linked to any document, because documents never reach the host.',
            ],
            [
              'Email you send to hello@securerag.app',
              'Yes, obviously',
              'It sits in our mailbox for as long as it takes to answer and keep a record of the fix. Ask us to delete it and we do.',
            ],
          ],
        },
        { t: 'h2', text: 'What we do not do' },
        {
          t: 'ul',
          items: [
            'We do not build a profile of you, and we do not try to recognise you across visits.',
            'We do not sell, rent or share personal data, because we do not hold personal data to sell.',
            'We do not train any model on your content. The models that run here perform inference only: they compute an answer, they do not compute gradients, and no feedback loop writes anything back into them.',
            'We do not email you marketing, because we never ask for an address to email.',
            'We do not use your documents to improve the service, in aggregate or otherwise. They never reach us in any form.',
          ],
        },
        { t: 'h2', text: 'Where your data actually lives' },
        {
          t: 'p',
          text: 'Two browser storage areas hold everything, both inside your own browser profile, and both invisible to us.',
        },
        {
          t: 'table',
          caption: 'Table 2 — storage locations, who can read them, and how to remove them',
          head: ['What', 'Where it lives', 'Who can read it', 'How to delete it'],
          rows: [
            [
              'Text chunks and their vectors',
              'IndexedDB for this site',
              'You, and anyone who can use this browser profile',
              'Clear site data for this site',
            ],
            [
              'Model weights',
              'Cache Storage for this site',
              'Same as above',
              'Clear site data, or simply let it be re-downloaded',
            ],
            [
              'Your settings and advertising choice',
              'Local storage for this site',
              'Same as above',
              'Clear site data',
            ],
            [
              'Anything you exported, printed or copied',
              'Your file system, clipboard or printer',
              'You and whoever has access to those',
              'Outside the browser; delete it where you saved it',
            ],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: 'Deletion is complete and immediate.',
          text: 'Clear site data for this site — browser menu, Site settings, or the Application tab in DevTools — and the chunks, vectors, model cache and settings are gone. There is no copy on a server for us to keep, and therefore nothing for us to delete on your behalf.',
        },
        { t: 'h2', text: 'Third-party requests, listed in full' },
        {
          t: 'table',
          caption: 'Table 3 — every request the site makes to anyone else',
          head: ['Request', 'Sent to', 'What it carries', 'When'],
          rows: [
            [
              'Model weight files',
              'A public model host (HuggingFace or a mirror)',
              'A file name and a version reference. No document, no question, no identifier, no cookie.',
              'Once per model, after you confirm the download',
            ],
            [
              'Advertising script and ad requests',
              'Google AdSense',
              'Standard ad request data: page URL, your approximate location from IP, device and browser type, and cookie identifiers if you agreed to them.',
              'Only on pages with ad slots, and only after you accept',
            ],
          ],
        },
        { t: 'h2', text: 'Advertising and cookies' },
        {
          t: 'p',
          text: 'The site is funded by advertising through Google AdSense, and we would rather describe how that works than hide it. Ad slots appear on a limited number of pages, never more than three on a page, each one labelled “Advertisement”, and never inside the chat workspace where your documents are open. Pages like this privacy policy, the terms, the security page and the models page carry no advertising at all.',
        },
        {
          t: 'p',
          text: 'Google and its partners may set cookies and use similar identifiers to select and measure the ads you see, including personalised ads based on your browsing history on other sites. That data is collected by Google under its own policies, not by us, and we never receive the data that identifies you. Advertising scripts are not loaded until you agree to them, and declining costs you nothing: every feature of the tool works exactly the same with ads switched off.',
        },
        { t: 'h3', text: 'How to refuse or limit advertising cookies' },
        {
          t: 'ol',
          items: [
            'Decline when the consent message appears. Ad scripts stay unloaded, and the tool behaves identically.',
            'Turn off third-party cookies in your browser settings. In Chrome: Settings → Privacy and security → Third-party cookies. In Safari: Settings → Privacy → Prevent cross-site tracking, and the same preference on iPhone and iPad. In Firefox: Settings → Privacy & Security → Enhanced Tracking Protection.',
            'Turn off personalised advertising in the Google Ads Settings page at https://adssettings.google.com. You will still see ads, but they are no longer based on your browsing history.',
            'Review Google’s own explanation of how it uses data from sites that use its services, linked from that same page, and opt out of Google Analytics-style measurement if you wish, though no Google analytics script runs here.',
            'Use private browsing windows when you do not want cookies retained after the window closes.',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: 'Where consent is legally required,',
          text: 'advertising scripts are not loaded before you agree, and the choice applies to this browser until you change it or clear site data. If the consent message never appears for you, ads are the reason the site exists, and you can still block them in your browser at any time.',
        },
        { t: 'h2', text: 'Children’s privacy' },
        {
          t: 'p',
          text: 'This site is a document-search tool, not a service aimed at children. We do not knowingly collect personal information from children under 13, or under 16 where local law sets that threshold. There is no registration to collect it with, and no content is saved on our side. If you are a parent and you believe advertising on this site has collected data about your child, use the Google Ads Settings link above and the consent controls on this site; if anything else concerns you, write to us and we will look at it.',
        },
        { t: 'h2', text: 'Your rights, and why most of them have nothing to act on' },
        {
          t: 'p',
          text: 'Data protection rules in many places give you the right to see, correct, export, restrict or delete the personal data a service holds about you, and to object to profiling. We support all of that, and in practice most requests have nothing to return: there is no account and no stored personal data. The two exceptions are an email you sent us, which we delete on request, and advertising data held by Google, which you control through the tools in the section above. We do not sell personal information, and we do not share it for cross-context behavioural advertising ourselves.',
        },
        { t: 'h2', text: 'Changes to this policy' },
        {
          t: 'p',
          text: 'If the behaviour of the site changes in a way that affects this policy, the policy changes with it, on the same day, and the last-updated date at the top moves. A change to what a request carries, the arrival of a new third party or a new storage area is described here rather than only in a changelog entry. Material changes are pointed out on the page you land on, so you meet them before you trust the tool again.',
        },
        { t: 'h2', text: 'Contact' },
        {
          t: 'p',
          text: 'Privacy questions, deletion requests for an email you sent us, and corrections to anything this page gets wrong go to hello@securerag.app. The site is run by one person and a small set of contributors, not a company; there is no data protection officer, no registered office and no legal entity to route a request through, so write to the address and it reaches whoever can answer.',
        },
      ],
    },
    zh: {
      title: '隐私政策：我们永远不会收到的东西',
      description:
        '用大白话写的 SecureRAG 隐私政策：不收集文档内容、不收集提问、没有账号、没有追踪像素；唯一的模型请求里有什么，广告与 Cookie 如何工作。',
      h1: '隐私政策',
      intro:
        '不用注册就能用，也不需要任何文档或问题到达我们这里。这份政策写清楚我们不收集什么、你的数据存在哪里、应用唯一的外发请求带什么，以及广告 Cookie 是怎么工作的。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '我们读不到你的文档和提问，因为它们从不离开你的浏览器。这里没有账号、没有上传、没有追踪像素，也没有关于你的用户画像。这一页把这件事讲得和相反的情形一样具体。',
        },
        { t: 'h2', text: '一句话版本' },
        {
          t: 'ul',
          items: [
            '不需要注册，不需要登录，永远不要你填邮箱。',
            '文档、提问、回答都留在你的浏览器标签页里，不传输、不记日志、不备份。',
            '应用只发一个外发请求：下载模型文件，里面除了文件名什么都没有。',
            '广告是站内唯一的第三方内容，只出现在部分页面，而且只在你同意之后才加载。',
            '删除数据就是在浏览器里清除站点数据。我们这边没有东西可删，因为从来没有过。',
          ],
        },
        { t: 'h2', text: '我们收集什么，不收集什么' },
        {
          t: 'table',
          caption: '表 1 — 逐项说明',
          head: ['项目', '是否收集', '说明'],
          rows: [
            ['你的文档正文', '不收集', '文件在你设备的内存里被解析。没有被发送的副本，我们也不运营任何能接收它的服务器，所以既没有存储也没有查看。'],
            ['你的提问和生成的回答', '不收集', '它们只在标签页打开期间存在，不会被传输，也不会写进任何日志。'],
            ['姓名、邮箱、密码', '不收集', '没有注册也没有登录，因此没有东西可收集。'],
            ['本站设置的追踪 Cookie', '不收集', '本站自己不设广告或统计 Cookie。你对广告的选择保存在浏览器本地，只是为了不重复问你。'],
            ['追踪像素、浏览器指纹、会话录制', '不收集', '这类脚本一个都没加载，页面里也不存在统计 SDK。'],
            ['你的 IP 地址', '我们不收', '我们不运行会收到它的应用服务器。下载模型文件时模型托管方能看到，加载广告时 Google 能看到，这和你访问任何网站时一样。'],
            ['静态托管商的常规服务器日志', '不在我们控制内', '托管这些静态文件的一方会保留任何网站主机都会保留的请求日志——IP、UA、时间戳——用于安全和防滥用。这些日志无法和任何文档关联，因为文档从来不会到达主机。'],
            ['你发到 hello@securerag.app 的邮件', '会，这很自然', '它留在我们的邮箱里，直到回复完毕并留下一次处理记录。你要求删除，我们就删。'],
          ],
        },
        { t: 'h2', text: '我们不做的事' },
        {
          t: 'ul',
          items: [
            '不做你的用户画像，也不试图跨访问认出你。',
            '不出售、出租、共享个人信息，因为我们手里没有个人信息可卖。',
            '不用你的内容训练任何模型。这里的模型只做推理：它算出一个回答，不计算梯度，也没有任何反馈回路把东西写回模型。',
            '不给你发营销邮件，因为我们从不索要邮箱地址。',
            '不用你的文档改进服务，汇总形式也不用。它们以任何形式都到不了我们手上。',
          ],
        },
        { t: 'h2', text: '你的数据实际存在哪里' },
        {
          t: 'p',
          text: '全部内容放在浏览器的两个存储区里，都在你自己的浏览器配置目录下，对我们不可见。',
        },
        {
          t: 'table',
          caption: '表 2 — 存储位置、谁能读到、怎么删掉',
          head: ['内容', '存放位置', '谁能读到', '怎么删除'],
          rows: [
            ['文本块及其向量', '本站的 IndexedDB', '你，以及任何能使用这个浏览器配置的人', '清除本站的站点数据'],
            ['模型权重', '本站的 Cache Storage', '同上', '清除站点数据，或者就让它以后重新下载'],
            ['你的设置与广告选择', '本站的本地存储', '同上', '清除站点数据'],
            ['你导出、打印或复制的任何内容', '你的文件系统、剪贴板或打印机', '你，以及能接触这些的人', '已经不在浏览器里，去你保存的地方删'],
          ],
        },
        {
          t: 'callout',
          kind: 'good',
          title: '删除是彻底且立即的。',
          text: '在浏览器菜单、站点设置或开发者工具的 Application 面板里清除本站的站点数据，文本块、向量、模型缓存和设置就都没了。服务器上不存在副本供我们保留，因此也没有需要我们替你删除的东西。',
        },
        { t: 'h2', text: '第三方请求，全部列在这里' },
        {
          t: 'table',
          caption: '表 3 — 站内发往第三方的全部请求',
          head: ['请求', '发往', '带什么', '什么时候'],
          rows: [
            ['模型权重文件', '公开模型托管站（HuggingFace 或镜像）', '一个文件名和一个版本标识。不含文档、不含提问、不含标识、不含 Cookie。', '每个模型一次，在你确认下载之后'],
            ['广告脚本与广告请求', 'Google AdSense', '标准的广告请求数据：页面网址、由 IP 推出的粗略位置、设备与浏览器类型，以及你同意时产生的 Cookie 标识。', '只在有广告位的页面上，且只在你接受之后'],
          ],
        },
        { t: 'h2', text: '广告与 Cookie' },
        {
          t: 'p',
          text: '本站通过 Google AdSense 获得收入，与其把这件事藏起来，不如说清楚它怎么运转。广告位只出现在有限的几个页面，单页不超过三个，每一个都标注「广告 / Advertisement」，并且绝不进入你打开文档的聊天工作区。像这份隐私政策，以及条款、安全、模型页面，完全没有广告。',
        },
        {
          t: 'p',
          text: 'Google 及其合作伙伴可能设置 Cookie 并使用类似标识，用来挑选和衡量你看到的广告，其中包含基于你在其他网站浏览记录投放的个性化广告。这些数据由 Google 依照它自己的政策收集，不是我们收集的，我们也从不会收到能识别你身份的数据。你在同意之前不会有广告脚本加载，而拒绝的代价是零：关掉广告之后，工具的所有功能和你同意的情形完全一样。',
        },
        { t: 'h3', text: '如何拒绝或限制广告 Cookie' },
        {
          t: 'ol',
          items: [
            '在同意提示出现时选择拒绝。广告脚本不会加载，工具行为完全一致。',
            '在浏览器设置里关闭第三方 Cookie。Chrome：设置 → 隐私和安全 → 第三方 Cookie。Safari：设置 → 隐私 → 阻止跨站跟踪，iPhone 和 iPad 上是同一个开关。Firefox：设置 → 隐私与安全 → 增强型跟踪保护。',
            '到 Google 广告设置页 https://adssettings.google.com 关闭个性化广告。广告还会出现，但不再基于你的浏览记录。',
            '在同一页面里可以读 Google 自己关于「使用其服务网站的收据」的说明，并按需关闭其中的衡量用途；不过本站并没有加载 Google 的统计脚本。',
            '不想让 Cookie 在关闭后留存，就用隐私浏览窗口。',
          ],
        },
        {
          t: 'callout',
          kind: 'info',
          title: '在法律要求取得同意的地区，',
          text: '广告脚本在你同意之前不会加载，这个选择对这个浏览器一直有效，直到你改主意或清除站点数据。如果你那边从来没出现过同意提示，说明广告是本站存在的原因，但你随时可以在浏览器里屏蔽它们。',
        },
        { t: 'h2', text: '儿童隐私' },
        {
          t: 'p',
          text: '本站是文档检索工具，不是面向儿童的服务。我们不有意收集 13 岁以下（当地法律门槛更高的为 16 岁以下）儿童的个人信息。这里连注册环节都没有，也没有东西会被保存在我们这边。如果你是家长，认为本站的广告收集了你孩子的数据，请用上面的 Google 广告设置链接和本站的同意控件处理；如果还有别的顾虑，写信给我们，我们会认真看。',
        },
        { t: 'h2', text: '你的权利，以及为什么大部分权利无事可做' },
        {
          t: 'p',
          text: '许多地方的隐私法规赋予你查看、更正、导出、限制、删除个人数据以及反对画像的权利。这些我们都支持，但实际操作中大多数请求没有东西可以返回：没有账号，也没有存下来的个人数据。两个例外是你发给我们的邮件——你要求就删——以及 Google 手上的广告数据，用上一节里的工具就能控制。我们不出售个人信息，也不会自己去共享它做跨场景行为广告。',
        },
        { t: 'h2', text: '政策的变更' },
        {
          t: 'p',
          text: '如果站点的行为发生变化并影响这份政策，政策会在同一天跟着改，页顶的更新日期也会变。请求携带的内容变了、多了一个第三方、多了一块存储，都会写在这里，而不是只在更新日志里提一句。实质性变化会在你落地的页面上指出，让你在再次信任这个工具之前先遇到它。',
        },
        { t: 'h2', text: '联系方式' },
        {
          t: 'p',
          text: '隐私相关的问题、删除你发来的邮件、以及纠正这一页写错的地方，都请写信到 hello@securerag.app。本站由一个人和少量贡献者维护，不是公司；没有数据保护官、没有注册地址、也没有一个法律实体需要你绕过它提申请，直接发邮件就能到能回答的人手里。',
        },
      ],
    },
  },
} satisfies ContentPage;
