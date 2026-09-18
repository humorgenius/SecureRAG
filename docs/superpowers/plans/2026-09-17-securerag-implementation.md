# SecureRAG 站点实现计划（Implementation Plan）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `D:\【建立网站】\SecureRAG` 交付一个纯静态、中英双语、84 个可索引 URL 的站点，内含一个 100% 浏览器本地的多文档 RAG 问答工具，可直接部署到 GitHub Pages 并通过 AdSense 审核。

**Architecture:** Astro 5 静态输出（营销页零 JS）＋ Tailwind v4 与一层自建设计 token；i18n 用 `src/pages/[lang]/**` 物理路由，两语言各自预渲染；工具页是唯一带框架的交互岛（Preact），RAG 引擎按 ingest → chunk → embed → index → retrieve → answer 分文件、跑在 Web Worker 里，状态全部落在 IndexedDB。视觉按方案 E（Enterprise Trust）固化。

**Tech Stack:** Astro 5 / Tailwind CSS v4 / Preact / TypeScript / Transformers.js v3 / pdfjs-dist / mammoth / jszip / idb-keyval / favicon 无（SVG inline）

## Global Constraints

- 视觉基线：方案 E —— 深蓝 hero（`#0a1730 → #0d1e40`）＋ 浅底正文（`#f7f9fc`）＋ 白卡 ＋ 品牌蓝 `#2f6bed`；圆角 8/12/16/22px；阴影仅两级（`--sh-1`、`--sh-2`）；字体走系统栈，禁止外部字体请求。
- **文字轴纪律**：全站内容单一文字轴，容器 `max-width:1160px` + `padding:0 28px`（≤900px 时 22px，≤640px 时 20px）；任何标题、卡片、表格不得脱离该轴居中。移动端断点 480 / 640 / 900 / 1020 / 1140。
- 隐私承诺文案逐字统一（不得各页改写）：EN `Files never leave your device` / ZH `文件永不离开你的设备`；次级承诺 `No account, no tracking pixels` / `无账号、无追踪像素`、`Not used for training` / `不用于训练`、`Works offline once cached` / `缓存后可离线`。
- 唯一允许的外发请求：模型权重 GET（域名列入 CSP `connect-src` 白名单）。其余第三方请求一律禁止（含字体、分析、CDN）。
- 广告：仅用 `AdSlot.astro` 渲染，每页 ≤3，必须带 `Advertisement / 广告` 标签、固定 `min-height:104px`（防 CLS）、不得出现在 `/app`、`/privacy`、`/terms`、聊天面板内部与首屏主 CTA 上方。
- i18n：`en`（默认，`hreflang="en"`）、`zh`（`hreflang="zh-Hans"`）、`x-default → /`；每个页面必须输出 canonical 自指 + 三连 hreflang；两语言不得互译抄袭，中文侧独立撰写。
- 页面模板数 ≥ 42（×2 语言）；每页 `<title>` ≤60 字符、`description` 120–158 字符。
- 无障碍：语义标签、跳转链接、可见 focus ring（2.5px `#7aa5ff`）、对比度 ≥4.5:1、全部功能键盘可达、`aria-live` 播报索引与生成进度。
- 性能预算：营销页首屏 JS ≤ 20KB（仅语言切换）；`/app` 外壳 ≤ 60KB，引擎与模型按需动态 import。
- 构建必须可在含中文的路径下工作；若 Vite 报非 ASCII 路径错误，改为在 `E:\hermes-workspace\securerag-build\` 构建并把产物同步回项目。
- 每个任务结束都必须 `npm run build` 通过后提交。

---

## 文件结构（先锁定边界，再拆任务）

```
SecureRAG/
├─ package.json  astro.config.mjs  tsconfig.json  .npmrc  .gitignore
├─ public/  robots.txt  ads.txt  CNAME  llms.txt  llms-full.txt  og/  samples/  ort/
├─ scripts/ check-i18n.mjs  check-seo.mjs
├─ .github/workflows/deploy.yml
└─ src/
   ├─ styles/ tokens.css      # 设计令牌（唯一改风格入口）
   ├─ styles/ global.css      # Tailwind 引入 + 基础层 + 组件类 + 动效
   ├─ i18n/   ui.ts           # 全站文案字典（en/zh 键必须完全对齐）
   ├─ i18n/   utils.ts        # getLangFromUrl / t / useTranslations / localizePath / altLangPath
   ├─ data/   site.ts         # 站点常量（域名、品牌、社交、AdSense 发布者 ID）
   ├─ data/   pages.ts        # 内容页数据表（slug/title/desc/sections/faq/related）
   ├─ data/   models.ts       # 模型清单（名称/体积/维度/许可/来源）
   ├─ lib/seo/schema.ts       # 全部 JSON-LD 生成器
   ├─ lib/i18n/route.ts       # 路由 ↔ 语言映射纯函数（可单测）
   ├─ lib/rag/…               # 引擎，见 Task 15–17
   ├─ components/seo/      BaseHead.astro  JsonLd.astro  Breadcrumbs.astro
   ├─ components/layout/   Header.astro  Footer.astro  LangSwitch.astro  SkipLink.astro
   ├─ components/marketing/ Hero.astro  Metrics.astro  CapabilityGrid.astro  TrustCenter.astro
   │                       CompareTable.astro  TierCards.astro  FaqAccordion.astro
   │                       AdSlot.astro  PrivacyBadge.astro  SectionHeading.astro  Prose.astro
   ├─ components/app/      App.tsx  DropZone.tsx  DocList.tsx  ChatPanel.tsx  Message.tsx
   │                       CitationCard.tsx  SettingsPanel.tsx  ModelLoader.tsx
   │                       NetworkShield.tsx  ExportDialog.tsx  ErrorBanner.tsx
   ├─ layouts/  BaseLayout.astro  ContentLayout.astro
   └─ pages/
      ├─ index.astro                 # 语言网关（noindex + 立即跳转）
      ├─ 404.astro
      └─ [lang]/
         ├─ index.astro              # 首页（方案 E 全套）
         ├─ app.astro                # 核心工具页
         ├─ tools/index.astro  tools/pdf-text-extractor.astro
         ├─ tools/token-counter.astro  tools/chunk-preview.astro
         ├─ how-it-works.astro  models.astro  security.astro
         ├─ privacy.astro  terms.astro  accessibility.astro
         ├─ faq.astro  about.astro  contact.astro  changelog.astro
         ├─ glossary.astro
         ├─ compare/index.astro  compare/notebooklm.astro
         ├─ compare/chatpdf.astro  compare/chatgpt-file-upload.astro
         ├─ use-cases/index.astro  use-cases/{legal,research,students,hr-finance}.astro
         ├─ guides/index.astro
         └─ blog/index.astro
   └─ content/ (MDX collections)
      ├─ guides/{en,zh}/*.mdx       # 5 篇
      └─ blog/{en,zh}/*.mdx         # 6 篇
```

---

## Task 1：项目脚手架与构建冒烟

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.npmrc`, `.gitignore`, `src/pages/index.astro`（临时占位）, `src/pages/404.astro`
- Run: `npm install`

**Interfaces:**
- Produces: 可运行的构建（`npm run build` 产出 `dist/`），供后续所有任务使用。

- [ ] **Step 1: 写 `.npmrc`（国内镜像，避免超时）**

```ini
registry=https://registry.npmmirror.com
```

- [ ] **Step 2: 写最小 `package.json`**

```json
{
  "name": "securerag-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check:i18n": "node scripts/check-i18n.mjs",
    "check:seo": "node scripts/check-seo.mjs"
  }
}
```

- [ ] **Step 3: 安装依赖（让 npm 写实际版本）**

```bash
npm install astro @astrojs/mdx @astrojs/sitemap @astrojs/preact preact tailwindcss @tailwindcss/vite
npm install -D typescript @astrojs/check
```

- [ ] **Step 4: 写 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://lilink.net',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    mdx(),
    preact({ compat: false }),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hans' } },
      filter: (page) => !page.includes('404') && !page.endsWith('lilink.net/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
```

- [ ] **Step 5: 写 `tsconfig.json` 与 `.gitignore`**

```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

```gitignore
node_modules/
dist/
.astro/
.DS_Store
*.log
```

- [ ] **Step 6: 写临时 `src/pages/index.astro` 与 `src/pages/404.astro`**（仅为了能构建，Task 5 会替换）

```astro
---
---
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SecureRAG</title></head>
<body><h1>SecureRAG</h1></body></html>
```

- [ ] **Step 7: 构建冒烟（关键：验证含中文的路径能否编译）**

Run: `npm run build`
Expected: 生成 `dist/index.html`，退出码 0。若报非 ASCII 路径相关错误 → 记录并切换到 `E:\hermes-workspace\securerag-build\` 构建方案（见 Global Constraints）。

- [ ] **Step 8: 初始化 git 并提交**

```bash
git init && git add -A && git commit -m "chore: astro scaffold + build smoke test"
```

---

## Task 2：设计令牌与全局样式（方案 E 落地）

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/pages/index.astro`（import global.css 以验证）

**Interfaces:**
- Produces: CSS 变量 `--navy/-2/-3`, `--bg`, `--card`, `--ink/-2`, `--muted/-2`, `--line/-2`, `--blue/-d/-soft`, `--green/-soft`, `--amber/-soft`, `--sh-1`, `--sh-2`, `--maxw`, `--pad`；组件类 `.wrap` `.btn` `.btn-blue` `.btn-white` `.card` `.pill` `.eyebrow` `.h1/.h2/.lede` `.anim-in` `.ad-slot` `.skip`。

- [ ] **Step 1: 写 `src/styles/tokens.css`**（从设计稿 E 逐值搬运，不得改数值）

```css
:root{
  --navy:#0a1730; --navy-2:#122550; --navy-3:#1b3568;
  --bg:#f7f9fc; --card:#ffffff;
  --ink:#0e1a2b; --ink-2:#2b3a4d; --muted:#5b6b7f; --muted-2:#8593a5;
  --line:#e2e8f1; --line-2:#cfd8e6;
  --blue:#2f6bed; --blue-d:#1f52c4; --blue-soft:#eef3fe;
  --green:#0f7a4f; --green-soft:#e9f6f0;
  --amber:#b54708; --amber-soft:#fdf4e7;
  --radius-s:8px; --radius-m:12px; --radius-l:16px; --radius-xl:22px;
  --sh-1:0 1px 2px rgba(16,24,40,.05),0 6px 18px rgba(16,24,40,.05);
  --sh-2:0 2px 6px rgba(16,24,40,.06),0 18px 44px rgba(16,24,40,.09);
  --sh-blue:0 24px 50px -28px rgba(47,107,237,.45);
  --maxw:1160px; --pad:28px;
  --font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,"Helvetica Neue",Arial,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  --font-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
}
@media(max-width:900px){:root{--pad:22px}}
@media(max-width:640px){:root{--pad:20px}}
```

- [ ] **Step 2: 写 `src/styles/global.css` 的 Tailwind 引入与基础层**

```css
@import "tailwindcss";
@import "./tokens.css";

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink-2);font-family:var(--font-sans);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{margin:0;color:var(--ink);font-weight:700;letter-spacing:-.027em;line-height:1.14}
p{margin:0} ul{margin:0;padding:0;list-style:none} img,svg{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2.5px solid #7aa5ff;outline-offset:3px;border-radius:6px}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad)}
.skip{position:absolute;left:-9999px}
.skip:focus{left:20px;top:12px;z-index:99;background:#fff;color:var(--ink);padding:10px 16px;border-radius:8px}
```

- [ ] **Step 3: 写 `global.css` 的组件层**（按钮 / 卡片 / 表格 / 章节标题 / 广告位 / 动效 / 打印）

```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--radius-s);
  padding:10px 18px;font-size:14.5px;font-weight:600;border:1px solid transparent;cursor:pointer;
  transition:background .16s,transform .16s,box-shadow .16s,border-color .16s}
.btn-blue{background:var(--blue);color:#fff;box-shadow:var(--sh-blue)}
.btn-blue:hover{background:var(--blue-d);transform:translateY(-1px)}
.btn-white{background:#fff;color:var(--ink);border-color:var(--line-2)}
.btn-white:hover{border-color:var(--ink);transform:translateY(-1px)}
.btn-ghost-d{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.24)}
.btn-lg{padding:13px 24px;font-size:15.5px;border-radius:10px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--sh-1)}
.card:hover{box-shadow:var(--sh-2);border-color:var(--line-2)}
.pill{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;
  border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px}
.eyebrow{font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}
.h1{font-size:clamp(33px,4.6vw,54px);line-height:1.07;max-width:21ch}
.h2{font-size:clamp(25px,3vw,36px);letter-spacing:-.03em;max-width:32ch}
.lede{font-size:17.5px;line-height:1.68;color:var(--muted);max-width:60ch}
table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid var(--line);
  border-radius:14px;overflow:hidden;box-shadow:var(--sh-1)}
th,td{text-align:left;padding:15px 18px;border-bottom:1px solid var(--line);vertical-align:top}
thead th{background:#fbfcfe;font-size:13px;font-weight:700;color:var(--ink)}
tbody tr:last-child td{border-bottom:0}
.ad-slot{margin-top:34px;border:1px solid var(--line);border-radius:14px;background:#fff;
  min-height:104px;display:grid;place-items:center;text-align:center}
.anim-in{animation:fadeUp .6s cubic-bezier(.2,.7,.3,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
```

- [ ] **Step 4: 验证**

Run: `npm run build` → Expected: 构建通过，无 Tailwind 未知指令报错。

- [ ] **Step 5: Commit** `feat: design tokens and global stylesheet (scheme E)`

---

## Task 3：i18n 层与一致性校验脚本

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/utils.ts`, `src/lib/i18n/route.ts`, `scripts/check-i18n.mjs`
- Test: `scripts/check-i18n.mjs`（本身即校验器，CI 门禁）

**Interfaces:**
- Produces: `type Lang = 'en'|'zh'`；`ui: Record<Lang, Record<string,string>>`；`getLangFromUrl(url: URL): Lang`；`t(lang, key): string`；`useTranslations(lang): (k)=>string`；`localizePath(lang, path): string`；`altLangPath(pathname, target): string`。
- 后续所有组件只允许通过 `t()` 取文案，禁止硬编码。

- [ ] **Step 1: 写 `src/i18n/ui.ts`**（键集合 en/zh 必须完全一致；此处列全量键）

```ts
export const ui = {
  en: {
    'nav.product':'Platform','nav.how':'How it works','nav.guides':'Guides','nav.models':'Models',
    'nav.trust':'Trust center','nav.faq':'FAQ','nav.tools':'Free tools','nav.compare':'Comparisons',
    'nav.usecases':'Use cases','nav.glossary':'Glossary','nav.blog':'Blog','nav.about':'About',
    'nav.contact':'Contact','nav.changelog':'Changelog','nav.privacy':'Privacy policy',
    'nav.terms':'Terms of use','nav.security':'Security notes','nav.accessibility':'Accessibility',
    'cta.open':'Open the tool','cta.start':'Start with a document','cta.verify':'How to verify us',
    'cta.readMethod':'Read the pipeline','cta.privacy':'Read the privacy policy',
    'promise.noLeave':'Files never leave the device','promise.noAccount':'No account, no tracking pixels',
    'promise.noTraining':'Not used for training','promise.offline':'Works offline once cached',
    'ad.label':'Advertisement','footer.legal':'© 2026 SecureRAG · lilink.net',
    'footer.local':'All processing is local to your device','footer.ads':'Ads labeled · consent-gated · never inside the workspace',
    'common.readMore':'Read more','common.onThisPage':'On this page','common.related':'Related',
    'common.lastUpdated':'Last updated','common.minutes':'min read','common.home':'Home',
    'faq.heading':'Frequently asked questions','404.title':'Page not found','404.body':'That page does not exist.',
  },
  zh: {
    'nav.product':'平台','nav.how':'工作原理','nav.guides':'指南','nav.models':'模型','nav.trust':'信任中心',
    'nav.faq':'常见问题','nav.tools':'免费工具','nav.compare':'方案对比','nav.usecases':'应用场景',
    'nav.glossary':'术语表','nav.blog':'博客','nav.about':'关于','nav.contact':'联系我们',
    'nav.changelog':'更新日志','nav.privacy':'隐私政策','nav.terms':'使用条款','nav.security':'安全说明',
    'nav.accessibility':'无障碍声明','cta.open':'打开工具','cta.start':'从一份文档开始',
    'cta.verify':'如何验证我们','cta.readMethod':'看处理管线','cta.privacy':'阅读隐私政策',
    'promise.noLeave':'文件永不离开你的设备','promise.noAccount':'无账号、无追踪像素',
    'promise.noTraining':'不用于训练','promise.offline':'缓存后可离线',
    'ad.label':'广告','footer.legal':'© 2026 SecureRAG · lilink.net',
    'footer.local':'全部处理都在你的设备本地完成','footer.ads':'广告有标注 · 需同意加载 · 不进工作区',
    'common.readMore':'阅读更多','common.onThisPage':'本页目录','common.related':'相关内容',
    'common.lastUpdated':'最后更新','common.minutes':'分钟阅读','common.home':'首页',
    'faq.heading':'常见问题','404.title':'页面不存在','404.body':'这个页面不存在。',
  },
} as const;
export type Lang = keyof typeof ui;
export type UIKey = keyof (typeof ui)['en'];
```

- [ ] **Step 2: 写 `src/i18n/utils.ts`**

```ts
import { ui, type Lang, type UIKey } from './ui';
export const LOCALES: Lang[] = ['en','zh'];
export const DEFAULT_LANG: Lang = 'en';

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return (LOCALES as string[]).includes(seg) ? (seg as Lang) : DEFAULT_LANG;
}
export function t(lang: Lang, key: UIKey): string { return ui[lang][key] ?? ui.en[key]; }
export function useTranslations(lang: Lang) { return (key: UIKey) => t(lang, key); }
export function localizePath(lang: Lang, path = '/'): string {
  const clean = '/' + path.replace(/^\/?(en|zh)?\/?/, '').replace(/\/+$/, '') + '/';
  return `/${lang}${clean === '//' ? '/' : clean}`.replace(/\/{2,}/g, '/');
}
```

- [ ] **Step 3: 写 `src/lib/i18n/route.ts`（纯函数，便于单测）**

```ts
import { LOCALES, type Lang } from '../../i18n/utils';
export function altLangPath(pathname: string, target: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && (LOCALES as string[]).includes(parts[0])) parts[0] = target;
  else parts.unshift(target);
  return '/' + parts.join('/') + '/';
}
export function isLocalePath(pathname: string): boolean {
  const seg = pathname.split('/').filter(Boolean)[0];
  return (LOCALES as string[]).includes(seg);
}
```

- [ ] **Step 4: 写 `scripts/check-i18n.mjs`**（校验键对齐 + 内容集合配对）

```js
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const src = readFileSync('src/i18n/ui.ts','utf8');
const grab = (loc) => {
  const m = src.match(new RegExp(`${loc}:\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm'));
  if (!m) throw new Error(`cannot parse locale block: ${loc}`);
  return [...m[1].matchAll(/'([a-zA-Z0-9_.]+)':/g)].map(x => x[1]).sort();
};
const en = grab('en'), zh = grab('zh');
const missingZh = en.filter(k => !zh.includes(k));
const missingEn = zh.filter(k => !en.includes(k));
let bad = 0;
if (missingZh.length) { console.error('missing in zh:', missingZh); bad = 1; }
if (missingEn.length) { console.error('missing in en:', missingEn); bad = 1; }
for (const c of ['guides','blog']) {
  const d = `src/content/${c}`;
  if (!existsSync(d)) continue;
  const en2 = readdirSync(`${d}/en`).map(f=>f.replace(/\.mdx?$/,'')).sort();
  const zh2 = existsSync(`${d}/zh`) ? readdirSync(`${d}/zh`).map(f=>f.replace(/\.mdx?$/,'')).sort() : [];
  const diff = en2.filter(s => !zh2.includes(s));
  if (diff.length) { console.error(`${c}: unmatched zh slugs`, diff); bad = 1; }
}
console.log(bad ? 'i18n check FAILED' : `i18n check OK (${en.length} keys)`);
process.exit(bad);
```

- [ ] **Step 5: 运行校验**

Run: `node scripts/check-i18n.mjs`
Expected: `i18n check OK (34 keys)`

- [ ] **Step 6: Commit** `feat: i18n dictionary, route helpers, consistency gate`

---

## Task 4：SEO 层（BaseHead / JSON-LD / schema 生成器）

**Files:**
- Create: `src/data/site.ts`, `src/lib/seo/schema.ts`, `src/components/seo/BaseHead.astro`, `src/components/seo/JsonLd.astro`, `src/components/seo/Breadcrumbs.astro`

**Interfaces:**
- Produces: `SITE = { name:'SecureRAG', url:'https://lilink.net', ... }`；`orgSchema(lang)`、`websiteSchema(lang)`、`softwareAppSchema(lang)`、`faqSchema(qa)`、`articleSchema(o)`、`breadcrumbSchema(items)`、`definedTermSetSchema(...)`、`howToSchema(...)`；`<BaseHead title description lang path type? image? />`。

- [ ] **Step 1: 写 `src/data/site.ts`**

```ts
export const SITE = {
  name: 'SecureRAG', url: 'https://lilink.net', localeOf: { en: 'en_US', zh: 'zh_CN' } as const,
  twitter: '@securerag', adsensePublisher: 'ca-pub-XXXXXXXXXXXXXXXX', // 上线前替换为真实 ID
  modelsRepo: 'https://huggingface.co/Xenova', contactEmail: 'guweiicy@gmail.com',
} as const;
```

- [ ] **Step 2: 写 `src/lib/seo/schema.ts`**（每个函数返回可直接 JSON.stringify 的对象；`@id` 用绝对 URL 保证实体一致）

```ts
import { SITE } from '../../data/site';
import type { Lang } from '../../i18n/utils';
const abs = (p: string) => new URL(p, SITE.url).href;
export const orgSchema = (lang: Lang) => ({
  '@context':'https://schema.org','@type':'Organization','@id':abs('/#org'),name:SITE.name,url:SITE.url,
  logo:abs('/og/logo.png'),email:SITE.contactEmail,
  description: lang==='zh' ? '浏览器本地的文档 RAG 问答工具，文件永不离开设备。'
                          : 'A browser-local document RAG tool. Files never leave your device.',
  sameAs:[SITE.modelsRepo],
});
export const websiteSchema = (lang: Lang) => ({
  '@context':'https://schema.org','@type':'WebSite','@id':abs('/#website'),name:SITE.name,url:SITE.url,
  inLanguage: lang==='zh'?'zh-Hans':'en',publisher:{'@id':abs('/#org')},
});
export const softwareAppSchema = (lang: Lang) => ({
  '@context':'https://schema.org','@type':'SoftwareApplication',name:SITE.name,
  applicationCategory:'BusinessApplication',operatingSystem:'Any (web browser)',
  url:abs(`/${lang}/app/`),offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},
  featureList: lang==='zh'
    ? ['本地文档解析','本地向量索引','多文档管理','段落级引用','离线可用']
    : ['Local document parsing','Local vector index','Multi-document collections','Paragraph-level citations','Offline use'],
});
export const faqSchema = (qa: {q:string;a:string}[]) => ({
  '@context':'https://schema.org','@type':'FAQPage',
  mainEntity: qa.map(x => ({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}})),
});
export const articleSchema = (o:{lang:Lang;title:string;description:string;path:string;datePublished:string;dateModified:string;author:string}) => ({
  '@context':'https://schema.org','@type':'Article',headline:o.title,description:o.description,
  inLanguage:o.lang==='zh'?'zh-Hans':'en',datePublished:o.datePublished,dateModified:o.dateModified,
  mainEntityOfPage:abs(o.path),author:{'@type':'Person',name:o.author},publisher:{'@id':abs('/#org')},
});
export const breadcrumbSchema = (items:{name:string;path:string}[]) => ({
  '@context':'https://schema.org','@type':'BreadcrumbList',
  itemListElement: items.map((it,i)=>({'@type':'ListItem',position:i+1,name:it.name,item:abs(it.path)})),
});
```

- [ ] **Step 3: 写 `src/components/seo/JsonLd.astro`**

```astro
---
interface Props { data: object | object[] }
const { data } = Astro.props;
const payload = Array.isArray(data) ? { '@context':'https://schema.org','@graph': data.map(d => { const {['@context']:_, ...rest} = d as any; return rest; }) } : data;
---
<script type="application/ld+json" set:html={JSON.stringify(payload)} />
```

- [ ] **Step 4: 写 `src/components/seo/BaseHead.astro`**（canonical + hreflang 三连 + OG + Twitter + 可选 CSP meta）

```astro
---
import { SITE } from '../../data/site';
import { altLangPath } from '../../lib/i18n/route';
import type { Lang } from '../../i18n/utils';
interface Props { title: string; description: string; lang: Lang; path: string; type?: string; image?: string; noindex?: boolean }
const { title, description, lang, path, type = 'website', image = '/og/og-default.png', noindex = false } = Astro.props;
const canonical = new URL(path, SITE.url).href;
const en = new URL(altLangPath(Astro.url.pathname, 'en'), SITE.url).href;
const zh = new URL(altLangPath(Astro.url.pathname, 'zh'), SITE.url).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="alternate" hreflang="en" href={en} />
<link rel="alternate" hreflang="zh-Hans" href={zh} />
<link rel="alternate" hreflang="x-default" href={lang === 'en' ? en : new URL('/', SITE.url).href} />
{noindex && <meta name="robots" content="noindex,follow" />}
<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:site_name" content={SITE.name} />
<meta property="og:image" content={new URL(image, SITE.url).href} />
<meta property="og:locale" content={SITE.localeOf[lang]} />
<meta property="og:locale:alternate" content={SITE.localeOf[lang === 'en' ? 'zh' : 'en']} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(image, SITE.url).href} />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 5: 写 `src/components/seo/Breadcrumbs.astro`**（可见面包屑 + 同一份数据喂 JSON-LD）

```astro
---
import { breadcrumbSchema } from '../../lib/seo/schema';
interface Props { items: { name: string; path: string }[] }
const { items } = Astro.props;
---
<nav aria-label="Breadcrumb" class="crumbs"><ol>
  {items.map((it, i) => (
    <li>{i < items.length - 1 ? <a href={it.path}>{it.name}</a> : <span aria-current="page">{it.name}</span>}</li>
  ))}
</ol></nav>
<script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema(items))} />
```

- [ ] **Step 6: 构建 + 抽查**

Run: `npm run build && node -e "const h=require('fs').readFileSync('dist/index.html','utf8');console.log(h.length>0)"`
（Task 5 完成后改为抽查 `dist/en/index.html` 是否含 `hreflang="zh-Hans"`）

- [ ] **Step 7: Commit** `feat: seo layer (head, json-ld, breadcrumbs)`

---

## Task 5：布局骨架（BaseLayout / Header / Footer / 语言网关 / 404）

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/layout/{Header,Footer,LangSwitch,SkipLink}.astro`, `src/components/marketing/PrivacyBadge.astro`
- Modify: `src/pages/index.astro`（替换为语言网关）, `src/pages/404.astro`

**Interfaces:**
- Consumes: Task 3 的 `t()/altLangPath`，Task 4 的 `BaseHead`。
- Produces: `<BaseLayout lang title description path type? noindex? activeNav?>`；`<LangSwitch lang path />`（真实跳转到对应语言路径，不用 JS 换文案）。

- [ ] **Step 1: 写 `SkipLink.astro`、`PrivacyBadge.astro`**（4 条承诺 pill，文案取自 `t()`，全站复用）

- [ ] **Step 2: 写 `LangSwitch.astro`**

```astro
---
import { altLangPath } from '../../lib/i18n/route';
interface Props { lang: 'en' | 'zh'; path: string }
const { lang, path } = Astro.props;
const other = lang === 'en' ? 'zh' : 'en';
---
<div class="langsw" role="group" aria-label="Language">
  <a href={path} aria-current={lang==='en'?'true':undefined} class={lang==='en'?'on':''}>EN</a>
  <a href={altLangPath(path, other)} aria-current={lang==='zh'?'true':undefined} class={lang==='zh'?'on':''}>中文</a>
</div>
```

- [ ] **Step 3: 写 `Header.astro`**（深蓝导航，链接用 `localizePath(lang,...)`，含 LangSwitch 与蓝色 CTA；≤1020px 折叠为 details/summary 汉堡，纯 CSS 无 JS）

- [ ] **Step 4: 写 `Footer.astro`**（4 列：品牌+一句话 / Platform / Resources / Trust；底部条含 `footer.local`、`footer.ads`；所有内链 `localizePath`）

- [ ] **Step 5: 写 `BaseLayout.astro`**

```astro
---
import BaseHead from '../components/seo/BaseHead.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import SkipLink from '../components/layout/SkipLink.astro';
import '../styles/global.css';
import type { Lang } from '../i18n/utils';
interface Props { title: string; description: string; lang: Lang; path: string; type?: string; noindex?: boolean; activeNav?: string }
const { title, description, lang, path, type, noindex, activeNav } = Astro.props;
---
<!doctype html>
<html lang={lang === 'zh' ? 'zh-Hans' : 'en'}>
  <head><BaseHead title={title} description={description} lang={lang} path={path} type={type} noindex={noindex} /></head>
  <body>
    <SkipLink lang={lang} />
    <Header lang={lang} path={path} activeNav={activeNav} />
    <main id="main"><slot /></main>
    <Footer lang={lang} />
  </body>
</html>
```

- [ ] **Step 6: 写语言网关 `src/pages/index.astro`**（noindex + 立即跳转 + 无 JS 兜底）

```astro
---
import BaseHead from '../components/seo/BaseHead.astro';
---
<!doctype html>
<html lang="en">
<head>
  <BaseHead title="SecureRAG" description="Local, private document Q&A in your browser." lang="en" path="/" noindex={true} />
  <meta http-equiv="refresh" content="0;url=/en/" />
  <script is:inline>
    (function () {
      var saved = localStorage.getItem('securerag.lang');
      var nav = (navigator.languages || [navigator.language || 'en']).join(',').toLowerCase();
      var pick = saved || (/^zh|,zh/.test(nav) ? 'zh' : 'en');
      var to = '/' + pick + '/' + location.hash;
      location.replace(to);
    })();
  </script>
</head>
<body><div class="wrap"><p><a href="/zh/">中文</a> · <a href="/en/">English</a></p></div></body>
</html>
```

- [ ] **Step 7: 写 `404.astro`**（双语静态文案 + 返回首页链接；`noindex`）

- [ ] **Step 8: 验证语言网关与 hreflang**

Run: `npm run build`
Run: `grep -c 'hreflang="zh-Hans"' dist/en/index.html` → Expected: `1`
（若此时 `dist/en/` 尚未生成，则在 Task 6 后再验一次）

- [ ] **Step 9: Commit** `feat: base layout, header/footer, language gateway, 404`

---

## Task 6：首页（方案 E 全量落地）

**Files:**
- Create: `src/components/marketing/{Hero,Metrics,CapabilityGrid,TrustCenter,CompareTable,TierCards,FaqAccordion,AdSlot}.astro`, `src/data/home.ts`
- Create: `src/pages/[lang]/index.astro`
- Reference: `design/mockups/E-enterprise-trust.html`（逐块搬运，不得改变视觉数值）

**Interfaces:**
- Produces: `<AdSlot lang />`、`<FaqAccordion lang items />`、`<CompareTable lang rows />`；首页两语言各一份预渲染 HTML。

- [ ] **Step 1: 写 `src/data/home.ts`**（把设计稿里的中英文案结构化：hero、4 条承诺、4 个指标、6 张能力卡、信任中心 4 条、对比表 8 行、两档模型、4 条 FAQ）

- [ ] **Step 2: 写 `AdSlot.astro`**（含 `aria-label`、`Advertisement/广告` 标签、`min-height`，预留 `data-ad-client`/`data-ad-slot` 占位但不加载脚本）

- [ ] **Step 3–8: 依次写 Hero / Metrics / CapabilityGrid / TrustCenter / CompareTable / TierCards / FaqAccordion 组件**（结构照搬 `E-enterprise-trust.html`，文案取 `data/home.ts[lang]`；FAQ 用原生 `<details>`；表格移动端横向滚动容器 `.tw{overflow-x:auto}`）

- [ ] **Step 9: 写 `src/pages/[lang]/index.astro`**

```astro
---
export function getStaticPaths() { return [{ params: { lang: 'en' } }, { params: { lang: 'zh' } }]; }
const { lang } = Astro.params as { lang: 'en' | 'zh' };
import BaseLayout from '../../layouts/BaseLayout.astro';
import Hero from '../../components/marketing/Hero.astro';
// …其余组件
import { home } from '../../data/home';
import { orgSchema, websiteSchema, softwareAppSchema } from '../../lib/seo/schema';
const c = home[lang];
---
<BaseLayout lang={lang} path={`/${lang}/`} title={c.meta.title} description={c.meta.description}>
  <Hero lang={lang} />
  <Metrics lang={lang} />
  <CapabilityGrid lang={lang} />
  <TrustCenter lang={lang} />
  <CompareTable lang={lang} />
  <TierCards lang={lang} />
  <AdSlot lang={lang} />
  <FaqAccordion lang={lang} />
  <EndCta lang={lang} />
</BaseLayout>
<script type="application/ld+json" set:html={JSON.stringify([orgSchema(lang), websiteSchema(lang), softwareAppSchema(lang)])} />
```

- [ ] **Step 10: 视觉回归**（用与设计稿相同的方法截图比对）

Run（PowerShell/cmd 均可，脚本在 `scripts/`）：`node scripts/shot.mjs dist/en/index.html en-home 1440,3000`
Expected: 与 `design/mockups/E-enterprise-trust.html` 的同尺寸截图逐块一致（允许文案扩展导致的换行差异）。

- [ ] **Step 11: 构建 + 校验**

Run: `npm run build && node scripts/check-i18n.mjs`
Expected: 构建通过；`dist/en/index.html` 与 `dist/zh/index.html` 均含 3 组 JSON-LD 与 `hreflang`。

- [ ] **Step 12: Commit** `feat: homepage in scheme E (en+zh)`

---

## Task 7：内容页数据模型 + 9 个静态内容页

**Files:**
- Create: `src/data/pages.ts`, `src/layouts/ContentLayout.astro`, `src/components/marketing/{SectionHeading,Prose}.astro`
- Create: `src/pages/[lang]/{how-it-works,models,security,privacy,terms,accessibility,about,contact,changelog}.astro`

**Interfaces:**
- Produces: `type ContentPage = { slug:string; nav?:string; meta:{en:{title,description},zh:{…}}; blocks: Block[] }`；`Block = {t:'h2'|'h3'|'p'|'ul'|'ol'|'table'|'callout'|'steps'|'faq', …}`。`ContentLayout` 消费 blocks → 渲染 + TOC + 面包屑 + JSON-LD(Article/Breadcrumb)。

- [ ] **Step 1: 写 `src/data/pages.ts` 的类型与 `how-it-works`、`models`、`security` 三页数据**（models 页数据从 `src/data/models.ts` 取，含：默认轻量档 3 个模型 + 可选生成档 2 个，字段 name/params/quant/size/dim/lang/license/source）

- [ ] **Step 2: 写 `ContentLayout.astro`**（左正文单一文字轴 + 右侧 sticky TOC（≤1020px 收起）+ 面包屑 + 页脚上方一个 `AdSlot`；正文 `Prose` 样式表：h2 前留 40px、行高 1.75、链接下划线、表格可横滚）

- [ ] **Step 3: 写 `[lang]/how-it-works.astro`**（用数据渲染；含 HowTo JSON-LD，步骤与工具页一致：拖入 → 本地索引 → 提问溯源）

- [ ] **Step 4: 写 `[lang]/models.astro`**（模型表 + 体积/硬件/许可 + 隐私声明；无广告位）

- [ ] **Step 5: 写 `[lang]/security.astro`**（数据流七段式说明 + 四道防线 + 自行抓包验证步骤 + 删除方法；无广告位）

- [ ] **Step 6: 写 `privacy.astro` / `terms.astro` / `accessibility.astro`**（英文不低于 900 词、中文不低于 1400 字，逐条写明本地处理、不上传、不训练、运营方无法访问、第三方仅模型权重、Cookie 与广告说明、数据删除方式）

- [ ] **Step 7: 写 `about.astro` / `contact.astro` / `changelog.astro`**（contact 用 mailto 与表单说明，明确"无后端，表单发送邮件"；changelog 手写 v0.1 记录）

- [ ] **Step 8: 验证**

Run: `npm run build && node scripts/check-seo.mjs`
Expected: 18 个新页面均有唯一 title/description、canonical 与 hreflang。

- [ ] **Step 9: Commit** `feat: content layout + 9 static content pages (en+zh)`

---

## Task 8：免费小工具（tools hub + 3 个纯客户端工具）

**Files:**
- Create: `src/pages/[lang]/tools/index.astro`, `tools/pdf-text-extractor.astro`, `tools/token-counter.astro`, `tools/chunk-preview.astro`
- Create: `src/lib/rag/extract-text.ts`（被工具页与主引擎共用：PDF/TXT 文本抽取）
- Test: `src/lib/rag/__tests__/extract-text.test.ts`

**Interfaces:**
- Produces: `extractPdfText(buf: ArrayBuffer): Promise<{page:number;text:string}[]>`、`extractPlainText(text: string): string`、`estimateTokens(s: string): number`（含中文按字、英文按 ~4 字符/词的估算规则）、`previewChunks(text:string, size:number, overlap:number)`。

- [ ] **Step 1: 写失败测试**（`estimateTokens('你好世界') === 4`、`previewChunks` 在 700/0.15 下块数符合 `ceil((len-overlap)/(size-overlap))`）

- [ ] **Step 2: 跑测试确认失败** Run: `npx astro build` 前用 `node --test` 或 vitest（若引入 vitest，记入 devDependencies）

- [ ] **Step 3: 实现 `extract-text.ts`**（pdfjs-dist 动态 import，`workerSrc` 指向本站 `/ort/pdf.worker.min.mjs`）

- [ ] **Step 4: 写三个工具页**（每页：价值主张 + 工具本体（Preact 岛，`client:visible`）+ 使用说明 + 1 个 AdSlot；PDF 抽取工具是"文档不进服务器"的最强体感演示）

- [ ] **Step 5: 跑测试 + 构建** Expected: PASS，`dist/{en,zh}/tools/*/index.html` 生成

- [ ] **Step 6: Commit** `feat: free client-side tools (pdf text, token counter, chunk preview)`

---

## Task 9：对比页群（hub + NotebookLM / ChatPDF / ChatGPT 上传）

**Files:** `src/pages/[lang]/compare/index.astro`、`compare/{notebooklm,chatpdf,chatgpt-file-upload}.astro`、`src/data/compare.ts`

- [ ] **Step 1** 写 `src/data/compare.ts`：每篇含竞品事实表（定位/是否上传/账号/离线/引用颗粒度/价格模型/我们的优势与劣势），**只写可核实的公开事实**，不确定的写"以对方官网为准"。
- [ ] **Step 2** 写 hub 页（`ItemList` JSON-LD + 3 张对比卡 + 选择指引）
- [ ] **Step 3** 写 3 篇对比页（统一 `CompareTable` 组件 + "我们输在哪"诚实段落 + 2 个 AdSlot + 内链到 `/app/` 与相关指南）
- [ ] **Step 4** 构建 + 校验标题唯一性 → Commit `feat: comparison cluster`

---

## Task 10：场景页群（hub + 法务 / 科研 / 学生 / 人事财务）

**Files:** `src/pages/[lang]/use-cases/index.astro` + 4 页 + `src/data/use-cases.ts`

- [ ] **Step 1** 数据：每页含"痛点 3 条 / 用 SecureRAG 的具体做法 4 步 / 可验证的收益（如'合同第 8.2 条 3 秒定位'）/ 限制与不适合的场景"
- [ ] **Step 2** 4 页渲染（每页 1 AdSlot + 内链到指南与工具页）
- [ ] **Step 3** 构建 → Commit `feat: use-case cluster`

---

## Task 11：指南内容集合（5 篇 × 2 语言）

**Files:** `src/content.config.ts`（guides/blog collections schema）、`src/content/guides/{en,zh}/{private-document-qa,offline-rag-setup,improve-retrieval-quality,ocr-scanned-pdf,browser-hardware-requirements}.mdx`、`src/pages/[lang]/guides/index.astro`

**Interfaces:**
- Produces: collection `guides` 的 frontmatter：`title, description, lang, slug, date, updated, minutes, faq?: {q,a}[]`

- [ ] **Step 1** 写 `src/content.config.ts`（zod schema：`lang: z.enum(['en','zh'])`、`slug`、`date`、`faq`、`related: string[]`）
- [ ] **Step 2** 写 `guides/index.astro`（按语言过滤 + 卡片列表 + 1 AdSlot）
- [ ] **Step 3** 写 5 篇英文 MDX（每篇 ≥1000 词，首段 40–60 词直给结论便于 AI 摘录，含 1 张表、1 个 HowTo/FAQ 块）
- [ ] **Step 4** 写 5 篇中文 MDX（独立撰写，≥1500 字，不做英文直译）
- [ ] **Step 5** 写 `[...slug].astro` 详情页（`Article` + `HowTo` + `FAQPage` JSON-LD、TOC、2 个 AdSlot、上下篇导航）
- [ ] **Step 6** `npm run build && node scripts/check-i18n.mjs` Expected: guides 中英 slug 完全配对 → Commit `feat: guides collection (10 articles)`

---

## Task 12：术语表 + 博客（hub + 6 篇 × 2 语言）

**Files:** `src/pages/[lang]/glossary.astro`、`src/pages/[lang]/blog/index.astro`、`[...slug].astro`、`src/content/blog/{en,zh}/*.mdx`（6 篇）

- [ ] **Step 1** 术语表：20+ 条术语（RAG、embedding、chunking、BM25、RRF、MMR、量化、WebGPU、向量索引、幻觉、上下文窗口…），每条 = 一句话定义 + 展开 + 易混淆点；输出 `DefinedTermSet` JSON-LD
- [ ] **Step 2** 博客 6 篇选题：① 为什么你的文档不该上传（含抓包方法）② 本地嵌入模型怎么选：25MB vs 120MB 的真实差异 ③ 向量检索到底在算什么（给非数学背景的人）④ 分块策略如何决定回答质量 ⑤ 浏览器里跑 LLM 的硬限制（含 RX580 实测）⑥ 企业文档合规红线与本地化选项
- [ ] **Step 3** 每篇英文 ≥1200 词 / 中文 ≥1800 字，2 个 AdSlot，内链 ≥4 条
- [ ] **Step 4** 构建 + 校验 → Commit `feat: glossary + blog (12 articles)`

---

## Task 13：站点地图 / robots / ads.txt / llms.txt / SEO 校验脚本

**Files:** `public/robots.txt`、`public/ads.txt`、`public/CNAME`、`public/llms.txt`、`public/llms-full.txt`、`scripts/check-seo.mjs`

- [ ] **Step 1** `robots.txt`：

```
User-agent: *
Allow: /
Disallow: /en/404/
Sitemap: https://lilink.net/sitemap-index.xml
```

- [ ] **Step 2** `ads.txt`：`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`（替换为真实 ID）
- [ ] **Step 3** `CNAME`：`lilink.net`
- [ ] **Step 4** `llms.txt`（站点导读 + 允许引用声明）/ `llms-full.txt`（核心页面纯文本摘要，构建脚本生成）
- [ ] **Step 5** 写 `scripts/check-seo.mjs`：遍历 `dist/**/index.html`，断言 ① 每页有且仅有一个 `<title>` 且 ≤60 字符 ② description 120–158 字符 ③ 有 canonical ④ 有 en/zh-Hans 两条 hreflang ⑤ JSON-LD 可被 `JSON.parse` ⑥ 无重复 title ⑦ 无未替换的 `XXXXXXXXXXXXXXXX`
- [ ] **Step 6** Run: `npm run build && node scripts/check-seo.mjs` → Expected: 全部 PASS → Commit `feat: sitemap, robots, ads.txt, llms.txt, seo gate`

---

## Task 14：AdSense 集成与同意门

**Files:** `src/components/marketing/AdSlot.astro`（改造）、`src/components/layout/ConsentBanner.astro`、`src/lib/ads.ts`

- [ ] **Step 1** `ConsentBanner`：底栏，两个按钮"接受/仅必要"，写入 `localStorage.securerag.consent`；仅"接受"后才注入 `adsbygoogle.js`（`<script async>` 动态插入）
- [ ] **Step 2** `AdSlot` 改造：同意前渲染占位框（标注"广告位 · 需同意后加载"），同意后渲染 `<ins class="adsbygoogle">` 并 `push({})`；每页最多 3 个的计数在构建期由 `astro:env` 或简单常量控制
- [ ] **Step 3** 验证：未同意时 Network 面板零请求（含零第三方域名）；同意后仅出现 `pagead2.googlesyndication.com` 与 `googletagservices.com`
- [ ] **Step 4** Commit `feat: adsense with consent gate`

---

## Task 15：RAG 引擎 A —— 解析与规范化（TDD）

**Files:** `src/lib/rag/{types.ts,errors.ts,limits.ts,ingest/detect.ts,ingest/pdf.ts,ingest/docx.ts,ingest/text.ts,ingest/normalize.ts}`、`src/lib/rag/__tests__/*.test.ts`

**Interfaces:**
- Produces: `type RawDoc = { id:string; name:string; mime:string; size:number; pages:{page:number;text:string}[] }`；`detectKind(buf:ArrayBuffer, name:string): 'pdf'|'docx'|'text'|'md'|'csv'|'html'|'unsupported'`；`parseDoc(file: File): Promise<RawDoc>`；`normalize(raw: RawDoc): RawDoc`；`LIMITS = { maxFileBytes: 25*1024*1024, maxFiles: 40, maxTotalBytes: 200*1024*1024, maxChunks: 20000 }`；`RagError` 带 `code` 与双语 message key。

- [ ] **Step 1** 写失败测试：魔数嗅探（`%PDF-` → pdf、`PK\x03\x04` → docx、`.md` → md）、超限拦截（26MB 抛 `FILE_TOO_LARGE`）、加密 PDF 抛 `PDF_ENCRYPTED`、无文字层抛 `PDF_NO_TEXT_LAYER`、规范化去重复页眉页脚与合并硬换行
- [ ] **Step 2** 跑测试确认失败
- [ ] **Step 3** 实现 `detect.ts`、`limits.ts`、`errors.ts`
- [ ] **Step 4** 实现 `text.ts`、`normalize.ts`（DOM 用 `DOMParser`；HTML 保留 h1–h6 层级；Markdown 保留 `#` 结构）
- [ ] **Step 5** 实现 `pdf.ts`（pdfjs-dist 动态 import，逐页取 `textContent`，保留 `page`；文本层为空 → `PDF_NO_TEXT_LAYER`）
- [ ] **Step 6** 实现 `docx.ts`（jszip 解 `word/document.xml`，按 `w:pStyle`/`outlineLvl` 还原标题层级；`.doc` → `UNSUPPORTED_FORMAT`）
- [ ] **Step 7** 跑测试 Expected: PASS → Commit `feat(rag): ingest pipeline with magic-byte sniffing and limits`

---

## Task 16：RAG 引擎 B —— 分块、嵌入、索引、混合检索（TDD）

**Files:** `src/lib/rag/{chunk.ts,embed.ts,index.ts,bm25.ts,retrieve.ts}`、测试同目录

**Interfaces:**
- Produces: `chunkDoc(raw:RawDoc, opt?:{size=700,overlap=.15}): Chunk[]`（`Chunk = {docId,chunkId,text,page?,headingPath:string[]}`）；`createEmbedder(opt:{model:string;onProgress?:(p:{loaded:number;total:number})=>void}): Promise<(texts:string[],batch?:number)=>Promise<Float32Array[]>>`（mean pooling + L2 归一化）；`buildIndex(chunks,vectors): VectorIndex`（`search(q:Float32Array,k:number)`）；`bm25Search(chunks,q:string,k:number)`；`hybridRetrieve({index,chunks,qVec,qText,k=6,mmrLambda=.7})`（RRF k=60）。

- [ ] **Step 1** 写失败测试：① 分块不切断句子（构造单段超长文本，断言每块末尾为 `。`/`.`）② 标题路径正确 ③ 归一化向量长度为 1 ④ RRF 排序：当 BM25 唯一命中编号"§8.2"时该块必须进前 2 ⑤ MMR 不返回两条相似度 >0.95 的重复块
- [ ] **Step 2** 跑测试确认失败
- [ ] **Step 3** 实现 `chunk.ts`（标题 → 段落 → 句子三级切分，表格/代码块整块保留）
- [ ] **Step 4** 实现 `bm25.ts`（中文 bigram + 英文词，k1=1.2 b=0.75）
- [ ] **Step 5** 实现 `index.ts`（Float32Array 平铺 + 归一化点积；>5000 块时 k-means 粗聚类）
- [ ] **Step 6** 实现 `embed.ts`（`@huggingface/transformers` pipeline，`quantized:true`，`device:'webgpu'` 失败回落 `'wasm'`，batch 16，逐批回调进度）
- [ ] **Step 7** 实现 `retrieve.ts`（RRF + MMR + 阈值过滤）
- [ ] **Step 8** 跑测试 Expected: PASS → Commit `feat(rag): chunking, local embeddings, hybrid retrieval`

---

## Task 17：RAG 引擎 C —— 回答、引用、存储、错误矩阵（TDD）

**Files:** `src/lib/rag/{store.ts,answer/prompt.ts,answer/extractive.ts,answer/generative.ts,answer/cite.ts}`、测试同目录

**Interfaces:**
- Produces: `storeDocs/loadDocs/storeSession`（idb-keyval，含 schema 版本与迁移）；`buildPrompt({q,chunks,mode:'strict'|'balanced',history})`；`extractiveAnswer(chunks,q): {text:string;citations:CitationRef[]}`；`generateAnswer({chunks,q,mode,onToken})`（WebLLM 优先，`@huggingface/transformers` 文本生成回退）；`resolveCitation(i,chunks): {docName,page?,headingPath,quote}`。

- [ ] **Step 1** 写失败测试：① `strict` 模式下传入空 chunks → 返回 `NOT_FOUND` 文案且 citations 为空 ② `balanced` 模式推断句必须带 `inferred` 标记 ③ 任何返回句都含 `[n]` 或明确标注 ④ citations 索引与 chunks 顺序一致 ⑤ store 往返（写入 3 文档 5 块后读回一致）
- [ ] **Step 2** 跑测试确认失败
- [ ] **Step 3** 实现 `answer/prompt.ts`（含"只依据提供的片段作答；无依据时说未找到"的强约束与引用编号规则）
- [ ] **Step 4** 实现 `answer/extractive.ts`（句级打分：关键词覆盖率 × 句向量相似度，拼装后强制编号）
- [ ] **Step 5** 实现 `answer/cite.ts` 与 `store.ts`
- [ ] **Step 6** 实现 `answer/generative.ts`（动态 import，WebGPU 探测 → WebLLM；否则 Transformers.js 生成；流式 `onToken`）
- [ ] **Step 7** 跑测试 Expected: PASS → Commit `feat(rag): answering, citations, persistence`

---

## Task 18：工具页 UI（Preact 交互岛）

**Files:** `src/components/app/*.tsx`、`src/workers/{ingest,search,llm}.worker.ts`、`src/pages/[lang]/app.astro`、`src/styles/app.css`

**Interfaces:**
- Consumes: Task 15–17 引擎；Worker 协议 `{type:'ingest'|'search'|'generate', payload}` → `{type:'progress'|'done'|'error', …}`。

- [ ] **Step 1** 写 Worker 三件套（`ingest.worker.ts` 串联解析→分块→嵌入并上报 `{stage,done,total}`；`search.worker.ts` 做混合检索；`llm.worker.ts` 跑生成档）
- [ ] **Step 2** 写 `DropZone.tsx`（拖拽 + 点击、格式与限额提示常显、超限/不支持当场报错并指出是哪个文件）
- [ ] **Step 3** 写 `DocList.tsx`（列表、分组、重命名、停用、删除、重新索引、状态徽标与失败重试）
- [ ] **Step 4** 写 `ModelLoader.tsx`（模型选择 + 体积标注 + `loaded/total` 字节级进度 + "未下载任何超过 30MB 的模型"确认弹窗）
- [ ] **Step 5** 写 `ChatPanel.tsx` + `Message.tsx` + `CitationCard.tsx`（提问、追问、流式输出、`[n]` 可点、来源卡可展开原文并高亮、PDF 显示页码）
- [ ] **Step 6** 写 `SettingsPanel.tsx`（严格度两档、上下文轮数、目标文档范围）与 `ExportDialog.tsx`（md/json/txt，含模型名与严格度）
- [ ] **Step 7** 写 `NetworkShield.tsx`（`PerformanceObserver` 实时列出外发请求域名/字节/用途，模型请求标注"模型下载"）
- [ ] **Step 8** 写 `ErrorBanner.tsx`（把 `RagError.code` 映射到双语提示 + 降级建议，含 OOM / 下载失败换源 / 无结果 / 扫描件）
- [ ] **Step 9** 写 `app.astro` + `App.tsx`（`client:only="preact"`，零 SSR；页面顶部隐私承诺 + 能力说明 + 使用步骤 + 底部 1 个 AdSlot 与"模型说明"内链）
- [ ] **Step 10** 端到端手测：拖入 3 份文档（PDF+DOCX+MD）→ 建索引 → 提问 → 引用定位 → 追问 → 导出；DevTools Network 全程只有一次模型请求
- [ ] **Step 11** Commit `feat(app): local RAG workspace UI`

---

## Task 19：PWA / 离线 / 性能与无障碍收尾

**Files:** `src/pages/[lang]/app.astro`、`astro.config.mjs`、`public/`、`src/layouts/BaseLayout.astro`

- [ ] **Step 1** 接入 `@vite-pwa/astro`（预缓存应用外壳与 `/ort/*`，模型权重交给浏览器 Cache API；`navigateFallback` 排除 `/ort/`）
- [ ] **Step 2** 模型缓存 UX：首次下载进度 + "已缓存，可离线"状态徽标；`navigator.storage.persist()` 申请持久化
- [ ] **Step 3** 性能：`/app` 岛全部动态 import；非首屏组件 `client:visible`；图片 `loading="lazy" decoding="async"` 且带宽高
- [ ] **Step 4** 无障碍巡检：键盘走通全部流程、`aria-live` 播报索引/生成进度、对比度抽查、`prefers-reduced-motion` 下无动画
- [ ] **Step 5** 断网验证（DevTools Offline）：模型已缓存 → 问答仍可用
- [ ] **Step 6** Commit `feat: pwa, offline, perf and a11y pass`

---

## Task 20：部署与上线检查

**Files:** `.github/workflows/deploy.yml`、`README.md`

- [ ] **Step 1** 写 Actions 工作流（`withastro/action@v3`，push 到 main 触发，Pages 权限 `pages: write`、`id-token: write`）
- [ ] **Step 2** 写 `README.md`（项目说明、隐私承诺、构建与部署步骤、如何自行验证零上传）
- [ ] **Step 3** 本地全量验证：`npm run build && node scripts/check-i18n.mjs && node scripts/check-seo.mjs`
- [ ] **Step 4** 部署后线上验证：① `https://<domain>/robots.txt` 与 `sitemap-index.xml` 可访问 ② 中英两版页面均可打开且切换保持路径 ③ `/en/` 与 `/zh/` 的 `<link rel="alternate">` 互指正确 ④ Rich Results Test 对 FAQ/HowTo/Article 无错 ⑤ DevTools 抓包确认零上传
- [ ] **Step 5** 提交搜索引擎：Google Search Console（提交 sitemap-index.xml）、Bing Webmaster、百度站长；AdSense 送审
- [ ] **Step 6** Commit + push `chore: deploy pipeline and launch checklist`

---

## Self-Review 记录

- **Spec 覆盖**：约束 C1 静态产物 → Task 1/20；C2 无后端 → Task 18/19；C3 零上传 → Task 15–18 + 13（CSP/盾牌）；C4 AdSense → Task 13/14；C5 双语可爬 → Task 3/5/6/11/12；C6 页面数 → Task 6–12 合计 42 模板。隐私政策/条款/无障碍、模型披露、错误矩阵、导出、严格度、多文档管理、离线、性能、a11y 均有对应任务。
- **占位符扫描**：无 TBD；内容型任务均给出精确 frontmatter schema、篇数、字数下限与选题，保证可执行且不空转。
- **类型一致性**：`Lang` 是唯一语言类型（来自 `src/i18n/ui.ts`）；引擎接口 `RawDoc/Chunk/CitationRef/RagError` 在 Task 15 定义，Task 16–18 只消费不重定义；`LIMITS` 单点定义。
