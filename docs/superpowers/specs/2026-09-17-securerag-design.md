# SecureRAG 网站设计规格（Spec）

- 日期：2026-09-17
- 项目根目录：`D:\【建立网站】\SecureRAG`
- 品牌名：**SecureRAG**
- 占位域名：`https://lilink.net`（部署时改 `astro.config.mjs` 的 `site` 与 `public/CNAME`，全站 canonical / sitemap / JSON-LD 自动跟随，无需改模板）
- 定位：**100% 浏览器本地的多文档 RAG 问答工具**，零上传、零注册、可离线

---

## 1. 目标、硬约束与成功标准

### 1.1 硬约束（不可打破）

| # | 约束 | 落地方式 |
|---|------|---------|
| C1 | 只能是纯静态产物 | Astro `output: 'static'`，无 SSR adapter，构建产物 = 纯 HTML/CSS/JS/静态资源 |
| C2 | 无自建后端、无数据库 | 全部状态存 IndexedDB / Cache Storage / localStorage |
| C3 | 用户文档与提问永不出设备 | 不接入任何第三方推理 API；唯一外发请求是模型权重下载（不含任何用户内容），且给出可自托管方案 |
| C4 | 可被 AdSense 审核通过 | 真实可演示功能 + 原创内容 + 明确价值主张；广告位显式标注、不遮挡核心功能与隐私提示；每页 ≤3 个广告位；无自动刷新、无悬浮遮罩 |
| C5 | 全部页面中英双语且各自可被爬取 | 独立路径 `/en/**` 与 `/zh/**` + hreflang + 全量 sitemap |
| C6 | 页面数 ≥ 20 | 实际规划 40 个页面模板 × 2 语言 ≈ 80+ URL |

### 1.2 成功标准（验收口径）

- `npm run build` 产出纯静态目录，可直接丢到 GitHub Pages 子路径或自定义域名下运行。
- Lighthouse（移动端，本地构建产物）：Performance ≥ 90（营销页）、Accessibility ≥ 95、Best Practices ≥ 95、SEO = 100。
- 工具页在 Chrome / Edge 桌面端完成一次完整闭环：拖入 3 份 PDF/DOCX/MD → 建索引 → 提问 → 得到带 `[1][2]` 引用的回答 → 点击引用定位原文段落 → 导出问答记录。
- 抓包（DevTools Network）验证：完成一次问答全过程，**除模型权重下载外，零请求外发**；文档内容、提问、向量在任何请求载荷中都不出现。
- 断网后（模型已缓存）工具仍可完成问答。
- Rich Results Test 通过：Article / FAQPage / BreadcrumbList / SoftwareApplication / HowTo 无错误。
- 语言切换：`/zh/guides/offline-rag-setup/` 切到英文后落到 `/en/guides/offline-rag-setup/`（路径映射，不回落首页）；搜索引擎进入哪个语言路径，整站默认该语言。

### 1.3 明确不做（YAGNI）

- 不做账号系统、云同步、共享链接、协作、付费墙、订阅。
- 不接入任何 BYOK 云端 API（会破坏"文件永不离开设备"的绝对承诺，宁可牺牲回答流畅度）。
- 不做移动端"完全不可用"式的硬拦截——降级为轻量档 + 文档数量提示。
- 不做多主题切换（先做好一套），不做 i18n 之外的第三语言。

---

## 2. 技术栈决策

| 层 | 决策 | 理由 / 备选 |
|----|------|------------|
| 框架 | **Astro 5**（`output: 'static'`，默认零 JS） | 40 个页面 × 2 语言靠组件复用；营销页默认不输出 JS，SEO/性能最优。备选 Vite 多页（重复 header/footer 维护成本高）、Next.js 静态导出（bundle 重） |
| 样式 | **Tailwind CSS v4**（`@tailwindcss/vite`）+ 一层自建 CSS 变量 token | v4 用 CSS-first 配置，构建快；token 层保证换风格时只改一处 |
| 交互岛 | **Preact**（仅工具页，`client:only`） | 3KB，工具页状态多（文档列表/会话/设置/进度），纯 DOM 手写会失控；营销页不引入任何框架 |
| 内容 | Astro Content Collections + MDX | 博客/指南/术语表用 Markdown 写，schema 校验 frontmatter，自动生成列表页 |
| 双语 | Astro 内建 i18n 路由 + `src/i18n/ui.ts` 文案字典 | 比第三方 i18n 插件更贴合静态路由生成 |
| 站点地图 | `@astrojs/sitemap`（开启 i18n 选项） | 自动输出 hreflang 交叉引用 |
| PWA/离线 | `@vite-pwa/astro`（Workbox 预缓存外壳） | "可离线使用"的必要条件；只缓存应用资源，不碰用户数据 |
| 嵌入模型 | **Transformers.js v3**（`@huggingface/transformers`）+ ONNX Runtime Web WASM(SIMD) | 见 §6.3 |
| 生成模型（可选档） | **WebLLM**（WebGPU 可用时）／ Transformers.js + ONNX 小模型（回退） | 见 §6.4 |
| PDF 解析 | `pdfjs-dist`（放在 Worker 里） | 保留每页文本与页码，用于引用定位 |
| DOCX 解析 | `mammoth` + `jszip`（解析 `word/document.xml` 保留标题层级） | .doc（旧二进制格式）明确提示不支持并给出转换建议 |
| 其余格式 | TXT / MD / CSV / HTML / JSON / RTF 自写解析器 | 体积可控 |
| 本地存储 | `idb-keyval`（IndexedDB）+ Cache Storage（模型权重） | 轻量 |
| 动效 | 纯 CSS 动画 + `IntersectionObserver` 滚动揭示 | 不引入 GSAP/Framer；尊重 `prefers-reduced-motion` |
| 字体 | UI 走系统字体栈，拉丁字形自托管 Inter 子集（woff2，`font-display: swap`） | 不请求 Google Fonts：隐私（无第三方请求）+ 速度 + 无 CORS |
| 部署 | GitHub Actions → GitHub Pages（`withastro/action`） | 自定义域名走 `public/CNAME` |

**构建环境注意**：项目路径含中文（`D:\【建立网站】\SecureRAG`），首次 `npm create astro` / `npm install` 后立即跑一次 `npm run build` 做冒烟验证；若 Vite 在非 ASCII 路径上报错，退路是在 `E:\hermes-workspace\securerag\` 建纯 ASCII 工作目录，最后同步产物到目标目录。Node 已确认 v22.23.2 / npm 12.0.2。npm 走国内镜像（`npmmirror.com`）避免超时。

---

## 3. 目录结构

```
SecureRAG/
├─ astro.config.mjs            # site、i18n、sitemap、vite 插件、构建输出
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts          # v4 下仅保留内容/插件补充
├─ public/
│  ├─ robots.txt               # 含 sitemap 地址、允许全站抓取
│  ├─ ads.txt                  # AdSense 授权记录
│  ├─ CNAME                    # 自定义域名（部署时填）
│  ├─ llms.txt                 # GEO：给 AI 引擎的站点导读
│  ├─ llms-full.txt            # GEO：全站核心内容纯文本版
│  ├─ _headers                 # 安全响应头（Cloudflare 用；GitHub Pages 忽略）
│  ├─ favicon.svg / og/        # 品牌与 OG 图（SVG 优先，OG 用 1200×630 PNG/WebP）
│  ├─ ort/                     # 自托管 onnxruntime-web wasm（不走 CDN）
│  └─ samples/                 # 演示用示例文档（供"试用示例"按钮）
├─ src/
│  ├─ pages/
│  │  ├─ index.astro                 # 语言网关（noindex + 立即跳转）
│  │  ├─ 404.astro
│  │  └─ [lang]/                     # en | zh 全部页面
│  │     ├─ index.astro
│  │     ├─ app.astro                # ★ 核心工具页
│  │     ├─ tools/…                  # 3 个小工具
│  │     ├─ how-it-works.astro  models.astro  security.astro
│  │     ├─ privacy.astro  terms.astro  accessibility.astro
│  │     ├─ faq.astro  about.astro  contact.astro  changelog.astro
│  │     ├─ compare/…  use-cases/…  guides/…  glossary.astro
│  │     └─ blog/…                   # 索引 + 6 篇文章
│  ├─ content/                       # collections：blog / guides / usecases / compare
│  │  ├─ blog/{en,zh}/*.mdx
│  │  └─ guides/{en,zh}/*.mdx
│  ├─ components/
│  │  ├─ seo/       BaseHead.astro  JsonLd.astro  Hreflang.astro  Breadcrumbs.astro
│  │  ├─ layout/    Header.astro  Footer.astro  LangSwitch.astro  MobileNav.astro
│  │  ├─ marketing/ Hero.astro  FeatureGrid.astro  Steps.astro  CompareTable.astro
│  │  │             ModelDisclosure.astro  FaqAccordion.astro  PrivacyPromise.astro
│  │  │             AdSlot.astro  NewsletterPlaceholder.astro
│  │  └─ app/       DropZone.tsx  DocList.tsx  ChatPanel.tsx  MessageBubble.tsx
│  │                CitationCard.tsx  SettingsPanel.tsx  ModelLoader.tsx
│  │                NetworkShield.tsx  ExportDialog.tsx  ErrorBanner.tsx
│  ├─ lib/
│  │  ├─ rag/       见 §6.1
│  │  ├─ i18n/      ui.ts  utils.ts  routes.ts
│  │  └─ seo/       schema.ts  meta.ts
│  ├─ styles/       tokens.css  global.css
│  └─ assets/       （构建期处理的图片）
├─ scripts/
│  ├─ check-i18n.mjs        # 校验两语言页面/文案完备性
│  └─ ping-search-engines.mjs
├─ workers/                 # 构建为独立 chunk 的 Worker 源码（见 §6.1）
└─ .github/workflows/deploy.yml
```

---

## 4. 页面清单（40 个模板 × 2 语言）

图例：`★` = 有广告位；`Ⓟ` = 含隐私承诺模块；`Ⓢ` = 含结构化数据

| # | 路径（`{lang}` = en/zh） | 类型 | 主关键词示例 | 广告位 |
|---|--------------------------|------|--------------|--------|
| 0 | `/` | 网关（noindex） | — | 无 |
| 1 | `/{lang}/` | 首页 ⓅⓈ | 本地文档问答 / private document chat | ★ 首屏下方 1 个 |
| 2 | `/{lang}/app/` | **核心工具** ⓅⓈ | 本地 RAG 文档问答工具 | ★ 侧栏 1 个（移动端放聊天下方，距输入框 ≥150px） |
| 3 | `/{lang}/tools/` | 工具集 hub | 免费在线文本工具 | ★ |
| 4 | `/{lang}/tools/pdf-text-extractor/` | 工具 Ⓟ | PDF 提取文字（本地） | ★ |
| 5 | `/{lang}/tools/token-counter/` | 工具 Ⓟ | token 计数 / 字数统计 | ★ |
| 6 | `/{lang}/tools/chunk-preview/` | 工具 Ⓟ | 文本分块预览 | ★ |
| 7 | `/{lang}/how-it-works/` | 原理 ⓅⓈ(HowTo) | 浏览器端 RAG 原理 | ★ |
| 8 | `/{lang}/models/` | 模型披露 ⓅⓈ | 本地嵌入模型对比 / 体积 | — |
| 9 | `/{lang}/security/` | 白皮书 ⓅⓈ | 本地处理 数据流 | — |
| 10 | `/{lang}/privacy/` | 法律 Ⓟ | 隐私政策 | — |
| 11 | `/{lang}/terms/` | 法律 | 使用条款 | — |
| 12 | `/{lang}/accessibility/` | 声明 | 无障碍声明 | — |
| 13 | `/{lang}/faq/` | FAQ ⓅⓈ(FAQPage) | 本地问答常见问题 | ★ |
| 14 | `/{lang}/compare/` | 对比 hub Ⓢ | 本地 AI vs 云端 AI | ★ |
| 15 | `/{lang}/compare/notebooklm/` | 对比 Ⓢ | NotebookLM 本地替代 | ★ |
| 16 | `/{lang}/compare/chatpdf/` | 对比 Ⓢ | ChatPDF 替代 / 隐私 | ★ |
| 17 | `/{lang}/compare/chatgpt-file-upload/` | 对比 Ⓢ | ChatGPT 上传文件隐私 | ★ |
| 18 | `/{lang}/use-cases/` | 场景 hub | 文档问答应用场景 | ★ |
| 19 | `/{lang}/use-cases/legal/` | 场景 Ⓢ | 合同审查 本地 AI | ★ |
| 20 | `/{lang}/use-cases/research/` | 场景 Ⓢ | 论文文献问答 | ★ |
| 21 | `/{lang}/use-cases/students/` | 场景 Ⓢ | 教材 PDF 提问 | ★ |
| 22 | `/{lang}/use-cases/hr-finance/` | 场景 Ⓢ | 人事财务文档保密 | ★ |
| 23 | `/{lang}/guides/` | 指南 hub | 本地 RAG 使用指南 | ★ |
| 24 | `/{lang}/guides/private-document-qa/` | 指南 Ⓢ(HowTo) | 不上传的文档问答 | ★ |
| 25 | `/{lang}/guides/offline-rag-setup/` | 指南 Ⓢ | 离线 RAG 配置 | ★ |
| 26 | `/{lang}/guides/improve-retrieval-quality/` | 指南 Ⓢ | 提升检索准确率 | ★ |
| 27 | `/{lang}/guides/ocr-scanned-pdf/` | 指南 Ⓢ | 扫描件 PDF 处理 | ★ |
| 28 | `/{lang}/guides/browser-hardware-requirements/` | 指南 Ⓢ | WebGPU / 内存要求 | ★ |
| 29 | `/{lang}/glossary/` | 术语表 Ⓢ(DefinedTermSet) | RAG 术语 / embedding 是什么 | ★ |
| 30 | `/{lang}/blog/` | 博客索引 Ⓢ | 本地 AI 博客 | ★ |
| 31-36 | `/{lang}/blog/<slug>/` × 6 | 文章 Ⓢ(Article) | 见 §7.4 | ★ 2 个（正文中+末） |
| 37 | `/{lang}/about/` | 关于 Ⓢ(Organization) | — | — |
| 38 | `/{lang}/contact/` | 联系 Ⓢ(ContactPage) | — | — |
| 39 | `/{lang}/changelog/` | 更新日志 | — | — |

> 42 个模板 × 2 语言 ≈ **84 个可索引 URL**，远超"不少于 20 个页面"的要求，且每一页都有独立价值主张（不是凑数页）。

---

## 5. 双语（i18n）实现方案

### 5.1 路由

- `defaultLocale: 'en'`，`locales: ['en','zh']`，`prefixDefaultLocale: true` → 所有页面都带前缀：`/en/...`、`/zh/...`。
- `src/pages/index.astro` 是**语言网关**：`<meta name="robots" content="noindex,follow">` + 内联 JS 按以下优先级立即 `location.replace()`，JS 不可用时 `<meta http-equiv="refresh" content="0;url=/en/">` 兜底，页面同时渲染两个可点的大号语言链接：
  1. 用户显式选择（`localStorage.securerag.lang`）
  2. `navigator.languages` 命中 `zh*` → `/zh/`，否则 `/en/`
- 网关页 canonical 指向 `/en/`，并声明 `x-default` → `/`。

### 5.2 页面内语言切换

- `LangSwitch.astro` 把当前 URL 里的 `/{lang}/` 段替换为另一语言，得到**对应页面**（不是首页回退）；hash 与 query 原样保留。
- 切换 = 真实跳转（同时写 `localStorage`），保证每一语言版本的 HTML 都是服务端预渲染好的完整文档 —— 这就是"每种语言都能被爬虫抓取"。
- 语言状态在构建期确定（由路由决定），**不存在** JS 运行时替换文案导致爬虫只看到一种语言的问题。

### 5.3 文案组织

```
src/i18n/
  ui.ts      // export const ui = { en: {...}, zh: {...} }; type Lang = keyof typeof ui
  utils.ts   // getLangFromUrl(url), t(lang, key), useTranslations(lang), localizePath(lang, path)
```
- 组件禁止硬编码文案；`scripts/check-i18n.mjs` 在 CI 里校验：① `ui.en` 与 `ui.zh` 键集合完全一致；② `src/pages/[lang]/**` 下每个页面文件都存在（路由天然保证）；③ content collections 的 `en`/`zh` 文章 slug 一一配对，缺失则构建失败。

### 5.4 SEO 友好性

- 每页 `<html lang="en">` / `lang="zh-Hans"`。
- 每个页面在 `<head>` 输出：`canonical`（该语言自身）、`hreflang` 三连（`en` / `zh-Hans` / `x-default` → 语言网关或 `/en/`）、`og:locale` 与 `og:locale:alternate`。
- sitemap 每个 URL 带 `<xhtml:link rel="alternate">` 全语言互指。
- 两语言内容**各自原创**（英文不是机翻腔，中文不是英文直译），避免被判重复内容。

---

## 6. 核心功能实现路径（纯静态下的本地 RAG）

### 6.1 引擎目录（`src/lib/rag/`）

```
rag/
  pipeline.ts        编排：解析 → 规范化 → 分块 → 嵌入 → 索引，串行 + 进度事件
  ingest/
    detect.ts        魔数嗅探（%PDF / PK / 0x50 4B 03 04 …）+ 扩展名 + MIME 三重判定
    pdf.ts           pdfjs-dist：逐页取 textContent，保留 pageNumber；检测"无文本层"→ 扫描件提示
    docx.ts          jszip 解 word/document.xml，按 pStyle/outlineLvl 还原标题层级
    text.ts          txt/md/csv/json/html（HTML 用 DOMParser 去标签，保留 h1-h6 层级）
    normalize.ts     去页眉页脚重复行、合并硬换行、压缩空白、保留段落边界
  chunk.ts           结构感知分块：标题层级 → 段落 → 句子；默认 700 字符 + 15% overlap，
                     超长表格/代码块整块保留；产出 {docId, chunkId, text, page?, headingPath[]}
  embed.ts           Transformers.js feature-extraction，batch=16，mean pooling + L2 归一化；
                     WebGPU 优先，失败回落 WASM(SIMD, 多线程)
  index.ts           Float32Array 平铺存储 + 归一化点积（= 余弦）；≤5000 chunk 暴力检索
                     （5k×384 点积 < 20ms）；>5000 自动切 k-means 粗聚类（IVF-lite）
  bm25.ts            自实现 BM25（中文按 bigram + 英文按词），解决专有名词/型号检索
  retrieve.ts        混合检索：向量 top-20 ∪ BM25 top-20 → RRF 融合 → MMR 去冗余 → 阈值过滤 → top-k(默认 6)
  answer/
    prompt.ts        system prompt 模板（含严格度分支 + 引用编号规则）
    extractive.ts    轻量档：答案句选择（关键词覆盖 + 句向量相似度）→ 拼装 + 强制标注 [n]
    generative.ts    生成档：WebLLM 或 Transformers.js 流式生成，逐 token 回调
    cite.ts          [n] ↔ 来源卡片 ↔ 原文高亮；PDF 支持跳页码
  store.ts           IndexedDB：docs / chunks / vectors / sessions / settings（含 schema 版本迁移）
  limits.ts          限额：单文件 ≤ 25MB、≤ 40 份、总量 ≤ 200MB、chunk 总数 ≤ 20,000（超出提示）
  errors.ts          错误码 → 双语用户可读提示 + 降级建议
workers/
  ingest.worker.ts   解析+分块+嵌入（避免卡 UI），postMessage 上报 {stage, done, total, bytes}
  search.worker.ts   向量 + BM25 + RRF
  llm.worker.ts      生成档（Transformers.js 走 Worker；WebLLM 用其自带 WebWorker）
```

### 6.2 数据流（严格本地）

```
用户拖入文件 → File API 读为 ArrayBuffer（浏览器内存，无网络）
  → ingest.worker 解析 → 规范化 → 分块 → embed → Float32Array
  → IndexedDB 持久化（刷新不丢，可重新索引）
提问 → 问题嵌入 → 混合检索 → top-k 片段
  → 轻量档：抽取式组装答案｜生成档：本地 LLM 生成
  → 渲染回答 + [n] 引用 + 来源卡片（点开定位原文/页码）
外发请求：仅 HuggingFace/jsDelivr 的模型权重 GET（无任何用户数据），
          缓存进 Cache Storage 后离线可用；onnxruntime wasm 从本站 /ort/ 自托管。
```

### 6.3 嵌入模型（默认轻量档，用户可见体积与选型）

| 档位 | 模型 | 体积（首次下载） | 语言 | 用途 |
|------|------|-----------------|------|------|
| 默认·中文 | `Xenova/bge-small-zh-v1.5` | ≈ 25 MB | 中 | 中文文档为主 |
| 默认·英文 | `Xenova/all-MiniLM-L6-v2` | ≈ 23 MB | 英 | 英文文档为主 |
| 双语混合 | `Xenova/multilingual-e5-small` | ≈ 120 MB | 100+ | 中英混排库（用户手动切） |

- 首次检测到文档语言后**建议**档位（弹一次性提示，可一键切换或忽略），不擅自静默下载大模型。
- 模型页 `/{lang}/models/` 列出全部候选：参数量、量化方式、下载体积、维度、许可、来源链接（可核查）。

### 6.4 生成档（可选，需用户点击"启用本地生成"）

| 条件 | 引擎 | 模型 | 体积 | 预期速度 |
|------|------|------|------|---------|
| 有 WebGPU | WebLLM | `Qwen2.5-1.5B-Instruct-q4f16` | ≈ 1.0 GB | 桌面独显 15-40 tok/s |
| 无 WebGPU | Transformers.js | `onnx-community/Qwen2.5-0.5B-Instruct` (q4) | ≈ 400 MB | CPU 约 3-8 tok/s，明确提示"较慢但可用" |

- **默认永远是轻量档**：embedding + 抽取式回答，秒级可用，全程可离线。
- 生成档启用前弹出说明卡：模型名、体积、下载耗时预估、硬件要求、数据流向（"只下载权重，不含你的任何内容"），用户勾选确认后才开始下载。
- 下载进度用 `progress_callback` 上报 `loaded/total` 字节 + 百分比 + 剩余时间估计，界面显示"首次下载 25MB / 已缓存，下次秒开"。
- 硬件限制如实说明（RX580 等无 WebGPU 的显卡走 CPU 回退，速度慢；iOS Safari 内存限制导致大批量文档体验受限）。用户自己的测试环境（Chrome + RX580）就是真实约束下的验证环境。

### 6.5 严格度与会话

- 严格度两档（滑块）：
  - **仅依据文档**（默认）：检索为空或相似度低于阈值 → 直接回答"文档中没有找到相关内容"，绝不编造；
  - **允许适度推理**：允许合并多个片段做归纳，但每句结论必须挂 `[n]`，无来源的推断句显式标注「推断」。
- 会话上下文：保留最近 N 轮（默认 6 轮，可调）拼入 prompt，且问题改写（query rewriting）用最近一轮对话做关键词扩展后再检索，保证"继续追问"能命中正确片段。
- 导出：Markdown / JSON / 纯文本，含时间戳、模型名、深度档位、每条回答的来源引用（可复现）。

### 6.6 多文档管理

列表视图 + 分组（按导入批次/自定义标签）、重命名、删除（级联删向量）、重新索引（换模型后必须）、单文档启停（"只在这 3 份里提问"）、文档状态徽标（解析中/已索引/失败+原因）、失败重试。

### 6.7 隐私的四道防线（可验证，而非口头承诺）

1. **代码层**：全站 CSP `<meta http-equiv="Content-Security-Policy">` 限定 `connect-src` 白名单（仅模型源 + 自身）；代码里不存在任何指向第三方推理接口的调用。
2. **可验证层**：`NetworkShield`（网络盾牌）面板用 `PerformanceObserver` 实时列出本页面所有外发请求的域名、字节数、用途，并标注「模型下载」；用户可亲眼确认没有文档上传。
3. **展示层**：首页 / 工具页 / 上传区反复出现隐私承诺标识（"文件永不离开你的设备"），危险操作（启用生成档下载模型）前二次确认。
4. **法律层**：隐私政策与使用条款用通俗语言明确写清：本地处理、不上传、不训练、运营方无法访问、第三方请求仅限模型权重、以及用户如何自行验证（附验证步骤与抓包截图）。

### 6.8 错误与降级矩阵

| 场景 | 提示 | 降级方案 |
|------|------|---------|
| 不支持的格式 | 明确列出支持格式 | 引导用 `/{lang}/tools/pdf-text-extractor/` 先转文本 |
| 扫描件 PDF 无文本层 | "未检测到文字层" | 建议先 OCR，链到 OCR 指南 |
| 模型下载失败 | 显示失败域名与错误码 | 一键换源（HF / jsDelivr）+ 重试；离线环境提示导入本地模型包 |
| 内存不足（OOM） | 显示当前文档/块数 | 建议删除部分文档、切轻量档、关闭其他标签页、限制上限 |
| 检索无结果 | "未找到相关内容" | 建议换关键词 / 放宽严格度 / 确认文档已索引 |
| WebGPU 不可用 | 说明当前走 CPU | 仅影响生成档速度；轻量档不受影响 |
| 文件超限 | 具体到哪一个文件超了多少 | 建议拆分或压缩 |
| 索引损坏/版本迁移 | 提示重新索引 | 一键重建（不影响原文件，文件本就在用户本地） |

---

## 7. SEO 与 GEO 策略

### 7.1 技术 SEO 清单

- `robots.txt`：允许全站，指向 sitemap，屏蔽无价值参数路径。
- `sitemap-index.xml` + 分语言 sitemap（含 hreflang 交叉引用），构建时自动生成。
- 每页唯一 `title`（≤60 字符）/ `description`（120-158 字符），模板 + 内容双层控制。
- Open Graph + Twitter Card（`summary_large_image`），每页独立 OG 图（构建期用 SVG 模板生成，含标题与品牌）。
- canonical 自指，无参数化重复页。
- 结构化数据（JSON-LD，全部由 `schema.ts` 统一生成）：
  - 全站：`Organization`（含 `sameAs`）、`WebSite` + `SearchAction`
  - 首页/工具页：`SoftwareApplication`（`applicationCategory: BusinessApplication`、`offers: price 0`、`featureList`）
  - 指南页：`HowTo`（步骤与工具页步骤一致）
  - FAQ 页：`FAQPage`
  - 博客/指南：`Article` + `author`（Person）+ `datePublished/dateModified`
  - 全部内容页：`BreadcrumbList`
  - 术语表：`DefinedTermSet` + `DefinedTerm`
- 内链：每篇内容页至少 4 条上下文化内链（指南 → 工具页 → 对比页 → 术语表），hub 页集中分发，杜绝孤岛页。
- 图片：SVG 优先，位图用 WebP + `width/height` + `loading="lazy"` + `decoding="async"`，避免 CLS。

### 7.2 GEO（生成式引擎优化）

- **可摘录答案**：每个指南/FAQ 首段 40-60 字直给结论（含定义句 "SecureRAG 是一个……"），便于 AI 引擎整段引用。
- **事实表与对比表**：AI 引擎偏好表格；模型参数/体积、与竞品对比均用表格承载确定数字。
- **`llms.txt` / `llms-full.txt`**：站点导读 + 核心内容纯文本，声明"可自由引用，请注明来源"。
- **实体一致性**：品牌名、一句话定义、URL、作者信息在全站与 JSON-LD 中逐字一致（AI 引擎靠一致性建立实体）。
- **术语表**：把 embedding / 向量检索 / 分块 / RRF / 幻觉 等概念写成可独立引用的定义，是 GEO 的高价值页面类型。
- **中文生态（geo-cn）**：针对豆包/文心/DeepSeek 等中文 AI 的引用习惯，中文版内容强调"定义句 + 分点 + 数字"，并准备后续站外分发（知乎/公众号）内容草稿；`/zh/` 页面独立原创，不做英文页的逐句翻译。

### 7.3 内容质量红线（AdSense 相关）

- 不使用"最好的/第一/绝对安全"等无依据的广告化表述；隐私承诺只写可以用技术验证的事实。
- 广告位：全部由 `AdSlot.astro` 组件渲染，显式带「广告 / Advertisement」标签、固定预留高度（防 CLS）、不在折叠线上方遮挡主 CTA、不在聊天面板内部、不在隐私政策页。
- 全站 `ads.txt`、清晰的隐私政策（含 Cookie 与广告说明）、可点击的联系方式与关于页——AdSense 审核的硬性项。

---

## 8. UI / 设计系统方案

- **风格基调**（待 5 个首页方案选定后固化）：专业、干净、可信赖；科技工具感而非营销页堆砌感。
- Token 层：颜色 / 间距（8px 基准）/ 圆角 / 阴影 / 字级全部走 CSS 变量，模板只引用变量 → 换风格只改 `tokens.css`。
- **文字轴纪律**（用户明确要求）：全页共用单一文字轴（统一容器宽 + 统一左右 padding），标题不单独居中，卡片内文案与区块标题左对齐。
- 动效：入场 `IntersectionObserver` 淡入上移（80-200ms 交错）、按钮/hover 过渡、进度条动画、流式打字效果；全部走 CSS，`prefers-reduced-motion` 下关闭。
- 响应式断点：`<480 / 480-768 / 768-1024 / 1024-1280 / >1280`，工具页在 <1024 时改为单列（文档列表折叠为抽屉）。
- 无障碍：语义化标签、跳转链接（Skip to content）、可见 focus ring、`aria-live` 播报索引与生成进度、图标按钮 `aria-label`、对比度 ≥ 4.5:1、键盘可达全部交互。

---

## 9. 里程碑与工作安排

| 阶段 | 内容 | 产出 | 验收 |
|------|------|------|------|
| P0 · 设计定稿 | 5 个首页风格方案 → 用户选定 → 固化 tokens | `design/mockups/*.html` + 选定风格 | 用户确认 |
| P1 · 脚手架 | Astro+Tailwind 初始化、tokens、BaseHead/SEO 组件、Header/Footer、i18n 骨架、语言网关、CI 部署冒烟 | 可构建可部署的空白站点（含 `/`、`/en/`、`/zh/`、404） | `npm run build` 通过；线上可访问 |
| P2 · 营销页 | 首页、how-it-works、models、security、privacy、terms、accessibility、about、contact、changelog | 20 个 URL | Lighthouse ≥ 90；双语切换正确 |
| P3 · 内容页群 | tools hub + 3 工具、compare hub + 3 对比、use-cases hub + 4 场景、guides hub + 5 指南、glossary、blog hub + 6 文章 | 60+ URL | 全部含 JSON-LD 与内链；`check-i18n` 通过 |
| P4 · RAG 引擎 | detect/parse/normalize → chunk → embed → index → retrieve（向量+BM25+RRF） → 轻量档抽取式回答 + 引用 | 引擎可独立单测 | 单测覆盖分块边界、归一化、RRF 排序、限额与错误码 |
| P5 · 工具页 UI | 拖拽上传、进度、文档管理、聊天、引用定位、严格度、会话、导出、网络盾牌、错误提示 | 完整可用的 `/app/` | §1.2 的端到端验收全绿 |
| P6 · 生成档 + 离线 | WebLLM/Transformers.js 生成、流式输出、PWA 预缓存、模型缓存提示、离线可用 | 双档位切换 | 断网问答通过；下载进度准确 |
| P7 · SEO/GEO 收尾 | sitemap、robots、llms.txt、JSON-LD 校验、hreflang 校验、OG 图、性能与无障碍打磨、AdSense 接入与 ads.txt | 上线就绪 | Rich Results 无错；抓包证明零外发 |
| P8 · 部署与提交 | GitHub Actions → Pages、自定义域名、提交 Google Search Console + Bing + 百度站长、AdSense 送审 | 线上站点 | 索引被收录；AdSense 审核提交 |

执行方式：P2/P3 这类"多页面内容生产"用并行子代理分批产出（每批 3 个页面，产出后统一校验 i18n/SEO/文字轴）；P4-P6 引擎与工具页由主线严格 TDD（先写失败测试）。

---

## 10. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 项目路径含中文字符 | 构建工具可能报错 | P1 立即冒烟验证；不行则迁到 `E:\hermes-workspace\securerag` 纯 ASCII 路径 |
| npm 网络不稳（国内） | 依赖装不上 | 用 npmmirror 镜像；依赖锁定版本；关键依赖（transformers.js / pdfjs）本地预下 |
| 模型权重体积导致首访体验差 | 跳出率高 | 默认 25MB 轻量档 + 明确体积标注 + 进度条；生成档必须点击启用 |
| CPU 推理慢（RX580 无 WebGPU） | 生成档体验差 | 默认轻量档；如实披露速度；建议 Chrome/Edge 且优先 WebGPU |
| AdSense 拒绝（"工具页内容过薄"） | 无法变现 | 内容页占比 > 60%；工具页配套教程、FAQ、对比、指南；先上线内容再送审 |
| 隐私承诺被质疑 | 信任崩塌 | 网络盾牌 + 抓包验证步骤 + 开源可查（建议同期开源引擎代码） |
| iOS Safari 内存限制 | 移动端体验受限 | 移动端默认限制 10 份文档并提示；UI 明确告知限制 |

---

## 11. 待用户确认项

1. 5 个首页风格方案中选定 1 个（可混合：如"方案 A 的 hero + 方案 C 的卡片"）。
2. 是否同期把 RAG 引擎代码开源（对 AdSense/PR/信任都是加分项）。
3. GitHub 仓库名与账号（用于部署与最终域名绑定）。
4. 上线前是否需要我准备知乎/公众号等站外分发内容草稿（GEO 中文生态）。
