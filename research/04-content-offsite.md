# 调研稿 04：站内内容策略与站外存在（别人怎么说你）

调研日期：2026-11-14。范围：什么样的站内页面会被 AI 引用、怎么做问题和子查询的映射、站外哪些平台被 AI 引用最多、中文生态的信源分布、独立开发者的周常、黑帽和灰色手法的风险、有数字的案例。

说明：本稿中「（推断）」表示是我根据出处做的推理，不是出处原话；「（猜测）」表示没有证据支撑的判断。调研中途 WebSearch 配额用尽，部分点只来得及读到搜索摘要，已在出处表里注明。

---

## 1. 一段话总结

1. **AI 引用的大头来自你控制不了的第三方页面。** Ahrefs 看了 ChatGPT 引用最多的 1,000 个页面，67% 是 Wikipedia、机构主页、词典这类营销上碰不到的页面 [S7]；Seer 对 4 个品牌、47,097 次引用的统计里，被引页面约 98% 不属于品牌自己 [S9]；Muck Rack 对 2,500 万条链接的统计里，约 84% 是「赢得的」（earned）来源，付费内容只占 0.3% [S26]。但这一点因引擎而异：Muck Rack 同时发现 Google AI Overviews 的引用里 59.8% 是品牌自有域名 [S26]。
2. **品牌被提及的次数，比反向链接更能预测 AI 可见度。** Ahrefs 对 75,000 个品牌的相关性研究：YouTube 提及（约 0.737）和全网品牌提及（0.66 到 0.71）相关性最高，反向链接数和 URL Rating 只有弱相关 [S4][S5]。这是相关不是因果，而且样本只含 DR 大于 40 的站。
3. **不同 AI 引擎偏好的信源差别很大，没有一套通吃的打法。** ChatGPT 最常引 Wikipedia（占全部引用 7.8%），Perplexity 和 Google AI Overviews 最常引 Reddit [S1]；Google AI Mode 偏好 LinkedIn、YouTube 等 Google 系或合作域名 [S3]；YouTube 在 AI Overviews 里很强（29.5% 的 AIO 引用了 YouTube），在 ChatGPT 里几乎没有（0.2%）[S25]。这些份额几个月就会变：2025 年 9 月 ChatGPT 对 Reddit 的引用在一些统计里从约 60% 的回答掉到约 10% [S3]。
4. **站内最常被引用的页面类型是「best X」类榜单和对比页。** Ahrefs 统计 26,283 个 ChatGPT 来源 URL，「best X」博客榜单占 43.8% [S6]；一家小代理商的 Bing 后台数据里，19,717 次 Copilot 引用有 69% 落在一篇带价格和功能对比的页面上 [S28]。但自卖自夸的榜单在 Google 搜索那一侧有风险，见第 5 条。
5. **写法上，答案放前面、一页答一个问题、话说死。** Kevin Indig 分析 18,012 次 ChatGPT 引用：44.2% 来自页面前 30% 的文字；被引句子里「肯定式表述」出现率 36.2%，没被引的是 20.2% [S11]。Indig 和 AirOps 对 815,000 组查询和页面的研究：「终极指南」不如聚焦短页，500 到 2,000 字最好；把子话题全部覆盖只多 4.6 个百分点的引用率；最强的预测因素是检索排名（排第 0 位引用率 58%，第 10 位 14%）[S12]。
6. **加数据、加引语、注明出处，在实验里能提高可见度；堆关键词反而有害。** Princeton 等的 GEO 论文（KDD 2024，10,000 条查询）：加引语、加统计数字、引用出处，可见度提高约 30% 到 40%；堆关键词下降 8.7% [S14]。排名靠后的来源受益更大：第 5 名的来源用「引用出处」后可见度提高 115.1% [S14]。
7. **「新鲜」是靠真实更新做出来的，不是靠改日期。** Seer 2026：被引页面 72% 在一年内更新过，但只有 42% 是一年内首发的 [S9]。Ahrefs：AI 引用的页面平均比 Google 自然结果新 25.7%，但平均仍有 2.9 年 [S8]。Lily Ray 记录的受损站点里，「标题加 2026」「人工刷新日期」是共同特征之一 [S20]。
8. **社区要靠真实回答，不要买帖子。** Profound 的 Reddit 数据（与 Reddit 合作）：被引的帖子多是「具体问题 + 直接解答」的问答串，正面和负面情绪被引概率差不多（5% 和 6.1%）[S2]。Reddit 把刷票、批量账号定义为内容操纵并封号 [S22]；HN 明文禁止拉票 [S35][S36]。Google 2026 年起把「试图操纵 Google 搜索里的生成式 AI 回答」写进了垃圾政策 [S18][S19]。
9. **中文 AI 各有自家「水源」。** 元宝搜索接入公众号、视频号、腾讯新闻 [S46]；新榜监测样本里豆包引用抖音的占比从 2026 年 5 月的 10.79% 升到 8 月的 31.8% [S43]；量子位智库测 7 款中文 AI 助手，知乎被引率 29.9% 最高，B 站 7.6% 第二 [S42]。DeepSeek 据中国广告协会人士介绍会把无新闻资质的自媒体列为高风险信源 [S40]。
10. **中国的 GEO 灰产已经被 315 点名。** 2026 年 3·15 晚会演示：用「力擎GEO优化系统」给一款不存在的「Apollo9」手环生成软文，2 篇发布 2 小时后 AI 就复述了虚构卖点，3 天 11 篇后进入「手环推荐」靠前位置 [S38]。网信办「清朗·整治AI应用乱象」已把「AI数据投毒」列为重点 [S40]；小红书 2026 年 3 月起封禁全部笔记由 AI 托管代发的账号 [S48]。

---

## 2. 正文

### 2.1 站外为什么占大头，以及这句话的边界

**数据。**

- Ahrefs 2025 年 10 月导出 ChatGPT 当月引用最多的 1,000 个页面并分类（分类用 Claude 做，作者说只是方向性结果）：Wikipedia 29.7%、主页和落地页 23.8%、教育类页面 19.4%、应用商店页 6.6%、评测 5.8%、新闻媒体 5.2%、博客文章 1.9%、问答社区 0.9% [S7]。作者把 Wikipedia、机构页、词典这类算作「碰不到的」，合计 67%；能通过外联影响的是教育页、评测、新闻、博客，合计约 32.3% [S7]。
- 同一研究里，28.3% 的高引页面在 Google 没有任何自然排名关键词 [S7]。（推断）说明 ChatGPT 的检索不完全跟着 Google 排名走，小站有机会。
- Seer Interactive 2026 年 7 月：4 个行业 4 个品牌，2026 年 3 到 6 月 ChatGPT、Gemini、Perplexity 的非品牌问题，7,683 个可确定日期的页面、47,097 次引用；作者估计约 98% 的被引页面不属品牌所有 [S9]。样本只有 4 个品牌，且这个 98% 在文中只是顺带一提，没有给出计算过程 [S9]。
- Muck Rack「What is AI Reading?」系列：2,500 万条以上链接，覆盖 ChatGPT、Claude、Gemini，17 个行业；earned media 约 84%，新闻报道约 27%，付费和软文 0.3%；ChatGPT 96% 的回答带引用，Gemini 82%，Claude 55%；Perplexity 有 16.9% 的引用来自 Reddit 和论坛；社交媒体约占 9% [S26]。

**边界。**

- 「84% earned」里包括学术、政府、百科、第三方企业网站，不只是媒体报道 [S26]。（推断）它不等于「做媒体公关能拿到 84% 的可见度」。
- 同一篇 Muck Rack 文章说 Google AI Overviews 的引用 59.8% 是品牌自有域名 [S26]。（推断）对 Google 来说，自己的网站仍然是主战场；对 ChatGPT 和 Perplexity，站外更重要。
- Ahrefs 发现 ChatGPT 和传统权威指标（DR 等）的相关性在三个平台里最弱，作者认为这让 ChatGPT 成为小品牌更容易进入的入口 [S4]。

### 2.2 品牌提及和反向链接

- Ahrefs 2025 年 5 月第一版（只看 AI Overviews，75,000 个品牌）：全网品牌提及相关系数 0.664，品牌锚文本 0.527，品牌搜索量 0.392，DR 0.326，引用域名数 0.295，反向链接 0.218 [S5]。品牌提及在前 25% 的品牌平均被 AIO 提及 169 次，下一个四分位只有 14 次 [S5]。
- Ahrefs 2025 年 12 月第二版扩展到 ChatGPT 和 AI Mode：YouTube 提及相关性最高（约 0.737），超过所有其他因素；全网品牌提及在 AI Mode 达 0.709；品牌搜索量 0.35 到 0.47；DR 0.27 到 0.33；反向链接数和 URL Rating 只有弱相关；站点页面数约 0.194 [S4]。
- 三个平台提到的品牌高度重叠（AI Overviews 和 AI Mode 0.821，AI Mode 和 ChatGPT 0.769）[S4]。
- 限制：样本只取 DR 大于 40、主关键词月搜索量至少 800 的域名；是 Spearman 相关，作者自己说这些可能只是「品牌强」的标志而不是杠杆；Ahrefs 卖 Brand Radar，有利益相关 [S4]。

（推断）对独立开发者的含义：与其买外链，不如让产品名在真实讨论、评测、视频标题里出现。品牌提及之所以和 AI 可见度相关，一个合理解释是 AI 回答是从大量第三方文本里「数票」，被提到的地方越多越分散，越容易被当成共识。

### 2.3 各引擎最常引用的域名

| 引擎 | 数据 | 出处 |
| --- | --- | --- |
| ChatGPT | 占全部引用：Wikipedia 7.8%、Reddit 1.8%、Forbes 1.1%、G2 1.1%、TechRadar 0.9%（2024-08 到 2025-06，6.8 亿次引用） | [S1] |
| ChatGPT | 2025-07 到 10 月，23 万条提示词、1 亿次引用：Reddit 和 Wikipedia 是前两名，其后 Medium、Forbes、LinkedIn；9 月中旬 Reddit 从约 60% 的回答掉到约 10%，Wikipedia 从约 55% 掉到 20% 以下 | [S3] |
| ChatGPT | Reddit 份额约 7% 跌到约 1%，再回到约 3%；Reddit 始终排第 2 | [S2] |
| Google AI Overviews | Reddit 2.2%、YouTube 1.9%、Quora 1.5%、LinkedIn 1.3%、Gartner 0.7% | [S1] |
| Google AI Overviews | 29.5% 的 AIO 引用了 YouTube，排第 1 | [S25] |
| Google AI Mode | LinkedIn（约 15% 的回答）、YouTube、Reddit、Google、Google Blog 领先；Wikipedia 仅约 2% | [S3] |
| Perplexity | Reddit 6.6%、YouTube 2.0%、Gartner 1.0%、Yelp 0.8%、LinkedIn 0.8% | [S1] |
| Perplexity | Reddit、LinkedIn、NIH、Microsoft、Google 领先；Wikipedia 约 0.8% | [S3] |
| Microsoft Copilot | Reddit 只排第 31 位 | [S2] |
| 全部汇总 | Reddit 3.11%、YouTube 2.13%、Wikipedia 1.35%（40 亿次引用） | [S2] |

要点：

- Profound 的数字有两种口径。「47.9%」「46.7%」这种常被转述的数字是「在前 10 名来源里的份额」，不是占全部引用的份额；占全部引用的份额只有个位数 [S1]。网站写作时要说清楚口径。
- Semrush 认为 9 月 ChatGPT 的变化和 Google 取消 num=100 参数时间重合，但其研究员认为主因更可能是 OpenAI 有意避免过度引用某些站 [S3]。原因没有定论。
- LinkedIn：Semrush 2026 年另一项研究（2026 年 1 到 2 月，325,000 条提示词）据摘要显示 LinkedIn 在 11% 的 AI 回答中出现，ChatGPT Search 14.3%、AI Mode 13.5%、Perplexity 5.3% [S52]（只读到搜索摘要）。
- G2：在 ChatGPT 前 10 来源里 [S1]。Kevin Indig 在 G2 博客发表的分析（Profound 的 3 万次引用、500 个 G2 类目）：评论数多 10%，引用多约 2%，但 R² 只有 0.009，评论只解释不到 2% 的差异 [S13]。（推断）评论平台有用但不是主因，别为刷评论冒险。

### 2.4 站内：什么页面会被引用

**页面类型。**

- 「best X」博客榜单：Ahrefs 750 条漏斗顶端提示词（软件、实物产品、代理商三类），26,283 个来源 URL，榜单占 43.8%，是第二名类型的三倍多 [S6]。榜单在所有主要 AI 平台都突出，在 Google AI Overviews 里略多 [S6]。
- 在别人的榜单里排得靠前，和被 ChatGPT 推荐相关；排在榜单前三分之一的效果最好 [S6]。
- 品牌自己的页面被引用时，更多是落地页而不是主页或博客 [S6]。（推断）每个产品至少要有一个讲清楚「是什么、给谁、多少钱」的落地页。
- 对比页：一家 SEO 代理商在 Bing 后台看到 91 天 19,717 次 Copilot 引用，分布在 86 个页面上，但 69% 落在同一篇「AI SEO 工具」对比分析页，前 4 篇对比页拿走 90%；被引最多的是有价格、功能、厂商名的结构化对比内容 [S28]。
- 应用商店页面占 ChatGPT 高引页面的 6.6% [S7]。（推断）Chrome Web Store 页面、小程序介绍页也属于这一类，商店里的描述文字值得认真写。
- 视频：BrightEdge 发现平台专属教程、产品评测和对比类问题更容易引用 YouTube；抽象策略类、纯信息类问题很少引用 [S25]。

**写法。**

- 位置：44.2% 的引用来自页面前 30%，中间 31.1%，最后三分之一 24.7%；段落内部 53% 来自中间句 [S11]。
- 肯定式表述：被引文字 36.2%，未被引 20.2% [S11]。
- 问句标题：被引文字含问号的比例 18%，未被引 8.9%；被引的问句内容 78.4% 来自小标题 [S11]。
- 实体密度：高引文字的实体（产品名、人名、数字等）占比 20.6%，普通英文文本约 5% 到 8% [S11]。
- 可读性：被引内容 Flesch-Kincaid 16，未被引 19.1 [S11]。不过另一项研究里常被引和从不被引的页面都在 12 年级左右 [S12]，可读性不是决定因素。
- 主观度 0.47（0 是纯事实，1 是纯观点），即事实和判断混合 [S11]。

**长度、覆盖面、标题匹配。** Indig 和 AirOps，16,851 条查询，每条在 ChatGPT 界面跑 3 次，抓到子查询、搜索结果和引用，共 815,484 行 [S12]：

- 检索排名是最强的预测因素：排第 0 位引用率 58%，第 10 位 14%；总被引页面的中位排名 2.5，从不被引的 13 [S12]。
- 标题和查询的匹配度 0.90 以上，引用率 41%；低于 0.50 是 30% [S12]。
- 覆盖 100% 子话题比不覆盖只多 4.6 个百分点；覆盖 26% 到 50% 的页面反而比全覆盖的好 [S12]。
- 500 到 2,000 字是甜区；总被引和从不被引的页面平均都约 2,200 字，单看长度分不出好坏 [S12]。
- 聚焦页面 7 到 20 个小标题最好 [S12]。
- 58% 被检索到的页面从未被引用，25% 每次都被引，17% 时有时无 [S12]。

（推断）对独立开发者：一个问题一页，标题就写用户问的那句话，第一段直接给答案。不要写包罗万象的「终极指南」。先保证页面能被搜索引擎排上去，因为 AI 的检索仍然先依赖排名。

**统计数字、引语、出处。** Princeton 等的 GEO 论文 [S14]：

- 基准 GEO-bench 10,000 条查询。
- 相对基线的提升（Position-Adjusted Word Count）：加引语 +42.6%、加统计数字 +32.8%、流畅度优化 +28.7%、引用出处 +27.7%、权威语气 +11.8%；堆关键词 -8.7%（括号内百分比由表 1 绝对值换算）。
- 在 Perplexity.ai 的 200 条子集实测：加引语在 Position-Adjusted Word Count 上约 +22%，加统计数字在主观印象上最高 +37%，堆关键词比基线差约 10%。
- 引用出处让排第 5 的来源可见度 +115.1%，排第 1 的来源平均 -30.3%。
- 限制：只测了两个生成引擎，其中一个公开；是模拟环境，不是真实流量；引擎会变。

**新鲜度。**

- Ahrefs 2025 年 7 月，约 1,700 万条引用（ChatGPT、Perplexity、Gemini、Copilot、AI Overviews 和 Google 自然结果）：AI 引用的 URL 平均发布 1,064 天，Google 自然结果 1,432 天，新 25.7%；按最后更新算差距 13.1%；AI Overviews 例外，反而引用略旧的内容；ChatGPT 对新内容偏好最强 [S8]（读到的是搜索摘要）。
- Seer 2026：75% 的被引页面一年内更新过，88% 两年内；Gemini 78%、ChatGPT 73%、Perplexity 65%；对比和评测页 77% 一年内更新，博客和指南 67% [S9]。约 27% 到 28% 的「新」页面其实是两年前首发的老页面 [S9]。
- Seer 2025 版：近 65% 的 AI 爬虫访问指向过去一年发布的内容 [S10]（搜索摘要）。
- Ahrefs 的「best」榜单研究：79.1% 的样本榜单在 2025 年更新过 [S6]。

（推断）对比页、价格页要经常核对真实信息；常青教程只要事实没过时就不必频繁改。改日期但不改内容属于 Lily Ray 指出的风险信号 [S20]。

**实体清晰。** Google 的官方立场是不需要任何特殊优化，不需要 AI 专用文件或专门的 schema，但要求结构化数据和页面可见文字一致 [S16]。Google 建议做「独特、非同质化」的内容 [S17]。（推断）「实体清晰」落到页面上就是：首段用一句话说清产品名、它是什么、给谁用、价格、和谁类似。这能同时满足 Indig 发现的「肯定式表述」和「高实体密度」[S11]，也方便第三方写榜单时直接引用你的原话。

### 2.5 问题映射：提示词研究和 query fan-out

**用户问 AI 的方式和问搜索引擎不同。**

- Semrush 8,000 万行点击流（2024 年 7 到 12 月）：不开搜索的 ChatGPT 提示词平均 23 个词，开搜索后平均 4.2 个词；约 70% 的提示词归不进传统搜索意图类别 [S29]。
- iPullRank 引用其与 SimilarWeb 的研究：AI 搜索查询平均 70 到 80 个词，Google 是 3 到 4 个词 [S27]。（两个数字口径不同，差距很大，见第 6 节。）

**query fan-out（查询扇出）。**

- Google 官方：AI Overviews 和 AI Mode 可能「围绕子话题和数据源发出多个相关搜索」来生成回答，因此展示的链接比传统搜索更宽 [S16]。
- iPullRank 的定义：一个用户问题被拆成多个子查询，覆盖不同角度、子话题和后续意图，并行执行 [S27]。Google AI Mode 明确使用；ChatGPT 会改写并多次检索但未公开细节；Perplexity 做多次内部检索，以文档和段落为检索单位；Copilot 用 Bing Orchestrator 迭代生成查询 [S27]。
- 免费的真实扇出数据：Bing Webmaster Tools 在 2026 年 2 月上线 AI Performance 报告（公开预览），显示哪些 URL 被 Copilot 等引用、触发引用的「grounding queries」；没有点击数据，暂无 API，可导出 CSV [S28]。Search Influence 发现这些查询是机器生成、关键词密集的，一次对话可能产生 3 到 5 个引用事件 [S28]。

**怎么用。** 结合 [S12] 的结论，扇出覆盖只是弱因素。（推断）合理做法是：用扇出思路找出「用户实际会问的独立问题」，每个问题写一个聚焦页或一个独立小节，而不是把所有子查询塞进一页。

### 2.6 站外：Reddit、HN 和社区参与

**Reddit 被引用什么样的帖子。** Profound（与 Reddit 合作，4 亿以上 AI 回答）：购买决策类（r/BuyItForLife、r/Frugal）、具体产品建议类、实用技巧类子版最常被引；格式是「有人描述具体问题，评论直接给方案」；语气是对话式不是推销式；2025 年被引帖子平均约 1 年 [S2]。Profound 的建议：先问 AI 你客户会问的问题，记录出现的子版，选 3 到 5 个，读懂它们，写平衡、有帮助、不推销的回答，衡量「你权威地回答了多少个有商业意义的问题」[S2]。

**Reddit 的规矩。** Reddit 发言人对 404 Media 表示，这类操纵属于垃圾信息或内容操纵，违反规则；ReplyGuy 这种 AI 自动回帖服务的许多示例账号已被封 [S22]。Reddit 透明度报告：约三分之二的删除是因为垃圾信息，2.7% 是内容操纵，约四分之三的删除是自动完成的 [S22]。r/Biohackers 版主因为「公司在用我们做 AEO」，把多肽和激素类新帖限制到每周集中帖 [S23]。常被转述的「9:1 自我推广比例」我没能在 Reddit 官方页面核实（redditinc.com 无法抓取），见第 6 节。

**Reddit 和 AI 公司的关系在变。** 2025 年 10 月 22 日 Reddit 起诉 Perplexity 和 SerpApi 等抓取公司，指控它们从 Google 结果里间接抓 Reddit 内容 [S24]（搜索摘要）。（推断）Reddit 在各引擎里的权重会随授权谈判波动，别把全部赌注压在 Reddit 上。

**Hacker News。** 可以偶尔发自己的东西，但「主要用途应该是好奇心」；禁止拉票、拉评论 [S35]。Show HN 必须是别人能上手试的东西，你本人做的并且在场讨论；不要发着陆页、众筹页、「快速生成的一次性作品」；尽量不要注册门槛；不要让朋友去点赞评论 [S36]。

**V2EX。** 管理员 Livid 在 2020 年的帖子里说，推广内容应发到 /go/promotions 节点，持续发到其他节点会被处理；作品展示可以发「分享创造」节点 [S37]（搜索摘要，未读原帖）。

**Wikipedia 和 Wikidata。**

- 公司或产品要「被多个独立、可靠的二手来源深入报道」才算有资格（notable）；一个来源几乎永远不够；新闻稿、例行的产品发布报道、列表里的顺带一提、自建内容、赞助内容、大多数博客评测都不算 [S33]。
- 利益相关的人被劝阻直接写自己的条目，应走 Articles for Creation；拿钱编辑必须按使用条款披露雇主和客户；对已有条目只能在讨论页提编辑请求 [S32]。
- Wikidata 的收录标准之一是「可清楚识别的实体」且有「严肃、公开的参考资料」[S34]。页面没有专门讲公司和自我推广，争议走删除讨论，社区最终裁定 [S34]。
- （推断）绝大多数独立开发者的产品不满足 Wikipedia 收录标准，不要去写。Wikidata 条目门槛较低，但价值不确定，优先级排在最后。

**YouTube 和视频。** Ahrefs：YouTube 提及是三个平台中相关性最高的因素 [S4]。BrightEdge：AI Overviews 29.5%、AI Mode 16.6%、Perplexity 9.7%、ChatGPT 0.2% 引用 YouTube；YouTube 的引用量约是 Vimeo 的 200 倍 [S25]。BrightEdge 没有给样本量，且有营销夸大 [S25]。（推断）给 Google 系 AI 做曝光，录教程视频有用；给 ChatGPT 做，视频帮助不大。视频标题要写成用户会问的问题，这一点和新榜对豆包的观察一致 [S43]。

**评论平台。** 见 2.3 节 G2 数据 [S13]。Tally 的做法是请满意用户去 G2 和 Product Hunt 留评 [S31]。

**播客。** 本次没有找到播客对 AI 引用影响的数据，见第 6 节。

### 2.7 中文生态

**各家中文 AI 的信源偏好。**

| AI | 观察 | 证据强度 | 出处 |
| --- | --- | --- | --- |
| 腾讯元宝 / 元宝搜索 | 元宝搜索（so.qq.com）接入微信公众号、视频号、腾讯新闻，热点搜索时直接展示公众号文章和视频号聚类内容，权威来源优先 | 媒体报道产品发布 | [S46] |
| 腾讯元宝 | 2024 年测试时参考资料是第三方网站和公众号的混合，公众号没有明显优势 | 2024 年小样本，可能过时 | [S47] |
| 腾讯元宝 | 某营销文称公众号占 44.1%、腾讯生态占 64%（19,842 条引用） | 无出处，且是发稿平台软文 | [S44] |
| 豆包 | 新榜监测样本中引用抖音的占比从 2026 年 5 月 10.79% 升到 8 月 31.8%；视频标题与提问的语义相似度和被引次数正相关；单纯加长标题或堆数字解释力弱 | 第三方监测，二手转述 | [S43] |
| 豆包 | 某营销文称超 60% 引用来自头条和抖音，旅游问答中抖音引用率 97.7% | 标注为新榜数据，但出处不完整 | [S44] |
| 百度系 | 同一报道称百度 6 月开始把 B 站和好看视频纳入监测信源，合计约 12%，B 站 8 月 8.4% 排第二 | 原文表述含糊 | [S43] |
| DeepSeek | 中国广告协会副秘书长张德志介绍：政府官网、权威机构报告、中央媒体是核心来源，无新闻资质的自媒体是高风险来源 | 专家转述，非官方文档 | [S40] |
| DeepSeek 等 | 博查数据称其 SearchAPI 日均约 3,000 万次调用，承担国内 AI 应用约 60% 的联网搜索请求（2025 年 8 月） | 厂商自述 | [S39] |
| 7 款助手（DeepSeek、豆包、Kimi、元宝、文心、通义、秘塔） | 30 个问题、每个问 3 次、630 条有效数据：近一半引源来自内容社区；知乎 29.9%、B 站 7.6%；专业知识类问题社区占 62.4%，知乎 35.3% | 小样本但方法公开 | [S42] |
| 豆包、DeepSeek、文心、Kimi 等 5 家 | 200 个 B2B/GEO 主题问题 × 5 平台 = 1,000 次：知乎 32%、CSDN/博客园等技术社区 24%、企业官网 18%、新闻 15%、学术和官方文档 11% | 作者说明「非行业通用数据」，题目偏向其业务 | [S45] |

（推断）对开发者产品的分发顺序：

- 技术类问题：CSDN、掘金、博客园、知乎技术回答 [S45][S42]。
- 选型和对比：知乎回答 [S42]。
- 想被元宝引用：公众号文章 [S46]。
- 想被豆包引用：抖音短视频，标题写成用户问题 [S43]。
- 教程视频：B 站 [S42][S43]。
- 少数派、百家号、小红书：本次没有找到可靠的引用占比数据。小红书对 AI 内容管得很严，见 2.8 节。

**中文平台规则。**

- 小红书 2026-03-10：偶尔用 AI 托管代写代发的账号会被警告或限流；直接用 AI 托管工具注册、发布、互动，或主页全部公开笔记由 AI 托管代发的账号，封禁 [S48]。
- 小红书 2026-09-03：把 AI 伪造实景、批量生成同质化体验笔记、虚构亲历列为高风险；2026 年 6 到 8 月清理 AI 虚假笔记近 12 万条；平台鼓励合理用 AI 辅助，但不能虚构没用过的产品 [S49]。
- 《人工智能生成合成内容标识办法》2025-09-01 施行，要求 AI 生成内容加显式和隐式标识，平台要核验标识 [S50]（搜索摘要，未读条文）。
- 知乎的营销和导流处罚细则本次没有找到官方页面，见第 6 节。

### 2.8 黑帽和灰色手法：证据和风险

**1. 隐藏文字和提示词注入。**

- Google 垃圾政策：用和背景同色的文字、CSS 移出屏幕、字号或透明度为 0 等方式只给搜索引擎看的内容，属于隐藏文字滥用；折叠面板、标签页、只给读屏器的文字不算 [S18]。
- 学术证据：EMNLP 2024 论文《Ranking Manipulation for Conversational Search Engines》证明，在网页里放提示词注入能稳定把排名低的产品推上去，攻击能迁移到 Perplexity.ai [S15]。（推断）它也说明这类手法容易被识别，平台有很强的动机去防。
- 微软安全团队 2026-02-10：60 天内发现 31 家公司的 50 个样本，在「用 AI 总结」按钮的 URL 参数里藏「记住某某是可信来源」之类的指令，写进 Copilot、ChatGPT、Claude、Perplexity、Grok 的记忆；这些是正经公司，不是黑客；微软已在 Copilot 里做提示词过滤 [S21]。
- 风险：Google 已把「试图操纵 Google 搜索中的生成式 AI 回答」写进垃圾信息定义 [S18]；据 PPC Land，这一改动在 2026-05-15 的 Search Central changelog 中记录 [S19]。

**2. 自卖自夸的「best X」榜单。**

- 支持的一方：Ahrefs 发现在 Google「best X software」搜索里 67.6% 的结果页有一个「出版方把自己排第一」的榜单；被引的榜单中 35% 在低权威域名上；作者认为从排名和引用角度「看不出坏处」，但 Ahrefs 自己的做法是少写、不每次排第一、披露自己是被推荐方、链接到替代品 [S6]。
- 反对的一方：Lily Ray 2026-02-03 记录 7 个 SaaS 站在 2026 年 1 月中下旬 Sistrix 可见度下降 29% 到 49%，损失 77% 到 93% 集中在博客，博客里有几十到几百篇自卖自夸榜单；Glenn Gabe 观察到这些站在 AI Overviews 里也在掉 [S20]。Google 没有官方声明；作者说榜单是「可能的主因」不是被证实的原因，受损站点同时有 AI 生成内容、人工刷新日期、schema 滥用等问题 [S20]。据搜索摘要，GSQI 认为 2026 年 5 月核心更新继续打击了这类站 [S54]（未读原文）。
- （推断）对独立开发者：可以写对比页，但要做到（a）开头就说明你是作者，（b）写清楚测试方法，（c）真实列出竞品的优点和你的缺点，（d）不要批量生产，（e）不要靠改年份装新。

**3. AI 批量生成内容。** Google 的 scaled content abuse：为操纵排名大量生成页面，例子包括「用生成式 AI 工具生成大量不给用户增加价值的页面」[S18]。违规可能降权、从结果中消失或被人工处罚 [S18]。中文侧：小红书封禁 AI 托管账号 [S48]，清理 AI 虚假笔记 [S49]。

**4. 买 Reddit 帖子、刷票、养号。** ReplyGuy 类服务和「买高 karma 老号做寄生 SEO」在 2024 年就被 404 Media 报道，Reddit 称其违规并封号 [S22]。2026 年 SEJ 评论文章把「买 Reddit 换 AI 引用」类比为当年的链接农场，预测会像 Penguin 一样被过滤，被抓到的品牌会被公开点名 [S23]。按账号、按点赞、按发帖位置计价的服务就是操纵的信号 [S23]。

**5. 寄生 SEO（site reputation abuse）。** Google 定义：第三方内容主要为了借用宿主站的排名信号而发布；EEA 以外可能被人工处罚 [S18]。（推断）花钱在高权重站上发和宿主主题无关的「best X」榜单属于这一类。

**6. 中国的「GEO 投毒」。**

- 315 晚会（2026-03-15）：业内人士在电商平台买到「力擎GEO优化系统」，录入虚构的 Apollo9 手环，软件生成十几篇含伪造评价的软文并自动发到自媒体账号；首批 2 篇发布 2 小时后，某 AI 大模型照搬了「量子纠缠传感」「黑洞级续航」等虚构说法；3 天 11 篇（8 篇「专家测评」、2 篇「行业排名」、1 篇「用户测评」）后，两个 AI 大模型在「智能健康手环推荐」里给出靠前排名；报道未点名具体 AI [S38]。
- 北青报 2026-06-24：曝光后这门生意没有消失；手法包括批量软文、编造测评、虚构专家身份；一个不知名白酒品牌靠小网站发「综合评分第一，超越茅台、五粮液」进入多个 AI 的「十大白酒品牌」；网信办「清朗·整治AI应用乱象」专项行动把「AI数据投毒」列为重点；可能适用《广告法》《反不正当竞争法》等 [S40]。
- 凤凰网科技（2025-08，虎嗅 2026-03 转载）：DeepSeek 是国内被「投毒」的重点对象；报价国内每月每关键词 150 到 300 元，海外每月 300 到 500 美元；有从业者认为模型厂商有反作弊策略，灰产难以为继 [S39]。
- 科技日报（2026-03-18）：攻方低成本批量生成制造「虚假多源一致」，防方要逐条比对，成本严重不对称；《生成式人工智能服务管理暂行办法》对这类平台投毒有规制空白；专家建议建立信源黑白名单 [S41]。

### 2.9 案例（有数字的）

**Tally（表单工具，小团队，自举）。**

- 联合创始人 Marie Martens 称，2025 年 4 月底到 5 月初 ChatGPT 带来了 25% 的新注册 [S30]；4 到 5 月每周最多约 8,000 名新用户说是从 ChatGPT 知道的，远多于分析工具显示的数字 [S31]。SimilarWeb 估计 5 月来自 ChatGPT 的访问约 12.5 万次，占引荐流量 9.6% [S30]。
- 做了什么 [S30][S31]：
  - 社区监听：用 Octolens 监控品牌和竞品提及，推到 Slack。
  - 对照 SEO 关键词和 AI 提示词，发现 AI 推荐的强弱项和自然搜索一致。
  - 列出「提到竞品但没提到 Tally」的文章，主动联系作者补写。
  - 用 Rankshift、GPTrends 跑提示词，看 AI 引用了哪些来源。
  - 请满意用户去 G2、Product Hunt 留评。
  - 人工写的对比页（Tally vs Typeform 等 4 篇），加一篇「best free form builders」榜单，放在帮助文档里；这篇榜单在一次 Perplexity 搜索串里被引用 14 次。
  - 维护 r/TallyForms 子版，回答技术问题，发更新日志。
  - 注册表单里问「从哪个 AI 工具知道我们」以及「用的什么提示词」。
  - 把增长和 ChatGPT 默认开启联网搜索联系起来，而不是归因于某次排名跳升。
- 限制：数字来自创始人自述和 SimilarWeb 估算，口径不一致 [S30]。

**Search Influence（SEO 代理商自己的站）。** Bing AI Performance 报告：91 天 19,717 次引用、86 个页面，69% 落在一篇 AI SEO 工具对比页；12 月初日均 1,520 次，2 月降到日均 34 次 [S28]。（推断）说明引用会高度集中在一两篇对比页上，而且波动极大。

**Vercel。** 多篇二手文章称其 CEO 说来自 ChatGPT 的注册在 6 个月里从 1% 涨到 10% [S51]。我没找到原始出处，等级 D，见第 6 节。

**中文独立开发者。** 搜索结果里有 CSDN 上的个人分享，称把技术文章发到 CSDN、博客园、知乎、掘金、GitHub 后，一周内让豆包、DeepSeek、Kimi 推荐了自己的 Chrome 插件；我打开的链接内容不对应，原帖没有读到，见第 6 节。

---

## 3. 实战清单

### 3.1 先摸底（第 1 周，每个产品约 1 小时）

1. 为每个产品写 10 到 20 条「用户会问 AI 的问题」，中英文各一套。分三类：
   - 品类问题，比如「best free Chrome extension for X」「有什么好用的 X 工具」。
   - 对比问题，比如「A vs B」「A 的替代品」。
   - 任务问题，比如「怎么在 Chrome 里批量 X」。
   第 4 节有让 AI 帮忙生成的提示词。
2. 在 ChatGPT（开搜索）、Perplexity、Google AI Mode、豆包、DeepSeek（开联网）、元宝里各问一遍。每条记录三件事：有没有提到你、提到时怎么描述、引用了哪些 URL。中文 AI 的样本要多问几次，因为回答每次不同 [S42]。
3. 把记录存成 CSV，格式如下：

```csv
date,product,engine,prompt,mentioned,position,description_correct,cited_urls
2026-11-14,my-ext,chatgpt,"best chrome extension to export bookmarks to markdown",1,3,1,"https://example.com/a|https://reddit.com/r/xxx/..."
2026-11-14,my-ext,doubao,"有什么把书签导出成 markdown 的插件",0,,,"https://zhuanlan.zhihu.com/p/xxx"
```

4. 用下面的脚本算每个产品在每个引擎的提及率，并统计被引用最多的第三方域名。这些域名就是你的站外目标清单：

```js
// mention-rate.mjs  用法: node mention-rate.mjs tracking.csv
import { readFileSync } from 'node:fs';

const rows = readFileSync(process.argv[2], 'utf8').trim().split('\n').slice(1)
  .map(line => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '')));

const rate = {};
const domains = {};
for (const [, product, engine, , mentioned, , , cited] of rows) {
  const key = `${product}\t${engine}`;
  rate[key] ??= { n: 0, hit: 0 };
  rate[key].n++;
  rate[key].hit += mentioned === '1' ? 1 : 0;
  for (const url of (cited || '').split('|').filter(Boolean)) {
    try { const d = new URL(url).hostname; domains[d] = (domains[d] || 0) + 1; } catch {}
  }
}
console.log('product\tengine\tmention_rate');
for (const [k, v] of Object.entries(rate)) console.log(`${k}\t${(v.hit / v.n * 100).toFixed(0)}%`);
console.log('\ntop cited domains');
Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([d, c]) => console.log(`${c}\t${d}`));
```

5. 在 Bing Webmaster Tools 验证站点，打开 AI Performance 报告，导出 grounding queries 的 CSV [S28]。这是现成的真实子查询列表。
6. 注册表单或首次使用的问卷里加一题：「你从哪里知道我们？」，选项里放 ChatGPT、Perplexity、豆包、DeepSeek、元宝等，再加一个可选的「你当时问的是什么？」[S31]。

### 3.2 产品优先级

（推断）一个人做很多产品时，按下面三项给每个产品打 1 到 3 分，相加排序，只做前 2 到 3 个：

- 这个品类有没有人问 AI。做法是 3.1 第 2 步里 AI 会不会给出产品推荐。如果回答只讲方法、不推荐工具，分数低。
- 收入或转化价值。
- 差距。别人被推荐了而你没有，并且被引的第三方页面是你够得着的（Reddit 帖子、知乎回答、小博客榜单），分数高。如果被引的全是 Wikipedia 和大媒体，分数低 [S7]。

### 3.3 站内页面（每个优先产品）

1. **落地页首段写清实体。** 一段话说清：产品名、一句话定义、给谁用、价格（免费、一次性、订阅）、运行在哪（Chrome、微信、Web）、和哪些产品类似。用肯定句，不要只写口号 [S11][S6]。示例：

```md
# BookmarkMD

BookmarkMD 是一个免费的 Chrome 扩展，把浏览器书签一键导出成 Markdown 文件，适合用 Obsidian 或 Logseq 管理资料的人。
基础功能免费，按文件夹批量导出的 Pro 版一次性 9 美元。
和 Raindrop.io 相比，它不需要账号，数据只存在本地。
```

2. **每个高价值问题一页。** 标题直接用用户问的那句话（[S12] 里标题匹配度 0.9 以上的引用率是 41%，低于 0.5 是 30%），第一段直接回答，500 到 2,000 字，7 到 20 个小标题 [S12]。
3. **对比页和替代品页。** 写「X vs 你」「X alternatives」。要求如下：
   - 开头披露你是作者。
   - 写测试方法和日期。
   - 用表格列价格、功能、限制。
   - 写竞品真正的优点。
   - 不要每篇都把自己排第一。
   参照 Ahrefs 自己的做法 [S6] 和 Lily Ray 的审计建议 [S20]。Astro 内容集合的 frontmatter 示例：

```md
---
title: "BookmarkMD vs Raindrop.io：导出书签到 Markdown 该用哪个（2026 实测）"
description: "两款工具的价格、导出格式、离线能力对比。作者是 BookmarkMD 的开发者。"
updated: 2026-11-14
tested_on: "Chrome 142, macOS 26"
---

> 披露：我是 BookmarkMD 的开发者。下面的测试在 2026-11-10 完成，方法见文末。

## 一句话结论
如果你只要把书签导出成 Markdown，BookmarkMD 更简单；如果你要跨设备同步和全文搜索，Raindrop.io 更合适。

## 对比表
| | BookmarkMD | Raindrop.io |
|---|---|---|
| 价格 | 免费 / Pro 9 美元一次性 | 免费 / Pro 订阅 |
| 需要账号 | 否 | 是 |
| ... | ... | ... |
```

4. **加真东西。** 加原始数据（你产品的使用统计、你做的测试）、带出处的统计数字、有名有姓的引语 [S14]。不要堆关键词 [S14]。
5. **更新要真改内容。** 对比页、价格页每季度核对一次。改了内容再改 `updated` 日期，标题里不要只换年份 [S9][S20]。
6. **自查有没有自卖自夸的批量榜单。** 在 Google 里搜：

```
site:yourdomain.com intitle:best
site:yourdomain.com intitle:"top 10"
site:yourdomain.com intitle:2026
```

   找出把自己排第一、没有披露、没有方法说明的页面，合并、改写或删除 [S20]。
7. **检查有没有隐藏文字和「用 AI 总结」按钮里藏指令。** 搜代码里的 `remember`、`trusted source`、`?q=`、`?prompt=`，以及 `display:none`、`font-size:0`、`opacity:0` 里的正文内容 [S18][S21]。

```bash
rg -n "trusted source|remember .* as|chatgpt.com/\?q=|perplexity.ai/search\?q=|copilot.microsoft.com/\?q=" src/
```

8. **结构化数据可选。** Google 说不需要专门的 schema，但已有的要和页面文字一致 [S16]。如果加 `SoftwareApplication`，价格和描述要和首段完全一致。

### 3.4 站外（每周）

1. **从 3.1 的「被引第三方域名」清单出发。** 只做 AI 实际引用的那些地方 [S2]。
2. **Reddit。** 选 3 到 5 个 AI 常引用的子版 [S2]。先读版规，每周回答 2 到 3 个具体问题，大部分回答不提自己的产品；提的时候说明你是作者，同时写出局限。不要买号、不要刷票、不要用自动回帖工具 [S22][S23]。
3. **找「提到竞品但没提到你」的榜单和文章。** 给作者发一封简短邮件，附上一句话定义、价格、和竞品的差别、一个免费试用码 [S31]。不要付费换排名，付费内容在 Muck Rack 统计里只占 0.3% 的引用 [S26]，而且可能踩 Google 的链接和寄生 SEO 政策 [S18]。
4. **HN / Product Hunt / V2EX / Indie Hackers。** 每个产品在有实质更新时发一次。Show HN 要能免注册试用，你本人在场回复，不拉票 [S36]。V2EX 作品发「分享创造」，纯推广发 /go/promotions [S37]。
5. **视频。** 优先产品各录 1 到 3 条教程，标题写成用户的问题，英文发 YouTube，中文发 B 站和抖音 [S4][S25][S43]。
6. **中文分发。**
   - 技术文发 CSDN 和掘金。
   - 选型问题在知乎回答，开头披露身份。
   - 产品公告和教程同步发公众号，元宝搜索会展示公众号文章 [S46]。
   - 发小红书只发真人实测，不用 AI 托管工具 [S48][S49]。
   - AI 写的稿子按平台要求做 AI 标注 [S50]。
7. **评论。** 在产品里合适的时机请满意用户去 Chrome Web Store、G2 或 Product Hunt 留评。不要买评论 [S13]。

### 3.5 一个人的周常（推断，约 4 到 5 小时）

| 时间 | 做什么 |
| --- | --- |
| 周一 30 分钟 | 跑一遍优先产品的追踪提示词（每个产品 5 到 10 条，3 到 4 个引擎），更新 CSV，跑 `mention-rate.mjs` |
| 周一 15 分钟 | 看 Bing AI Performance 和 GA4 的 AI 引荐，看注册问卷里的 AI 来源 |
| 周二 90 分钟 | 写或更新 1 个聚焦页（一个问题一页）或 1 个对比页 |
| 周三 45 分钟 | Reddit / 知乎 / V2EX 回答 3 个具体问题，大部分不提自己 |
| 周四 45 分钟 | 把周二的页面改写成 1 篇中文平台文章（掘金或公众号）或 1 条视频脚本 |
| 周五 30 分钟 | 给 1 到 2 个「提到竞品没提到你」的作者发邮件；写周记：做了什么、哪个提示词变了 |
| 每月 | 换一个产品进入优先列表；对比页核对价格和功能 |

### 3.6 不同产品形态怎么做

**Chrome 插件。**
- （推断）Web Store 详情页是一种「应用商店页」，这类页面占 ChatGPT 高引页面的 6.6% [S7]，所以商店描述首段要写清实体（是什么、给谁、价格、权限用途）。
- 另做一个落地页、一个 alternatives 页、一个 vs 页 [S6]。
- 在商店里请用户留评。
- 教程视频的标题用「how to X in Chrome」句式 [S25]。

**开源仓库。**
- （推断）README 首段写一句话定义、适用场景、和同类库的区别。
- 在有实质版本时发 Show HN [S36] 和 V2EX「分享创造」[S37]。
- 投稿到相关的 awesome 列表（这类列表属于第三方榜单）。
- 回答 Stack Overflow 和 CSDN 上的相关问题，回答要真正解决问题。
- GitHub 和 Stack Overflow 在 AI 引用里的份额，本次没有找到可靠数据，见第 6 节。

**教程站（Astro 静态站）。**
- 一页一个问题，标题匹配提问，首段给答案 [S11][S12]。
- 加你自己测出来的数字和截图 [S14]。
- 配一条 B 站或 YouTube 视频 [S25]。
- 不要批量用 AI 生成几百页 [S18]。

**付费会员站。**
- （推断）付费墙后面的内容 AI 读不到，要把每个付费内容的「问题 + 摘要答案 + 适用人群」做成公开页。
- 再做「X vs 你」「X 的免费替代」页。
- 站外靠用户在知乎、Reddit 的真实评价。

**微信小程序。**
- （推断）小程序内的内容大多不在公开网页上，AI 很难直接引用。曝光靠两条路：
  - 公众号文章给元宝搜索引用 [S46]。
  - 抖音和小红书给豆包等引用 [S43]，但要守住小红书的 AI 规则 [S48][S49]。
- 同时做一个公开网页介绍页，写清小程序名称和搜索方式（猜测：这能帮助 DeepSeek 等依赖公开网页检索的 AI，没有直接证据）。

---

## 4. 结合 AI 怎么做

可以交给 AI 的活：生成提示词清单、模拟子查询、审页面、起草对比表、整理追踪结果、把英文页改写成中文平台文章的初稿。不该交给 AI 的活：在 Reddit、知乎、小红书代替你发帖和回复（小红书明确封禁 AI 托管账号 [S48]，Reddit 封自动回帖账号 [S22]）；伪造测评和用户评价（315 演示的正是这种 [S38]）；批量生成页面（Google scaled content abuse [S18]）。

**提示词 1：生成「用户会问 AI 的问题」清单。**

```
你是一个熟悉 {品类} 的普通用户，不是营销人员。
我的产品：{一句话定义、目标用户、价格、平台}。
主要竞品：{A, B, C}。

请列出 30 个真实用户可能会问 ChatGPT / 豆包 / DeepSeek 的问题，要求：
1. 中文 15 条、英文 15 条。
2. 分三类：品类推荐（"有什么好用的…"）、对比和替代（"A 和 B 哪个好""A 的免费替代"）、具体任务（"怎么在 Chrome 里…"）。
3. 用户口语，可以长，可以带场景和约束（预算、系统、是否要登录）。
4. 不要出现我的产品名。
输出为表格：类别 | 语言 | 问题。
```

**提示词 2：模拟 query fan-out。**

```
假设你是一个 AI 搜索引擎，收到用户问题："{问题}"。
在回答前，你会拆成哪些子查询去搜索网页？请列出 8 到 12 个子查询，每个标注意图（定义、对比、价格、教程、评价、替代品、限制）。
然后告诉我：一个独立开发者的网站，最值得为其中哪 3 个子查询各写一个独立页面？理由是什么？
```

（可以拿 Bing AI Performance 导出的真实 grounding queries 来对照 AI 模拟的结果 [S28]。）

**提示词 3：审一页内容是否「容易被引用」。**

```
下面是我网站的一个页面。请按这些标准逐条打分（1 到 5）并指出具体句子：
1. 第一段是否直接回答标题里的问题？
2. 是否用肯定句说清产品是什么、给谁、价格、和谁类似？
3. 小标题是否用用户会问的问题句式？
4. 是否有具体数字、日期、出处、有名有姓的引语？
5. 是否有和主题无关的铺垫、口号、重复？
6. 如果这是对比页：是否披露作者身份、写了测试方法、真实写了竞品优点？
最后给出改写后的第一段（不超过 80 字）和建议删掉的段落。
不要编造任何数据；需要数据的地方写 [需补充: …]。

页面内容：
{粘贴}
```

**提示词 4：起草对比表（你来核实）。**

```
根据下面我提供的资料（来自两款产品的官网定价页和文档，抓取日期 {日期}），生成一张对比表：价格、免费额度、平台、是否需要账号、数据存储位置、主要限制。
规则：
- 只用我提供的资料，资料里没有的格子写"未知"。
- 每个格子后面标出处编号。
- 另写一段"什么情况下应该选竞品"。
资料：
{粘贴}
```

**提示词 5：整理追踪结果。**

```
下面是我把同一组问题问了 ChatGPT、Perplexity、豆包、DeepSeek 的原始回答。
请输出 CSV，列为：engine,prompt,mentioned(0/1),position(第几个被提到),description_correct(0/1),cited_urls(用|分隔)。
我的产品名是 {名称}，别名 {别名}。描述正确的标准是：{一句话定义}。
只根据回答文本判断，不要推测。
{粘贴回答}
```

**提示词 6：把英文聚焦页改写成中文平台初稿。**

```
把下面这篇英文页面改写成一篇适合 {掘金 / 公众号 / 知乎回答} 的中文初稿：
- 保留所有数字和出处，不新增任何数据。
- 开头一句话回答问题，第二句披露"我是这个工具的作者"。
- 知乎回答版本要先给通用解法，再提到我的工具，并写出它的局限。
- 标出所有需要我本人补充截图或亲测结果的位置 [需亲测]。
我会自己修改后发布，并按平台要求标注 AI 辅助。
```

---

## 5. 误区和争议

1. **「AI 引用 47.9% 来自 Wikipedia / 46.7% 来自 Reddit」。** 这是 Profound「前 10 来源内的份额」，占全部引用的份额只有 7.8% 和 6.6% [S1]。而且 2025 年 9 月后 ChatGPT 的 Reddit 份额又大幅变化 [S2][S3]。
2. **「品牌提及比外链重要 3 倍」。** 是二手文章把 0.664 和 0.218 两个相关系数相除得出的说法，不是 Ahrefs 的结论；样本只含 DR 大于 40 的站，是相关不是因果 [S4][S5]。
3. **「84% 的 AI 可见度来自媒体公关」。** Muck Rack 的 84% 是 earned 来源的广义份额，包括学术、政府、百科和第三方企业页 [S26]；而且 Google AI Overviews 的引用 59.8% 来自品牌自有站 [S26]。
4. **「写终极长文覆盖所有子查询就能被引」。** Indig 和 AirOps 的数据相反：全覆盖只多 4.6 个百分点，聚焦短页更稳定；检索排名才是门槛 [S12]。
5. **「改个日期就算更新」。** Seer 只证明更新时间和引用相关，没验证改日期是否有效 [S9]；Lily Ray 把人工刷新日期列为受损站的共同特征 [S20]。
6. **「自卖自夸的榜单没有坏处」。** Ahrefs 从 ChatGPT 引用角度看确实没看到坏处 [S6]，但 Google 搜索这一侧有站点在掉 [S20]。Google 把操纵生成式 AI 回答写进了垃圾政策 [S18]。两边结论都是相关性观察，因果都没被证实。
7. **「GEO 论文证明加统计数字能提升 40%」。** 是在模拟生成引擎里测的相对提升，Perplexity 真机测试的数字更小（约 22% 到 37%）[S14]，而且是 2023 到 2024 年的引擎。
8. **中文营销文里的精确占比（如「元宝公众号占 44.1%」「豆包抖音企业号权重 30%」）。** 多数没有可核实的样本和方法，很多文章本身就是发稿平台的软文 [S44]。较可信的是方法公开的量子位智库测试 [S42] 和新榜监测（需注意口径）[S43]。
9. **「做 GEO 就是投毒」。** 媒体和从业者都区分合规的内容优化和批量造假 [S39][S40]。风险在于虚构事实、伪造测评、批量铺量，不在于「为 AI 写清楚」。
10. **「需要 llms.txt 或 AI 专用 schema 才能进 AI Overviews」。** Google 官方明确说不需要 [S16]。其他引擎的情况不在本稿范围。

---

## 6. 还没查清的问题

1. **Reddit 官方自我推广规则原文。** 「9:1 比例」是否仍是官方规则，redditinc.com 和 Reddit 帮助中心都没能抓取，只看到第三方转述和 2020 年存档。
2. **GitHub、Stack Overflow、Chrome Web Store 在 AI 引用里的份额。** 只找到厂商博客的无方法说法，没有可靠数据。对开发者产品最关键的这一块是空白。
3. **两个 AI 查询长度数字差很多。** Semrush 是 23 个词 [S29]，iPullRank 是 70 到 80 个词 [S27]。口径不同，没有找到能调和二者的数据。
4. **元宝的公众号引用占比。** 只有营销文里无出处的 44.1% [S44]。2026-11-11 元宝搜索上线后的真实信源分布没有独立统计。品玩原文只写「11月11日」，年份是我根据上下文推断的 2026 年 [S46]。
5. **新榜关于百度纳入 B 站、好看视频的那句话。** 原文没写清是在豆包样本还是百度样本里 [S43]。
6. **DeepSeek 的「信源分级」是否有官方文档。** 目前只有中国广告协会人士的转述 [S40]。
7. **Vercel「ChatGPT 带来 10% 注册」。** 只找到二手文章，没有原始出处 [S51]。
8. **中文独立开发者「一周内让豆包推荐插件」的案例。** 搜索结果出现过，打开的链接不对，没读到原文。之后 WebSearch 配额用尽，没能再查。
9. **播客对 AI 引用的影响。** 没有找到任何数据。
10. **知乎、掘金、CSDN、少数派的营销和导流处罚细则。** 本次没有找到官方页面。
11. **美国 FTC 关于虚假评论的规定。** 我记得有相关规定，但本次没有打开任何出处核实，不能写进正文。
12. **2026 年 5 月以后 Google 是否真的按「操纵生成式 AI 回答」执法过。** 二手来源说法互相矛盾，Google 没有确认 [S19]。
13. **Kevin Indig 2026-03 的 21K 引用研究（长度、深度、聚焦）。** 原文在付费墙后，只看到标题。
14. **Muck Rack 2026-05 PDF 原文。** 是图片版，无法提取；数字来自 Muck Rack 博客 [S26]。
15. **Ahrefs 的 YouTube 提及统计口径。** 是只看视频标题还是包含字幕，读到的转述不清楚 [S4]。

---

## 7. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | AI Platform Citation Patterns: How ChatGPT, Google AI Overviews, and Perplexity Source Information | Profound | 2025-06-05（2025-08 更新） | https://www.tryprofound.com/blog/ai-platform-citation-patterns | 厂商研究（卖 GEO 工具） | B | 6.8 亿次引用；ChatGPT 首引 Wikipedia 7.8%，AIO 和 Perplexity 首引 Reddit；47.9% 是前 10 内份额 |
| S2 | The data on Reddit and AI search | Profound（应 Reddit 要求） | 2025-11-10 | https://tryprofound.com/blog/the-data-on-reddit-and-ai-search | 厂商研究，与 Reddit 合作 | B | 40 亿次引用；Reddit 汇总 3.11% 排第一；被引帖子是具体问答，正负情绪被引率相近 |
| S3 | The Most-Cited Domains in AI: A 3-Month Study | Semrush | 2025-11-10 | https://www.semrush.com/blog/most-cited-domains-ai/ | 厂商研究 | B | 23 万提示词、1 亿次引用；9 月中旬 ChatGPT 对 Reddit、Wikipedia 引用骤降；AI Mode 偏好 LinkedIn 等 Google 系 |
| S4 | Top Brand Visibility Factors in ChatGPT, AI Mode, and AI Overviews (75k Brands Studied) | Ahrefs | 2025-12-12 | https://ahrefs.com/blog/ai-brand-visibility-correlations/ | 厂商研究 | B | YouTube 提及相关性约 0.737 最高；反向链接只有弱相关；样本 DR 大于 40 |
| S5 | An Analysis of AI Overview Brand Visibility Factors (75K Brands Studied) | Ahrefs | 2025-05-26 | https://ahrefs.com/blog/ai-overview-brand-correlation/ | 厂商研究（只读到搜索摘要） | B | AIO：品牌提及 0.664、锚文本 0.527、外链 0.218 |
| S6 | Do Self-Promotional "Best" Lists Boost ChatGPT Visibility? Study of 26,283 Source URLs | Ahrefs（Glen Allsopp） | 2025-12-04 | https://ahrefs.com/blog/best-lists-research/ | 厂商研究 | B | best 榜单占 ChatGPT 来源 43.8%；在第三方榜单排名靠前与被推荐相关；Ahrefs 自身做法是披露、不总排第一 |
| S7 | 67% of ChatGPT's Top 1,000 Citations Are Off-Limits to Marketers | Ahrefs（Louise Linehan） | 2025-10-28 | https://ahrefs.com/blog/chatgpts-most-cited-pages/ | 厂商研究 | B | 前 1,000 高引页 67% 难以影响；应用商店页 6.6%；28.3% 在 Google 无排名 |
| S8 | New Study: AI Assistants Prefer to Cite "Fresher" Content (17 Million Citations Analyzed) | Ahrefs | 2025-07-28 | https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/ | 厂商研究（只读到搜索摘要） | B | AI 引用比 Google 自然结果新 25.7%，但平均仍 2.9 年；AIO 例外 |
| S9 | Study: Content Recency's Impact on AI Visibility in 2026 | Seer Interactive | 2026-07-24 | https://www.seerinteractive.com/insights/study-content-recencys-impact-on-ai-visibility-in-2026 | 代理商研究 | B | 47,097 次引用；72% 一年内更新但仅 42% 一年内首发；约 98% 被引页不属品牌 |
| S10 | Study: AI Brand Visibility and Content Recency | Seer Interactive | 2025（约 6 月） | https://www.seerinteractive.com/insights/study-ai-brand-visibility-and-content-recency | 代理商研究（只读到搜索摘要） | B | 近 65% 的 AI 爬虫访问指向过去一年内容 |
| S11 | The Science Of How AI Pays Attention | Search Engine Journal（Kevin Indig） | 2026-02-17 | https://www.searchenginejournal.com/the-science-of-how-ai-pays-attention/567597/ | 从业者数据研究 | B | 18,012 次引用；44.2% 来自页面前 30%；肯定式表述 36.2% 对 20.2%；实体密度 20.6% |
| S12 | Shorter, Focused Content Wins In ChatGPT | Search Engine Journal（Kevin Indig，与 AirOps） | 2026-04-14 | https://www.searchenginejournal.com/shorter-focus-content-wins-in-chatgpt/571857/ | 从业者数据研究 | B | 815,484 行；检索排名是最强预测因素；全覆盖子话题只多 4.6 个百分点；500 到 2,000 字最好 |
| S13 | Do More G2 Reviews Mean More AI Visibility? Insights from 30k Citations | G2 Learn Hub（Kevin Indig） | 2025-10-23 | https://learn.g2.com/do-more-g2-reviews-mean-more-ai-visibility | 数据研究，G2 平台发布（利益相关） | B | 评论多 10% 引用多约 2%，R² 0.009 |
| S14 | GEO: Generative Engine Optimization | Aggarwal 等（Princeton 等），KDD 2024 | 2023-11（v3 2024-06-28） | https://arxiv.org/abs/2311.09735 | 同行评审论文 | A | 10,000 条查询；加引语、统计、出处提升约 30% 到 40%；堆关键词有害；排名靠后来源受益更大 |
| S15 | Ranking Manipulation for Conversational Search Engines | Pfrommer 等，EMNLP 2024 | 2024-06（v3 2024-09-25） | https://arxiv.org/abs/2406.03589 | 同行评审论文 | A | 网页提示词注入能把低排名产品推上去，可迁移到 Perplexity |
| S16 | AI features and your website | Google Search Central | 访问于 2026-11-14（页面未显示日期） | https://developers.google.com/search/docs/appearance/ai-features | 官方文档 | A | AIO 和 AI Mode 用 query fan-out；无额外要求，不需要 AI 文件或专门 schema |
| S17 | Top ways to ensure your content performs well in Google's AI experiences on Search | Google Search Central Blog（John Mueller） | 2025-05-21 | https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search | 官方博客 | A | 做独特、非同质化内容；看访问价值不只看点击 |
| S18 | Spam policies for Google web search | Google Search Central | 访问于 2026-11-14 | https://developers.google.com/search/docs/essentials/spam-policies | 官方文档 | A | 垃圾定义含「试图操纵 Google 搜索中的生成式 AI 回答」；scaled content abuse、site reputation abuse、隐藏文字 |
| S19 | Google spam policies now officially cover AI Overviews and AI Mode in Search | PPC Land | 2026-05 | https://ppc.land/google-spam-policies-now-officially-cover-ai-overviews-and-ai-mode-in-search | 行业新闻 | C | 引 Search Central changelog：2026-05-15 澄清垃圾政策适用于生成式 AI 回答 |
| S20 | Is Google Finally Cracking Down on Self-Promotional Listicles? | Lily Ray（Substack） | 2026-02-03 | https://lilyraynyc.substack.com/p/is-google-finally-cracking-down-on | 从业者案例 | C | 7 个 SaaS 站 2026 年 1 月可见度降 29% 到 49%，博客里有大量自卖自夸榜单；因果未证实 |
| S21 | Manipulating AI memory for profit: The rise of AI Recommendation Poisoning | Microsoft Security Blog | 2026-02-10 | https://www.microsoft.com/en-us/security/blog/2026/02/10/ai-recommendation-poisoning/ | 平台安全研究 | B | 60 天 31 家公司 50 个样本，在「用 AI 总结」按钮里藏记忆指令 |
| S22 | AI Is Poisoning Reddit to Promote Products and Game Google With 'Parasite SEO' | 404 Media（Jason Koebler） | 2024-04-23 | https://www.404media.co/ai-is-poisoning-reddit-to-promote-products-and-game-google-with-parasite-seo/ | 调查报道 | C | ReplyGuy 自动回帖；Reddit 称属内容操纵并封号；透明度报告数据 |
| S23 | Buying Reddit To Win AI Citations Is The New Link Farm | Search Engine Journal（Slobodan Manic） | 2026-06-29 | https://searchenginejournal.com/buying-reddit-to-win-ai-citations-is-the-new-link-farm/578016/ | 评论，引调查报道 | C | r/Biohackers 因公司做 AEO 限制发帖；按账号或点赞计价即操纵信号 |
| S24 | Reddit sues Perplexity, SerpApi over scraping Google Search data | Search Engine Land | 2025-10 | https://searchengineland.com/reddit-sues-perplexity-serpapi-scraping-google-463681 | 新闻（只读到搜索摘要） | C | 2025-10-22 Reddit 起诉 Perplexity 和抓取公司 |
| S25 | AI Engines Choose YouTube 200x More Than Any Other Video Platform | BrightEdge | 2025-09-25 | https://brightedge.com/resources/weekly-ai-search-insights/youtube-presence-ai-search | 厂商研究（无样本量） | C | AIO 29.5%、AI Mode 16.6%、Perplexity 9.7%、ChatGPT 0.2% 引用 YouTube |
| S26 | What are AI citations? How PR teams can track and earn them | Muck Rack | 2026-11-03（更新） | https://muckrack.com/blog/ai-citations-for-pr | 厂商研究（卖 PR 工具） | B | 2,500 万链接：earned 约 84%、付费 0.3%、新闻 27%；AIO 59.8% 来自品牌自有域名 |
| S27 | How AI Search Platforms Expand Queries with Fan-Out and Why It Skews Intent | iPullRank（Lazarina Stoy） | 2025-11 或 12（页面写 12.11.2025） | https://ipullrank.com/expanding-queries-with-fanout | 从业者文章 | C | 各平台扇出机制对比；AI 搜索查询平均 70 到 80 词 |
| S28 | Inside Bing's New AI Performance Report: What 20,000 Copilot Citations Taught Us | Search Influence（Will Scott） | 2026-02-12 | https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/ | 从业者案例 | C | Bing AI Performance 报告功能；19,717 次引用 69% 落在一篇对比页 |
| S29 | New Semrush Study Reveals ChatGPT Search Trends: Insights From 80 Million Clickstream Records | Semrush | 2025-02-03 | https://www.semrush.com/news/379285-new-semrush-study-reveals-chatgpt-search-trends-insights-from-80-million-clickstream-records/ | 厂商研究 | B | 不开搜索的提示词平均 23 词，开搜索 4.2 词；约 70% 归不进传统意图 |
| S30 | Tally GEO case study | Foundation Inc.（Ethan Crump） | 2026-02-03（更新） | https://foundationinc.co/lab/tally-geo/ | 案例分析 | C | ChatGPT 带来 25% 新注册（2025-04 底到 05 初）；4 篇对比页、r/TallyForms、注册问卷 |
| S31 | How Tally Turned AI into Their Top Acquisition Source: 8 Steps from Marie Martens | Justin Hammond（Substack） | 2025-07-08 | https://justinhammond.substack.com/p/how-tally-turned-ai-into-their-top | 创始人访谈 | C | 8 步做法；每周最多 8,000 名用户称来自 ChatGPT |
| S32 | Wikipedia:Conflict of interest | Wikipedia | 访问于 2026-11-14 | https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest | 平台官方规则 | A | 利益相关者不应直接写自己的条目，走 AfC；付费编辑须披露 |
| S33 | Wikipedia:Notability (organizations and companies) | Wikipedia | 访问于 2026-11-14 | https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies) | 平台官方规则 | A | 需多个独立可靠二手来源深入报道；新闻稿、例行发布、列表提及不算 |
| S34 | Wikidata:Notability | Wikidata | 访问于 2026-11-14 | https://www.wikidata.org/wiki/Wikidata:Notability | 平台官方规则 | A | 三条收录标准之一是有严肃公开参考资料的可识别实体 |
| S35 | Hacker News Guidelines | Y Combinator | 访问于 2026-11-14 | https://news.ycombinator.com/newsguidelines.html | 平台官方规则 | A | 可偶尔发自己的东西；禁止拉票拉评论 |
| S36 | Show HN Guidelines | Y Combinator | 访问于 2026-11-14 | https://news.ycombinator.com/showhn.html | 平台官方规则 | A | 必须可试用、本人在场；不发着陆页和快速生成的一次性作品 |
| S37 | V2EX 管理员关于 /go/promotions 的说明 | V2EX（Livid） | 2020 | https://v2ex.com/t/722504 | 平台管理员发言（只读到搜索摘要） | C | 推广发 /go/promotions，发错节点会被移动或处理 |
| S38 | 315晚会曝光AI大模型被"投毒"，给AI洗脑已成产业链 | 央视财经 / 澎湃新闻 | 2026-03-15 | https://www.thepaper.cn/newsDetail_forward_32773464 | 新闻，公开演示 | C | 力擎GEO优化系统、虚构 Apollo9 手环，2 小时被 AI 复述，3 天 11 篇进推荐靠前 |
| S39 | 被315点名的万亿隐秘生意："污染"DeepSeek | 凤凰网科技（虎嗅转载） | 2025-08-14 首发，2026-03-15 转载 | https://www.huxiu.com/article/4842275.html | 行业报道 | C | DeepSeek 是投毒重点；关键词报价；博查承担约 60% 联网搜索请求 |
| S40 | "让AI提到你"成了一门新生意 AI信源治理成新课题 | 北京青年报 / 中新网 | 2026-06-24 | https://www.chinanews.com.cn/sh/2026/06-24/10646214.shtml | 调查报道 | C | 白酒伪榜单案例；DeepSeek 信源分级（专家转述）；清朗专项把 AI 数据投毒列为重点 |
| S41 | AI被"投毒"，如何避免上当受骗 | 科技日报 / 新华网 | 2026-03-18 | https://www.news.cn/tech/20260318/e2cb80ded5934ef29ed99bd6dc87bf6c/c.html | 专家观点 | D | 攻防成本不对称；现行办法有规制空白；建议信源黑白名单 |
| S42 | 搜索SEO被AI重塑，专业内容社区价值凸显 | 量子位智库 | 2025-05-21 | https://www.qbitai.com/2025/05/285761.html | 小样本测评，方法公开 | C | 7 款 AI、630 条数据；知乎被引率 29.9%、B 站 7.6% |
| S43 | 研究：豆包引用抖音的权重升至 31.8% | 凤凰网大风号（转述新榜智汇） | 2026-10-28 | https://tech.ifeng.com/c/8xb7sJ1xIka | 第三方监测，二手 | C | 豆包样本中抖音占比 5 月 10.79% 升到 8 月 31.8%；标题语义相似度与被引正相关 |
| S44 | GEO 软文怎么写更容易被 AI 引用？六大AI平台偏好与GEO发稿平台选型指南 | 凤凰网大风号（环球科技网） | 2026-09-03 | https://tech.ifeng.com/c/8w7E7F5YWtG | 营销软文 | D | 各平台信源偏好表，多数数字无出处，推广发稿平台 |
| S45 | 迪普智见 GEO 信源分布测试 | CSDN DeepSeek 技术社区（DeepIntelli） | 2026-08-15 | https://deepseek.csdn.net/6a7ffd5f10ee7a33f29b377b.html | 小样本测试 | C | 1,000 次提问：知乎 32%、技术社区 24%、官网 18%；作者称非通用数据 |
| S46 | 腾讯推出全新搜索产品"元宝搜索" | 品玩 | 11 月 11 日（推断为 2026 年） | https://www.pingwest.com/w/319468 | 产品报道 | C | 元宝搜索接入公众号、视频号、腾讯新闻，权威来源优先 |
| S47 | 腾讯 AI 助手元宝大升级！除了能搜公众号，跟其他国产 AI 搜索有什么不同？ | 爱范儿 | 2024-07 | https://www.ifanr.com/1591412 | 产品测评 | X | 2024 年测试公众号无明显优势；元宝此后接入 DeepSeek 并推出元宝搜索，结论可能过时 |
| S48 | 小红书：即日起，封禁主页所有公开笔记均为AI托管代发的账号 | 光明网（洪观新闻） | 2026-03-10 | https://m.gmw.cn/2026-03/10/content_1304371172.htm | 平台官方公告（媒体转述） | A | 偶发 AI 托管警告限流，全部 AI 托管代发封禁 |
| S49 | 小红书严打AI伪造医美、民宿等虚假内容，3个月处置相关笔记近12万条 | 楚天都市报 | 2026-09-03 | https://www.ctdsb.net/c1666_202609/2848235.html | 平台官方公告（媒体转述） | A | 批量同质化 AI 笔记列为高风险；6 到 8 月处置近 12 万条 |
| S50 | 9月1日起 AI生成合成内容必须添加标识 | 科技日报 | 2025-09-01 | https://www.stdaily.com/web/gdxw/2025-09/01/content_393211.html | 法规报道（只读到搜索摘要） | A | 《人工智能生成合成内容标识办法》施行，显式和隐式标识，平台核验 |
| S51 | How Vercel Gets 10% of Signups from ChatGPT (And You Can Too) | WP Suites | 未知 | https://wpsuites.com/blog/chatgpt-marketing-vercel-signups-strategy | 营销博客 | D | 称 Vercel 来自 ChatGPT 的注册 6 个月从 1% 到 10%，未给原始出处 |
| S52 | LinkedIn AI visibility study | Semrush | 2026 | https://www.semrush.com/blog/linkedin-ai-visibility-study/ | 厂商研究（只读到搜索摘要） | B | 32.5 万提示词：LinkedIn 在 11% 的 AI 回答中出现 |
| S53 | Reddit sues Perplexity and three other companies | Engadget | 2025-10 | https://www.engadget.com/social-media/reddit-sues-perplexity-and-three-other-companies-for-allegedly-using-its-content-without-paying-205136436.html?src=rss | 新闻（只读到搜索摘要） | C | 与 S24 互证 Reddit 起诉事件 |
| S54 | Core Roars Back: Google's May 2026 Broad Core Update | GSQI（Glenn Gabe） | 2026-05 或 06 | https://www.gsqi.com/marketing-blog/core-roars-back-google-may-2026-core-update-analysis/ | 从业者分析（只读到搜索摘要） | C | 据摘要，大量使用自卖自夸榜单的站在 5 月核心更新中继续下滑 |
