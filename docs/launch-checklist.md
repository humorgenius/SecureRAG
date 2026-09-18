# 上线收尾清单（域名 + AdSense）

代码库这一侧的准备工作**已全部完成**；下面每一步都是代码库之外的操作，按顺序做即可。

---

## 一、域名切换 → `lilink.net`

代码里已同步的位置（无需再改）：`src/data/site.ts` 的 `url`、每页 `canonical` 与 `hreflang`、`sitemap`、
JSON-LD 组织节点、页脚联系文案、`public/CNAME`、`public/robots.txt` 的 Sitemap 行、`astro.config.mjs`。
旧域名 `securerag.app` 在 80 页产物中 **0 残留**（已实测）。

### 1. DNS 记录（在你的域名注册商 / Cloudflare 处）

| 类型 | 名称 | 值 | 说明 |
|---|---|---|---|
| CNAME | `www` | `你的GitHub用户名.github.io` | 指向 GitHub Pages |
| A ×4 | `@`（裸域） | `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153` | GitHub Pages 官方 IP |
| AAAA ×4 | `@`（裸域） | `2606:50c0:8000::153` 等四条 | 可选，想走 IPv6 再加 |
| CNAME | `www` | `你的用户名.github.io` | 若用 Cloudflare，务必设为 **DNS only（灰云）**，Pages 自己签发证书 |

若开启 Cloudflare 橙云代理，GitHub 无法签发 Let's Encrypt 证书，会卡在 "Improperly configured"。

### 2. GitHub Pages 侧

1. 仓库 → Settings → Pages → Custom domain 填 `lilink.net` → Save（`public/CNAME` 已进产物，会自动带上）。
2. 等 DNS 检查通过（几分钟到 24 小时）→ 勾选 **Enforce HTTPS**。
3. 需要裸域 → `www` 的跳转：GitHub 会自动把 `lilink.com` 重定向到 `lilink.net`（前提是裸域 A 记录已配）。

### 3. 搜索引擎侧（新域名重新建立索引）

1. Search Console 添加**新资源** `https://lilink.net`（用 DNS 验证最稳），提交 `https://lilink.net/sitemap-index.xml`。
2. Bing Webmaster Tools 同样提交一次（GEO 里 Bing 的信源权重不低）。
3. 旧域 `securerag.app` 若曾上线过：在 Search Console 里用**地址变更**工具指向新域；否则什么都不用做。
4. 两三天后回来查一遍：新域收录页数、`sitemap-index.xml` 的发现状态、有无 "Alternate page with proper canonical tag" 报告（出现即说明 hreflang/canonical 正确）。

---

## 二、AdSense 接入

### 现状（代码侧已就绪）

- `src/data/ads.ts` 的 `client` 与各 `slot` **全为空** → 全站广告位渲染为带标注的占位，**零第三方请求**（这也是当前"文件不上传、可自行验证"承诺成立的原因之一：没有 ID 就没有脚本）。
- 同意门 `ConsentGate` 与 `src/lib/ads/client.ts` 已实现 EEA/非 EEA × 同意/拒绝/未答分支；`public/ads.txt` 已存在（内容为占位 `pub-0000000000000000`）。
- 已实测：作答前 **零站外请求**；同意后按 `adMode` 决定是否加载。

### 关键结论：自研同意卡不能用于**个性化**广告（已查证 Google 官方口径）

Google AdSense 帮助明确：面向 **EEA / 英国 / 瑞士**投放**个性化广告**，必须使用
**Google 认证的、集成 IAB TCF 的 CMP**（EEA/UK 自 2024-01-16 起，瑞士自 2024-07-31 起），
且"只有来自认证 CMP 的流量才有资格获得个性化广告"。我们的同意卡是自研的，**不在认证名单内**。

**后果不是封号，而是收入口径**：

| 地区 | 现状下能投什么 |
|---|---|
| EEA / 英国 / 瑞士 | 非个性化广告 + limited ads（可投）；**个性化广告不可投** |
| 其他地区（含中国大陆、美加、东南亚） | 不受此要求影响，个性化与否由你自己的同意门决定 |

另外：**IAB TCF v2.3 已于 2026-03-01 强制**，之后生成的同意字符串必须是 v2.3。

### 建议做法（三选一）

1. **用 Google 自带 CMP（推荐，免费）**：AdSense → 隐私权和消息 → 欧洲法规消息，启用后由 Google 接管
   EEA/UK/CH 的同意收集，自动写 v2.3 字符串、自动认证合规。我们自研的同意卡继续负责其他地区。
   → 代价：那个地区用户会看到 Google 的弹窗，与我们的卡片是两套 UI，需要确认不冲突（可让 Google CMP 先弹，我们的卡片只对非 EEA 生效）。
2. **接入第三方认证 CMP**（如 Cookiebot、Usercentrics，均有免费档）：仍需自己维护，但 UI 可定制。
3. **不接 CMP，只投非个性化广告**：合规、零成本，EEA 收入打折（我们页面本来就偏远地区少流量，可行）。

### 接入步骤（无论选哪种）

1. 账号审核通过后，在 `src/data/ads.ts` 填入 `client: 'ca-pub-XXXXXXXXXXXXXXXX'` 与五个 `slot` 数字 ID。
2. `public/ads.txt` 改成一行真实授权记录：`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`。
3. 隐私政策里补一句广告技术提供方（ATP）说明，并列出所选 CMP（如果启用了 CMP，CMP 自己也会展示名单）。
4. 重新构建部署 → 用 `node scripts/verify-ads.mjs <url> 1600x1000` 复测：广告应正常渲染、同意前零站外请求。

### 审核前的自查（AdSense 的常见拒绝理由）

- [x] 有实质内容与可演示功能（80 页 + 浏览器内真工具）
- [x] 隐私政策、使用条款、联系方式齐备（邮箱 `guweiicy@gmail.com`）
- [x] 无隐藏广告、无诱导点击、无空页面堆砌
- [ ] 广告位 ID 已填（**现在还是空的，这一步不做就永远没有广告**）
- [ ] 若面向 EEA/UK 要个性化广告 → 先启用 CMP
- [ ] `ads.txt` 换成真实记录

---

## 三、仍挂在代码侧、我可以直接做的（不需要你决策）

1. 广告合规三条：矮视口给底部广告加高度上限、内容短的页面自动减少横幅数、窄屏让返回顶部按钮与同意卡避开广告带。
2. 404 页移除广告位（非内容页按政策不宜放广告）。
3. 导出功能的浏览器端到端验证（真点一次导出、读下载文件）。
4. 内容通俗化改写（方案见 `docs/seo/content-rewrite-plan.md`）。
