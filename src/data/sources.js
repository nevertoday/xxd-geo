// 出处：全站每条结论的来源。正文里用 <Src ids="id1 id2" /> 引用，tactics / platforms / tools 的 sources 里写 id。
// /sources/ 按证据等级列出全部出处，每条的锚点是 #<id>。check-content 会查：引用的 id 都存在，等级、类型、日期、链接都合规。
// sample: true 是先放着让页面能显示的示例，换成调研出的真实出处后删掉这个字段。

/** @typedef {"A"|"B"|"C"|"D"|"X"} Grade */
/** @typedef {"官方文档"|"论文"|"数据研究"|"案例"|"观点"} SourceKind */
/**
 * @typedef {Object} Source
 * @property {string} title
 * @property {string} publisher
 * @property {string} date      "YYYY-MM" 或 "YYYY-MM-DD"
 * @property {string} url       https 开头
 * @property {SourceKind} kind
 * @property {Grade} grade
 * @property {string} note      一句话：这份资料说了什么、本站用它证明什么
 * @property {boolean} [sample]
 */

/** 证据等级，从强到弱排。X 是已经过时或被推翻，排在最后。 */
export const GRADES = {
  A: { label: "官方和论文", desc: "官方文档、平台声明、同行评审论文" },
  B: { label: "大样本数据", desc: "大样本数据研究或可复现实验" },
  C: { label: "实测案例", desc: "从业者案例或小规模实测" },
  D: { label: "观点", desc: "观点、推测、营销" },
  X: { label: "已过时", desc: "已过时或被推翻" },
};
export const GRADE_ORDER = Object.keys(GRADES);

/** @type {SourceKind[]} */
export const KINDS = ["官方文档", "论文", "数据研究", "案例", "观点"];

/** @type {Record<string, Source>} */
export const SOURCES = {
  "openai-bots": {
    title: "Overview of OpenAI Crawlers",
    publisher: "OpenAI",
    date: "2025-06",
    url: "https://platform.openai.com/docs/bots",
    kind: "官方文档",
    grade: "A",
    note: "OpenAI 的三个爬虫各管什么：GPTBot 拿去训练，OAI-SearchBot 给 ChatGPT 搜索用，ChatGPT-User 是用户提问时现场去读。",
    sample: true,
  },
  "geo-paper": {
    title: "GEO: Generative Engine Optimization",
    publisher: "Aggarwal 等（Princeton、IIT Delhi），KDD 2024",
    date: "2023-11",
    url: "https://arxiv.org/abs/2311.09735",
    kind: "论文",
    grade: "A",
    note: "提出 GEO 这个说法；实验里给内容加引用、引语和统计数字，在生成式回答里的可见度明显提高。",
    sample: true,
  },
  "vercel-ai-crawlers": {
    title: "The rise of the AI crawler",
    publisher: "Vercel",
    date: "2024-12",
    url: "https://vercel.com/blog/the-rise-of-the-ai-crawler",
    kind: "数据研究",
    grade: "B",
    note: "按 Vercel 网络上的抓取数据，ChatGPT 和 Claude 的爬虫不执行 JavaScript，只看服务器直接给的 HTML。",
    sample: true,
  },
  "google-ai-features": {
    title: "AI features and your website",
    publisher: "Google Search Central",
    date: "2025-05",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    kind: "官方文档",
    grade: "A",
    note: "AI Overviews 和 AI Mode 没有额外的优化要求，照常做好 SEO；带来的点击算在 Search Console 的网页搜索报告里。",
    sample: true,
  },
};

/** 一组出处里最强的等级（A 最强，X 最弱）。没有出处返回 null。 */
export const bestGrade = (ids = []) => {
  const ranks = ids.map((id) => GRADE_ORDER.indexOf(SOURCES[id]?.grade)).filter((i) => i >= 0);
  return ranks.length ? GRADE_ORDER[Math.min(...ranks)] : null;
};
