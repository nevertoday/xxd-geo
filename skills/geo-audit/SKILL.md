---
name: geo-audit
description: 给一个网站做 GEO 体检，写一份中文报告：哪些 AI 爬虫被挡、sitemap 和 Bing 收录缺什么、正文在不在原始 HTML 里、首页有没有说清产品是什么、结构化数据，最后给一份按优先级排的修复清单，每条带证据等级和《GEO 实战手册》的对应页面。Use when the user asks for a GEO audit, AI search / AI crawler check, "为什么 ChatGPT 不引用我的网站", 体检网站, 检查 AI 爬虫, or runs /geo-audit.
---

# GEO 体检

你要给用户的一个产品网站做体检，写一份中文报告。数据由脚本 `scripts/probe.mjs` 产出，你负责读数据、读页面、写结论。报告里的每个判断都要引用脚本输出里的原值或页面原文。

## 1. 先问清楚

用户没给的，问一次，一起问：

- 产品网址（必需）。再问一个最重要的内页，比如产品落地页或定价页；没有就只测首页。
- 本地仓库路径（可选）。有的话多做第 4 步。
- 训练类爬虫（GPTBot、ClaudeBot、Google-Extended）想不想放行。用户没意见就写「由你决定」，不要当成问题报。

## 2. 跑脚本

脚本在这个 SKILL.md 所在目录的 `scripts/probe.mjs`，Node 18 以上，不用装依赖。每个网址跑一次，输出存到临时目录：

```bash
node <本技能目录>/scripts/probe.mjs https://<域名>/ > /tmp/geo-probe-home.json
node <本技能目录>/scripts/probe.mjs https://<域名>/<内页>/ > /tmp/geo-probe-page.json
```

输出是一个 JSON。先看 `summary`，再按需看细节：

- `agents[]`：每个爬虫的 `robots`（命中哪一组、允许与否、命中的那条规则）和 `http`（用它的 UA 请求页面得到的状态码、`cfMitigated`）。`role` 是 `ai-search`、`ai-user`、`ai-training`、`search`、`unclear`、`browser`。
- `robots`：robots.txt 原文、解析出的分组、`Sitemap:` 行、`Content-Signal:` 行。
- `sitemap`：找到的 sitemap、URL 数、`lastmodDistinct`（不同 lastmod 值的个数）。
- `llmsTxt`、`bingSiteAuthXml`。
- `page`：title、description、canonical、metaRobots、xRobotsTag、h1、h2、JSON-LD 块（含原文）、`textLength`（去掉脚本和样式后的可见文字字数）、`textStart`（正文开头 600 字）、`emptyAppRoot`。

## 3. 读页面

用 `curl -sL https://<域名>/` 拿原始 HTML，结合 `page.textStart` 判断：

- **首页说没说清这是什么。** 看 title、h1 和正文第一段，能不能回答五件事：叫什么、是什么类别（Chrome 插件、开源库、会员站……）、给谁用、在哪个平台、免费还是多少钱。逐条写「有，原文是……」或「没有」。
- **小标题像不像用户会问的话。** 摘 3 个 h2 举例。
- **关键事实在不在原始 HTML 里。** 产品名、一句话介绍、价格、安装方式，各在 `curl` 结果里 grep 一次。
- **JSON-LD 和可见文字是否一致。** 每个字符串字段（name、description、price、author、ratingValue……）在可见文字里找原句，找不到就列出来。
- **有没有藏给 AI 看的文字。** 搜 `display:none`、`visibility:hidden`、极小字号、和背景同色的文字里有没有「AI」「assistant」「ignore」「推荐」这类指令。

## 4. 读仓库（用户给了路径才做）

- robots.txt 的来源：`public/robots.txt` 或 `src/pages/robots.txt.*`。和脚本输出里的 `robots.text`（线上实际内容）对比；线上多出一段 content signals 注释，说明是 Cloudflare 托管 robots.txt 加的。
- sitemap 配置：有没有给 `@astrojs/sitemap` 设全局 `lastmod: new Date()`。
- 核心内容是不是客户端渲染：`client:only`、组件里 `fetch` 再渲染。
- JSON-LD 模板里有没有写死的评分、评论数、价格。
- 仓库看不到 Cloudflare 后台设置，写进「要你自己看的」。

## 5. 判断规则

- **被挡**：`robots.allowed` 是 false，或 `http.status` 是 401、403、429、503，或 `cfMitigated` 有值，而 `browser` 是 200。
- 脚本是从用户电脑伪造 UA 发的请求。403 说明有按 UA 拦截的规则，真爬虫大概率也被拦；200 不保证真爬虫能进，因为 Cloudflare 还会核对 IP。结论写成「按 UA 拦截」，并让用户去 Cloudflare 的 AI Crawl Control 看真实记录。
- robots.txt 没有任何规则（`directives` 是 0）等于全部允许，不算问题。
- `ai-training` 类被挡不算问题，只说明影响：GPTBot、ClaudeBot 只管训练，不影响 ChatGPT 和 Claude 的搜索引用。例外是 Google-Extended，挡了它会退出 Gemini App 的引用。
- `ai-search`、`ai-user` 类被挡是最高优先级。PerplexityBot 是搜索爬虫，不是训练爬虫。
- `textLength` 少于约 500 字、`emptyAppRoot` 为 true，或关键事实 grep 不到：正文可能靠 JavaScript 渲染，ChatGPT、Claude、Perplexity 的爬虫看不到。
- `lastmodDistinct` 是 1 而 URL 很多：lastmod 是构建时间，不是真实更新时间。
- Bing 验证：`page.verification.bing` 或 `bingSiteAuthXml` 为 true，说明验证过。都是 false 时看不出来，因为也可能用 DNS 验证，写进「要你自己看的」。
- `summary.browserStatus` 是 null 或不是 200：网站本身打不开或拦了脚本。停下来，报告只写这一条，并说明可能原因。
- 不给总分，不给「GEO 分数」。没有证据表明这类分数能预测 AI 引用。
- 不把 llms.txt 或 JSON-LD 说成「能让 AI 引用你」的办法。两者都没有被证明有这个效果。

## 6. 修复项对照表

修复清单里每一条都从这张表里取链接和证据等级。等级含义：A 官方文档，B 大样本研究，C 小规模实测，D 观点。

| 发现 | 证据等级 | 链接 |
| --- | --- | --- |
| AI 搜索或用户类爬虫被 robots.txt 挡 | A | https://geo.xiaoxiaodong.ai/howto/robots-txt/ |
| AI 爬虫被 403 或质询页挡（CDN、WAF） | A | https://geo.xiaoxiaodong.ai/howto/cloudflare-bots/ |
| 页面不是 200，或带 noindex | A | https://geo.xiaoxiaodong.ai/guide/2-indexed/ |
| 正文不在原始 HTML 里 | B | https://geo.xiaoxiaodong.ai/guide/1-crawlable/ |
| 没有 sitemap，或 robots.txt 没写 Sitemap | A | https://geo.xiaoxiaodong.ai/guide/2-indexed/ |
| lastmod 全一样 | A | https://geo.xiaoxiaodong.ai/guide/2-indexed/ |
| 没验证 Bing Webmaster Tools | A | https://geo.xiaoxiaodong.ai/guide/2-indexed/ |
| 改了页面没推送 | A | https://geo.xiaoxiaodong.ai/howto/indexnow/ |
| 首页没说清产品是什么、给谁、多少钱 | B | https://geo.xiaoxiaodong.ai/guide/4-citable/ |
| 小标题不像用户的问法 | B | https://geo.xiaoxiaodong.ai/guide/4-citable/ |
| 标题层级乱、对比用图片不用表格 | A | https://geo.xiaoxiaodong.ai/guide/3-readable/ |
| JSON-LD 写了页面上没有的内容 | A | https://geo.xiaoxiaodong.ai/howto/json-ld/ |
| 没有 JSON-LD（只为富结果，低优先级） | A 富结果；B 对 AI 引用无可测效果 | https://geo.xiaoxiaodong.ai/howto/json-ld/ |
| Astro 站的 canonical、sitemap 设置 | A | https://geo.xiaoxiaodong.ai/howto/astro/ |
| 没有 llms.txt（可选，只对文档站和开发者工具有用） | B 对 AI 引用无相关 | https://geo.xiaoxiaodong.ai/howto/llms-txt/ |
| 页面里有藏给 AI 的文字或指令 | A 违反 Google 垃圾政策 | https://geo.xiaoxiaodong.ai/guide/8-with-ai/ |

按产品类型补一条：Chrome 插件链 https://geo.xiaoxiaodong.ai/howto/chrome-extension/，开源仓库链 https://geo.xiaoxiaodong.ai/howto/open-source/，会员站链 https://geo.xiaoxiaodong.ai/howto/saas/，小程序链 https://geo.xiaoxiaodong.ai/howto/mini-program/。

排序：被挡的搜索和用户类爬虫 > 不可索引 > 正文不在 HTML 里 > sitemap 和 Bing > 首页说不清 > JSON-LD 不一致 > 其余。

## 7. 写报告

写到当前目录的 `geo-audit-<域名>-<YYYY-MM-DD>.md`，然后在对话里给出三行摘要和文件路径。用中文，短句，产品名、爬虫名、字段名保持英文。结构固定：

```markdown
# <域名> GEO 体检（<日期>）

一句话结论：<最要紧的一件事>。

## AI 爬虫进不进得来
| 爬虫 | robots.txt | 状态码 |
（只列 ai-search、ai-user、search 三类和有问题的行，最多 10 行）

## 能不能被收录
sitemap、lastmod、Bing 验证、noindex，各一句，带原值。

## 正文在不在原始 HTML 里
textLength、关键事实 grep 结果。

## 首页说没说清你是谁
五件事逐条：有（原文）或没有。

## 结构化数据
有哪些类型；和页面不一致的字段。

## 修复清单
1. **<做什么>**（证据等级 <A/B/C>）
   证据：<脚本输出原值或页面原文>
   怎么做：<链接>
   做完怎么验证：<一条命令或一个后台位置>

## 这次没查、要你自己看的
- Cloudflare 后台 AI Crawl Control 里真实爬虫的放行记录
- Bing Webmaster Tools 的 AI Performance 报告
- 固定一组问题在 ChatGPT、Perplexity、豆包里问，看提没提你：https://geo.xiaoxiaodong.ai/howto/prompt-set/
```

最后再跑一次自查：报告里每个「有问题」都能在 JSON 或 HTML 里找到对应原值；没有一条修复建议缺链接或证据等级。
