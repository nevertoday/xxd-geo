// 工具：能帮你看 AI 提没提你、爬虫来没来、页面合不合格的工具。/tools/ 按类型分组列出，锚点是 toolId(name)。
// sample: true 是先放着的示例，换成调研结论后删掉这个字段。

/** @typedef {"监测"|"分析"|"体检"|"生成"|"开源"} ToolKind */
/**
 * @typedef {Object} Tool
 * @property {string} name
 * @property {string} url
 * @property {ToolKind} kind
 * @property {string} price     免费 / 起步价 / 按量
 * @property {string} measures  它能告诉你什么
 * @property {string} fit       适合谁、什么阶段
 * @property {string[]} sources 出处 id（sources.js）
 * @property {boolean} [sample]
 */

/** @type {Record<ToolKind, string>} 分组顺序和一句说明 */
export const TOOL_KINDS = {
  监测: "定期问 AI，记下提没提你",
  分析: "看 AI 带来的访问和爬虫",
  体检: "检查页面 AI 读不读得懂",
  生成: "帮你生成配置或内容",
  开源: "能自己部署、自己改",
};

/** 页面锚点：名字转小写，空格和符号换成连字符（中文保留） */
export const toolId = (name) => name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

/** @type {Tool[]} */
export const TOOLS = [
  {
    name: "Google Search Console",
    url: "https://search.google.com/search-console",
    kind: "分析",
    price: "免费",
    measures: "Google 搜索的展示和点击，AI Overviews 带来的也算在里面",
    fit: "每个网站都该接上",
    sources: ["google-ai-features"],
    sample: true,
  },
];
