# 21 补充出处：爬得到、搜得到这一组页面（2026-11-14）

写「AI 是怎么找答案的」「让 AI 爬得到」「让 AI 搜得到」和四篇技术 How-to 时补查的出处。每条都在 2026-11-14 打开原文或直接请求过。

## 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | pstack.xiaoxiaodong.ai 实测记录：用 curl 换 User-Agent 请求 robots.txt、sitemap 和 /guide/0-what/ | 本站 | 2026-11-14 | 无（research/case-pstack/findings.md，原始文件在同目录） | 小规模实测 | C | GPTBot、ClaudeBot、PerplexityBot、Bytespider 返回 403，OAI-SearchBot、ChatGPT-User、Claude-SearchBot、Perplexity-User、Googlebot、bingbot 返回 200；robots.txt 只有 Cloudflare 的 content signals 注释；sitemap 404；HTML 是静态输出 |
| S2 | Bot Fight Mode | Cloudflare | 2026-11-14 访问 | https://developers.cloudflare.com/bots/get-started/bot-fight-mode/ | 官方文档（已读原文） | A | 开关在 Security Settings 页按 Bot traffic 筛选；WAF 自定义规则和 Page Rules 的 Skip、Bypass、Allow 都绕不过它 |
| S3 | Get started（AI Crawl Control） | Cloudflare | 2026-11-14 访问 | https://developers.cloudflare.com/ai-crawl-control/get-started/ | 官方文档（已读原文） | A | AI Crawl Control 有 Overview、Crawlers、Metrics 三个标签；在 Crawlers 的 Action 列改屏蔽；免费版只按 UA 识别，Metrics 只看 24 小时 |
| S4 | AI Crawler and Agent access policies（原 Block AI bots 页） | Cloudflare | 2026-11-14 访问 | https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/ | 官方文档（已读原文） | A | 路径 Security > Settings，筛 Bot traffic；Search、Agent、Training 各选 Block、Block on pages with ads、Allow；Training 另有 Disallow 加 Bot Preference Sync，兼做搜索和训练的爬虫不在边缘拦截之列 |
| S5 | IndexNow searchengines.json | IndexNow.org | 2026-11-14 访问 | https://www.indexnow.org/searchengines.json | 协议文档（已读原文） | A | 参与方是 Bing、Yandex、Seznam、Naver、Yep、Internet Archive、Amazonbot；没有 Google |
| S6 | 本站复测：robots_check.py 与 check-ai-ua.sh 在 pstack.xiaoxiaodong.ai 上的运行结果 | 本站 | 2026-11-14 | 无（脚本见 /howto/robots-txt/） | 小规模实测 | C | 用 Python-urllib 默认 UA 请求 robots.txt 返回 403，robotparser 因此把所有爬虫判成 BLOCK；改为自带 UA 下载后全部 allow；curl 换 UA 复测仍是 GPTBot、ClaudeBot、PerplexityBot、Bytespider 返回 403 |
| S7 | 本站核对：OpenAI、Perplexity、DuckDuckGo 公布的爬虫 IP 列表 JSON 格式 | 本站 | 2026-11-14 | 无（核对脚本见 /howto/crawler-logs/） | 小规模实测 | C | openai.com/searchbot.json、gptbot.json，perplexity.ai/perplexitybot.json，duckduckgo.com/duckassistbot.json 都是 prefixes[].ipv4Prefix 格式；verify_bot_ip.py 用假日志跑通 |
| S8 | 本站试跑：indexnow.mjs、lastmod.mjs、ai_bot_stats.py 用假数据运行 | 本站 | 2026-11-14 | 无（脚本见 /howto/indexnow/、/guide/2-indexed/、/howto/crawler-logs/） | 小规模实测 | C | indexnow.mjs 只提交 lastmod 在两天内的网址，跳过没有 lastmod 的条目，fetch 用假函数拦截；lastmod.mjs 按 frontmatter 生成正确的网址和 ISO 时间；页面上的代码和试跑的文件逐字一致 |
