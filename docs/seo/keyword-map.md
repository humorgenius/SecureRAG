# 全站 SEO / GEO 关键词映射

> 目标域：`https://www.lilink.com`（品牌：SecureRAG，出品方 Lilink）
> 站点形态：纯静态、双语（`/zh/` 与 `/en/` 独立路径）、80 页、每页四道门禁把关。
> 规则：**一个页面只主打一个短词 + 一个长尾词**，避免自我竞争；标题 ≤60 字符（中文 ≤30 字），
> 描述中文 30–120 字、英文 60–175 字符（由 `check:seo` 强制）。

## 主词落位（短词，5 中 5 英）

| 关键词 | 主打页面 | 已落位的字段 |
|---|---|---|
| AI 文件检索 | `/zh/`（首页） | H1 第 3 行「AI 智能检索」、SEO 标题「跨格式文件索引工具」、描述、`SoftwareApplication.keywords` |
| 跨格式文件搜索 | `/zh/`（首页）+ `/zh/app/` | 首页标题与 H1；工具页标题「SecureRAG 跨格式文件索引工具」 |
| 智能文件索引 | `/zh/how-it-works/` | 该页标题与 H2（管线说明页，最适合承载"索引"语义） |
| 多格式文档检索 | `/zh/app/`（工具页） | 工具页描述「支持 PDF、DOCX、TXT、Markdown、CSV、HTML、JSON…统一检索」 |
| AI 文档搜索工具 | `/zh/faq/` + 首页 FAQ 区 | FAQ 问答体（AI 引擎最爱引用的格式）+ `FAQPage` 结构化数据 |
| AI file search | `/en/`（homepage） | 英文 SEO 标题改为含 `AI file search` |
| Cross-format document search | `/en/` + `/en/app/` | 英文首页标题、工具页标题 |
| Multi-format file retrieval | `/en/app/` | 工具页描述与 `featureList` |
| AI document indexer | `/en/how-it-works/` | 英文管线页标题 |
| Intelligent file search tool | `/en/faq/` | 英文 FAQ 问答体 + `SoftwareApplication.alternateName` |

## 长尾词落位（各自绑定一个具体页面，靠 FAQ 问答体承载）

中文长尾 → 落在 `/zh/faq/` 与首页 FAQ 区，作为**问题原句**出现（这正是 AI 引擎检索的形态）：

- 「支持 PDF DOCX TXT 的 AI 跨格式文件智能检索工具」→ 问：支持哪些文件格式？
- 「快速同时检索多种文件格式内容的 AI 工具」→ 问：能不能一次性检索好几种格式的文件？
- 「上传 PDF Word Markdown CSV 同时搜索信息」→ 问：我可以同时上传并搜索多个文件吗？
- 「跨文件格式 AI 语义搜索与索引工具」→ 问：两种检索模式有什么区别（精准 / 模糊）？
- 「在线多格式文件内容智能检索平台」→ 问：需要安装或注册吗？

英文长尾 → 落在 `/en/faq/`：

- "AI-powered cross-format file search and indexing tool"
- "Search across PDF DOCX TXT Markdown CSV HTML JSON simultaneously"
- "Intelligent multi-format document content retrieval online"
- "Fast AI semantic search for multiple file formats"
- "Upload and search multiple document formats with AI"

## GEO（生成式引擎优化）落位

AI 引擎引用内容有三个偏好：**问答体、结构化实体、机器可读摘要**。对应落地：

1. `public/llms.txt` — 站点级纯文本摘要（能力、页面清单、适用场景、联系方式），供 AI 引擎直接读取。
2. JSON-LD 强化：`SoftwareApplication` 增加 `featureList`（格式清单）、`keywords`、`alternateName`、`applicationCategory`；
   组织节点带 `description` 与 `sameAs`。每页都带组织节点，等于每页都向引擎声明实体。
3. FAQ 问答体：首页 FAQ 区与 `/faq/` 页，问题用**用户会问的原句**（含长尾词），答案 3–5 句、含具体数字，便于整段引用。
4. 实体一致性：全站统一品牌写法 `SecureRAG`，出品方统一写 `Lilink`，域名统一 `www.lilink.com`
   （canonical / hreflang / sitemap / JSON-LD 四处同步）——引擎要靠重复出现的一致实体来做消歧。

## 站外（需要你亲自执行，代码库无法代劳）

按 `geo-cn` 技能：国内 AI 引擎（豆包、文心一言、DeepSeek、Kimi）的信源以**百度百科、快懂百科、知乎、地方新闻**为主。
站内做完之后，站外这三件按性价比排序：知乎问答（AI 引用率最高）→ 百科词条（需权威报道支撑）→ 内容平台账号统一。
