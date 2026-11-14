# 调研稿 03：开发者能控制的技术面（站点与上架页）

调研日期：2026-11-14。范围：AI 爬虫可抓取性、收录通道、llms.txt 与 Markdown、结构化数据、页面结构、Astro + Cloudflare 实现、各类上架页、Agent 就绪、技术审计清单。

说明：本文所有代码片段都在本机做过语法检查（`node --check`、`json.load`），IndexNow 脚本的 sitemap 解析和内容协商 Worker 用假数据跑过一遍，结果符合预期。没有启动任何开发服务器。标「本稿实测」的结论来自 2026-11-14 用 curl 对真实页面的抓取 [S65]。

---

## 1. 一段话总结

1. **AI 抓取看的是原始 HTML，不是浏览器渲染后的页面。** 2024 年 Vercel/MERJ 的大样本数据显示 GPTBot、ClaudeBot、PerplexityBot 等主流 AI 爬虫都不执行 JavaScript，只有走 Googlebot 的 Gemini 和 AppleBot 会渲染 [S1]。2026 年 1 月对「用户实时抓取」的测试里，ChatGPT、Claude、Gemini、Perplexity 也不执行 JS，只有 Bing Copilot、Grok、DeepSeek 执行，而且等待时间很短（Copilot 约 53ms）[S2]。所以正文必须出现在服务端输出的 HTML 里。Astro 静态站默认就满足这一点。
2. **Cloudflare 的默认值可能悄悄把你挡在 AI 回答外面。** 2025-07-01 起新接入的域名默认屏蔽 AI 爬虫 [S14]。2026-07-01 Cloudflare 改成按 Search / Agent / Training 三类分别管理，并宣布 2026-09-15 起新域名在「有广告的页面」上默认屏蔽 Training 和 Agent 两类，Search 类默认放行；同时兼做搜索和训练的多用途爬虫也会受「屏蔽 Training」影响 [S18][S19]。Bot Fight Mode 的拦截无法用 WAF 自定义规则绕过 [S8]。上线后第一件事是去 AI Crawl Control 看实际放行情况，再用 curl 看线上 robots.txt 到底长什么样。
3. **搜索类爬虫和训练类爬虫要分开对待。** OpenAI 用 OAI-SearchBot 决定 ChatGPT 搜索能否引用你，GPTBot 只管训练 [S5][S6]；Anthropic 分 ClaudeBot（训练）、Claude-SearchBot（搜索索引）、Claude-User（用户实时抓取）[S7]；Google-Extended 只管 Gemini 训练和其他系统的 grounding，不影响 Google 搜索和收录 [S9]。想被 AI 引用，至少放行各家的搜索类和用户类 UA。
4. **Bing 值得认真做。** 微软官方称其 grounding 服务「几乎为市面上每个主流 AI 助手供数」[S47]（自家说法，有利益相关）；Bing Webmaster Tools 从 2026-02 起提供免费的 AI Performance 报告，能看到 Copilot 等引用了你哪些页面、用的是什么 grounding 查询 [S45][S46]。Bing 明确说 sitemap 的 `lastmod` 要准确，`changefreq`、`priority` 会被忽略 [S43]。配合 IndexNow 推送变更 [S48]。
5. **llms.txt 便宜，但几乎没有 AI 搜索在读。** Ahrefs 对 137,210 个域名的分析显示 97% 的 llms.txt 一个月里零请求，AI 检索类爬虫只占这些请求的 1.1% [S30]。Google 在 2026 年的官方指南里说做 Google 搜索不需要 llms.txt、AI 专用文件或特殊标记 [S11]。真正在读的是编程 Agent：Evil Martians 的日志里 Claude Code 的请求 88% 拿的是 Markdown [S3]。结论：给文档类、开发者工具类站点加 llms.txt 和 `.md` 版本，主要服务编程 Agent，不要指望它带来 ChatGPT 引用。
6. **结构化数据对 AI 引用的作用，目前没有可靠的正面证据。** Ahrefs 对 1,885 个新增 JSON-LD 页面的双重差分研究显示 ChatGPT +2.2%、AI Mode +2.4%（都和零没有区别），AI Overviews -4.6% [S32]；searchVIU 的实验发现五个主流 AI 在实时抓取页面时只读可见 HTML，忽略 JSON-LD [S33]。反方是微软 Bing 在 2025-03 公开说 schema 帮助其 LLM 理解内容 [S34]。Google 已在 2026-05-07 彻底停止展示 FAQ 富结果 [S35]，HowTo 富结果 2023 年就没了。建议：只写和可见内容一致的少量核心类型（SoftwareApplication、Article、Organization/Person、BreadcrumbList），把它当实体说明书，不当引用开关。
7. **页面写法比标记更重要。** Google 官方说不需要为 AI 把内容切成小块 [S11]，但要求结构化数据和可见文字一致、重要内容以文字形式存在 [S10]。Ahrefs 对 1,700 万条引用的分析显示 AI 助手引用的页面比自然搜索结果平均新 25.7% [S57]，Google 要求可见日期和 `datePublished`/`dateModified` 一致 [S39]。答案先行、清楚的标题层级、表格、真实作者信息，这些都是对人和机器都有用的写法。
8. **上架页你只能改字段，改不了渲染。** 本稿实测：Chrome Web Store 详情页是服务端渲染的，132 字以内的「摘要」会同时成为 meta description 和 og:description，完整描述也在原始 HTML 里，但评论、隐私、支持子页被 robots.txt 禁止抓取 [S65][S52]。GitHub 的 robots.txt 对 GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot 等单独设了 `Crawl-delay: 1` 并允许抓取，但整站禁止 Bytespider；README 在原始 HTML 里 [S65]。npmjs.com 和 producthunt.com 对本机 curl（无论伪装成什么 UA）都返回 Cloudflare 质询页 [S65]，所以重要信息一定要在你自己的站点和 GitHub 上再写一遍。
9. **「Agent 就绪」还很早期。** Cloudflare 扫描约 20 万个主流域名：78% 有 robots.txt，只有 4% 声明了 Content Signals，3.9% 支持 Markdown 内容协商，MCP Server Card 和 API Catalog 加起来不到 15 个站 [S24]。ChatGPT Atlas 官方说它靠 ARIA 标签理解页面结构和可交互元素 [S6]。对独立开发者，先把语义化 HTML、可访问性、Markdown 协商做好，MCP 只在你的产品本身有 API 时才值得做。
10. **微信小程序不是公开网页。** `sitemap.json` 只控制微信内部索引（微信搜一搜）[S51]。想被百度、Google 和各家 AI 检索到，需要单独做一个可抓取的网页版介绍页（这是推断，没有找到官方表述）。

---

## 2. 正文

### 2.1 AI 爬虫能不能看到你的内容

#### 2.1.1 服务端渲染与客户端 JS

**大样本证据（2024-12）。** Vercel 和 MERJ 统计了 Vercel 网络一个月的流量：GPTBot 5.69 亿次抓取，Claude 3.7 亿次，AppleBot 3.14 亿次，PerplexityBot 2,440 万次，Googlebot 45 亿次 [S1]。结论：

- OpenAI 的 OAI-SearchBot、ChatGPT-User、GPTBot，Anthropic 的 ClaudeBot，Meta-ExternalAgent，Bytespider，PerplexityBot 都不渲染 JavaScript。ChatGPT 有 11.50% 的请求会下载 JS 文件，Claude 是 23.84%，但都不执行 [S1]。
- Gemini 用 Googlebot 的基础设施，完整渲染 JS；AppleBot 也用浏览器式爬虫渲染 [S1]。
- ChatGPT 有 34.82% 的抓取打到 404，14.36% 走了重定向；Claude 的 404 比例是 34.16%；Googlebot 只有 8.22% [S1]。AI 爬虫常拿着过期或猜出来的 URL 来抓，所以改版时的 301 和合理的 404 页很重要。
- Vercel 的建议：主要正文、元数据、导航必须服务端输出，非核心交互可以客户端渲染；维护好重定向、sitemap 和稳定的 URL 结构 [S1]。

**用户实时抓取（2026-01）。** RESONEO 做了一个测试页，用 13 到 15 种方式注入不同的标记字符串（静态 HTML、JS 注入、延迟加载等），再让各家 AI 助手去读，看它们能报出哪些字符串 [S2]：

| 助手 | 是否执行 JS | 备注 |
|---|---|---|
| ChatGPT、Claude、Gemini | 不执行 | 只读原始 HTML |
| Perplexity | 不执行 | 报告称其压缩解码失败 |
| Bing Copilot | 执行 | 超时极短，约 53ms |
| Grok | 执行 | 等 1 到 2 秒 |
| DeepSeek | 执行 | 页面超时约 1 秒 |
| Google AI Mode | 不实时抓取 | 只用索引 |

报告还说 HTML-only 的用户抓取器不直接提取 `<script>` 里的 JSON-LD [S2]。这是单个团队的测试，样本次数没有公开，等级 C。

**2026 年的日志观察。** Evil Martians 在自己网站上做服务端记录，2026 年 9 到 10 月的数据里 ChatGPT-User 请求 Markdown 的比例只有 0.7%，几乎全拿 HTML；文章的结论是「聊天助手只读 HTML」，所以干净的服务端 HTML 是第一优先级 [S3][S4]。

**Google 的说法。** Google 2026 年的 AI 优化指南说「只要没被屏蔽，Google 能处理 JavaScript 里的内容」，按常规 JavaScript SEO 做即可 [S11]。这只对 Google 成立，对其他 AI 不成立。

**对 Astro 用户的含义。** Astro 默认静态生成 HTML，天然符合要求。需要注意的坑：

- 用 `client:only` 渲染的组件在服务端没有任何 HTML 输出。
- 在浏览器里 `fetch` 再渲染的内容（例如从 API 拉价格、拉更新日志）AI 看不到。要么构建时取数据，要么至少在 HTML 里留一份静态文字。
- 选项卡、手风琴：内容在 HTML 里但被 CSS 隐藏，原始 HTML 里仍然有，问题不大；如果是点了才加载，就看不到。

#### 2.1.2 状态码与速度

- 状态码：AI 爬虫的 404 比例高达三分之一 [S1]，说明它们手里有大量过期 URL。改 URL 时一律 301 到新地址，删掉的页面返回真正的 404 或 410，不要软 404（返回 200 加「页面不存在」文字）。
- Cloudflare Crawler Hints 在缓存 MISS 时把 URL 推给 IndexNow，但状态码大于 4xx 的响应不会上报 [S25]。
- 速度：用户实时抓取的超时很短，Copilot 约 53ms 就开始读，DeepSeek 页面超时约 1 秒 [S2]。没有找到 AI 爬虫按 TTFB 打分的官方说法，但慢页面会被截断是可以从这些超时推出来的（推断）。静态站放在 CDN 上通常没有这个问题。

#### 2.1.3 各家爬虫名单（官方文档）

| 公司 | UA 标记 | 用途 | robots.txt | IP 列表 |
|---|---|---|---|---|
| OpenAI | OAI-SearchBot | ChatGPT 搜索收录。屏蔽后不会出现在搜索答案里，但可能仍以导航链接出现 | 遵守，改动约 24 小时生效 | openai.com/searchbot.json [S5] |
| OpenAI | GPTBot | 训练基础模型 | 屏蔽即表示不用于训练 | openai.com/gptbot.json [S5] |
| OpenAI | ChatGPT-User | 用户提问时实时访问，GPT Actions | 「因为是用户发起，robots.txt 规则可能不适用」 | openai.com/chatgpt-user.json [S5] |
| OpenAI | OAI-AdsBot | 检查 ChatGPT 广告落地页 | 文档未说明 | openai.com/adsbot.json [S5] |
| Anthropic | ClaudeBot | 训练 | 遵守，支持 Crawl-delay | claude.com/crawling/bots.json [S7] |
| Anthropic | Claude-SearchBot | 搜索索引，屏蔽会降低在搜索结果中的可见度 | 遵守 | 同上 [S7] |
| Anthropic | Claude-User | 用户提问时实时抓取 | 遵守 | 同上 [S7] |
| Perplexity | PerplexityBot | 搜索结果收录，不用于训练 | 建议放行 | perplexity.ai/perplexitybot.json [S8] |
| Perplexity | Perplexity-User | 用户实时抓取 | 通常忽略，因为是用户发起 | perplexity.ai/perplexity-user.json [S8] |
| Google | Googlebot | 搜索，也是 AI Overviews / AI Mode 的来源 | 遵守 | Google 官方文档 |
| Google | Google-Extended | 不是独立爬虫，只是 robots.txt 标记。控制 Gemini 训练和 grounding，不影响 Google 搜索收录和排名 [S9] | 遵守 | 无 |
| Google | Google-CloudVertexBot | 站长自己请求的 Vertex AI Agent 抓取，不影响搜索 [S9] | 遵守 | |

补充：

- Anthropic 从 2026-10-30 起识别基于 IETF aipref 草案的「不用于 AI 训练」机器可读信号；robots.txt 里明确写了 ClaudeBot 的规则时，以 robots.txt 为准 [S7]。
- OpenAI 的 FAQ 说：想不出现在 ChatGPT 搜索里，用 `noindex` meta 标签，而且爬虫必须能抓到页面才能读到这个标签；只在 robots.txt 里禁止，ChatGPT Atlas 仍可能展示链接和标题 [S6]。
- ChatGPT 会在引荐链接上加 `utm_source=chatgpt.com`，可以在统计工具里直接筛 [S6]。
- 中国的 AI 产品（豆包、DeepSeek、Kimi、元宝、通义）没有找到公开的爬虫文档。字节的 Bytespider 合规性有争议：2024 年有报道称它不遵守 robots.txt [S68]。GitHub 的 robots.txt 直接整站禁止了 Bytespider（本稿实测 [S65]）。

#### 2.1.4 Cloudflare 的默认屏蔽和相关功能

时间线：

- **2024-09**：Cloudflare 推出一键屏蔽 AI 爬虫，到 2025-07 已有超过 100 万客户打开 [S14]。
- **2025-07-01**：新接入的域名默认屏蔽 AI 爬虫，注册时会问你是否允许；老客户可以随时在后台改 [S14]。同日推出 Pay per crawl（私测）：对付费 URL 返回 `HTTP 402 Payment Required` 并带 `crawler-price` 头，爬虫用 `crawler-exact-price` 或 `crawler-max-price` 头表示接受价格；爬虫必须用 Web Bot Auth（Ed25519 签名）证明身份；站长对每个爬虫可以选 Allow / Charge / Block [S15]。
- **2025-07-01**：Cloudflare Radar 上线「抓取与引荐比」指标。Cloudflare 自己提醒 Anthropic 的比值可能被高估，因为原生 App 常常不带 Referer [S28]。
- **2025-09**：Content Signals Policy。在 robots.txt 里用 `Content-Signal:` 表达三种用途偏好：`search`（建搜索索引、返回链接和摘要，不含 AI 摘要）、`ai-input`（RAG、grounding 等实时输入模型）、`ai-train`（训练和微调）。留空表示没在这里表达偏好，不等于同意。它是自愿遵守的信号，没有强制力 [S16]。
- **2025-10-21**：AI Crawl Control 新增 Robots.txt 标签页，能看到哪些爬虫访问了你 robots.txt 明确禁止的路径、违反了哪条规则、次数多少 [S21]。
- **2026-02-12**：Markdown for Agents，见 2.3.3。
- **2026-07-01**：所有套餐（含免费版）都可以按行为分类管理 AI 流量：Search（建索引或 RAG 库）、Agent（替人实时访问）、Training（训练）。每类可选「全部页面屏蔽」「只在有广告的页面屏蔽」「不屏蔽」。2026-09-15 起新域名默认：Training 和 Agent 在有广告的页面上屏蔽，Search 放行；兼做搜索和训练的爬虫会被「屏蔽 Training」的默认值波及 [S18]。Help Net Security 的报道把这一点说得更直白：如果你屏蔽 Training，Googlebot、Applebot、BingBot 这类多用途爬虫也会被挡 [S19]（行业报道，需要在自己后台核实具体表现）。

**Cloudflare 托管 robots.txt 的内容。** 开启后 Cloudflare 会在你的 robots.txt 前面插入一段：`User-Agent: *` 下 `Content-signal: search=yes, ai-train=no, use=reference` 和 `Allow: /`，并对 Amazonbot、Applebot-Extended、Bytespider、CCBot、ClaudeBot、Google-Extended、GPTBot、meta-externalagent 整站 `Disallow: /`。`use` 是 Cloudflare 正在测试的扩展：`immediate`（只能交互不能存）、`reference`（可索引、摘录、链回）、`full`（可总结和转载）。开启路径：Security Settings，筛选 Bot traffic，进入 AI Crawler and Agent access policies，把 Training 设为 Disallow 并打开 Enable Bot Preference Sync [S17]。

**这对想被 AI 推荐的独立开发者意味着什么：**

- 托管 robots.txt 禁止 GPTBot 和 ClaudeBot 不影响 ChatGPT 搜索和 Claude 搜索（它们用的是另外的 UA）[S5][S7]，但会让你的内容不进入下一代模型的训练数据。模型「记得」你的产品名是否有帮助，没有找到直接证据，这里只能说是合理推测。
- 如果你的教程站挂了广告，又是 2026-09-15 以后接入 Cloudflare 的新域名，ChatGPT-User、Claude-User 这类实时抓取在广告页上默认会被挡 [S18]。用户问 ChatGPT「这个页面说了什么」时就会失败。
- 分类名称：Cloudflare 旧分类把 Perplexity-User、DuckAssistBot 归为 AI Assistant，OAI-SearchBot 归为 AI Search；新分类是 Search / Agent / Training [S22]。

**WAF 和 Bot Fight Mode 的误伤。**

- Perplexity 官方文档提醒：在 Cloudflare 上放行它要写自定义规则，把 UA 和官方 IP 段一起匹配，动作设为 Skip，并放在所有屏蔽或质询规则之前；但 **Bot Fight Mode 无法用自定义规则绕过**，可能仍会质询这些爬虫 [S8]。免费版用户如果打开了 Bot Fight Mode，AI 爬虫可能被质询，而你在规则里看不出来。
- Super Bot Fight Mode 里「Block AI bots」的优先级高于「Allow verified bots」（来自 Cloudflare 文档的搜索摘要，未打开原页核对）。
- 只按 UA 放行有被伪造的风险，各家都建议 UA 加 IP 段一起验证 [S8]。

**怎么看到底谁来过。** AI Crawl Control（原名 AI Audit）所有套餐可用 [S20]。Crawlers 标签页列出访问你的 AI 爬虫、每个的允许/屏蔽状态和 robots.txt 违规次数；Robots.txt 标签页列出违规路径；免费版只按 UA 识别，Metrics 只显示最近 24 小时（来自 Cloudflare 文档的搜索摘要）。

### 2.2 收录通道

#### 2.2.1 XML sitemap 与 lastmod

- Google：`lastmod` 只在「持续且可验证地准确」时才用，应反映页面最后一次重要更新；`priority` 和 `changefreq` 直接忽略；单个 sitemap 上限 50MB（未压缩）或 50,000 个 URL；robots.txt 里可以写任意多条 `Sitemap:` [S42]。
- Bing（2025-07，Fabrice Canel 和 Krishna Madhavan 撰写）：`lastmod` 用 ISO 8601 并包含日期和时间；不要把 `lastmod` 设成 sitemap 生成时间，除非页面真的改了；`changefreq`、`priority` 被忽略；Bing 至少每天回看一次 sitemap；「新鲜度信号直接影响更新多快反映到搜索结果和 AI 生成的答案里」[S43]。2023 年 Bing 就说过 `lastmod` 是 sitemap 里最关键的标签之一 [S44]。
- 常见错误：静态站生成器在 `@astrojs/sitemap` 里设全局 `lastmod: new Date()`，每次构建所有页面都「更新」了。这正是 Bing 说不要做的。下面 4.4 给出按 frontmatter 生成真实 `lastmod` 的代码。

#### 2.2.2 IndexNow

- 协议：GET `https://<搜索引擎>/indexnow?url=<URL>&key=<key>`，或 POST JSON（`host`、`key`、`keyLocation`、`urlList`），每次最多 10,000 个 URL。key 为 8 到 128 位字母数字或短横线，放在站点根目录 `<key>.txt`（推荐）或用 `keyLocation` 指定；key 文件只能验证它所在路径下的 URL [S48]。
- 返回码：200 已提交；202 已收到、key 待验证；400 格式错误；403 key 无效；422 URL 不属于该 host；429 太频繁 [S48]。200 只代表收到，不代表收录。
- 参与方之间共享收到的 URL，向一家提交即可 [S49]。参与的搜索引擎：Bing、Yandex、Naver、Seznam、Yep（来自多个二手来源，未在 indexnow.org 页面上逐一核对）。Google 不参与。
- Bing 在 AI Performance 公告里把 IndexNow 列为让 AI 引用你最新页面的第一条建议 [S45]。
- 零代码方式：Cloudflare 的 Crawler Hints（Caching 下的 Configuration 里打开，所有套餐可用）会在缓存 MISS 时自动发 IndexNow [S25]。它对 Workers 静态资源是否生效，没有查到，放进第 6 节。

#### 2.2.3 Bing Webmaster Tools

- 为什么重要：微软 CVP Jordi Ribas 在 2026-02-12 写道「Microsoft grounding 为市面上几乎每个主流 AI 助手供数」[S47]（自家说法）。ChatGPT 搜索：OpenAI 帮助中心据转述写明第三方搜索提供方包括 Bing [S69]；Peec.ai（GEO 工具厂商）2026-09 的研究称 ChatGPT 搜索结果来自自有索引加至少 8 个外部提供方 [S62]。两者都说明 Bing 是其中一环，但比重不清楚。
- AI Performance（2026-02-10 公开预览，免费）：总引用次数、日均被引用页面数、grounding 查询（AI 检索你内容时用的关键词，抽样）、页面级引用、趋势；覆盖 Microsoft Copilot、Bing 的 AI 摘要和「部分合作方集成」。指标只反映被引用次数，不反映排名或在答案里的位置 [S45]。2026-06 又加了 Intents、Topics、Citation Share、Compare [S46]。
- 一个从业者案例：一个站 86 个页面在 Copilot 被引用 19,717 次，单日峰值 5,804 次；报告没有点击数据 [S63]。
- 微软对改善引用的建议：IndexNow、清楚的标题、表格、FAQ 段落、用数据和来源支撑说法、定期更新 [S45]。
- 2025-03 SMX Munich 上 Bing 的 Fabrice Canel 说 schema 帮助微软的 LLM 理解内容 [S34]。

#### 2.2.4 Google Search Console

- AI Overviews 和 AI Mode 没有额外技术要求：页面能被索引、能带摘要展示即可 [S10]。
- 想限制 AI 功能里展示的内容，用 `nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` [S10]。Google-Extended 不影响 AI Overviews [S9][S10]。
- Google 建议的基础：robots.txt 允许抓取、内链可发现、重要内容是文字、页面体验好、结构化数据和可见文字一致 [S10]。

#### 2.2.5 百度搜索资源平台

官方「普通收录」说明 [S50]：

- 三种方式：API 推送（最快，适合当天新内容）、sitemap（定期抓取，较慢）、手动提交。
- API：POST 到 `data.zz.baidu.com/urls?site=<站点>&token=<16 位 token>`，`text/plain`，每行一个 URL，每次最多 2,000 个。返回 `success`、`remain`（当天剩余配额）、`not_same_site`、`not_valid`。400 表示站点未验证、空内容、超 2,000 条或超配额；401 token 无效。
- 配额按站点质量浮动；重复提交旧链接会浪费配额，甚至被降配额或取消 API 权限。
- sitemap：单文件 50,000 个 URL、10MB，全站总数小于 50,000；TXT 用 UTF-8 或 GBK；优先级和 URL 顺序不影响排名；URL 里不要有中文。
- 百度不保证提交的 URL 被抓取或收录。

国内 AI 产品（文心、豆包、DeepSeek、元宝）各自的联网搜索用谁的索引，没有找到官方说明（见第 6 节）。

#### 2.2.6 canonical 与 hreflang

- hreflang 三种写法等价：`<head>` 里的 `<link>`、HTTP `Link` 头、XML sitemap。每个语言版本都要列出自己和所有其他版本；必须双向互指，否则被忽略；`x-default` 用于没有匹配语言时的兜底页；简体中文可以写 `zh-Hans`，也可以加地区 [S41]。
- sitemap 写法要声明 `xmlns:xhtml`，每个 `<url>` 里列出所有变体包括自己 [S41]。`@astrojs/sitemap` 的 `i18n` 选项会自动生成这些 [S55]。
- canonical：每页自指 canonical，域名、协议、结尾斜杠和 sitemap 里完全一致。Astro 里配好 `site` 和 `trailingSlash` 后用 `Astro.url.pathname` 拼接，见 4.3。

### 2.3 llms.txt、Markdown 版本与内容协商

#### 2.3.1 提案本身

- 作者 Jeremy Howard，2024-09-03 发布，2026-08-10 修订到 v2 [S29]。
- 格式：唯一必需的是一个 H1（项目或站点名）；其后依次是可选的引用块摘要、不带标题的说明段落、若干 H2 分组的链接列表（`[名称](url): 说明`）、一个叫 `Optional` 的 H2（Agent 需要少量上下文时可以跳过）[S29]。
- 页面的 Markdown 版本放在同一 URL 加 `.md`（`page.html.md`）或把扩展名换成 `.md`；无文件名的 URL 用 `index.html.md` 或 `index.md` [S29]。
- `llms-full.txt` 不在提案正文里，是社区约定（把全部文档拼成一个文件）。

#### 2.3.2 到底有没有人读

| 研究 | 样本 | 结论 | 等级 |
|---|---|---|---|
| Ahrefs，2026-06-15 [S30] | 137,210 个有流量的域名，2026 年 5 月日志 | 28% 发布了 llms.txt（样本偏技术向，是上限）；其中 97% 当月零请求；有请求的约 1,100 个域名共 2.2 万次。AI 类合计 19.5%：Agent 和 Agent 基础设施 10.5%，训练爬虫 5.3%（GPTBot 4.51%），AI 助手 2.5%，AI 检索 1.1%（OAI-SearchBot 0.74%）。Claude Code 排第三。AI 系统不会主动找不存在的文件；Agent 只在有链接或指令指向时才去读 | B |
| Evil Martians，2026 年 9 到 10 月 [S3] | 单站服务端日志 | `/llms.txt` 和 `/llms-full.txt` 共 593 次请求，有名 AI 助手只占 47 次，其中 Claude Code 43 次，ChatGPT 和 Perplexity 各 1 次 | C |
| Mintlify，2025-06 [S31] | 25 家公司 7 天（厂商数据） | llms-full.txt 中位数 79 次访问，llms.txt 中位数 14 次；llms-full.txt 的流量主要来自 ChatGPT | C，有利益相关 |

**平台表态：**

- Google 的 John Mueller 把 llms.txt 比作 keywords meta 标签，说 AI 服务并没有在请求它 [S13]。
- Google 2026 年的 AI 优化指南：「出现在 Google 搜索里不需要新建机器可读文件、AI 文本文件、标记或 Markdown」；修订版补充说可以为其他服务保留这些文件，但 Google 搜索会忽略 [S11][S12]。
- 与此同时，Chrome 的 Lighthouse 在 2026-05 加了实验性的「Agentic Browsing」类别，检查 WebMCP、可访问性树、布局稳定性和 llms.txt；缺失 llms.txt 记为「不适用」而非失败 [S64]。它衡量的是 Agent 浏览效率，不是搜索排名。

**结论：** llms.txt 的读者是编程 Agent 和文档工具，不是 AI 搜索。成本很低（一个构建时生成的端点），对开发者工具、开源项目文档、教程站值得加；对营销页、会员站意义不大。Ahrefs 还提醒它有提示注入风险，要像代码一样审查 [S30]。

#### 2.3.3 `.md` 版本和 `Accept: text/markdown`

- Evil Martians 2026 年 9 到 10 月的数据 [S3]：

| Agent | 请求数 | 拿到 Markdown 的比例 |
|---|---|---|
| Claude Code（Claude-User） | 36,691 | 88% |
| ChatGPT（ChatGPT-User） | 16,445 | 0.7% |
| DuckAssistBot | 3,179 | 0.0% |
| DeepSeek | 483 | 1.9% |
| Exa（ExaUser） | 456 | 100% |

  编程 Agent 合计约 3.8 万次请求，88% 是 Markdown；聊天助手约 2.3 万次，0.9% 是 Markdown。Claude Code 发送 `Accept: text/markdown`，贡献了 94% 的 Markdown 流量 [S3]。Checkly 的测试显示 Claude Code、Cursor、OpenCode 会发这个头 [S4]。
- Evil Martians 的「有用」清单：干净的服务端 HTML、`.md` 路由、`<link rel="alternate" type="text/markdown">` 和 HTTP `Link` 头、`Accept` 内容协商、llms.txt、llms-full.txt。「没用」清单：`<meta name="ai-content-url">`、`<meta name="llms">`（WHATWG 提案已关闭）、`/ai.txt`、HTML 注释提示、「人类/AI 切换按钮」、**按 UA 判断返回 Markdown（属于 Google 定义的 cloaking）**、专门的「AI 信息页」、隐藏的给 AI 看的提示（埋点六个月零点击）[S4]。
- Cloudflare Markdown for Agents（2026-02）：Pro、Business、Enterprise 套餐免费。开启路径：域名下 Agent Readiness，进入 Markdown for Agents，打开「Serve Markdown to AI agents」；或 API `PATCH /client/v4/zones/{zone_tag}/settings/content_converter`，body `{"value":"on"}`。客户端发 `Accept: text/markdown` 时，Cloudflare 把源站 HTML 转成 Markdown 返回，`Content-Type` 变为 `text/markdown; charset=utf-8`，`Vary` 加 `Accept`；源站没设时会默认加 `Content-Signal: ai-train=yes, search=yes, ai-input=yes`（注意这会替你表达「允许训练」，如果不想要就在源站自己设这个头）；只转换 HTML，解压后上限 6 MiB [S23]。
- 免费套餐用户可以用 4.6 的 Worker 自己实现协商。

### 2.4 结构化数据

#### 2.4.1 Google 富结果的变化

- 2023-08：FAQ 富结果只给权威的政府和健康网站；HowTo 富结果先后从移动端和桌面端移除（多个二手来源一致）。
- 2025-06-12：Google 停止展示 7 类结构化数据功能：Book Actions、Course Info、Claim Review、Estimated Salary、Learning Video、Special Announcement、Vehicle Listing，理由是用得少；不影响排名，在 Google 之外使用这些类型也不受影响 [S36]。
- 2025-11：Practice Problems 弃用，Dataset 只保留在 Dataset Search [S37]。
- 2026-05-07：FAQ 富结果完全停止展示；2026-06 Search Console 的 FAQ 报告和 Rich Results Test 支持移除，2026-08 API 支持移除；2026-06-15 Google 删除了该功能文档 [S35]。
- SoftwareApplication 富结果仍在：必需 `name`、`offers.price`（免费填 0），以及 `aggregateRating` 或 `review` 二选一；推荐 `applicationCategory`、`operatingSystem`；支持子类型 `MobileApplication`、`WebApplication`；只有 `VideoGame` 类型不出富结果；`applicationCategory` 的可选值包括 `BrowserApplication`、`DeveloperApplication`、`DesignApplication`、`BusinessApplication` 等 [S38]。
- Google 2026 年的 AI 指南：「生成式 AI 搜索不需要结构化数据，也没有需要特别添加的 schema.org 标记」，但仍建议为富结果资格使用 [S11]。

#### 2.4.2 结构化数据影响 AI 引用吗

| 研究 | 方法与样本 | 结果 | 等级 |
|---|---|---|---|
| Ahrefs，2026-05-11 [S32] | 1,885 个在 2025-08 到 2026-03 之间新增 JSON-LD 的页面，配对约 4,000 个对照页，前后各 30 天，双重差分 | AI Overviews -4.6%（显著但小，且处理组在加 schema 前就在下降）；AI Mode +2.4%、ChatGPT +2.2%（与零无差别）。只覆盖已被大量引用（100+ 次 AIO 引用）的页面，对还没被发现的页面不适用；只测 JSON-LD | B |
| searchVIU，2025-10 [S33] | 虚构产品页，价格放在不同格式里，测 ChatGPT、Claude、Perplexity、Gemini、AI Mode | 实时抓取时只提取可见 HTML，忽略 JSON-LD、隐藏的 Microdata 和 RDFa。不排除索引阶段或训练阶段会用 | C |
| RESONEO，2026-01 [S2] | 用户实时抓取测试 | HTML-only 抓取器不直接提取 script 里的 JSON-LD | C |
| 微软 Bing，2025-03 [S34] | 官方人员会议发言（转述） | schema 帮助 Bing 的 LLM 理解内容 | C（官方说法的二手报道） |

**判断：** 对 ChatGPT、Claude、Perplexity 这类读原始 HTML 的系统，JSON-LD 基本不是引用开关；对 Bing/Copilot 和 Google 这种有完整索引管线的系统，schema 可能帮助实体识别，但没有对照实验证明能提高引用。写 JSON-LD 的理由是：SoftwareApplication 和 Article 等富结果仍在；给搜索引擎一个明确的「这是什么产品、谁做的、在哪些平台」的实体说明；成本低。**最重要的是把同样的事实写在可见 HTML 里。**

#### 2.4.3 对开发者产品有用的类型

| 类型 | 用在哪 | 说明 |
|---|---|---|
| `SoftwareApplication` | 插件、桌面应用、CLI 的落地页 | 有富结果，但需要评分或评论 |
| `WebApplication` | SaaS、会员站、在线工具 | SoftwareApplication 的子类，有 `browserRequirements` |
| `MobileApplication` | App | 子类 |
| `SoftwareSourceCode` | 开源仓库 | `codeRepository`、`programmingLanguage`、`runtimePlatform`、`targetProduct` |
| `Product` | 实体商品或明确的商品页 | 软件订阅一般用 WebApplication 加 `offers` 更贴切（判断） |
| `Article` / `TechArticle` / `BlogPosting` | 教程、博客 | 带 `datePublished`、`dateModified`、`author` |
| `Organization` / `Person` | 全站一次 | `sameAs` 指向 GitHub、X、商店页，帮助把分散的身份连成一个实体 |
| `BreadcrumbList` | 所有内页 | 仍受支持 |
| `FAQPage` / `HowTo` | 可以写但没有富结果 | Google 不再展示，写了只有语义价值 |

4.2 给出 Chrome 插件、开源工具、SaaS/会员站、教程文章的完整 JSON-LD。

### 2.5 页面和 HTML 结构

**有官方依据的：**

- Google：不需要为 AI 把内容切成小块，没有理想长度 [S11]；重要内容要是文字，结构化数据要和可见内容一致 [S10]。
- Google 的 E-E-A-T：经验、专业、权威、可信，其中「可信最重要」；E-E-A-T 本身不是单一排名因素；强烈建议在读者预期的地方加准确的作者署名，不要编造作者或用 AI 头像 [S40]。
- 日期：可见日期和结构化数据里的日期要一致，时区要对，不要写未来日期 [S39]。
- 微软：清楚的标题、表格、FAQ 段落，用数据和来源支撑说法，定期更新 [S45]。

**有数据支撑的：**

- 新鲜度：Ahrefs 分析 16,975,000 个被引用 URL，ChatGPT、Perplexity、Copilot、Gemini 引用的页面平均 1,064 天，自然搜索结果平均 1,432 天，新 25.7%；ChatGPT 最偏向新页面；AI Overviews 反而比自然结果平均旧 16 天 [S57]。
- GEO 论文（KDD 2024）：在内容里加入引用来源、引语、统计数据等方法，在生成式引擎回答里的可见度最多提升约 40% [S58]。这是实验环境的结果，具体方法见内容方向的调研稿。

**厂商数字（未核实原文，不建议当事实引用）：** AirOps 称列表和表格出现在近 80% 的 ChatGPT 引用里，有序标题层级让被引用概率提升 2.8 倍；有文章称 ChatGPT 44.2% 的引用来自页面前 30% 的文字。这些只在二手文章里看到。

**落到 HTML 上的写法（依据上面几条整理）：**

- 一个页面一个 `<h1>`，`<h2>`/`<h3>` 按层级，不跳级。标题写成完整的问题或结论句，比如「Astro 怎么生成 sitemap？」而不是「Sitemap」。
- 每个 `<h2>` 下第一段直接回答，再展开。产品页首段一句话说清：这是什么、给谁用、在哪个平台、免费还是付费。
- 对比、参数、价格、兼容性用 `<table>`，不要用图片或 CSS 网格拼。
- 用 `<main>`、`<article>`、`<nav>`、`<header>`、`<footer>`、`<time datetime="...">`。
- 页面顶部或底部写可见的「最后更新：2026-11-12」，和 `dateModified` 一致。
- 作者框：真名或稳定的网名、一句话经历、链接到 About 页和 GitHub。About 页写清楚你做过哪些产品。
- 页面里的产品名、版本号、价格、平台要和商店页、README 一致。

### 2.6 上架页：AI 会读的第三方页面

| 平台 | 能被抓到什么（证据） | 你能改什么 |
|---|---|---|
| Chrome Web Store | 本稿实测：详情页服务端渲染；摘要同时成为 `<meta name="description">` 和 `og:description`；完整描述在原始 HTML 的 Overview 区；有 canonical；robots.txt 禁止 `/detail/*/reviews`、`/support`、`/privacy`、`/related` 和 `/search` [S65] | 标题清楚好记，不堆关键词；摘要 132 字以内；描述用概述段加功能列表；至少 1 张、最好 5 张 1280x800 截图；小宣传图 440x280；各语言单独写摘要、截图。排名由评分和使用数据（下载与卸载）等启发式决定，堆关键词可能被下架 [S52] |
| GitHub | 本稿实测：README 在原始 HTML 里；仓库 About 描述成为 meta description；robots.txt 对 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-SearchBot、Claude-User、PerplexityBot、Perplexity-User 设 `Crawl-delay: 1`，对 Bytespider 整站禁止 [S65] | About 一句话描述、Website 链接、Topics（小写字母数字和短横线，每个不超过 50 字符，最多 20 个）[S53]；README 第一段写清楚是什么、解决什么问题；安装命令、截图、与同类工具的对比表 |
| npm | npm 文档：`description` 和 `keywords` 帮助在 `npm search` 里被发现 [S54]。本稿实测：npmjs.com 对本机 curl 一律返回 Cloudflare 质询，无法判断真实 AI 爬虫能否抓到 [S65] | `description`、`keywords`、`homepage`、`repository`；README 会同步显示 |
| Product Hunt | 本稿实测同样返回质询页 [S65]。Product Hunt 自己发的案例称它贡献了 Wispr Flow 约 32% 的 ChatGPT 可见度（平台自证，单一品牌）[S66] | 标语、描述、首评、链接到官网 |
| 微信小程序 | `sitemap.json` 只决定页面是否被微信索引（微信搜一搜）；没有这个文件时默认全部允许；规则有 `action`、`page`、`params`、`matching`、`priority` 字段 [S51] | 打开页面收录、配 sitemap.json；另做网页版介绍页给外部搜索和 AI |
| App Store / Google Play | 没有查到 2025 到 2026 年的可靠研究 | 见第 6 节 |
| 文档站 | Evil Martians 的数据说明编程 Agent 是文档站最大的 AI 读者 [S3] | `.md` 版本、llms.txt、内容协商；Starlight 可用 `starlight-llms-txt` 插件自动生成 llms.txt、llms-full.txt、llms-small.txt [S56] |

在 AI 引用的域名统计里，GitHub 属于前 20 的常见来源（多家统计，方法不一，没有逐一核对）。所以开源仓库的 README 很可能就是你产品被 AI 读到的第一份材料（推断）。

### 2.7 MCP、OpenAPI 和「Agent 就绪」

- **Cloudflare Agent Readiness 评分（2026-04-17）**：四个维度：可发现性（robots.txt、sitemap.xml、RFC 8288 Link 头）、内容（Markdown 协商）、机器人访问控制（Content Signals、robots.txt 里的 AI 规则、Web Bot Auth）、能力（Agent Skills、RFC 9727 API Catalog、RFC 8414/9728 OAuth 发现、MCP Server Card、WebMCP）。llms.txt 只在自定义扫描时检查；x402 等 Agent 支付标准检查但不计分。扫描约 20 万个主流域名：robots.txt 78%，Content Signals 4%，Markdown 协商 3.9%，MCP Server Card 和 API Catalog 合计不到 15 个站 [S24]。在线工具是 isitagentready.com。
- **ChatGPT Atlas**：OpenAI 官方说 Atlas 用 ARIA 标签（和屏幕阅读器用的同一套标签和角色）理解页面结构和可交互元素，建议按 WAI-ARIA 最佳实践给按钮、菜单、表单加描述性的角色、标签和状态 [S6]。可访问性专家 Adrian Roselli 批评这种说法，认为 ARIA 应该是最后手段，先用原生语义元素，否则可能让真人用户的可访问性变差 [S60]。实践建议：优先用原生 `<button>`、`<a>`、`<label>`，只有图标按钮这类没有文字的地方加 `aria-label`。
- **WebMCP**：网页通过浏览器 API 向 Agent 暴露工具。Chrome 有官方文档 [S59]；据二手资料，Chrome 149 开始 origin trial，API 正从 `navigator.modelContext` 迁到 `document.modelContext`，规范是 W3C 社区组草案，Firefox 和 Safari 未表态。Google 的 Mueller 据报道更看好 WebMCP 而非 llms.txt（二手）。对独立开发者：现在只值得关注，不值得投入。
- **NLWeb（微软，2025-05）**：每个 NLWeb 实例提供 `/ask`（自然语言查询，返回 schema.org JSON）和 `/mcp`。采用很少，Lumar 的文档只列出两个生产案例，官方证书一度过期 [S61]。不建议投入。
- **MCP Registry**：官方注册表用 `mcp-publisher` CLI 发布 `server.json` 元数据，包本身仍发 npm/PyPI，名称用反向域名或 GitHub 命名空间；仍是预览服务（二手资料 [S67]）。如果你的工具本身有 API（例如会员站可以查询提示词），做一个 MCP server 并登记，比给营销页做任何「AI 优化」都更能让 Agent 用上你的产品（判断）。
- **OpenAPI**：有公开 API 的产品，发布 OpenAPI 文档并用 RFC 9727 的 `/.well-known/api-catalog` 指向它，是 Cloudflare 评分里的一项 [S24]。

---

## 3. 实战清单

### 3.1 上线前后各做一次的检查（10 分钟）

1. 看线上 robots.txt 实际内容（Cloudflare 托管 robots.txt 会在前面插内容）：
   ```bash
   curl -s https://你的域名/robots.txt
   ```
2. 进 Cloudflare 后台，Security 下的 Settings，筛选 Bot traffic，看 AI Crawler and Agent access policies 里 Search、Agent、Training 三类各是什么设置。想被 AI 搜索引用：Search 设「不屏蔽」，Agent 设「不屏蔽」。Training 是你的取舍，但注意「屏蔽 Training」可能波及多用途爬虫，改完后用 AI Crawl Control 观察 Googlebot、Bingbot 是否仍正常 [S18][S19]。
3. 检查 Bot Fight Mode 是否开着。开着的话 AI 爬虫可能被质询，自定义规则绕不过去 [S8]。
4. AI Crawl Control 的 Crawlers 标签页看最近有哪些 AI 爬虫来过、是否被挡 [S20]。
5. 原始 HTML 里能不能找到你的核心句子（见 3.6 的命令）。
6. Bing Webmaster Tools 加站点（可以从 Google Search Console 导入），提交 `sitemap-index.xml`；打开 AI Performance 看引用 [S45]。
7. Google Search Console 提交 sitemap。
8. 中文站：百度搜索资源平台验证站点、提交 sitemap，新页面用 API 推送 [S50]。

### 3.2 robots.txt 推荐写法（想被 AI 引用的独立开发者）

```txt
# 想被搜索和 AI 回答引用：放行所有爬虫，只挡后台
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://geo.example.com/sitemap-index.xml
```

要点：

- 一个爬虫只会遵守最匹配它的那一组规则。如果你单独写了 `User-agent: GPTBot` 组，它就不再看 `*` 组，所以单独组里要把 Disallow 也写全。
- 不想进训练数据，但要搜索引用：把 `ai-train=no`，并加：
  ```txt
  User-agent: GPTBot
  Disallow: /

  User-agent: ClaudeBot
  Disallow: /

  User-agent: Google-Extended
  Disallow: /
  ```
  OAI-SearchBot、Claude-SearchBot、PerplexityBot、Googlebot、Bingbot 不受影响 [S5][S7][S8][S9]。
- `Content-Signal` 是 Cloudflare 提出的自愿信号，没有强制力 [S16]。
- 不想出现在 ChatGPT 搜索里，用 `<meta name="robots" content="noindex">` 而不是只靠 robots.txt，并且要让爬虫能抓到这个页面 [S6]。

### 3.3 结构化数据：写多少

- 全站：`Organization`（或个人品牌用 `Person`）加 `WebSite`，放首页。
- 产品落地页：`SoftwareApplication` 或 `WebApplication`，加 `sameAs` 指向商店页、GitHub、Product Hunt。
- 教程和博客：`TechArticle` 或 `BlogPosting` 加 `BreadcrumbList`。
- 不要写的：在你自己的页面上标注 Chrome 商店的评分（这些评分不是在你站上收集的；Google 的评论摘要指南有相关限制，本稿未打开原文核对，第 6 节列为待查）；与页面可见内容不一致的价格或功能；为了富结果而写的 FAQPage。
- 写完用 Rich Results Test（search.google.com/test/rich-results）看 Google 能识别什么，用 validator.schema.org 检查语法和属性是否属于该类型。

### 3.4 内容页写法检查表

- 标题是完整的问题或结论句。
- 每节第一段直接给答案。
- 有对比或参数就用表格。
- 页面上有可见的「最后更新」日期，和 `dateModified` 一致，只在真正改了内容时更新。
- 有作者署名和 About 页链接。
- 产品名、版本、价格、平台在官网、商店、README 三处一致。
- 改 URL 时做 301。

### 3.5 上架页优化清单

**Chrome Web Store：**
- 标题：产品名加一个说明用途的词，不堆关键词 [S52]。
- 摘要（132 字以内）：它会成为搜索结果和社交分享的描述 [S65]，写成「做什么 + 给谁 + 关键差异」。
- 描述：第一段概述，然后功能列表 [S52]。描述里写一句「官网：https://...」和「源码：https://github.com/...」，把商店页和你的站连起来。
- 每个语言单独写摘要和截图 [S52]。
- 评论页不能被抓取 [S65]，所以重要的用户评价要整理到你自己的官网（用真实可核实的评价）。

**GitHub：**
- About：一句话描述（会成为 meta description），填 Website，加 5 到 15 个准确的 Topics [S53]。
- README 首屏：一句话是什么，一张截图或 GIF，安装命令，链接到官网和商店页。
- 有对比优势的写一张「和 X 的区别」表格。

**npm：** `description` 一句话说清用途，`keywords` 写用户会搜的词，`homepage` 指向官网 [S54]。

**微信小程序：** 后台打开页面收录，根目录放 `sitemap.json`：
```json
{
  "rules": [
    { "action": "allow", "page": "pages/detail/detail", "params": ["id"], "matching": "inclusive", "priority": 10 },
    { "action": "disallow", "page": "pages/admin/*" },
    { "action": "allow", "page": "*" }
  ]
}
```
（字段含义来自 2022 年的教程转述 [S51]，`pages/admin/*` 这种通配写法未核实，以微信官方文档为准。）另外为每个小程序在你的网站上做一个介绍页，带小程序码、功能说明和截图。

### 3.6 技术审计命令

```bash
SITE=https://geo.example.com
PAGE=$SITE/guide/astro-json-ld/
PHRASE='在 Astro 里给每个页面加 JSON-LD'

# 1) robots.txt 和 sitemap 是否能拿到
curl -s $SITE/robots.txt
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $SITE/sitemap-index.xml

# 2) 用不同 UA 请求，看状态码
#    注意：Cloudflare 会结合 IP 判断真假爬虫，从你电脑伪造 UA 得到 403 不代表真爬虫被挡，
#    得到 200 也不保证真爬虫能进。以 AI Crawl Control 日志为准。
for UA in \
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot' \
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot' \
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot' \
  'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)' \
  'ClaudeBot' 'Claude-User' 'Claude-SearchBot' ; do
  printf '%-40.40s %s\n' "$UA" "$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" "$PAGE")"
done

# 3) 不执行 JS 时能不能看到正文
curl -s "$PAGE" | python3 -c "
import sys,re
h=sys.stdin.read()
t=re.sub(r'<script.*?</script>|<style.*?</style>','',h,flags=re.S)
t=re.sub(r'<[^>]+>',' ',t); t=re.sub(r'\s+',' ',t)
print('可见文字字符数:',len(t))
print('找到核心句子:', sys.argv[1] in t)
" "$PHRASE"

# 4) 响应头：状态、X-Robots-Tag、缓存、Vary
curl -sI "$PAGE"

# 5) 重定向链和首字节时间
curl -s -o /dev/null -L -w 'final=%{url_effective} redirects=%{num_redirects} ttfb=%{time_starttransfer}s\n' "${PAGE%/}"

# 6) 提取并解析页面里的 JSON-LD
curl -s "$PAGE" | python3 -c "
import sys,re,json
for i,b in enumerate(re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>',sys.stdin.read(),re.S)):
    d=json.loads(b); g=d.get('@graph',[d])
    print(i,[n.get('@type') for n in g])
"

# 7) canonical 和 hreflang
curl -s "$PAGE" | grep -oE '<link[^>]+rel="(canonical|alternate)"[^>]*>'

# 8) Markdown 版本和内容协商
curl -sI -H 'Accept: text/markdown' "$PAGE" | grep -iE '^(content-type|vary|link)'
curl -s "$SITE/llms.txt" | head -20

# 9) IndexNow key 文件
curl -s "$SITE/$INDEXNOW_KEY.txt"

# 10) sitemap 里 lastmod 是否都一样（一样就说明是构建时间，不是真实更新时间）
curl -s $SITE/sitemap-0.xml | grep -oE '<lastmod>[^<]+' | sort | uniq -c | sort -rn | head
```

**服务端日志里找 AI 爬虫并验证 IP（适用于有原始访问日志的服务器）：**

```bash
grep -oE 'GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|PerplexityBot|Perplexity-User|Bingbot|Googlebot|Bytespider|DuckAssistBot' access.log | sort | uniq -c | sort -rn
```

```python
# verify_bot_ip.py 用法：python3 verify_bot_ip.py 20.171.207.10 https://openai.com/searchbot.json
import ipaddress, json, sys, urllib.request
ip = ipaddress.ip_address(sys.argv[1])
data = json.load(urllib.request.urlopen(sys.argv[2]))
prefixes = [p.get("ipv4Prefix") or p.get("ipv6Prefix") for p in data.get("prefixes", [])]
print(any(ip in ipaddress.ip_network(p) for p in prefixes if p))
```
（IP 列表 JSON 的字段名按 Google 常用格式 `prefixes[].ipv4Prefix` 写的，各家格式以实际文件为准。）

**Lighthouse 的 Agentic Browsing 检查：** 二手资料给的命令是 `npx lighthouse $PAGE --only-categories=agentic-browsing`，类别 ID 未核实，可能需要较新的 Lighthouse 版本 [S64]。

---

## 4. Astro + Cloudflare Workers 实现

假设：Astro 5 静态站，内容放在 `src/content/docs`（content collection，字段 `title`、`description`、`pubDate`、`updated`、`draft`），中文在根路径、英文在 `/en/`，部署到 Cloudflare Workers 静态资源。

### 4.1 Cloudflare Workers 配置

纯静态 Astro 不需要 `@astrojs/cloudflare` 适配器，`wrangler.jsonc` 指向 `dist` 即可，`not_found_handling: "404-page"` 使用 `src/pages/404.astro` [S26]：

```jsonc
// wrangler.jsonc（纯静态，不做内容协商）
{
  "name": "geo-wiki",
  "compatibility_date": "2026-11-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

自定义响应头放 `public/_headers`，只作用于静态资源，最多 100 条规则，每行 2,000 字符 [S27]：

```txt
/llms.txt
  Content-Type: text/plain; charset=utf-8
/llms-full.txt
  Content-Type: text/plain; charset=utf-8
```

### 4.2 JSON-LD 完整示例

以下四段都通过了 JSON 解析检查。`@id` 用来在 `@graph` 内部互相引用，同一个人在全站用同一个 `@id`。

**A. Chrome 插件落地页**（`browserRequirements` 只属于 WebApplication，所以这里用 `softwareRequirements`；`operatingSystem` 是自由文本；没有放 `aggregateRating`，因为商店评分不是在本站收集的。代价是没有 SoftwareApplication 富结果资格 [S38]）：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://example.com/tabnote/#app",
      "name": "TabNote",
      "alternateName": "TabNote 网页便签",
      "description": "在 Chrome 侧边栏给任意网页记笔记，笔记跟着网址保存，下次打开同一页面自动出现。",
      "url": "https://example.com/tabnote/",
      "applicationCategory": "BrowserApplication",
      "applicationSubCategory": "Chrome extension",
      "operatingSystem": "Chrome, Microsoft Edge",
      "softwareRequirements": "Google Chrome 120 或更高版本",
      "permissions": "sidePanel, storage, activeTab",
      "softwareVersion": "2.3.1",
      "datePublished": "2025-03-02",
      "dateModified": "2026-10-28",
      "inLanguage": ["zh-CN", "en"],
      "installUrl": "https://chromewebstore.google.com/detail/tabnote/abcdefghijklmnopabcdefghijklmnop",
      "image": "https://example.com/tabnote/icon-512.png",
      "screenshot": [
        "https://example.com/tabnote/screenshot-1.png",
        "https://example.com/tabnote/screenshot-2.png"
      ],
      "featureList": [
        "按网址自动保存和回显笔记",
        "Markdown 语法",
        "本地存储，不上传服务器",
        "导出为 JSON 或 Markdown"
      ],
      "releaseNotes": "https://example.com/tabnote/changelog/",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": { "@id": "https://example.com/#me" },
      "sameAs": [
        "https://chromewebstore.google.com/detail/tabnote/abcdefghijklmnopabcdefghijklmnop",
        "https://github.com/example/tabnote",
        "https://www.producthunt.com/products/tabnote"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://example.com/#me",
      "name": "小明",
      "url": "https://example.com/about/",
      "sameAs": [
        "https://github.com/example",
        "https://x.com/example"
      ]
    }
  ]
}
```

**B. 开源命令行工具**：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://mdshot.example.com/#app",
      "name": "mdshot",
      "description": "把 Markdown 文件一键渲染成适合社交媒体分享的长图的命令行工具。",
      "url": "https://mdshot.example.com/",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "macOS, Linux, Windows",
      "softwareRequirements": "Node.js 20 或更高版本",
      "softwareVersion": "1.8.0",
      "datePublished": "2024-11-20",
      "dateModified": "2026-10-30",
      "downloadUrl": "https://www.npmjs.com/package/mdshot",
      "installUrl": "https://mdshot.example.com/docs/install/",
      "license": "https://opensource.org/licenses/MIT",
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "author": { "@id": "https://example.com/#me" },
      "sameAs": [
        "https://github.com/example/mdshot",
        "https://www.npmjs.com/package/mdshot"
      ]
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://mdshot.example.com/#code",
      "name": "mdshot source code",
      "codeRepository": "https://github.com/example/mdshot",
      "programmingLanguage": ["TypeScript"],
      "runtimePlatform": "Node.js",
      "license": "https://opensource.org/licenses/MIT",
      "targetProduct": { "@id": "https://mdshot.example.com/#app" },
      "author": { "@id": "https://example.com/#me" }
    },
    {
      "@type": "Person",
      "@id": "https://example.com/#me",
      "name": "小明",
      "url": "https://example.com/about/",
      "sameAs": ["https://github.com/example", "https://x.com/example"]
    }
  ]
}
```

**C. SaaS / 会员站**（订阅价格用 `UnitPriceSpecification` 的 `billingDuration`，ISO 8601 时长）：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://prompts.example.com/#org",
      "name": "小明提示词",
      "url": "https://prompts.example.com/",
      "logo": "https://prompts.example.com/logo-512.png",
      "founder": { "@id": "https://example.com/#me" },
      "sameAs": [
        "https://github.com/example",
        "https://x.com/example",
        "https://www.xiaohongshu.com/user/profile/example"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://prompts.example.com/#website",
      "name": "小明提示词",
      "url": "https://prompts.example.com/",
      "inLanguage": ["zh-CN", "en"],
      "publisher": { "@id": "https://prompts.example.com/#org" }
    },
    {
      "@type": "WebApplication",
      "@id": "https://prompts.example.com/#app",
      "name": "小明提示词会员站",
      "description": "收录 800+ 套可直接复制的 AI 绘图风格提示词，每套附样图和中英文版本，会员可下载全部原图。",
      "url": "https://prompts.example.com/",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Any",
      "browserRequirements": "需要启用 JavaScript 的现代浏览器",
      "inLanguage": ["zh-CN", "en"],
      "dateModified": "2026-11-10",
      "provider": { "@id": "https://prompts.example.com/#org" },
      "offers": [
        {
          "@type": "Offer",
          "name": "免费版",
          "price": "0",
          "priceCurrency": "CNY",
          "description": "每天浏览 20 套提示词"
        },
        {
          "@type": "Offer",
          "name": "月度会员",
          "price": "29",
          "priceCurrency": "CNY",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "29",
            "priceCurrency": "CNY",
            "billingDuration": "P1M"
          },
          "url": "https://prompts.example.com/pricing/"
        }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://example.com/#me",
      "name": "小明",
      "url": "https://example.com/about/"
    }
  ]
}
```

会员站的付费内容：AI 爬虫只能看到未登录状态的 HTML。给每套提示词做一个公开的介绍页（标题、样图、适用场景、部分示例），付费部分放登录后。这样 AI 能引用介绍页，又不泄露付费内容（判断）。

**D. 教程文章**（日期带时区，和页面上可见的日期一致 [S39]）：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": "https://geo.example.com/guide/astro-json-ld/#article",
      "headline": "在 Astro 里给每个页面加 JSON-LD：完整代码和检查方法",
      "description": "用一个 Seo.astro 组件输出 canonical、hreflang、OG 和 JSON-LD，并用 curl 与 Rich Results Test 验证。",
      "image": "https://geo.example.com/og/astro-json-ld.png",
      "datePublished": "2026-10-02T09:00:00+08:00",
      "dateModified": "2026-11-12T21:30:00+08:00",
      "inLanguage": "zh-CN",
      "proficiencyLevel": "Beginner",
      "dependencies": "Astro 5, Node.js 20",
      "mainEntityOfPage": "https://geo.example.com/guide/astro-json-ld/",
      "author": { "@id": "https://example.com/#me" },
      "publisher": { "@id": "https://geo.example.com/#org" },
      "about": [
        { "@type": "Thing", "name": "JSON-LD" },
        { "@type": "SoftwareApplication", "name": "Astro", "sameAs": "https://astro.build/" }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://geo.example.com/" },
        { "@type": "ListItem", "position": 2, "name": "实战指南", "item": "https://geo.example.com/guide/" },
        { "@type": "ListItem", "position": 3, "name": "在 Astro 里加 JSON-LD" }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://example.com/#me",
      "name": "小明",
      "url": "https://example.com/about/",
      "jobTitle": "独立开发者",
      "sameAs": ["https://github.com/example", "https://x.com/example"]
    },
    {
      "@type": "Organization",
      "@id": "https://geo.example.com/#org",
      "name": "GEO Wiki",
      "url": "https://geo.example.com/",
      "logo": "https://geo.example.com/logo-512.png"
    }
  ]
}
```

### 4.3 SEO 组件：canonical、hreflang、OG、JSON-LD

```astro
---
// src/components/Seo.astro
interface Alternate { lang: string; path: string }
interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
  alternates?: Alternate[];       // 例：[{ lang: 'zh-Hans', path: '/guide/' }, { lang: 'en', path: '/en/guide/' }]
  markdownPath?: string;          // 有 .md 版本时传入，例：'/guide/astro-json-ld.md'
  noindex?: boolean;
}
const {
  title, description, image = '/og-default.png', type = 'website',
  jsonLd, alternates = [], markdownPath, noindex = false,
} = Astro.props;
const site = Astro.site!;
const canonical = new URL(Astro.url.pathname, site).href;
const ogImage = new URL(image, site).href;
// 防止内容里出现 </script> 截断标签
const ld = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null;
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex" />}
{alternates.map((a) => <link rel="alternate" hreflang={a.lang} href={new URL(a.path, site).href} />)}
{alternates.length > 0 && <link rel="alternate" hreflang="x-default" href={new URL(alternates[0].path, site).href} />}
{markdownPath && <link rel="alternate" type="text/markdown" href={new URL(markdownPath, site).href} />}
<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
{ld && <script type="application/ld+json" set:html={ld} />}
```

页面里用法：

```astro
---
import Seo from '../../components/Seo.astro';
const { entry } = Astro.props;
const url = new URL(`/${entry.id}/`, Astro.site).href;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: entry.data.title,
  description: entry.data.description,
  datePublished: entry.data.pubDate.toISOString(),
  dateModified: (entry.data.updated ?? entry.data.pubDate).toISOString(),
  mainEntityOfPage: url,
  author: { '@id': 'https://example.com/#me' },
};
---
<head>
  <Seo title={entry.data.title} description={entry.data.description} type="article"
       jsonLd={jsonLd} markdownPath={`/${entry.id}.md`} />
</head>
<article>
  <h1>{entry.data.title}</h1>
  <p>最后更新：<time datetime={(entry.data.updated ?? entry.data.pubDate).toISOString()}>
    {(entry.data.updated ?? entry.data.pubDate).toISOString().slice(0, 10)}</time></p>
  <slot />
</article>
```

### 4.4 sitemap：真实的 lastmod 和 hreflang

`@astrojs/sitemap`（文档版本 v3.7.5）需要配 `site`；生成 `sitemap-index.xml` 和 `sitemap-0.xml`；`serialize()` 可以逐条改或删除条目；`i18n` 生成多语言互指 [S55]。`astro.config.mjs` 里不能调用 `getCollection`，所以用一个小函数直接读 frontmatter：

```js
// scripts/lastmod.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function buildLastmodMap(site, dir = 'src/content/docs') {
  const map = new Map();
  for (const file of readdirSync(dir, { recursive: true })) {
    if (!/\.mdx?$/.test(file)) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const pick = (key) => fm[1].match(new RegExp(`^${key}:\\s*["']?([0-9][0-9TZ:+.\\-]*)`, 'm'))?.[1];
    const date = pick('updated') ?? pick('pubDate');
    if (!date) continue;
    const slug = file.replace(/\\/g, '/').replace(/(\/index)?\.mdx?$/, '');
    map.set(new URL(`/${slug}/`, site).href, new Date(date).toISOString());
  }
  return map;
}
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { buildLastmodMap } from './scripts/lastmod.mjs';

const SITE = 'https://geo.example.com';
const lastmod = buildLastmodMap(SITE);

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/drafts/'),
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en-US' } },
      serialize(item) {
        const date = lastmod.get(item.url);
        if (date) item.lastmod = date;
        return item;
      },
    }),
  ],
});
```

slug 到 URL 的映射要按你的路由规则改（例如 `en/` 子目录、`index.md`）。不要设全局 `lastmod`。

### 4.5 robots.txt 与 llms.txt 端点

```ts
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    'Disallow: /drafts/',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', site).href}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

```ts
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const docs = (await getCollection('docs', ({ data }) => !data.draft))
    .sort((a, b) => a.id.localeCompare(b.id));
  const lines = [
    '# GEO Wiki',
    '',
    '> 面向独立开发者的开源 GEO（生成式引擎优化）知识库：如何让你的插件、开源项目、网站被 ChatGPT、Perplexity、Google AI Overviews、豆包等 AI 回答提到和引用。',
    '',
    '## Docs',
    '',
    ...docs.map((d) => `- [${d.data.title}](${new URL(`/${d.id}.md`, site).href}): ${d.data.description}`),
    '',
    '## Optional',
    '',
    `- [全部内容合集](${new URL('/llms-full.txt', site).href})`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

```ts
// src/pages/llms-full.txt.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  const parts = docs.map((d) =>
    `# ${d.data.title}\n\n来源：${new URL(`/${d.id}/`, site).href}\n\n${d.body ?? ''}`);
  return new Response(parts.join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

Starlight 站点可以直接用 `starlight-llms-txt` 插件，它会生成 llms.txt、llms-full.txt、llms-small.txt [S56]。

### 4.6 页面的 `.md` 版本和内容协商

`.md` 版本（构建时生成，`entry.body` 是原始 Markdown；MDX 里的 import 和组件会原样带出，需要的话自己过滤）：

```ts
// src/pages/[...slug].md.ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = ({ props, site }) => {
  const { entry } = props as { entry: CollectionEntry<'docs'> };
  const updated = (entry.data.updated ?? entry.data.pubDate).toISOString().slice(0, 10);
  const header = `# ${entry.data.title}\n\n> ${entry.data.description}\n\n原文：${new URL(`/${entry.id}/`, site).href}\n最后更新：${updated}\n\n`;
  return new Response(header + (entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
```

内容协商有两种做法：

- **Pro 及以上套餐：** 打开 Cloudflare Markdown for Agents，零代码 [S23]。记得源站自己设 `Content-Signal` 头，否则 Cloudflare 默认写 `ai-train=yes`。
- **免费套餐：** 加一个很小的 Worker，按 `Accept` 头返回同路径的 `.md`。这是标准的 HTTP 内容协商，不是按 UA 判断，不属于 cloaking [S4]。下面的代码用模拟的 ASSETS 跑过：带 `Accept: text/markdown` 的请求拿到 Markdown，普通请求拿到 HTML，两者都带 `Vary: Accept`。

```js
// worker/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get('accept') ?? '';
    const isPage = !/\.[a-z0-9]+$/i.test(url.pathname);

    if (request.method === 'GET' && isPage && accept.includes('text/markdown')) {
      const mdPath = url.pathname === '/' ? '/index.md' : `${url.pathname.replace(/\/$/, '')}.md`;
      const md = await env.ASSETS.fetch(new URL(mdPath, url.origin).href);
      if (md.ok) {
        const headers = new Headers(md.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        headers.set('Link', `<${url.origin}${url.pathname}>; rel="canonical"`);
        return new Response(md.body, { status: 200, headers });
      }
    }

    const res = await env.ASSETS.fetch(request);
    if (!isPage) return res;
    const out = new Response(res.body, res);
    out.headers.append('Vary', 'Accept');
    return out;
  },
};
```

```jsonc
// wrangler.jsonc（带内容协商）
{
  "name": "geo-wiki",
  "main": "./worker/index.js",
  "compatibility_date": "2026-11-01",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    "run_worker_first": true
  }
}
```

`run_worker_first` 让每个请求先进 Worker，这会计入 Workers 请求数（免费版有日配额），字段名和计费方式以 Cloudflare 当前文档为准，本稿没有打开对应文档核对。Markdown 响应带了 `Link: rel="canonical"` 指回 HTML，避免被当成重复内容。

### 4.7 部署后推送 IndexNow（和百度）

1. 生成一个 32 位的 key：`openssl rand -hex 16`。
2. 放一个文件 `public/<key>.txt`，内容就是这个 key [S48]。
3. 部署后运行下面的脚本：它读 `dist/sitemap-*.xml`，只提交 `lastmod` 在最近 N 天内的 URL（依赖 4.4 的真实 `lastmod`）。

```js
// scripts/indexnow.mjs
import { readFileSync, readdirSync } from 'node:fs';

const SITE = process.env.SITE_URL ?? 'https://geo.example.com';
const KEY = process.env.INDEXNOW_KEY;
const DAYS = Number(process.env.INDEXNOW_DAYS ?? 2);
const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;

if (!KEY) {
  console.error('INDEXNOW_KEY is not set');
  process.exit(1);
}

const urls = [];
for (const file of readdirSync('dist').filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
  const xml = readFileSync(`dist/${file}`, 'utf8');
  for (const block of xml.split('<url>').slice(1)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (loc && lastmod && Date.parse(lastmod) >= since) urls.push(loc);
  }
}

if (urls.length === 0) {
  console.log(`IndexNow: no URL with lastmod in the last ${DAYS} days`);
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls.slice(0, 10000),
  }),
});
console.log(`IndexNow: submitted ${urls.length} URLs, HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
```

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "astro build && wrangler deploy && node scripts/indexnow.mjs"
  }
}
```

百度推送（站点需先在百度搜索资源平台验证，token 在普通收录页面拿；只推新链接，不要重复推旧链接 [S50]）：

```bash
node -e "
const fs=require('fs');const since=Date.now()-2*864e5;const out=[];
for(const f of fs.readdirSync('dist').filter(f=>/^sitemap-\d+\.xml$/.test(f)))
  for(const b of fs.readFileSync('dist/'+f,'utf8').split('<url>').slice(1)){
    const l=b.match(/<loc>([^<]+)<\/loc>/)?.[1], m=b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if(l&&m&&Date.parse(m)>=since) out.push(l);
  }
fs.writeFileSync('urls.txt', out.join('\n'));"
curl -H 'Content-Type:text/plain' --data-binary @urls.txt \
  "http://data.zz.baidu.com/urls?site=https://geo.example.com&token=$BAIDU_TOKEN"
```

不想写代码：在 Cloudflare 的 Caching 下 Configuration 里打开 Crawler Hints [S25]（对 Workers 静态资源是否生效未查清）。

---

## 5. 结合 AI 怎么做

### 5.1 适合交给 AI 的活

| 活 | 为什么适合 | 你要做的检查 |
|---|---|---|
| 根据商店页、README 生成 JSON-LD | 字段映射是机械活 | 每个值都能在可见页面上找到；跑 Rich Results Test |
| 改写 Chrome 商店摘要、GitHub About、npm description | 字数限制明确，需要多版本对比 | 不夸大、不写「第一」「最好」[S52] |
| 把教程改成答案先行的结构 | 结构调整，内容不变 | 事实没被改动 |
| 写 Astro 组件、端点、IndexNow 脚本 | 照着本稿 4.x 做 | 构建后用 3.6 的命令验证 |
| 分析访问日志里的 AI 爬虫 | 正则和统计 | 抽查几条，验证 IP |
| 审计原始 HTML | 把 curl 结果交给 AI 读 | AI 只能看到你给它的内容 |

### 5.2 提示词

**提示词 1：从商店页生成 JSON-LD**

```text
下面是我的 Chrome 插件在商店的标题、摘要、完整描述、版本号、更新日期，以及我的 GitHub 地址和官网落地页的可见文字。
请为官网落地页生成一段 schema.org JSON-LD，要求：
1. 用 @graph，包含一个 SoftwareApplication 和一个 Person，用 @id 互相引用。
2. applicationCategory 用 "BrowserApplication"，offers.price 免费填 "0"。
3. 只使用我提供的材料里出现的事实，材料里没有的字段不要写，不要编造评分、评论数、用户数。
4. 不要写 aggregateRating。
5. sameAs 放商店链接、GitHub、Product Hunt（如果我提供了）。
6. 输出纯 JSON，不加注释，最后单独列出你没能填的推荐字段，告诉我应该去哪找。

材料：
<粘贴>
```

**提示词 2：审计原始 HTML 是否适合被 AI 引用**

```text
下面是用 curl 抓到的页面原始 HTML（没有执行 JavaScript，这就是 ChatGPT、Claude、Perplexity 看到的样子）。
请检查并按严重程度列出问题：
1. 用户最可能问的 3 个问题，它们的答案是否出现在可见文字里？如果只出现在 script、JSON 或需要 JS 才加载的部分，指出来。
2. h1 到 h3 的层级是否连续，标题是否是完整的问题或结论句。
3. 每个 h2 下第一段是否直接给出答案。
4. 参数、对比、价格是否用了 <table>。
5. 是否有可见的更新日期和作者信息，是否和 JSON-LD 里的 dateModified、author 一致。
6. canonical、hreflang 是否自洽。
对每个问题给出具体的修改建议（给出改后的 HTML 片段）。不要建议添加 llms.txt 以外的“AI 专用 meta 标签”。

HTML：
<粘贴 curl 输出>
```

**提示词 3：改写商店摘要**

```text
我的 Chrome 插件：<一句话说明>。目标用户：<谁>。和同类插件的主要区别：<1 到 2 点>。
请写 5 个 Chrome Web Store 摘要候选，每个不超过 132 个字符（中文版和英文版各 5 个）。
要求：说清楚做什么、给谁用、关键区别；不堆关键词，不写“最好”“第一”“Editor's Choice”之类的说法。
每个候选后面标出字符数。
```

**提示词 4：让编程 Agent 给 Astro 站加技术 GEO**

```text
这是一个 Astro 5 静态站，部署在 Cloudflare Workers 静态资源上，内容在 src/content/docs。
请按下面的要求修改，每完成一项就运行 `npm run build` 并用 curl 检查 dist 里的产物：
1. 新建 src/components/Seo.astro，输出 title、description、canonical（基于 Astro.site 和 pathname）、hreflang（含 x-default）、OG 标签、JSON-LD（JSON.stringify 后把 < 替换成 <）。
2. @astrojs/sitemap 的 serialize 里按 frontmatter 的 updated（没有则用 pubDate）设置 lastmod，不要设全局 lastmod。
3. 新增 src/pages/robots.txt.ts、llms.txt.ts、llms-full.txt.ts、[...slug].md.ts。
4. 新增 scripts/indexnow.mjs：读取 dist/sitemap-*.xml，只提交最近 2 天 lastmod 的 URL 到 https://api.indexnow.org/indexnow。
5. 不要启动开发服务器；如果必须启动，结束前关掉并确认端口释放。
完成后列出改动的文件和每项的检查命令及输出。
```

**提示词 5：分析访问日志**

```text
下面是我的服务器访问日志片段（combined 格式）。请写一个 Python 脚本：
1. 按 UA 把请求分到这些组：OpenAI（GPTBot、OAI-SearchBot、ChatGPT-User）、Anthropic（ClaudeBot、Claude-SearchBot、Claude-User）、Perplexity（PerplexityBot、Perplexity-User）、搜索引擎（Googlebot、Bingbot）、其他 AI、普通访客。
2. 统计每组的请求数、状态码分布、最常访问的 20 个路径、404 最多的路径。
3. 对 OpenAI 和 Perplexity 的请求，用它们官方公布的 IP 列表 JSON 验证 IP 是否真实，输出疑似伪造的数量。
4. 单独统计 /llms.txt、*.md 和带 Accept: text/markdown 的请求（如果日志里有 Accept 字段）。
只用标准库。
```

### 5.3 不要交给 AI 的活

- 决定 Cloudflare 里 Training / Search / Agent 怎么设：这是你对内容使用的取舍。
- 编造评价、评分、用户数、作者经历：违反 Google 的可信度要求 [S40]，也可能违反商店政策 [S52]。
- 批量生成大量「AI 专用」页面：没有证据有用 [S4]。

---

## 6. 误区和争议

1. **「加了 llms.txt，ChatGPT 就会引用你。」** 没有证据。97% 的 llms.txt 一个月零请求，AI 检索爬虫占 1.1% [S30]；Google 说搜索不用它 [S11][S13]。它对编程 Agent 有用 [S3]。
2. **「Schema 是 GEO 的核心。」** 唯一的大样本对照研究显示对 ChatGPT 和 AI Mode 没有可测效果 [S32]；实时抓取不读 JSON-LD [S33]。流传的「FAQ schema 提升 112%」「AIO 引用增长 1,500%」都来自无对照的前后对比，Ahrefs 专门指出这种比较不可靠 [S32]。
3. **「FAQPage 和 HowTo 还能拿富结果。」** FAQ 富结果 2026-05-07 全部下线 [S35]，HowTo 2023 年就没了。旧教程要更新。
4. **「屏蔽 GPTBot 就不会出现在 ChatGPT 里。」** 不对。ChatGPT 搜索看 OAI-SearchBot [S5][S6]。反过来，只放行 GPTBot 也不能进 ChatGPT 搜索。
5. **「屏蔽 Google-Extended 就能退出 AI Overviews。」** 不对。Google-Extended 不影响 Google 搜索 [S9]；限制 AI Overviews 里的展示要用 `nosnippet` 等 [S10]。
6. **「按 UA 给 AI 爬虫返回 Markdown 或精简页。」** 这是 cloaking 风险 [S4]。用 `Accept` 头协商。
7. **「AI 爬虫现在会跑 JavaScript 了。」** 部分对：Copilot、Grok、DeepSeek 的用户抓取会执行 JS，但等待时间很短 [S2]；ChatGPT、Claude、Perplexity 仍然不执行 [S1][S2]。网上有 2026 年的帖子声称 ChatGPT 爬虫开始执行 JS，本稿没能打开原文核实，也没有找到 OpenAI 或 Vercel 的更新数据。
8. **「Cloudflare 免费版默认对 AI 开放。」** 2025-07 以后新域名默认屏蔽 [S14]；2026-09-15 以后新域名的默认是在有广告的页面屏蔽 Training 和 Agent [S18]。老域名可能处于任何状态，必须自己看。
9. **「ChatGPT 搜索就是 Bing。」** 过度简化。Bing 是提供方之一 [S69]，但厂商研究称还有自有索引和多个外部来源 [S62]，OpenAI 没有公布比例。注册 Bing Webmaster Tools 值得做，但不能保证进 ChatGPT。
10. **「Content Signals 能阻止 AI 使用你的内容。」** 它是自愿信号，Cloudflare 自己也承认有人会无视 [S16]。真正的控制只有 WAF 屏蔽或付费墙。
11. **Lighthouse 的 Agentic Browsing 分数和 Cloudflare Agent Readiness 分数**：它们是诊断清单，不是排名因素；SEJ 的评论也是这个意思 [S24]。分数低不代表 AI 不引用你。
12. **「每次构建更新所有 lastmod 能显得新。」** Bing 明确反对 [S43]，Google 只在 lastmod 持续准确时才用 [S42]。乱写会让搜索引擎不再信任你的 lastmod。

---

## 7. 还没查清的问题

1. **豆包、DeepSeek、Kimi、元宝、通义的联网搜索用谁的索引、爬虫叫什么、是否遵守 robots.txt。** 没有找到任何官方文档。DeepSeek 的用户抓取会执行 JS [S2]，其他不知道。这对中文用户很关键，需要专门的中文调研。
2. **Cloudflare Crawler Hints 对 Workers 静态资源是否生效**（它依赖缓存 MISS 信号 [S25]）。
3. **Cloudflare「屏蔽 Training」对 Googlebot、Bingbot 的实际影响。** 官方说多用途爬虫受影响 [S18]，行业报道说会被挡 [S19]，没有找到 Cloudflare 列出哪些爬虫被归为多用途的官方清单。
4. **Cloudflare 免费版里 AI Crawl Control 的 Robots.txt 违规数据是否可用**，以及「Block AI bots」与「Allow verified bots」的优先级（只看到搜索摘要）。
5. **`.md` 版本是否该加 `X-Robots-Tag: noindex`。** 加了避免重复内容，但可能让某些 AI 检索系统不收录 Markdown 版本。没有找到任何一方的证据，本稿的 Worker 用 `Link: rel="canonical"` 折中。
6. **Google 评论摘要指南对「在自己站上标注第三方商店评分」的确切规定**，本稿没有打开原文核对。
7. **App Store / Google Play 上架页被 AI 读取和引用的情况**，没有找到 2025 到 2026 年的研究。
8. **npmjs.com、producthunt.com 对真实 AI 爬虫是否放行。** 本机 curl 一律被质询 [S65]，无法区分是针对伪造 UA 还是针对所有自动化客户端。
9. **ChatGPT 搜索里 Bing 的比重**，OpenAI 没公布 [S62][S69]。
10. **训练爬虫（GPTBot、ClaudeBot）放行与否对「模型凭记忆推荐你的产品」的影响**，没有找到实验。
11. **Lighthouse Agentic Browsing 是实验功能还是默认开启**，二手来源互相矛盾 [S64]。
12. **百度收录是否要求 ICP 备案、海外服务器上的中文站在百度的收录情况**，本稿没有查。
13. **WebMCP 的 API 名称和 origin trial 时间表**只来自二手资料 [S59]。
14. **Google 2026 年 AI 优化指南的确切发布和修订日期**（二手报道说 2026-05-15 发布、2026-06-15 修订 [S12]，官方页面没有显示日期）。

---

## 8. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | The rise of the AI crawler | Vercel / MERJ | 2024-12-17 | https://vercel.com/blog/the-rise-of-the-ai-crawler | 平台网络数据 | B | 一个月数亿次抓取：主流 AI 爬虫不执行 JS，只有 Gemini（Googlebot）和 AppleBot 渲染；ChatGPT 34.82% 抓取打到 404 |
| S2 | AI Search crawler test results（GEO LLM crawler report） | RESONEO | 2026-01 | https://think.resoneo.com/sentinel/geo-llm-crawler-report.html | 可复现测试 | C | 用户实时抓取：Copilot、Grok、DeepSeek 执行 JS，ChatGPT、Claude、Gemini、Perplexity 不执行；AI Mode 不实时抓取 |
| S3 | Which AI actually reads your site? Two months of LLM traffic, measured | Evil Martians | 2026（9 到 10 月数据） | https://evilmartians.com/chronicles/which-ai-actually-reads-your-site-two-months-of-llm-traffic-measured | 单站服务端日志 | C | Claude Code 88% 拿 Markdown，ChatGPT-User 0.7%；llms.txt 593 次请求里有名 AI 助手只有 47 次 |
| S4 | Making your site visible to LLMs: 6 techniques that work, 8 that don't | Evil Martians | 2026-11-04 | https://evilmartians.com/chronicles/how-to-make-your-website-visible-to-llms | 从业者总结 | C | 有效：服务端 HTML、.md、Accept 协商；无效：AI meta 标签、ai.txt、UA 嗅探（cloaking）、隐藏提示 |
| S5 | Overview of OpenAI Crawlers | OpenAI | 未标日期（2026-11 访问） | https://developers.openai.com/api/docs/bots | 官方文档 | A | OAI-SearchBot 管搜索，GPTBot 管训练，ChatGPT-User 可能不遵守 robots.txt；各自 IP 列表 |
| S6 | Publishers and Developers FAQ | OpenAI | 未标日期（2026-11 访问） | https://help.openai.com/en/articles/12627856-publishers-and-developers-faq | 官方文档 | A | 不挡 OAI-SearchBot 才能进摘要；用 noindex 退出；utm_source=chatgpt.com；Atlas 依赖 ARIA |
| S7 | Does Anthropic crawl data from the web, and how can site owners block the crawler? | Anthropic | 2026（含 2026-10-30 更新） | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | 官方文档 | A | ClaudeBot / Claude-SearchBot / Claude-User 三分；遵守 robots.txt 和 Crawl-delay；支持 aipref 信号 |
| S8 | Perplexity Crawlers | Perplexity | 未标日期（2026-11 访问） | https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md | 官方文档 | A | PerplexityBot 管搜索不训练；Perplexity-User 通常忽略 robots.txt；Cloudflare Bot Fight Mode 无法用规则绕过 |
| S9 | Google's common crawlers | Google | 未标日期（2026-11 访问） | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | 官方文档 | A | Google-Extended 只是标记，管 Gemini 训练和 grounding，不影响 Google 搜索收录和排名 |
| S10 | AI features and your website | Google Search Central | 未标日期（2026-11 访问） | https://developers.google.com/search/docs/appearance/ai-features | 官方文档 | A | AI Overviews 无额外技术要求；用 nosnippet 等控制展示；结构化数据须与可见文字一致 |
| S11 | AI optimization guide（generative AI search） | Google Search Central | 2026（据报道 05-15 发布，06-15 修订） | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | 官方文档 | A | 不需要 llms.txt、AI 文件、特殊标记、切块；不需要结构化数据；Google 能处理 JS |
| S12 | Google's llms.txt guidance depends on which product you ask | Search Engine Journal | 2026 | https://www.searchenginejournal.com/googles-llms-txt-guidance-depends-on-which-product-you-ask | 行业媒体 | C | Google 指南修订后限定在 Google 搜索；Chrome Lighthouse 却在检查 llms.txt |
| S13 | Google says llms.txt comparable to keywords meta tag | Search Engine Journal | 2025 | https://www.searchenginejournal.com/google-says-llms-txt-comparable-to-keywords-meta-tag | 行业媒体转述官方发言 | C | Mueller 把 llms.txt 比作 keywords meta 标签 |
| S14 | Cloudflare Just Changed How AI Crawlers Scrape the Internet-at-Large | Cloudflare | 2025-07-01 | https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/ | 官方新闻稿 | A | 新域名默认屏蔽 AI 爬虫；已有 100 万以上客户开了一键屏蔽 |
| S15 | Introducing pay per crawl | Cloudflare | 2025-07-01 | https://blog.cloudflare.com/introducing-pay-per-crawl/ | 官方博客 | A | 402 加 crawler-price 头；Web Bot Auth；Allow / Charge / Block；私测 |
| S16 | Giving users choice with Cloudflare's new Content Signals Policy | Cloudflare | 2025-09 | https://blog.cloudflare.com/content-signals-policy/ | 官方博客 | A | search / ai-input / ai-train 三个信号，留空不等于同意，自愿遵守 |
| S17 | Managed robots.txt | Cloudflare | 2026（2026-11 访问） | https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/ | 官方文档 | A | 托管内容：search=yes, ai-train=no, use=reference，并禁止 GPTBot、ClaudeBot、Google-Extended 等 |
| S18 | New options to manage AI traffic | Cloudflare | 2026-07-01 | https://developers.cloudflare.com/changelog/post/2026-07-01-ai-traffic-options/ | 官方更新日志 | A | Search / Agent / Training 分类；2026-09-15 起新域名在广告页默认屏蔽 Training 和 Agent |
| S19 | Cloudflare changes AI crawler access rules | Help Net Security | 2026-07-02 | https://www.helpnetsecurity.com/2026/07/02/cloudflare-ai-crawler-controls/ | 行业媒体 | C | 屏蔽 Training 会波及 Googlebot、Applebot、BingBot 等多用途爬虫 |
| S20 | AI Crawl Control | Cloudflare | 2026-11 访问 | https://developers.cloudflare.com/ai-crawl-control/ | 官方文档 | A | 所有套餐可用：按爬虫允许或屏蔽、流量分析、robots.txt 追踪、Pay per crawl |
| S21 | New Robots.txt tab for tracking crawler compliance | Cloudflare | 2025-10-21 | https://developers.cloudflare.com/changelog/2025-10-21-track-robots-txt/ | 官方更新日志 | A | 显示违反 robots.txt 的爬虫、路径和次数 |
| S22 | Verified bot categories | Cloudflare | 2026-11 访问 | https://developers.cloudflare.com/bots/reference/verified-bot-categories | 官方文档 | A | 旧分类 AI Assistant / AI Crawler / AI Search，新分类 Search / Agent / Training |
| S23 | Markdown for Agents | Cloudflare | 2026-02-12 | https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/ | 官方文档 | A | Pro 及以上免费；Accept: text/markdown 时转换 HTML；默认加 Content-Signal 全 yes；6 MiB 上限 |
| S24 | Introducing the Agent Readiness score. Is your site agent-ready? | Cloudflare | 2026-04-17（07-15 修订） | https://blog.cloudflare.com/agent-readiness/ | 官方博客加扫描数据 | A | 四维度检查项；约 20 万域名：robots.txt 78%、Content Signals 4%、Markdown 协商 3.9%、MCP Card 不到 15 站 |
| S25 | Crawler Hints | Cloudflare | 2026-11 访问 | https://developers.cloudflare.com/cache/about/crawler-hints/ | 官方文档 | A | 缓存 MISS 时发 IndexNow，所有套餐可用，>4xx 不上报 |
| S26 | Astro（Workers framework guide） | Cloudflare | 2026-11 访问 | https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/ | 官方文档 | A | 静态 Astro 不需要适配器，assets.directory 指向 dist，not_found_handling 404-page |
| S27 | Headers（Workers static assets） | Cloudflare | 2026-11 访问 | https://developers.cloudflare.com/workers/static-assets/headers/ | 官方文档 | A | _headers 只作用于静态资源，最多 100 条规则 |
| S28 | The crawl before the fall… of referrals | Cloudflare | 2025-07 | https://blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar | 官方博客 | B | Radar 上线抓取与引荐比；Anthropic 的比值可能因缺 Referer 被高估（据搜索摘要） |
| S29 | The /llms.txt file | llmstxt.org（Jeremy Howard） | 2024-09-03（2026-08-10 v2） | https://llmstxt.org/ | 提案规范 | A | 只有 H1 必需；H2 链接列表；Optional 区；.md 页面约定 |
| S30 | We Analyzed 137K Sites: 97% of llms.txt Files Never Get Read | Ahrefs | 2026-06-15 | https://ahrefs.com/blog/llmstxt-study/ | 大样本日志研究 | B | 137,210 域名，28% 有 llms.txt，97% 零请求，AI 检索爬虫只占 1.1% |
| S31 | How often do LLMs visit llms.txt? | Mintlify | 2025-06 | https://mintlify.com/blog/how-often-do-llms-visit-llms-txt | 厂商数据 | C | 25 家公司 7 天：llms-full.txt 中位 79 次，llms.txt 中位 14 次（利益相关） |
| S32 | We Tracked 1,885 Pages Adding Schema. AI Citations Barely Moved. | Ahrefs | 2026-05-11 | https://ahrefs.com/blog/schema-ai-citations/ | 大样本双重差分 | B | ChatGPT +2.2%、AI Mode +2.4%（不显著），AIO -4.6% |
| S33 | Schema Markup and AI in 2025: What ChatGPT, Claude, Perplexity & Gemini Really See | searchVIU | 2025-10 | https://www.searchviu.com/en/?p=8563 | 小规模实验 | C | 实时抓取只读可见 HTML，忽略 JSON-LD 等 |
| S34 | Microsoft Bing/Copilot use schema for its LLMs | Search Engine Land | 2025-03 | https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455 | 行业媒体转述官方发言 | C | Fabrice Canel 在 SMX Munich 说 schema 帮助微软 LLM 理解内容 |
| S35 | FAQPage structured data（含弃用记录） | Google Search Central | 2026-05-08 / 2026-06-15 | https://developers.google.com/search/docs/appearance/structured-data/faqpage | 官方文档 | A | FAQ 富结果自 2026-05-07 起不再显示，文档于 06-15 删除 |
| S36 | Simplifying the search results page | Google Search Central Blog | 2025-06-12 | https://developers.google.com/search/blog/2025/06/simplifying-search-results | 官方博客 | A | 停止 7 类结构化数据功能，不影响排名 |
| S37 | Here's an update on our efforts to simplify the search results page | Google Search Central Blog | 2025-11 | https://developers.google.com/search/blog/2025/11/update-on-our-efforts | 官方博客 | A | Practice Problems 弃用，Dataset 只留在 Dataset Search |
| S38 | Software app (SoftwareApplication) structured data | Google Search Central | 2026-11 访问 | https://developers.google.com/search/docs/appearance/structured-data/software-app | 官方文档 | A | 必需 name、offers.price、评分或评论；applicationCategory 可选 BrowserApplication 等 |
| S39 | Influence your byline dates | Google Search Central | 2026-11 访问 | https://developers.google.com/search/docs/appearance/publication-dates | 官方文档 | A | 可见日期与结构化日期一致，时区正确，不写未来日期 |
| S40 | Creating helpful, reliable, people-first content | Google Search Central | 2026-11 访问 | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | 官方文档 | A | E-E-A-T 中可信最重要，不是单一排名因素；鼓励准确的作者署名 |
| S41 | Tell Google about localized versions of your page | Google Search Central | 2026-11 访问 | https://developers.google.com/search/docs/specialty/international/localized-versions | 官方文档 | A | hreflang 三种写法，自指、双向、x-default |
| S42 | Build and submit a sitemap | Google Search Central | 2026-11 访问 | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap | 官方文档 | A | lastmod 准确才用，忽略 priority 和 changefreq，50MB / 5 万 URL |
| S43 | Keeping Content Discoverable with Sitemaps in AI Powered Search | Bing Webmaster Blog | 2025-07 | https://blogs.bing.com/webmaster/July-2025/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search | 官方博客 | A | lastmod 用 ISO 8601 带时间，不要用生成时间；新鲜度影响 AI 答案 |
| S44 | The Importance of Setting the "lastmod" Tag in Your Sitemap | Bing Webmaster Blog | 2023-02 | https://blogs.bing.com/webmaster/february-2023/The-Importance-of-Setting-the-lastmod-Tag-in-Your-Sitemap | 官方博客 | A | lastmod 是 sitemap 最关键的标签之一 |
| S45 | Introducing AI Performance in Bing Webmaster Tools Public Preview | Bing Webmaster Blog | 2026-02-10 | https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/ | 官方博客 | A | Copilot 等引用次数、grounding 查询、页面级引用；建议 IndexNow、标题、表格 |
| S46 | New AI Visibility Insights in Bing Webmaster Tools | Bing Search Blog | 2026-06-16 | https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/ | 官方博客 | A | 新增 Intents、Topics、Citation Share、Compare |
| S47 | Elevating the Role of Grounding on the AI Web | Bing Search Blog（Jordi Ribas） | 2026-02-12 | https://blogs.bing.com/search/2026/2/Elevating-the-Role-of-Grounding-on-the-AI-Web/ | 官方博客 | A | 「Microsoft grounding 为几乎每个主流 AI 助手供数」（自家说法） |
| S48 | IndexNow Documentation | IndexNow.org | 2026-11 访问 | https://www.indexnow.org/documentation | 协议文档 | A | GET / POST 格式，每次 1 万 URL，key 文件，返回码含义 |
| S49 | Documentation for search engines | IndexNow.org | 2026-11 访问 | https://indexnow.org/searchengines | 协议文档 | A | 参与方必须共享收到的 URL |
| S50 | 普通收录 工具说明 | 百度搜索资源平台 | 2026-11 访问 | https://ziyuan.baidu.com/college/courseinfo?id=267&page=2 | 官方文档 | A | API 推送最快，每次 2,000 条，配额浮动，不保证收录 |
| S51 | 微信小程序 sitemap 站内搜索 | 掘金（愚公系列） | 2022-04 | https://juejin.cn/post/7081898307189997604 | 开发者教程（转述官方文档） | C | sitemap.json 控制微信索引，默认全允许，规则字段 action / page / params / matching / priority |
| S52 | Creating a great listing page | Chrome for Developers | 2026-11 访问 | https://developer.chrome.com/docs/webstore/best_listing | 官方文档 | A | 摘要 132 字符，描述用概述加功能列表，排名看评分和使用数据，堆关键词会被下架 |
| S53 | Classifying your repository with topics | GitHub Docs | 2026-11 访问 | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics | 官方文档 | A | Topics 小写字母数字短横线，每个 50 字符内，最多 20 个 |
| S54 | package.json | npm Docs | 2026-11 访问 | https://docs.npmjs.com/cli/v11/configuring-npm/package-json | 官方文档 | A | description 和 keywords 帮助在 npm search 中被发现 |
| S55 | @astrojs/sitemap | Astro Docs | 2026-11 访问（v3.7.5） | https://docs.astro.build/en/guides/integrations-guide/sitemap/ | 官方文档 | A | filter、serialize、i18n、entryLimit 等选项，输出 sitemap-index.xml |
| S56 | starlight-llms-txt | Chris Swithinbank（插件作者） | 2026-11 访问 | https://delucis.github.io/starlight-llms-txt/getting-started | 工具文档 | A | Starlight 插件生成 llms.txt、llms-full.txt、llms-small.txt |
| S57 | New Study: AI Assistants Prefer to Cite "Fresher" Content (17 Million Citations Analyzed) | Ahrefs | 2025-07-28（08-26 修订） | https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/ | 大样本研究 | B | 1,697.5 万引用 URL：AI 助手引用比自然结果新 25.7%，AIO 例外 |
| S58 | GEO: Generative Engine Optimization | Aggarwal 等，KDD 2024 | 2023-11（2024-06 修订） | https://arxiv.org/abs/2311.09735 | 同行评审论文 | A | GEO 方法可让可见度最多提升约 40% |
| S59 | WebMCP Imperative API | Chrome for Developers | 2026 | https://developer.chrome.com/docs/ai/webmcp/imperative-api | 官方文档（只看到搜索摘要） | A | 网页向 Agent 暴露工具；origin trial 细节来自二手资料 |
| S60 | OpenAI, ARIA, and SEO: Making the Web Worse | Adrian Roselli | 2025-10 | https://adrianroselli.com/2025/10/openai-aria-and-seo-making-the-web-worse.html | 专家观点 | D | 批评为 AI 滥用 ARIA，主张先用原生语义 |
| S61 | NLWeb endpoint（agentic readiness docs） | Lumar | 2026 | https://agentic-readiness.lumar.io/docs/capabilities/nl-web | 工具厂商文档 | C | NLWeb 只有两个生产案例，官方证书曾过期 |
| S62 | ChatGPT search result providers | Peec AI | 2026-09 | https://docs.peec.ai/research/chatgpt-search-result-providers | 厂商研究 | C | ChatGPT 搜索结果来自自有索引加至少 8 个外部提供方（利益相关） |
| S63 | Inside Bing's New AI Performance Report: What 20,000 Copilot Citations Taught Us | Search Influence | 2026 | https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/ | 从业者案例 | C | 86 个页面 19,717 次 Copilot 引用，无点击数据 |
| S64 | Google adds agentic browsing category to Lighthouse | Semrush Blog | 2026 | https://www.semrush.com/blog/google-adds-agentic-browsing-category-to-lighthouse/ | 行业文章 | C | Lighthouse 新类别检查 WebMCP、可访问性树、CLS、llms.txt；状态说法不一 |
| S65 | 本稿实测：用 curl 抓取 Chrome Web Store、GitHub、npm、Product Hunt 页面和 robots.txt | 本稿 | 2026-11-14 | 无（命令见 3.6） | 小规模实测 | C | CWS 服务端渲染、摘要即 meta description、评论页禁抓；GitHub 对 AI 爬虫 Crawl-delay 1、禁 Bytespider；npm 和 PH 对 curl 返回质询 |
| S66 | Case study: How Product Hunt can improve AI visibility in 2026 | Product Hunt（Andrew Stewart） | 2026 | https://www.producthunt.com/p/producthunt/case-study-how-product-hunt-can-improve-ai-visibility-in-2026 | 平台自述案例 | D | 称 PH 贡献 Wispr Flow 约 32% 的 ChatGPT 可见度（单一品牌，利益相关） |
| S67 | MCP Registry: Standardizing Server Discovery | Glama | 2025-07-05 | https://glama.ai/blog/2025-07-05-mcp-registry-standardizing-server-discovery | 第三方介绍 | C | 官方 MCP 注册表用 server.json 元数据，包另发 npm/PyPI |
| S68 | ByteDance's Bytespider scraper bot | Fortune | 2024-10-03 | https://fortune.com/2024/10/03/bytedance-tiktok-bytespider-scraper-bot/ | 媒体报道 | C | 报道称 Bytespider 不遵守 robots.txt（2024 年，可能已变化） |
| S69 | ChatGPT search（帮助中心） | OpenAI | 未知（只见转述） | https://help.openai.com/en/articles/9237897-chatgpt-search | 官方文档（未直接打开） | A | 据转述：第三方搜索提供方包括 Bing（和 Shopify），企业和教育版只用 Bing |
