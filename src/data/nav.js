// 站点结构的唯一来源：左侧导航、首页路线图、上一步 / 下一步、How-to 目录、搜索、check-content 都从这里读。
// ready: false 的页面还没写，导航里显示「编写中」，不给链接；ready: true 的页面必须有对应的 MDX 文件（check-content 会查）。
// 现在只有中文。以后加英文：在 LANGS 里加一行，英文文字放在各条目的 en: {} 里，用 t(x, key, lang) 取，页面放在 /en/ 下（同样的 slug）。

/** 网站名字、一句话、线上地址、仓库。各处只从这里取（wrangler.jsonc 里的域名除外，那是 JSON 配置）。 */
export const NAME = "GEO 实战手册";
export const TAGLINE = "让 AI 在回答里推荐你的产品";
export const SITE = "https://geo.xiaoxiaodong.ai";
export const REPO = "https://github.com/nevertoday/xxd-geo";

const BASE = (import.meta.env?.BASE_URL || "/").replace(/\/$/, "");
/** 网站的语言。只列已经建好的语言；多于一种时顶栏才出现语言菜单。第一项是根路径的语言。 */
export const LANGS = [
  { code: "zh", name: "中文", html: "zh-CN" },
];
export const langInfo = (lang) => LANGS.find((l) => l.code === lang) ?? LANGS[0];
const PREFIXED = LANGS.slice(1).map((l) => l.code);
const PREFIX_RE = PREFIXED.length ? new RegExp(`^/(${PREFIXED.join("|")})(?=/|$)`) : null;
/** 当前页面的语言：看路径前缀（/en/……），没有前缀是中文 */
export const langOf = (pathname = "") => (PREFIX_RE && pathname.slice(BASE.length).match(PREFIX_RE)?.[1]) || "zh";
/** 站内链接：部署在子路径时自动加前缀；非中文加 /<语言> */
export const link = (path, lang = "zh") => `${BASE}${lang === "zh" ? "" : "/" + lang}${path}`;
/** 同一页在另一种语言里的地址 */
export const langHref = (pathname, target) => {
  const rel = (pathname.slice(BASE.length) || "/").replace(PREFIX_RE ?? /^$/, "") || "/";
  return link(/\/404\/?$/.test(rel) ? "/" : rel, target);
};
/** 取某个对象在当前语言下的字段：先找 x[lang][key]，没有就用中文 */
export const t = (x, key, lang) => (lang === "zh" ? x[key] : x[lang]?.[key] ?? x[key]);

// 新手入门：给第一次听说 GEO 的人。三课，一条路走到底。
export const LESSONS = [
  { n: 1, slug: "1-why", ready: true, title: "GEO 是什么，为什么现在要做", minutes: "5 分钟", sum: "AI 回答里提不提你，正在变成新的流量入口" },
  { n: 2, slug: "2-check", ready: true, title: "20 分钟看看 AI 现在怎么说你的产品", minutes: "20 分钟", sum: "在几个 AI 里问同一组问题，记下它提没提你" },
  { n: 3, slug: "3-first-week", ready: true, title: "第一周先做这五件事", minutes: "读 5 分钟，做一周", sum: "先做投入小、有证据的几件事" },
];
export const lessonHref = (s, lang = "zh") => link(`/start/${s.slug}/`, lang);

// 完整教程：会写代码的人看。按 AI 找答案的顺序：爬到 → 搜到 → 读懂 → 引用 → 被别人提到 → 量效果。
export const STEPS = [
  { n: 0, slug: "0-how-ai-answers", ready: true, title: "AI 是怎么找答案的", minutes: "读 10 分钟", sum: "训练数据和实时搜索两条路，各管什么" },
  { n: 1, slug: "1-crawlable", ready: true, title: "让 AI 爬得到", minutes: "30 分钟", sum: "robots.txt、AI 爬虫名单、不靠 JS 也能看到正文" },
  { n: 2, slug: "2-indexed", ready: true, title: "让 AI 搜得到", minutes: "30 分钟", sum: "进 Bing 和 Google 的索引，新页面主动推送" },
  { n: 3, slug: "3-readable", ready: true, title: "让 AI 读得懂", minutes: "1 小时", sum: "结构化数据、清楚的标题和页面结构" },
  { n: 4, slug: "4-citable", ready: true, title: "写 AI 愿意引用的内容", minutes: "随写随用", sum: "一段话答一个问题，带数字和出处" },
  { n: 5, slug: "5-mentions", ready: true, title: "让别人提到你", minutes: "持续做", sum: "评测、榜单、社区里的提及" },
  { n: 6, slug: "6-china", ready: true, title: "国内 AI 平台怎么做", minutes: "30 分钟", sum: "豆包、DeepSeek、元宝、Kimi 各从哪里找答案" },
  { n: 7, slug: "7-measure", ready: true, title: "量出效果", minutes: "1 小时搭好", sum: "固定一组问题定期问，再看 AI 带来的访问" },
  { n: 8, slug: "8-with-ai", ready: true, title: "用 AI 做 GEO，并坚持下去", minutes: "随用随看", sum: "让 AI 体检、改写、每周复查" },
];
export const stepHref = (s, lang = "zh") => link(`/guide/${s.slug}/`, lang);

export const HOWTO = [
  { group: "按产品类型", items: [
    { slug: "chrome-extension", ready: true, title: "Chrome 插件" },
    { slug: "open-source", ready: true, title: "开源项目和 GitHub 仓库" },
    { slug: "content-site", ready: true, title: "教程站和内容站" },
    { slug: "saas", ready: true, title: "SaaS 和会员网站" },
    { slug: "mini-program", ready: true, title: "微信小程序" },
    { slug: "prompt-collection", ready: true, title: "提示词和 Skill 合集" },
  ]},
  { group: "技术配方", items: [
    { slug: "robots-txt", ready: true, title: "robots.txt：放行哪些 AI 爬虫" },
    { slug: "json-ld", ready: true, title: "JSON-LD 结构化数据" },
    { slug: "astro", ready: true, title: "Astro 站点的 GEO 设置" },
    { slug: "indexnow", ready: true, title: "IndexNow：新页面主动推给搜索引擎" },
    { slug: "llms-txt", ready: true, title: "llms.txt：要不要加" },
    { slug: "cloudflare-bots", ready: true, title: "Cloudflare 别把 AI 爬虫挡在门外" },
    { slug: "ai-traffic-analytics", ready: true, title: "在统计里看出 AI 带来的访问" },
    { slug: "crawler-logs", ready: true, title: "从访问日志看 AI 爬虫来没来" },
  ]},
  { group: "测量和实验", items: [
    { slug: "prompt-set", ready: true, title: "定一组固定问题" },
    { slug: "diy-tracker", ready: true, title: "自己搭一个提及追踪" },
    { slug: "experiment", ready: true, title: "做一次前后对比实验" },
  ]},
  { group: "AI 帮你做", items: [
    { slug: "ai-audit", ready: true, title: "让 AI 给网站做 GEO 体检" },
    { slug: "prompts", ready: true, title: "照抄就能用的提示词" },
  ]},
  { group: "实战案例", items: [
    { slug: "case-pstack", ready: true, title: "案例：pstack 教程站做 GEO" },
  ]},
];
export const howtoHref = (slug, lang = "zh") => link(`/howto/${slug}/`, lang);
/** 每篇 How-to 带上它所在的组（g），标题和组名都用 t() 取 */
export const HOWTO_FLAT = HOWTO.flatMap((g) => g.items.map((i) => ({ ...i, g })));

// 查资料：每个栏目一个目录页。左侧导航、首页、404、搜索都读这里。
export const SECTIONS = [
  { slug: "evidence", title: "证据表", nav: "证据表：哪些做法有用", sum: "每个做法该不该做，证据有多硬" },
  { slug: "platforms", title: "平台", nav: "平台：各家 AI 怎么找答案", sum: "海外和国内 AI 用什么搜索、派什么爬虫" },
  { slug: "tools", title: "工具", nav: "工具：监测、分析、体检", sum: "能帮你看 AI 提没提你的工具" },
  { slug: "prompts", title: "提示词库", nav: "提示词库", sum: "让 AI 帮你做 GEO 的现成提示词" },
  { slug: "wiki", title: "Wiki", nav: "Wiki：这是什么", sum: "教程里每个词的大白话解释" },
  { slug: "faq", title: "常见问题", nav: "常见问题", sum: "第一次做 GEO 最常问的问题" },
  { slug: "sources", title: "出处", nav: "出处：每条结论的来源", sum: "全站引用的资料，按证据等级排" },
];
export const sectionHref = (slug, lang = "zh") => link(`/${slug}/`, lang);

export const wikiHref = (slug, lang = "zh") => link(`/wiki/${slug}/`, lang);

/** 数据条目（做法、提示词……）上的 step / howto 变成「相关教程」链接；还没写好的页面不出链接 */
export const related = (x, lang = "zh") => {
  const s = x.step !== undefined && STEPS.find((y) => y.n === x.step && y.ready);
  const h = x.howto && HOWTO_FLAT.find((y) => y.slug === x.howto && y.ready);
  return [
    ...(s ? [{ href: stepHref(s, lang), label: `完整教程第 ${s.n} 步：${t(s, "title", lang)}` }] : []),
    ...(h ? [{ href: howtoHref(h.slug, lang), label: `How-to：${t(h, "title", lang)}` }] : []),
  ];
};

// 正文里虚线标出的术语：悬停看一句话解释（Term 组件）。wiki: 对应的 Wiki 条目
export const GLOSSARY = {
  GEO: { tip: "Generative Engine Optimization：让你的产品出现在 AI 的回答里，并被它引用。", wiki: "geo" },
  "AI 爬虫": { tip: "AI 公司派来读网页的程序。有的拿去训练模型，有的在用户提问时现场去读。", wiki: "ai-crawler" },
  "三类爬虫": { tip: "AI 爬虫分训练、搜索、用户触发三类，可以在 robots.txt 里分开放行。", wiki: "ai-crawler" },
  "训练爬虫": { tip: "抓网页去训练下一代模型的爬虫，比如 GPTBot、ClaudeBot。挡了它不影响 AI 搜索。", wiki: "ai-crawler" },
  "搜索爬虫": { tip: "给 AI 搜索建索引的爬虫，比如 OAI-SearchBot。挡了它，就进不了那家的 AI 搜索回答。", wiki: "ai-crawler" },
  "用户触发爬虫": { tip: "用户在对话里问到或贴出链接时，AI 现场去读网页的程序，比如 ChatGPT-User。", wiki: "ai-crawler" },
  RAG: { tip: "检索增强生成：先搜资料，再照着资料写回答。联网的 AI 回答基本都这样生成。", wiki: "rag" },
  grounding: { tip: "让 AI 的回答有网页做依据。Google 说它就是 RAG 的另一个名字。", wiki: "grounding" },
  "grounding query": { tip: "AI 为了找依据在后台发出的搜索词，Bing Webmaster Tools 里能看到。", wiki: "grounding" },
  "query fan-out": { tip: "AI 把一个问题拆成很多个子查询，同时去搜。", wiki: "query-fan-out" },
  "AI Overviews": { tip: "Google 搜索结果顶部那段 AI 写的摘要，用的是 Google 搜索的索引。", wiki: "ai-overviews" },
  "AI Mode": { tip: "Google 搜索里的对话模式，整页都是 AI 回答，可以追问。", wiki: "ai-mode" },
  "Google-Extended": { tip: "管 Gemini 训练和 Gemini 应用引用的开关。挡了它，Gemini 应用就不再引用你。", wiki: "google-extended" },
  "__usage_ai-training": { tip: "2026-10 出现的跨厂商写法，在 robots.txt 里声明别拿内容训练。不管抓取和引用。", wiki: "usage-ai-training" },
  IndexNow: { tip: "页面变了主动告诉搜索引擎的推送协议。Bing 在用，Google 不在里面。", wiki: "indexnow" },
  lastmod: { tip: "sitemap 里每个网址最后一次真正改动的时间。不准时，搜索引擎就不信它。", wiki: "sitemap-lastmod" },
  "JSON-LD": { tip: "写在页面里的一段机器可读说明，告诉搜索引擎这页是什么、价格多少。", wiki: "json-ld" },
  "结构化数据": { tip: "给机器看的页面说明，最常见的写法是 JSON-LD。", wiki: "json-ld" },
  "富结果": { tip: "Google 用结构化数据在搜索结果里显示的星级、价格等样式。", wiki: "json-ld" },
  "llms.txt": { tip: "根目录下给大模型看的 Markdown 目录。编程 Agent 会读，AI 搜索很少读。", wiki: "llms-txt" },
  canonical: { tip: "告诉搜索引擎「这几个网址是同一页，以这个为准」的标签。", wiki: "canonical" },
  hreflang: { tip: "告诉搜索引擎这一页还有哪些语言版本的标签，要互相指向。", wiki: "hreflang" },
  cloaking: { tip: "给爬虫看一版、给真人看另一版。按 User-Agent 换内容就属于这种。", wiki: "cloaking" },
  "scaled content abuse": { tip: "Google 的垃圾政策：为操纵排名或 AI 回答，大量生成没有价值的页面。", wiki: "scaled-content-abuse" },
  "实体": { tip: "AI 能认出来的一个具体东西：你的产品、你本人、你的公司。", wiki: "entity" },
  "实体卡": { tip: "把产品名、类别、平台、价格、替代品写在一处的标准说明，给 AI 写文案前先贴给它。", wiki: "entity" },
  "发现型问题": { tip: "用户不知道你、只描述需求的提问。AI 在这类问题里很少提小产品。", wiki: "discovery-gap" },
  "提及率": { tip: "一组问题跑很多次以后，回答里提到你的比例。", wiki: "mention-rate" },
  "基线": { tip: "什么都不改时 AI 提到你的比例。改动的效果要拿改完的数和它比。", wiki: "baseline" },
  sitemap: { tip: "列出全站网址的 XML 文件，告诉搜索引擎有哪些页面、什么时候改过。", wiki: "sitemap-lastmod" },
  "robots.txt": { tip: "网站根目录的一份文本，告诉各家爬虫哪些路径能抓。", wiki: "robots-txt" },
  "Bing Webmaster Tools": { tip: "Bing 的站长后台，目前唯一免费给出 AI 引用次数的官方后台。", wiki: "bing-webmaster-tools" },
  AEO: { tip: "Answer Engine Optimization，答案引擎优化。现在基本是 GEO 的另一个叫法。", wiki: "aeo-llmo" },
  "Content Signals": { tip: "Cloudflare 提出的 robots.txt 写法，分开声明搜索、AI 回答、训练三种用途。", wiki: "content-signals" },
  Bytespider: { tip: "字节跳动的爬虫，头条搜索站长平台写明它是头条搜索的爬虫。和豆包的关系官方没说。", wiki: "bytespider" },
  "引用率": { tip: "回答里链接到你网站的比例。和提及率分开算。", wiki: "citation-rate" },
  "Share of voice": { tip: "同一组问题里，你的提及占你和竞品全部提及的比例。各工具算法不同。", wiki: "share-of-voice" },
  "噪声地板": { tip: "什么都不改时，提及率自己会波动多大。比它小的变化不算数。", wiki: "noise-floor" },
  "A/A 测试": { tip: "什么都不改，连续两周跑同一组问题，测出噪声地板。", wiki: "noise-floor" },
  "双重差分": { tip: "处理组的变化减去对照组的变化，算出改动本身的效果。", wiki: "diff-in-diff" },
  "AI 引荐流量": { tip: "用户在 AI 回答里点链接进你网站的访问。统计里看到的只是下限。", wiki: "ai-referral" },
  "AI Assistant 渠道": { tip: "GA4 2026-05 起自带的 AI 渠道，会漏掉 Perplexity、Claude 和不带来源的点击。", wiki: "ai-referral" },
  notability: { tip: "维基百科的收录门槛：要有多个独立、可靠的来源深入报道过你。", wiki: "notability" },
  "Articles for Creation": { tip: "维基百科给利益相关者的投稿通道：交草稿，等别的编辑审。", wiki: "notability" },
  "权威等级": { tip: "豆包、DeepSeek 等中文 AI 搜索给网站打的权威分，判定规则没公开。", wiki: "cn-site-authority" },
  IcpHostOnly: { tip: "豆包搜索 API 的开关，打开后只搜 ICP 备案过的网站，默认关。", wiki: "icp-host-only" },
  "站长平台": { tip: "搜索引擎给网站主的后台，比如百度搜索资源平台、头条搜索站长平台。", wiki: "webmaster-platforms" },
  mpcrawler: { tip: "微信搜索抓小程序页面的爬虫，场景值 1129。", wiki: "mpcrawler-web-view" },
  "web-view": { tip: "小程序里嵌网页的组件。微信搜索不收录它里面的任何内容。", wiki: "mpcrawler-web-view" },
  "小程序 SKILL": { tip: "把小程序功能写成 AI 能调用的说明和接口，微信的「小微」按它调用你。", wiki: "mini-program-skill" },
  "提示注入": { tip: "把给 AI 的指令藏在网页里，想左右它的回答。Google 已在大规模检测。", wiki: "prompt-injection" },
  "GEO 投毒": { tip: "批量发布虚假或夸大的内容，让 AI 复述它们。", wiki: "geo-poisoning" },
  "AI 数据投毒": { tip: "网信办的说法，「使用 GEO 技术恶意营销」也算在里面。", wiki: "geo-poisoning" },
};
