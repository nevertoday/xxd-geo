// 提示词库：让 AI 帮你做 GEO 的现成提示词。/prompts/ 每条一节，带复制按钮，锚点是 #<id>。
// 提示词里的占位符写成 <产品名> 这样，读者复制后自己换。
// 正文页面用 PROMPT.<id>.prompt 取同一份文字，改这里，页面跟着变。

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title   这条提示词做成什么
 * @property {string} use     什么时候用、贴到哪里、拿到结果先查什么
 * @property {string} prompt  原样复制的全文
 * @property {number} [step]  相关的完整教程步骤
 * @property {string} [howto] 相关的 How-to slug
 * @property {boolean} [sample]
 */

/** @type {Prompt[]} */
export const PROMPTS = [
  {
    id: "entity",
    title: "给产品写一张实体卡",
    use: "每个产品写一次，存成 entity.md，后面所有提示词都把它贴进去。拿到结果先查：每个字段都标了来自哪份材料，没有的写着「待补」。",
    step: 8,
    prompt: `根据下面的材料，给我的产品写一张「实体卡」entity.md。以后所有让 AI 写的东西，都从这张卡里取事实。

字段：
- 产品名：中文名、英文名、常见误拼
- 一句话定义：「<产品名> 是一个 <平台> 上的 <类别>，帮 <谁> <做什么>。」
- 目标用户
- 核心功能 3 到 5 条，每条动词开头
- 价格（免费 / 多少钱 / 怎么收费）
- 支持的平台和语言
- 数据存在哪（本地 / 云端）
- 官网、商店页、GitHub、小程序名称
- 作者
- 最近更新日期
- 和 2 到 3 个同类产品的真实差别
- 已知局限

规则：
1. 只用材料里有的事实。材料里没有的字段写「待补」，不要猜。
2. 每个字段后面用括号标它来自哪份材料。
3. 不写「最好」「领先」「革命性」这类形容词。

材料：
<粘贴商店页文字、README、官网首页文字>`,
  },
  {
    id: "audit",
    title: "没有 Claude Code 时，把材料贴给 AI 做体检",
    use: "先按 How-to「让 AI 给网站做 GEO 体检」里的命令抓四份材料，再整段贴进 ChatGPT 或豆包。拿到结果先查：每个问题都引用了材料原文，没有总分。",
    howto: "ai-audit",
    prompt: `你是技术 SEO 审计员。下面是我的网站 <你的域名> 的四份材料，都是用 curl 拿到的，没有执行 JavaScript。请只根据这些材料写一份 GEO 体检，每个问题都引用材料里的原文。

逐项检查：
1. robots.txt：OAI-SearchBot、ChatGPT-User、Claude-SearchBot、Claude-User、PerplexityBot、Perplexity-User、Googlebot、bingbot 是否被允许。GPTBot、ClaudeBot 只管训练；Google-Extended 管 Gemini 训练，也管 Gemini App 的引用。训练类按我的意图判断：<允许训练 / 禁止训练>。
2. 状态码：哪些 User-Agent 拿到 403、429、503 或质询页，而普通浏览器是 200。
3. sitemap：有没有；lastmod 是不是全都一样。
4. 首页：title、h1 和第一段有没有说清产品叫什么、是什么类别、给谁用、在哪个平台、多少钱；产品名、价格、安装方式能不能在 HTML 正文里找到。
5. JSON-LD：每个字段能不能在页面可见文字里找到原句。
6. 有没有藏起来给 AI 看的文字或指令。

输出一张表：问题 | 证据（原文）| 影响（高/中/低）| 怎么改 | 改完怎么验证。
不要给总分。不要把 llms.txt 或 schema 当成提升 AI 引用的办法。材料里看不出来的，写「材料里看不出」。

【robots.txt】
<粘贴>

【各 User-Agent 的状态码】
<粘贴>

【sitemap 前 30 行】
<粘贴>

【首页 HTML】
<粘贴>`,
  },
  {
    id: "raw-html",
    title: "审一页原始 HTML 适不适合被引用",
    use: "用 curl 拿到页面原始 HTML，贴给 AI。拿到结果先查：它给出的改法是 HTML 片段，不是「加一个 AI 专用 meta 标签」。",
    step: 3,
    prompt: `下面是用 curl 抓到的页面原始 HTML，没有执行 JavaScript。ChatGPT、Claude、Perplexity 的爬虫看到的就是这个样子。
请按严重程度列出问题：
1. 用户最可能问的 3 个问题，答案在不在可见文字里？如果只出现在 script、JSON 或要 JS 才加载的部分，指出来。
2. h1 到 h3 的层级是否连续，标题是不是完整的问题或结论句。
3. 每个 h2 下第一段是否直接给出答案。
4. 参数、对比、价格有没有用 <table>。
5. 有没有可见的更新日期和作者，和 JSON-LD 里的 dateModified、author 是否一致。
6. canonical、hreflang 是否自洽。
每个问题给出改后的 HTML 片段。不要建议添加任何「AI 专用 meta 标签」。

HTML：
<粘贴 curl 输出>`,
  },
  {
    id: "js-diff",
    title: "找出要 JavaScript 才看得到的内容",
    use: "页面是 React、Vue 或用了 client:only 时用。拿到结果先查：它列的每一项，你在 curl 结果里 grep 一次确实没有。",
    step: 1,
    prompt: `下面是同一个页面的两份内容：
A. curl 拿到的原始 HTML（不执行 JS）：
<粘贴>

B. 浏览器里 document.body.innerText 的结果：
<粘贴>

请列出 B 里有、A 里没有的信息，按重要性排序：产品名、功能、价格、安装步骤、常见问题优先。
每一项告诉我怎么改成构建时就输出到 HTML。我的项目是 <Astro / Next.js / Vue>。`,
  },
  {
    id: "robots",
    title: "写一份放行 AI 搜索的 robots.txt",
    use: "新站上线前，或体检发现搜索爬虫被挡时用。拿到结果先查：每个写了专门组的爬虫，组里都重复写了私有路径的 Disallow。",
    howto: "robots-txt",
    prompt: `帮我写 <你的域名> 的 robots.txt，每段加中文注释。网站情况：<比如 Astro 静态站；/admin/ 和 /api/ 不让任何爬虫访问>。

分类：
1. 传统搜索：Googlebot、bingbot、Applebot、Baiduspider 允许。
2. AI 搜索：OAI-SearchBot、Claude-SearchBot、PerplexityBot 允许。
3. 用户触发：ChatGPT-User、Claude-User、Perplexity-User 允许。
4. 训练：GPTBot、ClaudeBot 我选择 <允许 / 禁止>。
5. Google-Extended：我 <需要 / 不需要> 出现在 Gemini App 的引用里。需要就允许。
6. 最后一行写 Sitemap。

规则：
- 写了专门组的爬虫不再读 User-agent: * 组，所以每个专门组都要重复写私有路径的 Disallow。
- 不要编造我没列出的爬虫名。你觉得还该加的，单独列在最后，写明出处链接。
- 最后给一张表：每个 User-Agent 在 / 和 /admin/ 是 allow 还是 block。`,
  },
  {
    id: "jsonld",
    title: "从实体卡生成 JSON-LD",
    use: "产品落地页用。拿到结果先查：它列出的「对应原句」在页面上真的有；没有评分、评论数、下载量。",
    howto: "json-ld",
    prompt: `根据下面的实体卡，为 <页面网址> 生成一段 schema.org JSON-LD。

规则：
1. 用 @graph，放一个 <SoftwareApplication / WebApplication / SoftwareSourceCode> 和一个 Person，用 @id 互相引用。
2. Chrome 插件：applicationCategory 填 "BrowserApplication"，operatingSystem 填 "Chrome"。免费的 offers.price 填 "0"。
3. 只用实体卡里有的事实。评分、评论数、用户数、下载量一律不写，不要估计。
4. sameAs 放商店页、GitHub、官网。
5. 输出纯 JSON，不加注释。
6. JSON 之后，逐个字段列出它在页面可见文字里对应的原句。找不到原句的字段，删掉或标 [需核实]。

实体卡：
<粘贴 entity.md>

页面可见文字：
<粘贴>`,
  },
  {
    id: "answer-first",
    title: "把一篇文章改成先给答案",
    use: "改已有的教程页或产品页。拿到结果先查：「改动清单」里没有新增任何数字、研究或案例。",
    step: 4,
    prompt: `把下面这篇文章改写成「先给答案」的结构。读者是会写代码、但不懂 SEO 的开发者。

要求：
1. 每个 H2 是一个用户真会问的问题，用他们的说法，不用行话。
2. 每个 H2 下第一段 2 到 3 句话直接回答，脱离上下文也能看懂。
3. 之后再展开步骤、代码、例外情况。
4. 保留原文所有事实。不新增任何数字、研究、引用、客户案例。觉得某处需要数据，写 [此处需要真实数据：建议找 XX 类来源]，不要自己编。
5. 不要为了 AI 把内容切成很碎的小块，也不要删掉对人有用的解释。
6. 最后附一张「改动清单」：原段落 | 新段落 | 改动原因。

原文：
<粘贴>`,
  },
  {
    id: "page-review",
    title: "给一页内容挑毛病",
    use: "写完一页、发布之前用。拿到结果先查：它要你补数据的地方写的是 [需补充]，没有替你编数字。",
    step: 4,
    prompt: `下面是我网站的一个页面。请按这些标准逐条打分（1 到 5），并指出具体句子：
1. 第一段是否直接回答标题里的问题？
2. 是否用肯定句说清产品是什么、给谁、价格、和谁类似？
3. 小标题是不是用户会问的问题句式？
4. 有没有具体数字、日期、出处、有名有姓的引语？
5. 有没有和主题无关的铺垫、口号、重复？
6. 如果是对比页：是否披露作者身份、写了测试方法、如实写了竞品的优点？
最后给出改写后的第一段（不超过 80 字），以及建议删掉的段落。
不要编造任何数据；需要数据的地方写 [需补充：…]。

页面内容：
<粘贴>`,
  },
  {
    id: "prompt-set",
    title: "生成一组用户会问 AI 的问题",
    use: "每个产品做一次，存成 prompts.csv，之后每周拿它去问。拿到结果先查：不含产品名的发现型问题至少占一半。",
    howto: "prompt-set",
    prompt: `我做了一个产品，实体卡在下面。请模拟 5 类真实用户（比如：<刚用 Chrome 的学生、做跨境电商的运营、写技术博客的程序员、只说中文的用户、只说英文的用户>），列出他们会在 ChatGPT、Perplexity、豆包、DeepSeek 里问的问题。

要求：
- 一共 40 条，中文 20 条、英文 20 条。
- 分三类并标注：A 按名字问（含产品名）、B 发现型（不含产品名，只描述需求）、C 对比型（和具体竞品比）。B 类至少占一半。
- 用口语，像真人打字，可以长，可以带预算、系统、要不要登录这类条件。
- 每条标注意图：了解 / 选型 / 解决问题 / 购买。
- 写成完整问句，不要写成关键词。
输出 CSV：id,lang,type,intent,persona,prompt

实体卡：
<粘贴>`,
  },
  {
    id: "fanout",
    title: "模拟 AI 搜索会拆出哪些子问题",
    use: "选一个最想被推荐的问题来跑。拿到结果先查：「3 次都出现」的子问题，再去 Bing Webmaster Tools 的 grounding queries 里对一下。",
    step: 8,
    prompt: `下面是一个用户问题。请模拟 AI 搜索（Google AI Mode、ChatGPT 搜索）在回答前可能拆出的子查询。

步骤：
1. 列出 10 到 15 个子查询，覆盖：定义、对比、价格、替代品、具体场景、最新年份、评测、问题排查。
2. 对每个子查询，判断我网站上哪一页能回答（给出网址和对应段落原文）；没有就写「缺口」。
3. 对每个缺口，建议改已有页面还是新写一页，并说明理由。不要为每个子查询都新建页面。

把这个过程独立重复 3 次，最后统计哪些子查询 3 次都出现了。

用户问题：<问题>
我的网站页面清单和摘要：
<粘贴 sitemap 或页面清单>`,
  },
  {
    id: "tally",
    title: "把 AI 回答整理成追踪表",
    use: "每周问完一轮，把各平台的回答原文贴进来。拿到结果先查：抽 3 条回答，自己对一下 mentioned 和 cited_urls 填得对不对。",
    howto: "diy-tracker",
    prompt: `下面是我把同一组问题问了 ChatGPT、Perplexity、豆包、DeepSeek 的回答原文。
请输出 CSV，列为：date,engine,prompt,mentioned,description_correct,cited_urls
- mentioned：回答里提到我的产品写 1，没提写 0。我的产品名是 <产品名>，别名有 <别名>。
- description_correct：提到时，描述和这句话一致写 1，不一致写 0，没提到留空：<一句话定义>
- cited_urls：回答引用的网址，用 | 分隔。
只根据回答文本判断，不要推测。不要算「排第几」。

回答原文：
<粘贴>`,
  },
  {
    id: "gap",
    title: "从 AI 回答里找竞品赢在哪",
    use: "攒够几轮追踪数据后用。拿到结果先查：每个比例都写了分母；第 4 项列出的第三方页面你都点开看过。",
    step: 8,
    prompt: `下面是 <N> 份 AI 回答原文，来自 ChatGPT、Perplexity、豆包，同一批问题，每题问了多次。请做统计，不要凭印象：

1. 每个品牌被提到的次数和比例，按平台分开。
2. 被引用的域名排行，每个域名分类：品牌官网 / 第三方评测 / 社区（Reddit、V2EX、知乎）/ 视频 / 应用商店 / 其他。
3. 竞品被提到时，AI 用了哪些理由描述它们（摘录原句）。
4. 在没提到我的产品（<产品名>）的问题里，被引用最多的第三方页面是哪些。
5. AI 对我的产品说错了哪些事实，逐条列出原句和正确信息（以我的实体卡为准）。

输出用表格，所有比例写清分母。

实体卡：
<粘贴>

回答原文：
<粘贴>`,
  },
  {
    id: "compare",
    title: "写一页诚实的对比页",
    use: "竞品的价格和功能你先自己去官网核实、截图、记下日期，再交给 AI 排版。拿到结果先查：竞品每条事实后面都有来源和日期。",
    step: 5,
    prompt: `帮我写一页「<我的产品> vs <竞品>」的对比页。原则是诚实：读者看完能判断哪个更适合自己，哪怕答案是竞品。

材料：我的实体卡，竞品官网和商店页的文字（附查证日期）。

要求：
1. 开头一段直接说结论：什么样的用户选我的，什么样的用户选竞品。
2. 对比表只放双方都能查证的事实：价格、平台、核心功能、是否开源、最后更新时间。竞品的每个事实后面标来源和查证日期。
3. 写一节「<竞品> 做得比我们好的地方」，至少 2 条，要真实。
4. 不用「最好」「第一」「唯一」这类词。
5. 材料里没有的信息写「未查到」，不要推测竞品的功能或价格。

材料：
<粘贴>`,
  },
  {
    id: "listing",
    title: "写商店简介和 README 开头",
    use: "上架 Chrome Web Store、改 GitHub README 时用。拿到结果先查：第一句是固定句式，摘要不超过 132 个字符，没有堆关键词。",
    howto: "chrome-extension",
    prompt: `帮我写 <产品名> 的 Chrome Web Store 摘要、详细描述（中英各一版）和 GitHub README 开头。目标是让人和 AI 一眼看懂这个产品是什么。

规则：
1. 第一句固定句式：「<产品名> 是一个 <平台> 上的 <类别>，帮 <谁> <做什么>。」英文：「<Name> is a <category> for <platform> that helps <who> <do what>.」
2. 商店摘要不超过 132 个字符，给 3 个候选，每个后面标字符数。
3. 详细描述第一段概述，然后列 3 到 5 个核心功能，每条一句，动词开头，写具体能力，不写形容词。
4. 写明价格、是否开源（附 GitHub 链接）、支持的语言、数据存在哪、最近更新日期、官网地址。
5. 产品名在中英文版里写法一致。
6. 不写「最好的」「革命性」「终极」，不堆关键词。
7. README 加一节「和 <竞品> 的区别」，只写能验证的事实。

实体卡：
<粘贴>`,
  },
  {
    id: "tracker",
    title: "让 AI 写一个重复采样的监测脚本",
    use: "手动问嫌累时用。拿到结果先查：脚本每条问题跑多次、只算提及频率、API key 从环境变量读。",
    howto: "diy-tracker",
    prompt: `写一个 Node.js 脚本：
- 读取 prompts.csv（列：id,lang,type,intent,persona,prompt），对每条问题调用 <OpenAI Responses API 并开启 web search / Perplexity API>，每条跑 5 次。
- 每次保存原始回答、引用网址列表、时间戳、模型名到 results.jsonl。
- 另写一个 analyze 脚本：对每条问题算「提到我的次数 / 总次数」，按平台和问题类型（A/B/C）汇总，列出被引用最多的 20 个域名。
- 品牌匹配支持别名：<别名列表>。
- 不要计算「排第几」。
- API key 从环境变量读。请求之间加间隔，避免超限。
API 参数以官方文档为准，在代码旁注明你参考的文档链接。`,
  },
  {
    id: "logs",
    title: "从访问日志里数 AI 爬虫",
    use: "有服务器日志或 Cloudflare Logpush 时用。拿到结果先查：抽 3 条标成 OpenAI 的请求，自己用官方 IP 列表核对一遍。",
    howto: "crawler-logs",
    prompt: `下面是我的服务器访问日志片段（<combined 格式 / Cloudflare Logpush JSON>）。请写一个只用标准库的 Python 脚本：
1. 按 User-Agent 分组：OpenAI（GPTBot、OAI-SearchBot、ChatGPT-User）、Anthropic（ClaudeBot、Claude-SearchBot、Claude-User）、Perplexity（PerplexityBot、Perplexity-User）、搜索引擎（Googlebot、bingbot）、其他机器人、普通访客。
2. 统计每组的请求数、状态码分布、访问最多的 20 个路径、404 最多的路径。
3. 对 OpenAI 和 Perplexity 的请求，用它们官方公布的 IP 列表 JSON 验证 IP，输出疑似伪造的数量。
4. 单独统计 /llms.txt、*.md 和带 Accept: text/markdown 的请求（日志里有 Accept 字段时）。

日志片段：
<粘贴>`,
  },
  {
    id: "fact-check",
    title: "核对 AI 写的内容里的每个数字",
    use: "任何 AI 写的内容发布前都跑一遍。拿到结果先查：标「都没有」的句子，你要么找到原始出处，要么删掉。",
    step: 8,
    prompt: `下面是 AI 帮我写的一段内容，和我的产品实体卡。请逐句检查，不要改写：
1. 列出每一个数字、日期、价格、百分比、研究、引用、用户评价、案例。逐条标：实体卡里有 / 原文给了链接 / 都没有。
2. 「都没有」的，告诉我应该去哪类地方找原始出处。
3. 找出「据统计」「研究表明」「很多用户反馈」这类没有出处的说法。
4. 找出「最好」「第一」「唯一」「领先」这类无法验证的说法。
5. 如果内容里有 JSON-LD，列出在页面可见文字里找不到的字段。
输出表格：原句 | 类型 | 状态 | 建议。

实体卡：
<粘贴>

内容：
<粘贴>`,
  },
  {
    id: "cn-post",
    title: "把英文页改成中文平台的初稿",
    use: "发掘金、公众号、知乎前用。拿到结果先查：开头第二句披露了你是作者，所有 [需亲测] 的位置你都补了自己的截图或结果。",
    step: 5,
    prompt: `把下面这篇英文页面改写成一篇适合 <掘金 / 公众号 / 知乎回答> 的中文初稿：
- 保留所有数字和出处，不新增任何数据。
- 开头一句话回答问题，第二句写明「我是这个工具的作者」。
- 知乎回答版本先给通用解法，再提到我的工具，并写出它的局限。
- 标出所有需要我本人补充截图或亲测结果的位置，写成 [需亲测]。
我会自己修改后发布，并按平台要求标注 AI 辅助。

原文：
<粘贴>`,
  },
  {
    id: "watch",
    title: "每月查一次各家爬虫文档有没有变",
    use: "交给能上网的 Claude Code 或 ChatGPT，每月跑一次，把上次的结果作为附件。拿到结果先查：每条变化都引用了官方页面原句。",
    step: 1,
    prompt: `请打开并阅读下面这些官方页面，和我上次保存的版本（附件）比较，列出有变化的地方：
- https://developers.openai.com/api/docs/bots
- https://support.claude.com/en/articles/8896518-what-is-claudebot
- https://docs.perplexity.ai/guides/bots
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://developers.google.com/search/docs/appearance/ai-features
重点看：新增或改名的 User-Agent、robots.txt 行为说明的变化、IP 列表地址的变化。
只报告原文里能看到的变化，引用原句。页面打不开的，写明打不开，不要凭记忆补。`,
  },
];

/** 按 id 取一条提示词，页面里写 PROMPT.audit.prompt */
export const PROMPT = Object.fromEntries(PROMPTS.map((x) => [x.id, x]));
