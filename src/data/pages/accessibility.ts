import type { ContentPage } from './types';

export default {
  slug: 'accessibility',
  nav: '/accessibility/',
  ads: 0,
  schema: { article: true },
  related: [
    { path: '/security/', labelEn: 'Security and data flow', labelZh: '安全与数据流' },
    { path: '/contact/', labelEn: 'Report a problem', labelZh: '报告问题' },
    { path: '/how-it-works/', labelEn: 'How the pipeline works', labelZh: '管线如何运转' },
    { path: '/privacy/', labelEn: 'Privacy policy', labelZh: '隐私政策' },
  ],
  copy: {
    en: {
      title: 'Accessibility statement: keyboard, focus, contrast',
      description:
        'How this site is built for keyboards and screen readers, which WCAG 2.1 AA targets apply, and the four gaps we know about instead of claiming conformance.',
      h1: 'Accessibility statement',
      intro:
        'This statement describes how the pages and the in-browser workspace are built for people who use a keyboard, a screen reader, a magnifier or reduced-motion settings, and it lists what is not yet right. It describes implementation and intent, not a completed conformance audit.',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: 'The site targets WCAG 2.1 level AA: semantic HTML with a correct heading order, a skip link to the main content, a visible focus ring on every interactive element, ARIA live regions for indexing and generation progress, support for reduced-motion preferences, and body text aimed at a contrast ratio of at least 4.5:1. No external accessibility audit has been carried out, so this page reports what the code does and where it falls short rather than claiming certification.',
        },
        { t: 'h2', text: 'What this statement covers' },
        {
          t: 'p',
          text: 'It covers the static pages served from this domain and the workspace that runs inside the browser tab, as shipped in v0.1 on 2026-09-17. It does not cover third-party advertising served by Google AdSense, whose markup and behaviour we do not control, nor the model files downloaded from a public model host.',
        },
        { t: 'h2', text: 'Structure and semantics' },
        {
          t: 'ul',
          items: [
            'One h1 per page, followed by h2 sections and h3 subsections in order, so a screen reader can jump between headings without meeting a skipped level.',
            'A skip link, worded “跳到主要内容” in the Chinese pages and “Skip to content” in the English ones, moves focus directly to the main element.',
            'Navigation regions carry labels: the header navigation is labelled Main, breadcrumbs are labelled Breadcrumb, the language switcher is grouped and labelled Language, and the table of contents on long pages is labelled “On this page”.',
            'The advertising slot is marked as a complementary region and labelled Advertisement in English and 广告 in Chinese, which is also the visible label on the slot.',
            'Lists, tables and multi-step instructions use real list, table and step markup rather than styled paragraphs, so the count of items and the relationship between a table cell and its column header are available to assistive technology.',
            'Headings on long pages carry a hidden anchor link with tabindex -1 and aria-hidden, so the anchor does not add a tab stop or a duplicate announcement.',
            'A lang attribute is set on the html element for each language, and the Chinese pages are served with Simplified Chinese as that language.',
          ],
        },
        { t: 'h2', text: 'Keyboard use' },
        {
          t: 'p',
          text: 'Every action in the workspace is reachable with the keyboard alone, including adding files: the drop zone contains a button that opens the system file picker, so drag and drop is a shortcut rather than the only route in.',
        },
        {
          t: 'table',
          caption: 'Table 1 — keys that do something specific here',
          head: ['Key', 'Behaviour'],
          rows: [
            ['Tab, Shift+Tab', 'Move focus forward and back through links, buttons, form controls and the question box'],
            ['Enter', 'Send the question when the question box has focus; activate a focused button, link or summary'],
            ['Shift+Enter', 'Insert a line break in the question box instead of sending'],
            ['Space', 'Activate a focused button or toggle a checkbox or switch'],
            ['Arrow keys', 'Move within native select lists and radio groups, and move the caret inside text fields'],
            ['Page scroll keys, Home, End', 'Behave as the browser normally does; the question box does not capture them'],
          ],
        },
        {
          t: 'p',
          text: 'The workspace panels are labelled regions, so a screen reader can move between the documents panel, the chat panel, the settings panel and the local-processing panel by region rather than by counting elements.',
        },
        { t: 'h2', text: 'Focus visibility' },
        {
          t: 'p',
          text: 'Focus is never removed. Interactive elements show a 2.5px outline offset by 3px from the element, defined once for the whole site with :focus-visible, so it appears for keyboard users and does not flash for mouse users. The question box has its own visible focus outline. The skip link is invisible until it receives focus, at which point it is displayed near the top of the page and is the first tab stop.',
        },
        { t: 'h2', text: 'Motion, colour and contrast' },
        {
          t: 'ul',
          items: [
            'Animations and transitions are turned off when the operating system requests reduced motion: one rule in the global stylesheet disables all animations and transitions and stops smooth scrolling, and the workspace stylesheet stops the typing indicator in the chat panel.',
            'Body text is aimed at a contrast ratio of 4.5:1 or better against its background, and no information is conveyed by colour alone: the strictness control is a group of two named options, “Documents only” and “Allow inference”, each with its consequence spelled out in words, and indexing progress is announced as a stage name and a count rather than only as a filled bar.',
            'In the document list each file carries a three-letter type label (PDF, DOC, TXT) plus its page count and its chunk count as text, and a document that is switched off is marked “excluded” in words rather than by a colour change alone.',
            'The article layout is fluid down to phone widths, and a wide table scrolls inside its own container, an element with horizontal overflow, rather than widening the page.',
          ],
        },
        { t: 'h2', text: 'Progress and status announcements' },
        {
          t: 'p',
          text: 'Indexing and model download report progress to assistive technology through live regions marked polite, so the announcement waits for a pause instead of interrupting. The progress text names the stage as it happens: reading the file, splitting it into chunks, embedding, indexed. Where a count exists it reports items done out of the total, and a model download reports megabytes loaded against the total. Errors appear in a region announced as an alert, with a labelled dismiss control. The confirmation shown before the optional generation model is downloaded is a dialog marked as modal, containing the size and two buttons, one to confirm and one to cancel.',
        },
        { t: 'h2', text: 'What is not good enough yet' },
        {
          t: 'p',
          text: 'Four known gaps, written down rather than left for you to discover:',
        },
        {
          t: 'ol',
          items: [
            'The download confirmation dialog does not trap focus or close on Escape. Tab can leave the dialog behind, and the way out is to tab to the cancel button and press Enter or Space. Focus trapping is the next item on this list that we intend to fix.',
            'On phones, the Docs, Chat and Settings switcher is three plain buttons inside a labelled navigation region. It does not implement the tablist pattern: a screen reader hears three buttons and cannot tell which panel is currently shown from the markup alone, and the left and right arrow keys do not move between them.',
            'The workspace illustration on the home page is a marked image with a short text label rather than a description of the interface. A screen reader user gets the label, not the layout, the field positions or the order of the panels.',
            'Testing so far is manual and browser-based, on desktop Chrome and Edge with a keyboard only. No audit by an external accessibility specialist has been completed, and mobile screen readers have not been covered, so the honest summary is that the intentions above are implemented in code and partially verified, not verified end to end.',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: 'No overlay, no accessibility widget.',
          text: 'There is no third-party overlay claiming to make the page accessible, because those tools fix reports rather than interfaces. Problems are addressed in the markup itself.',
        },
        { t: 'h2', text: 'Reporting an accessibility problem' },
        {
          t: 'p',
          text: 'Write to guweiicy@gmail.com and describe the page or the panel, the assistive technology and version you are using, and what happened instead of what you expected. A keyboard trap that makes a control unreachable is treated as a bug rather than a suggestion, and it is fixed before any cosmetic work. If you use a screen reader and something is announced twice or not at all, the exact wording you heard is the most useful thing you can send.',
        },
        { t: 'h2', text: 'How this page changes' },
        {
          t: 'p',
          text: 'The list of known gaps above is the part of this page that is expected to change. When one of them is fixed, it is deleted from that list and described in the changelog on the same day; when a new gap is found, it is added there rather than quietly dropped.',
        },
      ],
    },
    zh: {
      title: '无障碍声明：键盘、焦点、对比度与已知不足',
      description:
        '本站的面板与工作区如何支持键盘与屏幕阅读器：语义化结构、可见焦点环、对比度目标、动效偏好，以及我们已知的四项不足，不做符合性认证式声明。',
      h1: '无障碍声明',
      intro:
        '这一页说明静态页面与浏览器内工作区为使用键盘、屏幕阅读器、放大工具或减少动效设置的人做了哪些事情，也把目前做得不够的地方列出来。它描述的是实现方式与意图，不是一份已完成的无障碍审计。',
      updated: '2026-09-17',
      blocks: [
        {
          t: 'p',
          lead: true,
          text: '本站以 WCAG 2.1 AA 为目标：语义化 HTML 与正确的标题层级、跳到主要内容的链接、每个可交互元素都有可见焦点环、用 ARIA 实时区域播报索引与生成进度、遵循减少动效的系统偏好，正文对比度目标不低于 4.5:1。我们没有委托外部无障碍审计，所以这一页说明的是代码实际做了什么、哪里还不到位，而不是声称已通过某项认证。',
        },
        { t: 'h2', text: '这份声明覆盖什么' },
        {
          t: 'p',
          text: '覆盖本域下的静态页面，以及浏览器标签页内运行的工作区，对应 2026-09-17 发布的 v0.1。不覆盖 Google AdSense 投放的第三方广告，它的标记与行为不在我们控制内；也不覆盖从公开模型托管站下载的模型文件。',
        },
        { t: 'h2', text: '结构与语义' },
        {
          t: 'ul',
          items: [
            '每页一个 h1，往下依次是 h2 分节与 h3 小节，不出现跳级，屏幕阅读器可以只靠标题在页面里跳转。',
            '页面顶部有一个跳到主要内容的链接，中文页写「跳到主要内容」，英文页写「Skip to content」，它把焦点直接送到 main 元素。',
            '导航区域都带标签：页头导航标为 Main，面包屑标为 Breadcrumb，语言切换是一组并标为 Language，长页面右侧的目录标为「本页内容」。',
            '广告位标注为补充性区域，英文标签是 Advertisement、中文是「广告」，这与广告位上可见的标注一致。',
            '列表、表格与分步说明使用真正的列表、表格与步骤结构，而不是用样式堆出来的段落，这样条目数量、单元格与列标题之间的关系对辅助技术是可得的。',
            '长页面的标题里带一个隐藏锚点链接，标了 tabindex -1 和 aria-hidden，所以它既不占一个 Tab 停靠点，也不会被重复朗读。',
            'html 元素设置了 lang 属性，中文页面的语言标为简体中文。',
          ],
        },
        { t: 'h2', text: '键盘操作' },
        {
          t: 'p',
          text: '工作区里的所有操作都能只用键盘完成，包括添加文件：拖放区里有一个按钮会打开系统文件选择框，所以拖拽是捷径而不是唯一入口。',
        },
        {
          t: 'table',
          caption: '表 1 — 在这里有具体行为的按键',
          head: ['按键', '行为'],
          rows: [
            ['Tab、Shift+Tab', '在链接、按钮、表单控件与提问框之间前后移动焦点'],
            ['Enter', '提问框获得焦点时发送提问；按钮、链接或折叠标题获得焦点时激活它'],
            ['Shift+Enter', '在提问框里换行，而不是发送'],
            ['Space（空格）', '激活获得焦点的按钮，或切换复选框与开关'],
            ['方向键', '在下拉选择与单选组内移动；在文本框中移动光标'],
            ['翻页键、Home、End', '保持浏览器原本的行为；提问框不会截留这些按键'],
          ],
        },
        {
          t: 'p',
          text: '工作区的面板都带标签，屏幕阅读器可以按区域在文档面板、对话面板、设置面板与本地处理面板之间移动，而不必去数元素。',
        },
        { t: 'h2', text: '焦点可见性' },
        {
          t: 'p',
          text: '焦点不会被移除。可交互元素显示 2.5px 的轮廓，向外偏移 3px，全站用 :focus-visible 统一定义一次，所以键盘用户能看到它，鼠标用户不会看到闪烁的框。提问框另有自己的可见焦点轮廓。跳到主要内容的链接在获得焦点前不可见，获得焦点后显示在页面顶部，并且是第一个 Tab 停靠点。',
        },
        { t: 'h2', text: '动效、颜色与对比度' },
        {
          t: 'ul',
          items: [
            '系统请求减少动效时，动画与过渡会被关掉：全局样式表里的一条规则会停用全部动画与过渡、并停用平滑滚动；工作区样式表另外停掉对话面板里的输入指示动画。',
            '正文对比度目标为 4.5:1 以上，并且不靠颜色单独传达信息：严格度是一组两个具名选项——「仅依据文档」与「允许推理」——每一项的后果都写成文字；索引进度以阶段名和计数播报，而不只是一条填充的进度条。',
            '文档列表里，每份文件都以三个字母的类型标签（PDF、DOC、TXT）加上页数与文本块数作为文字呈现；被关掉的文件写明「已排除」，而不是只靠颜色变化表示。',
            '文章类布局在手机宽度下会自然重排；宽表格在自己的容器内横向滚动，不会把整页撑宽。',
          ],
        },
        { t: 'h2', text: '进度与状态播报' },
        {
          t: 'p',
          text: '索引与模型下载通过标为 polite 的实时区域报告进度，播报会等到停顿再发生，而不是打断你。进度文字按实际发生的阶段给出：读取文件、分块、向量化、已索引；有计数时给出已完成数与总数，模型下载则报告已加载的 MB 对总 MB。错误出现在以 alert 播报的区域里，并带一个带标签的关闭按钮。可选生成模型下载前的确认是一个标为模态的对话框，里面写明体积，并有两个按钮：确认与取消。',
        },
        { t: 'h2', text: '目前做得不够的地方' },
        {
          t: 'p',
          text: '四项已知不足，写在这里而不是留给你自己发现：',
        },
        {
          t: 'ol',
          items: [
            '下载确认对话框没有锁定焦点，也不会在按 Escape 时关闭。Tab 键可以跑到对话框之外，退出的办法是按 Tab 移到取消按钮，再按 Enter 或空格。锁定焦点是这份清单里我们打算优先解决的一项。',
            '手机端「文档 / 对话 / 设置」的切换是导航区域里的三个普通按钮，没有实现 tablist 模式：屏幕阅读器听到的是三个按钮，无法只从标记得知当前显示的是哪一块，左右方向键也不能在它们之间移动。',
            '首页的工作区示意图是一张带短文字标签的标记为图片的元素，标签不是界面描述。屏幕阅读器用户拿到的是标签，而不是布局、字段位置和面板顺序。',
            '目前的测试是人工在桌面 Chrome 和 Edge 上只用键盘完成的。没有外部无障碍专家的审计，也没有覆盖手机端屏幕阅读器，所以诚实的说法是：上面的意图在代码里实现了、并且被部分验证过，而不是端到端验证过。',
          ],
        },
        {
          t: 'callout',
          kind: 'warn',
          title: '没有无障碍浮层，也没有「无障碍插件」。',
          text: '本站不加载任何声称能让页面变无障碍的第三方浮层，因为那类工具修的是报告，不是界面。问题在标记本身里解决。',
        },
        { t: 'h2', text: '报告无障碍问题' },
        {
          t: 'p',
          text: '写信到 guweiicy@gmail.com，说明页面或面板、你使用的辅助技术及其版本，以及发生了什么而不是你预期什么。让某个控件无法到达的键盘陷阱按缺陷处理，不按建议处理，会在任何外观类工作之前修掉。如果你用屏幕阅读器，遇到内容被念两遍或完全没念，把你实际听到的原话发给我们是最有用的信息。',
        },
        { t: 'h2', text: '这一页会怎么变' },
        {
          t: 'p',
          text: '上面那份已知不足清单，是这一页里预期会变动的内容。某一项修好之后，它会在同一天从清单里删除并写进更新日志；发现新的缺口时，会加进清单，而不是悄悄略过。',
        },
      ],
    },
  },
} satisfies ContentPage;
