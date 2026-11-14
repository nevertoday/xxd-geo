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

/** @type {Platform[]} */
export const PLATFORMS = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    region: "global",
    retrieval: "联网回答时用 OAI-SearchBot 建的索引，也用第三方搜索服务",
    crawlers: [
      { ua: "OAI-SearchBot", purpose: "search", note: "决定能不能出现在 ChatGPT 搜索回答里" },
      { ua: "GPTBot", purpose: "training", note: "挡住它不影响搜索回答" },
      { ua: "ChatGPT-User", purpose: "user", note: "用户让它打开某个网页时来" },
    ],
    js: false,
    citations: "回答里带编号的来源链接，旁边列出全部来源",
    referrer: "来源是 chatgpt.com，链接常带 utm_source=chatgpt.com",
    docs: [{ title: "Overview of OpenAI Crawlers", url: "https://platform.openai.com/docs/bots" }],
    tips: ["robots.txt 放行 OAI-SearchBot。", "正文直接写在 HTML 里，不要等 JavaScript 渲染。"],
    sources: ["openai-bots", "vercel-ai-crawlers"],
    sample: true,
  },
  {
    slug: "doubao",
    name: "豆包",
    vendor: "字节跳动",
    region: "cn",
    retrieval: "待调研",
    crawlers: [],
    js: null,
    citations: "待调研",
    referrer: "待调研",
    docs: [],
    tips: [],
    sources: [],
    sample: true,
  },
];
