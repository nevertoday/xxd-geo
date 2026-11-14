// 提示词库：让 AI 帮你做 GEO 的现成提示词。/prompts/ 每条一节，带复制按钮，锚点是 #<id>。
// 提示词里的占位符写成 <产品名> 这样，读者复制后自己换。
// sample: true 是先放着的示例，换成调研结论后删掉这个字段。

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title   这条提示词做成什么
 * @property {string} use     什么时候用、贴到哪里
 * @property {string} prompt  原样复制的全文
 * @property {number} [step]  相关的完整教程步骤
 * @property {string} [howto] 相关的 How-to slug
 * @property {boolean} [sample]
 */

/** @type {Prompt[]} */
export const PROMPTS = [
  {
    id: "first-check",
    title: "问一圈：AI 现在怎么说你的产品",
    use: "在 ChatGPT、Perplexity、豆包里各发一遍，把回答存下来，下个月再问一次对比。",
    prompt: "我想找一个能 <你的产品解决的问题> 的工具。请推荐 5 个，按你推荐的顺序列出来，每个写一句理由，并给出你参考的网页链接。",
    step: 7,
    sample: true,
  },
];
