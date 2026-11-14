# 写作帮手对别人负责的文件提的建议（主对话汇总，给证据表 / Wiki / FAQ / 提示词的负责人看）

## 来自 w/read（guide 3、4，json-ld、astro、llms-txt）

- nav.js GLOSSARY：加 JSON-LD、结构化数据、富结果、llms.txt、canonical、lastmod、cloaking、实体卡。
- tactics.js：
  - 产品页第一段写清是什么、给谁、平台、价格、替代品：try（04-S11、06-S47）
  - 标题写成问题，第一段给答案：try（04-S11、04-S12、01-S12）
  - sitemap 写真实 lastmod：must（03-S42、03-S43）
  - JSON-LD 只标页面上看得见的值：try（03-S10、03-S32）
  - 为了富结果加 FAQPage：skip（03-S35）
  - 把 llms.txt 当成被引用的办法：skip（03-S30、06-S33）
  - 让 AI 往文章里加统计数字：avoid（01-S14、01-S2）
  - 只改日期不改内容：avoid（04-S20、03-S43）
  - 批量写自夸榜单：avoid（04-S20、06-S53、04-S18）
- prompts.js：HTML 体检、答案先行改写、诚实对比页、生成 JSON-LD、Astro 设置、llms.txt 端点（正文在 guide/3、4 和 howto/json-ld、astro、llms-txt）。
- faq.js：「要不要加 llms.txt」「FAQ schema 还有用吗」。
- howto/indexnow：astro.mdx 用了 SITE_URL、INDEXNOW_KEY 环境变量和 npm run deploy，名字保持一致。
- figs.js 想法：3-readable 放「浏览器看到的 vs curl 拿到的」对比；4-citable 放 GEO 论文 +41% → C-SEO Bench → LIVE-GEO 的阶梯。

## 来自 w/crawl（guide 0、1、2，robots-txt、cloudflare-bots、crawler-logs、indexnow，platforms.js 海外部分）

- tactics.js：
  - 放行搜索类和用户触发类 AI 爬虫：must（02-S1、02-S25、02-S33）
  - 别挡 Googlebot（Claude 经 Brave、Apple 都跟着它）：must（02-S32、02-S38）
  - 检查 Cloudflare 的 AI 爬虫策略和 Bot Fight Mode：must（21-S2、21-S4）
  - sitemap 写真实 lastmod：must（03-S42、03-S43）
  - 用 IndexNow：try
  - 验证 Bing Webmaster Tools，打开 AI Performance：must（02-S21）
  - Google-Extended 单独决定：must（02-S14、02-S15）
- wiki.js / GLOSSARY：query fan-out、grounding、Google-Extended、`__usage_ai-training`、IndexNow、lastmod、三类爬虫（训练、搜索、用户触发）。
- case-pstack：可引 21-S1、21-S6；修复清单加 public/robots.txt、sitemap、在 AI Crawl Control 确认 PerplexityBot 的 Action。
- sources.js：删掉 MANUAL 里的示例（openai-bots、geo-paper、vercel-ai-crawlers），已有调研稿编号替代。
- figs.js 想法：两条路（模型记忆 vs 实时检索）；第 0 步末尾「爬得到 → 量得出」阶梯。
- 注意：Python urllib.robotparser 下载 robots.txt 用的 UA 会被 Cloudflare 挡，结果全是 BLOCK；macOS 自带 bash 3.2 不支持 declare -A。写脚本的页面要避开这两个坑。

## 来自 w/products（6 篇产品手册和 pstack 案例）

- tactics.js：
  - 对比页和替代品页：try（04-S6，B）
  - 商店摘要 132 字符写清实体：must（03-S52，A）
  - GitHub 文档链到 blob 文件页（/tree/ 被 robots 禁）：try（14-S4，A）
  - 注册问卷问「从哪听说的」，把 AI 列为选项：try（04-S31，C）
- wiki.js / GLOSSARY：canonical、hreflang、cloaking、grounding query、发现型问题（Discovery Gap：点名问认识，泛问不推荐）。
- howto/robots-txt：提醒挡 Google-Extended 会让 Gemini App 不再引用你（02-S14）。
- howto/astro：sitemap 过滤 /404；`grep -c` 遇到单行 sitemap 只数到 1，要用 `grep -o | wc -l`。
- figs.js 想法：案例页「体检 → 诊断 → 修复 → 2 周和 6 周复测」流程图。

## 来自 w/withai（guide 8，ai-audit、prompts，prompts.js，skills/geo-audit）

- tactics.js：
  - AI 改写时禁止新增数字：must（06-S48、06-S3，B）
  - 页面里藏给 AI 的指令：avoid（06-S4、06-S40，A）
  - 第三方 GEO 分数：skip（06-S47、06-S49，B）
- wiki.js / GLOSSARY：实体卡、query fan-out、grounding query、scaled content abuse。
- tools.js：geo-audit 列在「体检」。
- ai-traffic-analytics：02 说 2026-10 起 ChatGPT 大多不带 utm；06 说仍带 utm_source=chatgpt.com。两种说法都写，给读者自查办法。
- 仓库 nevertoday/xxd-geo 还没建，README 和 ai-audit 页里的 clone / raw 链接发布后才能用。

## 来自 w/start（新手三课、首页、README）

- tactics.js：留一份基线，4 周后复测，比提及率不比排名：try（06-S38）；别买保证 AI 推荐前三的服务：avoid（06-S2、06-S57、06-S58）。
- wiki.js / GLOSSARY：基线、发现型问题、sitemap、robots.txt、Bing Webmaster Tools。
- faq.js：「AI 带来多少流量？」（01-S51、01-S55、02-S4）；「有人保证 AI 推荐前三，能买吗？」。
- howto/prompt-set：沿用第 2 课的 Z1–Z4、E1–E4 编号和 geo-baseline.csv 表头（日期,AI,问题,第几遍,提到我了吗,引用的网址,说错了什么）。
- guide/7-measure：第 3 课让读者 4 周后去那里复测，要从第 2 课的基线文件接着讲。

## 来自 w/china 和 w/measure（主对话合并时记下，还没处理的）

- prompts.js：prompt-set 提示词改用 Z/E 编号和四类（name、category、problem、compare），保留第 2 课的 8 个问题；tracker 提示词指向 research/tracker/geo-track.mjs，不让 AI 重写脚本。
- tactics.js：只看提及频率不看排名 must（05-S1、05-S3）；name 类问题不计入提及率 must（01-S16、05-S9）；GA4 自定义 AI 渠道 try（05-S15、05-S17）；丢了引用等 2–3 周再动 try（05-S9）；对照组和双重差分 try（05-S3、05-S7）；用旧 Sonar API 追踪 Perplexity 已过时（05-S39）。国内：内容别放 web-view must（07-S31）；查 Cloudflare 托管 robots.txt 是否挡了 Bytespider must（07-S27、07-S40）；注册头条、搜狗、神马站长平台 try；submitpages try；小程序 SKILL try；sitemap.json skip（07-S33）；往 AI 常引网站投软文、假评测 avoid（07-S43、07-S51）。
- GLOSSARY / wiki：提及率、引用率、噪声地板、双重差分、A/A 测试、AI Assistant 渠道、豆包搜索权威等级、IcpHostOnly、mpcrawler、web-view、小程序 SKILL、站长平台、AI 数据投毒。
- faq.js：「AI 来访 10 月掉了一半」「工具说我可见度 67 分」「不备案能不能被中文 AI 引用」「挡 Bytespider 会不会影响豆包」。
