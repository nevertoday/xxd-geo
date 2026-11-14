# 维护说明

GEO 实战手册：写给独立开发者的开源 GEO 知识库。GEO 是让产品在 ChatGPT、Perplexity、Google AI Overviews、豆包、DeepSeek 的回答里被提到、被引用。说人话，每条建议都标出处和证据等级。

- 站点骨架沿用 xxd-pstack 教程站（`../xxd-pstack`）：同样的外壳、组件、搜索和写作规矩。
- 界面用 xxd-ui-kit（`public/xxd/` 里自带一份，不走 CDN）。
- 现在只有中文。数据里保留了 `en: {}` 的写法，以后加英文见文末。
- 调研稿在 `research/`，写法约定在 `docs/research-contract.md`。网站上的每条结论都要能追到调研稿里的出处。

```bash
npm install
npm run dev        # http://localhost:4430
npm run build      # 输出到 dist/，最后跑内容检查
```

## 怎么改

- **站点结构**只在 `src/data/nav.js` 改：网站名字和地址（`NAME`、`TAGLINE`、`SITE`、`REPO`）、新手入门（`LESSONS`）、完整教程（`STEPS`）、How-to（`HOWTO`）、查资料栏目（`SECTIONS`）、术语（`GLOSSARY`）。
- **`ready`**：`false` 的页面在导航里显示「编写中」，不给链接。写好一页就改成 `true`；检查脚本会确认它有对应的 MDX 文件。
- **新手入门**是 `src/pages/start/<slug>.mdx`（`layout: ../../layouts/Lesson.astro`，`lesson: n`）。
- **完整教程**是 `src/pages/guide/<n>-<slug>.mdx`（`layout: ../../layouts/Guide.astro`，`step: n`）。
- **How-to** 是 `src/pages/howto/<slug>.mdx`（`layout: ../../layouts/HowTo.astro`，`slug` 和 `HOWTO` 里一致，`step` 是相关的完整教程步骤）。
- 每页 frontmatter 都写 `tldr`（标题下的「一句话」）和 `description`（搜索引擎和分享卡片用）。
- **证据表、平台、工具、提示词库、出处**只改数据，页面自动生成。格式见下面「数据格式」。
- **Wiki** 和 **常见问题**只改数据：`src/data/wiki.js`、`src/data/faq.js`。
- **搜索**（⌘K）自动收录：每课、每步、每篇 How-to、每个栏目、每个平台、Wiki、常见问题（在每页里）；正文小节、每个做法、工具、提示词、出处（构建时写进 `dist/search-sections.json`，打开搜索时再加载）。
- **UI Kit 升级**：在 xxd-ui-kit 里 `pnpm xxd sync <本目录>`，不要手改 `public/xxd/`。

## 正文组件

在 MDX 里 import 后使用：

- **`Src`**：出处小标。`<Src ids="02-S1 03-S5" />`（调研稿编号加出处表里的 S 编号，大小写都行；重复的链接用哪个编号都能解析），每个 id 一个小方块，写着证据等级，点进 `/sources/#<id>`，悬停看标题。id 不在 `sources.js` 里，构建直接报错。
- **`Verdict`**：结论徽章。`<Verdict v="must" />`，四种：`must` 必做、`try` 值得试、`skip` 不必做、`avoid` 别做。
- **`Callout`**：提示框，`type` 是 `ok`（你应该看到）、`warn`、`no`、`tip`。
- **`Term`**：术语，`k` 对应 `GLOSSARY`，悬停一句话解释，点进 Wiki。
- **`Copy`**：带复制按钮的提示词、配置或命令。**`Cmd`**：正文里一点就复制的短命令。
- **`Checkpoint`**：可打勾的检查点。**`Q`**：页尾「不对怎么办」里的一条。**`Tabs`**：按平台或产品类型切换同一处内容。
- **`Reply`**：AI 回复的示意，标题写明「示意」。**`Shot`**：截图，图放 `public/img/`。**`Fig`**：图示，数据在 `src/data/figs.js`。

MDX 正文里不能出现裸的 `<`、`{`、`}`：占位符写在代码里，比如 `` `<你的域名>` ``。

## 数据格式

每个文件开头有 JSDoc 类型。先放着的示例条目带 `sample: true`，换成调研结论后删掉这个字段；检查脚本会提醒还剩几条。

- **`sources.js`**：`SOURCES = { "<id>": { title, publisher, date, url, kind, grade, note } }`。
  - `id` 用小写字母、数字、连字符，比如 `openai-bots`。
  - `date` 写 `YYYY-MM` 或 `YYYY-MM-DD`；`url` 以 `https://` 开头。
  - `kind` 是 `官方文档`、`论文`、`数据研究`、`案例`、`观点` 之一。
  - `note` 一句话：这份资料说了什么。
- **`tactics.js`**（证据表）：`{ id, title, layer, verdict, effort, why, sources, step?, howto? }`。
  - `layer` 是 `crawl` 爬得到、`index` 搜得到、`read` 读得懂、`cite` 愿意引用、`mention` 有人提到、`measure` 量得出。
  - `verdict` 是 `must`、`try`、`skip`、`avoid`；`effort` 是 `低`、`中`、`高`。
  - 证据等级不写在这里：页面取 `sources` 里最强的那条。
- **`platforms.js`**：`{ slug, name, vendor, region, retrieval, crawlers, js, citations, referrer, docs, tips, sources }`。
  - `region` 是 `global` 或 `cn`；`crawlers` 每项 `{ ua, purpose, note }`，`purpose` 是 `training`、`search`、`user`。
  - `js` 是爬虫会不会执行 JavaScript：`true`、`false`，还没查清写 `null`。
- **`tools.js`**：`{ name, url, kind, price, measures, fit, sources }`，`kind` 是 `监测`、`分析`、`体检`、`生成`、`开源`。
- **`prompts.js`**：`{ id, title, use, prompt, step?, howto? }`。`prompt` 是原样复制的全文，占位符写成 `<产品名>`。

`step`、`howto` 会变成「相关教程」链接，页面还没 `ready` 时不出链接。

## 证据等级

| 等级 | 什么样的资料 |
| --- | --- |
| A | 官方文档、平台声明、同行评审论文 |
| B | 大样本数据研究或可复现实验 |
| C | 从业者案例或小规模实测 |
| D | 观点、推测、营销 |
| X | 已过时或被推翻 |

- 每条建议后面跟 `<Src>`。没有出处的说法不写，或者写明「还没查清」。
- **必做**至少要有一条 A 或 B。只有 C、D 撑着的做法，最多算「值得试」。
- 卖 GEO 工具的公司发的研究，照样能引用，`note` 里写明利益相关。
- 资料过时了，把 `grade` 改成 `X`，`note` 写为什么，别直接删：页面上还能说明「这条别再信」。

## 出处从哪来

`research/NN-*.md` 是调研稿，末尾各有一张出处表。`node scripts/import-sources.mjs` 把这些表导成 `src/data/sources.gen.js`：id 是「稿子编号-s 编号」，同一个链接只留第一次出现的那条，其他编号进 `ALIAS`。改了调研稿就重跑，不要手改生成的文件。手写的出处放 `sources.js` 的 `MANUAL`。

## 检查脚本

`npm run build` 最后一步跑 `scripts/check-content.mjs`，也可以单独跑 `node scripts/check-content.mjs`（要先有 `dist/`）。

**会让构建失败的：**

- 正文 `<Src>` 或 tactics / platforms / tools 里引用的出处 id 不存在。
- 出处的 `grade`、`kind`、`date`、`url` 不合规，或者 `title`、`publisher`、`note` 空着。
- 数据里的 `layer`、`verdict`、`effort`、`region`、`purpose`、`kind` 不在允许的值里；`step`、`howto` 指向不存在的页面；id 重复。
- 标了「必做」的做法，出处里没有 A 或 B。
- 导航里标了 `ready: true` 的页面没有 MDX 文件。
- `dist/` 里的站内链接指向没构建出来的页面。

**只提醒的：** 从没被引用的出处、还没替换的示例数据、有了 MDX 但导航还是 `ready: false` 的页面。

## 写作规矩

- 站在第一次接触 GEO 的开发者的角度：先说这一步做什么、为什么，再说怎么做，最后说怎么确认生效了。
- 说人话：短句、具体、不堆术语；第一次出现的术语用 `Term` 包起来。
- 只写有出处的结论。会变的东西（爬虫名、平台用哪家搜索、工具价格）以官方文档为准，变了就改 `data/` 里对应的那一处。
- 配置、代码、命令要能直接复制运行，写清楚改完去哪里看结果。
- 专有名词、爬虫名、配置字段保持英文原文（`OAI-SearchBot`、`robots.txt`）。

## 说人话：全站的改写规则

**每页**

- frontmatter 里写 `tldr:`，显示在标题下面的「一句话」：看完这页你能做成什么。不超过 40 个字，说结果，不说「本页介绍……」。
- 小节标题写读者的动作或问题：「先看爬虫有没有被挡」「AI 说的是旧信息」。不用名词当标题（「原理」「概述」）。
- 删掉读者用不上的：行业八卦、版本差异、少见的边缘情况。真有人需要的，收进页尾的 `Q` 折叠项。

**每段、每句**

- 一段只讲一件事；一句只讲一个意思。中文一句超过 30 个字就拆开。
- 先给例子，再讲道理：先放能照抄的配置或提示词，再用一两句说为什么。
- 正面说要做什么。不用「不是……而是……」「最好别……」这类要读者拐弯的句式。
- 一句话里最多出现一个新词。
- **卖点只说一次。**「让 AI 推荐你的产品」首页说一次、第 1 课说一次就够了。别的页面写这一页具体做什么。

**词**

新词第一次出现，当场用大白话说清楚，或者直接换成日常说法：

| 别写 | 写成 |
| --- | --- |
| 可见度、曝光度 | AI 回答里提到你的次数 |
| 语义理解 | AI 读懂这页在说什么 |
| 权威性信号 | 别的网站提到你、链接到你 |
| 赋能、抓手、闭环、落地 | 删掉，换成具体发生了什么 |
| 内容资产 | 你写的页面 |

**表格和列表**

- 表格最多 3 列、5 行，每格不超过 15 个字。放不下就改成列表或卡片。
- 列表每项先写结论（加粗几个字），后面最多一句解释。

**不能动的**

- 配置、命令、提示词、文件路径、数字保持准确。
- 强调：每页最多一处 `<mark>`（这页最要紧的一句）；`<u>` 只给照做会出错的坑。

## 新手入门（/start/）的写法

新手入门是给第一次听说 GEO 的人看的。三课，一条路走到底：

- **先做，后讲。** 每一课一开始就让人动手；道理只讲到「为什么要这样做」的一句话。
- **只给一条路。** 不列「也可以这样」。别的做法放到页尾的「不对怎么办」里，一句话带过。
- **每一步写「你应该看到」。** 用 `<Callout type="ok">`，写屏幕上真的会出现的东西。
- **每一课都有「不对怎么办」。** 按读者看到的现象写问题（「AI 说它不知道我的产品」），不按原因写。
- **说清楚哪些是可选的。** 三课之外的一切都标成「遇到了再查」。
- **示意要标明是示意。** AI 回复的样子用 `Reply` 组件，不冒充真实记录。

## 图示（`<Fig id="…" />`）

一张图讲清一个关系，放在最需要的那一节，同一页最多两张。数据和文字在 `src/data/figs.js`，画法在 `src/components/Fig.astro`（compare、term、folder、anatomy、stack、flow、ladder 等），样式在 `public/site.css` 的「图示」一节。全部是 HTML + CSS，跟着亮暗、圆角、主色走。

## 反馈入口

每页末尾一行（`Feedback.astro`）：没看懂、照做不成、和实测对不上，就到 GitHub 提（带好页面信息的 issue 模板）。首页和常见问题页末尾是「提问和讨论」卡片（`Contact.astro`）。

## 以后加英文

1. `nav.js` 的 `LANGS` 加一行 `{ code: "en", name: "English", html: "en" }`，顶栏会出现语言菜单。
2. 各条目加 `en: { title, sum }`；页面里用 `t(x, "title", lang)` 取字段，链接用 `link(path, lang)`。
3. 页面放在 `src/pages/en/` 下，slug 和中文相同；`Site.astro` 的 `UI` 加一份 `en`。

## 部署

计划地址 <https://geo.xiaoxiaodong.ai>，仓库 <https://github.com/nevertoday/xxd-geo>（都还没建）。
更新：`npm run release`（构建后 `wrangler deploy`，要先 `npx wrangler login`），配置在 `wrangler.jsonc`。域名同时写在 `nav.js` 的 `SITE` 和 `wrangler.jsonc`，改的时候两处一起改。

还没有分享大图（`og:image`）。做好后放 `public/og.png`，在 `Site.astro` 的 `<head>` 里加回 `og:image` 和 `twitter:image`。
