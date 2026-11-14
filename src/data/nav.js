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
  { n: 2, slug: "2-check", ready: true, title: "10 分钟看看 AI 现在怎么说你的产品", minutes: "10 分钟", sum: "在几个 AI 里问同一组问题，记下它提没提你" },
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
    { slug: "chrome-extension", ready: false, title: "Chrome 插件" },
    { slug: "open-source", ready: false, title: "开源项目和 GitHub 仓库" },
    { slug: "content-site", ready: false, title: "教程站和内容站" },
    { slug: "saas", ready: false, title: "SaaS 和会员网站" },
    { slug: "mini-program", ready: false, title: "微信小程序" },
    { slug: "prompt-collection", ready: false, title: "提示词和 Skill 合集" },
  ]},
  { group: "技术配方", items: [
    { slug: "robots-txt", ready: true, title: "robots.txt：放行哪些 AI 爬虫" },
    { slug: "json-ld", ready: false, title: "JSON-LD 结构化数据" },
    { slug: "astro", ready: false, title: "Astro 站点的 GEO 设置" },
    { slug: "indexnow", ready: false, title: "IndexNow：新页面主动推给搜索引擎" },
    { slug: "llms-txt", ready: false, title: "llms.txt：要不要加" },
    { slug: "cloudflare-bots", ready: false, title: "Cloudflare 别把 AI 爬虫挡在门外" },
    { slug: "ai-traffic-analytics", ready: false, title: "在统计里看出 AI 带来的访问" },
    { slug: "crawler-logs", ready: false, title: "从访问日志看 AI 爬虫来没来" },
  ]},
  { group: "测量和实验", items: [
    { slug: "prompt-set", ready: false, title: "定一组固定问题" },
    { slug: "diy-tracker", ready: false, title: "自己搭一个提及追踪" },
    { slug: "experiment", ready: false, title: "做一次前后对比实验" },
  ]},
  { group: "AI 帮你做", items: [
    { slug: "ai-audit", ready: false, title: "让 AI 给网站做 GEO 体检" },
    { slug: "prompts", ready: false, title: "照抄就能用的提示词" },
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
};
