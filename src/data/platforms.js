// 平台：每个 AI 产品一条。/platforms/ 分海外、国内两组列卡片，/platforms/<slug>/ 是一个平台的全部信息。
// sample: true 是先放着的示例，换成调研结论后删掉这个字段。

/** @typedef {"training"|"search"|"user"} CrawlerPurpose */
/**
 * @typedef {Object} Crawler
 * @property {string} ua            User-Agent 里的名字，写进 robots.txt 的那个
 * @property {CrawlerPurpose} purpose
 * @property {string} [note]
 */
/**
 * @typedef {Object} Platform
 * @property {string} slug
 * @property {string} name
 * @property {string} vendor
 * @property {"global"|"cn"} region
 * @property {string} retrieval     回答时从哪里找资料（自家索引、Bing、Google……）
 * @property {Crawler[]} crawlers
 * @property {boolean|null} js      爬虫会不会执行 JavaScript；null 是还没查清
 * @property {string} citations     回答里怎么标出处
 * @property {string} referrer      点过来的访问在统计里长什么样
 * @property {{ title: string, url: string }[]} docs  官方文档
 * @property {string[]} tips        针对这个平台的做法，每条一句
 * @property {string[]} sources     出处 id（sources.js）
 * @property {boolean} [sample]
 */

export const REGIONS = {
  global: { title: "海外" },
  cn: { title: "国内" },
};

export const PURPOSES = {
  training: "训练模型",
  search: "搜索索引",
  user: "用户提问时现场读",
};

/** 爬虫会不会执行 JavaScript */
export const JS_LABEL = (js) => (js === true ? "会" : js === false ? "不会" : "还没查清");


// 以下按调研稿 02-platforms.md（2026-11-14）整理。会变的东西（爬虫名、后台、归因）以官方文档为准。
/** @type {Platform[]} */
export const PLATFORMS = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    region: "global",
    retrieval: "OpenAI 说 OAI-SearchBot 抓来的页面用于 ChatGPT 搜索。一家卖 AI 可见度工具的公司（Peec）逆向研究称：ChatGPT 有自建索引 Labrador，还混用 Google 结果抓取、Microsoft Web IQ、Yelp 等至少 8 个来源，OpenAI 没有确认。",
    crawlers: [
      { ua: "OAI-SearchBot", purpose: "search", note: "挡了就不会出现在 ChatGPT 搜索回答里，改 robots.txt 约 24 小时生效" },
      { ua: "GPTBot", purpose: "training", note: "只管训练，和 OAI-SearchBot 各自独立设置" },
      { ua: "ChatGPT-User", purpose: "user", note: "用户在对话里让它打开网页时来；官方说 robots.txt 可能不适用，也不决定能否进搜索" },
    ],
    js: false,
    citations: "回答里附来源链接。OpenAI 没有发布讲引用界面的文档。",
    referrer: "2026-10-07 GPT-6 上线后，出站链接基本不再带 utm_source=chatgpt.com，并加了 noreferrer，点击多落进「直接访问」（厂商 Limy 的数据）。",
    docs: [
      { title: "Overview of OpenAI Crawlers", url: "https://platform.openai.com/docs/bots" },
      { title: "Publishers and Developers FAQ", url: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq" },
    ],
    tips: [
      "robots.txt 放行 OAI-SearchBot，这是进 ChatGPT 搜索的前提。",
      "想退出 ChatGPT 搜索，用 noindex，并让爬虫能抓到这个页面。",
      "正文写在服务端输出的 HTML 里，OpenAI 的爬虫不执行 JavaScript。",
      "统计 AI 访问别只看 UTM，看「直接访问」里深层页面的异常增长。",
      "美国的电商和在线服务商家可以试 Business Hub，能看提及次数和点击。",
    ],
    sources: ["02-S1", "02-S2", "02-S3", "02-S4", "02-S5", "03-S6", "02-S43"],
  },
  {
    slug: "google-ai",
    name: "Google AI Overviews 和 AI Mode",
    vendor: "Google",
    region: "global",
    retrieval: "Google 搜索索引。用核心排名系统做检索（grounding），并用 query fan-out 同时发出多条相关子查询。",
    crawlers: [
      { ua: "Googlebot", purpose: "search", note: "AI Overviews 和 AI Mode 用的就是这份索引，没法只挡 AI 功能而保留搜索" },
      { ua: "Google-Agent", purpose: "user", note: "替用户浏览和操作网页的代理，属于用户触发，通常不看 robots.txt" },
    ],
    js: true,
    citations: "回答旁列出 supporting links。因为 fan-out，链接比传统结果更多、更分散。",
    referrer: "点击算作普通的 Google 自然搜索，GA 里分不出来。Search Console 的 Generative AI 报告只给展示次数。",
    docs: [
      { title: "AI features and your website", url: "https://developers.google.com/search/docs/appearance/ai-features" },
      { title: "Optimizing your website for generative AI features on Google Search", url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" },
      { title: "Search generative AI control", url: "https://support.google.com/webmasters/answer/16908024" },
    ],
    tips: [
      "页面能被索引、能带摘要显示，就有资格出现，没有额外技术要求。",
      "到 Search Console 设置里确认 Search generative AI 是 Include（默认值）。",
      "Google-Extended 不影响 AI Overviews 和 AI Mode，别指望用它退出。",
      "别为每个 fan-out 子查询批量做页面，Google 说这违反 scaled content abuse 政策。",
      "Google 说不需要 llms.txt、切块或特殊 schema。",
    ],
    sources: ["02-S9", "02-S10", "02-S11", "02-S12", "02-S16"],
  },
  {
    slug: "gemini",
    name: "Gemini 应用",
    vendor: "Google",
    region: "global",
    retrieval: "用 Google 搜索做实时 grounding。Google-Extended 这个令牌同时管 Gemini 训练和 Gemini 应用的实时引用。",
    crawlers: [
      { ua: "Googlebot", purpose: "search", note: "Gemini 借用 Googlebot 的基础设施抓取和渲染" },
      { ua: "Google-Extended", purpose: "training", note: "只是 robots.txt 令牌，没有独立 UA；挡了它，Gemini 应用的引用里也没有你" },
      { ua: "Google-GeminiNotebook", purpose: "user", note: "用户把网址加进 Gemini Notebook 时抓取；旧名 Google-NotebookLM" },
    ],
    js: true,
    citations: "回答附来源链接。",
    referrer: "桌面网页版传 gemini.google.com；iOS App 用内置浏览器打开，不传 referrer，日志里只有 GeminiiOS。utm_source=gemini 在 2026 年 9 月只出现了约三周。",
    docs: [
      { title: "Google's common crawlers（Google-Extended）", url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers" },
      { title: "Google User-Triggered Fetchers", url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers" },
    ],
    tips: [
      "想被 Gemini 应用引用，robots.txt 里显式写 Google-Extended 的 Allow。",
      "用 __usage_ai-training 退出训练时，单独写 Google-Extended，否则 Google 当你挡了它。",
      "SIGIR 2026 的研究里，挡了 Google-Extended 的网站在 Gemini 里一次都没被引用。",
    ],
    sources: ["02-S14", "02-S15", "02-S16", "02-S17", "02-S43", "01-S18"],
  },
  {
    slug: "copilot",
    name: "Microsoft Copilot 和 Bing",
    vendor: "Microsoft",
    region: "global",
    retrieval: "Bing 索引。Microsoft 还把 grounding 服务（Web IQ、Foundry 里的 API）提供给第三方。",
    crawlers: [
      { ua: "bingbot", purpose: "search", note: "搜索、grounding、训练都由它抓，靠偏好设置区分用途" },
    ],
    js: null,
    citations: "回答里带引用链接。Bing Webmaster Tools 的 AI Performance 报告能看到被引用次数。",
    referrer: "没有找到官方的 referrer 或 UTM 说明。",
    docs: [
      { title: "Introducing AI Performance in Bing Webmaster Tools", url: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview" },
      { title: "Clearer preferences for training and grounding", url: "https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/" },
    ],
    tips: [
      "验证 Bing Webmaster Tools，打开 AI Performance 看引用次数和 grounding 查询词。",
      "用 IndexNow 推新页面，Bing 把它列为让 AI 引用最新页面的第一条建议。",
      "sitemap 的 lastmod 写真实更新时间，Bing 明确反对写成生成时间。",
      "2027-02-01 起可用页面级 ai-grounding 设置；设成 disallow 会明显减少 AI 曝光。",
      "一次测试发现 Copilot 实时抓取会执行 JavaScript，但只等约 53ms。",
    ],
    sources: ["02-S20", "02-S21", "02-S22", "03-S43", "03-S47", "03-S2"],
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    vendor: "Perplexity AI",
    region: "global",
    retrieval: "自有索引，由 PerplexityBot 抓取。是否还混用外部搜索 API，官方没说。",
    crawlers: [
      { ua: "PerplexityBot", purpose: "search", note: "决定能不能出现在 Perplexity 结果里；官方说不用于训练基础模型" },
      { ua: "Perplexity-User", purpose: "user", note: "用户提问时实时抓取，官方写明通常忽略 robots.txt" },
    ],
    js: false,
    citations: "回答里带编号的来源。",
    referrer: "常见来源是 perplexity.ai，没有官方文档说明。",
    docs: [{ title: "Perplexity Crawlers", url: "https://docs.perplexity.ai/guides/bots" }],
    tips: [
      "robots.txt 放行 PerplexityBot，它是搜索爬虫，挡了就不在结果里。",
      "在 Cloudflare 上，放行规则要 UA 加官方 IP 段一起匹配，动作选 Skip。",
      "Bot Fight Mode 用 WAF 自定义规则绕不过，开着可能误伤它。",
      "2025-08 Cloudflare 指控它在被挡后用伪装爬虫抓取，robots.txt 对它不是可靠的控制手段。",
    ],
    sources: ["02-S33", "02-S34", "02-S43", "02-S69", "03-S8"],
  },
  {
    slug: "claude",
    name: "Claude",
    vendor: "Anthropic",
    region: "global",
    retrieval: "网页搜索的后端是 Brave Search（2025 年起在子处理方名单上，2026-07 复查仍在）。2026-05 名单里又加了 turbopuffer，用途没公开。",
    crawlers: [
      { ua: "ClaudeBot", purpose: "training", note: "挡了它，以后的内容不进训练数据" },
      { ua: "Claude-SearchBot", purpose: "search", note: "为搜索建索引，挡了会降低在搜索结果里的可见度" },
      { ua: "Claude-User", purpose: "user", note: "用户提问时访问网页，挡了会降低用户主动查询时的可见度" },
    ],
    js: false,
    citations: "回答附来源链接。",
    referrer: "常见来源是 claude.ai，没有官方文档说明。",
    docs: [
      { title: "Does Anthropic crawl data from the web?", url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler" },
      { title: "How do Anthropic-hosted browsers identify themselves?", url: "https://support.claude.com/en/articles/18234133-how-do-anthropic-hosted-browsers-identify-themselves-when-they-browse-the-web-on-a-user-s-behalf" },
    ],
    tips: [
      "三个爬虫分别写规则，每个子域名单独放一份 robots.txt。",
      "别挡 Googlebot：Brave 只抓 Googlebot 能抓的页面，挡了就同时失去 Brave 和 Claude。",
      "只挡 IP 会让它读不到 robots.txt，退出反而可能不生效。",
      "2026-10-30 起它识别 __usage_ai-training；写了 ClaudeBot 规则时以 ClaudeBot 为准。",
    ],
    sources: ["02-S25", "02-S26", "02-S30", "02-S31", "02-S32", "02-S43", "02-S69"],
  },
  {
    slug: "meta-ai",
    name: "Meta AI",
    vendor: "Meta",
    region: "global",
    retrieval: "Meta 自有索引，由 meta-webindexer 抓取。",
    crawlers: [
      { ua: "meta-webindexer", purpose: "search", note: "官方说放行它有助于在 Meta AI 回答里被引用和链接" },
      { ua: "meta-externalagent", purpose: "training", note: "训练用；官方描述也包含「直接索引内容改进产品」" },
      { ua: "meta-externalfetcher", purpose: "user", note: "用户请求时抓单个链接，也替 AI 代理完成任务；可能绕过 robots.txt" },
    ],
    js: null,
    citations: "回答里引用并链接来源。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "Meta Web Crawlers", url: "https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers" }],
    tips: [
      "robots.txt 放行 meta-webindexer。",
      "改 robots.txt 后最多等 24 小时，它会缓存。",
      "挡 meta-externalagent 可能连带影响某些产品功能，先想清楚。",
    ],
    sources: ["02-S37", "02-S28"],
  },
  {
    slug: "apple",
    name: "Apple（Siri、Spotlight、Apple Intelligence）",
    vendor: "Apple",
    region: "global",
    retrieval: "Applebot 建的索引，用于 Spotlight、Siri、Safari 搜索；回答宽泛的知识问题时也作为实时上下文。",
    crawlers: [
      { ua: "Applebot", purpose: "search", note: "robots.txt 没写 Applebot 时按 Googlebot 的规则执行；数据也可能用于训练 Apple 的模型" },
      { ua: "Applebot-Extended", purpose: "training", note: "只是令牌，不抓页面；挡了它不用于训练，仍可出现在搜索里" },
    ],
    js: true,
    citations: "知识类回答可能附来源链接。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "About Applebot", url: "https://support.apple.com/en-us/119829" }],
    tips: [
      "别在 robots.txt 里挡 JS 和 CSS，Applebot 会渲染页面。",
      "想不进 Siri 和搜索的 AI 知识回答，用 nosnippet。",
      "付费页用 JSON-LD 标 isAccessibleForFree: false，能进搜索但不当作 AI 回答的上下文。",
    ],
    sources: ["02-S38", "02-S43"],
  },
  {
    slug: "grok",
    name: "Grok",
    vendor: "xAI",
    region: "global",
    retrieval: "官方 API 有 Web Search 和 X Search 两个工具，示例里用了 grokipedia.com。所以来源包括网页、X 帖子和 Grokipedia。",
    crawlers: [],
    js: null,
    citations: "回答附来源列表。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "Search tools（xAI API）", url: "https://docs.x.ai/docs/guides/tools/search-tools" }],
    tips: [
      "xAI 没有可靠的爬虫 UA 文档，第三方目录里的名字互相矛盾。",
      "一次受控测试里，Grok 的抓取请求伪装成普通浏览器，robots.txt 基本管不住它。",
      "同一类测试发现 Grok 实时抓取会执行 JavaScript，大约等 1 到 2 秒。",
    ],
    sources: ["02-S41", "02-S42", "02-S45", "03-S2"],
  },
  {
    slug: "mistral",
    name: "Mistral（Le Chat / Vibe）",
    vendor: "Mistral AI",
    region: "global",
    retrieval: "Mistral 自有搜索索引，由 MistralAI-Index 抓取。官方爬虫页把产品叫作 Vibe。",
    crawlers: [
      { ua: "MistralAI-Index", purpose: "search", note: "为 Mistral 搜索建索引，官方说不用于任何训练" },
      { ua: "MistralAI-Training", purpose: "training", note: "训练数据集，不用于搜索或实时回答" },
      { ua: "MistralAI-User", purpose: "user", note: "用户提问时访问网页，回答附来源链接" },
    ],
    js: null,
    citations: "回答附来源链接。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "Mistral crawlers", url: "https://docs.mistral.ai/robots" }],
    tips: ["robots.txt 放行 MistralAI-Index 和 MistralAI-User，训练类自己决定。"],
    sources: ["02-S39"],
  },
  {
    slug: "duckduckgo",
    name: "DuckDuckGo（Search Assist）",
    vendor: "DuckDuckGo",
    region: "global",
    retrieval: "DuckAssistBot 为 AI 回答实时抓取页面。",
    crawlers: [
      { ua: "DuckAssistBot", purpose: "search", note: "为 AI 回答实时抓页面，不用于训练；禁止后 72 小时生效，不影响自然排名" },
    ],
    js: null,
    citations: "官方说回答会醒目地标出来源。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "Is DuckAssistBot related to DuckDuckGo?", url: "https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot" }],
    tips: ["robots.txt 放行 DuckAssistBot；IP 列表在 duckduckgo.com/duckassistbot.json。"],
    sources: ["02-S40"],
  },
  {
    slug: "brave",
    name: "Brave Search",
    vendor: "Brave",
    region: "global",
    retrieval: "自有索引，部分数据来自用户自愿开启的 Web Discovery Project。Brave Search API 也是 Claude 网页搜索的后端。",
    crawlers: [],
    js: null,
    citations: "还没查。",
    referrer: "没有找到官方说明。",
    docs: [{ title: "Brave Search Crawler", url: "https://search.brave.com/help/brave-search-crawler" }],
    tips: [
      "Brave 的爬虫没有独立 UA，只抓 Googlebot 能抓的页面。别挡 Googlebot。",
      "robots.txt 不能让页面从 Brave 下架，要用 noindex。",
    ],
    sources: ["02-S32", "02-S30", "02-S31"],
  },
  ...PLATFORMS_CN,
];

// 国内平台单独放一个文件，按调研稿 07-china.md 整理。
import { PLATFORMS_CN } from "./platforms.cn.js";
