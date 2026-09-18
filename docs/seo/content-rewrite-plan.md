# 全站文案通俗化改写方案

## 诊断：现在的问题

| 问题 | 现状（真实原文） | 普通用户看到会怎样 |
|---|---|---|
| 架构词当卖点 | 「零上传架构」「可导出的审计记录」「本地向量索引」「RRF 融合」 | 不知道这对我有什么用 |
| 反复强调安全 | 首页「信任中心」整块四条全是隐私声明（不传输/不训练/唯一第三方/可删除） | 像是合规说明书，不是产品介绍 |
| 技术视角标题 | 「本地管线 vs. 上传到云端助手」 | 我要的是"能不能一次搜完我所有文件" |
| 受众太窄 | FAQ 标题「来自手握敏感文档的人的问题」 | 我没什么敏感文档，这工具跟我无关 |
| 长尾词没进正文 | 10 个长尾关键词只写进了映射表 | AI 引擎和搜索引擎都读不到问答体内容 |

**原则**：先说用户得到什么，再说它怎么做到；一段话只讲一件事；隐私只讲一次（讲成好处，不讲成合规）；技术细节留给 `/security/`、`/models/`、`/how-it-works/` 这类页面——那些页面本来就该给工程师和采购看，也是"可验证"承诺的支撑。

---

## 改写样本 1：能力区（首页）

**现在（英）** heading: *Everything a serious document workflow needs — minus the data transfer*
**现在（中）** heading:「严肃的文档工作流需要的都有，除了"把数据交出去"那一步」

**改为**
- 英：`Search every file at once — no uploading, no sign-up`
- 中：「一次搜完所有文件，不用上传、不用注册」

六张卡片（标题 → 新标题，正文保留细节但去掉架构词）：

| 现标题 | 新标题（中） | 新标题（英） | 正文改写方向 |
|---|---|---|---|
| 零上传架构 | **文件不上传，就在你电脑上搜** | **Your files stay on your computer** | 不再解释"架构"，直接说"文件不离开设备，所以不用审核、不用等上传" |
| 多文档合集 | **一次搜几十份文件** | **Search dozens of files at once** | 说清"PDF、Word、表格、笔记混着搜也可以" |
| 段落级引用 | **答案带出处，能点回原文** | **Every answer links back to the source** | 强调"不是让你信 AI，是让你自己核对" |
| 可离线运行 | **断网也能用** | **Works with the internet off** | 说清"第一次打开需要下载约 25MB，之后离线可用" |
| 严格度可控 | **要原文还是要解释，你说了算** | **Quotes only, or an explanation — your choice** | 把"严格度"翻译成"只要原句 / 允许解释" |
| 可导出的审计记录 | **问答记录可以导出** | **Export the whole session** | 说清格式（txt / md / json）与"含全部匹配处" |

## 改写样本 2：信任中心（首页）

**现在**：「信任中心 · 四条经得起你当场检验的说法」（不传输 / 不训练 / 唯一第三方 / 可删除）

**改为**：把整块从"四条声明"压缩成**一段话 + 一个可验证动作**：
- 标题：中「你的文件不会离开你的电脑」／英 `Your files never leave your computer`
- 正文：中「这不是承诺，是你可以自己验的：打开开发者工具的网络面板，添加文件、连问几个问题——除了第一次下载模型，你不会看到任何请求。本地处理，所以也没有账号、不用登录。」／英 `Don't take our word for it: open your browser's network panel, add a file, ask a few questions. Apart from the one-time model download you will see no requests. Everything runs locally — so there is no account and nothing to sign up for.`
- 保留"检验方法"链接到 `/security/` 与 `/privacy/`（技术深度留在那两页）。

## 改写样本 3：对比区标题（首页）

- 现：中「本地管线 vs 上传到云端助手」／英 *Local pipeline vs. uploading to a cloud assistant*
- 改：中「**在电脑上搜，和上传给云端 AI，有什么不一样**」／英 **`Searching on your computer vs. uploading to a cloud AI`**
- 表格内每一行也改成用户语言（如"要不要等上传"→"大文件上传要等多久"）。

## 改写样本 4：FAQ（首页 + /faq/）——同时补齐 GEO 缺口

标题改为：中「**常见问题**」／英 **`Frequently asked questions`**

按下表把 10 个长尾关键词写成**用户会问的原句**，每问 3–5 句、含具体数字：

| 长尾关键词 | 中文问句 | 英文问句 |
|---|---|---|
| 支持 PDF DOCX TXT 的 AI 跨格式文件智能检索工具 | 支持哪些文件格式？ | Which file types can I search? |
| 快速同时检索多种文件格式内容的 AI 工具 | 能不能一次把好几种格式的文件一起搜？ | Can I search several file formats at the same time? |
| 上传 PDF Word Markdown CSV 同时搜索信息 | 我可以一次上传多份文件再一起搜吗？ | Can I upload many files and search across all of them? |
| 跨文件格式 AI 语义搜索与索引工具 | "精准检索"和"模糊检索"有什么区别？ | What is the difference between exact and fuzzy search? |
| 在线多格式文件内容智能检索平台 | 需要安装软件或注册账号吗？ | Do I need to install anything or create an account? |
| AI-powered cross-format file search and indexing tool | 它和把文件发到 ChatGPT 里问有什么区别？ | How is this different from pasting a file into an AI chatbot? |
| Search across PDF DOCX TXT Markdown CSV HTML JSON simultaneously | 搜出来的结果会不会漏掉一些句子？ | Will it miss sentences that contain my words? |
| Intelligent multi-format document content retrieval online | 中文和英文都能搜吗？ | Does it work in Chinese and English? |
| Fast AI semantic search for multiple file formats | 大文件会不会很慢？ | Is it slow with large files? |
| Upload and search multiple document formats with AI | 关掉网页之后，我上传的文件还在吗？ | What happens to my files after I close the tab? |

## 执行顺序（按用户触达面排序）

1. 首页（能力区 → 信任区 → 对比区 → FAQ 区）——上表 4 个样本
2. 工具页 `/app/`：开头三步说明改成人话（"拖进文件 → 等几秒 → 提问"），去掉架构词
3. FAQ 页 `/faq/`：落上表 10 组问答
4. 用例页 `/use-cases/*`：标题从"合同与卷宗问答"改为用户场景（"要查合同里的条款，又不想上传"）
5. 指南/博客：保留技术深度（读者本来就是来找方法的），只在开头加一段人话摘要
6. **不改**：`/security/`、`/models/`、`/privacy/`、`/glossary/`、`/how-it-works/` —— 这几页的"技术 + 可验证"正是本站的信任基础，改了反而失去差异化

## 验收方式

- `check:content` / `check:seo` 两关必须仍为 OK（标题 ≤60 字符、中文描述 30–120 字）
- 每改一页，用真实产物 grep 关键词确认落位（与 `docs/seo/keyword-map.md` 对齐）
- 改完跑一次 `npm test` + `npm run build`，并截图确认版式未坏
