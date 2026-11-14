# 07 中国平台专题：中文 AI 回答从哪里取材，开发者能做什么

调研日期：2026-11-14。本稿专门补 02、04、06 三份调研稿在中国平台上的缺口。那三份稿里的中国平台结论，很多来自卖 GEO 服务的营销文章。本稿尽量换成一手资料：厂商的 API 文档和帮助中心、站长平台文档、各平台的 robots.txt 原文、监管通报原文。找不到一手资料的地方，直接写「没有找到」。

一个贯穿全文的方法说明：国内大厂几乎都把自家 AI 助手背后的联网搜索，做成了对外售卖的「搜索 API」（豆包搜索、元宝搜索、DeepSeek Search、百炼联网搜索、智谱 Web Search、百度 AI 搜索）。这些 API 的文档会写清楚索引覆盖什么、怎么给站点分权威等级、能不能按域名过滤。消费端 App 的帮助页反而很少写。所以本稿大量引用 API 文档。要注意：API 用的索引和 App 实际用的索引是否完全一致，大多数厂商没有明说。本稿只在厂商明说时才把两者等同，否则标为推断。

---

## 1. 一段话总结

1. **各家都有自己的搜索索引，而且都在给站点分「权威等级」。** 豆包搜索（火山引擎）公开了四级站点权威度：政府、央媒、985/211 高校、头部企业官网是「非常权威」；行业优质站点、综合平台和「中小型企业、机构官网」是「正常权威」；普通网站是「一般权威」；「普通小站」是「一般不权威」[S1]。DeepSeek 的 Search API 每条结果都带 0 到 4 的 `authority` 字段 [S15]。Kimi 写明会剔除「低质聚合站点、未经证实的自媒体」[S19]。对独立开发者，这意味着你的官网要看起来像一个「机构官网」，而不是「普通小站」（这一句是推断，等级的判定规则厂商没有完整公开）。
2. **DeepSeek 在 2026-11-13 公开了联网能力：Search 接口「由 DeepSeek 自研搜索引擎提供支持」**，支持 `site:`、`lang:zh,en` 等语法，文档示例直接搜 `site:github.com` [S14][S15]。这推翻了 02 稿「DeepSeek 搜索后端未公开」的结论。DeepSeek 还开放了 `deepseek_read_url` 和 Fetch 接口，能抓取用户给的链接 [S16]。
3. **字节有官方爬虫文档，02 稿说「没有」是错的。** 头条搜索站长平台写明「头条搜索的爬虫UA为“Bytespider”」，公布了 10 个 /24 IP 段，验证方法是反向 DNS，主机名应为 `*.bytedance.com` [S27]。文档没有提到豆包，也没有写它是否遵守 robots.txt。Cloudflare 的托管 robots.txt 默认对 Bytespider 整站 `Disallow: /` [S40]，所以在 Cloudflare 上开了这个功能的站，等于把头条搜索的爬虫挡在门外。
4. **腾讯的元宝搜索在 2026-11-11 上线（不是 02 稿推测的 2025 年）。** 消费端的元宝搜索覆盖「全网网页、公众号、视频号等腾讯生态内容和学术文献」[S10]。但对外卖的元宝搜索 API 文档写明「由于内容版权问题，元宝搜索暂不支持微信公众号内容」，API 的内容源写的是「腾讯新闻、搜狗百科、企鹅号」和「千亿级别网页索引」[S5][S7][S9]。公众号内容只在腾讯自己的产品里用得上。
5. **大内容平台的 robots.txt 对外部 AI 爬虫基本关门。** 知乎只放行 Googlebot、bingbot、Baiduspider 系列，搜狗只放行一个专用路径，其他爬虫（含 Bytespider 和所有 AI 爬虫）`Disallow: /`；小红书只给几家搜索引擎开放 `/explore` 等少数路径；公众号域名 mp.weixin.qq.com 对所有爬虫 `Disallow: /`；今日头条对所有爬虫禁止 `/item/` 和 `/group/`（文章页）；百度百科对未列名的爬虫 `Disallow: /` [S42]。但 AI 仍然大量引用知乎（量子位智库 7 款助手 630 条回答里知乎被引 29.9% [S57]）。最可能的解释是 AI 通过搜索引擎的索引或数据合作拿到这些内容，而不是自己爬（推断）。
6. **「平台只引自家内容」有一手数据支撑，但样本没公开。** QuestMobile 自己发布的报告：抗衰面霜推荐问题里，豆包引用抖音电商加抖音占 66.2%，文心引用百度占 81.7% [S55]。新榜智汇：豆包引用抖音的占比从 5 月 10.79% 升到 8 月 31.8%；标题和提问的字面关键词重合度与被引次数的相关系数只有 ρ=+0.149 [S56]。两家都没有在公开版里写样本量。
7. **微信小程序有两条和 AI 相关的官方通道。** 一是微信搜索：爬虫 UA 是 `mpcrawler`，不收录 web-view 里的任何内容，可以用 `submitpages` 接口主动推送页面，`sitemap.json` 已下线 [S31][S32][S33]。二是 2026 年新上线的「小程序 AI 开发模式」：开发者把功能封装成 `SKILL`（`SKILL.md` 加 `mcp.json` 加原子接口），微信的 AI 入口「小微」按 SKILL 描述来调用小程序，调用量受「问题发生率」和「线上版本评分」影响 [S34][S35][S36]。这是中国生态里少见的、有官方规则可依的「让 AI 推荐我」通道。
8. **监管已经点名 GEO。** 中央网信办 2026-04-30 部署的「清朗·整治AI应用乱象」专项行动，把「使用GEO（生成式搜索引擎优化）技术恶意营销」写进了 AI 数据投毒的定义，还要求平台对引用信源做交叉验证、标注引用链接 [S43]。06 稿说「通报原文没有出现 GEO 一词」，那指的是 7 月 6 日的阶段通报 [S44]；4 月 30 日的部署通知里是有的。北京朝阳区市场监管局 2026 年 6 月对一家 GEO 服务商罚款 5 万元，依据是《反不正当竞争法》第九条和《网络反不正当竞争暂行规定》[S51]。
9. **海外网站能不能被中文 AI 引用，只有部分官方答案。** 明确能检索英文内容的：Kimi（「可主动检索非中文资料（如指定搜索英文新闻源、日文技术文档等）」[S19]）、DeepSeek（`lang:` 语法和 `site:github.com` 示例 [S15]）、百炼（「英文场景推荐使用 agent」[S12]）。豆包搜索 API 有一个 `IcpHostOnly` 参数，默认 `false`，打开后「仅在国内ICP备案的网站中搜索」[S2]。这说明它的索引里有未备案网站，但调用方可以一键把它们过滤掉。元宝、智谱、百度没有找到相关说明。本书推荐读者用第 3.1 节的 10 分钟实测自己判断。
10. **中国 GEO 已有三套团体标准，没有国家标准。** T/CAPT 026—2026（中国新闻技术工作者联合会，新华网牵头，2026-08-11 发布）[S48]；T/CAACCHINA 001～005—2026（中国商务广告协会，2026-09 公布）[S49]；AIIA/T 0277-2026（中国信通院相关，只在服务商宣传稿里见到，没找到原文）[S50]。

---

## 2. 正文

### 2.1 读这一章前要知道的结构

中文 AI 助手回答一个需要联网的问题时，一般走这条链路（各厂商文档的共同部分，细节各异）：

1. 模型判断要不要搜（百炼的 `forced_search`、Kimi 的「自主判断」[S12][S19]）。
2. 调用自家或第三方的搜索索引，拿回一批候选网页（豆包搜索、元宝搜索、DeepSeek 自研搜索、夸克、搜狗）[S2][S5][S15][S13][S21]。
3. 按相关性、权威性、时效性重排，可能按权威等级过滤 [S1][S15][S19]。
4. 必要时打开网页读正文（DeepSeek `deepseek_read_url`、豆包搜索「网页解析-Fetch」）[S16][S2]。
5. 生成回答，附引用链接。

所以开发者能影响的环节是：你的页面能不能进第 2 步的索引，第 3 步给你打几级权威，第 4 步能不能读到你的正文。第 1 步和第 5 步你影响不了。

各家索引和站长平台的对应关系，是本章最有用的一张表：

| AI 产品 | 背后的搜索（官方说法） | 对应的站长入口 | 证据 |
|---|---|---|---|
| 豆包 | 豆包搜索（火山引擎），融合「全域互联网信息、行业专业知识以及字节跳动独家内容资源」 | 头条搜索站长平台（Bytespider 是头条搜索的爬虫）；豆包搜索和头条搜索是否同一索引，官方没说 | [S1][S2][S4][S27] |
| 元宝 | 元宝搜索：「以互联网全网公开资源为基础，叠加腾讯优质内容生态，结合元宝 App 联网搜索应用实践」；消费端另含公众号、视频号 | 搜狗站长平台（联系邮箱是 tencent.com）、微信公众平台 | [S5][S8][S10][S29] |
| DeepSeek | 「DeepSeek 自研搜索引擎」 | 没有站长平台，没有公开爬虫文档 | [S15] |
| 千问 / 百炼 | 文档只说「可调用多源搜索引擎」；阿里云 AI 网关的联网搜索「目前仅支持夸克（阿里云信息查询服务）」 | 神马站长平台（服务条款把夸克、神马列为阿里业务平台）；夸克是否用神马索引，官方没说 | [S12][S13][S30] |
| 文心 / 百度 AI 搜索 | 百度搜索 | 百度搜索资源平台 | [S22][S23][S26] |
| 智谱清言 | 智谱 Web Search API：「自研引擎及第三方服务（搜狗/夸克）」；清言 App 是否同源，官方没说 | 搜狗、神马 | [S21] |
| Kimi | 「智能调用搜索引擎与垂直数据库」，100+ 可信来源；没说是哪家引擎 | 无 | [S19] |
| 微信「小微」 | 调用小程序 SKILL，不是网页搜索 | 微信公众平台「基础功能 - AI 能力」 | [S34] |

### 2.2 豆包与火山引擎「豆包搜索」

**产品形态。** 火山引擎 2026-07-28 上线「豆包搜索」，面向 Agent 开发者，号称融合字节独家内容资源 [S4]。文档分 Custom 版、Global 版和网页解析 Fetch [S2][S3]。每个火山账号每月有 500 次免费调用 [S2]。

**站点权威度分级（本章最重要的一手资料）[S1]，文档更新于 2026-08-21：**

| 等级 | Custom 版字段 | 文档给的范围和例子 |
|---|---|---|
| 非常权威 | `AuthInfoLevel: 1` | gov.cn 各级网站；组织机构、二甲及以上公立医院、公立博物馆；央媒（people.com.cn、news.cn、cctv.com 等）；地区官方媒体；985/211 大学官网；新闻门户里「新闻媒体/国家机构」认证账号的发文（例子是 m.toutiao.com、news.qq.com、m.163.com、k.sina.cn 的文章）；世界 500 强、中国 500 强企业官网（例子含 www.apple.com.cn）；「字节高质量数据源」火山如意 |
| 正常权威 | `AuthInfoLevel: 2` | 行业优质站点（同花顺、懂车帝、豆瓣、掌上高考等）；综合平台（Bilibili、什么值得买、澎湃）；今日头条、腾讯新闻、网易、搜狐、新浪、微博上的高粉丝量认证作者；**「中小型企业、机构官网」** |
| 一般权威 | `AuthInfoLevel: 3` | 各类文库；新闻门户里的普通 UGC 作者（未认证或低粉丝）；「各类非门户级社区论坛」；「各类非头部垂类网站」 |
| 一般不权威 | `AuthInfoLevel: 4` | 「普通小站，劣质、虚假信息较多，无法提供专业、可信内容」 |

Custom 版的 `Filter.AuthInfoLevel` 设为 1 时只返回「非常权威」结果；Global 版「暂不支持主动搜索控制」，但结果会带 `AuthorityLevel` 标注 [S1]。

**Custom 版的过滤参数 [S2]：** `Sites`（最多 20 个域名）、`BlockHosts`（最多屏蔽 5 个）、`AuthInfoLevel`、`IcpHostOnly`（「是否限制仅在国内ICP备案的网站中搜索」，默认 `false`）、`NeedUrl`、`NeedContent`。返回字段 `AuthorInfo.Name`「当前仅覆盖今日头条、新浪新闻等站点」[S2]。

这几条对开发者的含义：

- 你的官网如果被判成「中小型企业、机构官网」，在豆包搜索里是第 2 级。被判成「普通小站」就是第 4 级。判定规则没公开（文档只给了例子），本稿也没找到申诉或认证入口。
- 第 2 级里写的是「企业、机构官网」，所以一个有公司主体、有联系方式、有清晰产品信息的官网，比一个无主体的个人博客更可能落在第 2 级（推断）。
- `IcpHostOnly` 说明 ICP 备案是一个可被调用方使用的过滤维度。如果某个接入豆包搜索的 Agent 打开了它，未备案的站就不会出现（A 级文档事实）。豆包 App 本身有没有开这个过滤，没有资料。
- 头条和新浪新闻有作者字段，说明字节对这两个平台的作者身份有结构化数据（A）。这和「豆包偏好头条」的观察一致，但不能直接推出「在头条发文就能被豆包引用」（推断边界）。

**豆包 App 与豆包搜索 API 是不是同一套。** 火山引擎的新闻稿和文档都没有直接说「豆包 App 就是用这个」。从业者白杨SEO 认为是同一套改名（02 稿 S48，C 级）。本稿把它当作高度可能但未证实。

**豆包实际引用什么（第三方数据）。**

- 新榜智汇（2026-10 报告，IT之家 2026-10-27 转述）：豆包对抖音的引用占比从 5 月 10.79% 升到 8 月 31.8%；百度 6 月首次把 B 站和好看视频纳入信源库，二者合计 12%；标题与提问的语义相似度和被引次数正相关，抖音平均被引从最低档 2.29 次到最高档 3.46 次；关键词覆盖率与被引的相关系数 ρ=+0.149（抖音 +0.157），语义相似度 +0.117 [S56]。样本量和问题集没有在转述里出现，本稿没找到新榜原文。注意这些相关系数都很弱（|ρ|<0.2），只能说明方向，不能说明标题是决定因素。
- QuestMobile（自家公众号发布，36氪转载）：车型推荐类问题，豆包对 72.6% 的问题会引用 11 到 15 篇内容交叉验证；保险认知类问题，豆包单次引用 16 篇以上的问题占 20.4%；抗衰面霜推荐，抖音电商加抖音为豆包贡献 66.2% 的内容；粉底液推荐，豆包对抖音引用 31.8%；手机品类里「厂商官网凭借一手数据成为重要补充信源」[S54][S55]。公开版没有写问题数和采样次数。

### 2.3 腾讯元宝、元宝搜索与搜狗

**两个「元宝搜索」要分开。**

- **消费端「元宝搜索」**（so.qq.com，2026-11-11 上线）：「依托千亿级索引，搜索范围覆盖全网网页、公众号、视频号等腾讯生态内容和学术文献」，「优先展示权威机构与官方来源的内容」，「接入157个权威信源」[S10]。这是 IT之家转述腾讯云的发布，本稿没找到腾讯的发布原文。年份核实：凤凰网页面显示「2026年11月11日 14:54:31」[S10]。02 稿推测的 2025 年是错的。
- **腾讯云「元宝搜索」API**（原名「联网搜索API」，2025-07-01 上线，2026-10-09 改名）[S6]：「以互联网全网公开资源为基础，叠加腾讯优质内容生态，结合元宝 App 联网搜索应用实践」[S8]；「融合腾讯优质内容生态，包括腾讯新闻、搜狗百科、企鹅号等内容」[S5]；「积累了千亿级别网页索引资源」[S9]。常见问题里写着：「包含微信公众号内容吗? 由于内容版权问题，元宝搜索暂不支持微信公众号内容。」[S7]

**API 参数 [S8]：** `Site` 可以指定一个域名（如 `Site=qq.com`）或排除最多 5 个（`Site=exclude:qq.com|sohu.com`）；`Mode` 区分「公开网页信源结果」和「优质权威垂直信源结果（VR 结果）」；旗舰版有「结果权威度等级」[S5]。

**元宝 App 本身。** App Store 介绍写联网搜索覆盖「公众号、视频号等优质腾讯生态信源」[S11]。

**搜狗。** 搜狗站长平台的联系邮箱是 `zzpt@tencent.com`，友情链接是企鹅号和微信小程序 [S29]。搜狗站长指南写：「sogou spider 支持 robots 协议」，「新更新的 robots.txt 可能得过几个星期才能体现出效果」，「被您禁止 sogou spider 收录的网页将不能在搜狗搜索引擎上检索到」，还写了「搜狗更偏好收录静态网页」[S28]。智谱文档对搜狗引擎的描述是「覆盖腾讯生态（新闻/企鹅号）和知乎内容」[S21]。

**推断链（未证实）：** 元宝消费端的网页部分 ≈ 腾讯自建索引（含原搜狗能力）+ 公众号/视频号。对独立站，搜狗站长平台是目前能找到的、离腾讯索引最近的官方入口。

### 2.4 DeepSeek

**2026-11-13 之前**，DeepSeek 只有 App 里的联网搜索，隐私政策（2026-02-10 版）只写「当您使用搜索服务时，我们会自动接收您主动输入的信息，以便向您自动提供实时搜索结果」[S17]。2026-08 有开发者发现 API 的 Responses 接口可以用 `web_search` 工具 [S18]，当时官方没有文档。

**2026-11-13，DeepSeek 发布「全家桶应用 API」[S14]：**

- 联网工具：`deepseek_web_search`（非思考模式下「自动发起网页或图片搜索并附引用作答」，思考模式下「在多步推理中自主联网搜索与阅读链接」）和 `deepseek_read_url`（「自动识别用户消息中的链接，抓取网页内容并结合上下文作答」）[S14][S16]。
- 独立的 Search 接口：「该接口由 DeepSeek 自研搜索引擎提供支持」，`POST https://api.deepseek.com/v1/tools/search`，支持 `site:`、`-site:`、`lang:`、`after:`、`before:` 等语法 [S15]。
- 每条结果带 `rerank_score`（0 到 3，「大于等于 1.5 分为优质结果」）和 `authority`（0 到 4，-1 未知，「大于等于 3 为极权威结果」）[S15]。
- Fetch 接口：抓单个网页返回 Markdown；「Fetch 的结果受目标站点的可用性和访问策略影响」；404 包括「被站点策略拦截」；还按目标域名限 QPS [S15]。
- 价格：Search 和 Fetch 各 5 元 / 1000 次成功请求 [S15]。
- 文档的 web_tools 示例里，一个英文回答引用了中文站「华经情报网」，说明它会跨语言取材 [S16]。

**没有的东西：** 没有爬虫 UA 文档，没有 robots.txt 说明，没有站长平台。抖音的 robots.txt 里出现了 `deepseekbot` 这个 UA 名 [S42]，说明至少有平台认为这个名字存在，但 DeepSeek 自己没有确认过。

**这对开发者意味着什么：** DeepSeek 的 Search API 给了一个能直接查「我的站在 DeepSeek 索引里有没有、权威分多少」的工具（见 3.1 节）。这是目前中文 AI 里唯一公开权威分数字段、又能按站点查的接口（就本稿查到的范围）。

### 2.5 千问、百炼与夸克

- 百炼联网搜索文档：`search_strategy` 的 `max`「可调用多源搜索引擎」；`agent` 可多轮检索；「英文场景推荐使用 agent」；`assigned_site_list`「启用后，搜索将严格限于指定网站列表」，仅 `turbo` 策略和 qwen-plus、qwen-flash 等模型可用；`freshness` 可限 7/30/180/365 天 [S12]。文档没有写搜索引擎是谁。
- 阿里云 AI 网关的联网搜索：「搜索引擎支持：夸克搜索引擎（阿里云信息查询服务）」，「目前仅支持夸克」[S13]。
- 神马站长平台的服务条款把「夸克、神马搜索」都列为「阿里业务平台」[S30]。夸克搜索是否用神马的索引、站长在神马提交的内容是否进入夸克，没找到官方说明。
- QuestMobile 数据：千问车型推荐引用懂车帝最高（76.5%）；攻略类问题「激活哔哩哔哩（33.0%）」；抗衰面霜推荐中千问对今日头条引用 44.6% [S54][S55]。

### 2.6 百度：文心、百度 AI 搜索与百度搜索资源平台

- **爬虫。** 百度官方文章（发布日期 2017-04-27，02 稿写「未标日期」）：UA 分移动、PC、小程序三类，含 `Baiduspider/2.0` 和 `Baiduspider-render/2.0`；「IP地址范围动态变化不固定，我们无法对外公布」；用反向 DNS 验证 [S22]。
- **资源提交。** 「普通收录工具是网站主动向百度搜索推送数据的工具……本工具可加快爬虫抓取速度，无法解决网站内容是否收录问题」[S23]。「快速抓取」（原快速收录）只给 VIP 站点或活动获奖站点，「对是否收录及线上展现效果不保证」[S24]。
- **新工具。** 资源平台导航里已经有「权威溯源 / 权威提交」和「AI流量分析」两个入口；AI流量分析页面未登录时只显示一句「切换tab，可查看专业问答-小程序的生效量和点展统计」[S25]。本稿没找到这两个工具的说明文档，也没找到上线公告。
- **AI 搜索 API。** 百度千帆 AppBuilder 文档目录里有「百度AI搜索」「百度搜索」「网页黑名单」「特定query干预」「领域知识注入」等组件 [S26]。
- **百度系内容的封闭性。** 百度百科的 robots.txt 只对 Baiduspider、Googlebot、bingbot、Sogou、yisouspider 等列名爬虫放行部分路径，`User-agent: *` 为 `Disallow: /` [S42]。02 稿引用的 2024 年 SCMP 报道说百科屏蔽 Googlebot 和 Bingbot [S63]，现在的 robots.txt 已经给 Googlebot 和 bingbot 开放了大部分路径（只禁 `/update`、`/history` 等），那条报道应标为过时。
- **文心引用什么。** QuestMobile：抗衰面霜推荐中文心对百度的内容引用 81.7%；洗地机推荐中文心对知乎引用 19.6%；文心 PC 端引用量反超 App 端 [S55]。
- **没有的东西：** 百度没有单独的 AI 训练或 AI 回答 robots 令牌（本稿和 02 稿都没找到）。

### 2.7 Kimi

- 帮助中心：「智能调用搜索引擎与垂直数据库」；「覆盖 100+ 经过验证的可信来源」；「自动剔除：低质聚合站点、未经证实的自媒体、过期缓存页面」；「优先收录：政府机构官网、权威媒体、学术期刊、官方财报渠道」；「可主动检索非中文资料（如指定搜索英文新闻源、日文技术文档等）」[S19]。
- 开放平台的联网搜索接口「按提交的查询词（`text_query`）原样搜索」，支持 `sites` 过滤，按次计费；抓网页正文会受目标站「反爬策略」影响 [S20]。没有写引擎和爬虫名。
- QuestMobile 2026 年一季度月活榜里 Kimi 已不在前列（豆包 3.45 亿、千问 1.66 亿、DeepSeek 1.27 亿、元宝 5734.6 万）[S60]。

### 2.8 智谱、秘塔、360 纳米

- 智谱：`search_std`、`search_pro`（自研）、`search_pro_sogou`、`search_pro_quark`，搜狗「覆盖腾讯生态（新闻/企鹅号）和知乎内容」，夸克「精准触达垂直内容」，价格 0.01 到 0.05 元/次 [S21]。
- 秘塔、360 纳米：本稿没找到索引来源或爬虫的官方文档。360Spider 的 UA 只在第三方目录里见到，没有找到 360 站长平台的官方 UA 页（zhanzhang.so.com 首页抓回来几乎为空）。

### 2.9 字节的爬虫与 Cloudflare 的默认设置

- 头条搜索站长平台《关于Bytespider》：「头条搜索的爬虫UA为“Bytespider”首写字母为大写」；PC、Android、iOS 三个 UA；10 个 IP 段（110.249.201.0/24、110.249.202.0/24、111.225.148.0/24、111.225.149.0/24、220.243.135.0/24、220.243.136.0/24、220.243.188.0/24、220.243.189.0/24、60.8.123.0/24、60.8.151.0/24）；「Bytespider的hostname以*.bytedance.com的格式命名，非 *.bytedance.com即为冒充」；抓取过量可用「抓取频次」功能设置，「1天内」生效 [S27]。
- 这份文档没有提 robots.txt，也没有提 AI 训练或豆包。第三方报道（Fortune 2024-10）称 Bytespider 不遵守 robots.txt [S62]；ppc.land 2026 年的文章称官方文档说它遵守 robots，但本稿读到的官方页面里没有这句话 [S61][S27]。
- Cloudflare 托管 robots.txt（文档更新于 2026-11-02）会给 Amazonbot、Applebot-Extended、Bytespider、CCBot、ClaudeBot、Google-Extended、GPTBot、meta-externalagent 写 `Disallow: /` [S40]。Cloudflare 的「AI Crawler and Agent access policies」按 Search、Agent、Training 三类行为分别设置拦截 [S41]。Bytespider 被 Cloudflare 归在哪一类，本稿没查到。
- GitHub 的 robots.txt 对 Bytespider 整站 `Disallow: /` [S42]。

**结论：** 在 Cloudflare 上开了托管 robots.txt 的站点，头条搜索爬不到。要不要放行 Bytespider，取决于你更在乎头条搜索（可能还有豆包）的曝光，还是更在乎不给字节训练数据。官方没有给两者分开的开关。

### 2.10 微信：搜一搜、小程序搜索和小程序 AI

**小程序搜索（官方文档，最后编辑 2026-06-16）[S31]：**

- 「爬虫访问小程序内页面时，会携带特定的 user-agent "mpcrawler" 及场景值：1129」；可以用 `X-WXApp-Crawler-Timestamp`、`X-WXApp-Crawler-Nonce`、`X-WXApp-Crawler-Signature` 三个请求头验签。
- 页面 URL 要能直接打开，参数都放在 URL 里；跳转优先用 `navigator` 组件；参数不要塞 JSON；必要时才要求登录授权。
- 「我们不收录 web-view 中的任何内容。我们暂时做不到这一点，长期来看，我们可能也做不到。」
- 用 `wx.setNavigationBarTitle` 或 `onShareAppMessage` 设置标题和缩略图，给 video、audio 补 `poster` 或 `poster-for-crawler`。

**主动推送。** `submitpages`（搜一搜数据推送）接口：`POST https://api.weixin.qq.com/wxa/search/wxaapi_submitpages?access_token=ACCESS_TOKEN`，推送页面路径、参数和结构化数据，「推送的内容将会被用于微信搜索结果展示」；`path+query` 唯一标识一个页面；不支持第三方平台调用 [S32]。

**sitemap.json 已下线。** 小程序全局配置文档在 `sitemapLocation` 下写着「sitemap.json 已下线」[S33]。很多中文教程还在教 sitemap.json 的 `rules`，那些已经过时。后台是否还有「页面收录」开关，本稿没找到官方说明。

**小程序 AI 开发模式（beta）[S34][S35][S36][S37]：**

- 「当用户通过小程序 AI 发起对话时，小程序 AI 会通过小程序 MCP 协议分析并选择合适的原子接口和原子组件」。每个 `SKILL` 包含 `SKILL.md`、`mcp.json`、原子接口与原子组件的实现 [S34]。
- 申请入口：「微信公众平台 - 基础功能 - AI 能力」或「微信开发者助手 - 管理 - 微信AI管理」，接入模式选「开发模式」[S34]。
- 微信客户端 8.0.79 以上、有「小微入口」的 iOS 和 Android 用户可用 [S35]。
- 调用规则：「平台会根据开发者SKILL的描述调用」；调用受「问题发生率」（>20% 为超标）和「线上版本评分」影响，还会考虑「用户诉求、历史习惯、POI、小程序运营质量」[S35]。
- 写法建议：模型最看重原子接口返回的 `content`，其次是 `mcp.json` 里的 `description` 和 `inputSchema.description`，`SKILL.md` 排第三 [S36]。
- 2026-11-11 起开放微信评测和代码提审，发布上线和离场须知 [S37]。

**公众号。** mp.weixin.qq.com 的 robots.txt 对所有爬虫 `Disallow: /`，只放行少数非文章路径 [S42]。元宝搜索 API 也不含公众号 [S7]。所以公众号文章在本稿查到的范围内只进腾讯自家产品（元宝消费端、微信搜一搜）。

### 2.11 内容平台：robots.txt 实测和引用数据

本稿在 2026-11-14 直接抓取了各平台的 robots.txt [S42]，摘要如下：

| 平台 | 放行谁 | 默认组 `*` | 对独立开发者的含义（推断） |
|---|---|---|---|
| 知乎 www.zhihu.com | Googlebot、bingbot、Baiduspider 系列；Sogou 只放 `/tardis/sogou/`；Google-Extended 禁止 | `Disallow: /` | 外部 AI 爬虫进不去，内容主要靠百度、必应、搜狗的索引流出 |
| 小红书 | Baiduspider、bingbot、360Spider、搜狗、YisouSpider 只能抓 `/explore`、首页、sitemap 等 | `Disallow: /` | 笔记对外部 AI 基本封闭；小红书自己有 AI 搜索「点点」[S60] |
| 公众号 mp.weixin.qq.com | 无 | `Disallow: /` | 只进腾讯自家产品 |
| 今日头条 | 无单列 | 禁 `/item/`、`/group/` 等 | 文章页对外部爬虫关闭 |
| 抖音 | Googlebot、GPTBot、OAI-SearchBot、PerplexityBot、ByteSpider、deepseekbot 等大量列名；Baiduspider 被禁 `/video/`、`/note/` | 未设默认组 | 抖音对多家 AI 爬虫开放，对百度关闭视频页 |
| 掘金 juejin.cn | 只有 `*` | 禁个人设置、草稿、搜索等，文章页开放 | 文章页对所有爬虫开放 |
| CSDN blog.csdn.net | 只有 `*` | `Allow: /` | 全开放 |
| B 站 | `*` 和社交预览爬虫 | 只禁少数路径 | 基本开放 |
| V2EX | `*` 和 bingbot（`Crawl-delay: 120`） | 只禁登录和设置 | 基本开放 |
| 少数派 sspai.com | `*` 和 Baiduspider 共用一组 | 禁 `/a/*`、`/s/*`、`/search/*`、`/tag/*` 等 | 文章路径 `/post/` 未被禁 |
| GitHub | 多家 AI 爬虫 `Crawl-delay: 1` | Bytespider `Disallow: /` | 头条搜索爬不到 GitHub |

**引用数据（都是第三方，标明样本）：**

- 量子位智库（2025-05）：30 个问题 × 7 款助手（DeepSeek、豆包、Kimi、元宝、文心、通义、秘塔）× 3 次，有效 630 条。接近一半的回答引用内容社区；知乎被引 29.9%，B 站 7.6%；专业知识问题里知乎 35.3% [S57]。样本小，但方法公开，是本稿找到的唯一一份写清采样方法的中文引用研究。
- QuestMobile（2026）：汽车、旅游、保险、美妆、手机、洗地机等品类，平台都偏自家生态；洗地机推荐里什么值得买在豆包和文心的引用率 11.7% 和 6.2%，文心对知乎 19.6% [S54][S55]。公开版不披露问题数。
- 艾瑞（2026-06）：汽车行业 AI 信源影响力指数，正文写「基于百万级全量评测数据」，具体样本和方法在图片里，本稿没读到；结论是汽车垂媒（汽车之家第一）主导 [S58]。02 稿记录的「40 万次提问」本稿无法核实。
- CBNData × WhatTheyOS（2026-09）：智能眼镜、手环、戒指三品类，「近三月的用户相关提问总量超430万次」；这是提问量，不是回答采样量；WhatTheyOS 是 GEO 数据平台，有利益相关 [S59]。

**掘金、CSDN、少数派、V2EX 的引用占比：** 本稿没找到方法公开的数据。04 稿 S45（迪普智见，1,000 次提问，知乎 32%、技术社区 24%）作者自称「非行业通用数据」，题目偏向其业务，只能当参考。

### 2.12 海外网站和墙外资源

已知的官方事实：

- Kimi 明说能检索英文新闻源、日文技术文档 [S19]。
- DeepSeek Search 支持 `lang:en`，文档示例搜 `site:github.com OR site:huggingface.co` [S15]。
- 百炼建议英文场景用 `agent` 策略 [S12]。
- 豆包搜索有 Global 版 [S3]，Custom 版的 `IcpHostOnly` 默认不限制 [S2]。
- 元宝搜索 API、智谱、百度：没写。
- Cloudflare 官方：中国大陆的 China Network 需要 ICP 备案或许可证，由京东云运营；ICP 被吊销时 Cloudflare 会把流量改到「中国境外最近的数据中心」[S38][S39]。没开 China Network 的站，大陆访客走境外节点（Cloudflare 没有给出性能说明）。
- workers.dev 曾被 SNI 阻断（GitHub issue，约 2022 年，C 级）[S65]。pages.dev 现在的可达性没找到可靠资料。
- Chrome Web Store 在大陆不能直接访问（少数派等，C 级）[S64]。所以大陆的 AI 爬虫很可能读不到你的 CWS 详情页（推断）。

没有一家说明「从大陆机房抓取墙外站点」的能力。所以本书推荐读者自己做 3.1 节的实测。

### 2.13 监管、案例和标准

**3·15 晚会（2026-03-15）原话核对 [S45][S46][S47]：**

- 业内人士在电商平台买了「力擎GEO优化系统」，虚构 Apollo9 智能手环，系统自动生成十余篇软文，并「自动打开业内人士事先准备好的自媒体账号」发布，先发了 2 篇。
- 两个小时后，在「某款AI大模型」中问「Apollo-9智能手环怎么样」，模型照搬了虚构的「量子纠缠传感」「黑洞级续航」等话术，参考资料正是那篇文章。
- 随后三天内发布 11 篇（8 篇「专家测评」、2 篇「行业排名」、1 篇「用户测评」），再问「智能健康手环推荐」，「两个AI大模型」把它排在前面。
- 节目**没有点名是哪几个模型**。04 稿和 06 稿的转述基本准确，但要补一点：两小时生效的那次是**直接问产品名**，这个名字在网上只有那一篇文章，所以模型只能引它。品类问题需要 11 篇、三天、多个角度。
- 力擎运营者原话：「GEO业务受热捧的主要原因就是它能在AI大模型里帮客户喂料、投毒」[S46]。

对独立开发者的启示（推断）：品牌名问题很容易被一篇文章「占领」，这也意味着你自己的产品名一定要有你自己写的、事实准确的页面，否则别人写什么 AI 就信什么。品类问题才是需要多来源、多角度的地方。

**中央网信办「清朗·整治AI应用乱象」[S43][S44]：**

- 2026-04-30 部署，为期 4 个月，两个阶段。第一阶段 7 类问题的第四类：「AI数据投毒问题。通过篡改训练语料、伪造权威数据、使用GEO（生成式搜索引擎优化）技术恶意营销等方式实施AI数据投毒。炒作、教授AI数据投毒方法，或在电商平台兜售教程及工具。在模型生成回答过程中，对引用信源缺乏交叉验证和风险提示机制，未标注引用信息链接。」[S43]
- 第二阶段聚焦「数字泔水」、虚假信息、「网络水军活动」等 [S43]。
- 2026-07-06 阶段通报：处置 AI 产品 1.4 万余款，清理信息 600 余万条，处置账号 2.6 万余个；江苏网信办开设专项举报窗口收集「AI数据投毒」线索；「DeepSeek在数据采集和预处理环节嵌入异常检测算法，防止恶意样本隐蔽操控」[S44]。

**执法案例：北京百付科技（2026-06）[S51]。** 朝阳区市场监管局罚款 5 万元。通报记录的做法：「当事人会优先通过AI软件进行对应检索，根据AI软件提示的参考资料对应网站，通过媒体中介在对应网站上进行投放」，以达到合同约定的「AI搜索结果排名前三或者前五」；对投放内容的真实性「不做审核判断」；官网自称「大家可以去豆包提问GEO优化公司……百付科技排第一」；依据《网络反不正当竞争暂行规定》和新修《反不正当竞争法》第九条。本稿通过南都转述读到通报内容，没有打开朝阳区政府原文。

**评论（D 级）：** 第一财经刊发的陈兵、朱家熠文章认为「正常的GEO推广并不当然违法」，要审查的是「内容是否真实、传播方式是否正当、商业推广属性是否具有可识别性」；还提出证据上「不能仅凭一次生成结果就认定行为效果」[S52]。

**行业自律：** 北京市场监管局组织百度、巨量引擎、腾讯、快手、京东、美团、360、凤凰网签署《互联网营销宣传自律公约》（2026-10 下旬），要求 AI 深度合成的商业宣传显著标识，禁止借 AI 制造虚假信息或虚假代言 [S53]。本稿没找到公约原文。

**团体标准：**

| 标准 | 发布方 | 时间 | 要点 | 证据 |
|---|---|---|---|---|
| T/CAPT 026—2026《生成式引擎优化（GEO）可信信息传播与信息生态治理规范》 | 中国新闻技术工作者联合会；新华网数字经济事业中心等牵头编制 | 2026-08-11 发布 | 品牌知识库「三区分治」：事实库、观点库、营销表达库分开，营销里的事实主张以事实库为准；明确白帽与黑帽 GEO 的界线；服务商组织能力 L1 到 L3 | [S48] 新华网（起草方自己的媒体） |
| T/CAACCHINA 001～005—2026《生成式引擎优化（GEO）》五项 | 中国商务广告协会 AI 营销应用工作委员会 | 2026-09 公布（协会 9-16 发消息） | 术语、服务商评估、计价测量、可信语料、合规安全；七类计价单元、五种计价模式、九项核心指标的「最低样本量要求」；不得用提示词注入、关键词堆砌、伪造权威背书、隐藏文本；金融医疗 100% 人工复核 | [S49]；编委主任谭北平是秒针营销科学院院长，利益相关 |
| AIIA/T 0277-2026《生成式引擎优化（GEO）服务可信基本要求》 | 据称中国信通院与中国人工智能产业发展联盟 | 据称 2026-03 | 只在服务商宣传稿里见到 | [S50]，D |

三套标准都是团体标准，自愿采用。本稿没有读到任何一套的全文。

---

## 3. 实战清单

场景：一个独立开发者，有一个 Chrome 插件、一个用 Astro 搭在 Cloudflare 上的教程站、一个会员站、一个微信小程序。每一步都标了出处或「推断」。

### 3.1 先做 10 分钟实测，看自己现在在哪

这是本书推荐的基线测试。没有官方文档能回答「中文 AI 能不能读到我的海外站」，只能测。

**A. 手工测（5 分钟，免费）。** 在豆包、DeepSeek、元宝、千问、Kimi、文心（或百度 App 的 AI 搜索）里都打开联网，各问下面 4 个问题，每题问 2 次（回答有随机性 [S57]），记录到表里：

| 编号 | 问题模板 | 测什么 |
|---|---|---|
| Q1 | 「{产品名} 是什么？谁做的？」 | 品牌名问题能不能找到你 |
| Q2 | 「请阅读 https://{你的域名}/{某篇教程} 并用三句话总结」 | 读链接能力能不能打开你的站（DeepSeek 有 `deepseek_read_url` [S16]） |
| Q3 | 「请阅读 https://github.com/{你}/{仓库} 的 README，告诉我安装命令」 | 能不能读 GitHub |
| Q4 | 「有什么好用的 {品类} Chrome 插件？」 | 品类问题里有没有你 |

记录表：

```text
平台 | 题号 | 第几次 | 提到我(是/否) | 描述是否准确 | 引用的 URL（全部复制） | 有没有报错或明显编造
```

Q2、Q3 如果 AI 没报错却给出和页面不符的内容，记为「编造」。02 稿记录过 DeepSeek 读 GitHub 失败后直接编造的个案。

**B. 用 API 测（5 分钟，几毛钱）。** 直接查各家索引里有没有你的站、给你多少权威分。

DeepSeek Search（「自研搜索引擎」，带 `authority` 字段）[S15]：

```bash
export DEEPSEEK_API_KEY=sk-...
for q in "{产品名} site:{你的域名}" "{产品名} site:github.com" "{一个只在你英文页上出现的短语} lang:en"; do
  echo "### $q"
  curl -s https://api.deepseek.com/v1/tools/search \
    -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$q\", \"count\": 20}" \
  | jq -r '.results[] | [.authority, .rerank_score, .date, .url] | @tsv'
done
```

`results` 为空说明索引里没有；`authority` ≥ 3 是「极权威」，-1 是未知 [S15]。按成功请求计费，5 元 / 1000 次 [S15]。

DeepSeek Fetch（看它能不能读到你的正文）[S15]：

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://api.deepseek.com/v1/tools/fetch \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" -H "Content-Type: application/json" \
  -d '{"url": "https://{你的域名}/{某篇教程}"}'
# 200 = 能读；404 = 包括「被站点策略拦截」、内容没有可提取正文等 [S15]
```

智谱（可以分别测搜狗和夸克的索引）[S21]：

```python
from zai import ZhipuAiClient
client = ZhipuAiClient(api_key="YOUR_API_KEY")
for engine in ["search_pro_sogou", "search_pro_quark", "search_pro"]:
    r = client.web_search.web_search(
        search_engine=engine,
        search_query="{产品名}",
        count=20,
        search_domain_filter="{你的域名}",
    )
    print(engine, r)
```

百炼 / 千问（`assigned_site_list` 只在 `turbo` 策略和 qwen-plus 等模型可用）[S12]：

```python
import os
from openai import OpenAI
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
)
r = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "{产品名} 是什么？"}],
    extra_body={"enable_search": True,
                "search_options": {"search_strategy": "turbo",
                                   "enable_source": True,
                                   "assigned_site_list": ["{你的域名}"]}},
)
print(r.choices[0].message.content)
```

豆包搜索 Custom 版用 `Filter.Sites` 和 `IcpHostOnly`（分别设 `false` 和 `true` 各查一次，看备案过滤会不会把你筛掉）[S2]；元宝搜索 API 用 `Site` 参数 [S8]。这两家需要在火山引擎和腾讯云控制台开通，签名方式见各自文档。

**怎么读结果。** API 有你、App 没引用你，说明进了索引但排不上（内容或权威问题）。API 也没有，说明是收录问题，先做 3.2 节。限制：API 索引和 App 索引是否一致没有官方说明，这个测试只能当近似。

### 3.2 Astro 教程站（Cloudflare）

**第 1 步：检查 robots.txt 和 Cloudflare 设置。**

1. 打开 Cloudflare 仪表盘，看是否开了托管 robots.txt。开了的话，它会给 Bytespider 写 `Disallow: /` [S40]，头条搜索就爬不到你 [S27]。
2. 看 Security 里的「AI Crawler and Agent access policies」，确认 Search 类没有被设成 Block [S41]。
3. 决定 Bytespider 的去留（见 2.9 节）。如果要放行，最稳的做法是关掉托管 robots.txt，自己写一份（推断：两份规则合并后的优先级取决于爬虫的解析器，Bytespider 的解析器行为没有公开）。

自己写的 robots.txt 示例（放在 Astro 的 `public/robots.txt`）：

```text
# 中文搜索引擎。中文 AI 回答主要从这些索引里取材（见 2.1 节表格）。
User-agent: Baiduspider
Allow: /

User-agent: Baiduspider-render
Allow: /

# 搜狗：官方说支持 robots，规则生效可能要几周 [S28]
User-agent: Sogou web spider
Allow: /

# 头条搜索的官方爬虫 [S27]。它和豆包训练、豆包回答的关系没有官方说明。
User-agent: Bytespider
Allow: /

# 神马/夸克方向，官方 UA 文档未找到，按第三方目录填写
User-agent: YisouSpider
Allow: /

User-agent: 360Spider
Allow: /

User-agent: *
Allow: /
Disallow: /account/
Disallow: /api/

Sitemap: https://example.com/sitemap-index.xml
```

**第 2 步：用日志确认爬虫真的来了。** 有原始日志（自建服务器、Cloudflare Logpush）时：

```bash
grep -oE 'Baiduspider(-render)?|Bytespider|Sogou web spider|YisouSpider|360Spider|deepseekbot|mpcrawler' access.log \
  | sort | uniq -c | sort -rn
```

验真（UA 可以伪造）：

```bash
dig -x 111.225.148.250 +short   # Bytespider 应为 *.crawl.bytedance.com [S27]
host 123.125.66.120             # Baiduspider 应为 *.baidu.com 或 *.baidu.jp [S22]
```

Cloudflare 免费版没有原始日志。可以在仪表盘的流量和安全分析里按 User agent 筛（推断：具体菜单名本稿没逐项核对）。

**第 3 步：在站长平台注册并推送。**

1. 百度搜索资源平台：添加站点、验证，提交 sitemap，开启「普通收录」的 API 推送 [S23]。官方明说只加快抓取，不保证收录 [S23]。「快速抓取」要 VIP [S24]。
2. 推送接口地址 `data.zz.baidu.com/urls?site=...&token=...` 在后台登录后才显示，本稿通过社区教程看到（C 级）。在 Astro 构建后推送新页面的脚本示例：

```js
// scripts/push-baidu.mjs：构建后运行，node scripts/push-baidu.mjs
import { readFile } from "node:fs/promises";

const SITE = "https://example.com";
const TOKEN = process.env.BAIDU_PUSH_TOKEN;
const xml = await readFile("dist/sitemap-0.xml", "utf8");
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const res = await fetch(
  `http://data.zz.baidu.com/urls?site=${encodeURIComponent(SITE)}&token=${TOKEN}`,
  { method: "POST", headers: { "Content-Type": "text/plain" }, body: urls.join("\n") },
);
console.log(res.status, await res.text()); // 返回里有 success 和 remain（剩余配额）
```

配额有限，真实使用时只推新增或更新的 URL（推断：可以和上次构建的 sitemap 做差集）。

3. 搜狗站长平台（腾讯系）[S29]、神马站长平台（阿里系）[S30]、头条搜索站长平台（字节系，有「数据引入」「抓取频次」工具）[S27]：各注册一次，提交 sitemap。这些平台和 AI 回答之间的关系只有间接证据（智谱用搜狗和夸克 [S21]，阿里 AI 网关用夸克 [S13]），所以这一步标为「低成本、可能有用」（推断）。
4. 百度资源平台的「AI流量分析」「权威提交」入口登录后看一眼，有数据就记下来 [S25]。说明文档本稿没找到。

**第 4 步：确保大陆能打开。**

- 用自定义域名，不要只用 `*.pages.dev` 或 `*.workers.dev`（workers.dev 有过 SNI 阻断记录 [S65]，pages.dev 现状不明）。
- 用国内多地拨测工具（如 itdog、17ce）测一下首页和一篇教程页（C 级建议，来自社区）。
- 是否备案：只有走大陆 CDN 或服务器才必须 ICP [S39]。但豆包搜索的 `IcpHostOnly` 过滤说明备案在一些 AI 检索场景里是硬门槛 [S2]。有公司主体、打算长期做中国用户的，可以考虑备案加大陆节点（推断）。

**第 5 步：让页面像「机构官网」。** 豆包搜索把「中小型企业、机构官网」放在第 2 级，「普通小站」放在第 4 级 [S1]；Kimi 剔除「未经证实的自媒体」[S19]。具体做法（推断，厂商没公开判定规则）：

- 有「关于」页，写清运营主体（公司或个人）、联系方式、开源仓库地址。
- 每篇教程有作者、发布日期和更新日期（DeepSeek Search 返回 `date` 字段 [S15]，百炼有 `freshness` 过滤 [S12]）。
- 中文页面用中文写，不要只靠浏览器翻译（Q1 到 Q4 的实测会告诉你中文 AI 能否用英文页回答）。
- Astro 默认输出静态 HTML，正文在原始 HTML 里，这对不执行 JS 的爬虫是好事（03 稿有海外爬虫的数据；中国爬虫里只有百度公开了渲染爬虫 Baiduspider-render [S22]）。

### 3.3 Chrome 插件

1. Chrome Web Store 在大陆不能直接访问 [S64]，大陆 AI 爬虫很可能读不到详情页（推断）。所以在你自己的域名上做一个中文落地页：一句话说明、功能列表、截图、安装方法、隐私说明、常见问题、版本更新日志。
2. 如果插件也能在 Edge 上用，可以同时上架 Edge 加载项（推断：Edge 加载项在大陆能否访问、是否被中文 AI 收录，本稿没有查证）。
3. GitHub 仓库：README 写清产品名、一句话描述、安装方法。但 GitHub 禁止 Bytespider [S42]，所以别指望头条搜索从 GitHub 收录你；DeepSeek Search 能搜 `site:github.com` [S15]，用 3.1 节的命令确认你的仓库在不在。
4. 品牌名问题要自己先占住：Apollo9 的演示说明，一个名字在网上只有一篇文章时，AI 会照着那篇说 [S46]。在官网、GitHub、一个中文社区（掘金或 CSDN 文章页对爬虫开放 [S42]）各有一份事实准确的介绍。

### 3.4 会员站

1. 登录后的内容爬虫看不到，AI 也引用不了（推断，所有厂商的 Fetch 都只抓公开 URL [S15][S2]）。把定价、功能对比、常见问题、退款政策、示例内容做成公开页面。
2. 不要给爬虫和用户看不同内容（cloaking）。CAAC 标准明确列出「隐藏文本」等黑帽手段 [S49]（这是团体标准，自愿采用，但说明了行业共识）。
3. 公开页面上写的数字（用户数、评分）必须有来源。百付科技被罚的理由之一就是「综合评分99.6，市场占有率49%」没有依据 [S51]。

### 3.5 微信小程序

**微信搜索方向 [S31][S32][S33]：**

1. 内容页别放在 `web-view` 里，微信搜索不收录 web-view [S31]。
2. 每个内容页的 URL 自带全部参数，能直接打开；用 `navigator` 组件跳转 [S31]。
3. 每页用 `wx.setNavigationBarTitle` 设标题，用 `onShareAppMessage` 设缩略图 [S31]。
4. 删掉过时的 `sitemap.json` 教程依赖，它已下线 [S33]。
5. 新内容上线后用 `submitpages` 推送（服务端调用，需要 access_token）[S32]：

```bash
curl -s -X POST "https://api.weixin.qq.com/wxa/search/wxaapi_submitpages?access_token=$ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pages":[{"path":"pages/tutorial/detail","query":"id=123","data_list":[ ... ]}]}'
# data_list 里每项的 @type、update、content_id 等字段按「内容接入」文档填写 [S32]
```

6. 在服务端识别微信爬虫：请求头带 `X-WXApp-Crawler-*` 三个字段，按文档验签；UA 含 `mpcrawler`，场景值 1129 [S31]。爬虫访问时不要弹登录。

**小微（微信 AI）方向 [S34][S35][S36]：**

1. 在「微信公众平台 - 基础功能 - AI 能力」申请「开发模式」[S34]。
2. 把一个核心功能（比如「查一篇教程」「生成一份提示词」）封装成 SKILL：`SKILL.md` 写业务流程；`mcp.json` 里每个原子接口写好 `description`（功能、调用时机、不适用场景）和 `inputSchema.description`（参数语义、取值来源、缺省处理）[S36]。
3. 原子接口返回的 `content` 写本次结果和下一步动作，这是模型最看重的信息源 [S36]。
4. 做好「页面接力」，接力页面会影响评测结果 [S34]。
5. 上线后在 We分析看「问题发生率」，超过 20% 算超标 [S35][S37]。

**公众号配合（推断）：** 元宝消费端覆盖公众号 [S10][S11]，外部 AI 读不到公众号 [S42]。所以发一篇公众号文章介绍小程序（写清小程序名称和搜索方式），主要服务元宝和微信搜一搜，不要指望 DeepSeek 或豆包读到。

### 3.6 站外内容：去哪发

只列有证据的部分，其余标推断：

| 目标 | 渠道 | 证据 |
|---|---|---|
| 豆包 | 抖音短视频，标题写成用户会问的问题 | 新榜 31.8%、关键词覆盖率 ρ=+0.149（弱相关）[S56]；QuestMobile 美妆品类 66.2% [S55] |
| 豆包权威等级 | B 站（被豆包搜索列为「正常权威」综合平台）；头条、腾讯新闻、网易等的高粉丝认证作者 | [S1] |
| 元宝 | 公众号、视频号 | [S10][S11] |
| 文心 | 百度系（百家号、百科、知道），知乎 | QuestMobile 文心对百度 81.7%、对知乎 19.6%（品类局限）[S55] |
| 千问 | 垂类平台，攻略类用 B 站 | [S54] |
| 多平台通用 | 知乎回答 | 量子位 630 条样本里 29.9% [S57]；但知乎 robots 只放行搜索引擎 [S42]，影响路径是推断 |
| 技术问题 | 掘金、CSDN 文章 | robots 对所有爬虫开放 [S42]；引用占比没有方法公开的数据 |
| V2EX、少数派 | 产品发布 | robots 开放 [S42]；引用数据没有 |
| 小红书 | 真人实测笔记 | robots 对外部 AI 关闭 [S42]；AI 托管账号会被封（04 稿 S48） |

---

## 4. 结合 AI 怎么做

**可以交给 AI 的：** 生成测试问题、整理 3.1 节的采样记录、审 robots.txt、把英文页改写成中文初稿、写小程序 SKILL 的 `mcp.json` 描述、根据站长平台数据写周报。

**不该交给 AI 的：** 代发知乎、小红书、公众号（小红书封 AI 托管账号，见 04 稿）；生成虚构测评、排名、用户评价（3·15 和百付案正是这种 [S46][S51]，清朗行动把「伪造权威数据」列为投毒 [S43]）。

### 4.1 生成实测问题集

```text
我是独立开发者，产品如下：
- 产品名：{名称}，英文名：{英文名}
- 类型：{Chrome 插件 / 教程站 / 会员站 / 微信小程序}
- 一句话说明：{…}
- 官网：{域名}，GitHub：{仓库}

请生成用来测试「中文 AI 助手（豆包、DeepSeek、元宝、千问、Kimi、文心）能否找到并正确介绍我」的问题集：
1. 品牌名问题 5 个（直接问产品名，含中文名、英文名、常见错写）。
2. 读链接问题 3 个（让 AI 阅读我给的具体 URL，并提出只有读过页面才能答对的细节问题，附上标准答案）。
3. 品类问题 10 个（用户不知道我的产品时会怎么问，用口语，像真人在手机上打字）。
4. 对比问题 5 个（我和 {竞品} 的区别）。
输出成表格：编号、问题、类型、标准答案或判定标准。不要编造产品没有的功能。
```

### 4.2 统计采样结果

```text
下面是我在 6 个中文 AI 助手里，同一批问题、每题问 2 次的原始记录（每行：平台、题号、第几次、回答全文、引用 URL 列表）。
请只根据记录做统计，不要凭印象：
1. 每个平台：提到我的次数 / 总次数；描述准确的次数。
2. 被引用的域名排行（按出现次数），标出哪些是我能控制的（我的官网、GitHub、我发的文章）。
3. 读链接题里，哪些回答和标准答案不符却没有报错（疑似编造），逐条列出。
4. 每个平台给一句结论：是「没收录」「收录了但排不上」还是「能读到但描述错」。
样本很小，请在结论里写明样本量，不要给出百分比以外的推断。
{粘贴记录}
```

### 4.3 审 robots.txt 和 Cloudflare 设置

```text
这是我网站当前线上的 robots.txt（curl 抓回来的原文）和 Cloudflare 的 AI 爬虫设置截图文字。
请逐条检查下列爬虫会被允许还是禁止，并说明是哪一条规则起作用：
Baiduspider、Baiduspider-render、Sogou web spider、Bytespider、YisouSpider、360Spider、
Googlebot、bingbot、GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot。
背景事实（请以此为准，不要用你自己的记忆替换）：
- Bytespider 是头条搜索的官方爬虫（zhanzhang.toutiao.com/docs/intro/26899）。
- Cloudflare 托管 robots.txt 会对 Bytespider 写 Disallow: /。
如果同一个爬虫被多组规则匹配，说明不同解析器可能的不同结果，不要只给一个结论。
{粘贴 robots.txt}
```

### 4.4 写小程序 SKILL 的 mcp.json 描述

```text
我在做微信小程序「AI 开发模式」的 SKILL。官方建议（developers.weixin.qq.com/miniprogram/dev/ai/best-practices/skill.html）：
- 原子接口的 description 写「接口本身的功能、调用时机、不适用场景」；
- inputSchema.description 写「参数语义、取值来源、缺省处理」；
- 原子接口返回的 content 写「本次调用结果与下一步动作」。
我的小程序功能：{功能列表}。用户常见说法：{例如「帮我找一个画海报的提示词」「上次那个再来一份」}。
请为每个功能起草一个原子接口的 description、inputSchema（含每个字段的 description）和一条示例返回 content。
用中文，句子短，不要写营销话术，不要承诺做不到的功能。最后列出你认为容易让模型选错接口的地方。
```

### 4.5 把英文教程改写成中文平台初稿

```text
把下面这篇英文教程改写成一篇掘金文章初稿：
- 保留所有命令、代码和版本号，原样不改。
- 开头先写读者要解决的问题，再给解法，最后一段才提到我的工具，并写出它的一个局限。
- 不要加原文没有的数据和评价，不要写「业界第一」「最好用」之类的话。
- 文末写明原文链接和更新日期。
{粘贴英文原文}
```

---

## 5. 误区和争议

1. **「中文 AI 的信源比例」类数字（DeepSeek 知乎 25%、元宝公众号 44.1%、豆包 60% 来自头条抖音等）。** 02、04 稿已指出多数出自发稿平台的营销文。本稿能找到的一手数据只有 QuestMobile 和新榜（经 IT之家转述），都不披露样本量，而且是按品类测的（汽车、美妆、手机、旅游、保险）[S54][S55][S56]。开发者工具、技术教程类问题没有任何一手数据。不要把美妆品类的「抖音 66.2%」套到开发者产品上。
2. **「标题和问题语义相似就能被豆包引用」。** 新榜给的相关系数 ρ=+0.149 和 +0.117 [S56]，相关性很弱。可以作为写标题的参考，不是规律。
3. **「Bytespider 是豆包的爬虫，挡了它豆包就不引用你」或反过来。** 官方只说它是头条搜索的爬虫 [S27]。和豆包回答、豆包训练的关系都没有官方说明。
4. **「元宝能搜公众号，所以腾讯的搜索 API 也能」。** 元宝搜索 API 明说不含公众号 [S7]。消费端和 API 不一样。
5. **「小程序配 sitemap.json 就能被微信收录」。** sitemap.json 已下线 [S33]。
6. **「3·15 证明发两篇软文两小时就能上 AI 推荐」。** 两小时生效的是直接问一个只有那篇文章提到的产品名；品类推荐用了 11 篇、三天，只在两个没点名的模型里生效 [S46]。而且这个做法现在明确属于网信办点名的「使用GEO技术恶意营销」[S43]。
7. **「百度百科屏蔽了 Google 和 Bing」（2024 年报道）。** 现在的 robots.txt 已给 Googlebot 和 bingbot 开放大部分路径 [S42][S63]，这条已过时。
8. **「有团体标准，GEO 服务就有保障」。** 三套都是团体标准，自愿采用；其中 CAAC 标准的编委主任来自 GEO 相关厂商 [S49]；AIIA/T 0277 只有服务商自己在宣传 [S50]。「通过某某评测」不等于效果承诺。
9. **「必须 ICP 备案才能被中文 AI 收录」。** 没有任何厂商这么说。豆包搜索默认不过滤未备案站 [S2]；DeepSeek 能搜 GitHub [S15]。但备案确实是豆包搜索的一个可选过滤条件 [S2]，所以「备案有一定好处」可以说，「必须备案」不能说。
10. **DeepSeek「没有官方搜索」的旧说法。** 2026-11-13 已有官方 Search 接口和「自研搜索引擎」的表述 [S14][S15]。02 稿和 06 稿的相关结论应更新。

---

## 6. 还没查清的问题

1. **豆包 App、元宝 App、千问 App 是否和各自的搜索 API 用同一个索引、同一套权威分级。** 厂商都没有直说。元宝 API 文档说「结合元宝 App 联网搜索应用实践」[S8]，豆包搜索没有类似表述。
2. **豆包搜索怎么判定一个站是「中小型企业、机构官网」还是「普通小站」，有没有申诉或认证入口。** 文档只给例子 [S1]。
3. **DeepSeek 的爬虫 UA 和 robots.txt 行为。** 只在抖音的 robots.txt 里见到 `deepseekbot` [S42]。DeepSeek 自己没有文档。Fetch 接口的 UA 本稿没有实测（需要一个能看日志的站和 API Key）。
4. **Bytespider 是否遵守 robots.txt，以及是否用于豆包。** 官方文档没写 [S27]，第三方说法相反 [S61][S62]。
5. **百度资源平台「权威提交 / 权威溯源」「AI流量分析」的规则和数据口径。** 只看到入口 [S25]。
6. **夸克搜索是否使用神马索引，在神马站长平台提交是否影响夸克和千问。** 没找到官方说法。
7. **360Spider、YisouSpider 的官方 UA 和 IP 验证方法。** 只有第三方目录。
8. **小程序后台是否还有「页面收录」开关。** sitemap.json 下线后的替代设置没找到官方说明。
9. **pages.dev 在大陆的当前可达性，以及没开 China Network 的 Cloudflare 站在大陆的抓取成功率。** 需要实测。
10. **新榜智汇报告原文、QuestMobile 和艾瑞报告的样本量。** 公开版都没给，或者在图片里。
11. **开发者类问题（插件推荐、编程教程）在中文 AI 里的信源分布。** 本稿没有找到任何方法公开的数据。这是本书可以自己做的原创研究：用 4.1 节的问题集，6 个平台 × 每题 3 次，公开原始记录。
12. **三套 GEO 团体标准的全文。** 本稿只读到新闻稿。
13. **北京百付科技案的处罚决定书原文。** 本稿通过南都转述读到 [S51]。

---

## 7. 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | 站点权威度分级说明 | 火山引擎（豆包搜索） | 2026-08-21 更新 | https://docs.volcengine.com/docs/networked-search/site-authority-rating-description | 官方文档（已读原文） | A | 四级权威；中小企业、机构官网为「正常权威」，普通小站为「一般不权威」 |
| S2 | 豆包搜索 Custom版 API | 火山引擎 | 2026-10-30 更新 | https://docs.volcengine.com/docs/networked-search/networked-search | 官方文档（已读原文） | A | Sites、BlockHosts、AuthInfoLevel、IcpHostOnly（默认不限）；每月 500 次免费 |
| S3 | 豆包搜索 Global版 API | 火山引擎 | 2026-09-22 更新 | https://docs.volcengine.com/docs/networked-search/doubao-search-global-edition | 官方文档（已读原文） | A | 有 Global 版，仅按量后付费；不支持主动权威控制 |
| S4 | 火山引擎上线豆包搜索服务 | IT之家 | 2026-07-28 | https://www.ithome.com/0/982/610.htm | 新闻（搜索结果，02 稿已读） | C | 融合字节独家内容；按站点和创作者分级 |
| S5 | 元宝搜索 产品概述 | 腾讯云 | 2026-11-06 更新 | https://cloud.tencent.com/document/product/1806/121794 | 官方文档（已读原文） | A | 全网公开资源加腾讯新闻、搜狗百科、企鹅号；结合元宝 App 实践 |
| S6 | 元宝搜索 产品动态 | 腾讯云 | 2026-10-09 更新 | https://cloud.tencent.com/document/product/1806/121792 | 官方文档（已读原文） | A | 2025-07-01 上线「联网搜索API」，2026-10-09 更名「元宝搜索」 |
| S7 | 元宝搜索 常见问题 | 腾讯云 | 2026-10-09 更新 | https://cloud.tencent.com/document/product/1806/121804 | 官方文档（已读原文） | A | 因版权问题暂不支持微信公众号内容 |
| S8 | 元宝搜索 API 文档 | 腾讯云 | 2026-10-27 更新 | https://cloud.tencent.com/document/product/1806/121811 | 官方文档（已读原文） | A | Site 指定或排除域名；Mode 区分公开网页与权威垂直信源 |
| S9 | 元宝搜索 产品优势 | 腾讯云 | 2026-10-09 更新 | https://cloud.tencent.com/document/product/1806/121795 | 官方文档（已读原文） | A | 千亿级别网页索引 |
| S10 | 腾讯全新搜索产品「元宝搜索」正式上线，能搜微信公众号、视频号 | IT之家（凤凰网大风号转载） | 2026-11-11 | https://tech.ifeng.com/c/8xxy9p18wmX | 新闻，转述腾讯云发布（已读原文） | C | so.qq.com；覆盖公众号、视频号、学术；157 个权威信源；年份为 2026 |
| S11 | 腾讯元宝（App Store 介绍） | 腾讯 | 2025-2026 | https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AF%E5%85%83%E5%AE%9D-deepseek-r1%E6%9C%80%E6%96%B0%E6%A8%A1%E5%9E%8B%E6%8E%A5%E5%85%A5/id6480446430 | 官方应用描述（搜索结果） | A | 联网搜索覆盖公众号、视频号等腾讯生态信源 |
| S12 | 联网搜索（大模型服务平台百炼） | 阿里云 | 2026 | https://help.aliyun.com/zh/model-studio/web-search | 官方文档（已读原文） | A | search_strategy、assigned_site_list、freshness；英文场景推荐 agent；未写引擎 |
| S13 | 联网搜索（API 网关 AI 网关） | 阿里云 | 2026 | https://help.aliyun.com/zh/api-gateway/ai-gateway/user-guide/networked-search/ | 官方文档（已读原文） | A | 搜索引擎目前仅支持夸克（阿里云信息查询服务） |
| S14 | DeepSeek 发布全家桶应用 API | DeepSeek | 2026-11-13 | https://api-docs.deepseek.com/zh-cn/news/news261113 | 官方公告（已读原文） | A | 开放 deepseek_web_search、deepseek_read_url、Search、Fetch |
| S15 | 网页搜索与抓取 | DeepSeek | 2026-11 | https://api-docs.deepseek.com/zh-cn/guides/search | 官方文档（已读原文） | A | 自研搜索引擎；site:/lang: 语法；authority 0-4；Fetch 受站点策略影响；5 元/千次 |
| S16 | 联网工具 | DeepSeek | 2026-11 | https://api-docs.deepseek.com/zh-cn/guides/web_tools | 官方文档（已读原文） | A | 引用格式；url_not_accessible、url_not_allowed 错误码；跨语言引用示例 |
| S17 | DeepSeek 隐私政策 | DeepSeek | 2026-02-10 | https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html | 官方文档（已读原文） | A | 只说搜索服务会接收用户输入，未写搜索服务商 |
| S18 | DeepSeek API 原生接入联网搜索能力 | 80aj（转 Linux.do） | 2026-08-05 | https://www.80aj.com/2026/08/05/deepseek-api-web-search/ | 社区发现（已读原文） | C | 0731 版 API 可用 web_search；已被 S14 正式化 |
| S19 | Kimi 联网搜索功能介绍 | 月之暗面 | 2026（抓取于 2026-11-14） | https://www.kimi.com/zh-cn/help/features/search | 官方帮助（已读原文） | A | 100+ 可信来源；剔除低质聚合站和未证实自媒体；可检索英文、日文资料 |
| S20 | 使用联网搜索 | Kimi 开放平台 | 2026 | https://platform.kimi.com/docs/guide/use-web-search.md | 官方文档（已读原文） | A | 原样搜索；sites 过滤；受目标站反爬策略影响；未写引擎 |
| S21 | 联网搜索（Web Search） | 智谱 AI 开放平台 | 2026 | https://docs.bigmodel.cn/cn/guide/tools/web-search | 官方文档（已读原文） | A | 自研加搜狗、夸克；搜狗覆盖腾讯生态和知乎；search_domain_filter |
| S22 | 【官方说法】只需两步，正确识别百度蜘蛛（User-Agent） | 百度搜索资源平台 | 2017-04-27 | https://ziyuan.baidu.com/college/articleinfo?id=1002 | 官方文档（已读原文） | A | Baiduspider、Baiduspider-render；IP 不公开；反向 DNS 验证 |
| S23 | 普通收录 使用说明 | 百度搜索资源平台 | 2026（抓取于 2026-11-14） | https://ziyuan.baidu.com/linksubmit/index | 官方工具页（已读原文） | A | 只加快抓取，不解决收录 |
| S24 | 「快速抓取」使用说明与权益获取 | 百度搜索资源平台 | 2024-04-19 | https://ziyuan.baidu.com/college/articleinfo?id=3549 | 官方文档（已读原文） | A | VIP 或活动获得权益；优先抓取，不保证收录 |
| S25 | AI流量分析（及导航中的权威溯源入口） | 百度搜索资源平台 | 2026（抓取于 2026-11-14） | https://ziyuan.baidu.com/aiflow/index | 官方工具页（已读原文，未登录） | A | 工具存在；未登录只显示「专业问答-小程序的生效量和点展统计」 |
| S26 | AppBuilder 百度 AI 搜索文档目录 | 百度智能云 | 2026 | https://ai.baidu.com/ai-doc/AppBuilder/Emaxwwz9m | 官方文档（已读原文） | A | 百度 AI 搜索、百度搜索、网页黑名单、特定 query 干预等组件 |
| S27 | 关于Bytespider | 头条搜索站长平台 | 未标日期（抓取于 2026-11-14） | https://zhanzhang.toutiao.com/docs/intro/26899 | 官方文档（经渲染服务读原文） | A | Bytespider 是头条搜索爬虫；10 个 IP 段；*.bytedance.com 反向 DNS；未提 robots 与豆包 |
| S28 | 搜狗帮助中心 站长指南 | 搜狗 | 2026（页脚） | https://www.sogou.com/docs/help/webmasters.htm | 官方文档（已读原文） | A | sogou spider 支持 robots，生效需几周；偏好静态网页 |
| S29 | 搜狗站长平台首页 | 搜狗 | 2026（抓取于 2026-11-14） | https://zhanzhang.sogou.com/ | 官方平台页（已读原文） | A | 联系邮箱 zzpt@tencent.com；收录索引查询工具 |
| S30 | 神马站长平台服务条款 | 神马搜索 | 2020-08 生效 | https://zhanzhang.sm.cn/ | 官方条款（已读原文） | A | 夸克、神马同为阿里业务平台 |
| S31 | 小程序搜索优化指南 | 微信开放文档 | 2026-06-16 | https://developers.weixin.qq.com/miniprogram/dev/framework/search/seo.html | 官方文档（已读原文） | A | mpcrawler、场景值 1129、验签头；不收录 web-view |
| S32 | 搜一搜数据推送（submitpages） | 微信开放文档 | 2026 | https://developers.weixin.qq.com/miniprogram/dev/server/API/wxsearch/api_submitpages.html | 官方文档（已读 Markdown 版） | A | 推送页面路径、参数和结构化数据给微信搜索 |
| S33 | 全局配置（app.json） | 微信开放文档 | 2026 | https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.md | 官方文档（已读原文） | A | sitemapLocation 下注明「sitemap.json 已下线」 |
| S34 | 小程序 AI 开发模式（beta）接入指南 | 微信开放文档 | 2026 | https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html | 官方文档（已读 Markdown 版） | A | SKILL＝SKILL.md＋mcp.json＋原子接口；申请入口 |
| S35 | 使用前必读（AI 能力 上线与离场须知） | 微信开放文档 | 2026-11 | https://developers.weixin.qq.com/miniprogram/dev/ai/launch-and-exit/must-read.html | 官方文档（已读 Markdown 版） | A | 按 SKILL 描述调用；问题发生率 >20% 超标；8.0.79 以上 |
| S36 | SKILL 设计建议 | 微信开放文档 | 2026 | https://developers.weixin.qq.com/miniprogram/dev/ai/best-practices/skill.html | 官方文档（已读 Markdown 版） | A | content 权重最高，其次 description 与 inputSchema.description |
| S37 | AI 能力 更新日志 | 微信开放文档 | 2026-11-11 | https://developers.weixin.qq.com/miniprogram/dev/ai/changelog.html | 官方文档（已读 Markdown 版） | A | 2026-11-11 开放评测与提审；We分析新增故障排查 |
| S38 | China Network FAQ | Cloudflare | 2026-04-16 | https://developers.cloudflare.com/china-network/faq/ | 官方文档（已读原文） | A | 需 ICP 和京东云审核；ICP 吊销后流量改走境外节点 |
| S39 | ICP | Cloudflare | 2026 | https://developers.cloudflare.com/china-network/concepts/icp/ | 官方文档（已读原文） | A | 在大陆服务器或 CDN 上托管需备案或许可证；备案 1-2 个月 |
| S40 | Managed robots.txt | Cloudflare | 2026-11-02 | https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/ | 官方文档（已读原文） | A | 托管 robots.txt 对 Bytespider 等 Disallow: / |
| S41 | AI Crawler and Agent access policies | Cloudflare | 2026-11-02 | https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/ | 官方文档（已读原文） | A | 按 Search、Agent、Training 行为分别设置 |
| S42 | robots.txt 实测（知乎、小红书、公众号、今日头条、抖音、掘金、CSDN、B 站、V2EX、少数派、百度百科、GitHub） | 本稿 | 2026-11-14 | 各站 `/robots.txt`（如 https://www.zhihu.com/robots.txt） | 可复现公开实验 | B | 知乎、小红书、公众号、头条对外部 AI 爬虫基本关闭；掘金、CSDN 开放；GitHub 禁 Bytespider；抖音列出 deepseekbot |
| S43 | 中央网信办部署开展「清朗·整治AI应用乱象」专项行动 | 新华网（来源：网信中国） | 2026-04-30 | https://www.news.cn/politics/20260430/5a335918ff184d098c169c3dc0401508/c.html | 官方通知转载（已读原文） | A | AI 数据投毒含「使用GEO技术恶意营销」；要求信源交叉验证、标注引用链接 |
| S44 | 中央网信办深入开展「清朗·整治AI应用乱象」专项行动第一阶段工作 | 新华网（来源：中国网信网） | 2026-07-06 | https://www.news.cn/politics/20260706/4ce1356eb1b34e878c3fa1e2d9e5da1f/c.html | 官方通报（已读原文） | A | 处置 1.4 万余款 AI 产品；DeepSeek 在采集预处理环节加异常检测 |
| S45 | 315晚会曝光 给AI投毒已成产业链 | 光明网（来源：环球时报，央视财经） | 2026-03-15 | https://m.gmw.cn/2026-03/15/content_1304377376.htm | 新闻（已读原文） | C | 力擎GEO系统；两个大模型推荐虚构手环；「花个几百万投点毒」 |
| S46 | 3·15 晚会 AI 投毒报道（央视财经） | 澎湃新闻 | 2026-03-15 | https://www.thepaper.cn/newsDetail_forward_32773464 | 新闻（已读原文） | C | Apollo9；2 篇后 2 小时品牌名问题生效；11 篇三天后品类问题两模型推荐 |
| S47 | 315 晚会 AI 投毒解读 | 澎湃湃客 | 2026-03 | https://www.thepaper.cn/newsDetail_forward_32789174 | 自媒体解读（已读原文） | D | 复述节目画面；模型未点名 |
| S48 | 国内首部GEO可信传播团体标准8月11日正式发布 | 新华网 | 2026-08-12 | https://www.news.cn/digital/20260812/3323a47bda40437f8a42ee135670ab2f/c.html | 新闻（起草方媒体，已读原文） | C | T/CAPT 026—2026；三区分治；白帽与黑帽界线 |
| S49 | GEO服务告别「无标可依」 行业首份团体标准公布 | 证券时报（同花顺转载） | 2026-09-16 | https://news.10jqka.com.cn/20260916/c679983389.shtml | 新闻（已读原文） | C | T/CAACCHINA 五项；最低样本量；禁提示词注入、隐藏文本；编委主任为秒针营销科学院院长 |
| S50 | 提及 AIIA/T 0277-2026 的 GEO 服务商文章 | 凤凰网科技（服务商稿件） | 2026 | https://tech.ifeng.com/c/8wob0MycyRG | 营销内容（已读原文） | D | 称某服务商通过信通院 GEO 服务可信评测；未见标准原文 |
| S51 | 虚构荣誉牌匾，百付科技操纵企业AI搜索排名被罚5万元 | 南都N视频 | 2026-06-25 | https://m.mp.oeeee.com/a/BAAFRD0000202606251615460.html | 新闻，转述朝阳区政府通报（已读原文） | C | 按 AI 引用的网站反向投放软文；依《反不正当竞争法》第九条罚款 |
| S52 | 厘清GEO「优化」与「投毒」边界 | 第一财经（陈兵、朱家熠） | 2026-10-26 | https://www.yicai.com/news/103409872.html | 法学评论（已读原文） | D | 正常 GEO 不当然违法；看真实性、正当性、可识别性；证据要多轮统计 |
| S53 | 北京组织百度及腾讯等8间龙头互联网企业签自律公约 | 财闻 | 2026-10 | https://www.caiwennews.com/article/1674742.shtml | 新闻（搜索结果） | C | AI 深度合成商业宣传须显著标识，禁止借 AI 制造虚假信息 |
| S54 | QuestMobile AI平台采信逻辑与信源偏好研究报告 | QuestMobile（36氪经授权发布） | 2026 | https://www.36kr.com/p/3825497154196353 | 第三方测评，样本未披露（已读原文） | C | 豆包引用量大且偏抖音头条；千问偏懂车帝、大众点评；DeepSeek 偏综合站 |
| S55 | QuestMobile 2026年AI电商与消费品类GEO研究报告 | QuestMobile（36氪经授权发布） | 2026 | https://www.36kr.com/p/3855204672574728 | 第三方测评，样本未披露（已读原文） | C | 豆包抖音系 66.2%、文心百度 81.7%；手机品类厂商官网是补充信源 |
| S56 | 报告称豆包对抖音的引用权重飙升 | IT之家（转述新榜智汇） | 2026-10-27 | https://ithome.com/1/018/259.htm | 第三方监测，二手（已读原文） | C | 10.79%→31.8%；关键词覆盖率 ρ=+0.149，语义相似度 +0.117 |
| S57 | 搜索SEO被AI重塑，专业内容社区价值凸显 | 量子位智库 | 2025-05-21 | https://www.qbitai.com/2025/05/285761.html | 小样本测评，方法公开（已读原文） | C | 30 题×7 款×3 次=630 条；知乎 29.9%、B 站 7.6% |
| S58 | 2026年汽车行业AI信源影响力指数报告 | 艾瑞咨询（36氪经授权发布） | 2026-06-15 | https://www.36kr.com/p/3853790497035271 | 第三方测评（已读原文，方法在图片中） | C | 「百万级」评测数据；汽车垂媒主导，汽车之家第一 |
| S59 | AI搜索时代2026品牌营销策略洞察：智能硬件篇 | CBNData × WhatTheyOS | 2026-09-16 | https://cbndata.com/information/295781 | 厂商联合报告（已读原文） | D | 三品类近三月提问超 430 万次；WhatTheyOS 为 GEO 数据平台 |
| S60 | 2026年一季度AI应用价值榜 | 每日经济新闻 × QuestMobile | 2026-04-21 | https://www.nbd.com.cn/articles/2026-04-21/4350446.html | 行业数据，样本未披露（已读原文） | C | 豆包 3.45 亿、千问 1.66 亿、DeepSeek 1.27 亿、元宝 5734.6 万；小红书点点为 AI 搜索 |
| S61 | Bytespider（Decoded） | ppc.land | 2026 | https://ppc.land/bytespider/ | 行业媒体（已读原文） | C | 引述官方 UA 和 IP 段；称官方说遵守 robots，本稿在官方页未见此句 |
| S62 | ByteDance's Bytespider scraper bot | Fortune | 2024-10-03 | https://fortune.com/2024/10/03/bytedance-tiktok-bytespider-scraper-bot/ | 新闻（搜索结果） | C | 报道称不遵守 robots.txt（2024 年） |
| S63 | Baidu blocks Google, Bing from scraping content | South China Morning Post | 2024-08 | https://amp.scmp.com/tech/big-tech/article/3275717/baidu-blocks-google-bing-scraping-content-amid-demand-data-used-ai-projects | 新闻（搜索结果） | X | 当前百科 robots.txt 已对 Googlebot、bingbot 开放大部分路径（S42），已过时 |
| S64 | 受制于网络环境……离线版 Chrome 插件 | 少数派 | 年份未核实（较早） | https://sspai.com/post/38608 | 文章（搜索结果） | C | 国内下载使用 Chrome 官方商店有阻碍 |
| S65 | GDIndex issue #206（workers.dev 被 SNI 阻断） | GitHub 用户讨论 | 约 2022 | https://www.github.com/maple3142/GDIndex/issues/206 | 社区讨论（搜索结果） | C | workers.dev 曾被 SNI 阻断，建议绑定自有域名；可能已变化 |
