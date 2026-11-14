// Wiki 条目：每条同样的结构 —— 一句话（one）、比喻（like）、放到你的产品上（here，最多两段）、可选的清单表（list）、常见误区（myths）、相关（see）。
// 文字里可以用 **粗体**、==荧光笔==（每条最多一处）、`代码`、[外链](https://…) 和 [站内链接](/路径/)（lib/md.js 里简单转换）。
// 写法照 MAINTAINING.md 的「说人话」：短句、一句一个意思、新词当场解释。
// step: 对应的完整教程步骤；howto: 对应的 How-to（要 ready 才会出链接）。
// sources: 这一条里事实说法的出处 id（sources.js），页面暂不显示，留给核对和以后显示用。

export const WIKI_GROUPS = ["基本概念", "AI 怎么找答案", "爬虫和索引", "内容和引用", "测量", "风险和误区"];

export const WIKI = [
  // ---- 基本概念 ----
  {
    slug: "geo", title: "GEO 是什么", group: "基本概念",
    one: "GEO 是让你的产品出现在 AI 的回答里，并且被它引用。",
    like: "以前是让搜索结果第一页有你。现在是让 AI 回答问题时，说出你的名字，再附上你的链接。",
    here: [
      "这个词出自 2023 年的一篇论文，全称 Generative Engine Optimization。有人问 AI「有什么好用的书签导出插件」，AI 会去搜一圈、读几个网页，再写一段回答。GEO 做的事，就是让它搜得到你、读得懂你、愿意提你。",
      "Google 的官方说法是：为 AI 搜索做优化，==仍然是 SEO==。所以大部分基本功和 SEO 是同一套。GEO 在上面多加几件事：重复测量、争取别人提到你、各处说法一致。",
    ],
    myths: [
      "「GEO 能让可见度提升 40%」：这是 2023 年在一个模拟环境里测的。后来更真实的复现里，多数方法没有效果。",
      "「SEO 已死，改做 GEO」：被搜索检索到仍是被引用的门槛。",
    ],
    see: ["aeo-llmo", "training-vs-retrieval", "rag"],
    step: 0,
    sources: ["01-S1", "01-S28", "01-S2", "01-S12"],
  },
  {
    slug: "aeo-llmo", title: "AEO、LLMO、AI SEO", group: "基本概念",
    one: "AEO、LLMO、AI SEO 和 GEO 说的基本是同一件事，叫法不同。",
    like: "像「手机」「移动电话」「智能机」：不同的人、不同年份的叫法，指的是一样东西。",
    here: [
      "AEO 是 Answer Engine Optimization，比 GEO 早，最早针对精选摘要和语音助手。LLMO 是 Large Language Model Optimization，有人特指「让模型记住你」。Google 和微软的官方文档把 AEO 和 GEO 并列着用。",
      "看到服务商把这几个词当成不同的服务分开卖，就多问一句：具体做的是什么。",
    ],
    list: [
      ["GEO", "生成式引擎优化，学术界和本书用的词"],
      ["AEO", "答案引擎优化，2025 年后常当 GEO 的同义词"],
      ["LLMO", "大模型优化，含义因人而异"],
      ["AI SEO", "泛称，没有固定定义"],
    ],
    myths: [
      "「AEO 和 GEO 是两套方法」：几篇行业文章都说它们多是同一件事的不同叫法。",
    ],
    see: ["geo"],
    step: 0,
    sources: ["01-S62", "01-S63", "01-S28", "01-S41"],
  },
  {
    slug: "training-vs-retrieval", title: "训练数据和实时检索", group: "基本概念",
    one: "AI 说出你的名字有两条路：训练时记住了你，或者回答时现场搜到你。",
    like: "像问一个老店员推荐什么牌子。他可能凭记忆直接说，也可能当场翻一下最新的目录。",
    here: [
      "**训练这条路**慢：要等下一代模型训练、发布，多久能进去没有可靠测量。**检索这条路**快：页面被搜索索引收录后就有机会。两条路由不同的爬虫供料，可以分开开关。",
      "两条路会互相影响。一项研究发现，ChatGPT 会把它记得的品牌写进搜索用的子查询。小厂商几乎只在「有第三方页面提到它、又被搜到」时才被点名。",
    ],
    myths: [
      "「挡了训练爬虫，AI 就搜不到我」：训练和搜索是不同的爬虫，挡一个不影响另一个。",
    ],
    see: ["ai-crawler", "rag", "discovery-gap"],
    step: 0,
    sources: ["01-S36", "01-S38", "01-S33", "01-S12"],
  },
  {
    slug: "entity", title: "实体和实体卡", group: "基本概念",
    one: "实体是 AI 能认出来的一个具体东西：你的产品、你本人、你的公司。实体卡是你给它写的一份标准说明。",
    like: "像身份证：名字、类别、住址写在一处，别人核对时不会认错人。",
    here: [
      "对 AI 来说，「BookmarkMD」只是一串字，它要靠上下文判断这是什么。你在官网、商店页、README 里用同一句话说清名字、类别、平台、价格。这样 AI 更容易把这些说法认成同一个东西。",
      "实体卡就是把这些事实写进一个文件。内容是一句话介绍、适合谁、平台、价格、替代品、链接。以后让 AI 写任何文案，都先把实体卡贴给它。做法见[第 8 步](/guide/8-with-ai/)。",
    ],
    myths: [
      "「写了 JSON-LD 就等于有了实体」：结构化数据只是一种写法。页面上看得见的文字更要紧。",
    ],
    see: ["json-ld", "schema-org"],
    step: 8,
    sources: ["06-S25", "01-S12"],
  },
  {
    slug: "discovery-gap", title: "发现型问题（Discovery Gap）", group: "基本概念",
    one: "发现型问题是用户不知道你、只描述需求的提问。AI 在这类问题里很少提小产品，这个落差叫 Discovery Gap。",
    like: "像别人认得你的脸，但介绍「这个行业有哪些人」时想不起你。",
    here: [
      "一项研究测了 112 个 Product Hunt 热门产品。直接问名字，ChatGPT 认得 99.4%。问「今年最好的 AI 工具有哪些」，只有 3.32% 被提到。",
      "所以测量时要分开问。「BookmarkMD 是什么」只能说明 AI 认得你。「有什么好用的书签导出插件」才是你要追的问题。和被提到多少相关的是引用你的域名数和 Reddit 讨论，页面的 GEO 评分没有相关性。",
    ],
    myths: [
      "「AI 认得我，所以我做好 GEO 了」：认得和推荐是两回事。",
    ],
    see: ["mention-rate", "mention-vs-link"],
    step: 0,
    howto: "prompt-set",
    sources: ["01-S16"],
  },

  // ---- AI 怎么找答案 ----
  {
    slug: "rag", title: "RAG（检索增强生成）", group: "AI 怎么找答案",
    one: "RAG 是先搜资料、再照着资料写回答。联网的 AI 回答基本都是这样生成的。",
    like: "像开卷考试：先翻书找到相关几页，再照着写答案，并注明出自哪一页。",
    here: [
      "流程大致是：把问题改写成几个子查询，去搜索索引里取回网页。再挑出最相关的段落放进上下文，写回答并标上引用。Google 的文档说，RAG 也叫 grounding，用的是核心搜索排名系统。",
      "对你的产品来说，第一关是被检索到。一项研究分析了 15.8 万条 ChatGPT 回答。检索结果能解释 32% 的引用差异，页面本身的写法只解释 2.8%。",
    ],
    myths: [
      "「改写文字就能让 AI 引用我」：没被检索到，写得再好也进不了上下文。",
    ],
    see: ["grounding", "query-fan-out", "training-vs-retrieval"],
    step: 0,
    sources: ["01-S28", "01-S12", "01-S2"],
  },
  {
    slug: "grounding", title: "Grounding 和 grounding query", group: "AI 怎么找答案",
    one: "Grounding 是让 AI 的回答有网页做依据。AI 为此在后台发出的搜索词，叫 grounding query。",
    like: "像写报告时给每个结论配一条参考文献。grounding query 就是你在图书馆检索系统里敲的那几个词。",
    here: [
      "Google 把 grounding 当作 RAG 的另一个名字。Bing Webmaster Tools 的 AI Performance 报告会列出 grounding query：AI 在后台去搜的、比用户原话更短的主题词。",
      "这些词是你看不见的「新关键词」。打开 Bing 的报告，看哪些 grounding query 引用了你，再看你的页面有没有直接回答它们。",
    ],
    myths: [
      "「用户怎么问，AI 就怎么搜」：AI 会改写问题，搜的是改写后的词。",
    ],
    see: ["rag", "query-fan-out", "bing-webmaster-tools"],
    step: 2,
    sources: ["01-S28", "01-S42", "02-S21"],
  },
  {
    slug: "query-fan-out", title: "Query fan-out（查询扇出）", group: "AI 怎么找答案",
    one: "Query fan-out 是 AI 把一个问题拆成很多个子查询，同时去搜。",
    like: "像让助理调研「换哪款笔记本」：他会分头查价格、续航、评测、售后，再汇总给你。",
    here: [
      "Google 说 AI Mode 用 fan-out 把问题拆成子话题，Deep Search 可以发出数百次搜索。这解释了一个现象：AI Overviews 引用的页面，只有约 38% 排在原问题的 Google 前 10。",
      "你可以让 AI 模拟一遍：给它一个用户问题，让它列出可能的子查询。再对照你的页面，看缺哪些答案。只补现有页面缺的信息，别为每个子查询批量造页面。",
    ],
    myths: [
      "「为每个子查询做一个页面，就能多被引用」：Google 说这违反 scaled content abuse 政策。",
      "「Google 排第一就会被 AI 引用」：AI 搜的是子查询。原问题上排第一，子查询上不一定靠前。",
    ],
    see: ["rag", "grounding", "scaled-content-abuse"],
    step: 0,
    sources: ["01-S34", "01-S28", "01-S49"],
  },
  {
    slug: "ai-overviews", title: "AI Overviews", group: "AI 怎么找答案",
    one: "AI Overviews 是 Google 搜索结果顶部那段 AI 写的摘要。",
    like: "像图书馆前台先替你读几本书，写一段总结贴在书架最前面。",
    here: [
      "它用的就是 Google 搜索的索引和排名系统。Google 说，页面被索引、能显示摘要，就有资格出现，不需要额外的标记或文件。它带来的点击算在 Search Console 的网页搜索报告里。",
      "点击确实在变少。Pew 统计了 68,879 次搜索：出现 AI 摘要时，点击传统结果的比例是 8%，没有时是 15%。想退出它，可以用 Search Console 的「Search generative AI」开关，Google-Extended 管不到它。",
    ],
    myths: [
      "「挡 Google-Extended 就能退出 AI Overviews」：不能，它不影响 Google 搜索。",
      "「要加专门的 schema 才能进 AI Overviews」：Google 说不需要。",
    ],
    see: ["ai-mode", "google-extended"],
    step: 2,
    sources: ["01-S30", "01-S28", "01-S43", "01-S31", "01-S33"],
  },
  {
    slug: "ai-mode", title: "AI Mode", group: "AI 怎么找答案",
    one: "AI Mode 是 Google 搜索里的对话模式，整页都是 AI 回答，可以追问。",
    like: "AI Overviews 是贴在书架前的一张总结，AI Mode 是坐下来和图书管理员聊。",
    here: [
      "它也用 Google 搜索的索引，并用 query fan-out 把问题拆成很多子查询去搜。Ahrefs 的一项研究发现，两者结论的语义相似度达 86%，引用的网址只重合 13.7%。",
      "Search Console 的生成式 AI 报告把 AI Overviews 和 AI Mode 合在一起算展示次数，没有点击数据。",
    ],
    myths: [
      "「进了 AI Overviews 就进了 AI Mode」：两者引用的网址重合很少。",
    ],
    see: ["ai-overviews", "query-fan-out"],
    step: 7,
    sources: ["01-S34", "05-S11", "02-S13"],
  },

  // ---- 爬虫和索引 ----
  {
    slug: "ai-crawler", title: "三类 AI 爬虫", group: "爬虫和索引",
    one: "AI 爬虫是 AI 公司派来读网页的程序，分三类：训练、搜索、用户触发。",
    like: "像图书馆派来的三种人。采购员买书回去收藏（训练），编目员登记新书（搜索），跑腿的替读者当场借一本（用户触发）。",
    here: [
      "想被 AI 回答引用，就放行搜索类和用户触发类。训练类可以单独关掉，各家都写明关掉训练不影响搜索展示。用户触发类多数声明「可能不遵守 robots.txt」，因为那是用户自己要读的。",
      "多数 AI 爬虫不执行 JavaScript，只读服务器直接给的 HTML。正文要在原始 HTML 里，Astro 静态站默认就满足。",
    ],
    list: [
      ["训练", "GPTBot、ClaudeBot、meta-externalagent"],
      ["搜索", "OAI-SearchBot、Claude-SearchBot、PerplexityBot"],
      ["用户触发", "ChatGPT-User、Claude-User、Perplexity-User"],
    ],
    listHead: ["类别", "例子（截至 2026-11）"],
    myths: [
      "「挡住训练爬虫，AI 就搜不到我」：训练和搜索是两个爬虫，挡一个不影响另一个。",
      "「robots.txt 能挡住所有 AI」：用户触发类多数不保证遵守，有的爬虫还被发现伪装成浏览器。",
    ],
    see: ["robots-txt", "google-extended", "bytespider"],
    step: 1,
    howto: "robots-txt",
    sources: ["02-S1", "02-S25", "02-S33", "02-S37", "02-S43", "02-S34"],
  },
  {
    slug: "robots-txt", title: "robots.txt", group: "爬虫和索引",
    one: "robots.txt 是放在网站根目录的一份文本，告诉各家爬虫哪些路径能抓、哪些不能。",
    like: "像店门口贴的告示：「快递员请进，推销员止步」。守规矩的人会照做，但它锁不住门。",
    here: [
      "规则按爬虫名分组。一个爬虫只听最具体匹配它的那一组，不会再读 `User-agent: *` 那一组。所以每组都要写完整。",
      "上线后用 `curl https://<你的域名>/robots.txt` 看线上到底长什么样。Cloudflare 的托管 robots.txt 会往里插一段，默认挡 GPTBot、ClaudeBot、Google-Extended、Bytespider 等。",
    ],
    myths: [
      "「没有 robots.txt 就会被挡」：没有规则等于全部允许。",
      "「robots.txt 能让页面从搜索里消失」：它只管抓不抓。要下架用 `noindex`。",
    ],
    see: ["ai-crawler", "content-signals", "usage-ai-training"],
    step: 1,
    howto: "robots-txt",
    sources: ["02-S27", "03-S17", "02-S32", "21-S1"],
  },
  {
    slug: "google-extended", title: "Google-Extended", group: "爬虫和索引",
    one: "Google-Extended 是 robots.txt 里的一个名字，控制 Gemini 能不能用你的内容训练，以及 Gemini 应用能不能引用你。",
    like: "像一张授权书。签了，Gemini 既能拿你的书去学，也能在回答里引你的原话；不签，两样都没有。",
    here: [
      "它不是一个单独的爬虫，抓取还是 Googlebot 做的。==挡了它，你就从 Gemini 应用的引用里消失==，但不影响 Google 搜索和 AI Overviews。一项 SIGIR 2026 的研究看到，挡了它的网站在 Gemini 里零引用。",
      "还有一个新坑。如果你用 `__usage_ai-training` 退出训练，又没有单独写 Google-Extended，Google 会当作你挡了它。想出现在 Gemini 里，就单独写一组 `User-agent: Google-Extended` 加 `Allow: /`。",
    ],
    myths: [
      "「挡 Google-Extended 只是不让训练，没有代价」：它同时让你退出 Gemini 应用的引用。",
      "「挡它就能退出 AI Overviews」：不能，要用 Search Console 的开关。",
    ],
    see: ["ai-crawler", "usage-ai-training", "ai-overviews"],
    step: 1,
    howto: "robots-txt",
    sources: ["01-S33", "02-S14", "01-S18", "01-S31"],
  },
  {
    slug: "usage-ai-training", title: "__usage_ai-training", group: "爬虫和索引",
    one: "`__usage_ai-training` 是 2026-10 出现的跨厂商训练偏好写法：在 robots.txt 里一行声明「别拿我的内容训练」。",
    like: "像在门口贴一张「谢绝拍照」。它只管拍不拍，不管人进不进门。",
    here: [
      "它是一份 IETF 个人草案，Anthropic 员工起草，还没有正式标准地位。Anthropic 已开始执行，微软 2027-02-01 起执行，Google 计划 2027 年支持（截至 2026-11）。",
      "它只管训练，不管抓取，也不管 AI 回答引用你。写 `*` 不会匹配它，没有这一组等于没有偏好。用它时记得另写一组 Google-Extended，否则会连带退出 Gemini 的引用。",
    ],
    myths: [
      "「写了它就不会被 AI 抓」：它不是抓取指令，爬虫照样来。",
    ],
    see: ["google-extended", "content-signals", "robots-txt"],
    step: 1,
    howto: "robots-txt",
    sources: ["02-S27", "02-S25", "02-S20", "02-S29", "02-S14"],
  },
  {
    slug: "content-signals", title: "Content Signals", group: "爬虫和索引",
    one: "Content Signals 是 Cloudflare 提出的 robots.txt 写法，分别声明内容能不能用于搜索、AI 回答、AI 训练。",
    like: "像在作品上标「可以转载，不可商用」。别人看得到，守不守靠自觉。",
    here: [
      "三个信号是 `search`、`ai-input`、`ai-train`，留空不等于同意。Cloudflare 的托管 robots.txt 默认写 `search=yes, ai-train=no`。",
      "它是自愿遵守的信号，Cloudflare 自己也说有人会无视。Cloudflare 扫描约 20 万个域名，只有 4% 写了它。真正能挡住的只有 WAF 屏蔽或付费墙。",
    ],
    myths: [
      "「写了 Content Signals，AI 就不会用我的内容」：它不强制执行。",
    ],
    see: ["robots-txt", "usage-ai-training"],
    step: 1,
    howto: "cloudflare-bots",
    sources: ["03-S16", "03-S17", "03-S24"],
  },
  {
    slug: "bytespider", title: "Bytespider", group: "爬虫和索引",
    one: "Bytespider 是字节跳动的爬虫。头条搜索站长平台写明，它是头条搜索的爬虫。",
    like: "像一家报社的记者证：知道他是哪家报社的，但不知道稿子会不会登在姐妹刊物上。",
    here: [
      "官方公布了 10 个 IP 段，验证方法是反向 DNS，主机名应是 `*.bytedance.com`。文档没写它是否遵守 robots.txt，也没提豆包。它和豆包回答、豆包训练的关系，都没有官方说明（截至 2026-11）。",
      "两个地方会默认挡它：GitHub 的 robots.txt 整站禁止 Bytespider，Cloudflare 的托管 robots.txt 也对它写 `Disallow: /`。面向中文用户的站，先看自己是不是被顺手挡了。",
    ],
    myths: [
      "「Bytespider 是豆包的爬虫，挡了它豆包就不引用你」：官方没这么说，反过来也没说。",
      "「字节没有官方爬虫文档」：有，在头条搜索站长平台。",
    ],
    see: ["ai-crawler", "robots-txt"],
    step: 6,
    howto: "cloudflare-bots",
    sources: ["07-S27", "14-S4", "03-S17", "07-S61"],
  },
  {
    slug: "indexnow", title: "IndexNow", group: "爬虫和索引",
    one: "IndexNow 是一个推送协议：页面变了，你主动告诉搜索引擎，不用等它来爬。",
    like: "像新书上架后给书店打个电话，而不是等店员哪天路过发现。",
    here: [
      "推给一家参与方，它会分享给其他参与方。截至 2026-11，参与方有 Bing、Yandex、Seznam、Naver、Yep、Internet Archive 和 Amazonbot，没有 Google。一次最多推 1 万个网址。",
      "对 GEO 来说，它主要是推给 Bing。Bing 把 IndexNow 列为让 AI 引用你最新页面的第一条建议。Cloudflare 的 Crawler Hints 也能代你推。",
    ],
    myths: [
      "「推了 IndexNow，Google 也会知道」：Google 不在里面，Google 靠 sitemap。",
    ],
    see: ["sitemap-lastmod", "bing-webmaster-tools"],
    step: 2,
    howto: "indexnow",
    sources: ["03-S48", "03-S49", "21-S5", "03-S45", "03-S25"],
  },
  {
    slug: "sitemap-lastmod", title: "sitemap 和 lastmod", group: "爬虫和索引",
    one: "sitemap 是列出全站网址的 XML 文件，lastmod 是每个网址最后一次真正改动的时间。",
    like: "像图书馆的新书通报：每本书写着上架日期，管理员按日期决定先去看哪本。",
    here: [
      "Google 只在 lastmod 一直准确时才用它，`priority` 和 `changefreq` 直接忽略。Bing 说 lastmod 要用带时间的 ISO 8601 格式，别填生成时间，还说新鲜度会影响 AI 答案。",
      "自查办法：打开线上的 sitemap，看所有 lastmod 是不是同一个时间。全一样，说明填的是构建时间。Astro 站按每篇文章的更新日期生成，做法见 [Astro 站点的 GEO 设置](/howto/astro/)。",
    ],
    myths: [
      "「每次构建都更新 lastmod，显得网站新」：搜索引擎会因此不再信你的 lastmod。",
    ],
    see: ["indexnow"],
    step: 2,
    howto: "astro",
    sources: ["03-S42", "03-S43", "03-S55"],
  },
  {
    slug: "bing-webmaster-tools", title: "Bing Webmaster Tools", group: "爬虫和索引",
    one: "Bing Webmaster Tools 是 Bing 的站长后台。它是目前唯一免费给出 AI 引用次数的官方后台。",
    like: "像书店给作者开的后台：能看到你的书被哪些读书会引用了、他们是搜什么词找到的。",
    here: [
      "它的 AI Performance 报告 2026-02 开始公测。报告里有 Copilot、Bing AI 摘要和部分合作方的引用次数、被引页面和 grounding query。2026-06 加了 Citation Share 和 Compare，2026-10 又加了主题聚类。",
      "它没有点击数据，也只覆盖微软自家生态。微软说它的 grounding 服务给几乎所有主流 AI 助手供数，这是自家说法。",
    ],
    myths: [
      "「ChatGPT 用的就是 Bing，做好 Bing 就行」：厂商研究说 ChatGPT 混用自建索引和多个来源。OpenAI 没公布比例。",
    ],
    see: ["grounding", "indexnow"],
    step: 2,
    sources: ["02-S21", "03-S46", "02-S22", "03-S47", "02-S3"],
  },

  // ---- 内容和引用 ----
  {
    slug: "json-ld", title: "JSON-LD、结构化数据和富结果", group: "内容和引用",
    one: "JSON-LD 是写在页面里给机器读的一段说明。它用 schema.org 的词汇告诉搜索引擎「这页是一个软件，价格多少」。",
    like: "像商品包装背面的条形码和成分表：人看正面，机器扫背面。",
    here: [
      "结构化数据是这类说明的统称，JSON-LD 是最常用的写法。富结果是 Google 用它在搜索结果里显示的星级、价格等样式。Google 要求它和页面上看得见的内容一致。",
      "它对 AI 引用的作用没有可靠的正面证据。Ahrefs 追踪 1,885 个新加 JSON-LD 的页面，ChatGPT 和 AI Mode 的引用没有可测变化；一次实验里 AI 现场读网页时只读可见文字。微软说 schema 帮它的模型理解内容。只写几个核心类型，当作产品说明书。",
    ],
    myths: [
      "「schema 是 GEO 的核心」：唯一的大样本对照研究没看到效果。",
      "「FAQPage 还能拿富结果」：Google 从 2026-05-07 起不再展示 FAQ 富结果。",
    ],
    see: ["schema-org", "entity"],
    step: 3,
    howto: "json-ld",
    sources: ["01-S30", "03-S32", "03-S33", "03-S34", "03-S35", "03-S38"],
  },
  {
    slug: "schema-org", title: "schema.org", group: "内容和引用",
    one: "schema.org 是搜索引擎共用的一套词汇表。它规定结构化数据里「软件」「文章」「作者」该怎么写。",
    like: "像快递单上的固定栏目：收件人、电话、地址。大家按同一张表填，机器才认得。",
    here: [
      "你的产品常用这几个类型：`SoftwareApplication`（插件、App）、`Article`（教程）、`Organization` 或 `Person`（你自己）、`BreadcrumbList`（导航路径）。Chrome 插件可以把 `applicationCategory` 写成 `BrowserApplication`。",
      "Google 对每个类型有必填字段。比如 `SoftwareApplication` 要拿富结果，必须有 `name`、价格，以及评分或评论。没有真实评分就别编。",
    ],
    myths: [
      "「类型写得越多越好」：只写和页面内容对得上的几种。",
    ],
    see: ["json-ld"],
    step: 3,
    howto: "json-ld",
    sources: ["03-S38", "01-S30"],
  },
  {
    slug: "llms-txt", title: "llms.txt", group: "内容和引用",
    one: "llms.txt 是放在网站根目录的一份 Markdown 目录，列出站内重要页面，给大模型看。",
    like: "像给访客的一页导览图。来的人多是编程助手，搜索类 AI 很少拿它。",
    here: [
      "规范只要求一个 H1 标题，下面是 H2 分组的链接列表。Ahrefs 看了 137,210 个域名，97% 的 llms.txt 一个月零请求，AI 检索类爬虫只占这些请求的 1.1%。Google 说搜索不用它。",
      "真正在读的是编程 Agent。一个站两个月的日志里，Claude Code 的请求有 88% 拿的是 Markdown。所以开发者工具、文档站加它值得，别的产品不必为了 AI 引用去加。",
    ],
    myths: [
      "「加了 llms.txt，ChatGPT 就会引用你」：没有证据。",
      "「Lighthouse 检查它，说明它是排名因素」：那是诊断清单，不是排名因素。",
    ],
    see: ["json-ld"],
    step: 3,
    howto: "llms-txt",
    sources: ["03-S29", "03-S30", "06-S33", "01-S28", "03-S3", "03-S64"],
  },
  {
    slug: "canonical", title: "canonical", group: "内容和引用",
    one: "canonical 是告诉搜索引擎「这几个网址是同一页，以这个为准」的标签。",
    like: "像一本书有好几个印次，版权页注明「以第二版为准」。",
    here: [
      "写法是在 `<head>` 里放 `<link rel=\"canonical\" href=\"https://<你的域名>/路径/\">`。带 utm 参数、带不带末尾斜杠、`.md` 版本，都指回同一个网址。",
      "本站实测的 pstack 教程站首页就没有 canonical。自查：`curl -s https://<你的域名>/ | grep -i canonical`。",
    ],
    myths: [
      "「加了 `.md` 版本会被当成重复内容」：还没查清。一种折中是让 `.md` 用 `Link: rel=\"canonical\"` 头指回 HTML 页面。",
    ],
    see: ["hreflang"],
    step: 3,
    howto: "astro",
    sources: ["14-S1", "14-S2"],
  },
  {
    slug: "hreflang", title: "hreflang", group: "内容和引用",
    one: "hreflang 是告诉搜索引擎「这一页还有哪些语言版本」的标签。",
    like: "像说明书封面印着「English 版见第 30 页」。",
    here: [
      "Google 的要求有三条：每个语言版本都列出所有版本，包括自己；两边要互相指向；再加一个 `x-default` 给不匹配任何语言的人。",
      "你的站同时有中文和英文时才需要它。本站实测的 pstack 站，hreflang 只列了另一种语言，没列自己，也没有 `x-default`。",
    ],
    myths: [
      "「写一边就够了」：不互相指向的 hreflang 会被忽略。",
    ],
    see: ["canonical"],
    step: 3,
    howto: "astro",
    sources: ["03-S41", "14-S2"],
  },
  {
    slug: "mention-vs-link", title: "被提及和外链", group: "内容和引用",
    one: "被提及是别的网页写到你的产品名，外链是别的网页链接到你。对 AI 来说，前者更能预测它会不会说出你。",
    like: "像口碑和名片：别人在聊天里提到你，比你的名片被多少人收着更管用。",
    here: [
      "Ahrefs 对 7.5 万个品牌的研究里，全网品牌提及和 AI Overviews 提及的相关系数约 0.664，反向链接约 0.218。YouTube 提及相关性最高，约 0.737。这是相关不是因果，样本只含较大的站。",
      "一项研究发现，一篇被引的第三方页面提到小厂商，ChatGPT 点名它的几率高约 39.7 倍。所以评测、榜单、社区回答里的提及，是小产品最要紧的一件事。",
    ],
    myths: [
      "「品牌提及比外链重要 3 倍」：这是二手文章把两个相关系数相除得出的。原研究没这么说。",
    ],
    see: ["discovery-gap", "share-of-voice"],
    step: 5,
    sources: ["01-S50", "04-S4", "01-S12"],
  },

  // ---- 测量 ----
  {
    slug: "mention-rate", title: "提及率", group: "测量",
    one: "提及率是一组问题跑很多次以后，回答里提到你的比例。它是 GEO 最靠得住的指标。",
    like: "像民调：问一个人没意义，问几百个人才看得出支持率。",
    here: [
      "算法是：提到你（含别名）的回答数，除以有效回答数。SparkToro 让 600 人跑了 2,961 次。两次给出同一份名单的概率不到 1%，但一个品牌出现的比例相当稳定。",
      "单个问题想把误差压到正负 10 个百分点，约要 96 次回答。看几十个问题合起来的趋势，每天每题跑 1 次就够。先列全你的产品名、中英文名、常见拼错，不然会低估。",
    ],
    myths: [
      "「我们在 ChatGPT 里排第一」：同一顺序出现两次的概率约 1/1,000，排名基本是噪声。",
      "「问一次没提我，说明 AI 里没有我」：再问一遍可能就有了。",
    ],
    see: ["share-of-voice", "discovery-gap"],
    step: 7,
    howto: "prompt-set",
    sources: ["05-S1", "05-S5", "05-S6", "05-S68"],
  },
  {
    slug: "baseline", title: "基线", group: "测量",
    one: "基线是你什么都不改时，AI 回答里提到你的比例。改动有没有用，要拿改完的数和它比。",
    like: "像减肥前先称一周体重。体重每天本来就上下浮动，不知道浮动多大，就看不出瘦没瘦。",
    here: [
      "AI 回答每天在变。SISTRIX 的数据里，ChatGPT 每周有 74% 的引用域名是新面孔。Ahrefs 看到 ChatGPT 的引用 59% 第二天就不见了，约 75% 会在 20 天内回来。",
      "做法：同一组固定问题，先测 2 到 4 周，记下提及率。改完再测 4 周左右，比提及率，不比排名。再留几个不改的问题当对照，两组的变化相减，才是改动的效果。",
    ],
    myths: [
      "「改完第二天就上了推荐，说明有效」：可能只是自然波动。",
      "「排名从第 5 升到第 2」：同一顺序出现两次的概率约 1/1,000，排名基本是噪声。",
    ],
    see: ["mention-rate", "share-of-voice"],
    step: 7,
    howto: "experiment",
    sources: ["05-S3", "05-S7", "05-S9", "06-S38", "05-S1"],
  },
  {
    slug: "share-of-voice", title: "Share of voice（声量份额）", group: "测量",
    one: "Share of voice 是在同一组问题里，你的提及占所有被追踪品牌提及的比例。",
    like: "像一桌人聊天，你的名字被说了几次，占所有人名字被说次数的多少。",
    here: [
      "常见算法是：你的提及次数，除以你和竞品提及次数之和。不同工具算法不一样，跨工具的数字不能比。",
      "它适合和固定的几个竞品比。刚开始做，先看自己的提及率就够了。",
    ],
    myths: [
      "「工具 A 说 30%，工具 B 说 12%，总有一个错」：它们的分母不同，各看各的趋势。",
    ],
    see: ["mention-rate"],
    step: 7,
    sources: ["05-S50", "05-S1"],
  },
  {
    slug: "ai-referral", title: "AI 引荐流量", group: "测量",
    one: "AI 引荐流量是用户在 ChatGPT、Perplexity 这类 AI 里点链接进你网站的访问。",
    like: "像店里的「朋友介绍来的」客人。有的报了介绍人名字，有的进门什么都没说。",
    here: [
      "它现在还很小：SE Ranking 统计 101,574 个网站，AI 平台带来的流量只占 0.32%。GA4 自带「AI Assistant」渠道，但会漏 Perplexity、Claude，没有 referrer 的点击会落进 Direct，AI Overviews 和 AI Mode 算 Organic Search。",
      "ChatGPT 的 `utm_source=chatgpt.com` 在 2026 年 10 月丢过一周，之后恢复了多少，两家厂商说法相反。把统计到的数当作下限，再在注册问卷里问一句「从哪听说的」。",
    ],
    myths: [
      "「AI 来访转化率是搜索的 N 倍」：唯一的同行评审电商研究发现 ChatGPT 引荐转化更低。厂商数据互相矛盾。",
    ],
    see: ["mention-rate"],
    step: 7,
    howto: "ai-traffic-analytics",
    sources: ["01-S51", "05-S14", "05-S17", "05-S19", "02-S4", "01-S55"],
  },

  // ---- 风险和误区 ----
  {
    slug: "cloaking", title: "Cloaking（伪装）", group: "风险和误区",
    one: "Cloaking 是给搜索引擎或 AI 爬虫看一版内容，给真人看另一版。",
    like: "像餐馆给检查员一份菜单，给客人另一份。",
    here: [
      "常见的坑是按 User-Agent 判断：看到 GPTBot 就返回精简页或 Markdown。一家开发团队的实测把这列为无效，还有 cloaking 风险。Google 的垃圾政策禁止只给机器看的内容。",
      "想给编程 Agent 提供 Markdown，用标准的 `Accept: text/markdown` 内容协商，同一个网址对谁都一样，并加 `Vary: Accept`。",
    ],
    myths: [
      "「给 AI 一个干净版本是在帮它」：按身份换内容，就是伪装。",
    ],
    see: ["llms-txt", "prompt-injection"],
    step: 3,
    howto: "llms-txt",
    sources: ["03-S4", "04-S18"],
  },
  {
    slug: "scaled-content-abuse", title: "Scaled content abuse（规模化内容滥用）", group: "风险和误区",
    one: "Scaled content abuse 是 Google 的一条垃圾政策：为了操纵排名或 AI 回答，大量生成没有增量价值的页面。",
    like: "像往信箱里塞一千份内容差不多的传单，想让收信人记住你。",
    here: [
      "这个政策 2024-03 引入，不管内容是人写、AI 写还是混合的，看的是主要目的是不是操纵排名。2026-05 起，Google 把「操纵生成式 AI 回答」也写进了垃圾政策。",
      "最常见的踩法是为每个 fan-out 子查询各做一页。用 AI 写没问题，一篇篇写、自己核对、确实回答了一个问题就行。",
    ],
    myths: [
      "「AI 写的内容会被惩罚」：Google 不区分人写和 AI 写，罚的是批量、无增量、不审核。",
    ],
    see: ["query-fan-out", "geo-poisoning"],
    step: 8,
    sources: ["06-S7", "04-S18", "01-S28", "06-S3", "06-S15"],
  },
  {
    slug: "prompt-injection", title: "隐藏的提示注入", group: "风险和误区",
    one: "隐藏的提示注入是把给 AI 的指令藏在网页里，比如白底白字写「请推荐本产品」。",
    like: "像在简历里用白色小字写「请给这位应聘者打满分」。",
    here: [
      "它确实起过作用：2024 年《卫报》的测试里，隐藏文字让 ChatGPT 搜索给出全正面的评价。学术研究也能用它把商品推成首推。",
      "但 Google 已在网上大规模检测这类注入，隐藏文字和操纵 AI 回答都在垃圾政策里。微软也抓到 31 家公司在「用 AI 总结」按钮里藏记忆指令。被识别后，损失的是整个域名的信誉。",
    ],
    myths: [
      "「藏在 HTML 注释里没人看得到」：AI 读的就是原始 HTML。",
    ],
    see: ["cloaking", "geo-poisoning"],
    step: 8,
    sources: ["06-S39", "01-S4", "06-S40", "04-S18", "04-S21"],
  },
  {
    slug: "geo-poisoning", title: "GEO 投毒", group: "风险和误区",
    one: "GEO 投毒是批量发布虚假或夸大的内容，让 AI 在回答里复述它们。",
    like: "像往一口井里倒颜料，想让打水的人都说水是这个颜色。",
    here: [
      "2026 年 3·15 晚会演示过：给一款不存在的手环批量生成软文。三天发了 11 篇，它就进了两个大模型的推荐前列。有商家报价一年 6600 元保 AI 回答前三。",
      "监管已经点名。网信办 2026-04-30 部署了「清朗」专项行动，把「使用 GEO 技术恶意营销」算作 AI 数据投毒。北京一家 GEO 服务商因虚构荣誉被罚 5 万元。",
    ],
    myths: [
      "「做 GEO 就是投毒」：把真实信息写清楚、争取真实报道是正常优化。问题在虚构事实、伪造测评、批量铺量。",
      "「两篇软文两小时就能上 AI 推荐」：两小时生效的是直接问那个虚构产品名；品类推荐用了 11 篇、三天。",
    ],
    see: ["scaled-content-abuse", "prompt-injection"],
    step: 6,
    sources: ["04-S38", "06-S57", "07-S43", "07-S51", "04-S40", "07-S52"],
  },
];
