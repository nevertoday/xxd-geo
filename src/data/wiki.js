// Wiki 条目：每条同样的结构 —— 一句话（one）、比喻（like）、放到你的产品上（here，最多两段）、可选的清单表（list）、常见误区（myths）、相关（see）。
// 文字里可以用 **粗体**、==荧光笔==（每条最多一处）、`代码`、[外链](https://…) 和 [站内链接](/路径/)（lib/md.js 里简单转换）。
// 写法照 MAINTAINING.md 的「说人话」：短句、一句一个意思、新词当场解释。
// step: 对应的完整教程步骤；howto: 对应的 How-to（要 ready 才会出链接）。
// sample: true 是先放着的示例，换成正式内容后删掉这个字段。

export const WIKI_GROUPS = ["基本概念", "爬虫和索引"];

export const WIKI = [
  {
    slug: "geo", title: "GEO 是什么", group: "基本概念",
    one: "GEO 是让你的产品出现在 AI 的回答里，并且被它引用。",
    like: "以前是让搜索结果第一页有你；现在是让 AI 回答问题时，嘴里说出你的名字。",
    here: [
      "有人问 AI「有什么好用的 xx 工具」，AI 会去搜一圈、读几个网页，再写一段回答。GEO 做的事，就是让它搜得到你、读得懂你、愿意提你。",
    ],
    myths: [
      "「GEO 和 SEO 是两套东西」：大部分基本功是同一套。AI 联网回答时，常常就是在用搜索引擎的结果。",
    ],
    see: ["ai-crawler"],
    step: 0,
    sample: true,
  },
  {
    slug: "ai-crawler", title: "AI 爬虫", group: "爬虫和索引",
    one: "AI 爬虫是 AI 公司派来读网页的程序。",
    like: "像图书馆派来的采购员：有的买书回去收藏（训练），有的是读者要哪本当场去借（实时回答）。",
    here: [
      "同一家公司常有好几个爬虫，用途不一样。比如 OpenAI 的 GPTBot 拿去训练，OAI-SearchBot 给 ChatGPT 搜索用。在 `robots.txt` 里可以分开放行或挡住。",
    ],
    myths: [
      "「挡住训练爬虫，AI 就搜不到我」：训练和搜索常常是两个爬虫，挡一个不影响另一个。",
    ],
    see: ["geo"],
    step: 1,
    howto: "robots-txt",
    sample: true,
  },
];
