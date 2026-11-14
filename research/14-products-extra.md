# 补充稿 14：产品实操页用到的实测记录

写「按产品类型」六篇 How-to 时补的实测。命令都是 curl，在 2026-11-14 跑过，原始输出没有提交，命令写在 `src/pages/howto/case-pstack.mdx` 里，读者可以自己重跑。

- S1：pstack.xiaoxiaodong.ai 第一次实测，结果在 `research/case-pstack/findings.md`（2026-11-14T13:35:37Z）。
- S2：同一组检查的复测（2026-11-14T14:22:21Z）。结果和 S1 一致：robots.txt 没有任何指令；sitemap 和 llms.txt 都是 404；GPTBot、ClaudeBot、PerplexityBot、Bytespider 返回 403，正文是纯文本「Your request was blocked.」；OAI-SearchBot、ChatGPT-User、Claude-SearchBot、Claude-User、Perplexity-User、Googlebot、bingbot、Baiduspider 返回 200；首页和 /guide/0-what/ 都没有 JSON-LD、没有 canonical；文章页没有 `<time>` 标签；hreflang 只列了另一种语言，没有列自己，也没有 x-default。和 S1 不同的一处：首页有 10 个 h2（4 个是侧边栏分组标题，6 个是正文小节），S1 记的「只有 1 个 h2」是数错了，S1 存下的 home.html 里也是 10 个。
- S3：Chrome Web Store 的 robots.txt（2026-11-14T14:24:24Z 读取）。对所有爬虫禁止 `/detail/*/reviews`、`/privacy`、`/support`、`/related`、`/report`、`/preview`，以及带 utm、`q=` 等参数的详情页和 `/search`。
- S4：GitHub 的 robots.txt（2026-11-14T14:24:24Z 读取）。GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、Claude-SearchBot、Claude-User、PerplexityBot、Perplexity-User 共用一组：`Crawl-delay: 1`，禁止 `/*/tree/`、`/*/blame/`、`/*/raw/`、`/*/*/commits/` 等路径，没有禁止 `/*/blob/`。Bytespider 整站禁止。也就是说仓库首页和单个文件页 AI 爬虫能读，子目录的列表页不能读。

## 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | pstack.xiaoxiaodong.ai 第一次实测（curl 换 User-Agent） | 本手册 | 2026-11-14 | 无（research/case-pstack/findings.md） | 小规模实测 | C | robots.txt 没有指令，sitemap 404，GPTBot、ClaudeBot、PerplexityBot 被 403，没有 JSON-LD 和 canonical |
| S2 | pstack.xiaoxiaodong.ai 复测（curl 换 User-Agent） | 本手册 | 2026-11-14 | https://pstack.xiaoxiaodong.ai/ | 小规模实测 | C | 复测结果和第一次一致；403 正文是「Your request was blocked.」；文章页没有日期标签；hreflang 不含自己 |
| S3 | Chrome Web Store robots.txt | Google（本手册 curl 读取） | 2026-11-14 | https://chromewebstore.google.com/robots.txt | 平台官方文件 | A | 详情页的评论、隐私、支持、相关推荐子页和搜索页禁止所有爬虫抓取 |
| S4 | GitHub robots.txt | GitHub（本手册 curl 读取） | 2026-11-14 | https://github.com/robots.txt | 平台官方文件 | A | 主流 AI 爬虫可抓、Crawl-delay 1；禁 /tree/、/blame/、/raw/、/commits/；整站禁 Bytespider |
