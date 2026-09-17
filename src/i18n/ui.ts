/**
 * Every UI string in the site lives here, once per locale.
 * Content-heavy page copy lives in src/data/*.ts instead — this file is only chrome.
 * Keys MUST stay identical across locales: scripts/check-i18n.mjs fails the build otherwise.
 */
export const ui = {
  en: {
    // navigation
    'nav.app': 'Open the tool',
    'nav.how': 'How it works',
    'nav.guides': 'Guides',
    'nav.tools': 'Free tools',
    'nav.compare': 'Comparisons',
    'nav.usecases': 'Use cases',
    'nav.models': 'Models',
    'nav.glossary': 'Glossary',
    'nav.blog': 'Blog',
    'nav.trust': 'Trust center',
    'nav.faq': 'FAQ',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.changelog': 'Changelog',
    'nav.privacy': 'Privacy policy',
    'nav.terms': 'Terms of use',
    'nav.security': 'Security notes',
    'nav.accessibility': 'Accessibility',
    'nav.menu': 'Menu',
    'nav.home': 'SecureRAG home',

    // calls to action
    'cta.open': 'Open the tool',
    'cta.start': 'Start with a document',
    'cta.verify': 'How to verify us',
    'cta.readMethod': 'Read the pipeline',
    'cta.privacy': 'Read the privacy policy',
    'cta.allGuides': 'All guides',
    'cta.allComparisons': 'All comparisons',
    'cta.allUseCases': 'All use cases',
    'cta.allArticles': 'All articles',
    'cta.allTools': 'All free tools',

    // privacy promises — wording is fixed site-wide, do not rewrite per page
    'promise.noLeave': 'Files never leave the device',
    'promise.noAccount': 'No account, no tracking pixels',
    'promise.noTraining': 'Not used for training',
    'promise.offline': 'Works offline once cached',

    // advertising
    'ad.label': 'Advertisement',
    'ad.pending': 'Ad slot · space reserved, nothing loaded yet',
    'ad.policy':
      'Ads are labeled, never placed inside the chat workspace, and no ad script loads until you answer the consent question.',
    'a11y.top': 'Back to top',
    'ad.closeAd': 'Close this ad',
    'ad.collapse': 'Hide',
    'ad.expand': 'Show',
    'consent.title': 'Advertising on this site',
    'consent.body':
      'Personalized ads need your consent. Decline and the tool behaves exactly the same — outside the EEA, UK and Switzerland you will still see non-personalized ads; inside them, no ad script loads at all. Nothing is requested before you answer.',
    'consent.accept': 'Allow personalized ads',
    'consent.decline': 'Decline',
    'consent.more': 'How ads work here',

    // footer
    'footer.tagline': 'A static site with a client-side document engine. No backend, no accounts, no upload.',
    'footer.colPlatform': 'Platform',
    'footer.colResources': 'Resources',
    'footer.colTrust': 'Trust',
    'footer.local': 'All processing is local to your device',
    'footer.legal': '© 2026 SecureRAG · securerag.app',

    // shared
    'common.home': 'Home',
    'common.onThisPage': 'On this page',
    'common.related': 'Related',
    'common.readMore': 'Read more',
    'common.lastUpdated': 'Last updated',
    'common.published': 'Published',
    'common.minutes': 'min read',
    'common.by': 'By',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.backHome': 'Back to homepage',
    'common.free': 'Free',
    'common.noSignup': 'No sign-up',
    'common.firstDownload': 'First model download ≈ 25 MB',
    'common.empty': 'Nothing here yet.',
  },
  zh: {
    // 导航
    'nav.app': '打开工具',
    'nav.how': '工作原理',
    'nav.guides': '使用指南',
    'nav.tools': '免费工具',
    'nav.compare': '方案对比',
    'nav.usecases': '应用场景',
    'nav.models': '模型说明',
    'nav.glossary': '术语表',
    'nav.blog': '博客',
    'nav.trust': '信任中心',
    'nav.faq': '常见问题',
    'nav.about': '关于',
    'nav.contact': '联系我们',
    'nav.changelog': '更新日志',
    'nav.privacy': '隐私政策',
    'nav.terms': '使用条款',
    'nav.security': '安全说明',
    'nav.accessibility': '无障碍声明',
    'nav.menu': '菜单',
    'nav.home': 'SecureRAG 首页',

    // 行动号召
    'cta.open': '打开工具',
    'cta.start': '从一份文档开始',
    'cta.verify': '如何验证我们',
    'cta.readMethod': '看处理管线',
    'cta.privacy': '阅读隐私政策',
    'cta.allGuides': '全部指南',
    'cta.allComparisons': '全部对比',
    'cta.allUseCases': '全部场景',
    'cta.allArticles': '全部文章',
    'cta.allTools': '全部免费工具',

    // 隐私承诺 —— 全站措辞固定，不要逐页改写
    'promise.noLeave': '文件永不离开你的设备',
    'promise.noAccount': '无账号、无追踪像素',
    'promise.noTraining': '不用于训练',
    'promise.offline': '缓存后可离线',

    // 广告
    'ad.label': '广告',
    'ad.pending': '广告位 · 已预留空间，尚未加载',
    'ad.policy': '广告有明确标注，不会出现在聊天工作区内；在你回答同意问题之前，不会加载任何广告脚本。',
    'a11y.top': '回到顶部',
    'ad.closeAd': '关闭这个广告',
    'ad.collapse': '收起',
    'ad.expand': '展开',
    'consent.title': '本站的广告',
    'consent.body':
      '个性化广告需要你的同意。拒绝后工具行为完全不变——在欧盟、英国、瑞士以外，你仍会看到非个性化广告；在这三个地区内，则不加载任何广告脚本。在你作答之前，不会发出任何请求。',
    'consent.accept': '同意个性化广告',
    'consent.decline': '拒绝',
    'consent.more': '广告在这里怎么运作',

    // 页脚
    'footer.tagline': '一个带客户端文档引擎的静态网站。没有后端，没有账号，没有上传。',
    'footer.colPlatform': '平台',
    'footer.colResources': '资源',
    'footer.colTrust': '信任',
    'footer.local': '全部处理都在你的设备本地完成',
    'footer.legal': '© 2026 SecureRAG · securerag.app',

    // 通用
    'common.home': '首页',
    'common.onThisPage': '本页目录',
    'common.related': '相关内容',
    'common.readMore': '阅读更多',
    'common.lastUpdated': '最后更新',
    'common.published': '发布于',
    'common.minutes': '分钟阅读',
    'common.by': '作者',
    'common.next': '下一篇',
    'common.prev': '上一篇',
    'common.backHome': '返回首页',
    'common.free': '免费',
    'common.noSignup': '免注册',
    'common.firstDownload': '首次下载模型约 25MB',
    'common.empty': '这里还没有内容。',
  },
} as const;

export type Lang = keyof typeof ui;
export type UIKey = keyof (typeof ui)['en'];
