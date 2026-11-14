// 证据表：每个 GEO 做法一条，/evidence/ 按「哪一层」分组列出，带结论和证据等级。
// 证据等级不在这里写：页面从 sources 里最强的那条算出来（sources.js 的 bestGrade）。
// sample: true 是先放着的示例，换成调研结论后删掉这个字段。

/** @typedef {"crawl"|"index"|"read"|"cite"|"mention"|"measure"} Layer */
/** @typedef {"must"|"try"|"skip"|"avoid"} VerdictKey */
/**
 * @typedef {Object} Tactic
 * @property {string} id        锚点：/evidence/#<id>
 * @property {string} title     做法，写成动作
 * @property {Layer} layer
 * @property {VerdictKey} verdict
 * @property {"低"|"中"|"高"} effort
 * @property {string} why       一两句：为什么这样判断
 * @property {string[]} sources 出处 id（sources.js）
 * @property {number} [step]    相关的完整教程步骤
 * @property {string} [howto]   相关的 How-to slug
 * @property {boolean} [sample]
 */

/** 页面上的分组顺序，就是 AI 找到你、用上你的顺序 */
export const LAYERS = {
  crawl: { title: "爬得到", sum: "AI 的爬虫能不能读到你的页面", step: 1 },
  index: { title: "搜得到", sum: "AI 用的搜索引擎里有没有你", step: 2 },
  read: { title: "读得懂", sum: "页面结构让 AI 一眼看懂", step: 3 },
  cite: { title: "愿意引用", sum: "内容写成 AI 愿意摘的样子", step: 4 },
  mention: { title: "有人提到", sum: "别的网站、社区里有没有你", step: 5 },
  measure: { title: "量得出", sum: "知道做了以后有没有变化", step: 7 },
};

/** 结论：tone 是徽章颜色（xxd-badge 的 data-tone） */
export const VERDICTS = {
  must: { label: "必做", tone: "success" },
  try: { label: "值得试", tone: "action" },
  skip: { label: "不必做", tone: undefined },
  avoid: { label: "别做", tone: "danger" },
};

export const EFFORTS = ["低", "中", "高"];

/** @type {Tactic[]} */
export const TACTICS = [
  {
    id: "allow-oai-searchbot",
    title: "在 robots.txt 里放行 OAI-SearchBot",
    layer: "crawl",
    verdict: "must",
    effort: "低",
    why: "ChatGPT 搜索靠它来读网页。挡住它，你的页面就进不了 ChatGPT 的搜索回答。",
    sources: ["openai-bots"],
    step: 1,
    howto: "robots-txt",
    sample: true,
  },
  {
    id: "add-stats-and-citations",
    title: "正文里加具体数字和出处",
    layer: "cite",
    verdict: "try",
    effort: "中",
    why: "GEO 论文的实验里，加了统计数字、引语和引用的内容，在 AI 回答里出现得更多。实验用的是论文自己搭的环境，真实平台上的效果还要自己量。",
    sources: ["geo-paper"],
    step: 4,
    sample: true,
  },
];
