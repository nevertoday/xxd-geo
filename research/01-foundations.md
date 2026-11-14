# 01 基础与研究证据：GEO 是什么、论文说了什么、生成式搜索怎么工作、变化有多大

调研日期：2026-11-14。本稿只覆盖「基础与证据」这一块：术语、原始 GEO 论文、2024 到 2026 年的后续学术研究、生成式搜索的工作原理、流量变化数据、以及这些对独立开发者意味着什么。爬虫配置、结构化数据、各平台实操细节属于其他调研稿，这里只在讲原理时点到。

说明：调研后段本会话的 WebSearch 配额用完，之后只用直接打开已知原文链接的方式核对。凡是只在搜索摘要里见过、没打开原文的出处，在出处表里注明「未打开原文」。

---

## 1. 一段话总结

1. **GEO 这个词出自 2023 年 11 月 16 日上传 arXiv 的论文**（Aggarwal 等，后发表于 KDD 2024）。论文原文写的是 "we propose ... which we dub Generative Engine Optimization (GEO)" [S1]。AEO 更早，通常归到 Jason Barnard 2017 年前后的提法，但这个归属主要来自他本人的网站 [S62]。2026 年 Google 官方文档把 AEO 和 GEO 并列提到，并明确表态「从 Google 搜索的角度看，为生成式 AI 搜索做优化就是为搜索体验做优化，因此仍然是 SEO」[S28]。微软广告 2026 年 1 月发布的指南标题直接用了 "AEO and GEO" [S41]。
2. **原始论文的「提升 40%」是在一个人造环境里测出来的**：被测引擎是 gpt-3.5-turbo 读 Google 前 5 条结果，被优化的网页已经确定在上下文里，指标是「回答里有多少字归给这个来源」。在这个设定下，加引语（Quotation Addition）把 Position-Adjusted Word Count 从 19.3 提到 27.2（约 +41%），加统计数据 +31%，加引用来源 +27%，关键词堆砌 -8% [S1]。
3. **后续研究大多没能在更真实的设定下复现这些收益。** C-SEO Bench（NeurIPS 2025）测了 4 个模型、54 种组合，只有 3 种组合出现显著提升，"Statistics" 方法在 24 个设定里有 19 个反而让排名显著下降 [S2]。2026 年的综述（45 篇研究）结论是：已经被检索到的内容，改写能改变它被引用的方式；但没有任何技巧被证明能稳定、跨平台、长期地提升「被发现」或带来流量 [S15]。
4. **决定你能不能被 AI 引用的，首先是「检索阶段能不能被找到、排得多靠前」。** C-SEO Bench 发现把文档放到上下文第一位带来的提升远大于任何改写方法 [S2]。对 ChatGPT 15.8 万条回答的分析显示，ChatGPT 引用的每一页都来自它自己的搜索结果，检索结果能解释 32% 的引用差异，页面本身的属性只解释 2.8% [S12]。
5. **被 AI 提到有两条独立的路：模型训练时记住了你，或者回答时实时检索到你。** OpenAI、Anthropic、Google 都把「训练用爬虫」和「搜索/检索用爬虫」分开（GPTBot 对 OAI-SearchBot，ClaudeBot 对 Claude-SearchBot，Google-Extended 对 Googlebot）[S36][S38][S33]。大品牌即使没有任何支持网页也会被模型直接点名；小厂商基本只在「有第三方页面提到它并被检索到」时才会被点名，这种第三方页面让 ChatGPT 点名小厂商的几率提高约 39.7 倍 [S12]。
6. **AI 引用和传统排名的重合度很低，而且在变。** Ahrefs 2025 年 8 月测得 AI 助手引用的 URL 只有约 12% 在 Google 前 10 [S48]；Google AI Overviews 引用来自前 10 的比例从 2025 年 7 月的 76% 降到 2026 年 3 月的 38% [S49]。原因之一是 query fan-out：引擎把一个问题拆成多个子查询分别去搜 [S28][S34]。
7. **点击在流失，但 AI 引荐流量本身仍然很小。** Pew 对 900 名美国成年人、68,879 次 Google 搜索的统计：出现 AI 摘要时点击传统结果的比例是 8%，没有时是 15% [S43]。Ahrefs 30 万关键词：有 AI Overview 时第一名的点击率下降约 58%（2023-12 对比 2025-12）[S44]。同时，SE Ranking 对 101,574 个网站的统计显示 AI 平台带来的流量只占总流量的 0.32%（2026 年 1 到 4 月）[S51]。
8. **AI 引荐流量「转化率更高」没有定论。** 唯一查到的同行评审研究（Marketing Science，973 个电商网站）发现 ChatGPT 引荐的转化率和每会话收入都低于 Google 自然搜索和付费搜索 [S55]；多家厂商报告则说更高 [S56]。
9. **对独立开发者最关键的发现：小产品在 AI 的「发现型问题」里几乎隐形。** 对 112 个 Product Hunt 2025 热门产品的测试：直接问名字，ChatGPT 认得 99.4%；问「今年最好的 AI 工具有哪些」这类问题，只有 3.32% 被提到。页面的 GEO 评分和被发现率没有相关性，引用域名数和 Reddit 社区讨论才有相关性 [S16]。

---

## 2. 正文

### 2.1 术语：GEO、AEO、LLMO、AIO、AI SEO 到底是什么关系

**各个词的来历和含义**

| 词 | 全称 | 出现时间与来源 | 现在一般指什么 |
|---|---|---|---|
| SEO | Search Engine Optimization | 1990 年代 | 让网页在传统搜索结果里排得靠前 |
| AEO | Answer Engine Optimization | Jason Barnard 自称 2017 年提出 [S62]；早期针对精选摘要、语音助手 | 让你的内容成为「直接答案」的来源；2025 年后常被当作 GEO 的同义词 |
| GEO | Generative Engine Optimization | Aggarwal 等，arXiv 2023-11-16 [S1] | 让内容在 ChatGPT、Perplexity、AI Overviews 等生成式回答里被提到、被引用 |
| LLMO | Large Language Model Optimization | 2024 年前后的行业用语，来源不明 | 与 GEO 大致同义，有人特指「进入模型知识」 |
| AIO / AISEO / AI search optimization | AI Optimization / AI SEO | 行业用语 | 泛称，含义随说话人变化 |

几篇 2026 年的行业文章对「哪个词更流行」各说各话：有的说 GEO 是英语市场的默认说法、LLMO 在日本更常见，有的说 AEO 在招聘启事里更多 [S63]。这些都是观点文章，没有给出搜索量数据，证据等级 D。我没有拿到 Google Trends 的直接数据（见第 6 节）。

**平台官方怎么说**

- Google（2026-05-15 发布、2026-07-10 更新的官方指南）：「AEO 代表 answer engine optimization，GEO 代表 generative engine optimization。这两个词描述的都是专门为提升在 AI 搜索体验中的可见度而做的工作。从 Google 搜索的角度看，为生成式 AI 搜索做优化就是为搜索体验做优化，因此仍然是 SEO。」[S28][S29] 同一页还专门有一节「Mythbusting generative AI search」，列出 Google 认为不需要做的事（见第 5 节）。
- 微软广告 2026 年 1 月发布《From Discovery to Influence: A Guide to AEO and GEO》，面向零售商，讲 Copilot、Bing 中的 AI 推荐 [S41]（我只看了二手报道，没打开 PDF 原文）。
- 学术界基本统一用 GEO。2026 年 arXiv 上以 "generative engine optimization" 为关键词的论文已有数十篇 [S15]。C-SEO Bench 用的是 "Conversational SEO"，指同一件事 [S2]。

**给网站的建议**：主标题用 GEO（学术来源清楚、Google 和微软都在用），第一次出现时并列解释 AEO、LLMO，并引用 Google 的「仍然是 SEO」表态。中文读者可以用「生成式引擎优化」。

### 2.2 原始 GEO 论文（Aggarwal 等，KDD 2024）

**基本信息** [S1]

- 标题：GEO: Generative Engine Optimization。arXiv 2311.09735，v1 于 2023-11-16 提交，v3 于 2024-06-28 修订。发表于 KDD 2024（DOI 10.1145/3637528.3671900）。
- 作者（v3 署名）：Pranjal Aggarwal（IIT Delhi）、Vishvak Murahari（Princeton）、Tanmay Rajpurohit（Independent）、Ashwin Kalyan（Independent）、Karthik Narasimhan（Princeton）、Ameet Deshpande（Princeton）。任务说明里提到的 Georgia Tech 和 Allen AI 是常被转述的早期版本署名，我在 v3 里没看到，v1 PDF 也没能解析出来核对（见第 6 节）。
- 代码与数据：generative-engines.com/GEO/。

**它把「生成式引擎」形式化成什么**

论文把生成式引擎写成：一个改写查询的模型把用户问题拆成多个子查询，交给搜索引擎拿回一组来源，可选地对每个来源做摘要，最后由生成模型写出带内联引用的回答。论文说这个流程「在写作时很接近 BingChat 的设计」[S1]。这和 2025 年 Google 公开的 query fan-out 思路一致（见 2.4）。

**GEO-bench**

- 10,000 条查询，8K/1K/1K 划分训练、验证、测试集；80% 信息类，交易类、导航类各 10% [S1]。
- 来源 9 个：MS MARCO、ORCAS-I、Natural Questions（真实 Bing/Google 查询），AllSouls（牛津论文题）、LIMA、Davinci-Debate、Perplexity Discover 热门问题、ELI5、GPT-4 生成的查询 [S1]。
- 每条查询附带 Google 前 5 条结果的清洗后文本。覆盖 25 个领域，用 GPT-4 打了 7 类标签 [S1]。

**怎么衡量「可见度」**

- Word Count：回答里引用某来源的句子的字数占比（多来源共引的句子平分字数）。
- Position-Adjusted Word Count（PAWC）：在字数基础上按出现位置做指数衰减，越靠前权重越高。
- Subjective Impression：用 GPT-3.5 按 G-Eval 方式对 7 个维度打分（相关性、影响力、独特性、主观位置、主观字数、点击可能性、多样性），再归一化到和 PAWC 相同的均值方差 [S1]。

**9 种方法和结果**（GEO-bench 测试集，5 个随机种子平均，表 1 原始数值 [S1]，相对提升是我按表中数值计算的）

| 方法 | 做法 | PAWC 总分（基线 19.3） | 相对基线 | 主观印象均值（基线 19.3） | 相对基线 |
|---|---|---|---|---|---|
| Quotation Addition | 加入可信来源的引语 | 27.2 | +40.9% | 24.7 | +28.0% |
| Statistics Addition | 把定性描述换成数字 | 25.2 | +30.6% | 23.7 | +22.8% |
| Fluency Optimization | 让文字更通顺 | 24.7 | +28.0% | 21.9 | +13.5% |
| Cite Sources | 加入可信来源的引用 | 24.6 | +27.5% | 21.9 | +13.5% |
| Technical Terms | 加专业术语 | 22.7 | +17.6% | 21.4 | +10.9% |
| Easy-to-Understand | 简化语言 | 22.0 | +14.0% | 20.5 | +6.2% |
| Authoritative | 语气更权威、更有说服力 | 21.3 | +10.4% | 22.9 | +18.7% |
| Unique Words | 加生僻词 | 20.5 | +6.2% | 20.4 | +5.7% |
| Keyword Stuffing | 塞入查询关键词 | 17.7 | -8.3% | 20.2 | +4.7% |

论文自己的总结是：Cite Sources、Quotation Addition、Statistics Addition 在 PAWC 上相对提升 30% 到 40%，在主观印象上 15% 到 30% [S1]。

**其他三个常被引用的结果**

- **组合使用**：在 200 条测试子集上，Fluency Optimization + Statistics Addition 的组合比任何单一方法高 5.5% 以上 [S1]。
- **对排名靠后的网页帮助更大**（表 2）：Cite Sources 让 SERP 第 5 名的网页可见度 +115.1%，同时让第 1 名的网页 -30.3%；Quotation Addition 分别是 +99.7% 和 -22.9% [S1]。论文据此说 GEO 能「让数字空间更民主」，帮助小创作者。要注意这一组实验是「所有来源同时被优化」的设定下测的，而且是零和的：靠后的网页分到更多字数，靠前的就少了。
- **在 Perplexity 上的测试**：因为 Perplexity 不能指定来源 URL，作者把来源文本以文件上传的方式喂给 Perplexity，只用了 200 条样本。Quotation Addition 在 PAWC 上 +22%（表中 24.1 到 29.1），Statistics Addition 在主观印象上 +37%（24.7 到 33.9），关键词堆砌比基线差约 10% [S1]。论文附录表格里还有一个正文没强调的数字：Cite Sources 在 Perplexity 上的主观印象是 19.0，比基线 24.7 低约 23% [S1]。

**论文自己承认的局限** [S1]

- 生成式引擎会变，方法需要跟着调整。
- 查询分布会变，GEO-bench 需要持续更新。
- 没有评估 GEO 改写会不会影响网页在搜索引擎里的排名。
- 作者推测随着上下文变长，搜索排名的影响会变小。这个推测后来被 C-SEO Bench 直接反驳（见 2.3）。

**我整理的方法论问题**（每条都有出处）

1. **被优化的网页已经在上下文里了。** 实验从 Google 前 5 条里随机选一条去改写，然后测它在回答里分到多少字。它不测「改写后能不能被检索到」。2026 年综述的原话是：这些收益「在其实验设定内成立，但以来源已经在固定上下文中为前提，既不能说明自然可发现性，也不能说明持久的流量效果」[S15]。
2. **指标衡量的是「字数份额」，不是「被选中」。** C-SEO Bench 作者指出，字数份额并不衡量 LLM 的偏好，他们用引用排名重新测，结果基本无效 [S2]。
3. **改写者和被测引擎是同一类模型。** 改写用 LLM 完成，被测引擎是 gpt-3.5-turbo，主观指标也由 GPT-3.5 打分 [S1]。
4. **Perplexity 实验不是真实检索。** 是文件上传、200 条样本 [S1]。
5. **「加统计数据」可能等于编造数据。** 论文表 4 的示例里，改写后的句子是 "with a staggering 70% increase in robotic involvement in the last decade"，没有给出来源 [S1]。2026 年 LIVE-GEO 用数值忠实度检查器核对 400 条改写，Statistics Addition 生成的 80 条描述全部被标记为数值不忠实 [S14]。

### 2.3 2024 到 2026 年的后续研究：哪些已确立，哪些没有

#### 2.3.1 「GEO 改写技巧」在更真实的设定下还有效吗

- **C-SEO Bench（Puerto 等，NeurIPS 2025 Datasets & Benchmarks）** [S2]
  - 两个任务（问答、商品推荐），各三个领域；被测引擎 gpt-4o-mini、claude-3-5-haiku、o3、o4-mini。
  - 54 个组合里只有 3 个出现统计显著的提升，而且只在零售、电子游戏领域，只来自 "LLM guidance" 和 "content improvement" 两种方法。问答任务上没有任何方法有效，Haiku 3.5 上没有任何方法有效。
  - 很多方法显著降低排名。"Statistics" 方法在 24 个设定里有 19 个让排名下降；Haiku 3.5 的商品推荐任务里 30 个组合有 26 个显著为负。
  - 把目标文档放到 LLM 上下文的前 3 位，带来的提升远大于任何 C-SEO 方法。作者结论：「传统 SEO 策略仍然关键」，C-SEO「应被视为传统 SEO 的补充而不是替代」。
  - 采用的人越多，每个人的收益越小，作者称之为「拥挤的零和游戏」。
  - 作者特别说明结论只适用于白帽方法，黑帽方法不在范围内。
- **SAGEO Arena（Kim 等，KDD 2026）**：把检索和重排加回实验后，只改正文的优化让文档进入 top-20 的比例平均降约 9%，重排后进入 top-10 降 16%，最终被引用降 6% [S65]（数字转引自 2026 综述 [S15]，未打开原文）。含义是：为了「被引用」而写的改写，可能让你更难被「检索到」。
- **LIVE-GEO（Kong 等，2026-10）**：把 80 个虚构品牌、18 类商品的 GEO 改写版做成真实上线的网页，让 ChatGPT（GPT-6）、Gemini 3.6 Thinking、Grok Expert 去读 [S14]。
  - 名为 CORE 的方法在三个引擎上的 Top-1 率最高（66.3% 到 76.3%），其他方法的相对排名在不同引擎间不一致。
  - 三个引擎对同一品牌选出同一个第一名的比例只有 48.8% 到 66.3%。
  - ChatGPT 对候选 URL 的顺序敏感：两种相反的固定顺序下，CORE 的 Top-1 率分别是 73.8% 和 93.8%。
  - 前面说过，Statistics Addition 的 80 条改写全部被标为数值不忠实。
- **AutoGEO（Wu 等，CMU，2025-10）**：让前沿 LLM 解释生成式引擎偏好什么，提炼成规则，再用规则改写或作为强化学习奖励训练小模型。作者报告在 GEO-bench 和两个新基准上有效，并保持回答效用 [S7]。这是作者自测，仍是把内容直接放进上下文的设定；SAGEO Arena 的结果显示 AutoGEO 只改正文时在真实检索里可能损失更大 [S15]。
- **竞争性 GEO 的受控实验（Vishwakarma 等，2026-05，Sprinklr）**：两份文档同时进上下文，看谁先被引用。6 个模型、252,000 次试验、18 个内容因素。最大的驱动因素是主题相关性和列表位置；明确的价格信息和较新的时间戳也稳定有帮助；完整性和信任线索帮助较小；纯格式修改几乎没影响 [S23]。
- **2026 年的批判性综述（Martinez，45 篇研究）** [S15]：
  - 「主题相关性和上下文位置」是最可复现的杠杆。
  - 通用启发式规则迁移性差；竞争会侵蚀个体收益；面向引用的改写可能损害检索。
  - 商业审计显示来源重合度低、同一问题多次运行差异大、引用与内容不忠实的问题持续存在。
  - 结论：已检索到的内容可以因果地改变它被引用或被使用的方式，但没有任何技巧显示出稳定的、纵向的、跨平台的、对自然可发现性或下游行为的因果效应。

**已确立**：在「你已经被检索到」的前提下，内容的相关性、位置、具体信息（价格、日期、数字）会影响你是否先被引用。**未确立**：任何改写技巧能让你更容易被检索到、在不同引擎间稳定有效、或带来流量。

#### 2.3.2 对抗性操纵和提示注入

这部分论文证明「能操纵」，同时也证明「这是攻击」。

- **Kumar & Lakkaraju（Harvard，2024-04）**：在商品信息页加一段优化出来的「策略文本序列」（STS），能让 LLM 把一个原本很少出现的商品推到第一推荐。实验用的是虚构的咖啡机目录 [S3]。
- **Pfrommer 等（UC Berkeley，EMNLP 2024）**：不同 LLM 对商品名、文档内容、上下文位置的重视程度差别很大；用 tree-of-attacks 越狱方法能可靠地把低排名商品往上推，攻击能迁移到 perplexity.ai [S4]。
- **Nestaas、Debenedetti、Tramèr（ETH Zürich，ICLR 2025）**：提出「偏好操纵攻击」，在网页内容或插件文档里写操纵文本，让 LLM 推荐攻击者的商品、贬低竞争对手；在 Bing 和 Perplexity 的生产环境上演示成功。所有人都有动机去攻击，但集体后果是所有人的结果变差，形成囚徒困境 [S5]。
- **基础工作**：Greshake 等 2023 年提出间接提示注入，即把指令藏在会被检索到的数据里 [S26]；PoisonedRAG（USENIX Security 2025）证明往 RAG 的知识库里注入少量恶意文本就能操纵回答 [S27]。
- **检测和防御在跟进**：GEO-Flag（2026-08）在 Google 搜索和 Gemini 检索结果的 10,095 个页面上估计 GEO 优化内容占 8.90%，2026 年修改过的页面里占 16.36% [S21]。2026 年还有 Counter-GEO-Bench（EMNLP 2026）等防御基准 [S15 所列论文]。

**结论**：隐藏指令、对抗字符串是攻击手段，学术界正在做检测，Google 的垃圾政策也覆盖操纵行为 [S28]。网站不应教这些做法，只应作为「为什么不要这样做」的背景。

#### 2.3.3 LLM 搜索引擎到底引用什么

- **来源多样性**：Zhang 等（2025-12）分析 55,936 条查询，覆盖 6 个 LLM 搜索引擎（ChatGPT、Gemini、Perplexity、Grok、Google AI Mode、Copilot）和 Google、Bing。LLM 搜索引用的域名更分散，37% 的域名只出现在 LLM 搜索里；被引用的域名普遍「更不热门」；但在可信度、政治中立、安全性上并不比传统搜索好 [S8]。特征分析显示被 LLM 搜索偏好的页面 HTML 结构更层级化、文字更易读、外链指向权威来源更多 [S8]。
- **偏好第三方「赢得媒体」**：Chen 等（多伦多大学，2025-09）对比 AI 搜索和 Google，在汽车、消费电子、软件三个品类、美国和加拿大两个地区，AI 搜索的来源以第三方评测和媒体为主。例如软件品类在加拿大，Google 的品牌官网占 53.8%，AI 搜索的第三方占 74.2%、品牌官网 25.8%、社交 0% [S6]。作者还观察到无品牌问题（如「最受欢迎的可乐」）默认给出大品牌，即「大品牌偏差」[S6]。
- **相反的数据**：Kumar（2026-06，Ranqo 平台，厂商）对 100 多个品牌、10 万多条回答的统计显示，引擎引用来源时约 78% 指向企业官网；非企业来源里 YouTube 第一，其后是 Reddit、编辑媒体、Wikipedia；「best-of」榜单文章是被引用最多的内容形式，约占 21% [S17]。Chen & Koudas 的 B2B 小厂商数据里，厂商官网约占每个引擎引用的一半 [S12]。这和 [S6] 的「压倒性偏好第三方」不一致，差异可能来自问题类型（排行榜式问题对比品牌问题）、行业和时间。这里我判断为「有争议」，写进第 5 节。
- **答案泡泡**：Huang 等（EMNLP 2026）对比 11,000 条真实查询在 vanilla GPT、SearchGPT、Perplexity、Google AI Overviews 和传统 Google 上的结果：生成式搜索有明显的来源选择偏差，Wikipedia 和长文被过度代表，被引用的社交媒体内容和负面框架的来源被明显低估；加入搜索后回答里的模糊措辞（hedging）最多减少 60% [S9]。
- **Google 生态内部**：Grossman 等（SIGIR 2026）在 11,500 条查询上发现 51.5% 触发 AI Overview；Google 搜索、AI Overview、Gemini 三者检索的来源平均 Jaccard 相似度低于 0.2；生成式引擎更可能检索 Google 自家内容；屏蔽 Google-Extended 的网站在 Gemini 里完全没被引用，在 AI Overviews 里也显著更少被检索 [S18]。注意 Google 官方文档说 Google-Extended 不影响 Google 搜索 [S33]，论文数据是相关性。
- **新鲜度偏差**：Fang 等（2025-09）给 TREC 段落人为加上发布日期，7 个模型（GPT-3.5、GPT-4、GPT-4o、LLaMA-3、Qwen-2.5）都偏好「新」段落，前 10 名的平均年份最多前移 4.78 年，两两比较时偏好最多被翻转 25%；模型越大偏差越小但都没消除 [S10]。竞争性 GEO 实验也发现较新的时间戳稳定有帮助 [S23]。
- **可验证性**：Liu、Zhang、Liang（EMNLP 2023 Findings）对 Bing Chat、NeevaAI、perplexity.ai、YouChat 做人工审计，只有 51.5% 的句子被引用完全支持，74.5% 的引用支持对应句子 [S11]。
- **用户如何看引用**：Search Arena（ICLR 2026）约 12,000 条人类偏好投票显示，用户更喜欢引用多的回答，即使引用内容并不支持对应说法；社区平台类来源更受用户偏好 [S19]。
- **品牌偏差可以被很小的事实优势打破**：Chu & Hou（2026-06）在护肤品类测试 GPT-4o-mini、Claude Sonnet、Gemini 3 Flash：规格完全相同时知名品牌 100% 被推荐，但竞争者评分高 0.1 星以内这个垄断就消失；所有品牌都用同一种 GEO 策略时，个体收益从 +0.802 降到 +0.007，不参与的品牌推荐数为零 [S22]。
- **同一问题每次答案都不同**：Schulte 等（2026-04）强调 AI 搜索的回答随运行、提问方式、时间变化，单次观察不可靠，应把可见度当作分布来测 [S20]。LIVE-GEO 和 Grossman 的数据也显示了不同引擎、多次运行之间的不一致 [S14][S18]。

#### 2.3.4 什么已经比较确定，什么还不确定

| 结论 | 状态 | 依据 |
|---|---|---|
| 检索排名（进不进上下文、排第几）是被引用的首要因素 | 较确定，多篇独立研究 | [S2][S12][S15][S23] |
| 主题相关性（标题、段落和用户问题在语义上匹配）有帮助 | 较确定 | [S12][S23][S15] |
| 具体事实（价格、日期、数字）在已被检索时有帮助 | 有受控实验支持，生产环境证据少 | [S23][S1] |
| 内容偏新更容易被选 | 有受控实验支持 | [S10][S23] |
| 关键词堆砌无效 | 确定 | [S1][S28] |
| 「加统计/引语/引用」能稳定提升 AI 可见度 | 未确立，多项复现失败 | [S2][S14][S15] |
| FAQ 块、结构化数据、摘要框能提升引用 | 跨网站比较时相关，同网站内比较时无效，可能只是好网站的特征 | [S12] |
| AI 偏好第三方媒体胜过品牌官网 | 有争议，结果依问题类型和行业而变 | [S6][S17][S12] |
| 大品牌有先天优势 | 较确定 | [S6][S12][S17][S22] |
| 被第三方页面提到对小品牌特别重要 | 有一项大样本研究支持 | [S12][S16] |
| 对抗性操纵能起作用 | 确定能起作用，也确定是攻击 | [S3][S4][S5] |

### 2.4 生成式搜索在底层是怎么工作的（面向开发者）

#### 2.4.1 一个回答是怎么生成的

把常见的生成式搜索流程写成伪代码：

```text
用户问题 q
  -> [可选] 判断要不要联网搜索（很多问题直接用模型自带知识回答）
  -> 查询改写 / fan-out：LLM 把 q 改写成 q1..qn 多个子查询
  -> 对每个 qi 调用某个搜索索引，拿回候选网页
  -> 抓取或读取缓存的页面内容，切成段落
  -> 重排：选出最相关的若干段落放进上下文（有长度限制）
  -> LLM 基于上下文写回答，并给部分句子标上引用
  -> 只有一部分被检索到的页面最终显示为引用链接
```

每一步都有公开证据：

- **Fan-out 是官方公开的机制。** Google 2025-05-20 的博客：AI Mode「使用我们的 query fan-out 技术，把你的问题拆成子话题，同时代你发出大量查询」；Deep Search 版本「可以发出数百次搜索」[S34]。Google 2026 年指南的定义：「模型生成的一组并发、相关的查询，用来请求更多信息、获取更多相关结果」，例子是把「怎么修理满是杂草的草坪」拆成「最好的草坪除草剂」「不用化学药剂除草」「如何预防草坪杂草」[S28]。Bing Webmaster Tools 的 AI Performance 报告里叫 "Grounding Queries"，即 AI 在后台生成、去实时网页检索用的较短的主题查询 [S42]。
- **Grounding（接地）就是 RAG。** Google 官方定义：检索增强生成「也被称为 grounding」，依靠核心搜索排名系统从 Google 搜索索引里取回相关、最新的网页，再基于这些页面生成回答，并显示可点击的链接 [S28]。
- **ChatGPT 会多轮检索、每次改写不同。** Jiang 等观察 ChatGPT 5.2 到 5.5 的四种设置：Instant 模式大多只检索一轮，GPT-5.4 Thinking 经常多轮检索；多次运行里被检索到次数越多的候选越可能被引用 [S13]。Chen & Koudas 发现 ChatGPT 每次回答都重新改写子查询，在 B2B 数据里 ChatGPT 检索到的页面 99% 不在 Google 前 50 [S12]。
- **从「检索到」到「被引用」还有一道筛选。** ChatGPT 在 B2B 数据里引用了它自己排第一的页面的 57.1%，排 11 到 20 名的只引用了 8.3% [S12]。
- **上下文里的位置有影响。** Lost in the Middle（TACL）显示，相关信息在长上下文开头或结尾时模型表现最好，在中间时明显变差 [S25]。C-SEO Bench 和 LIVE-GEO 都观察到位置效应 [S2][S14]。

#### 2.4.2 每个引擎从哪个索引检索

| 引擎 | 检索来源 | 证据 | 证据等级 |
|---|---|---|---|
| Google AI Overviews、AI Mode | Google 搜索索引，核心排名系统 | Google 官方指南 [S28][S30] | A |
| Gemini 应用 | Google 搜索索引做 grounding；Google-Extended 可以退出 | Google 爬虫文档 [S33] | A |
| ChatGPT search | 自己的检索，加上第三方搜索提供商，Bing 是被点名的一家 | OpenAI 帮助中心（未打开原文，见搜索摘要）[S37]；OAI-SearchBot 决定能否出现在 ChatGPT 搜索结果 [S36] | A（帮助中心未打开） |
| Perplexity | 自建索引，靠 PerplexityBot 抓取 | Perplexity 官方爬虫文档 [S40] | A |
| Claude | Brave Search（间接证据：相同引用、BraveSearchParams 参数、Brave 被列入子处理方） | TechCrunch 2025-03 [S39] | C |
| Microsoft Copilot | Bing | Bing Webmaster Tools AI Performance 报告 [S42] | C |
| 豆包、DeepSeek、Kimi、元宝、千问 | 没查清 | 只有服务商文章的说法 [S66] | D |

几个容易误解的点：

- **同一家公司的不同产品检索结果也不同。** Google 搜索、AI Overview、Gemini 的来源相似度平均低于 0.2 [S18]。
- **「用 Bing」不等于「和 Bing 排名一样」。** Ahrefs 测得 AI 助手引用与 Bing 前 10 的重合度约 10% [S48]；Chen & Koudas 测得 ChatGPT 检索结果几乎不在 Google、Bing 前列，即使对 Gemini 也是如此 [S12]。原因是子查询是模型改写过的，不是用户原话。
- **用外部工具无法完整还原 ChatGPT 的检索。** 用 Google 搜索和 OpenAI Responses API 作代理，合起来也只能找回约四分之一被引用的 URL [S13]。

#### 2.4.3 为什么「被引用」和「排名」是两回事

1. **问的不是同一个问题。** 引擎拿去搜索的是改写后的子查询，不是用户原话。所以你在原问题上排第一，不一定在任何子查询上排得靠前 [S12][S48]。
2. **只引用一部分。** 检索回来的页面只有少数被显示为引用 [S13]。
3. **趋势在拉开。** Google AI Overviews 引用来自同一查询前 10 名的比例，2025 年 7 月 Ahrefs 测得 76%，2026 年 3 月测得 38%（86.3 万关键词、400 万个被引 URL），其余大约一半在 11 到 100 名，一半在 100 名以外；100 名以外的被引页面里 18.2% 是 YouTube [S49]。BrightEdge 用另一套方法测得约 17% [S49 中引述]。
4. **对 ChatGPT 等独立助手重合更低。** 约 12%，Perplexity 最高（28.6%），ChatGPT 和 Gemini 最低 [S48]。

开发者的直观理解：传统 SEO 是在一个固定查询上竞争排名；GEO 是要在引擎自己生成的一堆你看不见的子查询上都能被检索到，然后在上下文里比别的候选更直接地回答问题。

#### 2.4.4 训练数据和实时检索：两条独立的路

| | 路径 A：模型知识（参数记忆） | 路径 B：实时检索（RAG） |
|---|---|---|
| 什么时候起作用 | 模型不联网回答时；以及联网时决定往搜索里写什么品牌名、偏好哪些网站 | 联网搜索时 |
| 怎么进入 | 训练语料抓取时你的产品被足够多的网页提到 | 回答时被搜索索引检索到 |
| 对应爬虫 | GPTBot（OpenAI 训练）[S36]、ClaudeBot（Anthropic 训练）[S38]、Google-Extended（Gemini 训练和 Gemini 应用 grounding）[S33] | OAI-SearchBot（ChatGPT 搜索）[S36]、Claude-SearchBot [S38]、PerplexityBot [S40]、Googlebot（AI Overviews/AI Mode）[S28] |
| 生效速度 | 慢，取决于下一代模型的训练和发布 | 快，被索引后即可 |
| 能否独立开关 | 能，OpenAI 文档明确说可以允许 OAI-SearchBot、同时禁止 GPTBot [S36] | 同左 |

两条路会互相影响。Chen & Koudas 的发现是 [S12]：

- ChatGPT 会把它「知道」的品牌名写进搜索子查询，偏好它「知道」的网站，并且会在没有任何支持页面的情况下直接点名品牌。在受控实验里，事实完全相同的商品只要换上品牌名，排名就会变。
- 对大品牌，排名主要存在模型记忆里：不给任何证据时，一个品牌分数就能预测 ChatGPT 75%、Gemini 92% 的两两比较结果。
- 对模型几乎不认识的小厂商，没有证据时排名不稳定（64% 和 67%），搜索把它恢复到约 80%。ChatGPT 只在 2% 到 16% 的查询里直接点名这些小厂商（大品牌是 61% 到 72%），它是从第一轮搜索结果里「学到」这些厂商名的。一个被引用的第三方页面提到某厂商，会让 ChatGPT 点名该厂商的几率提高约 39.7 倍（Gemini 约 17.7 倍），大品牌市场里只是 4.2 倍和 6.3 倍。
- 作者的总结：「页面在被搜到时被引用；品牌在被记住时也会被点名。」

另一项研究从语言和地域角度说明路径 A：对 6 个模型、1,909 条纯英文查询，中国模型（Qwen3、DeepSeek、豆包）的品牌提及率比国际模型高 30.6 个百分点（88.9% 对 58.3%）；一个中文协作平台在中国模型里被提到 65.6%，在国际模型里是 0%。作者称之为「存在缺口」：训练语料里没有你，回答里就没有你 [S24]。这篇论文的案例品牌与作者有关联的可能性我没能排除，证据等级定为 C。

### 2.5 变化有多大：流量、点击、零点击、转化

所有数字都带日期和样本量。厂商研究标「厂商」。

#### 2.5.1 使用规模

| 指标 | 数字 | 日期 | 来源 | 备注 |
|---|---|---|---|---|
| Google AI Overviews 月用户 | 超过 20 亿 | 2025-07（Alphabet Q2 2025 财报会） | [S59] | 二手报道 |
| AI Overviews / AI Mode 月用户 | 超过 25 亿 / 超过 10 亿 | 2026 年（Q2 2026 财报或 6 月投资者会，二手来源说法不一） | [S59] | 二手报道，未核实原文 |
| ChatGPT 周活 | 9 亿 | 2026-02-27 | [S60] | 二手报道 |
| 中国生成式 AI 用户 | 超过 7 亿，普及率超过 50%；76.0% 的用户用它回答问题 | 截至 2026 年上半年，CNNIC 2026-09-29 发布 | [S61] | 官方 |
| AI Overviews 带来的使用增长 | 美国、印度等市场出现 AI Overviews 的查询类型使用量增长超过 10% | 2025-05-20 | [S34] | Google 自述 |

#### 2.5.2 AI Overviews 出现的比例

数字差异极大，因为每家选的查询集合不同：

| 数字 | 样本 | 日期 | 来源 |
|---|---|---|---|
| 18% 的 Google 搜索出现 AI 摘要；1 到 2 个词的搜索只有 8%，10 个词以上 53% | 900 名美国成年人真实浏览数据，68,879 次搜索 | 2025-03 数据，2025-07-22 发布 | Pew [S43] |
| 51.5% 的代表性真实查询出现 AI Overview | 11,500 条查询 | SIGIR 2026 | Grossman 等 [S18] |
| 美国搜索约 43% | Similarweb 面板 | 2026-05 | 二手 [S57] |
| 商业关键词 88%（按搜索量加权 97.08%） | 400 个美国商业关键词 | 2026-08 | Semrush，厂商，二手 [S57] |
| 86.7% | 50 万条提示词 | 2026-04 | Peec.ai，厂商 [S58] |

结论：越长、越像提问的查询越容易出现 AI 摘要 [S43]。网站应该引用 Pew 的方法和「问题越长越容易触发」的规律，而不是挑一个最大的百分比。

#### 2.5.3 点击率影响

| 研究 | 样本 | 时间 | 结果 | 等级 |
|---|---|---|---|---|
| Pew | 900 人、68,879 次搜索 | 2025-03 | 有 AI 摘要时点击传统结果 8%，没有时 15%；点击摘要内链接仅 1%；看完结果页直接结束浏览 26% 对 16% [S43] | B |
| Ahrefs（第一版） | 30 万关键词 | 2025-04 | 第一名点击率下降 34.5% [S45] | B（厂商，已被更新） |
| Ahrefs（更新） | 30 万关键词（15 万有 AIO、15 万无 AIO 的信息类），Search Console 桌面端聚合数据 | 2023-12 对比 2025-12，2026-02-04 发布 | 第一名下降约 58%；第 2 名 -50.8%，第 10 名 -19.4%；作者强调是相关不是因果 [S44] | B（厂商） |
| Seer Interactive | 3,119 个信息类查询、42 家客户、2,510 万自然展示、110 万付费展示 | 2024-06 到 2025-09，2025-11-04 发布 | 有 AIO 的查询自然点击率从 1.76% 降到 0.61%（-61%）；没有 AIO 的也从约 2.74% 降到 1.62%；被 AIO 引用的品牌比不被引用的多 35% 自然点击、91% 付费点击，Seer 自己说无法证明因果 [S46] | B（代理商） |
| Seer 后续（SEJ 报道） | 547 万查询、53 个品牌 | 2025 Q3 到 Q4，2026-04-26 报道 | 点击率下降主要因为展示数涨得比点击快，点击本身在 10 月没降、11 月降约 25%；被引用页面的点击仍比无 AIO 结果页少约 38% [S47] | C |
| Google 官方 | 未公开样本 | 2025-08-06 | 「来自 Google 搜索的自然点击总量同比相对稳定」，「高质量点击」略有增加 [S35] | A（官方声明，有利益相关） |

Google 对 Pew 研究的回应是「方法有缺陷、查询集合不代表搜索流量」（二手报道，见 [S43] 相关报道）。这里存在真实分歧：第三方数据一致显示单个查询的点击率下降，Google 说总点击量稳定。两者可以同时成立（总查询量在增长），但我没有找到能裁决这件事的独立数据。

#### 2.5.4 零点击

- SparkToro 2026：美国 Google 搜索 68.01% 没有产生点击（2026 年 1 到 4 月，Similarweb 桌面加移动面板，不含 Google 移动 App）；英国 69.5%；同期只有 0.34% 的搜索转入 AI Mode。作者自己说和 2024 年用 Datos 数据的结果比较是「苹果和橘子」[S53]。
- Datos Q1 2026：美国零点击 22.4%，欧盟/英国 19.6%，计算口径是会话，不可直接比较 [S54]。

结论：「零点击」数字强烈依赖定义。网站应讲清口径，不要只引一个数字。

#### 2.5.5 AI 引荐流量的体量

| 研究 | 样本 | 时间 | AI 流量占总流量 | 平台份额 |
|---|---|---|---|---|
| SE Ranking（厂商） | 101,574 个网站、250 个国家和地区 | 2024 为 0.02%，2025 为 0.24%，2026 年 1 到 4 月为 0.32% | 0.32% | ChatGPT 74.78%、Gemini 11.56%、Perplexity 7.23%、Copilot 3.51%、Claude 2.62%；DeepSeek 2025-09 起接近 0 [S51] |
| Conductor 2026 基准（二手） | 13,770 个域名、33 亿会话 | 2026 | 1.08% | 未核实 [S52] |
| Kaiser & Schulze（同行评审） | 973 个电商网站 | 2024-08 到 2025-07 | ChatGPT 不到会话的 0.2%，约为 Google 自然流量的 1/200 | [S55] |

要点：AI 引荐流量 2024 到 2026 年增长了一个数量级，但绝对占比仍不到 1% 到 1.5%。Google AI Overviews 和 AI Mode 的点击在 GA 里算作 Google 自然流量，无法从 AI 引荐里分出来，这也是 SE Ranking 这类统计偏低的原因之一。Search Console 的「生成式 AI 效果报告」目前只提供展示数（impressions），按页面、设备、国家分组 [S32]。

#### 2.5.6 AI 引荐流量的转化率

| 研究 | 样本 | 结论 | 等级 |
|---|---|---|---|
| Kaiser & Schulze，Marketing Science (Frontiers) | 973 个电商网站，约 200 亿美元收入，GA 第一方数据 | ChatGPT 引荐的跳出率较好，但转化率、每会话收入低于 Google 付费和自然搜索；除付费社交外低于所有传统渠道；研究期内在稳定改善 [S55] | A |
| Visibility Labs（SEL 报道） | 94 个网站 | ChatGPT 转化 1.81%，非品牌自然搜索 1.39% [S56] | C |
| 其他厂商 | 各不相同 | 说法从高 22% 到高数倍不等，大多数无法核对原始数据 [S56] | D |

结论：「AI 流量转化率是 Google 的 N 倍」不能作为事实写进网站。比较可靠的说法是「目前流量很小，转化表现因行业和定义差异很大，唯一的同行评审电商研究发现更低」。

### 2.6 为什么这对独立开发者特别重要

**不利的一面**

1. **AI 在「发现型问题」上偏向大品牌。** 无品牌的排行榜问题默认给出市场领导者 [S6]；Ranqo 数据中首次测量时，全球知名品牌在 73% 的相关回答里出现，中型品牌 44%，小品牌 11% [S17]（厂商数据）；规格相同的产品，知名品牌 100% 被推荐 [S22]。
2. **刚发布的小产品几乎不存在于模型知识里。** 112 个 Product Hunt 2025 热门产品，按名字问时 ChatGPT（gpt-4o-mini）认得 99.4%、Perplexity 94.3%；按「今年最好的 AI 工具」这类问题问时只有 3.32% 和 8.29% 被提到，差距约 30 倍 [S16]。
3. **你看不到 AI 在搜什么。** 子查询每次改写、外部工具只能还原约四分之一的引用 [S13]，单次测量不可靠 [S20]。
4. **流量池本来就小。** AI 引荐占总流量 0.32% 到 1.08% [S51][S52]，独立开发者的时间更该先放在仍占绝大多数的传统搜索和社区上。

**有利的一面**

1. **AI 搜索引用的域名更分散，更多不热门的站。** 37% 的被引域名只出现在 LLM 搜索里 [S8]。
2. **小厂商被提到的主要途径可以靠努力获得：被第三方页面提到并被检索到。** 这在小厂商市场里把被点名几率提高约 39.7 倍 [S12]。Product Hunt 研究里，Perplexity 的可见度和引用域名数（r = +0.319）、Reddit 社区讨论（r = +0.395）正相关 [S16]。
3. **小厂商市场里，网站权威度几乎没有作用（-1.3% 每标准差），内容和问题的匹配度作用更大（标题匹配 +26.4% 每标准差）** [S12]。这说明「把用户真实会问的问题写成页面标题和段落」对小站是有效的，且不需要大站的权威。
4. **品牌垄断能被很小的事实优势打破。** 评分高 0.1 星以内就能打破知名品牌的推荐垄断 [S22]。具体、可比较的事实（价格、版本、更新时间、评分）对小产品有用 [S23]。
5. **同时做中文和全球的产品要分别看待。** 中国模型和国际模型对同一品牌的提及率可以差很多 [S24]；Chen 等发现 GPT 在不同语言下会换一整套来源网站，Claude 跨语言更稳定 [S6]。

**一句话**：对独立开发者，GEO 的主要工作不是改写自己的网页，而是让自己被检索到（基础 SEO）、被别人提到（社区、评测、榜单、GitHub、Product Hunt 之类的第三方页面），并且持续地、重复地测量。

---

## 3. 实战清单

这一节只放和「基础与测量」有关的步骤。爬虫配置细节、结构化数据、各平台提交流程留给其他调研稿。

### 3.1 先确认「检索这条路」是通的

**第 1 步：检查 robots.txt 没有误伤检索爬虫。**

检索用和训练用的爬虫可以分开处理。下面是一个「允许被 AI 搜索引用、但不允许拿去训练」的示例，按需取舍：

```txt
# 检索 / 搜索（决定能不能出现在 AI 搜索回答里）
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# 训练（决定能不能进入下一代模型的知识）
# 小产品通常希望被模型记住，所以默认建议允许；这里演示如何禁止
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

# Google-Extended 同时控制 Gemini 训练和 Gemini 应用的 grounding，不影响 Google 搜索
User-agent: Google-Extended
Disallow: /
```

依据：OpenAI 说允许 OAI-SearchBot、禁止 GPTBot 是独立设置 [S36]；Anthropic 三个爬虫要分别写规则 [S38]；Perplexity 建议允许 PerplexityBot [S40]；Google-Extended 同时影响 Gemini 应用的 grounding [S33]，且研究发现屏蔽它的网站在 Gemini 里零引用 [S18]。

**我的判断**：独立开发者的问题是「AI 不认识你」，所以默认应允许训练爬虫。这是建议，不是论文结论。

验证命令：

```bash
# 看 robots.txt 实际返回什么
curl -s https://你的域名/robots.txt

# 用各家 UA 请求首页，确认没有被 WAF/Cloudflare 拦成 403
for ua in "OAI-SearchBot/1.4" "GPTBot/1.4" "Claude-SearchBot" "PerplexityBot/1.0"; do
  printf "%s -> " "$ua"
  curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; $ua)" https://你的域名/
done
```

注意：伪造 UA 只能测出你的 WAF 是否按 UA 拦截，不能代表真实爬虫的 IP 是否被放行。Perplexity 文档给了 Cloudflare WAF 按 UA 加 IP 放行的规则写法，并提醒 Bot Fight Mode 无法用 WAF 自定义规则跳过 [S40]。

**第 2 步：确认 Google 的生成式 AI 开关没被关掉。**

Search Console → 设置（Settings）→ Search generative AI。三个选项：Include（默认）、Exclude、Inherit from parent。选 Exclude 会让站点内容不出现在 AI Overviews、AI Mode 和 Discover 的生成式功能里，也不会用于 grounding；改动一般 1 到 2 天生效 [S31]。Google 2026 年指南把「站点在 Search Console 中被包含在 Search generative AI features 中」列为出现在这些功能里的条件之一 [S28]。

**第 3 步：确认页面能出现在 Google 搜索里并带摘要。**

Google 的要求是「被索引并且有资格带摘要显示」，没有额外技术要求 [S28][S30]。所以检查：页面没有 `noindex`、没有 `nosnippet`；`max-snippet` 不要设成 0。用 Search Console 的网址检查工具确认已编入索引。

**第 4 步：在 Bing Webmaster Tools 里验证站点。**

Copilot 和部分 AI 合作方的引用数据出现在 Bing Webmaster Tools 的 AI Performance 报告里，里面能看到 Grounding Queries，即 AI 在后台搜了哪些词 [S42]。这是目前少数能「看到 fan-out 子查询」的官方窗口。没有点击数据 [S42]。

### 3.2 建立测量（先测，再改）

**第 5 步：在 GA4 里把 AI 引荐单独成渠道。**

GA4 → 管理 → 数据显示 → 渠道组 → 新建渠道 "AI Assistants"，条件「会话来源」匹配正则：

```regex
chatgpt\.com|chat\.openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|chat\.deepseek\.com|doubao\.com|kimi\.(com|moonshot\.cn)|yuanbao\.tencent\.com|chat\.qwen\.ai|grok\.com
```

把这个渠道排在「Referral」之前。局限：Google AI Overviews 和 AI Mode 的点击会被记为 google / organic，这里看不到 [S32]。域名清单是我整理的，需要你在自己的 GA 数据里核对实际出现的来源。

**第 6 步：看 Search Console 的生成式 AI 效果报告。**

Search Console → 效果 → Generative AI performance。能看 AI Overviews 和 AI Mode 里你的展示数随时间的变化、哪些页面展示最多、按设备和国家分布。展示不够多时报告不会出现 [S32]。

**第 7 步：用固定问题集重复测量，而不是手动问一次。**

研究一致显示单次结果不可靠 [S20][S14][S13]。最低配置：

1. 写 20 到 50 个真实用户会问的问题，分三类：直接问你的产品名、问你的品类（「最好的 xx 工具」）、问你解决的具体问题。
2. 每个问题每个平台跑至少 5 次，记录是否提到你、是否引用你的网址、引用了哪些其他网址。
3. 每周或每月重复，把「提及率」当成一个分布看。

下面是一个用 OpenAI Responses API 的最小脚本示例。API 字段名会变，运行前对照 OpenAI 当前文档确认 `web_search` 工具和 `url_citation` 注释的格式：

```python
# geo_probe.py  用法: python geo_probe.py questions.txt "你的产品名" 你的域名
import sys, json, time
from openai import OpenAI

client = OpenAI()
questions = [q.strip() for q in open(sys.argv[1], encoding="utf-8") if q.strip()]
brand, domain = sys.argv[2].lower(), sys.argv[3].lower()
RUNS = 5

rows = []
for q in questions:
    for run in range(RUNS):
        resp = client.responses.create(
            model="gpt-4.1-mini",
            tools=[{"type": "web_search"}],
            input=q,
        )
        text, urls = "", []
        for item in resp.output:
            if item.type == "message":
                for part in item.content:
                    if part.type == "output_text":
                        text += part.text
                        urls += [a.url for a in part.annotations if a.type == "url_citation"]
        rows.append({
            "q": q, "run": run,
            "mentioned": brand in text.lower(),
            "cited": any(domain in u.lower() for u in urls),
            "urls": urls,
        })
        time.sleep(1)

with open("geo_probe_result.jsonl", "a", encoding="utf-8") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

for q in questions:
    rs = [r for r in rows if r["q"] == q]
    print(f"{sum(r['mentioned'] for r in rs)}/{len(rs)} 提及  {sum(r['cited'] for r in rs)}/{len(rs)} 引用  {q}")
```

注意：API 的结果和 ChatGPT 网页版不完全一致。Jiang 等发现 Responses API 的引用和 ChatGPT Web 比 Google 搜索更接近，但两者合起来也只能还原约四分之一的引用 URL [S13]。所以脚本适合看趋势和竞品，不适合当成「ChatGPT 网页版的真实结果」。

**第 8 步：分开测「模型知识」和「检索」。**

同一组问题跑两遍：一遍关掉联网（不传 `tools`），一遍打开联网。不联网时就提到你，说明你在模型知识里；只有联网才提到你，说明你只靠检索；两遍都不提到，就要先解决被检索和被第三方提到的问题。这个方法来自 Chen & Koudas「不带搜索探测模型已知内容」的思路 [S12]。

**第 9 步：列出 AI 引用的第三方页面，找你没出现的地方。**

把第 7 步结果里所有被引用的 URL 按域名汇总。出现频率最高的第三方页面（榜单、评测、对比文章、Reddit 帖子、YouTube 视频、GitHub awesome 列表）就是你最该争取被提到的地方。依据：小厂商被点名主要靠被引用的第三方页面提到它 [S12]；榜单文章是最常被引用的内容形式之一 [S17]；Perplexity 可见度和 Reddit 讨论、引用域名数相关 [S16]。

### 3.3 内容层面：证据支持的少数几件事

**第 10 步：让页面标题和段落直接对应用户会问的问题。** 这是同一网站内比较时唯一稳定有效的内容因素 [S12]，也和「主题相关性是最大驱动」一致 [S23][S15]。做法：把第 7 步的问题清单逐条对应到具体页面，标题用用户的说法写。

**第 11 步：写具体、可核对的事实，并标上更新时间。** 价格、版本号、支持的平台、发布日期、真实测试数据。依据：价格信息和较新的时间戳在受控实验里稳定有帮助 [S23]；LLM 有新鲜度偏好 [S10]。不要编造数字：LIVE-GEO 发现「加统计数据」的改写全部数值不忠实 [S14]，C-SEO Bench 里 Statistics 方法多数情况下降低排名 [S2]。

**第 12 步：写「非大路货」内容。** Google 指南把 non-commodity content（第一手经验、独特视角）列为对生成式 AI 搜索长期影响最大的因素，举例是「第一次买房的 7 个建议」属于大路货 [S28]。对开发者来说就是：写你自己踩过的坑、真实的性能数据、和竞品的具体差异。

**第 13 步：不要做的事。** 不要为 fan-out 的每个变体批量生成页面，Google 明确说这违反 scaled content abuse 政策 [S28]；不要写隐藏指令或对抗文本 [S5][S26]；不要买「虚假提及」，Google 说寻求不真实的提及没有看起来那么有用 [S28]。

### 3.4 怎么检查有没有生效

| 检查项 | 在哪看 | 预期 |
|---|---|---|
| 检索爬虫能访问 | 服务器日志里搜 OAI-SearchBot、PerplexityBot、Claude-SearchBot | 有请求、返回 200 |
| Google 生成式功能展示 | Search Console → Generative AI performance | 有展示且呈上升趋势 [S32] |
| Copilot 引用 | Bing Webmaster Tools → AI Performance | 有引用和 grounding queries [S42] |
| AI 引荐流量 | GA4 自建 "AI Assistants" 渠道 | 有会话 |
| 提及率和引用率 | 第 7 步脚本的 jsonl | 按问题、按平台的提及率分布随时间变化 |

---

## 4. 结合 AI 怎么做

这一方向里适合交给 Claude、ChatGPT 的工作是：生成测量问题集、分析测量结果、对照证据审查内容、找第三方曝光机会。不适合交给 AI 的是：编造统计数据、批量生成相似页面、写操纵性文本（理由见第 2.3 节）。

### 4.1 生成测量用的问题集

```text
我做了一个产品：<一句话描述，目标用户，主要功能，价格>。
竞品有：<竞品 A、竞品 B>。
请模拟真实用户在 ChatGPT、Perplexity、豆包里会怎么提问，生成 40 个问题，分三组：
1. 直接带产品名的问题（10 个）
2. 只提品类、不提任何品牌的问题，比如「最好的 xx 工具」「xx 有什么推荐」（15 个）
3. 描述具体问题或场景、但不知道有什么工具能解决的问题（15 个）
要求：口语化，长度不一，包含 10 个中文问题和 30 个英文问题；不要在第 2、3 组里出现我的产品名。
输出为纯文本，每行一个问题。
```

### 4.2 模拟 fan-out，检查你的页面覆盖了哪些子查询

```text
Google 公开说 AI Mode 会把一个问题拆成多个并发的相关子查询（query fan-out），例子是把「怎么修理满是杂草的草坪」拆成「最好的草坪除草剂」「不用化学药剂除草」「如何预防草坪杂草」。
请对下面这个用户问题做同样的拆解，给出 8 到 12 个可能的子查询：
<问题>
然后逐条判断我网站下面这些页面的标题和小标题能否直接回答该子查询，输出表格：子查询 | 最匹配的页面 | 匹配程度（直接回答 / 部分 / 没有） | 缺什么信息。
我的页面清单：
<页面 URL + 标题 + 小标题>
注意：你的拆解只是推测，不代表任何引擎的真实子查询，请在结果末尾注明这一点。
```

使用提醒：Google 明确说不要为每个 fan-out 变体单独做页面 [S28]。这个提示词的用途是找现有页面缺什么信息，不是批量生成新页面。

### 4.3 分析重复测量结果

```text
附件是我用同一组问题在 ChatGPT API 上每题跑 5 次的结果（jsonl，字段：q、run、mentioned、cited、urls）。
请：
1. 按问题算提及率和引用率，列出提及率为 0 的问题
2. 汇总所有被引用 URL 的域名，按出现次数排序，标出哪些是第三方评测、榜单、论坛、视频、竞品官网
3. 找出被引用最多、但没有提到我产品的第三方页面前 10 个
4. 指出哪些问题的结果在 5 次之间波动大（有时提到有时不提）
只根据数据下结论，不要推测原因；数据不足以下结论的地方直接说不足。
```

### 4.4 对照证据审查一篇页面

```text
请按下面的标准审查这篇页面，每条给出「符合 / 不符合 / 不适用」和具体修改建议：
1. 标题和各级小标题是否用用户实际会问的说法（研究显示这是同站内唯一稳定有效的内容因素）
2. 是否包含具体可核对的事实：价格、版本、支持平台、更新时间、实测数据
3. 所有数字是否有来源或说明测量方法；没有来源的数字请列出来让我核实，不要替我补数字
4. 是否有第一手经验或独特视角，还是只是重述常识
5. 是否有关键词堆砌或为 AI 写的不自然句子
页面正文：
<粘贴>
```

第 3 条要求 AI 不要补数字，是因为研究发现 LLM 做「加统计数据」改写时会编造数字 [S14][S1]。

### 4.5 找第三方曝光机会

```text
我的产品：<描述>。目标市场：中文和英文。
请列出这个品类里，AI 搜索可能会引用的第三方页面类型和具体去处，分中文和英文两栏：
- 榜单和对比文章（例如 "best xx tools 2026"）
- 社区（Reddit 具体子版块、V2EX、少数派、知乎话题等）
- 开源和开发者平台（GitHub awesome 列表、Product Hunt、Hacker News）
- 视频
对每一项说明：独立开发者能用什么正当方式被收录或被提到（提交、投稿、发帖分享真实经验、联系作者提供测试账号），以及哪些做法会被视为垃圾行为。
不要编造具体网址；不确定的写「需要搜索确认」。
```

---

## 5. 误区和争议

| 说法 | 实际情况 | 出处 |
|---|---|---|
| 「GEO 能让可见度提升 40%」 | 这是 2023 年在 gpt-3.5-turbo、已在上下文的前提、字数份额指标下测的；更真实的设定下多数方法无效甚至有害 | [S1][S2][S15] |
| 「多加统计数据和引语就能被 AI 引用」 | C-SEO Bench 里 Statistics 方法 24 个设定有 19 个降低排名；LLM 改写的统计数据全部被判为不忠实 | [S2][S14] |
| 「SEO 已死，要做 GEO 替代 SEO」 | 检索排名是被引用的主导因素；Google 说为 AI 搜索优化仍然是 SEO | [S2][S12][S28] |
| 「Google 排第一就会被 AI 引用」 | AI Overviews 引用来自前 10 的比例约 38%；独立 AI 助手约 12% | [S49][S48] |
| 「要做 llms.txt 才能出现在 AI 搜索里」 | Google 明确说 Google 搜索不使用 llms.txt，做了不帮也不害；其他平台是否使用不在本稿范围 | [S28] |
| 「要把内容切成小块方便 AI 理解」 | Google 明确说不需要；Danny Sullivan 2026-01 也公开反对（二手报道） | [S28] |
| 「要加专门的 schema 才能进 AI Overviews」 | Google 说不需要特别的 schema；FAQ 块、结构化数据在同网站内比较时没有效果 | [S28][S12] |
| 「AI 引荐流量转化率是 Google 的 N 倍」 | 唯一的同行评审电商研究发现 ChatGPT 引荐转化更低；厂商数据互相矛盾 | [S55][S56] |
| 「AI 偏爱第三方媒体，不看品牌官网」 | 有争议：一项研究在排行榜式问题上发现第三方占绝对多数，另一项厂商数据发现约 78% 引用指向企业官网，B2B 小厂商官网约占一半 | [S6][S17][S12] |
| 「问一次 ChatGPT 就知道自己的 AI 排名」 | 回答随运行、措辞、时间变化，要重复测量 | [S20][S14] |
| 「第三方工具能看到 Google AI 的内部数据」 | Google 说没有任何第三方工具能访问其内部排名或 AI 系统 | [S28] |
| 「在网页里藏指令让 AI 推荐自己」 | 学术上证明能起作用，但属于攻击；有检测研究在跟进；违背 Google 政策 | [S3][S4][S5][S21] |
| 「AI 搜索流量已经超过 X% 的网站流量」（10% 以上的说法） | 大样本研究是 0.32% 到 1.08% | [S51][S52] |

---

## 6. 还没查清的问题

1. **原始论文早期版本的作者单位。** v3 署名是 IIT Delhi、Princeton 和两位 Independent。任务里提到的 Georgia Tech 和 Allen AI 是流传说法，我没能解析 v1 PDF 核对。
2. **「GEO」「AEO」哪个词在 2026 年搜索量更大。** 没有拿到 Google Trends 的直接数据；行业文章说法互相矛盾。
3. **ChatGPT search 在 2026 年具体用哪些第三方搜索提供商。** OpenAI 帮助中心点名 Bing，Semrush 称有时用 Google；我没能打开帮助中心原文确认现行措辞。
4. **Claude 网页搜索是否仍用 Brave。** 只有 2025-03 的间接证据。
5. **豆包、DeepSeek、Kimi、元宝、千问各自从哪个索引检索，偏好什么来源。** 只找到服务商的营销文章（D 级），没有官方文档或大样本研究。这一块需要专门的中文调研。
6. **Alphabet 2026 年 AI Overviews 和 AI Mode 用户数的原始出处。** 只有二手报道，日期说法不一。
7. **Google 「自然点击总量稳定」和第三方「点击率大降」之间谁对。** 没有找到可以裁决的独立数据。
8. **进入模型训练数据需要多久、能否被影响。** 找到了「训练数据决定品牌是否存在」的证据 [S12][S24]，但没有找到「发布内容后多久进入模型知识」的可靠测量。
9. **AI 引荐流量的转化率。** 证据互相矛盾，非电商（SaaS、工具、插件）领域没有同行评审研究。
10. **屏蔽 Google-Extended 是否影响 AI Overviews。** Google 文档说不影响 Google 搜索 [S33]，SIGIR 2026 论文观察到屏蔽站点在 AI Overviews 里显著更少被检索 [S18]，是相关性，因果不明。
11. **Ahrefs 2026 年 6 月「第一名点击率降 68.8%」、法国「23.1%」等后续数字。** 只在搜索摘要里看到，没打开原文。
12. **ChatGPT 是否在外链上自动加 `utm_source=chatgpt.com`。** 本次没有核实，GA 设置时需要自己在数据里确认。

---

## 7. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | GEO: Generative Engine Optimization | Aggarwal 等（Princeton、IIT Delhi），KDD 2024 | v1 2023-11-16，v3 2024-06-28 | https://arxiv.org/abs/2311.09735 | 论文 | A | 提出 GEO 和 GEO-bench；加引语 PAWC +41%，关键词堆砌 -8%；实验以来源已在上下文为前提 |
| S2 | C-SEO Bench: Does Conversational SEO Work? | Puerto、Gubri、Green、Oh、Yun，NeurIPS 2025 D&B | 2025-06-06，v3 2025-10-20 | https://arxiv.org/abs/2506.11097 | 论文 | A | 54 个组合只有 3 个显著有效；上下文位置的影响远大于改写；采用者越多收益越小 |
| S3 | Manipulating Large Language Models to Increase Product Visibility | Kumar、Lakkaraju（Harvard） | 2024-04-11 | https://arxiv.org/abs/2404.07981 | 预印本，有代码 | B | 策略文本序列能把商品推到 LLM 第一推荐 |
| S4 | Ranking Manipulation for Conversational Search Engines | Pfrommer 等（UC Berkeley），EMNLP 2024 | 2024-06-05 | https://arxiv.org/abs/2406.03589 | 论文 | A | 越狱式注入能提升商品排名并迁移到 perplexity.ai |
| S5 | Adversarial Search Engine Optimization for Large Language Models | Nestaas、Debenedetti、Tramèr（ETH），ICLR 2025 | 2024-06-26 | https://arxiv.org/abs/2406.18382 | 论文 | A | 偏好操纵攻击在 Bing、Perplexity 上成功；形成囚徒困境 |
| S6 | Generative Engine Optimization: How to Dominate AI Search | Chen、Wang、Chen、Koudas（多伦多大学） | 2025-09-10 | https://arxiv.org/abs/2509.08919 | 预印本 | B | AI 搜索在排行榜式问题上偏向第三方媒体；大品牌偏差；跨语言来源差异 |
| S7 | What Generative Search Engines Like and How to Optimize Web Content Cooperatively (AutoGEO) | Wu、Zhong、Kim、Xiong（CMU） | 2025-10-13 | https://arxiv.org/abs/2510.11438 | 预印本，有代码 | B | 从引擎偏好中自动学规则并改写；作者自测有效 |
| S8 | Source Coverage and Citation Bias in LLM-based vs. Traditional Search Engines | Zhang 等 | 2025-12-10 | https://arxiv.org/abs/2512.09483 | 预印本，55,936 条查询 | B | LLM 搜索引用更分散、更不热门；37% 域名独有；可信度不优于传统搜索 |
| S9 | Answer Bubbles: Information Exposure in AI-Mediated Search | Huang 等，EMNLP 2026 | 2026-03-17 | https://arxiv.org/abs/2603.16138 | 论文，11,000 条查询 | A | 生成式搜索有来源选择偏差，Wikipedia 和长文过度代表，社交和负面来源被低估 |
| S10 | Do Large Language Models Favor Recent Content? | Fang 等（早稻田） | 2025-09-14 | https://arxiv.org/abs/2509.11353 | 预印本 | B | 7 个模型都偏好新日期段落，前 10 平均年份最多前移 4.78 年 |
| S11 | Evaluating Verifiability in Generative Search Engines | Liu、Zhang、Liang（Stanford），EMNLP 2023 Findings | 2023-04-19 | https://arxiv.org/abs/2304.09848 | 论文 | A | 只有 51.5% 的句子被引用完全支持 |
| S12 | What Drives AI Citations? Content, Retrieval and Model Knowledge in GEO | Chen、Koudas | 2026-10-10 | https://arxiv.org/abs/2610.15033 | 预印本，158,099 条回答、468,037 条引用 | B | 检索解释 32% 对页面属性 2.8%；大品牌靠记忆，小厂商靠第三方页面（×39.7） |
| S13 | Understanding ChatGPT Citations: Evidence from Production Web Search Across Model Generations | Jiang 等 | 2026-10-11 | https://arxiv.org/abs/2610.15382 | 预印本 | B | Thinking 模式多轮检索；外部代理只能还原约四分之一引用 URL |
| S14 | Do GEO Gains Survive the Live Web? (LIVE-GEO) | Kong 等 | 2026-10-31 | https://arxiv.org/abs/2611.01126 | 预印本 | B | 真实上线网页测试；引擎间结果不一致；统计数据改写全部数值不忠实 |
| S15 | Optimizing Visibility in Generative Engines: A Critical Survey of GEO (2023-2026) | Martinez | 2026-07-15 | https://arxiv.org/abs/2607.14035 | 综述，45 篇研究 | B | 没有技巧被证明能稳定、跨平台提升可发现性；相关性和位置最可复现 |
| S16 | The Discovery Gap: How Product Hunt Startups Vanish in LLM Organic Discovery Queries | Sharma（IIT 硕士论文） | 2026-01-01 | https://arxiv.org/abs/2601.00912 | 预印本，112 个产品、2,240 次查询 | B | 按名问认得 99.4%，按品类问只有 3.32%；GEO 评分无关，引用域名和 Reddit 相关 |
| S17 | Generative Engine Optimization at Scale: Measuring Brand Visibility Across AI Search Engines | Kumar（Ranqo） | 2026-06-18 | https://arxiv.org/abs/2606.20065 | 预印本，厂商数据，10 万多条回答 | B（利益相关） | 品牌知名度阶梯 73%/44%/11%；约 78% 引用指向企业官网；榜单文章占约 21% |
| S18 | How Generative AI Disrupts Search: An Empirical Study of Google Search, Gemini, and AI Overviews | Grossman 等，SIGIR 2026 | 2026-04-30 | https://arxiv.org/abs/2604.27790 | 论文 | A | 51.5% 查询有 AIO；三者来源相似度低于 0.2；屏蔽 Google-Extended 的站在 Gemini 零引用 |
| S19 | Search Arena: Analyzing Search-Augmented LLMs | Miroyan 等（UC Berkeley），ICLR 2026 | 2025-06-05 | https://arxiv.org/abs/2506.05334 | 论文 | A | 用户偏好引用多的回答，即使引用不支持说法 |
| S20 | Don't Measure Once: Measuring Visibility in AI Search (GEO) | Schulte、Bleeker、Kaufmann | 2026-04-08 | https://arxiv.org/abs/2604.07585 | 预印本 | C | AI 搜索结果随运行变化，可见度应按分布测量 |
| S21 | GEO-Flag: Detecting and Measuring GEO-Optimized Web Content | Chu 等（CISPA） | 2026-08-17 | https://arxiv.org/abs/2608.16824 | 预印本 | B | 10,095 个页面中 GEO 优化内容约 8.90%，2026 年修改页面中 16.36% |
| S22 | Incumbent Advantage: Brand Bias and Cognitive Manipulation Dynamics in LLM Recommendation Systems | Chu、Hou | 2026-06-16 | https://arxiv.org/abs/2606.17443 | 预印本 | B | 规格相同时知名品牌 100% 被推荐，评分高 0.1 星即可打破 |
| S23 | What Gets Cited: Competitive GEO in AI Answer Engines | Vishwakarma 等（Sprinklr） | 2026-05-25 | https://arxiv.org/abs/2605.25517 | 预印本，252,000 次试验 | B | 相关性和位置最重要；价格和新时间戳有帮助；纯格式几乎无效 |
| S24 | Cultural Encoding in Large Language Models: The Existence Gap in AI-Mediated Brand Discovery | Huang、Situ、Ye | 2025-12-30 | https://arxiv.org/abs/2601.00869 | 预印本，案例研究 | C | 中国模型品牌提及率比国际模型高 30.6 个百分点；训练语料没有就不存在 |
| S25 | Lost in the Middle: How Language Models Use Long Contexts | Liu 等，TACL | 2023-07-06 | https://arxiv.org/abs/2307.03172 | 论文 | A | 相关信息在上下文中间时模型表现最差 |
| S26 | Not what you've signed up for: Indirect Prompt Injection | Greshake 等 | 2023-02-23 | https://arxiv.org/abs/2302.12173 | 论文 | A | 把指令藏在会被检索的数据里可以操纵 LLM 应用 |
| S27 | PoisonedRAG: Knowledge Corruption Attacks to RAG | Zou 等，USENIX Security 2025 | 2024-02-12 | https://arxiv.org/abs/2402.07867 | 论文 | A | 少量恶意文本即可操纵 RAG 回答 |
| S28 | Optimizing your website for generative AI features on Google Search | Google Search Central | 2026-05 发布，2026-07-10 更新 | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide | 官方文档 | A | 「仍然是 SEO」；定义 RAG 和 fan-out；不需要 llms.txt、切块、特殊 schema |
| S29 | A new resource for optimizing for generative AI in Google Search | Google Search Central Blog | 2026-05-15 | https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing | 官方博客（未打开原文） | A | 发布上述指南 |
| S30 | AI features and your website | Google Search Central | 未见更新日期 | https://developers.google.com/search/docs/appearance/ai-features | 官方文档 | A | 出现在 AI 功能里只需被索引并可带摘要；流量计入 Web 搜索类型 |
| S31 | Search generative AI control | Search Console 帮助 | 2026 | https://support.google.com/webmasters/answer/16908024 | 官方文档 | A | 可在 Search Console 设置中包含或排除站点于 AI Overviews、AI Mode、Discover 生成式功能 |
| S32 | Generative AI performance report (Search) | Search Console 帮助 | 2026 | https://support.google.com/webmasters/answer/16984139 | 官方文档 | A | 报告 AI Overviews 和 AI Mode 的展示数，按页面、设备、国家 |
| S33 | Google's common crawlers（Google-Extended 部分） | Google | 2026-10-30 更新 | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | 官方文档 | A | Google-Extended 控制 Gemini 训练和 Gemini 应用 grounding，不影响 Google 搜索 |
| S34 | AI in Search: Going beyond information to intelligence | Google（Elizabeth Reid） | 2025-05-20 | https://blog.google/products/search/google-search-ai-mode-update/ | 官方博客 | A | AI Mode 用 query fan-out；Deep Search 可发出数百次搜索 |
| S35 | AI in Search is driving more queries and higher quality clicks | Google（Liz Reid） | 2025-08-06 | https://blog.google/products/search/ai-search-driving-more-queries-higher-quality-clicks/ | 官方博客 | A（利益相关） | Google 称自然点击总量同比相对稳定 |
| S36 | Overview of OpenAI Crawlers | OpenAI | 2026（页面未标日期） | https://developers.openai.com/api/docs/bots | 官方文档 | A | OAI-SearchBot 管搜索，GPTBot 管训练，可独立设置；ChatGPT-User 为用户触发 |
| S37 | ChatGPT search（帮助中心） | OpenAI | 未核实 | https://help.openai.com/en/articles/9237897-chatgpt-search | 官方文档（未打开原文） | A | 搜索会与第三方提供商合作，Bing 被点名 |
| S38 | Does Anthropic crawl data from the web, and how can site owners block the crawler? | Anthropic | 未核实 | https://support.claude.com/en/articles/8896518 | 官方文档（未打开原文） | A | ClaudeBot 训练、Claude-SearchBot 搜索索引、Claude-User 用户触发，需分别设置 |
| S39 | Anthropic appears to be using Brave to power web search for its Claude chatbot | TechCrunch | 2025-03-21 | https://techcrunch.com/2025/03/21/anthropic-appears-to-be-using-brave-to-power-web-searches-for-its-claude-chatbot/ | 新闻 | C | Claude 搜索与 Brave 结果相同、有 BraveSearchParams 参数 |
| S40 | Perplexity Crawlers | Perplexity | 2026（页面未标日期） | https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md | 官方文档 | A | PerplexityBot 用于搜索结果、不用于训练；Perplexity-User 为用户触发；Cloudflare WAF 放行写法 |
| S41 | From discovery to influence: a guide to AEO and GEO | Microsoft Advertising | 2026-01-06 | https://about.ads.microsoft.com/en/blog/post/january-2026/from-discovery-to-influence-a-guide-to-geo | 官方指南（只看了二手报道） | A | 微软官方使用 AEO 和 GEO 两个词，面向零售 |
| S42 | Bing Webmaster Tools testing new AI Performance report | Search Engine Land 等 | 2026-01 到 2026-02 | https://searchengineland.com/bing-webmaster-tools-testing-new-ai-performance-report-468039 | 行业新闻（未打开原文） | C | 报告展示 Copilot 引用和 grounding queries，无点击数据 |
| S43 | Google users are less likely to click on links when an AI summary appears in the results | Pew Research Center | 2025-07-22 | https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/ | 大样本研究，900 人、68,879 次搜索 | B | 有 AI 摘要点击 8% 对 15%；摘要内链接点击 1%；18% 搜索出现摘要 |
| S44 | Update: AI Overviews Reduce Clicks by 58% | Ahrefs（Ryan Law） | 2026-02-04 | https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/ | 厂商研究，30 万关键词 | B（利益相关） | 第一名点击率相对预测值低约 58%，相关不等于因果 |
| S45 | AI Overviews Reduce Clicks by 34.5% | Ahrefs | 2025-04 | https://ahrefs.com/blog/ai-overviews-reduce-clicks/ | 厂商研究，30 万关键词 | B（已被 S44 更新） | 第一版结果 34.5% |
| S46 | AIO Impact on Google CTR: September 2025 Update | Seer Interactive | 2025-11-04 | https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-september-2025-update | 代理商研究，3,119 查询、42 家客户 | B（利益相关） | 有 AIO 自然点击率 1.76% 到 0.61%；被引用品牌点击更多但无法证明因果 |
| S47 | AI Overview CTR Fell 61% But Clicks Didn't Collapse | Search Engine Journal（Matt G. Southern） | 2026-04-26 | https://www.searchenginejournal.com/ai-overview-ctr-fell-61-but-clicks-didnt-collapse/572993/ | 行业新闻，转述 Seer 547 万查询数据 | C | 点击率下降主要来自展示数上升 |
| S48 | Only 12% of AI Cited URLs Rank in Google's Top 10 for the Original Prompt | Ahrefs | 2025-08-11 | https://ahrefs.com/blog/ai-search-overlap/ | 厂商研究，15,000 条长尾查询（未打开原文） | B（利益相关） | AI 助手引用与 Google 前 10 重合约 12%，Perplexity 28.6% |
| S49 | Update: 38% of AI Overview Citations Pull From The Top 10 | Ahrefs | 2026-03-02 | https://ahrefs.com/blog/ai-overview-citations-top-10/ | 厂商研究，86.3 万关键词、400 万 URL（未打开原文） | B（利益相关） | AIO 引用来自前 10 的比例从 76% 降到 38% |
| S50 | An Analysis of AI Overview Brand Visibility Factors (75K Brands Studied) | Ahrefs | 2025-05-26 | https://ahrefs.com/blog/ai-overview-brand-correlation/ | 厂商研究，75,000 品牌（未打开原文） | B（利益相关） | 品牌网络提及与 AIO 提及相关系数 0.664，反向链接 0.218 |
| S51 | AI traffic grew 16x from 2024 to 2026 | SE Ranking | 2026-06-18 | https://seranking.com/blog/ai-traffic-research-study/ | 厂商研究，101,574 个网站 | B（利益相关） | AI 流量占比 0.02%、0.24%、0.32%；ChatGPT 占 AI 引荐 74.78% |
| S52 | Conductor AEO/GEO benchmarks: AI referrals about one percent | Remote Work Europe（转述 Conductor） | 2026 | https://remoteworkeurope.eu/news/2026/conductor-aeo-geo-benchmarks-ai-referrals-one-percent | 二手报道 | C | 13,770 个域名、33 亿会话，AI 引荐占 1.08% |
| S53 | In 2026, Less than One Third of Google Searches Still Send a Click | SparkToro | 2026 | https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/ | 大样本研究，Similarweb 面板（未打开原文） | B | 美国零点击 68.01%，英国 69.5%，口径与 2024 年不同 |
| S54 | AI still under 2% but growing: Datos Q1 2026 State of Search | PPC Land（转述 Datos） | 2026 | https://ppc.land/ai-still-under-2-but-growing-datos-q1-2026-state-of-search-report/ | 二手报道 | C | 按会话口径美国零点击 22.4% |
| S55 | ChatGPT Referrals to E-Commerce Websites: How Do LLMs Compare Against Traditional Channels? | Kaiser、Schulze，Marketing Science (Frontiers) | 2025 | https://pubsonline.informs.org/doi/full/10.1287/mksc.2025.0489 | 同行评审论文，973 个电商网站（原文被拦，靠 SEL 等报道核对） | A | ChatGPT 引荐转化率和每会话收入低于 Google 搜索 |
| S56 | ChatGPT vs non-branded organic search conversions | Search Engine Land（转述 Visibility Labs） | 2025-2026 | https://searchengineland.com/chatgpt-vs-non-branded-organic-search-conversions-470321 | 二手报道，94 个网站 | C | ChatGPT 转化 1.81% 对非品牌自然 1.39%，与 S55 相反 |
| S57 | Google AI Overviews now hit 88% of tracked commercial keywords | PPC Land（转述 Semrush）及 Similarweb 二手数据 | 2026-10 | https://ppc.land/google-ai-overviews-now-hit-88-of-tracked-commercial-keywords-semrush-finds/ | 二手报道，400 个商业关键词 | C | 商业关键词 AIO 出现率 88%，按搜索量加权 97% |
| S58 | AI Overviews is the most undertracked AI search: 500,000 prompts show why | Peec.ai | 2026-04 | https://peec.ai/blog/ai-overviews-is-the-most-undertracked-ai-search-500-000-prompts-show-why | 厂商研究（未打开原文） | C（利益相关） | 50 万提示词中 86.7% 出现 AIO |
| S59 | Sundar Pichai: Alphabet's AI billion users | Motley Fool；TechBriefly（2025-07） | 2026-08-21；2025-07-24 | https://www.fool.com/investing/2026/08/21/sundar-pichai-alphabets-ai-billion-users/ | 二手报道 | C | AIO 2025-07 超 20 亿月用户；2026 年超 25 亿，AI Mode 超 10 亿 |
| S60 | ChatGPT hits 900M weekly users | eWeek | 2026-02 | https://www.eweek.com/news/chatgpt-hits-900m-weekly-users/ | 二手报道 | C | OpenAI 2026-02-27 宣布 9 亿周活 |
| S61 | 《生成式人工智能应用发展报告（2026）》新闻稿 | 新华网（CNNIC） | 2026-09-29 | https://www.news.cn/20260929/40258c3794684c20ae7867909cdec2ce/c.html | 官方数据 | A | 中国生成式 AI 用户超 7 亿，76.0% 用户用它回答问题 |
| S62 | AIO, GEO, LLMO, AEO: the industry keeps renaming the methodology Jason Barnard coined in 2017 | Kalicube（Jason Barnard） | 未核实 | https://kalicube.com/learning-spaces/faq-list/generative-ai/aio-geo-llmo-aeo-the-industry-keeps-renaming-the-methodology-jason-barnard-coined-in-2017/ | 自述 | D | AEO 一词起源的自我声明 |
| S63 | AEO vs GEO vs LLMO | Contently | 2026-04-29 | https://contently.com/2026/04/29/aeo-vs-geo-vs-llmo/ | 观点 | D | 几个术语多为同一件事的不同叫法 |
| S64 | Most cited domains in AI | Semrush | 2025-10 | https://www.semrush.com/blog/most-cited-domains-ai/ | 厂商研究（未打开原文） | C（利益相关） | 2025-09 ChatGPT 对 Reddit、Wikipedia 的引用份额骤降，但仍居前二 |
| S65 | SAGEO Arena: A Realistic Environment for Evaluating Search-Augmented GEO | Kim 等，KDD 2026 | 2026-02-12 | https://arxiv.org/abs/2602.12187 | 论文（数字转引自 S15，未打开原文） | A | 加回检索和重排后，只改正文的优化让重排后 top-10 出现率降约 16% |
| S66 | 2026 年 GEO（生成式引擎优化）行业现状与趋势研究报告 | 凤凰网科技 | 2026 | https://tech.ifeng.com/c/8wR2JTLgRlz | 行业报告（未打开原文） | D | 中国 GEO 市场概况，含大量服务商自述数据 |
| S67 | ChatGPT, LLM referrals convert worse than Google Search: Study | Search Engine Land | 2025-10 | https://searchengineland.com/llms-google-referral-conversion-study-463747 | 新闻（未打开原文） | C | 报道 S55 的结论 |
