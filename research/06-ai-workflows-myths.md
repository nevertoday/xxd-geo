# 06 借助 AI 做 GEO，以及误区与官方立场

调研日期：2026-11-14。本稿覆盖三块：一是开发者怎么用 Claude Code、Cursor、ChatGPT、Codex 跑 GEO 工作流（附中文提示词）；二是 AI 写内容的边界和 Google 的政策；三是各平台的官方说法、流行误区和中国 GEO 乱象。

说明：本次调研中途 WebSearch 配额用尽，最后一批核对（Claude 用哪家搜索索引、BrightEdge 和 Authoritas 的重合率数字）没能完成，已放进「还没查清的问题」。OpenAI 的 Publishers FAQ 页面对抓取返回 403，相关内容来自搜索结果摘要，已在出处表中注明。

---

## 1. 一段话总结

1. **Google 的官方口径已经写进文档：给生成式 AI 搜索做优化「仍然是 SEO」。** 2026-05 发布的《Optimizing your website for generative AI features on Google Search》明确说不需要 llms.txt、不需要把内容切成小块、不需要为 AI 改写文风、不需要特殊 schema，并提醒「警惕承诺排名的第三方工具」[S2][S1]。Danny Sullivan 和 John Mueller 在 2025-12 和 2026-01 的播客里反复说同样的话 [S10][S11]。
2. **Google 的反垃圾政策从 2026-05 起明确覆盖 AI Overviews 和 AI Mode。** spam policies 开头加了「attempting to manipulate generative AI responses in Google Search」，批量生成内容去操纵「排名或生成式 AI 回答」属于 scaled content abuse [S4][S5][S2]。
3. **「AI 只引用 Google 前 10」不成立，而且越来越不成立。** Ahrefs 2026-03 的 86.3 万关键词数据里，AI Overviews 引用的页面只有约 38% 在原查询前 10；ChatGPT、Gemini、Copilot 引用的链接只有约 12% 在前 10，Perplexity 约 28.6% [S28][S29]。原因是 query fan-out：引擎会改写出很多子查询再检索 [S9][S46]。但这不等于 SEO 没用：几项研究都发现传统 SEO 信号（外链、在上下文里的排序）仍是最稳定的杠杆 [S43][S47]。
4. **llms.txt 和 schema 都不是 AI 引用的开关。** SE Ranking 约 30 万域名的研究找不到 llms.txt 与 AI 引用的相关性 [S33]；Ahrefs 用双重差分追踪 1,885 个新加 JSON-LD 的页面，AI Mode 和 ChatGPT 引用没有可区分于零的提升 [S31]。但微软明确说 schema 帮助其 LLM 理解内容 [S27][S24]，两家口径不同。
5. **AI 推荐结果极不稳定，单次测量或「AI 排名第几」这种数字没有意义。** SparkToro 的实验里，同一提示词重复跑，ChatGPT 和 Google AI 给出同一份品牌清单的概率不到 1%，同顺序不到 0.1% [S38]。要看的是多次采样下的「出现频率」分布 [S50]。
6. **对独立开发者最扎心的一条：AI 认得你，不等于会推荐你。** 一项对 112 个 Product Hunt 产品的测试中，按名字问时 ChatGPT 识别率 99.4%，换成「今年有哪些好用的 AI 工具」这类发现型问题，出现率只有 3.32%；作者自定义的 GEO 评分与出现率无相关，而外链数和 Reddit 社区存在感有相关 [S47]。
7. **AI 写的内容本身不受罚，但「批量、无增量、无人审核」会。** Google 要求发布前人工核查所有 AI 生成内容，包括 title、meta description、structured data、alt [S3]。大样本数据显示 AI 辅助内容照样被引用 [S35][S37]。但让 AI「加统计数字」风险很高：LIVE-GEO 实验里 80 篇用 Statistics Addition 改写的产品描述全部被数值忠实度检查标红 [S48]。
8. **操纵 AI 回答在中美两边都在被打击。** 2026 年央视 3·15 晚会曝光 GEO「投毒」：虚构的智能手环靠十几篇自动软文，数天后被两个大模型排在推荐前列，有商家报价一年 6600 元保 AI 回答前三 [S57]。中央网信办「清朗·整治 AI 应用乱象」专项行动把「AI 数据投毒」列为整治重点 [S58]。律师认为伪造测评、虚构专家喂给 AI 可能构成虚假宣传和商业诋毁 [S59]。
9. **自吹「最佳 XX 工具」的榜单文章正在反噬。** Lily Ray 对 100 个 B2B「best X software」查询的分析中，69% 的情况下 Google AI Overviews 引用了品牌自己的榜单页，却没有推荐这个品牌本身 [S53]。
10. **开源 GEO 工具很多，但很多 README 引用的数字没有出处或被误引。** 比如把 Princeton GEO 论文里「排名第 5 的网站用 Cite Sources 提升 115%」说成笼统的「115-415% 提升」[S42][S70]。工具给的「GEO 分数」是启发式打分，没有证据证明它预测真实引用 [S47][S49]。

---

## 2. 正文

### 2.1 官方立场：Google

**文档层面（最权威）**

- 《AI features and your website》：出现在 AI Overviews 和 AI Mode「没有额外要求，也不需要其他特殊优化」；作为支持链接出现的前提是页面被索引、且有资格带摘要（snippet）显示 [S1]。「你不需要创建新的机器可读文件、AI 文本文件或标记」，「也没有需要添加的特殊 schema.org 结构化数据」[S1]。结构化数据要和页面可见文字一致 [S1]。AI Overviews 和 AI Mode「may use」query fan-out 技术 [S1]。AI 功能带来的流量计入 Search Console 效果报告的「网页」搜索类型，Google 称这些点击「质量更高」[S1]。
- 《Optimizing your website for generative AI features on Google Search》（业内报道普遍记为 2026-05-15 发布 [S64]）把话说得更直白 [S2]：
  - 「optimizing for generative AI search is optimizing for the search experience, and thus still SEO.」
  - llms.txt：「It's completely fine if you decide to create and maintain LLMS.txt files」，但它「will neither harm nor help」你在 Google 搜索的可见度或排名。
  - 分块（chunking）：「There's no requirement to break your content into tiny pieces for AI to better understand it.」
  - 改写：「You don't need to write in a specific way just for generative AI search.」
  - 品牌提及：「seeking inauthentic 'mentions' across the web isn't as helpful as it might seem.」
  - 结构化数据：不是必需的，但继续用，因为它帮助获得富结果资格。
  - 第三方工具：「Be wary of third-party tools that promise ranking success or claim to use 'internal' Google metrics.」
  - 规模化内容：为操纵「rankings or generative AI responses in Google Search」而批量做内容，违反 scaled content abuse 政策。
  - 有资格出现的前提之一是 Search Console 里的「Search generative AI」设置没有排除该站 [S2][S61]。
- spam policies：2026-05-13 到 05-15 之间，开头加入「attempting to manipulate generative AI responses in Google Search」，Google 的变更说明称政策「also apply to generative AI responses in Google Search」[S4][S5]。scaled content abuse 的例子里写着「Using generative AI tools or other similar tools to generate many pages without adding value for users」[S4]。隐藏文字（Hidden text and link abuse）一直在政策里 [S4]。二手报道称 2026-06-24 的 June 2026 spam update 是第一次把这条写进实际执行的更新，本稿未在 Google 原文核实。
- scaled content abuse 这个政策名始于 2024-03 核心更新，它不区分内容是自动化、人工还是混合生成，判断标准是「主要目的是否为操纵排名」[S7]。
- site reputation abuse（寄生 SEO）：2026-08-28 Google 宣布，在与欧盟委员会讨论后，从 08-30 起该政策的人工处罚对 EEA 用户不再生效，EEA 以外照旧；政策定义本身没改 [S6]。
- 《Creating helpful, people-first content》：「Are you writing to a particular word count because you've heard or read that Google has a preferred word count? (No, we don't.)」；并把「用大量自动化在很多主题上产出内容」列为「搜索引擎优先」的警示信号；建议在读者会合理预期时披露 AI 或自动化的使用 [S8]。

**人的发言**

- Danny Sullivan 与 John Mueller，Search Off the Record 播客，2025-12-18：SEO for AI 与传统 SEO 是一回事，GEO「应该在 SEO 之下，作为 SEO 的子集」；捷径可能出现，但不会持久；为用户写 [S10]（转述，非逐字稿）。
- Danny Sullivan，同一播客，约 2026-01-08：有人建议把内容切成「bite-sized chunks」因为 LLM 喜欢，「So we don't want you to do that.」「We don't want people to have to be crafting anything for Search specifically.」[S11]
- John Mueller，Reddit r/TechSEO，2025-04-17：「AFAIK none of the AI services have said they're using LLMS.TXT」，「To me, it's comparable to the keywords meta tag」[S13]。
- Gary Illyes，2025-07 Search Central Live：Google 不支持 llms.txt、没有计划支持 [S14]；Google 不试图区分人写和 AI 写的内容，AI Overviews 跑在和传统搜索相同的基础设施上（Googlebot、索引、排序系统）[S15]。
- Elizabeth Reid（Google 搜索负责人），2025-05-20：「AI Mode uses our query fan-out technique, breaking down your question into subtopics」；Deep Search「can issue hundreds of searches」[S9]。

**Google 内部的不一致**：二手报道称 Chrome 的 Lighthouse 在一个实验性的「机器交互」类别里把 llms.txt 当成可选审计项 [S65]。也就是说 Google 搜索团队说没用，Chrome 团队在面向浏览器智能体时检查它。本稿没有打开 Lighthouse 原始文档核实。

### 2.2 官方立场：Microsoft / Bing

微软的口径和 Google 有明显差异：它承认「为 AI 检索改结构」是有用的。

- Krishna Madhavan（Microsoft Bing 首席产品经理），2025-10-08，《Optimizing Your Content for Inclusion in AI Search Answers》[S24]：
  - 「Traditional SEO is still essential: Ensure crawlability, metadata, and internal linking remain the baseline.」
  - 「Structure your content: Use schema, clear headings, and modular layouts.」
  - 「Make answers snippable: Use concise, self-contained phrasing in lists, Q&As, and tables.」
  - 要避免的错误：大段文字墙；「Don't hide important answers in tabs or expandable menus」；关键信息只放在图片里；核心信息只放 PDF；装饰性符号（→、★★★、!!!）。
- Fabrice Canel，SMX Munich，2025-03：schema 帮助微软的 LLM（Copilot）理解内容；生成式 AI 特别看重新鲜内容，建议用 IndexNow 推送更新 [S27]（会场发言，二手报道）。
- Bing Webmaster Tools「AI Performance」公开预览，2026-02-10（Madhavan、Merchant、Canel、Nigam）：第一次给出站点在 Copilot 和 Bing AI 摘要里被引用的次数、被引页面、grounding queries（AI 检索你内容时用的短语，抽样）[S25]。同文给出版者的建议：围绕主题做深度、用标题/表格/FAQ 提升结构、用例子和数据支撑观点、用 IndexNow 保持新鲜、文字图片视频对同一实体表述一致 [S25]。
- 2026-05-06 Bing 文章《Evolving role of the index》：搜索索引回答「用户该看哪个页面」，grounding 索引回答「AI 能负责任地用哪些信息」；价值单位从文档变成「可 grounding 的信息」（有清晰出处的离散事实）；系统可以选择不回答 [S26]（通过 PPC Land 转述读取）。

**这对开发者意味着什么**：Google 说「别为 AI 切块」，微软说「写成可单独摘取的段落」。两者并不完全冲突：一个自洽、开头就回答问题的段落对人也友好。分歧在于要不要为了 AI 专门改结构。见 5.10。

### 2.3 官方立场：OpenAI

- 爬虫文档 [S16]（本稿直接读取）：
  - 「OAI-SearchBot is for search」，用于在 ChatGPT 搜索功能里展示网站；「Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links.」建议在 robots.txt 允许 OAI-SearchBot，并放行其公布的 IP 段。robots.txt 改动约 24 小时生效。
  - 「GPTBot is used to make our generative AI foundation models more useful and safe」，禁止 GPTBot 表示内容不应用于训练基础模型。
  - 「Each setting is independent of the others」：可以允许 OAI-SearchBot 同时禁止 GPTBot。
  - ChatGPT-User 用于用户触发的访问，「robots.txt rules may not apply」，且「is not used to determine whether content may appear in Search」。
  - OAI-AdsBot 只访问投放广告的落地页，数据不用于训练。
- Publishers and Developers FAQ [S17]（页面对抓取返回 403，以下来自搜索摘要）：任何公开网站都可以出现在 ChatGPT 搜索；不要屏蔽 OAI-SearchBot；退出搜索用 noindex，且需允许爬虫抓到这个标签；ChatGPT 的引荐链接自动带 `utm_source=chatgpt.com`；被禁止的页面若从第三方渠道得知，可能只显示链接和标题。本稿没有找到 OpenAI 关于「如何提升排名」的任何官方建议。
- 购物 [S18]（搜索摘要）：商品结果「selected independently」，不是广告，不受合作关系影响；依据第一方和第三方的结构化元数据（价格、描述）及其他第三方内容；商家排序看库存、价格、质量、是否为制造商或主要卖家；Shopify 商家自动接入，其他商家可申请直接提交 Product Feed。
- 广告 [S19]（搜索摘要）：2026-01-16 公布广告原则，02-09 在美国小范围测试；OpenAI 称广告不影响 ChatGPT 的回答，广告有明确标注并与回答分开。目前没有独立审计验证这一点。

### 2.4 官方立场：Anthropic

- Anthropic 帮助中心 [S20]（本稿直接读取）列出三个爬虫：
  - ClaudeBot：用于训练。屏蔽它表示「the site's future materials should be excluded from our AI model training datasets」，文中没有说会影响可见度。
  - Claude-User：用户提问时实时抓取。屏蔽它「may reduce your site's visibility for user-directed web search」。
  - Claude-SearchBot：提升搜索结果质量。屏蔽它「may reduce your site's visibility and accuracy in user search results」。
  - 支持非标准的 Crawl-delay；不建议用 IP 屏蔽（会让爬虫读不到 robots.txt）。
  - 2026-10-30 起，Anthropic 开始识别一个机器可读的「不用于 AI 训练」偏好信号，依据 IETF aipref 工作组草案（draft-kelley-aipref-training-preference-signal）；若 robots.txt 明确写了 ClaudeBot，以 robots.txt 为准。
- 页面没有提 llms.txt，也没有给出「怎样出现在 Claude 回答里」的建议。Anthropic 自己的开发者文档用 Mintlify 提供 llms.txt 和 llms-full.txt（Mintlify 自述，属于厂商说法）[S66]，这说明 llms.txt 在「给编码智能体读文档」场景有实际用途，但不说明 Claude 在回答用户时会读你的 llms.txt。

### 2.5 官方立场：Perplexity

- 官方文档 [S21]：「PerplexityBot is designed to surface and link websites in search results on Perplexity」，「It is not used to crawl content for AI foundation models」；要出现在搜索结果里，建议在 robots.txt 允许 PerplexityBot。Perplexity-User 支持用户动作，「generally ignores robots.txt rules」。robots.txt 改动最多 24 小时生效。建议 WAF 规则同时校验 User-Agent 和 IP。
- 争议：Cloudflare 2025-08-04 发文称，Perplexity 在声明的爬虫被拦后改用伪装成 macOS Chrome 的通用 UA、轮换不在官方 IP 段内的地址继续抓取；声明爬虫每天 2000-2500 万请求，未声明的每天 300-600 万；作为对比，ChatGPT-User 读到 robots.txt 禁止后就停止了 [S22]。Perplexity 反驳说那是代用户发起的访问而不是爬虫，并称 Cloudflare 把第三方服务 BrowserBase 的流量算到了它头上 [S23]。Cloudflare 是卖爬虫管理产品的，有利益相关。
- Perplexity 没有公开任何来源排序规则。唯一明确的官方杠杆就是「让 PerplexityBot 能抓到」。

### 2.6 引用与排名的关系：数据怎么说

| 研究 | 日期 | 样本 | 结论 |
|---|---|---|---|
| Ahrefs [S30] | 2025-07 | 190 万条 AIO 引用 | 76% 的 AIO 引用页面在前 10（已被 2026-03 版取代，方法改了） |
| Ahrefs [S29] | 2025-08-11 | 1.5 万个长尾提示词 | ChatGPT、Gemini、Copilot 平均约 12% 的引用在 Google 前 10；Perplexity 28.6%；80% 的 AI 引用在原查询下根本不在 Google 排名里 |
| Ahrefs [S28] | 2026-03-02 | 86.3 万关键词，400 万 AIO URL | 约 38% 在前 10，26-31% 在 11-100，31-37% 在前 100 之外；AIO 2026-01 起换成 Gemini 3，可能 fan-out 更激进 |
| Originality.ai [S36] | 2025-10-28 | 2.9 万个 YMYL 查询 | 48% 的 AIO 引用来自前 100，52% 来自前 100 之外 |
| arXiv 2604.27790 [S52] | 2026-04 | 1.15 万查询 | Google、AIO、Gemini 检索到的来源差异很大（平均 Jaccard < 0.2）；屏蔽 Google AI 爬虫的网站更少被 AIO 检索到 |
| arXiv 2610.15033 [S46] | 2026-10 | 15.8 万个回答、46.8 万条引用 | ChatGPT 引用的每个页面都是它自己检索到的；它改写出的子查询很少和 Google/Bing 结果重合；「是否被检索到」解释 32% 的差异，页面属性只解释 2.8% |

要点：AI 引用不是「Google 前 10 的子集」，而是「对它自己改写出的子查询，你能不能被检索到」的结果。这也解释了为什么「标题和段落贴合用户真实问法」是少数在同站内有效的内容因素 [S46]，以及为什么 fan-out 模拟是有用的 AI 工作流（见 4.5）。

但别得出「SEO 没用」的结论：C-SEO Bench 发现，大多数「对话式 SEO」改写方法基本无效甚至有反作用，反而是传统 SEO（提升来源在 LLM 上下文中的排位）显著更有效 [S43]；Discovery Gap 研究里，Perplexity 的可见度和外链数相关（r=+0.319）[S47]。

### 2.7 学术研究：哪些改写手法真的有效

- **Princeton GEO 论文（KDD 2024）** [S42]：在 GEO-bench 上，Cite Sources、Quotation Addition、Statistics Addition 效果最好，Position-Adjusted Word Count 提升约 30-40%；Keyword Stuffing 几乎无效，在 Perplexity 上比基线还差。对排名第 5 的网站，Cite Sources 提升 115.1%，而排名第 1 的网站平均下降 30.3%。局限：只测了两个引擎；前提是你的文档已经在固定的上下文里。
- **批判性综述（2026-07，45 项研究）** [S49]：原论文的提升「在其实验设定内成立，但以来源已经在固定上下文中为前提」，不证明自然可发现性或持久流量；最可复现的杠杆是主题相关性和在上下文中的位置；通用技巧迁移性差；竞争会侵蚀个体收益；「为引用而改写」可能损害检索。结论：没有任何被审查的技术显示出稳定、跨平台、纵向的因果效果。
- **C-SEO Bench（2025）** [S43]：采用者越多，整体收益越低，问题呈「拥挤、零和」。
- **What Gets Cited（2026-05，25.2 万次试验）** [S67]：两个候选来源竞争时，主题相关性和列表位置是最大驱动；明确价格和最近的时间戳也稳定有帮助；纯格式修改影响很小。
- **AutoGEO（ICLR 2026）** [S45]：自动从生成引擎里挖掘「偏好规则」再改写文档，可以在保持效用的前提下提升可见度；但规则依赖具体引擎和领域，换引擎要重新挖。
- **LIVE-GEO（2026-10）** [S48]：把改写后的产品页真正发布到线上测试 ChatGPT、Gemini、Grok。不同引擎对同一品牌选出的第一名只有 48.8%-66.3% 一致；ChatGPT 对候选 URL 顺序敏感；**Statistics Addition 改写的 80 篇描述全部被数值忠实度检查标红**。
- **Earned media 偏好（2025-09）** [S44]：AI 搜索系统性偏向第三方权威来源。美国汽车类查询，Google 结果 39.5% 品牌自有、15.4% 社交、45.1% 第三方；AI 搜索 81.9% 第三方、18.1% 品牌自有、0 社交。Claude 和 ChatGPT 最偏第三方，Perplexity 社交内容更多。
- **Incumbent Advantage（2026-06）** [S51]：规格相同时知名品牌被 100% 推荐，但竞品只要评分高 0.1 星以内这种优势就消失；含伪造临床证据的「权威式」营销语言能打破垄断；所有品牌都用同一优化策略时，个体收益从 +0.802 跌到 +0.007。
- **Discovery Gap（2026-01）** [S47]：见 1.6。这是和独立开发者处境最接近的研究：112 个 Product Hunt 产品，2,240 次查询。作者的结论是「不要直接为 AI 发现做优化，先打 SEO 基础」。

### 2.8 AI 生成内容：政策、证据与风险

**政策**：Google 的立场是「看质量和目的，不看是谁写的」。生成式 AI 可以用来研究主题、组织原创内容；用它「生成大量没有给用户增加价值的页面」可能违反 scaled content abuse [S3]。原文：「It is critical to manually factcheck and review all AI-generated content for accuracy and trustworthiness before publishing.」这条审核也适用于 title、meta description、structured data 和图片 alt [S3]。Merchant Center 要求 AI 生成的图片带 IPTC `DigitalSourceType` `TrainedAlgorithmicMedia` 元数据，AI 生成的商品标题和描述要单独标注 [S3]。

**AI 写的页面会被引用吗**：会。

- Ahrefs 2025-07-14：AIO 引用的前三条链接里（50 万个可检测 URL），纯 AI 3.6%、纯人工 8.6%、混合 87.8%；AI 占比与引用顺序的相关系数 0.017，约等于零 [S35]。
- Ahrefs 2025-07（约 60 万页面）：页面 AI 占比与 Google 排名的相关系数 0.011；纯 AI 页面能进前 20 但很少拿第一 [S37]。
- Originality.ai 2025-10-28（2.9 万个 YMYL 查询）：10.4% 的 AIO 引用被判为 AI 生成；前 100 之外来源中 AI 比例更高（12.8% 对 7.7%）[S36]。
- 注意：这三项都用自家 AI 检测器，检测器有误报，而且这两家都卖检测工具。

**真正的风险不是「被认出是 AI 写的」，而是：**

1. **编造事实**：让 AI「加数据、加引用」最容易出现编造，LIVE-GEO 的 Statistics Addition 改写全部出现数值问题 [S48]；Google 明确提到幻觉 [S3]。
2. **同质化**：Sullivan 说 LLM「在覆盖非原创内容上做得很好」[S10]，所以泛泛的 AI 文章没有被引用的理由。
3. **规模化**：一个人用 AI 一周铺几百页「XX 是什么」，正是 scaled content abuse 的样子 [S4][S8]。
4. **结构化数据和页面不一致**：AI 生成的 JSON-LD 常常写进页面上没有的评分、价格、作者，这违反结构化数据政策 [S1]，而且 AI 实时检索时根本不读 JSON-LD 里的隐藏信息 [S32]。

**怎么保留人在环里（human-in-the-loop）**：见第 3 节第 6 步和第 4 节。

### 2.9 测量：为什么「一个数字」靠不住

- SparkToro + Gumshoe（2026-01-30，2,961 次提示词运行，每个提示词每平台 60-100 次，数百名志愿者）：ChatGPT 和 Google AI 返回同一份品牌清单的概率 < 1%，同顺序 < 0.1%；142 人自己写的耳机推荐提示词语义相似度只有 0.081；但 Bose、Sony、Sennheiser、Apple 在 55%-77% 的回答里出现。Fishkin 称报「AI 排名第几」的工具「full of baloney」[S38]。
- 《Don't Measure Once》（2026-04）：AI 可见度要表达成分布，而不是单点结果 [S50]。
- 《Understanding ChatGPT Citations》（2026-10）：用 Google 搜索和 OpenAI Responses API 作为 ChatGPT Web 的代理，合起来只能找回约四分之一的被引 URL；在主机名和实体层面更接近 [S68]。意思是：用 API 做监控脚本，结果和用户在 ChatGPT 网页里看到的不同。
- 第一方数据更可靠：Bing Webmaster Tools 的 AI Performance [S25]、Search Console 的网页搜索数据 [S1]、GA4 里的 `utm_source=chatgpt.com` [S17]、服务器日志里的爬虫访问（需 IP 校验）[S16][S21]。
- 规模感：SE Ranking 对 101,574 个站点的 GA 数据，2026 年 1-4 月 AI 引荐只占总流量 0.32%（2025 年 0.24%，2024 年 0.02%），自然搜索占 42.75% [S54]。厂商数据，但量级说明问题。

### 2.10 隐藏文字和提示词注入

- 2024-12-24 《卫报》测试：在假相机商品页里藏文字指令，ChatGPT 搜索对含差评的页面也给出全正面的总结；藏一些极端正面的假评论也有效 [S39]。
- 学术：Kumar 和 Lakkaraju（2024）在产品信息里插入用 GCG 算法优化的「策略文本序列」，能让一个原本不出现的虚构咖啡机变成首推 [S41]。
- 2026-04-23 Google 安全团队对 Common Crawl 的研究：网上已有「trying to manipulate AI assistants into promoting their business over others」的注入，包括「seemingly generated by an automated SEO suite」的；大多数粗糙，不太可能在加固过的系统上成功；恶意类检出量 2025-11 到 2026-02 相对增长 32%；Google 用模式匹配 + Gemini 分类 + 人工复核来检测 [S40]。
- 检测研究：GEO-Flag（2026-08）专门检测被 GEO 改写过的网页，F1 可达 0.944 [S69]。
- 结论：今天可能偶尔有效，但它同时撞上 Google 的「隐藏文字」和「操纵生成式 AI 回答」两条政策 [S4]，在中国可能构成虚假宣传 [S59]，并且平台在主动检测 [S40]。这不是「灰色」，是明确的雷区。

### 2.11 中国：GEO 服务商乱象与监管

- **3·15 曝光（2026-03-15）**：业内人士虚构一款智能手环，把信息输入「力擎 GEO 优化系统」，系统自动生成十余篇软文并发布；之后在大模型平台问「智能健康手环推荐」，两个大模型推荐了这款不存在的手环且排名靠前。红星资本局调查：有商家报价一年 6600 元「可以让公司基本出现在 AI 回答前 3 的位置」，也有按关键词数量、平台数量、曝光时长报价上万到数万；商家称覆盖 DeepSeek、Kimi、豆包、元宝、通义千问。该系统运营者原话：「GEO 业务受热捧的主要原因就是它能在 AI 大模型里帮客户喂料、投毒」[S57]。晚会还提到「抹黑竞品」服务 [S60]。
- **平台反应**：豆包称未受此次投毒影响，千问称核心判断未被动摇，DeepSeek 承认存在被影响的可能但风险可控；截至报道时主流平台没有出台针对 GEO 内容的规范；闲鱼屏蔽了「GEO 优化」等关键词，但换词仍能找到商家 [S60]。这些是媒体转述，非平台公告。
- **监管**：中央网信办「清朗·整治 AI 应用乱象」专项行动第一阶段（2026-07-06 通报）：处置违规 AI 产品 1.4 万余款，清理违法违规信息 600 余万条，处置账号 2.6 万余个，下架违规 AI 商品 1300 余个、违规开源数据集 9 个；整治对象明确包括「AI 数据投毒」；江苏网信办开设专项举报窗口收集「AI 数据投毒」等线索；DeepSeek「在数据采集和预处理环节嵌入异常检测算法」[S58]。通报原文没有出现「GEO」一词。
- **法律定性**（律师观点，非判例）：中伦赵刚（2026-03-18）认为伪造专家身份、虚构调研和用户评价喂给 AI，「显然已经构成典型的『虚假宣传』并违反《反不正当竞争法》」；投喂竞品负面信息可能构成商业诋毁；还可能适用反不正当竞争法的互联网专条；同时提醒 AI 洗稿的著作权风险。正常 GEO「可用于优化信息分发、提升推广效率」[S59]。
- **对独立开发者的含义**：任何承诺「保证 AI 推荐前三」「X 天霸屏」的服务，Google 官方文档和中国监管实践都给出了同样的答案：别买 [S2][S57][S58]。

### 2.12 现有的开源 GEO 工具（GitHub，2026-11-14 用 `gh api` 查询）

| 仓库 | Star | 协议 | 做什么 | 备注 |
|---|---|---|---|---|
| AgriciDaniel/claude-seo [S70] | 29,202 | MIT | Claude Code 插件，26 个子 skill、19 个子代理；`/seo audit <url>`、`/seo geo <url>`，含 agent readiness（Lighthouse Agentic Browsing、WebMCP、llms.txt）检查 | 覆盖最全；结果是 AI 审计，需要人复核 |
| zubair-trabzada/geo-seo-claude [S70] | 11,673 | MIT | `/geo audit`、`/geo citability`、`/geo crawlers`、`/geo llmstxt`、`/geo schema`、`/geo report-pdf` 等 | README 首页列了「Brand mentions vs backlinks 3x stronger correlation」等无出处数字；推荐 `curl … \| bash` 安装，先读脚本再装 |
| Ryze-AI-Adgent/open-seo-mcp-skills [S70] | 9,682 | 未查 | SEO MCP server + GEO skills | 未细读 |
| onvoyage-ai/gtm-engineer-skills [S70] | 1,362 | 未查 | 一条流水线：品牌 DNA → 关键词 → GEO 提示词目标 → 内容规划 → 写作 → 审核引用 → AEO 审计和修复 | 适合参考「流水线式」组织方法 |
| yaojingang/yao-geo-skills [S70] | 918 | 未查 | 中文，24 个 GEO skill：问题集、DeepSeek / 豆包重复采样、AI 答案监测月报等 | 中文场景少见的完整集合，每个 skill 带 eval |
| yaojingang/GEOInflow [S70] | 846 | 未查 | 自托管 AI 爬虫日志 + AI 引荐分析（北京日报社智源 GEO 联合发布） | 明确写「爬虫日志只证明访问，引用和推荐需要另外的证据」 |
| elmohq/elmo [S70] | 600 | 开源 | 自托管 AI 可见度追踪：每天多次跑提示词，记录提及、引用、fan-out 搜索、情感 | 每个数字可从原始回答重算；抓的是消费端 App |
| limelit-co/open、danishashko/geo-aeo-tracker [S70] | 444 / 328 | MIT 等 | 自托管追踪，带 MCP server | geo-aeo-tracker 依赖 Bright Data 抓取 |
| AnswerDotAI/llms-txt [S70] | 2,687 | Apache-2.0 | llms.txt 规范与工具 | 规范原仓库 |
| firecrawl/llmstxt-generator、4hse/astro-llms-txt [S70] | 540 / 26 | - | 生成 llms.txt；Astro 插件 | 静态站可直接生成 |
| iPullRank-dev/qforia、houtini-ai/fanout-mcp [S70] | 29 / 15 | - | 用 Gemini 模拟 AI Mode 的 query fan-out；MCP 版做内容覆盖缺口分析 | 模拟的是「可能的子查询」，不是 Google 真实子查询 |
| seo-skills/geo-audit-skill [S70] | 40 | MIT | 确定性 Python CLI + Claude skill，「No score is ever produced by an LLM doing arithmetic in prose」 | 设计思路最值得借鉴：脚本算分，模型只解释 |
| Cognitic-Labs/geoskills [S70] | 32 | Apache-2.0 | 6 个 skill：审计、修复、监测 | README 写「115-415% visibility improvement (Princeton/Georgia Tech, 2023)」，属于误引 [S42] |
| cxcscmu/AutoGEO [S45] | 238 | - | ICLR 2026 论文代码，规则挖掘 + 改写模型 | 研究工具，训练需 2 张 A100 |
| liangdabiao/GEO-Content-Optimizer-Skill [S70] | 240 | MIT | 中文单页体检、带做 GEO | README 引用的「68%」「43%」数字未给出处 |
| umutxyp/Seo-Promt-Master [S70] | 581 | MIT | 零依赖 CLI + 47 个 SEO 提示词 + 带出处的规则知识库 | 知识库较新（已写到 2026-11 核心更新） |

**怎么挑**：优先选「脚本出数据、模型做解释」的工具，比如 seo-skills/geo-audit-skill；警惕把 README 里漂亮的市场数字当证据；任何工具给的 0-100「GEO 分」都没有被证明能预测真实引用 [S47][S49]。

---

## 3. 实战清单

### 第 1 步：先把「能被抓到」做对（30 分钟）

robots.txt 示例（按需取舍训练爬虫，搜索爬虫建议放行）：

```txt
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

要点：
- 屏蔽 GPTBot 不影响出现在 ChatGPT 搜索，决定搜索的是 OAI-SearchBot [S16]；Anthropic 同理，ClaudeBot 是训练，Claude-SearchBot 和 Claude-User 是搜索 [S20]；Google-Extended 管 Gemini 训练，不管 AI Overviews 是否收录 [S61]。
- 想退出 Google AI Overviews 和 AI Mode，用 Search Console 的「Search generative AI」设置，或 nosnippet / data-nosnippet / max-snippet [S1][S61]。
- 检查 Cloudflare 等 CDN 的「AI 爬虫拦截」开关没有把搜索爬虫一起拦掉 [S1]。
- 验证：`curl -A "OAI-SearchBot" -I https://example.com/` 只能看 UA 规则；真实访问要看服务器日志，并用官方 IP 列表核对（openai.com/searchbot.json 等）[S16][S21]。

### 第 2 步：给每个产品写一张「实体卡」

把每个产品的事实写成一个文件 `entity.md`，后面所有 AI 工作流都从这里取材，避免 AI 编造：产品名（中英文）、一句话定义（「X 是一个……的 Chrome 插件」）、目标用户、核心功能（3-5 条）、价格、平台、官网、Chrome Web Store / GitHub / 小程序链接、作者、更新日期、与同类产品的真实差异、已知局限。

理由：AI 回答以实体和事实为单位组织信息 [S26]；文字、图片、视频对同一实体的表述要一致 [S25]；ChatGPT 会把它「记得」的品牌写进子查询 [S46]。

### 第 3 步：生成提示词集（买家会问 AI 的问题）

用第 4.4 节的提示词生成 30-60 个问题，分三类：按名字问（「XX 插件好用吗」）、发现型（「有什么插件能……」）、对比型（「XX 和 YY 哪个好」）。Discovery Gap 研究说明发现型问题才是独立开发者的难点 [S47]。

### 第 4 步：建立基线测量（重复采样）

每个问题在每个平台至少跑 5-10 次，记录「是否提到你、提到哪些竞品、引用了哪些域名」。只报告频率，不报告名次 [S38][S50]。脚本见 4.10。

### 第 5 步：按差距改内容

优先级（按证据强度排序）：
1. 让页面标题和段落直接对应用户真实问法，开头就给答案 [S46][S67]。
2. 写清楚价格、更新日期、平台等具体事实 [S67]。
3. 给观点配真实出处和数据（不是 AI 编的）[S42][S48]。
4. 关键信息放在 HTML 正文，不只放在图片、折叠面板、PDF 或 JSON-LD 里 [S24][S32]。
5. 去争取第三方提及：同类评测、Reddit / V2EX / 少数派的真实讨论、GitHub awesome 列表 [S44][S47][S53]。
6. 结构化数据保持和可见内容一致，用于富结果和实体识别，不指望它直接带来引用 [S1][S31]。

### 第 6 步：人工审核清单（每次 AI 产出都过一遍）

- [ ] 每个数字、日期、价格都能在实体卡或可点开的来源里找到。
- [ ] 没有「据统计」「研究表明」却无链接的句子。
- [ ] JSON-LD 里每个字段都在页面可见文字里出现（用 4.2 的脚本查）。
- [ ] 对比页里关于竞品的每条说法都有截图或链接，且标了查证日期。
- [ ] 没有隐藏文字、没有给 AI 的指令。
- [ ] 这一页对一个真实用户有用吗？如果整站一周新增几十页，停下来想想 [S8]。
- [ ] 读者会合理预期时，注明 AI 参与方式 [S3][S8]。

### 第 7 步：持续监测

- Search Console：AI 流量在「网页」搜索类型里，没有单独拆分 [S1]。
- Bing Webmaster Tools → AI Performance：看被引次数、被引页面、grounding queries [S25]。
- GA4：过滤 `utm_source=chatgpt.com` 和 perplexity.ai、copilot 等引荐来源 [S17]。
- 服务器日志：按 UA + IP 统计 OAI-SearchBot、Claude-SearchBot、PerplexityBot 的访问，确认重要页面被抓过 [S16][S20][S21]。
- 每月重跑第 4 步的采样，对比频率分布变化。

---

## 4. 结合 AI 怎么做（可直接复制的提示词）

通用规则：把「实体卡」和要处理的页面作为上下文给 AI；要求它对不确定的内容标 `[需核实]`；禁止它编造数据和引用。所有提示词都假设你在 Claude Code / Cursor / Codex 里打开了项目仓库，或在 ChatGPT 里粘贴了内容。

### 4.1 审计网站的 AI 可读性

```text
你是技术 SEO 审计员。请审计这个 Astro 项目（或网址：{URL}）对 AI 搜索的可读性。只报告你能用证据证明的问题，每条给出文件路径或抓取结果。

逐项检查：
1. public/robots.txt：OAI-SearchBot、Claude-SearchBot、Claude-User、PerplexityBot、Googlebot、Bingbot 是否被允许；GPTBot、ClaudeBot、Google-Extended 的设置是否符合我的意图（我的意图：{允许/禁止训练}）。注意 GPTBot 只管训练，不影响 ChatGPT 搜索。
2. 是否有 sitemap.xml，lastmod 是否真实。
3. 关键事实（产品是什么、价格、平台、更新日期）是否在 HTML 正文里，而不是只在图片、折叠面板、PDF、客户端 JS 渲染或 JSON-LD 里。用 curl 抓原始 HTML 验证，不要只看源码模板。
4. 每个页面的 title 和 H1 是否直接对应一个用户会问的问题或明确的实体。
5. JSON-LD 是否和可见文字一致（有没有页面上没有的评分、价格、作者）。
6. 是否有隐藏文字、给 AI 的指令、大段装饰符号。

输出一张表：问题 | 证据 | 影响（高/中/低）| 修改建议 | 验证方法。不要给总分。不要建议 llms.txt 或 schema 作为提升 AI 引用的手段，它们没有被证明有这个效果。
```

做完怎么验证：对每条「已修复」，用 `curl -s {URL} | grep -i "{关键事实}"` 确认事实出现在原始 HTML。

### 4.2 生成并校验 JSON-LD

提示词：

```text
根据下面的实体卡，为 {页面URL} 生成 JSON-LD。规则：
- Chrome 插件用 SoftwareApplication，applicationCategory 填 "BrowserApplication"，operatingSystem 填 "Chrome"。
- 只使用实体卡里有的事实。实体卡里没有的字段（评分、评论数、下载量）一律不写，不要估计。
- sameAs 填 Chrome Web Store、GitHub、官网链接。
- 输出后，列出每个字段的值在页面可见文字中对应的原句。找不到原句的字段，删掉或标 [需核实]。

实体卡：
{粘贴 entity.md}
```

示例结果：

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Example Tab Saver",
  "alternateName": "标签页收藏夹",
  "description": "Example Tab Saver 是一个把当前窗口所有标签页一键保存为 Markdown 列表的 Chrome 插件。",
  "applicationCategory": "BrowserApplication",
  "operatingSystem": "Chrome",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "url": "https://example.com/tab-saver/",
  "sameAs": [
    "https://chromewebstore.google.com/detail/xxxxxxxx",
    "https://github.com/example/tab-saver"
  ],
  "author": { "@type": "Person", "name": "Example Dev" },
  "dateModified": "2026-11-01"
}
```

校验脚本（检查 JSON-LD 的字符串值是否出现在可见文字里，Python 标准库即可）：

```python
import json, sys, urllib.request
from html.parser import HTMLParser

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text, self.ld, self._in_ld, self._skip = [], [], False, 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in_ld = True
        elif tag in ("script", "style", "noscript"):
            self._skip += 1
    def handle_endtag(self, tag):
        if tag == "script" and self._in_ld:
            self._in_ld = False
        elif tag in ("script", "style", "noscript") and self._skip:
            self._skip -= 1
    def handle_data(self, data):
        if self._in_ld:
            self.ld.append(data)
        elif not self._skip:
            self.text.append(data)

def strings(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items():
            if not k.startswith("@"):
                yield from strings(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from strings(v, f"{path}[{i}]")
    elif isinstance(node, (str, int, float)):
        yield path, str(node)

url = sys.argv[1]
html = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read().decode("utf-8", "ignore")
p = Page(); p.feed(html)
visible = " ".join(p.text)
for block in p.ld:
    for path, value in strings(json.loads(block)):
        if value.startswith("http"):
            continue
        print(("OK      " if value in visible else "MISSING ") + f"{path} = {value[:80]}")
```

用法：`python3 check_ld.py https://example.com/tab-saver/`。MISSING 的字段要么补到页面正文，要么从 JSON-LD 删掉。最后再用 Google Rich Results Test 和 validator.schema.org 跑一遍语法。理由：Google 要求结构化数据和可见文字一致 [S1]；AI 实时检索时只读可见 HTML [S32]。

### 4.3 写「先给答案」的改写

```text
把下面这篇文章改写成「先给答案」的结构，读者是会写代码但不懂 SEO 的开发者。

要求：
1. 每个 H2 是一个用户真实会问的问题（用他们的说法，不用行话）。
2. 每个 H2 下面第一段 2-3 句话直接回答，能脱离上下文单独看懂。
3. 之后再展开步骤、代码、例外情况。
4. 保留原文所有事实，不新增任何数字、研究、引用、客户案例。如果你觉得某处需要数据支撑，写 [此处需要真实数据：建议找 XX 类来源]，不要自己编。
5. 不要为了 AI 把内容切成很碎的小块，也不要删掉对人有用的解释。
6. 输出最后附一张「改动清单」：原段落 → 新段落 → 改动原因。

原文：
{粘贴}
```

为什么这样写：Microsoft 建议可单独摘取的段落 [S24]；Google 反对为 AI 专门切碎 [S11][S2]；用户问法匹配是少数在同站内被证实有效的因素 [S46]；禁止编数是因为 Statistics Addition 改写全部出现数值问题 [S48]。

### 4.4 生成提示词集（买家会问 AI 的问题）

```text
我做了一个产品，实体卡如下。请模拟 5 类真实用户（{例如：刚开始用 Chrome 的学生、做跨境电商的运营、写技术博客的程序员、中文用户、英文用户}），列出他们在 ChatGPT、豆包、DeepSeek、Perplexity 里可能问的问题。

要求：
- 总共 40 条，中文 20 条、英文 20 条。
- 分三类并标注：A 按名字问（含产品名）、B 发现型（不含产品名，描述需求）、C 对比型（和具体竞品比）。B 类至少占一半。
- 用口语，像真人打字，包含错别字级别的随意表达也可以。
- 每条标注意图：了解 / 选型 / 解决问题 / 购买。
- 不要写成关键词，要写成完整问句。
输出为 CSV：id,lang,type,intent,persona,prompt

实体卡：
{粘贴}
```

### 4.5 模拟 query fan-out

```text
下面是一个用户问题。请模拟 AI 搜索引擎（Google AI Mode、ChatGPT 搜索）在回答前可能拆出的子查询。

步骤：
1. 列出 10-15 个子查询，覆盖：定义、对比、价格、替代品、具体场景、最新年份、评测、问题排查。
2. 对每个子查询，判断我网站上哪一页能回答它（给出 URL 和对应段落原文）；没有就写「缺口」。
3. 对每个缺口，建议是改已有页面还是新写一页，并说明理由。不要为每个子查询都建新页面。

请重复这个过程 3 次，每次独立生成子查询，最后统计哪些子查询在 3 次里都出现（这些最值得覆盖）。

用户问题：{问题}
我的网站页面列表和摘要：{粘贴 sitemap 或页面清单}
```

说明：这是「可能的子查询」，不是 Google 真实的子查询；Google 没有公开子查询数量和生成方式。Qforia、fanout-mcp 做的也是同一件事 [S70]。多次生成取交集的做法参考了 Qforia v2 的多轮设计。

### 4.6 从 AI 回答做竞品差距分析

先用 4.10 的脚本或手动在各平台跑问题，把回答原文和引用链接存下来，再交给 AI：

```text
下面是 {N} 份 AI 回答原文（来自 ChatGPT / Perplexity / 豆包，同一批问题，每题多次采样）。请做统计，不要凭印象：

1. 每个品牌被提到的次数和比例（按平台分开）。
2. 被引用的域名排行，并把每个域名分类：品牌官网 / 第三方评测 / 社区（Reddit、V2EX、知乎）/ 视频 / 应用商店 / 其他。
3. 竞品被提到时，AI 用了哪些理由描述它们（原句摘录）。
4. 我的产品（{名称}）没被提到的问题里，被引用最多的第三方页面是哪些。这些是我应该争取出现的地方。
5. AI 对我的产品有没有说错的事实，逐条列出原句和正确信息。

输出用表格。所有比例都写清分母。

回答原文：
{粘贴 JSON 或文本}
```

这一步对应的证据：AI 偏向第三方来源 [S44]；推荐取决于更广泛的网络提及而不是自评 [S53]。

### 4.7 诚实地写对比页

```text
帮我写一页「{我的产品} vs {竞品}」的对比页。原则是诚实，读者看完应该能判断哪个更适合自己，即使答案是竞品。

材料：我的实体卡、竞品官网和商店页面的截图文字（附查证日期）。

要求：
1. 开头一段直接说结论：什么样的用户选我的，什么样的用户选竞品。
2. 对比表只放双方都能查证的事实：价格、平台、核心功能、开源与否、最后更新时间。每个竞品事实后面标来源和查证日期。
3. 写一节「{竞品}做得比我们好的地方」，至少 2 条真实的。
4. 不用「最好」「第一」「唯一」这类词。
5. 材料里没有的信息写「未查到」，不要推测竞品的功能或价格。

材料：
{粘贴}
```

为什么：自吹式榜单在 AI Overviews 里有 69% 的情况是替竞品引流 [S53]；Google 说寻求不真实的提及没有看起来那么有用 [S2]；在中国，虚构测评可能构成虚假宣传 [S59]。

### 4.8 生成 llms.txt

先明确期望：llms.txt 对 Google 搜索没有作用 [S2]，没有证据表明它提升 AI 引用 [S33]；它的设计初衷是在推理时给智能体一个精简入口 [S34]，对文档站、开源项目、给编码智能体看的 API 文档最有用。生成成本很低，做了无妨，别指望流量。

提示词：

```text
根据这个 Astro 项目的 content collections（src/content/），生成符合 llmstxt.org 规范的 llms.txt：
- 第一行 H1 是站点名。
- 接一个 blockquote，一两句话说明这个站是什么、给谁看。
- 用 H2 分组列出最重要的页面，每项格式为 [标题](URL): 一句话说明。
- 次要页面放进「## Optional」。
- 只列真实存在的页面，URL 用线上地址。
然后把它写成一个 Astro 端点，在构建时自动生成，而不是手写静态文件。
```

Astro 端点示例（`src/pages/llms.txt.ts`，集合名按你的项目改）：

```ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const docs = (await getCollection("docs")).filter((d) => !d.data.draft);
  const lines = [
    "# Example GEO Wiki",
    "",
    "> 面向独立开发者的 GEO 开源知识库：GEO 是什么，以及怎样为自己的产品照着做。",
    "",
    "## Guides",
    ...docs.map((d) => `- [${d.data.title}](${new URL(`/${d.id}/`, site)}): ${d.data.description}`),
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
```

验证：`npm run build` 后检查 `dist/llms.txt`；上线后 `curl -s https://example.com/llms.txt | head`。也可以直接用 4hse/astro-llms-txt 插件 [S70]。

### 4.9 写 Chrome Web Store 和 GitHub README 文案

```text
帮我写 {产品} 的 Chrome Web Store 简介（中英各一版）和 GitHub README 开头。目标是让人和 AI 都能一眼读懂这个产品是什么实体。

规则：
1. 第一句固定句式：「{产品名}是一个{平台}上的{类别}，帮{谁}{做什么}。」英文："{Name} is a {category} for {platform} that helps {who} {do what}."
2. 第二段列 3-5 个核心功能，每条一句，动词开头，写具体能力，不写形容词。
3. 写明：价格、是否开源（附 GitHub 链接）、支持的语言、数据存在哪（本地/云端）、最近更新日期。
4. 产品名在中英文版里写法一致，并给出别名（中文名、英文名、常见误拼）。
5. 不要写「最好的」「革命性」「AI 驱动的终极」。
6. README 里加一节「和 {竞品} 的区别」，只写可验证的事实。
7. 商店简介遵守 Chrome Web Store 的字数限制，不要堆关键词。

实体卡：
{粘贴}
```

为什么：按名字问时 AI 几乎都认得产品，难的是让 AI 在描述需求时把你归到正确类别 [S47]；ChatGPT 会把它记得的品牌写进子查询 [S46]；跨平台表述一致是微软的明确建议 [S25]。GitHub 和应用商店页本身就是第三方平台上的页面，比自家博客更接近 AI 偏好的来源类型 [S44]（这一点是推断）。

### 4.10 监测脚本（重复采样，只记频率）

让 AI 帮你写：

```text
写一个 Node.js（或 Python）脚本：
- 读取 prompts.csv（4.4 生成的），对每条提示词调用 {OpenAI Responses API 开启 web search / Perplexity API / 其他} 各 {5} 次。
- 每次保存原始回答文本、引用 URL 列表、时间戳、模型名到 results.jsonl。
- 另写一个 analyze 脚本：对每条提示词计算「我的品牌被提到的次数 / 总次数」，按平台和问题类型（A/B/C）汇总；列出被引用最多的域名。
- 品牌匹配要支持别名列表：{别名}。
- 不要计算「排名第几」。
- API key 从环境变量读取。加上请求间隔，避免超限。
API 的具体参数请以官方文档为准，并在代码旁注明你参考的文档链接。
```

局限必须写进报告：API 结果和用户在 ChatGPT 网页里看到的不同，研究显示 API 和 Google 结果合起来只能找回约四分之一的 ChatGPT Web 被引 URL [S68]；同一提示词每次结果都不同 [S38]。所以它适合看趋势，不适合当「真实排名」。想要更接近真实界面，用 elmo、limelit-co/open 这类抓消费端 App 的开源工具 [S70]，或者固定时间手工抽查。中文平台可参考 yao-geo-skills 里的 DeepSeek、豆包重复采样 skill [S70]。

### 4.11 不该交给 AI 的事

- 判断一个事实是不是真的。
- 写竞品的价格和功能（必须自己去看）。
- 决定一周发多少页。
- 生成「用户评价」「案例」「数据」。
- 写给 AI 看的隐藏文字。

---

## 5. 误区和争议

### 5.1 「加了 llms.txt，AI 就会引用你」

**结论：没有证据。** Google 明确说既不帮助也不损害 [S2]，Illyes 说没有计划支持 [S14]，Mueller 说没有 AI 服务声称在用、服务器日志显示它们甚至不去请求 [S13]。SE Ranking 约 30 万域名（10.13% 部署了 llms.txt）的 Spearman、XGBoost 和 SHAP 分析中找不到相关性，去掉这个变量模型反而更准 [S33]。规范本身的定位是推理时给智能体的入口 [S34]。**保留意见**：对文档站和开源项目，llms.txt 对编码智能体读文档有实际用处（Anthropic、Cursor 等的文档都提供）[S66]；Lighthouse 在实验类别里会检查它 [S65]。成本低，可以做，但别当成 GEO 手段宣传。

### 5.2 「AI 引用必须有 schema」

**结论：不需要，效果也没被证实。** Google 说不需要特殊 schema [S1][S2]。Ahrefs 双重差分：1,885 个新加 JSON-LD 的页面对比 4,000 个对照页面，AI Mode +2.4%、ChatGPT +2.2%（都与零无显著差异），AI Overviews −4.6% [S31]。searchVIU 实验中五个 AI 系统实时检索时都没读到只存在于 JSON-LD 里的价格 [S32]。arXiv 2610.15033 的同站比较中，FAQ 块、结构化数据、摘要框、页面速度只在跨网站比较时显得有效 [S46]，说明那更像「好网站的共同特征」。**争议**：微软说 schema 帮助其 LLM 理解内容 [S24][S27]；Ahrefs 研究只覆盖已经被大量引用的页面，不能说明对还没被看见的页面有没有用 [S31]。建议：继续做 schema，因为富结果和实体识别；但要和页面一致，并且别指望它单独带来引用。

### 5.3 「要出现在 ChatGPT，必须允许 GPTBot」或者「屏蔽 GPTBot 就会从 ChatGPT 消失」

**结论：两个都错。** GPTBot 只管训练；ChatGPT 搜索看 OAI-SearchBot；两者独立 [S16]。Anthropic 和 Perplexity 也是训练爬虫和搜索爬虫分开 [S20][S21]。Google 这边 Google-Extended 不影响 AI Overviews 收录 [S61]。真正会让你在 AI 搜索里消失的是：屏蔽了搜索爬虫、CDN 误拦、页面不可索引。另一个反向事实：屏蔽 Google AI 爬虫的网站更少被 AIO 检索到 [S52]（相关性研究）。

### 5.4 「GEO 会取代 SEO」

**结论：现在没有，短期也看不出。** Google 官方说生成式 AI 优化「仍然是 SEO」[S2]，AI Overviews 用的是同一套索引和排序 [S15]。流量占比上，AI 引荐只占总流量约 0.32%，自然搜索约 42.75% [S54]。研究上，传统 SEO 信号比「对话式 SEO」改写更有效 [S43]，外链数预测 Perplexity 可见度 [S47]。**合理的说法是**：GEO 是在 SEO 之上多加的几件事（重复采样监测、第三方提及、实体一致、贴合问法），而不是另起炉灶。反方观点：Mike King 认为「Google 形状的网络」正在变成「智能体形状的网络」，Google 有动机让大家按它的规则写内容 [S12]。

### 5.5 「文章越长越容易被 AI 引用」

**结论：没有一致证据。** Google：「No, we don't」有偏好字数 [S8]。厂商研究互相矛盾：Tenten 对 500 篇繁体中文文章的观察是 1,500-2,500 字引用率最高、超过 3,500 字下降 [S56]；Analyze AI 对 22,295 个回答的分析发现，每个引擎的引用密度基本固定，加长内容不会多拿引用 [S55]。这些都是相关性研究，且都来自卖工具的公司。比字数更有解释力的是「标题和段落是否贴合问题」[S46]。

### 5.6 「给 LLM 堆关键词」

**结论：有害。** Princeton GEO 论文中 Keyword Stuffing 在 GEO-bench 上低于基线（17.8 对 19.5），在 Perplexity 实测里也比基线差 [S42]。把中文问句、英文问句自然写进标题和正文是另一回事，那是贴合问法 [S46]。

### 5.7 「AI 只引用 Google 前 10」

**结论：不成立。** 见 2.6：AIO 约 38% 在前 10 [S28]，ChatGPT 等约 12% [S29]，Perplexity 约 28.6% [S29]。原 76% 的数字（2025-07）已被同一机构的新研究取代，且方法变了 [S30][S28]。**但也别走到另一个极端**：被检索到才可能被引用 [S46]，而检索依然依赖搜索排名，只是排的是子查询。

### 5.8 「这个工具说我的 AI 可见度是 67 分 / 排第 3」

**结论：单个数字不可信。** 同提示词重复运行几乎从不返回同一清单 [S38]；可见度要表达为分布 [S50]；API 代理和真实界面差距大 [S68]；工具的 GEO 分与真实发现率无相关 [S47]。要问工具方：跑了多少次、在哪个界面、怎么匹配品牌别名、分母是什么 [S38]。Google 也提醒警惕声称使用「内部指标」的第三方工具 [S2]。

### 5.9 「在页面里藏一段给 AI 的指令很有效」

**结论：风险远大于收益。** 2024 年确实能左右 ChatGPT 搜索的商品总结 [S39]，学术上也能把虚构产品推成首推 [S41]。但 Google 已在网上大规模检测这类注入，并把粗糙的 SEO 注入单独归类 [S40]；隐藏文字和「操纵生成式 AI 回答」都在 spam policies 里 [S4]；检测 GEO 改写的研究已经达到 F1 0.944 [S69]；在中国伪造信息喂 AI 可能构成虚假宣传 [S59]。一旦被识别，损失的是整个域名在搜索里的信誉。

### 5.10 「Google 说别切块，所以结构不重要」

**这是一个真实争议。** Google：不需要切成小块，不要为 AI 专门写 [S2][S11]。Microsoft：避免文字墙，写可单独摘取的段落、列表、表格 [S24]。Mike King：「Chunking and creating content for users are not mutually exclusive」[S12]。学术：纯格式改动影响很小，主题相关性最重要 [S67]。**可执行的折中**：每节开头一段话直接回答该节标题的问题，其余照常为人写；不要做「AI 专用版」和「人看版」两套内容。

### 5.11 「写一篇《2026 年最好的 10 个 XX 工具》把自己排第一」

**结论：对小品牌可能是给竞品打广告。** Lily Ray：100 个 B2B 查询中，AIO 引用自吹榜单 323 次，其中 69% 没推荐发布该榜单的品牌；大量使用该手法的站点在 2026-01-20 前后自然流量大跌 [S53]。有反方数据（Peec 的分析认为没有降权）[S53 文中提及，本稿未核实]。

### 5.12 「找 GEO 服务商，保证 AI 推荐前三」

**结论：别买。** 大模型回答没有固定排名 [S38]；Google 官方提醒警惕承诺排名的工具 [S2]；3·15 曝光的正是这类服务的做法：自动生成软文铺量，甚至虚构产品 [S57]；监管把 AI 数据投毒列为整治重点 [S58]。真正能做的合规事情（梳理真实资料、争取真实第三方报道）你自己就能做 [S59]。

### 5.13 开源工具 README 里的数字

不少 GEO 工具的 README 把 Princeton 论文的结果说成普适的「提升 115-415%」[S70]，而原文的 115.1% 只针对排名第 5 的网站使用 Cite Sources 的情况，且前提是文档已在固定上下文里 [S42][S49]。还有一些「品牌提及比外链相关性强 3 倍」「68% 的 AI 回答引用高权威网站」之类数字没有给出处 [S70]。写知识库时不要转引这些数字，除非能找到原始研究。

---

## 6. 伦理和可持续性：为什么操纵 AI 回答会反噬

1. **平台已经把它写进规则并开始执行**：Google spam policies 明确覆盖生成式 AI 回答 [S4][S5]；网信办专项行动处置了上万款 AI 产品，点名 AI 数据投毒 [S58]；DeepSeek 称在数据预处理环节加入异常检测 [S58]。
2. **零和与拥挤**：大家都用同一套 GEO 技巧时，个体收益趋近于零 [S43][S51]。今天的「技巧红利」会被竞争和平台更新同时吃掉，Sullivan 的说法是「捷径不会持久」[S10]。
3. **引用不等于推荐**：靠自吹内容拿到引用，AI 却推荐别人 [S53]。
4. **信任是 AI 产品的核心卖点**：OpenAI 公开承诺广告不影响回答 [S19]，Microsoft 把「可以选择不回答」写进 grounding 设计 [S26]。平台有强烈动机打击让回答变脏的人。
5. **法律风险真实存在**：虚假宣传、商业诋毁、著作权 [S59]。
6. **对独立开发者，诚实是成本最低的策略**：你的产品数量多、每个产品预算少。可持续的做法是把每个产品的真实事实写清楚、放到 AI 偏好的第三方平台上、长期重复测量，而不是给每个产品买一套「霸屏」。

---

## 7. 推荐阅读清单

**一手来源（必读）**
- Google Search Central：《AI features and your website》[S1]、《Optimizing your website for generative AI features on Google Search》[S2]、《Using generative AI content》[S3]、spam policies [S4]、Search Central Blog。
- Google Search Off the Record 播客（Mueller、Sullivan 等）[S10][S11]。
- Bing Webmaster Blog 和 Microsoft Advertising Blog 上 Krishna Madhavan、Fabrice Canel 的文章 [S24][S25][S26]。
- OpenAI 爬虫文档 [S16] 和 Publishers FAQ [S17]；Anthropic 爬虫帮助页 [S20]；Perplexity 爬虫文档 [S21]。
- llms.txt 规范 [S34]。

**论文**
- Aggarwal et al., GEO（KDD 2024）[S42]；GEO 批判性综述（2026）[S49]；C-SEO Bench [S43]；What Drives AI Citations?（2026）[S46]；Discovery Gap（2026，独立开发者必读）[S47]；LIVE-GEO（2026）[S48]。

**从业者（英文）**
- Barry Schwartz（Search Engine Roundtable）：跟踪 Google 文档每一次改动最快 [S5][S10]。
- Lily Ray（Substack）：对 GEO 捷径最持续的批评和数据 [S53]。
- Rand Fishkin（SparkToro）：AI 可见度测量方法论 [S38]。
- Mike King（iPullRank，《AI Search Manual》）：retrieval 角度的反方观点 [S12][S63]。
- Ahrefs 研究团队（Louise Linehan、Xibeijia Guan）：数据量最大的引用研究，但要记住它卖工具 [S28][S29][S31]。

**中文**
- 中央网信办「清朗」系列通报 [S58]；澎湃、红星资本局对 3·15 GEO 产业链的调查 [S57]；中伦律所对 AI 投毒的法律分析 [S59]。
- 姚金刚的 yao-geo-skills 和 GEOInflow（北京日报社智源 GEO 联合发布）：中文平台重复采样和爬虫日志的开源实践 [S70]。
- 说明：本次没有找到质量足够高的中文独立从业者长期专栏，中文搜索结果以服务商软文为主（多篇带有排名推广性质），见「还没查清的问题」。

---

## 8. 还没查清的问题

1. **Claude 的网页搜索用哪家索引**（常见说法是 Brave Search）：搜索配额用尽，没能核实；Anthropic 帮助页没有说明 [S20]。
2. **OpenAI Publishers FAQ 原文**：页面对抓取返回 403，内容来自搜索摘要 [S17]；没找到 OpenAI 关于「如何提升 ChatGPT 搜索可见度」的任何官方建议。
3. **BrightEdge、Authoritas 的引用重合率数字**：搜索摘要里出现过 BrightEdge 17%（2026-02）和 54%（2025-10）的说法，但没有打开原始报告，没有写入正文；Authoritas 没找到。
4. **June 2026 spam update 的实际执行范围**：只有二手报道称它首次把「操纵生成式 AI 回答」带进执行。
5. **Google AI 优化指南的确切发布日期**：页面本身没写日期，2026-05-15 来自行业报道 [S64]。
6. **Lighthouse 的 llms.txt 审计细节**：只有二手报道 [S65]。
7. **中国平台（豆包、DeepSeek、元宝、Kimi）是否发布过面向网站或品牌的官方收录与引用说明**：没找到；3·15 后的平台回应来自媒体转述 [S60]。
8. **中国 GEO 行业标准和市场规模**：搜索摘要提到中国商务广告协会 2026-09-14 发布五项 GEO 团体标准（T/CAACCHINA 001-005-2026），以及「中国信通院」口径的 480 亿元和 286 亿元两个互相矛盾的市场规模，都没找到原文，未写入正文。
9. **Danny Sullivan 现在的职位**：有报道称他是「前」Search Liaison，未核实，正文只写名字。
10. **「为 AI 写可单独摘取段落」到底有没有用**：Google 和微软说法相反，学术研究显示纯格式修改影响小 [S67]，但没有针对「自洽首段」的对照实验。
11. **Peec 对自吹榜单「没有降权」的反方数据**：只在 Lily Ray 相关报道中看到，未读原文。
12. **Anthropic 识别的 aipref 训练偏好信号的具体语法**：帮助页只链接了 IETF 草案 [S20]。

---

## 9. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | AI features and your website | Google Search Central | 页面无日期（2026-11 读取） | https://developers.google.com/search/docs/appearance/ai-features | 官方文档 | A | AIO/AI Mode 无额外要求，不需要 AI 文本文件或特殊 schema；可能用 query fan-out；流量计入网页搜索 |
| S2 | Optimizing your website for generative AI features on Google Search | Google Search Central | 约 2026-05-15（据 S64） | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | 官方文档 | A | 「still SEO」；llms.txt 不帮也不害；不需要切块和 AI 专用写法；警惕承诺排名的工具 |
| S3 | Google Search's guidance on using generative AI content on your website | Google Search Central | 页面无日期 | https://developers.google.com/search/docs/fundamentals/using-gen-ai-content | 官方文档 | A | 发布前必须人工核查所有 AI 内容含元数据；批量无增值生成可能违规 |
| S4 | Spam policies for Google web search | Google Search Central | 2026-05 更新 | https://developers.google.com/search/docs/essentials/spam-policies | 官方文档 | A | 加入「attempting to manipulate generative AI responses」；scaled content abuse、隐藏文字 |
| S5 | Google: Spam Policies Apply To AI Responses (AI Overviews & AI Mode) | Search Engine Roundtable | 2026-05-15 | https://www.seroundtable.com/google-spam-policies-apply-ai-responses-41331.html | 行业新闻 | C | 记录 spam policies 在 05-13 到 05-15 之间的改动 |
| S6 | Update to the Site Reputation Policy | Google Search Central Blog | 2026-08-28 | https://developers.google.com/search/blog/2026/08/update-site-reputation-policy | 官方博客 | A | 08-30 起 site reputation abuse 人工处罚对 EEA 用户不生效 |
| S7 | What web creators should know about our March 2024 core update and new spam policies | Google Search Central Blog | 2024-03 | https://developers.google.com/search/blog/2024/03/core-update-spam-policies | 官方博客 | A | 引入 scaled content abuse，不论人工还是自动化 |
| S8 | Creating helpful, reliable, people-first content | Google Search Central | 页面无日期 | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | 官方文档 | A | 没有偏好字数；大量自动化多主题产出是警示信号；建议披露 AI 使用 |
| S9 | AI in Search: Going beyond information to intelligence | Google（Elizabeth Reid） | 2025-05-20 | https://blog.google/products/search/google-search-ai-mode-update/ | 官方博客 | A | AI Mode 用 query fan-out；Deep Search 可发出数百次搜索 |
| S10 | Google's Danny Sullivan & John Mueller On SEO For AI: It's The Same | Search Engine Roundtable | 2025-12-18 | https://www.seroundtable.com/google-danny-sullivan-john-mueller-seo-ai-40620.html | 播客转述 | C | GEO 是 SEO 子集；捷径不持久；为用户写 |
| S11 | Google: Don't Turn Your Content Into Bite-Sized Chunks | Search Engine Roundtable | 2026-01-09 | https://www.seroundtable.com/google-content-bite-sized-chunks-40728.html | 播客转述 | C | Sullivan：「So we don't want you to do that.」 |
| S12 | Moving from a Google-shaped Web to an Agent-shaped Web: A Refutation of Misinformation about Chunking | iPullRank（Mike King） | 2026-01-15 | https://ipullrank.com/?p=20799 | 从业者观点 | D | 反驳 Google：分块和为用户写不矛盾 |
| S13 | Google Says LLMs.Txt Comparable To Keywords Meta Tag | Search Engine Journal | 2025-04-17 | https://www.searchenginejournal.com/google-says-llms-txt-comparable-to-keywords-meta-tag/544804/ | 行业新闻 | C | Mueller：没有 AI 服务声称在用 llms.txt |
| S14 | Google says normal SEO works for ranking in AI Overviews and llms.txt won't be used | Search Engine Land | 2025-07 | https://searchengineland.com/google-says-normal-seo-works-for-ranking-in-ai-overviews-and-llms-txt-wont-be-used-459422 | 行业新闻（未直接打开，搜索结果） | C | Illyes：没有支持 llms.txt 的计划 |
| S15 | Google says AI content is fine and SEO basics still apply to AI-powered search | The Decoder | 2025-07-24 | https://the-decoder.com/google-says-ai-content-is-fine-and-seo-basics-still-apply-to-ai-powered-search/ | 会议转述 | C | Illyes：不区分人写和 AI 写；AIO 用同一套基础设施 |
| S16 | Overview of OpenAI Crawlers | OpenAI | 2026-11 读取 | https://developers.openai.com/api/docs/bots | 官方文档 | A | OAI-SearchBot 管搜索，GPTBot 管训练，独立设置；ChatGPT-User 可能不遵守 robots.txt |
| S17 | Publishers and developers FAQ | OpenAI Help Center | 2026-11（403，未能打开） | https://help.openai.com/en/articles/12627856-publishers-and-developers-faq | 官方文档（据搜索摘要） | A | 不要屏蔽 OAI-SearchBot；noindex 退出；utm_source=chatgpt.com |
| S18 | Shopping in ChatGPT | OpenAI Help Center | 2026（据搜索摘要） | https://help.openai.com/en/articles/11128490-shopping-in-chatgpt | 官方文档（据搜索摘要） | A | 商品结果独立选择、非广告；可申请直接提交 Product Feed |
| S19 | Testing ads in ChatGPT | OpenAI | 2026-01-16 | https://openai.com/index/testing-ads-in-chatgpt/ | 官方声明（403，据搜索摘要） | A | 称广告不影响回答，明确标注并分开 |
| S20 | What is ClaudeBot / Does Anthropic crawl data from the web | Anthropic Help Center | 2026-11 读取（含 2026-10-30 更新） | https://support.claude.com/en/articles/8896518-what-is-claudebot | 官方文档 | A | ClaudeBot 训练；Claude-User、Claude-SearchBot 影响可见度；开始识别 aipref 训练信号 |
| S21 | PerplexityBot | Perplexity Docs | 页面无日期 | https://docs.perplexity.ai/guides/perplexitybot | 官方文档 | A | 允许 PerplexityBot 才能出现在结果里；Perplexity-User 一般忽略 robots.txt |
| S22 | Perplexity is using stealth, undeclared crawlers to evade website no-crawl directives | Cloudflare Blog | 2025-08-04 | https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/ | 公开实验（厂商，有利益相关） | B | 新建域名测试；伪装 UA 每天 300-600 万请求；ChatGPT-User 遵守 robots.txt |
| S23 | Perplexity Says Cloudflare Is Blocking Legitimate AI Assistants | Search Engine Journal | 2025-08 | https://www.searchenginejournal.com/perplexity-says-cloudflare-is-blocking-legitimate-ai-assistants/552927/ | 行业新闻（搜索结果） | C | Perplexity 反驳：代用户访问不是爬虫；混入了 BrowserBase 流量 |
| S24 | Optimizing Your Content for Inclusion in AI Search Answers | Microsoft Advertising Blog（Krishna Madhavan） | 2025-10-08 | https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers | 官方博客 | A | 传统 SEO 是基线；可摘取段落；别把答案藏在折叠面板、图片、PDF |
| S25 | Introducing AI Performance in Bing Webmaster Tools Public Preview | Bing Webmaster Blog | 2026-02-10 | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 官方博客 | A | 第一方 AI 引用数据；grounding queries；建议结构、出处、IndexNow、跨格式一致 |
| S26 | Evolving role of the index: From ranking pages to supporting answers（经 PPC Land 转述） | Bing Search Blog / PPC Land | 2026-05-06 | https://ppc.land/microsoft-explains-why-bings-ai-index-is-nothing-like-traditional-search/ | 官方博客（转述） | A | grounding 索引以「有出处的离散事实」为单位；可以不回答 |
| S27 | Microsoft Bing/Copilot use schema for its LLMs | Search Engine Land | 2025-03 | https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455 | 会议转述（搜索结果） | C | Canel：schema 帮助 LLM 理解内容；生成式 AI 看重新鲜度 |
| S28 | Update: 38% of AI Overview Citations Pull From The Top 10 | Ahrefs | 2026-03-02 | https://ahrefs.com/blog/ai-overview-citations-top-10/ | 大样本研究（厂商） | B | 86.3 万关键词、400 万 URL；约 38% 在前 10 |
| S29 | Only 12% of AI Cited URLs Rank in Google's Top 10 for the Original Prompt | Ahrefs | 2025-08-11 | https://ahrefs.com/blog/ai-search-overlap/ | 大样本研究（厂商） | B | 1.5 万提示词；平均约 12% 在前 10；Perplexity 28.6% |
| S30 | 76% of AI Overview Citations Pull From the Top 10 | Ahrefs | 2025-07 | https://ahrefs.com/blog/search-rankings-ai-citations/ | 大样本研究 | X | 已被 S28 取代，解析方法和 AIO 模型都变了 |
| S31 | Schema markup and AI citations（1,885 pages） | Ahrefs | 2026-05-11 | https://ahrefs.com/blog/schema-ai-citations/ | 准实验（双重差分，厂商） | B | 新加 JSON-LD 对 AI Mode、ChatGPT 引用无显著提升 |
| S32 | Schema Markup and AI in 2025: What ChatGPT, Claude, Perplexity & Gemini Really See | searchVIU | 2025 | https://www.searchviu.com/en/?p=8563 | 小规模实验 | C | 五个系统实时检索都没读到只在 JSON-LD 里的价格 |
| S33 | Does LLMs.txt impact your AI visibility and citations? | SE Ranking | 2026-10-15（页面日期） | https://seranking.com/blog/llms-txt/ | 大样本研究（厂商，约 30 万域名） | B | 10.13% 部署率；与 AI 引用无相关 |
| S34 | The /llms.txt file | llmstxt.org（Jeremy Howard） | 2024-09-03，2026-08-10 修改 | https://llmstxt.org/ | 规范原文 | A | 格式：H1、blockquote、H2 链接列表、Optional；主要用于推理时 |
| S35 | AI Overviews cite AI-generated content more than human writing | Ahrefs | 2025-07-14 | https://ahrefs.com/blog/ai-overviews-cite-ai-generated-content-more-than-human-writing/ | 大样本研究（厂商检测器） | B | AIO 引用里纯 AI 3.6%、纯人工 8.6%、混合 87.8% |
| S36 | 10.4% of AI Overview Citations are AI-Generated | Originality.ai | 2025-10-28 | https://originality.ai/blog/ai-overview-ai-citations-study | 大样本研究（厂商检测器） | B | 2.9 万 YMYL 查询；52% 引用来自前 100 之外 |
| S37 | AI-Generated Content Does Not Hurt Your Google Rankings (600,000 Pages Analyzed) | Ahrefs | 2025-07 | https://www.ahrefs.com/blog/ai-generated-content-does-not-hurt-your-google-rankings | 大样本研究（厂商） | B | AI 占比与排名相关系数 0.011 |
| S38 | AI Recommendations Change With Nearly Every Query: SparkToro | Search Engine Journal（SparkToro + Gumshoe 研究） | 2026-01-30 | https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242/ | 公开实验（2,961 次运行） | B | 同清单 < 1%，同顺序 < 0.1%；要测频率不测排名 |
| S39 | ChatGPT Search Manipulated With Hidden Instructions（报道《卫报》测试） | Search Engine Journal / The Guardian | 2024-12-24 | https://www.searchenginejournal.com/chatgpt-search-manipulated-with-hidden-instructions/536390/ | 媒体测试（搜索结果） | C | 隐藏文字能让 ChatGPT 搜索给出全正面评价 |
| S40 | AI threats in the wild: The current state of prompt injections on the web | Google Security（Brunner、Liu、Pande） | 2026-04-23 | https://blog.google/security/prompt-injections-web/ | 官方研究 | A | 已发现 SEO 类注入，多数粗糙；恶意类检出相对增长 32% |
| S41 | Manipulating Large Language Models to Increase Product Visibility | arXiv（Kumar、Lakkaraju） | 2024-04-11 | https://arxiv.org/abs/2404.07981 | 预印本，代码公开 | B | 策略文本序列能把虚构产品推成首推 |
| S42 | GEO: Generative Engine Optimization | arXiv / KDD 2024（Aggarwal 等） | 2023-11，2024-06 修订 | https://arxiv.org/abs/2311.09735 | 同行评审论文 | A | 引用、引语、统计最有效；关键词堆砌无效；对第 5 名网站 +115.1% |
| S43 | C-SEO Bench: Does Conversational SEO Work? | arXiv（Parameter Lab） | 2025-06 | https://arxiv.org/abs/2506.11097 | 预印本，代码数据公开 | B | 多数 C-SEO 方法无效甚至有害；传统 SEO 更有效；零和 |
| S44 | Generative Engine Optimization: How to Dominate AI Search | arXiv（Chen、Wang、Chen、Koudas） | 2025-09-10 | https://arxiv.org/abs/2509.08919 | 预印本 | B | AI 搜索偏向第三方来源（美国汽车类 81.9% earned） |
| S45 | What Generative Search Engines Like and How to Optimize Web Content Cooperatively（AutoGEO） | arXiv / ICLR 2026 | 2025-10-11 | https://arxiv.org/abs/2510.11438 | 同行评审论文 | A | 自动挖掘引擎偏好规则并改写；规则依赖引擎和领域 |
| S46 | What Drives AI Citations? Content, Retrieval and Model Knowledge in GEO | arXiv | 2026-10-10 | https://arxiv.org/abs/2610.15033 | 预印本（15.8 万回答） | B | 被检索到解释 32%，页面属性 2.8%；标题段落贴合问题有效；ChatGPT 偏向它记得的品牌 |
| S47 | The Discovery Gap: How Product Hunt Startups Vanish in LLM Organic Discovery Queries | arXiv（Sharma） | 2026-01-01 | https://arxiv.org/abs/2601.00912 | 预印本（112 产品、2,240 查询） | B | 按名问 99.4%，发现型 3.32%；GEO 分无相关；外链和 Reddit 有相关 |
| S48 | Do GEO Gains Survive the Live Web? (LIVE-GEO) | arXiv | 2026-10-31 | https://arxiv.org/abs/2611.01126 | 预印本，线上实验 | B | 引擎间首选一致率 48.8%-66.3%；Statistics Addition 改写全部被数值检查标红 |
| S49 | Optimizing Visibility in Generative Engines: A Critical Survey of GEO (2023-2026) | arXiv（Martinez） | 2026-07-15 | https://arxiv.org/abs/2607.14035 | 综述预印本（45 项研究） | B | 没有技术显示稳定、跨平台、纵向的因果效果；相关性和位置最可复现 |
| S50 | Don't Measure Once: Measuring Visibility in AI Search (GEO) | arXiv | 2026-04-08 | https://arxiv.org/abs/2604.07585 | 预印本（方法论） | C | 可见度应表达为分布，需要重复测量 |
| S51 | Incumbent Advantage: Brand Bias and Cognitive Manipulation Dynamics in LLM Recommendation Systems | arXiv | 2026-06-16 | https://arxiv.org/abs/2606.17443 | 预印本，受控实验 | B | 大品牌在同规格下 100% 被推荐；全员优化时收益趋零 |
| S52 | How Generative AI Disrupts Search: An Empirical Study of Google Search, Gemini, and AI Overviews | arXiv | 2026-04-30 | https://arxiv.org/abs/2604.27790 | 预印本（1.15 万查询） | B | 三者来源差异大；屏蔽 Google AI 爬虫的网站更少被 AIO 检索 |
| S53 | Why Calling Yourself the Best Could Be Helping Your Competitors Win in AI Search | Lily Ray（Substack） | 2026-06-17 | https://lilyraynyc.substack.com/p/why-calling-yourself-the-best-could | 从业者小样本分析（100 查询） | C | 69% 情况下引用了自吹榜单却不推荐该品牌 |
| S54 | AI traffic grew 16x from 2024 to 2026 | SE Ranking | 2026-06-18 | https://seranking.com/blog/ai-traffic-research-study/ | 大样本研究（厂商，101,574 站） | B | AI 引荐占总流量 0.32%，自然搜索 42.75% |
| S55 | Longer AI Answers Cite Fewer Sources [2026 Study] | Analyze AI | 2026-08-04 | https://www.tryanalyze.ai/blog/state-of-ai-search-length-citations | 厂商研究（22,295 回答） | B | 各引擎引用密度固定；加长内容不会多拿引用 |
| S56 | Content Length, Freshness, and AI Citations: Evidence from 500 Articles | Tenten GEO | 2026-04-19 | https://geo.tenten.co/en/blog/content-length-freshness-ai-citation-data | 厂商小样本观察 | C | 繁中 500 篇：1,500-2,500 字引用率最高 |
| S57 | 「3·15」晚会曝光 AI 投毒产业链！GEO 业务调查 | 澎湃新闻（转载红星资本局） | 2026-03-15 | https://www.thepaper.cn/newsDetail_forward_32774754 | 媒体调查 | C | 虚构手环被推荐；6600 元一年保前三；「喂料、投毒」 |
| S58 | 中央网信办深入开展「清朗·整治 AI 应用乱象」专项行动第一阶段工作 | 新华网（来源中国网信网） | 2026-07-06 | https://www.news.cn/politics/20260706/4ce1356eb1b34e878c3fa1e2d9e5da1f/c.html | 官方通报 | A | 处置 1.4 万余款 AI 产品；整治 AI 数据投毒 |
| S59 | 人工智能「投毒」行为的法律问题初探 | 中伦律师事务所（赵刚） | 2026-03-18 | https://www.zhonglun.com/research/articles/55792.html | 法律观点 | D | 伪造信息喂 AI 可能构成虚假宣传、商业诋毁 |
| S60 | 315 晚會打假／AI 大模型遭「投毒」付費洗腦成灰色產業鏈；及澎湃相关报道 | 联合新闻网 / 澎湃新闻 | 2026-03 | https://udn.com/news/story/7332/9382858 ；https://www.thepaper.cn/newsDetail_forward_32760393 | 媒体报道（搜索结果，未打开原文） | C | 豆包、千问、DeepSeek 的回应；平台暂无 GEO 规范；闲鱼屏蔽关键词 |
| S61 | Google gives site owners a toggle to exit AI Overviews and AI Mode | PPC Land | 2026-07-20 | https://ppc.land/google-gives-site-owners-a-toggle-to-exit-ai-overviews-and-ai-mode/ | 行业新闻（转述官方帮助文档） | C | Search Console「Search generative AI」设置；Google-Extended 不管 AIO |
| S63 | The AI Search Manual | iPullRank | 2025-08 起，持续更新 | https://ipullrank.com/ai-search-manual | 从业者手册 | D | Relevance Engineering 框架，retrieval 视角 |
| S64 | Google's New AI Search Guide Calls AEO And GEO Still SEO | Search Engine Journal | 2026-05 | https://searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026 | 行业新闻（搜索结果） | C | 记录 S2 的发布时间与要点 |
| S65 | Google's llms.txt Guidance Depends On Which Product You Ask | Search Engine Journal | 2026 | https://searchenginejournal.com/googles-llms-txt-guidance-depends-on-which-product-you-ask/575431/ | 行业新闻（搜索结果） | C | Lighthouse 在实验类别里检查 llms.txt |
| S66 | Anthropic 客户案例 / Real llms.txt examples | Mintlify | 2025 | https://mintlify.com/customers/anthropic | 厂商内容（搜索结果） | D | Anthropic 文档提供 llms.txt 和 llms-full.txt |
| S67 | What Gets Cited: Competitive GEO in AI Answer Engines | arXiv（Vishwakarma 等） | 2026-05-25 | https://arxiv.org/abs/2605.25517 | 预印本（25.2 万次试验） | B | 主题相关性和位置最重要；价格和时间戳有帮助；纯格式影响小 |
| S68 | Understanding ChatGPT Citations: Evidence from Production Web Search Across Model Generations | arXiv | 2026-10-11 | https://arxiv.org/abs/2610.15382 | 预印本 | B | Google 和 Responses API 代理只能找回约四分之一的 ChatGPT Web 被引 URL |
| S69 | GEO-Flag: Detecting and Measuring GEO-Optimized Web Content | arXiv | 2026-08-17 | https://arxiv.org/abs/2608.16824 | 预印本 | B | 检测 GEO 改写网页，F1 最高 0.944 |
| S70 | GitHub 仓库元数据与 README（claude-seo、geo-seo-claude、geoskills、geo-audit-skill、elmo、qforia、fanout-mcp、yao-geo-skills、GEOInflow、llms-txt 等） | GitHub（各作者） | 2026-11-14 通过 gh api 读取 | https://github.com/AgriciDaniel/claude-seo ；https://github.com/zubair-trabzada/geo-seo-claude ；https://github.com/Cognitic-Labs/geoskills ；https://github.com/seo-skills/geo-audit-skill ；https://github.com/elmohq/elmo ；https://github.com/iPullRank-dev/qforia ；https://github.com/houtini-ai/fanout-mcp ；https://github.com/yaojingang/yao-geo-skills ；https://github.com/yaojingang/GEOInflow ；https://github.com/AnswerDotAI/llms-txt ；https://github.com/firecrawl/llmstxt-generator ；https://github.com/4hse/astro-llms-txt ；https://github.com/onvoyage-ai/gtm-engineer-skills ；https://github.com/limelit-co/open ；https://github.com/danishashko/geo-aeo-tracker ；https://github.com/umutxyp/Seo-Promt-Master ；https://github.com/liangdabiao/GEO-Content-Optimizer-Skill ；https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills | 开源工具 | D | 工具功能描述可信；README 里的市场和效果数字多数无出处或误引 |
