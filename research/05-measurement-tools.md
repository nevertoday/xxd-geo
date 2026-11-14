# 调研稿 05：怎么衡量 GEO，以及有哪些工具

调研日期：2026-11-14。范围：GEO 指标的定义和算法、为什么难测、每个提示词要跑几次、GA4 / Plausible / Umami / Cloudflare / Search Console / Bing Webmaster Tools 的配置、AI 爬虫日志分析和真假爬虫校验、自己写一个可见度追踪器（含代价估算）、商业和开源工具清单（含中文工具）、前后对比实验的设计。

说明：

- 本稿的两段 Python 脚本（第 3.4 节的日志分析、第 4 节的追踪器）都在本机跑过：日志脚本用 7 行假日志加各家真实发布的 IP 段 JSON 验证，正确识别出 1 个真 GPTBot、1 个伪造 GPTBot、1 个真 ClaudeBot 和 3 次 AI 来访；追踪器用按各家官方文档响应格式伪造的返回值跑通了入库和报表 [S68]。没有用真实 API Key 调用，所以「真实返回结构与文档一致」这一点是根据官方文档推断的。
- 本稿后半程用完了本会话的网页搜索额度，BrightEdge、Conductor、国内商业 GEO 监测服务这几项没能查实，放在「还没查清的问题」里。
- 没有启动任何开发服务器或常驻进程。

---

## 1. 一段话总结

1. **别看排名，看出现率。** SparkToro 和 Gumshoe 让 600 名志愿者把 12 个提示词在 ChatGPT、Claude、Google AI 里跑了 2,961 次：两次回答给出同一份品牌名单的概率不到 1/100，同一顺序约 1/1,000 [S1]。但同一个品牌「出现在多少比例的回答里」相当稳定，比如 City of Hope 在 71 次 ChatGPT 回答里出现 69 次 [S1]。所以核心指标是「提及率（visibility %）」：一组提示词、跑多次、算品牌出现的比例。「AI 排名第几」基本是噪声 [S1][S2]。
2. **单次截图不能当证据，要有样本量。** 单个提示词想把提及率误差压到 ±10 个百分点，需要约 96 次回答；±5 个百分点要约 384 次（本稿按二项分布计算 [S68]，与 Evertune 的实测吻合：5 次误差约 ±27 点，100 次约 ±6 点 [S5]）。但如果你看的是几十个提示词合在一起的总数，每天每个提示词跑 1 次就够：Meikai 用 500 个提示词、25 万条回答测出，每天 1 次和每天 10 次得到的十天合计结果基本一样 [S6]。圣加仑大学的论文建议用 2 到 4 周的滚动窗口 [S3]。
3. **引用来源每周都在换，品牌提及比引用稳。** Ahrefs 连续 20 天追踪约 37,500 个被引网站：ChatGPT 第一天的引用有 59% 第二天就不见了，只有 4% 撑满 20 天；但约 75% 掉出去的引用会在 20 天内回来 [S9]。SISTRIX 17 周 8.2 万个提示词的数据：ChatGPT 每周有 74% 的引用域名是新面孔，AI Mode 56%，AI Overviews 只有 5% [S7]。结论：一个引用丢了先别动，等 2 到 3 周再说 [S9]。
4. **API 测到的不等于用户在 App 里看到的。** Surfer 用 1,000 个提示词对比同一平台的 API 和网页界面：品牌重合只有 15.5% 到 23.8%，ChatGPT API 平均每条回答列 13.8 个品牌、网页只有 7.9 个 [S10]（Surfer 卖的是抓网页界面的数据，有利益相关）。API 追踪适合看趋势，重要结论要在真实 App 里人工抽查确认 [S59]。
5. **GA4 现在自带「AI Assistant」渠道，但会漏。** 2026-05 起 GA4 默认渠道组加了 AI Assistant，规则是 medium 等于 `ai-assistant`，来源匹配 Google 维护的 AI 助手列表 [S14][S16]。它覆盖 ChatGPT、Gemini、DeepSeek、Copilot、Grok，Perplexity、Claude 等会落到 Referral，没有 referrer 的 App 内点击落到 Direct，AI Overviews 和 AI Mode 算 Organic Search [S17][S18]。自己再建一个自定义渠道组，用正则补齐，并放在 Referral 之前 [S15]。
6. **`utm_source=chatgpt.com` 是 ChatGPT 流量的主要信号，但它会突然消失。** 2026-10-08 到 10-15，ChatGPT 在 GPT-6 上线期间丢掉了这个参数和 referrer，一组 500 个页面每天少了约 31,000 次 ChatGPT 来访、Direct 多了约 26,000 次 [S19][S20]。即便恢复后，只有约 12% 的 ChatGPT 点击带 referrer [S19]。看到 AI 流量骤降，先查是不是归因坏了。
7. **Google 和 Bing 都给了官方 AI 报告，但都很粗。** Search Console 的生成式 AI 报告从 2026-08-31 起对所有站点开放，只有曝光数，不分 AI Overviews 和 AI Mode，没有点击 [S13]。Bing Webmaster Tools 的 AI Performance（2026-02 起，免费）能看 Copilot 等的引用次数、被引页面和 grounding 查询，2026-06 又加了 Citation Share 和 Compare，但没有点击数据，也只覆盖微软自家生态 [S24][S25]。
8. **爬虫日志是最便宜、最可靠的一手数据。** OpenAI、Anthropic、Perplexity、Google 都公开了爬虫 IP 段 JSON [S30][S31][S32][S33]，用它能区分真假爬虫。Cloudflare AI Crawl Control 所有套餐都能用，能看各家爬虫的请求量、状态码和最常抓的路径，但「AI 带来的来访（referrals）」只在付费套餐里有 [S27][S28]。
9. **工具很多，价格差两个数量级。** 入门级：Otterly Lite 每月 $29（约 15 个提示词）[S47]、Peec Starter $95（50 个提示词、3 个模型）[S45]、Writesonic Starter $79（年付）[S52]；Profound 在 2026-09 取消了品牌自助套餐，只剩企业询价 [S46][S47]。开源的 Elmo、Limelit Open、OneGlanse、GEO/AEO Tracker 都能自己部署 [S55][S56][S57][S58]。中文场景可以看开源的 GEO 医生（geo-doctor）和 GeoLook，它们支持豆包、DeepSeek、Kimi 等国内模型 [S59][S60]。
10. **前后对比实验要先跑「什么都不改」的基线。** 因为 AI 回答本身每天在变，你需要先知道自然波动有多大，再判断改动有没有用。做法：先测 2 到 4 周基线，留一组不改的对照提示词或对照页面，改完再测 3 到 4 周，比较两组变化的差（双重差分），并用爬虫日志确认 AI 真的重新抓了你改过的页面（本稿基于 [S3][S9][S7] 的建议推导）。

---

## 2. 正文

### 2.1 指标：每个指标是什么、怎么算

下面的定义来自各家工具和研究，公式是本稿整理的统一写法。约定：一个「回答」= 某个引擎对某个提示词的一次输出；只统计成功返回、非空的回答。

| 指标 | 定义 | 计算方法 | 出处和备注 |
|---|---|---|---|
| 提及率 / 可见度（mention rate, visibility %） | 你的品牌出现在多少比例的回答里 | 提到品牌（含别名）的回答数 ÷ 有效回答数。按引擎、提示词分组、时间窗口分别算 | SparkToro 认为这是唯一靠谱的指标 [S1]；Elmo 的定义是「提到你的 run 占比」[S55] |
| 声量份额（share of voice, SoV） | 在同一组提示词里，你占所有被追踪品牌提及的比例 | 你的提及次数 ÷ 所有被追踪品牌（你 + 竞品）的提及次数之和。另一种算法是「提到你的回答数 ÷ 提到任一被追踪品牌的回答数」 | Ahrefs Brand Radar 的定义是「在某个话题集里，提到或引用你的 AI 回答占比，和竞品对比」[S50]。不同工具算法不同，跨工具不可比 |
| 引用率（citation rate） | 回答里链接到你域名的比例 | 至少引用了一个你域名 URL 的回答数 ÷ 有效回答数。也可以算「引用次数 ÷ 回答数」 | Ahrefs 建议按「最近 7 天里有几天引用了你」来计 [S9]。Gemini 和 Copilot 有 64% 和 53% 的回答根本不带引用，计算前先排除无引用回答 [S9] |
| 引用份额（citation share） | 某个查询下所有被引来源里你占多少 | 你被引次数 ÷ 该查询下所有被引次数 | Bing Webmaster Tools 2026-06 新增，微软称之为「观察性指标」[S25] |
| 位置（position） | 你在回答列出的品牌里排第几 | 你在被提及品牌中的名次的平均值，或「被第一个提到的比例」 | SparkToro 认为排序是随机的，「排名是一堆胡扯」[S1][S2]。Elmo 仍然提供平均名次 [S55]。如果一定要看，只看「被第一个提到的比例」并配合样本量 |
| 情感（sentiment） | 回答对你的描述是正面、中性还是负面 | 一般用 LLM 给每条回答打标签，再汇总。Elmo 的打分：正面 100、中性和混合 50、负面 0，取平均 [S55] | 这是模型对文本的「解读」，不是平台返回的数据 [S57]。要人工抽查校准 |
| 事实准确度 | AI 对你的价格、功能、平台的描述对不对 | 人工或 LLM 对照你的「事实卡」逐条核对，算错误回答占比 | 开源工具 GEO 医生和 GeoLook 都把这一项做成了独立流程 [S59][S60] |
| AI 来访会话（AI referral sessions） | 从 AI 产品点进你网站的访问 | GA4 的 AI Assistant 渠道 + 自定义渠道组 [S14][S15]；或服务器日志按 referrer / `utm_source` 统计 | 只是下限，App 内点击常没有 referrer [S18][S19] |
| AI 来访转化 | 这些来访里完成目标事件的比例 | AI 渠道的转化数 ÷ 该渠道会话数，和自然搜索对比 | 流传「AI 来访转化率是搜索的 4 到 23 倍」，来源是 Ahrefs 自家站数据，本稿只见到 SparkToro 的转述，Rand Fishkin 本人也说这里有「动机性思维」[S2]。自己的站要自己测 |
| 爬虫抓取量（crawler hits） | 各家 AI 爬虫访问了你哪些页面、多少次、状态码 | 服务器或 CDN 日志按 UA 统计，用官方 IP 段校验 | Cloudflare AI Crawl Control 直接提供 [S28] |
| 抓取 / 来访比（crawl-to-refer ratio） | 爬虫抓了多少页，换回多少来访 | 某平台爬虫请求数 ÷ 该平台带来的来访数 | Cloudflare 的定义。2025-07 的全网数据：Anthropic 约 38,066:1，OpenAI 约 1,091:1，Perplexity 约 195:1，Google 约 5.4:1 [S29]（2025 年数据，只看量级） |
| 估算曝光（estimated impressions） | 按提示词背后的搜索量加权的「可能被看到的次数」 | 工具用搜索量估算提示词的真实热度再加权 | Ahrefs Brand Radar 提供 [S50]。属于厂商估算，没法自己验证 |

**有一个前提最容易被忽略：品牌名要归一化。** SparkToro 的研究里，「Victorinox Pro」和「Victorinox Fibrox Pro」要人工合并成一个品牌 [S2]；GeoLook 的文档也提醒，别名漏填会低估提及率 [S60]。追踪前先列全你的产品名、英文名、中文名、域名、常见拼错写法。

### 2.2 为什么难测

#### 2.2.1 同一个问题，每次答案都不一样

**SparkToro × Gumshoe（2026-01-28 发表，数据采集于 2025-11 到 12 月）** [S1]：

- 方法：600 名志愿者，12 个提示词（B2C 和 B2B），平台为 ChatGPT、Claude、Google AI（有 AI Overview 时用 AI Overview，没有时用 AI Mode），共 2,961 条回答，每个提示词在每个工具上跑约 60 到 100 次，默认设置。
- 两次回答给出同一份品牌名单的概率不到 1/100（Claude 略高一点）；同一顺序约 1/1,000 [S1]。Office Hours 里 Fishkin 的说法是：Google AI Mode 要问 124 次才可能出现两次相同名单，要相同顺序得问约 1,429 次 [S2]。
- 但「出现频率」是稳的：City of Hope 在 ChatGPT 的 71 次回答里出现 69 次（97%），却只有 25 次排第一；耳机类前几名品牌在 994 条回答里出现率 55% 到 77% [S1]。三家平台前三名品牌的平均可见度：ChatGPT 64%、Claude 73%、Google AI 68%，标准差都接近 20% [S2]。
- 一致性更多取决于行业而不是模型：云计算这类「选项少」的类目（AWS、Google Cloud 几乎每次都在）一致性高，科幻小说这类「选项多」的类目几乎没有一致性 [S2]。
- 真实用户的问法几乎不重样：142 位参与者描述同一个买耳机需求，提示词两两语义相似度平均只有 0.081。但 Gumshoe 把这 142 个不同提示词跑了 994 次，得到的品牌可见度分布和「单个提示词跑 100 次」几乎一样 [S2]。这说明只要意图对，合成提示词也能测出接近真实的可见度。
- 利益相关：Gumshoe 是卖 AI 追踪工具的公司，Fishkin 公开说明了这一点，并说他的初始假设是「AI 追踪毫无意义」，结果被数据推翻了一半 [S1][S2]。

**「Don't Measure Once」（圣加仑大学，arXiv 2604.07585，2026）** [S3]：

- 方法：2026-01-24 到 03-20 每天采集 ChatGPT、Gemini、Google AI Mode、Perplexity 在四个瑞士德语行业的结果，另外同一天内重复跑，区分「随机波动」和「随时间变化」。
- 相邻两天被引来源的 Jaccard 重合度只有 0.34 到 0.42，约 65% 的来源每天在换；品牌重合度高一些，0.45 到 0.59 [S3]。
- 同一天内重复跑，来源重合也只有 0.32 到 0.43，说明不稳定性大部分来自单日内的随机性，不是「算法今天变了」[S3]。
- 收敛门槛：每个提示词每天跑 7 次，单个品牌的检出率标准误降到 0.10 以下；按天累积，10 天标准误低于 0.10，24 天低于 0.05。作者建议用 2 到 4 周的滚动窗口 [S3]。

**Sielinski（arXiv 2603.08924，2026-03 首发，2026-08 修订到 v3）** [S4]：在 Perplexity、OpenAI SearchGPT、Gemini 上按天和按 10 分钟间隔重复采样，发现引用分布呈幂律、重复采样间变化很大；用 bootstrap 置信区间一看，很多「A 域名比 B 域名可见度高」的差异其实落在测量噪声里。作者结论：单次运行的可见度指标「给出了一种误导性的精确」，应当带置信区间报告 [S4]。

两篇都是预印本，没有同行评审，所以评为 B。

#### 2.2.2 引用来源随时间漂移

| 研究 | 样本 | 结果 | 备注 |
|---|---|---|---|
| Profound（2025-07-17） | 每个平台约 8 万个提示词，比较 6 月和 7 月 | 一个月后新出现的域名占比：AI Overviews 59.3%、ChatGPT 54.1%、Copilot 53.4%、Perplexity 40.5% [S8] | 2025 年数据；只统计新进域名，不统计掉出的域名 |
| SISTRIX（2026-05-01） | 82,619 个提示词、6 个国家、17 周、154 万个快照 | 每周新进域名比例：ChatGPT 74%、AI Mode 56%、AI Overviews 5%。AI Overviews 有 53% 的提示词 17 周里来源完全没变 [S7] | URL 级比域名级更不稳（AI Mode 85% 对 74%）[S7] |
| Ahrefs（2026-10-29） | 约 37,500 个被引网站，五个平台每天问同样的问题，连续 20 天 | 第一天的引用，次日消失的比例：AI Overviews 50%、AI Mode 58%、ChatGPT 59%、Gemini 81%、Copilot 83%；约 75% 掉出的引用会在 20 天内回来 [S9] | 品牌名比被引网站持久 [S9] |
| BrightEdge | 未知 | 搜索摘要显示「96.8% 的被引域名周环比零变化」[S12] | 本稿没能打开原文，方法不明，和其他研究冲突 |
| Ahrefs AI Overviews vs AI Mode（2025） | 约 73 万对回答 | 两者结论语义相似度约 86%，但引用重合只有 13.7% [S11] | 本稿只见到搜索摘要 |

这些数字差异很大，原因是口径不同：域名级还是 URL 级、按周还是按月、新进还是留存、是否排除了没有引用的回答。能确定的结论只有一条：**单次观察代表不了任何东西，只有长期的出现频率有意义** [S7][S8][S9]。

#### 2.2.3 个性化、地区、模型版本、产品形态

- **地区**：SISTRIX 发现 ChatGPT 每周换血率在法国是 42%，在德国是 74% [S7]。所以追踪时要固定国家。OpenAI、Anthropic 的 web search 工具都支持 `user_location`（国家、城市、时区）[S34][S36]。
- **账号和登录状态**：OneGlanse 用你自己的账号登录网页去跑，文档直接写明「答案会因账号、地区、提示词和时间而变」[S57]。GEO 医生提醒，API 回答「不登录、多数不联网」，和 App 里可能不一样 [S59]。
- **模型版本**：2026-10 的 GPT-6 上线同时打乱了 ChatGPT 的链接打开方式和 UTM 参数 [S19]。模型一换，你的指标可能出现断层，这和你做的优化无关。追踪时把模型名存下来。
- **API 和 App 的差别**（Surfer，2026-08-04 采集，1,000 个提示词、13,779 条回答）[S10]：
  - 品牌重合：15.5% 到 23.8%，名字归一化后 21.3% 到 31.6%。
  - 每条回答提到的品牌数：API 普遍更多，ChatGPT 13.8 对 7.9。
  - 每条回答引用的来源数：ChatGPT App 12.1 个、API 3.1 个；Perplexity 反过来，API 19.5 个、App 10.27 个。
  - 触发联网搜索的比例：ChatGPT App 88%、API 83%。
  - Gemini、AI Mode 的 API 返回的是跳转 token 而不是真实 URL，没法做页面级比较。
  - Surfer 的局限：每个提示词各只采一次，部分差异可能只是随机性；API 模型只是「最接近的可买到的版本」。

#### 2.2.4 结论：要跑多少次

| 你要回答的问题 | 建议 | 依据 |
|---|---|---|
| 「我在 ChatGPT 的这一个提示词下出现率大概多少」 | 单个提示词 60 到 100 次 | SparkToro 建议「通常至少 60 到 100 次」[S1]；Evertune 认为 100 次之后收益递减 [S5] |
| 「我整体在 AI 里的可见度趋势」 | 30 到 100 个提示词，每个每天 1 次或每周 3 次，用 2 到 4 周滚动窗口 | Meikai：组合层面每天 1 次已够 [S6]；圣加仑：滚动 2 到 4 周 [S3] |
| 「某次改动有没有效果」 | 改前改后各 3 到 4 周，配对照组，按第 2.6 节算样本量 | 本稿推导，见第 2.6 节 |
| 「某个引用是不是真的丢了」 | 看最近 7 天里几天出现；连续 2 到 3 周都没有才算丢 | Ahrefs [S9] |

预算有限时，**多加提示词比多跑同一个提示词更值** [S6]。Copilot 的引用份额特别不稳，至少每天跑 3 次 [S6]。

### 2.3 网站分析：把 AI 来访单独看出来

#### 2.3.1 AI 产品会留下什么痕迹

| 来源 | 常见痕迹 | 出处 |
|---|---|---|
| ChatGPT | `utm_source=chatgpt.com`（网页版引用链接通常带，2025-06 起扩到「More」区域的链接）；referrer 很少带，约 12% | [S19] |
| Perplexity | referrer 为 `perplexity.ai` 或 `www.perplexity.ai`，GA4 原生渠道不认，落 Referral | [S17][S18] |
| Gemini | `gemini.google.com`，GA4 原生 AI Assistant 渠道已覆盖 | [S18] |
| Copilot | `copilot.microsoft.com`；Edge 侧边栏可能是 `edgeservices.bing.com`（只见于搜索摘要，未在官方文档核实） | [S18] |
| Claude | `claude.ai`；GA4 原生渠道不覆盖，SEJ 称 Claude 在 2026-06 前从 Google 的文档列表里被移除 | [S17][S18] |
| DeepSeek、Grok | GA4 原生渠道已覆盖 | [S18] |
| Google AI Overviews、AI Mode | 算 Organic Search（google / organic），不进 AI Assistant 渠道 | [S17] |
| 豆包、Kimi、元宝、通义、秘塔等国内产品 | 本稿没找到可靠资料说明它们会带什么 referrer，下文正则里的域名是候选，需要你在自己的数据里核实 | 无 |
| 各家手机 App | 常常不带 referrer，落 Direct，任何规则都救不回来 | [S18] |

#### 2.3.2 GA4：原生渠道 + 自定义渠道组

**原生 AI Assistant 渠道**（2026-05-13 上线）：Google 帮助文档里的规则是「medium 完全等于 `ai-assistant`」，而当 referrer 匹配 Google 维护的 AI 助手列表时，GA4 会自动把 medium 设成 `ai-assistant`。在渠道定义顺序里，它排在 Organic Search 之后、Referral 之前 [S14][S16]。完整的 AI 助手列表 Google 没有公开 [S16]。

**为什么还要自定义渠道组**：原生渠道漏掉 Perplexity、Claude、Meta AI、You.com、Poe [S18]；同一个 `chatgpt.com` 来源，在 GA4 没打上标时会落 Referral，medium 为 `(not set)` 时落 Unassigned [S17]。

**操作步骤**（路径来自 Google 帮助文档 [S15]）：

1. 需要属性级 Editor 及以上权限。进入 **管理（Admin）→ 数据显示（Data display）→ 渠道组（Channel groups）**。
2. 点 **创建新渠道组（Create new channel group）**，它会复制默认渠道组。命名为 `Default + AI`。
3. 点 **添加新渠道（Add new channel）**，命名为 `AI`。条件选 **来源（Source）**，匹配方式选正则（匹配正则表达式），填入下面的正则。
4. 点 **重新排序（Reorder）**，把 `AI` 拖到 **Organic Search 和 Referral 之上**（GA4 按顺序取第一个匹配的渠道 [S15]）。是否放在原生 AI Assistant 之上无所谓，放上面可以把所有 AI 流量合在一个渠道里。
5. **保存渠道组（Save group）**。
6. 到 **报告 → 流量获取 → 流量获取概览 / 会话获取**，把主维度换成你的自定义渠道组。

限制：标准属性最多 2 个自定义渠道组，每组最多 50 个渠道；**自定义渠道组对历史数据也生效** [S15]，建好就能回看过去几个月。

**正则**（本稿整理，前后用 `^` 和 `$` 锚定，在「完全匹配」和「部分匹配」两种模式下效果一样；国内域名未经核实）：

```text
^(.*\.)?(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|edgeservices\.bing\.com|chat\.deepseek\.com|grok\.com|meta\.ai|you\.com|poe\.com|doubao\.com|kimi\.com|kimi\.moonshot\.cn|yuanbao\.tencent\.com|tongyi\.aliyun\.com|metaso\.cn)$
```

注意：

- 不要用 `gpt`、`google`、`openai` 这种裸词，会误伤 [S17]；Terminus 的正则也刻意排除了 `openai.com`、`google.com` [S18]。
- 每季度检查一次「会话来源」报告，看有没有新的 AI 来源出现 [S17]。
- 验证：在 GA4 DebugView 里打开自己的测试设备，从各个 AI 产品里点真实的引用链接，看 `session_start` 的来源值 [S18]。

**结果怎么读**：AI 渠道的数字只是下限。SE Ranking 对 101,574 个装了 GA 的网站统计：2026 年（1 到 4 月）AI 来访只占总流量的 0.32%，其中 ChatGPT 占 74.78%、Gemini 11.56%、Perplexity 7.23%、Copilot 3.51%、Claude 2.62% [S43]。AI 来访的平均会话时长约 9 分 19 秒，自然搜索 5 分 33 秒，但中位数只差 2 分 24 秒对 1 分 53 秒（2025 年 1 到 4 月数据）[S43]。SparkToro 用 Datos 桌面端点击流数据估算，所有 AI 工具合计只占网站访问的 2.9%，搜索引擎占 34% [S2]。即便是 Asana 这样的大站，Ahrefs 估算 AI 来访也只占其总流量约 0.5% [S44]。所以对多数独立开发者，AI 来访的绝对量会很小，看趋势和转化比看总量有用。

#### 2.3.3 Plausible、Umami、Cloudflare Web Analytics

- **Plausible**：官方说会自动把 ChatGPT、Claude、Perplexity、Gemini、Copilot 等已知 AI 助手的来访归入一个「AI Assistants」渠道，有 referrer 或 UTM 标签时就能归因，并且会过滤已知 AI 爬虫 [S21]。页面没写日期，第三方 LLM Pulse 曾说 Plausible 不分组，可能是旧版本情况。用 Plausible 的话先在后台看一眼是否已有这个渠道。
- **Umami**：官方文档里的 Attribution 功能显示某个页面或事件之前的 referrer、广告和 UTM 数据，支持首次点击和末次点击两种归因模型 [S22]。本稿没找到 Umami 有 AI 渠道分组的说明。做法：在 Referrers 和 UTM 报告里按上面的域名列表筛选，或用 Umami 的 API 拉数据自己分组。
- **Cloudflare Web Analytics**：可按 Referer（看板显示 referer host，GraphQL API 还能拿到 referer path）、Path、Country、Device 等维度筛选，有「排除机器人」开关 [S23]。没有渠道分组，文档没说是否保留 UTM 参数。所以 ChatGPT 这种主要靠 `utm_source` 的来源，在 Cloudflare Web Analytics 里可能看不全（推断）。Astro + Cloudflare 的站，建议同时上一个能读 UTM 的分析工具（Plausible、Umami 或 GA4）。

#### 2.3.4 Google Search Console

- 2026-06-03 Google 发布「Search Generative AI performance reports」，2026-08-31 起对全球所有站点开放 [S13]。
- 内容：你的 URL 在 Search 的生成式 AI 功能（如 AI Overviews 和 AI Mode）以及 Discover 里的**曝光数**，可按页面、国家、设备（仅 Search）、日期看，粒度从小时到月 [S13]。
- **不能**：区分 AI Overviews 和 AI Mode；看点击；看查询词。Google 说「会逐步增加更多指标」[S13]。
- 这些曝光同时也计入主「效果」报告，两边不能相加（多家二手报道指出，Google 原文说生成式 AI 数据也保留在总体效果报告里 [S13]）。AI Mode 的点击混在普通搜索总数里 [S16]。
- 实际用法：看哪些页面在 AI 功能里有曝光、曝光趋势是否随你的改动变化。点击只能在主报告里和整体数据一起看。

#### 2.3.5 Bing Webmaster Tools 的 AI Performance

- 2026-02-10 以公开预览形式上线，免费，站点验证后即可用 [S24][S26]。
- 覆盖：Microsoft Copilot、Bing 的 AI 摘要、部分合作方集成 [S24]。不覆盖 ChatGPT、Perplexity、Google [S26]。
- 五项指标：总引用数、平均被引页面数（每天被引的不同 URL 数）、grounding 查询（AI 检索时用的内部查询短语，是抽样）、页面级引用、随时间的趋势 [S24]。
- 2026-06-16 新增四个预览报告：Intents（按意图分类 grounding 查询）、Topics（主题聚类）、Citation Share（某个 grounding 查询下你占所有被引来源的比例）、Compare（两个时间段对比，适合看改动前后）[S25]。
- 缺点：没有点击和流量数据、没有竞品数据、历史较短 [S26]。
- 对开发者的价值：这是目前唯一由平台官方给出的「哪些页面被 AI 引用了、AI 用什么词找到你」的数据。改完一个页面后，用 Compare 看前后 30 天的引用变化。

### 2.4 服务器 / CDN 日志：看 AI 爬虫

#### 2.4.1 Cloudflare AI Crawl Control

- 原名 AI Audit，**所有套餐可用**，零配置 [S27]。
- 路径：Cloudflare 后台 → 选账号和域名 → **AI Crawl Control** [S28]。
- Overview：总请求量和变化、最常见状态码、最热路径、各运营方（OpenAI、Microsoft、Google、ByteDance、Anthropic、Meta）的爬虫分组、托管 robots.txt 状态 [S28]。
- Crawlers：每个爬虫的请求数、数据传输量，可直接设置允许或屏蔽 [S28]。
- Metrics：请求随时间变化，可按爬虫、类别、运营方、主机分组；状态码分布；最热路径表；**Top referrers 和 Referrals over time 只对付费套餐开放** [S28]。
- 可导出 CSV，也能用 GraphQL Analytics API 拉数据 [S28]。
- 另有「Track robots.txt」看哪些爬虫遵守你的 robots.txt [S27]。
- 全网视角：Cloudflare Radar 的 AI Insights 页面（radar.cloudflare.com/ai-insights）有各平台的抓取 / 来访比 [S29]。

#### 2.4.2 真假爬虫怎么分

UA 可以随便伪造，要用 IP 校验 [S30][S33]。各家公开的 IP 段（本稿 2026-11-14 实际下载过，格式都是 `{"creationTime":…, "prefixes":[{"ipv4Prefix":…}|{"ipv6Prefix":…}]}`）[S68]：

| 运营方 | UA | 用途 | IP 段 |
|---|---|---|---|
| OpenAI | `OAI-SearchBot` | ChatGPT 搜索结果；屏蔽后不会出现在 ChatGPT 搜索答案里，robots.txt 改动约 24 小时生效 | https://openai.com/searchbot.json [S30] |
| OpenAI | `GPTBot` | 训练基础模型 | https://openai.com/gptbot.json [S30] |
| OpenAI | `ChatGPT-User` | 用户在 ChatGPT 里触发的访问，robots.txt 可能不适用 | https://openai.com/chatgpt-user.json [S30] |
| OpenAI | `OAI-AdsBot` | 检查 ChatGPT 广告落地页 | https://openai.com/adsbot.json [S30] |
| Anthropic | `ClaudeBot`、`Claude-SearchBot`、`Claude-User` | 训练、搜索索引、用户触发访问；都遵守 robots.txt，支持 Crawl-delay | https://claude.com/crawling/bots.json [S31] |
| Perplexity | `PerplexityBot` | Perplexity 搜索结果，遵守 robots.txt | https://www.perplexity.ai/perplexitybot.json [S32] |
| Perplexity | `Perplexity-User` | 用户提问时实时访问，一般不遵守 robots.txt | https://www.perplexity.ai/perplexity-user.json [S32] |
| Google | `Googlebot` 等 | 搜索（也是 AI Overviews / AI Mode 的来源） | https://developers.google.com/static/crawling/ipranges/common-crawlers.json 等五个文件；也可用反向 DNS + 正向 DNS 校验 [S33] |

注意：OpenAI 社区里有人报告过 GPTBot 请求来自 JSON 里没有的 IP，所以列表可能滞后（只见于搜索摘要）。UA 版本号会变（如 `GPTBot/1.4`、`OAI-SearchBot/1.4`），匹配时只匹配名字，不匹配版本 [S30]。

日志脚本见第 3.4 节。

### 2.5 自建可见度追踪器

#### 2.5.1 各家「带联网搜索」的 API

| 引擎 | 功能名 | 怎么开 | 引用在哪里 | 价格（2026-11 官方页） |
|---|---|---|---|---|
| OpenAI | Responses API 的 `web_search` 工具（旧版 `web_search_preview` 仍可用） | `tools=[{"type":"web_search"}]`，可加 `user_location`、`filters.allowed_domains`（最多 100 个） | `message` 里 `output_text` 的 `annotations`，类型 `url_citation`；全部查阅过的来源用 `include=["web_search_call.action.sources"]` 拿 [S34] | 每 1,000 次调用 $10，搜索内容 token 按模型单价计 [S35]。推荐模型 `gpt-6-astra`（$10 / $50 每百万 token）[S34][S35]。`gpt-4o-search-preview` 已于 2026-07-23 下线 [S34] |
| Anthropic | Messages API 的 web search 工具，版本 `web_search_20250305`（基础）、`web_search_20260209`（动态过滤）、`web_search_20260318` | `tools=[{"type":"web_search_20250305","name":"web_search","max_uses":3}]`，可加 `allowed_domains` / `blocked_domains`（二选一）、`user_location` | `text` 块的 `citations`（`web_search_result_location`，含 url、title、最多 150 字的 cited_text）；`web_search_tool_result` 里是全部搜索结果 [S36] | 每 1,000 次搜索 $10 + token [S36]。Haiku 5.5 为 $0.10 / $0.50 每百万 token（10 万 token 以内）[S37]。Batch API 可用，单价相同 [S36] |
| Google Gemini | Grounding with Google Search，工具名 `google_search`（旧模型用 `google_search_retrieval`） | 新的 Interactions API：`POST /v1beta/interactions`，`tools:[{"type":"google_search"}]` | `model_output` 步骤里 text 的 `annotations`（`url_citation`，含 start/end index）；`google_search_call` 里是执行的查询 [S38] | Gemini 3 及以后：每月前 5,000 次搜索免费（所有 Gemini 3+ 模型共享），之后每 1,000 次 $14，按模型实际执行的搜索次数计；付费层默认每项目每天 1,500 次 [S38]。返回的 `search_suggestions` 有展示要求，见服务条款 [S38] |
| Perplexity | Agent API（`POST /v1/agent`）的 `web_search` 工具，或直接用 `effort` 预设 | `{"effort":"fast","input":"…"}`，或 `{"model":"…","tools":[{"type":"web_search"}]}` | `output` 里 `type:"search_results"` 的 `results`（id、url、title、snippet、date）[S40] | `web_search` 每 1,000 次 $2.50，`search_type:"fast"` 为 $1；各 effort 预设默认用 fast [S40]。`perplexity/sonar` 模型 $0.25 / $2.50 每百万 token [S41] |
| DeepSeek | 独立的 Search API（`POST /v1/tools/search`）和 Fetch API | 自己搜、再把结果喂给模型 | 结果里有 url、site_name、date [S42] | 每 1,000 次成功请求 $0.75；Search 每账号 100 QPS [S42] |

**重要变化：Perplexity 的 Sonar Chat Completions 已于 2026-09-27 停止支持**，同步和流式请求会被逐步改写成 Agent API 请求，异步 Sonar 请求不再支持；新项目一律用 Agent API [S39]。很多 2025 年的教程还在教 `chat.completions.create(model="sonar")`，已经过时。

DeepSeek 的聊天 API 有没有服务端联网搜索工具，本稿在官方文档里没找到明确说明，第三方说法互相矛盾（见第 7 节）。

#### 2.5.2 API 答案和 App 答案的差别

见 2.2.3 的 Surfer 数据 [S10]。实践上的分工：

- **API 自动跑**：便宜、可重复、能存原始 JSON，适合看趋势和做前后对比。前提是对照组和处理组都用同一套 API 测，系统性偏差会在比较时抵消（推断）。
- **App 人工抽查**：每月一次，在真实的 ChatGPT、Perplexity、豆包等 App 里（最好用未登录或干净账号）问 10 个核心问题，确认 API 看到的趋势在 App 里也成立 [S59]。
- **抓网页界面**：OneGlanse 用 Camoufox + Playwright 登录你的账号跑网页 [S57]，GEO/AEO Tracker 用 Bright Data 的 AI Scraper API [S58]，Elmo 的多引擎追踪也抓真实的消费端 App [S55]。更接近用户所见，但要处理登录、反爬和平台服务条款风险。

代码和代价估算见第 4 节。

### 2.6 实验设计：怎么判断改动有没有用

#### 2.6.1 为什么需要对照组

AI 回答本身每周有 50% 以上的来源在换 [S7][S9]，模型还会突然升级 [S19]。如果你只看「改之前 20%，改之后 30%」，没法区分是你的改动起作用，还是这段时间 AI 整体偏好变了。对照组就是为了扣掉这部分「大盘变化」。

#### 2.6.2 推荐流程

以下是本稿根据 [S3][S7][S9] 的发现和标准统计方法整理的流程，不是哪篇文章的原文：

1. **写下假设和判定标准，再动手**。例：「给产品页加对比表后，30 个『X 类工具推荐』提示词下的 ChatGPT 提及率，处理组比对照组多涨 10 个百分点以上才算有效」。先写下来，避免事后挑对自己有利的数字。
2. **先做一次 A/A 测试**：什么都不改，连续两周用同一套提示词跑两次，看两个窗口的差有多大。这就是你的噪声地板。之后任何小于它的变化都不算数。
3. **分组**：
   - 页面级：把相似的页面（比如 10 篇教程）按主题和基线提及率配对，随机一半改、一半不改。
   - 提示词级：只改了一个产品时，把提示词分成「这次改动应该影响的」（处理组）和「不相关的」（对照组，比如你另一个产品的类目提示词）。
   - 多产品开发者的天然优势：你有很多产品，可以轮流把一个产品当处理组、其他当对照组。
4. **基线期 2 到 4 周**：每个提示词每天 1 次，或每周 3 次以上 [S3][S6]。
5. **做改动，并确认 AI 真的读到了**：看服务器日志或 Cloudflare AI Crawl Control，确认 OAI-SearchBot、Claude-SearchBot、PerplexityBot、bingbot、Googlebot 在改动后重新抓了这些 URL [S28][S30]。没被重新抓取，就谈不上效果。
6. **观察期 3 到 4 周**：Ahrefs 建议引用丢失 2 到 3 周后才采取行动 [S9]；圣加仑论文发现单品牌估计 24 天才把标准误压到 0.05 以下 [S3]。
7. **用双重差分判断**：效果 = （处理组改后 − 处理组改前）−（对照组改后 − 对照组改前）。再看这个差值是否大于第 2 步的噪声地板。
8. **同时看下游**：GA4 的 AI 渠道会话、Bing 的 Compare 报告、Search Console 的生成式 AI 曝光 [S13][S25]。

#### 2.6.3 样本量参考

两组比例比较、95% 置信度、80% 检验力，每组（每个时期）需要的有效回答数（本稿计算 [S68]）：

| 基线提及率 | 想检测到的新提及率 | 每组约需回答数 |
|---|---|---|
| 5% | 15% | 140 |
| 10% | 20% | 199 |
| 20% | 35% | 138 |
| 30% | 40% | 356 |

单组精度：提及率 50% 时，±10 点需约 96 次，±5 点需约 384 次；提及率 20% 时，±10 点需约 61 次，±5 点需约 246 次 [S68]。

注意：同一个提示词的多次回答互相相关，有效样本小于回答总数。所以要靠「多提示词」而不是「同一提示词跑很多遍」来凑样本（推断，与 [S6] 的结论方向一致）。

#### 2.6.4 怎么避免骗自己

- **不要用含品牌名的提示词衡量「被推荐」**。「MyTool 和 OtherTool 哪个好」里 AI 必然提到你。品牌词提示词单独一组，只用来查事实准确度（Ahrefs 也建议把品牌事实、评测、泛发现类问题分开报告 [S9]）。
- **中途不要改提示词、模型、国家设置**。追踪器把模型名存进库里，模型升级时在图上画一条竖线。
- **不要看排名**，只看出现率 [S1]。
- **LLM 打分要校准**：用 LLM 判断「是否推荐」「情感」时，先人工标 50 条，算一致率，低于 80% 就改判定提示词（经验做法，无出处）。
- **看到骤降先查归因**：2026-10 的 ChatGPT UTM 事件里，流量看起来掉了 22% 到 57%，其实用户都还在，只是被算成了 Direct [S19]。
- **截图不是证据**：Fishkin 说，客户发来一张「你没出现在 ChatGPT 里」的截图，「再问一遍你就出现了」[S2]。

### 2.7 商业工具（2026-11 状态）

价格以官方页面为准，第三方转述的价格常常过时或互相矛盾。表中「官方」表示本稿打开过该厂商的官方页面。

| 工具 | 测什么 | 价格 | 适合谁 | 出处 |
|---|---|---|---|---|
| **Otterly.AI** | 每天追踪提示词在各 AI 引擎的提及和引用；Standard 以上有 API、MCP、Looker Studio 连接器、Agent Analytics | Lite 约 $29/月（4 个引擎时 16 个提示词）；Standard 120 个提示词；Premium 403 个；年付省 15%。Claude 每次检查耗 3 个积分 | 预算最紧的独立开发者入门 | 官方帮助页 [S48]；$29 价格见 [S47] |
| **Peec AI** | 每天追踪提及、引用、竞品；可选 ChatGPT、Perplexity、AI Overview、AI Mode、Gemini、Naver、**ERNIE（百度文心）**、Bing AI Mode | Starter $95/月（50 提示词、3 个模型、1 个国家）；Pro $245（150 提示词）；Advanced $495（350 提示词、API）；加模型每个 $30 到 $140/月 | 中小团队；少数支持文心的海外工具 | 官方 [S45] |
| **Profound** | 企业级：最多 10 个引擎（含 DeepSeek、Qwen、Claude）、ChatGPT Shopping、Prompt Volumes、Agent Analytics（接 Cloudflare、Vercel、Netlify 等日志） | 2026-09 中取消了 $99 Starter 和 $399 Growth 品牌自助套餐，现在只有免费试用（50 个提示词，7 天）和企业询价；第三方估计企业版 $1,500 到 $5,000+/月（未证实） | 有预算的公司，不适合独立开发者 | 官方 [S46]；变更见 [S47] |
| **Scrunch** | Core：ChatGPT、Perplexity、AI Overviews、Copilot；企业版 9 个引擎 | Core $250/月（125 个提示词、每月 5 次站点审计）；7 天试用需绑卡 | 中型品牌 | 官方 FAQ [S49]。有搜索摘要称 Sitecore 于 2026-06 收购 Scrunch，本稿未核实 |
| **AthenaHQ**（任务里的「Athena」和「AthenaHQ」是同一家） | 自助版可追踪 11 个模型（含 DeepSeek、Meta AI、Mistral），按积分计费 | 自助 $295/月，每月 3,600 积分；有说法称有免费档，来源冲突 | 中型团队 | [S47][S58]（均非官方） |
| **Semrush AI Visibility / AI SEO Toolkit** | 可见度总览、竞品、提示词研究、品牌认知与叙事驱动因素、提示词追踪 | 第三方说法冲突：$99/月/域名 [S47]，或打包在「SEO + AI Search Starter」$199/月（年付 $165.17）[S58] | 已经在用 Semrush 的人 | 功能见官方 [S53]，价格未在官方页核实 |
| **Ahrefs Brand Radar** | AI Overviews、AI Mode、ChatGPT、Perplexity、Gemini、Copilot（Claude 可做提示词追踪）；提及、引用、AI 声量份额、按搜索量估算的曝光；库里 5.65 亿个提示词 | Custom Prompts 起价 €47/月；AI Visibility Index 起价 €179/月；第三方报 $398/月 [S47]，口径可能不同 | 想看「全网大盘」而不只是自己提示词的人 | 官方 [S50] |
| **Similarweb AI** | 多平台可见度、引用、声量、AI 来访流量、情感、意图分类；有 MCP 和 API | 自家博客对比表写「免费试用后 $99/月」 | 已在用 Similarweb 的人 | 厂商自述 [S26]，未核实 |
| **HubSpot AEO Grader** | 免费一次性体检：用 ChatGPT（GPT-5.4 mini）、Perplexity、Gemini 评分，满分 100：情感 40、存在质量 20、品牌认知 20、声量 10、市场竞争 10 | 免费，无需账号；持续追踪要买 HubSpot AEO，$50/月 | 想先花 5 分钟看个大概的人 | 官方 [S51]。快照不显示用了哪些提示词，不能做趋势 |
| **Writesonic GEO** | 提示词追踪、AI Bot Analytics（爬虫追踪）、广告监测；Growth 以上有情感分析 | 年付：Starter $79/月（50 提示词，ChatGPT、Gemini、AI Overviews）、Basic $199、Growth $399；企业版 8 个平台 | 同时需要写作工具的人 | 官方 [S52] |
| **Goodie** | AI 可见度追踪 | 官方未公开；第三方称入门档 $399/月 | 有预算的品牌 | [S54]（D 级） |
| **Eclincher、Promptwatch** 等 | 各类追踪 | Eclincher Standard $249/月；Promptwatch $95/月 | 不展开 | [S47]（Eclincher 自己写的对比文章，利益相关） |
| **BrightEdge、Conductor** | 企业 SEO 平台的 AI 搜索模块 | 本稿未查实 | 企业 | 见第 7 节 |

**选型建议（独立开发者）**：先用免费的组合（GA4 自定义渠道 + Bing AI Performance + Search Console 生成式 AI 报告 + Cloudflare AI Crawl Control + HubSpot AEO Grader 体检一次），再决定要不要每月花 $29 到 $95 买 Otterly 或 Peec，或者自己跑开源方案。同时管很多产品时，按提示词数计价的工具会迅速变贵，自建追踪器的边际成本低得多（见第 4.3 节）。

### 2.8 开源项目

数据来自 2026-11-14 调用 GitHub API 读取的仓库信息 [S68]。星数会变。

**追踪类**

| 项目 | 星数 / 许可 | 怎么采集 | 特点 |
|---|---|---|---|
| elmohq/elmo [S55] | 600 / MIT，TypeScript | 每天多次跑提示词，多引擎追踪抓真实消费端 App；原始答案存 PostgreSQL | 提及率、声量、情感、位置、引用、query fan-out（引擎实际执行的搜索）、MCP；托管版 $29/月起 |
| limelit-co/open [S56] | 444 / Apache-2.0，Go | 自带 API Key，单个二进制 | ChatGPT、Claude、Perplexity、Gemini、AI Overview、AI Mode；内置 MCP；仍是预发布 |
| oneglanse/oneglanse [S57] | 258 / MIT，TypeScript | 用 Camoufox + Playwright 登录你的账号跑网页 | 明确主张「用网页不用 API」，并引用 Surfer 的研究 |
| danishashko/geo-aeo-tracker [S58] | 328 / MIT，TypeScript | 通过 Bright Data AI Scraper API 抓 4 个引擎 | 数据默认存在浏览器（IndexedDB），可选自己的 Supabase；有 CLI 和 MCP |
| ansvisor/ansvisor、Canonry/canonry、ai-search-guru/getcito… | 各 200 到 400 星，MIT | 未逐一核实 | 都自称开源 AI 可见度追踪 / 执行平台 |
| databluedev/searchmirror | 110 / AGPL-3.0 | 基于 DataBlue SERP API | 排名追踪 + AI 可见度 |

**中文 / 国内模型**

| 项目 | 说明 |
|---|---|
| Fangx-AI/geo-doctor（GEO 医生）[S59] | 607 星，MIT。装进 Claude Code、Codex、Kimi Code、WorkBuddy 等的 Skill。8 步流程：问诊、体检、事实卡、问题集、采样、诊断、写稿发布、复查。采样可以人工去豆包等 App 里问再贴回，也可以用 `geo-probe` 命令走 API 自动问 DeepSeek、千问、Kimi、豆包、ChatGPT，默认每题问 2 次、算推荐率和竞品推荐榜。明确提醒「API 回答不登录、多数不联网，和 App 里可能不一样，重要结论用 App 里的人工采样确认」 |
| aigclink/geolook（GeoLook）[S60] | 816 星，MIT，Python。17 个引擎（10 个走 API，7 个人工，含 Google AI Overviews 和秘塔），国内矩阵含 GLM、豆包、DeepSeek、Kimi、MiniMax、百度 AI；国内和海外分开测；附带 Chrome 扩展辅助人工采样；改动后按 7、14、28 天复查 |
| yaojingang/GEORank、GEOFlow [S61][S62] | GEORank 537 星（Apache-2.0）：网站诊断、行动方案、拓词、JSON-LD 和 llms.txt 生成器，在线演示 georankhub.com。GEOFlow 4,132 星（AGPL-3.0）：GEO 内容工程和多站分发平台 |
| ViryaZheng/recomby-geo | 455 星，MIT。GEO Skill 包和 Agent / 办公 CLI 清单，偏内容协作，不是监测工具 |

**llms.txt 相关**

| 项目 | 说明 |
|---|---|
| AnswerDotAI/llms-txt [S63] | 2,687 星，llms.txt 提案原始仓库 |
| firecrawl/llmstxt-generator [S64] | 540 星，为任意网站生成 llms.txt 和 llms-full.txt；最后提交 2025-06，可能不再维护 |
| thedaviddias/llms-txt-hub [S65] | 927 星，llms.txt 实现目录 |
| Auriti-Labs/geo-optimizer-skill [S67] | 1,325 星，MIT，审计网站能否被 ChatGPT、Perplexity、Gemini、AI Overviews 引用 |
| GEO-optim/GEO [S66] | 350 星，GEO 原始论文（Princeton，KDD 2024）的代码，最后提交 2025-10 |

### 2.9 国内 GEO 监测服务

本稿确认的情况：

- 海外工具里，Peec AI 支持 ERNIE（百度文心）[S45]，Profound 企业版支持 DeepSeek 和 Qwen [S46]，AthenaHQ 支持 DeepSeek [S58]。没有找到支持豆包、元宝、Kimi 的海外商业工具。
- 开源工具里，GEO 医生和 GeoLook 对国内模型支持最完整 [S59][S60]。
- GEO 医生 README 说「找 GEO 服务商要花几千到几万，效果还说不清」[S59]，说明国内存在付费 GEO 服务市场；GEORankHub 提到「第一届 GEO 大会」[S61]。
- 国内具体有哪些商业监测 SaaS、价格多少，本稿因搜索额度用完没能查实，见第 7 节。

---

## 3. 实战清单

### 3.1 第一天就能做完的免费设置（约 1 小时）

1. **GA4 自定义渠道组**：按 2.3.2 的步骤建 `Default + AI`，正则贴进去，把 `AI` 放到 Organic Search 和 Referral 之上，保存。
   - 检查：报告里切换到新渠道组，看过去 90 天 `AI` 渠道有没有数据；打开「会话来源」看有没有漏掉的 AI 域名。
2. **把 AI 渠道的转化单独看**：在 GA4 探索（Explore）里建一张表，行是你的自定义渠道组，列是会话、关键事件（安装、注册、付款）、关键事件率。
3. **Bing Webmaster Tools**：验证站点（可从 Google Search Console 一键导入），打开 **AI Performance**，记下当前的总引用数和被引页面清单。
4. **Google Search Console**：打开效果报告下的生成式 AI 报告，导出各页面在 AI 功能里的曝光。
5. **Cloudflare**：后台 → 域名 → **AI Crawl Control**，看 Crawlers 标签，确认 OAI-SearchBot、Claude-SearchBot、PerplexityBot 没有被屏蔽，看 Metrics 里的状态码分布有没有大量 4xx/5xx。
6. **HubSpot AEO Grader** 跑一次，当作一个粗略起点，不要当成基准线。
7. **列出品牌别名表**：产品英文名、中文名、域名、常见拼错，存成一个文本文件，以后所有统计都用它。

### 3.2 建一个提示词集（约 2 小时）

1. 每个产品 20 到 30 个提示词，按意图分组：
   - 发现类：「有没有能 X 的 Chrome 插件」「best tool for X」
   - 对比类：「A 和 B 哪个好」（不含你的品牌名）
   - 场景类：「我是独立开发者，想 Y，用什么」
   - 品牌事实类（单独一组，只查准确度）：「MyTool 收费吗」「MyTool 支持 Firefox 吗」
2. 用真实用户的说法：Chrome Web Store 评论、GitHub issue、Reddit、知乎、你的客服邮件。SparkToro 的研究说明真实用户的问法差异极大，但意图一致时测出来的可见度相近 [S2]。
3. 中英文分开建，国家分开测。
4. 存成 `prompts.csv`，列为 `id,prompt,intent`。之后不要随便改。

### 3.3 每周一次的手工抽查（约 20 分钟）

在 ChatGPT、Perplexity、Gemini、豆包、DeepSeek 的网页或 App 里，用同一组 10 个核心问题各问一遍，记录：有没有提到你、有没有链接到你、说的对不对。存进表格。GEO 医生的经验是只测一个平台一轮约 15 到 20 分钟 [S59]。

### 3.4 分析服务器日志里的 AI 爬虫和 AI 来访

适用于自己有 Nginx / Apache 日志的站点（会员网站、VPS）。Cloudflare 静态站可以直接用 AI Crawl Control，或在付费套餐用 Logpush 导出日志后再跑。

脚本只用 Python 标准库，日志格式为 Nginx / Apache 默认的 combined 格式。本稿用假日志 + 真实 IP 段测试通过 [S68]。

```python
#!/usr/bin/env python3
"""Count AI crawler hits and AI referral visits in a combined-format access log.

Usage: python3 ai_bots_log.py access.log [more.log ...]   (reads .gz too)
Verifies crawler IPs against the operators' published JSON ranges; a UA match from an IP outside them is reported as spoofed.
"""
import gzip, ipaddress, json, re, sys, urllib.request
from collections import Counter

BOTS = {  # name: (user-agent substring, published IP list or None)
    "GPTBot": ("GPTBot", "https://openai.com/gptbot.json"),
    "OAI-SearchBot": ("OAI-SearchBot", "https://openai.com/searchbot.json"),
    "ChatGPT-User": ("ChatGPT-User", "https://openai.com/chatgpt-user.json"),
    "ClaudeBot": ("ClaudeBot", "https://claude.com/crawling/bots.json"),
    "Claude-SearchBot": ("Claude-SearchBot", "https://claude.com/crawling/bots.json"),
    "Claude-User": ("Claude-User", "https://claude.com/crawling/bots.json"),
    "PerplexityBot": ("PerplexityBot", "https://www.perplexity.ai/perplexitybot.json"),
    "Perplexity-User": ("Perplexity-User", "https://www.perplexity.ai/perplexity-user.json"),
    "Googlebot": ("Googlebot", "https://developers.google.com/static/crawling/ipranges/common-crawlers.json"),
    "bingbot": ("bingbot", None),
    "Bytespider": ("Bytespider", None),
    "Applebot": ("Applebot", None),
    "Meta-ExternalAgent": ("meta-externalagent", None),
}
AI_REFERRERS = re.compile(r"(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|"
                          r"copilot\.microsoft\.com|edgeservices\.bing\.com|chat\.deepseek\.com|doubao\.com|"
                          r"kimi\.com|kimi\.moonshot\.cn|yuanbao\.tencent\.com|tongyi\.aliyun\.com|metaso\.cn|grok\.com|meta\.ai)", re.I)
LINE = re.compile(r'^(\S+) \S+ \S+ \[[^\]]+\] "(?:\S+) (\S+)[^"]*" (\d{3}) \S+ "([^"]*)" "([^"]*)"')


def load_ranges(url, cache={}):
    if url not in cache:
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"user-agent": "log-audit"}), timeout=30))
            cache[url] = [ipaddress.ip_network(p.get("ipv4Prefix") or p.get("ipv6Prefix")) for p in d["prefixes"]]
        except Exception as e:
            print(f"warn: could not load {url}: {e}", file=sys.stderr)
            cache[url] = None
    return cache[url]


def verdict(ip, url):
    if not url:
        return "unverified"
    nets = load_ranges(url)
    if nets is None:
        return "unverified"
    addr = ipaddress.ip_address(ip)
    return "verified" if any(addr in n for n in nets) else "spoofed?"


def main(paths):
    hits, paths_by_bot, status, refs = Counter(), Counter(), Counter(), Counter()
    for path in paths:
        op = gzip.open if path.endswith(".gz") else open
        with op(path, "rt", errors="replace") as f:
            for line in f:
                m = LINE.match(line)
                if not m:
                    continue
                ip, req, code, referer, ua = m.groups()
                bot = next((n for n, (sub, _) in BOTS.items() if sub.lower() in ua.lower()), None)
                if bot:
                    v = verdict(ip, BOTS[bot][1])
                    hits[(bot, v)] += 1
                    status[(bot, code[0] + "xx")] += 1
                    if v != "spoofed?":
                        paths_by_bot[(bot, req.split("?")[0])] += 1
                    continue
                src = AI_REFERRERS.search(referer)
                utm = re.search(r"[?&]utm_source=([^&\s]+)", req)
                if not src and utm:
                    src = AI_REFERRERS.search(utm.group(1))
                if src:
                    refs[(src.group(1).lower(), req.split("?")[0])] += 1
    print("== AI crawler hits (bot, verification)")
    for (b, v), n in hits.most_common():
        print(f"{n:8d}  {b:18s} {v}")
    print("\n== status classes per bot")
    for (b, c), n in sorted(status.items()):
        print(f"{n:8d}  {b:18s} {c}")
    print("\n== top crawled paths (verified or unverifiable bots)")
    for (b, p), n in paths_by_bot.most_common(20):
        print(f"{n:8d}  {b:18s} {p}")
    print("\n== AI referral visits (source, landing path)")
    for (s, p), n in refs.most_common(20):
        print(f"{n:8d}  {s:24s} {p}")


if __name__ == "__main__":
    main(sys.argv[1:])
```

运行：

```bash
python3 ai_bots_log.py /var/log/nginx/access.log /var/log/nginx/access.log.*.gz
```

测试时的输出（7 行假日志）[S68]：

```text
== AI crawler hits (bot, verification)
       1  GPTBot             verified
       1  GPTBot             spoofed?
       1  ClaudeBot          verified
...
== AI referral visits (source, landing path)
       1  chatgpt.com              /blog/post
       1  perplexity.ai            /tools
       1  doubao.com               /tools
```

怎么读：

- `spoofed?` 多：有人冒充 AI 爬虫，可以在 WAF 里按 IP 段放行真爬虫、屏蔽假的。
- 搜索类爬虫（OAI-SearchBot、Claude-SearchBot、PerplexityBot）大量 4xx/5xx：AI 拿不到你的页面，先修这个。
- 「top crawled paths」里没有你最想被推荐的页面：考虑加内链、更新 sitemap、推 IndexNow。
- bingbot、Bytespider、Applebot、Meta 的 IP 列表脚本没内置，显示为 `unverified`。bingbot 可以用反向 DNS 校验（与 Google 同理 [S33]，Bing 的具体做法本稿未核实）。

### 3.5 自建追踪器的部署

见第 4 节代码。部署建议：

- 放在一台已有的小 VPS 或你的电脑上，用 cron 每周跑一次（或每天跑 1 次、`--reps 1`）：

  ```bash
  # 每周一 09:00 跑一轮，3 次重复
  0 9 * * 1 cd ~/geo && OPENAI_API_KEY=… ANTHROPIC_API_KEY=… PERPLEXITY_API_KEY=… \
    python3 geo_track.py run prompts.csv --engines openai,anthropic,perplexity --reps 3 \
    --brand "MyTool" --alias "mytool.dev" --domain mytool.dev --competitor "OtherTool" >> run.log 2>&1
  ```

- 也可以用 GitHub Actions 的 `schedule` 定时跑，把 `geo.sqlite` 当产物提交回仓库（GEO 医生就提供了每周一自动采样并开 PR 的工作流 [S59]）。
- 生成报表：`python3 geo_track.py report --brand "MyTool" --alias "mytool.dev" --domain mytool.dev --competitor "OtherTool" --days 28`

### 3.6 每月复盘

1. 跑 `report --days 28`，记下每个引擎的提及率和置信区间。
2. 和上个月比：差值小于两个月置信区间的宽度，就当没变。
3. 看 GA4 的 AI 渠道会话和转化、Bing 的引用数、Search Console 的生成式 AI 曝光。
4. 看爬虫日志：本月新改的页面有没有被搜索类爬虫重新抓取。
5. 在真实 App 里人工抽查 10 题，确认 API 趋势成立。

---

## 4. 自建追踪器：代码和代价

### 4.1 数据结构

先定数据形状：

- `answers`：一次运行的一条回答。字段为 `run_at, engine, model, prompt_id, intent, rep, prompt, answer, raw, error`。`raw` 存完整 JSON，以后换算法可以重算；`model` 存下来，模型升级时能对得上。
- `citations`：`answer_id, url, domain`，一条回答可以有多条。
- 引擎用一张注册表（`ENGINES` 字典）描述：每个引擎有默认模型、调用函数、解析函数。加一个引擎就是加一行，不用改主流程。

提及判断在报表阶段做，不在入库时做。这样改别名表或加竞品后，旧数据可以直接重算。

### 4.2 代码（Python 标准库，无第三方依赖）

请求格式按各家 2026-11 的官方文档编写 [S34][S36][S38][S40]，解析逻辑用伪造的官方格式响应测试通过 [S68]。模型名用环境变量覆盖；默认值是各家文档示例里出现的模型，换便宜模型前先确认它支持联网搜索工具。

```python
#!/usr/bin/env python3
"""Run a fixed prompt set against AI APIs with web search, store answers in SQLite, report mention and citation rates.

Usage:
  python3 geo_track.py run prompts.csv --brand "MyTool" --alias "mytool.dev" --domain mytool.dev \
      --competitor "OtherTool" --engines openai,anthropic,gemini,perplexity --reps 3
  python3 geo_track.py report --brand "MyTool" --days 28
prompts.csv columns: id,prompt,intent
"""
import argparse, csv, json, os, re, sqlite3, sys, time, urllib.request
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

DB = os.environ.get("GEO_DB", "geo.sqlite")


def post(url, headers, body, timeout=180):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"content-type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def parse_openai(d):
    text, urls = [], []
    for item in d.get("output", []):
        if item.get("type") == "message":
            for c in item.get("content", []):
                if c.get("type") == "output_text":
                    text.append(c.get("text", ""))
                    urls += [a["url"] for a in c.get("annotations", []) if a.get("type") == "url_citation"]
    return "\n".join(text), urls


def parse_anthropic(d):
    text, urls = [], []
    for c in d.get("content", []):
        if c.get("type") == "text":
            text.append(c.get("text", ""))
            urls += [x["url"] for x in (c.get("citations") or []) if x.get("url")]
    return "".join(text), urls


def parse_gemini(d):
    text, urls = [], []
    for step in d.get("steps", []):
        if step.get("type") == "model_output":
            for c in step.get("content", []):
                if c.get("type") == "text":
                    text.append(c.get("text", ""))
                    urls += [a["url"] for a in (c.get("annotations") or []) if a.get("type") == "url_citation"]
    return "\n".join(text), urls


def parse_perplexity(d):
    text, urls = [], []
    for item in d.get("output", []):
        if item.get("type") == "search_results":
            urls += [r["url"] for r in item.get("results", []) if r.get("url")]
        if item.get("type") == "message":
            text += [c.get("text", "") for c in item.get("content", []) if c.get("type") == "output_text"]
    return "\n".join(text), urls


ENGINES = {
    "openai": {
        "model": os.environ.get("OPENAI_MODEL", "gpt-6-astra"),
        "call": lambda p, m, loc: post("https://api.openai.com/v1/responses",
            {"authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
            {"model": m, "input": p, "tools": [{"type": "web_search", "user_location": {"type": "approximate", "country": loc}}]}),
        "parse": parse_openai,
    },
    "anthropic": {
        "model": os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5"),
        "call": lambda p, m, loc: post("https://api.anthropic.com/v1/messages",
            {"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2026-10-21"},
            {"model": m, "max_tokens": 2048, "messages": [{"role": "user", "content": p}],
             "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 3,
                        "user_location": {"type": "approximate", "country": loc}}]}),
        "parse": parse_anthropic,
    },
    "gemini": {
        "model": os.environ.get("GEMINI_MODEL", "gemini-4-hydrogen"),
        "call": lambda p, m, loc: post("https://generativelanguage.googleapis.com/v1beta/interactions",
            {"x-goog-api-key": os.environ["GEMINI_API_KEY"], "Api-Revision": "2026-05-20"},
            {"model": m, "input": p, "tools": [{"type": "google_search"}]}),
        "parse": parse_gemini,
    },
    "perplexity": {
        "model": os.environ.get("PPLX_EFFORT", "fast"),
        "call": lambda p, m, loc: post("https://api.perplexity.ai/v1/agent",
            {"authorization": f"Bearer {os.environ['PERPLEXITY_API_KEY']}"},
            {"effort": m, "input": p}),
        "parse": parse_perplexity,
    },
}

SCHEMA = """
create table if not exists answers(
  id integer primary key, run_at text, engine text, model text, prompt_id text, intent text,
  rep integer, prompt text, answer text, raw text, error text);
create table if not exists citations(answer_id integer, url text, domain text);
"""


def domain_of(url):
    host = (urlparse(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def mention_pos(text, names):
    """Character offset of the first mention of any name, or None. Word-boundary, case-insensitive."""
    hits = [m.start() for n in names for m in re.finditer(r"(?<!\w)" + re.escape(n) + r"(?!\w)", text, re.I)]
    return min(hits) if hits else None


def run(a):
    db = sqlite3.connect(DB); db.executescript(SCHEMA)
    prompts = list(csv.DictReader(open(a.prompts, newline="", encoding="utf-8")))
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for eng in a.engines.split(","):
        spec = ENGINES[eng]
        for p in prompts:
            for rep in range(a.reps):
                raw, err, text, urls = None, None, "", []
                try:
                    d = spec["call"](p["prompt"], spec["model"], a.country)
                    raw = json.dumps(d, ensure_ascii=False)
                    text, urls = spec["parse"](d)
                except Exception as e:
                    err = repr(e)[:500]
                cur = db.execute("insert into answers(run_at,engine,model,prompt_id,intent,rep,prompt,answer,raw,error) values(?,?,?,?,?,?,?,?,?,?)",
                                 (now, eng, spec["model"], p["id"], p.get("intent", ""), rep, p["prompt"], text, raw, err))
                db.executemany("insert into citations values(?,?,?)", [(cur.lastrowid, u, domain_of(u)) for u in dict.fromkeys(urls)])
                db.commit()
                print(eng, p["id"], rep, "ERR" if err else f"{len(text)} chars, {len(urls)} urls", file=sys.stderr)
                time.sleep(a.sleep)


def report(a):
    db = sqlite3.connect(DB)
    since = (datetime.now(timezone.utc) - timedelta(days=a.days)).isoformat()
    brands = {a.brand: [a.brand] + a.alias, **{c: [c] for c in a.competitor}}
    rows = db.execute("select id, engine, answer from answers where error is null and answer != '' and run_at >= ?", (since,)).fetchall()
    cites = {}
    for aid, dom in db.execute("select answer_id, domain from citations"):
        cites.setdefault(aid, set()).add(dom)
    by_engine = {}
    for aid, eng, text in rows:
        e = by_engine.setdefault(eng, {"n": 0, "cited_any": 0, "own_cited": 0, **{b: 0 for b in brands}, "first": 0})
        e["n"] += 1
        doms = cites.get(aid, set())
        e["cited_any"] += bool(doms)
        e["own_cited"] += any(d == a.domain or d.endswith("." + a.domain) for d in doms) if a.domain else 0
        pos = {b: mention_pos(text, names) for b, names in brands.items()}
        for b, p in pos.items():
            e[b] += p is not None
        named = {b: p for b, p in pos.items() if p is not None}
        e["first"] += bool(named) and min(named, key=named.get) == a.brand
    for eng, e in sorted(by_engine.items()):
        n = e["n"]
        p = e[a.brand] / n
        moe = 1.96 * (p * (1 - p) / n) ** 0.5
        total_mentions = sum(e[b] for b in brands)
        print(f"\n[{eng}] answers={n}")
        print(f"  mention rate {a.brand}: {p:.1%} (95% CI ±{moe:.1%})")
        print(f"  share of voice: " + ", ".join(f"{b} {e[b] / total_mentions:.0%}" for b in brands) if total_mentions else "  share of voice: no brand mentioned")
        print(f"  own-domain citation rate: {e['own_cited'] / n:.1%} (answers with any citation: {e['cited_any'] / n:.0%})")
        print(f"  named first among tracked brands: {e['first'] / n:.1%}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run"); r.add_argument("prompts"); r.add_argument("--engines", default="openai")
    r.add_argument("--reps", type=int, default=3); r.add_argument("--country", default="US"); r.add_argument("--sleep", type=float, default=1.0)
    for s in (r, sub.add_parser("report")):
        s.add_argument("--brand", required=True); s.add_argument("--alias", action="append", default=[])
        s.add_argument("--competitor", action="append", default=[]); s.add_argument("--domain", default="")
        s.add_argument("--days", type=int, default=28)
    a = ap.parse_args()
    run(a) if a.cmd == "run" else report(a)
```

报表输出示例（用伪造数据，数字无意义，只演示格式）[S68]：

```text
[openai] answers=20
  mention rate MyTool: 55.0% (95% CI ±21.8%)
  share of voice: MyTool 35%, OtherTool 65%
  own-domain citation rate: 55.0% (answers with any citation: 100%)
  named first among tracked brands: 55.0%
```

注意 20 条回答的置信区间是 ±21.8 个百分点，这正是「样本太少看不出任何东西」的直观例子。

已知局限：

- Gemini 的 API 可能返回跳转 token 而不是真实 URL [S10]，这时 `own-domain citation rate` 会偏低，需要额外解析跳转。
- 名字匹配用的是单词边界，中文品牌名前后没有空格，`(?<!\w)` 对中文同样生效，但「小鹿记账本」会匹配「小鹿记账」，别名要写全写准。
- `named first` 只在被追踪品牌之间比较，不是 AI 回答里的绝对名次，而且按 SparkToro 的结论基本是噪声 [S1]。
- 没做重试和限流。Gemini 付费层默认每天 1,500 次 [S38]，Perplexity、Anthropic 也有速率限制，大批量请用 Anthropic 的 Batch API [S36]。

### 4.3 代价估算

计费规则（官方）：

- OpenAI：每次 `web_search` 调用 $0.01，另加 token；搜索内容 token 按模型单价算 [S35]。
- Anthropic：每次搜索 $0.01，另加 token；搜索结果计入输入 token [S36]。
- Gemini 3+：每月前 5,000 次搜索免费，之后每次 $0.014，一个回答可能执行多次搜索 [S38]。
- Perplexity Agent API：每次 `web_search` $0.0025（fast 为 $0.001）+ token [S40][S41]。
- DeepSeek Search API：每次 $0.00075，但模型推理另算 [S42]。

单条回答的估算（**都是估算**，token 用量以 Anthropic 文档示例里一次搜索的真实返回为参照：输入 6,039、输出 931 [S36]；实际用量随问题和模型变化很大）：

| 配置 | 估算单价 / 条回答 | 算法 |
|---|---|---|
| Anthropic Haiku 5.5，1 次搜索 | 约 $0.011 | 6,039 × $0.10/M + 931 × $0.50/M + $0.01 [S37][S36] |
| Anthropic Haiku 5.5，`max_uses: 3` 用满 | 约 $0.03 到 $0.04 | 搜索费 ×3，输入 token 也随之增加 |
| OpenAI `gpt-6-astra` | 约 $0.12 | 6,039 × $10/M + 931 × $50/M + $0.01 [S35]。旗舰模型的 token 费远超搜索费 |
| OpenAI 便宜模型（如 `gpt-6-luna` $0.10/$0.50） | 约 $0.011 | 前提是该模型支持 `web_search`，本稿未核实 |
| Perplexity Agent API，`perplexity/sonar`，fast 搜索 | 约 $0.0025 到 $0.004 | 假设输入 2,000、输出 400 token [S41][S40] |
| Gemini，免费额度内 | 只有 token 费 | 每月 5,000 次搜索免费 [S38]；`gemini-4-hydrogen` 的 token 单价本稿未查 |

月度场景：30 个提示词 × 3 次 × 4 个引擎 × 每周一次 ≈ 每月 1,560 条回答。

- 全用便宜配置（约 $0.01 到 $0.03 / 条）：每月约 $15 到 $50。
- 其中 OpenAI 那四分之一（390 条）用 `gpt-6-astra`：每月多约 $45。
- 同时管 10 个产品：直接乘 10，所以多产品开发者更应该用便宜模型 + Perplexity / Gemini 免费额度，并把重复次数从 3 降到 1、提示词从 30 扩到 50（按 [S6] 的结论，组合层面这样更划算）。

对比：Peec Starter $95/月只有 50 个提示词 [S45]。一个产品时商业工具省事；五个以上产品时自建更便宜（推断）。

---

## 5. 结合 AI 怎么做

### 5.1 能交给 AI 的活

| 活 | 交给谁 | 人要把关什么 |
|---|---|---|
| 从评论、issue、客服邮件里提炼提示词集 | Claude / ChatGPT | 去掉含品牌名的问题；确认像真人问法 |
| 生成品牌别名表 | Claude / ChatGPT | 补上你知道的内部叫法 |
| 写 GA4 正则、检查来源列表 | Claude / ChatGPT | 在 DebugView 里实测 |
| 读爬虫日志脚本的输出，找异常 | Claude Code / Codex | 核对建议是否会误封真爬虫 |
| 给回答打标签（是否推荐、情感、事实错误） | 便宜模型（Haiku、gpt-6-luna 等）批量跑 | 人工标 50 条校准 |
| 设计实验、算样本量 | Claude / ChatGPT | 确认假设和判定标准是你自己定的 |
| 每周跑追踪器、写周报 | Claude Code + cron / GitHub Actions；或开源 Skill（GEO 医生 [S59]） | 看最终结论有没有超出置信区间 |

### 5.2 提示词示例

**提示词 1：从用户原话生成提示词集**

```text
我做了一个产品：<产品名>，<一句话说明>，目标用户是<谁>，平台是<Chrome 插件 / 网站 / 小程序>。
下面是用户评论、GitHub issue 和客服邮件的原文（已去掉个人信息）：
<粘贴 50 到 200 条>

请帮我写一个用来测试 AI 搜索可见度的提示词集，要求：
1. 30 个提示词，按意图分四组：发现类、对比类、场景类、品牌事实类。
2. 前三组的提示词里不能出现我的产品名和域名。
3. 用用户原话的说法和长度，不要写成关键词；不要写「给我列出前 5 名」这种限定数量的问法（真实用户很少这样问）。
4. 中文 15 个、英文 15 个。
5. 输出 CSV，列为 id,prompt,intent,lang，不要多余说明。
```

依据：SparkToro 发现真实用户几乎从不在提示词里指定数量 [S2]。

**提示词 2：给回答打标签（LLM 当评委）**

```text
你是一个严格的标注员。下面是一个 AI 助手对用户问题的回答。
被追踪的品牌及别名：
- 我方：<品牌>，别名 <别名1>, <别名2>，域名 <domain>
- 竞品：<竞品A>, <竞品B>

产品事实卡（唯一可信来源）：
<价格、平台、主要功能、不支持的功能>

请只输出 JSON，不要解释：
{
  "mentioned": {"<品牌>": true/false, "<竞品A>": true/false, ...},
  "recommended": {"<品牌>": "recommended" | "mentioned_only" | "advised_against" | "absent", ...},
  "sentiment_toward_us": "positive" | "neutral" | "mixed" | "negative" | "absent",
  "factual_errors": ["引用回答原句，并说明与事实卡哪一条矛盾"],
  "evidence": "支持 recommended 判断的原句"
}
规则：只有回答明确建议用户使用，才算 recommended；只在列表里出现算 mentioned_only。不确定时选更保守的标签。

回答：
<粘贴回答>
```

用法：先人工标 50 条，算你和模型的一致率；低于 80% 就改规则再试（经验做法）。

**提示词 3：检查 GA4 正则**

```text
这是我 GA4「会话来源」报告近 90 天的来源列表（导出的 CSV）：
<粘贴>
这是我自定义 AI 渠道用的正则：
<粘贴第 2.3.2 节的正则>
请：
1. 找出列表里看起来来自 AI 产品、但没被正则匹配的来源。
2. 找出被正则匹配、但其实不是 AI 产品的来源（误伤）。
3. 给出修改后的正则，保持 ^(.*\.)?(…)$ 的写法，不要用 gpt、google、openai 这类裸词。
只基于列表里出现的值判断，不要编造域名；不确定的单独列出来。
```

**提示词 4：读爬虫日志报告**

```text
下面是我用脚本统计的一个月 AI 爬虫日志结果（含验证状态、状态码、最常抓取的路径）和 AI 来访落地页：
<粘贴 ai_bots_log.py 的输出>
我最希望被 AI 推荐的页面是：<列出 URL>
请回答：
1. 哪些搜索类爬虫（OAI-SearchBot、Claude-SearchBot、PerplexityBot、Googlebot、bingbot）有异常的 4xx/5xx 比例？
2. 我最希望被推荐的页面里，哪些一个月都没被搜索类爬虫抓过？
3. 伪造 UA 的请求有多少，要不要在 Cloudflare WAF 里处理？
4. 给出最多 5 条按优先级排序的行动，每条说明怎么验证有没有生效。
不要推测日志里没有的数据。
```

**提示词 5：实验预注册和复核**

```text
我想测试一个 GEO 改动是否有效。
改动：<例如：给 3 个插件的落地页加「和 X 对比」表格>
可用数据：每周一次、每个提示词 3 次重复的 API 追踪，4 个引擎；GA4 AI 渠道；Bing AI Performance。
基线提及率大约：<x%>
请帮我写一份一页纸的实验预注册：
1. 假设和主要指标（只能一个）。
2. 处理组和对照组怎么分（页面或提示词），如何避免两组互相影响。
3. 基线期和观察期各多长，理由。
4. 需要的样本量（用两比例检验，95% 置信、80% 检验力），并说明同一提示词重复回答相关、有效样本会变小。
5. 判定规则：差值多大算有效，多大算无法判断。
6. 可能的混杂因素（模型升级、UTM 归因故障、季节性）以及怎么识别。
```

### 5.3 让编程助手帮你部署

把第 4 节代码和下面这段话交给 Claude Code 或 Codex：

```text
在当前仓库新建 geo/ 目录，放入 geo_track.py 和 prompts.csv。
1. 写一个 GitHub Actions 工作流：每周一 UTC 01:00 运行
   python3 geo/geo_track.py run geo/prompts.csv --engines anthropic,perplexity --reps 3 …
   API Key 从仓库 secrets 读。运行完把 geo/geo.sqlite 提交回仓库。
2. 再加一步运行 report，把输出写进 geo/REPORT.md 并一起提交。
3. 不要把任何 Key 写进文件。
4. 先用 --reps 1、只跑 2 个提示词做一次手动触发（workflow_dispatch）测试，把运行日志贴给我。
```

---

## 6. 误区和争议

| 说法 | 评价 | 依据 |
|---|---|---|
| 「我们在 ChatGPT 里排第一」 | 基本是噪声。同一顺序出现两次的概率约 1/1,000 | [S1][S2] |
| 「截图显示 AI 没提我们，所以我们在 AI 里不可见」 | 单次观察没有意义，「再问一遍你就出现了」 | [S2] |
| 「每个提示词必须跑 100 次」 | 只对单个提示词的精确估计成立。看几十个提示词合起来的趋势时，每天 1 次就够 | [S1][S5][S6] |
| 「每个提示词跑 3 到 5 次就够了」 | 对单个提示词远远不够（5 次误差约 ±27 点）；对大组合的趋势可以 | [S5][S6] |
| 「GA4 的 AI Assistant 渠道就是全部 AI 流量」 | 只是下限：漏 Perplexity、Claude，漏无 referrer 的 App 点击，AI Overviews / AI Mode 算自然搜索 | [S14][S17][S18] |
| 「Search Console 能看 AI Overviews 带来多少点击」 | 不能。生成式 AI 报告只有曝光，且不分 AI Overviews 和 AI Mode | [S13] |
| 「AI 来访转化率是搜索的 23 倍」 | 来自单一站点（Ahrefs 自家），Fishkin 也质疑有动机性思维；AI 来访量通常极小，比例很容易被少数用户放大 | [S2]；SE Ranking 只给了会话时长，没给转化 [S43] |
| 「AI 流量马上要超过 Google」 | 2026 年 AI 来访只占网站总流量约 0.32% | [S43]；[S2] |
| 「用 API 测的结果就是用户看到的」 | 品牌重合只有 15% 到 24% | [S10]（作者卖网页抓取数据，有利益相关） |
| 「抓网页才准，API 没用」 | 也过头了。API 的系统性偏差在前后对比和对照组比较中会部分抵消（推断）；抓网页有登录、反爬和服务条款风险 | [S10][S57] |
| 「用 Sonar API 测 Perplexity」 | 已过时，Sonar Chat Completions 于 2026-09-27 停止支持，改用 Agent API | [S39] |
| 「引用掉了，赶紧改页面」 | 约 75% 掉出的引用 20 天内会自己回来，等 2 到 3 周 | [S9] |
| 「月度引用漂移 40% 到 60%」「每周 96.8% 不变」 | 口径不同，不可直接比较；前者是 2025 年 Profound 按月、新进域名口径 [S8]，后者是 BrightEdge，方法不明 [S12] | [S7][S8][S12] |
| 「AI 可见度分数 87 分」 | 各工具的综合分算法不公开、互不相同，只能看同一工具内的趋势。SparkToro 建议买工具前要求对方公开统计方法 | [S1][S51] |

---

## 7. 还没查清的问题

1. **国内商业 GEO 监测服务**：有哪些 SaaS 在监测豆包、DeepSeek、元宝、Kimi、文心，价格和方法如何。本稿只确认了开源项目 [S59][S60] 和 Peec 支持文心 [S45]，商业服务因搜索额度用完没查。
2. **国内 AI 产品的 referrer**：豆包、Kimi、元宝、通义、秘塔、DeepSeek 网页版点出的链接带什么 referrer 或 UTM，本稿正则里的国内域名没有出处，需要自己的日志验证。百度统计是否有 AI 渠道也没查。
3. **BrightEdge、Conductor** 的 AI 搜索模块功能和价格，未查。
4. **DeepSeek 聊天 API 是否有服务端联网搜索工具**：官方文档只确认独立的 Search / Fetch API [S42]；第三方称其 Anthropic 兼容接口支持 `web_search_20250305` 或 `web_search_20260209`，并称 2026-11-01 起计费，未在官方页面核实。
5. **GA4「matches regex」是整串匹配还是部分匹配**：本稿的正则用 `^…$` 锚定以兼容两种情况，但没在 GA4 文档里找到明确说明。
6. **OpenAI 便宜模型（如 `gpt-6-luna`）是否支持 `web_search`**：定价页列了价格 [S35]，web search 文档只推荐 `gpt-6-astra` [S34]。
7. **Gemini API 引用的 URL 是真实地址还是跳转 token**：新 Interactions API 的文档示例是真实 URL [S38]，Surfer 的研究说 Gemini / AI Mode 的 API 返回跳转 token [S10]，可能是新旧 API 的差别。
8. **Scrunch 被 Sitecore 收购**、**AthenaHQ 是否有免费档**、**Semrush 和 Ahrefs Brand Radar 的确切价格**：只有第三方说法，互相矛盾。
9. **AI 来访的真实转化率**：没有找到大样本、非厂商的研究。
10. **SparkToro 与 Gumshoe 的研究只覆盖 ChatGPT、Claude、Google AI**：Perplexity、Copilot、豆包、DeepSeek 的一致性没有同等规模的独立数据。Meikai 发现 Copilot 的引用份额最不稳 [S6]。
11. **Search Console 生成式 AI 报告的曝光怎么计**：只要出现在 AI 功能里的链接就算一次，还是要滚动到可见才算，Google 博客没写。
12. **ChatGPT UTM 恢复后的稳定性**：2026-10 事件的确认来自 Adobe 的 Cedric Huesler 转述 OpenAI 的私下回复，OpenAI 没有公开声明 [S19][S20]。

---

## 8. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | New Research: AIs are highly inconsistent when recommending brands or products | SparkToro（Rand Fishkin）与 Gumshoe（Patrick O'Donnell） | 2026-01-28 | https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/ | 大样本实验 | B | 600 人、12 个提示词、2,961 条回答：同名单 <1/100，同顺序约 1/1,000；出现率稳定；建议每题 60 到 100 次。Gumshoe 卖追踪工具 |
| S2 | Office Hours: Can You Actually Track AI Visibility? | SparkToro | 2026-05-07 | https://sparktoro.com/blog/office-hours-can-you-actually-track-ai-visibility/ | 讲座文字稿 | C | 排名是噪声；142 个不同问法的可见度分布与单提示词 100 次相近；AI 访问占 2.9%、搜索 34%（桌面端）；转述 Ahrefs 4 到 23 倍转化 |
| S3 | Don't Measure Once: Measuring Visibility in AI Search (GEO) | 圣加仑大学（Schulte、Bleeker、Kaufmann） | 2026（数据 2026-01 至 03） | https://huggingface.co/papers/2604.07585 | 预印本（arXiv 2604.07585） | B | 每天约 65% 来源更换；每题每天 7 次标准误 <0.10；10 天 <0.10、24 天 <0.05；建议 2 到 4 周滚动窗口 |
| S4 | Quantifying Uncertainty in AI Visibility: A Statistical Framework for Generative Search Measurement | Ronald Sielinski | 2026-03-09（v3 2026-08-26） | https://arxiv.org/abs/2603.08924 | 预印本 | B | 引用幂律分布；bootstrap 置信区间显示很多域名差异在噪声内；单次指标「误导性精确」 |
| S5 | How many repetitions of a single prompt does it take to understand your AI visibility? | Evertune | 2026-07-16 | https://www.evertune.ai/resources/insights-on-ai/how-many-repetitions-of-a-single-prompt-does-it-take-to-understand-your-ai-visibility | 厂商研究（10,700 个 ChatGPT 提示词） | B | 5 次误差约 ±27 点、12 次 ±12、100 次 ±6；建议 100 次。厂商卖高频采样 |
| S6 | How many times should you run an AI visibility prompt? | Meikai | 2026-07-27 | https://www.meikai.ai/blog/how-many-times-run-ai-visibility-prompts | 厂商研究（500 提示词、5 平台、10 天、约 25 万条回答） | B | 组合层面每天 1 次与 10 次结果相同；Copilot 需每天 3 次；优先扩提示词覆盖 |
| S7 | AI citation drift | SISTRIX | 2026-05-01 | https://www.sistrix.com/blog/ai-citation-drift/ | 厂商大样本（82,619 提示词、6 国、17 周） | B | 每周新进域名：ChatGPT 74%、AI Mode 56%、AI Overviews 5%；AIO 53% 提示词 17 周无变化 |
| S8 | AI Search Volatility | Profound | 2025-07-17 | https://www.tryprofound.com/blog/ai-search-volatility | 厂商大样本（每平台约 8 万提示词） | B | 一个月漂移：AIO 59.3%、ChatGPT 54.1%、Copilot 53.4%、Perplexity 40.5%（2025 年数据） |
| S9 | How Stable Are AI Citations? | Ahrefs（Mateusz Makosiewicz、Xibeijia Guan） | 2026-10-29 | https://ahrefs.com/blog/how-stable-are-ai-citations/ | 厂商大样本（约 37,500 个被引网站，20 天） | B | ChatGPT 59% 引用次日消失、4% 撑满 20 天；75% 会回来；建议看 7 天出现天数、等 2 到 3 周 |
| S10 | LLM scraped AI answers vs API results | Surfer（与 cloro） | 2026-08（数据 2026-08-04） | https://surfer.ai/blog/llm-scraped-ai-answers-vs-api-results/ | 厂商实验（1,000 提示词、13,779 条回答） | B | API 与 App 品牌重合 15.5% 到 23.8%；ChatGPT API 13.8 个品牌对 App 7.9 个。Surfer 卖抓取数据 |
| S11 | AI Overviews vs AI Mode | Ahrefs | 2025 | https://ahrefs.com/blog/ai-overviews-vs-ai-mode | 厂商大样本（约 73 万对回答） | B | 结论语义相似 86%，引用重合 13.7%。本稿只见到搜索摘要 |
| S12 | AI Search Citations: How Much Do They Really Change Week to Week? | BrightEdge | 未知 | https://www.brightedge.com/resources/weekly-ai-search-insights/ai-search-citations-week-to-week-changes | 厂商周报 | C | 搜索摘要称 96.8% 被引域名周环比零变化；未打开原文，方法不明 |
| S13 | Introducing Search Generative AI performance reports in Search Console | Google Search Central | 2026-06-03（2026-08-31 全量） | https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports | 官方博客 | A | 只有曝光，可按页面、国家、设备、日期看；不分 AIO 与 AI Mode；无点击 |
| S14 | Traffic-source dimensions（含 Default channel group） | Google Analytics 帮助中心 | 2026（访问于 2026-11-14） | https://support.google.com/analytics/answer/9756891?hl=en | 官方文档 | A | AI Assistant 渠道：medium 完全等于 ai-assistant；referrer 匹配 AI 助手列表时自动设置；排在 Organic Search 后、Referral 前 |
| S15 | Custom channel groups | Google Analytics 帮助中心 | 访问于 2026-11-14 | https://support.google.com/analytics/answer/13051316?hl=en | 官方文档 | A | Admin → Data display → Channel groups；标准属性 2 个自定义组；对历史数据生效；按顺序取第一个匹配 |
| S16 | Google Analytics Adds AI Assistant As Default Channel Group | Search Engine Journal | 2026-05-14 | https://www.searchenginejournal.com/google-analytics-adds-ai-assistant-as-default-channel-group/574974/ | 行业新闻 | C | 2026-05-13 上线；完整列表未公开；无 referrer 仍落 Direct；Search Console 把 AI Mode 混入总数 |
| S17 | GA4's AI Assistant Channel Undercounts Your AI Traffic | Search Engine Journal（Itamar Blauer） | 2026-07-15 | https://www.searchenginejournal.com/ga4s-ai-assistant-channel-undercounts-your-ai-traffic-how-to-build-one-that-doesnt/580133/ | 从业者文章 | C | 漏 Perplexity、Claude；chatgpt.com 可能落 Referral 或 Unassigned；AIO / AI Mode 算 Organic；正则勿用裸词 |
| S18 | AI Traffic in GA4: The Native Channel and the One You Build | Terminus | 2026-07-09（更新 2026-09-16） | https://www.terminusapp.com/blog/ai-traffic-channel-in-ga4/ | 从业者文章 | C | 原生覆盖 ChatGPT、Gemini、DeepSeek、Copilot、Grok；漏 Claude、Perplexity、Meta AI、You.com、Poe；DebugView 验证法 |
| S19 | Missing ChatGPT Traffic in GA4? A UTM Bug Broke Referral Tracking for a Week | BuildMVPFast | 2026-10 | https://www.buildmvpfast.com/blog/chatgpt-utm-bug-ga4-direct-traffic-2026 | 事件汇总（引用多方数据） | C | 2026-10-08 到 15 UTM 和 referrer 丢失；500 页每天少约 31,000 次 ChatGPT、Direct 多约 26,000；仅约 12% 点击带 referrer |
| S20 | The week without ChatGPT attribution | Evertune | 2026-10 | https://www.evertune.ai/resources/insights-on-ai/the-week-without-chatgpt-attribution | 厂商文章 | C | 同一事件的第二来源；OpenAI 无公开声明 |
| S21 | AI traffic analytics: track visits, engagement and conversions | Plausible | 未标日期（访问于 2026-11-14） | https://plausible.io/track-ai-traffic | 官方产品页 | A | 自动把 ChatGPT、Claude、Perplexity、Gemini、Copilot 等归入 AI Assistants 渠道，过滤 AI 爬虫 |
| S22 | Attribution | Umami 文档 | 访问于 2026-11-14 | https://docs.umami.is/docs/attribution | 官方文档 | A | 显示 referrer、广告和 UTM，首次 / 末次点击模型；未提 AI 渠道 |
| S23 | Web Analytics dimensions | Cloudflare 文档 | 访问于 2026-11-14 | https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/ | 官方文档 | A | 有 Referer、Path、Country 等维度和排除机器人开关；未说明 UTM |
| S24 | Introducing AI Performance in Bing Webmaster Tools Public Preview | Bing Webmaster Blog | 2026-02 | https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview | 官方博客 | A | 五项指标：总引用、平均被引页面、grounding 查询、页面级引用、趋势；覆盖 Copilot、Bing AI 摘要、部分合作方 |
| S25 | Bing Webmaster Tools: 4 New Reports to Know Why AI Cites Your Site | Pasquale Pillitteri | 2026-06 | https://pasqualepillitteri.it/en/news/5220/bing-webmaster-tools-ai-citation-share-geo | 从业者文章 | C | 2026-06-16 新增 Intents、Topics、Citation Share、Compare，全球预览、免费 |
| S26 | 5 Ways To Use Bing Webmaster Tools AI Performance for GEO | Similarweb | 2026-02-16 | https://aisearch.similarweb.com/blog/bing-ai-performance-tool/ | 厂商文章 | C | Bing 报告无点击、无 API、无竞品；附 Similarweb 自家产品功能和 $99/月（厂商自述，D 级内容） |
| S27 | AI Crawl Control overview | Cloudflare 文档 | 访问于 2026-11-14 | https://developers.cloudflare.com/ai-crawl-control/ | 官方文档 | A | 原名 AI Audit，所有套餐可用；可设置放行 / 屏蔽、追踪 robots.txt 遵守情况 |
| S28 | Analyze AI traffic | Cloudflare 文档 | 访问于 2026-11-14 | https://developers.cloudflare.com/ai-crawl-control/features/analyze-ai-traffic/ | 官方文档 | A | Overview / Crawlers / Metrics 三个标签；referrals 数据仅付费套餐；CSV 和 GraphQL 导出 |
| S29 | The crawl-to-click gap: Cloudflare data on AI bots, training, and referrals | Cloudflare Blog | 2025-08-29 | https://blog.cloudflare.com/crawlers-click-ai-bots-training/ | 平台网络数据 | B | 2025-07 抓取 / 来访比：Anthropic 38,066、OpenAI 1,091、Perplexity 195、Google 5.4（2025 年数据） |
| S30 | Overview of OpenAI Crawlers | OpenAI | 访问于 2026-11-14 | https://developers.openai.com/api/docs/bots | 官方文档 | A | OAI-SearchBot、GPTBot、ChatGPT-User、OAI-AdsBot 的用途、UA 和 IP JSON；robots 改动约 24 小时生效 |
| S31 | Does Anthropic crawl data from the web, and how can site owners block the crawler? | Anthropic 帮助中心 | 访问于 2026-11-14 | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | 官方文档 | A | ClaudeBot、Claude-User、Claude-SearchBot；遵守 robots.txt 和 Crawl-delay；IP 列表 claude.com/crawling/bots.json |
| S32 | Perplexity Crawlers | Perplexity 文档 | 访问于 2026-11-14 | https://docs.perplexity.ai/guides/bots | 官方文档 | A | PerplexityBot 遵守 robots.txt；Perplexity-User 一般不遵守；两个 IP JSON |
| S33 | Verifying Googlebot and other Google crawlers | Google Search Central | 访问于 2026-11-14 | https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot | 官方文档 | A | 反向 + 正向 DNS 校验；五个 IP 段 JSON 文件 |
| S34 | Web search（tools-web-search） | OpenAI | 访问于 2026-11-14 | https://developers.openai.com/api/docs/guides/tools-web-search | 官方文档 | A | `web_search` 工具、`url_citation` 注释、`include` 拿全部来源、`user_location`、域名过滤；推荐 gpt-6-astra；gpt-4o-search-preview 2026-07-23 下线 |
| S35 | Pricing | OpenAI | 访问于 2026-11-14 | https://developers.openai.com/api/docs/pricing | 官方定价 | A | web search $10 / 1k 调用 + 搜索内容 token 按模型计；各模型 token 单价 |
| S36 | Web search tool | Anthropic（Claude Platform 文档） | 访问于 2026-11-14 | https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool | 官方文档 | A | 三个版本；max_uses、域名过滤、user_location；citations 结构；$10 / 1k 搜索；示例 usage 输入 6,039、输出 931 |
| S37 | Pricing | Anthropic（Claude Platform 文档） | 访问于 2026-11-14 | https://platform.claude.com/docs/en/about-claude/pricing | 官方定价 | A | Haiku 5.5 $0.10 / $0.50 每百万 token（10 万以内）；Sonnet 5.5 $2 / $10 |
| S38 | Grounding with Google Search | Google AI Studio / Gemini API 文档 | 访问于 2026-11-14 | https://aistudio.google.com/docs/google-search | 官方文档 | A | `google_search` 工具、Interactions API、url_citation 注释；Gemini 3+ 每月 5,000 次免费后 $14 / 1k；每天默认 1,500 次 |
| S39 | Migrate from Sonar to the Agent API | Perplexity 文档 | 访问于 2026-11-14 | https://docs.perplexity.ai/getting-started/models/models/sonar.md | 官方文档 | A | Sonar Chat Completions 于 2026-09-27 停止支持，改用 Agent API |
| S40 | Agent API: Web Search | Perplexity 文档 | 访问于 2026-11-14 | https://docs.perplexity.ai/docs/agent-api/tools/web-search.md | 官方文档 | A | `web_search` $2.50 / 1k，fast $1 / 1k；`search_results` 输出结构；域名过滤最多 20 个 |
| S41 | Agent API Models | Perplexity 文档 | 访问于 2026-11-14 | https://docs.perplexity.ai/docs/agent-api/models.md | 官方定价 | A | perplexity/sonar $0.25 / $2.50 每百万 token |
| S42 | Search & Fetch | DeepSeek API 文档 | 访问于 2026-11-14 | https://api-docs.deepseek.com/guides/search.md | 官方文档 | A | Search / Fetch API 各 $0.75 / 1k 成功请求；Search 100 QPS |
| S43 | AI traffic grew 16x from 2024 to 2026 | SE Ranking | 2026-06-18 | https://seranking.com/blog/ai-traffic-research-study/ | 厂商大样本（101,574 个网站） | B | 2026 年 AI 来访占 0.32%；ChatGPT 74.78%、Gemini 11.56%、Perplexity 7.23%；会话时长更长 |
| S44 | Ahrefs Traffic Analytics | Ahrefs | 2026-11-05 | https://ahrefs.com/blog/traffic-analytics/ | 厂商文章 | C | 例：asana.com 的 AI 来访约占 0.5%（估算） |
| S45 | Pricing | Peec AI | 访问于 2026-11-14 | https://peec.ai/pricing | 官方定价 | A | Starter $95（50 提示词）、Pro $245、Advanced $495；可选模型含 ERNIE |
| S46 | Pricing | Profound | 访问于 2026-11-14 | https://www.tryprofound.com/pricing | 官方定价 | A | 只有试用和企业版；企业版最多 10 个引擎，含 DeepSeek、Qwen；Agent Analytics |
| S47 | Profound Alternatives: 8 AI Visibility Tools After Profound's Pricing Change | eClincher | 2026-10-08 | https://www.eclincher.com/articles/profound-alternatives-8-ai-visibility-tools-after-profounds-pricing-change | 竞品撰写的对比 | D | Profound 2026-09 取消 $99 / $399 自助套餐；Otterly $29、AthenaHQ $295、Scrunch $250、Semrush $99、Brand Radar $398 等。作者是竞品 |
| S48 | What are the plans and the pricing of OtterlyAI? | Otterly.AI 帮助中心 | 访问于 2026-11-14 | https://help.otterly.ai/pricing-of-otterlyai | 官方文档 | A | Lite / Standard / Premium / Enterprise 的提示词数和积分；Claude 每次 3 积分 |
| S49 | What is the pricing for Scrunch plans? | Scrunch | 访问于 2026-11-14 | https://scrunch.com/faqs/what-is-the-pricing-for-scrunch-plans | 官方 FAQ | A | Core $250 / 月、125 个提示词、4 个引擎；企业版 9 个引擎 |
| S50 | Brand Radar | Ahrefs | 访问于 2026-11-14 | https://ahrefs.com/brand-radar | 官方产品页 | A | 覆盖 AIO、AI Mode、ChatGPT、Perplexity、Gemini、Copilot；5.65 亿提示词库；€47 / €179 起 |
| S51 | AEO Grader | HubSpot | 访问于 2026-11-14 | https://www.hubspot.com/aeo-grader | 官方产品页 | A | 免费一次性体检，五维度满分 100；持续追踪 $50 / 月 |
| S52 | Pricing | Writesonic | 访问于 2026-11-14 | https://writesonic.com/pricing | 官方定价 | A | 年付 Starter $79（50 提示词）到 Growth $399；各档含 AI Bot Analytics |
| S53 | AI SEO Toolkit | Semrush | 访问于 2026-11-14 | https://www.semrush.com/ai-seo/ | 官方产品页 | A | 功能区：可见度总览、竞品、提示词研究、品牌认知、提示词追踪；页面无价格 |
| S54 | Signal Spotlight: Goodie AI | Industry Lens | 2026 | https://industry-lens.com/reports/signal-spotlight-goodie-ai | 第三方报告（仅见搜索结果） | D | 称 Goodie 入门档 $399 / 月；G2 显示官方未公开价格 |
| S55 | elmohq/elmo | Elmo（GitHub） | 2026-11-14 推送 | https://github.com/elmohq/elmo | 开源项目 | C | MIT，600 星；提及率 = 提到你的 run 占比；情感 100 / 50 / 0；抓真实 App |
| S56 | limelit-co/open | Limelit（GitHub） | 2026-11-13 推送 | https://github.com/limelit-co/open | 开源项目 | C | Apache-2.0，444 星，Go 单二进制，自带 Key，内置 MCP，预发布 |
| S57 | oneglanse/oneglanse | OneGlanse（GitHub） | 2026-11-13 推送 | https://github.com/oneglanse/oneglanse | 开源项目 | C | MIT，258 星；用 Camoufox + Playwright 跑网页；评分是模型对文本的解读 |
| S58 | danishashko/geo-aeo-tracker | GitHub | 2026-11-11 推送 | https://github.com/danishashko/geo-aeo-tracker | 开源项目 | C | MIT，328 星；Bright Data 抓 4 个引擎；README 列出 Semrush $199、AthenaHQ $295（2026-10 价格） |
| S59 | Fangx-AI/geo-doctor（GEO 医生） | GitHub | 2026-11-09 推送 | https://github.com/Fangx-AI/geo-doctor | 开源 Skill | C | MIT，607 星；支持豆包、DeepSeek、千问、Kimi 等；每题问 2 次算推荐率；提醒 API 与 App 差异 |
| S60 | aigclink/geolook（GeoLook） | GitHub | 2026-08-10 推送 | https://github.com/aigclink/geolook | 开源项目 | C | MIT，816 星；17 个引擎含豆包、DeepSeek、Kimi、GLM、MiniMax、秘塔；7 / 14 / 28 天复查 |
| S61 | yaojingang/GEORank | GitHub | 2026-11-11 推送 | https://github.com/yaojingang/GEORank | 开源项目 | C | Apache-2.0，537 星；诊断、方案、拓词、JSON-LD / llms.txt 生成；georankhub.com |
| S62 | yaojingang/GEOFlow | GitHub | 2026-11-13 推送 | https://github.com/yaojingang/GEOFlow | 开源项目 | C | AGPL-3.0，4,132 星；GEO 内容工程和多站分发 |
| S63 | AnswerDotAI/llms-txt | GitHub | 2026-09-24 推送 | https://github.com/AnswerDotAI/llms-txt | 提案原始仓库 | C | Apache-2.0，2,687 星；llms.txt 提案 |
| S64 | firecrawl/llmstxt-generator | GitHub | 2025-06-17 推送 | https://github.com/firecrawl/llmstxt-generator | 开源工具 | C | 540 星；生成 llms.txt / llms-full.txt；一年多未更新 |
| S65 | thedaviddias/llms-txt-hub | GitHub | 2026-11-14 推送 | https://github.com/thedaviddias/llms-txt-hub | 目录 | C | 927 星；llms.txt 实现目录 |
| S66 | GEO-optim/GEO | GitHub | 2025-10-30 推送 | https://github.com/GEO-optim/GEO | 论文代码 | C | Apache-2.0，350 星；GEO 原始论文（KDD 2024）代码 |
| S67 | Auriti-Labs/geo-optimizer-skill | GitHub | 2026-11-14 推送 | https://github.com/Auriti-Labs/geo-optimizer-skill | 开源工具 | C | MIT，1,325 星；审计网站能否被各 AI 引用 |
| S68 | 本稿实测 | 本调研 | 2026-11-14 | （本地运行，无链接） | 可复现测试 | C | 下载并解析了 OpenAI、Anthropic、Perplexity、Google 的 IP 段 JSON；日志脚本和追踪器用假数据跑通；样本量和代价用公式计算；GitHub API 读取仓库元数据 |
