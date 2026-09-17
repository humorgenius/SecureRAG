import type { ContentPage } from './types';

export default {
  slug: 'contact',
  nav: '/contact/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/about/', labelEn: 'About this project', labelZh: '关于这个项目' },
    { path: '/faq/', labelEn: 'Frequently asked questions', labelZh: '常见问题' },
    { path: '/privacy/', labelEn: 'Privacy policy', labelZh: '隐私政策' },
  ],
  copy: {
    en: {
      title: 'Contact: hello@securerag.app, no forms',
      description:
        'One email address and no form, because no server could receive one. What to put in a bug, privacy or security report, and what is not promised.',
      h1: 'Contact',
      intro:
        'There is exactly one way to reach this project: email hello@securerag.app. This page explains why there is no contact form, what to put in a message so that it can be acted on, how to report a security problem, and which parts of the tool we cannot help you recover.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'Email hello@securerag.app is the only contact channel. There is no contact form, no chat widget, no ticket system and no phone number, because the site is a set of static files with no backend: a form would have nowhere to post to, unless we added a server, and adding one would undo the reason this tool exists.',
        },
        { t: 'h2', text: 'Why there is no form' },
        {
          t: 'p',
          text: 'A form needs an endpoint, an endpoint needs a server, and a server is the thing this project is built to avoid. The alternative would be a third-party form service, which means handing your message and your IP address to another company and putting a script from that company on a page of a site that claims to have one external host. Neither is worth it for a mailbox that already works.',
        },
        {
          t: 'p',
          text: 'The address is a normal mailbox. Mail you send is read by a person, kept only as long as it takes to answer and to keep a record of the fix, and deleted if you ask for that. It is not added to a mailing list, because there is no mailing list, and it is not used for marketing.',
        },
        { t: 'h2', text: 'What to include, by kind of report' },
        {
          t: 'table',
          caption: 'Table 1 — the details that turn a message into something fixable',
          head: ['Kind of report', 'What to include'],
          rows: [
            [
              'A bug: an import fails, an answer is empty, a button does nothing',
              'Browser name and full version (Chrome 140, Safari 18, for example), your operating system, the file type, the file size, and the exact wording of any message shown. If a document was involved, the kind of document is enough — never send the document itself.',
            ],
            [
              'A wrong or missing model, licence or number on the models page',
              'The model name and the figure you checked, with a link to the upstream model page you compared against. Numbers on our side are meant to match the model page, so a mismatch is our error.',
            ],
            [
              'A retrieval problem: the answer missed a passage you know exists',
              'The document type, roughly how long it is, the wording of the question, and whether the passage appears in the citations. That last point separates a search problem from a reading problem.',
            ],
            [
              'A privacy question, or a deletion request for an email you sent',
              'The question, and for a deletion request the address and subject line you used, so the right message can be found and removed.',
            ],
            [
              'An accessibility problem',
              'The page or panel, the assistive technology and version, and what happened instead of what you expected. If a screen reader announced something twice or not at all, the exact wording you heard is the most useful part.',
            ],
            [
              'A correction to anything written on the site',
              'The page, the sentence, and the source that contradicts it. Corrections that cite a primary source are applied fastest.',
            ],
          ],
        },
        { t: 'h2', text: 'Reporting a security problem' },
        {
          t: 'p',
          text: 'If you find a way to make the tool send document content, questions or answers off the device, or a way to read another site’s or another user’s data through this site, that is the highest priority class of report and it should be sent to hello@securerag.app with “security” in the subject line. Include the browser and version, the steps that reproduce it, and what you observed in DevTools if you saw traffic that should not exist. Please do not test against other people’s data, and do not run automated scans against the hosting provider.',
        },
        {
          t: 'p',
          text: 'There is no bug bounty programme, no reward fund and no legal contract behind this address, and we would rather say that up front than imply a payment that does not exist. What we can offer is a real fix, described in the changelog, and credit in the entry if you want it.',
        },
        {
          t: 'p',
          text: 'One clarification that saves time on both sides: a cross-site scripting report that requires the attacker to already control code running in your own page, or a report that the local index can be read by someone who has full access to your browser profile, is a real limitation of a browser-local tool rather than a remote vulnerability. It is worth writing down anyway — the security page describes this boundary — but it is handled as a documentation gap, not as an incident.',
        },
        { t: 'h2', text: 'What we cannot help with' },
        {
          t: 'ul',
          items: [
            'Recovering an index. If site data was cleared, the browser profile was reset, or the machine was replaced, the chunks and vectors are gone and there is no copy anywhere to restore from. Re-importing the files is the only route back.',
            'Reading a document for you. There is no server that can open your file, so a “here is my PDF, what does it say” email cannot be answered from this end.',
            'Account problems. There are no accounts, so there is no password to reset, no profile to delete and no login to unblock.',
            'Billing questions. There is no payment anywhere in this project, including for the optional generation model, which is downloaded from a public host and costs nothing.',
            'Guaranteeing an answer’s accuracy. A reply can explain why an answer was produced and which settings change it, but the check against the source document is yours.',
          ],
        },
        { t: 'h2', text: 'Response times' },
        {
          t: 'p',
          text: 'No response time is promised. There is no service level agreement, no support contract, no ticket queue with a clock, no on-call rotation and no business hours; this is one developer and a small number of contributors working on it around other work. Security reports are read first and answers about the pipeline usually take the longest, because a useful reply means reproducing the case rather than guessing at it. If a message goes unanswered, sending it again after a couple of weeks is fine and not rude.',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Nothing here is a support contract.',
          text: 'Using the tool does not create a support relationship, and the terms of use describe the same position: the site is provided as it is, with no warranty of accuracy, availability or fitness for a particular purpose.',
        },
        { t: 'h2', text: 'Languages' },
        {
          t: 'p',
          text: 'Write in Chinese or English, the two languages the site is published in. Anything else can be sent, but a reply in the same language cannot be guaranteed. Messages about the Chinese pages can be written in Chinese even when describing English terminology: the interface strings exist in both languages, so quoting the Chinese wording is enough to locate them.',
        },
        { t: 'h2', text: 'If you would rather not email' },
        {
          t: 'p',
          text: 'Every claim on this site is written to be verifiable without contacting anyone. The about page lists the two-minute checks: watch the network panel while adding a file, go offline and ask a question, look at IndexedDB and Cache Storage, and search the page source for scripts that should not be there. A failed check is the most useful thing you can bring to the mailbox, and it is the only kind of report we can act on without asking you for a document.',
        },
      ],
    },
    zh: {
      title: '联系方式：hello@securerag.app，没有表单',
      description:
        '只有一个邮箱，没有联系表单，因为没有服务器接收它。缺陷、模型、隐私、安全与无障碍报告各该写什么，以及这里不承诺 SLA、无法帮你恢复什么。',
      h1: '联系方式',
      intro:
        '联系这个项目只有一条路：写信到 hello@securerag.app。这一页说明为什么没有联系表单、邮件里写什么才能被处理、安全问题怎么报，以及哪些损失我们帮不上忙。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '唯一的联系方式是 hello@securerag.app。这里没有联系表单、没有在线客服、没有工单系统，也没有电话，因为本站只是一组静态文件、没有后端：表单没有可以提交的地址，除非我们为此加一台服务器，而加服务器等于抵消这个工具存在的理由。',
        },
        { t: 'h2', text: '为什么没有表单' },
        {
          t: 'p',
          text: '表单需要接口，接口需要服务器，而服务器正是本项目要避开的东西。退一步用第三方表单服务，等于把你的信息和 IP 交给另一家公司，还在一个宣称只有一个外部主机的站点上引入该公司的脚本。对一个本来就能用的邮箱来说，这两种做法都不划算。',
        },
        {
          t: 'p',
          text: '这个地址就是普通邮箱。你发来的邮件由人阅读，保留到回复完毕、并记下一次处理记录为止；你要求删除，就删。它不会被加进任何邮件列表，因为这里没有邮件列表，也不会用于营销。',
        },
        { t: 'h2', text: '不同报告该写什么' },
        {
          t: 'table',
          caption: '表 1 — 让一封邮件变成可修问题的信息',
          head: ['报告类型', '需要包含的内容'],
          rows: [
            [
              '缺陷：导入失败、回答为空、按钮没反应',
              '浏览器名称与完整版本（例如 Chrome 140、Safari 18）、操作系统、文件类型、文件大小，以及提示信息的原文。涉及文档时说明类型就够了，请不要把文档本身发给我们。',
            ],
            [
              '模型页面上的模型、许可或数字有误',
              '模型名称、你核对的那个数值，以及你用来对照的上游模型页链接。本站的数字应当与模型页一致，不一致就是我们的错。',
            ],
            [
              '检索问题：回答漏掉了你确定存在的段落',
              '文档类型、大致篇幅、提问原文，以及那一段是否出现在引用里。最后这一点把搜索问题和阅读问题区分开。',
            ],
            [
              '隐私问题，或删除你发来的邮件',
              '问题本身；如果是删除请求，请给出你使用的发件地址和邮件主题，方便定位那一封并删掉。',
            ],
            [
              '无障碍问题',
              '页面或面板、辅助技术及其版本，以及实际发生了什么。如果屏幕阅读器重复播报或完全没播报，你实际听到的原话最有用。',
            ],
            [
              '纠正站内写错的内容',
              '页面、句子，以及与之矛盾的一手来源。附上一手来源的纠错处理得最快。',
            ],
          ],
        },
        { t: 'h2', text: '安全问题的报告方式' },
        {
          t: 'p',
          text: '如果你找到让工具把文档内容、提问或回答发离设备的方法，或者通过本站读取到别的站点或别的用户数据的方法，这是优先级最高的一类报告，请发到 hello@securerag.app 并在主题里写上「security」。邮件里请附浏览器与版本、可复现的步骤，以及你在开发者工具里看到本不该存在的流量时的观察结果。请不要拿别人的数据做测试，也不要对托管服务商发起自动化扫描。',
        },
        {
          t: 'p',
          text: '这里没有漏洞赏金、没有奖励基金，这个邮箱背后也没有法律合同约束；与其暗示一笔不存在的报酬，不如先把这一点说清楚。我们能给的是真正的修复、在更新日志里写明，以及在你同意的前提下写上致谢。',
        },
        {
          t: 'p',
          text: '还有一点能省下双方的时间：如果某个跨站脚本问题需要攻击者已经控制了你页面里运行的代码，或者某个报告说的是拥有你浏览器配置完全访问权限的人可以读到本地索引，那是浏览器本地工具的固有边界，不是远程漏洞。这类问题仍然值得记录（安全页面描述的就是这条边界），但会按文档缺口处理，而不是按安全事件处理。',
        },
        { t: 'h2', text: '我们帮不上忙的事' },
        {
          t: 'ul',
          items: [
            '恢复索引。如果清除了站点数据、重置了浏览器配置或换了机器，文本块和向量就没了，任何地方都没有副本可以还原。重新导入文件是唯一的回去的路。',
            '替你读文档。这里没有能打开你文件的服务器，所以「这是我的 PDF，里面写了什么」这类邮件在这一端无法回答。',
            '账号问题。这里没有账号，所以没有密码可以重置、没有资料可以删除、没有登录需要解封。',
            '付费问题。本项目任何环节都没有付费，包括可选的生成模型——它从公开托管站下载，不产生费用。',
            '保证回答准确。回复可以解释回答是怎么产生的、改哪个设置会不同，但对着源文件核对这一步只能由你做。',
          ],
        },
        { t: 'h2', text: '响应时间' },
        {
          t: 'p',
          text: '这里不承诺任何响应时间。没有服务等级协议、没有支持合同、没有计时的工单队列、没有值守轮班。做这件事的是一个开发者和少量贡献者，都在本职工作之外推进。安全问题会最先看；关于管线细节的问题通常最慢，因为一个有价值的回复意味着要把问题复现出来，而不是猜一个答案。如果邮件一直没回音，过两周再发一次即可，这不算失礼。',
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '这里不是支持合同。',
          text: '使用工具不构成支持关系，使用条款写的是同一个立场：站点按现状提供，不对准确性、可用性或特定用途适用性作出担保。',
        },
        { t: 'h2', text: '语言' },
        {
          t: 'p',
          text: '用中文或英文写信都可以，这也是本站发布内容使用的两种语言。其他语言也欢迎发来，但无法保证用同一种语言回复。关于中文页面的问题可以直接用中文写，即使要提到英文术语：界面文案两种语言都有，引用中文原文就足以定位。',
        },
        { t: 'h2', text: '如果你不想发邮件' },
        {
          t: 'p',
          text: '本站的每一条说法，都是为了让你在不联系任何人的情况下核实。关于页面列出了两分钟就能做完的验证：添加文件时盯着网络面板、断网后提问、查看 IndexedDB 与 Cache Storage、在页面源码里搜本不该出现的脚本。一项验证失败，是你能带进邮箱里最有价值的东西，也是唯一一类不需要你提供文档就能处理的报告。',
        },
      ],
    },
  },
} satisfies ContentPage;
