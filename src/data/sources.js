import { GENERATED, ALIAS } from "./sources.gen.js";
// 出处：全站每条结论的来源。正文里用 <Src ids="id1 id2" /> 引用，tactics / platforms / tools 的 sources 里写 id。
// /sources/ 按证据等级列出全部出处，每条的锚点是 #<id>。check-content 会查：引用的 id 都存在，等级、类型、日期、链接都合规。

/** @typedef {"A"|"B"|"C"|"D"|"X"} Grade */
/** @typedef {"官方文档"|"论文"|"数据研究"|"报道"|"案例"|"观点"} SourceKind */
/**
 * @typedef {Object} Source
 * @property {string} title
 * @property {string} publisher
 * @property {string} date      "YYYY"、"YYYY-MM" 或 "YYYY-MM-DD"；页面没写日期时为空
 * @property {string} url       https 开头；不是网页（比如本站实测）时为空，用 where 说明在哪
 * @property {string} [where]
 * @property {"原文"|"摘要"} [seen]   调研时读的是原文还是只看到搜索摘要
 * @property {boolean} [conflict]     发布方和结论有利益关系（比如卖 GEO 工具的公司）
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
export const KINDS = ["官方文档", "论文", "数据研究", "报道", "案例", "观点"];

/** @type {Record<string, Source>} 手写的出处，和 sources.gen.js 里导入的合在一起 */
const MANUAL = {};

/** @type {Record<string, Source>} */
export const SOURCES = { ...GENERATED, ...MANUAL };
/** 正文和数据里写的出处 id 换成真正的 id：不分大小写，重复的编号指向第一次出现的那条 */
export const canon = (id) => { const k = id.toLowerCase(); return ALIAS[k] ?? k; };
export const sourceOf = (id) => SOURCES[canon(id)];

/** 一组出处里最强的等级（A 最强，X 最弱）。没有出处返回 null。 */
export const bestGrade = (ids = []) => {
  const ranks = ids.map((id) => GRADE_ORDER.indexOf(sourceOf(id)?.grade)).filter((i) => i >= 0);
  return ranks.length ? GRADE_ORDER[Math.min(...ranks)] : null;
};
