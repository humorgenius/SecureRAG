import type { ContentPage } from './types';

export default {
  slug: 'terms',
  nav: '/terms/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/privacy/', labelEn: 'Privacy policy', labelZh: '隐私政策' },
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/models/', labelEn: 'Which models get downloaded', labelZh: '会下载哪些模型' },
    { path: '/about/', labelEn: 'About this project', labelZh: '关于这个项目' },
  ],
  copy: {
    en: {
      title: 'Terms of use: what this tool is and is not',
      description:
        'Terms of use for SecureRAG in plain language: the service, acceptable use, who owns what, the limits of a small local model, liability, and how changes are announced.',
      h1: 'Terms of use',
      intro:
        'SecureRAG is a free information tool you run in your browser. These terms describe what the service does, what you may use it for, who owns the documents and the code, and what happens when a local model gets something wrong.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'Using this site means you accept these terms. They are short because the service is simple: a free, local tool for searching your own documents, provided as it is, with no promise that it will always be available.',
        },
        { t: 'h2', text: '1. What the service is' },
        {
          t: 'p',
          text: 'SecureRAG is a browser-based document question-answering tool. Documents are parsed, indexed and searched on your device; the site itself is a set of static files. There is no account, no server-side processing and no fee. It is free to use, including for work and commercial purposes, and there is nothing to subscribe to or cancel.',
        },
        {
          t: 'ul',
          items: [
            'No account, no subscription, no payment details, at any point.',
            'No service level agreement. We do not promise uptime, response times, support hours or that a particular browser will keep working with it.',
            'No guarantee of continuity. Features may change, and the project may be discontinued, without notice beyond the changelog.',
            'Data is yours to keep locally and yours to lose locally: we hold no backup and cannot restore an index you cleared.',
          ],
        },
        { t: 'h2', text: '2. Acceptable use' },
        {
          t: 'p',
          text: 'Use the tool for documents you are entitled to use. That is the whole rule, and the rest of this section is what it means in practice.',
        },
        {
          t: 'ul',
          items: [
            'Do not use it to process files you have no right to access, such as confidential material belonging to someone else, or documents obtained without permission.',
            'Do not rely on the tool to keep someone else’s confidential material safe on a device that is not yours. Everything runs locally, but local storage on a shared machine is still shared.',
            'Do not attempt to make the site serve content that misrepresents what it does, including framing it inside another product in a way that hides the local-only design.',
            'Do not use it to build a service that claims to upload your documents, since that would misdescribe how this software behaves.',
            'Do not use it in a way that breaks the law where you are, including laws about the material you choose to index.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'Compliance is the operator’s job, not the tool’s.',
          text: 'If your organisation has rules about where confidential documents may be processed, check them. Keeping documents on the device often helps you meet those rules, and only you can confirm that it does in your case.',
        },
        { t: 'h2', text: '3. What you own, and what we own' },
        {
          t: 'p',
          text: 'Your documents, your questions and the answers you generate remain yours. We claim no licence over them, and we cannot read them. Anything you index or export is your responsibility, including the duty to keep it accurate and lawfully handled.',
        },
        {
          t: 'p',
          text: 'The site itself — its code, interface, text, page copy, illustrations and design — belongs to the project and its contributors. Read it, learn from it, quote it with attribution, and use the tool to do your work. Do not republish the site wholesale as your own product, and do not strip attribution from code that carries it.',
        },
        {
          t: 'p',
          text: 'The models downloaded to your browser are third-party works with their own licences, listed with each model on the models page. The licence on the model page governs your use of that model, and it is the upstream project’s terms, not ours.',
        },
        { t: 'h2', text: '4. This is an information tool, not professional advice' },
        {
          t: 'p',
          text: 'Answers produced here are a summary of documents you supplied. They are not legal, medical, financial, tax or safety advice, and they do not create a professional relationship of any kind. A local embedding model and a small language model cannot weigh facts, jurisdiction, timing or consequences the way a qualified professional can.',
        },
        {
          t: 'ul',
          items: [
            'A contract summary can miss the clause that decides the matter, and the retrieval tier will faithfully return the wrong paragraph if the document is indexed badly.',
            'A medical or dosage question is not answered safely by pattern matching over a PDF you happened to have.',
            'A financial or tax figure taken from a stale document is stale, and the tool cannot know which documents you left out.',
            'Anything with legal, medical, financial or safety consequences needs a human professional to review it. Check the cited passage against the source document itself, not against our summary of it.',
          ],
        },
        { t: 'h2', text: '5. Local models get things wrong' },
        {
          t: 'p',
          text: 'Small models running on a laptop are useful and imperfect. They may misread a table, merge two clauses, answer partially, or produce text that reads confidently and is wrong. The optional generation tier writes fluent prose from retrieved passages, which makes an error harder to notice, not less likely. Every claim in the interface is tied to a citation so that verification is one click away, and the retrieval-only tier answers strictly from the passages it found.',
        },
        {
          t: 'p',
          text: 'Where the interface reports a failure — an unreadable scan, an oversized file, a collection over its limit, “not found in your documents” — that report is part of the tool working correctly. Treat it as information, and do not treat a fluent answer as confirmation.',
        },
        { t: 'h2', text: '6. Limits of liability' },
        {
          t: 'p',
          text: 'The service is provided as it is, without warranties of any kind, express or implied, including fitness for a particular purpose and accuracy of results. To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential losses arising from use of the site: lost profits, lost data, decisions taken on the basis of an answer, or the consequences of a document being indexed on a shared device.',
        },
        {
          t: 'p',
          text: 'Since the service is free and we never receive your documents, the arrangement is that you carry the risk of using it and we carry the cost of running it. Where the law does not allow a limitation of this kind, this section applies only so far as it can. Nothing here excludes rights you have that cannot be excluded.',
        },
        { t: 'h2', text: '7. Advertising' },
        {
          t: 'p',
          text: 'The site is supported by Google AdSense. Ad slots are labelled, capped at three per page, and kept out of the chat workspace. Ad scripts load only after you agree, and the privacy policy describes what those cookies do and how to refuse them. If you paid for the site in any other way, no advertising would be necessary, and there is no way to pay, which is why it is there.',
        },
        { t: 'h2', text: '8. Changes to these terms' },
        {
          t: 'p',
          text: 'These terms may change as the service changes. The last-updated date at the top of this page always reflects the current version, and a change that affects your rights is written into the section it concerns rather than buried in a summary. Continuing to use the site after a change means you accept the updated terms; if you disagree with them, stop using the site and clear its site data.',
        },
        { t: 'h2', text: '9. Contact' },
        {
          t: 'p',
          text: 'Questions about these terms, correction requests and reports of misuse go to hello@securerag.app. The site is run by an individual and a few contributors, not a company: there is no legal entity, registered address or support desk behind it, just an address that reaches the people who build it.',
        },
      ],
    },
    zh: {
      title: '使用条款：这个工具是什么，不是什么',
      description:
        '用大白话写的 SecureRAG 使用条款：服务说明、可接受使用、内容归属、本地小模型的局限、责任范围，以及条款变更如何公布。',
      h1: '使用条款',
      intro:
        'SecureRAG 是一个免费的信息工具，跑在你的浏览器里。这份条款说明服务做什么、你可以拿它做什么、文档和代码分别归谁，以及本地模型答错时会怎样。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '使用本站即表示你接受这些条款。条款很短，因为服务本身简单：一个免费、在本机运行、用来检索你自己文档的工具，按现状提供，也不承诺永远可用。',
        },
        { t: 'h2', text: '一、服务说明' },
        {
          t: 'p',
          text: 'SecureRAG 是一个基于浏览器的文档问答工具。文档在你的设备上完成解析、建索引和检索；站点本身只是一组静态文件。没有账号，没有服务端处理，也不收费。个人使用、工作用途和商业用途都免费，没有订阅，也不需要取消什么。',
        },
        {
          t: 'ul',
          items: [
            '任何环节都不需要账号、订阅或付款信息。',
            '没有服务等级协议（SLA）。我们不承诺可用率、响应时间、支持时段，也不承诺某个浏览器会一直可用。',
            '不保证服务持续。功能可能变化，项目也可能停掉，届时只在更新日志里说明。',
            '数据留在本地，也丢在本地：我们不保存备份，你清掉的索引我们恢复不了。',
          ],
        },
        { t: 'h2', text: '二、可接受使用' },
        {
          t: 'p',
          text: '拿你有权使用的文档来用这个工具。规则就这一条，下面这些是它在实际场景里的含义。',
        },
        {
          t: 'ul',
          items: [
            '不要用它处理你无权接触的文件，比如属于他人的保密材料，或者未经许可取得的文档。',
            '不要指望别人的保密材料在不属于你的设备上安全无虞。一切都在本地运行，但共用机器上的本地存储仍然是共用的。',
            '不要把这个站点包装成另一种东西对外呈现，比如把本地化的设计藏起来嵌进别的产品里。',
            '不要用它做一个声称「上传你的文档到云端」的服务，那等于谎报这个软件的行为。',
            '不要用它违反你所在地区的法律，包括你选择索引的材料相关的法律。',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '合规是使用者的责任，不是工具的。',
          text: '如果你的单位对保密文档在哪里处理有规定，请去确认。把文档留在本机通常有助于满足这类规定，但只有你能确认在你这里是否真的满足。',
        },
        { t: 'h2', text: '三、内容归属' },
        {
          t: 'p',
          text: '你的文档、你的提问、你生成的回答，都归你。我们不主张任何许可，也读不到它们。你索引或导出的东西由你自己负责，包括保证它准确、保证它被合法处理。',
        },
        {
          t: 'p',
          text: '站点本身——代码、界面、正文、页面文案、插图和设计——属于项目及其贡献者。你可以阅读、学习、注明来源后引用，也可以用它来干活。不要把整个站点当成自己的产品重新发布，也不要把代码里已有的署名抹掉。',
        },
        {
          t: 'p',
          text: '下载到你浏览器里的模型是第三方作品，各自带自己的许可，逐项列在《模型》一页。你对该模型的使用遵循模型页上的许可，那是上游项目的条款，不是我们的。',
        },
        { t: 'h2', text: '四、这是信息工具，不构成专业意见' },
        {
          t: 'p',
          text: '这里产出的回答，是对你自己提供的文档做的归纳。它不是法律、医疗、财务、税务或安全意见，也不构成任何形式的专业服务关系。一个本地向量模型加一个小型语言模型，没法像有资质的专业人士那样权衡事实、管辖地、时效和后果。',
        },
        {
          t: 'ul',
          items: [
            '合同摘要可能漏掉真正决定争议的那一条；如果索引质量差，检索档会忠实地把错误的段落交给你。',
            '医疗或用药剂量的问题，不适合靠在一份恰好存在的 PDF 上做模式匹配来回答。',
            '从过期文档里读出的财务或税务数字就是过期的，而工具无从知道你漏放了哪些文档。',
            '任何涉及法律、医疗、财务或安全后果的事，都需要人工专业复核。请对照来源文档本身核对被引用的段落，而不是核对我们对它的概括。',
          ],
        },
        { t: 'h2', text: '五、本地模型会出错' },
        {
          t: 'p',
          text: '跑在笔记本上的小模型有用，但不完美。它可能看错表格、把两条条款并成一条、只答一半，或者写出一段读起来很确定、其实是错的话。可选的生成档会用检索到的段落写出通顺的长句，这只会让错误更难被发现，不会让它更少。界面里的每句结论都挂着引用，验证只差一次点击；检索档则严格依据它找到的段落作答。',
        },
        {
          t: 'p',
          text: '界面报告失败的时候——扫描件读不出、文件超限、资料库超量、回答是「文档中未找到」——这个报告本身就是工具在正常工作。请把它当成信息，也不要把一段通顺的回答当成确认。',
        },
        { t: 'h2', text: '六、责任范围' },
        {
          t: 'p',
          text: '本服务按现状提供，不含任何明示或默示的保证，包括对特定用途适用性和结果准确性的保证。在法律允许的最大范围内，我们不对使用本站造成的间接损失、附带损失或后果性损失负责：利润损失、数据丢失、依据某个回答做出的决定，或者文档被索引在共用设备上带来的后果。',
        },
        {
          t: 'p',
          text: '既然服务免费、我们也从不会收到你的文档，那么分工就是这样：使用它的风险由你承担，运行它的成本由我们承担。在法律不允许作此类限制的地方，本节只在允许的范围内适用。这里没有任何内容排除你依法不能被排除的权利。',
        },
        { t: 'h2', text: '七、广告' },
        {
          t: 'p',
          text: '本站由 Google AdSense 支持。广告位都有标注，单页不超过三个，并且不进入聊天工作区。广告脚本只在你同意之后加载，隐私政策里说明了那些 Cookie 的作用以及如何拒绝。如果有别的方式为这个站点付费，广告就没有必要，但这里没有付费渠道——这就是它存在的原因。',
        },
        { t: 'h2', text: '八、条款变更' },
        {
          t: 'p',
          text: '服务变化时这些条款可能跟着变。页顶的更新日期始终对应当前版本，涉及你权利的变化会写进它所属的那一节，而不会埋在摘要里。变更之后继续使用本站，即视为你接受更新后的条款；如果你不同意，请停止使用并清除本站的站点数据。',
        },
        { t: 'h2', text: '九、联系方式' },
        {
          t: 'p',
          text: '关于条款的问题、纠正请求和滥用举报，请写信到 hello@securerag.app。本站由个人和几位贡献者维护，不是公司：背后没有法律实体、没有注册地址、没有客服台，只有一个能到达建设者手里的邮箱。',
        },
      ],
    },
  },
} satisfies ContentPage;
