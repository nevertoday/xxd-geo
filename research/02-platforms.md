# 02 各 AI 回答平台怎么找来源、选来源、标引用（截至 2026-11-14）

> 调研范围：全球与中文主要 AI 回答平台的检索后端、爬虫与 User-Agent、robots.txt 控制、JavaScript 执行、引用展示、引用偏好、站长后台、引荐流量标识、官方文档。
> 写法遵守 `docs/research-contract.md`。每条说法后的 `[Sxx]` 对应文末出处表。没有出处的内容放进「还没查清的问题」。
> 资料获取方式：官方页面用 curl 抓取原文后阅读；部分页面只在搜索结果里出现过，出处表的类型列会注明。

---

## 1. 一段话总结

1. **2026 年下半年，"AI 爬虫三分法"已成行业通用结构**：训练爬虫（GPTBot、ClaudeBot、MistralAI-Training、meta-externalagent、Applebot-Extended / Google-Extended 这类控制令牌）、搜索索引爬虫（OAI-SearchBot、Claude-SearchBot、PerplexityBot、MistralAI-Index、meta-webindexer、DuckAssistBot）、用户触发抓取器（ChatGPT-User、Claude-User、Perplexity-User、MistralAI-User、Meta-ExternalFetcher、Google-Agent）。想被 AI 回答引用，就放行后两类。训练类可以单独关掉，各家都写明关掉训练不影响搜索展示 [S1][S25][S33][S37][S39]。用户触发类多数声明"可能不遵守 robots.txt" [S1][S33][S37]。
2. **2026-10-30 出现了跨厂商的训练退出令牌 `__usage_ai-training`**（IETF 个人草案，Anthropic 员工起草）。Anthropic 已开始执行，Microsoft 2027-02-01 起执行，Google 计划 2027 年支持，OpenAI 只说"未来几个月" [S14][S20][S25][S27][S28][S29]。它只管训练，不管抓取，也不管 AI 回答引用 [S27]。
3. **Google 有两个新开关，开发者必须知道**。一是 Search Console 里的「Search generative AI」开关（2026-08-31 全球上线），可以把整站排除出 AI Overviews、AI Mode 和 Discover 的生成式功能，默认是"包含" [S11]。二是 **Google-Extended 同时管 Gemini 训练和 Gemini Apps 的实时引用（grounding）**。屏蔽它，你就从 Gemini App 的引用里消失，但 AI Overviews 不受影响 [S14][S15]。如果你用新的 `__usage_ai-training` 退出训练，又没有单独写 Google-Extended，Google 会把它当作屏蔽了 Google-Extended [S14]。
4. **ChatGPT 不再只靠 Bing**。厂商逆向研究显示，ChatGPT 有自建索引（内部名 Labrador），同时混用抓取 Google 结果的第三方、Microsoft Web IQ、Yelp、TripAdvisor 等至少 8 个来源 [S2][S3]（利益相关的厂商研究，OpenAI 未确认）。实际意义是：放行 OAI-SearchBot 是进入 ChatGPT 搜索的前提 [S1]，Google 排名也会传导到 ChatGPT [S3]。
5. **Claude 的网页搜索后端是 Brave**（2025 年起，2026 年仍在子处理方名单上），2026-05 又加了 turbopuffer [S30][S31]。Brave 的爬虫没有独立 UA，**只抓 Googlebot 能抓的页面** [S32]。所以挡了 Googlebot 等于同时失去 Brave 和 Claude。Apple 的 Applebot 也一样：robots.txt 没写 Applebot 时照 Googlebot 的规则执行 [S38]。
6. **Microsoft 是唯一给出"AI 引用次数"后台的平台**：Bing Webmaster Tools 的 AI Performance 报告（2026-02 公测）显示 Copilot、Bing AI 摘要和部分合作方里的引用次数、被引页面、grounding 查询词，2026-10 又加了 Topics Portfolio 和"机会查询词" [S21][S22]。Google 的 Generative AI 报告只有展示次数，没有点击，AI Overviews 和 AI Mode 合并统计 [S12][S13]。OpenAI 在 2026-11 推出 ChatGPT Business Hub，第一次给出 ChatGPT 里的提及次数和点击数，目前仅限美国符合条件的电商和在线服务商家 [S5]。
7. **AI 引荐流量的归因在 2026 年 9 到 10 月集体变差**。ChatGPT 在 GPT-6 上线后（2026-10-07 起）出站链接不再带 `utm_source=chatgpt.com`，并加了 `noreferrer`，点击落到"直接访问"里 [S4]。Gemini 9 月短暂加过 `utm_source=gemini`，约 9 月 28 日又撤掉；桌面网页版仍传 referrer，iOS App 不传 [S17][S18]。只看 GA4 的 referrer，会严重低估 AI 带来的访问。
8. **多数 AI 爬虫不执行 JavaScript**。2024 年 Vercel 的大样本数据：GPTBot、ClaudeBot 抓 JS 文件但不执行，只有 Google（Gemini 用 Googlebot 基础设施）和 Applebot 渲染 [S43]。2026 年有零星报告称 GPTBot 开始渲染，没有官方确认 [S44]。静态站（Astro）和 SSR 是最稳妥的方案。
9. **中文平台主要从自家生态和国内搜索源取材，自己的官网只是来源之一**。豆包偏抖音、头条，最近更偏抖音短视频 [S48][S49]；元宝偏微信公众号、视频号，外加搜狗 [S52][S53][S54]；文心偏百度系和短视频 [S49][S50]；智谱的搜索 API 明确写了用"自研引擎 + 搜狗 / 夸克"，并说搜狗"覆盖腾讯生态和知乎内容" [S57]。Kimi 官方说能主动检索英文和日文资料 [S55]。其余平台能不能抓到海外网站，没有找到官方说明。
10. **Perplexity 和 xAI 的爬虫信誉有问题**。Cloudflare 2025-08 公开指控 Perplexity 在声明爬虫被挡后改用伪装成 Chrome 的爬虫，并轮换 IP 和 ASN [S34][S35]。Perplexity 官方文档自己写着 Perplexity-User "generally ignores robots.txt rules" [S33]。xAI 没有可靠的爬虫 UA 文档，实测抓取请求伪装成普通浏览器 [S41]。对这两家，robots.txt 不是可靠的控制手段。

---

## 2. 正文

### 2.1 先建立一个通用模型：AI 回答平台怎么拿到你的内容

各家文档的说法可以归纳成三条管道。

| 管道 | 作用 | 典型名字 | 一般是否守 robots.txt |
|---|---|---|---|
| 训练爬虫 / 训练令牌 | 收集内容训练下一代模型，和"这次回答引用谁"无关 | GPTBot、ClaudeBot、MistralAI-Training、meta-externalagent、Google-Extended（令牌）、Applebot-Extended（令牌）、`__usage_ai-training`（跨厂商令牌） | 声明遵守 [S1][S25][S39][S37][S15][S38] |
| 搜索索引爬虫 | 提前建索引，回答时从索引里检索候选来源 | OAI-SearchBot、Claude-SearchBot、PerplexityBot、MistralAI-Index、meta-webindexer、DuckAssistBot、Googlebot、Bingbot、Applebot、Baiduspider | 声明遵守 [S1][S25][S33][S39][S37][S40][S38][S46] |
| 用户触发抓取 / 代理浏览 | 用户提问或给链接时实时打开页面，或代理替用户点按钮 | ChatGPT-User、Claude-User、Perplexity-User、MistralAI-User、Meta-ExternalFetcher、Google-Agent、Claude-Agent | 多数写明"可能不适用 robots.txt" [S1][S33][S37][S16][S26] |

几条通用事实：

- 训练和搜索在大厂文档里都是互相独立的开关。OpenAI 原话是 "Each setting is independent of the others"，可以允许 OAI-SearchBot、禁止 GPTBot [S1]。Anthropic、Mistral、Meta 的结构相同 [S25][S39][S37]。
- 用户触发抓取不等于搜索索引。OpenAI 明确说 ChatGPT-User "is not used to determine whether content may appear in Search"，管搜索要用 OAI-SearchBot [S1]。
- 改 robots.txt 后要等。OpenAI 说搜索系统约 24 小时生效 [S1]，Meta 说爬虫可能缓存 robots.txt 最多 24 小时 [S37]，DuckDuckGo 说 72 小时 [S40]，Google 说重新抓取可能要几天到几个月 [S9]。
- 只挡 IP 不挡 robots.txt 可能反而退不出。Anthropic 写明，屏蔽 IP 会让它读不到 robots.txt，"may not work correctly or persistently guarantee an opt-out" [S25]。
- CDN 和 WAF 也算"挡"。Google 的 AI 功能文档把"robots.txt 以及 CDN 或托管基础设施都允许抓取"列为基本要求 [S9]。Perplexity 文档专门给了 Cloudflare WAF 和 AWS WAF 的放行规则写法 [S33]。

### 2.2 OpenAI：ChatGPT search、ChatGPT agent、Atlas

**检索后端。** OpenAI 官方只说 OAI-SearchBot 用来"surface websites in search results in ChatGPT's search features" [S1]，没有公开索引构成。厂商 Peec 在 2026-09 发布的逆向研究称：2026-05-21 到 07-21 之间，ChatGPT 服务端事件里的 `result_source` 字段只出现四个值：Labrador、Bright、Oxylabs、SERP。Labrador 是 OpenAI 自建索引，由网页、PDF、YouTube、新闻（分 1 天 / 7 天 / 更早三层）、arXiv、Wikipedia、本地、金融、法律、医疗、购物、图片等垂直索引组成 [S2]。同一研究称 ChatGPT 还混用 Bright Data 和 Oxylabs 抓取的 Google 结果、Yelp、TripAdvisor、Microsoft Web IQ 等至少 8 个来源；Bing 主要出现在 Deep Research 里 [S3]。Microsoft 自己的 2026-10 公告把 Web IQ 称为"Microsoft 提供给第三方的 grounding 服务" [S20]，和 Peec 的说法能对上。Peec 还引用了 Google 反垄断案庭审证词：ChatGPT 负责人 Nick Turley 作证称 OpenAI 从 2023 年开始建自己的搜索索引 [S2]。（注意：Peec 卖 AI 可见度工具，属于利益相关方，OpenAI 没有确认这些细节。）

**爬虫与 UA。** 来自 OpenAI 官方页面 [S1]：

| 名称 | 用途 | robots.txt | IP 列表 |
|---|---|---|---|
| `OAI-SearchBot` | ChatGPT 搜索展示。被禁的网站"will not be shown in ChatGPT search answers, though can still appear as navigational links" | 遵守，约 24 小时生效 | `https://openai.com/searchbot.json` |
| `GPTBot` | 训练基础模型 | 遵守 | `https://openai.com/gptbot.json` |
| `ChatGPT-User` | 用户在 ChatGPT / Custom GPT / GPT Actions 中触发的访问 | "robots.txt rules may not apply" | `https://openai.com/chatgpt-user.json` |
| `OAI-AdsBot` | 只访问提交为 ChatGPT 广告落地页的页面，不用于训练 | 文档未说明 | `https://openai.com/adsbot.json` |

UA 示例：`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot`。抓 robots.txt 时 UA 会额外带 `robots.txt;` 标记 [S1]。如果网站同时允许 GPTBot 和 OAI-SearchBot，OpenAI "may use the results from just one crawl for both use cases" [S1]。

**Atlas 浏览器和 agent 模式。** Simon Willison 2025-10 实测，Atlas 的 UA 和最新版 macOS Chrome 完全一样 [S6]。HUMAN Security 认为 Atlas 浏览流量没有公开的签名身份，也没有专门的 robots.txt 令牌，靠 UA 过滤和 robots.txt 管不住 [S7]。MIT AI Agent Index 的条目说 Atlas 的搜索和摘要能力依赖 OAI-SearchBot，想被收录就不要挡它 [S8]。OpenAI 爬虫页面没有列出 agent 专用的 UA [S1]。有一条 2026 年的新闻标题称 Atlas"不到一年就结束了"，本稿没能打开原文核实（见第 6 节）。

**JavaScript。** 2024 年 Vercel 数据：ChatGPT 的爬虫请求里 11.50% 是 JS 文件，但不执行 [S43]。2026 年有二手报告称一项名为 Forge 的测试发现 GPTBot 从 2026-09-25 开始渲染，同一文章也说作者没找到 OpenAI 的公告 [S44]。同一来源转述的测试称 ChatGPT-User 读了 37,045 次页面、0 次脚本请求 [S44]。结论：按"不执行 JS"来设计。

**引用展示。** 本稿没有找到 OpenAI 关于引用 UI 的官方页面。GPT-6 引入了可在对话里直接使用的图表、地图、小工具（Intelligent UI），有分析认为这会减少点击 [S4]。

**偏好。** 官方没有公开。厂商研究认为 Google 排名会传导到 ChatGPT：Peec 的 CPO 选了一个零自然流量的网站，只在 ChatGPT 里问它，结果 Search Console 在那几天出现了流量尖峰 [S3]。本地商家要先把 Yelp、TripAdvisor 资料弄对 [S3]。

**站长后台。** 2026-11 OpenAI 推出 "Businesses in ChatGPT"（beta）和 Business Hub。商家可以认领资料、管理信息，看到"number of mentions and website clicks"和被引用的"discovery topics"。认领方式是给主电话打电话 / 发短信，或 DNS 验证。Business Agent 先面向美国符合条件的电商和在线服务商家。点击数的提示文字是"Clicks don't confirm website visits or conversions" [S5]。（本稿通过 Search Engine Roundtable 的报道读到 OpenAI 原文引述，openai.com 原页面无法抓取。）

**引荐流量。** 2026-10-07 GPT-6 开始推送（付费用户当天，Free / Go 从 10-08 起）。从 10-09 开始，带 `utm_source=chatgpt.com` 的访问在厂商 Limy 的数据里下降 65%，同期 ChatGPT 引用量只变了 6%。约 500 个页面上，ChatGPT 每天少了约 3.1 万次访问，"直接访问"多了约 2.6 万次。原因是 GPT-6 打开链接时带 `noopener,noreferrer`，并且不加 UTM [S4]。另一个反向问题：Google 收录了被人粘贴出去的带 `?utm_source=chatgpt.com` 的 URL，导致 Google 自然点击被算成 ChatGPT [S4]。同一文章还记录了一位从业者的观察：10-09 后 ChatGPT-User 请求减少，10-07 起 OAI-SearchBot 请求增加 [S4]。这只是单一观察。

**官方文档。** `https://platform.openai.com/docs/bots` [S1]。

### 2.3 Google：AI Overviews、AI Mode、Gemini

**检索后端。** 就是 Google 搜索索引。Google 的生成式 AI 优化指南说这些功能"rooted in our core Search ranking and quality systems"，用 RAG（grounding）从搜索索引里检索页面，并用 query fan-out 同时发出多条相关查询 [S10]。AI Overviews 和 AI Mode "may use different models and techniques"，引用的链接会不同 [S9]。2026-11 Google 在搜索里上线了 Gemini 4 Hydrogen，官方称改进了 query fan-out 和链接 [S19]。另有报道称 Google 正在测试从搜索栏去掉 AI Mode 标签 [S71]。

**收录资格。** "a page must be indexed and eligible to be shown in Google Search with a snippet"，没有额外技术要求 [S9]。2026 年的新指南多了一条："a site must be included in Search generative AI features in Search Console to be eligible" [S10]，也就是下面的新开关不能被设成排除。

**爬虫与控制项。**

| 控制项 | 作用范围 | 不影响什么 |
|---|---|---|
| `Googlebot` | 抓取搜索索引。AI Overviews / AI Mode 也用这份索引 [S9] | 无法单独屏蔽 AI 功能而保留搜索 [S9] |
| `nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` | 限制页面内容在搜索（包括 AI 功能）里的展示 [S9] | 用 URL 检查工具确认 Googlebot 看到了这些标记 [S9] |
| Search Console「Search generative AI」开关 | 整站或某个属性下的路径，排除出 AI Overviews、AI Mode、Discover 生成式功能。排除后"Content crawled from your site won't be eligible to be used as an input to generate an AI response"。1 到 2 天生效。子属性默认继承父属性 [S11] | 不影响普通搜索排名，不影响 AI 训练（训练要用 Google-Extended）[S11] |
| `Google-Extended`（只是 robots.txt 令牌，没有独立 UA） | Gemini 模型训练，以及 Gemini Apps 和 Vertex AI "Grounding with Google Search"的实时 grounding [S15] | 不影响 Google 搜索收录，也不是排名信号 [S15] |
| `__usage_ai-training`（跨厂商） | Google 计划 2027 年支持。网站用它退出训练且没有单独写 Google-Extended 时，Google 视同屏蔽了 Google-Extended [S14][S15] | 单独允许了 Google-Extended 的网站"are eligible to appear in responses and receive clicks via grounding in Gemini Apps" [S14] |
| `Google-CloudVertexBot` | 只影响网站主自己发起的 Vertex AI Agents 抓取 [S15] | 不影响搜索 |

用户触发和代理类 [S16]：

- `Google-Agent`：Google 基础设施上的代理（Peec 的列表举例为 Project Mariner [S45]）替用户浏览和操作网页，IP 在 `user-triggered-agents.json`。Google 在试验 Web Bot Auth，身份是 `https://agent.bot.goog` [S16]。
- `Google-GeminiNotebook`：用户把 URL 加进 Gemini Notebook 作为资料时抓取。旧名 `Google-NotebookLM` 支持到 2026-08 [S16]。
- 用户触发抓取器"generally ignore robots.txt rules"是 Google 这一类别的定义（文档里写因为是用户发起）[S16]。

**JavaScript。** Google 说"Google is able to process content within JavaScript as long as it isn't blocked" [S10]。Vercel 的数据也显示 Gemini 借用 Googlebot 基础设施，能完整渲染 [S43]。

**偏好（Google 官方口径）。** 2026-05 的新指南 [S10]：

- 最重要的是"non-commodity content"，即有一手经验和独特观点的内容，例子是"7 Tips for First-Time Homebuyers"对比"Why We Waived the Inspection & Saved Money"。
- 不要为每个 fan-out 查询批量做页面，这违反 scaled content abuse 政策。
- 明确说不需要：llms.txt 等"AI text files"、把内容切碎（chunking）、专门为 AI 改写、刷"inauthentic mentions"、特殊 schema。Google 原话："Google Search ignores them"（指 llms.txt）。
- 本地和电商：Merchant Center 商品数据和 Business Profile 会进入 AI 回答。
- 代理：给出 web.dev 的 agent-friendly 网站指南和 Universal Commerce Protocol（UCP）。
- Google 对"AEO / GEO"的态度："optimizing for generative AI search is optimizing for the search experience, and thus still SEO"。

**引用展示。** AI Overviews 和 AI Mode 显示"supporting links"，由于 fan-out，链接比传统结果更多更分散 [S9]。2026-11 有报道称 Google 把来源图标移到 AI Overview 底部（来自 SER 周报，本稿未单独核实）[S19]。

**站长后台。** Search Console 的 Generative AI performance report：2026-06-03 发布，2026-08-31 全球上线 [S13]。只统计展示次数，可按页面、国家、设备、日期查看，可筛选"Web: text-based"和"Web: multimodal"。覆盖 AI Overviews 和 AI Mode，没有拆分两者，也没有点击数 [S12]。这部分数据同时计入总的 Performance 报告的"Web"类型，不要相加 [S9][S13]。2026-11-09 到 11 日该报告有数据记录 bug，展示次数偏低 [S19]。

**引荐流量。** AI Overviews 和 AI Mode 的点击计入普通 Google 自然搜索。Google 在 2026-11 新增帮助文档，讲怎么用 HTTP Referer 识别来自 Google 搜索的流量 [S19]。Gemini App：2026-09 初开始给引用链接加 `utm_source=gemini`，约 9 月 28 日又停了；桌面网页版仍传 `gemini.google.com` referrer；iOS App 用内置 WebView 打开，不传 referrer，服务器日志里只有 `GeminiiOS` UA [S17][S18]。SEJ 10-01 才报道"Gemini 加 UTM"，时间上和"已停止"冲突 [S70]。

**官方文档。** `https://developers.google.com/search/docs/appearance/ai-features` [S9]；`https://developers.google.com/search/docs/fundamentals/ai-optimization-guide` [S10]；`https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers` [S15]。

### 2.4 Microsoft：Copilot、Bing

**检索后端。** Bing 索引。Microsoft 自己说 grounding 内容用于 "Bing, Copilot, and Microsoft 365"，并把 AI Mode、AI Overview、Copilot、Microsoft 365 列为"Microsoft-operated experiences"，把 Web IQ 和 Foundry 里的 grounding API 列为"provided to third parties" [S20]。

**爬虫。** Bingbot。Microsoft 没有单独的 AI 训练爬虫，训练、grounding、搜索都由 Bingbot 抓取，靠偏好设置区分用途 [S20]。

**控制项（2026-10 新规则，2027 年生效）** [S20][S67]：

- AI Training：用共享的 `__usage_ai-training` 令牌在 robots.txt 里按站点或路径设置；也可以用页面级 meta 或 HTTP 头覆盖：
  ```html
  <meta name="Bingbot" content="ai-training:disallow">
  ```
  ```
  X-Robots-Tag: Bingbot: ai-training:disallow
  ```
- AI Grounding：只有页面级，没有站点级 robots.txt 设置。取值 `allow`（默认）、`disallowextended`（只允许 Microsoft 自家产品用，不给 Web IQ 和 Foundry API 这些第三方）、`disallow`：
  ```html
  <meta name="Bingbot" content="ai-grounding:disallow">
  ```
  ```
  X-Robots-Tag: Bingbot: ai-grounding:disallow
  ```
- 时间表：2026-12-15 Bing Webmaster Tools 开放临时 grounding 设置（只给正在用 NoArchive / NoCache 的网站）；2027-02-01 开始按新偏好执行；2027-03-01 之后 NoArchive / NoCache 不再被当作训练或 grounding 偏好；临时设置 2027-09-30 过期。
- Microsoft 写明：设置 grounding 为 disallow "will significantly reduce your content's visibility in AI-generated experiences"；allow 也不能覆盖 robots.txt 对 Bingbot 的屏蔽；发布设置不等于生效，要等 Bingbot 重新抓取，IndexNow 能提高重抓概率但不保证日期 [S20]。
- 旧机制（2023）：`noarchive` 让内容不进 Bing Chat 回答也不用于训练，`nocache` 只显示 URL、标题、摘要 [S24]。2026-02 改写后的 Bing 站长指南说 NOARCHIVE 阻止内容用于 Copilot 回答和 grounding 结果，NOCACHE 让 Copilot 只用 URL、标题、摘要 [S23]。这套在 2027-03-01 后失效 [S20]。
- Bing 从 2025-10 支持 `data-nosnippet` 属性 [S68]。

**JavaScript。** 本稿没找到 Bing 关于 Copilot grounding 是否执行 JS 的 2026 年官方说明。

**偏好（官方）。** 2026-02 改写的 Bing 站长指南第一次写进"Generative Engine Optimization (GEO)"一词，定义为"content eligibility for grounding and reference in AI responses"。建议：事实直接陈述，实体名称清晰一致，每个 URL 聚焦一个主题，关键信息放在页面顶部；单主题页面更容易被选为 grounding 结果 [S23]。AI Performance 公告里的建议：清晰的标题、表格、FAQ 段落；例子、数据和引用；定期更新；文字、图片、视频描述同一实体时要一致；用 IndexNow 通知更新；本地商家用 Bing Places [S21]。

**站长后台。** Bing Webmaster Tools → AI Performance（2026-02-11 公测，免费，验证站点即可用）。指标：总引用数、平均每天被引页面数、grounding 查询词（抽样）、各 URL 引用数、时间趋势。覆盖 Microsoft Copilot、Bing AI 摘要和"select partner integrations" [S21]。2026-10-13 新增 Topics Portfolio（beta）：把 grounding 查询聚成主题，给出主题规模、竞争站点数、"Top Opportunity Queries"（别人被引、你没被引的查询）[S22]。一家代理商的案例：19,717 次 Copilot 引用、86 个被引页面，没有点击数据 [S21 搜索结果中的二手报道，见出处表 S21 备注]。

**引荐流量。** 本稿没找到官方的 referrer 或 UTM 说明。

**官方文档。** `https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/` [S20]，`https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview` [S21]，FAQ 在 `https://www.bing.com/webmasters/help/new-ai-preferences-2t1cc16d`（链接见 [S67]，本稿未能抓取正文）。

### 2.5 Perplexity

**检索后端。** 官方说 PerplexityBot "is designed to surface and link websites in search results on Perplexity"，不用于训练基础模型 [S33]。说明 Perplexity 有自己的索引。是否还混用外部搜索 API，本稿没有找到官方说明。

**爬虫与 UA** [S33]：

| 名称 | UA 示例 | robots.txt | IP 列表 |
|---|---|---|---|
| `PerplexityBot` | `Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)` | 建议放行以出现在结果里 | `https://www.perplexity.ai/perplexitybot.json` |
| `Perplexity-User` | `Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)` | "Since a user requested the fetch, this fetcher generally ignores robots.txt rules." | `https://www.perplexity.ai/perplexity-user.json` |

Perplexity 文档给了 Cloudflare WAF 放行规则：`(http.user_agent contains "PerplexityBot" and ip.src in {...}) or (http.user_agent contains "Perplexity-User" and ip.src in {...})`，动作选 Skip，并放在拦截规则之前 [S33]。

**隐身爬虫争议。** Cloudflare 2025-08-04 发文：新建未公开域名、robots.txt 禁止所有爬虫、WAF 屏蔽 PerplexityBot 和 Perplexity-User 之后，Perplexity 仍能回答这些域名的详细内容。Cloudflare 观察到 Perplexity 先用声明的 UA，被挡后换成模仿 macOS Chrome 的通用 UA，用未声明的 IP 并轮换 ASN，涉及"tens of thousands of domains"、每天数百万次请求。Cloudflare 把 Perplexity 移出已验证机器人名单，并把隐身爬虫特征加入面向所有用户（含免费版）的 AI 爬虫托管规则。同一测试里 ChatGPT 读到 robots.txt 后就停止抓取 [S34][S35]。Cloudflare 是利益相关方（它卖爬虫管理和"按抓取付费"产品）。

**偏好、JS。** 二手测试称 PerplexityBot 读取原始 HTML [S44]，证据弱。官方没有公开引用偏好。

**出版商计划。** 2024-07 推出 Publishers' Program（按广告收入分成）；2025-08 推出 Comet Plus（每月 5 美元订阅，80% 分给出版商，初始池 4,250 万美元，按人类访问、引用和代理操作三类活动分配，申请邮箱 publishers@perplexity.ai）[S36]。2026 年的"2,400 多家加入"等数字来自低质量网站，本稿不采用。

**引荐流量。** 常见 GA4 自定义渠道正则包含 `perplexity.ai` [S69]，没有官方文档。

**官方文档。** `https://docs.perplexity.ai/guides/bots` [S33]。

### 2.6 Anthropic：Claude

**检索后端。** Anthropic 2025-03-19 把 Brave Search 加入子处理方名单；Simon Willison 实测 Claude 的引用和 Brave 结果一致，工具定义里有 `BraveSearchParams` [S31]。xponent21 在 2026-07-02 复查名单，Brave 仍在，范围是所有产品；名单在 2026-05-06 新增 turbopuffer（向量和全文检索数据库），归类为"Web Search"，用于除 Claude for Government 以外的所有产品，具体用途未公开 [S30]。

**爬虫与 UA** [S25]：

| 名称 | 用途 | 禁止后的影响（官方原意） |
|---|---|---|
| `ClaudeBot` | 训练 | 未来内容不进训练数据 |
| `Claude-SearchBot` | 为搜索建索引、提升搜索质量 | "may reduce your site's visibility and accuracy in user search results" |
| `Claude-User` | 用户提问时访问网页 | "may reduce your site's visibility for user-directed web search" |
| `Claude-Agent`（代理浏览器，不是爬虫） | Anthropic 托管的真实浏览器替用户完成任务，例如 Claude Duet。UA 示例 `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-Agent/1.0) Chrome/154.0.0.0 Safari/537.36`，IP 发布在 `https://claude.com/.well-known/sail`（格式见 draft-kelley-webbotauth-sail-00）[S26] | 是否允许要在 WAF 层面控制；和爬虫的设置相互独立 [S26] |

Anthropic 支持 `Crawl-delay`；要对每个子域名分别设置 robots.txt [S25]。2026-10-30 起 Anthropic 开始识别 AIPREF 训练偏好信号，规则是：robots.txt 里明确写了 ClaudeBot 的，以 ClaudeBot 规则为准；没写 ClaudeBot 的，按通用信号执行 [S25]。Anthropic 承诺不绕过验证码等反规避措施 [S25]。

**JavaScript。** Vercel 2024 年数据：Claude 爬虫请求中 23.84% 是 JS 文件，但不执行 [S43]。二手测试称 Claude-User 读取原始 HTML [S44]。StackFox 的测试显示 Claude 先请求 robots.txt 再抓页面，两次请求都标为 Claude-User [S41]。

**偏好（都是第三方研究）** [S30]：

- Profound 2026-06 复测约 400 个查询：Claude 引用和 Brave 前 10 重合 79.2%（2025 年首发时的 86.7% 只来自 15 个结果）。
- Profound 数据：Claude 引用的 URL 有 64% 在 Google 前 50 名，34% 在前 10 名；Claude 和 ChatGPT 的引用只有 8% 重合；Claude 只在 36.6% 的提示里触发搜索，ChatGPT 约 90% 到 95%。
- Yext 分析 2025 年第四季度 1,720 万条 AI 引用：Claude 依赖评论和社交来源的程度是其他模型的 2 到 4 倍。
- Muck Rack 的百万级引用数据（经 Nieman Lab 报道）：Claude 引用新闻媒体最少。

这些是 xponent21 转述的厂商数据，样本和方法没有完全公开。

**站长后台、引荐流量。** 没有站长后台。常见 GA4 正则包含 `claude.ai` [S69]，没有官方文档。

**官方文档。** `https://support.claude.com/en/articles/8896518` [S25]，`https://support.claude.com/en/articles/18234133` [S26]。

### 2.7 Apple：Siri、Spotlight、Apple Intelligence

来自 Apple 官方页面 [S38]：

- `Applebot` 抓取的数据用于 Spotlight、Siri、Safari 搜索，也"may also be used to help train Apple foundation models"，还会在回答"broad world knowledge questions"时作为实时上下文，答案"may include links to sources"。
- `Applebot-Extended` 不抓页面，只是令牌。禁止它，内容就不用于训练 Apple 的基础模型，但仍可出现在搜索结果里。
- 想让内容不进 Siri / Search 的 AI 知识回答，用 `nosnippet` meta 标签。用 JSON-LD 标记 `isAccessibleForFree: false` 的付费页面可以出现在搜索结果里，但不会被当作 AI 生成内容的上下文。
- **robots.txt 没写 Applebot 但写了 Googlebot 时，Applebot 按 Googlebot 的规则执行**。Applebot 不遵守 crawl-delay。
- Applebot "may render the content of your website within a browser"，即会执行 JS；不要在 robots.txt 里挡 JS 和 CSS。
- 验证方法：反向 DNS 应为 `*.applebot.apple.com`，或对照 Applebot IP CIDR 的 JSON 文件。

### 2.8 Meta：Meta AI

来自 Meta 官方页面 [S37]：

| 名称 | 用途 | robots.txt |
|---|---|---|
| `meta-webindexer` | 提升 Meta AI 搜索结果质量。"Allowing Meta-WebIndexer in your robots.txt file helps us cite and link to your content in Meta AI's responses." | 遵守 |
| `meta-externalagent` | "training foundation AI models or improving products by indexing content directly" | 遵守 |
| `meta-externalfetcher` | 用户请求时抓单个链接，也用于让 AI 代理完成任务 | "may bypass robots.txt rules" |
| `meta-externalads` | 广告和商业产品 | 遵守 |
| `facebookexternalhit` | 链接预览；做安全检查时可能绕过 robots.txt | 部分 |

robots.txt 修改最多 24 小时生效。注意 meta-externalagent 的用途描述同时包含训练和"直接索引内容"，屏蔽它可能也影响某些产品功能 [S37]。Meta 对 `__usage_ai-training` 只表达了支持理念，没有承诺实现 [S28]。

### 2.9 xAI：Grok

- 官方 API 文档有 Web Search 和 X Search 两个工具，Web Search 支持 `allowed_domains` 和 `excluded_domains` 过滤，示例里用的是 `grokipedia.com` [S42]。这说明 Grok 的答案来源包括网页、X 帖子和 Grokipedia。
- 本稿没有找到 xAI 官方的爬虫 UA 文档。第三方目录列出 GrokBot、xAI-Grok、Grok-DeepSearch、xAI-SearchBot 等名字，但互相矛盾 [S45]。
- StackFox 2026-02-06 的受控测试：让 Grok 读一个新闻站，1 秒内来了 30 个请求，UA 是过时的 Chrome 139、iPhone Safari 和 `Go-http-client/1.1`，来自 M247 和 Datacamp 等代理网络，完全不带"Grok"或"xAI"字样 [S41]。作者说 Cloudflare 也独立确认过，但本稿没有找到 Cloudflare 的原文。
- 结论：robots.txt 对 Grok 基本无效；想被 Grok 引用，主要靠 X 上的讨论和公开网页。

### 2.10 Mistral：Le Chat / Vibe

Mistral 官方页面现在把产品称为 "Vibe"（"MistralAI-User is for user actions in Vibe"）[S39]，Le Chat 是否已改名，本稿没有核实。

| 名称 | 用途 | 说明 |
|---|---|---|
| `MistralAI-User` | 用户在 Vibe 提问时访问网页，回答里附来源链接 | 不做自动抓取，不用于训练 |
| `MistralAI-Index` | 为 Mistral 搜索建索引 | "not used for generative AI training of any kind" |
| `MistralAI-Training` | 训练数据集 | 不用于搜索或实时回答 |

UA 格式：`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-Index/1.0; +https://docs.mistral.ai/robots)` [S39]。

### 2.11 DuckDuckGo、Brave、You.com

- **DuckDuckGo**：`DuckAssistBot/1.2; (+http://duckduckgo.com/duckassistbot.html)` 为 AI 回答实时抓页面，"prominently cite their sources"，数据不用于训练。在 robots.txt 里禁止它 72 小时后生效，不影响自然排名。IP 列表在 `https://duckduckgo.com/duckassistbot.json` [S40]。
- **Brave**：自有索引。爬虫"does not advertise a differentiated user agent"，因为要避免被只放行 Google 的网站区别对待；"if a domain or page is not crawlable by Googlebot, then Brave Search's bot will not crawl it either"。robots.txt 不能让页面从 Brave 下架，要用 `noindex`。部分数据来自用户自愿开启的 Web Discovery Project [S32]。Brave Search API 是 Claude 的搜索后端 [S30][S31]。xponent21 称 Microsoft 在 2025-08 停了公开的 Bing Search API，Google Custom Search JSON API 计划在 2027-01-01 停用，所以 Brave 成了少数可用的独立西方索引 [S30]（本稿未用官方来源核实这两个停用日期）。
- **You.com**：只在厂商列表里看到 `YouBot`（"Fetches pages to power You.com's AI search results"）[S45]，官方页面（about.you.com/youbot）返回 404。

### 2.12 代理和 AI 浏览器（替用户操作网站）

- **Google-Agent**：有专门 UA 和 IP 列表，在试验 Web Bot Auth [S16]。Google 建议看 web.dev 的 agent-friendly 指南，关注 UCP 协议；代理会看截图、DOM 和无障碍树 [S10]。
- **Claude-Agent**：真实浏览器 UA 里加 `Claude-Agent` 标记，IP 用 SAIL 格式发布 [S26]。
- **ChatGPT Atlas / agent 模式**：UA 和普通 Chrome 一样，没有公开签名身份 [S6][S7]。
- **Meta-ExternalFetcher**：用于"helping AI navigate websites to complete tasks for users"，可能绕过 robots.txt [S37]。
- **Perplexity Comet**：Comet Plus 把"agent actions"作为付费分成依据之一 [S36]。
- Peec 的爬虫列表还有 `Manus-User`（代理操作网页）、`Gemini-Deep-Research`、`GoogleAgent-Mariner` 等名字 [S45]，只是厂商整理，不一定准确。

对开发者的实际含义：代理流量越来越像人类浏览器流量。会员站、表单、结账流程如果要支持代理，就要让关键操作在无障碍树里可识别（按钮有文字，表单有 label）；如果不想被代理操作，靠 robots.txt 不够，要在 WAF 层按 UA 加 IP 列表或签名去识别 [S10][S16][S26]。

### 2.13 豆包（字节跳动）

- **检索后端**：火山引擎 2026-07-28 上线"豆包搜索服务"（面向企业和开发者的 API），称"融合全域互联网信息、行业专业知识以及字节跳动独家内容资源"，对信源"从网站站点和创作者两个维度"建立权威分级、按行业垂直治理、过滤"SEO 灌水信息"，已成为"国内 9 成 TOP 手机厂商智能助手背后的信息引擎" [S47]。从业者白杨SEO 认为这项服务和豆包 App 里的联网能力是同一套，只是改名 [S48]（观点，未证实）。
- **偏好**：白杨SEO 对比 2025-05、2026-03 和当下的截图，认为豆包快速模式的引用来源"最新变化变成了抖音短视频为主" [S48]。一篇 GEO 营销文章引用"新榜智汇"142.9 万次问答、1,683.6 万条信源的统计：豆包前 5 名引用信源中 3 个属于字节，超过 60% 的引用来自今日头条和抖音；还引用 QuestMobile 数据称旅游类问答里抖音引用率达 97.7%；并称 2026-06 改版后可引用的外部网站数量上涨 15% [S49]。这些数字本稿没找到原始报告（营销内容，证据等级 D）。艾瑞咨询的汽车行业测评（40 万次提问）发现豆包 App 端相对偏好短视频信源，PC 端更依赖专业垂类媒体和资讯类信源，汽车之家贡献率接近 100% [S50]。
- **爬虫**：常见的 ByteDance 爬虫名是 `Bytespider`，被多个来源指为不遵守 robots.txt，另有来源称它在重新读取 robots.txt 后会遵守 [S65]。本稿没找到 ByteDance 官方的爬虫文档，也没找到 Bytespider 和豆包回答之间关系的官方说明。
- **海外网站**：豆包搜索服务宣传"跨语言" [S47]，豆包 App 能否稳定引用海外网站没有官方说明。
- **月活**：2026 年一季度 3.45 亿，国内第一 [S58]。
- **电商**：白杨SEO 称抖店后台已能识别来自豆包的订单 [S48]。

### 2.14 DeepSeek

- **检索后端**：DeepSeek 隐私政策只写"当您使用搜索服务时，我们会自动接收您主动输入的信息，以便向您自动提供实时搜索结果"，没有说明搜索服务商 [S66]。本稿没找到官方说明。
- **偏好**：GEO 营销文章称 DeepSeek 的信源分布为权威新闻 28%、知乎 25%、技术社区 20%、学术论文 15%、企业官网 12% [S49]，没有说明样本和方法（D）。艾瑞汽车测评显示 DeepSeek 的信源分布"相对均衡"，PC 端和 App 端几乎一致 [S50]。
- **海外网站**：一位开发者反馈 DeepSeek 网页版读取 GitHub 源码链接失败，改成 `raw.githubusercontent.com` 后才成功，而且读取失败时没有报错，直接编造了不存在的代码 [S63]（单一个案）。
- **趋势**：2026 年一季度月活 1.27 亿，连续四个季度下滑 [S58]。
- **爬虫**：Peec 列表里有 `DeepSeekBot`（训练）[S45]，没有官方文档。

### 2.15 Kimi（月之暗面）

- **检索后端**：官方帮助页称 Kimi 会"智能调用搜索引擎与垂直数据库"，覆盖"100+ 经过验证的可信来源（主流新闻媒体、政府公告、金融数据平台、学术期刊库）"，没有说明是哪家搜索引擎 [S55]。垂直数据库包括同花顺 iFinD、天眼查、学术数据库、世界银行等 [S55]。
- **引用展示**：所有基于搜索的回答都带参考来源链接；可信来源会标权威标识（官网认证、学术认证、媒体认证）[S55]。
- **筛选规则（官方）**：按相关性、权威性、时效性筛选；"自动剔除：低质聚合站点、未经证实的自媒体、过期缓存页面"；"优先收录：政府机构官网、权威媒体、学术期刊、官方财报渠道" [S55]。
- **海外网站**：官方写明"可主动检索非中文资料（如指定搜索英文新闻源、日文技术文档等）" [S55]。这是本稿找到的唯一一家明确支持非中文检索的中文平台。
- **偏好**：营销文章称 62% 的回答会引用千字以上长文档 [S49]（D）。GEO Compass 认为长上下文读取偏好结构完整的长页面 [S56]（D）。
- **趋势**：Kimi 月活连续四个季度下降，独立厂商重心转向模型和企业场景 [S58]。

### 2.16 腾讯元宝

- **检索后端**：App Store 的元宝介绍写着联网搜索覆盖"公众号、视频号等优质腾讯生态信源" [S54]。国信证券 2024 年的研报称元宝接入了微信搜一搜和搜狗搜索 [S53]（2024 年资料，可能已变化）。腾讯 2025 年 11 月 11 日上线独立的"元宝搜索"（so.qq.com），"依托千亿级索引"，覆盖全网网页、公众号、视频号和学术文献，"接入 157 个权威信源"，优先展示权威机构和官方来源 [S52]。（报道未标年份，从上下文推测是 2025 年，未核实。）
- **偏好**：营销文章称基于 19,842 条引用样本，64% 来自腾讯自有生态，常规模式下公众号内容占 44.1%，搜狗可索引站点也有贡献 [S49]（D）。艾瑞汽车测评：元宝 PC 端和 App 端的信源差异很大，PC 端懂车帝第一，App 端汽车之家第一 [S50]。
- **相关**：智谱文档称搜狗"覆盖腾讯生态（新闻/企鹅号）和知乎内容" [S57]，这间接解释了为什么用搜狗的平台常引用知乎。
- **月活**：2026 年一季度 5,734.6 万，首次跌出前三 [S58]。

### 2.17 百度：文心、百度 AI 搜索

- **爬虫**：`Baiduspider/2.0`，渲染爬虫 `Baiduspider-render/2.0`，小程序场景带 `Smartapp` 标记。IP 段动态变化，不公开；验证方法是反向 DNS，主机名应为 `*.baidu.com` 或 `*.baidu.jp` [S46]。
- **检索后端**：百度搜索索引。腾讯云社区一篇文章把百度 AI 搜索描述为"底层沿用成熟的网页爬虫收录体系，在网页索引基础上叠加 RAG" [S62]（D）。
- **偏好**：营销文章称文心的信源由百度百科、百家号、百度知道构成，合计约 44%，百科词条是建立品牌认知的关键 [S49]（D）。艾瑞汽车测评发现文心一言的短视频信源占比偏高，好看视频的信源引用率排第二，超过部分汽车垂类媒体 [S50]。
- **生态封闭**：SCMP 报道百度百科更新 robots.txt，禁止 Googlebot 和 Bingbot 抓取 [S64]（2024 年）。
- **单独的 AI 爬虫或 AI 退出开关**：本稿没找到百度关于 AI 训练或 AI 回答的单独 robots.txt 令牌。

### 2.18 通义千问 / 夸克（阿里）

- **检索后端**：没有找到官方说明。智谱文档把"夸克"列为可选搜索引擎，描述为"精准触达垂直内容" [S57]，说明夸克有独立的搜索索引。
- **偏好**：艾瑞汽车测评：千问的 PC 端和 App 端信源几乎一致，前 3 名都是垂类平台，"体现模型标准化信源调用逻辑" [S50]。营销文章称千问偏好官媒、政务、高校，对接知网、万方、维普，阿里电商内容有加成 [S49]（D）。
- **月活**：2026 年一季度 1.66 亿，环比增长 969.1%，升至第二 [S58]。

### 2.19 秘塔 AI 搜索

- 学术板块只收录论文题录和摘要，不收录全文，正文要跳转到来源网站 [S60]。
- 2024 年知网发函后，秘塔宣布不再收录知网题录和摘要，改用"其他中英文权威知识库" [S60]。
- 有"专题"功能，支持基于自定义知识库搜索 [S60]。
- 本稿没找到秘塔网页索引来源的官方说明。

### 2.20 360 纳米 AI 搜索

- 2025-06-11 发布"纳米 AI 超级搜索智能体"，称能跨平台搜索小红书、抖音、淘宝、京东、雪球、高德地图，能理解网页里的表格、公式、音视频、评论弹幕，内置 80 多款国内大模型 [S61]。
- 没有找到它使用的爬虫名或站长指南。

### 2.21 智谱清言（智谱 AI）

- 智谱开放平台的 Web Search API 写明"基于统一 API 接口集成自研引擎及第三方服务（搜狗/夸克）"，`search_engine` 可选 `search_std`、`search_pro`、`search_pro_sogou`、`search_pro_quark` [S57]。
- 文档对引擎的描述："搜狗：覆盖腾讯生态（新闻/企鹅号）和知乎内容，在百科、医疗等垂直领域权威性强"；"夸克：精准触达垂直内容" [S57]。
- 智谱清言 App 是否用同一套引擎，没有官方说明（合理推断，未证实）。
- 月活方面，智谱已淡出 QuestMobile 的月活榜 [S58]。

### 2.22 中文平台的共同点

- 汽车行业的大样本测评（艾瑞，2026-05-18 到 28，4 万个问题，5 个平台 PC 和 App 双端共 40 万次提问）：信源引用率前 20 的平台里，汽车垂类媒体占 77.2%，短视频和直播平台占 10.5%，新闻门户 5.0%，搜索引擎 4.9%，社交媒体不到 1% [S50][S51]。艾瑞的解释：AI 回答决策问题时"优先引用专业、中立、可验证内容"，车企官网"自带营销属性"，UGC"零散主观"，垂类媒体有标准化的结构化数据 [S51]。（注意：报告高度肯定汽车之家，可能有商业合作，未披露。）
- 对独立开发者的推论：中文 AI 平台更认"所在领域的权威垂类平台"和"平台自家内容生态"。开发者领域的垂类平台通常是 CSDN、掘金、知乎、少数派、GitHub 等，但本稿**没有找到**开发者领域的大样本中文引用测评，这是推论，不是数据。
- 每经 GEO 红皮书（2026-06）列出黑帽 GEO 的风险：伪造测评、虚构引用、AI 生成内容互相引用形成"循环引用"、把旧内容改成"2026 最新"、批量城市页等，建议的"绿色行为"是"真实内容 + 结构化呈现 + 来源标注 + 可访问性 + 更新记录 + 用户意图覆盖 + FAQ 审校 + 多格式发布" [S59]。

### 2.23 跨厂商训练退出令牌 `__usage_ai-training`

- 语法（IETF 草案原文示例）[S27]：
  ```
  User-Agent: __usage_ai-training
  Disallow: /
  Allow: /press-kit/
  ```
  意思是除 `/press-kit/` 以外都不希望被用于 AI 训练。
- 关键规则 [S27]：
  - 文件里没有 `User-Agent: __usage_ai-training` 这一组，就等于"没有表达偏好"，不是同意也不是拒绝。
  - `User-Agent: *` 组**不能**被解释为匹配这个令牌。
  - 它不是抓取指令。想限制抓取，仍要写各爬虫自己的组。
  - 厂商可以规定自家专有令牌（如 ClaudeBot、Google-Extended）比它更具体、优先级更高。
- 状态：个人提交的 Internet-Draft，2026-10-30 发布，2027-05-03 到期，没有正式标准地位 [S27]。另一份 IETF 工作组草案用 `Content-Usage: train-ai=n` 这种不同的语法（来自搜索结果摘要，本稿未打开原文）。
- 各家执行时间：Anthropic 已开始；Microsoft 2027-02-01；Google 2027 年（"early 2027"）；OpenAI 说"in the coming months"；Meta 只表态支持 [S15][S20][S25][S28][S29]。
- AI 定义：只算"modify the learned parameters of a generative AI model"，只做非生成任务的模型不算 [S20][S27]。

### 2.24 平台对比表

"未公开"指本稿没找到官方说明。"JS"列：是＝官方或大样本数据说会渲染；否＝数据显示不执行；未知＝无可靠数据。

| 平台 | 检索后端 | 搜索 / 索引爬虫 | 训练爬虫或令牌 | 用户触发 / 代理 | JS | 引用展示 | 站长后台 / 报表 | 引荐标识 | 官方文档 |
|---|---|---|---|---|---|---|---|---|---|
| ChatGPT（含 Atlas） | 自建 Labrador 索引加 Google 抓取、Web IQ、Yelp 等（厂商研究）[S2][S3] | OAI-SearchBot [S1] | GPTBot [S1]；跨厂商令牌"未来几个月"[S28] | ChatGPT-User（robots 可能不适用）[S1]；Atlas 用普通 Chrome UA [S6] | 否（2026 年有未证实的渲染报告）[S43][S44] | 来源链接；GPT-6 有对话内小工具 [S4] | ChatGPT Business Hub（beta，美国电商与在线服务）[S5] | 2026-10 起基本无 UTM、noreferrer [S4] | platform.openai.com/docs/bots |
| Google AI Overviews / AI Mode | Google 搜索索引 + query fan-out [S9][S10] | Googlebot [S9] | 不适用（搜索 AI 功能的训练用 Google-Extended 控制）[S11] | Google-Agent [S16] | 是 [S10] | supporting links [S9] | Search Console 生成式 AI 报告（只有展示）与排除开关 [S11][S12] | 计入 Google 自然搜索 [S9][S19] | developers.google.com/search/docs/appearance/ai-features |
| Gemini App | Google 搜索索引（grounding）[S15] | Googlebot | Google-Extended（同时管 Gemini Apps grounding）[S15]；2027 支持 __usage_ai-training [S14] | Google-GeminiNotebook、Google-Agent [S16] | 是 [S43] | 来源链接 | 无专门报表 | 桌面传 gemini.google.com，iOS 不传；UTM 只存在三周 [S17] | google-common-crawlers 页 |
| Microsoft Copilot / Bing | Bing 索引，另向第三方提供 Web IQ [S20] | Bingbot [S20] | __usage_ai-training 与页面级 ai-training（2027-02-01）[S20] | 未公开 | 未知 | 引用链接 [S21] | Bing Webmaster Tools AI Performance、Topics Portfolio [S21][S22] | 未公开 | blogs.bing.com（S20） |
| Perplexity | 自有索引（PerplexityBot）[S33] | PerplexityBot [S33] | 官方称不用于基础模型训练 [S33] | Perplexity-User（generally ignores robots.txt）[S33]；隐身爬虫争议 [S34] | 否（弱证据）[S44] | 编号来源 | 无；出版商计划与 Comet Plus 分成 [S36] | 常见为 perplexity.ai（无官方文档）[S69] | docs.perplexity.ai/guides/bots |
| Claude | Brave Search，另有 turbopuffer [S30][S31] | Claude-SearchBot [S25]；Brave 只抓 Googlebot 可抓页 [S32] | ClaudeBot；已执行 AIPREF [S25] | Claude-User [S25]；Claude-Agent [S26] | 否 [S43] | 来源链接 | 无 | 常见为 claude.ai（无官方文档）[S69] | support.claude.com 8896518 |
| Apple（Siri / Spotlight） | Applebot 索引 [S38] | Applebot（无 Applebot 规则时跟随 Googlebot）[S38] | Applebot-Extended（令牌）[S38] | 未公开 | 是 [S38] | 知识回答"may include links" [S38] | 无 | 未公开 | support.apple.com/en-us/119829 |
| Meta AI | Meta 自有索引 [S37] | meta-webindexer [S37] | meta-externalagent [S37] | meta-externalfetcher（可能绕过 robots）[S37] | 未知 | 引用与链接 [S37] | 无 | 未公开 | developers.facebook.com（S37） |
| xAI Grok | 网页搜索 + X 搜索 + Grokipedia [S42] | 无可靠 UA [S41][S45] | 无可靠 UA | 抓取伪装成浏览器 [S41] | 未知 | 来源列表 [S42] | 无 | 未公开 | docs.x.ai（S42） |
| Mistral（Le Chat / Vibe） | Mistral 搜索索引 [S39] | MistralAI-Index [S39] | MistralAI-Training [S39] | MistralAI-User [S39] | 未知 | 来源链接 [S39] | 无 | 未公开 | docs.mistral.ai/robots |
| DuckDuckGo | 实时抓取 [S40] | DuckAssistBot [S40] | 不用于训练 [S40] | DuckAssistBot 实时抓取 [S40] | 未知 | 醒目标注来源 [S40] | 无 | 未公开 | duckduckgo.com 帮助页（S40） |
| Brave | 自有索引 + WDP [S32] | 无独立 UA，跟随 Googlebot 规则 [S32] | 未公开 | 无 | 未知 | 未查 | 无 | 未公开 | search.brave.com/help/brave-search-crawler |
| You.com | 未公开 | YouBot（仅厂商列表）[S45] | 未公开 | 未公开 | 未知 | 未查 | 无 | 未公开 | 未找到 |
| 豆包 | 豆包搜索（字节独家内容 + 全网，按站点与创作者分级）[S47] | 未公开（Bytespider 关系不明）[S65] | 未公开 | 未公开 | 未知 | 来源卡片 | 无；抖店可识别豆包订单 [S48] | 未公开 | 无站长文档 |
| DeepSeek | 未公开 [S66] | 未公开（DeepSeekBot 仅厂商列表）[S45] | 未公开 | 未公开 | 未知 | 来源链接 | 无 | 未公开 | 无 |
| Kimi | 搜索引擎 + 垂直数据库，100+ 可信来源 [S55] | 未公开 | 未公开 | 未公开 | 未知 | 来源链接 + 权威标识 [S55] | 无 | 未公开 | kimi.com 帮助页（S55） |
| 腾讯元宝 | 公众号、视频号 + 搜狗 / 搜一搜；元宝搜索千亿级索引 [S52][S53][S54] | 未公开 | 未公开 | 未公开 | 未知 | 附资料来源 [S53] | 无 | 未公开 | 无 |
| 百度文心 / AI 搜索 | 百度搜索索引 [S62] | Baiduspider、Baiduspider-render [S46] | 无单独令牌（未找到） | 未公开 | Baiduspider-render 用于渲染 [S46] | 未查 | 百度搜索资源平台（无 AI 专项报表，未找到） | 未公开 | ziyuan.baidu.com |
| 通义千问 / 夸克 | 未公开（夸克有自有搜索）[S57] | 未公开 | 未公开 | 未公开 | 未知 | 未查 | 无 | 未公开 | 无 |
| 秘塔 AI 搜索 | 未公开；学术只收题录摘要 [S60] | 未公开 | 未公开 | 未公开 | 未知 | 来源链接 | 无 | 未公开 | 无 |
| 360 纳米 AI 搜索 | 跨平台搜索（小红书、抖音、电商等）[S61] | 未公开 | 未公开 | 未公开 | 未知 | 文末来源 | 无 | 未公开 | 无 |
| 智谱清言 | 自研引擎 + 搜狗 / 夸克（API 文档）[S57] | 未公开 | 未公开 | 未公开 | 未知 | 来源链接 | 无 | 未公开 | docs.bigmodel.cn |

ready-to-use 的 robots.txt 见 3.2 节。

---

## 3. 实战清单

### 3.1 先决定你要什么

对一个想让产品被 AI 推荐的独立开发者，推荐的默认策略：

| 管道 | 推荐 | 理由 |
|---|---|---|
| 传统搜索（Googlebot、Bingbot、Baiduspider、Applebot） | 全部允许 | Google 和 Bing 的 AI 功能用的就是这些索引 [S9][S20]；Brave 和 Applebot 跟随 Googlebot 的规则 [S32][S38] |
| AI 搜索索引（OAI-SearchBot、Claude-SearchBot、PerplexityBot、MistralAI-Index、meta-webindexer、DuckAssistBot） | 全部允许 | 挡了就不会出现在对应 AI 的搜索回答里 [S1][S25][S33][S37][S39][S40] |
| 用户触发（ChatGPT-User、Claude-User、Perplexity-User、MistralAI-User） | 允许 | 挡了会降低用户主动查询时的可见度 [S25]；而且多数可能不遵守 robots.txt [S1][S33] |
| 训练 | 自己决定 | 不影响搜索展示 [S1][S25]。**例外：Google-Extended 同时管 Gemini App 引用** [S14][S15] |

### 3.2 可直接使用的 robots.txt

放在每个域名和每个子域名的根目录（`https://example.com/robots.txt`）。Anthropic 明确要求每个子域名单独设置 [S25]。

```txt
# =====================================================================
# robots.txt：允许 AI 搜索和回答类爬虫，训练类爬虫由站长自选
# 依据：docs/research-contract 调研稿 02-platforms.md（2026-11-14）
# 规则：一个爬虫只服从"最具体匹配它的那一组"。写了专门组的爬虫，
#       不会再读 User-agent: * 组。所以每组都要写完整。
# =====================================================================

# ---------- 0. 默认组：其他所有爬虫 ----------
# 没被下面点名的爬虫（含一般搜索引擎）都按这一组执行。
# 注意：这一组不会被当作 __usage_ai-training 的偏好（IETF 草案规定）。
User-agent: *
Allow: /
# 如果有不想被任何机器抓的路径（后台、草稿、会员内容），写在这里，
# 并且在下面每个专门组里也要重复写一遍。
# Disallow: /admin/

# ---------- 1. 传统搜索引擎：AI Overviews、AI Mode、Copilot、Brave、Siri 的基础 ----------
# Googlebot：Google 搜索，AI Overviews / AI Mode 也用这份索引。
#            Brave 只抓 Googlebot 能抓的页面，所以挡它等于同时失去 Brave 和 Claude。
# Bingbot：Bing 和 Copilot，也通过 Web IQ 供给第三方（包括 ChatGPT）。
# Applebot：Spotlight、Siri、Safari 搜索和 Apple 的 AI 知识回答。
# Baiduspider：百度搜索和百度 AI 搜索。
# DuckDuckBot 等其他搜索引擎走默认组即可。
User-agent: Googlebot
User-agent: Bingbot
User-agent: Applebot
User-agent: Baiduspider
Allow: /

# ---------- 2. AI 搜索索引爬虫：决定你能不能出现在 AI 搜索回答里 ----------
# OAI-SearchBot：ChatGPT 搜索。被挡的网站不会出现在 ChatGPT 搜索回答中。
# Claude-SearchBot：Claude 的搜索索引。
# PerplexityBot：Perplexity 搜索结果，官方说不用于训练基础模型。
# MistralAI-Index：Mistral 搜索索引，官方说不用于任何训练。
# meta-webindexer：Meta AI 搜索，官方说允许它有助于在 Meta AI 回答中被引用和链接。
# DuckAssistBot：DuckDuckGo 的 AI 回答，实时抓取，不用于训练，改动 72 小时生效。
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: MistralAI-Index
User-agent: meta-webindexer
User-agent: DuckAssistBot
Allow: /

# ---------- 3. 用户触发抓取：用户在对话里问到或贴出你的链接时实时读取 ----------
# 这几类多数官方写明 robots.txt "可能不适用"，写在这里主要是表态和备案。
# ChatGPT-User（OpenAI）、Claude-User（Anthropic）、Perplexity-User、MistralAI-User。
User-agent: ChatGPT-User
User-agent: Claude-User
User-agent: Perplexity-User
User-agent: MistralAI-User
Allow: /

# ---------- 4. 训练类：二选一，删掉不用的那段 ----------

# 【选项 A：允许训练】什么都不用写，默认就是允许。
# 理由：被写进模型的"常识"，用户不联网提问时模型也可能知道你的产品。
# （这是推论，没有平台官方承诺训练会带来推荐。）

# 【选项 B：禁止训练，但保留 AI 搜索可见度】取消下面的注释。
#
# 跨厂商令牌（Anthropic 已执行；Microsoft 2027-02-01 起；Google 2027 年；OpenAI 未定）：
# User-agent: __usage_ai-training
# Disallow: /
#
# 各家专用训练令牌（目前仍需逐个写，跨厂商令牌全面生效前不要删）：
# GPTBot：OpenAI 训练。不影响 ChatGPT 搜索展示。
# ClaudeBot：Anthropic 训练。写了它，Anthropic 以它为准，优先于跨厂商令牌。
# Applebot-Extended：Apple 训练，不抓页面，只是令牌；不影响 Siri / Spotlight 搜索。
# MistralAI-Training：Mistral 训练。
# meta-externalagent：Meta 训练（官方描述也含"直接索引内容改进产品"）。
# CCBot：Common Crawl，很多模型的训练数据来源（厂商列表归为训练类，本稿未核实其官方页）。
# User-agent: GPTBot
# User-agent: ClaudeBot
# User-agent: Applebot-Extended
# User-agent: MistralAI-Training
# User-agent: meta-externalagent
# User-agent: CCBot
# Disallow: /

# ---------- 5. Google-Extended：单独决定，它不只是训练开关 ----------
# Google-Extended 同时控制：Gemini 训练 + Gemini Apps 的实时引用（grounding）
# + Vertex AI 的 Grounding with Google Search。不影响 AI Overviews / AI Mode。
# 想出现在 Gemini App 的引用里，就必须允许它（训练也会一并允许）。
# 如果你在第 4 段用了 __usage_ai-training 禁止训练，又没写 Google-Extended，
# Google 会当作你屏蔽了 Google-Extended，你会从 Gemini App 引用里消失。
# 推荐：独立开发者想要曝光，就显式允许：
User-agent: Google-Extended
Allow: /
# 反过来，只要 Google 搜索、不要 Gemini：改成 Disallow: /

# ---------- 6. 没把握的爬虫：按需取消注释 ----------
# Bytespider（字节跳动）：用途和 robots.txt 合规性有争议，没有官方文档说明它
# 和豆包回答的关系。挡了它是否影响豆包引用，本稿没查清。
# User-agent: Bytespider
# Disallow: /

# ---------- 7. 站点地图 ----------
Sitemap: https://example.com/sitemap-index.xml
```

说明：

- 第 1 到 3 段的写法（一组里多个 `User-agent:` 行，共用规则）符合 RFC 9309 的分组定义，IETF 草案也引用了这条 [S27]。
- 对 Grok 和 Perplexity 的隐身抓取，robots.txt 没有约束力 [S34][S41]，要靠 WAF。
- Search Console 的「Search generative AI」开关、Bing 的页面级 `ai-grounding` meta，都不在 robots.txt 里，要另外设置 [S11][S20]。

### 3.3 检查 CDN / WAF 有没有把 AI 爬虫挡在门外

robots.txt 写了允许，Cloudflare 的机器人防护照样可能拦截。Google 和 Perplexity 都提醒要检查 CDN 层 [S9][S33]。

1. 用 curl 模拟各家 UA，看返回码。返回 403、429 或验证页，说明被 WAF 拦了。注意：这只能测出"按 UA 拦截"的规则；按 IP 验证真实爬虫的规则，本地测不出来。
   ```bash
   #!/usr/bin/env bash
   # check-ai-ua.sh https://example.com/some-page
   URL="$1"
   declare -A UAS=(
     [OAI-SearchBot]="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot"
     [ChatGPT-User]="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot"
     [GPTBot]="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot"
     [PerplexityBot]="Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)"
     [Perplexity-User]="Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)"
     [Claude-User]="Mozilla/5.0 (compatible; Claude-User/1.0)"
     [MistralAI-Index]="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; MistralAI-Index/1.0; +https://docs.mistral.ai/robots)"
     [DuckAssistBot]="DuckAssistBot/1.2; (+http://duckduckgo.com/duckassistbot.html)"
     [meta-webindexer]="meta-webindexer/1.1"
     [Baiduspider]="Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
   )
   for name in "${!UAS[@]}"; do
     code=$(curl -s -o /dev/null -w "%{http_code}" -A "${UAS[$name]}" "$URL")
     printf "%-18s %s\n" "$name" "$code"
   done
   ```
   （Claude-User 的完整 UA 字符串 Anthropic 页面没有给出，上面是按惯例构造的，只用于测试 UA 规则。）
2. 在 Cloudflare 后台看 Security → Events，按 User-Agent 过滤 `OAI-SearchBot`、`PerplexityBot`、`Claude` 等，看有没有被 Block 或 Challenge。
3. 如果被拦，按 Perplexity 文档的方式写放行规则：UA 匹配加 IP 列表匹配，动作 Skip，放在拦截规则之前 [S33]。各家 IP 列表地址见第 2 节。

### 3.4 检查 robots.txt 是否按预期解析

```python
# robots_check.py  用法: python3 robots_check.py https://example.com /docs/page
import sys, urllib.robotparser
site, path = sys.argv[1].rstrip("/"), sys.argv[2]
rp = urllib.robotparser.RobotFileParser(site + "/robots.txt"); rp.read()
for ua in ["Googlebot","Bingbot","Applebot","OAI-SearchBot","ChatGPT-User","GPTBot",
           "Claude-SearchBot","Claude-User","ClaudeBot","PerplexityBot","Perplexity-User",
           "Google-Extended","Applebot-Extended","MistralAI-Index","MistralAI-Training",
           "meta-webindexer","meta-externalagent","DuckAssistBot","Baiduspider",
           "Bytespider","CCBot","__usage_ai-training"]:
    print(f"{ua:22} {'allow' if rp.can_fetch(ua, site + path) else 'BLOCK'}")
```

注意：Python 的 robotparser 会让 `__usage_ai-training` 落到 `*` 组，而 IETF 草案规定 `*` 不能匹配这个令牌 [S27]。所以这一行的输出只在你显式写了这个组时才有意义。

### 3.5 确认关键内容在原始 HTML 里

多数 AI 爬虫不执行 JS [S43]。用下面的命令看"不执行 JS 时能看到什么"：

```bash
# 关键内容（产品名、一句话介绍、价格、安装步骤）应该能在原始 HTML 里 grep 到
curl -s -A "Mozilla/5.0 (compatible; GPTBot/1.4)" https://example.com/ \
  | sed -e 's/<[^>]*>//g' | tr -s ' \n' | grep -i -n "你的产品名\|install\|价格" | head
```

- Astro 默认输出静态 HTML，天然满足。React / Vue 的客户端组件（`client:only`）里的内容爬虫看不到，介绍文字不要放在这类组件里。
- Chrome Web Store 页面、GitHub README 不受你控制，但它们会被 Googlebot 抓取。务必在自己的站点上有一个完整的、服务端渲染的产品页。

### 3.6 Google：Search Console 里点三个地方

1. **设置 → Search generative AI**：确认是"Include my site's links and content in Search generative AI features"（默认值）。如果你的域名属性曾被别人改过，子属性会继承父属性 [S11]。
2. **效果 → Generative AI performance（Search）**：看哪些页面在 AI Overviews / AI Mode 里被展示。只有展示次数，没有点击；2026-11-09 到 11 日数据偏低是已知 bug [S12][S19]。
3. **URL 检查**：确认重要页面已收录，且 Googlebot 看到的 HTML 里没有误加 `nosnippet` [S9]。

### 3.7 Bing：Bing Webmaster Tools

1. 验证站点（可以从 Google Search Console 导入）。
2. 打开 AI Performance（`bing.com/webmasters/aiperformance`，地址来自第三方指南 [S21 备注]），看引用次数、被引页面和 grounding 查询词 [S21]。
3. 数据足够时会出现 Topics Portfolio 标签页，看 Opportunity Queries：别人被引用、你没被引用的查询，可以拿来规划内容 [S22]。
4. 开启 IndexNow。Cloudflare 后台的 Crawler Hints 或在发布脚本里调用 IndexNow API，都能通知 Bing 更新 [S21]。
5. 如果你曾经用过 `noarchive` / `nocache`，2027-03-01 之前要换成新的 `ai-training` / `ai-grounding` 设置 [S20]。

### 3.8 ChatGPT：Business Hub

如果你符合条件（目前是美国的电商和在线服务商家），在 Business Hub 认领商家，用 DNS 验证，补全商家信息，看提及次数、点击数和"discovery topics" [S5]。不符合条件的，先在服务器日志里分别统计 OAI-SearchBot 和 ChatGPT-User 的请求数，作为代理指标 [S4]。

### 3.9 AI 流量统计：GA4 加服务器日志

1. GA4 → 管理 → 渠道组 → 新建自定义渠道"AI Assistants"，条件为来源匹配正则：
   ```
   chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|doubao\.com|yuanbao\.tencent\.com|kimi\.(com|moonshot\.cn)|chat\.deepseek\.com
   ```
   前五个来自从业者文章 [S69]；copilot 和中文平台的域名是本稿推测的，需要你用自己的数据核对。
2. 不要只信 UTM。ChatGPT 从 2026-10 起基本不带 UTM、不传 referrer [S4]；Gemini iOS App 不传 referrer [S17]。在"直接访问"里看深层落地页（比如某篇教程而不是首页）的异常增长，可能就是 AI 流量 [S4]。
3. 检查污染：来源是 chatgpt.com 但 referrer 是 google.com 的会话，可能是被 Google 收录的带 UTM 的链接 [S4]。
4. 服务器日志（Cloudflare Logpush 或 Workers 日志）按 UA 统计 AI 爬虫访问。下面的脚本对 combined 格式的访问日志分类计数：
   ```python
   # ai_bot_stats.py  用法: python3 ai_bot_stats.py access.log
   import re, sys, collections
   GROUPS = {
     "search":  ["OAI-SearchBot","Claude-SearchBot","PerplexityBot","MistralAI-Index",
                 "meta-webindexer","DuckAssistBot","Googlebot","bingbot","Applebot/","Baiduspider"],
     "user":    ["ChatGPT-User","Claude-User","Perplexity-User","MistralAI-User",
                 "meta-externalfetcher","Google-Agent","Claude-Agent","GeminiiOS","Google-GeminiNotebook"],
     "training":["GPTBot","ClaudeBot","MistralAI-Training","meta-externalagent","CCBot","Bytespider"],
   }
   c = collections.Counter()
   for line in open(sys.argv[1], errors="ignore"):
       ua = (re.findall(r'"([^"]*)"\s*$', line) or [""])[0]
       for g, names in GROUPS.items():
           for n in names:
               if n.lower() in ua.lower():
                   c[(g, n)] += 1
   for (g, n), k in sorted(c.items()):
       print(f"{g:9} {n:24} {k}")
   ```
   UA 可以伪造。要确认真伪，用各家公布的 IP 列表（OpenAI、Perplexity、DuckDuckGo、Anthropic SAIL、Google JSON）或反向 DNS（Applebot、Baiduspider）[S1][S33][S40][S26][S16][S38][S46]。

### 3.10 中文平台：内容放在哪里

本稿的证据只能支持以下做法（证据等级见括号）：

| 目标平台 | 建议的内容阵地 | 依据 |
|---|---|---|
| 豆包 | 抖音短视频、今日头条文章，同时保留高质量的独立站点 | 白杨SEO 观察（C）[S48]，营销文章（D）[S49]，艾瑞 App 端偏短视频（B）[S50] |
| 腾讯元宝 | 微信公众号、视频号；搜狗能索引到的站点（知乎内容也通过搜狗进入） | App Store 官方描述（A）[S54]，智谱文档对搜狗的描述（A）[S57]，2024 研报（C）[S53] |
| 百度文心 / 百度 AI 搜索 | 百度系（百家号、百科、知道）和短视频；保证 Baiduspider 能抓官网 | 营销文章（D）[S49]，艾瑞（B）[S50]，百度官方 UA（A）[S46] |
| DeepSeek、千问 | 领域内的权威垂类平台；开发者产品可以试 CSDN、知乎、掘金（推论） | 艾瑞（B）[S50]；开发者领域没有数据 |
| Kimi | 结构完整的长文、白皮书、官方文档；英文文档也可能被检索 | Kimi 官方帮助（A）[S55] |
| 智谱清言 | 搜狗和夸克能索引到的内容，含知乎 | 智谱官方文档（A）[S57] |

检查方法：在每个平台开启联网搜索，用 20 到 50 个真实用户问题提问，记录引用了哪些域名。腾讯云社区文章也指出，被抓取不等于被引用，只能靠模拟提问观察 [S62]。

---

## 4. 结合 AI 怎么做

### 4.1 让 AI 生成并审查你的 robots.txt

```text
你是网站运维助手。我有以下站点：
- 主站 example.com（Astro 静态站，部署在 Cloudflare Pages）
- 文档站 docs.example.com
- 会员站 app.example.com（需要登录，/dashboard/ 和 /api/ 不应被任何爬虫访问）

请按下面的分类写 robots.txt，每个子域名一份，每行加中文注释：
1. 传统搜索：Googlebot、Bingbot、Applebot、Baiduspider 允许。
2. AI 搜索索引：OAI-SearchBot、Claude-SearchBot、PerplexityBot、MistralAI-Index、
   meta-webindexer、DuckAssistBot 允许。
3. 用户触发：ChatGPT-User、Claude-User、Perplexity-User、MistralAI-User 允许。
4. 训练：我选择【禁止 / 允许】。禁止时同时写 __usage_ai-training 和各家专用令牌。
5. Google-Extended：我【需要 / 不需要】出现在 Gemini App 的引用里。

硬性规则：
- 写了专门组的爬虫不再读 * 组，所以每个专门组都要重复写私有路径的 Disallow。
- 不要编造我没列出的爬虫名。如果你认为还应该加别的，单独列在最后并说明出处。
- 最后列出一张表：每个 UA、在每个子域名的根路径和 /dashboard/ 是 allow 还是 block。
```

拿到结果后，用 3.4 节的脚本逐个验证，不要直接相信 AI 写的表。

### 4.2 让 AI 分析服务器日志

```text
附件是我网站最近 30 天的访问日志（Cloudflare Logpush JSON）。请写一个 Python 脚本并运行：
1. 按 UA 把请求分成：传统搜索、AI 搜索索引、用户触发、训练、未知机器人、人类。
   分类名单用：[粘贴 3.9 节的 GROUPS]。
2. 对声称是 OAI-SearchBot、ChatGPT-User、GPTBot、PerplexityBot、Perplexity-User 的请求，
   下载官方 IP 列表核对真伪：
   https://openai.com/searchbot.json、https://openai.com/chatgpt-user.json、
   https://openai.com/gptbot.json、https://www.perplexity.ai/perplexitybot.json、
   https://www.perplexity.ai/perplexity-user.json
3. 输出：每类每天的请求数；被 AI 用户触发抓取最多的 20 个 URL；
   返回 4xx/5xx 最多的 AI 爬虫请求；疑似伪装（UA 是 Chrome 但 1 秒内大量请求、来自数据中心 IP）。
4. 被用户触发抓取最多的 URL，就是 AI 回答最常读的页面。列出来，我要优先改进它们。
```

### 4.3 让 AI 帮你做跨平台引用测试

```text
我的产品是【一句话介绍，比如"一个把网页一键保存到 Obsidian 的 Chrome 插件"】，
官网 example.com，竞品有 A、B、C。

请生成 40 个真实用户会问的问题，分四类，每类 10 个：
1. 不提品牌的需求问题（"有什么插件能把网页存到 Obsidian"）
2. 对比问题（"A 和 B 哪个好"）
3. 操作问题（"怎么把知乎文章存到 Obsidian"）
4. 品牌问题（"【我的产品名】安全吗"）
中文和英文各一份。不要用营销语气，要像真人在搜索框里打的字。

然后给我一张记录表，列：问题、平台（ChatGPT、Perplexity、Gemini、Claude、Copilot、
豆包、DeepSeek、Kimi、元宝、千问）、是否提到我、是否引用 example.com、引用了哪些域名、
日期。我会手动填。
```

每月跑一次同样的问题，比较变化。不要用脚本批量自动查询平台来"刷"数据，红皮书把这列为风险行为 [S59]。

### 4.4 让 AI 检查页面在"不执行 JS"时是否完整

```text
下面是同一个页面的两份内容：
A. curl 拿到的原始 HTML（不执行 JS）：[粘贴]
B. 浏览器渲染后 document.body.innerText：[粘贴]
请列出 B 里有而 A 里没有的所有信息，按重要性排序（产品名、功能、价格、安装步骤、FAQ 优先）。
对每一项，告诉我在 Astro 里怎么改成构建时输出到 HTML（比如把 client:only 组件里的文字移到 .astro 模板）。
```

### 4.5 让 AI 维护一份"平台变化追踪"

```text
请访问并阅读以下官方页面，和我上次保存的版本（附件）比较，列出有变化的地方：
- https://platform.openai.com/docs/bots
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers
- https://support.claude.com/en/articles/8896518
- https://docs.perplexity.ai/guides/bots
- https://docs.mistral.ai/robots
- https://support.apple.com/en-us/119829
- https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers
- https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot
重点看：新增或改名的 UA、robots.txt 行为说明的变化、IP 列表地址变化、
__usage_ai-training 支持状态。只报告原文里能看到的变化，引用原句。
```

适合交给 Claude Code 或 ChatGPT agent 每月跑一次。

---

## 5. 误区和争议

1. **"屏蔽 GPTBot 就进不了 ChatGPT"**。错。GPTBot 只管训练，ChatGPT 搜索看 OAI-SearchBot [S1]。反过来，只放 GPTBot、挡 OAI-SearchBot，也进不了 ChatGPT 搜索。
2. **"屏蔽 Google-Extended 只是不让 Google 训练，没有代价"**。不完全对。它同时让你退出 Gemini App 的实时引用 [S14][S15]。它不影响 AI Overviews 和 AI Mode [S15]。
3. **"想退出 AI Overviews 只能 noindex"**。2026-08-31 之后不对了。Search Console 有专门开关，可以只退出生成式功能、保留普通搜索 [S11]。
4. **"ChatGPT 用的就是 Bing，做好 Bing 就行"**。2024 年的说法，已过时。2026 年的厂商研究显示 ChatGPT 主要用自建索引加多个来源，Bing 主要在 Deep Research 里出现 [S2][S3]。（厂商研究，未经 OpenAI 确认。）
5. **"robots.txt 能挡住所有 AI"**。错。用户触发类多数声明可能不遵守 [S1][S33][S37][S16]；Perplexity 被指控用隐身爬虫 [S34]；Grok 的请求伪装成普通浏览器 [S41]。
6. **"加了 llms.txt，Google AI 就会用"**。Google 官方明确说 Google Search 忽略 llms.txt [S10]。其他平台是否使用，本稿没有找到官方说明。
7. **"Claude 只看 Brave，Google 排名无所谓"**。前半句基本成立 [S30][S31]，后半句错：Brave 只抓 Googlebot 能抓的页面 [S32]，Profound 的数据也显示 Claude 引用和 Google 排名有关联 [S30]。
8. **"UTM 能统计 AI 流量"**。2026-10 以后 ChatGPT 基本不带 UTM [S4]，Gemini 的 UTM 只存在了三周 [S17][S18]。UTM 只能算下限。
9. **"Claude 引用和 Brave 前 10 重合 86.7%"**。这个流传很广的数字只来自 2025-03 的 15 个结果。2026-06 的约 400 个查询复测是 79.2% [S30]。
10. **中文 GEO 文章里的平台信源比例**（"DeepSeek 知乎占 25%"、"豆包 60% 来自头条抖音"、"文心百度系占 44%"等）。多数来自卖发稿服务的营销文章，引用的原始报告（新榜智汇等）本稿找不到 [S49]。可以当作方向参考，不要当作事实写进网站。
11. **"GEO 服务商能保证 AI 推荐"**。Bing 指南原话：GEO 不保证引用，就像 SEO 不保证排名 [S23]。腾讯云社区文章：不存在能保证 100% 被引用的手段 [S62]。红皮书列举了伪造测评、AI 互相引用、刷查询指标等黑帽风险 [S59]。
12. **"Bing 的 noarchive / nocache 可以长期控制 Copilot"**。2027-03-01 之后不再作为训练和 grounding 偏好 [S20]。
13. **"为每个 fan-out 查询做一个页面能多被引用"**。Google 明确说这违反 scaled content abuse 政策 [S10]。

---

## 6. 还没查清的问题

1. **ChatGPT Atlas 是否已经下线。** 搜索结果里出现了 TechSpot 的标题"ChatGPT Atlas lasted less than a year"[S72]，但本稿没能打开原文，OpenAI 页面也抓不到。
2. **ChatGPT agent / Atlas agent 模式的身份。** OpenAI 爬虫页面没列 agent 专用 UA [S1]。2025 年曾有 ChatGPT agent 用 HTTP 消息签名（Web Bot Auth）的说法，本稿没有核实。
3. **OpenAI 何时支持 `__usage_ai-training`。** 只有"in the coming months"的二手报道 [S28][S29]，OpenAI 爬虫页面目前没有提到 [S1]。
4. **GPTBot 是否已开始执行 JavaScript。** 只有一条二手转述的 Forge 报告 [S44]。
5. **Copilot、Perplexity、Claude 的引荐流量具体带什么 referrer 或 UTM。** 没找到官方文档。GPT-6 去掉 UTM 是否是有意为之，OpenAI 没有说明 [S4]。
6. **DeepSeek、千问、豆包 App 的联网搜索用哪家后端，能否引用海外网站。** 官方都没说明 [S66]。只有 Kimi 官方说能检索英文和日文资料 [S55]。需要实测：在各平台问一个只有英文网站才有答案的问题，看引用了什么。
7. **Bytespider 和豆包回答的关系。** 没有 ByteDance 官方爬虫文档。挡 Bytespider 会不会影响豆包引用，不清楚。
8. **百度是否有单独的 AI 训练或 AI 回答开关。** 没找到。
9. **搜狗爬虫（Sogou web spider）、360 爬虫、夸克爬虫的 UA 和 robots.txt 行为。** 本稿没有核实，所以没写进 robots.txt 模板。它们通过默认组 `*` 被允许。
10. **开发者产品领域（插件、开源工具、提示词）在中文 AI 平台的引用来源分布。** 没有找到大样本数据，只有汽车行业的艾瑞测评 [S50]。
11. **Cloudflare 对 AI 爬虫的默认设置。** 用户站点在 Cloudflare 上。Cloudflare 有 AI 爬虫托管拦截规则 [S34]，搜索结果里还出现过"Cloudflare 让网站在不挡 Googlebot 的情况下禁止 AI 训练"的 SEJ 标题，但本稿没有打开原文，也没有核实 Cloudflare 新建域名是否默认拦截 AI 爬虫、托管 robots.txt 写了什么。**这一项对用户最直接，建议下一轮优先查 Cloudflare 官方文档并看自己的后台。**
12. **xAI 是否有官方爬虫文档。** 第三方目录互相矛盾 [S45]，StackFox 称从没在日志里见过 Grok 的声明 UA [S41]。
13. **元宝搜索上线的年份。** 报道只写"11 月 11 日" [S52]。
14. **Mistral 的 Le Chat 是否已改名为 Vibe。** 官方爬虫页只提 Vibe [S39]。
15. **Bing AI Performance 的"select partner integrations"具体包括哪些产品**，第三方说法不一致 [S21]。
16. **Search Console 开关之外，Google 是否提供页面级"只退出 AI 功能"的方法。** 目前只有 nosnippet 系列（会同时影响普通摘要）[S9]。

---

## 7. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | Overview of OpenAI Crawlers | OpenAI | 2026（抓取于 2026-11-14） | https://platform.openai.com/docs/bots | 官方文档（已读原文） | A | OAI-SearchBot、GPTBot、ChatGPT-User、OAI-AdsBot 的用途、UA、IP 列表；设置相互独立，搜索约 24 小时生效 |
| S2 | ChatGPT has its own search index — the Labrador family | Peec（AI 可见度工具厂商） | 2026-09 | https://docs.peec.ai/research/chatgpt-own-search-index-labrador.md | 厂商研究（已读原文） | C | 服务端事件中 result_source 有 Labrador、Bright、Oxylabs、SERP 四值；利益相关 |
| S3 | Where ChatGPT search results come from | Peec | 2026-09 | https://docs.peec.ai/research/chatgpt-search-result-providers.md | 厂商研究（已读原文） | C | ChatGPT 混用自建索引、Google 抓取、Web IQ、Yelp、TripAdvisor 等至少 8 个来源；利益相关 |
| S4 | ChatGPT didn't stop sending traffic. It stopped signing it | Limy（厂商） | 2026-10 | https://limy.ai/blog/chatgpt-didn-t-stop-sending-traffic.-it-stopped-signing-it | 厂商数据分析（已读原文） | C | GPT-6 后 utm_source=chatgpt.com 降 65%，引用只降 6%，约 500 页的流量转入直接访问；利益相关 |
| S5 | Businesses in ChatGPT Business Hub Live With Click Data | Search Engine Roundtable | 2026-11 | https://www.seroundtable.com/chatgpt-business-hub-42505.html | 行业新闻，引用 OpenAI 原文（已读原文） | C | ChatGPT Business Hub 显示提及次数、点击数、discovery topics，DNS 或电话验证，先限美国 |
| S6 | Introducing ChatGPT Atlas | Simon Willison | 2025-10-21 | https://simonwillison.net/2025/Oct/21/introducing-chatgpt-atlas/ | 从业者实测（搜索结果） | C | Atlas UA 与 macOS Chrome 相同 |
| S7 | ChatGPT Atlas | HUMAN Security | 2025 | https://www.humansecurity.com/ai-agent/chatgpt-atlas/ | 安全厂商页面（搜索结果） | C | Atlas 无公开签名身份，无专门 robots.txt 令牌；利益相关 |
| S8 | ChatGPT Atlas（AI Agent Index） | MIT AI Agent Index | 2025 | https://aiagentindex.mit.edu/2025/chatgpt-atlas | 学术索引条目（搜索结果） | C | Atlas 搜索与摘要依赖 OAI-SearchBot |
| S9 | AI features and your website | Google Search Central | 更新于 2025-12-10 | https://developers.google.com/search/docs/appearance/ai-features | 官方文档（已读原文） | A | AI Overviews / AI Mode 无额外要求；需可收录且可显示摘要；query fan-out；数据计入 Web 类型 |
| S10 | Optimizing your website for generative AI features on Google Search | Google Search Central | 更新于 2026-07-10 | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | 官方文档（已读原文） | A | non-commodity 内容；llms.txt 被忽略；不需 chunking；需在 Search Console 开关中为"包含" |
| S11 | Search generative AI control | Google Search Console 帮助 | 2026-08-31 全球上线 | https://support.google.com/webmasters/answer/16908024 | 官方文档（已读原文） | A | 可整站排除出 AI Overviews、AI Mode、Discover 生成式功能，1 到 2 天生效，不影响排名与训练 |
| S12 | Generative AI performance report (Search) | Google Search Console 帮助 | 2026 | https://support.google.com/webmasters/answer/16984139 | 官方文档（已读原文） | A | 只有展示次数；覆盖 AI Overviews 与 AI Mode；按页面、国家、设备、日期 |
| S13 | Introducing Search Generative AI performance reports in Search Console | Google Search Central Blog | 2026-06-03 | https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports | 官方博客（已读原文） | A | 报告发布，2026-08-31 全球上线 |
| S14 | Supporting a shared AI training control for websites | Google Search Central Blog（John Mueller） | 2026-10-30 | https://developers.google.com/search/blog/2026/10/ai-training-control | 官方博客（已读原文） | A | 支持共享训练令牌；未写 Google-Extended 时视同屏蔽；允许 Google-Extended 才能在 Gemini Apps 被引用 |
| S15 | Google common crawlers（Google-Extended 等） | Google Crawling Infrastructure | 更新于 2026-10-30 | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | 官方文档（已读原文） | A | Google-Extended 管 Gemini 训练和 Gemini Apps / Vertex grounding，不影响搜索；early 2027 支持 __usage_ai-training |
| S16 | Google User-Triggered Fetchers | Google Crawling Infrastructure | 更新于 2026-08-19 | https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers | 官方文档（已读原文） | A | Google-Agent、Google-GeminiNotebook 的 UA 与 IP 列表；Web Bot Auth 试验 |
| S17 | Google Gemini Stopped Attaching UTM Parameters To Cited URLs | Search Engine Roundtable | 2026-10-30 | https://seroundtable.com/gemini-utm-parameters-42399.html | 行业新闻（已读原文） | C | utm_source=gemini 约 9-28 消失；桌面传 referrer，iOS App 不传 |
| S18 | Google Gemini drops UTM tags from cited links after three weeks | PPC Land | 2026-11-01 | https://ppc.land/google-gemini-drops-utm-tags-from-cited-links-after-three-weeks/ | 行业新闻（已读原文） | C | 一位顾问日志中带标签访问峰值每天 83 次，次日降到 3 次 |
| S19 | Daily Search Forum Recap: November 13, 2026 | Search Engine Roundtable | 2026-11-13 | https://www.seroundtable.com/recap-11-13-2026-42531.html | 行业新闻汇总（已读原文） | C | Gemini 4 Hydrogen 进入搜索；Gen AI 报告 11-09 到 11 数据 bug；Google 新 referrer 帮助文档 |
| S20 | Your content, your choice: clearer preferences for training and grounding | Microsoft Bing（Krishna Madhavan） | 2026-10-30 | https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/ | 官方博客（已读原文） | A | ai-training / ai-grounding 页面级 meta 与 X-Robots-Tag 语法；DisallowExtended；2027-02-01 生效，2027-03-01 弃用旧标签 |
| S21 | Introducing AI Performance in Bing Webmaster Tools Public Preview | Bing Webmaster Blog | 2026-02-11 | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 官方博客（已读原文） | A | 引用数、被引页面、grounding 查询词；覆盖 Copilot、Bing AI 摘要与部分合作方。备注：19,717 次引用案例与后台地址来自搜索结果中的 searchinfluence.com 与第三方指南 |
| S22 | Introducing Topics Portfolio (Beta) in AI Performance | Bing Webmaster Blog | 2026-10-13 | https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/ | 官方博客（已读原文） | A | grounding 查询聚类成主题；Opportunity Queries |
| S23 | Bing Adds GEO To Official Guidelines, Expands AI Abuse Definitions | Search Engine Journal | 2026-02 | https://www.searchenginejournal.com/bing-adds-geo-to-official-guidelines-expands-ai-abuse-definitions/568442/ | 行业新闻，转述官方指南（已读原文） | C | Bing 指南写入 GEO 定义；单主题页面、事实直述、关键信息靠前 |
| S24 | Announcing new options for webmasters to control usage of their content in Bing Chat | Bing Webmaster Blog | 2023-09 | https://blogs.Bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat | 官方博客（搜索结果） | X | noarchive / nocache 控制 Bing Chat；2027-03-01 起被新偏好取代（见 S20） |
| S25 | Does Anthropic crawl data from the web, and how can site owners block the crawler? | Anthropic | 2026（含 2026-10-30 更新） | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | 官方文档（已读原文） | A | ClaudeBot、Claude-User、Claude-SearchBot；支持 Crawl-delay；2026-10-30 起识别 AIPREF，ClaudeBot 规则优先 |
| S26 | How do Anthropic-hosted browsers identify themselves when they browse the web on a user's behalf? | Anthropic | 2026 | https://support.claude.com/en/articles/18234133-how-do-anthropic-hosted-browsers-identify-themselves-when-they-browse-the-web-on-a-user-s-behalf | 官方文档（已读原文） | A | Claude-Agent UA 标记；IP 在 claude.com/.well-known/sail |
| S27 | Machine-Readable Training Preference Signal（draft-kelley-aipref-training-preference-signal-00） | IETF（K. Kelley, Anthropic） | 2026-10-30 | https://www.ietf.org/archive/id/draft-kelley-aipref-training-preference-signal-00.html | 标准草案（已读原文） | A | __usage_ai-training 语法；* 不匹配；无组即无偏好；非抓取指令；无正式标准地位，2027-05-03 到期 |
| S28 | Google, Anthropic and others to support new AI crawling opt-out standard | SiliconANGLE | 2026-10-30 | https://siliconangle.com/google-anthropic-and-others-to-support-new-ai-crawling-opt-out-standard | 新闻（已读原文） | C | OpenAI、Microsoft 数月内支持，Google 明年；Meta 只表态支持；Microsoft 另设 AI Grounding |
| S29 | Google, OpenAI, Anthropic and Microsoft back one AI opt-out | gagadget | 2026-10/11 | https://gagadget.com/en/732472-google-openai-anthropic-and-microsoft-back-one-ai-opt-out/ | 新闻（已读原文） | C | 各家时间表：Anthropic 已开始，OpenAI 未定，Microsoft 2027-02-01，Google 2027 |
| S30 | Anthropic Lists Two Web-Search Subprocessors Behind Claude — and the GEO Playbook Missed the Second | xponent21（Isaac Marcuson） | 2026（复查于 2026-07-02） | https://xponent21.com/insights/claude-web-search-brave-turbopuffer/ | 从业者分析，转述 Profound、Yext、Muck Rack 数据（已读原文） | C | Brave 仍是后端，新增 turbopuffer；Profound 约 400 查询复测重合 79.2%；Claude 搜索触发率 36.6% |
| S31 | Anthropic appears to be using Brave to power web searches | Simon Willison | 2025-03-21 | https://simonwillison.net/2025/Mar/21/anthropic-use-brave/ | 从业者实测（已读原文） | C | 子处理方名单加入 Brave；引用与 Brave 结果一致；BraveSearchParams |
| S32 | Brave Search Crawler | Brave | 2026（抓取于 2026-11-14） | https://search.brave.com/help/brave-search-crawler | 官方文档（已读原文） | A | 无独立 UA；Googlebot 不能抓的它也不抓；robots.txt 不能下架，要用 noindex |
| S33 | Perplexity Crawlers | Perplexity | 2026（抓取于 2026-11-14） | https://docs.perplexity.ai/guides/bots | 官方文档（已读原文） | A | PerplexityBot 与 Perplexity-User 的 UA、IP；Perplexity-User generally ignores robots.txt；WAF 放行写法 |
| S34 | Perplexity is using stealth, undeclared crawlers to evade website no-crawl directives | Cloudflare | 2025-08-04 | https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/ | 厂商实验与网络数据（页面正文由脚本加载，内容经 S35 与搜索摘要核对） | B | 数万域名、每天数百万请求；被挡后伪装 Chrome 并轮换 IP 与 ASN；利益相关 |
| S35 | Cloudflare accuses Perplexity of secretly crawling sites despite explicit blocks | The Decoder | 2025-08 | https://the-decoder.com/cloudflare-accuses-perplexity-of-secretly-crawling-sites-despite-explicit-blocks/ | 新闻（已读原文） | C | 复述 Cloudflare 实验细节；ChatGPT 读到 robots.txt 后停止 |
| S36 | Perplexity launches $5 monthly Comet Plus sharing 80% revenue with publishers | CO/AI | 2025-08 | https://getcoai.com/news/perplexity-launches-5-monthly-comet-plus-sharing-80-revenue-with-publishers | 新闻（搜索结果） | C | Comet Plus 80% 分成，初始池 4,250 万美元，按访问、引用、代理操作分配 |
| S37 | Meta Web Crawlers | Meta for Developers | 2026（抓取于 2026-11-14） | https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers | 官方文档（已读原文） | A | meta-webindexer 用于 Meta AI 引用；meta-externalagent 训练；meta-externalfetcher 可能绕过 robots.txt；24 小时缓存 |
| S38 | About Applebot | Apple | 2026（抓取于 2026-11-14） | https://support.apple.com/en-us/119829 | 官方文档（已读原文） | A | Applebot-Extended 只管训练；nosnippet 退出 AI 知识回答；未写 Applebot 时跟随 Googlebot 规则；会渲染 JS |
| S39 | Mistral crawlers | Mistral AI | 2026（抓取于 2026-11-14） | https://docs.mistral.ai/robots | 官方文档（已读原文） | A | MistralAI-User、MistralAI-Index、MistralAI-Training 三分法；产品称为 Vibe |
| S40 | Is DuckAssistBot related to DuckDuckGo? | DuckDuckGo | 2026（抓取于 2026-11-14） | https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot | 官方文档（已读原文） | A | DuckAssistBot 实时抓取供 AI 回答，不用于训练，禁止后 72 小时生效 |
| S41 | Grok's crawler never uses its documented user agents | StackFox（@TheStackFox） | 2026-02 | https://stackfox.co/research/grok-user-agent | 从业者受控测试（已读原文） | C | Grok 抓取伪装成 Chrome 139、iPhone Safari、Go-http-client，来自代理网络 |
| S42 | Web Search tool（xAI API） | xAI | 2026（抓取于 2026-11-14） | https://docs.x.ai/docs/guides/tools/search-tools | 官方文档（已读原文） | A | Grok 有 Web Search 与 X Search 工具，支持 allowed / excluded domains，示例用 grokipedia.com |
| S43 | The rise of the AI crawler | Vercel 与 MERJ | 2024-12 | https://vercel.com/blog/the-rise-of-the-ai-crawler | 大样本日志研究（已读原文） | B | 一个月 GPTBot 5.69 亿、Claude 3.7 亿次请求；GPTBot 与 ClaudeBot 不执行 JS；Gemini 与 Applebot 渲染。2024 年数据，需关注更新 |
| S44 | JavaScript SEO: What Google and AI Crawlers Actually See | GEO Toolbox | 2026 | https://geotoolbox.ai/blog/javascript-seo | 博客转述第三方测试（搜索结果） | D | 转述 Forge 测试：GPTBot 可能自 2026-09-25 渲染；ChatGPT-User 37,045 次读取 0 次脚本请求 |
| S45 | Crawlability（AI bot 列表） | Peec | 2026 | https://docs.peec.ai/crawlability.md | 厂商产品文档（已读原文） | C | 40 多个 AI 爬虫的分类表，含 YouBot、GrokBot、DeepSeekBot、Manus-User 等；分类未经各家确认 |
| S46 | 【官方说法】只需两步，正确识别百度蜘蛛（User-Agent） | 百度搜索资源平台 | 未标日期（抓取于 2026-11-14） | https://ziyuan.baidu.com/college/articleinfo?id=1002 | 官方文档（已读原文） | A | Baiduspider/2.0、Baiduspider-render/2.0、Smartapp UA；IP 不公开；反向 DNS 验证 |
| S47 | 火山引擎上线豆包搜索服务：为 Agent 提供实时、权威、可信的搜索能力 | IT之家 | 2026-07-28 | https://www.ithome.com/0/982/610.htm | 新闻，转述官方发布（已读原文） | C | 融合字节独家内容；按站点和创作者分级信源；国内九成头部手机厂商助手在用 |
| S48 | 白杨SEO：说一些变化，关于豆包，公众号，搜一搜，小红书AI结果点点，GEO，媒体信源名单等 | 白杨SEO（网易号） | 2026 | https://www.163.com/dy/article/L33F1BA90511C9KT.html | 从业者观察（已读原文） | C | 豆包引用来源近期变成以抖音短视频为主；豆包搜索服务即原联网能力改名 |
| S49 | GEO 软文怎么写更容易被 AI 引用？六大AI平台偏好与GEO发稿平台选型指南 | 凤凰网（自媒体） | 2026 | https://tech.ifeng.com/c/8w7E7F5YWtG | 营销文章（已读原文） | D | 各平台信源比例（引用新榜智汇、QuestMobile），原始报告未找到；文末推广发稿平台 |
| S50 | 2026年汽车行业AI信源影响力指数报告 | 艾瑞咨询（经 36氪 发布） | 2026-06-15 | https://www.36kr.com/p/3853790497035271 | 大样本测评（已读原文） | B | 5 平台 PC 与 App 共 40 万次提问；各平台信源偏好差异；可能存在商业合作未披露 |
| S51 | 五大AI平台解答汽车问题 七成以上信源来自汽车垂类媒体 | CNMO（腾讯新闻转载） | 2026-07-27 | https://news.qq.com/rain/a/20260727A03U4L00 | 新闻（已读原文） | C | 测评方法：2026-05-18 到 28，4 万问题，人工提问；垂类媒体占前 20 的 77.2% |
| S52 | 腾讯全新搜索产品"元宝搜索"正式上线，能搜微信公众号、视频号 | 凤凰网（转 IT之家） | 11 月 11 日（年份未标；07-S10 核实为 2026-11-11） | https://tech.ifeng.com/c/8xxy9p18wmX | 新闻（已读原文） | C | so.qq.com；千亿级索引；覆盖公众号、视频号、学术；接入 157 个权威信源 |
| S53 | 国信证券研报（腾讯元宝相关） | 国信证券 | 2024-05-31 | https://pdf.dfcfw.com/pdf/H3_AP202405311635070432_1.pdf | 券商研报（搜索结果） | C | 元宝接入微信搜一搜和搜狗搜索；2024 年资料，可能过时 |
| S54 | 腾讯元宝（App Store 介绍） | 腾讯 | 2025-2026 | https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AF%E5%85%83%E5%AE%9D-deepseek-r1%E6%9C%80%E6%96%B0%E6%A8%A1%E5%9E%8B%E6%8E%A5%E5%85%A5/id6480446430 | 官方应用描述（搜索结果） | A | 联网搜索公众号、视频号等腾讯生态信源 |
| S55 | Kimi Agentic 搜索介绍 | 月之暗面 | 2026（抓取于 2026-11-14） | https://www.kimi.com/zh-cn/help/features/search | 官方文档（已读原文） | A | 100+ 可信来源；剔除低质聚合站和未证实自媒体；可检索英文、日文资料 |
| S56 | Moonshot Kimi: AI engine profile | GEO Compass（guptadeepak.com） | 2026-10-14 | https://guptadeepak.com/geo-compass/engines/moonshot-kimi/ | 个人站点资料（已读原文） | D | Moonshot 未公开搜索索引；长上下文偏好结构完整的长页 |
| S57 | 网络搜索（Web Search） | 智谱 AI 开放平台 | 2025-2026 | https://docs.bigmodel.cn/cn/guide/tools/web-search | 官方文档（已读原文） | A | 自研引擎加搜狗、夸克；搜狗覆盖腾讯生态和知乎 |
| S58 | 近四成中国网民手机装AI，豆包月活逼近3.5亿……2026年一季度AI应用价值榜 | 每日经济新闻与 QuestMobile | 2026-04-21 | https://www.nbd.com.cn/articles/2026-04-21/4350446.html | 行业数据（已读原文） | B | 豆包月活 3.45 亿，千问 1.66 亿，DeepSeek 1.27 亿，元宝 5,734.6 万；Kimi、智谱掉出榜单 |
| S59 | GEO红皮书（2026）：生成式引擎优化的边界、风险与治理 | 每经 AI 智库等 | 2026-06 | https://www.nbd.com.cn/reports/geo-red-book-2026.html | 行业指南（已读原文） | C | 黑帽 GEO 风险清单与"绿色行为"；国内重点平台为豆包、DeepSeek、Kimi、元宝、千问 |
| S60 | 知网状告AI搜索：搜到我家论文题目和摘要，你侵权了！ | 量子位 | 2024-08 | https://www.qbitai.com/2024/08/179773.html | 新闻（已读原文） | C | 秘塔学术板块只收题录摘要；知网要求断链 |
| S61 | 下手帮你干活直接交付结果 纳米AI超级搜索智能体发布 | 每日经济新闻 | 2025-06-12 | https://www.nbd.com.cn/articles/2025-06-12/3905483.html | 新闻（已读原文） | C | 跨平台搜索小红书、抖音、淘宝、京东、雪球等；内置 80 多款模型 |
| S62 | AI 搜索引擎优化主要适配哪些国内主流 AI 大模型？ | 腾讯云开发者社区（个人作者） | 2026 | https://cloud.tencent.com/developer/article/2730895 | 观点文章（已读原文） | D | 抓取不等于引用；不存在保证被引用的手段；部分模型优先自有生态 |
| S63 | DeepSeek 读取 GitHub 代码失败后编造内容 | 80aj.com（转载） | 2026-08-08 | https://www.80aj.com/2026/08/08/deepseek-github-code-hallucination/ | 个人反馈（搜索结果） | C | GitHub 链接读取失败，换 raw.githubusercontent.com 后成功；失败时未报错直接编造 |
| S64 | Baidu blocks Google, Bing from scraping content amid demand for data used on AI projects | South China Morning Post | 2024-08 | https://scmp.com/tech/big-tech/article/3275717/baidu-blocks-google-bing-scraping-content-amid-demand-data-used-ai-projects | 新闻（搜索结果） | X（07-S63 实测百度百科现行 robots.txt 已放行 Google、Bing） | 百度百科 robots.txt 禁止 Googlebot 与 Bingbot |
| S65 | What is Bytespider? The Web Crawler That Breaks the Rules | Pepper（厂商博客） | 2025-2026 | https://www.pepper.inc/blog/bytespider-explained/ | 厂商博客（搜索结果） | D | 多方称 Bytespider 不遵守 robots.txt，也有相反说法；「无官方文档」已被 07-S27（头条搜索站长平台的官方爬虫页）推翻 |
| S66 | DeepSeek 隐私政策 | DeepSeek | 2026（抓取于 2026-11-14） | https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html | 官方文档（已读原文） | A | 只说会为搜索服务接收用户输入，未说明搜索服务商 |
| S67 | Microsoft Bing New AI Controls With AI Training From AI Search Grounding | Search Engine Roundtable | 2026-10-30 | https://seroundtable.com/microsoft-bing-ai-controls-42429.html | 行业新闻（已读原文） | C | 训练、Grounding、Limited Grounding 三设置与时间表；给出 Bing FAQ 链接 |
| S68 | Bing Webmaster Blog RSS（含 data-nosnippet 支持等文章列表） | Microsoft Bing | 2025-10 到 2026-10 | https://blogs.bing.com/webmaster/feed | 官方博客目录（已读原文） | A | 2025-10-15 Bing 支持 data-nosnippet；IndexNow 相关文章 |
| S69 | Measuring AI referral traffic in web analytics | Digital Power（Medium） | 2025-2026 | https://medium.com/@digitalpower/measuring-ai-referral-traffic-in-web-analytics-23e11f8a1da3 | 从业者文章（搜索结果） | D | GA4 自定义渠道正则 chatgpt.com、perplexity.ai、claude.ai、gemini.google.com |
| S70 | Google Gemini Adds UTM Parameters For Referral Attribution | Search Engine Journal | 2026-10-01 | https://www.searchenginejournal.com/google-gemini-adds-utm-parameters-for-referral-attribution/ | 行业新闻（搜索结果） | C | 报道 Gemini 加 UTM，时间上与 S17 的"已停止"冲突 |
| S71 | Google Tests Dropping AI Mode From Search Bar & Ask Anything | Search Engine Roundtable | 2026-11 | https://www.seroundtable.com/google-dropping-ai-mode-again-42534.html | 行业新闻（已读原文） | C | Google 测试移除搜索栏 AI Mode 标签和 AIO 追问框 |
| S72 | ChatGPT Atlas lasted less than a year, but AI... | TechSpot | 2026 | https://www.techspot.com/news/113093-chatgpt-atlas-lasted-less-than-year-but-ai.html | 新闻标题（搜索结果，正文未能打开） | D | 只看到标题，暗示 Atlas 可能已停止；未核实 |
